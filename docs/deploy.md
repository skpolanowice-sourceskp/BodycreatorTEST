# Deploy i testowanie

## Zasada nr 1

**Nigdy nie wgrywaj na FTP przed przetestowaniem lokalnym.** FTP to zmiana widoczna na żywej stronie. Kod 226 oznacza tylko, że plik się przesłał, a nie że strona działa. Wgrywaj wyłącznie na wyraźną prośbę użytkownika.

## FTP

- Host: home.pl, protokół FTP, port 21.
- Mapowanie: lokalny `BodycreatorTEST/` → zdalny `/bodycreatorMJ/`.
- Dane logowania są w `../sftp.json`, czyli w katalogu **nad** repozytorium (konfiguracja rozszerzenia SFTP w VS Code, `uploadOnSave: false`). **Plik zawiera hasło: nigdy go nie commituj, nie wypisuj, nie kopiuj do repo.**
- Ignorowane przy uploadzie: `.git`, `node_modules`, `.env`.
- Wgrywaj tylko zmienione pliki. Przy zmianach w sekcji Przemiany pamiętaj o plikach wspólnych: `przemiany.css`, `przemiany.js`, `przemiany-data.js`.
- `.htaccess` ma długi cache dla CSS/JS (1 rok). Po zmianie `przemiany.css` / `przemiany.js` może być potrzebny parametr wersji w `<link>` / `<script>` (np. `?v=2`), żeby powracający użytkownicy zobaczyli zmianę.

## Panel Przemian

Od uruchomienia panelu **dane Przemian żyją na serwerze**, nie w repo.

- **Nigdy nie wgrywaj z lokalnego repo** na serwer: `demo-przemiany/przemiany-data.js`, `demo-przemiany/dane/*` (poza pierwszym `haslo.php`) ani `demo-przemiany/uploads/*`. Nadpisałbyś zmiany klienta. Kopia danych z serwera: pobrać `dane/przemiany.json` i `uploads/` przez FTP.
- Pierwsze wdrożenie: lokalnie `php admin/ustaw-haslo.php "haslo"`, potem wgrać `dane/haslo.php`. Hasło przekazać klientowi osobnym kanałem. Zmiana hasła: to samo jeszcze raz.
- PHP na serwerze musi mieć prawo zapisu do `demo-przemiany/`, `dane/` i `uploads/` (`dane/kopie` i `dane/tmp` tworzą się same).
- Po wgraniu sprawdzić, że `dane/haslo.php`, `dane/przemiany.json`, `admin/lib.php` i `admin/seed.json` zwracają 403. `php -S` ignoruje `.htaccess`, więc lokalnie tego nie sprawdzisz.

## Testowanie lokalne

```bash
# w katalogu BodycreatorTEST/
python -m http.server 8000        # strony statyczne
php -S localhost:8000             # send_mail.php albo panel Przemian
```

Otwórz `http://localhost:8000/<strona>.html`. Nie testuj przez `file://`, bo `fetch` i część skryptów nie zadziała.

### Zrzuty w trybie headless (bez rozszerzenia przeglądarki)

Headless Chrome ma minimalną szerokość okna ok. 500px, więc widoku 390px nie da się ustawić wprost. Sposób: tymczasowy plik z `<iframe style="width:390px">` ładującym stronę, zrzut, potem przycięcie do 390px. Przydatne flagi:
- `--force-prefers-reduced-motion`: wyłącza animacje wejścia, które w headless potrafią zostać w połowie;
- `--virtual-time-budget=12000`: czas na załadowanie zasobów.

Prościej: `puppeteer-core` (npm, w katalogu tymczasowym) z systemowym Chrome i `page.setViewport({ width: 390, isMobile: true, hasTouch: true })`. Viewport 390px działa wtedy bez iframe'a. Uwaga: przy `networkidle0` strony z wideo w tle się nie doczekasz, używaj `load`. Panel przy niezapisanych zmianach blokuje wyjście (`beforeunload`), więc do kolejnej strony otwieraj nową kartę.

Pliki pomocnicze trzymaj poza repo albo usuń po teście.

### PHP lokalnie (panel Przemian)

PHP 8.4 jest zainstalowany przez winget, ale **nie ma go w PATH**: `%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`. Nie ma też `php.ini`, więc rozszerzenia trzeba włączyć własnym plikiem (`php -c moj.ini`):

```ini
extension_dir="<katalog php>/ext"
extension=fileinfo
extension=mbstring
extension=openssl
```

- **Nie testuj na lokalnym `demo-przemiany/dane/`**: `haslo.php` może być tym samym plikiem co na serwerze. Skopiuj `demo-przemiany/` (plus `bc-znak.webp`, `logobezpodpisu.png`) do katalogu tymczasowego, usuń w kopii `dane/haslo.php`, ustaw hasło testowe (`php admin/ustaw-haslo.php`) i uruchom `php -S 127.0.0.1:8766 -t <kopia>`.
- Testowe filmy: `ffmpeg -f lavfi -i testsrc=size=720x1280:rate=30 -t 2 -c:v libx264 -f mov h264.mov` (HEVC: `-c:v libx265 -tag:v hvc1`).

### Przed nadpisaniem plików na serwerze

Pobierz zdalne wersje przez FTP i porównaj z poprzednim commitem (bez różnic CRLF). Jeśli się różnią, ktoś poprawiał na serwerze: najpierw scal, potem wgrywaj.

## Checklista przed wgraniem

- [ ] Widok mobile ~390px: brak poziomego scrolla, CTA widoczne, nawigacja działa.
- [ ] Widok desktop ~1440px.
- [ ] Konsola bez błędów JS.
- [ ] Linki między podstronami działają (okruszki, CTA → `rezerwacja.html`).
- [ ] Brak danych przykładowych tam, gdzie mają być prawdziwe (Przemiany!).
- [ ] Formularze: token i honeypoty obecne (jeśli były zmieniane).
- [ ] Nowa indeksowana podstrona: `canonical`, `sitemap.xml`, meta description.
- [ ] Zmiany pokazane użytkownikowi i zaakceptowane.
