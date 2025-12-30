// Configuration for Exegete.AI
const CONFIG = {
    // API Configuration
    API: {
        // Automatically detect environment and use appropriate URL
        BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:8888' // Netlify dev server
            : window.location.origin, // Production Netlify URL
        ENDPOINTS: {
            CHAT: '/api/chat',
            HEALTH: '/api/health',
            USAGE: '/api/usage'
        },
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },

    // Application Settings
    APP: {
        NAME: 'Exegete.AI',
        VERSION: '2.0.0',
        DESCRIPTION: 'Scripture-First Reformed Theology Assistant',
        MAX_MESSAGE_LENGTH: 2000,
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
        AUTO_SCROLL_DELAY: 100,
        ENABLE_STREAMING: true, // Enable streaming responses
        SAVE_HISTORY: true // Save conversation history
    },

    // UI Configuration
    UI: {
        THEMES: {
            LIGHT: 'light',
            DARK: 'dark'
        },
        DEFAULT_THEME: 'light',
        ANIMATION_DURATION: 300,
        TYPING_INDICATOR_DELAY: 500,
        MESSAGE_FADE_DURATION: 200
    },

    // Storage Keys
    STORAGE: {
        THEME: 'exegete-theme',
        SESSION_ID: 'exegete-session-id',
        CHAT_HISTORY: 'exegete-chat-history',
        USER_PREFERENCES: 'exegete-preferences'
    },

    // Rate Limiting (client-side display)
    RATE_LIMIT: {
        MAX_REQUESTS_PER_HOUR: 50,
        WARNING_THRESHOLD: 10 // Show warning when this many requests remain
    },

    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection and try again.',
        TIMEOUT: 'Request timed out. Please try again.',
        RATE_LIMIT: 'Rate limit exceeded. Please wait before sending another message.',
        SERVER: 'Server error. Please try again later.',
        INVALID_INPUT: 'Please enter a valid message.',
        MESSAGE_TOO_LONG: `Message too long. Please keep it under ${2000} characters.`,
        GENERIC: 'An error occurred. Please try again.'
    },

    // Success Messages
    SUCCESS: {
        MESSAGE_SENT: 'Message sent successfully',
        THEME_CHANGED: 'Theme updated',
        SETTINGS_SAVED: 'Settings saved'
    },

    // Bible Books Configuration
    BIBLE: {
        OLD_TESTAMENT: [
            'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
            'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
            '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
            'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
            'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
            'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
            'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
            'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
        ],
        NEW_TESTAMENT: [
            'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
            '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
            'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
            '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
            'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
            'Jude', 'Revelation'
        ]
    },

    // Reformed Theologians
    THEOLOGIANS: {
        'Calvin': {
            name: 'John Calvin',
            years: '1509-1564',
            description: 'French Reformer, systematic theologian, and pastor in Geneva',
            specialties: ['Systematic Theology', 'Institutes', 'Predestination', 'Church Government']
        },
        'Luther': {
            name: 'Martin Luther',
            years: '1483-1546', 
            description: 'German professor and catalyst of the Protestant Reformation',
            specialties: ['Justification by Faith', 'Priesthood of Believers', 'Scripture Alone']
        },
        'Augustine': {
            name: 'St. Augustine',
            years: '354-430',
            description: 'Early church father whose work greatly influenced Reformed theology',
            specialties: ['Grace', 'Predestination', 'Original Sin', 'City of God']
        },
        'Sproul': {
            name: 'R.C. Sproul',
            years: '1939-2017',
            description: 'American Reformed theologian and founder of Ligonier Ministries',
            specialties: ['Holiness of God', 'Reformed Doctrine', 'Apologetics']
        },
        'Piper': {
            name: 'John Piper',
            years: '1946-present',
            description: 'American Reformed Baptist pastor and author',
            specialties: ['Christian Hedonism', 'Desiring God', 'Missions']
        },
        'Grudem': {
            name: 'Wayne Grudem',
            years: '1948-present',
            description: 'American theologian and author of Systematic Theology',
            specialties: ['Systematic Theology', 'Biblical Authority', 'Spiritual Gifts']
        },
        'Keller': {
            name: 'Tim Keller',
            years: '1950-2023',
            description: 'American pastor, theologian, and Christian apologist',
            specialties: ['Gospel-Centered Ministry', 'Cultural Engagement', 'Apologetics']
        },
        'Carson': {
            name: 'D.A. Carson',
            years: '1946-present',
            description: 'Canadian-American theological scholar and exegete',
            specialties: ['Biblical Theology', 'New Testament', 'Exegesis']
        }
    },

    // Reformed Doctrines
    DOCTRINES: {
        'TULIP': {
            name: 'Doctrines of Grace (TULIP)',
            points: [
                'Total Depravity',
                'Unconditional Election', 
                'Limited Atonement',
                'Irresistible Grace',
                'Perseverance of Saints'
            ]
        },
        'Five Solas': {
            name: 'The Five Solas',
            points: [
                'Sola Scriptura (Scripture Alone)',
                'Sola Fide (Faith Alone)',
                'Sola Gratia (Grace Alone)',
                'Solus Christus (Christ Alone)',
                'Soli Deo Gloria (Glory to God Alone)'
            ]
        },
        'Covenant Theology': {
            name: 'Covenant Theology',
            points: [
                'Covenant of Redemption',
                'Covenant of Works',
                'Covenant of Grace',
                'Old & New Covenants'
            ]
        }
    },

    // Development Settings
    DEBUG: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // Analytics (if needed)
    ANALYTICS: {
        ENABLED: false, // Set to true if you want to add analytics
        TRACK_EVENTS: ['message_sent', 'theme_changed', 'theologian_clicked']
    }
};

// Make config globally available
window.EXEGETE_CONFIG = CONFIG;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
