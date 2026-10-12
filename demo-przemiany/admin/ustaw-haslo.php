<?php
/* Ustawia hasło do panelu Przemian. Tylko z linii poleceń:
     php admin/ustaw-haslo.php "nowe-haslo"
   Zapisuje hash do dane/haslo.php (plik poza gitem). Na serwer wgraj
   wygenerowany dane/haslo.php przez FTP. */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('PRZ_PANEL', true);
require __DIR__ . '/lib.php';

$pass = $argv[1] ?? '';
if (mb_strlen($pass) < 10) {
    fwrite(STDERR, "Hasło musi mieć co najmniej 10 znaków.\n");
    exit(1);
}
prz_ensure_dirs();
$hash = password_hash($pass, PASSWORD_DEFAULT);
file_put_contents(PRZ_PASS_FILE, "<?php\n// Hasło do panelu Przemian (hash). Nie commituj.\nreturn ['hash' => " . var_export($hash, true) . "];\n");
echo "Zapisano hasło w dane/haslo.php\n";
