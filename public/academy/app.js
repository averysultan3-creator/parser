const WORKER_ID_STORAGE_KEY = 'auraWorkerId';
const ACADEMY_PROGRESS_KEY = 'auraAcademyProgress';

const modules = [
  { id: 'start', title: 'Start', type: 'start' },
  { id: 'services', title: 'Services Academy', type: 'services' },
  { id: 'call-logic', title: 'Logika rozmowy', type: 'article' },
  { id: 'scripts', title: 'Script Trainer', type: 'scenario', scenarioSet: 'scripts' },
  { id: 'objections', title: 'Obiekcje', type: 'scenario', scenarioSet: 'objections' },
  { id: 'qualification', title: 'Kwalifikacja leadów', type: 'qualification' },
  { id: 'numbers', title: 'Efekt dużych liczb', type: 'calculator' },
  { id: 'workday', title: 'Dzień pracy', type: 'workday' },
  { id: 'statuses', title: 'Statusy', type: 'scenario', scenarioSet: 'statuses' },
  { id: 'final', title: 'Final Test', type: 'final' }
];

const serviceLessons = {
  websites: {
    title: 'Strony internetowe',
    badge: 'Najczęstsza potrzeba',
    steps: [
      {
        title: 'Co to jest',
        body: 'Strona internetowa to nie wizytówka. To miejsce, które ma przejąć część pracy sprzedawcy: wyjaśnić ofertę, zbudować zaufanie, pokazać realizacje i ułatwić kontakt.',
        bullets: ['Klient widzi dowody jakości przed rozmową.', 'Firma wygląda stabilniej niż konkurencja bez strony.', 'Reklamy Google i Meta mają gdzie kierować ruch.']
      },
      {
        title: 'Kto tego potrzebuje',
        body: 'Najlepszy lead to firma usługowa, która ma telefon, działa lokalnie, ma aktywność w Google lub social media, ale nie ma własnej strony albo ma stronę starą, wolną i nieczytelną.',
        bullets: ['Klimatyzacja, remonty, stomatologia, beauty, auto detailing.', 'Firmy z opiniami, ale bez mocnego miejsca do sprzedaży.', 'Firmy, które już płacą za ruch, ale tracą zapytania.']
      },
      {
        title: 'Jaki problem rozwiązuje',
        body: 'Problemem nie jest brak strony sam w sobie. Problemem jest brak zaufania i brak jasnej ścieżki kontaktu. Dobra strona skraca drogę od zainteresowania do telefonu.',
        bullets: ['Mniej pytań podstawowych w rozmowie.', 'Więcej zapytań z Google.', 'Lepszy efekt z reklam.']
      },
      {
        title: 'Jak rozpoznać potrzebę',
        body: 'Patrzysz na Google Business, profil Facebook/Instagram, opinie, zdjęcia i stronę. Jeśli firma wygląda realnie, ale klient nie ma gdzie spokojnie zobaczyć oferty, to jest dobry sygnał.',
        bullets: ['Brak domeny albo tylko Facebook.', 'Strona bez realizacji i formularza.', 'Nieaktualne informacje, brak mobile, wolne ładowanie.']
      },
      {
        title: 'Jak powiedzieć przez telefon',
        body: 'Nie sprzedajesz strony. Umawiasz krótką rozmowę o tym, czy firma traci klientów przez słabą prezentację online.',
        bullets: ['“Widzę, że macie dobre opinie, ale klienci przed kontaktem nie widzą pełnej oferty.”', '“Możemy pokazać, jak strona może zbierać zapytania bez dokładania pracy.”', 'Celem jest spotkanie, nie wycena w pierwszej minucie.']
      },
      {
        title: 'Kiedy nie oferować',
        body: 'Nie ciśnij, jeśli firma ma nowoczesną stronę, jasną ofertę, szybki kontakt, aktualne realizacje i dobrą widoczność. Wtedy lepszym tematem może być SEO, reklama albo automatyzacja.',
        bullets: ['Nie obiecuj efektów bez audytu.', 'Nie krytykuj agresywnie obecnej strony.', 'Nie mów, że “wszystko jest źle”.']
      }
    ],
    quiz: {
      question: 'Jaki jest najlepszy pierwszy cel rozmowy o stronie?',
      answers: ['Od razu sprzedać pakiet strony', 'Umówić krótkie spotkanie/audyt sytuacji online', 'Wysłać cennik bez rozmowy'],
      correct: 1
    }
  },
  seo: {
    title: 'SEO',
    badge: 'Widoczność organiczna',
    steps: [
      {
        title: 'Co to jest',
        body: 'SEO to proces poprawy widoczności firmy w wynikach Google. Nie jest jednorazową sztuczką, tylko stałym wzmacnianiem strony, treści, techniki i lokalnych sygnałów.',
        bullets: ['Działa wolniej niż reklama, ale buduje długoterminowy kanał.', 'Najlepiej działa z dobrą stroną.', 'W usługach lokalnych łączy się z Google Business Profile.']
      },
      {
        title: 'Kto tego potrzebuje',
        body: 'Firmy, które mają usługę wyszukiwaną w Google i chcą regularnych zapytań bez płacenia za każde kliknięcie.',
        bullets: ['Branże lokalne z wysoką wartością klienta.', 'Firmy z dobrą ofertą, ale słabą pozycją w Google.', 'Firmy z konkurencją, która mocno działa online.']
      },
      {
        title: 'Jak rozpoznać potrzebę',
        body: 'Sprawdź, czy firma pojawia się na ważne frazy w mieście. Jeśli ma stronę, ale nie ma treści usługowych i lokalnych podstron, to SEO może być dobrym tematem.',
        bullets: ['Brak podstron usług.', 'Tytuły typu “Home”.', 'Mało treści, brak FAQ, brak realizacji.']
      },
      {
        title: 'Jak wyjaśnić przez telefon',
        body: 'Mów językiem klienta: “chodzi o to, żeby osoby szukające usługi w mieście częściej trafiały do was, a nie tylko do konkurencji”.',
        bullets: ['Nie obiecuj pierwszego miejsca.', 'Mów o audycie i planie.', 'Podkreśl, że SEO wymaga czasu.']
      }
    ],
    quiz: {
      question: 'Czego nie wolno obiecywać w rozmowie o SEO?',
      answers: ['Analizy widoczności', 'Planu działań', 'Gwarantowanego pierwszego miejsca w Google'],
      correct: 2
    }
  },
  gbp: {
    title: 'Google Business Profile',
    badge: 'Lokalne zaufanie',
    steps: [
      {
        title: 'Co to jest',
        body: 'Google Business Profile to wizytówka firmy w Mapach Google: opinie, telefon, godziny, zdjęcia, trasa, usługi i posty. Dla firm lokalnych bywa ważniejsza niż sama strona.',
        bullets: ['Klient często dzwoni bez wejścia na stronę.', 'Opinie mocno wpływają na decyzję.', 'Aktualność profilu zwiększa zaufanie.']
      },
      {
        title: 'Kto tego potrzebuje',
        body: 'Każda firma lokalna, która obsługuje klientów w mieście albo ma punkt stacjonarny.',
        bullets: ['Stomatologia, beauty, warsztaty, remonty, HVAC.', 'Firmy z małą liczbą opinii.', 'Firmy z niepełną wizytówką.']
      },
      {
        title: 'Jak rozpoznać potrzebę',
        body: 'Słaby profil ma mało zdjęć, brak usług, brak postów, stare godziny lub niską liczbę opinii w porównaniu do konkurencji.',
        bullets: ['Brak kategorii pomocniczych.', 'Opinie bez odpowiedzi.', 'Nieaktualne zdjęcia lub brak realizacji.']
      },
      {
        title: 'Jak powiedzieć przez telefon',
        body: '“Zauważyłem, że w Google macie potencjał, ale profil nie pokazuje pełnej oferty. Część klientów może wybierać konkurencję, bo widzi więcej dowodów i opinii.”',
        bullets: ['Nie strasz blokadą konta.', 'Nie udawaj przedstawiciela Google.', 'Proponuj krótką analizę profilu.']
      }
    ],
    quiz: {
      question: 'Co jest najmocniejszym sygnałem potrzeby GBP?',
      answers: ['Firma lokalna ma mało opinii i niepełny profil', 'Firma ma ładne logo', 'Firma ma długi opis na Facebooku'],
      correct: 0
    }
  },
  googleAds: {
    title: 'Google Ads',
    badge: 'Szybki ruch',
    steps: [
      {
        title: 'Co to jest',
        body: 'Google Ads to płatne kampanie dla osób, które już szukają usługi. Najlepiej działa, gdy firma ma stronę lub landing, który szybko zamienia kliknięcie w telefon.',
        bullets: ['Szybki start ruchu.', 'Płatność za kliknięcia.', 'Wymaga mierzenia zapytań.']
      },
      {
        title: 'Kto tego potrzebuje',
        body: 'Firmy z usługą o wysokiej wartości, które mogą obsłużyć więcej zapytań i mają jasną ofertę.',
        bullets: ['Klimatyzacja, fotowoltaika, stomatologia, remonty.', 'Firmy sezonowe.', 'Firmy, które chcą szybko testować rynek.']
      },
      {
        title: 'Jak rozpoznać potrzebę',
        body: 'Jeśli firma nie jest wysoko organicznie, a usługa jest często wyszukiwana, Google Ads może szybko dostarczyć rozmowy.',
        bullets: ['Brak widoczności na frazy zakupowe.', 'Konkurencja reklamuje się w Google.', 'Firma ma wolne terminy lub chce rosnąć.']
      },
      {
        title: 'Jak wyjaśnić',
        body: '“Można sprawdzić, ile zapytań da się pozyskać z osób, które już wpisują konkretną usługę w Google. Najpierw warto zobaczyć, czy strona jest gotowa na taki ruch.”',
        bullets: ['Nie obiecuj tanich kliknięć.', 'Nie sprzedawaj budżetu bez strategii.', 'Pytaj, czy firma ma moce przerobowe.']
      }
    ],
    quiz: {
      question: 'Kiedy Google Ads ma największy sens?',
      answers: ['Gdy firma ma usługę aktywnie wyszukiwaną i może obsłużyć leady', 'Gdy firma nie odbiera telefonów', 'Gdy nie ma żadnej oferty'],
      correct: 0
    }
  },
  metaAds: {
    title: 'Meta Ads',
    badge: 'Popyt i remarketing',
    steps: [
      {
        title: 'Co to jest',
        body: 'Meta Ads to reklamy na Facebooku i Instagramie. Dobre do budowania popytu, remarketingu, promocji realizacji i ofert wizualnych.',
        bullets: ['Działa świetnie z branżami wizualnymi.', 'Może zbierać formularze.', 'Wymaga dobrego zdjęcia, wideo lub oferty.']
      },
      {
        title: 'Kto tego potrzebuje',
        body: 'Firmy, których oferta dobrze wygląda na zdjęciach albo wymaga pokazania efektu przed/po.',
        bullets: ['Beauty, detailing, remonty, ogrody, eventy.', 'Firmy z aktywnym Instagramem.', 'Firmy z promocjami sezonowymi.']
      },
      {
        title: 'Jak rozpoznać potrzebę',
        body: 'Jeśli firma ma dobre realizacje, ale mało zapytań z social mediów, można zaproponować kampanię albo remarketing.',
        bullets: ['Dużo zdjęć, mało komentarzy i leadów.', 'Brak formularza kontaktowego.', 'Brak kampanii na odbiorców lokalnych.']
      },
      {
        title: 'Jak powiedzieć',
        body: '“Macie materiał, który można pokazać osobom z okolicy. Warto sprawdzić, czy z tych realizacji da się zrobić stały dopływ zapytań.”',
        bullets: ['Nie mów, że Meta zastępuje Google.', 'Nie obiecuj wirali.', 'Mów o testach i mierzeniu.']
      }
    ],
    quiz: {
      question: 'Dla jakiej firmy Meta Ads jest szczególnie mocne?',
      answers: ['Firma z wizualnymi realizacjami', 'Firma bez zdjęć i bez oferty', 'Firma, która nie chce odbierać leadów'],
      correct: 0
    }
  },
  chatbot: {
    title: 'Chatbot AI',
    badge: 'Obsługa zapytań',
    steps: [
      {
        title: 'Co to jest',
        body: 'Chatbot AI pomaga odpowiadać na powtarzalne pytania, kwalifikować klienta i przekazywać gotowe zgłoszenia do właściciela lub zespołu.',
        bullets: ['Działa na stronie lub w komunikatorze.', 'Może zbierać dane klienta.', 'Nie zastępuje całej sprzedaży, ale skraca obsługę.']
      },
      {
        title: 'Kto tego potrzebuje',
        body: 'Firmy, które dostają podobne pytania: cena, termin, lokalizacja, zakres usługi, dostępność.',
        bullets: ['Dużo zapytań poza godzinami pracy.', 'Powtarzalne kwalifikowanie klientów.', 'Właściciel nie ma czasu odpowiadać wszystkim.']
      },
      {
        title: 'Jak rozpoznać potrzebę',
        body: 'Jeśli oferta wymaga kilku pytań zanim klient dostanie odpowiedź, chatbot może zebrać dane i przygotować rozmowę.',
        bullets: ['Brak formularza lub zbyt prosty formularz.', 'Długie odpowiedzi w Messengerze.', 'Dużo pytań o wycenę.']
      },
      {
        title: 'Jak powiedzieć',
        body: '“Możemy zrobić tak, żeby część pytań klienta była obsługiwana automatycznie, a do was trafiały już uporządkowane zgłoszenia.”',
        bullets: ['Nie obiecuj, że AI zawsze odpowie idealnie.', 'Mów o kontroli i scenariuszach.', 'Podkreśl oszczędność czasu.']
      }
    ],
    quiz: {
      question: 'Najlepszy argument za chatbotem AI to:',
      answers: ['Mniej chaosu i lepiej przygotowane zgłoszenia', 'Zastąpi wszystkich ludzi', 'Nie trzeba już mieć oferty'],
      correct: 0
    }
  },
  automation: {
    title: 'Automatyzacje AI',
    badge: 'Procesy w tle',
    steps: [
      {
        title: 'Co to jest',
        body: 'Automatyzacje AI łączą formularze, CRM, powiadomienia, podsumowania rozmów, wiadomości follow-up i raporty. Celem jest mniej ręcznej pracy i mniej zgubionych leadów.',
        bullets: ['Automatyczny follow-up.', 'Porządkowanie leadów.', 'Raporty i przypomnienia.']
      },
      {
        title: 'Kto tego potrzebuje',
        body: 'Firmy, które mają już zapytania, ale tracą kontrolę: ktoś nie oddzwonił, nie wpisał notatki, nie wysłał oferty albo zapomniał o terminie.',
        bullets: ['Kilka osób obsługuje klientów.', 'Dużo kanałów kontaktu.', 'Brak jednej listy leadów.']
      },
      {
        title: 'Jak rozpoznać potrzebę',
        body: 'Pytaj o proces: co dzieje się po zapytaniu? Kto oddzwania? Gdzie trafia notatka? Kiedy wysyłają follow-up?',
        bullets: ['Brak CRM.', 'Lead trafia tylko na maila.', 'Brak statusów i przypomnień.']
      },
      {
        title: 'Jak powiedzieć',
        body: '“Nie chodzi tylko o więcej leadów. Chodzi też o to, żeby te leady nie ginęły i żeby zespół wiedział, co zrobić dalej.”',
        bullets: ['Nie zaczynaj od technicznych integracji.', 'Mów o procesie i stratach.', 'Proponuj mapę procesu jako pierwszy krok.']
      }
    ],
    quiz: {
      question: 'Kiedy automatyzacja ma największy sens?',
      answers: ['Gdy firma gubi leady lub robi follow-up ręcznie', 'Gdy firma nie ma żadnych klientów', 'Gdy nie ma internetu'],
      correct: 0
    }
  }
};

const articles = {
  'call-logic': {
    title: 'Logika zimnej rozmowy',
    intro: 'Twoim celem nie jest sprzedać usługę przez telefon. Twoim celem jest znaleźć realny problem, wzbudzić ciekawość i umówić rozmowę z osobą decyzyjną.',
    sections: [
      ['Dlaczego dzwonimy', 'Wiele firm nie widzi, że traci klientów przez słabą obecność online. Telefon jest szybkim sposobem, żeby pokazać konkretną obserwację i zaproponować krótką analizę.'],
      ['Czego nie robimy', 'Nie czytamy ulotki, nie naciskamy na zakup, nie podajemy przypadkowej ceny i nie obiecujemy efektów bez audytu.'],
      ['Jak tworzyć ciekawość', 'Zaczynasz od obserwacji: opinie, brak strony, słaby profil Google, stara strona, brak formularza. Potem pytasz, czy właściciel chce zobaczyć, co można poprawić.'],
      ['Jak kwalifikować', 'Sprawdzasz, czy firma działa aktywnie, ma telefon, przyjmuje klientów, ma wartość klienta i czy problem online faktycznie może kosztować ją pieniądze.'],
      ['Jak kończyć', 'Najlepszy koniec rozmowy to konkretny termin spotkania lub jasny status: oddzwonić, nie pasuje, brak decydenta, dobry lead do managera.']
    ]
  }
};

const scenarios = {
  scripts: [
    {
      client: 'Dzień dobry, o co chodzi?',
      choices: [
        ['Dzwonię sprzedać stronę internetową, mamy promocję.', false, 'Za wcześnie. Brzmi jak zwykła sprzedaż i klient będzie się bronił.'],
        ['Krótko: sprawdzamy lokalne firmy, które mogą tracić zapytania przez słabszą obecność w Google. Chcę tylko zadać jedno pytanie.', true, 'Dobrze. Jest krótko, konkretnie i nie sprzedajesz od razu.'],
        ['Proszę wejść na naszą stronę i zobaczyć ofertę.', false, 'To oddaje kontrolę klientowi i nie buduje rozmowy.']
      ]
    },
    {
      client: 'Nie mam teraz czasu.',
      choices: [
        ['Rozumiem. Czy lepiej zadzwonić dziś po 16:00 czy jutro rano?', true, 'Dobrze. Dajesz dwie proste opcje i idziesz do następnego kroku.'],
        ['To ja wyślę ofertę.', false, 'Bez kontekstu oferta zwykle zginie. Najpierw ustal kolejny kontakt.'],
        ['Ale to zajmie tylko 20 minut.', false, 'Za dużo. Klient powiedział, że nie ma czasu.']
      ]
    }
  ],
  objections: [
    {
      client: 'Nie jestem zainteresowany.',
      choices: [
        ['Rozumiem. Nie chcę nic sprzedawać teraz. Chodzi tylko o krótkie sprawdzenie, czy nie tracicie zapytań przez stronę lub Google. Mogę zadać jedno pytanie?', true, 'Dobrze. Obniżasz presję i wracasz do diagnozy.'],
        ['Dlaczego nie? Przecież to ważne.', false, 'Brzmi konfrontacyjnie.'],
        ['To proszę dać maila.', false, 'Mail bez zgody na temat nie ma wartości.']
      ]
    },
    {
      client: 'Mamy stronę.',
      choices: [
        ['Super. Właśnie dlatego pytam: czy ta strona realnie daje wam zapytania, czy raczej tylko jest w internecie?', true, 'Dobrze. Nie kłócisz się, tylko otwierasz temat efektu.'],
        ['Ale pewnie jest słaba.', false, 'Nie oceniaj agresywnie bez audytu.'],
        ['To nie potrzebujecie nic.', false, 'Możesz stracić dobrego leada, bo problemem może być jakość, SEO albo reklamy.']
      ]
    },
    {
      client: 'Proszę wysłać ofertę.',
      choices: [
        ['Mogę wysłać, tylko żeby nie wysłać czegoś przypadkowego: czy chodzi bardziej o stronę, Google czy pozyskiwanie zapytań?', true, 'Dobrze. Warunkujesz ofertę krótką kwalifikacją.'],
        ['Dobrze, wyślę wszystko.', false, 'Za szeroko. Klient nie dostanie konkretu.'],
        ['Nie wysyłamy ofert.', false, 'Za twardo i niepotrzebnie.']
      ]
    },
    {
      client: 'Ile to kosztuje?',
      choices: [
        ['Zależy od zakresu. Najpierw trzeba zobaczyć, co realnie jest potrzebne. Możemy umówić 15 minut i wtedy podać sensowny wariant.', true, 'Dobrze. Nie rzucasz ceny bez diagnozy.'],
        ['Od 500 zł.', false, 'Przypadkowa cena obniża wartość i może być nieprawdziwa.'],
        ['Drogo, ale warto.', false, 'Nieprofesjonalne i bez konkretu.']
      ]
    }
  ],
  statuses: [
    {
      client: 'Nikt nie odebrał telefonu.',
      choices: [
        ['Ustaw status: Nie odebrał i zaplanuj ponowny kontakt.', true, 'Poprawnie. Taki lead nie jest stracony.'],
        ['Usuń firmę.', false, 'Nie usuwaj tylko dlatego, że nikt nie odebrał.'],
        ['Oznacz jako nie pasuje.', false, 'Brak odpowiedzi to nie kwalifikacja.']
      ]
    },
    {
      client: 'Klient chce rozmowę jutro o 11:00.',
      choices: [
        ['Status: Spotkanie umówione, notatka z terminem i tematem.', true, 'Poprawnie. To najważniejszy pozytywny status.'],
        ['Status: Zainteresowany bez notatki.', false, 'Za mało. Termin musi być zapisany.'],
        ['Status: Completed.', false, 'Proces nie jest zakończony, tylko przekazany dalej.']
      ]
    }
  ]
};

const qualificationLeads = [
  {
    name: 'Klimatyzacja Nowak Warszawa',
    facts: ['47 opinii, ocena 4.8', 'Brak własnej strony', 'Telefon widoczny', 'Aktywny sezon'],
    answer: 'good',
    why: 'Dobry lead: usługa lokalna, opinie, telefon i brak strony. Jest konkretny powód rozmowy.'
  },
  {
    name: 'Studio brandingowe premium',
    facts: ['Nowoczesna strona', 'Silny Instagram', 'Nie jest lokalną usługą dla obecnego parsera'],
    answer: 'weak',
    why: 'Słabszy lead dla callera od stron lokalnych. Może być B2B, ale nie jest priorytetem.'
  },
  {
    name: 'Firma bez telefonu i bez profilu',
    facts: ['Brak numeru', 'Brak strony', 'Brak aktywności', 'Nie wiadomo czy działa'],
    answer: 'skip',
    why: 'Nie dzwonimy, jeśli nie ma kontaktu i sygnałów aktywności.'
  }
];

const finalQuestions = [
  ['Jaki jest główny cel pierwszej rozmowy?', ['Sprzedać usługę', 'Umówić wartościowe spotkanie', 'Wysłać jak najwięcej ofert'], 1],
  ['Co robisz, gdy klient mówi “mamy stronę”?', ['Pytasz, czy strona daje zapytania', 'Kończysz rozmowę', 'Krytykujesz stronę'], 0],
  ['Kiedy lead z brakiem strony jest dobry?', ['Gdy firma jest aktywna i ma kontakt', 'Zawsze', 'Gdy nie ma telefonu'], 0],
  ['Czego nie obiecywać w SEO?', ['Analizy', 'Planu działań', 'Pierwszego miejsca w Google'], 2],
  ['Co oznacza status “Spotkanie umówione”?', ['Jest termin i temat rozmowy', 'Klient nie odebrał', 'Nie pasuje'], 0],
  ['Najlepszy argument za Google Business Profile?', ['Lepsze lokalne zaufanie i widoczność', 'Ładniejsze logo', 'Niższy abonament telefonu'], 0],
  ['Kiedy Meta Ads ma sens?', ['Przy wizualnej ofercie i realizacjach', 'Bez zdjęć', 'Bez odbierania leadów'], 0],
  ['Co robi chatbot AI?', ['Porządkuje część pytań i kwalifikuje leady', 'Zastępuje całą firmę', 'Gwarantuje sprzedaż'], 0],
  ['Co robisz przy “nie mam czasu”?', ['Ustalasz konkretny termin powrotu', 'Naciskasz 20 minut', 'Wysyłasz pustą ofertę'], 0],
  ['Dlaczego nie rzucać ceny od razu?', ['Bez diagnozy cena jest przypadkowa', 'Bo cena jest tajna', 'Bo klient nie pytał'], 0],
  ['Co sprawdzasz przy kwalifikacji?', ['Aktywność, kontakt, problem online', 'Tylko nazwę', 'Tylko kolor logo'], 0],
  ['Co robi globalny lead pool?', ['Chroni przed dublami między pracownikami', 'Zmienia język strony', 'Robi reklamy'], 0],
  ['Co jest lepsze niż “sprzedajemy strony”?', ['Pomagamy firmom pozyskiwać klientów online', 'Robimy wszystko tanio', 'Nie wiem'], 0],
  ['Kiedy nie oferować strony?', ['Gdy strona jest dobra i problem jest gdzie indziej', 'Nigdy', 'Zawsze oferować'], 0],
  ['Co wpisujesz po rozmowie?', ['Status i notatkę', 'Nic', 'Tylko imię klienta'], 0],
  ['Co oznacza “proszę wysłać ofertę”?', ['Trzeba krótko doprecyzować potrzebę', 'Koniec rozmowy', 'Wysyłamy wszystko'], 0],
  ['Jaki lead pominąć?', ['Brak telefonu i brak sygnałów aktywności', 'Firma z opiniami', 'Firma bez strony, ale z telefonem'], 0],
  ['Co daje efekt dużych liczb?', ['Pokazuje, że wynik wynika z regularności', 'Gwarantuje każdą sprzedaż', 'Zastępuje jakość rozmowy'], 0],
  ['Po co jest akademia?', ['Żeby rozumieć logikę pracy, nie tylko tekst', 'Żeby ominąć rozmowy', 'Żeby nie używać parsera'], 0],
  ['Kiedy przekazać lead managerowi?', ['Gdy jest zainteresowanie i konkretny następny krok', 'Po każdym nieodebranym', 'Nigdy'], 0]
];

const state = {
  activeModule: 0,
  activeService: 'websites',
  serviceStep: 0,
  scenarioIndex: 0,
  feedback: '',
  progress: {
    userId: getWorkerId(),
    displayName: '',
    completedModules: [],
    quizScores: {},
    serviceProgress: {}
  },
  finalAnswers: {}
};

const els = {
  moduleNav: document.querySelector('#moduleNav'),
  lessonHost: document.querySelector('#lessonHost'),
  overallProgress: document.querySelector('#overallProgress'),
  completedModules: document.querySelector('#completedModules'),
  nextLesson: document.querySelector('#nextLesson'),
  avgScore: document.querySelector('#avgScore'),
  workerName: document.querySelector('#workerName')
};

function getWorkerId() {
  let workerId = localStorage.getItem(WORKER_ID_STORAGE_KEY);
  if (!workerId) {
    workerId = `worker-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(WORKER_ID_STORAGE_KEY, workerId);
  }
  return workerId;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      'x-worker-id': state.progress.userId,
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
  return data;
}

async function loadProgress() {
  const fallback = JSON.parse(localStorage.getItem(ACADEMY_PROGRESS_KEY) || 'null');
  if (fallback) state.progress = { ...state.progress, ...fallback, userId: getWorkerId() };

  try {
    const data = await api(`/api/academy/progress?userId=${encodeURIComponent(state.progress.userId)}`);
    state.progress = { ...state.progress, ...(data.progress || {}) };
  } catch {
    // Local fallback keeps the academy usable if the backend is restarting.
  }

  els.workerName.value = state.progress.displayName || state.progress.userId;
}

async function saveProgress() {
  state.progress.lastActiveAt = new Date().toISOString();
  localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(state.progress));
  try {
    await api('/api/academy/progress', {
      method: 'POST',
      body: JSON.stringify(state.progress)
    });
  } catch {}
}

function completedSet() {
  return new Set(state.progress.completedModules || []);
}

function isUnlocked(index) {
  if (index === 0) return true;
  const done = completedSet();
  return done.has(modules[index - 1].id) || done.has(modules[index].id);
}

function completeModule(moduleId) {
  const done = completedSet();
  done.add(moduleId);
  state.progress.completedModules = [...done];
  saveProgress();
  render();
}

function scoreAverage() {
  const values = Object.values(state.progress.quizScores || {}).map(Number).filter(Number.isFinite);
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function renderShellStats() {
  const done = completedSet();
  const percent = Math.round((done.size / modules.length) * 100);
  const next = modules.find((module, index) => !done.has(module.id) && isUnlocked(index)) || modules[modules.length - 1];
  els.overallProgress.textContent = `${percent}%`;
  els.completedModules.textContent = `${done.size} / ${modules.length}`;
  els.nextLesson.textContent = next.title;
  els.avgScore.textContent = `${scoreAverage()}%`;
}

function renderNav() {
  const done = completedSet();
  els.moduleNav.innerHTML = modules
    .map((module, index) => {
      const unlocked = isUnlocked(index);
      const className = ['module-button', index === state.activeModule ? 'active' : '', done.has(module.id) ? 'done' : '', !unlocked ? 'locked' : '']
        .filter(Boolean)
        .join(' ');
      return `
        <button class="${className}" data-module="${index}" ${unlocked ? '' : 'disabled'}>
          <span class="module-index">${done.has(module.id) ? '✓' : index + 1}</span>
          <span>${escapeHtml(module.title)}</span>
        </button>
      `;
    })
    .join('');
}

function renderStart(module) {
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Moduł 1</p>
        <h2>Jak myśleć o tej pracy</h2>
        <p>Caller nie jest osobą od wciskania strony. Caller jest pierwszym filtrem: znajduje firmę, rozpoznaje realny problem i umawia rozmowę z managerem.</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="lesson-body">
      <div class="content-card">
        <h3>Najważniejsza zasada</h3>
        <p>Nie sprzedajesz przez telefon. Umawiasz rozmowę, kiedy widzisz konkretny powód: brak strony, słaby profil Google, brak widoczności, chaos w leadach albo niewykorzystane reklamy.</p>
      </div>
      <div class="card-grid">
        ${['Patrz na fakty, nie zgaduj.', 'Mów krótko i spokojnie.', 'Pytaj o problem, nie recytuj oferty.', 'Każdy lead musi mieć status i notatkę.']
          .map((text) => `<div class="content-card">${escapeHtml(text)}</div>`)
          .join('')}
      </div>
    </div>
  `;
}

function renderServices(module) {
  const service = serviceLessons[state.activeService];
  const step = service.steps[state.serviceStep];
  const stepPercent = Math.round(((state.serviceStep + 1) / service.steps.length) * 100);
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Moduł 2</p>
        <h2>Services Academy</h2>
        <p>Wybierz usługę i przejdź ją krok po kroku. Caller musi rozumieć, po co dana usługa istnieje i kiedy naprawdę pasuje do klienta.</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="service-grid">
      ${Object.entries(serviceLessons)
        .map(([key, item]) => `
          <button class="service-card" data-service="${key}">
            <span class="pill">${escapeHtml(item.badge)}</span>
            <h3>${escapeHtml(item.title)}</h3>
          </button>
        `)
        .join('')}
    </div>
    <div class="content-card">
      <div class="lesson-top">
        <div>
          <p class="mini-label">${escapeHtml(service.title)} · krok ${state.serviceStep + 1}/${service.steps.length}</p>
          <h3>${escapeHtml(step.title)}</h3>
        </div>
        <span class="pill">${stepPercent}%</span>
      </div>
      <div class="progress-line"><span style="width:${stepPercent}%"></span></div>
      <p>${escapeHtml(step.body)}</p>
      <ul>${step.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      ${state.serviceStep === service.steps.length - 1 ? renderMiniQuiz(service) : ''}
      <div class="action-row">
        <button class="secondary" data-service-prev ${state.serviceStep === 0 ? 'disabled' : ''}>Wstecz</button>
        <button class="primary" data-service-next>${state.serviceStep === service.steps.length - 1 ? 'Zakończ usługę' : 'Następny krok'}</button>
      </div>
    </div>
  `;
}

function renderMiniQuiz(service) {
  return `
    <div class="scenario-card">
      <h3>Mini quiz</h3>
      <p>${escapeHtml(service.quiz.question)}</p>
      <div class="choice-grid">
        ${service.quiz.answers
          .map((answer, index) => `<button class="choice" data-mini-quiz="${index}" data-correct="${index === service.quiz.correct}">${escapeHtml(answer)}</button>`)
          .join('')}
      </div>
      ${state.feedback ? `<div class="feedback ${state.feedback.includes('Dobrze') ? 'ok' : 'bad'}">${escapeHtml(state.feedback)}</div>` : ''}
    </div>
  `;
}

function renderArticle(module) {
  const article = articles[module.id];
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Moduł 3</p>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.intro)}</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="lesson-body">
      ${article.sections
        .map(([title, body]) => `
          <div class="content-card">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(body)}</p>
          </div>
        `)
        .join('')}
    </div>
  `;
}

function renderScenario(module) {
  const set = scenarios[module.scenarioSet];
  const scenario = set[state.scenarioIndex % set.length];
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Trening odpowiedzi</p>
        <h2>${escapeHtml(module.title)}</h2>
        <p>Wybierz najlepszą odpowiedź. Po każdej decyzji zobaczysz, dlaczego działa albo nie działa.</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="scenario-card">
      <span class="pill">Klient mówi</span>
      <h3>${escapeHtml(scenario.client)}</h3>
      <div class="choice-grid">
        ${scenario.choices
          .map(([text, ok], index) => `<button class="choice" data-scenario-choice="${index}" data-correct="${ok}">${escapeHtml(text)}</button>`)
          .join('')}
      </div>
      ${state.feedback ? `<div class="feedback ${state.feedback.includes('Dobrze') ? 'ok' : 'bad'}">${escapeHtml(state.feedback)}</div>` : ''}
      <div class="action-row">
        <button class="secondary" data-next-scenario>Następny przykład</button>
      </div>
    </div>
  `;
}

function renderQualification(module) {
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Kwalifikacja</p>
        <h2>Dobry lead, słaby lead czy pomijamy?</h2>
        <p>Nie każdy znaleziony rekord jest wart telefonu. Dobry caller umie odsiać chaos i skupić się na firmach z realnym potencjałem.</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="card-grid">
      ${qualificationLeads
        .map((lead, leadIndex) => `
          <div class="lead-card">
            <h3>${escapeHtml(lead.name)}</h3>
            <ul>${lead.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>
            <div class="choice-grid">
              <button class="choice" data-lead="${leadIndex}" data-answer="good">Dobry lead</button>
              <button class="choice" data-lead="${leadIndex}" data-answer="weak">Słaby lead</button>
              <button class="choice" data-lead="${leadIndex}" data-answer="skip">Nie dzwonić</button>
            </div>
          </div>
        `)
        .join('')}
    </div>
    ${state.feedback ? `<div class="feedback ok">${escapeHtml(state.feedback)}</div>` : ''}
  `;
}

function renderCalculator(module) {
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Matematyka pracy</p>
        <h2>Efekt dużych liczb</h2>
        <p>Wynik callera nie bierze się z jednego idealnego telefonu. Bierze się z regularnej liczby prób, dobrej kwalifikacji i poprawnego statusowania.</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="calculator">
      <label><span class="mini-label">Telefony dziennie</span><input id="callsPerDay" type="number" value="80" min="1" /></label>
      <label><span class="mini-label">Odbieralność %</span><input id="answerRate" type="number" value="35" min="1" max="100" /></label>
      <label><span class="mini-label">Zainteresowanie %</span><input id="interestRate" type="number" value="18" min="1" max="100" /></label>
      <label><span class="mini-label">Spotkanie z zainteresowanych %</span><input id="meetingRate" type="number" value="35" min="1" max="100" /></label>
    </div>
    <div id="calculatorResult" class="income-card"></div>
  `;
}

function renderWorkday(module) {
  const routine = [
    ['09:00', 'Start, sprawdzenie systemu i priorytetów'],
    ['09:15', 'Wybór kategorii i miasta w parserze'],
    ['09:30', 'Sprawdzenie pierwszych firm i rozpoczęcie telefonów'],
    ['11:30', 'Krótki przegląd statusów i notatek'],
    ['13:00', 'Druga seria telefonów, powroty do “oddzwonić później”'],
    ['16:30', 'Porządkowanie statusów, przekazanie spotkań managerowi'],
    ['17:00', 'Podsumowanie dnia: telefony, rozmowy, spotkania, blokery']
  ];
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Rutyna</p>
        <h2>Dzień pracy callera</h2>
        <p>Dobry dzień pracy to rytm: lead, szybka ocena, telefon, status, notatka, następny lead.</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="routine-list">
      ${routine
        .map(([time, text]) => `
          <div class="routine-item">
            <span class="routine-time">${escapeHtml(time)}</span>
            <strong>${escapeHtml(text)}</strong>
          </div>
        `)
        .join('')}
    </div>
  `;
}

function renderFinal(module) {
  const answered = Object.keys(state.finalAnswers).length;
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Egzamin</p>
        <h2>Final Test</h2>
        <p>Wymagany wynik: 80%. Test sprawdza logikę pracy, usługi, obiekcje, kwalifikację i statusy.</p>
      </div>
      ${completionButton(module.id)}
    </div>
    <div class="progress-line"><span style="width:${Math.round((answered / finalQuestions.length) * 100)}%"></span></div>
    <div class="lesson-body">
      ${finalQuestions
        .map(([question, answers], qIndex) => `
          <div class="content-card">
            <h3>${qIndex + 1}. ${escapeHtml(question)}</h3>
            <div class="choice-grid">
              ${answers
                .map((answer, answerIndex) => `
                  <button class="choice ${state.finalAnswers[qIndex] === answerIndex ? 'correct' : ''}" data-final-q="${qIndex}" data-final-a="${answerIndex}">
                    ${escapeHtml(answer)}
                  </button>
                `)
                .join('')}
            </div>
          </div>
        `)
        .join('')}
    </div>
    <div class="action-row">
      <button class="primary" data-submit-final>Sprawdź wynik</button>
      <span class="pill">${answered}/${finalQuestions.length} odpowiedzi</span>
    </div>
    ${state.feedback ? `<div class="feedback ${state.feedback.includes('Zdane') ? 'ok' : 'bad'}">${escapeHtml(state.feedback)}</div>` : ''}
  `;
}

function completionButton(moduleId) {
  const done = completedSet().has(moduleId);
  return `<button class="${done ? 'secondary' : 'primary'}" data-complete="${moduleId}">${done ? 'Ukończone' : 'Oznacz jako ukończone'}</button>`;
}

function renderLesson() {
  const module = modules[state.activeModule];
  state.feedback = state.feedback || '';
  if (module.type === 'start') els.lessonHost.innerHTML = renderStart(module);
  if (module.type === 'services') els.lessonHost.innerHTML = renderServices(module);
  if (module.type === 'article') els.lessonHost.innerHTML = renderArticle(module);
  if (module.type === 'scenario') els.lessonHost.innerHTML = renderScenario(module);
  if (module.type === 'qualification') els.lessonHost.innerHTML = renderQualification(module);
  if (module.type === 'calculator') els.lessonHost.innerHTML = renderCalculator(module);
  if (module.type === 'workday') els.lessonHost.innerHTML = renderWorkday(module);
  if (module.type === 'final') els.lessonHost.innerHTML = renderFinal(module);
  if (module.type === 'calculator') updateCalculator();
}

function render() {
  renderShellStats();
  renderNav();
  renderLesson();
  window.lucide?.createIcons();
}

function updateCalculator() {
  const calls = Number(document.querySelector('#callsPerDay')?.value || 80);
  const answerRate = Number(document.querySelector('#answerRate')?.value || 35) / 100;
  const interestRate = Number(document.querySelector('#interestRate')?.value || 18) / 100;
  const meetingRate = Number(document.querySelector('#meetingRate')?.value || 35) / 100;
  const days = 22;
  const monthlyMeetings = Math.round(calls * answerRate * interestRate * meetingRate * days);
  const income = 4500 + monthlyMeetings * 100;
  const result = document.querySelector('#calculatorResult');
  if (result) {
    result.innerHTML = `
      <span>Szacowany miesiąc</span>
      <strong>${income.toLocaleString('pl-PL')} PLN</strong>
      <p>${monthlyMeetings} spotkań × 100 PLN + 4500 PLN podstawy. To model orientacyjny, nie gwarancja.</p>
    `;
  }
}

document.addEventListener('click', (event) => {
  const moduleButton = event.target.closest('[data-module]');
  if (moduleButton) {
    state.activeModule = Number(moduleButton.dataset.module);
    state.feedback = '';
    render();
    return;
  }

  const serviceButton = event.target.closest('[data-service]');
  if (serviceButton) {
    state.activeService = serviceButton.dataset.service;
    state.serviceStep = 0;
    state.feedback = '';
    render();
    return;
  }

  if (event.target.closest('[data-service-prev]')) {
    state.serviceStep = Math.max(0, state.serviceStep - 1);
    state.feedback = '';
    render();
    return;
  }

  if (event.target.closest('[data-service-next]')) {
    const max = serviceLessons[state.activeService].steps.length - 1;
    if (state.serviceStep < max) state.serviceStep += 1;
    else {
      state.progress.serviceProgress[state.activeService] = true;
      state.feedback = 'Dobrze. Ta usługa jest przerobiona. Wybierz kolejną albo oznacz moduł jako ukończony.';
      saveProgress();
    }
    render();
    return;
  }

  const miniQuiz = event.target.closest('[data-mini-quiz]');
  if (miniQuiz) {
    const ok = miniQuiz.dataset.correct === 'true';
    state.feedback = ok ? 'Dobrze. To jest właściwa logika rozmowy.' : 'Nie. Wróć do celu: diagnoza i spotkanie, nie natychmiastowa sprzedaż.';
    const key = `service-${state.activeService}`;
    state.progress.quizScores[key] = ok ? 100 : 0;
    saveProgress();
    render();
    return;
  }

  const scenarioChoice = event.target.closest('[data-scenario-choice]');
  if (scenarioChoice) {
    const module = modules[state.activeModule];
    const scenario = scenarios[module.scenarioSet][state.scenarioIndex % scenarios[module.scenarioSet].length];
    const choice = scenario.choices[Number(scenarioChoice.dataset.scenarioChoice)];
    state.feedback = `${choice[1] ? 'Dobrze.' : 'Nie.'} ${choice[2]}`;
    state.progress.quizScores[module.id] = choice[1] ? 100 : 50;
    saveProgress();
    render();
    return;
  }

  if (event.target.closest('[data-next-scenario]')) {
    state.scenarioIndex += 1;
    state.feedback = '';
    render();
    return;
  }

  const leadChoice = event.target.closest('[data-lead]');
  if (leadChoice) {
    const lead = qualificationLeads[Number(leadChoice.dataset.lead)];
    const ok = leadChoice.dataset.answer === lead.answer;
    state.feedback = `${ok ? 'Dobrze.' : 'Nie do końca.'} ${lead.why}`;
    state.progress.quizScores.qualification = ok ? 100 : 50;
    saveProgress();
    render();
    return;
  }

  const finalAnswer = event.target.closest('[data-final-q]');
  if (finalAnswer) {
    state.finalAnswers[finalAnswer.dataset.finalQ] = Number(finalAnswer.dataset.finalA);
    render();
    return;
  }

  if (event.target.closest('[data-submit-final]')) {
    let correct = 0;
    finalQuestions.forEach(([, , answer], index) => {
      if (state.finalAnswers[index] === answer) correct += 1;
    });
    const score = Math.round((correct / finalQuestions.length) * 100);
    state.progress.quizScores.final = score;
    state.feedback = score >= 80 ? `Zdane: ${score}%. Możesz pracować z parserem.` : `Jeszcze nie: ${score}%. Wróć do modułów i popraw wynik do 80%.`;
    if (score >= 80) completeModule('final');
    saveProgress();
    render();
    return;
  }

  const complete = event.target.closest('[data-complete]');
  if (complete) {
    completeModule(complete.dataset.complete);
  }
});

document.addEventListener('input', (event) => {
  if (event.target.closest('.calculator')) updateCalculator();
});

let workerSaveTimer = null;
els.workerName.addEventListener('input', () => {
  state.progress.displayName = els.workerName.value.trim() || state.progress.userId;
  clearTimeout(workerSaveTimer);
  workerSaveTimer = setTimeout(saveProgress, 350);
});

loadProgress().then(render);
