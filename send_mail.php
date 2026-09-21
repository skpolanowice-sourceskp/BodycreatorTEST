<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$to = 'kontakt@bodycreator.com.pl';

// ==========================================================
// ANTYSPAM
// ----------------------------------------------------------
// Boty wysyłają POST bezpośrednio tutaj, bez otwierania strony
// z formularzem — dlatego sam honeypot ich nie zatrzymuje
// (po prostu nie wysyłają ukrytego pola), a licznik czasu
// w JavaScripcie nigdy się u nich nie uruchamia.
//
// Dlatego każde zgłoszenie musi mieć token podpisany przez
// serwer. Strona pobiera go przy wejściu (GET send_mail.php),
// a w tokenie zaszyty jest moment wydania — dzięki temu serwer
// widzi, ile czasu minęło od załadowania formularza, i odrzuca
// zgłoszenia wypełnione szybciej, niż zrobiłby to człowiek.
// Podpis HMAC sprawia, że bot nie podrobi ani tokenu, ani czasu.
// ==========================================================

define('AS_MIN_SECONDS', 3);      // zgłoszenie szybsze niż 3 s = bot
define('AS_MAX_SECONDS', 10800);  // token ważny 3 godziny
define('AS_HONEYPOTS', 'website,pole_kontrolne');

/**
 * Sekret do podpisywania tokenów. Generowany raz, przy pierwszym
 * żądaniu, i zapamiętany w pliku. Kolejność prób:
 *   1. katalog strony (nazwa z kropką — .htaccess blokuje dostęp z zewnątrz),
 *   2. katalog tymczasowy serwera (gdy hosting nie pozwala pisać w katalogu strony),
 *   3. wartość wyliczona z parametrów samego pliku (ostatnia deska ratunku,
 *      gdyby zapis nie działał nigdzie — sekret jest wtedy słabszy,
 *      ale formularz nadal działa).
 */
function as_secret() {
    static $secret = null;
    if ($secret !== null) {
        return $secret;
    }

    $paths = [
        __DIR__ . '/.antispam_secret',
        rtrim(sys_get_temp_dir(), '/\\') . '/.bc_antispam_secret',
    ];

    // Sekret zapisany przy którymś z poprzednich żądań
    foreach ($paths as $path) {
        $val = @file_get_contents($path);
        if (is_string($val) && strlen(trim($val)) >= 32) {
            return $secret = trim($val);
        }
    }

    // Nowy sekret. Plik tworzymy w trybie wyłącznym ('x'), żeby przy dwóch
    // równoczesnych żądaniach nie nadpisać sekretu wygenerowanego przed chwilą.
    $new = bin2hex(random_bytes(32));
    foreach ($paths as $path) {
        $fp = @fopen($path, 'xb');
        if ($fp) {
            fwrite($fp, $new);
            fclose($fp);
            @chmod($path, 0600);
            return $secret = $new;
        }
        $val = @file_get_contents($path);
        if (is_string($val) && strlen(trim($val)) >= 32) {
            return $secret = trim($val);
        }
    }

    return $secret = hash('sha256', __FILE__ . '|' . (string) @filemtime(__FILE__) . '|bodycreator-antyspam');
}

/** Token w formacie: znacznik-czasu.podpis */
function as_issue_token() {
    $ts = time();
    return $ts . '.' . hash_hmac('sha256', (string) $ts, as_secret());
}

/**
 * Zwraca: 'ok' | 'invalid' (brak lub podrobiony token albo za szybko) | 'expired'
 */
function as_check_token($token) {
    if (!is_string($token) || substr_count($token, '.') !== 1) {
        return 'invalid';
    }
    list($ts, $sig) = explode('.', $token, 2);
    if (!ctype_digit($ts) || !preg_match('/^[a-f0-9]{64}$/', $sig)) {
        return 'invalid';
    }
    if (!hash_equals(hash_hmac('sha256', $ts, as_secret()), $sig)) {
        return 'invalid';
    }

    $age = time() - (int) $ts;
    if ($age < AS_MIN_SECONDS) {
        return 'invalid';   // formularz "wypełniony" w ułamku sekundy
    }
    if ($age > AS_MAX_SECONDS) {
        return 'expired';   // np. karta otwarta od rana — człowiek, nie bot
    }
    return 'ok';
}

/** Cicha odmowa: bot dostaje potwierdzenie, więc nie szuka obejścia. */
function as_silent_drop() {
    echo json_encode(['success' => true, 'ok' => true]);
    exit;
}

// ----------------------------------------------------------
// GET — wydanie tokenu dla strony z formularzem
// ----------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'token'       => as_issue_token(),
        'min_seconds' => AS_MIN_SECONDS,
        'max_seconds' => AS_MAX_SECONDS,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'ok' => false, 'error' => 'Niedozwolona metoda.']);
    exit;
}

// ----------------------------------------------------------
// Bramka antyspamowa — przed jakąkolwiek obróbką danych
// ----------------------------------------------------------

// 1. Honeypot: pola niewidoczne dla użytkownika. Cokolwiek w nich jest,
//    wpisał to skrypt czytający formularz "na ślepo".
foreach (explode(',', AS_HONEYPOTS) as $hp) {
    if (trim((string) ($_POST[$hp] ?? '')) !== '') {
        as_silent_drop();
    }
}

// 2. Token: dowód, że formularz został załadowany w przeglądarce
//    i że od załadowania minął czas potrzebny człowiekowi.
$tokenState = as_check_token($_POST['as_token'] ?? null);
if ($tokenState === 'expired') {
    // Realny użytkownik z dawno otwartą stroną — strona pobierze nowy token
    // i ponowi wysyłkę, więc mówimy wprost, co się stało.
    http_response_code(400);
    $err = 'Sesja formularza wygasła. Odśwież stronę i wyślij zgłoszenie ponownie.';
    echo json_encode(['success' => false, 'ok' => false, 'code' => 'token_expired', 'error' => $err, 'message' => $err]);
    exit;
}
if ($tokenState !== 'ok') {
    as_silent_drop();
}

// ==========================================================
// Właściwa obsługa zgłoszenia
// ==========================================================

// Obsługa pól z obu formularzy (kontakt + rezerwacja)
$name     = htmlspecialchars(trim($_POST['name']  ?? $_POST['imie']    ?? ''), ENT_QUOTES, 'UTF-8');
$phone    = htmlspecialchars(trim($_POST['phone'] ?? $_POST['telefon'] ?? ''), ENT_QUOTES, 'UTF-8');
$emailRaw = trim($_POST['email'] ?? '');
$email    = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);

// Formularz kontaktowy
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8');

$isReservation = isset($_POST['imie']) || isset($_POST['telefon']);
$isEvent = (($_POST['formularz'] ?? '') === 'event');

if ($isReservation) {
    if (!$name || !$email || !$phone) {
        http_response_code(400);
        echo json_encode(['success' => false, 'ok' => false, 'error' => 'Wypełnij wszystkie wymagane pola.', 'message' => 'Wypełnij wszystkie wymagane pola.']);
        exit;
    }
    if ($isEvent) {
        $mailSubject = '=?UTF-8?B?' . base64_encode('EVENT: Zapis na przedsprzedaż karnetów — Body Creator') . '?=';
        $body  = "Nowy zapis na PRZEDSPRZEDAŻ KARNETÓW (formularz eventowy)\r\n";
    } else {
        $mailSubject = '=?UTF-8?B?' . base64_encode('Nowa rezerwacja konsultacji — Body Creator') . '?=';
        $body  = "Nowa rezerwacja konsultacji ze strony bodycreator.com.pl\r\n";
    }
    $body .= "=========================================================\r\n\r\n";
    $body .= "Imię: $name\r\n";
    $body .= "Telefon: $phone\r\n";
    $body .= "E-mail: $email\r\n\r\n";

    $newsletter = (($_POST['zgoda_newsletter'] ?? '') === 'tak');
    $zgodaDane  = (($_POST['zgoda_dane'] ?? '') === 'tak');

    $body .= "---------------------------------------------------------\r\n";
    $body .= "Zgoda na przetwarzanie danych: " . ($zgodaDane ? "TAK" : "nie") . "\r\n";
    $body .= "Zapis do newslettera: " . ($newsletter ? "TAK — klient chce otrzymywać newsletter" : "nie") . "\r\n";
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
