# Sekcja Przemiany

Klient chciał podzielić przemiany na obszary i cele, a w nich pokazać konkretne przypadki. Zamiast rozwijanych kart (akordeon z konceptu klienta) **każdy cel ma własną podstronę**.

## Gdzie to jest: wersja demo

Nowy system leży w **`demo-przemiany/`** (po wgraniu do `/bodycreatorMJ/demo-przemiany/`: `https://bodycreator.com.pl/demo-przemiany/przemiany.html`, lokalnie `http://localhost:8000/demo-przemiany/przemiany.html`). Na żywej stronie nadal działa stary `przemiany.html` w katalogu głównym.

- Ukrycie: `noindex, nofollow` w każdym pliku + `demo-przemiany/.htaccess` (`X-Robots-Tag`), brak canonical i JSON-LD, brak linków ze strony. Folder **celowo nie jest w `robots.txt`**, bo to by go ujawniło.
- Zasoby (zdjęcia, trenerzy, wideo, favicon, logo) i linki do innych podstron mają prefiks `../`. W folderze jest kopia `bg-rotator.js` ze ścieżkami `../video/bg/`.
- Po akceptacji klienta: przenieść pliki do katalogu głównego, usunąć prefiksy `../`, przywrócić `index, follow`, canonical i JSON-LD huba, usunąć kopię `bg-rotator.js`.

## Trzy poziomy

```
przemiany.html                     hub: zakładki obszarów + kafelki celów
  └─ kategoria.html?k=<slug>       cel: opis, „dla kogo”, „jak pracujemy”, przemiany, wideo
       └─ case-study.html?id=<id>  pełna historia jednej osoby
```

### 1. `przemiany.html` (hub)

Po feedbacku klienta (10.2026) hub jest **maksymalnie prosty**: mały nagłówek „Wybierz cel”, pod nim pasek 3 zakładek obszarów (bez liczników), a pod nim kafelki celów. Klient najpierw dostał akordeon, ale wolał pasek zakładek z pierwszej wersji. Klient wyraźnie **nie chce** na tej stronie zdjęć (miniatur), liczników przy obszarach, statystyk typu „7 celów · 11 przemian · 3 case study”, opisów obszarów ani paska wyróżnionych historii.

- Zakładki: `role="tablist"`, strzałki ←/→ działają. Bez hasha w adresie wybrany jest pierwszy obszar. Zmiana zakładki podmienia ciasną siatkę kafelków pod paskiem (z animacją wjazdu).
- Kafelek: nazwa celu ze strzałką, w prawym górnym rogu **liczba przemian** (np. „8 przemian”). Cel bez przemian ma w rogu „Wkrótce”.
- Wybrany obszar trafia do adresu: `przemiany.html#bol`. Okruszki z podstron linkują do `#<area-id>` i wybierają tę zakładkę.
- **Bez numeracji „01 / 07”**, bo klient jej nie chce.
- Pola `area.lead`, `category.tagline` i `featured` nie są już używane na hubie (zostają w danych dla podstron i panelu).

### 2. `kategoria.html?k=<slug>`

Przebudowana po głosowym feedbacku klienta (07.10.2026). Zasada klienta: **mało tekstu, obrazki, ludzie scrollują**. Wzór od klienta: https://reskateam.pl/sukcesy/redukcja-dolegliwosci-bolowych-przepuklina-pepkowa/ (nie 1:1).

Kolejność sekcji:
1. Hero: okruszki, etykieta obszaru, nazwa celu. **Bez** `lead`, bez CTA na górze („ktoś wszedł zobaczyć przemiany, a nie umawiać się”).
2. Przemiany, jedna pod drugą:
   - przemiana z opisem (`BC.hasDescription`: jest `goal`, `actions` lub `effects`) to duży blok: suwak przed/po, wynik (`highlight`) + linia osoby, potem 3 krótkie bloki: **Cel** (w obszarze Ból i urazy: **Opis problemu**) / **Podjęte działania** (punkty) / **Efekty współpracy**, pod nimi wideo (jeśli jest `video`). Bez linku do konsultacji w bloku (klient go usunął, CTA jest raz, pod listą). Bez zdjęć blok pokazuje sam opis (bez cytatu, żeby nie dublować treści);
   - same zdjęcia (bez opisu): siatka, pierwsze 6 widoczne, reszta pod przyciskiem „Zobacz więcej przemian”;
   - opinie bez zdjęć i bez opisu: karty z cytatem.
3. Krótkie CTA z pilnością: „Terminy współpracy szybko się zapełniają. Nie zwlekaj, umów się już dziś.” + mały przycisk.
4. „Inne przemiany”: karty innych celów z tego obszaru (tylko te z przemianami) przewijane w bok, z linkiem „Dostrzegasz swój problem? Kliknij” i „Zobacz więcej” do huba.

Usunięte na życzenie klienta: `lead`, CTA w hero, pasek faktów, „Dla kogo”, „Jak pracujemy”, tabela `metrics`, link „Czytaj całą historię”, osobna sekcja wideo, chipy i pager innych celów, duży baner CTA.

Brak przemian: pusty stan „Pierwsze historie w drodze”. Nieznany slug: komunikat z linkiem do huba.

### 3. `case-study.html?id=<id>`

**Od 07.10.2026 nic do niej nie linkuje.** Klient uznał link do pełnej historii za zbędny (wystarczą 3 krótkie bloki + wideo na stronie celu). Plik zostaje na wypadek powrotu do pomysłu; przy przenoszeniu sekcji na stronę można go pominąć.

Działa tylko dla przemian z polem `story`.

Kolejność sekcji:
1. Hero: suwak lub cytat, `highlight`, tytuł, fakty, CTA.
2. Liczby (`metrics`): start → meta.
3. Rozdziały: Punkt wyjścia → Plan → Przebieg (`timeline`) → Efekt.
4. Cytat, wideo, karta trenera.
5. Następna historia, CTA.

## Model danych (`przemiany-data.js`)

Globalny obiekt `window.BC_PRZEMIANY`:

```js
{
  areas: [{ id, name, lead }],
  categories: [{
    slug, area,               // area = areas[].id
    title, tagline, lead,
    typicalTime,              // "3–8 miesięcy"
    forWho: [string],         // 3 punkty
    process: [{ title, text }],// 3 kroki
    // --- pola panelu: są w dane/przemiany.json, nie trafiają do przemiany-data.js ---
    visible                   // false = kafelek zdjęty ze strony, dane zostają (kolejność = kolejność w tablicy)
  }],
  cases: [{
    id, category,             // WYMAGANE; category = categories[].slug
    before, after,            // zdjęcia: oba = suwak, samo after = jedno zdjęcie (BC.mediaHTML), brak = quote
    // --- podpis pod zdjęciem: OPCJONALNY, domyślnie pusty = brak podpisu ---
    highlight,                // "−11 kg"
    name, age, duration,      // "Kasia", 31, "5 miesięcy"
    // --- pozostałe opcjonalne ---
    quote, condition,         // cytat; schorzenie (Ból i urazy)
    video,                    // mp4
    featured,                 // pokaż w pasku na hubie (wymaga story)
    trainer,                  // klucz z trainers
    // --- krótki opis na stronie celu (po kilka zdań) ---
    goal,                     // Cel / Opis problemu (Ból i urazy)
    actions,                  // Podjęte działania: [string] albo string
    effects,                  // Efekty współpracy
    perWeek,                  // treningi w tygodniu
    metrics: [{ label, before, after }],
    // --- case study ---
    title,                    // nagłówek historii
    story: { start, plan, result },
    timeline: [{ when, text }]
  }],
  trainers: { key: { name, photo } }
}
```

### Zasady renderowania

- **Podpis pod zdjęciem** w siatce celu pokazuje tylko uzupełnione pola (`highlight` i/lub linia „imię, wiek · czas”). Wszystkie puste oznaczają brak podpisu. **Domyślnie podpisy są wyłączone**: przemiany-zdjęcia w danych nie mają tych pól. Klient dopisze je w panelu, jeśli zechce.
- Linia osoby (`BC.whoLine`) pomija puste pola, więc nigdy nie powstaje „, · ”.
- Wiek jest odmieniany (`BC.age`: 1 rok / 24 lata / 31 lat). Liczebniki przez `BC.plural`.
- Wszystkie dane są escapowane przez `BC.esc` przed wstawieniem do HTML. **Backend musi to zachować**: treść z panelu nie jest zaufana.
- **Link do konsultacji w opisie** (prośba klienta, 10.2026): tekst w `[nawiasach kwadratowych]` w `goal`, `actions` i `effects` staje się złotym linkiem ze znakiem BC (`bc-znak.webp`) do `rezerwacja.html`. Render: `BC.richText` (najpierw escapowanie, potem zamiana `[…]`, adres stały, więc to nie otwiera drogi do XSS). Akapity opisu mają `white-space: pre-line`, więc nowe linie z panelu (np. emoji w kolejnych liniach) zostają. W panelu pod polami Cel/Opis problemu i Efekty jest przycisk „Wstaw link do konsultacji”: wstawia `[Umów się na bezpłatną konsultację]` w miejscu kursora (albo zamienia zaznaczony fragment w link), nie zabiera fokusu polu (telefon), pokazuje podgląd „Tak będzie na stronie” i ostrzega o niesparowanym nawiasie.
- Alt zdjęć generuje `BC.altFor` (imię, jeśli jest, + cel + „Body Creator Wrocław”).
- Teksty generowane z danych nie mogą zakładać płci osoby, np. nie odmieniaj czasowników po imieniu.

### Dane przykładowe — UWAGA

Obecne imiona, liczby (kg, cm, ciężary), historie przy zdjęciach i 4 z 7 celów w „Sylwetka i zdrowie” oraz wszystkie cele „Sport i sprawność” poza „Siła i trójbój” to **wypełniacz projektowy**. Cytaty w „Ból i urazy” pochodzą z wcześniejszej wersji strony. Krótkie opisy (`goal`, `actions`, `effects`) przy 9 przemianach są dopisane na podstawie tych historii i cytatów, czyli też są wypełniaczem. Wideo przy historii „Kasia” to klip tła strony. Przed publikacją wszystko musi potwierdzić klient.

## Backend i panel (etap 1, od 12.10.2026)

Klient sam dodaje cele, przemiany, zdjęcia i filmy w panelu **`demo-przemiany/admin/`** (lokalnie `http://localhost:8000/demo-przemiany/admin/`). Strony dalej renderują się w JS z `window.BC_PRZEMIANY`, więc szablony się nie zmieniły.

### Przepływ danych

```
panel (admin/panel.js) → admin/api.php → dane/przemiany.json   (źródło prawdy + kopia przy każdym zapisie)
                                       → przemiany-data.js      (GENEROWANY: tylko widoczne cele i przemiany)
```

- `dane/przemiany.json`: pełne dane z polami panelu (`visible` przy celach i przemianach, `settings.hideEmpty`, `rev`). Przy pierwszym zapisie tworzony z `admin/seed.json` (obecne dane demo).
- `przemiany-data.js` jest **generowany przy każdym zapisie**. Pomija ukryte cele i przemiany, przemiany ukrytych celów, a przy `hideEmpty` także puste cele. Pole `visible` jest usuwane. Ukryty cel na stronie pokazuje „Nie znaleźliśmy tego celu” z linkiem do huba.
- Kolejność = kolejność w tablicach (strzałki w panelu zamieniają sąsiadów w obrębie obszaru / celu). Pola `order` nie ma.
- `demo-przemiany/.htaccess` ustawia `no-cache` dla `przemiany-data.js`, więc zmiany z panelu widać od razu mimo rocznego cache JS w głównym `.htaccess`.
- Kopie: `dane/kopie/przemiany-<data>.json`, ostatnie 60. Przywrócenie: skopiować wybraną kopię na `dane/przemiany.json` i zapisać cokolwiek w panelu (to wygeneruje JS).

### Pliki

| Plik | Rola |
|---|---|
| `admin/index.php` | Strona panelu (logowanie + aplikacja) |
| `admin/panel.js`, `admin/panel.css` | Front panelu: widoki celów i przemian, kadrowanie zdjęć, wysyłka wideo |
| `admin/api.php` | API JSON: `state`, `login`, `logout`, `category-save/delete`, `case-save/delete`, `toggle`, `move`, `settings-save`, `password-change`, `upload` |
| `admin/lib.php` | Sesja, logowanie, zapis z blokadą, kopie, generowanie JS, walidacja, uploady |
| `admin/ustaw-haslo.php` | Ustawienie hasła z linii poleceń (tylko CLI) |
| `admin/seed.json` | Dane startowe (kopia demo) |
| `dane/` | JSON, kopie, hasło, licznik prób logowania. **Poza gitem, zablokowany w `.htaccess`** |
| `uploads/` | Zdjęcia i filmy z panelu. **Poza gitem**, bez wykonywania skryptów |

### Co robi panel

- **Cele:** dodawanie (nazwa, obszar, opcjonalny krótki opis do meta description), edycja, ukrywanie, kolejność, usuwanie tylko pustego celu. Slug generowany z nazwy i **niezmienny**. Przełącznik „Ukrywaj puste cele”.
- **Przemiany:** zdjęcia przed/po (oba albo żadne), opis (Cel / Opis problemu, Podjęte działania po jednym w linii, Efekty), wideo, podpis (wynik, imię, wiek, czas), opinia i schorzenie, przeniesienie do innego celu, ukrywanie, kolejność, usuwanie. Przemiana musi mieć zdjęcia, opis albo opinię. Pola nieobsługiwane w panelu (`metrics`, `story`, `timeline`, `title`, `trainer`, `featured`, `perWeek`) są **zachowywane** przy zapisie.
- **Zdjęcia:** kadrowanie w przeglądarce do 5:8 (przeciąganie, suwak, pinch), eksport 500×800 WEBP (Safari: JPG). Serwer sprawdza typ po zawartości (finfo + getimagesize), maks. 5 MB, losowa nazwa.
- **Wideo:** MP4 albo MOV (iPhone), maks. 300 MB, zapisywane zawsze jako `.mp4`. Liczy się kodek, nie kontener: panel (`videoCodecs`, przed wysyłką) i serwer (`prz_video_codecs`, po złożeniu pliku) czytają boks `stsd` (moov → trak → mdia → minf → stbl). H.264 (`avc1`/`avc3`) przechodzi, HEVC (`hvc1`/`hev1`, domyślny format aparatu iPhone'a) jest odrzucany, bo nie gra na części urządzeń. Panel pokazuje wtedy instrukcję: Ustawienia → Aparat → Formaty → Najbardziej zgodny. Gdyby trzeba było przyjmować HEVC bez udziału klienta, zostaje transkodowanie w przeglądarce (WebCodecs), bo na home.pl nie ma ffmpeg.
- **Upload w częściach po 12 KB** (`PRZ_CHUNK_BYTES` w `lib.php`), jako surowe body z parametrami w adresie. Powód: na home.pl (PHP 8.5 przez uWSGI, stan na 12.10.2026) `/tmp` nie ma prawa zapisu, więc body powyżej ~16 KB dochodzi do PHP puste, a multipart zwraca `UPLOAD_ERR_NO_TMP_DIR`. Z tego samego powodu sesje panelu są w `dane/sesje/`. Duże filmy wysyłają się przez to wolno (tysiące zapytań). Gdy home.pl naprawi `/tmp`, podnieść `PRZ_CHUNK_BYTES` do np. 4 MB.
- **Trenerzy:** bez edycji w panelu (pole `trainer` jest używane tylko w nielinkowanym case study).

### Bezpieczeństwo

- Jedno hasło (hash bcrypt w `dane/haslo.php`). Klient zmienia je sam w panelu (Hasło w górnym pasku: obecne + nowe min. 8 znaków); po zmianie inne sesje są wylogowane (odcisk hasha w sesji). Hasło startowe: `admin/ustaw-haslo.php` + FTP.
- Sesja `BCPANEL` (HttpOnly, SameSite=Strict, Secure na HTTPS), wylogowanie po 4 h bezczynności.
- 5 błędnych haseł w 15 minut (logowanie i zmiana hasła liczą się razem) = blokada z tego IP na 15 minut.
- Każdy POST wymaga nagłówka `X-CSRF-Token`.
- Walidacja i limity długości po stronie serwera. Ścieżki plików tylko `uploads/<24 hex>.<ext>` albo istniejące zasoby demo (`../zdjecia_przed_po/`, `../video/`).
- Wyjście: JSON z `JSON_HEX_TAG`, a na stronach wszystko i tak przechodzi przez `BC.esc`.

### Uruchomienie

```bash
php admin/ustaw-haslo.php "silne-haslo"     # w demo-przemiany/, tworzy dane/haslo.php
php -S localhost:8000                       # w BodycreatorTEST/
```

Na serwer: `admin/`, `dane/.htaccess`, `uploads/.htaccess`, `.htaccess`, `kategoria.html` oraz **raz** `dane/haslo.php` (wygenerowany lokalnie z prawdziwym hasłem). Ostrzeżenia: [deploy.md](deploy.md#panel-przemian).

### Etap 2 (do zrobienia)

1. **SEO:** renderowanie w PHP z ładnymi adresami (`/przemiany/redukcja`), `canonical`, `sitemap.xml`, `BreadcrumbList`. Patrz [seo.md](seo.md).
2. Przeniesienie sekcji z `demo-przemiany/` do katalogu głównego (patrz „Gdzie to jest”), razem z `dane/` i `uploads/`.
3. Opcjonalnie: przywracanie kopii z panelu, sprzątanie nieużywanych plików w `uploads/`, edycja trenerów.
4. Odpowiedzi klienta: galeria kilku etapów zamiast jednej pary zdjęć? Filmy niezwiązane z osobą? Edytowalne teksty stałe?
