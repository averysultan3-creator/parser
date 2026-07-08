const FALLBACK_LANGUAGE = 'pl';

const baseServiceCategories = [
  {
    id: 'web',
    label: 'Strony i branding',
    accent: 'green',
    services: [
      {
        id: 'websites',
        icon: 'monitor',
        name: 'Strony internetowe',
        short: 'Nowoczesne strony, które budują zaufanie i prowadzą klienta do kontaktu.',
        price: 'od 500 EUR',
        details: {
          what: 'Pełnowartościowa strona firmowa: oferta, realizacje, opinie i kontakt.',
          forWho: 'Firmy usługowe, gabinety, warsztaty, biura i lokalny biznes.',
          problem: 'Brak strony albo stara strona, która nie daje zapytań.',
          gives: 'Profesjonalny wizerunek i realne zapytania z internetu.',
          priceFactors: 'Liczba podstron, poziom designu, animacje i integracje.',
          process: 'Analiza → koncepcja → design → wdrożenie → testy → start.'
        }
      },
      {
        id: 'landing',
        icon: 'zap',
        name: 'Landing page',
        short: 'Jedna strona, jeden cel: kontakt, rezerwacja albo sprzedaż.',
        price: 'od 300 EUR',
        details: {
          what: 'Skoncentrowana strona pod konkretną usługę lub kampanię reklamową.',
          forWho: 'Kampanie Google Ads / Meta Ads, promocje i pojedyncze usługi.',
          problem: 'Reklama prowadzi na stronę, która nie konwertuje.',
          gives: 'Wyższy procent zapytań z tego samego ruchu.',
          priceFactors: 'Długość strony, animacje, copywriting i testy A/B.',
          process: 'Cel → struktura → treść → design → wdrożenie.'
        }
      },
      {
        id: 'ecommerce',
        icon: 'shopping-cart',
        name: 'Sklepy internetowe',
        short: 'Sklep, który wygląda premium i prowadzi do zakupu.',
        price: 'indywidualnie',
        details: {
          what: 'Sklep online z płatnościami, dostawą i panelem zarządzania.',
          forWho: 'Marki produktowe, lokalne sklepy i e-commerce B2B.',
          problem: 'Sprzedaż działa tylko offline albo przez marketplace z prowizjami.',
          gives: 'Własny kanał sprzedaży i własną bazę klientów.',
          priceFactors: 'Liczba produktów, integracje, płatności i logistyka.',
          process: 'Analiza → architektura → design → wdrożenie → integracje.'
        }
      },
      {
        id: 'copywriting',
        icon: 'pen-line',
        name: 'Copywriting',
        short: 'Teksty, które mówią językiem klienta i sprzedają.',
        price: 'od 150 EUR',
        details: {
          what: 'Treści na stronę: nagłówki, oferta, opisy usług i CTA.',
          forWho: 'Każda firma, która chce brzmieć profesjonalnie.',
          problem: 'Strona jest, ale teksty nie przekonują.',
          gives: 'Jasny przekaz i wyższą konwersję.',
          priceFactors: 'Liczba podstron, research, język i branża.',
          process: 'Brief → research → draft → poprawki → final.'
        }
      },
      {
        id: 'branding',
        icon: 'gem',
        name: 'Branding',
        short: 'Logo, kolory i styl — spójny wizerunek marki.',
        price: 'od 300 EUR',
        details: {
          what: 'Identyfikacja wizualna: logo, paleta, typografia i zasady stylu.',
          forWho: 'Nowe firmy oraz marki, które chcą odświeżyć wizerunek.',
          problem: 'Firma wygląda przypadkowo i niespójnie.',
          gives: 'Rozpoznawalność i profesjonalny odbiór.',
          priceFactors: 'Zakres: samo logo czy pełny brandbook.',
          process: 'Moodboard → koncepcje → wybór → dopracowanie → paczka plików.'
        }
      },
      {
        id: 'uiux',
        icon: 'layout-dashboard',
        name: 'UI/UX design',
        short: 'Projektowanie interfejsów, które są ładne i logiczne.',
        price: 'od 400 EUR',
        details: {
          what: 'Projekt interfejsu strony, aplikacji lub panelu.',
          forWho: 'Produkty cyfrowe, SaaS i systemy wewnętrzne.',
          problem: 'Użytkownicy gubią się i nie kończą działań.',
          gives: 'Łatwiejszą obsługę i wyższą konwersję.',
          priceFactors: 'Liczba ekranów, badania i prototypy.',
          process: 'Flow → wireframe → UI → prototyp → testy.'
        }
      },
      {
        id: 'anim3d',
        icon: 'box',
        name: 'Animacje 3D',
        short: 'Efekty 3D i motion design, które robią wrażenie.',
        price: 'od 250 EUR',
        details: {
          what: 'Obiekty 3D, scroll-animacje i interaktywne sceny na stronie.',
          forWho: 'Marki premium, które chcą się wyróżniać.',
          problem: 'Strona wygląda jak tysiące innych.',
          gives: 'Efekt wow i większą zapamiętywalność.',
          priceFactors: 'Złożoność sceny, optymalizacja i liczba animacji.',
          process: 'Koncepcja → scena → animacja → optymalizacja.'
        }
      },
      {
        id: 'cro',
        icon: 'trending-up',
        name: 'Optymalizacja konwersji',
        short: 'Zmieniamy odwiedzających w zapytania.',
        price: 'od 200 EUR',
        details: {
          what: 'Audyt i poprawa strony pod kątem zapytań: CTA, formularze i struktura.',
          forWho: 'Firmy, które mają ruch, ale mało kontaktów.',
          problem: 'Ludzie wchodzą na stronę i wychodzą bez kontaktu.',
          gives: 'Więcej zapytań bez zwiększania budżetu na reklamę.',
          priceFactors: 'Rozmiar strony, analityka i liczba testów.',
          process: 'Audyt → hipotezy → zmiany → pomiar → iteracje.'
        }
      }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    accent: 'cyan',
    services: [
      {
        id: 'googleads',
        icon: 'mouse-pointer-click',
        name: 'Google Ads',
        short: 'Reklama pod zapytania, nie tylko kliki.',
        price: 'od 250 EUR / mies.',
        details: {
          what: 'Kampanie w wyszukiwarce Google nastawione na telefon, formularz i rezerwacje.',
          forWho: 'Usługi lokalne, B2B i e-commerce.',
          problem: 'Klienci szukają usługi, ale znajdują konkurencję.',
          gives: 'Ruch od ludzi, którzy już szukają Twojej usługi.',
          priceFactors: 'Budżet, konkurencja i liczba kampanii.',
          process: 'Analiza → struktura kampanii → start → optymalizacja co tydzień.'
        }
      },
      {
        id: 'metaads',
        icon: 'megaphone',
        name: 'Meta Ads',
        short: 'Facebook i Instagram — reklama, która buduje popyt.',
        price: 'od 250 EUR / mies.',
        details: {
          what: 'Kampanie na Facebooku i Instagramie: zasięg, zapytania i remarketing.',
          forWho: 'Beauty, gastronomia, e-commerce i usługi B2C.',
          problem: 'Marka jest niewidoczna tam, gdzie ludzie spędzają czas.',
          gives: 'Rozpoznawalność i strumień nowych zapytań.',
          priceFactors: 'Budżet, kreacje i liczba grup odbiorców.',
          process: 'Strategia → kreacje → testy → skalowanie.'
        }
      },
      {
        id: 'tiktokads',
        icon: 'clapperboard',
        name: 'TikTok Ads',
        short: 'Krótkie wideo, które zdobywa uwagę młodszych klientów.',
        price: 'od 300 EUR / mies.',
        details: {
          what: 'Kampanie wideo na TikToku z natywnymi kreacjami.',
          forWho: 'Marki B2C, e-commerce, edukacja i beauty.',
          problem: 'Trudno dotrzeć do młodszej grupy klientów.',
          gives: 'Tani zasięg i nowy kanał pozyskania.',
          priceFactors: 'Produkcja wideo, budżet i częstotliwość kreacji.',
          process: 'Koncepcje → wideo → testy → optymalizacja.'
        }
      },
      {
        id: 'seo',
        icon: 'search',
        name: 'SEO',
        short: 'Pozycjonowanie: darmowy ruch z Google miesiąc po miesiącu.',
        price: 'od 300 EUR / mies.',
        details: {
          what: 'Optymalizacja techniczna, treści i linki, które podnoszą pozycje.',
          forWho: 'Firmy, które myślą długoterminowo.',
          problem: 'Strona nie pojawia się w wynikach wyszukiwania.',
          gives: 'Stabilny ruch bez płacenia za każde kliknięcie.',
          priceFactors: 'Konkurencja fraz, stan strony i tempo publikacji.',
          process: 'Audyt → plan fraz → optymalizacja → treści → monitoring.'
        }
      },
      {
        id: 'gbp',
        icon: 'map-pin',
        name: 'Google Business Profile',
        short: 'Wizytówka w Mapach Google, która przyciąga lokalnych klientów.',
        price: 'od 150 EUR',
        details: {
          what: 'Optymalizacja profilu firmy w Google: zdjęcia, opinie, opisy i posty.',
          forWho: 'Każdy lokalny biznes: gabinety, salony, warsztaty i restauracje.',
          problem: 'Klienci wybierają firmy z lepszym profilem i opiniami.',
          gives: 'Więcej telefonów i wizyt z Map Google.',
          priceFactors: 'Stan profilu, liczba lokalizacji i strategia opinii.',
          process: 'Audyt → optymalizacja → system opinii → posty.'
        }
      },
      {
        id: 'remarketing',
        icon: 'repeat',
        name: 'Remarketing',
        short: 'Wracamy do osób, które już Cię widziały.',
        price: 'od 150 EUR / mies.',
        details: {
          what: 'Kampanie do osób, które odwiedziły stronę, ale nie zostawiły kontaktu.',
          forWho: 'Firmy z ruchem na stronie i dłuższym procesem decyzji.',
          problem: '95% odwiedzających wychodzi bez kontaktu i znika.',
          gives: 'Drugi i trzeci kontakt z klientem za ułamek kosztu.',
          priceFactors: 'Wielkość ruchu, liczba segmentów i kreacje.',
          process: 'Piksele → segmenty → kreacje → kampanie.'
        }
      },
      {
        id: 'analytics',
        icon: 'bar-chart-3',
        name: 'Analityka',
        short: 'Widzisz, skąd przychodzą klienci i co działa.',
        price: 'od 200 EUR',
        details: {
          what: 'GA4, konwersje, cele i raporty — pełny obraz skuteczności.',
          forWho: 'Firmy, które inwestują w marketing i chcą decyzji opartych o dane.',
          problem: 'Budżet idzie w reklamę, ale nie wiadomo co działa.',
          gives: 'Jasne dane do decyzji: co skalować, co wyłączyć.',
          priceFactors: 'Liczba źródeł, integracje i dashboardy.',
          process: 'Audyt → konfiguracja → cele → raporty.'
        }
      },
      {
        id: 'funnels',
        icon: 'filter',
        name: 'Lejki sprzedażowe',
        short: 'Od pierwszego kontaktu do klienta — zaprojektowana droga.',
        price: 'od 400 EUR',
        details: {
          what: 'Projektujemy całą drogę klienta: reklama → strona → kontakt → follow-up.',
          forWho: 'Firmy, które chcą systemu, a nie pojedynczych działań.',
          problem: 'Każdy element działa osobno i leady gubią się po drodze.',
          gives: 'Przewidywalny proces pozyskiwania klientów.',
          priceFactors: 'Liczba etapów, integracje i automatyzacje.',
          process: 'Mapa lejka → strony → automatyzacje → pomiar.'
        }
      }
    ]
  },
  {
    id: 'ai',
    label: 'AI i automatyzacje',
    accent: 'violet',
    services: [
      {
        id: 'aichatbot',
        icon: 'bot',
        name: 'AI Chatbot',
        short: 'Asystent, który odpowiada klientom 24/7.',
        price: 'od 400 EUR',
        details: {
          what: 'Chatbot AI na stronie: odpowiada na pytania, zbiera dane i umawia kontakt.',
          forWho: 'Firmy z dużą liczbą powtarzalnych pytań.',
          problem: 'Klienci piszą po godzinach i nie dostają odpowiedzi.',
          gives: 'Obsługę 24/7 i zero utraconych zapytań.',
          priceFactors: 'Baza wiedzy, integracje i języki.',
          process: 'Baza wiedzy → konfiguracja → testy → wdrożenie.'
        }
      },
      {
        id: 'aiauto',
        icon: 'workflow',
        name: 'Automatyzacja zapytań',
        short: 'Każde zapytanie trafia tam, gdzie trzeba — automatycznie.',
        price: 'od 250 EUR',
        details: {
          what: 'Formularz → CRM → powiadomienie → zadanie. Bez ręcznego przepisywania.',
          forWho: 'Firmy, które dostają zapytania z kilku kanałów.',
          problem: 'Zapytania giną w mailach i wiadomościach.',
          gives: 'Porządek i szybszą reakcję na każdy lead.',
          priceFactors: 'Liczba kanałów i integracji.',
          process: 'Mapa procesów → integracje → testy → start.'
        }
      },
      {
        id: 'aiqualify',
        icon: 'badge-check',
        name: 'AI lead qualification',
        short: 'AI ocenia, które zapytania są najcenniejsze.',
        price: 'od 300 EUR',
        details: {
          what: 'Automatyczna ocena i tagowanie leadów według potencjału.',
          forWho: 'Firmy z dużą liczbą zapytań i ograniczonym czasem.',
          problem: 'Zespół traci czas na kontakty bez potencjału.',
          gives: 'Priorytety: najpierw najlepsze leady.',
          priceFactors: 'Kryteria oceny, źródła danych i integracja z CRM.',
          process: 'Kryteria → model oceny → integracja → kalibracja.'
        }
      },
      {
        id: 'aifollowup',
        icon: 'mail-plus',
        name: 'AI follow-up',
        short: 'Automatyczne przypomnienia, które domykają sprzedaż.',
        price: 'od 250 EUR',
        details: {
          what: 'Sekwencje wiadomości do leadów, które nie odpowiedziały.',
          forWho: 'Usługi z dłuższym procesem decyzyjnym.',
          problem: 'Brak odpowiedzi kończy kontakt, choć wystarczy przypomnienie.',
          gives: 'Odzyskane leady bez pracy ręcznej.',
          priceFactors: 'Liczba scenariuszy i kanałów.',
          process: 'Scenariusze → treści → automatyzacja → pomiar.'
        }
      },
      {
        id: 'crmauto',
        icon: 'database',
        name: 'CRM automations',
        short: 'CRM, który pracuje sam: statusy, zadania i przypomnienia.',
        price: 'od 300 EUR',
        details: {
          what: 'Konfiguracja i automatyzacja CRM pod proces firmy.',
          forWho: 'Zespoły sprzedaży i firmy usługowe.',
          problem: 'CRM jest, ale nikt go nie uzupełnia.',
          gives: 'Aktualne dane bez ręcznego klikania.',
          priceFactors: 'Wybór CRM, liczba procesów i integracje.',
          process: 'Proces → konfiguracja → automatyzacje → szkolenie.'
        }
      },
      {
        id: 'aireports',
        icon: 'file-bar-chart',
        name: 'Raporty AI',
        short: 'Cotygodniowe podsumowania pisane przez AI.',
        price: 'od 200 EUR',
        details: {
          what: 'Automatyczne raporty: leady, kampanie i sprzedaż — prostym językiem.',
          forWho: 'Właściciele firm, którzy nie mają czasu na dashboardy.',
          problem: 'Dane są, ale nikt ich nie czyta.',
          gives: 'Jedno podsumowanie zamiast pięciu paneli.',
          priceFactors: 'Źródła danych, częstotliwość i format.',
          process: 'Źródła → szablon → automatyzacja → wysyłka.'
        }
      },
      {
        id: 'apiint',
        icon: 'plug-zap',
        name: 'Integracje API',
        short: 'Łączymy systemy, które nie chcą ze sobą rozmawiać.',
        price: 'indywidualnie',
        details: {
          what: 'Połączenia między narzędziami: strona, CRM, płatności, magazyn i ERP.',
          forWho: 'Firmy z kilkoma systemami i ręcznym przenoszeniem danych.',
          problem: 'Dane przepisywane ręcznie to błędy i strata czasu.',
          gives: 'Systemy, które wymieniają dane same.',
          priceFactors: 'Liczba systemów, dokumentacja API i logika.',
          process: 'Analiza → projekt integracji → wdrożenie → monitoring.'
        }
      },
      {
        id: 'automsg',
        icon: 'message-square-more',
        name: 'Automatyczne wiadomości',
        short: 'SMS, email i WhatsApp wysyłane w idealnym momencie.',
        price: 'od 200 EUR',
        details: {
          what: 'Potwierdzenia, przypomnienia i podziękowania — automatycznie.',
          forWho: 'Rezerwacje, gabinety, usługi cykliczne i e-commerce.',
          problem: 'Klienci zapominają o wizytach i zamówieniach.',
          gives: 'Mniej nieobecności i więcej powrotów.',
          priceFactors: 'Kanały, liczba scenariuszy i wolumen.',
          process: 'Scenariusze → treści → integracja → start.'
        }
      }
    ]
  },
  {
    id: 'systems',
    label: 'Systemy biznesowe',
    accent: 'gold',
    services: [
      {
        id: 'leadforms',
        icon: 'clipboard-list',
        name: 'Formularze leadowe',
        short: 'Formularze i quizy, które ludzie chcą wypełniać.',
        price: 'od 150 EUR',
        details: {
          what: 'Interaktywne formularze wieloetapowe z logiką warunkową.',
          forWho: 'Każda firma zbierająca zapytania online.',
          problem: 'Długie nudne formularze odstraszają klientów.',
          gives: 'Więcej wypełnień i lepsze dane o kliencie.',
          priceFactors: 'Liczba kroków, logika i integracje.',
          process: 'Pytania → design → logika → integracja.'
        }
      },
      {
        id: 'calculators',
        icon: 'calculator',
        name: 'Kalkulatory ofert',
        short: 'Klient sam wylicza orientacyjną cenę i zostawia kontakt.',
        price: 'od 300 EUR',
        details: {
          what: 'Interaktywny kalkulator wyceny usług na stronie.',
          forWho: 'Budowlanka, remonty, sprzątanie, transport i produkcja.',
          problem: '"Ile to kosztuje?" to najczęstsze pytanie bez odpowiedzi.',
          gives: 'Zaangażowanie i gotowego, ciepłego leada.',
          priceFactors: 'Złożoność logiki wyceny i design.',
          process: 'Logika cen → UI → wdrożenie → integracja z leadami.'
        }
      },
      {
        id: 'adminpanels',
        icon: 'panel-left',
        name: 'Panele admina',
        short: 'Własny panel do zarządzania firmą, danymi i treścią.',
        price: 'od 500 EUR',
        details: {
          what: 'Dedykowany panel: leady, klienci, treści i statystyki.',
          forWho: 'Firmy z własnymi procesami, których nie ma w gotowych narzędziach.',
          problem: 'Excel i notatki przestają wystarczać.',
          gives: 'Jedno miejsce kontroli nad firmą.',
          priceFactors: 'Liczba modułów, role i integracje.',
          process: 'Procesy → prototyp → wdrożenie → iteracje.'
        }
      },
      {
        id: 'booking',
        icon: 'calendar-check',
        name: 'Systemy rezerwacji',
        short: 'Klienci rezerwują online, a kalendarz pilnuje się sam.',
        price: 'od 350 EUR',
        details: {
          what: 'Rezerwacje online z potwierdzeniami i przypomnieniami.',
          forWho: 'Salony, gabinety, korepetycje, wynajem i usługi na godziny.',
          problem: 'Umawianie wizyt przez telefon tworzy chaos i nieobecności.',
          gives: 'Mniej telefonów i mniej dziur w kalendarzu.',
          priceFactors: 'Liczba pracowników / zasobów, płatności i integracje.',
          process: 'Konfiguracja → integracja → automatyczne wiadomości.'
        }
      },
      {
        id: 'dashboards',
        icon: 'gauge',
        name: 'Dashboardy',
        short: 'Wszystkie liczby firmy na jednym ekranie.',
        price: 'od 400 EUR',
        details: {
          what: 'Panel z kluczowymi wskaźnikami: leady, sprzedaż, marketing i finanse.',
          forWho: 'Właściciele i managerowie, którzy chcą widzieć całość.',
          problem: 'Dane są rozrzucone po pięciu systemach.',
          gives: 'Decyzje na podstawie liczb, nie intuicji.',
          priceFactors: 'Liczba źródeł danych i częstotliwość odświeżania.',
          process: 'Wskaźniki → źródła → dashboard → automatyzacja.'
        }
      },
      {
        id: 'emailint',
        icon: 'mail',
        name: 'Integracje z e-mail',
        short: 'Maile, które wysyłają się same we właściwym momencie.',
        price: 'od 150 EUR',
        details: {
          what: 'Automatyczne maile: powitania, oferty, potwierdzenia i newslettery.',
          forWho: 'Firmy budujące relacje z bazą klientów.',
          problem: 'Baza kontaktów leży i nie pracuje.',
          gives: 'Regularny kontakt bez ręcznej wysyłki.',
          priceFactors: 'Liczba scenariuszy, szablony i segmentacja.',
          process: 'Strategia → szablony → automatyzacje → start.'
        }
      },
      {
        id: 'messengers',
        icon: 'send',
        name: 'Integracje Telegram / WhatsApp',
        short: 'Zapytania i powiadomienia prosto do komunikatora.',
        price: 'od 200 EUR',
        details: {
          what: 'Leady, alerty i raporty trafiają do Telegrama lub WhatsAppa.',
          forWho: 'Zespoły, które żyją w komunikatorach, a nie w mailu.',
          problem: 'Zapytanie przyszło na mail i zostało zauważone po 6 godzinach.',
          gives: 'Reakcję w minuty, nie w godziny.',
          priceFactors: 'Liczba kanałów i scenariuszy.',
          process: 'Kanały → boty → integracja → testy.'
        }
      },
      {
        id: 'customtools',
        icon: 'wrench',
        name: 'Custom business tools',
        short: 'Narzędzia szyte na miarę pod Twój proces.',
        price: 'indywidualnie',
        details: {
          what: 'Dedykowane aplikacje i narzędzia: od generatorów ofert po systemy wewnętrzne.',
          forWho: 'Firmy z unikalnym procesem, którego nie obsłuży gotowy soft.',
          problem: 'Gotowe narzędzia wymuszają cudzy proces.',
          gives: 'Narzędzie dopasowane w 100% do firmy.',
          priceFactors: 'Zakres, integracje i utrzymanie.',
          process: 'Analiza → prototyp → wdrożenie → rozwój.'
        }
      }
    ]
  }
];

const categoryTranslations = {
  en: {
    web: 'Websites & branding',
    marketing: 'Marketing',
    ai: 'AI & automations',
    systems: 'Business systems'
  },
  ru: {
    web: 'Сайты и брендинг',
    marketing: 'Маркетинг',
    ai: 'AI и автоматизации',
    systems: 'Бизнес-системы'
  }
};

const serviceTranslations = {
  en: {
    websites: {
      name: 'Websites',
      short: 'Modern websites that build trust and guide the client to contact.',
      details: {
        what: 'A full company website with offer, case studies, reviews and contact paths.',
        forWho: 'Service businesses, clinics, workshops, offices and local companies.',
        problem: 'No website, or an outdated website that does not generate enquiries.',
        gives: 'A professional image and real inbound enquiries.',
        priceFactors: 'Number of pages, design depth, animations and integrations.',
        process: 'Analysis → concept → design → build → testing → launch.'
      }
    },
    landing: {
      name: 'Landing page',
      short: 'One page, one goal: contact, booking or sales.',
      details: {
        what: 'A focused page for one service, one campaign or one conversion target.',
        forWho: 'Google Ads / Meta Ads campaigns, promotions and standalone offers.',
        problem: 'Traffic lands on a page that does not convert.',
        gives: 'A higher enquiry rate from the same traffic.',
        priceFactors: 'Page length, animations, copywriting and A/B testing.',
        process: 'Goal → structure → copy → design → launch.'
      }
    },
    ecommerce: {
      name: 'E-commerce stores',
      short: 'An online store that looks premium and leads to purchase.',
      details: {
        what: 'An online shop with payments, delivery and an admin management layer.',
        forWho: 'Product brands, local stores and B2B e-commerce.',
        problem: 'Sales happen only offline or through marketplaces with fees.',
        gives: 'A direct sales channel and an owned customer base.',
        priceFactors: 'Number of products, integrations, payments and logistics.',
        process: 'Analysis → architecture → design → implementation → integrations.'
      }
    },
    copywriting: {
      name: 'Copywriting',
      short: 'Copy that speaks the client’s language and sells.',
      details: {
        what: 'Website content: headlines, offer structure, service pages and CTAs.',
        forWho: 'Any company that wants to sound clear and professional.',
        problem: 'The website exists, but the messaging does not persuade.',
        gives: 'A sharper message and higher conversion.',
        priceFactors: 'Page count, research, language and market specifics.',
        process: 'Brief → research → draft → revisions → final.'
      }
    },
    branding: {
      name: 'Branding',
      short: 'Logo, color and style — a consistent brand presence.',
      details: {
        what: 'Visual identity: logo, palette, typography and core style rules.',
        forWho: 'New companies and brands that need a stronger image.',
        problem: 'The company looks random and inconsistent.',
        gives: 'Recognition and a more professional perception.',
        priceFactors: 'Scope: logo only or a fuller brand system.',
        process: 'Moodboard → concepts → selection → refinement → delivery package.'
      }
    },
    uiux: {
      name: 'UI/UX design',
      short: 'Interface design that feels clean, premium and logical.',
      details: {
        what: 'Interface design for a website, product or admin panel.',
        forWho: 'Digital products, SaaS and internal business systems.',
        problem: 'Users get lost and do not complete the flow.',
        gives: 'Easier usability and stronger conversion.',
        priceFactors: 'Screen count, research depth and prototype complexity.',
        process: 'Flow → wireframes → UI → prototype → testing.'
      }
    },
    anim3d: {
      name: '3D animations',
      short: '3D effects and motion design that make the brand memorable.',
      details: {
        what: '3D objects, scroll animations and interactive scenes for the website.',
        forWho: 'Premium brands that want to stand out.',
        problem: 'The website looks like thousands of others.',
        gives: 'A stronger wow effect and better memorability.',
        priceFactors: 'Scene complexity, optimization and animation count.',
        process: 'Concept → scene → animation → optimization.'
      }
    },
    cro: {
      name: 'Conversion optimization',
      short: 'We turn visitors into qualified enquiries.',
      details: {
        what: 'Audit and improvement focused on enquiries: CTA, forms and page structure.',
        forWho: 'Companies with traffic but too few contacts.',
        problem: 'People visit the site and leave without reaching out.',
        gives: 'More enquiries without raising ad spend.',
        priceFactors: 'Site size, analytics depth and number of tests.',
        process: 'Audit → hypotheses → changes → measurement → iteration.'
      }
    },
    googleads: {
      short: 'Search campaigns built for enquiries, not vanity clicks.',
      details: {
        what: 'Google Search campaigns focused on calls, forms and bookings.',
        forWho: 'Local services, B2B companies and e-commerce.',
        problem: 'Clients search for the service but find competitors first.',
        gives: 'Traffic from people already looking for what you sell.',
        priceFactors: 'Budget, competition and campaign volume.',
        process: 'Analysis → campaign structure → launch → weekly optimization.'
      }
    },
    metaads: {
      short: 'Facebook and Instagram ads that build demand.',
      details: {
        what: 'Campaigns on Facebook and Instagram for reach, leads and remarketing.',
        forWho: 'Beauty, food, e-commerce and B2C service brands.',
        problem: 'The brand stays invisible where people spend their time.',
        gives: 'More awareness and a steady stream of enquiries.',
        priceFactors: 'Budget, creative production and audience setup.',
        process: 'Strategy → creatives → testing → scaling.'
      }
    },
    tiktokads: {
      short: 'Short-form video campaigns that win younger attention.',
      details: {
        what: 'Native-style video campaigns built for TikTok.',
        forWho: 'B2C brands, e-commerce, education and beauty.',
        problem: 'It is hard to reach younger audiences efficiently.',
        gives: 'Low-cost reach and a new acquisition channel.',
        priceFactors: 'Video production, budget and creative cadence.',
        process: 'Concepts → video → testing → optimization.'
      }
    },
    seo: {
      short: 'SEO that compounds free Google traffic month after month.',
      details: {
        what: 'Technical SEO, content work and link strategy that improve rankings.',
        forWho: 'Companies thinking in a longer horizon.',
        problem: 'The website does not appear in meaningful search results.',
        gives: 'Stable organic traffic without paying for every click.',
        priceFactors: 'Keyword competition, current site quality and publishing pace.',
        process: 'Audit → keyword plan → optimization → content → monitoring.'
      }
    },
    gbp: {
      name: 'Google Business Profile',
      short: 'A Google Maps presence that pulls in local clients.',
      details: {
        what: 'Optimization of the business profile: photos, reviews, descriptions and posts.',
        forWho: 'Any local business: clinics, salons, workshops and restaurants.',
        problem: 'Clients pick companies with a stronger profile and better reviews.',
        gives: 'More calls and visits from Google Maps.',
        priceFactors: 'Current profile quality, location count and review strategy.',
        process: 'Audit → optimization → review system → posts.'
      }
    },
    remarketing: {
      name: 'Remarketing',
      short: 'We go back to people who have already seen you.',
      details: {
        what: 'Campaigns for visitors who reached the site but did not convert.',
        forWho: 'Companies with traffic and a longer decision cycle.',
        problem: 'Most visitors leave without contact and disappear.',
        gives: 'A second and third touch at a fraction of acquisition cost.',
        priceFactors: 'Traffic volume, segment count and creative layer.',
        process: 'Pixels → segments → creatives → campaigns.'
      }
    },
    analytics: {
      name: 'Analytics',
      short: 'See where clients come from and what actually works.',
      details: {
        what: 'GA4, conversions, goals and reports — a clear picture of performance.',
        forWho: 'Companies investing in marketing and making data-driven decisions.',
        problem: 'The budget goes into ads, but it is unclear what is working.',
        gives: 'Clean decision data: what to scale and what to stop.',
        priceFactors: 'Source count, integrations and dashboard depth.',
        process: 'Audit → setup → goals → reporting.'
      }
    },
    funnels: {
      name: 'Sales funnels',
      short: 'From first touch to client — a designed conversion path.',
      details: {
        what: 'We design the full path: ad → page → contact → follow-up.',
        forWho: 'Companies that want a system, not isolated tactics.',
        problem: 'Each piece works separately and leads get lost between steps.',
        gives: 'A more predictable client acquisition process.',
        priceFactors: 'Number of stages, integrations and automation logic.',
        process: 'Funnel map → pages → automations → measurement.'
      }
    },
    aichatbot: {
      name: 'AI Chatbot',
      short: 'An assistant that answers clients 24/7.',
      details: {
        what: 'An AI chatbot on the site that answers questions, collects data and books contact.',
        forWho: 'Companies with a high volume of repetitive questions.',
        problem: 'Clients write after hours and get no reply.',
        gives: '24/7 handling and fewer missed enquiries.',
        priceFactors: 'Knowledge base, integrations and language count.',
        process: 'Knowledge base → setup → testing → launch.'
      }
    },
    aiauto: {
      name: 'Enquiry automation',
      short: 'Every enquiry lands exactly where it should — automatically.',
      details: {
        what: 'Form → CRM → alert → task. No manual copy-paste.',
        forWho: 'Companies receiving leads from multiple channels.',
        problem: 'Enquiries disappear across inboxes and messengers.',
        gives: 'Cleaner operations and faster response to every lead.',
        priceFactors: 'Number of channels and integrations.',
        process: 'Process map → integrations → testing → go-live.'
      }
    },
    aiqualify: {
      name: 'AI lead qualification',
      short: 'AI scores which enquiries matter most.',
      details: {
        what: 'Automatic lead scoring and tagging based on potential.',
        forWho: 'Companies with many enquiries and limited sales time.',
        problem: 'The team spends time on low-value contacts.',
        gives: 'A priority system that surfaces the best leads first.',
        priceFactors: 'Scoring criteria, data sources and CRM integration.',
        process: 'Criteria → scoring model → integration → calibration.'
      }
    },
    aifollowup: {
      name: 'AI follow-up',
      short: 'Automated reminders that help close sales.',
      details: {
        what: 'Message sequences for leads who stopped replying.',
        forWho: 'Services with a longer decision process.',
        problem: 'No response often ends the conversation too early.',
        gives: 'Recovered leads without manual chasing.',
        priceFactors: 'Scenario count and channel mix.',
        process: 'Scenarios → messaging → automation → measurement.'
      }
    },
    crmauto: {
      name: 'CRM automations',
      short: 'A CRM that updates itself: statuses, tasks and reminders.',
      details: {
        what: 'CRM setup and automation aligned with your real business process.',
        forWho: 'Sales teams and service companies.',
        problem: 'The CRM exists, but nobody keeps it updated.',
        gives: 'Fresh data without constant manual clicks.',
        priceFactors: 'CRM choice, process count and integrations.',
        process: 'Process → setup → automations → training.'
      }
    },
    aireports: {
      name: 'AI reports',
      short: 'Weekly summaries written by AI.',
      details: {
        what: 'Automatic reports for leads, campaigns and sales in plain language.',
        forWho: 'Business owners who do not want to live in dashboards.',
        problem: 'The data exists, but nobody reads it.',
        gives: 'One readable summary instead of five panels.',
        priceFactors: 'Data sources, reporting frequency and format.',
        process: 'Sources → template → automation → delivery.'
      }
    },
    apiint: {
      name: 'API integrations',
      short: 'We connect systems that do not naturally talk to each other.',
      details: {
        what: 'Connections between website, CRM, payments, stock and ERP.',
        forWho: 'Companies with multiple systems and manual data transfers.',
        problem: 'Manual data handling creates errors and wastes time.',
        gives: 'Systems that exchange data on their own.',
        priceFactors: 'System count, API docs quality and business logic.',
        process: 'Analysis → integration design → implementation → monitoring.'
      }
    },
    automsg: {
      name: 'Automated messages',
      short: 'SMS, email and WhatsApp sent at exactly the right moment.',
      details: {
        what: 'Confirmations, reminders and thank-you messages sent automatically.',
        forWho: 'Bookings, clinics, repeat services and e-commerce.',
        problem: 'Clients forget appointments and orders.',
        gives: 'Fewer no-shows and more repeat business.',
        priceFactors: 'Channel mix, scenario count and message volume.',
        process: 'Scenarios → copy → integration → launch.'
      }
    },
    leadforms: {
      name: 'Lead forms',
      short: 'Forms and quizzes that people actually want to complete.',
      details: {
        what: 'Interactive multi-step forms with conditional logic.',
        forWho: 'Any business collecting enquiries online.',
        problem: 'Long boring forms scare clients away.',
        gives: 'Higher completion rates and better lead data.',
        priceFactors: 'Number of steps, logic depth and integrations.',
        process: 'Questions → design → logic → integration.'
      }
    },
    calculators: {
      name: 'Quote calculators',
      short: 'The client estimates a price and leaves a contact.',
      details: {
        what: 'An interactive price calculator for services directly on the site.',
        forWho: 'Construction, renovations, cleaning, transport and manufacturing.',
        problem: '“How much does it cost?” is the main question with no quick answer.',
        gives: 'Higher engagement and warmer inbound leads.',
        priceFactors: 'Pricing logic complexity and design quality.',
        process: 'Pricing logic → UI → implementation → lead integration.'
      }
    },
    adminpanels: {
      name: 'Admin panels',
      short: 'A custom panel for running your company, data and content.',
      details: {
        what: 'A dedicated panel for leads, clients, content and reporting.',
        forWho: 'Companies whose process does not fit standard tools.',
        problem: 'Excel sheets and notes stop being enough.',
        gives: 'One place to control the business.',
        priceFactors: 'Module count, roles and integrations.',
        process: 'Processes → prototype → implementation → iteration.'
      }
    },
    booking: {
      name: 'Booking systems',
      short: 'Clients book online and the calendar takes care of itself.',
      details: {
        what: 'Online booking with confirmations and reminders.',
        forWho: 'Salons, clinics, tutoring, rentals and hourly services.',
        problem: 'Phone-based booking creates chaos and no-shows.',
        gives: 'Fewer calls and fewer empty calendar gaps.',
        priceFactors: 'Team/resource count, payments and integrations.',
        process: 'Setup → integration → automated messaging.'
      }
    },
    dashboards: {
      name: 'Dashboards',
      short: 'All core business numbers on one screen.',
      details: {
        what: 'A panel with key metrics: leads, sales, marketing and finance.',
        forWho: 'Owners and managers who want one clear picture.',
        problem: 'Data is scattered across five different systems.',
        gives: 'Decisions based on numbers, not intuition.',
        priceFactors: 'Number of sources and refresh frequency.',
        process: 'Metrics → sources → dashboard → automation.'
      }
    },
    emailint: {
      name: 'Email integrations',
      short: 'Emails that send themselves at the right moment.',
      details: {
        what: 'Automated emails: welcome flows, offers, confirmations and newsletters.',
        forWho: 'Companies building relationships with their client base.',
        problem: 'The contact list exists, but it is not working for the business.',
        gives: 'Regular communication without manual sending.',
        priceFactors: 'Scenario count, templates and segmentation.',
        process: 'Strategy → templates → automations → launch.'
      }
    },
    messengers: {
      name: 'Telegram / WhatsApp integrations',
      short: 'Enquiries and alerts delivered straight into the messenger.',
      details: {
        what: 'Leads, alerts and reports sent to Telegram or WhatsApp.',
        forWho: 'Teams that live in messengers rather than email.',
        problem: 'A lead arrives by email and gets noticed hours later.',
        gives: 'Responses in minutes, not hours.',
        priceFactors: 'Number of channels and scenario count.',
        process: 'Channels → bots → integration → testing.'
      }
    },
    customtools: {
      name: 'Custom business tools',
      short: 'Tools shaped around your process, not someone else’s.',
      details: {
        what: 'Dedicated applications and internal tools — from quote generators to custom systems.',
        forWho: 'Companies with a unique workflow that off-the-shelf software cannot handle.',
        problem: 'Generic tools force the wrong process.',
        gives: 'A tool built around the business 100%.',
        priceFactors: 'Scope, integrations and maintenance model.',
        process: 'Analysis → prototype → implementation → growth.'
      }
    }
  },
  ru: {
    websites: {
      name: 'Сайты',
      short: 'Современные сайты, которые вызывают доверие и ведут клиента к контакту.',
      details: {
        what: 'Полноценный сайт компании: услуги, кейсы, отзывы и контактные сценарии.',
        forWho: 'Сервисный бизнес, клиники, мастерские, офисы и локальные компании.',
        problem: 'Сайта нет, или он устарел и не приносит заявок.',
        gives: 'Профессиональный образ и реальные входящие заявки.',
        priceFactors: 'Количество страниц, уровень дизайна, анимации и интеграции.',
        process: 'Разбор → концепт → дизайн → разработка → тесты → запуск.'
      }
    },
    landing: {
      name: 'Лендинги',
      short: 'Одна страница, одна цель: заявка, бронь или продажа.',
      details: {
        what: 'Фокусная страница под конкретную услугу, кампанию или оффер.',
        forWho: 'Google Ads / Meta Ads, акции и отдельные продуктовые направления.',
        problem: 'Реклама ведёт на страницу, которая не конвертирует.',
        gives: 'Более высокий процент заявок с того же трафика.',
        priceFactors: 'Длина страницы, анимации, копирайтинг и A/B-тесты.',
        process: 'Цель → структура → тексты → дизайн → запуск.'
      }
    },
    ecommerce: {
      name: 'Интернет-магазины',
      short: 'Магазин, который выглядит premium и ведёт к покупке.',
      details: {
        what: 'Онлайн-магазин с оплатой, доставкой и админ-панелью.',
        forWho: 'Товарные бренды, локальные магазины и B2B e-commerce.',
        problem: 'Продажи идут только офлайн или через маркетплейсы с комиссиями.',
        gives: 'Собственный канал продаж и собственную базу клиентов.',
        priceFactors: 'Количество товаров, интеграции, оплаты и логистика.',
        process: 'Разбор → архитектура → дизайн → разработка → интеграции.'
      }
    },
    copywriting: {
      name: 'Копирайтинг',
      short: 'Тексты, которые говорят на языке клиента и продают.',
      details: {
        what: 'Контент для сайта: заголовки, оффер, страницы услуг и CTA.',
        forWho: 'Любая компания, которая хочет звучать ясно и уверенно.',
        problem: 'Сайт есть, но тексты не убеждают.',
        gives: 'Понятную подачу и более высокую конверсию.',
        priceFactors: 'Количество страниц, research, язык и специфика ниши.',
        process: 'Бриф → исследование → драфт → правки → финал.'
      }
    },
    branding: {
      name: 'Брендинг',
      short: 'Лого, цвет и стиль — цельный образ бренда.',
      details: {
        what: 'Визуальная идентика: логотип, палитра, типографика и правила стиля.',
        forWho: 'Новые компании и бренды, которым нужен более сильный образ.',
        problem: 'Компания выглядит случайно и несобранно.',
        gives: 'Узнаваемость и более профессиональное восприятие.',
        priceFactors: 'Объём работы: только логотип или полноценная бренд-система.',
        process: 'Moodboard → концепты → выбор → доработка → пакет файлов.'
      }
    },
    uiux: {
      name: 'UI/UX design',
      short: 'Интерфейсы, которые выглядят дорого и работают логично.',
      details: {
        what: 'Дизайн интерфейса для сайта, продукта или админ-панели.',
        forWho: 'Цифровые продукты, SaaS и внутренние бизнес-системы.',
        problem: 'Пользователь теряется и не проходит сценарий до конца.',
        gives: 'Более понятный UX и более сильную конверсию.',
        priceFactors: 'Количество экранов, глубина исследований и сложность прототипа.',
        process: 'Flow → wireframes → UI → прототип → тестирование.'
      }
    },
    anim3d: {
      name: '3D-анимации',
      short: '3D-эффекты и motion-дизайн, которые делают бренд запоминаемым.',
      details: {
        what: '3D-объекты, scroll-анимации и интерактивные сцены на сайте.',
        forWho: 'Premium-бренды, которым важно выделяться.',
        problem: 'Сайт выглядит как тысячи других.',
        gives: 'Сильный wow-эффект и лучшую запоминаемость.',
        priceFactors: 'Сложность сцены, оптимизация и число анимаций.',
        process: 'Концепт → сцена → анимация → оптимизация.'
      }
    },
    cro: {
      name: 'Оптимизация конверсии',
      short: 'Превращаем посетителей сайта в квалифицированные заявки.',
      details: {
        what: 'Аудит и улучшение сайта под заявки: CTA, формы и структура страницы.',
        forWho: 'Компании, у которых есть трафик, но мало обращений.',
        problem: 'Люди заходят на сайт и уходят без контакта.',
        gives: 'Больше заявок без роста рекламного бюджета.',
        priceFactors: 'Размер сайта, аналитика и число тестов.',
        process: 'Аудит → гипотезы → изменения → замер → итерации.'
      }
    },
    googleads: {
      short: 'Поисковые кампании, настроенные под заявки, а не vanity-clicks.',
      details: {
        what: 'Поисковые кампании Google, заточенные под звонки, формы и бронирования.',
        forWho: 'Локальные услуги, B2B и e-commerce.',
        problem: 'Клиент ищет услугу, но сначала находит конкурентов.',
        gives: 'Трафик от людей, которые уже ищут ваш продукт.',
        priceFactors: 'Бюджет, конкуренция и количество кампаний.',
        process: 'Разбор → структура кампаний → запуск → недельная оптимизация.'
      }
    },
    metaads: {
      short: 'Facebook и Instagram-реклама, которая создаёт спрос.',
      details: {
        what: 'Кампании в Facebook и Instagram на охват, лиды и remarketing.',
        forWho: 'Beauty, horeca, e-commerce и B2C-сервисы.',
        problem: 'Бренд не виден там, где люди проводят время.',
        gives: 'Больше узнаваемости и стабильный поток заявок.',
        priceFactors: 'Бюджет, продакшн креативов и настройка аудиторий.',
        process: 'Стратегия → креативы → тесты → масштабирование.'
      }
    },
    tiktokads: {
      name: 'TikTok Ads',
      short: 'Короткие видео-кампании, которые забирают внимание молодой аудитории.',
      details: {
        what: 'Нативные видеокампании, построенные под формат TikTok.',
        forWho: 'B2C-бренды, e-commerce, образование и beauty.',
        problem: 'Сложно эффективно достучаться до молодой аудитории.',
        gives: 'Недорогой охват и новый канал привлечения.',
        priceFactors: 'Продакшн видео, бюджет и темп обновления креативов.',
        process: 'Идеи → видео → тесты → оптимизация.'
      }
    },
    seo: {
      name: 'SEO',
      short: 'SEO, которое накапливает бесплатный трафик из Google месяц за месяцем.',
      details: {
        what: 'Техническая оптимизация, контент и ссылочная стратегия для роста позиций.',
        forWho: 'Компании, которые думают вдолгую.',
        problem: 'Сайт не появляется в значимых поисковых результатах.',
        gives: 'Стабильный органический трафик без оплаты за каждый клик.',
        priceFactors: 'Конкуренция по запросам, текущее состояние сайта и темп контента.',
        process: 'Аудит → план запросов → оптимизация → контент → мониторинг.'
      }
    },
    gbp: {
      name: 'Google Business Profile',
      short: 'Профиль в Google Maps, который приводит локальных клиентов.',
      details: {
        what: 'Оптимизация профиля компании: фото, отзывы, описания и посты.',
        forWho: 'Любой локальный бизнес: клиники, салоны, сервисы и рестораны.',
        problem: 'Клиенты выбирают компании с более сильным профилем и отзывами.',
        gives: 'Больше звонков и визитов из Google Maps.',
        priceFactors: 'Состояние профиля, число точек и стратегия отзывов.',
        process: 'Аудит → оптимизация → система отзывов → посты.'
      }
    },
    remarketing: {
      name: 'Ремаркетинг',
      short: 'Возвращаем тех, кто уже видел ваш бренд.',
      details: {
        what: 'Кампании для посетителей сайта, которые не оставили заявку.',
        forWho: 'Компании с трафиком и более длинным циклом принятия решения.',
        problem: 'Большинство посетителей уходит без контакта и исчезает.',
        gives: 'Второе и третье касание за долю стоимости привлечения.',
        priceFactors: 'Объём трафика, количество сегментов и креативный слой.',
        process: 'Пиксели → сегменты → креативы → кампании.'
      }
    },
    analytics: {
      name: 'Аналитика',
      short: 'Показывает, откуда приходят клиенты и что реально работает.',
      details: {
        what: 'GA4, конверсии, цели и отчёты — ясная картина эффективности.',
        forWho: 'Компании, которые инвестируют в маркетинг и хотят принимать решения по данным.',
        problem: 'Бюджет уходит в рекламу, но непонятно, что работает.',
        gives: 'Чистые данные для решений: что масштабировать, а что выключать.',
        priceFactors: 'Количество источников, интеграции и глубина дашбордов.',
        process: 'Аудит → настройка → цели → отчётность.'
      }
    },
    funnels: {
      name: 'Воронки продаж',
      short: 'От первого касания до клиента — спроектированный путь.',
      details: {
        what: 'Проектируем весь путь клиента: реклама → страница → контакт → follow-up.',
        forWho: 'Компании, которым нужна система, а не разрозненные действия.',
        problem: 'Каждый элемент работает отдельно, и лиды теряются между шагами.',
        gives: 'Более предсказуемый процесс привлечения клиентов.',
        priceFactors: 'Количество этапов, интеграции и логика автоматизаций.',
        process: 'Карта воронки → страницы → автоматизации → замеры.'
      }
    },
    aichatbot: {
      name: 'AI Chatbot',
      short: 'Ассистент, который отвечает клиентам 24/7.',
      details: {
        what: 'AI-чатбот на сайте, который отвечает на вопросы, собирает данные и бронирует контакт.',
        forWho: 'Компании с большим количеством повторяющихся вопросов.',
        problem: 'Клиенты пишут после рабочего времени и не получают ответа.',
        gives: 'Обработку 24/7 и меньше потерянных заявок.',
        priceFactors: 'База знаний, интеграции и количество языков.',
        process: 'База знаний → настройка → тесты → запуск.'
      }
    },
    aiauto: {
      name: 'Автоматизация заявок',
      short: 'Каждая заявка попадает туда, куда должна — автоматически.',
      details: {
        what: 'Форма → CRM → уведомление → задача. Без ручного копирования.',
        forWho: 'Компании, которые получают лиды из нескольких каналов.',
        problem: 'Заявки теряются между почтой и мессенджерами.',
        gives: 'Больше порядка и более быструю реакцию на каждый лид.',
        priceFactors: 'Количество каналов и интеграций.',
        process: 'Карта процесса → интеграции → тесты → запуск.'
      }
    },
    aiqualify: {
      name: 'AI lead qualification',
      short: 'AI оценивает, какие заявки действительно важны.',
      details: {
        what: 'Автоматический скоринг и тегирование лидов по потенциалу.',
        forWho: 'Компании с большим входящим потоком и ограниченным временем команды.',
        problem: 'Отдел продаж тратит время на слабые контакты.',
        gives: 'Систему приоритетов, где лучшие лиды идут первыми.',
        priceFactors: 'Критерии оценки, источники данных и интеграция с CRM.',
        process: 'Критерии → модель скоринга → интеграция → калибровка.'
      }
    },
    aifollowup: {
      name: 'AI follow-up',
      short: 'Автоматические напоминания, которые помогают закрывать сделки.',
      details: {
        what: 'Цепочки сообщений для лидов, которые перестали отвечать.',
        forWho: 'Услуги с более длинным циклом принятия решения.',
        problem: 'Отсутствие ответа слишком рано обрывает диалог.',
        gives: 'Возвращённые лиды без ручного догрева.',
        priceFactors: 'Количество сценариев и mix каналов.',
        process: 'Сценарии → тексты → автоматизация → измерение.'
      }
    },
    crmauto: {
      name: 'CRM automations',
      short: 'CRM, который сам обновляет статусы, задачи и напоминания.',
      details: {
        what: 'Настройка CRM и автоматизаций под реальный процесс компании.',
        forWho: 'Отделы продаж и сервисные компании.',
        problem: 'CRM есть, но никто не поддерживает его актуальность.',
        gives: 'Актуальные данные без постоянных ручных действий.',
        priceFactors: 'Выбор CRM, количество процессов и интеграции.',
        process: 'Процесс → настройка → автоматизации → обучение.'
      }
    },
    aireports: {
      name: 'AI-отчёты',
      short: 'Еженедельные сводки, которые AI пишет сам.',
      details: {
        what: 'Автоматические отчёты по лидам, кампаниям и продажам простым языком.',
        forWho: 'Собственники бизнеса, которые не хотят жить в дашбордах.',
        problem: 'Данные есть, но их никто не читает.',
        gives: 'Один понятный summary вместо пяти панелей.',
        priceFactors: 'Источники данных, частота отчётности и формат.',
        process: 'Источники → шаблон → автоматизация → доставка.'
      }
    },
    apiint: {
      name: 'API-интеграции',
      short: 'Соединяем системы, которые сами между собой не общаются.',
      details: {
        what: 'Связки между сайтом, CRM, оплатами, складом и ERP.',
        forWho: 'Компании с несколькими системами и ручной передачей данных.',
        problem: 'Ручная работа с данными создаёт ошибки и тратит время.',
        gives: 'Системы, которые обмениваются данными сами.',
        priceFactors: 'Количество систем, качество API-документации и бизнес-логика.',
        process: 'Разбор → проект интеграции → реализация → мониторинг.'
      }
    },
    automsg: {
      name: 'Автоматические сообщения',
      short: 'SMS, email и WhatsApp, которые уходят в нужный момент.',
      details: {
        what: 'Подтверждения, напоминания и thank-you сообщения отправляются автоматически.',
        forWho: 'Бронирования, клиники, повторяющиеся услуги и e-commerce.',
        problem: 'Клиенты забывают о визитах и заказах.',
        gives: 'Меньше no-show и больше повторных обращений.',
        priceFactors: 'Каналы, количество сценариев и объём сообщений.',
        process: 'Сценарии → тексты → интеграция → запуск.'
      }
    },
    leadforms: {
      name: 'Лид-формы',
      short: 'Формы и квизы, которые люди реально хотят заполнять.',
      details: {
        what: 'Интерактивные многошаговые формы с условной логикой.',
        forWho: 'Любой бизнес, который собирает заявки онлайн.',
        problem: 'Длинные скучные формы отталкивают клиента.',
        gives: 'Более высокий completion rate и более качественные данные по лиду.',
        priceFactors: 'Количество шагов, глубина логики и интеграции.',
        process: 'Вопросы → дизайн → логика → интеграция.'
      }
    },
    calculators: {
      name: 'Калькуляторы стоимости',
      short: 'Клиент сам прикидывает цену и оставляет контакт.',
      details: {
        what: 'Интерактивный калькулятор стоимости услуг прямо на сайте.',
        forWho: 'Стройка, ремонты, клининг, транспорт и производство.',
        problem: '“Сколько это стоит?” — главный вопрос без быстрого ответа.',
        gives: 'Более сильное вовлечение и более тёплые входящие лиды.',
        priceFactors: 'Сложность логики ценообразования и качество UI.',
        process: 'Логика цены → UI → разработка → интеграция с лидами.'
      }
    },
    adminpanels: {
      name: 'Админ-панели',
      short: 'Кастомная панель для управления компанией, данными и контентом.',
      details: {
        what: 'Отдельная панель для лидов, клиентов, контента и отчётности.',
        forWho: 'Компании, чей процесс не помещается в стандартные решения.',
        problem: 'Excel и заметки уже перестают работать.',
        gives: 'Одно место управления бизнесом.',
        priceFactors: 'Количество модулей, роли и интеграции.',
        process: 'Процессы → прототип → разработка → итерации.'
      }
    },
    booking: {
      name: 'Системы бронирования',
      short: 'Клиенты бронируют онлайн, а календарь держится в порядке сам.',
      details: {
        what: 'Онлайн-бронирование с подтверждениями и напоминаниями.',
        forWho: 'Салоны, клиники, обучение, аренда и почасовые услуги.',
        problem: 'Запись по телефону создаёт хаос и неявки.',
        gives: 'Меньше звонков и меньше пустых слотов в календаре.',
        priceFactors: 'Количество сотрудников / ресурсов, оплаты и интеграции.',
        process: 'Настройка → интеграция → автоматические сообщения.'
      }
    },
    dashboards: {
      name: 'Дашборды',
      short: 'Все ключевые цифры бизнеса на одном экране.',
      details: {
        what: 'Панель с основными метриками: лиды, продажи, маркетинг и финансы.',
        forWho: 'Собственники и менеджеры, которым нужен один понятный обзор.',
        problem: 'Данные раскиданы по пяти разным системам.',
        gives: 'Решения на цифрах, а не на интуиции.',
        priceFactors: 'Количество источников и частота обновления.',
        process: 'Метрики → источники → дашборд → автоматизация.'
      }
    },
    emailint: {
      name: 'Email-интеграции',
      short: 'Письма, которые отправляются сами в правильный момент.',
      details: {
        what: 'Автоматические письма: welcome flows, предложения, подтверждения и рассылки.',
        forWho: 'Компании, которые строят отношения со своей базой клиентов.',
        problem: 'База контактов есть, но она не работает на бизнес.',
        gives: 'Регулярную коммуникацию без ручной отправки.',
        priceFactors: 'Количество сценариев, шаблоны и сегментация.',
        process: 'Стратегия → шаблоны → автоматизации → запуск.'
      }
    },
    messengers: {
      name: 'Интеграции Telegram / WhatsApp',
      short: 'Заявки и алерты приходят прямо в мессенджер.',
      details: {
        what: 'Лиды, уведомления и отчёты отправляются в Telegram или WhatsApp.',
        forWho: 'Команды, которые живут в мессенджерах, а не в почте.',
        problem: 'Лид пришёл на email и был замечен только через несколько часов.',
        gives: 'Реакцию за минуты, а не за часы.',
        priceFactors: 'Количество каналов и сценариев.',
        process: 'Каналы → боты → интеграция → тестирование.'
      }
    },
    customtools: {
      name: 'Custom business tools',
      short: 'Инструменты, собранные под ваш процесс, а не под чужой.',
      details: {
        what: 'Кастомные приложения и внутренние инструменты — от генераторов КП до рабочих систем.',
        forWho: 'Компании с уникальным процессом, который не покрывает готовый софт.',
        problem: 'Типовые инструменты заставляют жить по чужому сценарию.',
        gives: 'Инструмент, который на 100% совпадает с вашим бизнесом.',
        priceFactors: 'Объём, интеграции и модель поддержки.',
        process: 'Разбор → прототип → реализация → развитие.'
      }
    }
  }
};

function translatePrice(price, language) {
  if (language === 'pl') return price;
  if (language === 'en') {
    return String(price)
      .replace(/^od /i, 'from ')
      .replace(/indywidualnie/i, 'custom quote')
      .replace(/ \/ mies\./gi, ' / mo.');
  }
  return String(price)
    .replace(/^od /i, 'от ')
    .replace(/indywidualnie/i, 'индивидуально')
    .replace(/ \/ mies\./gi, ' / мес.');
}

export function getServiceCategories(language = FALLBACK_LANGUAGE) {
  const activeLanguage = ['pl', 'en', 'ru'].includes(language) ? language : FALLBACK_LANGUAGE;
  if (activeLanguage === 'pl') return baseServiceCategories;

  return baseServiceCategories.map((category) => ({
    ...category,
    label: categoryTranslations[activeLanguage]?.[category.id] || category.label,
    services: category.services.map((service) => {
      const translated = serviceTranslations[activeLanguage]?.[service.id] || {};
      return {
        ...service,
        ...translated,
        price: translated.price || translatePrice(service.price, activeLanguage),
        details: {
          ...service.details,
          ...(translated.details || {})
        }
      };
    })
  }));
}

export const serviceCategories = getServiceCategories(FALLBACK_LANGUAGE);
