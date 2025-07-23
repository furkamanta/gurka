// Support System JavaScript

let userInfo = {
    ip: 'Unknown',
    country: 'Unknown',
    city: 'Unknown',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: generateSessionId()
};

let chatMessages = [];
let isTyping = false;
let typingTimeout;

// Initialize support system
function initializeSupport() {
    setupEventListeners();
    loadChatHistory();
    updateChatInput();
}

// Generate unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Setup event listeners
function setupEventListeners() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const ticketForm = document.getElementById('ticketForm');
    const ticketDescription = document.getElementById('ticketDescription');
    const kbSearch = document.getElementById('kbSearch');

    // Chat input events
    if (chatInput) {
        chatInput.addEventListener('input', handleChatInput);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Ticket form events
    if (ticketForm) {
        ticketForm.addEventListener('submit', handleTicketSubmit);
    }

    if (ticketDescription) {
        ticketDescription.addEventListener('input', updateCharCounter);
    }

    // Knowledge base search
    if (kbSearch) {
        kbSearch.addEventListener('input', handleKBSearch);
    }

    // File upload
    const fileInput = document.getElementById('ticketAttachment');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Category filters
    const categories = document.querySelectorAll('.kb-category');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            filterKBArticles(this.dataset.category);
            
            // Update active state
            categories.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Load user information
async function loadUserInfo() {
    try {
        // Get IP information
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userInfo.ip = ipData.ip;

        // Get location information
        const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const locationData = await locationResponse.json();
        
        userInfo.country = locationData.country_name || 'Unknown';
        userInfo.city = locationData.city || 'Unknown';
        userInfo.region = locationData.region || 'Unknown';
        userInfo.countryCode = locationData.country_code || 'XX';

        // Update UI
        updateUserInfoDisplay();
        
    } catch (error) {
        console.error('Error loading user info:', error);
        userInfo.ip = 'Unable to detect';
        userInfo.country = 'Unknown';
        updateUserInfoDisplay();
    }
}

// Update user info display
function updateUserInfoDisplay() {
    const userLocationEl = document.getElementById('userLocation');
    const userIPEl = document.getElementById('userIP');
    
    if (userLocationEl) {
        const flag = getCountryFlag(userInfo.country);
        userLocationEl.innerHTML = `${flag} ${userInfo.city}, ${userInfo.country}`;
    }
    
    if (userIPEl) {
        userIPEl.textContent = userInfo.ip;
    }
}

// Get country flag emoji
function getCountryFlag(country) {
    const countryFlags = {
        'Turkey': '🇹🇷', 'United States': '🇺🇸', 'Germany': '🇩🇪', 'France': '🇫🇷',
        'United Kingdom': '🇬🇧', 'Italy': '🇮🇹', 'Spain': '🇪🇸', 'Russia': '🇷🇺',
        'China': '🇨🇳', 'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Brazil': '🇧🇷',
        'Canada': '🇨🇦', 'Australia': '🇦🇺', 'India': '🇮🇳', 'Netherlands': '🇳🇱',
        'Belgium': '🇧🇪', 'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Sweden': '🇸🇪',
        'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Poland': '🇵🇱',
        'Unknown': '🌍'
    };
    return countryFlags[country] || '🌍';
}

// Open live chat
function openLiveChat() {
    const chatOverlay = document.getElementById('chatOverlay');
    chatOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on input
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) chatInput.focus();
    }, 300);
    
    // Save chat connection to admin notifications
    saveChatConnection();
}

// Close chat
function closeChat() {
    const chatOverlay = document.getElementById('chatOverlay');
    chatOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Minimize chat
function minimizeChat() {
    closeChat();
    // Could implement a minimized chat widget here
}

// Handle chat input
function handleChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (chatInput.value.trim()) {
        sendBtn.disabled = false;
    } else {
        sendBtn.disabled = true;
    }
    
    // Show typing indicator
    showTypingIndicator();
}

// Update chat input state
function updateChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (chatInput && sendBtn) {
        sendBtn.disabled = !chatInput.value.trim();
    }
}

// Send message
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';
    updateChatInput();
    
    // Save message
    saveMessage(message, 'user');
    
    // Simulate agent response
    setTimeout(() => {
        simulateAgentResponse(message);
    }, 1000 + Math.random() * 2000);
}

// Add message to chat
function addMessage(text, sender, timestamp = new Date()) {
    const chatMessages = document.getElementById('chatMessages');
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    const message = document.createElement('div');
    message.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-headset"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = formatTime(timestamp);
    
    bubble.appendChild(messageText);
    bubble.appendChild(messageTime);
    content.appendChild(bubble);
    message.appendChild(avatar);
    message.appendChild(content);
    messageGroup.appendChild(message);
    
    chatMessages.appendChild(messageGroup);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate agent response
function simulateAgentResponse(userMessage) {
    const responses = [
        "Thank you for your message! I'm here to help you with any questions or concerns.",
        "I understand your inquiry. Let me assist you with that right away.",
        "That's a great question! I'll provide you with the information you need.",
        "I'm looking into this for you. Please give me a moment to find the best solution.",
        "Thank you for contacting our support team. How can I help you today?",
        "I see what you're asking about. Let me guide you through the process.",
        "That's definitely something I can help you with. Here's what you need to know:",
        "I appreciate you reaching out. Let me provide you with a detailed answer."
    ];
    
    // Show typing indicator
    showAgentTyping();
    
    setTimeout(() => {
        hideAgentTyping();
        const response = responses[Math.floor(Math.random() * responses.length)];
        addMessage(response, 'agent');
        saveMessage(response, 'agent');
    }, 2000 + Math.random() * 3000);
}

// Show agent typing
function showAgentTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.classList.add('active');
    }
}

// Hide agent typing
function hideAgentTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.classList.remove('active');
    }
}

// Show typing indicator
function showTypingIndicator() {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    typingTimeout = setTimeout(() => {
        // Hide typing indicator after user stops typing
    }, 1000);
}

// Save message
function saveMessage(text, sender) {
    const message = {
        id: Date.now(),
        text: text,
        sender: sender,
        timestamp: new Date().toISOString(),
        userInfo: userInfo
    };
    
    chatMessages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    
    // Save to admin notifications if user message
    if (sender === 'user') {
        saveChatMessage(message);
    }
}

// Load chat history
function loadChatHistory() {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
        chatMessages = JSON.parse(saved);
        // Could restore messages to UI here
    }
}

// Save chat connection to admin
function saveChatConnection() {
    const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
    const chatSession = {
        id: userInfo.sessionId,
        userInfo: userInfo,
        startTime: new Date().toISOString(),
        status: 'active',
        messages: []
    };
    
    adminChats.push(chatSession);
    localStorage.setItem('adminChats', JSON.stringify(adminChats));
    
    // Add to admin notifications
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
        id: Date.now(),
        type: 'new_chat',
        title: 'New Chat Session',
        message: `User from ${userInfo.country} started a chat session`,
        userInfo: userInfo,
        timestamp: new Date().toISOString(),
        status: 'unread'
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
}

// Save chat message to admin
function saveChatMessage(message) {
    const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
    const chatIndex = adminChats.findIndex(chat => chat.id === userInfo.sessionId);
    
    if (chatIndex !== -1) {
        adminChats[chatIndex].messages.push(message);
        adminChats[chatIndex].lastMessage = message.text;
        adminChats[chatIndex].lastActivity = message.timestamp;
        localStorage.setItem('adminChats', JSON.stringify(adminChats));
    }
    
    // Add to admin notifications
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
        id: Date.now(),
        type: 'chat_message',
        title: 'New Chat Message',
        message: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
        userInfo: userInfo,
        sessionId: userInfo.sessionId,
        timestamp: new Date().toISOString(),
        status: 'unread'
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
}

// Format time
function formatTime(date) {
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now - messageDate;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    
    return messageDate.toLocaleDateString();
}

// Open ticket system
function openTicketSystem() {
    const ticketModal = document.getElementById('ticketModal');
    ticketModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close ticket modal
function closeTicketModal() {
    const ticketModal = document.getElementById('ticketModal');
    ticketModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Handle ticket form submission
function handleTicketSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('ticketName').value,
        email: document.getElementById('ticketEmail').value,
        category: document.getElementById('ticketCategory').value,
        priority: document.getElementById('ticketPriority').value,
        subject: document.getElementById('ticketSubject').value,
        description: document.getElementById('ticketDescription').value,
        userInfo: userInfo,
        timestamp: new Date().toISOString(),
        id: 'ticket_' + Date.now(),
        status: 'open'
    };
    
    // Save ticket
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    tickets.push(formData);
    localStorage.setItem('supportTickets', JSON.stringify(tickets));
    
    // Add to admin notifications
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
        id: Date.now(),
        type: 'new_ticket',
        title: 'New Support Ticket',
        message: `${formData.subject} - Priority: ${formData.priority}`,
        ticketId: formData.id,
        userInfo: userInfo,
        timestamp: new Date().toISOString(),
        status: 'unread'
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    
    // Show success message
    showNotification('Support ticket submitted successfully! We\'ll get back to you soon.', 'success');
    
    // Close modal and reset form
    closeTicketModal();
    document.getElementById('ticketForm').reset();
    updateCharCounter();
}

// Update character counter
function updateCharCounter() {
    const textarea = document.getElementById('ticketDescription');
    const counter = document.getElementById('charCount');
    
    if (textarea && counter) {
        counter.textContent = textarea.value.length;
        
        if (textarea.value.length > 1800) {
            counter.style.color = '#ef4444';
        } else if (textarea.value.length > 1500) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#a1a1aa';
        }
    }
}

// Handle file upload
function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification('File size must be less than 10MB', 'error');
            return;
        }
        
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        fileElement.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file file-icon"></i>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="remove-file" onclick="removeFile(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        uploadedFiles.appendChild(fileElement);
    });
}

// Remove file
function removeFile(button) {
    button.closest('.uploaded-file').remove();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Open knowledge base
function openKnowledgeBase() {
    const knowledgeModal = document.getElementById('knowledgeModal');
    knowledgeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close knowledge base modal
function closeKnowledgeModal() {
    const knowledgeModal = document.getElementById('knowledgeModal');
    knowledgeModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Load knowledge base articles
function loadKnowledgeBase() {
    const articles = [
        {
            id: 1,
            title: 'How to Purchase Game Currency',
            content: 'Learn how to buy game currency safely and securely through our platform.',
            category: 'getting-started',
            views: 1250,
            helpful: 45
        },
        {
            id: 2,
            title: 'Payment Methods and Security',
            content: 'Information about accepted payment methods and our security measures.',
            category: 'payments',
            views: 980,
            helpful: 38
        },
        {
            id: 3,
            title: 'Account Registration and Verification',
            content: 'Step-by-step guide to creating and verifying your account.',
            category: 'account',
            views: 756,
            helpful: 42
        },
        {
            id: 4,
            title: 'Troubleshooting Common Issues',
            content: 'Solutions to frequently encountered technical problems.',
            category: 'technical',
            views: 634,
            helpful: 29
        },
        {
            id: 5,
            title: 'Refund Policy and Process',
            content: 'Understanding our refund policy and how to request refunds.',
            category: 'payments',
            views: 523,
            helpful: 31
        }
    ];
    
    displayKBArticles(articles);
}

// Display knowledge base articles
function displayKBArticles(articles) {
    const container = document.getElementById('kbArticles');
    if (!container) return;
    
    container.innerHTML = articles.map(article => `
        <div class="kb-article" onclick="openKBArticle(${article.id})">
            <h4>${article.title}</h4>
            <p>${article.content}</p>
            <div class="kb-article-meta">
                <span class="kb-article-category">${article.category.replace('-', ' ')}</span>
                <span>${article.views} views • ${article.helpful} helpful</span>
            </div>
        </div>
    `).join('');
}

// Filter knowledge base articles
function filterKBArticles(category) {
    // This would filter articles by category
    // For now, just reload all articles
    loadKnowledgeBase();
}

// Handle knowledge base search
function handleKBSearch(e) {
    const query = e.target.value.toLowerCase();
    // This would search through articles
    // For now, just a placeholder
    console.log('Searching for:', query);
}

// Open knowledge base article
function openKBArticle(articleId) {
    // This would open the full article
    console.log('Opening article:', articleId);
}

// Attach file to chat
function attachFile() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.txt,.doc,.docx';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Handle file attachment
            showNotification('File attachment feature coming soon!', 'info');
        }
    };
    input.click();
}

// Toggle emoji picker
function toggleEmojiPicker() {
    // Placeholder for emoji picker
    showNotification('Emoji picker coming soon!', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(26, 26, 26, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 12px;
                padding: 1rem 1.5rem;
                color: #ffffff;
                z-index: 10001;
                display: flex;
                align-items: center;
                gap: 1rem;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification.success { border-color: rgba(34, 197, 94, 0.5); }
            .notification.error { border-color: rgba(239, 68, 68, 0.5); }
            .notification.info { border-color: rgba(59, 130, 246, 0.5); }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: #a1a1aa;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        if (e.target.id === 'ticketModal') closeTicketModal();
        if (e.target.id === 'knowledgeModal') closeKnowledgeModal();
    }
    
    if (e.target.classList.contains('chat-overlay')) {
        closeChat();
    }
});

// Handle escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTicketModal();
        closeKnowledgeModal();
        closeChat();
    }
});

// 3D Background Style Management for Support Page
function loadSavedBgStyleForSupport() {
    const savedStyle = localStorage.getItem('activeBgStyle') || '1';
    applyBgStyleForSupport(savedStyle);
}

function applyBgStyleForSupport(styleNumber) {
    console.log('Applying background style to support page:', styleNumber);
    
    // Remove all existing style classes
    document.body.classList.remove('bg-style-1', 'bg-style-2', 'bg-style-3', 'bg-style-4', 'bg-style-5', 'bg-style-6', 'bg-style-7', 'bg-style-8', 'bg-style-9', 'bg-style-10', 'bg-style-11', 'bg-style-12');
    
    // Apply new style class
    document.body.classList.add(`bg-style-${styleNumber}`);
}

// Listen for background style changes from admin panel
window.addEventListener('storage', function(e) {
    if (e.key === 'activeBgStyle' && e.newValue) {
        applyBgStyleForSupport(e.newValue);
        console.log('Support page: 3D Background style updated from admin panel to:', e.newValue);
    }
});

// Initialize background style when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load saved background style after a short delay to ensure DOM is ready
    setTimeout(() => {
        loadSavedBgStyleForSupport();
    }, 100);
});