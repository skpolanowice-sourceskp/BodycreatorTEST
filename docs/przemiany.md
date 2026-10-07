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
   - przemiana z opisem (`BC.hasDescription`: jest `goal`, `actions` lub `effects`) to duży blok: suwak przed/po, wynik (`highlight`) + linia osoby, potem 3 krótkie bloki: **Cel** (w obszarze Ból i urazy: **Opis problemu**) / **Podjęte działania** (punkty) / **Efekty współpracy**, pod nimi wideo (jeśli jest `video`) i mały link „Masz podobny cel/problem? Umów darmową konsultację”. Bez zdjęć blok pokazuje sam opis (bez cytatu, żeby nie dublować treści);
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
    // --- planowane w panelu (patrz Plan backendu, pkt 3) ---
    visible,                  // false = kafelek zdjęty ze strony, dane zostają
    order                     // kolejność kafelków w obszarze
  }],
  cases: [{
    id, category,             // WYMAGANE; category = categories[].slug
    before, after,            // zdjęcia (bez nich karta pokazuje quote)
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
- Alt zdjęć generuje `BC.altFor` (imię, jeśli jest, + cel + „Body Creator Wrocław”).
- Teksty generowane z danych nie mogą zakładać płci osoby, np. nie odmieniaj czasowników po imieniu.

### Dane przykładowe — UWAGA

Obecne imiona, liczby (kg, cm, ciężary), historie przy zdjęciach i 4 z 7 celów w „Sylwetka i zdrowie” oraz wszystkie cele „Sport i sprawność” poza „Siła i trójbój” to **wypełniacz projektowy**. Cytaty w „Ból i urazy” pochodzą z wcześniejszej wersji strony. Krótkie opisy (`goal`, `actions`, `effects`) przy 9 przemianach są dopisane na podstawie tych historii i cytatów, czyli też są wypełniaczem. Wideo przy historii „Kasia” to klip tła strony. Przed publikacją wszystko musi potwierdzić klient.

## Plan backendu

Cel: klient sam dodaje zdjęcia, filmy, przemiany i case study.

1. **Źródło danych.** `przemiany-data.js` zastąpić endpointem, np. `api/przemiany.php`, zwracającym **dokładnie tę samą strukturę** jako JSON. Szablony stron czytają tylko `window.BC_PRZEMIANY`, więc wystarczy załadować JSON i przypisać go do tej zmiennej przed `przemiany.js`. Albo, lepiej, renderować po stronie serwera (pkt 4).
2. **Panel.** Logowanie klienta, CRUD dla `categories` (szczegóły w pkt 3), `cases`, `trainers`. Upload zdjęć z konwersją do `.webp` 500×800 (proporcje 5:8) i wideo `.mp4` (pionowe 9:16). Pola podpisu jako opcjonalne, z opisem „zostaw puste, żeby ukryć podpis”.
3. **Kafelki celów (zarządzanie kategoriami).** Klient sam decyduje, jakie cele (małe kafelki pod obszarem na hubie, np. „Redukcja tkanki tłuszczowej”, „Ból barku”) są na stronie. W panelu:
   - **dodawanie** kafelka: nazwa + wybór obszaru (Sylwetka i zdrowie / Ból i urazy / Sport i sprawność); slug generowany automatycznie z nazwy, opis (`lead`) opcjonalny;
   - **edycja** nazwy i opisu. Slug po utworzeniu się nie zmienia, żeby nie psuć linków (albo zmiana slugu zapisuje przekierowanie 301);
   - **zdejmowanie** kafelka: przełącznik „widoczny / ukryty” (pole `visible`). Ukryty kafelek znika z huba, a jego podstrona zwraca 404 lub przekierowuje do huba. Przemiany i zdjęcia zostają w bazie, więc kafelek można przywrócić jednym kliknięciem;
   - **usuwanie na stałe** tylko dla kafelka bez przemian. Jeśli ma przemiany, panel każe je najpierw przenieść do innego celu albo ukryć kafelek;
   - **kolejność** kafelków w obszarze: przeciąganie lub strzałki góra/dół (pole `order`);
   - opcjonalnie: przełącznik „ukrywaj puste kafelki”, żeby cele bez przemian nie pokazywały „Wkrótce”.

   Liczba w rogu kafelka liczy się sama z przemian przypisanych do celu, klient jej nie wpisuje. Same obszary (3 duże kategorie) zostają stałe, bez edycji w panelu, chyba że klient poprosi.
4. **SEO.** Podstrony z `?k=` / `?id=` budują treść w JS. Docelowo PHP powinien renderować HTML po stronie serwera, z ładnymi adresami przez `.htaccess` (np. `/przemiany/redukcja`, `/przemiany/redukcja/kasia`), `canonical`, wpisami w `sitemap.xml` i `BreadcrumbList`. Patrz [seo.md](seo.md).
5. **Bezpieczeństwo.** Escapowanie wyjścia, walidacja typów plików przy uploadzie, katalog uploadów bez wykonywania PHP, ochrona panelu (hasło + limit prób). Antyspam można wziąć z [formularze.md](formularze.md).
6. **Kolejność.** `featured` / kolejność na listach jako pole `order` (dziś decyduje kolejność w tablicy).
