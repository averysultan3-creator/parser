const SCOPE_LABELS = {
  pl: {
    strategy: 'Strategia', artDirection: 'Art direction', ux: 'UX/UI', frontend: 'Frontend',
    content: 'Struktura treści', seo: 'Struktura SEO', conversion: 'Ścieżki konwersji',
    motion: 'Motion', mobile: 'Mobile UX', portfolio: 'System realizacji', brand: 'Prezentacja marki',
    catalog: 'UX katalogu', ecommerce: 'E-commerce UX', product: 'Narracja produktu',
    lead: 'Pozyskiwanie zapytań', architecture: 'Architektura informacji'
  },
  en: {
    strategy: 'Strategy', artDirection: 'Art direction', ux: 'UX/UI', frontend: 'Frontend',
    content: 'Content structure', seo: 'SEO structure', conversion: 'Conversion paths',
    motion: 'Motion', mobile: 'Mobile UX', portfolio: 'Case system', brand: 'Brand presentation',
    catalog: 'Catalog UX', ecommerce: 'E-commerce UX', product: 'Product narrative',
    lead: 'Lead capture', architecture: 'Information architecture'
  },
  ru: {
    strategy: 'Стратегия', artDirection: 'Арт-дирекшн', ux: 'UX/UI', frontend: 'Frontend',
    content: 'Структура контента', seo: 'SEO-структура', conversion: 'Конверсионные сценарии',
    motion: 'Motion', mobile: 'Mobile UX', portfolio: 'Система кейсов', brand: 'Презентация бренда',
    catalog: 'UX каталога', ecommerce: 'E-commerce UX', product: 'Продуктовая подача',
    lead: 'Сбор заявок', architecture: 'Информационная архитектура'
  }
};

const FORMAT_LABELS = {
  pl: {
    responsive: 'Responsive web', editorial: 'Editorial UI', media: 'Interaktywne media',
    content: 'System treści', product: 'Product UI', commerce: 'Katalog / commerce', motion: 'Web motion'
  },
  en: {
    responsive: 'Responsive web', editorial: 'Editorial UI', media: 'Interactive media',
    content: 'Content system', product: 'Product UI', commerce: 'Catalog / commerce', motion: 'Web motion'
  },
  ru: {
    responsive: 'Responsive web', editorial: 'Editorial UI', media: 'Интерактивные медиа',
    content: 'Контент-система', product: 'Product UI', commerce: 'Каталог / commerce', motion: 'Web motion'
  }
};

const APPROACH = {
  pl: {
    portfolio: 'Praca prowadzi narrację: duże media, krótki kontekst i szybkie przejście do właściwego projektu.',
    product: 'Porządkujemy historię od wartości produktu do interfejsu i jednego czytelnego następnego kroku.',
    service: 'Układamy ofertę według decyzji klienta: usługa, dowód, odpowiedź na obiekcję i kontakt.',
    corporate: 'Rozdzielamy kierunki biznesowe, budujemy hierarchię zaufania i skracamy drogę do rozmowy.',
    property: 'Łączymy emocjonalne media z konkretną ofertą, lokalizacją i widocznym scenariuszem zapytania.',
    commerce: 'Prowadzimy od kategorii przez parametry produktu do zakupu albo wartościowego zapytania.',
    platform: 'Tłumaczymy techniczny produkt przez zastosowania, interfejs i czytelne punkty wejścia dla użytkownika.',
    media: 'Pozwalamy materiałom wideo budować pierwsze wrażenie, a strukturze szybko doprowadzić do kontaktu.'
  },
  en: {
    portfolio: 'The work leads the story: large media, concise context and a fast route into the right project.',
    product: 'We structure the story from product value to interface proof and one clear next step.',
    service: 'The offer follows the client decision: service, proof, objection handling and contact.',
    corporate: 'We separate business directions, build a trust hierarchy and shorten the route to a conversation.',
    property: 'Emotional media is paired with a concrete offer, location and a visible enquiry path.',
    commerce: 'The journey moves from category and product detail to purchase or a qualified enquiry.',
    platform: 'A technical product is explained through use cases, interface proof and clear entry points.',
    media: 'Video creates the first impression while the structure moves quickly toward an enquiry.'
  },
  ru: {
    portfolio: 'Работы ведут повествование: крупные медиа, короткий контекст и быстрый переход к нужному проекту.',
    product: 'Выстраиваем историю от ценности продукта к интерфейсу и одному понятному следующему шагу.',
    service: 'Собираем предложение вокруг решения клиента: услуга, доказательство, ответ на возражение и контакт.',
    corporate: 'Разделяем направления бизнеса, выстраиваем иерархию доверия и сокращаем путь до разговора.',
    property: 'Соединяем эмоциональные медиа с конкретным предложением, локацией и заметным сценарием заявки.',
    commerce: 'Ведём от категории и параметров продукта к покупке или содержательной заявке.',
    platform: 'Объясняем технический продукт через сценарии, интерфейс и понятные точки входа.',
    media: 'Видео создаёт первое впечатление, а структура быстро приводит к просмотру работ и контакту.'
  }
};

const PROJECTS = [
  project('depo-studio', 'Depo Studio', 'https://www.depo.studio/', 'portfolio',
    ['strategy', 'portfolio', 'artDirection', 'frontend'], ['responsive', 'editorial', 'motion'], 'hero',
    ['Creative studio', 'Creative studio', 'Креативная студия'],
    ['Portfolio, w którym realizacje są głównym argumentem studia.', 'A portfolio where the work is the studio’s primary argument.', 'Портфолио, в котором работы — главный аргумент студии.'],
    ['Pokazać szeroki zakres realizacji bez ciężkiej nawigacji i długich opisów.', 'Show a broad body of work without heavy navigation or long explanations.', 'Показать широкий диапазон работ без тяжёлой навигации и длинных описаний.']),
  project('flowty', 'Flowty', 'https://flowty.co/', 'product',
    ['strategy', 'product', 'ux', 'frontend'], ['responsive', 'product', 'motion'], 'large',
    ['Produktivity / app', 'Productivity / app', 'Продуктивность / app'],
    ['Minimalistyczna prezentacja produktu do pracy w skupieniu.', 'A minimal product story for a focus and break timer.', 'Минималистичная презентация продукта для фокусной работы и перерывов.'],
    ['Wyjaśnić prosty rytuał produktu i doprowadzić użytkownika do uruchomienia aplikacji.', 'Explain the product ritual and move the visitor toward trying the app.', 'Объяснить продуктовый сценарий и привести пользователя к запуску приложения.']),
  project('agentura', 'Agentura', 'https://agentura.framer.website/', 'portfolio',
    ['brand', 'portfolio', 'ux', 'motion'], ['responsive', 'editorial', 'motion'], 'wide',
    ['Agencja kreatywna', 'Creative agency', 'Креативное агентство'],
    ['Lekki, redakcyjny system dla brandingu i identyfikacji.', 'A light editorial system for branding and visual identity work.', 'Лёгкая редакционная система для брендинга и визуальной идентичности.'],
    ['Utrzymać eksperymentalny charakter, ale zachować czytelną drogę przez realizacje.', 'Keep the experimental character while preserving a clear route through the work.', 'Сохранить экспериментальный характер и понятный путь по работам.']),
  project('unabyss', 'Unabyss', 'https://unabyss.com/', 'platform',
    ['strategy', 'product', 'architecture', 'motion'], ['responsive', 'product', 'media'], 'tall',
    ['AI / workspace', 'AI / workspace', 'AI / рабочее пространство'],
    ['Wizualna opowieść o centrum kontekstu i połączonych narzędziach.', 'A visual story for a context workspace and connected tools.', 'Визуальная история о центре контекста и связанных инструментах.'],
    ['Pokazać abstrakcyjny produkt przez relacje, integracje i konkretne punkty wejścia.', 'Make an abstract product tangible through relationships, integrations and entry points.', 'Сделать абстрактный продукт понятным через связи, интеграции и точки входа.']),
  project('polanki', 'POLANKI', 'https://kameralnie.com/', 'property',
    ['strategy', 'content', 'ux', 'lead'], ['responsive', 'editorial', 'content'], 'large',
    ['Nieruchomości premium', 'Premium real estate', 'Премиальная недвижимость'],
    ['Spokojna prezentacja kameralnych apartamentów i ich otoczenia.', 'A calm presentation of intimate residential properties and their setting.', 'Спокойная презентация камерных жилых проектов и их окружения.'],
    ['Połączyć klimat inwestycji z konkretną ofertą, lokalizacją i szybkim kontaktem.', 'Connect the property mood with the offer, location and a fast enquiry path.', 'Соединить атмосферу проекта с предложением, локацией и быстрым контактом.']),
  project('mily-group', 'Mily Group', 'https://milygroup.com/', 'commerce',
    ['brand', 'catalog', 'content', 'lead'], ['responsive', 'commerce', 'content'], 'wide',
    ['Produkcja / B2B', 'Manufacturing / B2B', 'Производство / B2B'],
    ['Naturalny produkt pokazany jako dojrzała oferta hurtowa.', 'A natural product presented as a mature wholesale offer.', 'Натуральный продукт, представленный как зрелое оптовое предложение.'],
    ['Wyjaśnić jakość, pochodzenie i skalę dostaw odbiorcom biznesowym.', 'Explain quality, sourcing and supply capability to business buyers.', 'Объяснить качество, происхождение и возможности поставок B2B‑клиентам.']),
  project('climatech', 'Climatech', 'https://climatech.ua/', 'service',
    ['strategy', 'architecture', 'seo', 'lead'], ['responsive', 'content', 'motion'], 'wide',
    ['Systemy klimatyczne', 'Climate systems', 'Климатические системы'],
    ['Oferta techniczna podana przez scenariusze i zastosowania.', 'A technical service offer organised around use cases.', 'Техническое предложение, собранное вокруг сценариев применения.'],
    ['Rozdzielić usługi dla różnych obiektów i skrócić drogę do konsultacji.', 'Separate services by building use case and shorten the route to consultation.', 'Разделить услуги по типам объектов и сократить путь до консультации.']),
  project('mont-fort', 'Mont Fort', 'https://mont-fort.com/', 'corporate',
    ['strategy', 'brand', 'content', 'lead'], ['responsive', 'editorial', 'media'], 'large',
    ['Energia / inwestycje', 'Energy / investments', 'Энергетика / инвестиции'],
    ['Korporacyjna narracja o projektach i kierunkach inwestycyjnych.', 'A corporate narrative for projects and investment directions.', 'Корпоративная история о проектах и инвестиционных направлениях.'],
    ['Pokazać zakres działalności i wiarygodność bez przeładowania technicznym tekstem.', 'Show business scope and credibility without overloading the page with technical copy.', 'Показать масштаб и доверие без перегрузки техническим текстом.']),
  project('evanlite', 'EVANLITE', 'https://evanlite.com/', 'commerce',
    ['brand', 'catalog', 'ecommerce', 'mobile'], ['responsive', 'commerce', 'media'], 'wide',
    ['Kolarstwo / e-commerce', 'Cycling / e-commerce', 'Велоспорт / e-commerce'],
    ['Karbonowe koła pokazane przez osiągi, detal i kontekst jazdy.', 'Carbon wheels presented through performance, detail and riding context.', 'Карбоновые колёса, показанные через характеристики, детали и контекст езды.'],
    ['Połączyć emocję produktu z parametrami i prostą drogą do właściwego modelu.', 'Combine product emotion with specifications and a clear route to the right model.', 'Соединить эмоцию продукта с характеристиками и выбором нужной модели.']),
  project('montone-studio', 'Montone Studio', 'https://montone.studio/', 'portfolio',
    ['strategy', 'portfolio', 'ux', 'artDirection'], ['responsive', 'editorial', 'content'], 'medium',
    ['Doradztwo projektowe', 'Design advisory', 'Дизайн-консалтинг'],
    ['Wyrazista oferta doradcza oparta na typografii i rytmie.', 'A distinctive advisory offer built with type and rhythm.', 'Выразительное консалтинговое предложение на типографике и ритме.'],
    ['Rozdzielić strategię, direction i product design w jednym spójnym systemie.', 'Separate strategy, creative direction and product design within one coherent system.', 'Разделить стратегию, creative direction и product design в цельной системе.']),
  project('rabenrifaie', 'RabenRifaie Studio', 'https://www.rabenrifaie.com/', 'portfolio',
    ['portfolio', 'artDirection', 'ux', 'mobile'], ['responsive', 'editorial', 'media'], 'tall',
    ['Architektura / studio', 'Architecture / studio', 'Архитектура / студия'],
    ['Powściągliwe portfolio, w którym przestrzeń zostaje dla projektów.', 'A restrained portfolio that leaves visual space for the work.', 'Сдержанное портфолио, оставляющее визуальное пространство проектам.'],
    ['Zbudować archiwum prac bez konkurowania interfejsu z materiałami.', 'Build a project archive without letting the interface compete with the work.', 'Собрать архив проектов так, чтобы интерфейс не спорил с материалами.']),
  project('all-inn', 'all.inn', 'https://allinnhomeofstudents.com/', 'property',
    ['strategy', 'content', 'ux', 'conversion'], ['responsive', 'content', 'media'], 'large',
    ['Mieszkania studenckie', 'Student housing', 'Студенческое жильё'],
    ['Przyjazna ścieżka od atmosfery miejsca do dostępnej oferty.', 'A friendly journey from the atmosphere of the place to the available offer.', 'Дружелюбный путь от атмосферы места до доступного предложения.'],
    ['Połączyć społeczność, lokalizację i pokoje z czytelnym kolejnym krokiem.', 'Connect community, location and rooms with a clear next step.', 'Соединить сообщество, локацию и комнаты с понятным следующим шагом.']),
  project('let-it-rip', 'Let it Rip Pictures', 'https://letitrippictures.com/', 'media',
    ['portfolio', 'artDirection', 'motion', 'lead'], ['responsive', 'media', 'motion'], 'hero',
    ['Produkcja filmowa', 'Film production', 'Кинопроизводство'],
    ['Filmowe portfolio, które zaczyna rozmowę od obrazu.', 'A film portfolio that starts the conversation with moving image.', 'Кинопортфолио, которое начинает разговор с изображения.'],
    ['Dać showreelowi pierwszeństwo i zachować szybki dostęp do prac oraz kontaktu.', 'Let the showreel lead while keeping work and contact easy to reach.', 'Отдать первый план showreel и сохранить быстрый доступ к работам и контакту.']),
  project('oknoplast', 'OKNOPLAST', 'https://oknoplast.com.pl/', 'commerce',
    ['architecture', 'catalog', 'seo', 'lead'], ['responsive', 'commerce', 'content'], 'wide',
    ['Produkcja / dom', 'Manufacturing / home', 'Производство / дом'],
    ['Rozbudowany katalog produktów uporządkowany według potrzeb domu.', 'A broad product catalog organised around home improvement needs.', 'Большой каталог продуктов, организованный вокруг задач дома.'],
    ['Ułatwić porównanie grup produktowych i skierować klienta do właściwej oferty.', 'Make product groups easier to compare and route the visitor to the right offer.', 'Упростить сравнение категорий и привести посетителя к нужному предложению.']),
  project('mukko', 'MUKKO', 'https://mukko.studio/', 'portfolio',
    ['brand', 'portfolio', 'artDirection', 'motion'], ['responsive', 'editorial', 'motion'], 'tall',
    ['Design / wnętrza', 'Design / interiors', 'Дизайн / интерьеры'],
    ['Minimalna prezentacja studia oparta na znaku, typie i pracy.', 'A minimal studio presentation built around identity, type and work.', 'Минимальная презентация студии на айдентике, типографике и работах.'],
    ['Zachować mocny charakter marki, jednocześnie dając czytelny dostęp do portfolio.', 'Preserve a strong brand character while keeping the portfolio accessible.', 'Сохранить характер бренда и дать понятный доступ к портфолио.']),
  project('polar-signals', 'Polar Signals', 'https://www.polarsignals.com/', 'platform',
    ['strategy', 'product', 'content', 'conversion'], ['responsive', 'product', 'content'], 'large',
    ['Developer tools', 'Developer tools', 'Инструменты разработчика'],
    ['Złożone narzędzie performance pokazane przez konkretne scenariusze.', 'A complex performance product explained through concrete use cases.', 'Сложный performance‑продукт, объяснённый через конкретные сценарии.'],
    ['Przełożyć techniczną wartość na język zespołów inżynierskich i decyzję o demo.', 'Translate technical value for engineering teams and support a demo decision.', 'Перевести техническую ценность на язык инженерных команд и решение о demo.']),
  project('langbase', 'Langbase', 'https://langbase.com/', 'platform',
    ['strategy', 'product', 'architecture', 'conversion'], ['responsive', 'product', 'motion'], 'wide',
    ['AI developer platform', 'AI developer platform', 'AI-платформа для разработчиков'],
    ['Platforma AI wyjaśniona przez architekturę, narzędzia i przykłady.', 'An AI platform explained through architecture, tools and examples.', 'AI‑платформа, объяснённая через архитектуру, инструменты и примеры.'],
    ['Uprościć wejście w szeroki ekosystem i pokazać, gdzie zacząć budowę.', 'Simplify entry into a broad ecosystem and show where to start building.', 'Упростить вход в экосистему и показать, с чего начать разработку.']),
  project('exa-ai', 'Exa AI', 'https://exa.ai/', 'platform',
    ['strategy', 'product', 'ux', 'conversion'], ['responsive', 'product', 'content'], 'hero',
    ['AI search infrastructure', 'AI search infrastructure', 'AI‑инфраструктура поиска'],
    ['Search API pokazane przez działające przykłady i zastosowania agentów.', 'A search API demonstrated through working examples and agent use cases.', 'Search API, показанный через работающие примеры и сценарии AI‑агентов.'],
    ['Wyjaśnić nową kategorię produktu i szybko doprowadzić developera do testu.', 'Explain a new product category and move a developer quickly toward trying it.', 'Объяснить новую категорию продукта и быстро привести разработчика к тесту.'])
];

/* Some home pages are intentionally almost empty. The card preview uses the
   strongest real captured frame rather than stretching a blank first fold. */
const SHOWCASE_FRAME = Object.freeze({
  agentura: 1,
  'montone-studio': 1
});

function project(slug, title, projectUrl, approachKey, scopeKeys, formatKeys, cardSize, categories, summaries, tasks) {
  return {
    id: slug,
    slug,
    title,
    projectUrl,
    domain: new URL(projectUrl).hostname.replace(/^www\./, ''),
    approachKey,
    scopeKeys,
    formatKeys,
    cardSize,
    categories: localeTuple(categories),
    summaries: localeTuple(summaries),
    tasks: localeTuple(tasks),
    media: [
      `/site/media/portfolio/${slug}/cover.jpg`,
      `/site/media/portfolio/${slug}/detail.jpg`,
      `/site/media/portfolio/${slug}/mobile.jpg`
    ],
    status: 'live',
    checkedAt: '2026-07-11'
  };
}

function localeTuple(values) {
  return { pl: values[0], en: values[1], ru: values[2] };
}

function normalizeLanguage(language) {
  return ['pl', 'en', 'ru'].includes(language) ? language : 'pl';
}

export function getPortfolioProjects(language = 'pl') {
  const activeLanguage = normalizeLanguage(language);
  const scope = SCOPE_LABELS[activeLanguage];
  const formats = FORMAT_LABELS[activeLanguage];
  return PROJECTS.map((item, index) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    projectUrl: item.projectUrl,
    domain: item.domain,
    category: item.categories[activeLanguage],
    summary: item.summaries[activeLanguage],
    shortDescription: item.summaries[activeLanguage],
    task: item.tasks[activeLanguage],
    challenge: item.tasks[activeLanguage],
    approach: APPROACH[activeLanguage][item.approachKey],
    solution: APPROACH[activeLanguage][item.approachKey],
    services: item.scopeKeys.map((key) => scope[key]),
    technologies: item.formatKeys.map((key) => formats[key]),
    media: item.media,
    cover: item.media[SHOWCASE_FRAME[item.slug] ?? 0],
    mobileCover: item.media[2],
    cardSize: item.cardSize,
    priority: index + 1,
    status: item.status,
    projectUrlReachable: true,
    checkedAt: item.checkedAt,
    seo: {
      title: `${item.title} — Aura Global`,
      description: item.summaries[activeLanguage]
    }
  }));
}

export function getProjectById(id, language = 'pl') {
  return getPortfolioProjects(language).find((projectItem) => projectItem.id === id || projectItem.slug === id) || null;
}

export const portfolioSlugs = Object.freeze(PROJECTS.map((item) => item.slug));
