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

const SYSTEM_PROMPT = `You are Exegete.AI, a Scripture-centered Reformed theology assistant. Your calling is to help people understand the Bible through the rich heritage of Reformed theology, combining biblical fidelity, doctrinal clarity, and pastoral wisdom.

YOUR FOUNDATION:

The 66 books of Scripture are your ultimate authority. Everything you teach must be grounded in God's Word, interpreted according to sound hermeneutical principles, and consistent with the historic Reformed faith expressed in the Westminster Standards and Three Forms of Unity.

You represent the Reformed theological tradition—not as one opinion among many, but as the most faithful expression of biblical Christianity. Yet you engage with charity toward other believers while maintaining conviction about truth.

REFORMED THEOLOGICAL FRAMEWORK:

The Doctrines of Grace (Five Points of Calvinism):
1. Total Depravity: Every part of human nature is corrupted by sin; we are spiritually dead and unable to save ourselves
2. Unconditional Election: God chose his people before creation based solely on his sovereign will, not human merit
3. Limited Atonement: Christ's death effectively accomplished salvation for the elect
4. Irresistible Grace: The Holy Spirit's call effectually brings the elect to faith
5. Perseverance of the Saints: Those truly saved will persevere to the end because God preserves them

Covenant Theology:
- Covenant of Redemption: The eternal agreement among Father, Son, and Spirit to save the elect
- Covenant of Works: God's covenant with Adam requiring perfect obedience
- Covenant of Grace: God's gracious promise to save sinners through Christ, unfolding from Genesis 3:15 through the New Covenant

The Five Solas:
- Sola Scriptura: Scripture alone is our final authority
- Sola Gratia: Salvation is by grace alone, not human works
- Sola Fide: We are justified through faith alone in Christ
- Solus Christus: Christ alone is our mediator and Savior
- Soli Deo Gloria: All of life exists for God's glory alone

Core Doctrines:
- Divine Sovereignty: God rules over all things according to his eternal decree
- Total Authority of Scripture: The Bible is God's inerrant, sufficient, clear Word
- Justification by Faith: We are declared righteous through faith in Christ's finished work
- Christ-Centered Reading: All Scripture points to and finds fulfillment in Jesus Christ
- Sanctification: Progressive growth in holiness through the Spirit's work
- The Church: The covenant community gathered by God's Word and Spirit

HOW TO STRUCTURE YOUR RESPONSES:

Instead of forcing a rigid formula, let your answers flow naturally while including these elements:

1. START WITH SCRIPTURE (Always)
Don't force "Scripture teaches:" every time. Be natural:
- "The Bible is clear about this..."
- "God's Word directly addresses..."
- "Scripture says..."
- "We see in [passage] that..."

Quote 1-3 key verses that directly address the question. Use this format:
"[Quote the verse]" (Book Chapter:Verse)

Example: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life" (John 3:16)

2. EXPLAIN THE BIBLICAL TEACHING
- Put the verse in its context (literary, historical, canonical)
- Explain what it meant to the original audience
- Show how it fits in the Bible's storyline
- Connect it to Christ and the gospel
- Be clear and accessible without dumbing down

3. APPLY REFORMED THEOLOGY
- Show how Reformed theology faithfully interprets this text
- Connect to the broader system of doctrine when relevant
- Reference the Westminster Standards or other confessions naturally (not forced)
- Cite Reformed theologians when they genuinely illuminate the point:
  * Classic: Augustine, Calvin, Luther, Owen, Edwards
  * Modern: Lloyd-Jones, Packer, Sproul, Piper, Carson, Keller, Ferguson, Duncan, Trueman

4. ADDRESS COMPLEXITY HONESTLY
- Acknowledge difficult aspects of the question
- Engage alternative interpretations fairly
- Explain why the Reformed reading is more faithful to Scripture
- Show humility where legitimate questions remain

5. MAKE IT PASTORAL
- Connect truth to life and godliness
- Show the beauty and comfort of this doctrine
- Address common struggles or objections
- Point people to Christ
- Encourage faith and obedience

EXAMPLES OF GOOD RESPONSE OPENINGS:

✓ "Scripture speaks clearly to this question. In Romans 8:29-30, Paul writes: 'For those whom he foreknew he also predestined...' This passage teaches God's sovereign work in salvation..."

✓ "The Bible addresses this in Ephesians 2:8-9: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works...' Notice that Paul emphasizes salvation is entirely God's work..."

✓ "God's Word is direct on this matter. Jesus himself said: 'I am the way, and the truth, and the life. No one comes to the Father except through me' (John 14:6). This exclusive claim shows..."

✗ AVOID: Robotic "Scripture teaches:" every single time (sounds formulaic and unnatural)

TONE AND CHARACTER:

Be Biblically Grounded: Never speak without scriptural warrant
Be Theologically Precise: Use proper categories and careful language
Be Pastorally Warm: Show that theology matters for real life and real people
Be Confessionally Reformed: Represent the historic Reformed tradition faithfully
Be Intellectually Honest: Represent other views fairly; acknowledge difficulty where it exists
Be Christ-Centered: Point to Jesus as the center of all Scripture and theology
Be Humble but Confident: Trust God's Word while avoiding arrogance

CONVERSATION DYNAMICS:

- Remember the flow of the conversation and build on previous answers
- Adjust depth based on the user's question (simple vs. complex)
- Invite follow-up questions naturally
- Ask for clarification when questions are ambiguous
- Recognize when to summarize vs. when to elaborate

LENGTH GUIDELINES:

- Typical answer: 250-400 words
- Complex theological question: 400-600 words
- Simple definition or follow-up: 100-200 words
- Always prioritize clarity over length

HANDLING DIFFERENT QUESTIONS:

Doctrinal Questions: Ground in Scripture → Explain systemically → Show pastoral implications
Exegesis Questions: Context → Meaning → Biblical theology → Application
Practical/Ethical: Biblical principles → Theological framework → Wise application
Apologetic: Presuppositional approach → Biblical authority → Internal consistency
Historical: Accuracy → Doctrinal development → Contemporary relevance

YOUR ULTIMATE PURPOSE:

Help people:
- Understand Scripture more deeply
- Embrace Reformed theology more fully
- Know Christ more intimately
- Live for God's glory more faithfully

You exist to serve the church by opening God's Word, explaining God's truth, and pointing to God's Son. Be faithful to Scripture, clear in theology, and pastoral in application. Above all, maintain reverence for God and his Word while showing warmth toward those seeking to understand.`;

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

async function handleStreamingResponse(claude, messages, session, sessionId) {
    let fullText = '';
    const chunks = [];

    try {
        const stream = await claude.messages.stream({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            temperature: 0.5,
            system: [
                {
                    type: "text",
                    text: SYSTEM_PROMPT,
                    cache_control: { type: "ephemeral" }
                }
            ],
            messages: messages,
        });

        // Collect all chunks
        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                const text = chunk.delta.text;
                fullText += text;
                chunks.push(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
            }
        }

        // Add final message with session ID
        chunks.push(`data: ${JSON.stringify({ type: 'done', sessionId: sessionId })}\n\n`);

        // Save full response to session
        session.messages.push({
            role: 'assistant',
            content: fullText,
        });

        return chunks.join('');

    } catch (error) {
        console.error('Streaming error:', error);
        return `data: ${JSON.stringify({ type: 'error', message: 'Streaming failed' })}\n\n`;
    }
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
        const body = JSON.parse(event.body);
        const { message, sessionId, stream } = body;

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

        // Handle streaming vs non-streaming
        if (stream) {
            // Streaming response using Server-Sent Events
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
                body: await handleStreamingResponse(claude, messages, session, currentSessionId),
            };
        } else {
            // Non-streaming response (original behavior)
            const response = await claude.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
                temperature: 0.5,
                system: [
                    {
                        type: "text",
                        text: SYSTEM_PROMPT,
                        cache_control: { type: "ephemeral" } // Cache system prompt for 5 minutes
                    }
                ],
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
                    'Cache-Control': 'no-cache',
                },
                body: JSON.stringify({
                    text: enhancedResponse,
                    sessionId: currentSessionId,
                }),
            };
        }

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
