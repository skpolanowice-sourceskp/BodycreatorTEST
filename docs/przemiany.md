# Sekcja Przemiany

Klient chciał podzielić przemiany na obszary i cele, a w nich pokazać konkretne przypadki. Zamiast rozwijanych kart (akordeon z konceptu klienta) **każdy cel ma własną podstronę**.

## Gdzie to jest: wersja demo

Nowy system leży w **`demo-przemiany/`** (po wgraniu do `/bodycreatorMJ/demo-przemiany/`: `https://bodycreator.com.pl/demo-przemiany/przemiany.html`, lokalnie `http://localhost:8000/demo-przemiany/przemiany.html`). Na żywej stronie nadal działa stary `przemiany.html` w katalogu głównym.

- Ukrycie: `noindex, nofollow` w każdym pliku + `demo-przemiany/.htaccess` (`X-Robots-Tag`), brak canonical i JSON-LD, brak linków ze strony. Folder **celowo nie jest w `robots.txt`**, bo to by go ujawniło.
- Zasoby (zdjęcia, trenerzy, wideo, favicon, logo) i linki do innych podstron mają prefiks `../`. W folderze jest kopia `bg-rotator.js` ze ścieżkami `../video/bg/`.
- Po akceptacji klienta: przenieść pliki do katalogu głównego, usunąć prefiksy `../`, przywrócić `index, follow`, canonical i JSON-LD huba, usunąć kopię `bg-rotator.js`.

## Trzy poziomy

```
przemiany.html                     hub: zakładki obszarów + lista celów
  └─ kategoria.html?k=<slug>       cel: opis, „dla kogo”, „jak pracujemy”, przemiany, wideo
       └─ case-study.html?id=<id>  pełna historia jednej osoby
```

### 1. `przemiany.html` (hub)

- Zakładki obszarów (`role="tablist"`, strzałki ←/→ działają). Licznik przy zakładce to liczba celów.
- Wybrany obszar trafia do adresu: `przemiany.html#bol`. Okruszki z podstron linkują do `#<area-id>`.
- Lista celów to wiersze-linki: nazwa, tagline, licznik („8 przemian · 2 case study”), do 3 miniatur zdjęć „po” i strzałka.
  **Bez numeracji „01 / 07”**, bo klient jej nie chce.
- Cel bez przemian pokazuje „Wkrótce pierwsze historie”.
- Pasek wyróżnionych historii: przemiany z `featured: true` **i** `story`.

### 2. `kategoria.html?k=<slug>`

Kolejność sekcji:
1. Hero: okruszki, nazwa, `lead`, fakty (typowy czas / liczba przemian / liczba case study), CTA.
2. „Dla kogo” (`forWho`) i „Jak pracujemy” (`process`, 3 kroki).
3. Efekty:
   - case study jako duże bloki (suwak przed/po + tabela `metrics`);
   - siatka pozostałych zdjęć;
   - karty z cytatem dla przemian bez zdjęć.
4. Wideo, jeśli którakolwiek przemiana ma `video`.
5. Inne cele z obszaru + poprzedni/następny cel.
6. CTA.

Brak przemian: pusty stan „Pierwsze historie w drodze”. Nieznany slug: komunikat z linkiem do huba.

### 3. `case-study.html?id=<id>`

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
    process: [{ title, text }]// 3 kroki
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

Obecne imiona, liczby (kg, cm, ciężary), historie przy zdjęciach i 4 z 7 celów w „Sylwetka i zdrowie” oraz wszystkie cele „Sport i sprawność” poza „Siła i trójbój” to **wypełniacz projektowy**. Cytaty w „Ból i urazy” pochodzą z wcześniejszej wersji strony. Wideo przy historii „Kasia” to klip tła strony. Przed publikacją wszystko musi potwierdzić klient.

## Plan backendu

Cel: klient sam dodaje zdjęcia, filmy, przemiany i case study.

1. **Źródło danych.** `przemiany-data.js` zastąpić endpointem, np. `api/przemiany.php`, zwracającym **dokładnie tę samą strukturę** jako JSON. Szablony stron czytają tylko `window.BC_PRZEMIANY`, więc wystarczy załadować JSON i przypisać go do tej zmiennej przed `przemiany.js`. Albo, lepiej, renderować po stronie serwera (pkt 3).
2. **Panel.** Logowanie klienta, CRUD dla `areas`, `categories`, `cases`, `trainers`. Upload zdjęć z konwersją do `.webp` 500×800 (proporcje 5:8) i wideo `.mp4` (pionowe 9:16). Pola podpisu jako opcjonalne, z opisem „zostaw puste, żeby ukryć podpis”.
3. **SEO.** Podstrony z `?k=` / `?id=` budują treść w JS. Docelowo PHP powinien renderować HTML po stronie serwera, z ładnymi adresami przez `.htaccess` (np. `/przemiany/redukcja`, `/przemiany/redukcja/kasia`), `canonical`, wpisami w `sitemap.xml` i `BreadcrumbList`. Patrz [seo.md](seo.md).
4. **Bezpieczeństwo.** Escapowanie wyjścia, walidacja typów plików przy uploadzie, katalog uploadów bez wykonywania PHP, ochrona panelu (hasło + limit prób). Antyspam można wziąć z [formularze.md](formularze.md).
5. **Kolejność.** `featured` / kolejność na listach jako pole `order` (dziś decyduje kolejność w tablicy).
