// Final exam question bank for Aura Sales Academy.
// Each question: { type: 'single' | 'case' | 'open', question: {pl,ru}, ... }
// - single/case: answers: {pl:[...], ru:[...]}, correct: index of the right answer
// - case additionally has explain: {pl,ru}
// - open is graded by AI via POST /api/academy/grade-answer; gradingNotes: {pl,ru}
//   tells the grader what a good answer should contain.
// Score required to pass and unlock the "final" module: 80%.
export const FINAL_EXAM = [
  {
    "type": "single",
    "question": {
      "pl": "Jaki jest główny cel pierwszej rozmowy?",
      "ru": "Какова главная цель первого звонка?"
    },
    "answers": {
      "pl": [
        "Sprzedać usługę",
        "Umówić wartościowe spotkanie",
        "Wysłać jak najwięcej ofert"
      ],
      "ru": [
        "Продать услугу",
        "Договориться о содержательной встрече",
        "Разослать как можно больше предложений"
      ]
    },
    "correct": 1
  },
  {
    "type": "single",
    "question": {
      "pl": "Co robisz, gdy klient mówi \"mamy stronę\"?",
      "ru": "Что делать, если клиент говорит \"у нас есть сайт\"?"
    },
    "answers": {
      "pl": [
        "Pytasz, czy strona daje zapytania",
        "Kończysz rozmowę",
        "Krytykujesz stronę"
      ],
      "ru": [
        "Спрашиваешь, приносит ли сайт заявки",
        "Заканчиваешь разговор",
        "Критикуешь сайт"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Kiedy lead z brakiem strony jest dobry?",
      "ru": "Когда лид без сайта — хороший лид?"
    },
    "answers": {
      "pl": [
        "Gdy firma jest aktywna i ma kontakt",
        "Zawsze",
        "Gdy nie ma telefonu"
      ],
      "ru": [
        "Когда компания активна и есть контакт",
        "Всегда",
        "Когда нет телефона"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Czego nie obiecywać w SEO?",
      "ru": "Чего нельзя обещать в теме SEO?"
    },
    "answers": {
      "pl": [
        "Analizy",
        "Planu działań",
        "Pierwszego miejsca w Google"
      ],
      "ru": [
        "Анализа",
        "Плана действий",
        "Первого места в Google"
      ]
    },
    "correct": 2
  },
  {
    "type": "single",
    "question": {
      "pl": "Co oznacza status \"Spotkanie umówione\"?",
      "ru": "Что означает статус \"Встреча назначена\"?"
    },
    "answers": {
      "pl": [
        "Jest termin i temat rozmowy",
        "Klient nie odebrał",
        "Nie pasuje"
      ],
      "ru": [
        "Есть дата и тема разговора",
        "Клиент не ответил",
        "Не подходит"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Najlepszy argument za Google Business Profile?",
      "ru": "Лучший аргумент в пользу Google Business Profile?"
    },
    "answers": {
      "pl": [
        "Lepsze lokalne zaufanie i widoczność",
        "Ładniejsze logo",
        "Niższy abonament telefonu"
      ],
      "ru": [
        "Больше локального доверия и видимости",
        "Красивее логотип",
        "Дешевле тариф на телефон"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Kiedy Meta Ads ma sens?",
      "ru": "Когда имеет смысл Meta Ads?"
    },
    "answers": {
      "pl": [
        "Przy wizualnej ofercie i realizacjach",
        "Bez zdjęć",
        "Bez odbierania leadów"
      ],
      "ru": [
        "При визуальном оффере и реализациях",
        "Без фото",
        "Без приёма лидов"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co robi chatbot AI?",
      "ru": "Что делает AI-чатбот?"
    },
    "answers": {
      "pl": [
        "Porządkuje część pytań i kwalifikuje leady",
        "Zastępuje całą firmę",
        "Gwarantuje sprzedaż"
      ],
      "ru": [
        "Упорядочивает часть вопросов и квалифицирует лиды",
        "Заменяет всю компанию",
        "Гарантирует продажу"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co robisz przy \"nie mam czasu\"?",
      "ru": "Что делать при \"у меня нет времени\"?"
    },
    "answers": {
      "pl": [
        "Ustalasz konkretny termin powrotu",
        "Naciskasz 20 minut",
        "Wysyłasz pustą ofertę"
      ],
      "ru": [
        "Договариваешься о конкретном времени повторного звонка",
        "Настаиваешь на 20 минутах",
        "Отправляешь пустое предложение"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Dlaczego nie rzucać ceny od razu?",
      "ru": "Почему нельзя сразу называть цену?"
    },
    "answers": {
      "pl": [
        "Bez diagnozy cena jest przypadkowa",
        "Bo cena jest tajna",
        "Bo klient nie pytał"
      ],
      "ru": [
        "Без диагностики цена случайна",
        "Потому что цена секретна",
        "Потому что клиент не спрашивал"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co sprawdzasz przy kwalifikacji?",
      "ru": "Что проверяешь при квалификации лида?"
    },
    "answers": {
      "pl": [
        "Aktywność, kontakt, problem online",
        "Tylko nazwę",
        "Tylko kolor logo"
      ],
      "ru": [
        "Активность, контакт, проблему в онлайне",
        "Только название",
        "Только цвет логотипа"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co robi globalny lead pool?",
      "ru": "Что делает общий пул лидов?"
    },
    "answers": {
      "pl": [
        "Chroni przed dublami między pracownikami",
        "Zmienia język strony",
        "Robi reklamy"
      ],
      "ru": [
        "Защищает от дублей между сотрудниками",
        "Меняет язык сайта",
        "Делает рекламу"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co jest lepsze niż \"sprzedajemy strony\"?",
      "ru": "Что лучше, чем \"мы продаём сайты\"?"
    },
    "answers": {
      "pl": [
        "Pomagamy firmom pozyskiwać klientów online",
        "Robimy wszystko tanio",
        "Nie wiem"
      ],
      "ru": [
        "Помогаем компаниям получать клиентов онлайн",
        "Делаем всё дёшево",
        "Не знаю"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Kiedy nie oferować strony?",
      "ru": "Когда не стоит предлагать сайт?"
    },
    "answers": {
      "pl": [
        "Gdy strona jest dobra i problem jest gdzie indziej",
        "Nigdy",
        "Zawsze oferować"
      ],
      "ru": [
        "Когда сайт хороший, а проблема в другом",
        "Никогда не предлагать",
        "Предлагать всегда"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co wpisujesz po rozmowie?",
      "ru": "Что вносишь после разговора?"
    },
    "answers": {
      "pl": [
        "Status i notatkę",
        "Nic",
        "Tylko imię klienta"
      ],
      "ru": [
        "Статус и заметку",
        "Ничего",
        "Только имя клиента"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co oznacza \"proszę wysłać ofertę\"?",
      "ru": "Что означает \"пришлите предложение\"?"
    },
    "answers": {
      "pl": [
        "Trzeba krótko doprecyzować potrzebę",
        "Koniec rozmowy",
        "Wysyłamy wszystko"
      ],
      "ru": [
        "Нужно коротко уточнить потребность",
        "Конец разговора",
        "Отправляем всё подряд"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Jaki lead pominąć?",
      "ru": "Какой лид пропустить?"
    },
    "answers": {
      "pl": [
        "Brak telefonu i brak sygnałów aktywności",
        "Firma z opiniami",
        "Firma bez strony, ale z telefonem"
      ],
      "ru": [
        "Без телефона и без признаков активности",
        "Компания с отзывами",
        "Компания без сайта, но с телефоном"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Co daje efekt dużych liczb?",
      "ru": "Что даёт эффект больших чисел?"
    },
    "answers": {
      "pl": [
        "Pokazuje, że wynik wynika z regularności",
        "Gwarantuje każdą sprzedaż",
        "Zastępuje jakość rozmowy"
      ],
      "ru": [
        "Показывает, что результат — следствие регулярности",
        "Гарантирует каждую продажу",
        "Заменяет качество разговора"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Po co jest akademia?",
      "ru": "Зачем нужна академия?"
    },
    "answers": {
      "pl": [
        "Żeby rozumieć logikę pracy, nie tylko tekst",
        "Żeby ominąć rozmowy",
        "Żeby nie używać parsera"
      ],
      "ru": [
        "Чтобы понимать логику работы, а не просто текст",
        "Чтобы избегать разговоров",
        "Чтобы не пользоваться парсером"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Kiedy przekazać lead managerowi?",
      "ru": "Когда передавать лид менеджеру?"
    },
    "answers": {
      "pl": [
        "Gdy jest zainteresowanie i konkretny następny krok",
        "Po każdym nieodebranym",
        "Nigdy"
      ],
      "ru": [
        "Когда есть интерес и конкретный следующий шаг",
        "После каждого неотвеченного звонка",
        "Никогда"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Czym różni się Google Ads od SEO, gdy tłumaczysz to klientowi?",
      "ru": "Чем отличается Google Ads от SEO, когда ты объясняешь это клиенту?"
    },
    "answers": {
      "pl": [
        "Google Ads daje widoczność od razu, ale kończy się z budżetem; SEO buduje widoczność wolniej, ale zostaje",
        "Google Ads i SEO to dokładnie to samo, tylko inna nazwa",
        "SEO działa tylko w pierwszym tygodniu, Google Ads działa zawsze"
      ],
      "ru": [
        "Google Ads даёт видимость сразу, но заканчивается вместе с бюджетом; SEO строит видимость медленнее, но остаётся",
        "Google Ads и SEO — это одно и то же, просто другое название",
        "SEO работает только первую неделю, а Google Ads — всегда"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Kiedy warto zaproponować TikTok Ads?",
      "ru": "Когда стоит предложить TikTok Ads?"
    },
    "answers": {
      "pl": [
        "Gdy marka celuje w młodszą grupę odbiorców i może tworzyć naturalne wideo",
        "Gdy klient nie ma żadnych zdjęć ani nagrań",
        "Zawsze, niezależnie od branży i grupy docelowej"
      ],
      "ru": [
        "Когда бренд ориентирован на более молодую аудиторию и может снимать естественное видео",
        "Когда у клиента нет ни одной фотографии или видео",
        "Всегда, независимо от отрасли и аудитории"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Jaki problem rozwiązuje remarketing?",
      "ru": "Какую проблему решает ремаркетинг?"
    },
    "answers": {
      "pl": [
        "To, że większość odwiedzających stronę wychodzi bez kontaktu i już nie wraca",
        "To, że firma nie ma jeszcze żadnej strony internetowej",
        "To, że telefon w firmie nie działa"
      ],
      "ru": [
        "То, что большинство посетителей сайта уходят без контакта и больше не возвращаются",
        "То, что у компании ещё нет сайта",
        "То, что в компании не работает телефон"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Klient wydaje pieniądze na reklamę, ale nie wie, co właściwie działa. Jaka usługa najpierw odpowiada na ten problem?",
      "ru": "Клиент тратит деньги на рекламу, но не знает, что именно работает. Какая услуга в первую очередь отвечает на эту проблему?"
    },
    "answers": {
      "pl": [
        "Analityka — pokazuje, skąd realnie przychodzą klienci",
        "Branding — zmiana logo",
        "Copywriting nowych tekstów na stronę"
      ],
      "ru": [
        "Аналитика — показывает, откуда реально приходят клиенты",
        "Брендинг — смена логотипа",
        "Копирайтинг новых текстов на сайт"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Komu najczęściej warto proponować usługę GEO / AI visibility?",
      "ru": "Кому чаще всего стоит предлагать услугу GEO / AI visibility?"
    },
    "answers": {
      "pl": [
        "Firmom eksperckim i B2B, którym zależy, jak są opisywane w wyszukiwarce i odpowiedziach AI",
        "Każdej małej lokalnej kawiarni bez wyjątku",
        "Firmom, które w ogóle nie mają jeszcze żadnej strony"
      ],
      "ru": [
        "Экспертным и B2B-компаниям, которым важно, как их описывают в поиске и ответах AI",
        "Абсолютно любой маленькой локальной кофейне без исключений",
        "Компаниям, у которых вообще ещё нет сайта"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Salon fryzjerski umawia wizyty tylko telefonicznie i ciągle traci klientów przez zajętą linię. Który problem trafnie opisuje sytuację, w której warto zaproponować system rezerwacji online?",
      "ru": "Парикмахерский салон записывает клиентов только по телефону и постоянно теряет их из-за занятой линии. Какая проблема точно описывает ситуацию, в которой стоит предложить систему онлайн-бронирования?"
    },
    "answers": {
      "pl": [
        "Umawianie przez telefon tworzy chaos, kolejki i nieobecności klientów",
        "Firma ma za dużo klientów z reklamy Google Ads",
        "Firma nie wie, ile kosztuje jej strona internetowa"
      ],
      "ru": [
        "Запись по телефону создаёт хаос, очереди и неявки клиентов",
        "У компании слишком много клиентов из рекламы Google Ads",
        "Компания не знает, сколько стоит её сайт"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Czym różni się panel admina od dashboardu?",
      "ru": "Чем отличается панель админа от дашборда?"
    },
    "answers": {
      "pl": [
        "Panel admina służy do zarządzania danymi i procesem firmy, dashboard pokazuje kluczowe liczby na jednym ekranie",
        "To dokładnie ta sama usługa pod dwiema nazwami",
        "Dashboard służy do wysyłki maili, panel admina do reklamy"
      ],
      "ru": [
        "Панель админа нужна для управления данными и процессами компании, дашборд показывает ключевые цифры на одном экране",
        "Это одна и та же услуга под двумя разными названиями",
        "Дашборд нужен для рассылки писем, панель админа — для рекламы"
      ]
    },
    "correct": 0
  },
  {
    "type": "single",
    "question": {
      "pl": "Klient rzuca zastrzeżenie w trakcie rozmowy. Co robisz najpierw?",
      "ru": "Клиент высказывает возражение в ходе разговора. Что ты делаешь в первую очередь?"
    },
    "answers": {
      "pl": [
        "Krótko potwierdzasz, że rozumiesz, i dopiero potem odpowiadasz na konkretny zarzut",
        "Od razu przechodzisz do kolejnego argumentu sprzedażowego, ignorując zdanie klienta",
        "Kończysz rozmowę, bo zastrzeżenie oznacza brak zainteresowania"
      ],
      "ru": [
        "Коротко подтверждаешь, что понимаешь, и только потом отвечаешь на конкретное возражение",
        "Сразу переходишь к следующему аргументу, игнорируя слова клиента",
        "Заканчиваешь разговор, потому что возражение значит отсутствие интереса"
      ]
    },
    "correct": 0
  },
  {
    "type": "case",
    "question": {
      "pl": "Dzwonisz do właściciela restauracji. Mówi: 'Mamy 3 tysiące polubień na Facebooku, ludzie i tak nas znajdują, po co nam strona?' Co proponujesz?",
      "ru": "Ты звонишь владельцу ресторана. Он говорит: 'У нас 3 тысячи лайков на Facebook, люди и так нас находят, зачем нам сайт?' Что ты предлагаешь?"
    },
    "answers": {
      "pl": [
        "Od razu opisujesz wszystkie zalety strony internetowej i przechodzisz do ceny",
        "Pytasz, czy te polubienia realnie przekładają się na rezerwacje stolika i zapytania, zanim cokolwiek zaproponujesz",
        "Mówisz, że Facebook jest bezużyteczny i trzeba go zamienić na stronę"
      ],
      "ru": [
        "Сразу перечисляешь все плюсы сайта и переходишь к цене",
        "Спрашиваешь, реально ли эти лайки превращаются в бронирования столика и заявки, прежде чем что-либо предлагать",
        "Говоришь, что Facebook бесполезен и его нужно заменить сайтом"
      ]
    },
    "correct": 1,
    "explain": {
      "pl": "Zanim zaproponujesz konkretną usługę, trzeba sprawdzić, czy obecny kanał faktycznie generuje kontakt z klientami — bez tego każda propozycja jest zgadywaniem. Krytykowanie Facebooka albo od razu cena to pomijanie diagnozy.",
      "ru": "Прежде чем предлагать конкретную услугу, нужно проверить, приносит ли текущий канал реальные обращения клиентов — без этого любое предложение будет угадыванием. Критика Facebook или сразу названная цена — это пропуск диагностики."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Rozmawiasz z managerką gabinetu stomatologicznego. Mówi: 'Płacimy co miesiąc za Google Ads, ale nie mam pojęcia, czy to w ogóle działa.' Co proponujesz?",
      "ru": "Ты разговариваешь с менеджером стоматологической клиники. Она говорит: 'Мы каждый месяц платим за Google Ads, но понятия не имею, работает ли это вообще.' Что ты предлагаешь?"
    },
    "answers": {
      "pl": [
        "Zaproponować od razu podwojenie budżetu na reklamę",
        "Zaproponować krótką rozmowę o wdrożeniu analityki, żeby zobaczyć, co faktycznie przynosi zapytania",
        "Powiedzieć, że reklama na pewno działa i nie ma się czym martwić"
      ],
      "ru": [
        "Сразу предложить удвоить рекламный бюджет",
        "Предложить короткий разговор о внедрении аналитики, чтобы увидеть, что реально приносит заявки",
        "Сказать, что реклама точно работает и не о чем беспокоиться"
      ]
    },
    "correct": 1,
    "explain": {
      "pl": "Bez danych nikt nie wie, czy reklama działa — najpierw trzeba to zmierzyć, a dopiero potem decydować o budżecie czy zmianie kampanii. Zwiększanie budżetu na ślepo albo uspokajanie bez dowodów to działanie bez diagnozy.",
      "ru": "Без данных никто не знает, работает ли реклама — сначала нужно это измерить, и только потом решать о бюджете или смене кампании. Слепое увеличение бюджета или успокаивание без доказательств — это действие без диагностики."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Właściciel firmy budowlanej mówi: 'Codziennie ktoś dzwoni i pyta ile będzie kosztować remont łazienki, a ja za każdym razem tracę pół godziny na tłumaczenie.' Co proponujesz?",
      "ru": "Владелец строительной компании говорит: 'Каждый день кто-то звонит и спрашивает, сколько будет стоить ремонт ванной, а я каждый раз трачу полчаса на объяснения.' Что ты предлагаешь?"
    },
    "answers": {
      "pl": [
        "Kalkulator wyceny na stronie, gdzie klient sam wprowadzi podstawowe dane i zostawi kontakt",
        "Sklep internetowy z gotowym cennikiem usług budowlanych",
        "Kampanię TikTok Ads pokazującą realizacje wideo"
      ],
      "ru": [
        "Калькулятор расчёта стоимости на сайте, где клиент сам введёт основные данные и оставит контакт",
        "Интернет-магазин с готовым прайсом на строительные услуги",
        "Кампанию TikTok Ads с видео реализованных проектов"
      ]
    },
    "correct": 0,
    "explain": {
      "pl": "To dokładnie sytuacja, w której kalkulator ofert rozwiązuje realny, powtarzalny problem — klient szybko dostaje orientacyjną wycenę, a firma nie traci czasu na te same pytania. Sklep internetowy i TikTok Ads nie adresują problemu z powtarzalnymi pytaniami o cenę.",
      "ru": "Это именно та ситуация, где калькулятор предложений решает реальную, повторяющуюся проблему — клиент быстро получает ориентировочную цену, а компания не теряет время на одни и те же вопросы. Интернет-магазин и TikTok Ads не решают проблему повторяющихся вопросов о цене."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Właścicielka salonu kosmetycznego mówi: 'Ludzie dzwonią, ja zapisuję w zeszycie, ktoś się nie zjawia, ktoś dzwoni w tym samym czasie co inny klient — jest chaos.' Co proponujesz?",
      "ru": "Владелица косметического салона говорит: 'Люди звонят, я записываю в тетрадь, кто-то не приходит, кто-то звонит в то же время, что и другой клиент — полный хаос.' Что ты предлагаешь?"
    },
    "answers": {
      "pl": [
        "System rezerwacji online z potwierdzeniami i przypomnieniami",
        "Dashboard pokazujący liczby sprzedaży i marketingu",
        "Panel admina do zarządzania treścią strony"
      ],
      "ru": [
        "Систему онлайн-записи с подтверждениями и напоминаниями",
        "Дашборд с цифрами продаж и маркетинга",
        "Панель админа для управления контентом сайта"
      ]
    },
    "correct": 0,
    "explain": {
      "pl": "Opisany problem to klasyczny przypadek na system rezerwacji — porządkuje kalendarz, ogranicza nieobecności i zdejmuje z telefonu ciężar zapisów. Dashboard i panel admina rozwiązują inne problemy (widoczność danych, zarządzanie treścią), nie chaos w zapisach.",
      "ru": "Описанная проблема — классический случай для системы бронирования: она упорядочивает календарь, снижает число неявок и снимает с телефона нагрузку по записи. Дашборд и панель админа решают другие задачи (видимость данных, управление контентом), а не хаос в записи."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Rozmawiasz z partnerem kancelarii prawnej. Mówi: 'Słyszałem, że ludzie teraz pytają ChatGPT, kogo polecić, a nie tylko Google. Czy da się coś z tym zrobić?' Co proponujesz?",
      "ru": "Ты разговариваешь с партнёром юридической фирмы. Он говорит: 'Слышал, что люди теперь спрашивают ChatGPT, кого порекомендовать, а не только Google. Можно с этим что-то сделать?' Что ты предлагаешь?"
    },
    "answers": {
      "pl": [
        "Obiecujesz, że po współpracy kancelaria zawsze pojawi się w odpowiedzi AI",
        "Proponujesz krótką rozmowę o tym, jak dziś opisana jest ich ekspertyza w sieci, bez obietnicy konkretnego miejsca w odpowiedziach AI",
        "Mówisz, że to nie ma znaczenia i lepiej skupić się tylko na Google Ads"
      ],
      "ru": [
        "Обещаешь, что после сотрудничества фирма всегда будет появляться в ответах AI",
        "Предлагаешь короткий разговор о том, как сегодня описана их экспертиза в сети, без обещания конкретного места в ответах AI",
        "Говоришь, что это не имеет значения и лучше сосредоточиться только на Google Ads"
      ]
    },
    "correct": 1,
    "explain": {
      "pl": "GEO / AI visibility to realny temat dla firm eksperckich, ale nigdy nie obiecujesz konkretnego miejsca w odpowiedzi AI — to zależy od wielu czynników. Diagnoza tego, jak firma jest dziś opisana, jest właściwym pierwszym krokiem. Ignorowanie tematu też jest błędem, bo klient sam o to pyta.",
      "ru": "GEO / AI visibility — реальная тема для экспертных компаний, но никогда нельзя обещать конкретное место в ответе AI — это зависит от множества факторов. Диагностика того, как компания описана сегодня, — правильный первый шаг. Игнорировать тему тоже ошибка, ведь клиент сам об этом спрашивает."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Właściciel siłowni mówi: 'Próbowaliśmy reklamy na Facebooku, zapłaciliśmy, nic z tego nie wyszło, więcej w to nie wchodzę.' Co robisz?",
      "ru": "Владелец тренажёрного зала говорит: 'Мы пробовали рекламу на Facebook, заплатили, ничего не вышло, больше в это не полезу.' Что ты делаешь?"
    },
    "answers": {
      "pl": [
        "Pytasz, co dokładnie robiono — jakie grupy odbiorców, jakie kreacje, gdzie prowadziła reklama — zanim cokolwiek zaproponujesz",
        "Zapewniasz, że u was na pewno zadziała, bo macie lepszych specjalistów",
        "Od razu rezygnujesz z tematu reklamy i przechodzisz do innej usługi"
      ],
      "ru": [
        "Спрашиваешь, что именно делалось — какие аудитории, какие креативы, куда вела реклама — прежде чем что-либо предлагать",
        "Уверяешь, что у вас точно сработает, потому что у вас специалисты лучше",
        "Сразу отказываешься от темы рекламы и переходишь к другой услуге"
      ]
    },
    "correct": 0,
    "explain": {
      "pl": "Za stwierdzeniem 'nie zadziałało' zawsze stoi konkretna przyczyna — zły target, słaba kreacja, brak lądowania na dobrą stronę. Bez zrozumienia co się stało, nowa obietnica sukcesu jest pustym gwarantowaniem wyniku. Całkowite porzucenie tematu też jest błędem — może chodzić o coś naprawialnego.",
      "ru": "За фразой 'не сработало' всегда стоит конкретная причина — неверная аудитория, слабый креатив, плохая посадочная страница. Без понимания, что произошло, новое обещание успеха — это пустая гарантия результата. Полный отказ от темы тоже ошибка — проблема может быть решаемой."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Biuro nieruchomości mówi: 'Mamy sporo wejść na stronę z reklamy, ale prawie nikt nie wysyła zapytania o ofertę.' Co proponujesz najpierw?",
      "ru": "Агентство недвижимости говорит: 'У нас довольно много переходов на сайт из рекламы, но почти никто не отправляет заявку по объекту.' Что ты предлагаешь в первую очередь?"
    },
    "answers": {
      "pl": [
        "Audyt strony pod kątem tego, dlaczego odwiedzający nie zostawiają kontaktu (CTA, formularze, struktura)",
        "Kampanię lejków sprzedażowych od zera, bo obecny system nie działa",
        "Nową stronę internetową, bo obecna na pewno jest zła"
      ],
      "ru": [
        "Аудит сайта на предмет того, почему посетители не оставляют контакт (CTA, формы, структура)",
        "Воронку продаж с нуля, потому что нынешняя система не работает",
        "Новый сайт, потому что нынешний наверняка плохой"
      ]
    },
    "correct": 0,
    "explain": {
      "pl": "Ruch już jest, problem jest w konwersji tego ruchu na kontakt — to klasyczny przypadek pod optymalizację konwersji (CRO), nie pod budowę nowej strony czy całego lejka od podstaw. Trzeba najpierw zdiagnozować, co dokładnie blokuje zapytania.",
      "ru": "Трафик уже есть, проблема в конвертации этого трафика в контакт — это классический случай для оптимизации конверсии (CRO), а не для создания нового сайта или целой воронки с нуля. Сначала нужно диагностировать, что именно блокирует заявки."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Warsztat samochodowy nie ma żadnej strony, klienci przychodzą tylko z polecenia. Właściciel mówi: 'Słyszałem o takich panelach do zarządzania firmą i dashboardach, chcę to od razu.' Co proponujesz?",
      "ru": "У автомастерской вообще нет сайта, клиенты приходят только по рекомендации. Владелец говорит: 'Слышал про такие панели для управления компанией и дашборды, хочу это сразу.' Что ты предлагаешь?"
    },
    "answers": {
      "pl": [
        "Od razu wyceniasz i sprzedajesz panel admina z dashboardem",
        "Tłumaczysz, że warto zacząć od podstawy — strony i widoczności — a panel/dashboard ma sens, gdy jest już więcej danych i procesów do ogarnięcia",
        "Mówisz, że te narzędzia nie są dla warsztatów samochodowych"
      ],
      "ru": [
        "Сразу оцениваешь и продаёшь панель админа с дашбордом",
        "Объясняешь, что стоит начать с основы — сайта и видимости — а панель/дашборд имеет смысл, когда уже есть больше данных и процессов для управления",
        "Говоришь, что эти инструменты не подходят для автомастерских"
      ]
    },
    "correct": 1,
    "explain": {
      "pl": "Panele i dashboardy mają sens, gdy firma ma już dane i procesy do zarządzania — u firmy bez strony i regularnego ruchu online to przedwczesne, lepiej zacząć od fundamentu. Sprzedawanie zaawansowanego narzędzia bez podstawy to przerost formy nad treścią, a całkowite odrzucenie tematu ignoruje realne zainteresowanie klienta.",
      "ru": "Панели и дашборды имеют смысл, когда у компании уже есть данные и процессы для управления — у компании без сайта и регулярного онлайн-трафика это преждевременно, лучше начать с фундамента. Продажа сложного инструмента без основы — это перекос, а полный отказ от темы игнорирует реальный интерес клиента."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Właściciel sklepu internetowego mówi: 'Chcę remarketing, słyszałem że to działa świetnie.' Podczas rozmowy okazuje się, że nie ma podpiętej żadnej analityki ani pikseli. Co proponujesz?",
      "ru": "Владелец интернет-магазина говорит: 'Хочу ремаркетинг, слышал, что это отлично работает.' В разговоре выясняется, что у него не подключена никакая аналитика или пиксели. Что ты предлагаешь?"
    },
    "answers": {
      "pl": [
        "Zgadzasz się i od razu ustalasz budżet na remarketing",
        "Tłumaczysz, że najpierw trzeba wdrożyć analitykę i piksele, bo bez tego remarketing nie ma z czego korzystać",
        "Mówisz, że remarketing bez analityki i tak zadziała tak samo dobrze"
      ],
      "ru": [
        "Соглашаешься и сразу обсуждаешь бюджет на ремаркетинг",
        "Объясняешь, что сначала нужно внедрить аналитику и пиксели, потому что без этого ремаркетингу не с чем работать",
        "Говоришь, что ремаркетинг и без аналитики сработает точно так же хорошо"
      ]
    },
    "correct": 1,
    "explain": {
      "pl": "Remarketing wymaga danych o odwiedzających — bez analityki i pikseli nie ma kogo 'ścigać' reklamą. Sprzedanie remarketingu bez tej podstawy to sprzedaż usługi, która fizycznie nie zadziała.",
      "ru": "Ремаркетинг требует данных о посетителях — без аналитики и пикселей просто некого 'догонять' рекламой. Продажа ремаркетинга без этой основы — это продажа услуги, которая физически не сработает."
    }
  },
  {
    "type": "case",
    "question": {
      "pl": "Dzwonisz do producenta B2B. W ciągu minuty słyszysz: 'Nie mam czasu', potem 'i tak mamy już stronę', a na koniec 'to pewnie drogie'. Co robisz?",
      "ru": "Ты звонишь производителю в сегменте B2B. В течение минуты слышишь: 'У меня нет времени', потом 'у нас и так уже есть сайт', а под конец 'это, наверное, дорого'. Что ты делаешь?"
    },
    "answers": {
      "pl": [
        "Odpuszczasz rozmowę, bo trzy zastrzeżenia z rzędu oznaczają brak szans",
        "Spokojnie odnosisz się do każdego zastrzeżenia po kolei i starasz się ustalić krótki, konkretny termin rozmowy, zamiast przekonywać na siłę teraz",
        "Odpowiadasz na wszystko naraz, podając cenę, żeby zamknąć temat"
      ],
      "ru": [
        "Сворачиваешь разговор, потому что три возражения подряд означают отсутствие шансов",
        "Спокойно отвечаешь на каждое возражение по очереди и стараешься договориться о коротком конкретном времени для разговора, вместо того чтобы убеждать прямо сейчас",
        "Отвечаешь на всё сразу, называя цену, чтобы закрыть тему"
      ]
    },
    "correct": 1,
    "explain": {
      "pl": "Seria zastrzeżeń pod rząd to często odruch obronny, a nie ostateczna odmowa — trzeba spokojnie, krótko odnieść się do każdego i dążyć do konkretnego, małego kroku (np. 5 minut w innym terminie), a nie do zamknięcia sprzedaży teraz. Poddanie się po pierwszych sprzeciwach albo rzucenie ceny bez diagnozy to błędy.",
      "ru": "Серия возражений подряд часто является защитной реакцией, а не окончательным отказом — нужно спокойно и коротко ответить на каждое и стремиться к конкретному маленькому шагу (например, 5 минут в другое время), а не к закрытию продажи прямо сейчас. Сдаться после первых возражений или назвать цену без диагностики — ошибки."
    }
  },
  {
    "type": "open",
    "question": {
      "pl": "Dzwonisz do szkoły językowej. Mają całkiem ładną stronę, ale nie ma na niej żadnej możliwości zapisania się na lekcję próbną online — trzeba dzwonić albo pisać maila. Napisz dokładnie, jakie zdanie otwierające powiedziałbyś na start rozmowy, żeby zaczepić o ten konkretny problem.",
      "ru": "Ты звонишь в языковую школу. У них довольно приятный сайт, но на нём нет возможности записаться на пробный урок онлайн — нужно звонить или писать письмо. Напиши точную фразу, с которой ты начал бы разговор, зацепившись именно за эту проблему."
    },
    "gradingNotes": {
      "pl": "Dobra odpowiedź to krótkie, naturalnie brzmiące zdanie (1-3 zdania), które: (1) pokazuje, że dzwoniący faktycznie widział stronę szkoły (konkret, nie ogólnik), (2) nazywa realny problem — brak prostego zapisu na lekcję próbną online, (3) nie obiecuje żadnej konkretnej liczby zapisów ani wyniku, (4) nie próbuje sprzedać usługi w pierwszym zdaniu, tylko otwiera temat i zmierza do krótkiej rozmowy/spotkania. Odpowiedź NIE powinna zawierać ceny, słowa 'gwarantuję' ani obietnicy konkretnych efektów. Plusem jest ton rozmówcy, nie czytanie z kartki.",
      "ru": "Хороший ответ — короткая, естественно звучащая фраза (1-3 предложения), которая: (1) показывает, что звонящий реально смотрел сайт школы (конкретика, а не общие слова), (2) называет реальную проблему — отсутствие простой записи на пробный урок онлайн, (3) не обещает никакого конкретного числа записей или результата, (4) не пытается продать услугу в первом же предложении, а открывает тему и ведёт к короткому разговору/встрече. В ответе НЕ должно быть цены, слова 'гарантирую' или обещания конкретного эффекта. Плюс — живой тон, а не заученный текст."
    }
  },
  {
    "type": "open",
    "question": {
      "pl": "Rozmawiasz z właścicielką firmy sprzątającej biura. Pytasz o widoczność w wyszukiwarkach i AI, a ona mówi: 'GEO / AI visibility? Nie rozumiem w ogóle o co chodzi, proszę mówić po ludzku.' Napisz dokładnie, jak wytłumaczyłbyś tę usługę prostym językiem, bez żargonu.",
      "ru": "Ты разговариваешь с владелицей клининговой компании, убирающей офисы. Спрашиваешь про видимость в поиске и AI, а она говорит: 'GEO / AI visibility? Вообще не понимаю, о чём речь, объясните по-человечески.' Напиши точно, как бы ты объяснил эту услугу простым языком, без жаргона."
    },
    "gradingNotes": {
      "pl": "Dobra odpowiedź tłumaczy usługę bez żargonu technicznego (bez słów typu 'encje', 'dane strukturalne', 'schema markup') — np. odwołuje się do tego, że ludzie coraz częściej pytają Google albo ChatGPT 'kto sprząta biura w [mieście]' i sprawdza, czy firma w ogóle pojawia się w takich odpowiedziach oraz czy jest opisana spójnie w sieci. Musi tłumaczyć to w kategoriach korzyści biznesowej (więcej szans, że firma zostanie znaleziona/polecona), a NIE obiecywać, że firma na pewno pojawi się w odpowiedzi AI ani podawać żadnej liczby/pozycji. Odpowiedź powinna też sygnalizować, że warto to zbadać/sprawdzić (diagnoza), a nie od razu sprzedawać usługę. Dyskwalifikuje: użycie żargonu bez wyjaśnienia, obietnica konkretnego efektu, słowo 'gwarantuję'.",
      "ru": "Хороший ответ объясняет услугу без технического жаргона (без слов вроде 'сущности', 'структурированные данные', 'schema markup') — например, ссылается на то, что люди всё чаще спрашивают Google или ChatGPT 'кто убирает офисы в [городе]', и проверяет, появляется ли компания вообще в таких ответах и описана ли она последовательно в сети. Должен объяснять это в категориях бизнес-выгоды (больше шансов, что компанию найдут/порекомендуют), а НЕ обещать, что компания точно появится в ответе AI, и не называть никаких цифр/позиций. Ответ также должен намекать, что стоит это исследовать/проверить (диагностика), а не сразу продавать услугу. Дисквалифицирует: использование жаргона без объяснения, обещание конкретного эффекта, слово 'гарантирую'."
    }
  },
  {
    "type": "open",
    "question": {
      "pl": "Dzwonisz do gabinetu stomatologicznego. Recepcjonistka mówi kolejno: 'Nie mam teraz czasu', potem gdy próbujesz kontynuować: 'Mieliśmy już jedną agencję i było fatalnie', a na końcu: 'To pewnie i tak drogie.' Napisz dokładnie, co powiedziałbyś, odnosząc się po kolei do wszystkich trzech zastrzeżeń, żeby zakończyć rozmowę konkretnym następnym krokiem.",
      "ru": "Ты звонишь в стоматологическую клинику. Администратор говорит подряд: 'У меня сейчас нет времени', потом, когда ты пытаешься продолжить: 'У нас уже было агентство, и это было ужасно', а под конец: 'Это, наверное, всё равно дорого.' Напиши точно, что бы ты сказал, ответив по очереди на все три возражения, чтобы завершить разговор конкретным следующим шагом."
    },
    "gradingNotes": {
      "pl": "Dobra odpowiedź odnosi się do każdego z trzech zastrzeżeń osobno i spokojnie, bez sprzeczania się i bez ignorowania któregokolwiek: (1) na brak czasu — proponuje krótszą formę kontaktu lub konkretny termin oddzwonienia, (2) na złe doświadczenie z inną agencją — okazuje zrozumienie/empatię, nie krytykuje wprost konkurencji, pyta ewentualnie co konkretnie nie zadziałało, (3) na 'pewnie drogie' — nie podaje konkretnej ceny bez diagnozy, tłumaczy że cena zależy od zakresu i że dlatego warto najpierw krótko porozmawiać. Całość musi kończyć się propozycją konkretnego, małego następnego kroku (np. konkretny dzień/godzina krótkiej rozmowy), a nie próbą zamknięcia sprzedaży na miejscu. Dyskwalifikuje: pominięcie któregoś z trzech zastrzeżeń, podanie sztywnej ceny, obietnica konkretnego wyniku, ton konfrontacyjny lub naciskający.",
      "ru": "Хороший ответ отвечает на каждое из трёх возражений отдельно и спокойно, без споров и без игнорирования любого из них: (1) на нехватку времени — предлагает более короткий формат контакта или конкретное время перезвона, (2) на плохой опыт с другим агентством — проявляет понимание/эмпатию, не критикует прямо конкурентов, возможно спрашивает, что конкретно не сработало, (3) на 'наверное дорого' — не называет конкретную цену без диагностики, объясняет, что цена зависит от объёма и поэтому стоит сначала коротко поговорить. Весь ответ должен заканчиваться предложением конкретного маленького следующего шага (например, конкретный день/время короткого разговора), а не попыткой закрыть продажу на месте. Дисквалифицирует: пропуск любого из трёх возражений, названная жёсткая цена, обещание конкретного результата, конфронтационный или давящий тон."
    }
  },
  {
    "type": "open",
    "question": {
      "pl": "Właściciel restauracji mówi: 'Mój syn robi nam social media za darmo, więc chyba nic nie potrzebujemy.' Napisz dokładnie, co byś odpowiedział, żeby nie zbagatelizować pracy syna, a jednocześnie sprawdzić, czy to naprawdę rozwiązuje problem firmy.",
      "ru": "Владелец ресторана говорит: 'Мой сын бесплатно ведёт нам соцсети, так что нам, наверное, ничего не нужно.' Напиши точно, что бы ты ответил, чтобы не обесценить работу сына и при этом проверить, действительно ли это решает проблему бизнеса."
    },
    "gradingNotes": {
      "pl": "Dobra odpowiedź zaczyna się od pozytywnego, szczerego docenienia (nie ironicznego) tego, że ktoś się tym zajmuje — nie krytykuje syna ani jego pracy. Następnie zadaje konkretne pytanie diagnostyczne, np. czy te działania w social mediach realnie przekładają się na rezerwacje/zapytania/nowych klientów, a nie tylko na polubienia. Pozycjonuje ewentualną usługę jako uzupełnienie, nie zamiennik pracy syna. Nie zawiera gotowej oferty ani ceny na tym etapie, nie obiecuje konkretnych liczb. Dyskwalifikuje: krytyka/deprecjonowanie syna lub jego pracy, natychmiastowe wciskanie usługi bez pytania diagnostycznego, obietnica konkretnego wyniku.",
      "ru": "Хороший ответ начинается с искреннего, положительного признания того, что кто-то этим занимается (без иронии) — не критикует сына или его работу. Затем задаёт конкретный диагностический вопрос, например, реально ли эти действия в соцсетях превращаются в бронирования/заявки/новых клиентов, а не только в лайки. Позиционирует возможную услугу как дополнение, а не замену работы сына. Не содержит готового предложения или цены на этом этапе, не обещает конкретных цифр. Дисквалифицирует: критика/обесценивание сына или его работы, немедленное впаривание услуги без диагностического вопроса, обещание конкретного результата."
    }
  },
  {
    "type": "open",
    "question": {
      "pl": "Właściciel siłowni pyta: 'Co to w ogóle jest ten remarketing, o którym mówicie?' Napisz dokładnie, jak wytłumaczyłbyś to prostym językiem, w 2-4 zdaniach, tak żeby zrozumiał to ktoś bez żadnej wiedzy marketingowej.",
      "ru": "Владелец тренажёрного зала спрашивает: 'А что такое вообще этот ремаркетинг, о котором вы говорите?' Напиши точно, как бы ты объяснил это простым языком, в 2-4 предложениях, чтобы понял человек без какого-либо маркетингового опыта."
    },
    "gradingNotes": {
      "pl": "Dobra odpowiedź tłumaczy ideę bez żargonu (bez słów 'piksel', 'retargeting' bez wyjaśnienia) — np. że to pokazywanie reklamy osobom, które już odwiedziły stronę siłowni, ale nie zapisały się na karnet, żeby przypomnieć im o ofercie. Powinna zaznaczyć, że warunkiem jest posiadanie już jakiegoś ruchu na stronie (usługa nie ma sensu dla kogoś bez odwiedzin). Nie może zawierać obietnicy konkretnej liczby nowych klientów ani procentu wzrostu sprzedaży, nie może używać słowa 'gwarantuję'. Dyskwalifikuje: żargon bez wyjaśnienia, konkretna liczba/procent efektu, pominięcie warunku posiadania ruchu.",
      "ru": "Хороший ответ объясняет идею без жаргона (без слов 'пиксель', 'ретаргетинг' без пояснения) — например, что это показ рекламы людям, которые уже заходили на сайт зала, но не купили абонемент, чтобы напомнить им о предложении. Должен упомянуть, что условие — уже иметь какой-то трафик на сайте (услуга бессмысленна для того, у кого нет посетителей). Не должен содержать обещание конкретного числа новых клиентов или процента роста продаж, не должен использовать слово 'гарантирую'. Дисквалифицирует: жаргон без объяснения, конкретная цифра/процент эффекта, отсутствие упоминания условия наличия трафика."
    }
  },
  {
    "type": "open",
    "question": {
      "pl": "Po kilku pytaniach diagnostycznych z biurem nieruchomości wiesz już, że mają ruch na stronie, ale słabą konwersję. Klient pyta wprost: 'Dobra, to ile to będzie kosztować?' Napisz dokładnie, co odpowiadasz, żeby nie rzucić przypadkowej liczby, a jednocześnie nie zbyć klienta bez odpowiedzi.",
      "ru": "После нескольких диагностических вопросов агентству недвижимости ты уже знаешь, что у них есть трафик на сайте, но слабая конверсия. Клиент спрашивает прямо: 'Хорошо, а сколько это будет стоить?' Напиши точно, что ты отвечаешь, чтобы не назвать случайную цифру, но и не оставить клиента без ответа."
    },
    "gradingNotes": {
      "pl": "Dobra odpowiedź nie podaje jednej sztywnej, ostatecznej kwoty bez ustalonego zakresu prac — może wspomnieć orientacyjny przedział/od-ceny jako punkt odniesienia (np. 'to zależy od zakresu, ale mówimy o widełkach od X'), ale kładzie nacisk na to, że dokładna wycena wymaga krótkiej rozmowy/spotkania, żeby ustalić zakres. Musi kończyć się propozycją konkretnego kroku — spotkania lub krótkiej konsultacji z terminem. Nie może zawierać obietnicy konkretnego wzrostu liczby zapytań ani wyniku. Dyskwalifikuje: podanie jednej twardej ceny bez zastrzeżenia zależności od zakresu, całkowite unikanie tematu ceny bez żadnej odpowiedzi, obietnica konkretnego efektu.",
      "ru": "Хороший ответ не называет одну жёсткую, окончательную сумму без определённого объёма работ — может упомянуть ориентировочный диапазон/цену 'от' как точку отсчёта (например, 'зависит от объёма, но речь о диапазоне от X'), но делает акцент на том, что точная оценка требует короткого разговора/встречи для определения объёма. Должен заканчиваться предложением конкретного шага — встречи или короткой консультации с датой. Не должен содержать обещание конкретного роста числа заявок или результата. Дисквалифицирует: названная одна жёсткая цена без оговорки о зависимости от объёма, полное уклонение от темы цены без какого-либо ответа, обещание конкретного эффекта."
    }
  },
  {
    "type": "open",
    "question": {
      "pl": "Producent B2B mówi: 'Konkurencja wdrożyła sobie jakiś lejek sprzedażowy, też chcemy coś takiego.' Firma nie ma jeszcze żadnej porządnej strony internetowej. Napisz dokładnie, co byś odpowiedział, żeby nie zniechęcić klienta, ale też nie sprzedać lejka na siłę, skoro nie ma jeszcze podstawy.",
      "ru": "B2B-производитель говорит: 'Конкуренты внедрили себе какую-то воронку продаж, мы тоже хотим что-то такое.' У компании ещё нет нормального сайта. Напиши точно, что бы ты ответил, чтобы не оттолкнуть клиента, но и не продать воронку через силу, раз основы ещё нет."
    },
    "gradingNotes": {
      "pl": "Dobra odpowiedź docenia zainteresowanie klienta tematem (nie ignoruje go), ale wyjaśnia, że lejek sprzedażowy spina w jedną całość elementy, których u tej firmy jeszcze nie ma (np. dobra strona/miejsce docelowe) — więc bez tego fundamentu lejek nie będzie działał. Proponuje jako pierwszy krok coś bazowego (np. stronę internetową), zostawiając temat lejka jako naturalny kolejny etap w przyszłości. Nie może po prostu sprzedać lejka, bo klient o niego poprosił, ani całkowicie zignorować/odrzucić jego zainteresowania. Nie zawiera obietnicy konkretnego wyniku ani ceny bez diagnozy. Dyskwalifikuje: sprzedanie lejka mimo braku podstawy, zbycie klienta bez wyjaśnienia, obietnica konkretnego efektu.",
      "ru": "Хороший ответ ценит интерес клиента к теме (не игнорирует его), но объясняет, что воронка продаж связывает воедино элементы, которых у этой компании ещё нет (например, хороший сайт/целевая страница) — поэтому без этого фундамента воронка не будет работать. Предлагает в качестве первого шага что-то базовое (например, сайт), оставляя тему воронки как естественный следующий этап в будущем. Не должен просто продать воронку только потому, что клиент её попросил, и не должен полностью проигнорировать/отвергнуть его интерес. Не содержит обещания конкретного результата или цены без диагностики. Дисквалифицирует: продажа воронки при отсутствии основы, отмахивание от клиента без объяснения, обещание конкретного эффекта."
    }
  }
];
