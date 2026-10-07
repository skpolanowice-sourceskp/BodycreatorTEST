# Architektura i konwencje

## Stos technologiczny

- Statyczne pliki HTML, CSS i vanilla JS. Bez bundlera, bez npm-owego builda.
  `package.json` zawiera tylko `ffmpeg-static`, używany lokalnie do obróbki wideo, nie przez stronę.
- PHP tylko w `send_mail.php` (formularze), patrz [formularze.md](formularze.md).
- Apache na home.pl, konfiguracja w `.htaccess` (patrz [seo.md](seo.md)).
- Zewnętrzne zasoby z CDN:
  - Google Fonts: Inter 300–900
  - Font Awesome 6.5.1: `cdnjs.cloudflare.com`
  - Lenis 1.0.42 (smooth scroll): `cdn.jsdelivr.net`

## Podstrony

| Plik | Rola | W sitemap |
|---|---|---|
| `index.html` | Strona główna (hero z wideo, opinie, nawigacja do podstron) | tak |
| `oferta.html` | Warianty współpracy: personalny, hybrydowy, grupowy, online | tak |
| `o-nas.html` | Zespół trenerów i studio | tak |
| `przemiany.html` | Obecna (stara) strona przemian | tak |
| `demo-przemiany/` | **Ukryte demo** nowej sekcji Przemiany (hub, `kategoria.html?k=`, `case-study.html?id=`), `noindex`. Patrz [przemiany.md](przemiany.md) | nie |
| `kalkulator.html` | Kalkulator TDEE / BMI | tak |
| `rezerwacja.html` | Formularz darmowej konsultacji (główny cel konwersji) | tak |
| `kontakt.html` | Adres, telefon, mapa | tak |
| `polityka-prywatnosci.html` | RODO | tak |
| `event.html` | Landing przedsprzedaży karnetów (`noindex`) | nie |
| `formularzeventowy.html` | Formularz zapisu na przedsprzedaż (`noindex`) | nie |
| `google79c7a3b6a6e8553f.html` | Weryfikacja Google Search Console. **Nie usuwać.** | nie |

## Wspólne elementy (powielone w każdym pliku)

Poza sekcją Przemiany **każdy HTML ma własny CSS inline** w `<head>` oraz skopiowane:

- **Loader** `#page-loader`: kręcące się logo + napis LOADING. Znika po `load`, minimum 600 ms.
- **Nawigacja** `.navbar`:
  - logo po lewej, na środku CTA „Darmowa konsultacja” + telefon, po prawej hamburger;
  - pełnoekranowe menu `.nav-overlay`;
  - po scrollu > 50px dostaje klasę `.scrolled` (tło + blur).
- **Stopka** `.footer`: linki + copyright.
- **WhatsApp** `.whatsapp-float`: pływający przycisk w prawym dolnym rogu.
- **`bg-rotator.js`**: stałe tło wideo z płynnym przejściem między klipami z `video/bg/` i ciemną nakładką. Wyłącza się przy `prefers-reduced-motion`.
- **Lenis**: smooth scroll.

**Konsekwencja:** zmiana w menu, stopce czy numerze telefonu wymaga edycji **wszystkich** plików HTML. Szukaj grepem, np. `518 167 945` albo `nav-menu`.

## Sekcja Przemiany: wspólne pliki (w `demo-przemiany/`)

| Plik | Zawartość |
|---|---|
| `przemiany.css` | Tokeny, nawigacja, loader, przyciski, suwak przed/po, CTA, stopka |
| `przemiany.js` | Obiekt `window.BC`: dostęp do danych, odmiana (`plural`, `age`), `sliderHTML`, `initSliders`, `initReveal`, `whoLine`, `altFor`; plus obsługa nawigacji, loadera i Lenis |
| `przemiany-data.js` | `window.BC_PRZEMIANY`: obszary, cele, przemiany, trenerzy |

Szczegóły: [przemiany.md](przemiany.md).

## Zasoby

- `zdjecia_przed_po/` — pary `Nprzed.webp` / `Npo.webp` (proporcje 5:8, 500×800) + oryginały `.jpeg`.
- `Trenerzy/` — zdjęcia trenerów (`.webp` + `.png`).
- `zdjecia_obiektu/` — zdjęcia studia.
- `video/bg/` — klipy tła dla `bg-rotator.js` (już spowolnione, przyciemnione i odbarwione).
- `*-bg.mp4` w katalogu głównym — tła sekcji poszczególnych podstron.
- `3d/` — model `.glb`.
- `Logo*.psd/.psb` — pliki źródłowe. Blokowane przez `.htaccess`, nie linkować.
- `google_statystyki/` — eksport CSV z Search Console (dane robocze).

## Konwencje kodu

- Treść i komentarze **po polsku**. Komentarze sekcji w formacie `/* ===== NAZWA ===== */`.
- Kolory przez zmienne CSS (`--yellow`, `--dark`, `--dark-2`…). Pełny system w [../DESIGN.md](../DESIGN.md).
- Breakpointy: `1024px` (tablet), `768px` (mobile), `480px` (mały telefon). Nawigacja kurczy się przy 480px.
- Nagłówki sekcji: `.section-label` (złota etykieta) + nagłówek UPPERCASE 800/900.
- Zdjęcia: `loading="lazy"` poza pierwszym ekranem, alt opisowy po polsku, z „Wrocław” tam, gdzie ma to sens dla SEO.
- Bez em dashy w nowych tekstach UI (przecinek, dwukropek, kropka).
- Animacje: wejście `.reveal` (IntersectionObserver), easing `cubic-bezier(0.22, 1, 0.36, 1)`. Zawsze z obsługą `prefers-reduced-motion`.
- Zakazy z DESIGN.md: gradient-text, glassmorphism dekoracyjnie, kolorowe paski `border-left`, drugi kolor akcentu.
