const WORKER_ID_STORAGE_KEY = 'auraWorkerId';
const SESSION_TOKEN_STORAGE_KEY = 'auraSessionToken';
const ACADEMY_PROGRESS_KEY = 'auraAcademyProgress';
const API_BASE_STORAGE_KEY = 'parserApiBase';
const TUNNEL_BOOTSTRAP_RETRIES = 4;
const TUNNEL_BOOTSTRAP_DELAY_MS = 1200;
const SITE_PAGE_URL = 'https://parser.auraglobal-merchants.com/site/#top';

let session = null; // { role, workerId, displayName, language } once logged in

function getAuthToken() {
  return localStorage.getItem(SESSION_TOKEN_STORAGE_KEY) || '';
}

function setAuthToken(token) {
  if (token) localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
}

function clearAuthToken() {
  localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

function normalizeWorkerIdValue(value) {
  return String(value || '').trim().slice(0, 80);
}

function getWorkerIdOverride() {
  if (session?.role !== 'admin') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeWorkerIdValue(params.get('workerId') || localStorage.getItem(WORKER_ID_STORAGE_KEY) || '');
  } catch {
    return normalizeWorkerIdValue(localStorage.getItem(WORKER_ID_STORAGE_KEY) || '');
  }
}

function getWorkerId() {
  return session?.role === 'admin' ? getWorkerIdOverride() : session?.workerId || '';
}

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

const ACADEMY_VIEWS = ['home', 'training', 'servicesCatalog', 'scriptsExamples', 'parserGuide', 'aiTraining'];

function readViewFromUrl() {
  const raw = new URLSearchParams(window.location.search).get('section') || 'home';
  return ACADEMY_VIEWS.includes(raw) ? raw : 'home';
}

function syncViewToUrl(view) {
  const url = new URL(window.location.href);
  url.searchParams.set('section', view);
  window.history.replaceState(null, '', url);
}

const state = {
  academyView: readViewFromUrl(),
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
    serviceProgress: {},
    sectionsVisited: {},
    servicesOpened: [],
    servicesCompleted: [],
    scriptsOpened: []
  },
  finalAnswers: {},
  catalogServiceId: null,
  scriptsExpandedIds: [],
  scriptsTab: 'scripts',
  aiTraining: {
    personas: [],
    sessionId: null,
    clientType: null,
    personaLabel: '',
    messages: [],
    sending: false,
    result: null,
    history: [],
    view: 'picker',
    selectedHistoryId: null,
    error: ''
  }
};

const els = {
  academyToolbar: document.querySelector('#academyToolbar'),
  moduleNav: document.querySelector('#moduleNav'),
  lessonHost: document.querySelector('#lessonHost'),
  overallProgress: document.querySelector('#overallProgress'),
  completedModules: document.querySelector('#completedModules'),
  nextLesson: document.querySelector('#nextLesson'),
  avgScore: document.querySelector('#avgScore'),
  workerName: document.querySelector('#workerName'),
  academyLogoutButton: document.querySelector('#academyLogoutButton')
};

function normalizeApiBase(value) {
  if (!value) return '';
  let cleaned = String(value).trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) cleaned = `https://${cleaned}`;
  return cleaned;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isPrivateHostname(hostname) {
  const host = String(hostname || '').trim().toLowerCase();
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^\[::1\]$/.test(host)) return true;
  return false;
}

function clearPrivateParserApiBase() {
  if (window.location.protocol === 'file:' || isPrivateHostname(window.location.hostname)) return;
  const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
  if (!saved) return;
  try {
    if (isPrivateHostname(new URL(saved).hostname)) localStorage.removeItem(API_BASE_STORAGE_KEY);
  } catch {
    localStorage.removeItem(API_BASE_STORAGE_KEY);
  }
}

function resolveApiBase() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('api');
    if (fromQuery !== null) {
      const cleaned = normalizeApiBase(fromQuery);
      if (cleaned) localStorage.setItem(API_BASE_STORAGE_KEY, cleaned);
      else localStorage.removeItem(API_BASE_STORAGE_KEY);
      return cleaned;
    }
  } catch {}

  if (window.location.protocol === 'file:') return 'http://localhost:4317';
  clearPrivateParserApiBase();

  try {
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (!saved) return '';
    try {
      if (new URL(saved).origin === window.location.origin) return '';
    } catch {}
    return saved;
  } catch {
    return '';
  }
}

let apiBase = resolveApiBase();
let apiBootstrapPromise = null;

function getApiBase() {
  return apiBase;
}

function persistApiBase(value) {
  try {
    if (value) localStorage.setItem(API_BASE_STORAGE_KEY, value);
    else localStorage.removeItem(API_BASE_STORAGE_KEY);
  } catch {}
}

function setApiBase(value, { persist = false } = {}) {
  apiBase = normalizeApiBase(value);
  if (persist) persistApiBase(apiBase);
  return apiBase;
}

function apiUrl(path) {
  return `${getApiBase()}${path}`;
}

async function isApiBaseReachable(base) {
  const cleaned = normalizeApiBase(base);
  if (!cleaned) return false;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${cleaned}/api/health`, { cache: 'no-store', signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function bootstrapApiBase() {
  const queryBase = (() => {
    try {
      return normalizeApiBase(new URLSearchParams(window.location.search).get('api'));
    } catch {
      return '';
    }
  })();
  if (queryBase && (await isApiBaseReachable(queryBase))) {
    setApiBase(queryBase, { persist: true });
    return queryBase;
  }

  const onPagesOrFile = window.location.protocol === 'file:' || window.location.hostname.endsWith('github.io');
  if (onPagesOrFile) {
    try {
      const response = await fetch(`../tunnel.json?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const cleaned = normalizeApiBase(data.api || data.url || '');
        if (cleaned) {
          setApiBase(cleaned, { persist: true });
          return cleaned;
        }
      }
    } catch {}
  }

  try {
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
    if (saved) {
      try {
        if (new URL(saved).origin === window.location.origin) {
          setApiBase('', { persist: true });
          return '';
        }
      } catch {}
      try {
        if (!onPagesOrFile && isPrivateHostname(new URL(saved).hostname)) {
          setApiBase('', { persist: true });
          return '';
        }
      } catch {}
      if (await isApiBaseReachable(saved)) {
        setApiBase(saved, { persist: true });
        return saved;
      }
    }
  } catch {}

  return getApiBase();
}

function wireCrossAppLinks() {
  clearPrivateParserApiBase();
  const parserLink = document.querySelector('#academyParserLink');
  const adminLink = document.querySelector('#academyAdminLink');
  const brandLink = document.querySelector('.brand');

  const bind = (link, basePath) => {
    if (!link) return;
    const updateHref = () => {
      const url = new URL(basePath, window.location.href);
      if (getApiBase()) url.searchParams.set('api', getApiBase());
      link.href = url.toString();
    };
    updateHref();
    link.addEventListener('click', () => {
      clearPrivateParserApiBase();
      updateHref();
    });
  };

  bind(parserLink, '../');
  bind(adminLink, '../admin/');
  bind(brandLink, '../');

  adminLink?.classList.toggle('hidden-field', session?.role !== 'admin');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

async function api(path, options = {}) {
  if (apiBootstrapPromise) await apiBootstrapPromise;
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'content-type': 'application/json',
      'x-worker-id': state.progress.userId || getWorkerId(),
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API error ${response.status}`);
  return data;
}

async function loadProgress() {
  state.progress.userId = getWorkerId();
  state.progress.displayName = session?.role === 'admin' ? state.progress.userId || session?.displayName || '' : session?.displayName || '';
  if (state.progress.userId) localStorage.setItem(WORKER_ID_STORAGE_KEY, state.progress.userId);

  const fallback = JSON.parse(localStorage.getItem(ACADEMY_PROGRESS_KEY) || 'null');
  if (fallback) {
    state.progress = {
      ...state.progress,
      ...fallback,
      userId: getWorkerId(),
      displayName: session?.role === 'admin' ? getWorkerId() || session?.displayName || '' : session?.displayName || ''
    };
  }

  try {
    const data = await api(`/api/academy/progress?workerId=${encodeURIComponent(state.progress.userId)}`);
    state.progress = {
      ...state.progress,
      ...(data.progress || {}),
      userId: state.progress.userId,
      displayName:
        data.progress?.displayName ||
        (session?.role === 'admin' ? state.progress.userId || session?.displayName || '' : session?.displayName || '')
    };
  } catch {
    // Local fallback keeps the academy usable if the backend is restarting.
  }

  if (els.workerName) els.workerName.value = state.progress.displayName || state.progress.userId;
}

async function saveProgress(extra = {}) {
  state.progress.lastActiveAt = new Date().toISOString();
  localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(state.progress));
  try {
    await api('/api/academy/progress', {
      method: 'POST',
      body: JSON.stringify({ ...state.progress, ...extra })
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
  els.moduleNav.classList.toggle('hidden-field', state.academyView !== 'training');
  if (state.academyView !== 'training') {
    els.moduleNav.innerHTML = '';
    return;
  }
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

const TOOLBAR_TABS = [
  { view: 'home', icon: 'house', key: 'nav_home' },
  { view: 'training', icon: 'graduation-cap', key: 'nav_training' },
  { view: 'servicesCatalog', icon: 'briefcase-business', key: 'nav_services' },
  { view: 'scriptsExamples', icon: 'messages-square', key: 'nav_scripts' },
  { view: 'parserGuide', icon: 'radar', key: 'nav_parser_guide' },
  { view: 'aiTraining', icon: 'bot', key: 'nav_ai_training' }
];

function renderToolbar() {
  if (!els.academyToolbar) return;
  const tr = window.AuraI18n?.tr || ((key) => key);
  const lang = window.AuraI18n?.getLanguage ? window.AuraI18n.getLanguage() : 'pl';
  const tabsHtml = TOOLBAR_TABS.map(
    (tab) => `
      <button class="toolbar-tab ${state.academyView === tab.view ? 'active' : ''}" data-academy-view="${tab.view}">
        <i data-lucide="${tab.icon}"></i>
        <span>${escapeHtml(tr(tab.key))}</span>
      </button>
    `
  ).join('');
  const langHtml = `
    <div class="toolbar-lang" data-lang-switch>
      ${['pl', 'ru', 'en']
        .map((code) => `<button class="lang-chip ${lang === code ? 'active' : ''}" data-set-lang="${code}">${code.toUpperCase()}</button>`)
        .join('')}
    </div>
  `;
  els.academyToolbar.innerHTML = `<div class="toolbar-tabs">${tabsHtml}</div>${langHtml}`;
}

function moduleIndexById(moduleId) {
  const index = modules.findIndex((module) => module.id === moduleId);
  return index >= 0 ? index : 0;
}

function sectionStatusLabel(percent) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  if (percent >= 100) return tr('status_completed');
  if (percent > 0) return tr('status_in_progress');
  return tr('status_not_started');
}

function trainingPercent() {
  return Math.round((completedSet().size / modules.length) * 100);
}

function servicesPercent() {
  const total = Array.isArray(window.AURA_SERVICES) ? window.AURA_SERVICES.length : 22;
  const done = (state.progress.servicesCompleted || []).length;
  return total ? Math.round((done / total) * 100) : 0;
}

function scriptsPercent() {
  const total = (window.AURA_SCRIPTS?.scripts?.length || 12) + (window.AURA_SCRIPTS?.examples?.length || 10);
  const opened = (state.progress.scriptsOpened || []).length;
  return total ? Math.min(100, Math.round((opened / total) * 100)) : 0;
}

function parserGuidePercent() {
  return state.progress.sectionsVisited?.parserGuide ? 100 : 0;
}

function aiTrainingPercent() {
  const sessions = state.aiTraining.history.length;
  return Math.min(100, sessions * 34);
}

function portalCard({ title, body, icon, view, percent = 0 }) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return `
    <a class="portal-card" href="#" data-academy-view="${escapeHtml(view)}">
      <span class="portal-icon"><i data-lucide="${escapeHtml(icon || 'circle-dot')}"></i></span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      <div class="portal-card-progress">
        <div class="progress-bar"><span style="width:${percent}%"></span></div>
        <div class="portal-card-meta">
          <span>${percent}%</span>
          <span>${escapeHtml(sectionStatusLabel(percent))}</span>
        </div>
      </div>
      <span class="portal-card-open">${escapeHtml(tr('btn_open'))}</span>
    </a>
  `;
}

function renderPortalHome() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const overall = Math.round(
    (trainingPercent() + servicesPercent() + scriptsPercent() + parserGuidePercent() + aiTrainingPercent()) / 5
  );
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Aura Sales Academy</p>
        <h2>Witaj, ${escapeHtml(state.progress.displayName || state.progress.userId)}</h2>
        <p>
          Akademia to Twój portal wdrożeniowy: poznajesz nasze usługi, uczysz się rozmawiać z klientem,
          trenujesz z AI i wiesz, jak pracować z parserem. Postęp zapisuje się automatycznie i jest
          widoczny dla administratora.
        </p>
        <p class="portal-overall">Ogólny postęp: <strong>${overall}%</strong></p>
      </div>
      <div class="lesson-top-actions">
        <button class="primary" data-academy-view="training">${escapeHtml(tr('btn_continue_learning'))}</button>
        <a class="secondary-link" href="../">${escapeHtml(tr('btn_go_to_parser'))}</a>
      </div>
    </div>
    <div class="portal-grid">
      ${portalCard({
        title: tr('nav_training'),
        body: 'Moduły od startu pracy do finalnego testu. Ten wynik widzi administrator.',
        icon: 'graduation-cap',
        view: 'training',
        percent: trainingPercent()
      })}
      ${portalCard({
        title: tr('nav_services'),
        body: 'Pełny katalog usług: co to jest, komu proponować, ile to może kosztować i jak o tym mówić.',
        icon: 'briefcase-business',
        view: 'servicesCatalog',
        percent: servicesPercent()
      })}
      ${portalCard({
        title: tr('nav_scripts'),
        body: 'Gotowe skrypty rozmów, obsługa obiekcji i przykłady prawdziwych rozmów z klientami.',
        icon: 'messages-square',
        view: 'scriptsExamples',
        percent: scriptsPercent()
      })}
      ${portalCard({
        title: tr('nav_parser_guide'),
        body: 'Jak wybrać kategorię, czytać AI score i poprawnie ustawiać statusy leadów.',
        icon: 'radar',
        view: 'parserGuide',
        percent: parserGuidePercent()
      })}
      ${portalCard({
        title: tr('nav_ai_training'),
        body: 'Trenuj rozmowy z AI, które gra różne typy klientów, i otrzymuj ocenę po każdej sesji.',
        icon: 'bot',
        view: 'aiTraining',
        percent: aiTrainingPercent()
      })}
    </div>
  `;
}

const PRICE_DEFLECTION_PHRASE_PL =
  '„Dokładna cena zależy od zakresu, ale proste projekty zaczynają się od około 400–500 EUR. Najlepiej krótko sprawdzić, czego Państwo potrzebują, i wtedy przygotować konkretną propozycję.”';

function mapSiteServiceToAcademyService(service, category = {}) {
  const details = service.details || {};
  const title = service.name || service.title || 'Usługa';
  const short = service.short || details.what || '';
  const problem = details.problem || 'Klient nie ma jasnego systemu pozyskiwania zapytań online.';
  const gives = details.gives || 'Więcej zaufania, lepszy kontakt i większą szansę na zapytanie.';
  return {
    id: service.id,
    icon: service.icon || 'briefcase-business',
    title,
    whatIsIt: details.what || short,
    howWeDoIt: details.process || 'Najpierw sprawdzamy obecną sytuację firmy, potem dobieramy zakres i wdrażamy rozwiązanie krok po kroku.',
    whoItsFor: details.forWho || 'Firmy usługowe i lokalne biznesy, które chcą wyglądać profesjonalnie i zdobywać więcej zapytań.',
    problemSolved: problem,
    whyClientNeedsIt: gives,
    howItBringsSales: gives,
    preCallSignals: [
      problem,
      details.forWho ? `Firma pasuje do grupy: ${details.forWho}` : '',
      details.priceFactors ? `Cena zależy od: ${details.priceFactors}` : ''
    ].filter(Boolean),
    whatToCheck: {
      website: 'Czy firma ma własną stronę i czy jasno pokazuje ofertę.',
      googleBusiness: 'Czy profil Google ma aktualne dane, zdjęcia i opinie.',
      leadForms: 'Czy klient ma prostą drogę do kontaktu: telefon, formularz, rezerwacja.',
      automation: 'Czy zapytania nie giną między mailem, telefonem i wiadomościami.'
    },
    simpleExplanation: short || `To usługa z kategorii ${category.label || 'Aura Global'}, która pomaga firmie zdobywać i obsługiwać zapytania.`,
    whatToPropose: `Krótka konsultacja i sprawdzenie, czy ${title.toLowerCase()} ma sens dla tej firmy.`,
    priceRange: service.price || 'indywidualnie',
    priceDepends: [details.priceFactors || 'Zakres projektu, liczba elementów i integracje.'],
    packages: [
      { tier: 'Start', price: service.price || 'indywidualnie', description: short || details.what || title },
      { tier: 'Growth', price: 'po konsultacji', description: 'Szerszy zakres dopasowany do celu biznesowego klienta.' }
    ],
    faq: [
      {
        question: 'Czy można podać dokładną cenę przez telefon?',
        answer: 'Nie. Caller podaje widełki i umawia konsultację, bo cena zależy od zakresu.'
      },
      {
        question: 'Co jest celem rozmowy?',
        answer: 'Zrozumieć sytuację klienta i umówić krótką rozmowę ze specjalistą.'
      }
    ],
    objections: [
      {
        objection: 'Proszę wysłać ofertę.',
        response: 'Żeby oferta miała sens, najlepiej najpierw krótko sprawdzić, czego firma realnie potrzebuje.'
      },
      {
        objection: 'Ile to kosztuje?',
        response: PRICE_DEFLECTION_PHRASE_PL
      }
    ],
    exampleDialogue: `Sprzedawca: Dzień dobry, widzę że firma działa aktywnie online. Chciałem krótko sprawdzić, czy ${title.toLowerCase()} jest teraz dla Państwa tematem.\nKlient: A o co dokładnie chodzi?\nSprzedawca: Nie chcę sprzedawać przez telefon. Najpierw sprawdzamy, czy jest konkretny problem i czy warto przygotować propozycję. Możemy umówić 15 minut konsultacji?`,
    whenNotToPitch: 'Nie proponuj, jeśli firma ma już mocne rozwiązanie w tym obszarze, dobrą widoczność, kontakt działa bez problemu i nie ma jasnego powodu do rozmowy.'
  };
}

async function loadServicesCatalog() {
  if (Array.isArray(window.AURA_SERVICES) && window.AURA_SERVICES.length) return;
  try {
    const module = await import('../site/data/services.js');
    const categories = Array.isArray(module.serviceCategories) ? module.serviceCategories : [];
    window.AURA_SERVICES = categories.flatMap((category) =>
      (category.services || []).map((service) => mapSiteServiceToAcademyService(service, category))
    );
  } catch {
    window.AURA_SERVICES = [];
  }
}

function markServiceOpened(serviceId) {
  const opened = new Set(state.progress.servicesOpened || []);
  if (opened.has(serviceId)) return;
  opened.add(serviceId);
  state.progress.servicesOpened = [...opened];
  saveProgress({ servicesOpened: [serviceId] });
}

function renderServiceCard(service) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const opened = (state.progress.servicesOpened || []).includes(service.id);
  const completed = (state.progress.servicesCompleted || []).includes(service.id);
  const badge = completed ? tr('status_completed') : opened ? tr('status_in_progress') : tr('status_not_started');
  return `
    <a class="portal-card service-card ${completed ? 'done' : ''}" href="#" data-open-service="${escapeHtml(service.id)}">
      <span class="portal-icon"><i data-lucide="${escapeHtml(service.icon || 'briefcase-business')}"></i></span>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.whatIsIt || '')}</p>
      <span class="service-badge">${escapeHtml(badge)}</span>
    </a>
  `;
}

function renderServiceDetail(service) {
  const tr = window.AuraI18n?.tr || ((key) => key);
  const completed = (state.progress.servicesCompleted || []).includes(service.id);
  const checkList = service.whatToCheck || {};
  const checkLabels = {
    website: 'Strona internetowa',
    googleBusiness: 'Google Business Profile',
    ads: 'Reklamy',
    socialMedia: 'Social media',
    leadForms: 'Formularze zgłoszeniowe',
    siteSpeed: 'Szybkość strony',
    automation: 'Brak automatyzacji'
  };
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('nav_services'))}</p>
        <h2>${escapeHtml(service.title)}</h2>
      </div>
      <div class="lesson-top-actions">
        <button class="secondary" data-back-to-services>← Wszystkie usługi</button>
        ${completed ? '' : `<button class="primary" data-complete-service="${escapeHtml(service.id)}">Oznacz jako przerobione</button>`}
      </div>
    </div>
    <div class="service-detail">
      <div class="content-card"><h3>1. Co to jest?</h3><p>${escapeHtml(service.whatIsIt)}</p></div>
      <div class="content-card"><h3>2. Jak robimy to dla klienta?</h3><p>${escapeHtml(service.howWeDoIt)}</p></div>
      <div class="content-card"><h3>3. Dla kogo to jest?</h3><p>${escapeHtml(service.whoItsFor)}</p></div>
      <div class="content-card"><h3>4. Jaki problem klienta rozwiązuje?</h3><p>${escapeHtml(service.problemSolved)}</p></div>
      <div class="content-card"><h3>5. Dlaczego klientowi jest to potrzebne?</h3><p>${escapeHtml(service.whyClientNeedsIt)}</p></div>
      <div class="content-card"><h3>6. Jak to pomaga zdobywać więcej zapytań/sprzedaży?</h3><p>${escapeHtml(service.howItBringsSales)}</p></div>
      <div class="content-card">
        <h3>7. Jak rozpoznać przed telefonem, że klient tego potrzebuje?</h3>
        <ul>${(service.preCallSignals || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div class="content-card">
        <h3>8. Na co patrzeć u klienta?</h3>
        <ul>${Object.entries(checkList)
          .map(([key, value]) => `<li><strong>${escapeHtml(checkLabels[key] || key)}:</strong> ${escapeHtml(value)}</li>`)
          .join('')}</ul>
      </div>
      <div class="content-card"><h3>9. Jak wytłumaczyć prostymi słowami?</h3><p>${escapeHtml(service.simpleExplanation)}</p></div>
      <div class="content-card"><h3>10. Co konkretnie proponować?</h3><p>${escapeHtml(service.whatToPropose)}</p></div>
      <div class="content-card">
        <h3>11-12. Ile to kosztuje i od czego zależy cena?</h3>
        <p><strong>${escapeHtml(service.priceRange)}</strong></p>
        <ul>${(service.priceDepends || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <p class="price-deflection">${PRICE_DEFLECTION_PHRASE_PL}</p>
      </div>
      <div class="content-card">
        <h3>13. Typowe pakiety</h3>
        <div class="package-grid">
          ${(service.packages || [])
            .map(
              (pkg) => `
                <div class="package-card">
                  <span class="package-tier">${escapeHtml(pkg.tier)}</span>
                  <strong>${escapeHtml(pkg.price)}</strong>
                  <p>${escapeHtml(pkg.description)}</p>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
      <div class="content-card">
        <h3>14. Częste pytania klienta</h3>
        ${(service.faq || []).map((item) => `<p><strong>${escapeHtml(item.question)}</strong><br>${escapeHtml(item.answer)}</p>`).join('')}
      </div>
      <div class="content-card">
        <h3>15-16. Obiekcje i jak na nie odpowiedzieć</h3>
        ${(service.objections || [])
          .map((item) => `<p><strong>„${escapeHtml(item.objection)}”</strong><br>→ ${escapeHtml(item.response)}</p>`)
          .join('')}
      </div>
      <div class="content-card">
        <h3>17. Przykład krótkiej rozmowy</h3>
        <pre class="dialogue-block">${escapeHtml(service.exampleDialogue)}</pre>
      </div>
      <div class="content-card"><h3>18. Kiedy NIE proponować tej usługi?</h3><p>${escapeHtml(service.whenNotToPitch)}</p></div>
    </div>
  `;
}

function renderServicesCatalogSection() {
  const services = Array.isArray(window.AURA_SERVICES) ? window.AURA_SERVICES : [];
  if (state.catalogServiceId) {
    const service = services.find((item) => item.id === state.catalogServiceId);
    if (service) {
      markServiceOpened(service.id);
      return renderServiceDetail(service);
    }
  }
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Baza wiedzy</p>
        <h2>Nasze usługi</h2>
        <p>
          Poznaj każdą usługę na tyle, żeby nie brzmieć jak robot: rozumieć problem klienta, umieć
          wytłumaczyć wartość i doprowadzić rozmowę do spotkania. Dokładnej ceny nie obiecujemy przez
          telefon — zadaniem rozmowy jest umówić konsultację.
        </p>
        <p class="price-deflection">${PRICE_DEFLECTION_PHRASE_PL}</p>
        <div class="action-row">
          <a class="primary" href="${escapeAttribute(SITE_PAGE_URL)}" target="_blank" rel="noreferrer">Otwórz stronę z ofertą</a>
        </div>
      </div>
    </div>
    ${
      services.length
        ? `<div class="portal-grid services-grid">${services.map(renderServiceCard).join('')}</div>`
        : `<p class="muted">Ładowanie katalogu usług...</p>`
    }
  `;
}

function markScriptOpened(itemId) {
  const opened = new Set(state.progress.scriptsOpened || []);
  if (opened.has(itemId)) return;
  opened.add(itemId);
  state.progress.scriptsOpened = [...opened];
  saveProgress({ scriptsOpened: [itemId] });
}

function renderScriptCard(script) {
  const expanded = state.scriptsExpandedIds.includes(script.id);
  if (!expanded) {
    return `
      <a class="portal-card script-card" href="#" data-toggle-script="${escapeHtml(script.id)}">
        <span class="portal-icon"><i data-lucide="message-circle"></i></span>
        <h3>${escapeHtml(script.title)}</h3>
        <p>${escapeHtml(script.situation)}</p>
        <span class="portal-card-open">Rozwiń</span>
      </a>
    `;
  }
  return `
    <div class="content-card script-card-expanded">
      <div class="lesson-top">
        <h3>${escapeHtml(script.title)}</h3>
        <button class="secondary" data-toggle-script="${escapeHtml(script.id)}">Zwiń</button>
      </div>
      <p><strong>Sytuacja:</strong> ${escapeHtml(script.situation)}</p>
      <p><strong>Cel:</strong> ${escapeHtml(script.goal)}</p>
      <p><strong>Gotowa fraza:</strong> „${escapeHtml(script.readyPhrase)}”</p>
      <p class="feedback bad"><strong>Zły przykład:</strong> ${escapeHtml(script.badExample)}</p>
      <p class="feedback ok"><strong>Dobry przykład:</strong> ${escapeHtml(script.goodExample)}</p>
      <p><strong>Logika:</strong> ${escapeHtml(script.logic)}</p>
      <p><strong>Czego nie mówić:</strong> ${escapeHtml(script.whatNotToSay)}</p>
      <p><strong>Jak przejść dalej:</strong> ${escapeHtml(script.howToTransition)}</p>
    </div>
  `;
}

function renderExampleCard(example) {
  const expanded = state.scriptsExpandedIds.includes(example.id);
  if (!expanded) {
    return `
      <a class="portal-card script-card" href="#" data-toggle-script="${escapeHtml(example.id)}">
        <span class="portal-icon"><i data-lucide="scroll-text"></i></span>
        <h3>${escapeHtml(example.title)}</h3>
        <p>${escapeHtml((example.transcript || '').slice(0, 90))}…</p>
        <span class="portal-card-open">Rozwiń</span>
      </a>
    `;
  }
  return `
    <div class="content-card script-card-expanded">
      <div class="lesson-top">
        <h3>${escapeHtml(example.title)}</h3>
        <button class="secondary" data-toggle-script="${escapeHtml(example.id)}">Zwiń</button>
      </div>
      <pre class="dialogue-block">${escapeHtml(example.transcript)}</pre>
      <p class="feedback ok"><strong>Co zrobił dobrze:</strong> ${escapeHtml(example.whatWasGood)}</p>
      <p class="feedback bad"><strong>Co zrobił źle:</strong> ${escapeHtml(example.whatWasBad)}</p>
      <p><strong>Jak mogło być lepiej:</strong> ${escapeHtml(example.howItCouldBeBetter)}</p>
      <p><strong>Wynik rozmowy:</strong> ${escapeHtml(example.outcome)}</p>
      <p><strong>Status do ustawienia w parserze:</strong> ${escapeHtml(example.parserStatusToSet)}</p>
    </div>
  `;
}

function renderScriptsExamplesSection() {
  const data = window.AURA_SCRIPTS || { scripts: [], examples: [] };
  const tab = state.scriptsTab === 'examples' ? 'examples' : 'scripts';
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Baza wiedzy</p>
        <h2>Skrypty i przykłady rozmów</h2>
        <p>Gotowe frazy na typowe sytuacje oraz prawdziwe przykłady rozmów — ucz się logiki, nie tylko tekstu na pamięć.</p>
      </div>
      <div class="lesson-top-actions">
        <button class="${tab === 'scripts' ? 'primary' : 'secondary'}" data-scripts-tab="scripts">A. Skrypty</button>
        <button class="${tab === 'examples' ? 'primary' : 'secondary'}" data-scripts-tab="examples">B. Przykłady rozmów</button>
      </div>
    </div>
    <div class="portal-grid scripts-grid">
      ${
        tab === 'scripts'
          ? data.scripts.map(renderScriptCard).join('')
          : data.examples.map(renderExampleCard).join('')
      }
    </div>
  `;
}

const PARSER_GUIDE_POINTS = [
  { title: 'Jak wybrać kategorię', body: 'Wybierz branżę zgodną z tym, co realnie sprzedajemy (np. Klimatyzacja, Auto detailing). Zła kategoria = słabe leady.' },
  { title: 'Jak wybrać miasto', body: 'Wybierz miasto lub dzielnicę, w której szukasz firm. Im węższy obszar, tym trafniejsze wyniki.' },
  { title: 'Jak czytać listę leadów', body: 'Każdy wiersz to firma z podstawowymi danymi: nazwa, telefon, status strony, AI score. Sortuj wg score, żeby dzwonić od najlepszych.' },
  { title: 'Co znaczy AI score', body: 'Liczba 0–100 pokazująca, jak dobrym leadem jest firma (brak strony, aktywność, potencjał). Wyżej = warto zadzwonić w pierwszej kolejności.' },
  { title: 'Co znaczy category match', body: 'AI potwierdza, że firma faktycznie działa w wybranej branży. Zielony = pasuje, można dzwonić bez obaw.' },
  { title: 'Co znaczy wrong category', body: 'AI podejrzewa, że firma NIE pasuje do wybranej kategorii (np. trafił się warsztat zamiast salonu kosmetycznego). Zweryfikuj przed telefonem.' },
  { title: 'Jak otworzyć kartę firmy', body: 'Kliknij w wiersz firmy na liście — otworzy się karta ze wszystkimi danymi, historią statusów i wynikiem AI.' },
  { title: 'Jak ocenić, czy warto dzwonić', body: 'Sprawdź status strony, AI score i category match. Priorytet: brak strony / słaba strona + wysoki score + pasująca kategoria.' },
  { title: 'Jak ustawić status', body: 'Po rozmowie zawsze ustaw status leada (np. "Umówione spotkanie", "Nie zainteresowany") — to widzi też admin.' },
  { title: 'Jak napisać notatkę', body: 'W karcie firmy dodaj krótką notatkę: co ustalono, kiedy oddzwonić, na co uważać przy kolejnym kontakcie.' },
  { title: 'Co zrobić, gdy numer jest błędny', body: 'Ustaw status "Brak telefonu / błędny numer" i przejdź do kolejnego leada — nie trać czasu na próby.' },
  { title: 'Co zrobić, gdy firma nie pasuje', body: 'Ustaw status "Nie pasuje" i krótko opisz dlaczego w notatce — to pomaga poprawiać jakość przyszłych wyszukiwań.' },
  { title: 'Co zrobić, gdy AI ostrzega o złej kategorii', body: 'Zweryfikuj firmę ręcznie (strona, Google) zanim zadzwonisz — jeśli faktycznie nie pasuje, ustaw status "Nie pasuje" bez dzwonienia.' }
];

function renderParserGuideSection() {
  const tr = window.AuraI18n?.tr || ((key) => key);
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Instrukcja</p>
        <h2>Praca z parserem</h2>
        <p>Krótki przewodnik, jak korzystać z parsera leadów: od wyboru kategorii do ustawienia statusu po rozmowie.</p>
      </div>
      <a class="primary-link" href="../">${escapeHtml(tr('btn_go_to_parser'))}</a>
    </div>
    <div class="guide-list">
      ${PARSER_GUIDE_POINTS.map(
        (point, index) => `
          <div class="content-card guide-item">
            <span class="guide-index">${index + 1}</span>
            <div>
              <h3>${escapeHtml(point.title)}</h3>
              <p>${escapeHtml(point.body)}</p>
            </div>
          </div>
        `
      ).join('')}
    </div>
  `;
}

const AI_TRAINING_FALLBACK_PERSONAS = [
  { id: 'busy_owner', label: 'Zajęty właściciel' },
  { id: 'angry_owner', label: 'Zły właściciel' },
  { id: 'skeptic', label: 'Sceptyk' },
  { id: 'no_website', label: 'Klient bez strony' },
  { id: 'old_website', label: 'Klient ze starą stroną' },
  { id: 'good_website', label: 'Klient z dobrą stroną' },
  { id: 'send_offer', label: 'Klient mówi "wyślij ofertę"' },
  { id: 'asks_price', label: 'Klient od razu pyta o cenę' },
  { id: 'no_marketing', label: 'Klient nie rozumie marketingu' },
  { id: 'has_agency', label: 'Klient ma już agencję' },
  { id: 'interested_website', label: 'Klient zainteresowany stroną' },
  { id: 'interested_ads', label: 'Klient zainteresowany reklamą' },
  { id: 'wants_callback', label: 'Klient chce, żeby oddzwonić' },
  { id: 'distrustful', label: 'Klient nie ufa' },
  { id: 'ready_to_meet', label: 'Klient gotowy na spotkanie' }
];

async function loadAiTrainingHistory() {
  try {
    if (!state.aiTraining.personas.length) {
      const personasData = await api('/api/academy/ai-training/personas');
      state.aiTraining.personas = personasData.personas?.length ? personasData.personas : AI_TRAINING_FALLBACK_PERSONAS;
    }
  } catch {
    state.aiTraining.personas = AI_TRAINING_FALLBACK_PERSONAS;
  }
  try {
    const data = await api('/api/academy/ai-training/sessions');
    state.aiTraining.history = data.sessions || [];
  } catch {
    state.aiTraining.history = [];
  }
  if (state.academyView === 'aiTraining') render();
}

async function startAiTraining(clientType) {
  state.aiTraining.error = '';
  state.aiTraining.sending = true;
  render();
  try {
    const data = await api('/api/academy/ai-training/start', {
      method: 'POST',
      body: JSON.stringify({ clientType })
    });
    state.aiTraining.sessionId = data.sessionId;
    state.aiTraining.clientType = data.clientType;
    state.aiTraining.personaLabel = data.personaLabel;
    state.aiTraining.messages = [{ role: 'client', text: data.openingLine }];
    state.aiTraining.result = null;
    state.aiTraining.view = 'chat';
  } catch (error) {
    state.aiTraining.error = error.message || 'Nie udało się rozpocząć treningu.';
  } finally {
    state.aiTraining.sending = false;
    render();
  }
}

async function sendAiTrainingMessage(text) {
  if (!text.trim() || !state.aiTraining.sessionId) return;
  state.aiTraining.messages.push({ role: 'worker', text });
  state.aiTraining.sending = true;
  render();
  try {
    const data = await api(`/api/academy/ai-training/${state.aiTraining.sessionId}/message`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
    state.aiTraining.messages.push({ role: 'client', text: data.reply });
  } catch (error) {
    state.aiTraining.error = error.message || 'Błąd rozmowy.';
  } finally {
    state.aiTraining.sending = false;
    render();
  }
}

async function finishAiTraining() {
  if (!state.aiTraining.sessionId) return;
  state.aiTraining.sending = true;
  render();
  try {
    const data = await api(`/api/academy/ai-training/${state.aiTraining.sessionId}/finish`, { method: 'POST' });
    state.aiTraining.result = data.session;
    state.aiTraining.view = 'feedback';
    loadAiTrainingHistory();
  } catch (error) {
    state.aiTraining.error = error.message || 'Nie udało się zakończyć treningu.';
  } finally {
    state.aiTraining.sending = false;
    render();
  }
}

function renderAiTrainingChatBubble(message) {
  const isWorker = message.role === 'worker';
  return `<div class="chat-bubble ${isWorker ? 'worker' : 'client'}"><span>${escapeHtml(message.text)}</span></div>`;
}

function renderAiTrainingFeedback(session) {
  const feedback = session.feedback || {};
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">Wynik treningu</p>
        <h2>${escapeHtml(session.score ?? 0)}/100</h2>
        <p>${feedback.meetingBooked ? '✅ Spotkanie zostało umówione' : '❌ Spotkanie nie zostało umówione'}</p>
      </div>
      <div class="lesson-top-actions">
        <button class="primary" data-ai-training-new>Nowy trening</button>
        <button class="secondary" data-academy-view="aiTraining">Powrót do listy</button>
      </div>
    </div>
    <div class="content-card">
      <h3>Co poszło dobrze</h3>
      <ul>${(feedback.good || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>—</li>'}</ul>
    </div>
    <div class="content-card">
      <h3>Co wymaga poprawy</h3>
      <ul>${(feedback.bad || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>—</li>'}</ul>
    </div>
    <div class="content-card">
      <h3>Jak poprawić następnym razem</h3>
      <ul>${(feedback.improvements || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>—</li>'}</ul>
    </div>
  `;
}

function renderAiTrainingHistoryItem(session) {
  const persona = state.aiTraining.personas.find((item) => item.id === session.clientType);
  const date = session.completedAt || session.createdAt || '';
  return `
    <a class="portal-card" href="#" data-view-training-session="${escapeHtml(session.sessionId)}">
      <span class="portal-icon"><i data-lucide="bot"></i></span>
      <h3>${escapeHtml(persona?.label || session.clientType)}</h3>
      <p>${date ? new Date(date).toLocaleString('pl-PL') : ''}</p>
      <span class="portal-card-open">${session.status === 'completed' ? `Wynik: ${session.score ?? 0}/100` : 'W trakcie'}</span>
    </a>
  `;
}

function renderAiTrainingSection() {
  const view = state.aiTraining.view;
  const tr = window.AuraI18n?.tr || ((key) => key);

  if (view === 'chat') {
    return `
      <div class="lesson-top">
        <div>
          <p class="eyebrow">${escapeHtml(tr('nav_ai_training'))}</p>
          <h2>${escapeHtml(state.aiTraining.personaLabel || '')}</h2>
        </div>
        <button class="primary" data-ai-training-finish ${state.aiTraining.sending ? 'disabled' : ''}>${escapeHtml(tr('btn_finish_training'))}</button>
      </div>
      <div class="content-card chat-panel">
        <div class="chat-log">${state.aiTraining.messages.map(renderAiTrainingChatBubble).join('')}</div>
        <form id="aiTrainingForm" class="chat-input-row">
          <input id="aiTrainingInput" type="text" autocomplete="off" placeholder="Napisz odpowiedź jako sprzedawca..." ${state.aiTraining.sending ? 'disabled' : ''} />
          <button class="primary" type="submit" ${state.aiTraining.sending ? 'disabled' : ''}>${escapeHtml(tr('btn_send'))}</button>
        </form>
        ${state.aiTraining.error ? `<p class="feedback bad">${escapeHtml(state.aiTraining.error)}</p>` : ''}
      </div>
    `;
  }

  if (view === 'feedback' && state.aiTraining.result) {
    return renderAiTrainingFeedback(state.aiTraining.result);
  }

  if (view === 'historyDetail' && state.aiTraining.selectedHistoryId) {
    const session = state.aiTraining.history.find((item) => item.sessionId === state.aiTraining.selectedHistoryId);
    if (session && session.status === 'completed') return renderAiTrainingFeedback(session);
  }

  const personas = state.aiTraining.personas.length ? state.aiTraining.personas : AI_TRAINING_FALLBACK_PERSONAS;
  return `
    <div class="lesson-top">
      <div>
        <p class="eyebrow">${escapeHtml(tr('nav_ai_training'))}</p>
        <h2>Trenuj rozmowy z AI</h2>
        <p>Wybierz typ klienta — AI odegra jego rolę w symulowanej rozmowie telefonicznej. Po zakończeniu otrzymasz ocenę i feedback.</p>
      </div>
    </div>
    <div class="portal-grid">
      ${personas
        .map(
          (persona) => `
            <a class="portal-card" href="#" data-start-training="${escapeHtml(persona.id)}">
              <span class="portal-icon"><i data-lucide="user"></i></span>
              <h3>${escapeHtml(persona.label)}</h3>
              <span class="portal-card-open">${escapeHtml(tr('btn_start_training'))}</span>
            </a>
          `
        )
        .join('')}
    </div>
    ${state.aiTraining.error ? `<p class="feedback bad">${escapeHtml(state.aiTraining.error)}</p>` : ''}
    <h3 class="history-heading">Historia treningów</h3>
    <div class="portal-grid">
      ${
        state.aiTraining.history.length
          ? state.aiTraining.history.map(renderAiTrainingHistoryItem).join('')
          : `<p class="muted">${escapeHtml(tr('empty_no_sessions'))}</p>`
      }
    </div>
  `;
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
        <div class="action-row">
          <a class="secondary" href="${SITE_PAGE_URL}" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Strona wizytowka</a>
        </div>
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
  if (state.academyView === 'home') {
    els.lessonHost.innerHTML = renderPortalHome();
    return;
  }
  if (state.academyView === 'servicesCatalog') {
    els.lessonHost.innerHTML = renderServicesCatalogSection();
    return;
  }
  if (state.academyView === 'scriptsExamples') {
    els.lessonHost.innerHTML = renderScriptsExamplesSection();
    return;
  }
  if (state.academyView === 'parserGuide') {
    els.lessonHost.innerHTML = renderParserGuideSection();
    return;
  }
  if (state.academyView === 'aiTraining') {
    els.lessonHost.innerHTML = renderAiTrainingSection();
    return;
  }
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
  renderToolbar();
  renderNav();
  renderLesson();
  wireCrossAppLinks();
  window.lucide?.createIcons();
}

function switchAcademyView(view) {
  if (!ACADEMY_VIEWS.includes(view)) view = 'home';
  state.academyView = view;
  state.feedback = '';
  syncViewToUrl(view);
  render();
  markSectionVisited(view);
  if (view === 'aiTraining') loadAiTrainingHistory();
}

function markSectionVisited(view) {
  if (!state.progress.sectionsVisited) state.progress.sectionsVisited = {};
  if (state.progress.sectionsVisited[view]) return;
  state.progress.sectionsVisited[view] = new Date().toISOString();
  saveProgress({ section: view });
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
  const langChip = event.target.closest('[data-set-lang]');
  if (langChip) {
    event.preventDefault();
    window.AuraI18n?.setLanguage(langChip.dataset.setLang);
    render();
    return;
  }

  const moduleButton = event.target.closest('[data-module]');
  if (moduleButton) {
    state.academyView = 'training';
    state.activeModule = Number(moduleButton.dataset.module);
    state.feedback = '';
    render();
    return;
  }

  const academyViewButton = event.target.closest('[data-academy-view]');
  if (academyViewButton) {
    event.preventDefault();
    switchAcademyView(academyViewButton.dataset.academyView || 'home');
    return;
  }

  const openModuleButton = event.target.closest('[data-open-module]');
  if (openModuleButton) {
    event.preventDefault();
    state.academyView = 'training';
    state.activeModule = moduleIndexById(openModuleButton.dataset.openModule);
    state.feedback = '';
    render();
    return;
  }

  const openServiceButton = event.target.closest('[data-open-service]');
  if (openServiceButton) {
    event.preventDefault();
    state.catalogServiceId = openServiceButton.dataset.openService;
    render();
    return;
  }

  if (event.target.closest('[data-back-to-services]')) {
    state.catalogServiceId = null;
    render();
    return;
  }

  const completeServiceButton = event.target.closest('[data-complete-service]');
  if (completeServiceButton) {
    const serviceId = completeServiceButton.dataset.completeService;
    const done = new Set(state.progress.servicesCompleted || []);
    done.add(serviceId);
    state.progress.servicesCompleted = [...done];
    saveProgress({ servicesCompleted: [serviceId] });
    render();
    return;
  }

  const scriptsTabButton = event.target.closest('[data-scripts-tab]');
  if (scriptsTabButton) {
    state.scriptsTab = scriptsTabButton.dataset.scriptsTab;
    state.scriptsExpandedIds = [];
    render();
    return;
  }

  const toggleScriptButton = event.target.closest('[data-toggle-script]');
  if (toggleScriptButton) {
    const itemId = toggleScriptButton.dataset.toggleScript;
    const expanded = new Set(state.scriptsExpandedIds);
    if (expanded.has(itemId)) expanded.delete(itemId);
    else {
      expanded.add(itemId);
      markScriptOpened(itemId);
    }
    state.scriptsExpandedIds = [...expanded];
    render();
    return;
  }

  const startTrainingButton = event.target.closest('[data-start-training]');
  if (startTrainingButton) {
    state.aiTraining.error = '';
    startAiTraining(startTrainingButton.dataset.startTraining);
    return;
  }

  if (event.target.closest('[data-ai-training-finish]')) {
    finishAiTraining();
    return;
  }

  if (event.target.closest('[data-ai-training-new]')) {
    state.aiTraining.view = 'picker';
    state.aiTraining.sessionId = null;
    state.aiTraining.messages = [];
    state.aiTraining.result = null;
    render();
    return;
  }

  const viewTrainingSessionButton = event.target.closest('[data-view-training-session]');
  if (viewTrainingSessionButton) {
    state.aiTraining.selectedHistoryId = viewTrainingSessionButton.dataset.viewTrainingSession;
    state.aiTraining.view = 'historyDetail';
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

document.addEventListener('submit', (event) => {
  if (event.target.id === 'aiTrainingForm') {
    event.preventDefault();
    const input = document.querySelector('#aiTrainingInput');
    const text = input?.value || '';
    if (input) input.value = '';
    sendAiTrainingMessage(text);
  }
});

let workerSaveTimer = null;

function renderLoginScreen(message = '') {
  const overlay = document.querySelector('#authOverlay');
  if (!overlay) return;
  overlay.classList.remove('hidden-field');
  document.querySelector('#appShell')?.classList.add('hidden-field');
  overlay.innerHTML = `
    <form class="auth-card" id="loginForm">
      <div>
        <p class="eyebrow">Aura Sales Academy</p>
        <h2>Logowanie</h2>
        <p class="muted">Wpisz login i haslo otrzymane od administratora.</p>
      </div>
      ${message ? `<div class="feedback bad">${escapeHtml(message)}</div>` : ''}
      <label>Login<input name="login" autocomplete="username" required /></label>
      <label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="auth-submit" type="submit">Zaloguj</button>
    </form>
  `;
  document.querySelector('#loginForm')?.addEventListener('submit', handleLoginSubmit);
}

function hideLoginScreen() {
  document.querySelector('#authOverlay')?.classList.add('hidden-field');
  document.querySelector('#appShell')?.classList.remove('hidden-field');
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const login = form.login.value.trim();
  const password = form.password.value;
  submitButton.disabled = true;
  submitButton.textContent = 'Loguje...';
  try {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      renderLoginScreen(data.error || 'Bledny login lub haslo.');
      return;
    }
    setAuthToken(data.token);
    session = { role: data.role, workerId: data.workerId, displayName: data.displayName, language: data.language };
    hideLoginScreen();
    await bootAcademy();
  } catch {
    renderLoginScreen('Serwer nie odpowiada.');
  }
}

async function handleLogout() {
  fetch(apiUrl('/api/auth/logout'), { method: 'POST', headers: { ...authHeaders() } }).catch(() => {});
  clearAuthToken();
  session = null;
  window.location.reload();
}

async function fetchSessionProfile() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const response = await fetch(apiUrl('/api/auth/me'), { headers: { ...authHeaders() } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function bootstrapSession() {
  const profile = await fetchSessionProfile();
  if (!profile) {
    clearAuthToken();
    renderLoginScreen();
    return false;
  }
  session = profile;
  hideLoginScreen();
  return true;
}

async function bootAcademy() {
  apiBootstrapPromise = bootstrapApiBase();
  wireCrossAppLinks();
  els.academyLogoutButton?.addEventListener('click', handleLogout);
  await loadProgress();
  await loadServicesCatalog();
  render();
  markSectionVisited(state.academyView);
  if (state.academyView === 'aiTraining') loadAiTrainingHistory();
}

bootstrapSession().then((ok) => {
  if (ok) bootAcademy();
});
