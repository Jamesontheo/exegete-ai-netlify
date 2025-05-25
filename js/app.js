document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const introMessage = document.getElementById('intro-message');
    const exampleButtons = document.querySelectorAll('.example-button');
    const themeButton = document.getElementById('theme-button');
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const sidebarContents = document.querySelectorAll('.sidebar-content');
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const bibleBooks = document.querySelectorAll('.bible-book');
    const topicItems = document.querySelectorAll('.topic-item');
    const theologianCards = document.querySelectorAll('.theologian-card');
    const tags = document.querySelectorAll('.tag');
    const verseSearch = document.getElementById('verse-search');
    const verseSearchBtn = document.getElementById('verse-search-btn');
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close-modal');
    
    // Application State
    let sessionId = localStorage.getItem(CONFIG.STORAGE.SESSION_ID) || null;
    let isLoading = false;
    let retryCount = 0;
    
    // Initialize Application
    init();
    
    function init() {
        setupEventListeners();
        setupTheme();
        setupUI();
        checkAPIHealth();
        
        // Set current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        console.log(`${CONFIG.APP.NAME} v${CONFIG.APP.VERSION} initialized`);
    }
    
    function setupEventListeners() {
        // Theme toggle
        themeButton.addEventListener('click', toggleTheme);
        
        // Help modal
        helpButton.addEventListener('click', () => helpModal.classList.add('active'));
        closeModal.addEventListener('click', () => helpModal.classList.remove('active'));
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.classList.remove('active');
        });
        
        // Chat input
        userInput.addEventListener('input', handleInputResize);
        userInput.addEventListener('keydown', handleKeyDown);
        sendButton.addEventListener('click', sendMessage);
        
        // Example buttons
        exampleButtons.forEach(button => {
            button.addEventListener('click', () => {
                userInput.value = button.dataset.query;
                handleInputResize();
                userInput.focus();
                hideIntroMessage();
            });
        });
        
        // Sidebar navigation
        sidebarTabs.forEach(tab => {
            tab.addEventListener('click', () => switchSidebarTab(tab.dataset.tab));
        });
        
        // Accordion
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => toggleAccordion(header));
        });
        
        // Interactive elements
        bibleBooks.forEach(book => {
            book.addEventListener('click', () => {
                insertQuery(`What does Scripture teach about the book of ${book.dataset.book}?`);
            });
        });
        
        topicItems.forEach(item => {
            item.addEventListener('click', () => {
                insertQuery(item.dataset.query);
            });
        });
        
        theologianCards.forEach(card => {
            card.addEventListener('click', () => {
                insertQuery(card.dataset.query);
            });
        });
        
        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                insertQuery(tag.dataset.query);
            });
        });
        
        // Bible verse search
        verseSearchBtn.addEventListener('click', handleVerseSearch);
        verseSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleVerseSearch();
            }
        });
    }
    
    function setupTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE.THEME);
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }
    }
    
    function setupUI() {
        // Initialize sidebar tabs
        switchSidebarTab('scripture');
        
        // Initialize accordions
        if (accordionHeaders.length > 0) {
            toggleAccordion(accordionHeaders[0]);
        }
        
        // Show intro message initially
        if (introMessage) {
            introMessage.style.display = 'flex';
            chatMessages.style.display = 'none';
        }
    }
    
    async function checkAPIHealth() {
        try {
            const response = await fetchWithRetry(CONFIG.API.ENDPOINTS.HEALTH, {
                method: 'GET'
            });
            
            if (response.ok) {
                const health = await response.json();
                console.log('✅ API Health Check:', health);
            } else {
                console.warn('⚠️ API Health Check failed:', response.status);
            }
        } catch (error) {
            console.error('❌ API Health Check error:', error);
        }
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE.THEME, newTheme);
        updateThemeIcon(newTheme);
    }
    
    function updateThemeIcon(theme) {
        themeButton.innerHTML = theme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
    
    function handleInputResize() {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    }
    
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    function insertQuery(query) {
        userInput.value = query;
        handleInputResize();
        userInput.focus();
        hideIntroMessage();
    }
    
    function hideIntroMessage() {
        if (introMessage && introMessage.style.display !== 'none') {
            introMessage.style.display = 'none';
            chatMessages.style.display = 'block';
        }
    }
    
    function handleVerseSearch() {
        const verse = verseSearch.value.trim();
        if (verse) {
            insertQuery(`What is the biblical interpretation of ${verse}?`);
            verseSearch.value = '';
        }
    }
    
    function switchSidebarTab(tabName) {
        // Update tab buttons
        sidebarTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update content sections
        sidebarContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });
    }
    
    function toggleAccordion(header) {
        header.classList.toggle('active');
        const content = header.nextElementSibling;
        content.classList.toggle('active', header.classList.contains('active'));
    }
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message || isLoading) return;
        
        // Validate message length
        if (message.length > CONFIG.APP.MAX_MESSAGE_LENGTH) {
            showError(`Message too long. Maximum ${CONFIG.APP.MAX_MESSAGE_LENGTH} characters allowed.`);
            return;
        }
        
        hideIntroMessage();
        addMessageToChat('user', message);
        
        // Clear input and disable send button
        userInput.value = '';
        userInput.style.height = 'auto';
        setLoading(true);
        
        // Add loading indicator
        const loadingDiv = addLoadingIndicator();
        
        try {
            const response = await fetchWithRetry(CONFIG.API.ENDPOINTS.CHAT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message,
                    sessionId 
                })
            });
            
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Save session ID
            if (data.sessionId) {
                sessionId = data.sessionId;
                localStorage.setItem(CONFIG.STORAGE.SESSION_ID, sessionId);
            }
            
            // Add assistant response
            if (data.text) {
                addMessageToChat('assistant', data.text);
            } else {
                throw new Error('No response text received');
            }
            
            retryCount = 0; // Reset retry count on success
            
        } catch (error) {
            console.error('Chat error:', error);
            
            // Remove loading indicator
            if (loadingDiv.parentNode) {
                chatMessages.removeChild(loadingDiv);
            }
            
            // Show error message
            let errorMessage = 'I apologize, but there was an error processing your request.';
            
            if (error.message.includes('429')) {
                errorMessage = 'Too many requests. Please wait a moment before trying again.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Authentication error. Please check the API configuration.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            addMessageToChat('assistant', errorMessage);
        } finally {
            setLoading(false);
        }
    }
    
    async function fetchWithRetry(endpoint, options = {}) {
        const url = CONFIG.API.BASE_URL + endpoint;
        
        for (let attempt = 1; attempt <= CONFIG.API.RETRY_ATTEMPTS; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
                
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok || response.status === 429 || response.status === 401) {
                    return response;
                }
                
                throw new Error(`HTTP ${response.status}`);
                
            } catch (error) {
                console.warn(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt === CONFIG.API.RETRY_ATTEMPTS) {
                    throw error;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, CONFIG.API.RETRY_DELAY * attempt));
            }
        }
    }
    
    function setLoading(loading) {
        isLoading = loading;
        sendButton.disabled = loading;
        userInput.disabled = loading;
    }
    
    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant loading';
        loadingDiv.innerHTML = `
            <div class="loading-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        scrollToBottom();
        return loadingDiv;
    }
    
    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        // Format content for assistant messages
        if (role === 'assistant') {
            content = formatAssistantMessage(content);
        }
        
        const formattedContent = formatMessage(content);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${formattedContent}
            </div>
        `;
        
        // Check if user was at bottom before adding message
        const wasAtBottom = isAtBottom();
        
        chatMessages.appendChild(messageDiv);
        
        // Add event listeners to interactive elements
        addInteractiveListeners(messageDiv);
        
        // Auto-scroll if user was at bottom
        if (wasAtBottom) {
            setTimeout(scrollToBottom, CONFIG.APP.AUTO_SCROLL_DELAY);
        } else {
            showNewMessageIndicator();
        }
    }
    
    function formatAssistantMessage(content) {
        // Enhanced Scripture formatting for Claude responses
        return forceScriptureFormatting(content);
    }
    
    function forceScriptureFormatting(content) {
        // Pattern 1: Look for "Scripture teaches:" followed by quotes
        content = content.replace(/(Scripture teaches:|The Bible says:|According to Scripture:|God's Word states:)\s*"([^"]+)"\s*\(([^)]+)\)/gi, 
            (match, prefix, quote, reference) => {
            return `${prefix}
            <blockquote class="scripture-block">
                <p class="scripture-text">"${quote}"</p>
                <p class="scripture-reference">${reference}</p>
            </blockquote>`;
        });
        
        // Pattern 2: Look for standalone quoted verses with references
        content = content.replace(/"([^"]+)"\s*\(([^)]+)\)/g, (match, quote, reference) => {
            // Check if this looks like a Bible reference
            if (/\d+:\d+/.test(reference)) {
                return `<blockquote class="scripture-block">
                    <p class="scripture-text">"${quote}"</p>
                    <p class="scripture-reference">${reference}</p>
                </blockquote>`;
            }
            return match;
        });
        
        return content;
    }
    
    function formatMessage(content) {
        // Bold
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Scripture references (make clickable)
        content = content.replace(/\b([1-3]?\s?[A-Za-z]+\s\d+:\d+(?:-\d+)?)\b/g, '<span class="scripture-ref">$1</span>');
        
        // Theologian references
        const theologians = [
            'Calvin', 'Luther', 'Augustine', 'Sproul', 'Piper', 
            'Grudem', 'Keller', 'Carson', 'John Calvin', 'Martin Luther',
            'St. Augustine', 'R.C. Sproul', 'John Piper', 'Wayne Grudem',
            'Tim Keller', 'D.A. Carson'
        ];
        
        theologians.forEach(theologian => {
            const regex = new RegExp(`\\b${theologian}\\b`, 'g');
            content = content.replace(regex, `<span class="theologian-ref">${theologian}</span>`);
        });
        
        // Reformed doctrine terms
        const doctrines = [
            'TULIP', 'Total Depravity', 'Unconditional Election', 'Limited Atonement',
            'Irresistible Grace', 'Perseverance of the Saints', 'Covenant Theology',
            'Sola Scriptura', 'Sola Fide', 'Sola Gratia', 'Solus Christus', 'Soli Deo Gloria'
        ];
        
        doctrines.forEach(doctrine => {
            const regex = new RegExp(`\\b${doctrine}\\b`, 'g');
            content = content.replace(regex, `<span class="doctrine-term">${doctrine}</span>`);
        });
        
        // Convert line breaks to paragraphs
        const paragraphs = content.split('\n\n');
        return paragraphs.map(p => {
            if (p.trim() === '') return '';
            if (p.includes('<blockquote') || p.includes('<h4')) return p;
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('');
    }
    
    function addInteractiveListeners(messageDiv) {
        // Scripture references
        const scriptureRefs = messageDiv.querySelectorAll('.scripture-ref');
        scriptureRefs.forEach(ref => {
            ref.addEventListener('click', () => {
                insertQuery(`What is the biblical interpretation of ${ref.textContent}?`);
            });
        });
        
        // Theologian references
        const theologianRefs = messageDiv.querySelectorAll('.theologian-ref');
        theologianRefs.forEach(ref => {
            ref.addEventListener('click', () => {
                insertQuery(`What did ${ref.textContent} teach about this topic?`);
            });
        });
        
        // Doctrine terms
        const doctrineTerms = messageDiv.querySelectorAll('.doctrine-term');
        doctrineTerms.forEach(term => {
            term.addEventListener('click', () => {
                insertQuery(`What is the biblical basis for ${term.textContent}?`);
            });
        });
    }
    
    function isAtBottom() {
        return chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 50;
    }
    
    function scrollToBottom() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }
    
    function showNewMessageIndicator() {
        let indicator = document.querySelector('.new-message-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'new-message-indicator';
            indicator.innerHTML = `
                <i class="fas fa-arrow-down"></i>
                <span>New message</span>
            `;
            
            indicator.addEventListener('click', () => {
                scrollToBottom();
                indicator.remove();
            });
            
            chatMessages.parentElement.appendChild(indicator);
            
            // Auto-remove when user scrolls to bottom
            const checkScroll = () => {
                if (isAtBottom()) {
                    indicator.remove();
                    chatMessages.removeEventListener('scroll', checkScroll);
                }
            };
            
            chatMessages.addEventListener('scroll', checkScroll);
        }
    }
    
    function showError(message) {
        // Create a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
});
