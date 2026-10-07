# Body Creator — kontekst projektu

Strona marketingowa **Body Creator**, studia treningu personalnego we Wrocławiu (ul. Rafała Wojaczka 3g, Sołtysowice). Domena: `https://bodycreator.com.pl` (bez www, HTTPS). Cel strony: zamiana odwiedzających w klientów, czyli umówienie darmowej konsultacji (`rezerwacja.html`) lub telefon (518 167 945).

Statyczne HTML + CSS + vanilla JS, jeden plik PHP (`send_mail.php`). Bez bundlera i bez frameworka. Hosting: home.pl (Apache, PHP).

## Zasady krytyczne

1. **Nigdy nie wgrywaj na FTP bez testu lokalnego.** Najpierw render w przeglądarce, w tym mobile ~390px. FTP 226 oznacza tylko, że plik się wgrał, a nie że strona działa. Szczegóły: [docs/deploy.md](docs/deploy.md).
2. **Push/FTP/commit tylko na wyraźną prośbę użytkownika.**
3. **Mobile-first.** Każdą zmianę layoutu testuj najpierw przy ~390px. Pierwsza decyzja klienta zapada na telefonie.
4. **Nie commituj sekretów.** `sftp.json` (hasło FTP) leży poza repo, a `.antispam_secret` jest w `.gitignore`.
5. **Dane przykładowe ≠ prawdziwe.** W `demo-przemiany/przemiany-data.js` część liczb i historii to wypełniacz projektowy. Nie publikuj ich jako prawdziwych wyników klientów bez potwierdzenia od klienta.

## Mapa dokumentacji

| Temat | Plik |
|---|---|
| Struktura plików, podstrony, wspólne elementy, konwencje kodu | [docs/architektura.md](docs/architektura.md) |
| Sekcja Przemiany: 3 poziomy stron, model danych, plan backendu | [docs/przemiany.md](docs/przemiany.md) |
| Formularze, `send_mail.php`, antyspam | [docs/formularze.md](docs/formularze.md) |
| Deploy FTP, checklista testów, testowanie lokalne | [docs/deploy.md](docs/deploy.md) |
| SEO: canonical, sitemap, robots, `.htaccess`, dane strukturalne | [docs/seo.md](docs/seo.md) |
| System wizualny (kolory, typografia, komponenty, zakazy) | [DESIGN.md](DESIGN.md) |
| Produkt, użytkownicy, ton marki, zasady projektowe | [PRODUCT.md](PRODUCT.md) |
| Pierwotne wytyczne treści od klienta | `instrukcjaodklienta.txt` |

## Skrót konwencji

- Język strony i komentarzy w kodzie: **polski**.
- Kolory: tło `#0A0A0A`, akcent złoty `--yellow: #f5ca00`. Złoto tylko dla CTA, etykiet sekcji i elementów klikalnych. Font: Inter.
- Każda sekcja zaczyna się złotą etykietą `.section-label` nad nagłówkiem (UPPERCASE).
- Przyciski to pigułki (`.btn .btn-primary`, radius 50px).
- Większość podstron ma CSS inline w `<head>`. Nawigacja, loader i stopka są **skopiowane w każdym pliku**, więc zmiana menu oznacza edycję wszystkich HTML-i.
- Wyjątek: nowa sekcja Przemiany (na razie **demo** w `demo-przemiany/`) ma wspólne `przemiany.css` + `przemiany.js` + `przemiany-data.js`.
- Ikony: Font Awesome 6.5.1 (cdnjs). Smooth scroll: Lenis. Tło wideo: `bg-rotator.js`.
- Klient **nie chce numeracji** typu „01 / 07” na listach w Przemianach.
- Zdjęcia w `.webp` (z oryginałem `.jpeg/.png` obok).
- Nie zgaduj płci z imienia w tekstach generowanych z danych.

## Status / TODO

- Sekcja Przemiany: nowy design (hub → cel → case study) leży w ukrytym folderze `demo-przemiany/` (noindex, brak linków ze strony) do pokazania klientowi. Na stronie nadal działa stary `przemiany.html`. Czeka na akceptację klienta i backend z panelem. Plan: [docs/przemiany.md](docs/przemiany.md#plan-backendu).
- `todolist.md`: newsletter, zdjęcia.
