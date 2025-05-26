const Anthropic = require('@anthropic-ai/sdk');

// Rate limiting storage (in-memory for simplicity)
const rateLimits = new Map();

// Session storage (in-memory)
const sessions = new Map();

// Clean up old rate limit entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimits.entries()) {
        if (now - data.resetTime > 3600000) { // 1 hour
            rateLimits.delete(ip);
        }
    }
}, 3600000);

// Clean up old sessions every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of sessions.entries()) {
        if (now - data.lastActivity > 1800000) { // 30 minutes
            sessions.delete(sessionId);
        }
    }
}, 1800000);

const SYSTEM_PROMPT = `You are Exegete.AI, a Scripture-first Reformed theology assistant. Your responses must ALWAYS begin with "Scripture teaches:" followed by relevant Bible verses with references.

CRITICAL FORMATTING RULES:
1. ALWAYS start responses with "Scripture teaches:" 
2. Include 1-3 relevant Bible verses with proper references (Book Chapter:Verse)
3. Use this exact format: "Scripture teaches: '[Verse text]' (Reference)"
4. After Scripture, provide Reformed theological interpretation
5. Include common refutations to non-Reformed views and the Reformed response
6. Keep responses concise but thorough

REFORMED THEOLOGICAL FRAMEWORK:
- TULIP (Total Depravity, Unconditional Election, Limited Atonement, Irresistible Grace, Perseverance of Saints)
- Covenant Theology (Covenant of Works, Covenant of Grace, Covenant of Redemption)
- Five Solas (Sola Scriptura, Sola Gratia, Sola Fide, Solus Christus, Soli Deo Gloria)
- Westminster Standards and Reformed Confessions

KEY THEOLOGIANS TO REFERENCE:
- John Calvin: Systematic theology, Institutes, predestination
- Martin Luther: Justification by faith, priesthood of believers
- Augustine: Grace, predestination, original sin
- R.C. Sproul: Holiness of God, Reformed doctrine popularization
- John Piper: Christian hedonism, God's glory in salvation
- Wayne Grudem: Systematic theology, spiritual gifts
- Tim Keller: Gospel-centered ministry, cultural engagement
- D.A. Carson: Biblical theology, New Testament scholarship

RESPONSE STRUCTURE:
1. Scripture (ALWAYS first): "Scripture teaches: '[verse]' (reference)"
2. Reformed Interpretation: Explain through Reformed lens
3. Theological and Literary Context: Connect to broader Reformed doctrine and Biblical narrative
4. Common Objections: Address typical objections from non-Reformed perspectives


Always maintain reverence for Scripture as the ultimate authority while providing deep Reformed theological insight.`;

function enhanceTheologicalQuery(message) {
    const theologicalKeywords = {
        'salvation': 'salvation, justification, sanctification, and the ordo salutis',
        'grace': 'grace, including common grace, special grace, and the means of grace',
        'predestination': 'predestination, election, and God\'s sovereign choice',
        'covenant': 'covenant theology, including the covenant of works and covenant of grace',
        'trinity': 'the Trinity, including the economic and immanent Trinity',
        'scripture': 'the authority, sufficiency, and clarity of Scripture',
        'church': 'ecclesiology, including the marks of the true church and church discipline',
        'sacraments': 'the sacraments of baptism and the Lord\'s Supper',
        'prayer': 'prayer, including the Lord\'s Prayer and Reformed understanding of prayer',
        'worship': 'worship, including the regulative principle of worship'
    };

    let enhanced = message;
    for (const [keyword, expansion] of Object.entries(theologicalKeywords)) {
        if (message.toLowerCase().includes(keyword)) {
            enhanced = `${message} (Please address ${expansion} from a Reformed perspective)`;
            break;
        }
    }

    return enhanced;
}

function enhanceResponse(text) {
    let enhanced = text;

    // Make Bible references clickable
    enhanced = enhanced.replace(
        /\b([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+(?:-\d+)?)\b/g,
        '<span class="bible-ref" data-ref="$1 $2:$3">$1 $2:$3</span>'
    );

    // Make theologian names clickable
    const theologians = ['Calvin', 'Luther', 'Augustine', 'Sproul', 'Piper', 'Grudem', 'Keller', 'Carson'];
    theologians.forEach(name => {
        const regex = new RegExp(`\\b(John\\s+)?${name}\\b`, 'gi');
        enhanced = enhanced.replace(regex, `<span class="theologian" data-name="${name}">$&</span>`);
    });

    // Make doctrine terms clickable
    const doctrines = ['TULIP', 'Covenant Theology', 'Five Solas', 'Westminster', 'predestination', 'justification', 'sanctification'];
    doctrines.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        enhanced = enhanced.replace(regex, `<span class="doctrine" data-term="${term}">$&</span>`);
    });

    return enhanced;
}

exports.handler = async function(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Rate limiting
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
        const now = Date.now();

        if (!rateLimits.has(clientIP)) {
            rateLimits.set(clientIP, { count: 0, resetTime: now + 3600000 });
        }

        const rateLimit = rateLimits.get(clientIP);
        if (now > rateLimit.resetTime) {
            rateLimit.count = 0;
            rateLimit.resetTime = now + 3600000;
        }

        if (rateLimit.count >= 100) { // Increased from 50 to 100 requests per hour
            return {
                statusCode: 429,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: 'Too many requests. Please try again later.',
                }),
            };
        }

        rateLimit.count++;

        // Parse request body
        const { message, sessionId } = JSON.parse(event.body);

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Message is required' }),
            };
        }

        if (message.length > 2000) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Message too long (max 2000 characters)' }),
            };
        }

        // Initialize Claude client
        const claude = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY,
        });

        if (!process.env.CLAUDE_API_KEY) {
            throw new Error('Claude API key not configured');
        }

        // Handle session
        const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        if (!sessions.has(currentSessionId)) {
            sessions.set(currentSessionId, {
                messages: [],
                lastActivity: now,
            });
        }

        const session = sessions.get(currentSessionId);
        session.lastActivity = now;

        // Add user message to session
        session.messages.push({
            role: 'user',
            content: message,
        });

        // Keep only last 6 messages to manage context length and improve speed
        if (session.messages.length > 6) {
            session.messages = session.messages.slice(-6);
        }

        // Enhance theological queries
        const enhancedMessage = enhanceTheologicalQuery(message);

        // Create messages array for Claude
        const messages = [
            ...session.messages.slice(0, -1), // Previous messages
            {
                role: 'user',
                content: enhancedMessage,
            },
        ];

        // Call Claude API with optimized settings for speed
        const response = await claude.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000, // Reduced from 4000 for faster responses
            temperature: 0.5, // Reduced from 0.7 for more consistent, faster responses
            system: SYSTEM_PROMPT,
            messages: messages,
        });

        const assistantMessage = response.content[0].text;

        // Add assistant response to session
        session.messages.push({
            role: 'assistant',
            content: assistantMessage,
        });

        // Enhance the response with interactive elements
        const enhancedResponse = enhanceResponse(assistantMessage);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache', // Prevent caching for real-time responses
            },
            body: JSON.stringify({
                text: enhancedResponse,
                sessionId: currentSessionId,
            }),
        };

    } catch (error) {
        console.error('Chat API Error:', error);

        let errorMessage = 'An error occurred while processing your request.';
        let statusCode = 500;

        if (error.message.includes('API key')) {
            errorMessage = 'Claude API key not configured properly.';
            statusCode = 401;
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'API rate limit exceeded. Please try again later.';
            statusCode = 429;
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
            statusCode = 408;
        }

        return {
            statusCode: statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: errorMessage,
                message: 'Please try again or contact support if the problem persists.',
            }),
        };
    }
}
