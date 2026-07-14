// Lead-qualification training cards ("dobry lead / słaby lead / nie dzwonić")
// plus serviceMatchCases: short scenario -> which service(s) actually fit.
export const QUALIFICATION_LEADS = [
  {
    "name": "Klimatyzacja Nowak Warszawa",
    "facts": {
      "pl": [
        "47 opinii, ocena 4.8",
        "Brak własnej strony",
        "Telefon widoczny",
        "Aktywny sezon"
      ],
      "ru": [
        "47 отзывов, рейтинг 4.8",
        "Нет собственного сайта",
        "Телефон виден",
        "Активный сезон"
      ]
    },
    "answer": "good",
    "why": {
      "pl": "Dobry lead: usługa lokalna, opinie, telefon i brak strony. Jest konkretny powód rozmowy.",
      "ru": "Хороший лид: локальная услуга, отзывы, телефон и отсутствие сайта. Есть конкретный повод для разговора."
    }
  },
  {
    "name": "Studio brandingowe premium",
    "facts": {
      "pl": [
        "Nowoczesna strona",
        "Silny Instagram",
        "Nie jest lokalną usługą dla obecnego parsera"
      ],
      "ru": [
        "Современный сайт",
        "Сильный Instagram",
        "Не локальная услуга для текущего парсера"
      ]
    },
    "answer": "weak",
    "why": {
      "pl": "Słabszy lead dla callera od stron lokalnych. Może być B2B, ale nie jest priorytetem.",
      "ru": "Более слабый лид для callera локальных услуг. Может быть B2B, но не приоритет."
    }
  },
  {
    "name": "Firma bez telefonu i bez profilu",
    "facts": {
      "pl": [
        "Brak numeru",
        "Brak strony",
        "Brak aktywności",
        "Nie wiadomo czy działa"
      ],
      "ru": [
        "Нет номера",
        "Нет сайта",
        "Нет активности",
        "Неизвестно, работает ли компания"
      ]
    },
    "answer": "skip",
    "why": {
      "pl": "Nie dzwonimy, jeśli nie ma kontaktu i sygnałów aktywności.",
      "ru": "Не звоним, если нет контакта и признаков активности."
    }
  },
  {
    "name": "Restauracja U Krystyny Warszawa",
    "facts": {
      "pl": [
        "Strona zrobiona w Wixie z 2018 roku, nie działa dobrze na telefonie",
        "Brak przycisku do rezerwacji online",
        "210 opinii, ocena 4.6",
        "Codziennie nowe zdjęcia dań na Instagramie"
      ],
      "ru": [
        "Сайт сделан на Wix в 2018 году, плохо работает на телефоне",
        "Нет кнопки онлайн-бронирования",
        "210 отзывов, рейтинг 4.6",
        "Каждый день новые фото блюд в Instagram"
      ]
    },
    "answer": "good",
    "why": {
      "pl": "Dobry lead: biznes wyraźnie żyje i ma ruch (Instagram, opinie), ale strona jest stara i nie działa na telefonie, więc traci rezerwacje - jest o czym rozmawiać.",
      "ru": "Хороший лид: бизнес явно живёт и активен (Instagram, отзывы), но сайт старый и не работает на телефоне — теряют бронирования, есть конкретный повод для разговора."
    }
  },
  {
    "name": "Auto-Serwis Kowalczyk",
    "facts": {
      "pl": [
        "Brak własnej strony",
        "Wizytówka Google: 89 opinii, ocena 4.7",
        "Telefon odebrany po 2 sygnałach",
        "W tle słychać pracujący warsztat"
      ],
      "ru": [
        "Нет собственного сайта",
        "Профиль Google: 89 отзывов, рейтинг 4.7",
        "Трубку взяли после 2 гудков",
        "На фоне слышно работающую мастерскую"
      ]
    },
    "answer": "good",
    "why": {
      "pl": "Klasyczny dobry lead: opinie i realna aktywność są, telefon działa i szybko odbierają, a strony po prostu nie ma.",
      "ru": "Классический хороший лид: отзывы и реальная активность есть, телефон работает и быстро отвечают, а сайта просто нет."
    }
  },
  {
    "name": "Chic Hair Studio - salon fryzjerski",
    "facts": {
      "pl": [
        "Strona istnieje, ale na telefonie menu się rozjeżdża i trzeba szczypać ekran",
        "4.9 na 165 opinii",
        "Kilka postów w tygodniu na Facebooku",
        "Brak jakiejkolwiek możliwości zapisu online"
      ],
      "ru": [
        "Сайт есть, но на телефоне меню съезжает, приходится масштабировать экран",
        "4.9 из 165 отзывов",
        "Несколько постов в неделю в Facebook",
        "Нет никакой возможности записаться онлайн"
      ]
    },
    "answer": "good",
    "why": {
      "pl": "Strona technicznie istnieje, ale jest praktycznie bezużyteczna na telefonie, a większość klientek i tak zapisuje się z telefonu. Silny, aktywny biznes z konkretnym problemem do naprawienia.",
      "ru": "Сайт технически есть, но практически бесполезен на телефоне — а большинство клиенток и так записываются с телефона. Сильный, активный бизнес с конкретной проблемой, которую можно решить."
    }
  },
  {
    "name": "DentPro Kraków - gabinet stomatologiczny",
    "facts": {
      "pl": [
        "Strona wygląda jak sprzed dekady",
        "Formularz kontaktowy zwraca błąd przy wysyłce",
        "152 opinie, ocena 4.8",
        "5 nowych opinii w tym miesiącu"
      ],
      "ru": [
        "Сайт выглядит так, будто ему десять лет",
        "Форма обратной связи выдаёт ошибку при отправке",
        "152 отзыва, рейтинг 4.8",
        "5 новых отзывов за этот месяц"
      ]
    },
    "answer": "good",
    "why": {
      "pl": "Konkretny, namacalny problem techniczny (formularz nie działa) plus świeże opinie pokazujące, że gabinet ma teraz pacjentów - mocny argument do rozmowy.",
      "ru": "Конкретная, ощутимая техническая проблема (форма не работает) плюс свежие отзывы, показывающие, что клиника сейчас принимает пациентов, — сильный аргумент для разговора."
    }
  },
  {
    "name": "CleanTeam Wrocław - firma sprzątająca biura",
    "facts": {
      "pl": [
        "Brak strony internetowej",
        "5 oklejonych logo aut widocznych na mieście",
        "Aktywne ogłoszenie o pracę dla sprzątaczek na OLX",
        "Telefon widoczny na wizytówce Google"
      ],
      "ru": [
        "Нет сайта",
        "5 машин с логотипом компании на улицах города",
        "Активное объявление о найме уборщиц на OLX",
        "Телефон виден в профиле Google"
      ]
    },
    "answer": "good",
    "why": {
      "pl": "Firma rośnie i inwestuje (flota, rekrutacja), a strony wciąż nie ma - to sygnał, że mają budżet i realną potrzebę, nie tylko teoretyczną.",
      "ru": "Компания растёт и инвестирует (автопарк, набор персонала), а сайта до сих пор нет — сигнал, что у них есть бюджет и реальная потребность, а не только теоретическая."
    }
  },
  {
    "name": "English Now - szkoła językowa",
    "facts": {
      "pl": [
        "Strona nie aktualizowana od 3 lat",
        "Ostatni post na Facebooku sprzed 2 lat",
        "Ale 6 nowych opinii w ostatnim miesiącu",
        "Telefon odebrany od razu"
      ],
      "ru": [
        "Сайт не обновлялся 3 года",
        "Последний пост в Facebook два года назад",
        "Но 6 новых отзывов за последний месяц",
        "Трубку взяли сразу"
      ]
    },
    "answer": "good",
    "why": {
      "pl": "Strona i social media wyglądają na porzucone, ale świeże opinie i szybki odbiór telefonu pokazują, że szkoła realnie działa - warto zapytać, kto teraz odpowiada za marketing.",
      "ru": "Сайт и соцсети выглядят заброшенными, но свежие отзывы и быстрый ответ на звонок показывают, что школа реально работает — стоит спросить, кто сейчас отвечает за маркетинг."
    }
  },
  {
    "name": "Kancelaria prawna międzynarodowa LexGlobal",
    "facts": {
      "pl": [
        "Biura w 4 krajach",
        "Własny wewnętrzny dział marketingu",
        "Strona wielojęzyczna, profesjonalny wygląd",
        "Kontakt tylko przez formularz dla klientów korporacyjnych"
      ],
      "ru": [
        "Офисы в 4 странах",
        "Собственный внутренний отдел маркетинга",
        "Многоязычный сайт профессионального вида",
        "Контакт только через форму для корпоративных клиентов"
      ]
    },
    "answer": "weak",
    "why": {
      "pl": "Firma ma już własny zespół marketingowy i skalę, na której decyzje nie zapadają przez jedną rozmowę telefoniczną - to nie jest nasz typowy klient.",
      "ru": "У компании уже есть собственная маркетинговая команда и такой масштаб, что решения не принимаются после одного телефонного звонка — это не наш типичный клиент."
    }
  },
  {
    "name": "MegaMebel - sieć salonów meblowych",
    "facts": {
      "pl": [
        "40 salonów w całej Polsce",
        "Ogólnopolska kampania reklamowa w telewizji",
        "Strona zarządzana centralnie z Warszawy",
        "Lokalny numer to tylko infolinia"
      ],
      "ru": [
        "40 салонов по всей Польше",
        "Общенациональная рекламная кампания на телевидении",
        "Сайт управляется централизованно из Варшавы",
        "Локальный номер — это просто колл-центр"
      ]
    },
    "answer": "weak",
    "why": {
      "pl": "To sieciowy gracz z centralnym marketingiem i dużym budżetem TV - lokalny telefon nikogo z decyzyjnością nie połączy, nie warto tracić na to czasu.",
      "ru": "Это сетевой игрок с централизованным маркетингом и большим ТВ-бюджетом — локальный телефон не соединит ни с кем, кто принимает решения, не стоит тратить на это время."
    }
  },
  {
    "name": "Fotograf ślubny Trójmiasto - Kadr&Emocje",
    "facts": {
      "pl": [
        "Świetne portfolio i social media",
        "Pracuje wyłącznie w regionie Trójmiasta",
        "Kampania callera obejmuje tylko Warszawę i Mazowieckie",
        "Klient sam mówi, że nie dojeżdża dalej niż 100 km"
      ],
      "ru": [
        "Отличное портфолио и соцсети",
        "Работает исключительно в Труймясте",
        "Кампания коллера охватывает только Варшаву и Мазовецкое воеводство",
        "Клиент сам говорит, что не выезжает дальше 100 км"
      ]
    },
    "answer": "weak",
    "why": {
      "pl": "Sam profil biznesowy może być dobry, ale to zła geografia dla obecnej kampanii - lepiej oddać ten lead do zespołu, który obsługuje ten region.",
      "ru": "Сам по себе бизнес может быть неплохим, но это неправильная география для текущей кампании — лучше передать этот лид команде, которая работает в этом регионе."
    }
  },
  {
    "name": "InvestDom Deweloper - agencja nieruchomości",
    "facts": {
      "pl": [
        "Sprzedaje mieszkania z dużych inwestycji deweloperskich",
        "Klientami są inwestorzy, nie osoby szukające domu na własne potrzeby",
        "Ma już agencję zajmującą się reklamą inwestycji",
        "Poza profilem kampanii dla lokalnych usługodawców"
      ],
      "ru": [
        "Продаёт квартиры в крупных девелоперских проектах",
        "Клиенты — инвесторы, а не люди, ищущие жильё для себя",
        "Уже есть агентство, занимающееся рекламой проектов",
        "Вне профиля кампании для локальных поставщиков услуг"
      ]
    },
    "answer": "weak",
    "why": {
      "pl": "To inny model biznesowy (deweloperka inwestycyjna) niż lokalne usługi, do których jest skierowana ta kampania - niedopasowana branża, nawet jeśli firma wygląda solidnie.",
      "ru": "Это другая бизнес-модель (инвестиционная девелоперская деятельность), чем локальные услуги, на которые нацелена эта кампания, — неподходящая отрасль, даже если компания выглядит солидно."
    }
  },
  {
    "name": "FitZone - siłownia sieciowa (franczyza)",
    "facts": {
      "pl": [
        "Część ogólnopolskiej sieci franczyzowej",
        "Marketing i strona zarządzane centralnie przez franczyzodawcę",
        "Lokalny właściciel nie ma dostępu do zmiany strony",
        "Mówi wprost: 'to nie moja decyzja, proszę pisać do centrali'"
      ],
      "ru": [
        "Часть общенациональной франчайзинговой сети",
        "Маркетинг и сайт управляются централизованно франчайзером",
        "Локальный владелец не имеет доступа к изменению сайта",
        "Говорит прямо: 'это не моё решение, пишите в центральный офис'"
      ]
    },
    "answer": "weak",
    "why": {
      "pl": "Lokalny właściciel wprost mówi, że nie podejmuje takich decyzji - nawet jeśli biznes lokalnie wygląda aktywnie, to nie tu jest budżet i decyzyjność.",
      "ru": "Локальный владелец прямо говорит, что не принимает таких решений — даже если бизнес локально выглядит активным, бюджет и полномочия не здесь."
    }
  },
  {
    "name": "Myjnia samochodowa Błysk",
    "facts": {
      "pl": [
        "Wizytówka Google istnieje",
        "Status: 'Trwale zamknięte'",
        "Ostatnia opinia sprzed 14 miesięcy",
        "Numer telefonu z ogłoszenia nie odpowiada"
      ],
      "ru": [
        "Профиль Google существует",
        "Статус: 'Постоянно закрыто'",
        "Последний отзыв 14 месяцев назад",
        "Номер телефона из объявления не отвечает"
      ]
    },
    "answer": "skip",
    "why": {
      "pl": "Google sam oznacza firmę jako trwale zamkniętą, a telefon nie odpowiada - nie ma do kogo dzwonić.",
      "ru": "Google сам отмечает компанию как постоянно закрытую, а телефон не отвечает — звонить некому."
    }
  },
  {
    "name": "Klinika Weterynaryjna PupilCare",
    "facts": {
      "pl": [
        "312 opinii, ocena 5.0",
        "290 z tych opinii dodano w ciągu jednego tygodnia",
        "Bardzo podobny styl pisania w wielu opiniach",
        "Brak zdjęć profilowych u większości recenzentów"
      ],
      "ru": [
        "312 отзывов, рейтинг 5.0",
        "290 из этих отзывов добавлены за одну неделю",
        "Очень похожий стиль написания во многих отзывах",
        "У большинства рецензентов нет фото профиля"
      ]
    },
    "answer": "skip",
    "why": {
      "pl": "Wygląda na sztucznie nakręcone opinie - nie da się na tej podstawie ocenić, czy biznes faktycznie ma klientów i czy warto w ogóle dzwonić.",
      "ru": "Похоже на искусственно накрученные отзывы — на этом основании невозможно оценить, реально ли у бизнеса есть клиенты и стоит ли вообще звонить."
    }
  },
  {
    "name": "BudMax - firma budowlana",
    "facts": {
      "pl": [
        "Numer telefonu z wizytówki: 'ten numer nie istnieje'",
        "Strona www zwraca błąd 404 - domena wygasła",
        "Ostatnia opinia sprzed 3 lat",
        "Brak aktywnych profili społecznościowych"
      ],
      "ru": [
        "Номер телефона из профиля: 'этот номер не существует'",
        "Сайт выдаёт ошибку 404 — домен истёк",
        "Последний отзыв 3 года назад",
        "Нет активных профилей в соцсетях"
      ]
    },
    "answer": "skip",
    "why": {
      "pl": "Nie ma żadnego działającego kanału kontaktu ani sygnału, że firma wciąż działa - nie ma tu z kim i o czym rozmawiać.",
      "ru": "Нет ни одного рабочего канала связи, ни сигнала, что компания всё ещё работает — здесь не с кем и не о чем разговаривать."
    }
  },
  {
    "name": "Kwiaciarnia Frezja",
    "facts": {
      "pl": [
        "Jedyny ślad to wpis w starym katalogu firm z 2019 roku",
        "Brak wizytówki Google",
        "Brak strony i social media",
        "Brak jakiejkolwiek wzmianki o firmie w ciągu ostatnich 2 lat"
      ],
      "ru": [
        "Единственный след — запись в старом каталоге компаний за 2019 год",
        "Нет профиля Google",
        "Нет сайта и соцсетей",
        "Ни одного упоминания о компании за последние 2 года"
      ]
    },
    "answer": "skip",
    "why": {
      "pl": "Brak jakichkolwiek świeżych śladów działalności - równie dobrze firma mogła już nie istnieć, szkoda czasu na próbę kontaktu.",
      "ru": "Нет никаких свежих следов деятельности — компания вполне могла уже не существовать, не стоит тратить время на попытку связаться."
    }
  }
];

// { id, situation:{pl,ru}, bestServices:[serviceId], why:{pl,ru}, distractorServices:[serviceId], distractorWhy:{pl,ru} }
export const SERVICE_MATCH_CASES = [
  {
    "id": "duzo-ruchu-mala-konwersja",
    "situation": {
      "pl": "Klient mówi: 'Wydajemy sporo kasy na Google Ads, ruch na stronie faktycznie jest, widzę to w statystykach, ale telefon prawie nie dzwoni i formularz stoi pusty.' Reklama najwyraźniej przyciąga ludzi, ale coś ich zatrzymuje zanim zostawią kontakt.",
      "ru": "Клиент говорит: 'Мы тратим прилично на Google Ads, трафик на сайте реально есть, вижу это в статистике, но телефон почти не звонит, форма пустая.' Реклама явно привлекает людей, но что-то их останавливает, прежде чем они оставят контакт."
    },
    "bestServices": [
      "cro"
    ],
    "why": {
      "pl": "Ruch już jest, problem jest po drodze na stronie - trzeba przeanalizować i poprawić samą ścieżkę konwersji, a nie kupować kolejny ruch.",
      "ru": "Трафик уже есть, проблема где-то на сайте — нужно проанализировать и улучшить сам путь конверсии, а не покупать ещё больше трафика."
    },
    "distractorServices": [
      "googleads",
      "metaads"
    ],
    "distractorWhy": {
      "pl": "Kuszące, bo klient mówi o reklamie, ale dokładanie kolejnej kampanii albo kolejnego kanału nie naprawi strony, która i tak nie konwertuje ruchu, jaki już ma.",
      "ru": "Заманчиво, ведь клиент говорит про рекламу, но добавление ещё одной кампании или канала не исправит сайт, который и так не конвертирует уже имеющийся трафик."
    }
  },
  {
    "id": "kalkulator-wyceny-remontu",
    "situation": {
      "pl": "Firma remontowo-budowlana: 'Ludzie ciągle dzwonią i pytają, ile by kosztował remont łazienki czy kuchni, tłumaczę im to samo po dziesięć razy dziennie, tracę pół dnia na wyceny przez telefon, a i tak większość i tak nie dzwoni więcej.'",
      "ru": "Ремонтно-строительная фирма: 'Люди постоянно звонят и спрашивают, сколько будет стоить ремонт ванной или кухни, объясняю одно и то же по десять раз в день, теряю полдня на устные оценки по телефону, а большинство всё равно потом не перезванивает.'"
    },
    "bestServices": [
      "calculators"
    ],
    "why": {
      "pl": "Interaktywny kalkulator na stronie od razu pokazuje orientacyjną wycenę i zbiera dane klienta bez angażowania właściciela w każdą rozmowę.",
      "ru": "Интерактивный калькулятор на сайте сразу показывает примерную стоимость и собирает данные клиента без участия владельца в каждом разговоре."
    },
    "distractorServices": [
      "leadforms",
      "websites"
    ],
    "distractorWhy": {
      "pl": "Zwykły formularz kontaktowy albo nowa strona nie rozwiążą realnego problemu - klient wciąż będzie musiał ręcznie odpowiadać na pytanie 'ile to kosztuje'.",
      "ru": "Обычная контактная форма или новый сайт не решат реальную проблему — клиенту всё равно придётся вручную отвечать на вопрос 'сколько это стоит'."
    }
  },
  {
    "id": "baza-klientow-w-excelu",
    "situation": {
      "pl": "Właścicielka szkoły tańca: 'Mam plik Excel z prawie 2000 kontaktów, ludzie, którzy kiedyś byli na zajęciach próbnych albo pytali o ceny, i szczerze mówiąc nigdy do nich nie piszę, bo nie mam na to czasu ani pomysłu jak to ogarnąć.'",
      "ru": "Владелица школы танцев: 'У меня файл Excel почти с 2000 контактов — люди, которые когда-то были на пробных занятиях или спрашивали про цены, и, честно говоря, я им никогда не пишу, потому что нет ни времени, ни идеи, как это организовать.'"
    },
    "bestServices": [
      "emailint"
    ],
    "why": {
      "pl": "Gotowa baza kontaktów, która nigdy nie jest wykorzystywana, to idealny przypadek pod automatyczne sekwencje mailowe - da się z niej wyciągnąć realną sprzedaż bez ręcznej pracy.",
      "ru": "Готовая база контактов, которая никогда не используется, — идеальный случай для автоматических email-цепочек: из неё можно вытянуть реальные продажи без ручной работы."
    },
    "distractorServices": [
      "crmauto",
      "aireports"
    ],
    "distractorWhy": {
      "pl": "CRM uporządkuje dane, a raporty pokażą liczby, ale żadne z nich samo z siebie nie napisze i nie wyśle wiadomości do tych 2000 osób - to wciąż zostanie na głowie właścicielki.",
      "ru": "CRM упорядочит данные, а отчёты покажут цифры, но ни то, ни другое само по себе не напишет и не отправит сообщения этим 2000 человек — это всё равно останется на владелице."
    }
  },
  {
    "id": "restauracja-nieodebrane-rezerwacje",
    "situation": {
      "pl": "Właściciel restauracji: 'W piątek i sobotę wieczorem mamy pełną salę, kelnerzy biegają, telefon dzwoni, a nikt nie ma czasu odebrać. Ile my przez to tracimy rezerwacji, to strach pomyśleć.'",
      "ru": "Владелец ресторана: 'В пятницу и субботу вечером у нас полный зал, официанты бегают, телефон звонит, а поднять трубку некому. Сколько мы теряем броней из-за этого, страшно подумать.'"
    },
    "bestServices": [
      "booking"
    ],
    "why": {
      "pl": "System rezerwacji online z automatycznymi przypomnieniami pozwala klientom zarezerwować stolik bez konieczności dodzwonienia się w najgorętszym momencie.",
      "ru": "Система онлайн-бронирования с автоматическими напоминаниями позволяет клиентам забронировать столик, не пытаясь дозвониться в самый горячий момент."
    },
    "distractorServices": [
      "aichatbot",
      "leadforms"
    ],
    "distractorWhy": {
      "pl": "Chatbot czy formularz zbiorą zapytanie, ale to wciąż ktoś musi je ręcznie przetworzyć i potwierdzić - klient potrzebuje realnego systemu rezerwacji ze slotami czasowymi, a nie kolejnej skrzynki wiadomości.",
      "ru": "Чат-бот или форма соберут запрос, но его всё равно кто-то должен вручную обработать и подтвердить — клиенту нужна настоящая система бронирования с временными слотами, а не ещё один почтовый ящик."
    }
  },
  {
    "id": "pierwszy-sklep-internetowy",
    "situation": {
      "pl": "Rękodzielniczka robiąca biżuterię: 'Na razie sprzedaję tylko na targach i przez wiadomości na Instagramie, ludzie piszą, pytają o dostępność, ja ręcznie wszystko ogarniam. Chciałabym w końcu mieć miejsce, gdzie można normalnie kupić i zapłacić online.'",
      "ru": "Мастерица, изготавливающая украшения: 'Пока продаю только на ярмарках и через сообщения в Instagram, люди пишут, спрашивают про наличие, я всё веду вручную. Хотела бы наконец иметь место, где можно нормально купить и оплатить онлайн.'"
    },
    "bestServices": [
      "ecommerce"
    ],
    "why": {
      "pl": "Potrzebuje pełnego sklepu internetowego z katalogiem produktów, koszykiem i płatnościami - to jej pierwsza sprzedaż online, a nie promocja jednego produktu.",
      "ru": "Ей нужен полноценный интернет-магазин с каталогом товаров, корзиной и оплатой — это её первая онлайн-продажа, а не продвижение одного товара."
    },
    "distractorServices": [
      "landing",
      "websites"
    ],
    "distractorWhy": {
      "pl": "Landing sprawdziłby się do promocji jednego produktu, a zwykła strona firmowa nie ma koszyka ani płatności - żadne z nich nie pozwoli jej realnie sprzedawać wielu produktów online.",
      "ru": "Landing подошёл бы для продвижения одного товара, а обычный сайт-визитка не имеет корзины и оплаты — ни то, ни другое не позволит ей реально продавать много товаров онлайн."
    }
  },
  {
    "id": "nowy-produkt-kampania-od-zera",
    "situation": {
      "pl": "Marka kosmetyków naturalnych: 'Wypuszczamy nową linię peelingów za trzy tygodnie, chcemy zrobić kampanię tylko pod ten jeden produkt, nie chcemy ruszać naszej głównej strony firmowej, bo tam jest cały katalog i to inny temat.' Pytają, od czego zacząć, żeby kampania w ogóle miała gdzie kierować ludzi.",
      "ru": "Бренд натуральной косметики: 'Через три недели запускаем новую линию пилингов, хотим сделать кампанию только под этот один продукт, не хотим трогать наш основной сайт, там целый каталог и это другая история.' Спрашивают, с чего начать, чтобы кампании вообще было куда вести людей."
    },
    "bestServices": [
      "landing",
      "googleads"
    ],
    "why": {
      "pl": "Potrzebują dedykowanej strony pod jeden produkt (landing) plus kampanii, która skieruje na nią ruch z konkretną intencją zakupową (Google Ads) - to działa razem, jedno bez drugiego nie ma sensu.",
      "ru": "Им нужна отдельная страница под один продукт (landing) плюс кампания, которая приведёт на неё трафик с конкретным намерением купить (Google Ads) — это работает вместе, одно без другого не имеет смысла."
    },
    "distractorServices": [
      "websites",
      "funnels"
    ],
    "distractorWhy": {
      "pl": "Przebudowa całej strony firmowej to za dużo i za wolno na kampanię za trzy tygodnie, a pełny funnel to znacznie większy i droższy pakiet niż to, o co pytają na tym etapie.",
      "ru": "Переделка всего сайта — это слишком много и слишком медленно для кампании через три недели, а полная воронка (funnel) — гораздо больший и более дорогой пакет, чем то, о чём они спрашивают на этом этапе."
    }
  },
  {
    "id": "niewidoczni-w-mapach-google",
    "situation": {
      "pl": "Właściciel kwiaciarni: 'Mamy ładną stronę, zrobioną w zeszłym roku, ale jak wpisuję w Google Maps \"kwiaciarnia\" plus nazwa naszej dzielnicy, to nas w ogóle nie ma na liście, a konkurencja dwie ulice dalej jest na samej górze.'",
      "ru": "Владелец цветочного магазина: 'У нас красивый сайт, сделанный в прошлом году, но когда я ввожу в Google Maps \"цветочный магазин\" плюс название нашего района, нас вообще нет в списке, а конкуренты через две улицы — в самом верху.'"
    },
    "bestServices": [
      "gbp"
    ],
    "why": {
      "pl": "Problem dotyczy konkretnie widoczności w Mapach Google i lokalnych wynikach - trzeba uporządkować i zoptymalizować wizytówkę Google Business Profile, strona tu nic nie zmieni.",
      "ru": "Проблема конкретно в видимости на Google Maps и в локальной выдаче — нужно привести в порядок и оптимизировать профиль Google Business Profile, сайт здесь ничего не изменит."
    },
    "distractorServices": [
      "seo",
      "googleads"
    ],
    "distractorWhy": {
      "pl": "SEO strony i reklama w wyszukiwarce dotyczą innego miejsca w Google niż sekcja Map - to nie naprawi tego, że wizytówka jest źle uzupełniona albo ma za mało sygnałów lokalnych.",
      "ru": "SEO сайта и реклама в поиске относятся к другому разделу Google, чем блок Карт — это не исправит то, что профиль плохо заполнен или ему не хватает локальных сигналов."
    }
  },
  {
    "id": "porzucone-koszyki-w-sklepie",
    "situation": {
      "pl": "Sklep internetowy z akcesoriami dla zwierząt: 'Widzę w statystykach, że mnóstwo ludzi ogląda produkty, dodaje do koszyka, a potem po prostu znika i nigdy nie wraca dokończyć zamówienia. Czujemy, że tracimy tych klientów bezpowrotnie.'",
      "ru": "Интернет-магазин зоотоваров: 'Вижу в статистике, что куча людей смотрит товары, добавляет в корзину, а потом просто исчезает и никогда не возвращается завершить заказ. Чувствуем, что теряем этих клиентов безвозвратно.'"
    },
    "bestServices": [
      "remarketing"
    ],
    "why": {
      "pl": "To klasyczny przypadek na remarketing - dotarcie z reklamą właśnie do tych osób, które już były na stronie i porzuciły koszyk, zamiast szukać zupełnie nowych klientów.",
      "ru": "Это классический случай для ремаркетинга — донести рекламу именно до тех людей, которые уже были на сайте и бросили корзину, вместо поиска совершенно новых клиентов."
    },
    "distractorServices": [
      "metaads",
      "cro"
    ],
    "distractorWhy": {
      "pl": "Zwykła kampania na nowych odbiorców w Meta Ads nie wróci uwagi osób, które już wiemy że były zainteresowane, a CRO poprawi samą stronę, ale nie dotrze bezpośrednio do tych konkretnych ludzi, którzy już odeszli.",
      "ru": "Обычная кампания на новую аудиторию в Meta Ads не вернёт внимание людей, о которых мы уже знаем, что они были заинтересованы, а CRO улучшит сам сайт, но не достучится напрямую до тех конкретных людей, которые уже ушли."
    }
  },
  {
    "id": "seo-dlugoterminowo-maly-budzet",
    "situation": {
      "pl": "Firma budowlana wykonująca fundamenty i stany surowe: 'Na razie nie mamy dużego budżetu na reklamy, ale zależy nam, żeby za rok, dwa lata być na górze w Google, jak ktoś szuka firmy budowlanej w naszym mieście. Możemy poczekać na efekt.'",
      "ru": "Строительная компания, выполняющая фундаменты и коробки домов: 'Пока нет большого бюджета на рекламу, но хотим через год-два быть в топе Google, когда кто-то ищет строительную компанию в нашем городе. Мы можем подождать результата.'"
    },
    "bestServices": [
      "seo"
    ],
    "why": {
      "pl": "Klient sam mówi, że ma czas i mały budżet na reklamę - to dokładnie profil pod długoterminowe pozycjonowanie organiczne, a nie płatny ruch.",
      "ru": "Клиент сам говорит, что у него есть время и небольшой бюджет на рекламу — это точно профиль под долгосрочное органическое продвижение, а не платный трафик."
    },
    "distractorServices": [
      "googleads",
      "gbp"
    ],
    "distractorWhy": {
      "pl": "Google Ads dałoby szybki efekt, ale klient wyraźnie nie ma na to budżetu teraz, a sama wizytówka Google nie zastąpi budowania widoczności strony w wynikach organicznych na szerokie frazy.",
      "ru": "Google Ads дал бы быстрый эффект, но у клиента явно сейчас нет на это бюджета, а сам профиль Google не заменит наращивание видимости сайта в органической выдаче по широким запросам."
    }
  },
  {
    "id": "hydraulik-pilna-widocznosc",
    "situation": {
      "pl": "Hydraulik, jednoosobowa działalność: 'Ludzie szukają w Google \"hydraulik awaria\" czy \"pęknięta rura\" i dzwonią do pierwszej firmy, jaką zobaczą, chcę tam być, i to najlepiej od jutra, bo tracę zlecenia na rzecz konkurencji, która płaci za reklamę.'",
      "ru": "Сантехник, работающий один: 'Люди ищут в Google \"сантехник авария\" или \"лопнула труба\" и звонят в первую попавшуюся компанию, хочу там быть, и желательно с завтрашнего дня, потому что теряю заказы в пользу конкурентов, которые платят за рекламу.'"
    },
    "bestServices": [
      "googleads"
    ],
    "why": {
      "pl": "Zapytania z ostrą intencją zakupową ('awaria', 'pęknięta rura') i potrzeba natychmiastowego efektu to podręcznikowy przypadek na kampanię Google Ads, nie na wolniejsze SEO.",
      "ru": "Запросы с явным намерением купить ('авария', 'лопнула труба') и потребность в немедленном эффекте — это учебный случай для кампании Google Ads, а не для более медленного SEO."
    },
    "distractorServices": [
      "seo",
      "metaads"
    ],
    "distractorWhy": {
      "pl": "SEO zadziała, ale za miesiące, a klient potrzebuje efektu od jutra, a Meta Ads dociera do ludzi przewijających social media, a nie do kogoś, kto akurat ma pękniętą rurę i szuka rozwiązania teraz.",
      "ru": "SEO сработает, но через месяцы, а клиенту нужен эффект с завтрашнего дня, а Meta Ads достигает людей, листающих соцсети, а не того, у кого прямо сейчас лопнула труба и кто ищет решение сейчас."
    }
  },
  {
    "id": "rebranding-nowa-nazwa-firmy",
    "situation": {
      "pl": "Studio architektury wnętrz zmienia nazwę po połączeniu dwóch firm: 'Musimy praktycznie zacząć od zera - nowa nazwa, nowe logo, nowe kolory, no i strona internetowa musi wyglądać spójnie z tym wszystkim, bo stara jest jeszcze pod starą markę.'",
      "ru": "Студия дизайна интерьеров меняет название после слияния двух компаний: 'Нам нужно практически начать с нуля — новое название, новый логотип, новые цвета, и сайт должен выглядеть в едином стиле со всем этим, потому что старый ещё под старым брендом.'"
    },
    "bestServices": [
      "branding",
      "websites"
    ],
    "why": {
      "pl": "To realny przypadek na dwie usługi razem: najpierw trzeba zbudować nową identyfikację wizualną (branding), a potem stronę, która ją odzwierciedla - jedno bez drugiego zostawi niespójność.",
      "ru": "Это реальный случай для двух услуг сразу: сначала нужно построить новую визуальную идентичность (брендинг), а потом сайт, который её отражает — одно без другого оставит несогласованность."
    },
    "distractorServices": [
      "uiux",
      "copywriting"
    ],
    "distractorWhy": {
      "pl": "UX strony i teksty sprzedażowe będą ważne później, ale bez ustalonej nowej identyfikacji marki (logo, kolory, styl) nie ma jeszcze na czym oprzeć projektu ani przekazu.",
      "ru": "UX сайта и продающие тексты будут важны позже, но без утверждённой новой идентичности бренда (логотип, цвета, стиль) пока не на что опереться ни в дизайне, ни в сообщении."
    }
  },
  {
    "id": "wypozyczalnia-sprzetu-niestandardowy-proces",
    "situation": {
      "pl": "Wypożyczalnia sprzętu budowlanego: 'Nasz proces jest specyficzny - klient musi widzieć na bieżąco, co jest dostępne w magazynie, zarezerwować na konkretne dni, a system musi automatycznie blokować sprzęt, który jest akurat wypożyczony gdzie indziej. Sprawdzaliśmy gotowe systemy rezerwacji, żaden tak naprawdę tego nie ogarnia.'",
      "ru": "Прокат строительного оборудования: 'У нас специфический процесс — клиент должен видеть в реальном времени, что есть на складе, забронировать на конкретные дни, а система должна автоматически блокировать оборудование, которое как раз сдано в аренду в другом месте. Смотрели готовые системы бронирования, ни одна реально с этим не справляется.'"
    },
    "bestServices": [
      "customtools"
    ],
    "why": {
      "pl": "Klient wprost mówi, że sprawdzał gotowe rozwiązania i żadne nie pasuje do jego specyficznego procesu (magazyn + dostępność w czasie rzeczywistym) - to sygnał na narzędzie szyte na miarę.",
      "ru": "Клиент прямо говорит, что проверял готовые решения и ни одно не подходит под его специфический процесс (склад + доступность в реальном времени) — это сигнал для инструмента, сделанного на заказ."
    },
    "distractorServices": [
      "booking",
      "adminpanels"
    ],
    "distractorWhy": {
      "pl": "Zwykły system rezerwacji obsłuży terminy, ale nie połączy tego automatycznie ze stanem magazynowym sprzętu, a gotowy panel administracyjny też nie ma wbudowanej takiej logiki - klient już sprawdził, że standardowe opcje nie działają.",
      "ru": "Обычная система бронирования справится с датами, но не свяжет это автоматически с состоянием склада оборудования, а готовая административная панель тоже не имеет встроенной такой логики — клиент уже проверил, что стандартные варианты не работают."
    }
  },
  {
    "id": "powtarzalne-pytania-po-godzinach",
    "situation": {
      "pl": "Gabinet kosmetyczny: 'Wieczorami i w weekendy dostajemy mnóstwo tych samych pytań na Facebooku i przez stronę - czy jesteśmy otwarci, ile kosztuje zabieg, czy jest wolny termin. Nikt z nas w tym czasie nie pracuje, więc odpisujemy dopiero rano, a klientki już się rozmyśliły albo zapisały gdzie indziej.'",
      "ru": "Косметический кабинет: 'По вечерам и в выходные получаем кучу одинаковых вопросов в Facebook и на сайте — открыты ли мы, сколько стоит процедура, есть ли свободное время. Никто из нас в это время не работает, поэтому отвечаем только утром, а клиентки уже передумали или записались в другое место.'"
    },
    "bestServices": [
      "aichatbot"
    ],
    "why": {
      "pl": "Chatbot AI na stronie i w social media może od razu odpowiadać na te powtarzalne pytania 24/7, zanim klientka zdąży pójść do konkurencji.",
      "ru": "AI-чат-бот на сайте и в соцсетях может сразу отвечать на эти повторяющиеся вопросы 24/7, прежде чем клиентка успеет уйти к конкурентам."
    },
    "distractorServices": [
      "aiauto",
      "leadforms"
    ],
    "distractorWhy": {
      "pl": "Automatyzacja obsługi zapytań przychodzących pomaga bardziej przy mailach i formularzach niż przy rozmowie na czacie w czasie rzeczywistym, a kolejny formularz nie odpowie od razu na pytanie 'czy macie wolny termin dziś wieczorem'.",
      "ru": "Автоматизация обработки входящих запросов больше помогает с письмами и формами, чем с диалогом в чате в реальном времени, а ещё одна форма не ответит сразу на вопрос 'есть ли у вас свободное время сегодня вечером'."
    }
  },
  {
    "id": "powtarzalne-zapytania-mailowe",
    "situation": {
      "pl": "Biuro nieruchomości: 'Codziennie przychodzi dwadzieścia parę maili i zgłoszeń z portali z tym samym pytaniem - czy mieszkanie jeszcze dostępne, jakie piętro, czy jest winda. Agentka spędza na tym połowę dnia zamiast jeździć na oglądania.'",
      "ru": "Агентство недвижимости: 'Каждый день приходит двадцать с лишним писем и заявок с порталов с одним и тем же вопросом — доступна ли ещё квартира, какой этаж, есть ли лифт. Агент тратит на это полдня вместо того, чтобы ездить на показы.'"
    },
    "bestServices": [
      "aiauto"
    ],
    "why": {
      "pl": "To powtarzalne, ustandaryzowane zapytania przychodzące mailem i z formularzy - idealny przypadek pod automatyzację obsługi takich zgłoszeń, żeby agentka zajmowała się tylko realnymi rozmowami.",
      "ru": "Это повторяющиеся, стандартизированные запросы, приходящие по почте и через формы — идеальный случай для автоматизации обработки таких заявок, чтобы агент занимался только реальными разговорами."
    },
    "distractorServices": [
      "aichatbot",
      "crmauto"
    ],
    "distractorWhy": {
      "pl": "Chatbot na stronie nie obejmie zapytań, które przychodzą z zewnętrznych portali nieruchomości, a sam CRM tylko poukłada dane - nie odpowie automatycznie za agentkę na powtarzalne pytania.",
      "ru": "Чат-бот на сайте не охватит заявки, которые приходят с внешних порталов недвижимости, а сам CRM только упорядочит данные — не ответит автоматически за агента на повторяющиеся вопросы."
    }
  },
  {
    "id": "leady-nierealne-strata-czasu",
    "situation": {
      "pl": "Firma szkoleniowa B2B: 'Formularz na stronie generuje sporo zgłoszeń, ale jak handlowiec dzwoni, to połowa to studenci robiący jakieś ankiety albo ludzie, którzy w ogóle nie pamiętają, że coś zostawiali. Tracimy godziny na obdzwanianie osób, które i tak nic nie kupią.'",
      "ru": "B2B-компания, проводящая тренинги: 'Форма на сайте генерирует немало заявок, но когда менеджер звонит, оказывается, что половина — это студенты, делающие какие-то опросы, или люди, которые вообще не помнят, что что-то оставляли. Теряем часы на обзвон тех, кто всё равно ничего не купит.'"
    },
    "bestServices": [
      "aiqualify"
    ],
    "why": {
      "pl": "Problemem nie jest brak leadów, tylko ich jakość - automatyczna kwalifikacja AI odsieje przypadkowe zgłoszenia, zanim trafią do handlowca.",
      "ru": "Проблема не в отсутствии лидов, а в их качестве — автоматическая AI-квалификация отсеет случайные заявки, прежде чем они попадут к менеджеру."
    },
    "distractorServices": [
      "leadforms",
      "crmauto"
    ],
    "distractorWhy": {
      "pl": "Kolejny, nawet bardziej rozbudowany formularz nadal wymaga, żeby ktoś ręcznie ocenił każde zgłoszenie, a CRM tylko przechowa te same niskiej jakości leady w ładniejszym widoku.",
      "ru": "Ещё одна, даже более сложная форма всё равно требует, чтобы кто-то вручную оценивал каждую заявку, а CRM просто сохранит те же низкокачественные лиды в более красивом виде."
    }
  },
  {
    "id": "handlowiec-zapomina-oddzwonic",
    "situation": {
      "pl": "Firma okienna: 'Klient zostawia numer, bo chce wycenę, a nasz handlowiec czasem oddzwania dopiero po trzech dniach, bo ma inne sprawy na głowie i po prostu zapomina. Wiadomo, że w tym czasie klient już dogadał się z kimś innym.'",
      "ru": "Оконная компания: 'Клиент оставляет номер, потому что хочет расчёт, а наш менеджер иногда перезванивает только через три дня, потому что у него голова занята другим и он просто забывает. Понятно, что за это время клиент уже договорился с кем-то другим.'"
    },
    "bestServices": [
      "aifollowup"
    ],
    "why": {
      "pl": "Problem to nie brak leadów, tylko ludzka pamięć i priorytety - automatyczny follow-up AI zadba o to, żeby żaden lead nie ostygł, niezależnie od tego, czy handlowiec o nim pamięta.",
      "ru": "Проблема не в отсутствии лидов, а в человеческой памяти и приоритетах — автоматический AI-follow-up позаботится о том, чтобы ни один лид не остыл, независимо от того, помнит ли о нём менеджер."
    },
    "distractorServices": [
      "crmauto",
      "automsg"
    ],
    "distractorWhy": {
      "pl": "CRM pokaże handlowcu, że ma zaległy kontakt, ale to wciąż on musi pamiętać, żeby tam zajrzeć, a pojedyncza automatyczna wiadomość nie zastąpi pełnej sekwencji follow-upu dopasowanej do etapu rozmowy.",
      "ru": "CRM покажет менеджеру, что у него есть просроченный контакт, но ему всё равно нужно помнить, чтобы туда заглянуть, а одно автоматическое сообщение не заменит полную последовательность follow-up, подстроенную под этап разговора."
    }
  },
  {
    "id": "duzy-klient-cala-sciezka",
    "situation": {
      "pl": "Sieć klinik medycyny estetycznej z pięcioma lokalizacjami: 'Mamy osobno agencję od reklam, osobno kogoś od strony, osobno recepcje, które ręcznie dzwonią do klientów, i nic z tego się ze sobą nie spina. Mamy duży budżet, chcemy w końcu, żeby ktoś ogarnął to całościowo, od pierwszego kliknięcia w reklamę aż po przypomnienie o wizycie.'",
      "ru": "Сеть клиник эстетической медицины с пятью филиалами: 'У нас отдельно агентство по рекламе, отдельно кто-то по сайту, отдельно ресепшн, который вручную звонит клиентам, и всё это никак не связано между собой. У нас большой бюджет, хотим, чтобы наконец кто-то занялся этим комплексно — от первого клика по рекламе до напоминания о визите.'"
    },
    "bestServices": [
      "funnels"
    ],
    "why": {
      "pl": "Klient wprost opisuje potrzebę spięcia całej ścieżki klienta w jeden zaprojektowany system, ma duży budżet i skalę na to, żeby to miało sens - klasyczny przypadek na funnel.",
      "ru": "Клиент прямо описывает потребность связать весь путь клиента в единую спроектированную систему, у него большой бюджет и масштаб, чтобы это имело смысл — классический случай для funnel."
    },
    "distractorServices": [
      "googleads",
      "crmauto"
    ],
    "distractorWhy": {
      "pl": "Sama kampania Google Ads albo sam CRM to tylko pojedyncze klocki tej układanki - klient wyraźnie mówi, że problemem jest brak spięcia wszystkiego razem, a nie brak jednego konkretnego narzędzia.",
      "ru": "Одна кампания Google Ads или один CRM — это лишь отдельные кусочки этого пазла — клиент прямо говорит, что проблема в отсутствии связки всего вместе, а не в отсутствии одного конкретного инструмента."
    }
  },
  {
    "id": "klienci-pytaja-chatgpt",
    "situation": {
      "pl": "Kancelaria doradztwa podatkowego: 'Kilku nowych klientów mówiło mi, że szukali doradcy podatkowego pytając ChatGPT albo podobne narzędzie, i nas tam w ogóle nie było w podpowiedziach, wyskakiwała za to konkurencja z drugiej strony miasta. Nie wiem, czy to w ogóle da się jakoś ustawić.'",
      "ru": "Налоговая консалтинговая контора: 'Несколько новых клиентов рассказали мне, что искали налогового консультанта, спрашивая ChatGPT или похожий инструмент, и нас там вообще не было среди подсказок, зато выскакивали конкуренты с другого конца города. Не знаю, можно ли это вообще как-то настроить.'"
    },
    "bestServices": [
      "geoai"
    ],
    "why": {
      "pl": "To dokładnie opisuje problem widoczności marki w wynikach generowanych przez AI (ChatGPT i podobne) - nowa, osobna dziedzina od klasycznego SEO, którą trzeba świadomie zoptymalizować.",
      "ru": "Это в точности описывает проблему видимости бренда в результатах, генерируемых AI (ChatGPT и подобные) — новая, отдельная область от классического SEO, которую нужно осознанно оптимизировать."
    },
    "distractorServices": [
      "seo",
      "googleads"
    ],
    "distractorWhy": {
      "pl": "Klasyczne SEO poprawia pozycję w wynikach wyszukiwarki Google, a nie w odpowiedziach generowanych przez AI, a reklama w Google w ogóle nie dotyczy tego, co odpowiada ChatGPT - to inny mechanizm widoczności.",
      "ru": "Классическое SEO улучшает позицию в результатах поисковика Google, а не в ответах, генерируемых AI, а реклама в Google вообще не влияет на то, что отвечает ChatGPT — это другой механизм видимости."
    }
  },
  {
    "id": "ekipy-w-terenie-zarzadzanie-zleceniami",
    "situation": {
      "pl": "Firma zajmująca się naprawą sprzętu AGD z pięcioma serwisantami w terenie: 'Teraz to wygląda tak, że dzwonię do każdego serwisanta osobno, pytam gdzie jest, co robi, zapisuję zlecenia na kartce. Chciałbym mieć jedno miejsce, gdzie widzę wszystkie zlecenia, komu je przypisałem i na jakim są etapie.'",
      "ru": "Компания по ремонту бытовой техники с пятью выездными мастерами: 'Сейчас это выглядит так — я звоню каждому мастеру отдельно, спрашиваю, где он, что делает, записываю заказы на бумажке. Хотел бы иметь одно место, где вижу все заказы, кому я их назначил и на каком они этапе.'"
    },
    "bestServices": [
      "adminpanels"
    ],
    "why": {
      "pl": "Potrzebuje dedykowanego panelu do zarządzania własnym procesem (zlecenia, przypisania, statusy) - to konkretne narzędzie operacyjne, nie kwestia marketingu czy strony.",
      "ru": "Ему нужна собственная панель для управления процессом (заказы, назначения, статусы) — это конкретный операционный инструмент, а не вопрос маркетинга или сайта."
    },
    "distractorServices": [
      "crmauto",
      "dashboards"
    ],
    "distractorWhy": {
      "pl": "CRM koncentruje się na relacjach z klientami i sprzedaży, a dashboard tylko pokazuje wskaźniki - klientowi chodzi o realne narzędzie do zarządzania codzienną pracą serwisantów, nie o statystyki czy lejek sprzedażowy.",
      "ru": "CRM концентрируется на отношениях с клиентами и продажах, а dashboard только показывает показатели — клиенту нужен реальный инструмент для управления повседневной работой мастеров, а не статистика или воронка продаж."
    }
  },
  {
    "id": "siec-lokalizacji-wskazniki-na-biezaco",
    "situation": {
      "pl": "Właściciel sieci pięciu siłowni: 'Raz w miesiącu księgowa wysyła mi zestawienie z każdej lokalizacji osobno, w Excelu, i zanim to wszystko poskładam do kupy, dane są już nieaktualne. Chciałbym w jednym miejscu widzieć na bieżąco, jak radzi sobie każda siłownia - liczba wejść, przychód, nowi klienci - a najlepiej też widzieć, skąd ci nowi klienci w ogóle się biorą.'",
      "ru": "Владелец сети из пяти спортзалов: 'Раз в месяц бухгалтер присылает мне сводку по каждому филиалу отдельно, в Excel, и пока я всё это собираю воедино, данные уже устаревают. Хотел бы в одном месте видеть в реальном времени, как дела у каждого зала — число посещений, выручка, новые клиенты, а лучше ещё видеть, откуда эти новые клиенты вообще берутся.'"
    },
    "bestServices": [
      "dashboards",
      "analytics"
    ],
    "why": {
      "pl": "Klientowi chodzi o jeden widok z aktualnymi wskaźnikami z kilku lokalizacji naraz (dashboard), a dodatkowo chce rozumieć, skąd biorą się nowi klienci, czyli źródła i konwersje (analytics) - te dwie rzeczy naturalnie się uzupełniają.",
      "ru": "Клиенту нужен единый экран с актуальными показателями сразу по нескольким филиалам (dashboard), а ещё он хочет понимать, откуда берутся новые клиенты, то есть источники и конверсии (analytics) — эти две вещи естественно дополняют друг друга."
    },
    "distractorServices": [
      "aireports",
      "crmauto"
    ],
    "distractorWhy": {
      "pl": "Automatyczne raporty wysyłają gotowe zestawienia okresowo, a nie dają widoku na bieżąco, a CRM porządkuje relacje z klientami, ale nie pokaże w jednym miejscu wskaźników finansowych i frekwencyjnych z kilku lokalizacji naraz.",
      "ru": "Автоматические отчёты присылают готовые сводки периодически, а не дают представление в реальном времени, а CRM упорядочивает отношения с клиентами, но не покажет в одном месте финансовые показатели и посещаемость сразу по нескольким филиалам."
    }
  }
];
