/* Body Creator — dane sekcji Przemiany.
   ------------------------------------------------------------------
   UWAGA: DANE PRZYKŁADOWE (etap projektu). Liczby, imiona i historie
   przy zdjęciach są wypełniaczem do zaprojektowania układu. Przed
   publikacją zastąpić prawdziwymi danymi od klienta.

   Docelowo ten plik zastąpi endpoint backendu (np. api/przemiany.php)
   zwracający dokładnie tę samą strukturę JSON — szablony stron
   (przemiany.html, kategoria.html, case-study.html) się nie zmienią.

   Struktura:
   - areas:      obszary (zakładki na stronie głównej przemian)
   - categories: cele w obszarze (każdy ma własną podstronę)
   - cases:      pojedyncze przemiany; z polem `story` stają się case study
   ------------------------------------------------------------------ */
window.BC_PRZEMIANY = {
    areas: [
        {
            id: 'sylwetka',
            name: 'Sylwetka i zdrowie',
            lead: 'Redukcja, masa, rekompozycja i zdrowie metaboliczne. Cele, które widać w lustrze i w wynikach badań.'
        },
        {
            id: 'bol',
            name: 'Ból i urazy',
            lead: 'Kręgosłup, stawy, powrót po kontuzji i operacji. Trening, który najpierw usuwa ból, a potem buduje formę.'
        },
        {
            id: 'sport',
            name: 'Sport i sprawność',
            lead: 'Siła, dynamika, wydolność i przygotowanie do sezonu. Dla amatorów i zawodników, którzy chcą więcej z ciała.'
        }
    ],

    categories: [
        /* ---------- SYLWETKA I ZDROWIE ---------- */
        {
            slug: 'budowa-masy', area: 'sylwetka',
            title: 'Budowa masy mięśniowej',
            tagline: 'Więcej mięśni i siły, bez zbędnego tłuszczu.',
            lead: 'Masa to nie jedzenie wszystkiego, co popadnie. Planujemy nadwyżkę kaloryczną, progresję obciążeń i regenerację tak, żeby każdy kilogram był kilogramem mięśni.',
            typicalTime: '6–12 miesięcy',
            forWho: ['Szczupłe osoby, którym trudno przybrać na wadze', 'Ćwiczący sami, którzy utknęli w miejscu', 'Wszyscy, którzy chcą wyglądać na silniejszych'],
            process: [
                { title: 'Pomiar i analiza', text: 'Skład ciała, obwody, testy siłowe i historia treningowa.' },
                { title: 'Plan i dieta', text: 'Program siłowy z progresją oraz nadwyżka kaloryczna dopasowana do Twojego dnia.' },
                { title: 'Kontrola co 4 tygodnie', text: 'Pomiary, zdjęcia, korekta planu. Rośniesz według danych, nie przeczucia.' }
            ]
        },
        {
            slug: 'redukcja', area: 'sylwetka',
            title: 'Redukcja tkanki tłuszczowej',
            tagline: 'Mniej tłuszczu, ta sama siła, zero głodówek.',
            lead: 'Chudniemy z tłuszczu, nie z mięśni. Trening siłowy, rozsądny deficyt i nawyki, które zostają po zakończeniu współpracy.',
            typicalTime: '3–8 miesięcy',
            forWho: ['Osoby, które próbowały diet i wracały do punktu wyjścia', 'Zabiegani, którym brakuje czasu na długie treningi', 'Wszyscy, którzy chcą schudnąć bez efektu jo-jo'],
            process: [
                { title: 'Punkt startowy', text: 'Pomiary, analiza nawyków i realny cel na pierwsze 12 tygodni.' },
                { title: 'Trening i deficyt', text: '2–3 treningi siłowe w tygodniu i deficyt, który da się utrzymać.' },
                { title: 'Wyjście z redukcji', text: 'Stopniowy powrót kalorii, żeby efekt został na lata.' }
            ]
        },
        {
            slug: 'rekompozycja', area: 'sylwetka',
            title: 'Rekompozycja sylwetki',
            tagline: 'Waga stoi, a sylwetka zmienia się nie do poznania.',
            lead: 'Jednoczesne spalanie tłuszczu i budowa mięśni. Najlepiej działa u początkujących i osób wracających do treningu po przerwie.',
            typicalTime: '4–9 miesięcy',
            forWho: ['Osoby z prawidłową wagą, ale bez jędrności', 'Wracający do treningu po przerwie', 'Ci, którzy nie chcą ani „masować”, ani się głodzić'],
            process: [
                { title: 'Skład ciała', text: 'Mierzymy tkankę tłuszczową i mięśniową, nie tylko kilogramy.' },
                { title: 'Siła przede wszystkim', text: 'Ciężki, technicznie dopracowany trening i wysoka podaż białka.' },
                { title: 'Zdjęcia i obwody', text: 'Postęp oceniamy w lustrze i centymetrem, bo waga potrafi kłamać.' }
            ]
        },
        {
            slug: 'zdrowie-metaboliczne', area: 'sylwetka',
            title: 'Zdrowie metaboliczne',
            tagline: 'Insulinooporność, cholesterol, ciśnienie. Lepsze wyniki badań.',
            lead: 'Ruch to jedno z najskuteczniejszych narzędzi w poprawie wyników badań. Pracujemy w porozumieniu z lekarzem prowadzącym.',
            typicalTime: '3–6 miesięcy',
            forWho: ['Osoby z insulinoopornością lub stanem przedcukrzycowym', 'Pacjenci z podwyższonym cholesterolem lub ciśnieniem', 'Każdy, kto dostał od lekarza zalecenie „więcej ruchu”'],
            process: [
                { title: 'Wywiad i badania', text: 'Zaczynamy od wyników i zaleceń lekarza.' },
                { title: 'Bezpieczna progresja', text: 'Trening siłowy i tlenowy w dawkach dobranych do stanu zdrowia.' },
                { title: 'Kontrolne badania', text: 'Porównujemy wyniki po 3 i 6 miesiącach.' }
            ]
        },
        {
            slug: 'po-ciazy', area: 'sylwetka',
            title: 'Forma po ciąży',
            tagline: 'Powrót do siebie, w Twoim tempie.',
            lead: 'Mięśnie dna miednicy, rozejście kresy białej, brak snu. Plan, który uwzględnia realia młodej mamy.',
            typicalTime: '4–8 miesięcy',
            forWho: ['Mamy po zakończonym połogu', 'Kobiety z rozejściem mięśni prostych brzucha', 'Mamy, które chcą wrócić do aktywności bezpiecznie'],
            process: [
                { title: 'Konsultacja', text: 'Ocena stanu po porodzie, w razie potrzeby z fizjoterapeutą uroginekologicznym.' },
                { title: 'Fundamenty', text: 'Oddech, dno miednicy, głębokie mięśnie brzucha.' },
                { title: 'Powrót do siły', text: 'Stopniowe wprowadzanie pełnego treningu.' }
            ]
        },
        {
            slug: 'trening-50-plus', area: 'sylwetka',
            title: 'Sprawność 50+',
            tagline: 'Siła i równowaga, które przedłużają samodzielność.',
            lead: 'Po pięćdziesiątce mięśnie to najlepsza inwestycja. Trenujemy bezpiecznie, z naciskiem na siłę, równowagę i gęstość kości.',
            typicalTime: 'Stała współpraca',
            forWho: ['Osoby 50+, które chcą zacząć trenować', 'Ci, którzy czują spadek siły i sprawności', 'Osoby z osteopenią lub ryzykiem upadków'],
            process: [
                { title: 'Testy sprawności', text: 'Siła chwytu, równowaga, wstawanie z krzesła, zakres ruchu.' },
                { title: 'Trening siłowy', text: 'Spokojna progresja i dużo pracy nad techniką.' },
                { title: 'Codzienna sprawność', text: 'Ćwiczenia przenoszące się na schody, zakupy, wnuki.' }
            ]
        },
        {
            slug: 'pierwsze-kroki', area: 'sylwetka',
            title: 'Pierwsze kroki na siłowni',
            tagline: 'Od zera do pewności siebie przy sztandze.',
            lead: 'Nie musisz być w formie, żeby zacząć. Uczymy techniki od podstaw, bez oceniania i bez tłumów.',
            typicalTime: '2–4 miesiące',
            forWho: ['Osoby, które nigdy nie trenowały', 'Ci, którzy czują się niepewnie na dużych siłowniach', 'Wszyscy, którzy chcą nauczyć się trenować samodzielnie'],
            process: [
                { title: 'Rozmowa', text: 'Cel, obawy, historia zdrowia.' },
                { title: 'Nauka ruchu', text: 'Przysiad, martwy ciąg, wyciskanie, wiosłowanie. Krok po kroku.' },
                { title: 'Samodzielność', text: 'Plan, który po kilku miesiącach zrealizujesz sam.' }
            ]
        },

        /* ---------- BÓL I URAZY ---------- */
        {
            slug: 'bol-kregoslupa', area: 'bol',
            title: 'Ból kręgosłupa',
            tagline: 'Dyskopatia, rwa kulszowa, ból lędźwi i karku.',
            lead: 'Większość bólów kręgosłupa da się wyciszyć ruchem. Zaczynamy od diagnozy funkcjonalnej i budujemy plecy, które wytrzymają codzienność.',
            typicalTime: '3–7 miesięcy',
            forWho: ['Osoby z przewlekłym bólem lędźwi lub karku', 'Pacjenci z dyskopatią i rwą kulszową', 'Pracujący długie godziny przy biurku'],
            process: [
                { title: 'Diagnoza funkcjonalna', text: 'Testy ruchowe, wywiad, analiza dokumentacji medycznej.' },
                { title: 'Wyciszenie bólu', text: 'Ruch w zakresie bez bólu, praca z oddechem i stabilizacją.' },
                { title: 'Odporność', text: 'Stopniowe obciążanie, żeby ból nie wrócił.' }
            ]
        },
        {
            slug: 'po-urazie', area: 'bol',
            title: 'Powrót po urazie i operacji',
            tagline: 'Kolano, bark, staw skokowy. Z powrotem do pełnej sprawności.',
            lead: 'Rehabilitacja kończy się zwykle zbyt wcześnie. My prowadzimy Cię od ostatniej wizyty u fizjoterapeuty do pełnej formy.',
            typicalTime: '4–9 miesięcy',
            forWho: ['Osoby po rekonstrukcji więzadeł lub operacji łąkotki', 'Po urazach barku i stożka rotatorów', 'Sportowcy wracający do treningu po kontuzji'],
            process: [
                { title: 'Współpraca z fizjo', text: 'Kontynuujemy tam, gdzie skończyła się rehabilitacja.' },
                { title: 'Odbudowa siły', text: 'Wyrównanie różnic między stronami ciała.' },
                { title: 'Powrót do aktywności', text: 'Testy gotowości przed powrotem do sportu.' }
            ]
        },
        {
            slug: 'wady-postawy', area: 'bol',
            title: 'Wady postawy',
            tagline: 'Okrągłe plecy, wysunięta głowa, skolioza.',
            lead: 'Postawa to nawyk, który da się zmienić. Wzmacniamy to, co słabe, rozluźniamy to, co spięte, i uczymy ciało nowej pozycji.',
            typicalTime: '3–6 miesięcy',
            forWho: ['Osoby pracujące w pozycji siedzącej', 'Z zaokrąglonymi plecami lub wysuniętą głową', 'Z łagodną skoliozą'],
            process: [
                { title: 'Analiza postawy', text: 'Zdjęcia, testy mobilności i siły mięśni posturalnych.' },
                { title: 'Korekta', text: 'Mobilizacja, wzmacnianie tylnej taśmy, nawyki przy biurku.' },
                { title: 'Utrwalenie', text: 'Porównanie zdjęć i plan na dalszą pracę.' }
            ]
        },
        {
            slug: 'przewlekly-bol', area: 'bol',
            title: 'Przewlekły ból',
            tagline: 'Fibromialgia, bóle stawów, ból bez jasnej przyczyny.',
            lead: 'Przy przewlekłym bólu liczy się dawkowanie. Uczymy ćwiczyć mądrze, nie na przekór ciału.',
            typicalTime: 'Stała współpraca',
            forWho: ['Osoby z fibromialgią', 'Z bólami stawów i zwyrodnieniami', 'Ci, którym „nic nie pomaga”'],
            process: [
                { title: 'Wywiad', text: 'Historia bólu, leki, sen, stres.' },
                { title: 'Mała dawka, stały rytm', text: 'Krótkie, regularne sesje zamiast zrywów.' },
                { title: 'Budowanie tolerancji', text: 'Stopniowo więcej ruchu przy mniejszym bólu.' }
            ]
        },

        /* ---------- SPORT I SPRAWNOŚĆ ---------- */
        {
            slug: 'sila', area: 'sport',
            title: 'Siła i trójbój',
            tagline: 'Przysiad, wyciskanie, martwy ciąg. Liczby w górę.',
            lead: 'Programowanie siły z periodyzacją, korektą techniki na wideo i przygotowaniem do startów.',
            typicalTime: '3–12 miesięcy',
            forWho: ['Trenujący, którzy utknęli na wynikach', 'Osoby przygotowujące się do zawodów', 'Wszyscy, którzy chcą być po prostu silni'],
            process: [
                { title: 'Testy maksymalne', text: 'Punkt wyjścia i analiza techniki.' },
                { title: 'Periodyzacja', text: 'Bloki objętości i intensywności rozpisane na tygodnie.' },
                { title: 'Szczyt formy', text: 'Tapering i nowe rekordy.' }
            ]
        },
        {
            slug: 'motoryka', area: 'sport',
            title: 'Motoryka i dynamika',
            tagline: 'Szybkość, skoczność, zwinność.',
            lead: 'Przygotowanie motoryczne dla sportów drużynowych i indywidualnych. Szybszy start, wyższy skok, mniej kontuzji.',
            typicalTime: '2–6 miesięcy',
            forWho: ['Piłkarze, koszykarze, siatkarze', 'Młodzi sportowcy', 'Amatorzy, którzy chcą być sprawniejsi'],
            process: [
                { title: 'Testy motoryczne', text: 'Skok, sprint, zmiana kierunku.' },
                { title: 'Siła i moc', text: 'Ćwiczenia plyometryczne i dynamiczne.' },
                { title: 'Retest', text: 'Porównanie wyników co 6 tygodni.' }
            ]
        },
        {
            slug: 'przygotowanie-sezon', area: 'sport',
            title: 'Przygotowanie do sezonu',
            tagline: 'Narty, rower, góry. Wejdź w sezon gotowy.',
            lead: 'Kilka tygodni ukierunkowanego treningu przed sezonem to mniej zakwasów, więcej frajdy i mniejsze ryzyko kontuzji.',
            typicalTime: '6–12 tygodni',
            forWho: ['Narciarze i snowboardziści', 'Rowerzyści i biegacze górscy', 'Wszyscy z aktywnym urlopem w planach'],
            process: [
                { title: 'Cel sezonu', text: 'Termin, dyscyplina, obecna forma.' },
                { title: 'Blok przygotowawczy', text: 'Siła nóg, stabilizacja, wydolność.' },
                { title: 'Forma na start', text: 'Ostatnie tygodnie z mniejszym obciążeniem.' }
            ]
        },
        {
            slug: 'bieganie', area: 'sport',
            title: 'Bieganie',
            tagline: 'Szybciej, dalej i bez bólu kolan.',
            lead: 'Trening siłowy dla biegaczy: mocniejsze nogi, lepsza ekonomia biegu i mniej przeciążeń.',
            typicalTime: '2–6 miesięcy',
            forWho: ['Biegacze przygotowujący się do zawodów', 'Osoby z bólem kolan lub piszczeli', 'Początkujący biegacze'],
            process: [
                { title: 'Analiza', text: 'Siła, mobilność, historia kontuzji.' },
                { title: 'Siła dla biegaczy', text: 'Dwa krótkie treningi uzupełniające w tygodniu.' },
                { title: 'Start', text: 'Plan na ostatnie tygodnie przed zawodami.' }
            ]
        },
        {
            slug: 'sporty-walki', area: 'sport',
            title: 'Sporty walki',
            tagline: 'Siła, wytrzymałość i odporność na kontuzje.',
            lead: 'Przygotowanie siłowe i kondycyjne dla zawodników i amatorów sportów walki.',
            typicalTime: '2–6 miesięcy',
            forWho: ['Zawodnicy MMA, BJJ, boksu', 'Amatorzy trenujący w klubach', 'Osoby przed walką lub zawodami'],
            process: [
                { title: 'Profil zawodnika', text: 'Mocne i słabe strony, kalendarz startów.' },
                { title: 'Siła i kondycja', text: 'Praca dopasowana do treningów w klubie.' },
                { title: 'Fight camp', text: 'Szczyt formy na dzień walki.' }
            ]
        },
        {
            slug: 'mobilnosc', area: 'sport',
            title: 'Mobilność',
            tagline: 'Pełny zakres ruchu w każdym stawie.',
            lead: 'Sztywne biodra i barki ograniczają każdy trening. Odzyskujemy zakres ruchu i uczymy go kontrolować.',
            typicalTime: '2–4 miesiące',
            forWho: ['Osoby z ograniczonym zakresem ruchu', 'Trenujący, którym mobilność blokuje technikę', 'Każdy, kto czuje się „sztywny”'],
            process: [
                { title: 'Testy zakresów', text: 'Biodra, barki, kręgosłup piersiowy, kostki.' },
                { title: 'Praca aktywna', text: 'Mobilność z kontrolą, nie tylko rozciąganie.' },
                { title: 'Integracja', text: 'Nowy zakres przenosimy na ćwiczenia siłowe.' }
            ]
        }
    ],

    /* Pojedyncze przemiany.
       Wymagane:   id, category
       Zdjęcia:    before/after (bez nich karta pokazuje opinię z `quote`)
       Podpis pod zdjęciem (OPCJONALNY, domyślnie pusty = brak podpisu):
                   highlight ("−11 kg"), name, age, duration
                   Wyświetlane są tylko uzupełnione pola.
       Krótki opis na stronie celu (po kilka zdań, wszystkie OPCJONALNE):
                   goal     cel; w obszarze Ból i urazy wyświetlany jako „Opis problemu”
                   actions  „Podjęte działania”: tablica punktów albo tekst
                   effects  „Efekty współpracy”
                   Jeśli jest choć jedno z nich, przemiana dostaje duży blok
                   (zdjęcie + opis + wideo pod spodem). Bez nich: samo zdjęcie lub opinia.
       Opcjonalne: video (mp4, wyświetlane w bloku z opisem), quote, condition, trainer
       Nieużywane od 10.2026 (zostają dla panelu): metrics, featured, title, story, timeline */
    cases: [
        {
            id: 'kasia-redukcja', category: 'redukcja', featured: true,
            name: 'Kasia', age: 31, trainer: 'aleksandra',
            title: 'Minus 11 kg mimo pracy zmianowej',
            highlight: '−11 kg', duration: '5 miesięcy', perWeek: 3,
            goal: 'Zejść z wagi na stałe mimo pracy zmianowej w szpitalu, bez kolejnej diety pudełkowej.',
            actions: ['3 stałe posiłki niezależne od godziny zmiany', 'Trening siłowy 3× w tygodniu, ustalany pod grafik', 'Białkowa przekąska na nocne zmiany'],
            effects: '−11 kg i −14 cm w talii w 5 miesięcy. Nawyki zostały, waga stoi od pół roku.',
            before: '../zdjecia_przed_po/2przed.webp', after: '../zdjecia_przed_po/2po.webp',
            metrics: [
                { label: 'Masa ciała', before: '72 kg', after: '61 kg' },
                { label: 'Talia', before: '84 cm', after: '70 cm' },
                { label: 'Tkanka tłuszczowa', before: '33%', after: '24%' },
                { label: 'Przysiad', before: '20 kg', after: '55 kg' }
            ],
            quote: 'Pierwszy raz schudłam bez liczenia dni do końca diety. Po prostu tak teraz żyję.',
            story: {
                start: 'Kasia pracuje jako pielęgniarka w systemie zmianowym. Przez lata próbowała diet pudełkowych i aplikacji do liczenia kalorii, ale każda nocna zmiana kończyła się podjadaniem i powrotem do punktu wyjścia.',
                plan: 'Zamiast sztywnego jadłospisu ustaliliśmy trzy stałe posiłki niezależne od godziny zmiany i białkową przekąskę na noc. Treningi siłowe 3 razy w tygodniu, dopasowane do grafiku z miesięcznym wyprzedzeniem.',
                result: 'Po pięciu miesiącach 11 kg mniej, 14 cm mniej w talii i prawie trzykrotnie mocniejszy przysiad. Najważniejsze: nawyki zostały, a waga stoi od pół roku.'
            },
            timeline: [
                { when: 'Tydzień 1', text: 'Pomiary, nauka techniki, plan posiłków pod grafik zmian.' },
                { when: 'Miesiąc 2', text: 'Pierwsze −5 kg. Wprowadzenie progresji ciężarów.' },
                { when: 'Miesiąc 4', text: 'Kryzys po serii nocek. Tydzień lżejszego treningu i powrót do rytmu.' },
                { when: 'Miesiąc 5', text: 'Cel osiągnięty. Stopniowe wyjście z deficytu.' }
            ],
            video: '../video/bg/bg-20260630_204754.mp4'
        },
        {
            id: 'tomek-redukcja', category: 'redukcja', featured: true,
            name: 'Tomek', age: 27, trainer: 'jakub',
            title: 'Z 77 kg do sylwetki, której nie miał nigdy',
            highlight: '−9 kg', duration: '6 miesięcy', perWeek: 3,
            goal: 'Zrzucić brzuch po latach pracy zdalnej. Bieganie odpadało, bo bolały kolana.',
            actions: ['Trening siłowy całego ciała 3× w tygodniu', '8000 kroków dziennie zamiast biegania', 'Białko w każdym posiłku, woda zamiast słodzonych napojów'],
            effects: '−9 kg, martwy ciąg z 60 do 130 kg i zero bólu kolan.',
            before: '../zdjecia_przed_po/3przed.webp', after: '../zdjecia_przed_po/3po.webp',
            metrics: [
                { label: 'Masa ciała', before: '77 kg', after: '68 kg' },
                { label: 'Talia', before: '89 cm', after: '76 cm' },
                { label: 'Martwy ciąg', before: '60 kg', after: '130 kg' }
            ],
            quote: 'Myślałem, że muszę biegać codziennie. Wystarczyła siłownia trzy razy w tygodniu i ogarnięte jedzenie.',
            story: {
                start: 'Tomek pracuje zdalnie jako programista. Mało ruchu, nieregularne posiłki, sporo słodzonych napojów. Wcześniej próbował biegać, ale po dwóch tygodniach odpuszczał przez ból kolan.',
                plan: 'Postawiliśmy na trening siłowy całego ciała i kroki zamiast biegania. Dieta bez eliminacji, z prostą zasadą: białko w każdym posiłku i woda zamiast napojów.',
                result: 'W pół roku 9 kg mniej, ponad dwukrotnie większy martwy ciąg i zero bólu kolan. Tomek trenuje dziś samodzielnie według naszego planu.'
            },
            timeline: [
                { when: 'Tydzień 1', text: 'Testy siłowe, nauka martwego ciągu i przysiadu.' },
                { when: 'Miesiąc 2', text: '8000 kroków dziennie jako stały nawyk.' },
                { when: 'Miesiąc 6', text: '−9 kg i martwy ciąg 130 kg.' }
            ]
        },
        { id: 'r-4', category: 'redukcja', before: '../zdjecia_przed_po/4przed.webp', after: '../zdjecia_przed_po/4po.webp' },
        { id: 'r-8', category: 'redukcja', before: '../zdjecia_przed_po/8przed.webp', after: '../zdjecia_przed_po/8po.webp' },
        { id: 'r-9', category: 'redukcja', before: '../zdjecia_przed_po/9przed.webp', after: '../zdjecia_przed_po/9po.webp' },
        { id: 'r-10', category: 'redukcja', before: '../zdjecia_przed_po/10przed.webp', after: '../zdjecia_przed_po/10po.webp' },
        { id: 'r-13', category: 'redukcja', before: '../zdjecia_przed_po/13przed.webp', after: '../zdjecia_przed_po/13po.webp' },
        { id: 'r-14', category: 'redukcja', before: '../zdjecia_przed_po/14przed.webp', after: '../zdjecia_przed_po/14po.webp' },

        {
            id: 'pawel-masa', category: 'budowa-masy', featured: true,
            name: 'Paweł', age: 24, trainer: 'konrad',
            title: 'Plus 7 kg mięśni u „wiecznie chudego”',
            highlight: '+7 kg', duration: '10 miesięcy', perWeek: 4,
            goal: 'Przybrać na masie przy 182 cm wzrostu i 64 kg wagi.',
            actions: ['Nadwyżka 300 kcal w 4 posiłkach', 'Ćwiczenia wielostawowe z progresją co tydzień'],
            effects: '+7 kg przy prawie niezmienionej talii. Wyciskanie z 40 do 85 kg.',
            before: '../zdjecia_przed_po/5przed.webp', after: '../zdjecia_przed_po/5po.webp',
            metrics: [
                { label: 'Masa ciała', before: '64 kg', after: '71 kg' },
                { label: 'Obwód ramienia', before: '29 cm', after: '34 cm' },
                { label: 'Wyciskanie leżąc', before: '40 kg', after: '85 kg' }
            ],
            quote: 'Całe życie słyszałem, że mam taką budowę. Okazało się, że po prostu za mało jadłem i źle trenowałem.',
            story: {
                start: 'Paweł od liceum ćwiczył „na czuja”, głównie na maszynach. Przy wzroście 182 cm ważył 64 kg i był przekonany, że nie da się przytyć.',
                plan: 'Nadwyżka 300 kcal, rozpisana na 4 posiłki i koktajl. Program siłowy oparty na ćwiczeniach wielostawowych z progresją co tydzień.',
                result: 'W 10 miesięcy 7 kg więcej przy prawie niezmienionej talii. Wyciskanie wzrosło z 40 do 85 kg.'
            },
            timeline: [
                { when: 'Miesiąc 1', text: 'Nauka techniki, stopniowe zwiększanie kalorii.' },
                { when: 'Miesiąc 5', text: '+4 kg, pierwsze 70 kg na ławce.' },
                { when: 'Miesiąc 10', text: '+7 kg, 85 kg w wyciskaniu.' }
            ]
        },

        { id: 'rk-1', category: 'rekompozycja', before: '../zdjecia_przed_po/1przed.webp', after: '../zdjecia_przed_po/1po.webp' },
        { id: 'rk-11', category: 'rekompozycja', before: '../zdjecia_przed_po/11przed.webp', after: '../zdjecia_przed_po/11po.webp' },
        { id: 'rk-12', category: 'rekompozycja', before: '../zdjecia_przed_po/12przed.webp', after: '../zdjecia_przed_po/12po.webp' },

        { id: 's-7', category: 'sila', before: '../zdjecia_przed_po/7przed.webp', after: '../zdjecia_przed_po/7po.webp' },

        /* Przemiany bez zdjęć — opinie z obszaru Ból i urazy */
        {
            id: 'agnieszka-plecy', category: 'bol-kregoslupa', featured: true,
            name: 'Agnieszka', age: 41, trainer: 'marta',
            title: 'Koniec z tabletkami przeciwbólowymi po 3 latach',
            highlight: '0 tabletek', duration: '4 miesiące', perWeek: 2,
            condition: 'Przewlekły ból dolnego odcinka kręgosłupa',
            goal: 'Ból lędźwi od 3 lat, codzienne tabletki przeciwbólowe. Fizjoterapia pomagała tylko na kilka dni.',
            actions: ['Ruch w zakresie bez bólu i nauka oddechu', 'Ćwiczenia z obciążeniem od 2. miesiąca', 'Martwy ciąg z kettlem po 3 miesiącach'],
            effects: 'Ból spadł z 7 do 1 w skali 0–10. Leki odstawione całkowicie.',
            metrics: [
                { label: 'Ból (skala 0–10)', before: '7', after: '1' },
                { label: 'Leki przeciwbólowe', before: 'codziennie', after: 'wcale' },
                { label: 'Plank', before: '15 s', after: '90 s' }
            ],
            quote: 'Przez 3 lata brałam tabletki przeciwbólowe jak cukierki. Po 4 miesiącach treningu odstawiłam je całkowicie.',
            story: {
                start: 'Agnieszka od trzech lat budziła się z bólem lędźwi. Fizjoterapia przynosiła ulgę na kilka dni, a tabletki stały się codziennością.',
                plan: 'Zaczęliśmy od ruchu w zakresie bez bólu i nauki oddechu. Po miesiącu weszły ćwiczenia z obciążeniem, a po trzech martwy ciąg z kettlem.',
                result: 'Ból spadł z 7 do 1 w skali dziesięciopunktowej. Agnieszka nie bierze leków i sama podnosi zakupy do samochodu.'
            },
            timeline: [
                { when: 'Tydzień 1', text: 'Diagnoza funkcjonalna i ćwiczenia oddechowe.' },
                { when: 'Miesiąc 2', text: 'Pierwsze ćwiczenia z obciążeniem bez bólu.' },
                { when: 'Miesiąc 4', text: 'Odstawienie leków, martwy ciąg z kettlem 16 kg.' }
            ]
        },
        { id: 'robert-dyskopatia', goal: 'Dyskopatia L4/L5 i propozycja kolejnej operacji kręgosłupa.', actions: ['Ruch w zakresie bez bólu', 'Stopniowe wzmacnianie mięśni głębokich', 'Kontrolowane wprowadzanie obciążenia'], effects: 'Po 7 miesiącach bez bólu. Operacja okazała się niepotrzebna.', category: 'bol-kregoslupa', name: 'Robert', age: 52, condition: 'Dyskopatia L4/L5', highlight: 'Bez operacji', duration: '7 miesięcy', quote: 'Neurochirurg zaproponował mi kolejną operację. Zdecydowałem się najpierw spróbować rehabilitacji przez ruch. Po 7 miesiącach bólu nie ma, operacji nie będzie.' },
        { id: 'piotr-kolano', goal: 'Ograniczony zakres ruchu w kolanie po operacji łąkotki.', actions: ['Stopniowe przywracanie zakresu ruchu', 'Wzmacnianie mięśni wokół kolana'], effects: 'Pełny zakres ruchu i powrót na rower po 6 miesiącach.', category: 'po-urazie', name: 'Piotr', age: 45, condition: 'Po operacji łąkotki', highlight: 'Znów na rowerze', duration: '6 miesięcy', quote: 'Sześć miesięcy po operacji łąkotki myślałem, że jazda na rowerze to już przeszłość. Trener ułożył mi program, który stopniowo przywrócił pełen zakres ruchu.' },
        { id: 'dawid-bark', goal: 'Zerwany stożek rotatorów. Ortopeda zalecił 12 miesięcy przerwy od sportu.', actions: ['Plan powrotu etapami, kontrola obciążenia barku', 'Trening reszty ciała bez przerwy'], effects: 'Powrót do sportu po 8 miesiącach zamiast 12.', category: 'po-urazie', name: 'Dawid', age: 33, condition: 'Zerwanie stożka rotatorów', highlight: '4 mies. szybciej', duration: '8 miesięcy', quote: 'Ortopeda dał mi 12 miesięcy przerwy od sportu. Wróciłem po 8. Trener wiedział, kiedy przyspieszać, a kiedy hamować.' },
        { id: 'marta-postawa', goal: 'Zaokrąglone plecy po 5 latach pracy przy biurku po 8 godzin dziennie.', actions: ['Wzmacnianie mięśni grzbietu', 'Mobilność odcinka piersiowego', 'Proste przerwy ruchowe w pracy'], effects: 'Wyprostowana sylwetka po 3 miesiącach.', category: 'wady-postawy', name: 'Marta', age: 29, condition: 'Wady postawy, praca siedząca', highlight: 'Prosta sylwetka', duration: '3 miesiące', quote: 'Siedziałam 8 godzin dziennie przy biurku od 5 lat. Miałam tak poważne zaokrąglenie pleców, że sama tego nie widziałam. Po 3 miesiącach stałam prosto.' },
        { id: 'zofia-fibromialgia', goal: 'Fibromialgia i chroniczny ból, który zmienia się z dnia na dzień.', actions: ['Trening dopasowywany do samopoczucia w danym dniu', 'Nauka dawkowania wysiłku'], effects: 'Mniej bólu i poczucie wpływu na własne ciało po 9 miesiącach.', category: 'przewlekly-bol', name: 'Zofia', age: 38, condition: 'Fibromialgia, chroniczny ból', highlight: 'Mniej bólu', duration: '9 miesięcy', quote: 'Fibromialgia sprawia, że każdy dzień jest nieprzewidywalny. Nauczyłam się ćwiczyć mądrze, nie na przekór ciału. Po raz pierwszy od lat czuję, że mam wpływ.' }
    ],

    trainers: {
        aleksandra: { name: 'Aleksandra Dunajewska', photo: '../Trenerzy/aleksandra_dunajewska.webp' },
        jakub: { name: 'Jakub Cyndecki', photo: '../Trenerzy/jakub_cyndecki.webp' },
        konrad: { name: 'Konrad', photo: '../Trenerzy/konrad.webp' },
        marta: { name: 'Marta', photo: '../Trenerzy/marta.webp' }
    }
};
