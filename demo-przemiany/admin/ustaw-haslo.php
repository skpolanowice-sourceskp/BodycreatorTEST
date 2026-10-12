<?php
/* Ustawia hasło do panelu Przemian. Tylko z linii poleceń:
     php admin/ustaw-haslo.php "nowe-haslo"
   Zapisuje hash do dane/haslo.php (plik poza gitem). Na serwer wgraj
   wygenerowany dane/haslo.php przez FTP. Klient zmienia hasło sam w panelu
   (Hasło w górnym pasku). */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('PRZ_PANEL', true);
require __DIR__ . '/lib.php';

$pass = $argv[1] ?? '';
if (mb_strlen($pass) < PRZ_PASSWORD_MIN) {
    fwrite(STDERR, 'Hasło musi mieć co najmniej ' . PRZ_PASSWORD_MIN . " znaków.\n");
    exit(1);
}
prz_write_password($pass);
echo "Zapisano hasło w dane/haslo.php\n";
