<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'ok' => false, 'error' => 'Niedozwolona metoda.']);
    exit;
}

$to = 'kontakt@bodycreator.com.pl';

// Obsługa pól z obu formularzy (kontakt + rezerwacja)
$name     = htmlspecialchars(trim($_POST['name']  ?? $_POST['imie']    ?? ''), ENT_QUOTES, 'UTF-8');
$phone    = htmlspecialchars(trim($_POST['phone'] ?? $_POST['telefon'] ?? ''), ENT_QUOTES, 'UTF-8');
$emailRaw = trim($_POST['email'] ?? '');
$email    = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);

// Antispam honeypot
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true, 'ok' => true]);
    exit;
}

// Formularz kontaktowy
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8');

$isReservation = isset($_POST['imie']) || isset($_POST['telefon']);

if ($isReservation) {
    if (!$name || !$email || !$phone) {
        http_response_code(400);
        echo json_encode(['success' => false, 'ok' => false, 'error' => 'Wypełnij wszystkie wymagane pola.', 'message' => 'Wypełnij wszystkie wymagane pola.']);
        exit;
    }
    $mailSubject = '=?UTF-8?B?' . base64_encode('Nowa rezerwacja konsultacji — Body Creator') . '?=';
    $body  = "Nowa rezerwacja konsultacji ze strony bodycreator.com.pl\r\n";
    $body .= "=========================================================\r\n\r\n";
    $body .= "Imię: $name\r\n";
    $body .= "Telefon: $phone\r\n";
    $body .= "E-mail: $email\r\n";
} else {
    if (!$name || !$email || !$message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'ok' => false, 'error' => 'Wypełnij wszystkie wymagane pola.', 'message' => 'Wypełnij wszystkie wymagane pola.']);
        exit;
    }
    $subjectLabel = $subject ?: 'Wiadomość z formularza';
    $mailSubject  = '=?UTF-8?B?' . base64_encode("Wiadomość z formularza: $subjectLabel") . '?=';
    $body  = "Nowa wiadomość ze strony bodycreator.com.pl\r\n";
    $body .= "==========================================\r\n\r\n";
    $body .= "Imię i nazwisko: $name\r\n";
    $body .= "E-mail: $email\r\n";
    if ($phone) {
        $body .= "Telefon: $phone\r\n";
    }
    $body .= "Temat: $subjectLabel\r\n\r\n";
    $body .= "Wiadomość:\r\n$message\r\n";
}

$headers  = "From: Formularz Body Creator <noreply@bodycreator.com.pl>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

if (mail($to, $mailSubject, $body, $headers)) {
    echo json_encode(['success' => true, 'ok' => true]);
} else {
    http_response_code(500);
    $err = 'Błąd wysyłania wiadomości. Spróbuj ponownie lub skontaktuj się telefonicznie.';
    echo json_encode(['success' => false, 'ok' => false, 'error' => $err, 'message' => $err]);
}
