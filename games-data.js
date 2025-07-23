// Games data organized by categories
const gameCategories = {
    popular: {
        title: "Popular Games & Services",
        games: ["Free Fire", "PUBG Mobile", "League of Legends: Wild Rift", "Valorant", "Call of Duty Mobile", "Delta Force (Global)", "League of Legends PC", "Genshin Impact", "Honkai: Star Rail", "Lords Mobile", "Honor of Kings", "Pixel Gun 3D", "Roblox"]
    },
    allGames: {
        title: "All Games",
        games: [
            "Free Fire", "PUBG Mobile", "League of Legends: Wild Rift", "Valorant", "Call of Duty Mobile",
            "Dragonheir: Silent Gods", "Pixel Gun 3D", "New State Mobile", "Mobile Legends: Bang Bang",
            "Honor of Kings", "Garena Delta Force", "Lords Mobile", "Age of Empires Mobile",
            "Arena Breakout", "Delta Force (Global)", "PROJECT: BLOOD STRIKE", "EVE Echoes",
            "Honkai: Star Rail", "Genshin Impact", "Clash of Clans", "Clash Royale",
            "Brawl Stars", "Hay Day", "League of Legends PC", "Ludo Club"
        ]
    },
    giftCards: {
        title: "Gift Cards",
        games: ["PUBG Mobile - Game Cards", "PUBG G-COIN", "Roblox Card", "Eudemons Online Point Card (GLOBAL)", "Apple Gift Card (US)", "Razer Gold USD (Global)", "Xbox Gift Card US", "PlayStation Store Gift Card US", "Fortnite V-Bucks US"]
    },
    applications: {
        title: "Applications",
        games: [
            "Bigo Live", "Nimo TV", "Yalla Live", "ZEPETO", "imo", "Chamet", 
            "SUGO: Voice Live Chat Party"
        ]
    }
};

// Games data with prices and icons
const gamesData = {
    "Dragonheir: Silent Gods": {
        icon: "🐉",
        description: "Fantasy RPG with dragon companions",
        packages: [
            { name: "70 Dragon Crystal", originalPrice: 0.99 },
            { name: "350 Dragon Crystal", originalPrice: 4.99 },
            { name: "1050 Dragon Crystal", originalPrice: 14.99 },
            { name: "2100 Dragon Crystal", originalPrice: 29.99 },
            { name: "3500 Dragon Crystal", originalPrice: 49.99 },
            { name: "7000 Dragon Crystal", originalPrice: 99.99 },
            { name: "14000 Dragon Crystal", originalPrice: 199.99 },
            { name: "35000 Dragon Crystal", originalPrice: 499.99 }
        ]
    },
    "Pixel Gun 3D": {
        icon: "🔫",
        description: "3D pixel shooting game",
        packages: [
            { name: "375 Gems", originalPrice: 9.99 },
            { name: "800 Gems", originalPrice: 19.99 },
            { name: "2200 Gems", originalPrice: 49.99 },
            { name: "3500 Gems", originalPrice: 74.99 },
            { name: "5000 Gems", originalPrice: 99.99 }
        ]
    },
    "Valorant": {
        icon: "⚡",
        logo: "https://cdn1.epicgames.com/offer/cbd5b3d310a54b12bf3fe8c41994174f/EGS_VALORANT_RiotGames_S2_1200x1600-7ab3ea8bb6d0c83d3fd0a6d8a6de06a9",
        description: "Tactical FPS shooter",
        packages: [
            { name: "475 VP", originalPrice: 4.99 },
            { name: "1000 VP", originalPrice: 9.99 },
            { name: "2050 VP", originalPrice: 19.99 },
            { name: "3650 VP", originalPrice: 34.99 },
            { name: "5350 VP", originalPrice: 49.99 },
            { name: "11000 VP", originalPrice: 99.99 }
        ]
    },
    "New State Mobile": {
        icon: "🎯",
        description: "Battle royale mobile game",
        packages: [
            { name: "300 NC", originalPrice: 0.99 },
            { name: "1500 NC + 80 Bonus", originalPrice: 4.99 },
            { name: "3600 NC + 250 Bonus", originalPrice: 11.99 },
            { name: "9300 NC + 930 Bonus", originalPrice: 30.99 },
            { name: "15000 NC + 1800 Bonus", originalPrice: 49.99 },
            { name: "30000 NC + 5000 Bonus", originalPrice: 99.99 }
        ]
    },
    "Free Fire": {
        icon: "💎",
        logo: "https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Ffree-fire%2Fhome%2FFF_Epic_Launcher_Portrait_1200x1600_1200x1600-fca289477c2f57c8f2ecdb5e5424e2a60de93c9e.jpg",
        description: "Battle royale survival game",
        packages: [
            { name: "100 Diamonds", originalPrice: 1.19 },
            { name: "210 Diamonds", originalPrice: 2.29 },
            { name: "530 Diamonds", originalPrice: 5.99 },
            { name: "645 Diamonds", originalPrice: 7.85 },
            { name: "1080 Diamonds", originalPrice: 11.99 },
            { name: "2200 Diamonds", originalPrice: 22.63 },
            { name: "4450 Diamonds", originalPrice: 55.99 },
            { name: "6900 Diamonds", originalPrice: 82.99 }
        ]
    },
    "League of Legends: Wild Rift": {
        icon: "⚔️",
        description: "MOBA game for mobile",
        packages: [
            { name: "425 Wild Cores", originalPrice: 4.29 },
            { name: "1000 Wild Cores", originalPrice: 9.99 },
            { name: "1850 Wild Cores", originalPrice: 17.99 },
            { name: "3275 Wild Cores", originalPrice: 30.99 },
            { name: "4800 Wild Cores", originalPrice: 45.99 },
            { name: "10000 Wild Cores", originalPrice: 99.99 }
        ]
    },
    "Mobile Legends: Bang Bang": {
        icon: "🏆",
        description: "5v5 MOBA mobile game",
        packages: [
            { name: "Weekly Pass", originalPrice: 2.49 },
            { name: "127 + 13 Diamonds", originalPrice: 2.99 },
            { name: "317 + 38 Diamonds", originalPrice: 7.49 },
            { name: "383 + 46 Diamonds", originalPrice: 8.99 },
            { name: "633 + 83 Diamonds", originalPrice: 14.99 },
            { name: "1252 + 194 Diamonds", originalPrice: 29.99 },
            { name: "2501 + 475 Diamonds", originalPrice: 59.99 }
        ]
    },
    "Honor of Kings": {
        icon: "👑",
        description: "Popular MOBA game",
        packages: [
            { name: "80 Tokens", originalPrice: 0.99 },
            { name: "240 Tokens", originalPrice: 2.99 },
            { name: "400 Tokens", originalPrice: 4.99 },
            { name: "560 Tokens", originalPrice: 6.99 },
            { name: "800 + 30 Tokens", originalPrice: 9.99 },
            { name: "1200 + 45 Tokens", originalPrice: 14.99 },
            { name: "2400 + 108 Tokens", originalPrice: 29.99 },
            { name: "4000 + 180 Tokens", originalPrice: 49.99 },
            { name: "8000 + 360 Tokens", originalPrice: 99.99 }
        ]
    },
    "Garena Delta Force": {
        icon: "🚁",
        description: "Military tactical shooter",
        packages: [
            { name: "300 + 36 Delta Coins", originalPrice: 4.99 },
            { name: "420 + 62 Delta Coins", originalPrice: 6.99 },
            { name: "680 + 105 Delta Coins", originalPrice: 9.99 },
            { name: "1280 + 264 Delta Coins", originalPrice: 19.99 },
            { name: "1680 + 385 Delta Coins", originalPrice: 24.99 },
            { name: "3280 + 834 Delta Coins", originalPrice: 49.99 },
            { name: "6480 + 1944 Delta Coins", originalPrice: 99.99 },
            { name: "19440 + 5832 Delta Coins", originalPrice: 299.99 }
        ]
    },
    "Lords Mobile": {
        icon: "🏰",
        description: "Strategy war game",
        packages: [
            { name: "195 Diamonds", originalPrice: 2.99 },
            { name: "395 Diamonds", originalPrice: 4.99 },
            { name: "785 Diamonds", originalPrice: 9.99 },
            { name: "1179 Diamonds", originalPrice: 14.99 },
            { name: "1964 Diamonds", originalPrice: 24.99 },
            { name: "3928 Diamonds", originalPrice: 49.99 },
            { name: "7857 Diamonds", originalPrice: 99.99 },
            { name: "11785 Diamonds", originalPrice: 149.99 }
        ]
    },
    "Call of Duty Mobile": {
        icon: "🎖️",
        logo: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mobile/Call-of-Duty-Mobile_Season8_TacticalOps_001.jpg",
        description: "FPS mobile shooter",
        packages: [
            { name: "60 CP", originalPrice: 0.99 },
            { name: "310 CP", originalPrice: 4.99 },
            { name: "650 CP", originalPrice: 9.99 },
            { name: "1300 CP", originalPrice: 19.99 },
            { name: "2600 CP", originalPrice: 39.99 },
            { name: "6500 CP", originalPrice: 99.99 }
        ]
    },
    "PUBG Mobile": {
        icon: "🎮",
        logo: "https://cdn1.epicgames.com/offer/736584b4c7ec4a7995b7ec6e16de2a3a/EGS_PUBGBATTLEGROUNDS_CraftonsInc_S2_1200x1600-6a3e04b5ef02a33b1ec6e6093d85b3ab",
        description: "Battle royale mobile game",
        packages: [
            { name: "60 UC", originalPrice: 0.99 },
            { name: "300 UC", originalPrice: 4.99 },
            { name: "600 UC", originalPrice: 9.99 },
            { name: "1500 UC", originalPrice: 14.99 },
            { name: "3000 UC", originalPrice: 29.99 },
            { name: "6000 UC", originalPrice: 59.99 },
            { name: "15000 UC", originalPrice: 99.99 }
        ]
    },
    "Age of Empires Mobile": {
        icon: "🏛️",
        description: "Real-time strategy game",
        packages: [
            { name: "60 Gems", originalPrice: 0.99 },
            { name: "300 Gems", originalPrice: 4.99 },
            { name: "600 Gems", originalPrice: 9.99 },
            { name: "1500 Gems", originalPrice: 19.99 },
            { name: "3000 Gems", originalPrice: 39.99 },
            { name: "6000 Gems", originalPrice: 79.99 },
            { name: "15000 Gems", originalPrice: 199.99 }
        ]
    },
    "Arena Breakout": {
        icon: "🔥",
        description: "Tactical extraction shooter",
        packages: [
            { name: "60 A-Coins", originalPrice: 0.99 },
            { name: "300 A-Coins", originalPrice: 4.99 },
            { name: "600 A-Coins", originalPrice: 9.99 },
            { name: "1500 A-Coins", originalPrice: 19.99 },
            { name: "3000 A-Coins", originalPrice: 39.99 },
            { name: "6000 A-Coins", originalPrice: 79.99 },
            { name: "15000 A-Coins", originalPrice: 199.99 }
        ]
    },
    "Delta Force (Global)": {
        icon: "🌍",
        description: "Global tactical shooter",
        packages: [
            { name: "30 Coins", originalPrice: 0.42 },
            { name: "60 Coins", originalPrice: 0.84 },
            { name: "300 + 20 Coins", originalPrice: 4.24 },
            { name: "420 + 40 Coins", originalPrice: 5.94 },
            { name: "680 + 70 Coins", originalPrice: 8.49 },
            { name: "1280 + 200 Coins", originalPrice: 16.99 },
            { name: "1680 + 300 Coins", originalPrice: 21.24 },
            { name: "3280 + 670 Coins", originalPrice: 42.49 },
            { name: "6480 + 1620 Coins", originalPrice: 84.99 }
        ]
    },
    "PROJECT: BLOOD STRIKE": {
        icon: "🩸",
        description: "Action battle royale",
        packages: [
            { name: "60 BS Coins", originalPrice: 0.99 },
            { name: "300 BS Coins", originalPrice: 4.99 },
            { name: "600 BS Coins", originalPrice: 9.99 },
            { name: "1500 BS Coins", originalPrice: 19.99 },
            { name: "3000 BS Coins", originalPrice: 39.99 },
            { name: "6000 BS Coins", originalPrice: 79.99 },
            { name: "15000 BS Coins", originalPrice: 199.99 }
        ]
    },
    "EVE Echoes": {
        icon: "🚀",
        description: "Space MMO adventure",
        packages: [
            { name: "125 AUR", originalPrice: 4.31 },
            { name: "265 AUR", originalPrice: 8.63 },
            { name: "525 AUR", originalPrice: 17.26 },
            { name: "1315 AUR", originalPrice: 43.16 },
            { name: "2750 AUR", originalPrice: 86.33 }
        ]
    },
    "PUBG Mobile - Game Cards": {
        icon: "🎴",
        description: "PUBG Mobile gift cards",
        discount: 15,
        packages: [
            { name: "100 UC", originalPrice: 1.99 },
            { name: "500 UC", originalPrice: 7.99 },
            { name: "1000 UC", originalPrice: 15.99 },
            { name: "2000 UC", originalPrice: 29.99 },
            { name: "4000 UC", originalPrice: 59.99 },
            { name: "10000 UC", originalPrice: 149.99 }
        ]
    },
    "Honkai: Star Rail": {
        icon: "⭐",
        description: "Space fantasy RPG",
        packages: [
            { name: "60 Stellar Jade", originalPrice: 0.99 },
            { name: "300 Stellar Jade", originalPrice: 4.99 },
            { name: "980 Stellar Jade", originalPrice: 14.99 },
            { name: "1980 Stellar Jade", originalPrice: 29.99 },
            { name: "3280 Stellar Jade", originalPrice: 49.99 },
            { name: "6480 Stellar Jade", originalPrice: 99.99 }
        ]
    },
    "Genshin Impact": {
        icon: "🌟",
        logo: "https://cdn1.epicgames.com/offer/879b0d8776ab46a59a129983ba78f0ce/genshintall_1200x1600-70c8be9b2dac67cbf7da11effa64c75b",
        description: "Open-world action RPG",
        packages: [
            { name: "60 Primogems", originalPrice: 0.99 },
            { name: "300 Primogems", originalPrice: 4.99 },
            { name: "980 Primogems", originalPrice: 14.99 },
            { name: "1980 Primogems", originalPrice: 29.99 },
            { name: "3280 Primogems", originalPrice: 49.99 },
            { name: "6480 Primogems", originalPrice: 99.99 }
        ]
    },
    "PUBG G-COIN": {
        icon: "🪙",
        description: "PUBG PC currency",
        discount: 15,
        packages: [
            { name: "100 G-COIN", originalPrice: 1.99 },
            { name: "500 G-COIN", originalPrice: 7.99 },
            { name: "1000 G-COIN", originalPrice: 15.99 },
            { name: "2000 G-COIN", originalPrice: 29.99 },
            { name: "4000 G-COIN", originalPrice: 59.99 },
            { name: "10000 G-COIN", originalPrice: 149.99 }
        ]
    },
    "Roblox": {
        icon: "🟦",
        logo: "https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/480/270/Image/Png",
        description: "Online gaming platform",
        packages: [
            { name: "400 Robux", originalPrice: 4.99 },
            { name: "800 Robux", originalPrice: 9.99 },
            { name: "1700 Robux", originalPrice: 19.99 },
            { name: "4500 Robux", originalPrice: 49.99 },
            { name: "10000 Robux", originalPrice: 99.99 }
        ]
    },
    "Roblox Card": {
        icon: "🎫",
        description: "Roblox gift cards",
        discount: 15,
        packages: [
            { name: "400 Robux", originalPrice: 4.99 },
            { name: "800 Robux", originalPrice: 9.99 },
            { name: "1700 Robux", originalPrice: 19.99 },
            { name: "4500 Robux", originalPrice: 49.99 },
            { name: "10000 Robux", originalPrice: 99.99 }
        ]
    },
    "Bigo Live": {
        icon: "📱",
        description: "Live streaming platform",
        packages: [
            { name: "50 Beans", originalPrice: 0.99 },
            { name: "250 Beans", originalPrice: 4.99 },
            { name: "600 Beans", originalPrice: 9.99 },
            { name: "1500 Beans", originalPrice: 19.99 },
            { name: "3000 Beans", originalPrice: 39.99 },
            { name: "6000 Beans", originalPrice: 79.99 },
            { name: "15000 Beans", originalPrice: 199.99 }
        ]
    },
    "Nimo TV": {
        icon: "📺",
        description: "Gaming live streaming",
        packages: [
            { name: "50 Diamonds", originalPrice: 0.99 },
            { name: "250 Diamonds", originalPrice: 4.99 },
            { name: "600 Diamonds", originalPrice: 9.99 },
            { name: "1500 Diamonds", originalPrice: 19.99 },
            { name: "3000 Diamonds", originalPrice: 39.99 },
            { name: "6000 Diamonds", originalPrice: 79.99 },
            { name: "15000 Diamonds", originalPrice: 199.99 }
        ]
    },
    "Yalla Live": {
        icon: "🎤",
        description: "Voice chat platform",
        packages: [
            { name: "50 Coins", originalPrice: 0.99 },
            { name: "250 Coins", originalPrice: 4.99 },
            { name: "600 Coins", originalPrice: 9.99 },
            { name: "1500 Coins", originalPrice: 19.99 },
            { name: "3000 Coins", originalPrice: 39.99 },
            { name: "6000 Coins", originalPrice: 79.99 },
            { name: "15000 Coins", originalPrice: 199.99 }
        ]
    },
    "ZEPETO": {
        icon: "👤",
        description: "Virtual avatar platform",
        packages: [
            { name: "50 ZEM", originalPrice: 0.99 },
            { name: "250 ZEM", originalPrice: 4.99 },
            { name: "600 ZEM", originalPrice: 9.99 },
            { name: "1500 ZEM", originalPrice: 19.99 },
            { name: "3000 ZEM", originalPrice: 39.99 },
            { name: "6000 ZEM", originalPrice: 79.99 },
            { name: "15000 ZEM", originalPrice: 199.99 }
        ]
    },
    "imo": {
        icon: "💬",
        description: "Video calling app",
        packages: [
            { name: "50 Credits", originalPrice: 0.99 },
            { name: "250 Credits", originalPrice: 4.99 },
            { name: "600 Credits", originalPrice: 9.99 },
            { name: "1500 Credits", originalPrice: 19.99 },
            { name: "3000 Credits", originalPrice: 39.99 },
            { name: "6000 Credits", originalPrice: 79.99 },
            { name: "15000 Credits", originalPrice: 199.99 }
        ]
    },
    "Chamet": {
        icon: "💫",
        description: "Social video chat",
        packages: [
            { name: "50 Coins", originalPrice: 0.99 },
            { name: "250 Coins", originalPrice: 4.99 },
            { name: "600 Coins", originalPrice: 9.99 },
            { name: "1500 Coins", originalPrice: 19.99 },
            { name: "3000 Coins", originalPrice: 39.99 },
            { name: "6000 Coins", originalPrice: 79.99 },
            { name: "15000 Coins", originalPrice: 199.99 }
        ]
    },
    "SUGO: Voice Live Chat Party": {
        icon: "🎵",
        description: "Voice party platform",
        packages: [
            { name: "50 Tokens", originalPrice: 0.99 },
            { name: "250 Tokens", originalPrice: 4.99 },
            { name: "600 Tokens", originalPrice: 9.99 },
            { name: "1500 Tokens", originalPrice: 19.99 },
            { name: "3000 Tokens", originalPrice: 39.99 },
            { name: "6000 Tokens", originalPrice: 79.99 },
            { name: "15000 Tokens", originalPrice: 199.99 }
        ]
    },

    "Clash of Clans": {
        icon: "⚔️",
        description: "Strategy mobile game",
        packages: [
            { name: "250 Gems", originalPrice: 2.99 },
            { name: "500 Gems", originalPrice: 4.99 },
            { name: "1200 Gems", originalPrice: 9.99 },
            { name: "2500 Gems", originalPrice: 19.99 },
            { name: "6500 Gems", originalPrice: 49.99 },
            { name: "14000 Gems", originalPrice: 99.99 }
        ]
    },
    "Clash Royale": {
        icon: "👑",
        description: "Real-time strategy game",
        packages: [
            { name: "250 Gems", originalPrice: 2.99 },
            { name: "500 Gems", originalPrice: 4.99 },
            { name: "1200 Gems", originalPrice: 9.99 },
            { name: "2500 Gems", originalPrice: 19.99 },
            { name: "6500 Gems", originalPrice: 49.99 },
            { name: "14000 Gems", originalPrice: 99.99 }
        ]
    },
    "Brawl Stars": {
        icon: "🌟",
        description: "Fast-paced multiplayer game",
        packages: [
            { name: "250 Gems", originalPrice: 2.99 },
            { name: "500 Gems", originalPrice: 4.99 },
            { name: "1200 Gems", originalPrice: 9.99 },
            { name: "2500 Gems", originalPrice: 19.99 },
            { name: "6500 Gems", originalPrice: 49.99 },
            { name: "14000 Gems", originalPrice: 99.99 }
        ]
    },
    "Hay Day": {
        icon: "🚜",
        description: "Farm simulation game",
        packages: [
            { name: "250 Gems", originalPrice: 2.99 },
            { name: "500 Gems", originalPrice: 4.99 },
            { name: "1200 Gems", originalPrice: 9.99 },
            { name: "2500 Gems", originalPrice: 19.99 },
            { name: "6500 Gems", originalPrice: 49.99 },
            { name: "14000 Gems", originalPrice: 99.99 }
        ]
    },
    "League of Legends PC": {
        icon: "⚔️",
        description: "Multiplayer online battle arena game",
        packages: [
            { name: "75 RP", originalPrice: 3.31 },
            { name: "1380 RP", originalPrice: 7.65 },
            { name: "2800 RP", originalPrice: 15.36 },
            { name: "4500 RP", originalPrice: 24.14 },
            { name: "6500 RP", originalPrice: 34.00 },
            { name: "13500 RP", originalPrice: 65.48 }
        ]
    },
    "Ludo Club": {
        icon: "🎲",
        description: "Classic board game with friends",
        packages: [
            { name: "120 Cash", originalPrice: 0.64 },
            { name: "250 Cash", originalPrice: 1.31 },
            { name: "700 Cash", originalPrice: 3.26 },
            { name: "3200 Cash", originalPrice: 13.02 },
            { name: "10800 Cash", originalPrice: 39.04 },
            { name: "20000 Cash", originalPrice: 60.75 }
        ]
    },
    "Eudemons Online Point Card (GLOBAL)": {
        icon: "🎴",
        description: "Eudemons Online game points",
        discount: 15,
        packages: [
            { name: "80 Point", originalPrice: 0.95 },
            { name: "165 Point", originalPrice: 1.91 },
            { name: "420 Point", originalPrice: 4.79 },
            { name: "680 Point", originalPrice: 7.67 },
            { name: "1380 Point", originalPrice: 15.35 },
            { name: "5400 Point", originalPrice: 57.47 },
            { name: "5400 Point × 8", originalPrice: 459.76 },
            { name: "5400 Point × 9", originalPrice: 517.23 }
        ]
    },
    "Apple Gift Card (US)": {
        icon: "🍎",
        description: "Apple Store gift cards",
        discount: 15,
        packages: [
            { name: "Apple Card $5", originalPrice: 5.00 },
            { name: "Apple Card $10", originalPrice: 10.00 },
            { name: "Apple Card $15", originalPrice: 15.00 },
            { name: "Apple Card $20", originalPrice: 20.00 },
            { name: "Apple Card $25", originalPrice: 25.00 },
            { name: "Apple Card $30", originalPrice: 30.00 },
            { name: "Apple Card $50", originalPrice: 50.00 },
            { name: "Apple Card $100", originalPrice: 100.00 }
        ]
    },
    "Razer Gold USD (Global)": {
        icon: "🎮",
        description: "Razer Gold digital wallet",
        discount: 15,
        packages: [
            { name: "$5 Razer Gold", originalPrice: 5.30 },
            { name: "$10 Razer Gold", originalPrice: 10.50 },
            { name: "$20 Razer Gold", originalPrice: 21.20 },
            { name: "$50 Razer Gold", originalPrice: 52.50 },
            { name: "$100 Razer Gold", originalPrice: 105.50 },
            { name: "$200 Razer Gold", originalPrice: 211.00 },
            { name: "$300 Razer Gold", originalPrice: 316.60 },
            { name: "$400 Razer Gold", originalPrice: 422.00 },
            { name: "$500 Razer Gold", originalPrice: 527.00 }
        ]
    },
    "Xbox Gift Card US": {
        icon: "🎯",
        description: "Xbox Store gift cards",
        discount: 15,
        packages: [
            { name: "Xbox Card €20", originalPrice: 20.00 },
            { name: "Xbox Card €25", originalPrice: 25.00 },
            { name: "Xbox Card €30", originalPrice: 30.00 },
            { name: "Xbox Card €50", originalPrice: 50.00 },
            { name: "Xbox Card €100", originalPrice: 100.00 }
        ]
    },
    "PlayStation Store Gift Card US": {
        icon: "🎮",
        description: "PlayStation Store gift cards",
        discount: 15,
        packages: [
            { name: "PlayStation Card $10", originalPrice: 10.00 },
            { name: "PlayStation Card $25", originalPrice: 25.00 },
            { name: "PlayStation Card $50", originalPrice: 50.00 },
            { name: "PlayStation Card $75", originalPrice: 75.00 },
            { name: "PlayStation Card $100", originalPrice: 100.00 },
            { name: "PlayStation Card $150", originalPrice: 150.00 },
            { name: "PlayStation Card $250", originalPrice: 250.00 }
        ]
    },
    "Fortnite V-Bucks US": {
        icon: "⚡",
        description: "Fortnite V-Bucks currency",
        discount: 15,
        packages: [
            { name: "2,800 V-Bucks", originalPrice: 25.29 },
            { name: "5,000 V-Bucks", originalPrice: 40.69 },
            { name: "13,500 V-Bucks", originalPrice: 98.99 },
            { name: "Fortnite Gift Card $11-$165", originalPrice: 88.00 }
        ]
    }
};

// Calculate discounted price (65% off by default, or custom discount)
function calculateDiscountedPrice(originalPrice, customDiscount = null) {
    if (customDiscount !== null) {
        // Apply custom discount (e.g., 5% off = 0.95)
        return (originalPrice * (1 - customDiscount / 100)).toFixed(2);
    }
    // Default 65% off (35% of original price)
    return (originalPrice * 0.35).toFixed(2);
}

// Get discount percentage for a game
function getGameDiscount(gameName) {
    const gameData = gamesData[gameName];
    return gameData && gameData.discount ? gameData.discount : 65;
}

// Check if a game is a gift card
function isGiftCard(gameName) {
    const giftCardGames = [
        "PUBG Mobile - Game Cards", "PUBG G-COIN", "Roblox Card", "Eudemons Online Point Card (GLOBAL)", 
        "Apple Gift Card (US)", "Razer Gold USD (Global)", "Xbox Gift Card US", 
        "PlayStation Store Gift Card US", "Fortnite V-Bucks US"
    ];
    return giftCardGames.includes(gameName);
}

// Load custom logos from localStorage
function loadCustomLogos() {
    const savedLogos = localStorage.getItem('gamesData');
    if (savedLogos) {
        try {
            const savedData = JSON.parse(savedLogos);
            Object.keys(savedData).forEach(gameName => {
                if (gamesData[gameName] && savedData[gameName].logo) {
                    gamesData[gameName].logo = savedData[gameName].logo;
                }
            });
        } catch (error) {
            console.error('Error loading custom logos:', error);
        }
    }
}

// Load custom logos on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', loadCustomLogos);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gamesData, gameCategories, calculateDiscountedPrice };
}