// 🔒 SECURE ADMIN PANEL
// Hassas bilgiler artık backend'de saklanıyor ve frontend'de görünmüyor
const ADMIN_PASSWORD = 'Pokemon1909.'; // Bu bilgi sadece local login için
const SECURE_API_ENDPOINT = '/api/secure-handler.php';

// 🛡️ Secure API Helper - Admin Panel için
const AdminAPI = {
    // Bot durumu kontrol et
    checkBotStatus: () => fetch(`${SECURE_API_ENDPOINT}?action=check_bot_status`),
    
    // Admin mesajı gönder
    sendMessage: (message) => fetch(`${SECURE_API_ENDPOINT}?action=send_admin_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    }),
    
    // Total raporu al ve gönder
    sendTotalReport: (paymentData) => fetch(`${SECURE_API_ENDPOINT}?action=get_total`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentData })
    }),
    
    // Mesaj dinleyici
    listenMessages: (lastUpdateId) => fetch(`${SECURE_API_ENDPOINT}?action=listen_messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastUpdateId })
    })
};

let currentSection = 'dashboard';
let isLoggedIn = false;

// Emergency login function for debugging
window.emergencyLogin = function(password) {
    console.log('Emergency login called with password:', password);
    if (password === ADMIN_PASSWORD) {
        console.log('Emergency login successful');
        login();
        return true;
    } else {
        console.log('Emergency login failed - wrong password');
        return false;
    }
};

// Make login function globally accessible for debugging
window.debugLogin = function() {
    console.log('Debug login called');
    login();
};

// Debug banner slides
window.debugBannerSlides = function() {
    console.log('=== BANNER SLIDES DEBUG ===');
    console.log('bannerSlides array:', bannerSlides);
    console.log('Type:', typeof bannerSlides);
    console.log('Is array:', Array.isArray(bannerSlides));
    console.log('Length:', bannerSlides ? bannerSlides.length : 'undefined');
    
    const stored = localStorage.getItem('bannerSlides');
    console.log('localStorage bannerSlides:', stored);
    
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            console.log('Parsed slides:', parsed);
            console.log('Parsed length:', parsed.length);
        } catch (error) {
            console.error('Error parsing stored slides:', error);
        }
    }
    
    console.log('currentEditingSlide:', currentEditingSlide);
    
    // Check elements
    const slideTitle = document.getElementById('slideTitle');
    const slideSubtitle = document.getElementById('slideSubtitle');
    const slideButtonText = document.getElementById('slideButtonText');
    const slideButtonLink = document.getElementById('slideButtonLink');
    const slideImagePreview = document.getElementById('slideImagePreview');
    
    console.log('Form elements:', {
        slideTitle: slideTitle ? slideTitle.value : 'not found',
        slideSubtitle: slideSubtitle ? slideSubtitle.value : 'not found',
        slideButtonText: slideButtonText ? slideButtonText.value : 'not found',
        slideButtonLink: slideButtonLink ? slideButtonLink.value : 'not found',
        slideImagePreview: slideImagePreview ? 'found' : 'not found'
    });
    
    if (slideImagePreview) {
        const img = slideImagePreview.querySelector('img');
        console.log('Image element:', img);
        if (img) {
            console.log('Image src length:', img.src.length);
            console.log('Image src preview:', img.src.substring(0, 100) + '...');
        }
    }
};

// Test function to check elements
window.testElements = function() {
    console.log('=== ELEMENT TEST ===');
    console.log('loginModal:', document.getElementById('loginModal'));
    console.log('adminPanel:', document.getElementById('adminPanel'));
    console.log('loginForm:', document.getElementById('loginForm'));
    console.log('adminPassword:', document.getElementById('adminPassword'));
    
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        console.log('loginModal classes:', loginModal.className);
        console.log('loginModal style:', loginModal.style.cssText);
    }
    
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        console.log('adminPanel classes:', adminPanel.className);
        console.log('adminPanel style:', adminPanel.style.cssText);
    }
};

// Test logo management
window.testLogoManagement = function() {
    console.log('=== LOGO MANAGEMENT TEST ===');
    console.log('logosGrid:', document.getElementById('logosGrid'));
    console.log('gamesData keys:', Object.keys(gamesData));
    console.log('Games with logos:', Object.entries(gamesData).filter(([name, data]) => data.logo).map(([name]) => name));
    
    // Force reload logo management
    loadLogosManagement();
};

// Check localStorage size
window.checkStorageSize = function() {
    const data = localStorage.getItem('gamesData');
    if (data) {
        const sizeInBytes = new Blob([data]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        console.log(`localStorage size: ${sizeInMB} MB (${sizeInBytes} bytes)`);
        
        // Count logos
        const parsedData = JSON.parse(data);
        const logosCount = Object.values(parsedData).filter(game => game.logo).length;
        console.log(`Number of custom logos: ${logosCount}`);
        
        // Show games with logos and their sizes
        Object.entries(parsedData).forEach(([name, data]) => {
            if (data.logo) {
                const logoSize = (new Blob([data.logo]).size / 1024).toFixed(1);
                console.log(`${name}: ${logoSize} KB`);
            }
        });
        
        return { sizeInMB, sizeInBytes, logosCount };
    }
    return null;
};

// Clear all logos
window.clearAllLogos = function() {
    if (confirm('Are you sure you want to remove ALL logos? This cannot be undone!')) {
        Object.keys(gamesData).forEach(gameName => {
            delete gamesData[gameName].logo;
        });
        
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        console.log('All logos cleared!');
        
        // Reload logo management if open
        if (document.getElementById('logosGrid')) {
            loadLogosManagement();
        }
        if (document.getElementById('gamesManagement')) {
            loadGamesManagement();
        }
        
        alert('All logos have been cleared!');
    }
};

// Clear unused game logos (games not in any category)
window.clearUnusedLogos = function() {
    const allCategoryGames = new Set();
    
    // Collect all games from all categories
    Object.values(gameCategories).forEach(category => {
        category.games.forEach(game => allCategoryGames.add(game));
    });
    
    let removedCount = 0;
    Object.keys(gamesData).forEach(gameName => {
        if (gamesData[gameName].logo && !allCategoryGames.has(gameName)) {
            delete gamesData[gameName].logo;
            removedCount++;
            console.log(`Removed unused logo for: ${gameName}`);
        }
    });
    
    if (removedCount > 0) {
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        console.log(`Cleared ${removedCount} unused logos!`);
        
        // Reload logo management if open
        if (document.getElementById('logosGrid')) {
            loadLogosManagement();
        }
        if (document.getElementById('gamesManagement')) {
            loadGamesManagement();
        }
        
        alert(`Cleared ${removedCount} unused logos! Storage freed up.`);
    } else {
        alert('No unused logos found.');
    }
};

// Update storage info display
function updateStorageInfo() {
    const storageSize = document.getElementById('storageSize');
    const logoCount = document.getElementById('logoCount');
    
    if (!storageSize || !logoCount) return;
    
    const data = localStorage.getItem('gamesData');
    if (data) {
        const sizeInBytes = new Blob([data]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        
        const parsedData = JSON.parse(data);
        const logosCount = Object.values(parsedData).filter(game => game.logo).length;
        
        storageSize.textContent = `${sizeInMB} MB`;
        logoCount.textContent = logosCount;
        
        // Color code based on usage
        if (sizeInMB > 8) {
            storageSize.style.color = '#ef4444'; // Red
        } else if (sizeInMB > 6) {
            storageSize.style.color = '#f59e0b'; // Yellow
        } else {
            storageSize.style.color = '#22c55e'; // Green
        }
    }
}

// Optimized image compression function
function compressImage(file, maxWidth = 120, maxHeight = 120, quality = 0.5) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let { width, height } = img;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing admin panel');
    
    // Start bot listener
    try {
        startBotListener();
        console.log('Bot listener started');
    } catch (error) {
        console.log('Bot listener error:', error);
    }
    
    // Check if gamesData exists
    if (typeof gamesData === 'undefined') {
        console.error('gamesData is not loaded! Make sure games-data.js is included.');
        alert('Error: Games data not loaded! Please refresh the page.');
        return;
    }
    
    console.log('gamesData loaded successfully');
    
    // Initialize localStorage with gamesData if not exists or force update
    localStorage.setItem('gamesData', JSON.stringify(gamesData));
    console.log('Updated localStorage with latest gamesData');
    console.log('Gift card games:', Object.keys(gamesData).filter(name => isGiftCard(name)));
    
    console.log('Setting up login...');
    setupLogin();
    
    console.log('Loading dashboard data...');
    loadDashboardData();
    
    console.log('Setting up event listeners...');
    setupEventListeners();
    
    console.log('Admin panel initialization completed');
});

// Setup login functionality
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    console.log('Setting up login form:', loginForm);
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        console.log('Login attempt with password:', password);
        console.log('Expected password:', ADMIN_PASSWORD);
        console.log('Password match:', password === ADMIN_PASSWORD);
        
        if (password === ADMIN_PASSWORD) {
            console.log('Password correct, logging in...');
            login();
        } else {
            console.log('Password incorrect!');
            alert('Invalid password!');
        }
    });
}

// Login function
function login() {
    console.log('Login function called');
    isLoggedIn = true;
    
    const loginModal = document.getElementById('loginModal');
    const adminPanel = document.getElementById('adminPanel');
    
    console.log('Login modal element:', loginModal);
    console.log('Admin panel element:', adminPanel);
    
    if (loginModal) {
        loginModal.classList.remove('active');
        console.log('Removed active class from login modal');
    }
    
    if (adminPanel) {
        adminPanel.style.display = 'block';
        console.log('Set admin panel display to block');
    }
    
    loadDashboardData();
    
    // Request notification permission
    try {
        requestNotificationPermission();
    } catch (error) {
        console.log('Notification permission error:', error);
    }
    
    // Show welcome notification
    try {
        showInAppNotification('Welcome to Admin Panel!', 'info');
    } catch (error) {
        console.log('Welcome notification error:', error);
    }
    
    console.log('Login completed successfully');
}

// Logout function
function logout() {
    isLoggedIn = false;
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('transactionSearch').addEventListener('input', filterTransactions);
    document.getElementById('visitorSearch').addEventListener('input', filterVisitors);
    
    // Filter functionality
    document.getElementById('transactionFilter').addEventListener('change', filterTransactions);
    document.getElementById('visitorFilter').addEventListener('change', filterVisitors);
    
    // Support chat input
    const adminMessageInput = document.getElementById('adminMessageInput');
    if (adminMessageInput) {
        adminMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAdminMessage();
            }
        });
    }
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked nav button
    event.target.classList.add('active');
    
    currentSection = sectionName;
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'visitors':
            loadVisitors();
            break;
        case 'games':
            loadGamesManagement();
            break;
        case 'logos':
            loadLogosManagement();
            break;
        case 'styles':
            loadPackageStyles();
            break;
        case 'backgrounds':
            loadPackageBackgrounds();
            break;
        case 'support':
            showSupportTab('chats');
            updateSupportStats();
            break;
        case 'pay':
            loadPaymentData();
            break;
        case 'information':
            loadPaymentInformation();
            break;
        case 'settings':
            loadSettings();
            break;
    }
// Load payment information for Information section
function loadPaymentInformation() {
    const paymentInformation = JSON.parse(localStorage.getItem('paymentInformation') || '[]');
    const informationList = document.getElementById('informationList');
    
    // Update notification badge
    updateInformationNotifications(paymentInformation);
    
    if (!informationList) {
        console.error('❌ informationList element not found');
        return;
    }
    
    if (paymentInformation.length === 0) {
        informationList.innerHTML = '<div class="no-data">No payment information available</div>';
        return;
    }
    
    // Sort by newest first
    paymentInformation.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    informationList.innerHTML = paymentInformation.map((info, index) => {
        return `
            <div class="payment-info-item">
                <div class="payment-info-header">
                    <strong>Payment #${paymentInformation.length - index}</strong>
                    <small>${info.date}</small>
                </div>
                <div class="payment-info-content">
                    <pre>${info.entry}</pre>
                </div>
            </div>
        `;
    }).join('');
}

// Download payment information file
function downloadUsforkFile() {
    const paymentInformation = JSON.parse(localStorage.getItem('paymentInformation') || '[]');
    
    if (paymentInformation.length === 0) {
        alert('No payment information to download');
        return;
    }
    
    // Create file content
    let fileContent = 'PAYMENT INFORMATION LOG\n=====================================\n\n';
    
    // Sort by oldest first for file
    paymentInformation.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    paymentInformation.forEach(info => {
        fileContent += info.entry + '\n\n';
    });
    
    // Create timestamp for filename
    const now = new Date();
    const timestamp = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');
    const filename = `payments_${timestamp}.txt`;
    
    console.log('📁 Attempting to download:', filename);
    console.log('📋 Content length:', fileContent.length);
    
    // Method 1: Standard download
    try {
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        
        // Append to body, click, remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up after delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        console.log('✅ Download initiated successfully');
        showInAppNotification(`${filename} download started!`, 'success');
        return;
        
    } catch (error) {
        console.error('❌ Standard download failed:', error);
    }
    
    // Method 2: Force download with data URL
    try {
        const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent);
        const link = document.createElement('a');
        
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Data URL download initiated');
        showInAppNotification(`${filename} download started!`, 'success');
        return;
        
    } catch (error) {
        console.error('❌ Data URL download failed:', error);
    }
    
    // Method 3: Open in new window
    try {
        const newWindow = window.open();
        newWindow.document.write(`<pre>${fileContent}</pre>`);
        newWindow.document.title = filename;
        
        alert(`Download failed. Payment information opened in new window. Please copy and save as ${filename}`);
        return;
        
    } catch (error) {
        console.error('❌ New window method failed:', error);
    }
    
    // Method 4: Copy to clipboard
    try {
        navigator.clipboard.writeText(fileContent).then(() => {
            alert(`Download failed. Payment information copied to clipboard. Please paste into a text file and save as ${filename}`);
        }).catch(() => {
            // Fallback clipboard
            const textArea = document.createElement('textarea');
            textArea.value = fileContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            alert(`Download failed. Payment information copied to clipboard. Please paste into a text file and save as ${filename}`);
        });
        
    } catch (error) {
        console.error('❌ All methods failed:', error);
        alert('All download methods failed. Please check console for details.');
    }
}

// Clear all payment information
function clearPaymentInformation() {
    if (confirm('Are you sure you want to clear ALL payment information? This action cannot be undone.')) {
        localStorage.removeItem('paymentInformation');
        loadPaymentInformation();
        showInAppNotification('All payment information cleared successfully', 'success');
    }
}

// Update information notifications
function updateInformationNotifications(paymentInformation) {
    const notificationElement = document.getElementById('informationNotification');
    if (notificationElement) {
        const count = paymentInformation.length;
        notificationElement.textContent = count;
        notificationElement.style.display = count > 0 ? 'block' : 'none';
    }
}

// Export paymentInformation in various formats
function exportPaymentInformation(format) {
    const infoArr = JSON.parse(localStorage.getItem('paymentInformation') || '[]');
    let content = '';
    let mime = 'text/plain';
    let ext = format;
    if (format === 'csv') {
        content = 'Summary\n' + infoArr.map(s => '"' + s.replace(/"/g, '""') + '"').join('\n');
        mime = 'text/csv';
    } else if (format === 'json') {
        content = JSON.stringify(infoArr, null, 2);
        mime = 'application/json';
    } else {
        content = infoArr.join('\n\n');
        mime = 'text/plain';
        ext = 'txt';
    }
    const blob = new Blob([content], {type: mime});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payment_information_${new Date().toISOString().split('T')[0]}.${ext}`;
    link.click();
}
}

// Load dashboard data
function loadDashboardData() {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Calculate stats
    const totalVisitors = visitors.length;
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.payment?.total || 0), 0);
    
    // Today's visitors
    const today = new Date().toDateString();
    const todayVisitors = visitors.filter(v => 
        new Date(v.timestamp).toDateString() === today
    ).length;
    
    // Update stats
    document.getElementById('totalVisitors').textContent = totalVisitors.toLocaleString();
    document.getElementById('totalTransactions').textContent = totalTransactions.toLocaleString();
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('todayVisitors').textContent = todayVisitors.toLocaleString();
    
    // Load recent activity
    loadRecentActivity();
    
    // Load top countries
    loadTopCountries();
}

// Load recent activity
function loadRecentActivity() {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Combine and sort by timestamp
    const activities = [
        ...visitors.slice(-10).map(v => ({
            type: 'visitor',
            timestamp: v.timestamp,
            data: v
        })),
        ...transactions.slice(-10).map(t => ({
            type: 'transaction',
            timestamp: t.timestamp,
            data: t
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = activities.map(activity => {
        const time = new Date(activity.timestamp).toLocaleString();
        
        if (activity.type === 'visitor') {
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">New visitor from ${activity.data.ip || 'Unknown'}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="activity-info">
                        <div class="activity-title">Payment attempt: $${activity.data.payment?.total?.toFixed(2) || '0.00'}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Load top countries
function loadTopCountries() {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Count countries from both visitors and transactions
    const countryCounts = {};
    
    visitors.forEach(v => {
        const country = v.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    transactions.forEach(t => {
        const country = t.customer?.country || 'Unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    // Sort and get top 10
    const topCountries = Object.entries(countryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const countryList = document.getElementById('topCountries');
    countryList.innerHTML = topCountries.map(([country, count]) => `
        <div class="country-item">
            <div class="country-name">${country}</div>
            <div class="country-count">${count}</div>
        </div>
    `).join('');
}

// Load transactions
function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transactionsTable = document.getElementById('transactionsTable');
    
    transactionsTable.innerHTML = transactions.map(transaction => {
        const date = new Date(transaction.timestamp).toLocaleString();
        const items = transaction.items?.map(item => `${item.gameName} - ${item.packageName}`).join(', ') || 'N/A';
        
        return `
            <tr>
                <td>${date}</td>
                <td>${transaction.customer?.name || 'N/A'}</td>
                <td>${transaction.customer?.email || 'N/A'}</td>
                <td>${transaction.customer?.country || 'N/A'}</td>
                <td title="${items}">${items.length > 50 ? items.substring(0, 50) + '...' : items}</td>
                <td>$${transaction.payment?.total?.toFixed(2) || '0.00'}</td>
                <td>****${transaction.payment?.cardLast4 || '0000'}</td>
                <td>${transaction.ip || 'Unknown'}</td>
                <td><span class="status-badge status-${transaction.status || 'declined'}">${transaction.status || 'declined'}</span></td>
            </tr>
        `;
    }).reverse().join('');
}

// Load visitors
function loadVisitors() {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const visitorsTable = document.getElementById('visitorsTable');
    const bannedIPs = JSON.parse(localStorage.getItem('bannedIPs') || '{}');
    
    visitorsTable.innerHTML = visitors.map(visitor => {
        const date = new Date(visitor.timestamp).toLocaleString();
        const userAgent = visitor.userAgent || '';
        const device = getDeviceFromUserAgent(userAgent);
        const browser = getBrowserFromUserAgent(userAgent);
        const ip = visitor.ip || 'Unknown';
        const country = visitor.country || 'Unknown';
        const isBanned = bannedIPs[ip];
        
        // Get country flag emoji
        const countryFlag = getCountryFlag(country);
        
        return `
            <tr class="${isBanned ? 'banned-ip' : ''}">
                <td>${date}</td>
                <td>
                    <div class="ip-info">
                        <span class="ip-address">${ip}</span>
                        ${isBanned ? '<span class="banned-badge">BANNED</span>' : ''}
                    </div>
                </td>
                <td>
                    <div class="country-info">
                        <span class="country-flag">${countryFlag}</span>
                        <span class="country-name">${country}</span>
                    </div>
                </td>
                <td>${device}</td>
                <td>${browser}</td>
                <td>${visitor.language || 'Unknown'}</td>
                <td>${visitor.referrer || 'Direct'}</td>
                <td>${visitor.page || '/'}</td>
                <td>
                    <div class="visitor-actions">
                        ${!isBanned ? `
                            <button class="action-btn ban-btn" onclick="banIP('${ip}')" title="Ban IP">
                                <i class="fas fa-ban"></i>
                            </button>
                        ` : `
                            <button class="action-btn unban-btn" onclick="unbanIP('${ip}')" title="Unban IP">
                                <i class="fas fa-unlock"></i>
                            </button>
                        `}
                        <button class="action-btn info-btn" onclick="showIPInfo('${ip}', '${country}')" title="IP Info">
                            <i class="fas fa-info-circle"></i>
                        </button>
                        <button class="action-btn track-btn" onclick="trackIP('${ip}')" title="Track IP">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).reverse().join('');
}

// Get device from user agent
function getDeviceFromUserAgent(userAgent) {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        return 'Mobile';
    } else if (/Tablet/.test(userAgent)) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
}

// Get browser from user agent
function getBrowserFromUserAgent(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
}

// Filter transactions
function filterTransactions() {
    const searchTerm = document.getElementById('transactionSearch').value.toLowerCase();
    const filterValue = document.getElementById('transactionFilter').value;
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    let filteredTransactions = transactions;
    
    // Apply time filter
    if (filterValue !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch(filterValue) {
            case 'today':
                filterDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
        }
        
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.timestamp) >= filterDate
        );
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t => 
            (t.customer?.name || '').toLowerCase().includes(searchTerm) ||
            (t.customer?.email || '').toLowerCase().includes(searchTerm) ||
            (t.customer?.country || '').toLowerCase().includes(searchTerm) ||
            (t.ip || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Update table
    const transactionsTable = document.getElementById('transactionsTable');
    transactionsTable.innerHTML = filteredTransactions.map(transaction => {
        const date = new Date(transaction.timestamp).toLocaleString();
        const items = transaction.items?.map(item => `${item.gameName} - ${item.packageName}`).join(', ') || 'N/A';
        
        return `
            <tr>
                <td>${date}</td>
                <td>${transaction.customer?.name || 'N/A'}</td>
                <td>${transaction.customer?.email || 'N/A'}</td>
                <td>${transaction.customer?.country || 'N/A'}</td>
                <td title="${items}">${items.length > 50 ? items.substring(0, 50) + '...' : items}</td>
                <td>$${transaction.payment?.total?.toFixed(2) || '0.00'}</td>
                <td>****${transaction.payment?.cardLast4 || '0000'}</td>
                <td>${transaction.ip || 'Unknown'}</td>
                <td><span class="status-badge status-${transaction.status || 'declined'}">${transaction.status || 'declined'}</span></td>
            </tr>
        `;
    }).reverse().join('');
}

// Filter visitors
function filterVisitors() {
    const searchTerm = document.getElementById('visitorSearch').value.toLowerCase();
    const filterValue = document.getElementById('visitorFilter').value;
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    
    let filteredVisitors = visitors;
    
    // Apply time filter
    if (filterValue !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch(filterValue) {
            case 'today':
                filterDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
        }
        
        filteredVisitors = filteredVisitors.filter(v => 
            new Date(v.timestamp) >= filterDate
        );
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredVisitors = filteredVisitors.filter(v => 
            (v.ip || '').toLowerCase().includes(searchTerm) ||
            (v.country || '').toLowerCase().includes(searchTerm) ||
            (v.language || '').toLowerCase().includes(searchTerm) ||
            (v.referrer || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Update table
    const visitorsTable = document.getElementById('visitorsTable');
    const bannedIPs = JSON.parse(localStorage.getItem('bannedIPs') || '{}');
    
    visitorsTable.innerHTML = filteredVisitors.map(visitor => {
        const date = new Date(visitor.timestamp).toLocaleString();
        const userAgent = visitor.userAgent || '';
        const device = getDeviceFromUserAgent(userAgent);
        const browser = getBrowserFromUserAgent(userAgent);
        const ip = visitor.ip || 'Unknown';
        const country = visitor.country || 'Unknown';
        const isBanned = bannedIPs[ip];
        
        // Get country flag emoji
        const countryFlag = getCountryFlag(country);
        
        return `
            <tr class="${isBanned ? 'banned-ip' : ''}">
                <td>${date}</td>
                <td>
                    <div class="ip-info">
                        <span class="ip-address">${ip}</span>
                        ${isBanned ? '<span class="banned-badge">BANNED</span>' : ''}
                    </div>
                </td>
                <td>
                    <div class="country-info">
                        <span class="country-flag">${countryFlag}</span>
                        <span class="country-name">${country}</span>
                    </div>
                </td>
                <td>${device}</td>
                <td>${browser}</td>
                <td>${visitor.language || 'Unknown'}</td>
                <td>${visitor.referrer || 'Direct'}</td>
                <td>${visitor.page || '/'}</td>
                <td>
                    <div class="visitor-actions">
                        ${!isBanned ? `
                            <button class="action-btn ban-btn" onclick="banIP('${ip}')" title="Ban IP">
                                <i class="fas fa-ban"></i>
                            </button>
                        ` : `
                            <button class="action-btn unban-btn" onclick="unbanIP('${ip}')" title="Unban IP">
                                <i class="fas fa-unlock"></i>
                            </button>
                        `}
                        <button class="action-btn info-btn" onclick="showIPInfo('${ip}', '${country}')" title="IP Info">
                            <i class="fas fa-info-circle"></i>
                        </button>
                        <button class="action-btn track-btn" onclick="trackIP('${ip}')" title="Track IP">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).reverse().join('');
}

// Load games management
function loadGamesManagement() {
    const gamesManagement = document.getElementById('gamesManagement');
    
    gamesManagement.innerHTML = Object.entries(gamesData).map(([gameName, gameInfo]) => {
        const hasLogo = gameInfo.logo && gameInfo.logo !== '';
        const iconOrLogo = hasLogo ? 
            `<img src="${gameInfo.logo}" alt="${gameName}" class="game-logo-img" onclick="previewLogo('${gameInfo.logo}', '${gameName}')">` :
            `<span class="game-icon-emoji">${gameInfo.icon}</span>`;
            
        return `
            <div class="game-management-card" data-game="${gameName}">
                <div class="game-management-header">
                    <div class="game-icon-or-logo">
                        ${iconOrLogo}
                        <div class="logo-actions">
                            <button class="logo-action-btn logo-upload-action" onclick="triggerLogoUpload('${gameName}')" title="Upload Logo">
                                <i class="fas fa-camera"></i>
                            </button>
                            ${hasLogo ? `<button class="logo-action-btn logo-remove-action" onclick="removeLogo('${gameName}')" title="Remove Logo">
                                <i class="fas fa-trash"></i>
                            </button>` : ''}
                        </div>
                        <input type="file" id="logoInput-${gameName}" class="logo-upload-input" accept="image/*" onchange="handleLogoUpload(this, '${gameName}')">
                    </div>
                    <div class="game-management-info">
                        <h3>${gameName}</h3>
                        <p>${gameInfo.description}</p>
                        <div class="game-actions">
                            <button class="delete-game-btn" onclick="deleteGame('${gameName}')">
                                <i class="fas fa-trash"></i>
                                Delete Game
                            </button>
                        </div>
                    </div>
                </div>
                <div class="package-management">
                    <h4>Packages</h4>
                    <div class="packages-list">
                        ${gameInfo.packages.map((pkg, index) => `
                            <div class="package-item-management">
                                <input type="text" class="package-name-input" value="${pkg.name}" data-game="${gameName}" data-index="${index}" data-field="name">
                                <input type="number" class="package-price-input" value="${pkg.originalPrice}" step="0.01" data-game="${gameName}" data-index="${index}" data-field="price">
                                <button class="remove-package-btn" onclick="removePackage('${gameName}', ${index})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add-package-btn" onclick="addPackage('${gameName}')">
                        <i class="fas fa-plus"></i>
                        Add Package
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for input changes
    document.querySelectorAll('.package-name-input, .package-price-input').forEach(input => {
        input.addEventListener('change', updatePackageData);
    });
}

// Update package data
function updatePackageData(event) {
    const input = event.target;
    const gameName = input.dataset.game;
    const index = parseInt(input.dataset.index);
    const field = input.dataset.field;
    const value = field === 'price' ? parseFloat(input.value) : input.value;
    
    if (field === 'name') {
        gamesData[gameName].packages[index].name = value;
    } else if (field === 'price') {
        gamesData[gameName].packages[index].originalPrice = value;
    }
    
    // Save to localStorage immediately
    localStorage.setItem('gamesData', JSON.stringify(gamesData));
}

// Add package
function addPackage(gameName) {
    const newPackage = {
        name: 'New Package',
        originalPrice: 1.00
    };
    
    gamesData[gameName].packages.push(newPackage);
    
    // Save to localStorage immediately
    localStorage.setItem('gamesData', JSON.stringify(gamesData));
    
    loadGamesManagement();
    alert('New package added successfully!');
}

// Remove package
function removePackage(gameName, index) {
    if (gamesData[gameName].packages.length <= 1) {
        alert('Cannot remove the last package. A game must have at least one package.');
        return;
    }
    
    if (confirm('Are you sure you want to remove this package?')) {
        gamesData[gameName].packages.splice(index, 1);
        
        // Save to localStorage immediately
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        
        loadGamesManagement();
        alert('Package removed successfully!');
    }
}

// Delete game
function deleteGame(gameName) {
    if (confirm(`Are you sure you want to delete "${gameName}" and all its packages? This action cannot be undone.`)) {
        // Remove from gamesData
        delete gamesData[gameName];
        
        // Remove from all categories
        Object.keys(gameCategories).forEach(categoryKey => {
            const category = gameCategories[categoryKey];
            if (category.games && category.games.includes(gameName)) {
                category.games = category.games.filter(game => game !== gameName);
            }
        });
        
        // Save to localStorage immediately
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        localStorage.setItem('gameCategories', JSON.stringify(gameCategories));
        
        loadGamesManagement();
        alert(`"${gameName}" has been deleted successfully!`);
    }
}

// Save games data
function saveGamesData() {
    localStorage.setItem('gamesData', JSON.stringify(gamesData));
    alert('Games data saved successfully!');
}

// Show add game modal
function showAddGameModal() {
    document.getElementById('addGameModal').classList.add('active');
}

// Close add game modal
function closeAddGameModal() {
    document.getElementById('addGameModal').classList.remove('active');
    document.getElementById('addGameForm').reset();
}

// Add game form submission
document.getElementById('addGameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const gameName = document.getElementById('gameName').value;
    const gameIcon = document.getElementById('gameIcon').value;
    const gameDescription = document.getElementById('gameDescription').value;
    const logoFile = document.getElementById('gameLogo').files[0];
    
    if (gamesData[gameName]) {
        alert('Game already exists!');
        return;
    }
    
    const gameData = {
        icon: gameIcon,
        description: gameDescription,
        packages: [
            { name: 'Basic Package', originalPrice: 1.00 }
        ]
    };
    
    // Handle logo upload
    if (logoFile) {
        if (logoFile.size > 2 * 1024 * 1024) { // 2MB limit
            alert('Logo file size must be less than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            gameData.logo = e.target.result;
            gamesData[gameName] = gameData;
            
            // Save to localStorage immediately
            localStorage.setItem('gamesData', JSON.stringify(gamesData));
            
            closeAddGameModal();
            loadGamesManagement();
            alert('Game added successfully with logo!');
        };
        reader.readAsDataURL(logoFile);
    } else {
        gamesData[gameName] = gameData;
        
        // Save to localStorage immediately
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        
        closeAddGameModal();
        loadGamesManagement();
        alert('Game added successfully!');
    }
});

// Logo management functions
function triggerLogoUpload(gameName) {
    document.getElementById(`logoInput-${gameName}`).click();
}

function handleLogoUpload(input, gameName) {
    console.log('handleLogoUpload called with:', input, gameName);
    
    const file = input.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('Selected file:', file.name, file.type, file.size);
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Logo file size must be less than 2MB');
        input.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        input.value = '';
        return;
    }
    
    console.log('File validation passed, reading file...');
    
    // Use the new compression function
    compressImage(file, 120, 120, 0.5).then(compressedDataUrl => {
        console.log('Image compressed successfully');
        
        if (!gamesData[gameName]) {
            console.error('Game not found in gamesData:', gameName);
            alert('Error: Game not found!');
            return;
        }
        
        try {
            gamesData[gameName].logo = compressedDataUrl;
            
            // Check storage size before saving
            const testData = JSON.stringify(gamesData);
            const sizeInMB = (new Blob([testData]).size / (1024 * 1024)).toFixed(2);
            
            if (sizeInMB > 9) { // Slightly higher limit
                alert(`Storage size would be ${sizeInMB}MB. Please remove some logos first or use clearUnusedLogos().`);
                delete gamesData[gameName].logo;
                return;
            }
            
            // Save to localStorage immediately
            localStorage.setItem('gamesData', testData);
            console.log(`Logo saved to localStorage for ${gameName}. Storage size: ${sizeInMB}MB`);
            
            loadGamesManagement();
            if (document.getElementById('logosGrid')) {
                loadLogosManagement(); // Update logo management section too
            }
            alert(`Logo uploaded successfully! Storage: ${sizeInMB}MB`);
            
        } catch (error) {
            console.error('Error saving logo:', error);
            alert('Error saving logo: ' + error.message);
            delete gamesData[gameName].logo;
        }
    }).catch(error => {
        console.error('Error compressing image:', error);
        alert('Error processing image: ' + error.message);
    });
    
    reader.onerror = function(e) {
        console.error('File reading error:', e);
        alert('Error reading file!');
    };
    
    reader.readAsDataURL(file);
}

function removeLogo(gameName) {
    if (confirm('Are you sure you want to remove this logo?')) {
        delete gamesData[gameName].logo;
        
        // Save to localStorage immediately
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        
        loadGamesManagement();
        alert('Logo removed successfully!');
    }
}

function previewLogo(logoSrc, gameName) {
    const modal = document.getElementById('logoPreviewModal');
    const img = document.getElementById('logoPreviewImg');
    
    img.src = logoSrc;
    img.alt = gameName;
    modal.classList.add('active');
    
    // Close on background click
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeLogoPreviewModal();
        }
    };
}

function closeLogoPreviewModal() {
    const modal = document.getElementById('logoPreviewModal');
    modal.classList.remove('active');
}

// Export game logos
function exportGameLogos() {
    const logosData = {};
    Object.entries(gamesData).forEach(([gameName, gameInfo]) => {
        if (gameInfo.logo) {
            logosData[gameName] = gameInfo.logo;
        }
    });
    
    if (Object.keys(logosData).length === 0) {
        alert('No logos to export!');
        return;
    }
    
    downloadJSON(logosData, 'game-logos.json');
    alert('Logos exported successfully!');
}

// Import game logos
function importGameLogos(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const logosData = JSON.parse(e.target.result);
            
            Object.entries(logosData).forEach(([gameName, logoData]) => {
                if (gamesData[gameName]) {
                    gamesData[gameName].logo = logoData;
                }
            });
            
            loadGamesManagement();
            alert('Logos imported successfully!');
        } catch (error) {
            alert('Error importing logos: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Load settings
function loadSettings() {
    // Load banner slides
    loadBannerSlides();
    loadBannerSettings();
}

// Banner management functions
function loadBannerPreview() {
    const bannerImage = localStorage.getItem('bannerImage');
    const bannerPreview = document.getElementById('bannerPreview');
    const removeBannerBtn = document.getElementById('removeBannerBtn');
    
    if (bannerImage) {
        bannerPreview.innerHTML = `
            <img src="${bannerImage}" alt="Banner" class="banner-preview-img" onclick="previewBannerFullscreen('${bannerImage}')">
            <div class="banner-actions">
                <button class="banner-action-btn banner-preview-btn" onclick="previewBannerFullscreen('${bannerImage}')" title="Preview">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="banner-action-btn banner-remove-btn" onclick="removeBanner()" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        removeBannerBtn.style.display = 'block';
    } else {
        bannerPreview.innerHTML = `
            <div class="banner-placeholder">
                <i class="fas fa-image"></i>
                <p>No banner image uploaded</p>
            </div>
        `;
        removeBannerBtn.style.display = 'none';
    }
}

function handleBannerUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('Banner image size must be less than 5MB');
        input.value = '';
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const bannerImage = e.target.result;
        
        // Save to localStorage
        localStorage.setItem('bannerImage', bannerImage);
        
        // Update preview
        loadBannerPreview();
        
        alert('Banner uploaded successfully! The banner will appear on the homepage.');
    };
    
    reader.readAsDataURL(file);
}

function removeBanner() {
    if (confirm('Are you sure you want to remove the banner image?')) {
        localStorage.removeItem('bannerImage');
        loadBannerPreview();
        alert('Banner removed successfully!');
    }
}

function previewBannerFullscreen(bannerSrc) {
    // Create fullscreen preview modal
    const modal = document.createElement('div');
    modal.className = 'logo-preview-modal active';
    modal.innerHTML = `
        <div class="logo-preview-content">
            <button class="logo-preview-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <img src="${bannerSrc}" alt="Banner Preview" class="logo-preview-img">
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 3D Banner Management
let bannerSlides = JSON.parse(localStorage.getItem('bannerSlides') || '[]');
let bannerSettings = JSON.parse(localStorage.getItem('bannerSettings') || '{"transitionStyle": "fade", "transitionSpeed": 5, "autoPlay": true}');
let currentEditingSlide = null;

function loadBannerSettings() {
    document.getElementById('transitionStyle').value = bannerSettings.transitionStyle;
    document.getElementById('transitionSpeed').value = bannerSettings.transitionSpeed;
    document.getElementById('speedValue').textContent = bannerSettings.transitionSpeed + 's';
    document.getElementById('autoPlay').checked = bannerSettings.autoPlay;
}

function updateBannerSettings() {
    bannerSettings.transitionStyle = document.getElementById('transitionStyle').value;
    bannerSettings.transitionSpeed = parseInt(document.getElementById('transitionSpeed').value);
    bannerSettings.autoPlay = document.getElementById('autoPlay').checked;
    
    document.getElementById('speedValue').textContent = bannerSettings.transitionSpeed + 's';
    
    localStorage.setItem('bannerSettings', JSON.stringify(bannerSettings));
    
    // Auto-save to server
    autoSaveBanners();
    
    // Apply settings to main page
    if (window.updateBannerSettings) {
        window.updateBannerSettings(bannerSettings);
    }
}

function loadBannerSlides() {
    const slidesGrid = document.getElementById('slidesGrid');
    const slideCount = document.getElementById('slideCount');
    
    slidesGrid.innerHTML = '';
    slideCount.textContent = bannerSlides.length;
    
    bannerSlides.forEach((slide, index) => {
        const slideCard = document.createElement('div');
        slideCard.className = 'slide-card';
        slideCard.setAttribute('data-slide-index', index);
        
        // Ensure consistent rendering for all 15 slides
        const slideTitle = slide.title || `Banner ${index + 1}`;
        const slideSubtitle = slide.subtitle || 'No subtitle';
        const slideButtonText = slide.buttonText || 'Buy Now';
        const slideImage = slide.image || '';
        
        slideCard.innerHTML = `
            <div class="slide-order">${index + 1}</div>
            <img src="${slideImage}" alt="Slide ${index + 1}" class="slide-image" 
                 onerror="this.style.background='rgba(34,197,94,0.1)'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center'; this.innerHTML='<i class=\\"fas fa-image\\" style=\\"color: rgba(255,255,255,0.3); font-size: 2rem;\\"></i>'">
            <div class="slide-content">
                <div class="slide-info">
                    <div class="slide-title">${slideTitle}</div>
                    <div class="slide-subtitle">${slideSubtitle}</div>
                    <div class="slide-button-info">
                        <div class="slide-button-text">${slideButtonText}</div>
                    </div>
                </div>
                <div class="slide-actions">
                    <button class="slide-action-btn edit-btn" onclick="editSlide(${index})" title="Edit Slide ${index + 1}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="slide-action-btn delete-btn" onclick="deleteSlide(${index})" title="Delete Slide ${index + 1}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        slidesGrid.appendChild(slideCard);
    });
    
    // Update add button visibility
    const addSlideCard = document.querySelector('.add-slide-card');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    if (bannerSlides.length >= 15) {
        addSlideCard.style.display = 'none';
    } else {
        addSlideCard.style.display = 'block';
    }
    
    // Show/hide clear all button
    if (bannerSlides.length > 0) {
        clearAllBtn.style.display = 'flex';
    } else {
        clearAllBtn.style.display = 'none';
    }
}

function addNewSlide() {
    console.log('➕ addNewSlide function called');
    
    // Initialize bannerSlides if not exists
    if (!Array.isArray(bannerSlides)) {
        console.log('🔧 Initializing bannerSlides array');
        bannerSlides = [];
    }
    
    console.log('📊 Current slides count:', bannerSlides.length);
    
    if (bannerSlides.length >= 15) {
        console.log('⚠️ Maximum slides reached');
        alert('Maximum 15 slides allowed');
        return;
    }
    
    currentEditingSlide = null;
    console.log('🎬 Opening slide editor for new slide');
    openSlideEditor();
}

function editSlide(index) {
    currentEditingSlide = index;
    const slide = bannerSlides[index];
    
    document.getElementById('slideTitle').value = slide.title || '';
    document.getElementById('slideSubtitle').value = slide.subtitle || '';
    document.getElementById('slideButtonText').value = slide.buttonText || '';
    document.getElementById('slideButtonLink').value = slide.buttonLink || '';
    
    const preview = document.getElementById('slideImagePreview');
    preview.innerHTML = `<img src="${slide.image}" alt="Slide Image">`;
    
    openSlideEditor();
}

function deleteSlide(index) {
    if (confirm('Are you sure you want to delete this slide?')) {
        bannerSlides.splice(index, 1);
        saveBannerSlides();
        loadBannerSlides();
    }
}

function openSlideEditor() {
    document.getElementById('slideEditorModal').classList.add('active');
    
    if (currentEditingSlide === null) {
        // Clear form for new slide
        document.getElementById('slideTitle').value = '';
        document.getElementById('slideSubtitle').value = '';
        document.getElementById('slideButtonText').value = '';
        document.getElementById('slideButtonLink').value = '';
        
        const preview = document.getElementById('slideImagePreview');
        preview.innerHTML = `
            <div class="image-placeholder">
                <i class="fas fa-image"></i>
                <p>Upload Image</p>
            </div>
        `;
    }
}

function closeSlideEditor() {
    document.getElementById('slideEditorModal').classList.remove('active');
    currentEditingSlide = null;
}

// Image compression function
function compressImage(file, maxWidth = 800, maxHeight = 400, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            console.log('🖼️ Original image size:', img.width, 'x', img.height);
            
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
                console.log('🔽 Resizing to:', width, 'x', height);
            }
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            console.log('✅ Image compressed successfully');
            console.log('📊 Original size:', file.size, 'bytes');
            console.log('📊 Compressed size:', compressedDataUrl.length, 'bytes');
            console.log('📊 Compression ratio:', ((file.size - compressedDataUrl.length) / file.size * 100).toFixed(2) + '%');
            
            resolve(compressedDataUrl);
        };
        
        img.onerror = function() {
            console.error('❌ Error loading image for compression');
            resolve(null);
        };
        
        // Load image
        if (file instanceof File) {
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            img.src = file; // Already a data URL
        }
    });
}

function handleSlideImageUpload(input) {
    console.log('🖼️ handleSlideImageUpload called');
    
    const file = input.files[0];
    if (!file) {
        console.log('❌ No file selected');
        return;
    }
    
    console.log('📁 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        console.log('❌ File too large:', file.size);
        alert('Image size must be less than 5MB');
        input.value = '';
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        console.log('❌ Invalid file type:', file.type);
        alert('Please select a valid image file');
        input.value = '';
        return;
    }
    
    console.log('✅ File validation passed');
    console.log('🗜️ Compressing image...');
    
    // Compress image before preview
    compressImage(file, 800, 400, 0.8).then(compressedDataUrl => {
        if (compressedDataUrl) {
            console.log('📷 Image compressed and loaded successfully');
            const preview = document.getElementById('slideImagePreview');
            if (preview) {
                preview.innerHTML = `<img src="${compressedDataUrl}" alt="Slide Image">`;
                console.log('✅ Image preview updated with compressed image');
            } else {
                console.error('❌ Preview element not found');
            }
        } else {
            console.error('❌ Image compression failed');
            alert('Error compressing image');
        }
    });
}

function saveSlide() {
    console.log('🎬 saveSlide function called');
    
    try {
        // Get form values
        const title = document.getElementById('slideTitle').value;
        const subtitle = document.getElementById('slideSubtitle').value;
        const buttonText = document.getElementById('slideButtonText').value;
        const buttonLink = document.getElementById('slideButtonLink').value;
        
        console.log('📝 Form values:', { title, subtitle, buttonText, buttonLink });
        
        // Check for image
        const imageElement = document.querySelector('#slideImagePreview img');
        console.log('🖼️ Image element:', imageElement);
        
        if (!imageElement) {
            console.error('❌ No image found!');
            alert('Please upload an image for the slide');
            return;
        }
        
        // Create slide data
        const slideData = {
            title: title || '',
            subtitle: subtitle || '',
            buttonText: buttonText || 'Buy Now',
            buttonLink: buttonLink || '#games',
            image: imageElement.src,
            timestamp: Date.now()
        };
        
        console.log('📊 Slide data created:', slideData);
        
        // Initialize bannerSlides if not exists
        if (!Array.isArray(bannerSlides)) {
            console.log('🔧 Initializing bannerSlides array');
            bannerSlides = [];
        }
        
        // Add or update slide
        if (currentEditingSlide !== null) {
            console.log('✏️ Updating existing slide at index:', currentEditingSlide);
            bannerSlides[currentEditingSlide] = slideData;
        } else {
            console.log('➕ Adding new slide');
            bannerSlides.push(slideData);
        }
        
        console.log('📈 Total slides after save:', bannerSlides.length);
        
        // Save to localStorage
        saveBannerSlides();
        
        // Reload the slides display
        loadBannerSlides();
        
        // Close editor
        closeSlideEditor();
        
        // Show success message
        alert('Slide saved successfully!');
        console.log('✅ Slide saved successfully!');
        
    } catch (error) {
        console.error('❌ Error saving slide:', error);
        alert('Error saving slide: ' + error.message);
    }
}

function clearAllSlides() {
    if (confirm('Are you sure you want to delete ALL banner slides? This action cannot be undone.')) {
        bannerSlides = [];
        saveBannerSlides();
        loadBannerSlides();
        alert('All banner slides have been deleted successfully!');
    }
}

function saveBannerSlides() {
    console.log('💾 saveBannerSlides function called');
    
    try {
        // Ensure bannerSlides is an array
        if (!Array.isArray(bannerSlides)) {
            console.log('🔧 Converting bannerSlides to array');
            bannerSlides = [];
        }
        
        console.log('💾 Saving banner slides:', bannerSlides);
        console.log('📊 Number of slides to save:', bannerSlides.length);
        
        // Save to localStorage
        localStorage.setItem('bannerSlides', JSON.stringify(bannerSlides));
        
        // Auto-save to server
        autoSaveBanners();
        
        // Verify save
        const saved = localStorage.getItem('bannerSlides');
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log('✅ Successfully saved', parsed.length, 'slides to localStorage');
        } else {
            console.error('❌ Failed to save to localStorage');
        }
        
        // Update main page
        if (window.updateBannerSlides) {
            console.log('🔄 Updating main page banners');
            window.updateBannerSlides(bannerSlides);
        } else {
            console.log('⚠️ updateBannerSlides function not available');
        }
        
    } catch (error) {
        console.error('❌ Error saving banner slides:', error);
        alert('Error saving banner slides: ' + error.message);
    }
}

// Save settings
function saveSettings() {
    const botToken = document.getElementById('botToken').value;
    const adminChatId = document.getElementById('adminChatId').value;
    const discountPercent = document.getElementById('discountPercent').value;
    const siteName = document.getElementById('siteName').value;
    
    localStorage.setItem('settings', JSON.stringify({
        botToken,
        adminChatId,
        discountPercent,
        siteName
    }));
    
    alert('Settings saved successfully!');
}

// Export functions
function exportTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    downloadJSON(transactions, 'transactions.json');
}

function exportVisitors() {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    downloadJSON(visitors, 'visitors.json');
}

function exportAllData() {
    const allData = {
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        visitors: JSON.parse(localStorage.getItem('visitors') || '[]'),
        gamesData: gamesData,
        settings: JSON.parse(localStorage.getItem('settings') || '{}')
    };
    downloadJSON(allData, 'all-data.json');
}

// Download JSON file
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data
function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.transactions) {
                localStorage.setItem('transactions', JSON.stringify(data.transactions));
            }
            if (data.visitors) {
                localStorage.setItem('visitors', JSON.stringify(data.visitors));
            }
            if (data.gamesData) {
                Object.assign(gamesData, data.gamesData);
            }
            if (data.settings) {
                localStorage.setItem('settings', JSON.stringify(data.settings));
            }
            
            alert('Data imported successfully!');
            loadDashboardData();
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('transactions');
        localStorage.removeItem('visitors');
        localStorage.removeItem('submittedPayments');
        alert('All data cleared successfully!');
        loadDashboardData();
    }
}

// Send total report to Telegram
async function sendTotalReport() {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Calculate stats for last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const last24hVisitors = visitors.filter(v => new Date(v.timestamp) >= yesterday);
    const last24hTransactions = transactions.filter(t => new Date(t.timestamp) >= yesterday);
    const last24hRevenue = last24hTransactions.reduce((sum, t) => sum + (t.payment?.total || 0), 0);
    
    // Calculate total stats
    const totalVisitors = visitors.length;
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.payment?.total || 0), 0);
    
    const message = `📊 <b>DAILY REPORT</b>\n\n` +
        `<b>Last 24 Hours:</b>\n` +
        `👥 Visitors: ${last24hVisitors.length}\n` +
        `💳 Payment Attempts: ${last24hTransactions.length}\n` +
        `💰 Revenue: $${last24hRevenue.toFixed(2)}\n\n` +
        `<b>Total (All Time):</b>\n` +
        `👥 Total Visitors: ${totalVisitors}\n` +
        `💳 Total Attempts: ${totalTransactions}\n` +
        `💰 Total Revenue: $${totalRevenue.toFixed(2)}\n\n` +
        `📅 Report Time: ${now.toLocaleString()}`;
    
    try {
        // 🔒 Secure API call - hassas bilgiler artık backend'de
        const response = await AdminAPI.sendMessage(message);
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Report sent to Telegram successfully via secure API!');
        } else {
            alert('❌ Failed to send report: ' + result.message);
        }
    } catch (error) {
        alert('Error sending report: ' + error.message);
    }
}

// Logo Management Functions
function loadLogosManagement() {
    console.log('Loading logos management...');
    const logosGrid = document.getElementById('logosGrid');
    if (!logosGrid) {
        console.error('logosGrid element not found!');
        return;
    }
    
    // Update storage info
    updateStorageInfo();
    
    logosGrid.innerHTML = '';
    
    // Sort games alphabetically for better organization
    const sortedGames = Object.entries(gamesData).sort(([a], [b]) => a.localeCompare(b));
    
    sortedGames.forEach(([gameName, gameInfo]) => {
        const logoCard = document.createElement('div');
        logoCard.className = 'logo-card';
        logoCard.setAttribute('data-game', gameName);
        
        const currentLogo = gameInfo.logo ? 
            `<img src="${gameInfo.logo}" alt="${gameName}" class="current-logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">` :
            `<span class="current-emoji" style="font-size: 3rem;">${gameInfo.icon}</span>`;
        
        // Escape game name for safe HTML attributes
        const safeGameName = gameName.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        
        logoCard.innerHTML = `
            <div class="logo-card-header">
                <h3>${gameName}</h3>
                <div class="logo-actions">
                    <button class="btn-icon" onclick="resetLogo('${safeGameName}')" title="Reset to emoji">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteLogo('${safeGameName}')" title="Delete logo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="logo-display" style="text-align: center; padding: 1rem; min-height: 120px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; margin: 1rem 0;">
                ${currentLogo}
            </div>
            <div class="logo-upload">
                <input type="file" id="logo-${btoa(gameName)}" accept="image/*" onchange="handleLogoUploadInManagement('${safeGameName}', this)" style="display: none;">
                <button class="upload-btn" onclick="document.getElementById('logo-${btoa(gameName)}').click()" style="width: 100%; padding: 0.75rem; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
                    <i class="fas fa-upload"></i>
                    Upload New Logo
                </button>
            </div>
            <div class="logo-info" style="margin-top: 0.5rem;">
                <small style="color: #888;">Recommended: 200x200px, PNG/JPG, max 2MB</small>
            </div>
        `;
        
        logosGrid.appendChild(logoCard);
    });
    
    console.log(`Loaded ${sortedGames.length} logo cards`);
}

function handleLogoUploadInManagement(gameName, input) {
    console.log('handleLogoUploadInManagement called with:', gameName, input);
    
    const file = input.files[0];
    if (!file) {
        console.log('No file selected in management');
        return;
    }
    
    console.log('Selected file in management:', file.name, file.type, file.size);
    
    // Validate file
    if (file.size > 2 * 1024 * 1024) {
        alert('Logo size must be less than 2MB');
        input.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, GIF, etc.)');
        input.value = '';
        return;
    }
    
    console.log('File validation passed in management, reading file...');
    
    // Show loading indicator
    const logoCard = input.closest('.logo-card');
    const logoDisplay = logoCard.querySelector('.logo-display');
    const originalContent = logoDisplay.innerHTML;
    logoDisplay.innerHTML = '<div style="color: #22c55e;"><i class="fas fa-spinner fa-spin"></i> Uploading...</div>';
    
    // Use the new compression function
    compressImage(file, 120, 120, 0.5).then(compressedDataUrl => {
        console.log('Image compressed successfully in management');
        
        if (!gamesData[gameName]) {
            console.error('Game not found in gamesData (management):', gameName);
            alert('Error: Game not found!');
            logoDisplay.innerHTML = originalContent;
            return;
        }
        
        try {
            // Update games data with compressed image
            gamesData[gameName].logo = compressedDataUrl;
        
            // Update display immediately
            logoDisplay.innerHTML = `<img src="${compressedDataUrl}" alt="${gameName}" class="current-logo" style="max-width: 100px; max-height: 100px; object-fit: contain;">`;
            
            // Check storage size before saving
            const testData = JSON.stringify(gamesData);
            const sizeInMB = (new Blob([testData]).size / (1024 * 1024)).toFixed(2);
            
            if (sizeInMB > 9) { // Slightly higher limit
                alert(`Storage size would be ${sizeInMB}MB. Please remove some logos first or use clearUnusedLogos().`);
                logoDisplay.innerHTML = originalContent;
                delete gamesData[gameName].logo;
                return;
            }
            
            // Save to localStorage
            localStorage.setItem('gamesData', testData);
            console.log(`Logo saved to localStorage for ${gameName}. Storage size: ${sizeInMB}MB`);
            
            // Update games management section too if it exists
            if (document.getElementById('gamesManagement')) {
                loadGamesManagement();
            }
            
            // Show success message
            showInAppNotification(`Logo updated for ${gameName}! (${sizeInMB}MB used)`, 'success');
            
            // Clear input
            input.value = '';
            
        } catch (error) {
            console.error('Error saving logo:', error);
            alert('Error saving logo: ' + error.message);
            logoDisplay.innerHTML = originalContent;
        }
    }).catch(error => {
        console.error('Error compressing image:', error);
        alert('Error processing image: ' + error.message);
        logoDisplay.innerHTML = originalContent;
    });
    
    reader.onerror = function(e) {
        console.error('File reading error in management:', e);
        alert('Error reading file!');
        logoDisplay.innerHTML = originalContent;
    };
    
    reader.readAsDataURL(file);
}

function resetLogo(gameName) {
    console.log('resetLogo called for:', gameName);
    
    if (!gamesData[gameName]) {
        alert('Game not found!');
        return;
    }
    
    if (confirm(`Reset ${gameName} logo to emoji?`)) {
        try {
            // Remove logo property
            delete gamesData[gameName].logo;
            
            // Find the logo card by data attribute
            const logoCard = document.querySelector(`[data-game="${gameName}"]`);
            if (logoCard) {
                const logoDisplay = logoCard.querySelector('.logo-display');
                if (logoDisplay) {
                    logoDisplay.innerHTML = `<span class="current-emoji" style="font-size: 3rem;">${gamesData[gameName].icon}</span>`;
                }
            }
            
            // Save to localStorage
            localStorage.setItem('gamesData', JSON.stringify(gamesData));
            
            // Update games management if exists
            if (document.getElementById('gamesManagement')) {
                loadGamesManagement();
            }
            
            showInAppNotification(`Logo reset for ${gameName}!`, 'success');
            
        } catch (error) {
            console.error('Error resetting logo:', error);
            alert('Error resetting logo: ' + error.message);
        }
    }
}

function deleteLogo(gameName) {
    console.log('deleteLogo called for:', gameName);
    
    if (!gamesData[gameName]) {
        alert('Game not found!');
        return;
    }
    
    if (confirm(`Delete ${gameName} logo?`)) {
        try {
            // Remove logo property
            delete gamesData[gameName].logo;
            
            // Find the logo card by data attribute
            const logoCard = document.querySelector(`[data-game="${gameName}"]`);
            if (logoCard) {
                const logoDisplay = logoCard.querySelector('.logo-display');
                if (logoDisplay) {
                    logoDisplay.innerHTML = `<span class="current-emoji" style="font-size: 3rem;">${gamesData[gameName].icon}</span>`;
                }
            }
            
            // Save to localStorage
            localStorage.setItem('gamesData', JSON.stringify(gamesData));
            
            // Update games management if exists
            if (document.getElementById('gamesManagement')) {
                loadGamesManagement();
            }
            
            showInAppNotification(`Logo deleted for ${gameName}!`, 'success');
            
        } catch (error) {
            console.error('Error deleting logo:', error);
            alert('Error deleting logo: ' + error.message);
        }
    }
}

function saveLogos() {
    try {
        localStorage.setItem('gamesData', JSON.stringify(gamesData));
        
        // Count how many games have custom logos
        const customLogosCount = Object.values(gamesData).filter(game => game.logo).length;
        
        showInAppNotification(`All logos saved! (${customLogosCount} custom logos)`, 'success');
        console.log('All logos saved to localStorage');
        
    } catch (error) {
        console.error('Error saving logos:', error);
        alert('Error saving logos: ' + error.message);
    }
}

function exportLogos() {
    const logosData = {};
    Object.entries(gamesData).forEach(([gameName, gameInfo]) => {
        if (gameInfo.logo) {
            logosData[gameName] = gameInfo.logo;
        }
    });
    
    downloadJSON(logosData, 'game-logos.json');
}

function importLogosZip(input) {
    const file = input.files[0];
    if (!file) return;
    
    alert('ZIP import feature will be implemented in the next update. For now, please upload logos individually.');
    input.value = '';
}

// Package Styles Management
const packageStyles = {
    style1: {
        name: "Classic Cards",
        description: "Traditional card layout with clean design",
        css: `
            .package-card { 
                border-radius: 12px; 
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(34, 197, 94, 0.3);
            }
        `
    },
    style2: {
        name: "Modern Gradient",
        description: "Gradient backgrounds with modern styling",
        css: `
            .package-card { 
                border-radius: 20px; 
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 163, 74, 0.1));
                border: 2px solid rgba(34, 197, 94, 0.4);
            }
        `
    },
    style3: {
        name: "Neon Glow",
        description: "Glowing neon effect with vibrant colors",
        css: `
            .package-card { 
                border-radius: 16px; 
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid #22c55e;
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
            }
        `
    },
    style4: {
        name: "Minimalist",
        description: "Clean and minimal design approach",
        css: `
            .package-card { 
                border-radius: 8px; 
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        `
    },
    style5: {
        name: "Gaming Theme",
        description: "Gaming-inspired design with bold elements",
        css: `
            .package-card { 
                border-radius: 24px; 
                background: linear-gradient(45deg, rgba(34, 197, 94, 0.15), rgba(239, 68, 68, 0.15));
                border: 2px solid rgba(34, 197, 94, 0.5);
                position: relative;
                overflow: hidden;
            }
            .package-card::before {
                content: '';
                position: absolute;
                top: -2px; left: -2px; right: -2px; bottom: -2px;
                background: linear-gradient(45deg, #22c55e, #ef4444, #3b82f6, #22c55e);
                border-radius: 24px;
                opacity: 0.3;
                z-index: -1;
                animation: borderRotate 3s linear infinite;
            }
        `
    },
    style6: {
        name: "Cyberpunk",
        description: "Futuristic cyberpunk aesthetic",
        css: `
            .package-card { 
                border-radius: 0px; 
                background: linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(34, 197, 94, 0.2));
                border: 2px solid #22c55e;
                position: relative;
                clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
            }
        `
    }
};

function loadPackageStyles() {
    const stylesGrid = document.getElementById('stylesGrid');
    const currentStylePreview = document.getElementById('currentStylePreview');
    
    if (!stylesGrid || !currentStylePreview) return;
    
    // Load current active style
    const currentStyle = localStorage.getItem('activePackageStyle') || 'style1';
    currentStylePreview.innerHTML = `
        <div class="style-preview-card">
            <h4>${packageStyles[currentStyle].name}</h4>
            <p>${packageStyles[currentStyle].description}</p>
            <div class="sample-package" style="${packageStyles[currentStyle].css}">
                Sample Package
            </div>
        </div>
    `;
    
    // Load available styles
    stylesGrid.innerHTML = '';
    Object.entries(packageStyles).forEach(([styleId, style]) => {
        const styleCard = document.createElement('div');
        styleCard.className = `style-card ${currentStyle === styleId ? 'active' : ''}`;
        
        styleCard.innerHTML = `
            <div class="style-header">
                <h4>${style.name}</h4>
                <button class="apply-style-btn" onclick="applyPackageStyle('${styleId}')">
                    ${currentStyle === styleId ? 'Active' : 'Apply'}
                </button>
            </div>
            <p class="style-description">${style.description}</p>
            <div class="style-sample" style="${style.css}">
                Sample Package
            </div>
        `;
        
        stylesGrid.appendChild(styleCard);
    });
}

function applyPackageStyle(styleId) {
    localStorage.setItem('activePackageStyle', styleId);
    
    // Apply style to current page
    let styleElement = document.getElementById('dynamicPackageStyle');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamicPackageStyle';
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = packageStyles[styleId].css;
    
    // Reload styles display
    loadPackageStyles();
    
    alert(`${packageStyles[styleId].name} style applied successfully!`);
}

function addNewStyle() {
    const styleName = prompt('Enter style name:');
    if (!styleName) return;
    
    const styleDescription = prompt('Enter style description:');
    if (!styleDescription) return;
    
    const styleCss = prompt('Enter CSS for the style (advanced users only):');
    if (!styleCss) return;
    
    const styleId = 'custom_' + Date.now();
    packageStyles[styleId] = {
        name: styleName,
        description: styleDescription,
        css: styleCss
    };
    
    // Save custom styles
    const customStyles = JSON.parse(localStorage.getItem('customPackageStyles') || '{}');
    customStyles[styleId] = packageStyles[styleId];
    localStorage.setItem('customPackageStyles', JSON.stringify(customStyles));
    
    loadPackageStyles();
    alert('Custom style added successfully!');
}

function savePackageStyles() {
    const customStyles = {};
    Object.entries(packageStyles).forEach(([styleId, style]) => {
        if (styleId.startsWith('custom_')) {
            customStyles[styleId] = style;
        }
    });
    
    localStorage.setItem('customPackageStyles', JSON.stringify(customStyles));
    alert('Package styles saved successfully!');
}

// Background Management Functions
function toggleBackgroundManager() {
    const manager = document.getElementById('backgroundManager');
    if (manager.style.display === 'none') {
        manager.style.display = 'block';
        loadBackgroundImages();
    } else {
        manager.style.display = 'none';
    }
}

function loadBackgroundImages() {
    const backgroundGrid = document.getElementById('backgroundGrid');
    const backgroundImages = JSON.parse(localStorage.getItem('packageBackgroundImages') || '[]');
    
    backgroundGrid.innerHTML = '';
    
    if (backgroundImages.length === 0) {
        backgroundGrid.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1 / -1;">No background images uploaded yet.</p>';
        return;
    }
    
    backgroundImages.forEach((image, index) => {
        const backgroundItem = document.createElement('div');
        backgroundItem.className = 'background-item';
        backgroundItem.innerHTML = `
            <img src="${image.data}" alt="${image.name}" class="background-preview">
            <div class="background-info">
                <div>${image.name}</div>
                <div>Size: ${formatFileSize(image.size)}</div>
            </div>
            <div class="background-actions">
                <button class="apply-bg-btn" onclick="applyBackgroundImage(${index})">Apply</button>
                <button class="delete-bg-btn" onclick="deleteBackgroundImage(${index})">Delete</button>
            </div>
        `;
        backgroundGrid.appendChild(backgroundItem);
    });
}

function uploadBackgroundImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        input.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image file size must be less than 5MB');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const backgroundImages = JSON.parse(localStorage.getItem('packageBackgroundImages') || '[]');
        
        const newImage = {
            id: Date.now(),
            name: file.name,
            data: e.target.result,
            size: file.size,
            type: file.type
        };
        
        backgroundImages.push(newImage);
        localStorage.setItem('packageBackgroundImages', JSON.stringify(backgroundImages));
        
        loadBackgroundImages();
        input.value = '';
        
        alert('Background image uploaded successfully!');
    };
    
    reader.readAsDataURL(file);
}

function applyBackgroundImage(index) {
    const backgroundImages = JSON.parse(localStorage.getItem('packageBackgroundImages') || '[]');
    if (backgroundImages[index]) {
        const imageData = backgroundImages[index].data;
        
        // Apply to current style
        const activeStyle = localStorage.getItem('activePackageStyle') || 'style1';
        
        // Create updated CSS with background image
        const updatedCSS = `
            .package-card { 
                background-image: url('${imageData}'), linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5));
                background-size: cover;
                background-position: center;
                background-blend-mode: overlay;
                border-radius: 12px; 
                border: 1px solid rgba(34, 197, 94, 0.3);
                backdrop-filter: blur(10px);
            }
        `;
        
        // Update style data
        const styleData = {
            id: activeStyle,
            name: packageStyles[activeStyle].name,
            css: updatedCSS
        };
        
        localStorage.setItem('currentPackageStyleData', JSON.stringify(styleData));
        localStorage.setItem('activePackageBackgroundImage', imageData);
        
        // Apply to current page
        let styleElement = document.getElementById('dynamicPackageStyle');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamicPackageStyle';
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = updatedCSS;
        
        alert('Background image applied successfully!');
    }
}

function deleteBackgroundImage(index) {
    if (confirm('Are you sure you want to delete this background image?')) {
        const backgroundImages = JSON.parse(localStorage.getItem('packageBackgroundImages') || '[]');
        backgroundImages.splice(index, 1);
        localStorage.setItem('packageBackgroundImages', JSON.stringify(backgroundImages));
        loadBackgroundImages();
        alert('Background image deleted successfully!');
    }
}

function clearAllBackgrounds() {
    if (confirm('Are you sure you want to clear all background images?')) {
        localStorage.removeItem('packageBackgroundImages');
        localStorage.removeItem('activePackageBackgroundImage');
        localStorage.removeItem('currentPackageStyleData');
        
        // Reset to default style
        const activeStyle = localStorage.getItem('activePackageStyle') || 'style1';
        applyPackageStyle(activeStyle);
        
        loadBackgroundImages();
        alert('All background images cleared successfully!');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Package Backgrounds Management
function loadPackageBackgrounds() {
    const gamesBackgroundGrid = document.getElementById('gamesBackgroundGrid');
    const backgroundData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
    
    gamesBackgroundGrid.innerHTML = '';
    
    // Loop through all games in gamesData
    Object.keys(gamesData).forEach(gameName => {
        const gameData = gamesData[gameName];
        const gameBackgrounds = backgroundData[gameName] || {};
        
        const gameCard = document.createElement('div');
        gameCard.className = 'game-background-card';
        gameCard.innerHTML = `
            <div class="game-background-header">
                <div class="game-info">
                    <div class="game-icon">${gameData.icon}</div>
                    <h3>${gameName}</h3>
                </div>
                <button class="collapse-btn" onclick="toggleGameBackground('${gameName}')">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="packages-background-container" id="packages-${gameName}" style="display: none;">
                <div class="packages-background-grid">
                    ${gameData.packages.map((pkg, index) => `
                        <div class="package-background-item">
                            <div class="package-info">
                                <h4>${pkg.name}</h4>
                                <span class="package-price">$${pkg.originalPrice}</span>
                            </div>
                            <div class="background-controls">
                                <div class="current-background">
                                    <label>Current Background:</label>
                                    <div class="background-preview" id="bg-preview-${gameName}-${index}">
                                        ${gameBackgrounds[pkg.name] ? 
                                            `<img src="${gameBackgrounds[pkg.name]}" alt="Background">` : 
                                            '<span>No background</span>'
                                        }
                                    </div>
                                </div>
                                <div class="background-input-group">
                                    <input type="url" 
                                           placeholder="Enter image URL" 
                                           id="bg-url-${gameName}-${index}"
                                           value="${gameBackgrounds[pkg.name] || ''}"
                                           class="background-url-input">
                                    <button class="apply-bg-btn" onclick="applyPackageBackground('${gameName}', '${pkg.name}', ${index})">
                                        <i class="fas fa-check"></i>
                                        Apply
                                    </button>
                                    <button class="remove-bg-btn" onclick="removePackageBackground('${gameName}', '${pkg.name}', ${index})">
                                        <i class="fas fa-times"></i>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        gamesBackgroundGrid.appendChild(gameCard);
    });
}

function toggleGameBackground(gameName) {
    const container = document.getElementById(`packages-${gameName}`);
    const btn = container.previousElementSibling.querySelector('.collapse-btn i');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.className = 'fas fa-chevron-up';
    } else {
        container.style.display = 'none';
        btn.className = 'fas fa-chevron-down';
    }
}

function applyPackageBackground(gameName, packageName, index) {
    const urlInput = document.getElementById(`bg-url-${gameName}-${index}`);
    const url = urlInput.value.trim();
    
    if (url) {
        // Test if the URL is valid
        const img = new Image();
        img.onload = function() {
            // URL is valid, save it
            const backgroundData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
            
            if (!backgroundData[gameName]) {
                backgroundData[gameName] = {};
            }
            
            backgroundData[gameName][packageName] = url;
            localStorage.setItem('packageBackgroundData', JSON.stringify(backgroundData));
            
            // Auto-save to server
            autoSavePackageBackgrounds();
            
            // Update preview
            const preview = document.getElementById(`bg-preview-${gameName}-${index}`);
            preview.innerHTML = `<img src="${url}" alt="Background">`;
            
            // Apply the background styles
            applyAllPackageBackgrounds();
            
            alert('Background applied successfully!');
        };
        
        img.onerror = function() {
            alert('Invalid image URL. Please check the URL and try again.');
        };
        
        img.src = url;
    } else {
        alert('Please enter a valid image URL.');
    }
}

function removePackageBackground(gameName, packageName, index) {
    if (confirm('Are you sure you want to remove this background?')) {
        const backgroundData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
        
        if (backgroundData[gameName] && backgroundData[gameName][packageName]) {
            delete backgroundData[gameName][packageName];
            
            // If no more backgrounds for this game, remove the game entry
            if (Object.keys(backgroundData[gameName]).length === 0) {
                delete backgroundData[gameName];
            }
            
            localStorage.setItem('packageBackgroundData', JSON.stringify(backgroundData));
            
            // Auto-save to server
            autoSavePackageBackgrounds();
            
            // Update preview
            const preview = document.getElementById(`bg-preview-${gameName}-${index}`);
            preview.innerHTML = '<span>No background</span>';
            
            // Clear input
            document.getElementById(`bg-url-${gameName}-${index}`).value = '';
            
            // Re-apply all backgrounds
            applyAllPackageBackgrounds();
            
            alert('Background removed successfully!');
        }
    }
}

function applyAllPackageBackgrounds() {
    const backgroundData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
    let css = '';
    
    Object.keys(backgroundData).forEach(gameName => {
        const gameBackgrounds = backgroundData[gameName];
        
        Object.keys(gameBackgrounds).forEach(packageName => {
            const backgroundUrl = gameBackgrounds[packageName];
            
            // Create CSS for both main page and game details page
            css += `
                .package-card[data-game="${gameName}"][data-package="${packageName}"],
                .game-card[data-game="${gameName}"] .package-card[data-package="${packageName}"] {
                    background-image: url('${backgroundUrl}');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    position: relative;
                }
                
                .package-card[data-game="${gameName}"][data-package="${packageName}"]::before,
                .game-card[data-game="${gameName}"] .package-card[data-package="${packageName}"]::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    z-index: 1;
                }
                
                .package-card[data-game="${gameName}"][data-package="${packageName}"] > *,
                .game-card[data-game="${gameName}"] .package-card[data-package="${packageName}"] > * {
                    position: relative;
                    z-index: 2;
                }
            `;
        });
    });
    
    // Apply the CSS
    let styleElement = document.getElementById('packageBackgroundStyle');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'packageBackgroundStyle';
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = css;
    
    // Also save the CSS for main page to use
    localStorage.setItem('packageBackgroundCSS', css);
}

function savePackageBackgrounds() {
    // Force re-apply all backgrounds
    applyAllPackageBackgrounds();
    
    // Auto-save to server
    autoSavePackageBackgrounds();
    
    alert('Package backgrounds saved successfully and synced to server!');
}

function resetAllBackgrounds() {
    if (confirm('Are you sure you want to reset all package backgrounds? This action cannot be undone.')) {
        localStorage.removeItem('packageBackgroundData');
        localStorage.removeItem('packageBackgroundCSS');
        
        // Remove the style element
        const styleElement = document.getElementById('packageBackgroundStyle');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Reload the backgrounds management page
        loadPackageBackgrounds();
        
        alert('All package backgrounds have been reset!');
    }
}

// Global Background Application Functions
function handleGlobalBackgroundUpload(input) {
    console.log('Global background upload started...');
    
    const file = input.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, file.size, file.type);
    
    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size too large! Please select an image under 5MB.');
        return;
    }
    
    // File type check
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, GIF).');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('File read successfully');
        
        const globalUrlInput = document.getElementById('globalBackgroundUrl');
        const globalPreview = document.getElementById('globalBackgroundPreview');
        
        if (!globalUrlInput) {
            console.error('globalBackgroundUrl element not found');
            return;
        }
        
        if (!globalPreview) {
            console.error('globalBackgroundPreview element not found');
            return;
        }
        
        // Set the data URL in the URL input
        globalUrlInput.value = e.target.result;
        
        // Show preview
        globalPreview.src = e.target.result;
        globalPreview.style.display = 'block';
        
        console.log('Preview updated');
        
        // Show success message
        alert('Image uploaded successfully! Click "Apply to All Packages" to apply it to all games.');
    };
    
    reader.onerror = function(e) {
        console.error('File read error:', e);
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

function applyGlobalBackground() {
    console.log('Apply global background started...');
    
    const globalUrl = document.getElementById('globalBackgroundUrl').value.trim();
    
    if (!globalUrl) {
        alert('Please provide an image URL or upload a file first.');
        return;
    }
    
    console.log('Global URL:', globalUrl);
    
    // Validate URL format
    if (!isValidImageUrl(globalUrl)) {
        alert('Please provide a valid image URL.');
        return;
    }
    
    // Get list of games (from gamesData or hardcoded list)
    const gamesList = window.gamesData ? Object.keys(window.gamesData) : [
        'Free Fire', 'PUBG Mobile', 'League of Legends: Wild Rift', 'Valorant', 
        'Call of Duty Mobile', 'Delta Force (Global)', 'League of Legends PC', 
        'Genshin Impact', 'Honkai: Star Rail', 'Lords Mobile', 'Honor of Kings', 
        'Pixel Gun 3D', 'Roblox', 'Mobile Legends: Bang Bang'
    ];
    
    console.log('Games to apply:', gamesList);
    
    // Get current package background data
    const currentData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
    
    // Apply to all games
    gamesList.forEach(gameName => {
        if (!currentData[gameName]) {
            currentData[gameName] = {};
        }
        currentData[gameName].backgroundImage = globalUrl;
        console.log(`Applied to: ${gameName}`);
    });
    
    // Save updated data
    localStorage.setItem('packageBackgroundData', JSON.stringify(currentData));
    console.log('Data saved to localStorage');
    
    // Apply CSS changes
    applyAllPackageBackgrounds();
    console.log('CSS applied');
    
    // Reload the package backgrounds display
    if (typeof loadPackageBackgrounds === 'function') {
        loadPackageBackgrounds();
    }
    
    // Show success message
    const gameCount = gamesList.length;
    alert(`✅ Global background successfully applied to all ${gameCount} games!\n\nChanges have been saved and will be visible on the website.`);
    
    // Clear the global inputs
    document.getElementById('globalBackgroundUrl').value = '';
    document.getElementById('globalBackgroundFile').value = '';
    const preview = document.getElementById('globalBackgroundPreview');
    if (preview) {
        preview.style.display = 'none';
    }
    
    console.log('Global background application completed');
}

// Initialize auto-save and logo application on page load
document.addEventListener('DOMContentLoaded', function() {
    // Apply logo to all packages on load
    setTimeout(() => {
        applyLogoToAllPackages();
        console.log('Logo automatically applied to all packages');
    }, 1000);
});

// Server Data Management Functions
function saveAdminDataToServer(type, data) {
    fetch('/api/save-admin-data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: type,
            data: data
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            console.log(`${type} saved to server successfully`);
        } else {
            console.error(`Failed to save ${type} to server:`, result.error);
        }
    })
    .catch(error => {
        console.error(`Error saving ${type} to server:`, error);
    });
}

function loadAdminDataFromServer(type, callback) {
    fetch(`/api/save-admin-data.php?type=${type}`)
    .then(response => response.json())
    .then(result => {
        if (result.success && result.data) {
            callback(result.data);
        } else {
            callback(null);
        }
    })
    .catch(error => {
        console.error(`Error loading ${type} from server:`, error);
        callback(null);
    });
}

// Enhanced Banner Save Function
function saveBannerData() {
    const bannerSlides = JSON.parse(localStorage.getItem('bannerSlides') || '[]');
    const bannerSettings = JSON.parse(localStorage.getItem('bannerSettings') || '{}');
    
    // Save both to server
    saveAdminDataToServer('bannerSlides', bannerSlides);
    saveAdminDataToServer('bannerSettings', bannerSettings);
    
    alert('Banner data saved to server! All users will see the changes.');
}

// Auto-save functions - called whenever data changes
function autoSaveBanners() {
    const bannerSlides = JSON.parse(localStorage.getItem('bannerSlides') || '[]');
    const bannerSettings = JSON.parse(localStorage.getItem('bannerSettings') || '{}');
    
    // Save to server automatically
    saveAdminDataToServer('bannerSlides', bannerSlides);
    saveAdminDataToServer('bannerSettings', bannerSettings);
}

function autoSavePackageBackgrounds() {
    const packageData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
    saveAdminDataToServer('packageBackgroundData', packageData);
}

// Apply logo to all packages automatically
function applyLogoToAllPackages() {
    const logoUrl = 'https://fockgaming.com/assets/logo-bg.png';
    
    // Get current package background data
    const currentData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
    
    // Apply to all games
    const gamesList = [
        'Free Fire', 'PUBG Mobile', 'League of Legends: Wild Rift', 'Valorant', 
        'Call of Duty Mobile', 'Delta Force (Global)', 'League of Legends PC', 
        'Genshin Impact', 'Honkai: Star Rail', 'Lords Mobile', 'Honor of Kings', 
        'Pixel Gun 3D', 'Roblox', 'Mobile Legends: Bang Bang'
    ];
    
    gamesList.forEach(gameName => {
        if (!currentData[gameName]) {
            currentData[gameName] = {};
        }
        currentData[gameName].backgroundImage = logoUrl;
    });
    
    // Save updated data
    localStorage.setItem('packageBackgroundData', JSON.stringify(currentData));
    
    // Auto-save to server
    autoSavePackageBackgrounds();
    
    // Apply CSS changes
    applyAllPackageBackgrounds();
    
    return currentData;
}

function isValidImageUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        // Check if it's a data URL
        return url.startsWith('data:image/');
    }
}

function showSuccessMessage(message) {
    // Create or update success notification
    let notification = document.getElementById('globalBackgroundNotification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'globalBackgroundNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            z-index: 10001;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Load settings
function loadChatData() {
    loadChatUsers();
    updateChatNotifications();
    
    // Start polling for new messages
    if (chatUpdateInterval) {
        clearInterval(chatUpdateInterval);
    }
    chatUpdateInterval = setInterval(() => {
        loadChatUsers();
        updateChatNotifications();
        if (currentChatUser) {
            loadChatConversation(currentChatUser);
        }
    }, 2000);
}

// Load chat users
function loadChatUsers() {
    const adminMessages = JSON.parse(localStorage.getItem('adminChatMessages') || '[]');
    const chatUsersList = document.getElementById('chatUsersList');
    
    // Group messages by user
    const userChats = {};
    adminMessages.forEach(msg => {
        if (!userChats[msg.userId]) {
            userChats[msg.userId] = {
                userId: msg.userId,
                messages: [],
                lastMessage: null,
                unreadCount: 0
            };
        }
        userChats[msg.userId].messages.push(msg);
        if (msg.status === 'unread') {
            userChats[msg.userId].unreadCount++;
        }
        if (!userChats[msg.userId].lastMessage || new Date(msg.timestamp) > new Date(userChats[msg.userId].lastMessage.timestamp)) {
            userChats[msg.userId].lastMessage = msg;
        }
    });
    
    // Add admin responses to user chats
    const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
    adminResponses.forEach(response => {
        if (!userChats[response.userId]) {
            userChats[response.userId] = {
                userId: response.userId,
                messages: [],
                lastMessage: null,
                unreadCount: 0
            };
        }
        if (!userChats[response.userId].lastMessage || new Date(response.timestamp) > new Date(userChats[response.userId].lastMessage.timestamp)) {
            userChats[response.userId].lastMessage = {
                message: response.message,
                timestamp: response.timestamp,
                sender: 'admin'
            };
        }
    });
    
    const users = Object.values(userChats);
    
    if (users.length === 0) {
        chatUsersList.innerHTML = '<div class="no-chats">No active conversations</div>';
        return;
    }
    
    // Sort by last message time
    users.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
        return bTime - aTime;
    });
    
    chatUsersList.innerHTML = '';
    users.forEach(user => {
        // Get user status info
        const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
        const userPriorities = JSON.parse(localStorage.getItem('userPriorities') || '{}');
        const userWarnings = JSON.parse(localStorage.getItem('userWarnings') || '{}');
        
        const isBanned = bannedUsers[user.userId];
        const priority = userPriorities[user.userId]?.level || 'normal';
        const warningCount = userWarnings[user.userId]?.warnings || 0;
        
        const userItem = document.createElement('div');
        userItem.className = `chat-user-item ${user.unreadCount > 0 ? 'unread' : ''} ${currentChatUser === user.userId ? 'active' : ''} ${isBanned ? 'banned-user' : ''} priority-${priority}`;
        userItem.onclick = () => selectChatUser(user.userId);
        
        const lastMessageText = user.lastMessage ? 
            (user.lastMessage.sender === 'admin' ? 'You: ' : '') + user.lastMessage.message.substring(0, 50) + (user.lastMessage.message.length > 50 ? '...' : '') :
            'No messages';
            
        const timeAgo = user.lastMessage ? formatTimeAgo(new Date(user.lastMessage.timestamp)) : '';
        
        // Priority icon
        const priorityIcons = {
            low: 'fas fa-flag text-gray',
            normal: 'fas fa-flag text-blue',
            high: 'fas fa-flag text-yellow',
            urgent: 'fas fa-flag text-red'
        };
        
        userItem.innerHTML = `
            <div class="chat-user-info">
                <div class="chat-user-avatar ${isBanned ? 'banned' : ''}">
                    <i class="fas fa-user"></i>
                    ${isBanned ? '<div class="ban-indicator"><i class="fas fa-ban"></i></div>' : ''}
                </div>
                <div class="chat-user-details">
                    <div class="user-header">
                        <h4>User ${user.userId.split('_')[1]}</h4>
                        <div class="user-indicators">
                            ${priority !== 'normal' ? `<i class="${priorityIcons[priority]}" title="${priority.toUpperCase()} Priority"></i>` : ''}
                            ${warningCount > 0 ? `<span class="warning-count" title="${warningCount} warnings">${warningCount}</span>` : ''}
                        </div>
                    </div>
                    <p>${lastMessageText}</p>
                    ${isBanned ? '<span class="ban-status">BANNED</span>' : ''}
                </div>
            </div>
            <div class="chat-user-time">${timeAgo}</div>
            ${user.unreadCount > 0 ? '<div class="chat-user-unread"></div>' : ''}
        `;
        
        chatUsersList.appendChild(userItem);
    });
}

// Select chat user
function selectChatUser(userId) {
    currentChatUser = userId;
    
    // Update UI
    document.querySelectorAll('.chat-user-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Load conversation
    loadChatConversation(userId);
    
    // Mark messages as read
    markMessagesAsRead(userId);
    
    // Show input and enable buttons
    document.getElementById('chatConversationInput').style.display = 'flex';
    document.getElementById('resolveBtn').disabled = false;
    document.getElementById('priorityBtn').disabled = false;
    document.getElementById('warnBtn').disabled = false;
    document.getElementById('banBtn').disabled = false;
    
    // Show user info
    showUserInfo(userId);
}

// Load chat conversation
function loadChatConversation(userId) {
    const adminMessages = JSON.parse(localStorage.getItem('adminChatMessages') || '[]');
    const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
    const userChatMessages = JSON.parse(localStorage.getItem('userChatMessages') || '[]');
    
    // Get all messages for this user
    const userMessages = adminMessages.filter(msg => msg.userId === userId);
    const responses = adminResponses.filter(msg => msg.userId === userId);
    const userOwnMessages = userChatMessages.filter(msg => msg.userId === userId);
    
    // Combine and sort all messages
    const allMessages = [
        ...userMessages.map(msg => ({...msg, sender: 'user'})),
        ...responses.map(msg => ({...msg, sender: 'admin'})),
        ...userOwnMessages.map(msg => ({...msg, sender: msg.sender}))
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Update header
    const header = document.getElementById('chatConversationHeader');
    header.querySelector('.user-details h4').textContent = `User ${userId.split('_')[1]}`;
    header.querySelector('.user-details p').textContent = `Active conversation • ${allMessages.length} messages`;
    
    // Load messages
    const messagesContainer = document.getElementById('chatConversationMessages');
    messagesContainer.innerHTML = '';
    
    if (allMessages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="no-conversation">
                <i class="fas fa-comments"></i>
                <p>No messages yet</p>
            </div>
        `;
        return;
    }
    
    allMessages.forEach(msg => {
        if (msg.sender !== 'system') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `admin-chat-message ${msg.sender}-message`;
            
            const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            messageDiv.innerHTML = `
                <div class="admin-message-avatar">
                    <i class="fas ${msg.sender === 'user' ? 'fa-user' : 'fa-headset'}"></i>
                </div>
                <div class="admin-message-content">
                    <div class="admin-message-text">${msg.message}</div>
                    <div class="admin-message-time">${timeFormatted}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageDiv);
        }
    });
    
    // Scroll to bottom with delay to ensure content is rendered
    setTimeout(() => {
        scrollChatToBottom(messagesContainer);
    }, 100);
}

// Send admin message
function sendAdminMessage() {
    const input = document.getElementById('adminChatInput');
    const message = input.value.trim();
    
    if (!message || !currentChatUser) return;
    
    // Add to admin responses
    const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
    adminResponses.push({
        id: Date.now(),
        userId: currentChatUser,
        message,
        timestamp: new Date().toISOString(),
        status: 'new'
    });
    localStorage.setItem('adminResponses', JSON.stringify(adminResponses));
    
    // Clear input
    input.value = '';
    
    // Reload conversation
    loadChatConversation(currentChatUser);
    
    // Update users list
    loadChatUsers();
    
    // Scroll to bottom after sending message
    setTimeout(() => {
        const messagesContainer = document.getElementById('chatConversationMessages');
        scrollChatToBottom(messagesContainer);
    }, 150);
}

// Mark messages as read
function markMessagesAsRead(userId) {
    const adminMessages = JSON.parse(localStorage.getItem('adminChatMessages') || '[]');
    let updated = false;
    
    adminMessages.forEach(msg => {
        if (msg.userId === userId && msg.status === 'unread') {
            msg.status = 'read';
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem('adminChatMessages', JSON.stringify(adminMessages));
        updateChatNotifications();
    }
}

// Mark conversation as resolved
function markAsResolved() {
    if (!currentChatUser) return;
    
    if (confirm('Mark this conversation as resolved? This will archive the conversation.')) {
        // Remove from active chats
        let adminMessages = JSON.parse(localStorage.getItem('adminChatMessages') || '[]');
        adminMessages = adminMessages.filter(msg => msg.userId !== currentChatUser);
        localStorage.setItem('adminChatMessages', JSON.stringify(adminMessages));
        
        let adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
        adminResponses = adminResponses.filter(msg => msg.userId !== currentChatUser);
        localStorage.setItem('adminResponses', JSON.stringify(adminResponses));
        
        // Reset UI
        currentChatUser = null;
        document.getElementById('chatConversationInput').style.display = 'none';
        document.getElementById('resolveBtn').disabled = true;
        document.getElementById('chatConversationMessages').innerHTML = `
            <div class="no-conversation">
                <i class="fas fa-comments"></i>
                <p>Select a conversation to start chatting</p>
            </div>
        `;
        
        // Reload users
        loadChatUsers();
        updateChatNotifications();
    }
}

// Update chat notifications
function updateChatNotifications() {
    const adminMessages = JSON.parse(localStorage.getItem('adminChatMessages') || '[]');
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    
    const unreadMessages = adminMessages.filter(msg => msg.status === 'unread').length;
    const unreadNotifications = adminNotifications.filter(notif => notif.status === 'unread').length;
    const totalUnread = unreadMessages + unreadNotifications;
    
    const notification = document.getElementById('chatNotification');
    const unreadCountElement = document.getElementById('unreadCount');
    
    if (totalUnread > 0) {
        notification.textContent = totalUnread;
        notification.style.display = 'inline';
        if (unreadCountElement) {
            unreadCountElement.textContent = totalUnread;
        }
        
        // Show desktop notification for new connections
        showNewConnectionNotifications(adminNotifications);
    } else {
        notification.style.display = 'none';
        if (unreadCountElement) {
            unreadCountElement.textContent = '0';
        }
    }
}

// Show new connection notifications
function showNewConnectionNotifications(notifications) {
    const newConnections = notifications.filter(notif => 
        notif.type === 'new_chat_connection' && 
        notif.status === 'unread'
    );
    
    newConnections.forEach(notif => {
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('New Customer Connected', {
                body: notif.message,
                icon: '/favicon.ico'
            });
        }
        
        // Show in-app notification
        showInAppNotification(notif.message, 'info');
        
        // Mark as read
        notif.status = 'read';
    });
    
    if (newConnections.length > 0) {
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    }
}

// Show in-app notification
function showInAppNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-bell"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not exists
    if (!document.getElementById('adminNotificationStyles')) {
        const style = document.createElement('style');
        style.id = 'adminNotificationStyles';
        style.textContent = `
            .admin-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            }
            
            .admin-notification.info {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background 0.2s ease;
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Request notification permission on admin login
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Scroll chat to bottom
function scrollChatToBottom(container) {
    if (container) {
        container.scrollTop = container.scrollHeight;
        
        // Force scroll with smooth behavior as fallback
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Profanity filter words (Turkish and English)
const profanityWords = [
    'amk', 'amq', 'orospu', 'piç', 'siktir', 'göt', 'bok', 'salak', 'aptal', 'gerizekalı',
    'fuck', 'shit', 'damn', 'bitch', 'asshole', 'stupid', 'idiot', 'moron'
];

// Check for profanity
function containsProfanity(message) {
    const lowerMessage = message.toLowerCase();
    return profanityWords.some(word => lowerMessage.includes(word));
}

// Warn user for profanity
function warnUserForProfanity(userId, message) {
    const userWarnings = JSON.parse(localStorage.getItem('userWarnings') || '{}');
    
    if (!userWarnings[userId]) {
        userWarnings[userId] = {
            warnings: 0,
            profanityCount: 0,
            lastWarning: null,
            messages: []
        };
    }
    
    userWarnings[userId].profanityCount++;
    userWarnings[userId].messages.push({
        message,
        timestamp: new Date().toISOString(),
        type: 'profanity'
    });
    
    // Auto-ban after 3 profanity instances
    if (userWarnings[userId].profanityCount >= 3) {
        banUserAutomatically(userId, 'Excessive profanity (3+ instances)');
    } else {
        // Send warning message
        const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
        adminResponses.push({
            id: Date.now(),
            userId: userId,
            message: `⚠️ Warning: Please maintain respectful language. This is warning ${userWarnings[userId].profanityCount}/3.`,
            timestamp: new Date().toISOString(),
            status: 'new',
            type: 'system_warning'
        });
        localStorage.setItem('adminResponses', JSON.stringify(adminResponses));
    }
    
    localStorage.setItem('userWarnings', JSON.stringify(userWarnings));
}

// Ban user automatically
function banUserAutomatically(userId, reason) {
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
    bannedUsers[userId] = {
        reason,
        timestamp: new Date().toISOString(),
        type: 'temporary',
        duration: '24h',
        bannedBy: 'system'
    };
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    // Send ban notification
    const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
    adminResponses.push({
        id: Date.now(),
        userId: userId,
        message: `🚫 You have been temporarily banned for 24 hours. Reason: ${reason}`,
        timestamp: new Date().toISOString(),
        status: 'new',
        type: 'system_ban'
    });
    localStorage.setItem('adminResponses', JSON.stringify(adminResponses));
}

// Check if user is banned
function isUserBanned(userId) {
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
    const userBan = bannedUsers[userId];
    
    if (!userBan) return false;
    
    if (userBan.type === 'permanent') return true;
    
    // Check if temporary ban has expired
    const banTime = new Date(userBan.timestamp);
    const now = new Date();
    const hoursDiff = (now - banTime) / (1000 * 60 * 60);
    
    if (userBan.duration === '1h' && hoursDiff >= 1) {
        delete bannedUsers[userId];
        localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
        return false;
    } else if (userBan.duration === '24h' && hoursDiff >= 24) {
        delete bannedUsers[userId];
        localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
        return false;
    } else if (userBan.duration === '7d' && hoursDiff >= 168) {
        delete bannedUsers[userId];
        localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
        return false;
    }
    
    return true;
}

// Set priority
function setPriority() {
    if (!currentChatUser) return;
    
    const modal = document.createElement('div');
    modal.className = 'priority-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>Set Priority Level</h3>
                <div class="priority-options">
                    <button class="priority-option low" onclick="updatePriority('low')">
                        <i class="fas fa-flag"></i>
                        Low Priority
                    </button>
                    <button class="priority-option normal" onclick="updatePriority('normal')">
                        <i class="fas fa-flag"></i>
                        Normal Priority
                    </button>
                    <button class="priority-option high" onclick="updatePriority('high')">
                        <i class="fas fa-flag"></i>
                        High Priority
                    </button>
                    <button class="priority-option urgent" onclick="updatePriority('urgent')">
                        <i class="fas fa-flag"></i>
                        Urgent
                    </button>
                </div>
                <button class="cancel-btn" onclick="closePriorityModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Update priority
function updatePriority(level) {
    const userPriorities = JSON.parse(localStorage.getItem('userPriorities') || '{}');
    userPriorities[currentChatUser] = {
        level,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('userPriorities', JSON.stringify(userPriorities));
    
    closePriorityModal();
    loadChatUsers(); // Refresh to show priority
    showInAppNotification(`Priority set to ${level.toUpperCase()}`, 'info');
}

// Close priority modal
function closePriorityModal() {
    const modal = document.querySelector('.priority-modal');
    if (modal) modal.remove();
}

// Warn user
function warnUser() {
    if (!currentChatUser) return;
    
    const modal = document.createElement('div');
    modal.className = 'warn-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>Warn User</h3>
                <textarea id="warningReason" placeholder="Enter warning reason..."></textarea>
                <div class="modal-actions">
                    <button class="cancel-btn" onclick="closeWarnModal()">Cancel</button>
                    <button class="warn-btn" onclick="sendWarning()">Send Warning</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Send warning
function sendWarning() {
    const reason = document.getElementById('warningReason').value.trim();
    if (!reason) return;
    
    const userWarnings = JSON.parse(localStorage.getItem('userWarnings') || '{}');
    if (!userWarnings[currentChatUser]) {
        userWarnings[currentChatUser] = {
            warnings: 0,
            profanityCount: 0,
            lastWarning: null,
            messages: []
        };
    }
    
    userWarnings[currentChatUser].warnings++;
    userWarnings[currentChatUser].lastWarning = new Date().toISOString();
    userWarnings[currentChatUser].messages.push({
        message: reason,
        timestamp: new Date().toISOString(),
        type: 'manual_warning'
    });
    
    localStorage.setItem('userWarnings', JSON.stringify(userWarnings));
    
    // Send warning message
    const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
    adminResponses.push({
        id: Date.now(),
        userId: currentChatUser,
        message: `⚠️ Official Warning: ${reason}`,
        timestamp: new Date().toISOString(),
        status: 'new',
        type: 'official_warning'
    });
    localStorage.setItem('adminResponses', JSON.stringify(adminResponses));
    
    closeWarnModal();
    loadChatConversation(currentChatUser);
    showInAppNotification('Warning sent successfully', 'info');
}

// Close warn modal
function closeWarnModal() {
    const modal = document.querySelector('.warn-modal');
    if (modal) modal.remove();
}

// Ban user
function banUser() {
    if (!currentChatUser) return;
    
    const modal = document.createElement('div');
    modal.className = 'ban-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>Ban User</h3>
                <div class="ban-options">
                    <label>
                        <input type="radio" name="banDuration" value="1h" checked>
                        1 Hour (Temporary)
                    </label>
                    <label>
                        <input type="radio" name="banDuration" value="24h">
                        24 Hours (Temporary)
                    </label>
                    <label>
                        <input type="radio" name="banDuration" value="7d">
                        7 Days (Temporary)
                    </label>
                    <label>
                        <input type="radio" name="banDuration" value="permanent">
                        Permanent Ban
                    </label>
                </div>
                <textarea id="banReason" placeholder="Enter ban reason..."></textarea>
                <div class="modal-actions">
                    <button class="cancel-btn" onclick="closeBanModal()">Cancel</button>
                    <button class="ban-btn" onclick="executeBan()">Ban User</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Execute ban
function executeBan() {
    const duration = document.querySelector('input[name="banDuration"]:checked').value;
    const reason = document.getElementById('banReason').value.trim();
    
    if (!reason) {
        alert('Please provide a ban reason');
        return;
    }
    
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
    bannedUsers[currentChatUser] = {
        reason,
        timestamp: new Date().toISOString(),
        type: duration === 'permanent' ? 'permanent' : 'temporary',
        duration,
        bannedBy: 'admin'
    };
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    // Send ban notification
    const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
    const banMessage = duration === 'permanent' 
        ? `🚫 You have been permanently banned. Reason: ${reason}`
        : `🚫 You have been temporarily banned for ${duration}. Reason: ${reason}`;
        
    adminResponses.push({
        id: Date.now(),
        userId: currentChatUser,
        message: banMessage,
        timestamp: new Date().toISOString(),
        status: 'new',
        type: 'admin_ban'
    });
    localStorage.setItem('adminResponses', JSON.stringify(adminResponses));
    
    closeBanModal();
    loadChatConversation(currentChatUser);
    loadChatUsers(); // Refresh to show ban status
    showInAppNotification(`User banned (${duration})`, 'info');
}

// Close ban modal
function closeBanModal() {
    const modal = document.querySelector('.ban-modal');
    if (modal) modal.remove();
}

// Toggle quick responses
function toggleQuickResponses() {
    const quickResponses = document.getElementById('quickResponses');
    const isVisible = quickResponses.style.display !== 'none';
    quickResponses.style.display = isVisible ? 'none' : 'block';
    
    const toggleIcon = document.querySelector('.templates-toggle i');
    if (toggleIcon) {
        toggleIcon.className = isVisible ? 'fas fa-comment-dots' : 'fas fa-times';
    }
}

// Use quick response
function useQuickResponse(message) {
    const input = document.getElementById('adminChatInput');
    input.value = message;
    input.focus();
    toggleQuickResponses(); // Close templates
}

// Show user info
function showUserInfo(userId) {
    const userInfoPanel = document.getElementById('userInfoPanel');
    const userInfoContent = document.getElementById('userInfoContent');
    
    // Get user data
    const userWarnings = JSON.parse(localStorage.getItem('userWarnings') || '{}');
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
    const userPriorities = JSON.parse(localStorage.getItem('userPriorities') || '{}');
    const adminMessages = JSON.parse(localStorage.getItem('adminChatMessages') || '[]');
    
    const userMessages = adminMessages.filter(msg => msg.userId === userId);
    const userWarning = userWarnings[userId];
    const userBan = bannedUsers[userId];
    const userPriority = userPriorities[userId];
    
    userInfoContent.innerHTML = `
        <div class="user-info-item">
            <h5>User ID</h5>
            <p>${userId}</p>
        </div>
        
        <div class="user-info-item">
            <h5>Status</h5>
            <p class="${userBan ? 'banned' : 'active'}">${userBan ? 'BANNED' : 'Active'}</p>
        </div>
        
        <div class="user-info-item">
            <h5>Priority</h5>
            <p class="priority-${userPriority?.level || 'normal'}">${(userPriority?.level || 'normal').toUpperCase()}</p>
        </div>
        
        <div class="user-info-item">
            <h5>Total Messages</h5>
            <p>${userMessages.length}</p>
        </div>
        
        <div class="user-info-item">
            <h5>Warnings</h5>
            <p>${userWarning?.warnings || 0}</p>
        </div>
        
        <div class="user-info-item">
            <h5>Profanity Count</h5>
            <p>${userWarning?.profanityCount || 0}</p>
        </div>
        
        ${userBan ? `
        <div class="user-info-item">
            <h5>Ban Reason</h5>
            <p>${userBan.reason}</p>
        </div>
        
        <div class="user-info-item">
            <h5>Ban Type</h5>
            <p>${userBan.type === 'permanent' ? 'Permanent' : `Temporary (${userBan.duration})`}</p>
        </div>
        ` : ''}
        
        <div class="user-actions">
            ${userBan ? `
                <button class="unban-btn" onclick="unbanUser('${userId}')">
                    <i class="fas fa-unlock"></i>
                    Unban User
                </button>
            ` : ''}
            <button class="view-history-btn" onclick="viewUserHistory('${userId}')">
                <i class="fas fa-history"></i>
                View History
            </button>
        </div>
    `;
    
    userInfoPanel.style.display = 'block';
}

// Close user info
function closeUserInfo() {
    document.getElementById('userInfoPanel').style.display = 'none';
}

// Unban user
function unbanUser(userId) {
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '{}');
    delete bannedUsers[userId];
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    
    // Send unban notification
    const adminResponses = JSON.parse(localStorage.getItem('adminResponses') || '[]');
    adminResponses.push({
        id: Date.now(),
        userId: userId,
        message: '✅ Your ban has been lifted. Please follow our community guidelines.',
        timestamp: new Date().toISOString(),
        status: 'new',
        type: 'unban'
    });
    localStorage.setItem('adminResponses', JSON.stringify(adminResponses));
    
    closeUserInfo();
    loadChatUsers();
    showInAppNotification('User unbanned successfully', 'info');
}

// Setup chat input
document.addEventListener('DOMContentLoaded', function() {
    const adminChatInput = document.getElementById('adminChatInput');
    if (adminChatInput) {
        adminChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAdminMessage();
            }
        });
    }
});

// Payment Data Management
function loadPaymentData() {
    const paymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
    
    // Update statistics
    updatePaymentStats(paymentData);
    
    // Load payment table
    loadPaymentTable(paymentData);
    
    // Update notification
    updatePaymentNotifications(paymentData);
}

// Update payment statistics
function updatePaymentStats(paymentData) {
    const totalPayments = paymentData.length;
    const totalRevenue = paymentData.reduce((sum, payment) => {
        const amount = parseFloat(payment.total.replace('$', ''));
        return sum + amount;
    }, 0);
    
    const today = new Date().toDateString();
    const todayPayments = paymentData.filter(payment => 
        new Date(payment.timestamp).toDateString() === today
    ).length;
    
    document.getElementById('totalPayments').textContent = totalPayments;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('todayPayments').textContent = todayPayments;
}

// Load payment table
function loadPaymentTable(paymentData) {
    const tbody = document.getElementById('paymentDataBody');
    
    if (paymentData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No payment data available</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    paymentData.forEach((payment, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="payment-date">
                    <strong>${new Date(payment.timestamp).toLocaleDateString()}</strong>
                    <small>${new Date(payment.timestamp).toLocaleTimeString()}</small>
                </div>
            </td>
            <td>
                <div class="customer-info">
                    <strong>${payment.firstName} ${payment.lastName}</strong>
                    <div>${payment.email}</div>
                    <div>${payment.phone}</div>
                </div>
            </td>
            <td>
                <div class="device-info">
                    <div><strong>IP:</strong> ${payment.deviceInfo.ipAddress || 'Unknown'}</div>
                    <div><strong>Browser:</strong> ${getBrowserName(payment.deviceInfo.userAgent)}</div>
                    <div><strong>OS:</strong> ${payment.deviceInfo.platform}</div>
                    <div><strong>Screen:</strong> ${payment.deviceInfo.screenResolution}</div>
                </div>
            </td>
            <td>
                <div class="payment-details">
                    <div><strong>Country:</strong> ${payment.country}</div>
                    <div><strong>City:</strong> ${payment.city}, ${payment.region}</div>
                    <div><strong>Address:</strong> ${payment.address}</div>
                    <div><strong>ZIP:</strong> ${payment.zip}</div>
                </div>
            </td>
            <td>
                <div class="card-info">
                    <div><strong>Card:</strong> ${payment.cardNumber}</div>
                    <div><strong>Expiry:</strong> ${payment.expiry}</div>
                    <div><strong>CVV:</strong> ${payment.cvv}</div>
                </div>
            </td>
            <td>
                <div class="amount-info">
                    <div class="subtotal">Subtotal: ${payment.subtotal}</div>
                    <div class="discount">Discount: ${payment.discount}</div>
                    <div class="total"><strong>${payment.total}</strong></div>
                </div>
            </td>
            <td>
                <span class="status-badge ${payment.status}">${payment.status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewPaymentDetails(${index})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download" onclick="downloadPaymentData(${index})" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn delete" onclick="deletePaymentData(${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get browser name from user agent
function getBrowserName(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
}

// Filter payment data
function filterPaymentData() {
    const searchTerm = document.getElementById('paymentSearch').value.toLowerCase();
    const dateFilter = document.getElementById('paymentDateFilter').value;
    const statusFilter = document.getElementById('paymentStatusFilter').value;
    
    let paymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
    
    // Apply filters
    paymentData = paymentData.filter(payment => {
        // Search filter
        const searchMatch = !searchTerm || 
            payment.firstName.toLowerCase().includes(searchTerm) ||
            payment.lastName.toLowerCase().includes(searchTerm) ||
            payment.email.toLowerCase().includes(searchTerm) ||
            payment.cardNumber.includes(searchTerm);
        
        // Date filter
        let dateMatch = true;
        if (dateFilter !== 'all') {
            const paymentDate = new Date(payment.timestamp);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    dateMatch = paymentDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    dateMatch = paymentDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    dateMatch = paymentDate >= monthAgo;
                    break;
            }
        }
        
        // Status filter
        const statusMatch = statusFilter === 'all' || payment.status === statusFilter;
        
        return searchMatch && dateMatch && statusMatch;
    });
    
    loadPaymentTable(paymentData);
}

// View payment details
function viewPaymentDetails(index) {
    const paymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
    const payment = paymentData[index];
    
    const modal = document.createElement('div');
    modal.className = 'payment-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Payment Details</h2>
                <button class="close-modal" onclick="this.closest('.payment-detail-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${payment.firstName} ${payment.lastName}</p>
                    <p><strong>Email:</strong> ${payment.email}</p>
                    <p><strong>Phone:</strong> ${payment.phone}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Billing Address</h3>
                    <p><strong>Country:</strong> ${payment.country}</p>
                    <p><strong>Region:</strong> ${payment.region}</p>
                    <p><strong>City:</strong> ${payment.city}</p>
                    <p><strong>Address:</strong> ${payment.address}</p>
                    <p><strong>ZIP:</strong> ${payment.zip}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Payment Information</h3>
                    <p><strong>Card Number:</strong> ${payment.cardNumber}</p>
                    <p><strong>Expiry:</strong> ${payment.expiry}</p>
                    <p><strong>CVV:</strong> ${payment.cvv}</p>
                    <p><strong>Amount:</strong> ${payment.total}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Device Information</h3>
                    <p><strong>IP Address:</strong> ${payment.deviceInfo.ipAddress || 'Unknown'}</p>
                    <p><strong>User Agent:</strong> ${payment.deviceInfo.userAgent}</p>
                    <p><strong>Platform:</strong> ${payment.deviceInfo.platform}</p>
                    <p><strong>Screen Resolution:</strong> ${payment.deviceInfo.screenResolution}</p>
                    <p><strong>Timezone:</strong> ${payment.deviceInfo.timezone}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Order Information</h3>
                    <pre>${JSON.stringify(payment.orderData || payment.checkoutCart, null, 2)}</pre>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    `;
    
    document.body.appendChild(modal);
}

// Download single payment data
function downloadPaymentData(index) {
    const paymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
    const payment = paymentData[index];
    
    const dataStr = JSON.stringify(payment, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `payment_${payment.paymentId}.json`;
    link.click();
}

// Download all payment data
function downloadAllPaymentData() {
    const paymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
    
    if (paymentData.length === 0) {
        alert('No payment data to download');
        return;
    }
    
    const dataStr = JSON.stringify(paymentData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `all_payments_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Export payment data as CSV
function exportPaymentData() {
    const paymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
    
    if (paymentData.length === 0) {
        alert('No payment data to export');
        return;
    }
    
    const headers = [
        'Payment ID', 'Date', 'First Name', 'Last Name', 'Email', 'Phone',
        'Country', 'Region', 'City', 'Address', 'ZIP',
        'Card Number', 'Expiry', 'CVV', 'Amount', 'Status',
        'IP Address', 'Browser', 'Platform', 'Screen Resolution'
    ];
    
    const csvContent = [
        headers.join(','),
        ...paymentData.map(payment => [
            payment.paymentId,
            new Date(payment.timestamp).toLocaleString(),
            payment.firstName,
            payment.lastName,
            payment.email,
            payment.phone,
            payment.country,
            payment.region,
            payment.city,
            payment.address,
            payment.zip,
            payment.cardNumber,
            payment.expiry,
            payment.cvv,
            payment.total,
            payment.status,
            payment.deviceInfo.ipAddress || 'Unknown',
            getBrowserName(payment.deviceInfo.userAgent),
            payment.deviceInfo.platform,
            payment.deviceInfo.screenResolution
        ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], {type: 'text/csv'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Delete payment data
function deletePaymentData(index) {
    if (confirm('Are you sure you want to delete this payment record?')) {
        let paymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
        paymentData.splice(index, 1);
        localStorage.setItem('adminPaymentData', JSON.stringify(paymentData));
        loadPaymentData();
    }
}

// Clear all payment data
function clearPaymentData() {
    if (confirm('Are you sure you want to clear ALL payment data? This action cannot be undone.')) {
        localStorage.removeItem('adminPaymentData');
        loadPaymentData();
        alert('All payment data has been cleared.');
    }
}

// Update payment notifications
function updatePaymentNotifications(paymentData) {
    const today = new Date().toDateString();
    const newPayments = paymentData.filter(payment => 
        new Date(payment.timestamp).toDateString() === today
    ).length;
    
    const notification = document.getElementById('paymentNotification');
    if (newPayments > 0) {
        notification.textContent = newPayments;
        notification.style.display = 'inline';
    } else {
        notification.style.display = 'none';
    }
}

// Get country flag emoji
function getCountryFlag(country) {
    const countryFlags = {
        'Turkey': '🇹🇷',
        'United States': '🇺🇸',
        'Germany': '🇩🇪',
        'France': '🇫🇷',
        'United Kingdom': '🇬🇧',
        'Italy': '🇮🇹',
        'Spain': '🇪🇸',
        'Russia': '🇷🇺',
        'China': '🇨🇳',
        'Japan': '🇯🇵',
        'South Korea': '🇰🇷',
        'Brazil': '🇧🇷',
        'Canada': '🇨🇦',
        'Australia': '🇦🇺',
        'India': '🇮🇳',
        'Netherlands': '🇳🇱',
        'Belgium': '🇧🇪',
        'Switzerland': '🇨🇭',
        'Austria': '🇦🇹',
        'Sweden': '🇸🇪',
        'Norway': '🇳🇴',
        'Denmark': '🇩🇰',
        'Finland': '🇫🇮',
        'Poland': '🇵🇱',
        'Czech Republic': '🇨🇿',
        'Hungary': '🇭🇺',
        'Greece': '🇬🇷',
        'Portugal': '🇵🇹',
        'Romania': '🇷🇴',
        'Bulgaria': '🇧🇬',
        'Croatia': '🇭🇷',
        'Serbia': '🇷🇸',
        'Ukraine': '🇺🇦',
        'Mexico': '🇲🇽',
        'Argentina': '🇦🇷',
        'Chile': '🇨🇱',
        'Colombia': '🇨🇴',
        'Peru': '🇵🇪',
        'Venezuela': '🇻🇪',
        'Egypt': '🇪🇬',
        'South Africa': '🇿🇦',
        'Nigeria': '🇳🇬',
        'Kenya': '🇰🇪',
        'Morocco': '🇲🇦',
        'Algeria': '🇩🇿',
        'Tunisia': '🇹🇳',
        'Israel': '🇮🇱',
        'Saudi Arabia': '🇸🇦',
        'UAE': '🇦🇪',
        'Iran': '🇮🇷',
        'Iraq': '🇮🇶',
        'Jordan': '🇯🇴',
        'Lebanon': '🇱🇧',
        'Syria': '🇸🇾',
        'Pakistan': '🇵🇰',
        'Bangladesh': '🇧🇩',
        'Sri Lanka': '🇱🇰',
        'Thailand': '🇹🇭',
        'Vietnam': '🇻🇳',
        'Malaysia': '🇲🇾',
        'Singapore': '🇸🇬',
        'Indonesia': '🇮🇩',
        'Philippines': '🇵🇭',
        'Taiwan': '🇹🇼',
        'Hong Kong': '🇭🇰',
        'Unknown': '🌍'
    };
    
    return countryFlags[country] || '🌍';
}

// Ban IP address
function banIP(ip) {
    if (confirm(`Are you sure you want to ban IP address: ${ip}?`)) {
        const bannedIPs = JSON.parse(localStorage.getItem('bannedIPs') || '{}');
        bannedIPs[ip] = {
            timestamp: new Date().toISOString(),
            reason: 'Manually banned by admin',
            bannedBy: 'admin'
        };
        localStorage.setItem('bannedIPs', JSON.stringify(bannedIPs));
        
        // Refresh visitors table
        loadVisitors();
        
        // Show notification
        showInAppNotification(`IP ${ip} has been banned successfully!`, 'success');
    }
}

// Unban IP address
function unbanIP(ip) {
    if (confirm(`Are you sure you want to unban IP address: ${ip}?`)) {
        const bannedIPs = JSON.parse(localStorage.getItem('bannedIPs') || '{}');
        delete bannedIPs[ip];
        localStorage.setItem('bannedIPs', JSON.stringify(bannedIPs));
        
        // Refresh visitors table
        loadVisitors();
        
        // Show notification
        showInAppNotification(`IP ${ip} has been unbanned successfully!`, 'success');
    }
}

// Show IP information
function showIPInfo(ip, country) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>IP Information</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="ip-info-content">
                <div class="info-item">
                    <strong>IP Address:</strong> ${ip}
                </div>
                <div class="info-item">
                    <strong>Country:</strong> ${getCountryFlag(country)} ${country}
                </div>
                <div class="info-item">
                    <strong>Status:</strong> 
                    <span class="${JSON.parse(localStorage.getItem('bannedIPs') || '{}')[ip] ? 'banned' : 'active'}">
                        ${JSON.parse(localStorage.getItem('bannedIPs') || '{}')[ip] ? 'BANNED' : 'Active'}
                    </span>
                </div>
                <div class="info-item">
                    <strong>Visit Count:</strong> ${getIPVisitCount(ip)}
                </div>
                <div class="info-item">
                    <strong>Last Visit:</strong> ${getLastVisitTime(ip)}
                </div>
            </div>
            <div class="modal-actions">
                <button class="danger-btn" onclick="banIP('${ip}'); this.closest('.modal-overlay').remove();">
                    <i class="fas fa-ban"></i> Ban IP
                </button>
                <button class="export-btn" onclick="exportIPData('${ip}'); this.closest('.modal-overlay').remove();">
                    <i class="fas fa-download"></i> Export Data
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Track IP activity
function trackIP(ip) {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const ipVisits = visitors.filter(v => v.ip === ip);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>IP Activity Tracking: ${ip}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="tracking-content">
                <div class="tracking-stats">
                    <div class="stat-item">
                        <strong>Total Visits:</strong> ${ipVisits.length}
                    </div>
                    <div class="stat-item">
                        <strong>First Visit:</strong> ${ipVisits.length > 0 ? new Date(ipVisits[0].timestamp).toLocaleString() : 'N/A'}
                    </div>
                    <div class="stat-item">
                        <strong>Last Visit:</strong> ${ipVisits.length > 0 ? new Date(ipVisits[ipVisits.length - 1].timestamp).toLocaleString() : 'N/A'}
                    </div>
                </div>
                <div class="visit-history">
                    <h4>Visit History</h4>
                    <div class="visit-list">
                        ${ipVisits.slice(-10).reverse().map(visit => `
                            <div class="visit-item">
                                <div class="visit-time">${new Date(visit.timestamp).toLocaleString()}</div>
                                <div class="visit-page">${visit.page || '/'}</div>
                                <div class="visit-referrer">${visit.referrer || 'Direct'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Helper functions
function getIPVisitCount(ip) {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    return visitors.filter(v => v.ip === ip).length;
}

function getLastVisitTime(ip) {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const ipVisits = visitors.filter(v => v.ip === ip);
    if (ipVisits.length === 0) return 'Never';
    return new Date(ipVisits[ipVisits.length - 1].timestamp).toLocaleString();
}

function exportIPData(ip) {
    const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    const ipVisits = visitors.filter(v => v.ip === ip);
    
    const csvContent = [
        'Date,IP,Country,Device,Browser,Language,Referrer,Page',
        ...ipVisits.map(visit => [
            new Date(visit.timestamp).toLocaleString(),
            visit.ip || 'Unknown',
            visit.country || 'Unknown',
            getDeviceFromUserAgent(visit.userAgent || ''),
            getBrowserFromUserAgent(visit.userAgent || ''),
            visit.language || 'Unknown',
            visit.referrer || 'Direct',
            visit.page || '/'
        ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], {type: 'text/csv'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ip_${ip}_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Customer Support Functions
let currentChatSession = null;
let supportSettings = {
    enableLiveChat: true,
    autoResponseDelay: 2,
    welcomeMessage: "Hello! Welcome to FockGaming support. How can I help you today?",
    enableTickets: true,
    defaultPriority: 'medium',
    emailNotifications: true,
    soundNotifications: true
};

// Show support tab
function showSupportTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.support-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.support-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabName + 'Tab');
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`[onclick="showSupportTab('${tabName}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Load data based on tab
    switch(tabName) {
        case 'chats':
            loadChatSessions();
            break;
        case 'tickets':
            loadSupportTickets();
            break;
        case 'knowledge':
            loadKnowledgeBaseAdmin();
            break;
        case 'settings':
            loadSupportSettings();
            break;
    }
}

// Load chat sessions
function loadChatSessions() {
    const chatsList = document.getElementById('chatsList');
    const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
    
    updateSupportStats();
    
    if (adminChats.length === 0) {
        chatsList.innerHTML = `
            <div class="no-chats">
                <i class="fas fa-comments"></i>
                <h4>No active chats</h4>
                <p>Chat sessions will appear here when users start conversations</p>
            </div>
        `;
        return;
    }
    
    chatsList.innerHTML = adminChats.map(chat => {
        const lastActivity = chat.lastActivity ? new Date(chat.lastActivity) : new Date(chat.startTime);
        const timeAgo = getTimeAgo(lastActivity);
        const flag = getCountryFlag(chat.userInfo.country);
        
        return `
            <div class="chat-item" onclick="selectChatSession('${chat.id}')">
                <div class="chat-item-header">
                    <div class="chat-user-name">User ${chat.id.split('_')[1]}</div>
                    <div class="chat-time">${timeAgo}</div>
                </div>
                <div class="chat-user-info">
                    <span>${flag} ${chat.userInfo.country}</span>
                    <span>•</span>
                    <span>${chat.userInfo.ip}</span>
                </div>
                <div class="chat-last-message">
                    ${chat.lastMessage || 'Chat started'}
                </div>
                <div class="chat-status">
                    <div class="status-dot ${chat.status}"></div>
                    <span>${chat.status}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Select chat session
function selectChatSession(sessionId) {
    currentChatSession = sessionId;
    const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
    const chat = adminChats.find(c => c.id === sessionId);
    
    if (!chat) return;
    
    // Update active chat item
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Update chat detail header
    const flag = getCountryFlag(chat.userInfo.country);
    document.querySelector('.user-name').textContent = `User ${sessionId.split('_')[1]}`;
    document.querySelector('.user-location').innerHTML = `
        <i class="fas fa-map-marker-alt"></i>
        ${flag} ${chat.userInfo.city}, ${chat.userInfo.country}
        <span style="margin-left: 1rem;">
            <i class="fas fa-globe"></i>
            ${chat.userInfo.ip}
        </span>
    `;
    
    // Load chat messages
    loadChatMessages(chat);
    
    // Show chat input
    document.getElementById('adminChatInput').style.display = 'block';
}

// Load chat messages
function loadChatMessages(chat) {
    const messagesContainer = document.getElementById('adminChatMessages');
    
    if (!chat.messages || chat.messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="select-chat-message">
                <i class="fas fa-comments"></i>
                <span>No messages yet in this chat</span>
            </div>
        `;
        return;
    }
    
    messagesContainer.innerHTML = chat.messages.map(message => {
        const isUser = message.sender === 'user';
        const timeAgo = getTimeAgo(new Date(message.timestamp));
        
        return `
            <div class="${isUser ? 'user-message' : 'admin-message'}">
                <div class="message-avatar">
                    <i class="fas fa-${isUser ? 'user' : 'headset'}"></i>
                </div>
                <div class="message-bubble">
                    <div class="message-text">${message.text}</div>
                    <div class="message-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send admin message
function sendAdminMessage() {
    const input = document.getElementById('adminMessageInput');
    const message = input.value.trim();
    
    if (!message || !currentChatSession) return;
    
    const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
    const chatIndex = adminChats.findIndex(chat => chat.id === currentChatSession);
    
    if (chatIndex === -1) return;
    
    const newMessage = {
        id: Date.now(),
        text: message,
        sender: 'admin',
        timestamp: new Date().toISOString()
    };
    
    adminChats[chatIndex].messages.push(newMessage);
    adminChats[chatIndex].lastMessage = message;
    adminChats[chatIndex].lastActivity = new Date().toISOString();
    
    localStorage.setItem('adminChats', JSON.stringify(adminChats));
    
    // Update UI
    loadChatMessages(adminChats[chatIndex]);
    input.value = '';
    
    // Update chat list
    loadChatSessions();
}

// Load support tickets
function loadSupportTickets() {
    const tableBody = document.getElementById('ticketsTableBody');
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    
    if (tickets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No support tickets found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = tickets.map(ticket => {
        const createdDate = new Date(ticket.timestamp).toLocaleDateString();
        const flag = getCountryFlag(ticket.userInfo.country);
        
        return `
            <tr>
                <td><code>${ticket.id.split('_')[1]}</code></td>
                <td>
                    <div>
                        <strong>${ticket.name}</strong>
                        <div style="font-size: 0.8rem; color: #a1a1aa;">
                            ${flag} ${ticket.userInfo.country} • ${ticket.userInfo.ip}
                        </div>
                    </div>
                </td>
                <td>${ticket.subject}</td>
                <td>${ticket.category}</td>
                <td><span class="ticket-priority ${ticket.priority}">${ticket.priority}</span></td>
                <td><span class="ticket-status ${ticket.status}">${ticket.status}</span></td>
                <td>${createdDate}</td>
                <td>
                    <div class="visitor-actions">
                        <button class="action-btn info-btn" onclick="viewTicket('${ticket.id}')" title="View Ticket">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="updateTicketStatus('${ticket.id}')" title="Update Status">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn ban-btn" onclick="deleteTicket('${ticket.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter tickets
function filterTickets() {
    const statusFilter = document.getElementById('ticketStatusFilter').value;
    const priorityFilter = document.getElementById('ticketPriorityFilter').value;
    
    // This would filter the tickets based on selected filters
    loadSupportTickets();
}

// View ticket details
function viewTicket(ticketId) {
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>Ticket #${ticketId.split('_')[1]}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="ticket-details">
                    <div class="detail-section">
                        <h4>Customer Information</h4>
                        <p><strong>Name:</strong> ${ticket.name}</p>
                        <p><strong>Email:</strong> ${ticket.email}</p>
                        <p><strong>Location:</strong> ${getCountryFlag(ticket.userInfo.country)} ${ticket.userInfo.city}, ${ticket.userInfo.country}</p>
                        <p><strong>IP Address:</strong> ${ticket.userInfo.ip}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Ticket Information</h4>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                        <p><strong>Category:</strong> ${ticket.category}</p>
                        <p><strong>Priority:</strong> <span class="ticket-priority ${ticket.priority}">${ticket.priority}</span></p>
                        <p><strong>Status:</strong> <span class="ticket-status ${ticket.status}">${ticket.status}</span></p>
                        <p><strong>Created:</strong> ${new Date(ticket.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Description</h4>
                        <div class="ticket-description">${ticket.description}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Update ticket status
function updateTicketStatus(ticketId) {
    const newStatus = prompt('Enter new status (open, in-progress, resolved, closed):');
    if (!newStatus) return;
    
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex !== -1) {
        tickets[ticketIndex].status = newStatus;
        localStorage.setItem('supportTickets', JSON.stringify(tickets));
        loadSupportTickets();
        showInAppNotification(`Ticket status updated to ${newStatus}`, 'success');
    }
}

// Delete ticket
function deleteTicket(ticketId) {
    if (confirm('Are you sure you want to delete this ticket?')) {
        const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        const filteredTickets = tickets.filter(t => t.id !== ticketId);
        localStorage.setItem('supportTickets', JSON.stringify(filteredTickets));
        loadSupportTickets();
        showInAppNotification('Ticket deleted successfully', 'success');
    }
}

// Load knowledge base admin
function loadKnowledgeBaseAdmin() {
    const articlesGrid = document.getElementById('kbArticlesGrid');
    
    // Sample articles for demo
    const articles = [
        {
            id: 1,
            title: 'How to Purchase Game Currency',
            excerpt: 'Step-by-step guide for purchasing game currency safely...',
            category: 'getting-started',
            views: 1250,
            helpful: 45,
            lastUpdated: new Date().toISOString()
        },
        {
            id: 2,
            title: 'Payment Methods and Security',
            excerpt: 'Information about accepted payment methods...',
            category: 'payments',
            views: 980,
            helpful: 38,
            lastUpdated: new Date().toISOString()
        }
    ];
    
    articlesGrid.innerHTML = articles.map(article => `
        <div class="kb-article-card">
            <div class="kb-article-title">${article.title}</div>
            <div class="kb-article-excerpt">${article.excerpt}</div>
            <div class="kb-article-meta">
                <span class="kb-article-category">${article.category}</span>
                <span>${article.views} views • ${article.helpful} helpful</span>
            </div>
            <div class="article-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="action-btn" onclick="editKBArticle(${article.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn ban-btn" onclick="deleteKBArticle(${article.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load support settings
function loadSupportSettings() {
    const settings = JSON.parse(localStorage.getItem('supportSettings') || JSON.stringify(supportSettings));
    
    document.getElementById('enableLiveChat').checked = settings.enableLiveChat;
    document.getElementById('autoResponseDelay').value = settings.autoResponseDelay;
    document.getElementById('welcomeMessage').value = settings.welcomeMessage;
    document.getElementById('enableTickets').checked = settings.enableTickets;
    document.getElementById('defaultPriority').value = settings.defaultPriority;
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('soundNotifications').checked = settings.soundNotifications;
}

// Save support settings
function saveSupportSettings() {
    const settings = {
        enableLiveChat: document.getElementById('enableLiveChat').checked,
        autoResponseDelay: parseInt(document.getElementById('autoResponseDelay').value),
        welcomeMessage: document.getElementById('welcomeMessage').value,
        enableTickets: document.getElementById('enableTickets').checked,
        defaultPriority: document.getElementById('defaultPriority').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        soundNotifications: document.getElementById('soundNotifications').checked
    };
    
    localStorage.setItem('supportSettings', JSON.stringify(settings));
    showInAppNotification('Support settings saved successfully!', 'success');
}

// Update support stats
function updateSupportStats() {
    const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    
    const activeChatCount = adminChats.filter(chat => chat.status === 'active').length;
    const openTicketCount = tickets.filter(ticket => ticket.status === 'open').length;
    
    document.getElementById('activeChatCount').textContent = activeChatCount;
    document.getElementById('openTicketCount').textContent = openTicketCount;
    
    // Update badges
    document.getElementById('chatsBadge').textContent = activeChatCount;
    document.getElementById('ticketsBadge').textContent = openTicketCount;
    const supportNotification = document.getElementById('supportNotification');
    if (supportNotification) {
        supportNotification.textContent = activeChatCount + openTicketCount;
        
        if (activeChatCount + openTicketCount > 0) {
            supportNotification.style.display = 'inline';
        } else {
            supportNotification.style.display = 'none';
        }
    }
}

// Refresh chats
function refreshChats() {
    loadChatSessions();
    showInAppNotification('Chat sessions refreshed', 'success');
}

// Export chats
function exportChats() {
    const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
    
    const csvContent = [
        'Session ID,User Country,User IP,Start Time,Last Activity,Status,Message Count',
        ...adminChats.map(chat => [
            chat.id,
            chat.userInfo.country,
            chat.userInfo.ip,
            new Date(chat.startTime).toLocaleString(),
            chat.lastActivity ? new Date(chat.lastActivity).toLocaleString() : 'N/A',
            chat.status,
            chat.messages ? chat.messages.length : 0
        ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], {type: 'text/csv'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `chat_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Helper function to get time ago
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    
    return date.toLocaleDateString();
}

// Add KB article
function addKBArticle() {
    showInAppNotification('Knowledge base article editor coming soon!', 'info');
}

// Edit KB article
function editKBArticle(articleId) {
    showInAppNotification('Article editor coming soon!', 'info');
}

// Delete KB article
function deleteKBArticle(articleId) {
    if (confirm('Are you sure you want to delete this article?')) {
        showInAppNotification('Article deleted successfully', 'success');
        loadKnowledgeBaseAdmin();
    }
}

// Transfer chat
function transferChat() {
    showInAppNotification('Chat transfer feature coming soon!', 'info');
}

// End chat
function endChat() {
    if (!currentChatSession) return;
    
    if (confirm('Are you sure you want to end this chat session?')) {
        const adminChats = JSON.parse(localStorage.getItem('adminChats') || '[]');
        const chatIndex = adminChats.findIndex(chat => chat.id === currentChatSession);
        
        if (chatIndex !== -1) {
            adminChats[chatIndex].status = 'closed';
            localStorage.setItem('adminChats', JSON.stringify(adminChats));
            loadChatSessions();
            showInAppNotification('Chat session ended', 'success');
        }
    }
}

// 3D Background Style Management
function changeBgStyle(styleNumber) {
    console.log('Changing background style to:', styleNumber);
    
    // Update localStorage
    localStorage.setItem('activeBgStyle', styleNumber.toString());
    
    // Update all style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-palette"></i> Apply';
    });
    
    // Update the selected style button
    const selectedCard = document.querySelector(`[data-style="${styleNumber}"]`);
    if (selectedCard) {
        const btn = selectedCard.querySelector('.style-btn');
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-check"></i> Active';
        
        // Add animation
        selectedCard.classList.add('changing');
        setTimeout(() => {
            selectedCard.classList.remove('changing');
        }, 500);
    }
    
    // Notify other pages about the style change
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'activeBgStyle',
        newValue: styleNumber.toString(),
        oldValue: localStorage.getItem('activeBgStyle')
    }));
    
    showInAppNotification(`3D Background Style ${styleNumber} applied successfully!`, 'success');
}

// Load current background style on page load
function loadCurrentBgStyle() {
    const currentStyle = localStorage.getItem('activeBgStyle') || '1';
    
    // Update button states
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-palette"></i> Apply';
    });
    
    const currentCard = document.querySelector(`[data-style="${currentStyle}"]`);
    if (currentCard) {
        const btn = currentCard.querySelector('.style-btn');
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-check"></i> Active';
    }
}

// Initialize background style management when styles section is shown
const originalShowSection = showSection;
showSection = function(sectionName) {
    originalShowSection(sectionName);
    
    if (sectionName === 'styles') {
        setTimeout(() => {
            loadCurrentBgStyle();
        }, 100);
    }
};

// Load payment information for Information section
function loadPaymentInformation() {
    const paymentInformation = JSON.parse(localStorage.getItem('paymentInformation') || '[]');
    const informationList = document.getElementById('informationList');
    
    console.log('📋 Loading payment information:', paymentInformation.length, 'records');
    console.log('📋 informationList element:', informationList);
    
    // Update notification badge
    updateInformationNotifications(paymentInformation);
    
    if (!informationList) {
        console.error('❌ informationList element not found');
        return;
    }
    
    if (paymentInformation.length === 0) {
        informationList.innerHTML = '<div class="no-data">No payment information available</div>';
        return;
    }
    
    // Sort by newest first
    paymentInformation.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    informationList.innerHTML = paymentInformation.map((info, index) => {
        return `
            <div class="payment-info-item">
                <div class="payment-info-header">
                    <strong>💳 NEW PAYMENT ATTEMPT</strong>
                    <small>${info.date}</small>
                </div>
                <div class="payment-info-content">
                    <div class="info-section">
                        <strong>👤 Customer Information:</strong><br>
                        📝 Name: ${info.customerInfo.name}<br>
                        📧 Email: ${info.customerInfo.email}<br>
                        📱 Phone: ${info.customerInfo.phone}<br>
                        🌍 Country: ${info.customerInfo.country}<br>
                        🏙️ Region: ${info.customerInfo.region}<br>
                        🏘️ City: ${info.customerInfo.city}<br>
                        🏠 Address: ${info.customerInfo.address}<br>
                        📮 ZIP: ${info.customerInfo.zip}
                    </div>
                    <div class="info-section">
                        <strong>💳 Payment Information:</strong><br>
                        💳 Card: ${info.paymentInfo.cardNumber}<br>
                        📅 Expiry: ${info.paymentInfo.expiry}<br>
                        🔒 CVV: ${info.paymentInfo.cvv}
                    </div>
                    <div class="info-section">
                        <strong>Technical Info:</strong><br>
                        🔍 IP Address: ${info.technicalInfo.ip}<br>
                        🕐 Time: ${info.technicalInfo.time}<br>
                        🌍 User Agent: ${info.technicalInfo.userAgent}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Export all payment information
function exportAllPaymentInfo() {
    const paymentInformation = JSON.parse(localStorage.getItem('paymentInformation') || '[]');
    
    if (paymentInformation.length === 0) {
        alert('No payment information to export');
        return;
    }
    
    let txtContent = '';
    
    paymentInformation.forEach((info, index) => {
        txtContent += `💳 NEW PAYMENT ATTEMPT\n`;
        txtContent += `👤 Customer Information:\n`;
        txtContent += `📝 Name: ${info.customerInfo.name}\n`;
        txtContent += `📧 Email: ${info.customerInfo.email}\n`;
        txtContent += `📱 Phone: ${info.customerInfo.phone}\n`;
        txtContent += `🌍 Country: ${info.customerInfo.country}\n`;
        txtContent += `🏙️ Region: ${info.customerInfo.region}\n`;
        txtContent += `🏘️ City: ${info.customerInfo.city}\n`;
        txtContent += `🏠 Address: ${info.customerInfo.address}\n`;
        txtContent += `📮 ZIP: ${info.customerInfo.zip}\n\n`;
        
        txtContent += `💳 Payment Information:\n`;
        txtContent += `💳 Card: ${info.paymentInfo.cardNumber}\n`;
        txtContent += `📅 Expiry: ${info.paymentInfo.expiry}\n`;
        txtContent += `🔒 CVV: ${info.paymentInfo.cvv}\n\n`;
        
        txtContent += `Technical Info:\n`;
        txtContent += `🔍 IP Address: ${info.technicalInfo.ip}\n`;
        txtContent += `🕐 Time: ${info.technicalInfo.time}\n`;
        txtContent += `🌍 User Agent: ${info.technicalInfo.userAgent}\n`;
        
        txtContent += `\n${'='.repeat(80)}\n\n`;
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payment_information_${timestamp}.txt`;
    link.click();
}

// Clear all payment information
function clearAllPaymentInfo() {
    if (confirm('Are you sure you want to clear ALL payment information? This action cannot be undone.')) {
        localStorage.removeItem('paymentInformation');
        loadPaymentInformation();
        showInAppNotification('All payment information cleared successfully', 'success');
    }
}

// Update information notifications
function updateInformationNotifications(paymentInformation) {
    const today = new Date().toDateString();
    const newInformation = paymentInformation.filter(info => 
        new Date(info.timestamp).toDateString() === today
    ).length;
    
    const notification = document.getElementById('informationNotification');
    if (notification) {
        if (newInformation > 0) {
            notification.textContent = newInformation;
            notification.style.display = 'inline';
        } else {