<?php
/* Body Creator — panel Przemian: wspólna logika.
   ------------------------------------------------------------------
   - dane:       ../dane/przemiany.json (źródło prawdy, z kopią przy każdym zapisie)
   - publikacja: ../przemiany-data.js (generowany, tylko widoczne cele i przemiany)
   - pliki:      ../uploads/ (zdjęcia webp/jpg, wideo mp4)
   - hasło:      ../dane/haslo.php (poza gitem, tworzy go admin/ustaw-haslo.php)
   Kod zgodny z PHP 7.4+.
   ------------------------------------------------------------------ */

if (!defined('PRZ_PANEL')) { http_response_code(403); exit; }

define('PRZ_ROOT', dirname(__DIR__));
define('PRZ_DATA_DIR', PRZ_ROOT . '/dane');
define('PRZ_DATA_FILE', PRZ_DATA_DIR . '/przemiany.json');
define('PRZ_BACKUP_DIR', PRZ_DATA_DIR . '/kopie');
define('PRZ_TMP_DIR', PRZ_DATA_DIR . '/tmp');
define('PRZ_SESSION_DIR', PRZ_DATA_DIR . '/sesje');
define('PRZ_PASS_FILE', PRZ_DATA_DIR . '/haslo.php');
define('PRZ_ATTEMPTS_FILE', PRZ_DATA_DIR . '/proby-logowania.json');
define('PRZ_SEED_FILE', __DIR__ . '/seed.json');
define('PRZ_PUBLIC_JS', PRZ_ROOT . '/przemiany-data.js');
define('PRZ_UPLOAD_DIR', PRZ_ROOT . '/uploads');

define('PRZ_BACKUPS_KEEP', 60);
define('PRZ_SESSION_IDLE', 4 * 3600);        // wylogowanie po 4 h bezczynności
define('PRZ_LOGIN_MAX_FAILS', 5);            // 5 błędnych haseł...
define('PRZ_LOGIN_WINDOW', 15 * 60);         // ...w 15 minut = blokada na 15 minut
define('PRZ_IMAGE_MAX_BYTES', 5 * 1024 * 1024);
define('PRZ_VIDEO_MAX_BYTES', 300 * 1024 * 1024);
define('PRZ_CHUNK_BYTES', 12 * 1024);            // patrz prz_upload_chunk()

class PrzError extends Exception {
    public $status;
    public function __construct($message, $status = 400) {
        parent::__construct($message);
        $this->status = $status;
    }
}

/* ===== SESJA I LOGOWANIE ===== */

function prz_session_start() {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    session_name('BCPANEL');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    ini_set('session.use_strict_mode', '1');
    // Własny katalog sesji: domyślny na home.pl nie zachowuje sesji między zapytaniami
    if (!is_dir(PRZ_SESSION_DIR)) @mkdir(PRZ_SESSION_DIR, 0700, true);
    if (is_dir(PRZ_SESSION_DIR) && is_writable(PRZ_SESSION_DIR)) {
        session_save_path(PRZ_SESSION_DIR);
        ini_set('session.gc_probability', '1');
        ini_set('session.gc_divisor', '50');
        ini_set('session.gc_maxlifetime', (string)PRZ_SESSION_IDLE);
    }
    session_start();
}

function prz_is_logged_in() {
    prz_session_start();
    if (empty($_SESSION['prz_admin'])) return false;
    // Wylogowanie po bezczynności albo po zmianie hasła (na innym urządzeniu)
    if (time() - (int)($_SESSION['prz_seen'] ?? 0) > PRZ_SESSION_IDLE
        || !hash_equals(prz_password_fingerprint(), (string)($_SESSION['prz_pass'] ?? ''))) {
        prz_logout();
        return false;
    }
    $_SESSION['prz_seen'] = time();
    return true;
}

function prz_csrf_token() {
    prz_session_start();
    if (empty($_SESSION['prz_csrf'])) $_SESSION['prz_csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['prz_csrf'];
}

function prz_check_csrf() {
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || empty($_SESSION['prz_csrf']) || !hash_equals($_SESSION['prz_csrf'], $sent)) {
        throw new PrzError('Sesja wygasła. Odśwież stronę i spróbuj ponownie.', 403);
    }
}

function prz_password_hash() {
    if (!is_file(PRZ_PASS_FILE)) return null;
    $cfg = include PRZ_PASS_FILE;
    return (is_array($cfg) && !empty($cfg['hash'])) ? $cfg['hash'] : null;
}

function prz_password_fingerprint() {
    $hash = prz_password_hash();
    return $hash ? hash('sha256', $hash) : '';
}

define('PRZ_PASSWORD_MIN', 8);

function prz_write_password($password) {
    prz_ensure_dirs();
    $hash = password_hash($password, PASSWORD_DEFAULT);
    prz_write_atomic(PRZ_PASS_FILE, "<?php\n// Hasło do panelu Przemian (hash). Nie commituj.\nreturn ['hash' => " . var_export($hash, true) . "];\n");
    if (function_exists('opcache_invalidate')) @opcache_invalidate(PRZ_PASS_FILE, true);
}

function prz_client_key() {
    return hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'cli');
}

/* Limit prób logowania: licznik błędów per IP w pliku, pod blokadą */
function prz_attempts($fn) {
    prz_ensure_dirs();
    $fh = fopen(PRZ_ATTEMPTS_FILE, 'c+');
    if (!$fh) { $none = []; return $fn($none); }
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $all = json_decode($raw ?: '[]', true);
    if (!is_array($all)) $all = [];
    $now = time();
    foreach ($all as $k => $v) {
        if ($now - (int)($v['first'] ?? 0) > PRZ_LOGIN_WINDOW) unset($all[$k]);
    }
    $result = $fn($all);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($all));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $result;
}

/* Sprawdzenie hasła z limitem prób (logowanie i zmiana hasła liczą się razem) */
function prz_verify_password($password) {
    $hash = prz_password_hash();
    if (!$hash) throw new PrzError('Panel nie ma jeszcze ustawionego hasła.', 503);
    $key = prz_client_key();

    $blocked = prz_attempts(function (&$all) use ($key) {
        return isset($all[$key]) && $all[$key]['count'] >= PRZ_LOGIN_MAX_FAILS;
    });
    if ($blocked) throw new PrzError('Za dużo nieudanych prób. Spróbuj ponownie za 15 minut.', 429);

    if (!is_string($password) || !password_verify($password, $hash)) {
        prz_attempts(function (&$all) use ($key) {
            if (!isset($all[$key])) $all[$key] = ['count' => 0, 'first' => time()];
            $all[$key]['count']++;
        });
        usleep(400000);
        return false;
    }
    prz_attempts(function (&$all) use ($key) { unset($all[$key]); });
    return true;
}

function prz_start_admin_session() {
    prz_session_start();
    session_regenerate_id(true);
    $_SESSION['prz_admin'] = true;
    $_SESSION['prz_seen'] = time();
    $_SESSION['prz_pass'] = prz_password_fingerprint();
    $_SESSION['prz_csrf'] = bin2hex(random_bytes(32));
}

function prz_login($password) {
    if (!prz_verify_password($password)) throw new PrzError('Nieprawidłowe hasło.', 401);
    prz_start_admin_session();
}

function prz_change_password($current, $new, $repeat) {
    if (!is_string($new) || !is_string($repeat)) throw new PrzError('Nieprawidłowe dane.');
    if ($new !== $repeat) throw new PrzError('Nowe hasła nie są takie same.');
    if (mb_strlen($new) < PRZ_PASSWORD_MIN) throw new PrzError('Nowe hasło musi mieć co najmniej ' . PRZ_PASSWORD_MIN . ' znaków.');
    if (mb_strlen($new) > 200) throw new PrzError('Nowe hasło jest za długie.');
    // Błędne obecne hasło nie wylogowuje, ale liczy się do blokady prób
    if (!prz_verify_password($current)) throw new PrzError('Obecne hasło jest nieprawidłowe.', 400);
    prz_write_password($new);
    // Ta sesja zostaje (nowy identyfikator), pozostałe urządzenia zostaną wylogowane
    prz_start_admin_session();
}

function prz_logout() {
    prz_session_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Strict']);
    }
    session_destroy();
}

/* ===== DANE ===== */

function prz_ensure_dirs() {
    foreach ([PRZ_DATA_DIR, PRZ_BACKUP_DIR, PRZ_TMP_DIR, PRZ_UPLOAD_DIR] as $dir) {
        if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
            throw new PrzError('Nie można utworzyć katalogu na serwerze: ' . basename($dir), 500);
        }
    }
}

function prz_read_json($file) {
    $raw = @file_get_contents($file);
    if ($raw === false) return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function prz_load() {
    $data = prz_read_json(PRZ_DATA_FILE);
    if ($data === null) {
        // Pierwsze uruchomienie: start z danych demo
        $data = prz_read_json(PRZ_SEED_FILE);
        if ($data === null) throw new PrzError('Brak danych przemian na serwerze.', 500);
    }
    $data += ['version' => 1, 'rev' => 0, 'settings' => [], 'areas' => [], 'categories' => [], 'cases' => [], 'trainers' => new stdClass()];
    $data['settings'] += ['hideEmpty' => false];
    return $data;
}

/* Zmiana danych pod blokadą: wczytaj → $fn → kopia → zapis atomowy → publikacja */
function prz_mutate($fn) {
    prz_ensure_dirs();
    $lock = fopen(PRZ_DATA_DIR . '/.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new PrzError('Nie można zablokować danych do zapisu.', 500);
    try {
        $data = prz_load();
        $result = $fn($data);
        $data['rev'] = (int)$data['rev'] + 1;
        $data['updated'] = gmdate('c');
        prz_backup();
        prz_write_atomic(PRZ_DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        prz_publish($data);
        return [$data, $result];
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function prz_write_atomic($file, $content) {
    $tmp = $file . '.tmp-' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $content) === false || !rename($tmp, $file)) {
        @unlink($tmp);
        throw new PrzError('Zapis na serwerze się nie powiódł.', 500);
    }
}

function prz_backup() {
    if (!is_file(PRZ_DATA_FILE)) return;
    copy(PRZ_DATA_FILE, PRZ_BACKUP_DIR . '/przemiany-' . date('Ymd-His') . '-' . bin2hex(random_bytes(2)) . '.json');
    $files = glob(PRZ_BACKUP_DIR . '/przemiany-*.json');
    sort($files);
    while (count($files) > PRZ_BACKUPS_KEEP) @unlink(array_shift($files));
}

/* Wersja publiczna: tylko widoczne cele i przemiany, bez pól panelu */
function prz_public_data($data) {
    $visibleCases = array_values(array_filter($data['cases'], function ($c) { return !empty($c['visible']); }));
    $count = [];
    foreach ($visibleCases as $c) $count[$c['category']] = ($count[$c['category']] ?? 0) + 1;

    $cats = [];
    foreach ($data['categories'] as $cat) {
        if (empty($cat['visible'])) continue;
        if (!empty($data['settings']['hideEmpty']) && empty($count[$cat['slug']])) continue;
        unset($cat['visible']);
        $cats[$cat['slug']] = $cat;
    }
    $cases = [];
    foreach ($visibleCases as $c) {
        if (!isset($cats[$c['category']])) continue;
        unset($c['visible']);
        $cases[] = $c;
    }
    return [
        'areas' => $data['areas'],
        'categories' => array_values($cats),
        'cases' => $cases,
        'trainers' => $data['trainers'] ?: new stdClass(),
    ];
}

function prz_publish($data) {
    $json = json_encode(prz_public_data($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
    $js = "/* Body Creator — dane sekcji Przemiany.\n"
        . "   PLIK GENEROWANY przez panel (admin/). Nie edytuj ręcznie: następny zapis w panelu go nadpisze.\n"
        . "   Źródło: dane/przemiany.json. Wygenerowano: " . gmdate('Y-m-d H:i:s') . " UTC, wersja " . (int)$data['rev'] . ". */\n"
        . "window.BC_PRZEMIANY = " . $json . ";\n";
    prz_write_atomic(PRZ_PUBLIC_JS, $js);
}

/* ===== WALIDACJA ===== */

function prz_text($v, $max, $multiline = false) {
    if ($v === null) return '';
    if (is_int($v) || is_float($v)) $v = (string)$v;
    if (!is_string($v)) throw new PrzError('Nieprawidłowy format pola.');
    if (!mb_check_encoding($v, 'UTF-8')) throw new PrzError('Nieprawidłowe znaki w tekście.');
    $v = str_replace("\r\n", "\n", $v);
    $v = preg_replace($multiline ? '/[\x00-\x09\x0B-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u', '', $v);
    if (!$multiline) $v = preg_replace('/\s+/u', ' ', $v);
    $v = trim($v);
    if (mb_strlen($v) > $max) throw new PrzError('Tekst jest za długi (maks. ' . $max . ' znaków).');
    return $v;
}

/* Ścieżka do pliku: tylko nasze uploady albo istniejące zasoby demo */
function prz_media_path($v, $kind) {
    $v = prz_text($v, 200);
    if ($v === '') return '';
    $ext = $kind === 'video' ? 'mp4' : '(?:webp|jpe?g|png)';
    $ok = preg_match('#^uploads/[a-f0-9]{24}\.' . $ext . '$#', $v)
        || preg_match('#^\.\./(?:zdjecia_przed_po|video)/[A-Za-z0-9_\-/]+\.' . $ext . '$#', $v);
    if (!$ok || strpos($v, '/../') !== false) throw new PrzError('Nieprawidłowa ścieżka pliku.');
    return $v;
}

function prz_slugify($text) {
    $map = ['ą' => 'a', 'ć' => 'c', 'ę' => 'e', 'ł' => 'l', 'ń' => 'n', 'ó' => 'o', 'ś' => 's', 'ź' => 'z', 'ż' => 'z'];
    $s = strtr(mb_strtolower($text, 'UTF-8'), $map);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    $s = trim(substr(trim($s, '-'), 0, 50), '-');
    return $s !== '' ? $s : 'cel';
}

function prz_unique($base, $taken) {
    $s = $base;
    for ($i = 2; in_array($s, $taken, true); $i++) $s = $base . '-' . $i;
    return $s;
}

function prz_find_index($list, $key, $value) {
    foreach ($list as $i => $item) if (($item[$key] ?? null) === $value) return $i;
    return -1;
}

/* Ustawia pole albo usuwa klucz, gdy wartość jest pusta (front pomija brakujące pola) */
function prz_set(&$arr, $key, $value) {
    if ($value === '' || $value === null || $value === []) unset($arr[$key]);
    else $arr[$key] = $value;
}

function prz_validate_category($in, $data, $existing) {
    $title = prz_text($in['title'] ?? '', 80);
    if ($title === '') throw new PrzError('Podaj nazwę celu.');
    $area = (string)($in['area'] ?? '');
    if (prz_find_index($data['areas'], 'id', $area) < 0) throw new PrzError('Wybierz obszar.');

    $cat = $existing ?: [];
    $cat['area'] = $area;
    $cat['title'] = $title;
    prz_set($cat, 'tagline', prz_text($in['tagline'] ?? '', 200));
    $cat['visible'] = !empty($in['visible']);
    return $cat;
}

function prz_validate_case($in, $data, $existing) {
    $c = $existing ?: [];

    $category = (string)($in['category'] ?? '');
    $ci = prz_find_index($data['categories'], 'slug', $category);
    if ($ci < 0) throw new PrzError('Wybierz cel przemiany.');
    $c['category'] = $category;

    $before = prz_media_path($in['before'] ?? '', 'image');
    $after = prz_media_path($in['after'] ?? '', 'image');
    if (($before === '') !== ($after === '')) throw new PrzError('Dodaj oba zdjęcia: przed i po (albo żadnego).');
    prz_set($c, 'before', $before);
    prz_set($c, 'after', $after);

    prz_set($c, 'highlight', prz_text($in['highlight'] ?? '', 40));
    prz_set($c, 'name', prz_text($in['name'] ?? '', 40));
    $age = $in['age'] ?? '';
    if ($age !== '' && $age !== null) {
        if (!preg_match('/^\d{1,3}$/', (string)$age) || (int)$age < 1 || (int)$age > 110) throw new PrzError('Wiek musi być liczbą od 1 do 110.');
        $c['age'] = (int)$age;
    } else {
        unset($c['age']);
    }
    prz_set($c, 'duration', prz_text($in['duration'] ?? '', 40));

    prz_set($c, 'goal', prz_text($in['goal'] ?? '', 1200, true));
    $actions = $in['actions'] ?? [];
    if (is_string($actions)) $actions = explode("\n", $actions);
    if (!is_array($actions)) throw new PrzError('Nieprawidłowe podjęte działania.');
    $actions = array_values(array_filter(array_map(function ($a) { return prz_text($a, 300); }, $actions), 'strlen'));
    if (count($actions) > 15) throw new PrzError('Maksymalnie 15 punktów w podjętych działaniach.');
    prz_set($c, 'actions', $actions);
    prz_set($c, 'effects', prz_text($in['effects'] ?? '', 1200, true));

    prz_set($c, 'quote', prz_text($in['quote'] ?? '', 1200, true));
    prz_set($c, 'condition', prz_text($in['condition'] ?? '', 120));
    prz_set($c, 'video', prz_media_path($in['video'] ?? '', 'video'));
    $c['visible'] = !empty($in['visible']);

    // Bez zdjęć, opisu i opinii przemiana nie ma czego pokazać na stronie
    if (empty($c['after']) && empty($c['goal']) && empty($c['actions']) && empty($c['effects']) && empty($c['quote'])) {
        throw new PrzError('Dodaj zdjęcia przed/po, opis albo opinię klienta.');
    }
    return $c;
}

/* ===== PLIKI ===== */

function prz_random_name($ext) {
    return 'uploads/' . bin2hex(random_bytes(12)) . '.' . $ext;
}

/* Upload plików w częściach, jako surowe body zapytania (parametry w adresie).
   Na home.pl (PHP przez uWSGI) katalog /tmp nie ma prawa zapisu, a body powyżej
   ~16 KB jest tam buforowane i dochodzi do PHP puste. Dlatego części mają
   PRZ_CHUNK_BYTES, a plik składamy sami w dane/tmp/. Gdy hosting naprawi /tmp,
   wystarczy podnieść PRZ_CHUNK_BYTES (np. do 4 MB). */
function prz_upload_chunk($kind, $uid, $offset, $total) {
    $kinds = [
        'image' => ['max' => PRZ_IMAGE_MAX_BYTES, 'tooBig' => 'Zdjęcie jest za duże (maks. 5 MB).'],
        'video' => ['max' => PRZ_VIDEO_MAX_BYTES, 'tooBig' => 'Film jest za duży (maks. 300 MB).'],
    ];
    if (!isset($kinds[$kind])) throw new PrzError('Nieznany typ pliku.');
    if (!preg_match('/^[a-f0-9]{32}$/', (string)$uid)) throw new PrzError('Nieprawidłowy identyfikator wysyłki.');
    $offset = (int)$offset;
    $total = (int)$total;
    if ($total < 1) throw new PrzError('Nie wybrano pliku.');
    if ($total > $kinds[$kind]['max']) throw new PrzError($kinds[$kind]['tooBig']);
    prz_ensure_dirs();

    if ($offset === 0) {
        foreach (glob(PRZ_TMP_DIR . '/*.part') ?: [] as $old) {
            if (filemtime($old) < time() - 86400) @unlink($old);
        }
    }
    $part = PRZ_TMP_DIR . '/' . $uid . '.part';
    clearstatcache(true, $part);
    $have = is_file($part) ? filesize($part) : 0;
    if ($have !== $offset) throw new PrzError('Przerwana wysyłka pliku. Spróbuj jeszcze raz.', 409);

    $in = fopen('php://input', 'rb');
    $out = fopen($part, $offset === 0 ? 'wb' : 'ab');
    if (!$in || !$out) throw new PrzError('Nie udało się zapisać pliku na serwerze.', 500);
    $got = stream_copy_to_stream($in, $out, $total - $offset + 1);
    fclose($in);
    fclose($out);
    clearstatcache(true, $part);
    $have = filesize($part);
    if (!$got || $have > $total) {
        @unlink($part);
        throw new PrzError('Część pliku nie dotarła na serwer. Spróbuj jeszcze raz.');
    }
    if ($have < $total) return ['done' => false, 'received' => $have];

    try {
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($part);
        if ($kind === 'video') {
            if ($mime !== 'video/mp4') throw new PrzError('Dozwolone są tylko filmy MP4. Z iPhone’a wyeksportuj film jako „Najbardziej zgodny” (H.264).');
            $ext = 'mp4';
        } else {
            $exts = ['image/webp' => 'webp', 'image/jpeg' => 'jpg', 'image/png' => 'png'];
            if (!isset($exts[$mime])) throw new PrzError('Dozwolone są tylko zdjęcia WEBP, JPG lub PNG.');
            $dim = @getimagesize($part);
            if (!$dim || $dim[0] < 100 || $dim[1] < 100 || $dim[0] > 4000 || $dim[1] > 4000) throw new PrzError('Nieprawidłowe wymiary zdjęcia.');
            $ext = $exts[$mime];
        }
        $path = prz_random_name($ext);
        if (!rename($part, PRZ_ROOT . '/' . $path)) throw new PrzError('Nie udało się zapisać pliku.', 500);
        @chmod(PRZ_ROOT . '/' . $path, 0644);
        return ['done' => true, 'path' => $path];
    } finally {
        if (is_file($part)) @unlink($part);
    }
}
