// Game details page functionality
let selectedPackage = null;
let currentGame = null;

// Initialize game details page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    if (savedLanguage !== 'en') {
        changeLanguage(savedLanguage);
    }
    
    // Load updated gamesData from localStorage if available
    const storedGamesData = localStorage.getItem('gamesData');
    if (storedGamesData) {
        try {
            const parsedData = JSON.parse(storedGamesData);
            // Merge stored data with original gamesData to get any updates like logos
            Object.keys(parsedData).forEach(gameName => {
                if (gamesData[gameName]) {
                    // Keep original structure but update logo if available
                    gamesData[gameName] = { ...gamesData[gameName], ...parsedData[gameName] };
                }
            });
            console.log('Game details: Loaded updated gamesData from localStorage');
        } catch (e) {
            console.error('Game details: Error parsing stored gamesData:', e);
        }
    }

    // Get game name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gameName = urlParams.get('game');
    
    if (gameName && gamesData[gameName]) {
        currentGame = gameName;
        loadGameDetails(gameName);
        
        // Load package styles
        loadActivePackageStyle();
        
        // Load package backgrounds
        loadPackageBackgrounds();
        
        // Update cart badge on page load
        updateCartBadge();
    } else {
        // Redirect to main page if no valid game
        window.location.href = 'index.html';
    }
    
    // Listen for localStorage changes (when admin updates logos)
    window.addEventListener('storage', function(e) {
        if (e.key === 'gamesData' && e.newValue && currentGame) {
            try {
                const updatedData = JSON.parse(e.newValue);
                if (updatedData[currentGame]) {
                    gamesData[currentGame] = { ...gamesData[currentGame], ...updatedData[currentGame] };
                    loadGameDetails(currentGame); // Reload the current game details
                    console.log('Game details updated from localStorage');
                }
            } catch (e) {
                console.error('Error parsing updated gamesData in game details:', e);
            }
        }
        
        // Listen for package style changes
        if (e.key === 'activePackageStyle' && e.newValue) {
            loadActivePackageStyle();
            console.log('Package style updated in game details');
        }
        
        if (e.key === 'currentPackageStyleData' && e.newValue) {
            loadActivePackageStyle();
            console.log('Package style data updated in game details');
        }
    });
});

// Load active package style (same as main site)
function loadActivePackageStyle() {
    const activeStyle = localStorage.getItem('activePackageStyle') || 'style1';
    
    // Try to get style data from localStorage first
    const styleDataString = localStorage.getItem('currentPackageStyleData');
    let activeCSS = '';
    
    if (styleDataString) {
        try {
            const styleData = JSON.parse(styleDataString);
            activeCSS = styleData.css;
        } catch (e) {
            console.error('Error parsing package style data:', e);
        }
    }
    
    // Fallback to default styles if no custom data
    if (!activeCSS) {
        const defaultPackageStyles = {
            style1: `
                .package-card { 
                    border-radius: 12px; 
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                }
            `,
            style2: `
                .package-card { 
                    border-radius: 20px; 
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 163, 74, 0.1));
                    border: 2px solid rgba(34, 197, 94, 0.4);
                }
            `,
            style3: `
                .package-card { 
                    border-radius: 16px; 
                    background: rgba(0, 0, 0, 0.6);
                    border: 1px solid #22c55e;
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
                }
            `,
            style4: `
                .package-card { 
                    border-radius: 8px; 
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `,
            style5: `
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
                @keyframes borderRotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `,
            style6: `
                .package-card { 
                    border-radius: 0px; 
                    background: linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(34, 197, 94, 0.2));
                    border: 2px solid #22c55e;
                    position: relative;
                    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
                }
            `
        };
        
        activeCSS = defaultPackageStyles[activeStyle] || defaultPackageStyles.style1;
    }
    
    // Apply the active style
    let styleElement = document.getElementById('dynamicPackageStyle');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamicPackageStyle';
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = activeCSS;
    console.log('Applied package style in game details:', activeStyle);
}

// Load game details
function loadGameDetails(gameName) {
    const game = gamesData[gameName];
    if (!game) return;

    // Update game header
    document.getElementById('gameTitle').textContent = gameName;
    document.getElementById('gameDescription').textContent = game.description;
    
    // Use logo if available, otherwise use emoji icon
    const gameIconOrLogo = game.logo ? 
        `<img src="${game.logo}" alt="${gameName}" class="game-logo-details">` :
        `<span class="game-icon-large">${game.icon}</span>`;
    
    document.getElementById('gameLogo').innerHTML = gameIconOrLogo;

    // Load packages
    loadPackages(game.packages);
}

// Load packages grid
function loadPackages(packages) {
    const packagesGrid = document.getElementById('packagesGrid');
    packagesGrid.innerHTML = '';

    packages.forEach((pkg, index) => {
        // Get discount percentage for current game
        const discountPercentage = getGameDiscount(currentGame);
        const discountedPrice = calculateDiscountedPrice(pkg.originalPrice, discountPercentage);
        const savings = (pkg.originalPrice - discountedPrice).toFixed(2);

        const packageCard = document.createElement('div');
        packageCard.className = 'package-card';
        packageCard.setAttribute('data-game', currentGame);
        packageCard.setAttribute('data-package', pkg.name);
        packageCard.innerHTML = `
            <div class="package-header">
                <h3 class="package-name">${pkg.name} (Global)</h3>
                <div class="package-badge">${discountPercentage}% OFF First Purchase</div>
            </div>
            <div class="package-pricing">
                <div class="original-price">$${pkg.originalPrice.toFixed(2)}</div>
                <div class="discounted-price">$${discountedPrice}</div>
                <div class="savings">Save $${savings}</div>
            </div>
            <div class="uid-input-section">
                <input type="${isGiftCard(currentGame) ? 'email' : 'text'}" id="uid-${index}" placeholder="${isGiftCard(currentGame) ? 'Enter your Email Address' : 'Enter your Game ID/UID'}" class="uid-input" oninput="checkUID(${index})"${isGiftCard(currentGame) ? ' required' : ''}>
                <div class="package-buttons">
                    <button class="add-to-cart-btn" onclick="addToCart('${currentGame}', '${pkg.name}', ${pkg.originalPrice}, ${index})" disabled>
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="buy-now-btn" onclick="buyNow('${currentGame}', '${pkg.name}', ${pkg.originalPrice}, ${index})" disabled>
                        <i class="fas fa-bolt"></i>
                        Buy Now
                    </button>
                </div>
            </div>
        `;

        // Add 3D hover effect
        packageCard.addEventListener('mousemove', (e) => {
            const rect = packageCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            packageCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        packageCard.addEventListener('mouseleave', () => {
            packageCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });

        packagesGrid.appendChild(packageCard);
    });
}

// Select package
function selectPackage(index, packageName, price) {
    selectedPackage = {
        index: index,
        name: packageName,
        price: price
    };

    // Update UI to show selected package
    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    // Show UID input section
    document.getElementById('uidSection').style.display = 'block';
    document.getElementById('uidSection').scrollIntoView({ behavior: 'smooth' });
}

// Add to cart function for game details
function addToCart(gameName, packageName, originalPrice, packageId) {
    const uidInput = document.getElementById(`uid-${packageId}`);
    const uid = uidInput ? uidInput.value.trim() : '';
    
    if (!uid) {
        const fieldName = isGiftCard(gameName) ? 'Email Address' : 'Game ID/UID';
        showNotification(`Please enter your ${fieldName}`, 'error');
        return;
    }
    
    // Validate email for gift cards
    if (isGiftCard(gameName)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(uid)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
    }
    
    // Get existing cart from localStorage or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const discountedPrice = parseFloat((originalPrice * 0.35).toFixed(2));
    
    const cartItem = {
        id: Date.now() + Math.random(),
        gameName,
        packageName,
        originalPrice,
        discountedPrice,
        price: discountedPrice, // Add price field for compatibility
        uid,
        packageId
    };
    
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Clear UID input
    if (uidInput) {
        uidInput.value = '';
    }
    
    // Show success message
    showNotification(`${packageName} added to cart!`, 'success');
    
    // Update cart badge if available
    updateCartBadge();
}

// Check UID input validity
function checkUID(index) {
    const uidInput = document.getElementById(`uid-${index}`);
    const buttonsContainer = uidInput.nextElementSibling;
    const addButton = buttonsContainer.querySelector('.add-to-cart-btn');
    const buyButton = buttonsContainer.querySelector('.buy-now-btn');
    
    const inputValue = uidInput.value.trim();
    let isValid = false;
    
    if (inputValue.length > 0) {
        // For gift cards, validate email format
        if (isGiftCard(currentGame)) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(inputValue);
        } else {
            // For games, just check if not empty
            isValid = true;
        }
    }
    
    if (isValid) {
        addButton.disabled = false;
        addButton.classList.add('enabled');
        buyButton.disabled = false;
        buyButton.classList.add('enabled');
    } else {
        addButton.disabled = true;
        addButton.classList.remove('enabled');
        buyButton.disabled = true;
        buyButton.classList.remove('enabled');
    }
}

// Buy Now function
function buyNow(gameName, packageName, originalPrice, packageId) {
    const uidInput = document.getElementById(`uid-${packageId}`);
    const uid = uidInput ? uidInput.value.trim() : '';
    
    if (!uid) {
        const fieldName = isGiftCard(gameName) ? 'Email Address' : 'Game ID/UID';
        alert(`Please enter your ${fieldName}`);
        return;
    }
    
    // Validate email for gift cards
    if (isGiftCard(gameName)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(uid)) {
            alert('Please enter a valid email address');
            return;
        }
    }
    
    // Get discount percentage for current game
    const discountPercentage = getGameDiscount(gameName);
    const discountedPrice = parseFloat(calculateDiscountedPrice(originalPrice, discountPercentage));
    
    // Store order data in localStorage for payment page
    const orderData = {
        game: gameName,
        package: packageName,
        originalPrice: parseFloat(originalPrice),
        price: discountedPrice,
        uid: uid,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

// Update cart badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'block' : 'none';
    }
}



// Confirm UID
function confirmUID() {
    const uidInput = document.getElementById('uidInput');
    const uid = uidInput.value.trim();

    if (!uid) {
        showNotification('Please enter your Game ID', 'error');
        return;
    }

    if (!selectedPackage) {
        showNotification('Please select a package first', 'error');
        return;
    }

    // Update order summary
    document.getElementById('summaryGame').textContent = currentGame;
    document.getElementById('summaryPackage').textContent = selectedPackage.name;
    document.getElementById('summaryUID').textContent = uid;
    document.getElementById('summaryTotal').textContent = `$${selectedPackage.price}`;

    // Show order summary
    document.getElementById('orderSummary').style.display = 'block';
    document.getElementById('orderSummary').scrollIntoView({ behavior: 'smooth' });
}

// Proceed to payment
function proceedToPayment() {
    const uid = document.getElementById('uidInput').value.trim();
    
    if (!selectedPackage || !uid) {
        showNotification('Please complete all required fields', 'error');
        return;
    }

    // Calculate original price (assuming 65% discount)
    const originalPrice = selectedPackage.price / 0.35;
    
    // Store order data in localStorage
    const orderData = {
        game: currentGame,
        package: selectedPackage.name,
        originalPrice: parseFloat(originalPrice),
        price: parseFloat(selectedPackage.price),
        uid: uid,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('currentOrder', JSON.stringify(orderData));

    // Redirect to payment page
    window.location.href = 'payment.html';
}

// Go back to main page
function goBack() {
    window.location.href = 'index.html#games';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartSidebar.classList.contains('active')) {
        cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.style.display = 'none';
    } else {
        cartSidebar.classList.add('active');
        if (cartOverlay) cartOverlay.style.display = 'block';
        loadCartItems();
    }
}

// Load cart items in sidebar
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        total += item.discountedPrice;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.gameName}</h4>
                <p>${item.packageName}</p>
                <small>UID: ${item.uid}</small>
            </div>
            <div class="cart-item-price">
                <span class="original-price">$${item.originalPrice.toFixed(2)}</span>
                <span class="discounted-price">$${item.discountedPrice.toFixed(2)}</span>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Remove item from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartBadge();
    showNotification('Item removed from cart', 'info');
}

// Proceed to checkout function for game-details page
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Close cart
    toggleCart();
    
    // Redirect to payment page
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = 'payment.html';
}

// Language menu toggle
function toggleLanguageMenu() {
    const langMenu = document.getElementById('langMenu');
    langMenu.classList.toggle('active');
}

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    
    // Update flag and language text
    const langBtn = document.querySelector('.lang-btn');
    const flagSpan = langBtn.querySelector('.flag');
    const textSpan = langBtn.querySelector('span:not(.flag)');
    
    switch(lang) {
        case 'en':
            flagSpan.textContent = '🇺🇸';
            textSpan.textContent = 'English';
            break;
        case 'ar':
            flagSpan.textContent = '🇸🇦';
            textSpan.textContent = 'العربية';
            break;
        case 'ru':
            flagSpan.textContent = '🇷🇺';
            textSpan.textContent = 'Русский';
            break;
    }
    
    // Update all translations
    updateTranslations();
    toggleLanguageMenu();
    
    console.log('Language changed to:', lang);
}

// 3D Background Style Management for Game Details Page
function loadSavedBgStyleForDetails() {
    const savedStyle = localStorage.getItem('activeBgStyle') || '1';
    applyBgStyleForDetails(savedStyle);
}

function applyBgStyleForDetails(styleNumber) {
    console.log('Applying background style to game details page:', styleNumber);
    
    // Remove all existing style classes
    document.body.classList.remove('bg-style-1', 'bg-style-2', 'bg-style-3', 'bg-style-4', 'bg-style-5', 'bg-style-6', 'bg-style-7', 'bg-style-8', 'bg-style-9', 'bg-style-10', 'bg-style-11', 'bg-style-12');
    
    // Apply new style class
    document.body.classList.add(`bg-style-${styleNumber}`);
}

// Listen for background style changes from admin panel
window.addEventListener('storage', function(e) {
    if (e.key === 'activeBgStyle' && e.newValue) {
        applyBgStyleForDetails(e.newValue);
        console.log('Game details: 3D Background style updated from admin panel to:', e.newValue);
    }
});

// Initialize background style when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load saved background style after a short delay to ensure DOM is ready
    setTimeout(() => {
        loadSavedBgStyleForDetails();
    }, 100);
});