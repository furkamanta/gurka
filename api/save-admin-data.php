<?php
/**
 * Admin Data Saver
 * Saves admin panel data to server files
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Data directory
$dataDir = '/var/www/fockgaming/data/admin/';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['type']) || !isset($input['data'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }
    
    $type = $input['type'];
    $data = $input['data'];
    
    // Validate type
    $allowedTypes = ['bannerSlides', 'packageBackgroundData', 'bannerSettings'];
    if (!in_array($type, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type']);
        exit;
    }
    
    // Save data
    $filename = $dataDir . $type . '.json';
    $result = file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
    
    if ($result !== false) {
        echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save data']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = $_GET['type'] ?? '';
    
    if (!$type) {
        http_response_code(400);
        echo json_encode(['error' => 'Type parameter required']);
        exit;
    }
    
    $filename = $dataDir . $type . '.json';
    
    if (file_exists($filename)) {
        $data = json_decode(file_get_contents($filename), true);
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        echo json_encode(['success' => true, 'data' => null]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>