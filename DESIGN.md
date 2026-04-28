---
name: Body Creator
description: Studio treningu personalnego — kameralne, profesjonalne, motywujące.
colors:
  forge-gold: "#F7B500"
  forge-gold-deep: "#DEA300"
  obsidian: "#0A0A0A"
  anthracite: "#111111"
  charcoal: "#1A1A1A"
  graphite: "#222222"
  ice: "#FFFFFF"
  ash: "#CCCCCC"
  slate: "#999999"
  iron: "#444444"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(3rem, 7vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "2px"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.2rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "1.5px"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(1.6rem, 4vw, 2.8rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "2px"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "3px"
rounded:
  pill: "50px"
  lg: "24px"
  md: "16px"
  sm: "10px"
  xs: "4px"
  full: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "80px"
  2xl: "120px"
components:
  button-primary:
    backgroundColor: "{colors.forge-gold}"
    textColor: "{colors.obsidian}"
    rounded: "{rounded.pill}"
    padding: "16px 36px"
  button-primary-hover:
    backgroundColor: "{colors.forge-gold-deep}"
    textColor: "{colors.obsidian}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ice}"
    rounded: "{rounded.pill}"
    padding: "16px 36px"
  button-outline-hover:
    backgroundColor: "{colors.forge-gold}"
    textColor: "{colors.obsidian}"
  input-default:
    backgroundColor: "{colors.anthracite}"
    textColor: "{colors.ice}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
  input-focus:
    backgroundColor: "{colors.anthracite}"
    textColor: "{colors.ice}"
    rounded: "{rounded.sm}"
    padding: "14px 18px"
---

# Design System: Body Creator

## 1. Overview

**Creative North Star: "The Iron Sanctuary"**

Body Creator to studio, nie siłownia. To rozróżnienie jest fundamentem całego systemu wizualnego. Przestrzeń jest ciemna, skupiona i wyciszona — jak sala przygotowań przed zawodami. Jedynym źródłem energii jest złoto: akcent Forge Gold (#F7B500) pojawia się precyzyjnie i rzadko, przez co za każdym razem robi wrażenie. Ciemne tła nie są modą — są środowiskiem sprzyjającym koncentracji.

Typografia jest agresywnie zważona (900 w display, 800 w nagłówkach sekcji) z dużymi odstępami między literami i pełnymi capsami. To nie jest dekoracja — to pewność siebie wyrażona krojem. Każde wezwanie do działania jest pigułką: pełny promień, złote tło, ciemny tekst. Kontrasty są maksymalne; nie ma półśrodków.

System celowo odrzuca trzy wzorce: (1) siłownię sieciową — przebodźcowaną, głośną, z flashującymi okładkami; (2) corporate wellness — biały, korporacyjny, bezpieczny; (3) IG-estetykę — gradient-text, glassmorphism, neon. Body Creator jest kameralne, autentyczne i pewne siebie bez krzyku.

**Key Characteristics:**
- Obsidianowe tła jako środowisko, Forge Gold jako sygnał
- Ultraważne display typography z pełnymi capsami
- Przyciski-pigułki (50px radius) jako jedyny element z dużą krzywiną
- Kontrast: zawsze maksymalny, nigdy szary na szarym
- Złoty glow jako jedyna forma "dekoracji" (hover, focus, aktywne stany)

## 2. Colors: The Forge Palette

Monochromatyczna ciemna baza z jednym saturowanym akcentem złota. Strategia: Committed — Forge Gold niesie 30-50% energii wizualnej na każdym ekranie (przyciski, etykiety sekcji, ikonki, hover stany), ale nigdy nie jest tłem.

### Primary
- **Forge Gold** (`#F7B500`): Jedyny kolor akcentowy. Przyciski primary, etykiety sekcji (`.section-label`), ikonki, hover stany nawigacji, obramowania focus, elementy aktywne. Jego rola to sygnał energii i gotowości — pojawia się tam, gdzie coś się dzieje lub można kliknąć.
- **Forge Gold Deep** (`#DEA300`): Wyłącznie hover/active state Forge Gold. Nie używane samodzielnie.

### Neutral
- **Obsidian** (`#0A0A0A`): Tło strony. Najciemniejszy punkt systemu. Tekst na złotym przycisku.
- **Anthracite** (`#111111`): Powierzchnia kart drugiego planu, tła formularzy, tło nawigacji po scrollu.
- **Charcoal** (`#1A1A1A`): Trzeciorzędne powierzchnie, sekcje z lekko wyróżnionym tłem.
- **Graphite** (`#222222`): Karty, elementy interaktywne na tle Anthracite.
- **Iron** (`#444444`): Subtelne obramowania, separatory (nigdy nie jako dominant).
- **Ice** (`#FFFFFF`): Główny tekst na ciemnych powierzchniach.
- **Ash** (`#CCCCCC`): Tekst pomocniczy, `.section-text`, ciała akapitów.
- **Slate** (`#999999`): Tekst muted, placeholdery, metadane.

### Named Rules
**The One Signal Rule.** Forge Gold jest jedynym kolorem akcentowym. Nigdy nie dodawaj drugiego koloru "dla urozmaicenia" — to rozmyje sygnał. Jeśli element nie jest interaktywny lub nie jest CTA, nie może być złoty.

**The No Warmth Rule.** Ciemne tła muszą pozostać chłodne i neutralne. Żadnych brązowych, fioletowych ani ciepłych odcieni w neutralach — to zepsuje kontrast ze złotem i nada kojarzoną z budżetowymi siłowniami ciepłotę.

## 3. Typography

**Display / Body Font:** Inter (Google Fonts, weights 300–900)

**Character:** Inter niesie tutaj duży ciężar — jest jedynym krojem, ale rozkrój wag od 300 do 900 daje wystarczający kontrast hierarchii. Display używa wagi 900 z dużymi odstępami literowymi i pełnymi capsami, co nadaje nagłówkom charakter sportowych tablic wynikowych. Body wraca do wagi 400 z szerokim interliniowaniem (1.8) dla czytelności na telefonach.

### Hierarchy
- **Display** (900, `clamp(3rem, 7vw, 5.5rem)`, line-height 1.1, letter-spacing 2px, UPPERCASE): Hero headings. Nigdy nie więcej niż jeden na ekran.
- **Headline** (800, `clamp(2rem, 4vw, 3.2rem)`, line-height 1.15, letter-spacing 1.5px, UPPERCASE): Tytuły sekcji (`.section-title`). Zawsze poprzedzone etykietą label.
- **Title** (700, `clamp(1.6rem, 4vw, 2.8rem)`, line-height 1.25, letter-spacing 2px): Podtytuły kart, nagłówki podsekcji.
- **Body** (400, `1.05rem`, line-height 1.8): Treść akapitów. Max 65ch szerokości dla czytelności.
- **Label** (700, `0.75rem`, letter-spacing 3px, UPPERCASE, kolor: Forge Gold): Etykiety sekcji (`.section-label`). Zawsze złote, zawsze caps. Poprzedzają headline.

### Named Rules
**The Label-Before-Headline Rule.** Każda sekcja otwiera się złotą etykietą (label) nad nagłówkiem. Label nie jest opcjonalna — bez niej headline traci kontekst i traci złoty akcent, który uziemia sekcję wizualnie.

**The All-Caps Doctrine.** Display i Headline są zawsze uppercase. To nie jest opcja stylistyczna — to część tożsamości marki. Body i Label też są caps. Title jest jedynym poziomem pisanym sentence case.

## 4. Elevation

System jest płaski w spoczynku, aktywny w ruchu. Głębia nie jest wyrażana przez cienie "podnoszące" karty nad tło — jest wyrażana przez gradację ciemnych powierzchni (Obsidian → Anthracite → Charcoal → Graphite) oraz przez złoty blask jako sygnał interaktywności.

### Shadow Vocabulary
- **CTA Glow** (`0 10px 30px rgba(242, 201, 76, 0.30)`): Wyłącznie na hover przycisku primary. Pojawia się razem z translateY(-2px). Daje efekt unoszenia się nad tłem.
- **Focus Ring** (`0 0 0 3px rgba(242, 201, 76, 0.10)`): Stan focus na polach formularza i linkach. Uzupełnia border-color: forge-gold.
- **Pulse Glow** (`0 0 22px 6px rgba(242, 201, 76, 0.28)`): Animowany ping (keyframe) na wybranych CTA. Używany oszczędnie — jeden element na ekran.
- **Icon Hover** (`0 4px 20px rgba(247, 181, 0, 0.45)` → `0 8px 32px rgba(247, 181, 0, 0.70)`): Na ikonach social media i przyciskach icon-only.

### Named Rules
**The Flat-By-Default Rule.** Powierzchnie nie mają cieni w spoczynku. Głębia pochodzi z koloru tła, nie z box-shadow. Cień pojawia się tylko jako odpowiedź na interakcję (hover, focus).

**The Gold-Only Glow Rule.** Jedynym kolorem dozwolonym w box-shadow jest Forge Gold (`rgba(247, 181, 0, ...)` lub `rgba(242, 201, 76, ...)`). Żadnych szarych, białych ani kolorowych cieni.

## 5. Components

### Buttons
Przyciski są pigułkami: pełny promień 50px nadaje im miękką, energiczną formę kontrastującą z prostokątnymi kartami i sekcjami.

- **Shape:** Pełna pigułka (50px radius)
- **Primary:** Forge Gold tło, Obsidian tekst, padding 16px/36px, font 0.9rem weight 600, letter-spacing 1px, UPPERCASE
- **Hover / Focus:** translateY(-2px) + CTA Glow (`0 10px 30px rgba(242,201,76,0.3)`), background przechodzi na Forge Gold Deep
- **Outline:** Transparent tło, Ice tekst, 2px solid Forge Gold border; hover: wypełnia się Forge Gold, tekst staje się Obsidian
- **Small (.btn-sm):** padding 14px/30px, font-size 0.95rem — używany wyłącznie w nawigacji

### Cards / Containers
- **Corner Style:** Gently curved — 16px standard (`{rounded.md}`), 24px dla dużych kontenerów (`{rounded.lg}`)
- **Background:** Graphite (`#222222`) lub Charcoal (`#1A1A1A`) zależnie od głębokości w hierarchii powierzchni
- **Shadow Strategy:** Brak w spoczynku (Flat-By-Default Rule)
- **Border:** Brak lub subtelny `1px solid rgba(255,255,255,0.05–0.08)` — nigdy grubszy
- **Internal Padding:** 24px–32px (`{spacing.md}`)

### Inputs / Fields
- **Style:** Anthracite tło (`#111111`), `1px solid rgba(255,255,255,0.08)` border, radius 10px (`{rounded.sm}`), padding 14px/18px
- **Focus:** border-color zmienia się na Forge Gold + Focus Ring (`0 0 0 3px rgba(242,201,76,0.10)`)
- **Placeholder:** Slate (`#999999`)
- **Error:** nie zdefiniowany w istniejącym systemie — do zaprojektowania przy hardeniu

### Navigation
- **Style:** Transparentna w spoczynku; po scrollu: Anthracite z `backdrop-filter: blur(20px)` + `1px solid rgba(255,255,255,0.05)` na dole
- **Typography:** 0.9rem, weight 600, letter-spacing 1px
- **Default/Hover:** Ice → Forge Gold transition (0.3s ease)
- **Mobile:** Hamburger toggle z pełnoekranowym menu, transition: translateY + opacity
- **CTA w nav:** Button primary (`btn-sm`) wyśrodkowany nad linkami

### Section Label (Signature Component)
Każda sekcja otwiera się tym elementem przed headline. Forge Gold, 0.75rem, weight 700, letter-spacing 3px, UPPERCASE. Brak tła ani obramowania — czysty typ na ciemnym tle. To jest najważniejszy typograficzny sygnał marki.

## 6. Do's and Don'ts

### Do:
- **Do** używaj Forge Gold wyłącznie do elementów interaktywnych i etykiet sekcji. Rola złota to sygnał energii i akcji.
- **Do** poprzedzaj każdy headline złotą etykietą label. Bez niej headline traci kotwicę wizualną.
- **Do** utrzymuj tekst body w max 65ch szerokości. Na szerokich ekranach zawęź kolumnę treści.
- **Do** projektuj mobile-first: touch targets minimum 44px, CTA pełna szerokość na telefonach.
- **Do** używaj translateY(-2px) + CTA Glow na hover przycisków primary — to jest zdefiniowane zachowanie systemu, nie opcja.
- **Do** zachowaj hierarchię powierzchni przez gradację ciemności (Obsidian → Anthracite → Charcoal → Graphite), a nie przez cienie.
- **Do** używaj liczb i faktów w copy ("100% zadowolonych klientów", "+10 000 treningów") — to jest język marki.

### Don't:
- **Don't** używaj gradient-text (`background-clip: text` z gradientem). Jeden solidny kolor — zawsze.
- **Don't** dodawaj glassmorphism dekoracyjnie (blur + semi-transparent). Backdrop-filter jest dozwolony wyłącznie na nawigacji po scrollu i tylko tam.
- **Don't** twórz siatki identycznych kart (icon + heading + text × N). To jest najczęstszy visual reflex — szukaj układu alternatywnego.
- **Don't** używaj `border-left` grubszego niż 1px jako kolorowego paska-akcentu. Nigdy. Zamień na pełne obramowanie, tło lub nic.
- **Don't** dodawaj drugiego koloru akcentowego "dla urozmaicenia" — Forge Gold jest jedynym sygnałem, jego siła pochodzi z wyłączności.
- **Don't** używaj ciepłych lub brązowych odcieni w neutralach — zniszczyłyby kontrast ze złotem.
- **Don't** projektuj desktopowo a potem "adaptujesz" do mobile. Mobile jest punktem wyjścia.
- **Don't** wstawiaj stockowych zdjęć uśmiechniętych modeli na siłowni. Autentyczność ponad estetykę — prawdziwe przemiany, prawdziwe zdjęcia ze studia.
