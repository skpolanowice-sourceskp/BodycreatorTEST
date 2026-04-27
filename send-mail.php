<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Niedozwolona metoda.']);
    exit;
}

// Honeypot
if (!empty($_POST['website'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Błąd walidacji.']);
    exit;
}

// ── Walidacja ────────────────────────────────────────────────────────────────
$imie = trim(strip_tags($_POST['imie'] ?? ''));
$wiek = (int) ($_POST['wiek'] ?? 0);
$waga = (int) ($_POST['waga'] ?? 0);
$cel  = trim(strip_tags($_POST['cel']  ?? ''));

if (empty($imie) || $wiek < 10 || $wiek > 99 || $waga < 30 || $waga > 300 || empty($cel)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Wypełnij wszystkie wymagane pola.']);
    exit;
}

// ── Konfiguracja SMTP ────────────────────────────────────────────────────────
// Uzupełnij poniższe dane danymi z panelu hostingowego
define('SMTP_HOST',      'mail.twojadomena.pl');    // serwer SMTP hostingu
define('SMTP_USER',      'kontakt@twojadomena.pl'); // konto email
define('SMTP_PASS',      'TWOJE_HASLO');             // hasło do skrzynki
define('SMTP_PORT',      465);                       // 465 (SSL) lub 587 (TLS)
define('MAIL_TO',        'kontakt@twojadomena.pl'); // adres docelowy (firma)
define('MAIL_FROM_NAME', 'Formularz Body Creator');

// ── Wysyłka ──────────────────────────────────────────────────────────────────
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_PORT === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_USER, MAIL_FROM_NAME);
    $mail->addAddress(MAIL_TO);

    $mail->isHTML(true);
    $mail->Subject = "Nowe zgłoszenie konsultacji — {$imie}";
    $mail->Body    = "
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;border-radius:12px;overflow:hidden;'>
            <div style='background:#FED525;padding:24px 32px;'>
                <h1 style='margin:0;font-size:22px;color:#111;letter-spacing:1px;'>NOWE ZGŁOSZENIE</h1>
                <p style='margin:6px 0 0;color:#111;font-size:14px;'>Body Creator — bezpłatna konsultacja</p>
            </div>
            <div style='padding:32px;'>
                <table style='width:100%;border-collapse:collapse;'>
                    <tr>
                        <td style='padding:12px 0;border-bottom:1px solid #222;color:#999;font-size:13px;width:140px;'>Imię i nazwisko</td>
                        <td style='padding:12px 0;border-bottom:1px solid #222;font-weight:700;font-size:16px;'>" . htmlspecialchars($imie) . "</td>
                    </tr>
                    <tr>
                        <td style='padding:12px 0;border-bottom:1px solid #222;color:#999;font-size:13px;'>Wiek</td>
                        <td style='padding:12px 0;border-bottom:1px solid #222;'>{$wiek} lat</td>
                    </tr>
                    <tr>
                        <td style='padding:12px 0;border-bottom:1px solid #222;color:#999;font-size:13px;'>Waga</td>
                        <td style='padding:12px 0;border-bottom:1px solid #222;'>{$waga} kg</td>
                    </tr>
                    <tr>
                        <td style='padding:12px 0;color:#999;font-size:13px;'>Cel kontaktu</td>
                        <td style='padding:12px 0;color:#FED525;font-weight:600;'>" . htmlspecialchars($cel) . "</td>
                    </tr>
                </table>
            </div>
            <div style='padding:16px 32px;background:#0a0a0a;text-align:center;'>
                <p style='margin:0;font-size:12px;color:#555;'>Zgłoszenie wysłane ze strony bodycreator.pl</p>
            </div>
        </div>
    ";
    $mail->AltBody = "Nowe zgłoszenie konsultacji\nImię i nazwisko: {$imie}\nWiek: {$wiek} lat\nWaga: {$waga} kg\nCel: {$cel}";

    $mail->send();
    echo json_encode(['ok' => true, 'message' => 'Wysłano!']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Błąd wysyłki. Spróbuj ponownie lub zadzwoń do nas.']);
}
