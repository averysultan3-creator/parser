const FALLBACK_LANGUAGE = 'pl';

const siteContent = {
  pl: {
    portfolio: [
      {
        id: 'climatech',
        title: 'Climatech',
        domain: 'climatech.ua',
        category: 'HVAC / Service Website',
        services: ['Website', 'HVAC', 'Lead Generation', 'Service Business'],
        description:
          'Nowoczesna strona usługowa dla firmy od klimatyzacji i HVAC z jasną hierarchią usług oraz wygodnymi ścieżkami kontaktu.',
        result: 'Struktura nastawiona na leady: montaże, serwis, callback i szybkie zapytanie.',
        url: 'https://climatech.ua',
        accent: 'green',
        preview: {
          badge: 'CL',
          eyebrow: 'Service funnel',
          hero: 'HVAC installations',
          stats: ['Quote path', 'Service cards', 'Coverage map']
        }
      },
      {
        id: 'mont-fort',
        title: 'Mont Fort',
        domain: 'mont-fort.com',
        category: 'Construction / Corporate Website',
        services: ['Website', 'Construction', 'Brand Positioning', 'Lead Capture'],
        description:
          'Premium strona firmowa, która pokazuje kompetencje wykonawcze, sygnały zaufania i uporządkowaną ścieżkę kontaktu.',
        result: 'Mocniejsze pozycjonowanie marki i bardziej klarowna prezentacja złożonej oferty.',
        url: 'https://mont-fort.com/',
        accent: 'gold',
        preview: {
          badge: 'MF',
          eyebrow: 'Corporate layout',
          hero: 'Build with confidence',
          stats: ['Project grid', 'Trust proofs', 'Inquiry flow']
        }
      },
      {
        id: 'polar-signals',
        title: 'Polar Signals',
        domain: 'polarsignals.com',
        category: 'B2B SaaS / Developer Platform',
        services: ['SaaS', 'Observability', 'Product UI', 'Conversion UX'],
        description:
          'Techniczna strona produktowa z dopracowaną narracją, wiarygodnością dla enterprise i jasnym przekazem dla developerów.',
        result: 'Lepsze wyjaśnienie złożonej wartości produktu i czytelniejsze ścieżki konwersji.',
        url: 'https://www.polarsignals.com/',
        accent: 'cyan',
        preview: {
          badge: 'PS',
          eyebrow: 'Product story',
          hero: 'Always-on profiling',
          stats: ['Docs CTA', 'Live metrics', 'Trust logos']
        }
      },
      {
        id: 'langbase',
        title: 'Langbase',
        domain: 'langbase.com',
        category: 'AI Platform / Product Website',
        services: ['AI Product', 'Developer UX', 'Website', 'Positioning'],
        description:
          'Prezentacja platformy AI z messagingiem opartym o produkt, nowoczesnym framingiem interfejsu i mocnym onboardingiem dla builderów.',
        result: 'Szybsze zrozumienie wartości produktu i mocniejsze wejście dla nowych użytkowników.',
        url: 'https://langbase.com/',
        accent: 'violet',
        preview: {
          badge: 'LB',
          eyebrow: 'Builder UX',
          hero: 'Ship AI agents',
          stats: ['API-first', 'Examples', 'Docs entry']
        }
      },
      {
        id: 'exa-ai',
        title: 'Exa AI',
        domain: 'exa.ai',
        category: 'AI Search / Product Website',
        services: ['AI Search', 'SaaS', 'Product Marketing', 'Website'],
        description:
          'Strona produktu AI search z pewnym brandingiem, wysokosygnałowym positioningiem technicznym i silnym premium framingiem.',
        result: 'Lepsze połączenie research-grade technologii z konkretnymi scenariuszami biznesowymi.',
        url: 'https://exa.ai/',
        accent: 'lime',
        preview: {
          badge: 'EXA',
          eyebrow: 'AI search',
          hero: 'Search the web for answers',
          stats: ['API product', 'Use cases', 'Research UI']
        }
      }
    ],
    packages: [
      {
        id: 'start',
        name: 'Start',
        price: 'od 400–500 EUR',
        tagline: 'Dla małych firm, które potrzebują profesjonalnego startu.',
        features: [
          'Landing page / prosta strona',
          'Wersja mobilna',
          'Formularz kontaktowy',
          'Podstawowe SEO',
          'Google Maps / linki kontaktowe',
          'Podstawowe teksty'
        ],
        highlighted: false
      },
      {
        id: 'growth',
        name: 'Growth',
        price: 'od 700–900 EUR',
        tagline: 'Dla firm, które chcą porządną stronę i realne zapytania.',
        features: [
          'Pełnowartościowa strona (kilka podstron)',
          'Mocna struktura usług',
          'Portfolio / realizacje',
          'Struktura pod SEO',
          'Sekcje konwersyjne i formularze',
          'Analityka',
          'Mocniejszy design'
        ],
        highlighted: true
      },
      {
        id: 'system',
        name: 'System',
        price: 'od 1200–2500 EUR+',
        tagline: 'Dla firm, które chcą kompletnego systemu pozyskiwania klientów.',
        features: [
          'Strona custom',
          'Landing pages pod reklamy',
          'AI chatbot',
          'CRM / automatyzacje',
          'Panel admina',
          'Integracje custom',
          'Dashboard analityczny'
        ],
        highlighted: false
      }
    ],
    pricingNote:
      'Cena zależy od zakresu, liczby podstron, funkcji, automatyzacji i poziomu indywidualnego projektu. Dlatego najpierw robimy krótką analizę i proponujemy najlepszy wariant.',
    processSteps: [
      { n: '01', title: 'Analiza firmy', text: 'Poznajemy biznes, klientów i konkurencję.' },
      { n: '02', title: 'Pomysł i kierunek', text: 'Proponujemy rozwiązanie, które ma sens — nie wszystko naraz.' },
      { n: '03', title: 'Koncepcja / demo', text: 'Pokazujemy wstępny kierunek wizualny, zanim przejdziemy dalej.' },
      { n: '04', title: 'Realizacja', text: 'Design, teksty i wdrożenie — etapami, z Twoim feedbackiem.' },
      { n: '05', title: 'Testy', text: 'Sprawdzamy szybkość, mobile, formularze i ścieżkę klienta.' },
      { n: '06', title: 'Wdrożenie', text: 'Start na Twojej domenie z analityką od pierwszego dnia.' },
      { n: '07', title: 'Marketing / automatyzacja', text: 'Reklama, Google, AI i automatyzacje — kiedy fundament już stoi.' },
      { n: '08', title: 'Rozwój', text: 'Mierzymy, poprawiamy i rozwijamy system dalej.' }
    ],
    processNotes: [
      'Najpierw rozumiemy biznes klienta. Dopiero potem proponujemy rozwiązanie, wybierając tylko to, co realnie może pomóc.',
      'Przy stronach możemy przygotować wstępny kierunek wizualny lub koncepcję, żeby klient zobaczył, w jakim stylu możemy pracować.',
      'W marketingu skupiamy się na realnym potencjale. Jeśli widzimy, że kampania nie ma sensu na danym etapie, mówimy o tym od razu.'
    ],
    storySteps: [
      {
        id: 'website',
        icon: 'monitor',
        label: 'Website',
        title: 'Strona internetowa, która buduje zaufanie.',
        text: 'Tworzymy strony, które wyglądają dobrze i prowadzą klienta do kontaktu: pokazują ofertę, realizacje, opinie i ułatwiają wysłanie zapytania.',
        accent: 'green'
      },
      {
        id: 'google',
        icon: 'map-pin',
        label: 'Google',
        title: 'Widoczność tam, gdzie klienci szukają usług.',
        text: 'Pomagamy firmom lepiej wyglądać w Google, Mapach Google i wynikach wyszukiwania, żeby klient szybciej znalazł właściwą usługę.',
        accent: 'cyan'
      },
      {
        id: 'ads',
        icon: 'mouse-pointer-click',
        label: 'Ads',
        title: 'Reklamy ustawione tak, aby przynosiły realne zapytania.',
        text: 'Google Ads i Meta Ads projektujemy tak, żeby prowadziły użytkownika do konkretnego działania: telefonu, formularza, rezerwacji lub rozmowy.',
        accent: 'lime'
      },
      {
        id: 'ai',
        icon: 'bot',
        label: 'AI Chat',
        title: 'AI, które pomaga obsługiwać klientów szybciej.',
        text: 'Chatboty AI mogą odpowiadać na pytania, zbierać dane, kwalifikować zapytania i przekazywać klienta dalej do odpowiedniej osoby.',
        accent: 'violet'
      },
      {
        id: 'automations',
        icon: 'workflow',
        label: 'Automations',
        title: 'Automatyzacje, które oszczędzają czas.',
        text: 'Łączymy formularze, CRM, wiadomości, zadania, raporty i follow-upy w jeden proces, żeby firma nie traciła leadów.',
        accent: 'gold'
      }
    ],
    storyFinal:
      'Nie budujemy pojedynczych elementów. Budujemy system, który pomaga firmie zdobywać i obsługiwać klientów.',
    whyUs: [
      {
        icon: 'compass',
        title: 'Strategia przed designem',
        text: 'Najpierw rozumiemy biznes, potem projektujemy.'
      },
      {
        icon: 'layers',
        title: 'Strona + marketing + AI',
        text: 'Łączymy elementy, które normalnie działają osobno.'
      },
      {
        icon: 'phone-call',
        title: 'Skupienie na zapytaniach',
        text: 'Projektujemy pod kontakt, telefon, formularz i rezerwację.'
      },
      {
        icon: 'timer',
        title: 'Automatyzacje',
        text: 'Pomagamy oszczędzać czas i nie tracić leadów.'
      },
      {
        icon: 'message-circle',
        title: 'Prosty język',
        text: 'Bez żargonu. Mówimy, co robimy i po co.'
      },
      {
        icon: 'trending-up',
        title: 'Start mały, rozwój dalej',
        text: 'Możemy zacząć od mniejszego projektu i rozwijać system krok po kroku.'
      }
    ],
    quizSteps: [
      {
        id: 'need',
        question: 'Czego potrzebujesz?',
        multi: true,
        options: [
          { id: 'website', label: 'Strona internetowa', icon: 'monitor' },
          { id: 'ads', label: 'Reklama', icon: 'megaphone' },
          { id: 'seo', label: 'SEO', icon: 'search' },
          { id: 'ai-chatbot', label: 'AI chatbot', icon: 'bot' },
          { id: 'automation', label: 'Automatyzacja', icon: 'workflow' },
          { id: 'analysis', label: 'Nie wiem, chcę analizę', icon: 'help-circle' }
        ]
      },
      {
        id: 'businessType',
        question: 'Jaki typ biznesu prowadzisz?',
        multi: false,
        options: [
          { id: 'local-services', label: 'Usługi lokalne', icon: 'map-pin' },
          { id: 'ecommerce', label: 'E-commerce', icon: 'shopping-cart' },
          { id: 'b2b', label: 'B2B', icon: 'briefcase' },
          { id: 'education', label: 'Edukacja', icon: 'graduation-cap' },
          { id: 'beauty-health', label: 'Beauty / health', icon: 'sparkles' },
          { id: 'other', label: 'Inne', icon: 'more-horizontal' }
        ]
      },
      {
        id: 'hasWebsite',
        question: 'Czy masz już stronę internetową?',
        multi: false,
        options: [
          { id: 'none', label: 'Nie mam', icon: 'x-circle' },
          { id: 'old', label: 'Mam, ale jest stara', icon: 'history' },
          { id: 'not-working', label: 'Mam, ale nie daje zapytań', icon: 'trending-down' },
          { id: 'good', label: 'Mam dobrą stronę', icon: 'check-circle' }
        ]
      },
      {
        id: 'goal',
        question: 'Jaki jest główny cel?',
        multi: false,
        options: [
          { id: 'more-calls', label: 'Więcej telefonów', icon: 'phone-call' },
          { id: 'more-forms', label: 'Więcej formularzy', icon: 'clipboard-list' },
          { id: 'more-bookings', label: 'Więcej rezerwacji', icon: 'calendar-check' },
          { id: 'better-brand', label: 'Lepszy wizerunek', icon: 'gem' },
          { id: 'automation', label: 'Automatyzacja pracy', icon: 'workflow' }
        ]
      },
      {
        id: 'budget',
        question: 'Jaki budżet rozważasz?',
        multi: false,
        options: [
          { id: 'under-500', label: 'do 500 EUR', icon: 'coins' },
          { id: '500-800', label: '500–800 EUR', icon: 'coins' },
          { id: '800-1500', label: '800–1500 EUR', icon: 'coins' },
          { id: '1500-plus', label: '1500+ EUR', icon: 'coins' },
          { id: 'unknown', label: 'Nie wiem', icon: 'help-circle' }
        ]
      }
    ],
    contactInfo: {
      company: 'Aura Global',
      tagline: 'Budujemy cyfrowe systemy, które zamieniają ruch w klientów.',
      email: 'marketing@auraglobal-merchants.com',
      phone: '+48 793 536 034'
    },
    marqueeItems: [
      'Strony internetowe',
      'SEO',
      'Google Ads',
      'Meta Ads',
      'AI Chatbot',
      'Automatyzacje',
      'CRM',
      'Landing pages',
      'Google Business',
      'Analityka',
      'Systemy rezerwacji',
      'Dashboardy',
      'Branding',
      'E-commerce'
    ]
  },
  en: {
    portfolio: [
      {
        id: 'climatech',
        title: 'Climatech',
        domain: 'climatech.ua',
        category: 'HVAC / Service Website',
        services: ['Website', 'HVAC', 'Lead Generation', 'Service Business'],
        description:
          'Modern service website for a climate and HVAC company with a clear service hierarchy and fast enquiry routes.',
        result: 'Lead-first structure for installations, maintenance, callbacks and fast contact capture.',
        url: 'https://climatech.ua',
        accent: 'green',
        preview: {
          badge: 'CL',
          eyebrow: 'Service funnel',
          hero: 'HVAC installations',
          stats: ['Quote path', 'Service cards', 'Coverage map']
        }
      },
      {
        id: 'mont-fort',
        title: 'Mont Fort',
        domain: 'mont-fort.com',
        category: 'Construction / Corporate Website',
        services: ['Website', 'Construction', 'Brand Positioning', 'Lead Capture'],
        description:
          'Premium corporate website that communicates delivery capability, trust signals and a structured contact flow.',
        result: 'Sharper brand positioning and a clearer executive-level presentation of a complex offer.',
        url: 'https://mont-fort.com/',
        accent: 'gold',
        preview: {
          badge: 'MF',
          eyebrow: 'Corporate layout',
          hero: 'Build with confidence',
          stats: ['Project grid', 'Trust proofs', 'Inquiry flow']
        }
      },
      {
        id: 'polar-signals',
        title: 'Polar Signals',
        domain: 'polarsignals.com',
        category: 'B2B SaaS / Developer Platform',
        services: ['SaaS', 'Observability', 'Product UI', 'Conversion UX'],
        description:
          'Technical product website with a polished product narrative, enterprise trust and developer-first clarity.',
        result: 'A clearer explanation of complex product value and stronger conversion entry points.',
        url: 'https://www.polarsignals.com/',
        accent: 'cyan',
        preview: {
          badge: 'PS',
          eyebrow: 'Product story',
          hero: 'Always-on profiling',
          stats: ['Docs CTA', 'Live metrics', 'Trust logos']
        }
      },
      {
        id: 'langbase',
        title: 'Langbase',
        domain: 'langbase.com',
        category: 'AI Platform / Product Website',
        services: ['AI Product', 'Developer UX', 'Website', 'Positioning'],
        description:
          'AI platform showcase with product-led messaging, modern interface framing and strong onboarding cues for builders.',
        result: 'Faster value comprehension and stronger entry points for new product users.',
        url: 'https://langbase.com/',
        accent: 'violet',
        preview: {
          badge: 'LB',
          eyebrow: 'Builder UX',
          hero: 'Ship AI agents',
          stats: ['API-first', 'Examples', 'Docs entry']
        }
      },
      {
        id: 'exa-ai',
        title: 'Exa AI',
        domain: 'exa.ai',
        category: 'AI Search / Product Website',
        services: ['AI Search', 'SaaS', 'Product Marketing', 'Website'],
        description:
          'AI search product website with confident branding, high-signal technical positioning and strong premium framing.',
        result: 'A cleaner bridge between research-grade technology and practical commercial use cases.',
        url: 'https://exa.ai/',
        accent: 'lime',
        preview: {
          badge: 'EXA',
          eyebrow: 'AI search',
          hero: 'Search the web for answers',
          stats: ['API product', 'Use cases', 'Research UI']
        }
      }
    ],
    packages: [
      {
        id: 'start',
        name: 'Start',
        price: 'from 400–500 EUR',
        tagline: 'For smaller companies that need a professional launch.',
        features: [
          'Landing page / basic website',
          'Mobile version',
          'Contact form',
          'Basic SEO',
          'Google Maps / contact links',
          'Basic copy'
        ],
        highlighted: false
      },
      {
        id: 'growth',
        name: 'Growth',
        price: 'from 700–900 EUR',
        tagline: 'For companies that want a serious website and real enquiries.',
        features: [
          'Full website with multiple pages',
          'Strong service structure',
          'Portfolio / case studies',
          'SEO-ready structure',
          'Conversion sections and forms',
          'Analytics',
          'Stronger design layer'
        ],
        highlighted: true
      },
      {
        id: 'system',
        name: 'System',
        price: 'from 1200–2500 EUR+',
        tagline: 'For companies that want a complete client acquisition system.',
        features: [
          'Custom website',
          'Landing pages for ads',
          'AI chatbot',
          'CRM / automations',
          'Admin panel',
          'Custom integrations',
          'Analytics dashboard'
        ],
        highlighted: false
      }
    ],
    pricingNote:
      'The final price depends on scope, number of pages, features, automations and the level of custom work. That is why we start with a short analysis and then propose the right option.',
    processSteps: [
      { n: '01', title: 'Business analysis', text: 'We learn the business, the clients and the competitive context.' },
      { n: '02', title: 'Direction and strategy', text: 'We suggest the solution that makes sense — not everything at once.' },
      { n: '03', title: 'Concept / demo', text: 'We show an early visual direction before moving deeper.' },
      { n: '04', title: 'Execution', text: 'Design, copy and implementation — in clear stages with feedback.' },
      { n: '05', title: 'Testing', text: 'We verify speed, mobile, forms and the full user path.' },
      { n: '06', title: 'Launch', text: 'We go live on your domain with analytics from day one.' },
      { n: '07', title: 'Marketing / automations', text: 'Ads, Google, AI and automations — once the core is ready.' },
      { n: '08', title: 'Growth', text: 'We measure, improve and continue building the system.' }
    ],
    processNotes: [
      'We first understand the client’s business. Only then do we propose a solution, choosing only what can genuinely help.',
      'For websites, we can prepare an initial visual direction or concept so the client sees the style before full production.',
      'In marketing, we focus on real potential. If a campaign does not make sense at the current stage, we say it directly.'
    ],
    storySteps: [
      {
        id: 'website',
        icon: 'monitor',
        label: 'Website',
        title: 'A website that builds trust.',
        text: 'We create websites that do more than look good. They guide the client toward contact with the right offer, proof and next step.',
        accent: 'green'
      },
      {
        id: 'google',
        icon: 'map-pin',
        label: 'Google',
        title: 'Visibility where clients search for services.',
        text: 'We help companies show up better in Google, Google Maps and search results so the right client finds the right service faster.',
        accent: 'cyan'
      },
      {
        id: 'ads',
        icon: 'mouse-pointer-click',
        label: 'Ads',
        title: 'Ads built to bring real enquiries.',
        text: 'We structure Google Ads and Meta Ads to lead the user toward a specific action: a call, form, booking or sales conversation.',
        accent: 'lime'
      },
      {
        id: 'ai',
        icon: 'bot',
        label: 'AI Chat',
        title: 'AI that helps your team handle clients faster.',
        text: 'AI chatbots can answer questions, collect data, qualify demand and route the prospect to the right person.',
        accent: 'violet'
      },
      {
        id: 'automations',
        icon: 'workflow',
        label: 'Automations',
        title: 'Automations that save time.',
        text: 'We connect forms, CRM, messages, tasks, reports and follow-ups into one process so the business stops losing leads.',
        accent: 'gold'
      }
    ],
    storyFinal:
      'We do not build isolated pieces. We build a system that helps a company win and handle clients.',
    whyUs: [
      { icon: 'compass', title: 'Strategy before design', text: 'We understand the business first, then we design.' },
      { icon: 'layers', title: 'Website + marketing + AI', text: 'We connect elements that usually live in separate silos.' },
      { icon: 'phone-call', title: 'Built around enquiries', text: 'We design for calls, forms, bookings and real contact.' },
      { icon: 'timer', title: 'Automations', text: 'We help teams save time and stop losing leads.' },
      { icon: 'message-circle', title: 'Plain language', text: 'No jargon. We explain what we do and why it matters.' },
      { icon: 'trending-up', title: 'Start lean, scale later', text: 'We can begin with a smaller project and expand the system step by step.' }
    ],
    quizSteps: [
      {
        id: 'need',
        question: 'What do you need?',
        multi: true,
        options: [
          { id: 'website', label: 'Website', icon: 'monitor' },
          { id: 'ads', label: 'Advertising', icon: 'megaphone' },
          { id: 'seo', label: 'SEO', icon: 'search' },
          { id: 'ai-chatbot', label: 'AI chatbot', icon: 'bot' },
          { id: 'automation', label: 'Automation', icon: 'workflow' },
          { id: 'analysis', label: 'Not sure, I need an analysis', icon: 'help-circle' }
        ]
      },
      {
        id: 'businessType',
        question: 'What kind of business do you run?',
        multi: false,
        options: [
          { id: 'local-services', label: 'Local services', icon: 'map-pin' },
          { id: 'ecommerce', label: 'E-commerce', icon: 'shopping-cart' },
          { id: 'b2b', label: 'B2B', icon: 'briefcase' },
          { id: 'education', label: 'Education', icon: 'graduation-cap' },
          { id: 'beauty-health', label: 'Beauty / health', icon: 'sparkles' },
          { id: 'other', label: 'Other', icon: 'more-horizontal' }
        ]
      },
      {
        id: 'hasWebsite',
        question: 'Do you already have a website?',
        multi: false,
        options: [
          { id: 'none', label: 'No', icon: 'x-circle' },
          { id: 'old', label: 'Yes, but it is outdated', icon: 'history' },
          { id: 'not-working', label: 'Yes, but it does not bring enquiries', icon: 'trending-down' },
          { id: 'good', label: 'Yes, and it is solid', icon: 'check-circle' }
        ]
      },
      {
        id: 'goal',
        question: 'What is the main goal?',
        multi: false,
        options: [
          { id: 'more-calls', label: 'More phone calls', icon: 'phone-call' },
          { id: 'more-forms', label: 'More form submissions', icon: 'clipboard-list' },
          { id: 'more-bookings', label: 'More bookings', icon: 'calendar-check' },
          { id: 'better-brand', label: 'Stronger brand image', icon: 'gem' },
          { id: 'automation', label: 'Work automation', icon: 'workflow' }
        ]
      },
      {
        id: 'budget',
        question: 'What budget range are you considering?',
        multi: false,
        options: [
          { id: 'under-500', label: 'up to 500 EUR', icon: 'coins' },
          { id: '500-800', label: '500–800 EUR', icon: 'coins' },
          { id: '800-1500', label: '800–1500 EUR', icon: 'coins' },
          { id: '1500-plus', label: '1500+ EUR', icon: 'coins' },
          { id: 'unknown', label: 'Not sure yet', icon: 'help-circle' }
        ]
      }
    ],
    contactInfo: {
      company: 'Aura Global',
      tagline: 'We build digital systems that turn traffic into clients.',
      email: 'kontakt@auraglobal-merchants.com',
      phone: '+48 793 536 034'
    },
    marqueeItems: [
      'Websites',
      'SEO',
      'Google Ads',
      'Meta Ads',
      'AI Chatbot',
      'Automations',
      'CRM',
      'Landing pages',
      'Google Business',
      'Analytics',
      'Booking systems',
      'Dashboards',
      'Branding',
      'E-commerce'
    ]
  },
  ru: {
    portfolio: [
      {
        id: 'climatech',
        title: 'Climatech',
        domain: 'climatech.ua',
        category: 'HVAC / Сервисный сайт',
        services: ['Сайт', 'HVAC', 'Лидогенерация', 'Сервисный бизнес'],
        description:
          'Современный сервисный сайт для компании по климату и HVAC с понятной структурой услуг и быстрыми сценариями обращения.',
        result: 'Структура под лиды: монтаж, сервис, обратный звонок и быстрый захват заявки.',
        url: 'https://climatech.ua',
        accent: 'green',
        preview: {
          badge: 'CL',
          eyebrow: 'Service funnel',
          hero: 'HVAC installations',
          stats: ['Quote path', 'Service cards', 'Coverage map']
        }
      },
      {
        id: 'mont-fort',
        title: 'Mont Fort',
        domain: 'mont-fort.com',
        category: 'Строительство / Корпоративный сайт',
        services: ['Сайт', 'Construction', 'Brand Positioning', 'Lead Capture'],
        description:
          'Премиальный корпоративный сайт, который уверенно показывает экспертизу, сигналы доверия и удобный контактный сценарий.',
        result: 'Более сильное позиционирование бренда и понятная подача сложной услуги на уровне decision-makers.',
        url: 'https://mont-fort.com/',
        accent: 'gold',
        preview: {
          badge: 'MF',
          eyebrow: 'Corporate layout',
          hero: 'Build with confidence',
          stats: ['Project grid', 'Trust proofs', 'Inquiry flow']
        }
      },
      {
        id: 'polar-signals',
        title: 'Polar Signals',
        domain: 'polarsignals.com',
        category: 'B2B SaaS / Платформа для разработчиков',
        services: ['SaaS', 'Observability', 'Product UI', 'Conversion UX'],
        description:
          'Технический продуктовый сайт с сильной narrative-структурой, доверием для enterprise и ясной подачей для разработчиков.',
        result: 'Сложная ценность продукта объясняется быстрее, а входы в конверсию стали понятнее.',
        url: 'https://www.polarsignals.com/',
        accent: 'cyan',
        preview: {
          badge: 'PS',
          eyebrow: 'Product story',
          hero: 'Always-on profiling',
          stats: ['Docs CTA', 'Live metrics', 'Trust logos']
        }
      },
      {
        id: 'langbase',
        title: 'Langbase',
        domain: 'langbase.com',
        category: 'AI Platform / Продуктовый сайт',
        services: ['AI Product', 'Developer UX', 'Website', 'Positioning'],
        description:
          'Витрина AI-платформы с продуктовой подачей, современным UI-фреймингом и сильным онбордингом для builders.',
        result: 'Пользователь быстрее понимает ценность продукта и видит понятные точки входа.',
        url: 'https://langbase.com/',
        accent: 'violet',
        preview: {
          badge: 'LB',
          eyebrow: 'Builder UX',
          hero: 'Ship AI agents',
          stats: ['API-first', 'Examples', 'Docs entry']
        }
      },
      {
        id: 'exa-ai',
        title: 'Exa AI',
        domain: 'exa.ai',
        category: 'AI Search / Продуктовый сайт',
        services: ['AI Search', 'SaaS', 'Product Marketing', 'Website'],
        description:
          'Сайт AI search-продукта с сильным брендингом, техническим позиционированием и дорогой продуктовой подачей.',
        result: 'Технология research-grade связывается с реальными коммерческими сценариями заметно понятнее.',
        url: 'https://exa.ai/',
        accent: 'lime',
        preview: {
          badge: 'EXA',
          eyebrow: 'AI search',
          hero: 'Search the web for answers',
          stats: ['API product', 'Use cases', 'Research UI']
        }
      }
    ],
    packages: [
      {
        id: 'start',
        name: 'Start',
        price: 'от 400–500 EUR',
        tagline: 'Для небольших компаний, которым нужен сильный профессиональный старт.',
        features: [
          'Лендинг / базовый сайт',
          'Мобильная версия',
          'Форма контакта',
          'Базовое SEO',
          'Google Maps / контактные ссылки',
          'Базовые тексты'
        ],
        highlighted: false
      },
      {
        id: 'growth',
        name: 'Growth',
        price: 'от 700–900 EUR',
        tagline: 'Для компаний, которым нужен сильный сайт и реальные заявки.',
        features: [
          'Полноценный сайт на несколько страниц',
          'Сильная структура услуг',
          'Портфолио / кейсы',
          'SEO-структура',
          'Конверсионные блоки и формы',
          'Аналитика',
          'Более сильный визуал'
        ],
        highlighted: true
      },
      {
        id: 'system',
        name: 'System',
        price: 'от 1200–2500 EUR+',
        tagline: 'Для компаний, которым нужна полноценная система привлечения клиентов.',
        features: [
          'Кастомный сайт',
          'Лендинги под рекламу',
          'AI chatbot',
          'CRM / автоматизации',
          'Админ-панель',
          'Кастомные интеграции',
          'Аналитический дашборд'
        ],
        highlighted: false
      }
    ],
    pricingNote:
      'Финальная цена зависит от объёма, количества страниц, функций, автоматизаций и степени кастомизации. Поэтому сначала мы делаем короткий разбор и только потом предлагаем правильный вариант.',
    processSteps: [
      { n: '01', title: 'Разбор бизнеса', text: 'Погружаемся в бизнес, клиентов и конкурентную среду.' },
      { n: '02', title: 'Направление и стратегия', text: 'Предлагаем решение, которое реально имеет смысл — без перегруза.' },
      { n: '03', title: 'Концепт / демо', text: 'Показываем начальное визуальное направление до глубокого продакшна.' },
      { n: '04', title: 'Реализация', text: 'Дизайн, тексты и разработка — поэтапно, с понятной обратной связью.' },
      { n: '05', title: 'Тестирование', text: 'Проверяем скорость, mobile, формы и полный путь пользователя.' },
      { n: '06', title: 'Запуск', text: 'Выходим на вашу доменную зону с аналитикой с первого дня.' },
      { n: '07', title: 'Маркетинг / автоматизации', text: 'Реклама, Google, AI и автоматизации — когда фундамент уже готов.' },
      { n: '08', title: 'Рост', text: 'Измеряем, улучшаем и развиваем систему дальше.' }
    ],
    processNotes: [
      'Сначала мы понимаем бизнес клиента. Только после этого предлагаем решение, выбирая то, что реально может помочь.',
      'Для сайтов мы можем подготовить предварительное визуальное направление или концепт, чтобы клиент заранее увидел стиль.',
      'В маркетинге мы смотрим на реальный потенциал. Если кампания сейчас не имеет смысла, мы говорим об этом сразу.'
    ],
    storySteps: [
      {
        id: 'website',
        icon: 'monitor',
        label: 'Website',
        title: 'Сайт, который вызывает доверие.',
        text: 'Мы делаем сайты, которые красиво выглядят и ведут клиента к контакту через понятную оферту, кейсы, доверие и следующий шаг.',
        accent: 'green'
      },
      {
        id: 'google',
        icon: 'map-pin',
        label: 'Google',
        title: 'Видимость там, где клиенты ищут услугу.',
        text: 'Помогаем компании лучше выглядеть в Google, Google Maps и поиске, чтобы нужный клиент быстрее находил нужную услугу.',
        accent: 'cyan'
      },
      {
        id: 'ads',
        icon: 'mouse-pointer-click',
        label: 'Ads',
        title: 'Реклама, нацеленная на реальные заявки.',
        text: 'Google Ads и Meta Ads проектируются так, чтобы вести пользователя к конкретному действию: звонку, форме, бронированию или диалогу.',
        accent: 'lime'
      },
      {
        id: 'ai',
        icon: 'bot',
        label: 'AI Chat',
        title: 'AI, который помогает команде быстрее обрабатывать клиентов.',
        text: 'AI-чатботы отвечают на вопросы, собирают данные, квалифицируют спрос и передают клиента правильному человеку.',
        accent: 'violet'
      },
      {
        id: 'automations',
        icon: 'workflow',
        label: 'Automations',
        title: 'Автоматизации, которые экономят время.',
        text: 'Мы связываем формы, CRM, сообщения, задачи, отчёты и follow-up в один процесс, чтобы бизнес не терял лиды.',
        accent: 'gold'
      }
    ],
    storyFinal:
      'Мы не собираем отдельные куски. Мы строим систему, которая помогает бизнесу получать и удерживать клиентов.',
    whyUs: [
      { icon: 'compass', title: 'Стратегия до дизайна', text: 'Сначала понимаем бизнес, потом проектируем решение.' },
      { icon: 'layers', title: 'Сайт + маркетинг + AI', text: 'Соединяем то, что обычно работает разрозненно.' },
      { icon: 'phone-call', title: 'Фокус на заявках', text: 'Проектируем под звонок, форму, бронь и реальный контакт.' },
      { icon: 'timer', title: 'Автоматизации', text: 'Помогаем экономить время и не терять лиды.' },
      { icon: 'message-circle', title: 'Понятный язык', text: 'Без канцелярита. Объясняем просто, что делаем и зачем.' },
      { icon: 'trending-up', title: 'Можно начать с малого', text: 'Запускаем небольшой проект и потом развиваем систему дальше.' }
    ],
    quizSteps: [
      {
        id: 'need',
        question: 'Что вам нужно?',
        multi: true,
        options: [
          { id: 'website', label: 'Сайт', icon: 'monitor' },
          { id: 'ads', label: 'Реклама', icon: 'megaphone' },
          { id: 'seo', label: 'SEO', icon: 'search' },
          { id: 'ai-chatbot', label: 'AI chatbot', icon: 'bot' },
          { id: 'automation', label: 'Автоматизация', icon: 'workflow' },
          { id: 'analysis', label: 'Не уверен, нужен разбор', icon: 'help-circle' }
        ]
      },
      {
        id: 'businessType',
        question: 'Какой у вас тип бизнеса?',
        multi: false,
        options: [
          { id: 'local-services', label: 'Локальные услуги', icon: 'map-pin' },
          { id: 'ecommerce', label: 'E-commerce', icon: 'shopping-cart' },
          { id: 'b2b', label: 'B2B', icon: 'briefcase' },
          { id: 'education', label: 'Обучение', icon: 'graduation-cap' },
          { id: 'beauty-health', label: 'Beauty / health', icon: 'sparkles' },
          { id: 'other', label: 'Другое', icon: 'more-horizontal' }
        ]
      },
      {
        id: 'hasWebsite',
        question: 'У вас уже есть сайт?',
        multi: false,
        options: [
          { id: 'none', label: 'Нет', icon: 'x-circle' },
          { id: 'old', label: 'Есть, но устарел', icon: 'history' },
          { id: 'not-working', label: 'Есть, но не даёт заявок', icon: 'trending-down' },
          { id: 'good', label: 'Есть, и он хороший', icon: 'check-circle' }
        ]
      },
      {
        id: 'goal',
        question: 'Какая главная цель?',
        multi: false,
        options: [
          { id: 'more-calls', label: 'Больше звонков', icon: 'phone-call' },
          { id: 'more-forms', label: 'Больше заявок через формы', icon: 'clipboard-list' },
          { id: 'more-bookings', label: 'Больше бронирований', icon: 'calendar-check' },
          { id: 'better-brand', label: 'Сильнее имидж', icon: 'gem' },
          { id: 'automation', label: 'Автоматизация работы', icon: 'workflow' }
        ]
      },
      {
        id: 'budget',
        question: 'Какой бюджет рассматриваете?',
        multi: false,
        options: [
          { id: 'under-500', label: 'до 500 EUR', icon: 'coins' },
          { id: '500-800', label: '500–800 EUR', icon: 'coins' },
          { id: '800-1500', label: '800–1500 EUR', icon: 'coins' },
          { id: '1500-plus', label: '1500+ EUR', icon: 'coins' },
          { id: 'unknown', label: 'Пока не знаю', icon: 'help-circle' }
        ]
      }
    ],
    contactInfo: {
      company: 'Aura Global',
      tagline: 'Строим цифровые системы, которые превращают трафик в клиентов.',
      email: 'kontakt@auraglobal-merchants.com',
      phone: '+48 793 536 034'
    },
    marqueeItems: [
      'Сайты',
      'SEO',
      'Google Ads',
      'Meta Ads',
      'AI Chatbot',
      'Автоматизации',
      'CRM',
      'Landing pages',
      'Google Business',
      'Аналитика',
      'Системы бронирования',
      'Дашборды',
      'Брендинг',
      'E-commerce'
    ]
  }
};

function normalizeLanguage(language) {
  return ['pl', 'en', 'ru'].includes(language) ? language : FALLBACK_LANGUAGE;
}

export function getSiteContent(language = FALLBACK_LANGUAGE) {
  return siteContent[normalizeLanguage(language)] || siteContent[FALLBACK_LANGUAGE];
}

const defaultContent = getSiteContent(FALLBACK_LANGUAGE);

export const portfolio = defaultContent.portfolio;
export const packages = defaultContent.packages;
export const pricingNote = defaultContent.pricingNote;
export const processSteps = defaultContent.processSteps;
export const processNotes = defaultContent.processNotes;
export const storySteps = defaultContent.storySteps;
export const storyFinal = defaultContent.storyFinal;
export const whyUs = defaultContent.whyUs;
export const quizSteps = defaultContent.quizSteps;
export const contactInfo = defaultContent.contactInfo;
export const marqueeItems = defaultContent.marqueeItems;
