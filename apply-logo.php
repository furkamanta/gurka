<?php
/**
 * Apply Logo to All Packages
 */

$logoUrl = 'https://fockgaming.com/assets/logo-bg.png';

$gamesList = [
    'Free Fire', 'PUBG Mobile', 'League of Legends: Wild Rift', 'Valorant', 
    'Call of Duty Mobile', 'Delta Force (Global)', 'League of Legends PC', 
    'Genshin Impact', 'Honkai: Star Rail', 'Lords Mobile', 'Honor of Kings', 
    'Pixel Gun 3D', 'Roblox', 'Mobile Legends: Bang Bang'
];

$packageData = [];
foreach ($gamesList as $game) {
    $packageData[$game] = ['backgroundImage' => $logoUrl];
}

// Save data
$dataDir = '/var/www/fockgaming/data/admin/';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$filename = $dataDir . 'packageBackgroundData.json';
$result = file_put_contents($filename, json_encode($packageData, JSON_PRETTY_PRINT));

if ($result !== false) {
    echo "✅ Logo applied to " . count($gamesList) . " games successfully!\n";
    echo "📁 Saved to: $filename\n";
    echo "🔗 Logo URL: $logoUrl\n";
} else {
    echo "❌ Failed to save data\n";
}

// Also create a simple banner for testing
$bannerData = [
    [
        'title' => 'FOCK GAMING',
        'description' => 'Premium Gaming Experience',
        'image' => $logoUrl,
        'buttonText' => 'Play Now',
        'buttonLink' => '#'
    ]
];

$bannerFilename = $dataDir . 'bannerSlides.json';
file_put_contents($bannerFilename, json_encode($bannerData, JSON_PRETTY_PRINT));
echo "📢 Default banner also created!\n";
?>