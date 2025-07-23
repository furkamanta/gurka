// 🔒 SECURE PAYMENT SYSTEM - Bot bilgileri gizli
// Bu dosya server'a yüklenecek ve sadece server'da çalışacak

// CLIENT SIDE - payment.js (güvenli versiyon)
let checkoutCart = [];
let userIP = 'Unknown';

// ❌ BOT BİLGİLERİ ARTIK BURADA YOK!
// ✅ Sadece server endpoint'i var
const SERVER_ENDPOINT = '/api/payment'; // Server'daki PHP/Node.js endpoint

// IP detection (güvenli)
fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        userIP = data.ip;
        console.log('🌐 IP detected');
    })
    .catch(() => {
        console.log('⚠️ IP detection failed');
    });

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
    // Payment form initialization
    initializePaymentForm();
    loadCartFromURL();
    updateCartDisplay();
});

function initializePaymentForm() {
    const form = document.getElementById('paymentForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🔄 Processing payment...');
        processPayment();
    });
}

// SECURE PAYMENT PROCESSING
async function processPayment() {
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;

    // ✅ Client-side validation
    if (!validateForm()) {
        return;
    }

    // ✅ Duplicate check (client-side)
    if (checkDuplicate(customerEmail, cardNumber)) {
        showError('⚠️ This payment has already been processed!');
        return;
    }

    // 🔒 SECURE SERVER REQUEST
    const paymentData = {
        customer: {
            name: customerName,
            email: customerEmail
        },
        card: {
            // ✅ Sadece güvenli bilgiler gönderiliyor
            last4: cardNumber.slice(-4),
            expiry: cardExpiry
        },
        cart: checkoutCart,
        userIP: userIP,
        timestamp: Date.now(),
        hash: generatePaymentHash(customerEmail, cardNumber)
    };

    try {
        showLoading(true);
        
        // 🚀 Server'a güvenli istek
        const response = await fetch(SERVER_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ✅ CSRF protection
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();
        
        if (result.success) {
            // ✅ Payment successful
            saveDuplicateRecord(customerEmail, cardNumber);
            showSuccess('✅ Payment processed successfully!');
            setTimeout(() => {
                window.location.href = 'success.html';
            }, 2000);
        } else {
            showError('❌ ' + result.message);
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showError('❌ Connection error. Please try again.');
    } finally {
        showLoading(false);
    }
}

// 🔒 CLIENT-SIDE GÜVENLİK FONKSİYONLARI

function validateForm() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const card = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('cardExpiry').value.trim();
    const cvv = document.getElementById('cardCvv').value.trim();

    if (name.length < 2) {
        showError('⚠️ Please enter a valid name');
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('⚠️ Please enter a valid email');
        return false;
    }

    if (!/^\d{13,19}$/.test(card)) {
        showError('⚠️ Please enter a valid card number');
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        showError('⚠️ Please enter a valid expiry date (MM/YY)');
        return false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        showError('⚠️ Please enter a valid CVV');
        return false;
    }

    return true;
}

function checkDuplicate(email, card) {
    const hash = generatePaymentHash(email, card);
    const stored = JSON.parse(localStorage.getItem('submittedPayments') || '[]');
    return stored.some(item => item.hash === hash);
}

function saveDuplicateRecord(email, card) {
    const hash = generatePaymentHash(email, card);
    const stored = JSON.parse(localStorage.getItem('submittedPayments') || '[]');
    stored.push({
        hash: hash,
        timestamp: Date.now()
    });
    // Keep only last 1000 records
    if (stored.length > 1000) {
        stored.splice(0, stored.length - 1000);
    }
    localStorage.setItem('submittedPayments', JSON.stringify(stored));
}

function generatePaymentHash(email, card) {
    // ✅ Simple client-side hash (not cryptographic)
    return btoa(email + card.slice(-4)).substr(0, 10);
}

// UI HELPER FUNCTIONS
function showError(message) {
    // Show error message to user
    alert(message); // Replace with better UI
}

function showSuccess(message) {
    // Show success message to user
    alert(message); // Replace with better UI
}

function showLoading(show) {
    const button = document.querySelector('#paymentForm button[type="submit"]');
    if (button) {
        if (show) {
            button.textContent = '🔄 Processing...';
            button.disabled = true;
        } else {
            button.textContent = '💳 Complete Payment';
            button.disabled = false;
        }
    }
}

// CART FUNCTIONS (existing code...)
function loadCartFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const cartData = urlParams.get('cart');
    
    if (cartData) {
        try {
            checkoutCart = JSON.parse(decodeURIComponent(cartData));
        } catch (error) {
            console.error('Invalid cart data:', error);
            checkoutCart = [];
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (checkoutCart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">No items in cart</div>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    let itemsHTML = '';
    
    checkoutCart.forEach(item => {
        total += parseFloat(item.price);
        itemsHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price}</p>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = itemsHTML;
    cartTotal.textContent = total.toFixed(2);
}