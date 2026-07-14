export const SUPPORTED_LANGUAGES = Object.freeze(['pl', 'en', 'ru']);

const COPY = {
  pl: {
    meta: { title: 'Aura Global — strony i systemy digital, które prowadzą do zapytania', description: 'Strategia, design, development, marketing i automatyzacje AI. Zaczynamy od realnego zadania firmy.' },
    nav: { portfolio: 'Projekty', services: 'Usługi', process: 'Proces', pricing: 'Pakiety', cta: 'Bezpłatny rozbiór', open: 'Otwórz menu', close: 'Zamknij menu' },
    hero: { eyebrow: 'Aura Global / digital studio', title: 'Strony i systemy digital, które zamieniają uwagę w zapytania.', subtitle: 'Strategia, design, development, marketing i automatyzacje AI. Najpierw rozumiemy problem, potem składamy rozwiązanie wokół realnej decyzji klienta.', primary: 'Otrzymaj bezpłatny rozbiór', secondary: 'Zobacz projekty', object: 'Aura object / move the cursor', facts: ['opublikowanych stron w showcase', 'kierunki pracy', 'języki obsługi'] },
    portfolio: { eyebrow: 'Portfolio', title: 'Poziom widać lepiej w pracy niż w obietnicach.', intro: 'Jedna przewijana scena zamiast dwóch podobnych sekcji. Każdy projekt można otworzyć, obejrzeć i przejść do działającej strony.', drag: 'Przeciągnij lub użyj strzałek', quick: 'Szybki podgląd', case: 'Zobacz case', site: 'Otwórz stronę', cta: 'Masz podobne wyzwanie? Pokaż nam punkt wyjścia — dobierzemy sensowny format pracy.', ctaButton: 'Omów podobny projekt', task: 'Zadanie', approach: 'Podejście', work: 'Zakres', format: 'Technologia i format', gallery: 'Materiały', similar: 'Chcę podobne rozwiązanie', checked: 'Link sprawdzony' },
    trust: { eyebrow: 'Jak pracujemy', statement: 'Nie dokładamy kolejnych ekranów. <mark>Porządkujemy decyzje</mark>, które mają doprowadzić klienta do kontaktu.', items: [['01', 'Najpierw problem', 'Rozmowę zaczynamy od celu, obecnego procesu i ograniczeń.'], ['02', 'Jeden zespół, jeden kontekst', 'Strategia, design i wdrożenie nie rozjeżdżają się między wykonawcami.'], ['03', 'Działający następny krok', 'Każdy ważny ekran prowadzi do konkretnego działania: kontaktu, rezerwacji lub zakupu.']] },
    services: { eyebrow: 'Usługi', title: 'Wybierz zadanie. Pokażemy, jakie rozwiązanie ma sens.', intro: 'Katalog obejmuje strony, marketing, AI i systemy operacyjne. Każda usługa ma zakres, orientacyjny czas, FAQ i ścieżkę do rozmowy.', details: 'Szczegóły usługi', cta: 'Nie wiesz, od czego zacząć? Zostaw kontekst — wrócimy z konkretnym kolejnym krokiem.', ctaButton: 'Dopasuj rozwiązanie' },
    visibility: { eyebrow: 'SEO / GEO / AI visibility', title: 'Być widocznym to nie znaczy publikować więcej.', intro: 'Porządkujemy ofertę, strukturę i dowody tak, aby marka była łatwiejsza do znalezienia oraz zrozumienia.', columns: [['Problem', 'Strona istnieje, ale wyszukiwarka i AI nie składają jej oferty w jedną, czytelną odpowiedź.'], ['Co robimy', 'Audytujemy technikę i content, mapujemy tematy, encje oraz źródła, a potem wdrażamy uzgodnione priorytety.'], ['Co dostajesz', 'Plan widoczności, uporządkowaną strukturę i bazę do dalszego monitoringu — bez obiecywania pozycji ani wzmianek.']], example: 'Przykład formatu: architektura produktu dla Polar Signals, Langbase i Exa AI.', cta: 'Sprawdź widoczność firmy' },
    process: { eyebrow: 'Proces', title: 'Od pierwszego rozbioru do startu — z jasną decyzją na każdym etapie.', steps: [['01', 'Rozbiór', 'Cel, odbiorca, obecny proces i granice projektu.'], ['02', 'Kierunek', 'Struktura rozwiązania, priorytety i format współpracy.'], ['03', 'Projekt', 'Treść, UX, visual direction i konkretne scenariusze działania.'], ['04', 'Wdrożenie', 'Development, integracje i kontrola jakości na realnych urządzeniach.'], ['05', 'Start i iteracje', 'Publikacja, pomiar oraz kolejne poprawki wtedy, gdy mają uzasadnienie.']] },
    formats: { eyebrow: 'Formaty współpracy', title: 'Nie każdy problem potrzebuje całego systemu od razu.', items: [['01', 'Rozbiór i sprint', 'Dla firmy, która potrzebuje decyzji, struktury i pierwszego działającego kroku.'], ['02', 'Projekt i start', 'Dla nowej strony, produktu albo kampanii z określonym zakresem i terminem.'], ['03', 'Rozwój systemu', 'Dla zespołu, który łączy stronę, marketing, automatyzacje i stałe iteracje.']] },
    packages: { eyebrow: 'Pakiety', title: 'Trzy punkty orientacyjne przed indywidualną wyceną.', intro: 'Pakiet opisuje rezultat i poziom złożoności. Ostateczny zakres potwierdzamy dopiero po rozbiorze zadania.', select: 'Wybierz ten format', note: 'Cena zależy od zakresu, materiałów, integracji i odpowiedzialności po stronie projektu.' },
    proof: { eyebrow: 'Co możesz sprawdzić', title: 'Realne, opublikowane strony, które możesz otworzyć i sprawdzić.', intro: 'Każdy link w portfolio prowadzi do działającego produktu. W case’ach pokazujemy zadanie i rzeczywisty skład wykonanych prac.', rows: [['01', 'Climatech', 'Oferta usług i ścieżka konsultacji'], ['02', 'Langbase', 'Techniczny produkt wyjaśniony przez scenariusze'], ['03', 'all.inn', 'Oferta, lokalizacja i jasny następny krok']] },
    lead: { eyebrow: 'Bezpłatny rozbiór', title: 'Odpowiedz na pięć pytań. Wrócimy z konkretnym następnym krokiem.', body: 'Nie obiecujemy gotowego kosztorysu bez kontekstu. Najpierw sprawdzimy, co warto uruchomić i czego nie ma sensu kupować teraz.', progress: 'Krok', back: 'Wstecz', next: 'Dalej', send: 'Wyślij zgłoszenie', task: ['Co chcesz uruchomić?', 'Możesz zaznaczyć kilka odpowiedzi.', [['website', 'Strona lub landing'], ['marketing', 'Marketing / kampania'], ['visibility', 'Widoczność w Google i AI'], ['automation', 'AI lub automatyzacja'], ['system', 'System wewnętrzny'], ['analysis', 'Najpierw potrzebuję rozbioru']]], goal: ['Jaki ma być główny efekt?', '', [['leads', 'Więcej wartościowych zapytań'], ['sales', 'Prostsza sprzedaż online'], ['clarity', 'Jasna oferta i silniejszy wizerunek'], ['time', 'Mniej ręcznej pracy'], ['other', 'Inny cel']]], context: ['Co działa dziś, a co blokuje?', 'Dodaj link do obecnej strony lub krótko opisz biznes i sytuację.', 'Napisz kilka zdań o firmie, obecnym rozwiązaniu i problemie…'], budget: ['Jaki format lub budżet rozważasz?', '', [['starter', 'Start / pojedynczy problem'], ['growth', 'Growth / strona lub kampania'], ['system', 'System / kilka połączonych elementów'], ['unknown', 'Jeszcze nie wiem']]], contact: ['Jak możemy się odezwać?', 'Telefon lub e-mail wystarczy.'], labels: { name: 'Imię i nazwisko', phone: 'Telefon', email: 'E-mail', message: 'Dodatkowa informacja (opcjonalnie)' }, errors: { task: 'Wybierz przynajmniej jedną potrzebę.', goal: 'Wybierz główny cel.', context: 'Dodaj krótki kontekst, abyśmy mogli przygotować konkretną odpowiedź.', budget: 'Wybierz format lub budżet.', name: 'Podaj imię i nazwisko.', contact: 'Podaj poprawny telefon lub e-mail.', send: 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie albo skontaktuj się bezpośrednio.' }, reassure: 'Zwykle odpowiadamy w ciągu 24 godzin — bez spamu i bez presji.', loading: 'Wysyłamy zgłoszenie…', successTitle: 'Zgłoszenie zostało zapisane.', successBody: 'Dziękujemy. Znamy już podstawowy kontekst i wrócimy z konkretnym następnym krokiem. Jeśli wolisz, możesz napisać lub zadzwonić od razu.', call: 'Zadzwoń', email: 'Napisz e-mail' },
    faq: { eyebrow: 'FAQ', title: 'Krótkie odpowiedzi przed rozmową.', items: [['Czy zaczynacie od designu?', 'Nie. Najpierw ustalamy problem, odbiorcę, ofertę i działanie, do którego ma prowadzić strona.'], ['Czy mogę zacząć od małego zakresu?', 'Tak. Możemy zacząć od rozbioru, landingu, audytu albo jednego automatycznego procesu i rozwijać system później.'], ['Czy podajecie stałą cenę od razu?', 'Dla prostych zakresów możemy podać orientację. Przy większych projektach najpierw potwierdzamy zakres, materiały i integracje.'], ['Czy obsługujecie marketing po starcie?', 'Tak, gdy strona i pomiar są gotowe. Nie proponujemy kampanii, zanim nie ma miejsca, do którego warto kierować ruch.'], ['Czy AI visibility gwarantuje wzmianki w odpowiedziach AI?', 'Nie. Możemy uporządkować techniczne i treściowe podstawy, ale nie kontrolujemy wyników ani odpowiedzi zewnętrznych systemów.'], ['Co dzieje się po wysłaniu formularza?', 'Zgłoszenie trafia do naszego systemu. Analizujemy odpowiedzi i wracamy przez podany kontakt.']] },
    final: { title: 'Powiedz, co trzeba uruchomić. Zaproponujemy plan bez zbędnych usług.', body: 'Jeśli masz już brief, link albo problem z obecnym systemem — zacznij od krótkiego rozbioru.', button: 'Otrzymaj bezpłatny rozbiór' },
    route: { portfolioTitle: 'Wszystkie projekty', portfolioIntro: 'Pełny indeks prac w jednej siatce. Każdy projekt ma osobną stronę, media i link do opublikowanej realizacji.', servicesTitle: 'Katalog usług', servicesIntro: 'Usługi z zakresem, czasem, ceną lub indywidualną wyceną oraz ścieżką do rozmowy.', backPortfolio: 'Portfolio', backServices: 'Usługi', result: 'Rezultat dla biznesu', forWho: 'Dla kogo', includes: 'Co wchodzi', stages: 'Etapy', duration: 'Orientacyjny czas', price: 'Cena', relevant: 'Powiązane projekty', faq: 'FAQ usługi', discuss: 'Omów zadanie', openSite: 'Otwórz opublikowaną stronę', notFound: 'Nie znaleźliśmy tej strony.' },
    common: { project: 'projekt', projects: 'projektów', open: 'Otwórz', close: 'Zamknij', footer: 'Aura Global — digital studio', contact: 'Kontakt', navigation: 'Nawigacja', portfolio: 'Portfolio', services: 'Usługi', brief: 'Bezpłatny rozbiór' }
  },
  en: {},
  ru: {}
};

COPY.en = structuredClone(COPY.pl);
Object.assign(COPY.en, {
  nav: { portfolio: 'Work', services: 'Services', process: 'Process', pricing: 'Packages', cta: 'Free diagnosis', open: 'Open menu', close: 'Close menu' },
  hero: { ...COPY.pl.hero, eyebrow: 'Aura Global / digital studio', title: 'Websites and digital systems that turn attention into enquiries.', subtitle: 'Strategy, design, development, marketing and AI automation. We understand the problem first, then build around the decision a customer has to make.', primary: 'Get a free diagnosis', secondary: 'View projects', object: 'Aura object / move the cursor', facts: ['published websites in showcase', 'work directions', 'service languages'] },
  portfolio: { ...COPY.pl.portfolio, eyebrow: 'Portfolio', title: 'The work proves the level better than a promise.', intro: 'One scrolling showcase instead of two similar sections. Every project opens into media, context and a live website.', drag: 'Drag or use arrows', quick: 'Quick view', case: 'View case', site: 'Open website', cta: 'Have a similar challenge? Show us your starting point and we will suggest a sensible format.', ctaButton: 'Discuss a similar project', task: 'Task', approach: 'Approach', work: 'Scope', format: 'Technology & format', gallery: 'Media', similar: 'I need a similar solution', checked: 'Link checked' },
  trust: { eyebrow: 'How we work', statement: 'We do not add screens for their own sake. <mark>We structure decisions</mark> that lead a customer to contact.', items: [['01', 'Problem first', 'We start with the goal, current process and real constraints.'], ['02', 'One team, one context', 'Strategy, design and implementation stay connected.'], ['03', 'A working next step', 'Every important screen leads to a contact, booking or purchase.']] },
  services: { eyebrow: 'Services', title: 'Choose the task. We will show what solution makes sense.', intro: 'The catalogue covers websites, marketing, AI and operational systems. Every service has scope, estimated timing, FAQ and a route to a conversation.', details: 'Service details', cta: 'Not sure where to start? Leave the context and we will return with a concrete next step.', ctaButton: 'Match a solution' },
  visibility: { eyebrow: 'SEO / GEO / AI visibility', title: 'Being visible does not mean publishing more.', intro: 'We organise the offer, structure and evidence so a company is easier to find and understand.', columns: [['The problem', 'The website exists, but search and AI systems do not assemble its offer into one clear answer.'], ['What we do', 'We audit technical and content signals, map topics, entities and sources, then implement the agreed priorities.'], ['What you receive', 'A visibility plan, structured foundations and a baseline for monitoring — without promising rankings or mentions.']], example: 'Format examples: product architecture for Polar Signals, Langbase and Exa AI.', cta: 'Check company visibility' },
  process: { eyebrow: 'Process', title: 'From the first diagnosis to launch — with a clear decision at every stage.', steps: [['01', 'Diagnosis', 'Goal, audience, current process and project boundaries.'], ['02', 'Direction', 'Solution structure, priorities and collaboration format.'], ['03', 'Design', 'Copy, UX, visual direction and concrete action scenarios.'], ['04', 'Implementation', 'Development, integrations and QA on real devices.'], ['05', 'Launch and iterations', 'Publishing, measurement and improvements when there is a reason for them.']] },
  formats: { eyebrow: 'Ways to work together', title: 'Not every problem needs a whole system on day one.', items: [['01', 'Diagnosis and sprint', 'For a company that needs a decision, structure and first working step.'], ['02', 'Project and launch', 'For a website, product or campaign with a defined scope and timeline.'], ['03', 'System development', 'For a team connecting website, marketing, automations and ongoing iterations.']] },
  packages: { eyebrow: 'Packages', title: 'Three reference points before a custom quote.', intro: 'A package describes the outcome and complexity level. The final scope is confirmed only after the diagnosis.', select: 'Choose this format', note: 'The price depends on scope, assets, integrations and responsibility across the project.' },
  proof: { eyebrow: 'What you can verify', title: 'Live, published websites you can open and verify.', intro: 'Every portfolio link leads to a working product. Cases show the task and the real work involved.', rows: [['01', 'Climatech', 'Service offer and consultation route'], ['02', 'Langbase', 'Technical product explained through scenarios'], ['03', 'all.inn', 'Offer, location and a clear next step']] },
  lead: { ...COPY.pl.lead, eyebrow: 'Free diagnosis', title: 'Answer five questions. We will return with a concrete next step.', body: 'We do not promise a cost estimate without context. First we will check what is worth launching and what is not needed yet.', progress: 'Step', back: 'Back', next: 'Next', send: 'Send enquiry', task: ['What do you need to launch?', 'You can select several options.', [['website', 'Website or landing page'], ['marketing', 'Marketing / campaign'], ['visibility', 'Visibility in Google & AI'], ['automation', 'AI or automation'], ['system', 'Internal system'], ['analysis', 'I need a diagnosis first']]], goal: ['What result matters most?', '', [['leads', 'More qualified enquiries'], ['sales', 'A simpler online sales route'], ['clarity', 'A clearer offer and stronger presence'], ['time', 'Less manual work'], ['other', 'Another outcome']]], context: ['What works today and what is blocking progress?', 'Add a website link or briefly describe the business and situation.', 'Tell us about the company, current solution and problem…'], budget: ['What format or budget are you considering?', '', [['starter', 'Start / one problem'], ['growth', 'Growth / website or campaign'], ['system', 'System / connected workstreams'], ['unknown', 'I do not know yet']]], contact: ['How should we contact you?', 'A phone number or email is enough.'], labels: { name: 'Name', phone: 'Phone', email: 'Email', message: 'Extra information (optional)' }, errors: { task: 'Select at least one need.', goal: 'Select the main goal.', context: 'Add a short context so we can give a concrete answer.', budget: 'Select a format or budget.', name: 'Enter your name.', contact: 'Enter a valid phone number or email.', send: 'The enquiry could not be sent. Please try again or contact us directly.' }, reassure: 'We usually reply within 24 hours — no spam, no pressure.', loading: 'Sending enquiry…', successTitle: 'Your enquiry has been saved.', successBody: 'Thank you. We have the initial context and will return with a concrete next step. You can also write or call now.', call: 'Call', email: 'Email us' },
  faq: { eyebrow: 'FAQ', title: 'Short answers before we talk.', items: [['Do you start with design?', 'No. We first clarify the problem, audience, offer and action the page should lead to.'], ['Can we start small?', 'Yes. We can begin with a diagnosis, landing page, audit or one automated process and grow the system later.'], ['Do you give a fixed price immediately?', 'For simple work we can give an indication. For a larger project we first confirm scope, assets and integrations.'], ['Do you run marketing after launch?', 'Yes, when the website and measurement are ready. We do not suggest campaigns before there is a sensible destination for traffic.'], ['Does AI visibility guarantee mentions in AI answers?', 'No. We can organise technical and content foundations, but we do not control external systems or their answers.'], ['What happens after the form?', 'The enquiry enters our working system. We review the answers and return via the contact you provided.']] },
  final: { title: 'Tell us what you need to launch. We will suggest a plan without unnecessary services.', body: 'If you have a brief, link or a problem in the current system, start with a short diagnosis.', button: 'Get a free diagnosis' },
  route: { portfolioTitle: 'All projects', portfolioIntro: 'A complete work index in one grid. Each project has its own page, real media and a link to the published website.', servicesTitle: 'Service catalogue', servicesIntro: 'Services with scope, estimated timing, price or custom quote and a clear next step.', backPortfolio: 'Portfolio', backServices: 'Services', result: 'Business result', forWho: 'Who it is for', includes: 'What is included', stages: 'Stages', duration: 'Estimated timing', price: 'Price', relevant: 'Related projects', faq: 'Service FAQ', discuss: 'Discuss the task', openSite: 'Open published website', notFound: 'We could not find this page.' },
  common: { ...COPY.pl.common, projects: 'projects', contact: 'Contact', navigation: 'Navigation', brief: 'Free diagnosis' }
});

COPY.ru = structuredClone(COPY.pl);
Object.assign(COPY.ru, {
  meta: { title: 'Aura Global — сайты и digital‑системы, которые ведут к заявке', description: 'Стратегия, дизайн, разработка, маркетинг и AI‑автоматизация. Начинаем с реальной задачи бизнеса.' },
  nav: { portfolio: 'Проекты', services: 'Услуги', process: 'Процесс', pricing: 'Пакеты', cta: 'Бесплатный разбор', open: 'Открыть меню', close: 'Закрыть меню' },
  hero: { eyebrow: 'Aura Global / digital studio', title: 'Сайты и digital‑системы, которые превращают внимание в заявки.', subtitle: 'Стратегия, дизайн, разработка, маркетинг и AI‑автоматизация. Сначала разбираемся в задаче, затем собираем решение вокруг реального выбора клиента.', primary: 'Получить бесплатный разбор', secondary: 'Смотреть проекты', object: 'Aura object / двигайте курсор', facts: ['опубликованных сайтов в showcase', 'направления работы', 'языка коммуникации'] },
  portfolio: { ...COPY.pl.portfolio, eyebrow: 'Портфолио', title: 'Уровень лучше обещаний показывают работы.', intro: 'Одна горизонтальная сцена вместо двух похожих разделов. Каждый проект можно открыть, изучить и перейти на опубликованный сайт.', drag: 'Тяните или используйте стрелки', quick: 'Быстрый просмотр', case: 'Смотреть кейс', site: 'Открыть сайт', cta: 'Нужен похожий результат? Покажите отправную точку — подберём разумный формат работы.', ctaButton: 'Обсудить похожую задачу', task: 'Задача', approach: 'Подход', work: 'Выполненные работы', format: 'Технологии и формат', gallery: 'Материалы', similar: 'Хочу похожее решение', checked: 'Ссылка проверена' },
  trust: { eyebrow: 'Как мы работаем', statement: 'Мы не добавляем экраны ради экранов. <mark>Выстраиваем решения</mark>, которые приводят клиента к контакту.', items: [['01', 'Сначала задача', 'Начинаем с цели, текущего процесса и ограничений бизнеса.'], ['02', 'Один контекст', 'Стратегия, дизайн и разработка не расходятся между разными исполнителями.'], ['03', 'Рабочий следующий шаг', 'Каждый важный экран ведёт к действию: контакту, бронированию или покупке.']] },
  services: { eyebrow: 'Услуги', title: 'Выберите задачу. Покажем, какое решение действительно имеет смысл.', intro: 'Каталог включает сайты, маркетинг, AI и операционные системы. У каждой услуги есть состав, ориентировочный срок, FAQ и путь к разговору.', details: 'Подробнее об услуге', cta: 'Не знаете, с чего начать? Оставьте контекст — вернёмся с конкретным следующим шагом.', ctaButton: 'Подобрать решение' },
  visibility: { eyebrow: 'SEO / GEO / AI visibility', title: 'Быть видимым — не значит публиковать больше.', intro: 'Упорядочиваем предложение, структуру и доказательства, чтобы компанию было проще находить и понимать.', columns: [['Проблема', 'Сайт существует, но поисковики и AI не собирают его предложение в один ясный ответ.'], ['Что делаем', 'Проверяем технику и контент, собираем карту тем, сущностей и источников, затем внедряем согласованные приоритеты.'], ['Что получает бизнес', 'План видимости, упорядоченную структуру и базу для мониторинга — без обещаний позиций и упоминаний.']], example: 'Примеры формата: продуктовая архитектура Polar Signals, Langbase и Exa AI.', cta: 'Проверить видимость компании' },
  process: { eyebrow: 'Процесс', title: 'От первого разбора до запуска — с понятным решением на каждом этапе.', steps: [['01', 'Разбор', 'Цель, аудитория, текущий процесс и границы проекта.'], ['02', 'Направление', 'Структура решения, приоритеты и формат работы.'], ['03', 'Проектирование', 'Тексты, UX, visual direction и сценарии действий.'], ['04', 'Разработка', 'Внедрение, интеграции и проверка качества на реальных устройствах.'], ['05', 'Запуск и итерации', 'Публикация, измерение и улучшения, когда для них есть основание.']] },
  formats: { eyebrow: 'Форматы сотрудничества', title: 'Не каждой задаче сразу нужен целый system.', items: [['01', 'Разбор и sprint', 'Для компании, которой нужны решение, структура и первый работающий шаг.'], ['02', 'Проект и запуск', 'Для сайта, продукта или кампании с определённым объёмом и сроком.'], ['03', 'Развитие системы', 'Для команды, которая соединяет сайт, маркетинг, автоматизации и постоянные итерации.']] },
  packages: { eyebrow: 'Пакеты', title: 'Три ориентира перед индивидуальным расчётом.', intro: 'Пакет описывает результат и сложность. Финальный объём подтверждаем только после разбора задачи.', select: 'Выбрать этот формат', note: 'Цена зависит от объёма, материалов, интеграций и зоны ответственности в проекте.' },
  proof: { eyebrow: 'Что можно проверить', title: 'Открытые, опубликованные сайты, которые можно проверить.', intro: 'Каждая ссылка в портфолио ведёт на работающий продукт. В кейсах показываем задачу и реальный объём выполненных работ.', rows: [['01', 'Climatech', 'Услуги и сценарий консультации'], ['02', 'Langbase', 'Технический продукт через сценарии'], ['03', 'all.inn', 'Предложение, локация и следующий шаг']] },
  lead: { ...COPY.pl.lead, eyebrow: 'Бесплатный разбор', title: 'Ответьте на пять вопросов. Мы вернёмся с конкретным следующим шагом.', body: 'Не обещаем смету без контекста. Сначала проверим, что стоит запускать и какие услуги вам сейчас не нужны.', progress: 'Шаг', back: 'Назад', next: 'Далее', send: 'Отправить заявку', task: ['Что нужно запустить?', 'Можно выбрать несколько вариантов.', [['website', 'Сайт или лендинг'], ['marketing', 'Маркетинг / кампания'], ['visibility', 'Видимость в Google и AI'], ['automation', 'AI или автоматизация'], ['system', 'Внутренняя система'], ['analysis', 'Сначала нужен разбор']]], goal: ['Какой главный результат нужен?', '', [['leads', 'Больше целевых заявок'], ['sales', 'Проще продавать онлайн'], ['clarity', 'Понятная услуга и сильнее образ'], ['time', 'Меньше ручной работы'], ['other', 'Другая цель']]], context: ['Что работает сейчас, а что мешает?', 'Добавьте ссылку на сайт или коротко опишите бизнес и ситуацию.', 'Расскажите о компании, текущем решении и проблеме…'], budget: ['Какой формат или бюджет рассматриваете?', '', [['starter', 'Start / одна задача'], ['growth', 'Growth / сайт или кампания'], ['system', 'System / несколько связанных элементов'], ['unknown', 'Пока не знаю']]], contact: ['Как с вами связаться?', 'Телефона или e-mail достаточно.'], labels: { name: 'Имя и фамилия', phone: 'Телефон', email: 'E-mail', message: 'Дополнительная информация (необязательно)' }, errors: { task: 'Выберите хотя бы одну потребность.', goal: 'Выберите главную цель.', context: 'Добавьте короткий контекст — так мы сможем дать конкретный ответ.', budget: 'Выберите формат или бюджет.', name: 'Укажите имя.', contact: 'Укажите корректный телефон или e-mail.', send: 'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.' }, reassure: 'Обычно отвечаем в течение 24 часов — без спама и давления.', loading: 'Отправляем заявку…', successTitle: 'Заявка сохранена.', successBody: 'Спасибо. Мы получили контекст и вернёмся с конкретным следующим шагом. Если удобнее, можно написать или позвонить уже сейчас.', call: 'Позвонить', email: 'Написать e-mail' },
  faq: { eyebrow: 'FAQ', title: 'Короткие ответы до разговора.', items: [['Вы начинаете с дизайна?', 'Нет. Сначала уточняем проблему, аудиторию, предложение и действие, к которому должна вести страница.'], ['Можно начать с небольшого объёма?', 'Да. Можно начать с разбора, лендинга, аудита или одного автоматизированного процесса и развивать систему позже.'], ['Вы сразу называете фиксированную цену?', 'Для простых задач дадим ориентир. Для большого проекта сначала подтверждаем объём, материалы и интеграции.'], ['Вы берёте маркетинг после запуска?', 'Да, когда готовы сайт и измерение. Не предлагаем кампанию, если трафик пока некуда разумно вести.'], ['AI visibility гарантирует упоминания в AI‑ответах?', 'Нет. Мы можем упорядочить техническую и контентную основу, но не управляем выдачей и внешними AI‑системами.'], ['Что будет после формы?', 'Заявка попадает в наш рабочий контур. Мы читаем ответы и возвращаемся по указанному контакту.']] },
  final: { title: 'Расскажите, что нужно запустить. Мы предложим план без лишних услуг.', body: 'Если есть brief, ссылка или проблема в текущей системе — начните с короткого разбора.', button: 'Получить бесплатный разбор' },
  route: { portfolioTitle: 'Все проекты', portfolioIntro: 'Полный индекс работ в одной сетке. У каждого проекта отдельная страница, реальные медиа и ссылка на опубликованный сайт.', servicesTitle: 'Каталог услуг', servicesIntro: 'Услуги с составом, сроком, ценой или индивидуальным расчётом и понятным следующим шагом.', backPortfolio: 'Портфолио', backServices: 'Услуги', result: 'Результат для бизнеса', forWho: 'Для кого', includes: 'Что входит', stages: 'Этапы', duration: 'Ориентировочный срок', price: 'Цена', relevant: 'Релевантные проекты', faq: 'FAQ услуги', discuss: 'Обсудить задачу', openSite: 'Открыть опубликованный сайт', notFound: 'Эта страница не найдена.' },
  common: { project: 'проект', projects: 'проектов', open: 'Открыть', close: 'Закрыть', footer: 'Aura Global — digital studio', contact: 'Контакты', navigation: 'Навигация', portfolio: 'Портфолио', services: 'Услуги', brief: 'Бесплатный разбор' }
});

/* Copy that is visible in the conversion path is kept deliberately concrete.
   These overrides also keep every language idiomatic instead of translating the
   original studio-facing notes word for word. */
Object.assign(COPY.pl.portfolio, {
  title: 'Prace, które pokazują poziom lepiej niż obietnice.',
  intro: 'Otwórz projekt, zobacz najważniejsze elementy i sprawdź opublikowaną stronę.',
  quick: 'Zobacz szczegóły',
  case: 'Otwórz projekt',
  site: 'Otwórz stronę',
  cta: 'Masz podobną sytuację? Powiedz, co dziś blokuje decyzję klienta — zaproponujemy właściwy następny krok.',
  ctaButton: 'Omówić podobny projekt'
});
Object.assign(COPY.en.portfolio, {
  title: 'Work that proves the level better than a promise.',
  intro: 'Open a project, see the important parts and visit the published website.',
  quick: 'See details', case: 'Open project', site: 'Open website',
  cta: 'Have a similar situation? Tell us what is blocking your customer’s decision today and we will suggest the right next step.',
  ctaButton: 'Discuss a similar project'
});
Object.assign(COPY.ru.portfolio, {
  title: 'Работы говорят об уровне лучше любых обещаний.',
  intro: 'Откройте проект, посмотрите ключевые решения и перейдите на опубликованный сайт.',
  quick: 'Посмотреть детали', case: 'Открыть проект', site: 'Открыть сайт',
  cta: 'Нужен похожий результат? Расскажите, что сейчас мешает клиенту принять решение — предложим понятный следующий шаг.',
  ctaButton: 'Обсудить похожий проект'
});

Object.assign(COPY.pl.visibility, {
  title: 'Klient musi Cię znaleźć, zrozumieć i wybrać.',
  intro: 'Sama strona nie wystarcza. Porządkujemy ofertę, lokalne sygnały i treści tak, aby firma była czytelna wtedy, gdy klient naprawdę szuka rozwiązania.',
  preview: 'Scenariusz demonstracyjny',
  query: 'Szukam firmy od automatyzacji w Warszawie',
  channels: ['Google', 'Mapy', 'wyszukiwarka', 'odpowiedzi AI'],
  resultLabel: 'Jasna odpowiedź zamiast przypadkowej strony',
  resultTitle: 'Firma, oferta i następny krok są widoczne razem.',
  resultText: 'To nie jest obietnica pozycji. To przykład drogi, którą projektujemy od zapytania do kontaktu.',
  stages: [['Co widzi klient', 'Pytanie w Google, mapach lub narzędziu AI — w chwili, gdy szuka konkretnej usługi.'], ['Co blokuje widoczność', 'Niejasna oferta, brak stron pod intencje i słabe dane o firmie utrudniają systemom właściwe zrozumienie.'], ['Co zmieniamy', 'Budujemy strukturę, treści, lokalne sygnały i techniczną podstawę, które prowadzą do właściwej strony.'], ['Jak dochodzi do kontaktu', 'Klient trafia na zrozumiałą ofertę, widzi dowody i może od razu wykonać następny krok.']],
  scopeTitle: 'Co obejmuje praca',
  scope: ['analiza popytu i intencji', 'struktura stron i treści', 'techniczna podstawa SEO', 'widoczność lokalna i schema', 'przygotowanie do odpowiedzi AI', 'monitoring widoczności i ścieżki do kontaktu'],
  note: 'Zaczynamy od sprawdzenia, gdzie firma jest dziś trudna do znalezienia lub zrozumienia. Nie obiecujemy pozycji, których nikt nie kontroluje.',
  cta: 'Sprawdzić widoczność firmy'
});
Object.assign(COPY.en.visibility, {
  title: 'A customer needs to find, understand and choose you.',
  intro: 'Having a website is not enough. We organise the offer, local signals and content so the company is clear when a customer is actively looking for a solution.',
  preview: 'Illustrative scenario', query: 'I need an automation company in Warsaw', channels: ['Google', 'Maps', 'search', 'AI answers'],
  resultLabel: 'A clear answer instead of a random page', resultTitle: 'The company, offer and next step appear together.', resultText: 'This is not a ranking promise. It illustrates the route we design from a question to a conversation.',
  stages: [['What the customer sees', 'A question in Google, Maps or an AI tool at the moment they need a specific service.'], ['What gets in the way', 'An unclear offer, missing intent-led pages and weak company data make it hard for systems to understand the business.'], ['What we change', 'We build the structure, content, local signals and technical foundations that lead to the right page.'], ['How an enquiry happens', 'The customer reaches a clear offer, sees useful proof and can take the next step immediately.']],
  scopeTitle: 'What the work includes', scope: ['demand and intent analysis', 'page and content structure', 'technical SEO foundations', 'local visibility and schema', 'preparation for AI answers', 'visibility and enquiry-path monitoring'],
  note: 'We begin by identifying where the company is hard to find or understand today. We do not promise rankings that nobody controls.', cta: 'Check business visibility'
});
Object.assign(COPY.ru.visibility, {
  title: 'Клиент должен найти, понять и выбрать вашу компанию.',
  intro: 'Одного сайта недостаточно. Упорядочиваем предложение, локальные сигналы и контент, чтобы компанию было легко понять в момент, когда клиент уже ищет решение.',
  preview: 'Демонстрационный сценарий', query: 'Ищу компанию по автоматизации в Варшаве', channels: ['Google', 'Карты', 'поиск', 'AI-ответы'],
  resultLabel: 'Понятный ответ вместо случайной страницы', resultTitle: 'Компания, предложение и следующий шаг видны вместе.', resultText: 'Это не обещание позиции. Это пример пути, который мы строим от вопроса клиента до обращения.',
  stages: [['Что видит клиент', 'Вопрос в Google, картах или AI-системе в тот момент, когда нужна конкретная услуга.'], ['Что мешает компании появляться', 'Непонятное предложение, отсутствие страниц под реальные запросы и слабые данные о компании мешают системам правильно её понять.'], ['Что мы меняем', 'Собираем структуру, контент, локальные сигналы и техническую основу, которые ведут на нужную страницу.'], ['Как появляется заявка', 'Клиент попадает на понятную страницу, видит нужные доказательства и может сразу связаться с компанией.']],
  scopeTitle: 'Что входит в работу', scope: ['анализ спроса и намерений клиентов', 'структура страниц и контента', 'техническая SEO-основа', 'локальная видимость и schema', 'подготовка к AI-ответам', 'мониторинг видимости и пути до заявки'],
  note: 'Начинаем с проверки, где компанию сейчас сложно найти или понять. Не обещаем позиции, которыми никто не управляет.', cta: 'Проверить видимость бизнеса'
});

/* Commercial-site copy: short, owner-facing language with one clear action. */
Object.assign(COPY.pl, {
  hero: {
    eyebrow: 'Aura Global / strony, które sprzedają',
    title: 'Strona firmowa,\nktóra codziennie\nzdobywa klientów.',
    subtitle: 'Strategia, design, development i AI w jednym zespole. Otrzymujesz prawdziwe narzędzie sprzedaży: jasną ofertę, zaufanie i prostą drogę do kontaktu.',
    primary: 'Otrzymaj bezpłatny rozbiór',
    secondary: 'Zobacz nasze realizacje',
    object: 'Kliknij planetę',
    assurance: 'Bezpłatnie pokazujemy szkic Twojej strony — oceniasz, zanim zapłacisz',
    facts: ['wdrożonych projektów — zobacz je od razu', 'języki obsługi klienta: PL / EN / RU', 'jeden zespół od strategii po wdrożenie'],
    orbit: {
      aria: 'Interaktywna planeta usług — kliknij, aby zobaczyć kolejną usługę',
      hint: 'Kliknij',
      kicker: 'Nasze usługi',
      open: 'Zobacz więcej',
      slides: [
        { id: 'web', title: 'Strony i e-commerce', text: 'Strona, która sprzedaje: jasna oferta, szybki start i prosta droga do kontaktu.' },
        { id: 'marketing', title: 'Marketing i kampanie', text: 'Reklama bez przepalania budżetu — docieramy do właściwych osób i mierzymy każdy efekt.' },
        { id: 'visibility', title: 'Widoczność w Google i AI', text: 'Twoja firma pojawia się tam, gdzie pyta klient: wyszukiwarka, mapy, odpowiedzi AI.' },
        { id: 'ai', title: 'AI i automatyzacje', text: 'Powtarzalną pracę przejmują systemy, a Twój zespół zajmuje się klientami.' },
        { id: 'systems', title: 'Systemy biznesowe', text: 'CRM, panele i integracje, które porządkują sprzedaż i codzienną pracę firmy.' }
      ]
    }
  },
  portfolio: {
    ...COPY.pl.portfolio,
    eyebrow: 'Portfolio',
    title: 'Zobacz strony, które już pracują dla naszych klientów.',
    intro: 'Otwórz realizację, zobacz zakres pracy i sprawdź opublikowaną stronę.',
    hint: 'Przesuń, aby zobaczyć więcej',
    previous: 'Poprzedni projekt',
    next: 'Następny projekt',
    projectLink: 'Zobacz projekt',
    created: 'Co stworzyliśmy',
    quick: 'Zobacz projekt',
    case: 'Zobacz projekt',
    cta: 'Masz podobny projekt? Opowiedz nam, czego potrzebujesz.',
    ctaButton: 'Otrzymaj bezpłatny rozbiór'
  },
  trust: {
    eyebrow: 'Jak pracujemy',
    statement: 'Najpierw poznajemy problem.<br><mark>Potem budujemy rozwiązanie.</mark>',
    intro: 'Sprawdzamy, czego potrzebuje firma i co klient ma zrobić po wejściu na stronę.',
    items: [['01', 'Rozumiemy biznes', 'Poznajemy ofertę, klientów i cel strony.'], ['02', 'Projektujemy ścieżkę', 'Układamy treści i ekrany tak, aby prowadziły do kontaktu.'], ['03', 'Wdrażamy i testujemy', 'Uruchamiamy stronę, sprawdzamy ją na urządzeniach i poprawiamy najważniejsze elementy.']]
  },
  services: { ...COPY.pl.services, title: 'W czym możemy pomóc Twojej firmie?', intro: 'Wybierz cel biznesowy. Pokażemy prosty zakres, termin i następny krok.', cta: 'Nie wiesz, czego potrzebujesz? Krótko opisz firmę i problem.', ctaButton: 'Otrzymaj bezpłatny rozbiór' },
  process: { eyebrow: 'Proces', title: 'Od rozmowy do działającej strony w trzech krokach.', steps: [['01', 'Poznajemy cel', 'Ustalamy ofertę, odbiorców i wynik, którego potrzebuje firma.'], ['02', 'Projektujemy i budujemy', 'Łączymy treść, wygląd i technologię w jeden czytelny system.'], ['03', 'Uruchamiamy i poprawiamy', 'Testujemy urządzenia, publikujemy i sprawdzamy drogę do kontaktu.']] },
  formats: { eyebrow: 'Współpraca', title: 'Zacznij od zakresu, którego naprawdę potrzebujesz.', items: COPY.pl.formats.items },
  packages: { ...COPY.pl.packages, title: 'Proste punkty startu dla różnych etapów firmy.', intro: 'Po krótkim rozbiorze potwierdzimy zakres, termin i cenę bez niepotrzebnych dodatków.' },
  proof: { ...COPY.pl.proof, title: 'Zobacz działające strony, które możesz sprawdzić już teraz.', intro: 'Każdy projekt możesz otworzyć i sprawdzić samodzielnie.' },
  final: { title: 'Masz pomysł albo strona nie przynosi klientów?', body: 'Napisz dwa zdania o firmie — wrócimy z konkretnym planem, dopasowanym dokładnie do tego, czego potrzebujesz.', button: 'Otrzymaj bezpłatny rozbiór' },
  sticky: { text: 'Sprawdźmy, co zatrzymuje Twoich klientów.', button: 'Bezpłatny rozbiór', close: 'Zamknij' },
  route: { ...COPY.pl.route, backHome: 'Wróć do strony głównej', backPortfolioLink: 'Wróć do realizacji', backServicesLink: 'Wróć do usług', problem: 'Problem', solution: 'Co zrobiliśmy', effect: 'Efekt', similarTitle: 'Masz podobny projekt?', similarBody: 'Opowiedz nam, czego potrzebujesz.', discuss: 'Otrzymaj bezpłatny rozbiór' }
});

Object.assign(COPY.en, {
  hero: {
    eyebrow: 'Aura Global / websites that sell',
    title: 'A website that\nwins customers\nevery single day.',
    subtitle: 'Strategy, design, development and AI in one team. You get a real sales tool: a clear offer, real trust and an easy route to contact.',
    primary: 'Get a free diagnosis',
    secondary: 'View our work',
    object: 'Click the planet',
    assurance: 'We show a free preview of your site first — you judge before you pay',
    facts: ['live projects — see them right now', 'languages we work in: PL / EN / RU', 'one team from strategy to launch'],
    orbit: {
      aria: 'Interactive service planet — click to see the next service',
      hint: 'Click',
      kicker: 'Our services',
      open: 'See more',
      slides: [
        { id: 'web', title: 'Websites & e-commerce', text: 'A website that sells: a clear offer, fast launch and an easy way to get in touch.' },
        { id: 'marketing', title: 'Marketing & campaigns', text: 'Advertising without burning budget — we reach the right people and measure every result.' },
        { id: 'visibility', title: 'Visibility in Google & AI', text: 'Your company appears where customers ask: search, maps and AI answers.' },
        { id: 'ai', title: 'AI & automation', text: 'Systems take over repetitive work while your team takes care of customers.' },
        { id: 'systems', title: 'Business systems', text: 'CRM, dashboards and integrations that organise sales and daily operations.' }
      ]
    }
  },
  portfolio: { ...COPY.en.portfolio, eyebrow: 'Portfolio', title: 'See websites already working for our clients.', intro: 'Open a project, review the work and visit the published website.', hint: 'Drag to see more', previous: 'Previous project', next: 'Next project', projectLink: 'View project', created: 'What we created', quick: 'View project', case: 'View project', cta: 'Have a similar project? Tell us what you need.', ctaButton: 'Get a free diagnosis' },
  trust: { eyebrow: 'How we work', statement: 'First we understand the problem.<br><mark>Then we build the solution.</mark>', intro: 'We clarify what the business needs and what a visitor should do on the website.', items: [['01', 'Understand the business', 'We learn the offer, customers and website goal.'], ['02', 'Design the path', 'We organise content and screens to lead towards contact.'], ['03', 'Build and test', 'We launch, test devices and improve the important parts.']] },
  services: { ...COPY.en.services, title: 'How can we help your business?', intro: 'Choose a business goal. We will explain the scope, timing and next step.', cta: 'Not sure what you need? Briefly describe the company and the problem.', ctaButton: 'Get a free diagnosis' },
  process: { eyebrow: 'Process', title: 'From a conversation to a working website in three steps.', steps: [['01', 'Clarify the goal', 'We define the offer, audience and result the business needs.'], ['02', 'Design and build', 'We connect copy, design and technology in one clear system.'], ['03', 'Launch and improve', 'We test devices, publish and verify the route to contact.']] },
  formats: { eyebrow: 'Ways to work', title: 'Start with the scope you actually need.', items: COPY.en.formats.items },
  packages: { ...COPY.en.packages, title: 'Simple starting points for different business stages.', intro: 'After a short diagnosis we confirm scope, timing and price without unnecessary extras.' },
  proof: { ...COPY.en.proof, title: 'See working websites you can check right now.', intro: 'You can open and verify every project yourself.' },
  final: { title: 'Have an idea — or a website that brings no customers?', body: 'Write two sentences about your business and we will come back with a concrete plan, focused exactly on what you need.', button: 'Get a free diagnosis' },
  sticky: { text: 'Let’s find out what stops your customers.', button: 'Free diagnosis', close: 'Close' },
  route: { ...COPY.en.route, backHome: 'Back to home', backPortfolioLink: 'Back to projects', backServicesLink: 'Back to services', problem: 'Problem', solution: 'What we did', effect: 'Outcome', similarTitle: 'Have a similar project?', similarBody: 'Tell us what you need.', discuss: 'Get a free diagnosis' }
});

Object.assign(COPY.ru, {
  hero: {
    eyebrow: 'Aura Global / сайты, которые продают',
    title: 'Сайт, который\nкаждый день\nприводит клиентов.',
    subtitle: 'Стратегия, дизайн, разработка и AI в одной команде. Вы получаете настоящий инструмент продаж: понятное предложение, доверие и простой путь к заявке.',
    primary: 'Получить бесплатный разбор',
    secondary: 'Смотреть наши работы',
    object: 'Нажмите на планету',
    assurance: 'Бесплатно покажем набросок вашего сайта — оцените, прежде чем платить',
    facts: ['работающих проектов — можно посмотреть прямо сейчас', 'языка общения с клиентами: PL / EN / RU', 'одна команда от стратегии до запуска'],
    orbit: {
      aria: 'Интерактивная планета услуг — нажмите, чтобы увидеть следующую услугу',
      hint: 'Тык',
      kicker: 'Наши услуги',
      open: 'Подробнее',
      slides: [
        { id: 'web', title: 'Сайты и e-commerce', text: 'Сайт, который продаёт: понятное предложение, быстрый запуск и простой путь к заявке.' },
        { id: 'marketing', title: 'Маркетинг и кампании', text: 'Реклама без слива бюджета — находим нужных людей и измеряем каждый результат.' },
        { id: 'visibility', title: 'Видимость в Google и AI', text: 'Ваша компания появляется там, где спрашивает клиент: поиск, карты, AI-ответы.' },
        { id: 'ai', title: 'AI и автоматизация', text: 'Рутину берут на себя системы, а команда занимается клиентами.' },
        { id: 'systems', title: 'Бизнес-системы', text: 'CRM, панели и интеграции, которые наводят порядок в продажах и операционке.' }
      ]
    }
  },
  portfolio: { ...COPY.ru.portfolio, eyebrow: 'Портфолио', title: 'Посмотрите сайты, которые уже работают для наших клиентов.', intro: 'Откройте проект, изучите состав работ и перейдите на опубликованный сайт.', hint: 'Листайте, чтобы увидеть больше', previous: 'Предыдущий проект', next: 'Следующий проект', projectLink: 'Смотреть проект', created: 'Что создали', quick: 'Смотреть проект', case: 'Смотреть проект', cta: 'Есть похожий проект? Расскажите, что вам нужно.', ctaButton: 'Получить бесплатный разбор' },
  trust: { eyebrow: 'Как работаем', statement: 'Сначала понимаем задачу.<br><mark>Затем создаём решение.</mark>', intro: 'Определяем, что нужно бизнесу и что клиент должен сделать на сайте.', items: [['01', 'Понимаем бизнес', 'Изучаем предложение, клиентов и цель сайта.'], ['02', 'Проектируем путь', 'Собираем тексты и экраны так, чтобы они вели к контакту.'], ['03', 'Запускаем и тестируем', 'Проверяем устройства, публикуем и улучшаем важные элементы.']] },
  services: { ...COPY.ru.services, title: 'Чем можем помочь вашему бизнесу?', intro: 'Выберите бизнес-цель. Покажем понятный объём, срок и следующий шаг.', cta: 'Не знаете, что именно нужно? Коротко опишите бизнес и проблему.', ctaButton: 'Получить бесплатный разбор' },
  process: { eyebrow: 'Процесс', title: 'От разговора до работающего сайта за три этапа.', steps: [['01', 'Определяем цель', 'Фиксируем предложение, аудиторию и нужный бизнесу результат.'], ['02', 'Проектируем и создаём', 'Объединяем текст, дизайн и технологию в понятную систему.'], ['03', 'Запускаем и улучшаем', 'Тестируем устройства, публикуем и проверяем путь до контакта.']] },
  formats: { eyebrow: 'Сотрудничество', title: 'Начните с объёма, который действительно нужен.', items: COPY.ru.formats.items },
  packages: { ...COPY.ru.packages, title: 'Понятные варианты старта для разных этапов бизнеса.', intro: 'После короткого разбора подтвердим объём, срок и цену без лишних услуг.' },
  proof: { ...COPY.ru.proof, title: 'Работающие сайты, которые можно проверить прямо сейчас.', intro: 'Каждый проект можно открыть и проверить самостоятельно.' },
  final: { title: 'Есть идея — или сайт, который не приводит клиентов?', body: 'Напишите пару предложений о бизнесе — вернёмся с конкретным планом, точно под то, что вам действительно нужно.', button: 'Получить бесплатный разбор' },
  sticky: { text: 'Проверим, что останавливает ваших клиентов.', button: 'Бесплатный разбор', close: 'Закрыть' },
  route: { ...COPY.ru.route, backHome: 'Вернуться на главную', backPortfolioLink: 'Вернуться к проектам', backServicesLink: 'Вернуться к услугам', problem: 'Проблема', solution: 'Что сделали', effect: 'Результат', similarTitle: 'Есть похожий проект?', similarBody: 'Расскажите, что вам нужно.', discuss: 'Получить бесплатный разбор' }
});

Object.assign(COPY.pl.visibility, {
  eyebrow: 'Widoczność',
  title: 'Twoja firma powinna być widoczna tam, gdzie klienci szukają odpowiedzi.',
  intro: 'Porządkujemy stronę i treści, aby ofertę łatwiej było znaleźć w Google, mapach i narzędziach AI.',
  preview: '01 / Klient szuka usługi', query: 'Firma od automatyzacji w Warszawie',
  resultLabel: '02 / Znajduje jasną odpowiedź', resultTitle: 'Aura Global — automatyzacja dla firm w Warszawie', resultText: 'Jasna usługa, lokalizacja i prosty sposób kontaktu.',
  stages: [['Klient szuka usługi', 'Wpisuje konkretną potrzebę w Google, mapach albo narzędziu AI.'], ['Znajduje jasną odpowiedź', 'Od razu rozumie, czym zajmuje się firma i czy pasuje do jego sytuacji.'], ['Przechodzi do kontaktu', 'Może zadzwonić, wysłać wiadomość albo umówić konsultację.']],
  scopeTitle: 'Co robimy', scope: ['sprawdzamy, czego szukają klienci', 'porządkujemy strukturę strony', 'przygotowujemy zrozumiałe treści', 'wzmacniamy widoczność lokalną', 'przygotowujemy stronę pod Google i odpowiedzi AI', 'mierzymy wejścia i kontakty'],
  note: 'Nie obiecujemy pierwszej pozycji. Budujemy czytelną drogę od wyszukania firmy do kontaktu.', cta: 'Sprawdź widoczność swojej firmy'
});
Object.assign(COPY.en.visibility, { eyebrow: 'Visibility', title: 'Your company should appear where customers look for answers.', intro: 'We organise the website and content so the offer is easier to find in Google, Maps and AI tools.', preview: '01 / A customer searches', query: 'Automation company in Warsaw', resultLabel: '02 / Finds a clear answer', resultTitle: 'Aura Global — business automation in Warsaw', resultText: 'A clear service, location and easy way to contact.', stages: [['A customer searches', 'They enter a specific need in Google, Maps or an AI tool.'], ['Finds a clear answer', 'They immediately understand the company and whether it fits.'], ['Moves to contact', 'They can call, message or book a consultation.']], scopeTitle: 'What we do', scope: ['check what customers search for', 'organise the website structure', 'prepare clear content', 'strengthen local visibility', 'prepare for Google and AI answers', 'measure visits and enquiries'], note: 'We do not promise first place. We build a clear route from discovery to contact.', cta: 'Check your company visibility' });
Object.assign(COPY.ru.visibility, { eyebrow: 'Видимость', title: 'Компания должна быть видна там, где клиенты ищут ответы.', intro: 'Упорядочиваем сайт и тексты, чтобы предложение было проще найти в Google, картах и AI-инструментах.', preview: '01 / Клиент ищет услугу', query: 'Компания по автоматизации в Варшаве', resultLabel: '02 / Находит понятный ответ', resultTitle: 'Aura Global — автоматизация для бизнеса в Варшаве', resultText: 'Понятная услуга, город и простой способ связаться.', stages: [['Клиент ищет услугу', 'Вводит конкретный запрос в Google, картах или AI-инструменте.'], ['Находит понятный ответ', 'Сразу понимает, чем занимается компания и подходит ли она.'], ['Переходит к контакту', 'Может позвонить, написать или записаться на консультацию.']], scopeTitle: 'Что делаем', scope: ['проверяем запросы клиентов', 'упорядочиваем структуру сайта', 'готовим понятные тексты', 'усиливаем локальную видимость', 'готовим сайт для Google и AI-ответов', 'измеряем посещения и заявки'], note: 'Не обещаем первое место. Создаём понятный путь от поиска компании до контакта.', cta: 'Проверить видимость компании' });

function clone(value) {
  return structuredClone(value);
}

export function getSiteCopy(language = 'pl') {
  const key = SUPPORTED_LANGUAGES.includes(language) ? language : 'pl';
  return clone(COPY[key]);
}
