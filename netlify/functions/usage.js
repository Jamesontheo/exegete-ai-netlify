// Simple rate limit tracking (in-memory)
const rateLimits = new Map();

export default async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
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
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
        const now = Date.now();
        
        // Get or create rate limit data for this IP
        if (!rateLimits.has(clientIP)) {
            rateLimits.set(clientIP, { count: 0, resetTime: now + 3600000 });
        }

        const rateLimit = rateLimits.get(clientIP);
        
        // Reset if time has passed
        if (now > rateLimit.resetTime) {
            rateLimit.count = 0;
            rateLimit.resetTime = now + 3600000;
        }

        const remainingRequests = Math.max(0, 50 - rateLimit.count);
        const minutesUntilReset = Math.ceil((rateLimit.resetTime - now) / 60000);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                remainingRequests,
                totalAllowed: 50,
                resetTime: rateLimit.resetTime,
                minutesUntilReset,
                status: remainingRequests > 0 ? 'available' : 'rate_limited',
            }),
        };

    } catch (error) {
        console.error('Usage API Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: 'Unable to retrieve usage information',
            }),
        };
    }
}
