# SEO i konfiguracja serwera

## Adres kanoniczny

- Jedyny poprawny adres: `https://bodycreator.com.pl/` (HTTPS, **bez www**).
- `.htaccess` przekierowuje 301: HTTP → HTTPS (z zabezpieczeniem przed pętlą za proxy) oraz www → bez www.
- Każda indeksowana podstrona ma `<link rel="canonical">` wskazujący na siebie, zgodny z `sitemap.xml`.

## Pliki

- **`sitemap.xml`**: 8 indeksowanych stron (index, oferta, rezerwacja, o-nas, przemiany, kalkulator, kontakt, polityka-prywatnosci). Nowa indeksowana podstrona musi tu trafić.
- **`robots.txt`**: wszystko dozwolone poza plikami roboczymi. Boty AI (GPTBot, ClaudeBot, Google-Extended) są dopuszczone.
- **`noindex`**: `event.html`, `formularzeventowy.html` (kampanijne).
- **`google79c7a3b6a6e8553f.html`**: weryfikacja Search Console. Nie usuwać.
- **`google_statystyki/`**: eksporty CSV z Search Console (zapytania, strony, urządzenia). Dobre źródło przy decyzjach o treści.

## `.htaccess`

1. Przekierowania kanoniczne (patrz wyżej).
2. Kompresja `mod_deflate` (HTML, CSS, JS, JSON, SVG).
3. Cache: HTML 1 h; CSS/JS/obrazy/wideo/fonty 1 rok; XML/TXT 1 dzień.
4. Nagłówki: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`.
5. Typy MIME dla webm/webp/woff2.
6. **Blokada plików roboczych:** `.psd .psb .rar .json .md .txt` (poza `robots.txt` i manifestami) oraz wszystkich plików zaczynających się od kropki. Dlatego `CLAUDE.md`, `docs/*.md`, `DESIGN.md`, `PRODUCT.md` i `.antispam_secret` są niedostępne z zewnątrz, nawet jeśli trafią na serwer.

## Dane strukturalne

Strony mają JSON-LD w `<head>`:
- `["LocalBusiness", "HealthClub"(, "SportsActivityLocation")]` z adresem, geo i godzinami otwarcia;
- `BreadcrumbList`;
- typy zależne od strony: `FAQPage`, `Service`/`Offer`, `Person` (trenerzy), `Review`/`AggregateRating`, `AboutPage`, `ContactPage`, `CollectionPage`, `WebApplication` (kalkulator), `SaleEvent` (event).

Przy zmianie adresu, telefonu lub godzin trzeba zaktualizować JSON-LD **we wszystkich plikach**. Adres: ul. Rafała Wojaczka 3g, 51-168 Wrocław; geo 51.1449, 17.0792.

## Lokalne SEO

Frazy docelowe: „trener personalny Wrocław”, „Sołtysowice”, „trening personalny Wrocław”. W tytułach i altach zdjęć używaj „Wrocław”, ale bez upychania słów kluczowych.

## Otwarte kwestie

- `kategoria.html` i `case-study.html` renderują treść w JS i nie mają `canonical` ani wpisów w sitemap. Google je zobaczy, ale gorzej niż HTML z serwera. Rozwiązanie przy backendzie: render po stronie PHP z ładnymi adresami. Patrz [przemiany.md](przemiany.md#plan-backendu).
