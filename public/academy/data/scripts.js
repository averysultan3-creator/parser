window.AURA_SCRIPTS = {
  "scripts": [
    {
      "id": "first-call",
      "title": {
        "pl": "Pierwszy telefon",
        "ru": "Первый звонок"
      },
      "situation": {
        "pl": "Dzwonisz do firmy pierwszy raz. Klient nie wie, kim jesteś, i jest w połowie czegoś innego.",
        "ru": "Вы звоните в компанию впервые. Клиент не знает, кто вы, и в данный момент занят чем-то другим."
      },
      "goal": {
        "pl": "Przedstawić się w 10 sekund, powiedzieć po co dzwonisz i sprawdzić, czy ma chwilę.",
        "ru": "Представиться за 10 секунд, сказать, зачем вы звоните, и узнать, есть ли у клиента минутка."
      },
      "readyPhrase": {
        "pl": "Dzień dobry, mówi [Imię] z Aura Global Merchants. Dzwonię do lokalnych firm w [branża], bo pomagamy im zdobywać więcej klientów przez internet. Ma Pan/Pani 2 minuty?",
        "ru": "Добрый день, это [Имя] из Aura Global Merchants. Я обзваниваю местные компании в сфере [отрасль] — мы помогаем им привлекать больше клиентов через интернет. У вас есть 2 минуты?"
      },
      "badExample": {
        "pl": "Dzień dobry, dzwonię, bo robimy strony internetowe i marketing, może Pana zainteresuje...",
        "ru": "Добрый день, звоню, потому что мы делаем сайты и маркетинг, возможно, вас заинтересует..."
      },
      "goodExample": {
        "pl": "Dzień dobry, mówi Marek z Aura Global Merchants. Dzwonię do firm zajmujących się klimatyzacją w Warszawie — sprawdzam, jak wygląda Państwa obecność w internecie. Ma Pan 2 minuty?",
        "ru": "Добрый день, это Марек из Aura Global Merchants. Я звоню компаниям, которые занимаются кондиционерами в Варшаве, — хочу узнать, как обстоят дела с вашим присутствием в интернете. У вас есть 2 минуты?"
      },
      "logic": {
        "pl": "Krótkie przedstawienie + konkretna branża + pytanie o czas buduje wrażenie, że to nie jest przypadkowy spam.",
        "ru": "Короткое представление + конкретная отрасль + вопрос о времени создают впечатление, что это не случайный спам-звонок."
      },
      "whatNotToSay": {
        "pl": "Nie zaczynaj od listy usług. Nie mów \"mam dla Pana ofertę\" na starcie.",
        "ru": "Не начинайте с перечисления услуг. Не говорите \"у меня для вас предложение\" в самом начале."
      },
      "howToTransition": {
        "pl": "Jeśli powie \"tak, słucham\" — przejdź do jednego konkretnego pytania o stronę/Google, nie do oferty.",
        "ru": "Если клиент скажет \"да, слушаю\" — переходите к одному конкретному вопросу о сайте/Google, а не к предложению."
      }
    },
    {
      "id": "client-busy",
      "title": {
        "pl": "Klient zajęty",
        "ru": "Клиент занят"
      },
      "situation": {
        "pl": "Klient mówi, że jest teraz zajęty i nie ma czasu rozmawiać.",
        "ru": "Клиент говорит, что сейчас занят и у него нет времени разговаривать."
      },
      "goal": {
        "pl": "Nie naciskać, tylko szybko ustalić konkretny termin oddzwonienia.",
        "ru": "Не давить на клиента, а быстро согласовать конкретное время для повторного звонка."
      },
      "readyPhrase": {
        "pl": "Rozumiem, nie zabiorę więcej czasu. Kiedy lepiej oddzwonić — dziś po południu czy jutro rano?",
        "ru": "Понимаю, больше не буду отнимать у вас время. Когда лучше перезвонить — сегодня после обеда или завтра утром?"
      },
      "badExample": {
        "pl": "To może chociaż szybko powiem, o co chodzi...",
        "ru": "Тогда, может, я хотя бы быстро скажу, в чём дело..."
      },
      "goodExample": {
        "pl": "Rozumiem, że dziś ciężki dzień. Czy jutro około 11:00 pasuje na 3-minutową rozmowę?",
        "ru": "Понимаю, сегодня тяжёлый день. Вам подойдёт завтра около 11:00 для трёхминутного разговора?"
      },
      "logic": {
        "pl": "Dawanie klientowi kontroli nad terminem zwiększa szansę, że faktycznie odbierze telefon następnym razem.",
        "ru": "Если дать клиенту возможность самому выбрать время, вероятность того, что он действительно ответит на следующий звонок, возрастает."
      },
      "whatNotToSay": {
        "pl": "Nie mów \"to zajmie tylko chwilę\" i nie ciągnij rozmowy mimo odmowy.",
        "ru": "Не говорите \"это займёт всего минуту\" и не продолжайте разговор, несмотря на отказ."
      },
      "howToTransition": {
        "pl": "Zapisz dokładny termin w parserze jako notatkę i ustaw status \"poprosił o oddzwonienie\".",
        "ru": "Запишите точное время в парсере как заметку и установите статус \"попросил перезвонить\"."
      }
    },
    {
      "id": "not-interested",
      "title": {
        "pl": "Klient mówi \"nie jestem zainteresowany\"",
        "ru": "Клиент говорит \"меня это не интересует\""
      },
      "situation": {
        "pl": "Klient odpowiada od razu odmową, zanim jeszcze cokolwiek wytłumaczysz.",
        "ru": "Клиент сразу отвечает отказом, ещё до того, как вы успели что-либо объяснить."
      },
      "goal": {
        "pl": "Sprawdzić, czy to odruchowa odmowa, czy naprawdę świadoma decyzja, bez wywierania presji.",
        "ru": "Выяснить, это рефлекторный отказ или действительно осознанное решение, не оказывая давления."
      },
      "readyPhrase": {
        "pl": "Rozumiem. Czy to dlatego, że mają już Państwo kogoś od strony/marketingu, czy po prostu to nie priorytet teraz?",
        "ru": "Понимаю. Это потому, что у вас уже есть кто-то, кто занимается сайтом/маркетингом, или просто сейчас это не приоритет?"
      },
      "badExample": {
        "pl": "Ale proszę chwilę posłuchać, to naprawdę dobra oferta...",
        "ru": "Но послушайте секунду, это действительно хорошее предложение..."
      },
      "goodExample": {
        "pl": "Rozumiem. Czy to dlatego, że temat strony jest już ogarnięty, czy po prostu nie ten moment?",
        "ru": "Понимаю. Это потому, что вопрос с сайтом уже решён, или просто сейчас не тот момент?"
      },
      "logic": {
        "pl": "Jedno pytanie diagnostyczne oddziela \"nie mam czasu teraz\" od \"naprawdę nie potrzebuję\", nie brzmiąc przy tym jak nachalny sprzedawca.",
        "ru": "Один диагностический вопрос помогает отделить \"сейчас нет времени\" от \"мне это действительно не нужно\", не создавая при этом впечатления навязчивого продавца."
      },
      "whatNotToSay": {
        "pl": "Nie mów \"proszę dać mi szansę\" — to brzmi błagalnie, nie profesjonalnie.",
        "ru": "Не говорите \"дайте мне шанс\" — это звучит умоляюще, а не профессионально."
      },
      "howToTransition": {
        "pl": "Jeśli powód to brak priorytetu — zostaw krótką furtkę i zapytaj o zgodę na kontakt za kilka miesięcy.",
        "ru": "Если причина в отсутствии приоритета — оставьте небольшую лазейку и спросите разрешения связаться через несколько месяцев."
      }
    },
    {
      "id": "already-has-website",
      "title": {
        "pl": "Klient mówi \"mamy już stronę\"",
        "ru": "Клиент говорит \"у нас уже есть сайт\""
      },
      "situation": {
        "pl": "Klient odpowiada, że firma ma już stronę internetową.",
        "ru": "Клиент отвечает, что у компании уже есть сайт."
      },
      "goal": {
        "pl": "Nie kwestionować od razu jakości strony, tylko zrozumieć, jak ona dziś pracuje na klienta.",
        "ru": "Не подвергать сразу сомнению качество сайта, а понять, как он сегодня работает на клиента."
      },
      "readyPhrase": {
        "pl": "Super, że mają już Państwo stronę. A czy przynosi ona realnie nowe zapytania, czy działa bardziej jako wizytówka?",
        "ru": "Отлично, что у вас уже есть сайт. А он реально приносит новые заявки, или скорее работает как визитка?"
      },
      "badExample": {
        "pl": "Ale ta strona pewnie jest już stara i słaba, prawda?",
        "ru": "Но этот сайт, наверное, уже старый и слабый, да?"
      },
      "goodExample": {
        "pl": "Świetnie. A jak wygląda ruch z tej strony — czy klienci przez nią faktycznie dzwonią lub piszą?",
        "ru": "Отлично. А как обстоят дела с трафиком с этого сайта — клиенты действительно звонят или пишут через него?"
      },
      "logic": {
        "pl": "Pytanie o efekt (leady), nie o wygląd, pozwala uniknąć obrażania klienta i naturalnie prowadzi do tematu redesignu/SEO.",
        "ru": "Вопрос о результате (лидах), а не о внешнем виде, позволяет не задеть клиента и естественно подводит к теме редизайна/SEO."
      },
      "whatNotToSay": {
        "pl": "Nie krytykuj strony, której nie widziałeś.",
        "ru": "Не критикуйте сайт, которого вы не видели."
      },
      "howToTransition": {
        "pl": "Jeśli strona nie przynosi zapytań — zaproponuj krótki, bezpłatny przegląd i propozycję poprawek.",
        "ru": "Если сайт не приносит заявок — предложите короткий бесплатный аудит и рекомендации по улучшению."
      }
    },
    {
      "id": "send-offer",
      "title": {
        "pl": "Klient mówi \"proszę wysłać ofertę\"",
        "ru": "Клиент говорит \"пришлите предложение\""
      },
      "situation": {
        "pl": "Klient chce zakończyć rozmowę, prosząc o przesłanie oferty mailem.",
        "ru": "Клиент хочет завершить разговор, попросив прислать предложение по email."
      },
      "goal": {
        "pl": "Zebrać minimum informacji, żeby oferta była konkretna, i umówić krótki follow-up.",
        "ru": "Собрать минимум информации, чтобы предложение было конкретным, и договориться о коротком follow-up."
      },
      "readyPhrase": {
        "pl": "Oczywiście, wyślę. Żeby oferta była dopasowana, a nie ogólna — czy mogę zadać 2 krótkie pytania o to, czego dokładnie Państwo szukają?",
        "ru": "Конечно, отправлю. Чтобы предложение было персонализированным, а не общим — можно задать 2 коротких вопроса о том, что именно вы ищете?"
      },
      "badExample": {
        "pl": "Dobrze, wyślę ofertę, do widzenia.",
        "ru": "Хорошо, отправлю предложение, до свидания."
      },
      "goodExample": {
        "pl": "Jasne, wyślę konkretną propozycję. Czy chodzi bardziej o nową stronę, czy o więcej zapytań z Google?",
        "ru": "Конечно, отправлю конкретное предложение. Речь больше о новом сайте или о большем количестве заявок из Google?"
      },
      "logic": {
        "pl": "\"Wyślij ofertę\" to często grzeczna forma odmowy — dopytanie pokazuje profesjonalizm i utrzymuje kontrolę nad rozmową.",
        "ru": "\"Пришлите предложение\" часто является вежливой формой отказа — уточняющий вопрос демонстрирует профессионализм и позволяет удержать контроль над разговором."
      },
      "whatNotToSay": {
        "pl": "Nie kończ rozmowy bez ustalenia konkretnego terminu kontaktu po wysłaniu oferty.",
        "ru": "Не завершайте разговор, не согласовав конкретную дату контакта после отправки предложения."
      },
      "howToTransition": {
        "pl": "Zapytaj: \"Czy mogę oddzwonić w czwartek, żeby omówić ofertę?\" i zapisz to jako kolejny krok w parserze.",
        "ru": "Спросите: \"Могу я перезвонить в четверг, чтобы обсудить предложение?\" и зафиксируйте это как следующий шаг в парсере."
      }
    },
    {
      "id": "asks-price-immediately",
      "title": {
        "pl": "Klient od razu pyta o cenę",
        "ru": "Клиент сразу спрашивает о цене"
      },
      "situation": {
        "pl": "Zanim cokolwiek wyjaśnisz, klient pyta wprost \"ile to kosztuje?\".",
        "ru": "Ещё до того, как вы что-либо объяснили, клиент прямо спрашивает: \"сколько это стоит?\"."
      },
      "goal": {
        "pl": "Podać orientacyjne widełki, nie obiecując dokładnej kwoty, i przejść do umówienia konsultacji.",
        "ru": "Назвать ориентировочную вилку цен, не обещая точную сумму, и перейти к назначению консультации."
      },
      "readyPhrase": {
        "pl": "Dokładna cena zależy od zakresu, ale proste projekty zaczynają się od około 400–500 EUR. Najlepiej krótko sprawdzić, czego Państwo potrzebują, i wtedy przygotować konkretną propozycję.",
        "ru": "Точная цена зависит от объёма работ, но простые проекты начинаются примерно от 400–500 EUR. Лучше всего коротко уточнить, что именно вам нужно, и тогда подготовить конкретное предложение."
      },
      "badExample": {
        "pl": "To zależy, ciężko powiedzieć, trzeba by zobaczyć.",
        "ru": "Это зависит, сложно сказать, нужно посмотреть."
      },
      "goodExample": {
        "pl": "Proste strony zaczynają się od około 400–500 EUR, bardziej rozbudowane projekty to 1200 EUR i więcej — zależy od zakresu. Sprawdźmy krótko, co dokładnie by się przydało.",
        "ru": "Простые сайты начинаются примерно от 400–500 EUR, более сложные проекты — от 1200 EUR и выше, всё зависит от объёма. Давайте коротко уточним, что именно вам нужно."
      },
      "logic": {
        "pl": "Konkretne widełki budują zaufanie, a przeniesienie rozmowy na \"zakres\" naturalnie prowadzi do spotkania/konsultacji.",
        "ru": "Конкретная вилка цен формирует доверие, а перевод разговора на тему \"объёма работ\" естественно подводит к встрече/консультации."
      },
      "whatNotToSay": {
        "pl": "Nie podawaj sztywnej, dokładnej ceny bez znajomości zakresu projektu.",
        "ru": "Не называйте жёсткую, точную цену, не зная объёма проекта."
      },
      "howToTransition": {
        "pl": "Od razu zaproponuj: \"Umówmy 15-minutową rozmowę z naszym specjalistą, żeby przygotować dokładną wycenę.\"",
        "ru": "Сразу предложите: \"Давайте назначим 15-минутный разговор с нашим специалистом, чтобы подготовить точную смету\"."
      }
    },
    {
      "id": "asks-where-number-from",
      "title": {
        "pl": "Klient pyta, skąd numer",
        "ru": "Клиент спрашивает, откуда номер"
      },
      "situation": {
        "pl": "Klient jest podejrzliwy i pyta, skąd masz jego numer telefonu.",
        "ru": "Клиент насторожен и спрашивает, откуда у вас его номер телефона."
      },
      "goal": {
        "pl": "Odpowiedzieć krótko i uczciwie, bez tłumaczenia się jak intruz.",
        "ru": "Ответить коротко и честно, не оправдываясь, будто вы что-то нарушили."
      },
      "readyPhrase": {
        "pl": "Numer znalazłem w publicznie dostępnym rejestrze firm/wizytówce Google dla [branża] w [miasto].",
        "ru": "Номер я нашёл в открытом реестре компаний / в профиле Google для [отрасль] в [город]."
      },
      "badExample": {
        "pl": "No, mamy taką bazę danych firm...",
        "ru": "Ну, у нас есть такая база данных компаний..."
      },
      "goodExample": {
        "pl": "Kontaktujemy się z firmami z [branża] na podstawie publicznych danych firmowych, np. Google Business czy CEIDG.",
        "ru": "Мы связываемся с компаниями из сферы [отрасль] на основе открытых корпоративных данных, например Google Business или реестра предпринимателей."
      },
      "logic": {
        "pl": "Konkretne, jawne źródło (rejestr publiczny, Google) uspokaja klienta bardziej niż wymijająca odpowiedź.",
        "ru": "Конкретный, открытый источник (публичный реестр, Google) успокаивает клиента куда лучше, чем уклончивый ответ."
      },
      "whatNotToSay": {
        "pl": "Nie udawaj, że to \"przypadkowy\" telefon ani nie mów niejasno \"mamy swoje źródła\".",
        "ru": "Не делайте вид, что это \"случайный\" звонок, и не говорите расплывчато \"у нас свои источники\"."
      },
      "howToTransition": {
        "pl": "Po wyjaśnieniu od razu wróć do tematu rozmowy: \"A propos — sprawdzałem Państwa profil i...\"",
        "ru": "После объяснения сразу возвращайтесь к теме разговора: \"Кстати, я смотрел ваш профиль и...\""
      }
    },
    {
      "id": "already-has-agency",
      "title": {
        "pl": "Klient mówi, że ma już agencję",
        "ru": "Клиент говорит, что у него уже есть агентство"
      },
      "situation": {
        "pl": "Klient współpracuje już z inną firmą marketingową/webową.",
        "ru": "Клиент уже сотрудничает с другой маркетинговой/веб-компанией."
      },
      "goal": {
        "pl": "Nie krytykować konkurencji, tylko sprawdzić, czy klient jest w pełni zadowolony i otwarty na drugą opinię.",
        "ru": "Не критиковать конкурентов, а выяснить, полностью ли клиент доволен и открыт ли он ко второму мнению."
      },
      "readyPhrase": {
        "pl": "To dobrze, że mają Państwo kogoś od tego tematu. Czy jest Pan/Pani w pełni zadowolony/a z efektów, czy są obszary, które chcielibyście poprawić?",
        "ru": "Хорошо, что у вас уже есть кто-то по этому вопросу. Вы полностью довольны результатами, или есть моменты, которые хотелось бы улучшить?"
      },
      "badExample": {
        "pl": "A czy ta agencja w ogóle się do Państwa odzywa i coś robi?",
        "ru": "А это агентство вообще выходит с вами на связь и что-то делает?"
      },
      "goodExample": {
        "pl": "Rozumiem. Gdyby pojawiła się kiedyś potrzeba drugiej opinii albo dodatkowego projektu — czy mogę zostawić kontakt?",
        "ru": "Понимаю. Если когда-нибудь появится потребность во втором мнении или в дополнительном проекте — могу я оставить свои контакты?"
      },
      "logic": {
        "pl": "Klienci z istniejącą agencją rzadko zrywają współpracę od razu, ale często są otwarci na \"opcję B\" na przyszłość.",
        "ru": "Клиенты, у которых уже есть агентство, редко разрывают сотрудничество сразу, но часто открыты к \"варианту Б\" на будущее."
      },
      "whatNotToSay": {
        "pl": "Nie mów źle o konkurencji — to obniża Twoją wiarygodność.",
        "ru": "Не отзывайтесь плохо о конкурентах — это снижает доверие к вам."
      },
      "howToTransition": {
        "pl": "Jeśli słychać niezadowolenie — delikatnie zaproponuj bezpłatny przegląd \"dla porównania\".",
        "ru": "Если слышно недовольство — деликатно предложите бесплатный аудит \"для сравнения\"."
      }
    },
    {
      "id": "irritated-client",
      "title": {
        "pl": "Klient jest poirytowany",
        "ru": "Клиент раздражён"
      },
      "situation": {
        "pl": "Klient odpowiada szorstko, jest zirytowany kolejnym telefonem sprzedażowym.",
        "ru": "Клиент отвечает резко, раздражён очередным звонком от продавца."
      },
      "goal": {
        "pl": "Rozładować napięcie, zachować spokój i szybko dać klientowi wyjście z rozmowy bez presji.",
        "ru": "Снять напряжение, сохранить спокойствие и быстро дать клиенту возможность выйти из разговора без давления."
      },
      "readyPhrase": {
        "pl": "Rozumiem, przepraszam za kłopot. Nie chcę zabierać czasu — czy mogę tylko zostawić kontakt na przyszłość, gdyby temat strony/marketingu kiedyś się pojawił?",
        "ru": "Понимаю, прошу прощения за беспокойство. Не хочу отнимать у вас время — можно я просто оставлю свои контакты на будущее, если тема сайта/маркетинга когда-нибудь станет актуальной?"
      },
      "badExample": {
        "pl": "Spokojnie, nie ma co się denerwować, to tylko telefon.",
        "ru": "Спокойно, не стоит так нервничать, это же просто звонок."
      },
      "goodExample": {
        "pl": "Rozumiem Pana irytację, dzwonimy pewnie nie pierwszy raz w tym temacie. Nie zabiorę więcej czasu.",
        "ru": "Понимаю ваше раздражение, вам, наверное, не первый раз звонят по этому поводу. Больше не буду отнимать у вас время."
      },
      "logic": {
        "pl": "Spokojny, przepraszający ton rozbraja agresję szybciej niż tłumaczenie się lub obrona.",
        "ru": "Спокойный, извиняющийся тон обезоруживает агрессию быстрее, чем оправдания или защита."
      },
      "whatNotToSay": {
        "pl": "Nie odpowiadaj tym samym tonem i nie tłumacz się długo.",
        "ru": "Не отвечайте тем же тоном и не оправдывайтесь долго."
      },
      "howToTransition": {
        "pl": "Zakończ rozmowę uprzejmie i ustaw status \"nie zainteresowany\" — nie dzwoń ponownie w krótkim czasie.",
        "ru": "Завершите разговор вежливо и установите статус \"не заинтересован\" — не звоните повторно в ближайшее время."
      }
    },
    {
      "id": "asks-callback",
      "title": {
        "pl": "Klient prosi o oddzwonienie",
        "ru": "Клиент просит перезвонить"
      },
      "situation": {
        "pl": "Klient prosi, żeby oddzwonić innym razem, bez podania konkretnego terminu.",
        "ru": "Клиент просит перезвонить в другой раз, не называя конкретного времени."
      },
      "goal": {
        "pl": "Nie zostawiać tego otwartego — ustalić dokładny dzień i godzinę.",
        "ru": "Не оставлять вопрос открытым — согласовать точный день и время."
      },
      "readyPhrase": {
        "pl": "Jasne, oddzwonię. Żeby nie trafić znowu w zły moment — czy wtorek około 10:00 będzie pasować?",
        "ru": "Хорошо, перезвоню. Чтобы снова не попасть в неудобный момент — вам подойдёт вторник около 10:00?"
      },
      "badExample": {
        "pl": "Dobrze, to oddzwonię kiedyś później.",
        "ru": "Хорошо, тогда перезвоню как-нибудь позже."
      },
      "goodExample": {
        "pl": "Oczywiście. Zapiszę sobie: wtorek, godzina 10:00 — czy to dobry termin dla Pana?",
        "ru": "Конечно. Запишу себе: вторник, 10:00 — вам удобно это время?"
      },
      "logic": {
        "pl": "Konkretny termin drastycznie zwiększa szansę, że kolejny telefon zostanie odebrany i potraktowany poważnie.",
        "ru": "Конкретная договорённость о времени значительно повышает шанс, что на следующий звонок ответят и отнесутся к нему серьёзно."
      },
      "whatNotToSay": {
        "pl": "Nie kończ słowami \"to oddzwonię kiedyś\" bez konkretnej daty i godziny.",
        "ru": "Не заканчивайте фразой \"тогда перезвоню как-нибудь\" без конкретной даты и времени."
      },
      "howToTransition": {
        "pl": "Zapisz dokładny termin jako notatkę w parserze i ustaw status oczekujący na oddzwonienie.",
        "ru": "Запишите точное время как заметку в парсере и установите статус ожидания повторного звонка."
      }
    },
    {
      "id": "how-to-book-meeting",
      "title": {
        "pl": "Jak umówić spotkanie",
        "ru": "Как назначить встречу"
      },
      "situation": {
        "pl": "Klient wykazuje realne zainteresowanie i jest gotowy na kolejny krok.",
        "ru": "Клиент проявляет реальный интерес и готов к следующему шагу."
      },
      "goal": {
        "pl": "Przejść od rozmowy telefonicznej do konkretnie umówionej konsultacji z terminem.",
        "ru": "Перейти от телефонного разговора к конкретно назначенной консультации с датой и временем."
      },
      "readyPhrase": {
        "pl": "Świetnie, w takim razie umówmy krótką, 15-minutową rozmowę z naszym specjalistą, żeby omówić szczegóły i przygotować propozycję. Pasuje Panu środa czy czwartek?",
        "ru": "Отлично, тогда давайте назначим короткий 15-минутный разговор с нашим специалистом, чтобы обсудить детали и подготовить предложение. Вам удобнее среда или четверг?"
      },
      "badExample": {
        "pl": "To ja komuś przekażę i ktoś się odezwie.",
        "ru": "Тогда я кому-нибудь передам, и с вами свяжутся."
      },
      "goodExample": {
        "pl": "Umówmy konkretny termin — środa 14:00 czy czwartek 11:00, co pasuje bardziej?",
        "ru": "Давайте назначим конкретное время — среда 14:00 или четверг 11:00, что вам больше подходит?"
      },
      "logic": {
        "pl": "Dawanie dwóch konkretnych opcji terminu (zamiast pytania otwartego) ułatwia klientowi szybką decyzję.",
        "ru": "Предложение двух конкретных вариантов времени (вместо открытого вопроса) помогает клиенту быстрее принять решение."
      },
      "whatNotToSay": {
        "pl": "Nie zostawiaj sprawy na \"ktoś się odezwie\" bez konkretnej daty.",
        "ru": "Не оставляйте вопрос на уровне \"кто-нибудь свяжется\" без конкретной даты."
      },
      "howToTransition": {
        "pl": "Potwierdź termin, zapisz w parserze status \"spotkanie umówione\" wraz z datą i kanałem kontaktu.",
        "ru": "Подтвердите время, зафиксируйте в парсере статус \"встреча назначена\" вместе с датой и каналом связи."
      }
    },
    {
      "id": "how-to-end-call",
      "title": {
        "pl": "Jak zakończyć rozmowę",
        "ru": "Как завершить разговор"
      },
      "situation": {
        "pl": "Rozmowa dobiega końca, niezależnie od wyniku (sukces, odmowa, oddzwonienie).",
        "ru": "Разговор подходит к концу, независимо от результата (успех, отказ, договорённость о повторном звонке)."
      },
      "goal": {
        "pl": "Zakończyć profesjonalnie, zostawiając dobre wrażenie niezależnie od rezultatu.",
        "ru": "Завершить разговор профессионально, оставив хорошее впечатление независимо от результата."
      },
      "readyPhrase": {
        "pl": "Dziękuję za rozmowę i Pana/Pani czas. Miłego dnia!",
        "ru": "Спасибо за разговор и за ваше время. Хорошего дня!"
      },
      "badExample": {
        "pl": "(nagłe rozłączenie bez podsumowania)",
        "ru": "(резкое завершение звонка без подведения итогов)"
      },
      "goodExample": {
        "pl": "Dziękuję za czas, podsumowując: [ustalenie]. Miłego dnia, do usłyszenia!",
        "ru": "Спасибо за уделённое время, подытожим: [договорённость]. Хорошего дня, до связи!"
      },
      "logic": {
        "pl": "Krótkie podsumowanie ustaleń na koniec zmniejsza ryzyko nieporozumień i buduje profesjonalny wizerunek.",
        "ru": "Короткое подведение итогов в конце разговора снижает риск недопонимания и формирует профессиональный образ."
      },
      "whatNotToSay": {
        "pl": "Nie kończ rozmowy bez jasnego podsumowania następnego kroku (lub jego braku).",
        "ru": "Не завершайте разговор без чёткого обозначения следующего шага (или его отсутствия)."
      },
      "howToTransition": {
        "pl": "Zapisz w parserze finalny status rozmowy i wszelkie ustalenia, zanim przejdziesz do kolejnego lead-a.",
        "ru": "Прежде чем переходить к следующему лиду, зафиксируйте в парсере итоговый статус разговора и все договорённости."
      }
    },
    {
      "id": "need-to-think-about-it",
      "title": {
        "pl": "Klient mówi \"muszę to przemyśleć\"",
        "ru": "Клиент говорит \"мне нужно подумать\""
      },
      "situation": {
        "pl": "Klient nie odmawia wprost, ale mówi, że musi się zastanowić lub przemyśleć temat.",
        "ru": "Клиент не отказывает напрямую, но говорит, что ему нужно обдумать вопрос."
      },
      "goal": {
        "pl": "Zrozumieć, co konkretnie budzi wątpliwość, zamiast zostawiać sprawę w zawieszeniu.",
        "ru": "Понять, что именно вызывает сомнение, вместо того чтобы оставлять вопрос в подвешенном состоянии."
      },
      "readyPhrase": {
        "pl": "Jasne, to naturalne przy takiej decyzji. Żebym wiedział, na czym się skupić — czy chodzi bardziej o cenę, o zakres, czy o coś innego?",
        "ru": "Конечно, это естественно при таком решении. Чтобы я понимал, на чём сосредоточиться — дело больше в цене, в объёме работ, или в чём-то другом?"
      },
      "badExample": {
        "pl": "Dobrze, to niech Pan/Pani przemyśli i sam/sama się odezwie, jak będzie gotowy/gotowa.",
        "ru": "Хорошо, тогда подумайте и сами свяжитесь, когда будете готовы."
      },
      "goodExample": {
        "pl": "Rozumiem, to spora decyzja. Czy mogę zapytać, co dokładnie chce Pan/Pani przemyśleć — może uda się to od razu wyjaśnić?",
        "ru": "Понимаю, это серьёзное решение. Можно спросить, что именно вы хотите обдумать — возможно, это можно прояснить прямо сейчас?"
      },
      "logic": {
        "pl": "\"Muszę przemyśleć\" często ukrywa konkretną, nienazwaną wątpliwość — pytanie doprecyzowujące pozwala ją wydobyć i od razu zaadresować, zamiast czekać na kontakt, który może nigdy nie nadejść.",
        "ru": "За фразой \"мне нужно подумать\" часто скрывается конкретное, но невысказанное сомнение — уточняющий вопрос позволяет его выявить и сразу отработать, вместо того чтобы ждать звонка, который может так и не поступить."
      },
      "whatNotToSay": {
        "pl": "Nie mów \"dobrze, to czekam na telefon\" — inicjatywa musi zostać po Twojej stronie.",
        "ru": "Не говорите \"хорошо, буду ждать вашего звонка\" — инициатива должна оставаться за вами."
      },
      "howToTransition": {
        "pl": "Zaproponuj konkretny termin, kiedy sam oddzwonisz z pytaniem, i zapisz go w parserze jako follow-up, nawet jeśli klient tego nie prosił.",
        "ru": "Предложите конкретное время, когда вы сами перезвоните с уточнением, и зафиксируйте его в парсере как follow-up, даже если клиент об этом не просил."
      }
    },
    {
      "id": "too-expensive",
      "title": {
        "pl": "Klient mówi \"za drogo\"",
        "ru": "Клиент говорит \"слишком дорого\""
      },
      "situation": {
        "pl": "Klient reaguje na przedstawioną wycenę lub ogólny koszt stwierdzeniem, że to za dużo, bez pytania o szczegóły ceny.",
        "ru": "Клиент реагирует на озвученную смету или общую стоимость словами, что это слишком много, не спрашивая о деталях цены."
      },
      "goal": {
        "pl": "Zrozumieć punkt odniesienia klienta i pokazać wartość, zanim zacznie się negocjacja kwoty.",
        "ru": "Понять, с чем клиент сравнивает, и показать ценность предложения, прежде чем начинать торг по сумме."
      },
      "readyPhrase": {
        "pl": "Rozumiem. Czy porównuje Pan/Pani do konkretnej oferty, czy to ogólne odczucie? Bo czasem taniej wygląda coś, co potem trzeba poprawiać za dodatkowe pieniądze.",
        "ru": "Понимаю. Вы сравниваете с конкретным предложением, или это общее ощущение? Иногда то, что выглядит дешевле, потом приходится доделывать за дополнительные деньги."
      },
      "badExample": {
        "pl": "To może obniżymy cenę, ile Pan/Pani chciałby/chciałaby zapłacić?",
        "ru": "Тогда давайте снизим цену, сколько бы вы хотели заплатить?"
      },
      "goodExample": {
        "pl": "Rozumiem, że to istotny wydatek. Zanim porozmawiamy o cenie — powiedzmy dokładnie, co wchodzi w zakres, bo to wpływa na to, ile faktycznie warto zapłacić.",
        "ru": "Понимаю, что это существенные расходы. Прежде чем говорить о цене — давайте точно определим, что входит в объём работ, ведь это влияет на то, сколько на самом деле стоит заплатить."
      },
      "logic": {
        "pl": "Natychmiastowe obniżanie ceny podważa wartość usługi i uczy klienta negocjować dalej — lepiej najpierw ustalić, z czym klient porównuje, i wrócić do wartości.",
        "ru": "Немедленное снижение цены подрывает ценность услуги и приучает клиента торговаться дальше — лучше сначала выяснить, с чем клиент сравнивает, и вернуться к разговору о ценности."
      },
      "whatNotToSay": {
        "pl": "Nie schodź z ceny od razu i nie mów \"możemy coś ugrać\" bez zrozumienia powodu.",
        "ru": "Не снижайте цену сразу и не говорите \"можем что-то подвинуть\", не разобравшись в причине."
      },
      "howToTransition": {
        "pl": "Jeśli powód to realny budżet — zaproponuj węższy zakres (np. Starter) zamiast obniżać cenę tego samego projektu, i zapisz to w notatce.",
        "ru": "Если причина в реальном бюджете — предложите более узкий пакет (например, Starter) вместо снижения цены того же проекта, и зафиксируйте это в заметке."
      }
    },
    {
      "id": "need-partner-approval",
      "title": {
        "pl": "Klient mówi \"musimy zapytać wspólnika/szefa\"",
        "ru": "Клиент говорит \"нам нужно спросить партнёра/начальника\""
      },
      "situation": {
        "pl": "Osoba, z którą rozmawiasz, jest zainteresowana, ale mówi, że decyzję musi skonsultować z kimś innym w firmie.",
        "ru": "Собеседник заинтересован, но говорит, что решение нужно согласовать с кем-то ещё в компании."
      },
      "goal": {
        "pl": "Nie tracić kontaktu z decydentem — dowiedzieć się, kto podejmuje decyzję i pomóc przygotować rozmowę wewnętrzną.",
        "ru": "Не терять контакт с лицом, принимающим решение, — выяснить, кто именно принимает решение, и помочь подготовить внутренний разговор."
      },
      "readyPhrase": {
        "pl": "Jasne, to zrozumiałe przy takiej decyzji. Czy mogę przygotować krótkie podsumowanie mailem, żeby łatwiej było to omówić z [wspólnikiem/szefem]?",
        "ru": "Конечно, это понятно при таком решении. Могу подготовить короткое резюме на email, чтобы вам было проще обсудить это с [партнёром/начальником]?"
      },
      "badExample": {
        "pl": "Dobrze, to niech Pan/Pani porozmawia i da mi znać.",
        "ru": "Хорошо, тогда поговорите и дайте мне знать."
      },
      "goodExample": {
        "pl": "Rozumiem. Żeby ułatwić tę rozmowę, wyślę krótkie podsumowanie z ceną i zakresem. Czy mogę też zapytać, kiedy planujecie o tym rozmawiać, żebym wiedział, kiedy oddzwonić?",
        "ru": "Понимаю. Чтобы облегчить этот разговор, я пришлю короткое резюме с ценой и объёмом работ. Можно также спросить, когда вы планируете это обсудить, чтобы я знал, когда перезвонить?"
      },
      "logic": {
        "pl": "Przygotowanie materiału do wewnętrznej rozmowy zwiększa szansę, że decydent dostanie precyzyjne informacje, a nie streszczenie \"z pamięci\" — i daje pretekst do konkretnego follow-upu.",
        "ru": "Подготовка материала для внутреннего разговора повышает шанс, что лицо, принимающее решение, получит точную информацию, а не пересказ \"по памяти\", и даёт повод для конкретного follow-up."
      },
      "whatNotToSay": {
        "pl": "Nie mów \"to ja może porozmawiam bezpośrednio z szefem\" w sposób, który pomija osobę, z którą już rozmawiasz — to ją zniechęca.",
        "ru": "Не говорите \"тогда я, пожалуй, поговорю напрямую с начальником\" так, чтобы это обходило собеседника, с которым вы уже разговариваете, — это его оттолкнёт."
      },
      "howToTransition": {
        "pl": "Ustal konkretny termin oddzwonienia po rozmowie wewnętrznej i zapisz w parserze imię/rolę decydenta, jeśli udało się je poznać.",
        "ru": "Согласуйте конкретное время повторного звонка после внутреннего обсуждения и зафиксируйте в парсере имя/роль лица, принимающего решение, если удалось его узнать."
      }
    },
    {
      "id": "comparing-offers",
      "title": {
        "pl": "Klient mówi \"porównuję kilka ofert\"",
        "ru": "Клиент говорит \"я сравниваю несколько предложений\""
      },
      "situation": {
        "pl": "Klient informuje, że rozmawia równolegle z innymi firmami i zbiera oferty do porównania.",
        "ru": "Клиент сообщает, что параллельно ведёт переговоры с другими компаниями и собирает предложения для сравнения."
      },
      "goal": {
        "pl": "Nie wdawać się w wojnę cenową, tylko wyróżnić się konkretem i ułatwić uczciwe porównanie.",
        "ru": "Не ввязываться в ценовую войну, а выделиться конкретикой и облегчить честное сравнение."
      },
      "readyPhrase": {
        "pl": "To dobrze, warto porównać. Żeby porównanie było uczciwe, proszę zwrócić uwagę nie tylko na cenę, ale i na to, co dokładnie wchodzi w zakres — mogę to jasno rozpisać w naszej propozycji.",
        "ru": "Это хорошо, сравнивать стоит. Чтобы сравнение было честным, обратите внимание не только на цену, но и на то, что именно входит в объём работ — я могу чётко расписать это в нашем предложении."
      },
      "badExample": {
        "pl": "A jakie ceny mają inni? To może obniżymy naszą.",
        "ru": "А какие цены у других? Тогда, может, снизим нашу."
      },
      "goodExample": {
        "pl": "Bardzo dobrze, że Państwo porównują — to rozsądne podejście. Przygotuję propozycję z jasnym zakresem i terminami, żeby łatwo było zestawić ją z innymi.",
        "ru": "Очень хорошо, что вы сравниваете — это разумный подход. Я подготовлю предложение с чётким объёмом работ и сроками, чтобы его было легко сопоставить с другими."
      },
      "logic": {
        "pl": "Pytanie o ceny konkurencji stawia rozmowę na pozycji obronnej; skupienie się na przejrzystości własnej oferty buduje przewagę bez porównywania się wprost.",
        "ru": "Вопрос о ценах конкурентов ставит вас в оборонительную позицию; фокус на прозрачности собственного предложения создаёт преимущество без прямого сравнения с конкурентами."
      },
      "whatNotToSay": {
        "pl": "Nie pytaj wprost \"ile oferują inni\" i nie obiecuj \"damy taniej niż konkurencja\".",
        "ru": "Не спрашивайте прямо \"сколько предлагают другие\" и не обещайте \"дадим дешевле конкурентов\"."
      },
      "howToTransition": {
        "pl": "Zapytaj o termin, w którym klient planuje podjąć decyzję, i zaplanuj follow-up tuż przed tym terminem.",
        "ru": "Спросите, к какому сроку клиент планирует принять решение, и запланируйте follow-up незадолго до этого срока."
      }
    },
    {
      "id": "wants-to-diy",
      "title": {
        "pl": "Klient mówi \"zrobimy to sami\"",
        "ru": "Клиент говорит \"мы сделаем это сами\""
      },
      "situation": {
        "pl": "Klient uważa, że stronę/marketing może ogarnąć we własnym zakresie, np. przez pracownika lub znajomego.",
        "ru": "Клиент считает, что может справиться с сайтом/маркетингом своими силами, например, силами сотрудника или знакомого."
      },
      "goal": {
        "pl": "Docenić tę opcję, ale pokazać realny koszt czasu i ryzyko, żeby klient rozważył profesjonalną pomoc.",
        "ru": "Уважительно отнестись к этому варианту, но показать реальные затраты времени и риски, чтобы клиент рассмотрел профессиональную помощь."
      },
      "readyPhrase": {
        "pl": "To jak najbardziej możliwe. Pytanie tylko, czy ta osoba ma na to realnie czas i doświadczenie, bo często \"zrobimy sami\" ciągnie się miesiącami i kosztuje więcej w stracony czas niż w pieniądze.",
        "ru": "Это вполне возможно. Вопрос только в том, есть ли у этого человека реально время и опыт для этого, ведь часто \"сделаем сами\" растягивается на месяцы и обходится дороже в потерянном времени, чем в деньгах."
      },
      "badExample": {
        "pl": "No ale to się nie uda, sami Państwo tego nie zrobicie dobrze.",
        "ru": "Но у вас же ничего не получится, сами вы это хорошо не сделаете."
      },
      "goodExample": {
        "pl": "Rozumiem, wielu klientów zaczyna właśnie tak. Czy mogę zapytać, kto konkretnie miałby się tym zająć i ile czasu tygodniowo może na to poświęcić?",
        "ru": "Понимаю, многие клиенты начинают именно так. Можно спросить, кто конкретно будет этим заниматься и сколько часов в неделю сможет на это выделить?"
      },
      "logic": {
        "pl": "Zamiast podważać kompetencje klienta, pytanie o realny czas i zasoby ujawnia praktyczne ograniczenia samodzielnego podejścia bez brzmienia protekcjonalnie.",
        "ru": "Вместо того чтобы ставить под сомнение компетентность клиента, вопрос о реальном времени и ресурсах выявляет практические ограничения самостоятельного подхода, не звучит при этом снисходительно."
      },
      "whatNotToSay": {
        "pl": "Nie mów, że klient \"się nie zna\" ani że amatorskie rozwiązania są \"słabe\" — to obraźliwe i defensywne.",
        "ru": "Не говорите, что клиент \"не разбирается\", и не называйте любительские решения \"слабыми\" — это обидно и звучит как оборона."
      },
      "howToTransition": {
        "pl": "Zostaw furtkę: zaproponuj, że możecie pomóc tylko w jednym elemencie (np. samej stronie), a resztę klient robi sam, i zapisz to jako potencjalny lead do kontaktu za jakiś czas.",
        "ru": "Оставьте лазейку: предложите помочь только с одним элементом (например, только с сайтом), а остальное клиент делает сам, и зафиксируйте это как потенциальный лид для контакта через какое-то время."
      }
    },
    {
      "id": "distrust-scam-call",
      "title": {
        "pl": "Klient mówi \"nie ufam takim telefonom, to pewnie oszustwo\"",
        "ru": "Клиент говорит \"я не доверяю таким звонкам, это, наверное, мошенничество\""
      },
      "situation": {
        "pl": "Klient wprost sugeruje, że telefon może być próbą oszustwa lub nieuczciwą sprzedażą, jeszcze zanim usłyszy szczegóły.",
        "ru": "Клиент прямо намекает, что звонок может быть попыткой мошенничества или недобросовестной продажей, ещё до того, как услышал подробности."
      },
      "goal": {
        "pl": "Szybko i konkretnie zbudować wiarygodność, nie broniąc się nerwowo.",
        "ru": "Быстро и конкретно выстроить доверие, не оправдываясь нервно."
      },
      "readyPhrase": {
        "pl": "Rozumiem tę ostrożność, dziś naprawdę trzeba uważać. Jesteśmy firmą Aura Global Merchants, można nas sprawdzić w KRS/CEIDG i na Google — nie prosimy o żadne dane ani płatność przez telefon, tylko proponujemy bezpłatną rozmowę.",
        "ru": "Понимаю эту осторожность, сегодня действительно нужно быть внимательным. Мы компания Aura Global Merchants, нас можно проверить в реестре компаний и в Google — мы не просим никаких данных и оплаты по телефону, а лишь предлагаем бесплатный разговор."
      },
      "badExample": {
        "pl": "No skąd, to nie żadne oszustwo, proszę nam zaufać.",
        "ru": "Да что вы, никакое это не мошенничество, просто доверьтесь нам."
      },
      "goodExample": {
        "pl": "To zupełnie zrozumiałe pytanie. Działamy jawnie, jako Aura Global Merchants — może Pan/Pani spokojnie sprawdzić naszą firmę w internecie. Nie proszę o żadne dane wrażliwe, tylko o 2 minuty rozmowy.",
        "ru": "Это совершенно понятный вопрос. Мы работаем открыто, как Aura Global Merchants, — вы можете спокойно проверить нашу компанию в интернете. Я не прошу никаких конфиденциальных данных, только 2 минуты разговора."
      },
      "logic": {
        "pl": "Konkretne, sprawdzalne fakty (nazwa firmy, brak żądania danych/płatności) uspokajają skuteczniej niż zapewnienia typu \"proszę zaufać\", które w takiej sytuacji brzmią podejrzanie.",
        "ru": "Конкретные, проверяемые факты (название компании, отсутствие требования данных/оплаты) успокаивают эффективнее, чем заверения вроде \"просто доверьтесь\", которые в такой ситуации звучат подозрительно."
      },
      "whatNotToSay": {
        "pl": "Nie mów \"proszę mi zaufać\" jako jedynego argumentu i nie brzmij urażony/a pytaniem — to normalna, uzasadniona ostrożność klienta.",
        "ru": "Не используйте \"просто доверьтесь мне\" как единственный аргумент и не звучите обиженно из-за вопроса — это нормальная, обоснованная осторожность клиента."
      },
      "howToTransition": {
        "pl": "Jeśli klient się uspokoi, wróć do jednego konkretnego, sprawdzalnego spostrzeżenia o jego firmie, żeby pokazać, że telefon nie jest przypadkowy.",
        "ru": "Если клиент успокоится, вернитесь к одному конкретному, проверяемому наблюдению о его компании, чтобы показать, что звонок не случаен."
      }
    },
    {
      "id": "talking-to-gatekeeper",
      "title": {
        "pl": "Rozmowa z recepcją/asystentką, nie z decydentem",
        "ru": "Разговор с ресепшн/ассистентом, а не с лицом, принимающим решение"
      },
      "situation": {
        "pl": "Telefon odbiera osoba, która nie podejmuje decyzji (recepcja, asystentka, pracownik) i nie może rozmawiać merytorycznie.",
        "ru": "Трубку берёт человек, который не принимает решения (ресепшн, ассистент, сотрудник) и не может говорить по существу."
      },
      "goal": {
        "pl": "Uzyskać bezpośredni kontakt do właściwej osoby lub dobrze przygotowaną wiadomość do niej, zamiast tracić rozmowę w próżni.",
        "ru": "Получить прямой контакт нужного человека или оставить для него хорошо подготовленное сообщение, вместо того чтобы разговор ушёл в никуда."
      },
      "readyPhrase": {
        "pl": "Dzień dobry, z kim najlepiej porozmawiać w sprawie strony internetowej i marketingu firmy — czy to Pan/Pani, czy raczej właściciel/dyrektor? Czy mogę prosić o imię i bezpośredni numer?",
        "ru": "Добрый день, с кем лучше всего поговорить по поводу сайта и маркетинга компании — с вами или всё же с владельцем/директором? Можно узнать имя и прямой номер?"
      },
      "badExample": {
        "pl": "To może Pani przekaże, że dzwoniła firma od stron internetowych.",
        "ru": "Тогда, может, вы передадите, что звонила компания по сайтам."
      },
      "goodExample": {
        "pl": "Rozumiem, że to nie Pani decyzja. Czy mogłaby Pani podpowiedzieć, kto zajmuje się u Państwa stroną/marketingiem, i czy jest szansa się z nim/nią połączyć teraz, czy lepiej oddzwonić?",
        "ru": "Понимаю, что решение не за вами. Не подскажете, кто у вас занимается сайтом/маркетингом, и есть ли возможность соединиться с ним/с ней сейчас, или лучше перезвонить?"
      },
      "logic": {
        "pl": "Traktowanie osoby odbierającej telefon jako sojusznika, a nie przeszkody, zwiększa szansę na uzyskanie konkretnego imienia i numeru zamiast ogólnikowego \"przekażę\".",
        "ru": "Если относиться к человеку, взявшему трубку, как к союзнику, а не как к препятствию, повышается шанс получить конкретное имя и номер вместо общего \"передам\"."
      },
      "whatNotToSay": {
        "pl": "Nie mów \"to nieważne, niech ktoś oddzwoni\" — bez konkretnego imienia i numeru wiadomość zwykle ginie.",
        "ru": "Не говорите \"это неважно, пусть кто-нибудь перезвонит\" — без конкретного имени и номера сообщение обычно теряется."
      },
      "howToTransition": {
        "pl": "Zapisz w parserze imię i stanowisko decydenta oraz najlepszy sposób kontaktu; jeśli nie udało się go uzyskać, zaplanuj kolejną próbę o innej porze dnia.",
        "ru": "Запишите в парсере имя и должность лица, принимающего решение, а также лучший способ связи; если узнать это не удалось, запланируйте следующую попытку в другое время дня."
      }
    },
    {
      "id": "pivot-to-broader-proposal",
      "title": {
        "pl": "Jak przejść od jednej usługi do szerszej propozycji",
        "ru": "Как перейти от одной услуги к более широкому предложению"
      },
      "situation": {
        "pl": "Rozmowa zaczęła się od jednej konkretnej usługi (np. strona), a chcesz naturalnie wspomnieć o innych obszarach (SEO, reklamy, automatyzacja) bez wrażenia, że \"dosprzedajesz\".",
        "ru": "Разговор начался с одной конкретной услуги (например, сайта), а вы хотите естественно упомянуть другие направления (SEO, реклама, автоматизация), не создавая впечатления, что вы \"допродаёте\"."
      },
      "goal": {
        "pl": "Rozszerzyć rozmowę o kolejny obszar w sposób, który wynika z potrzeb klienta, a nie z checklisty usług.",
        "ru": "Расширить разговор на новое направление так, чтобы это вытекало из потребностей клиента, а не из чек-листа услуг."
      },
      "readyPhrase": {
        "pl": "Skoro już rozmawiamy o stronie — przy okazji, jak dziś klienci Państwa znajdują? Bo sama strona bez ruchu z Google czy reklam czasem nie wystarcza, żeby przynosiła realne zapytania.",
        "ru": "Раз уж мы говорим о сайте — кстати, как сегодня вас находят клиенты? Просто сам по себе сайт без трафика из Google или рекламы иногда не приносит реальных заявок."
      },
      "badExample": {
        "pl": "A skoro już tu jesteśmy, to może zainteresuje Pana/Panią też SEO i reklamy, i automatyzacja...",
        "ru": "А раз уж мы об этом заговорили, может, вас заинтересует ещё и SEO, и реклама, и автоматизация..."
      },
      "goodExample": {
        "pl": "Nowa strona to dobry start. Warto też zapytać — skąd dziś przychodzi większość klientów: z polecenia, z Google, czy z social mediów? To pomoże ustalić, czy sama strona wystarczy, czy warto pomyśleć też o widoczności w wyszukiwarce.",
        "ru": "Новый сайт — это хорошее начало. Стоит также спросить: откуда сегодня приходит большинство клиентов — по рекомендации, из Google или из соцсетей? Это поможет понять, достаточно ли одного сайта, или стоит подумать ещё и о видимости в поиске."
      },
      "logic": {
        "pl": "Pytanie o źródło ruchu klienta naturalnie prowadzi do tematu SEO/reklam jako logicznej konsekwencji, a nie jako listy dodatkowych usług do sprzedania.",
        "ru": "Вопрос об источнике трафика клиента естественно подводит к теме SEO/рекламы как логическому продолжению, а не как к списку дополнительных услуг на продажу."
      },
      "whatNotToSay": {
        "pl": "Nie wymieniaj od razu wszystkich dodatkowych usług jedna po drugiej — to brzmi jak dosprzedaż, nie jak doradztwo.",
        "ru": "Не перечисляйте сразу все дополнительные услуги одну за другой — это звучит как допродажа, а не как консультация."
      },
      "howToTransition": {
        "pl": "Jeśli klient wskaże słaby obszar (np. brak ruchu z Google) — zaproponuj, żeby specjalista poruszył to przy okazji już umówionej rozmowy o stronie.",
        "ru": "Если клиент укажет на слабое место (например, отсутствие трафика из Google) — предложите, чтобы специалист затронул это в рамках уже назначенного разговора о сайте."
      }
    },
    {
      "id": "upsell-existing-client",
      "title": {
        "pl": "Jak zaproponować dodatkową usługę istniejącemu klientowi",
        "ru": "Как предложить дополнительную услугу существующему клиенту"
      },
      "situation": {
        "pl": "Dzwonisz lub rozmawiasz z klientem, dla którego Aura już realizowała projekt (np. stronę), i chcesz zaproponować kolejną usługę.",
        "ru": "Вы звоните или разговариваете с клиентом, для которого Aura уже реализовала проект (например, сайт), и хотите предложить ему следующую услугу."
      },
      "goal": {
        "pl": "Wykorzystać istniejące zaufanie i wyniki dotychczasowej współpracy, żeby zaproponować kolejny, logiczny krok.",
        "ru": "Использовать уже существующее доверие и результаты предыдущего сотрудничества, чтобы предложить следующий логичный шаг."
      },
      "readyPhrase": {
        "pl": "Dzień dobry, dzwonię odnośnie strony, którą dla Państwa robiliśmy — jak ona dziś działa, przynosi zapytania? Bo mam pomysł na jeden krok, który mógłby to jeszcze poprawić.",
        "ru": "Добрый день, звоню по поводу сайта, который мы для вас делали, — как он сегодня работает, приносит заявки? У меня есть идея одного шага, который мог бы это ещё улучшить."
      },
      "badExample": {
        "pl": "Dzień dobry, mamy teraz promocję na reklamy Google, może Państwa zainteresuje?",
        "ru": "Добрый день, у нас сейчас акция на рекламу в Google, может, вас заинтересует?"
      },
      "goodExample": {
        "pl": "Dzień dobry, sprawdzałem, jak działa Państwa strona od czasu wdrożenia — ruch jest, ale widzę, że mało z niego zamienia się w telefony/wiadomości. Możemy to poprawić prostą kampanią w Google, chcieliby Państwo usłyszeć szczegóły?",
        "ru": "Добрый день, я проверял, как работает ваш сайт с момента запуска, — трафик есть, но я вижу, что мало из него превращается в звонки/сообщения. Мы можем это улучшить простой кампанией в Google, хотели бы вы узнать подробности?"
      },
      "logic": {
        "pl": "Odwołanie się do konkretnych, znanych już rezultatów poprzedniego projektu jest wiarygodniejsze niż ogólna oferta promocyjna i pokazuje, że rzeczywiście monitorujecie efekty.",
        "ru": "Обращение к конкретным, уже известным результатам предыдущего проекта звучит убедительнее, чем общее промо-предложение, и показывает, что вы действительно отслеживаете результаты."
      },
      "whatNotToSay": {
        "pl": "Nie zaczynaj od \"mamy promocję\" — dla stałego klienta to brzmi jak zwykły telemarketing, nie jak opieka nad projektem.",
        "ru": "Не начинайте с \"у нас акция\" — для постоянного клиента это звучит как обычный телемаркетинг, а не как забота о его проекте."
      },
      "howToTransition": {
        "pl": "Jeśli klient jest zainteresowany, przejdź od razu do konkretnej propozycji zakresu i ceny, korzystając z historii współpracy zapisanej w parserze.",
        "ru": "Если клиент заинтересован, сразу переходите к конкретному предложению по объёму работ и цене, используя историю сотрудничества, сохранённую в парсере."
      }
    },
    {
      "id": "inbound-warm-lead",
      "title": {
        "pl": "Klient sam zadzwonił lub napisał — ciepły lead",
        "ru": "Клиент сам позвонил или написал — тёплый лид"
      },
      "situation": {
        "pl": "Klient sam zainicjował kontakt (telefon, formularz, wiadomość), więc już wie, kim jesteście i czego szuka.",
        "ru": "Клиент сам инициировал контакт (звонок, форма, сообщение), поэтому уже знает, кто вы, и понимает, чего ищет."
      },
      "goal": {
        "pl": "Szybko zrozumieć konkretną potrzebę i poprowadzić rozmowę sprawnie, nie tracąc energii klienta na zbędne wprowadzenie.",
        "ru": "Быстро понять конкретную потребность и эффективно провести разговор, не тратя энергию клиента на лишнее вступление."
      },
      "readyPhrase": {
        "pl": "Dzień dobry, mówi [Imię] z Aura Global Merchants, oddzwaniam w sprawie zapytania, które Państwo zostawili. Czy mogę zapytać, co konkretnie Państwa skłoniło do kontaktu?",
        "ru": "Добрый день, это [Имя] из Aura Global Merchants, перезваниваю по заявке, которую вы оставили. Можно узнать, что именно побудило вас связаться с нами?"
      },
      "badExample": {
        "pl": "Dzień dobry, dzwonię do firm w [branża], sprawdzam obecność w internecie...",
        "ru": "Добрый день, звоню компаниям в сфере [отрасль], проверяю присутствие в интернете..."
      },
      "goodExample": {
        "pl": "Dzień dobry, [Imię] z Aura Global Merchants, dzwonię w odpowiedzi na Państwa wiadomość ze strony. Widzę, że pytali Państwo o [temat] — proszę powiedzieć więcej, jak to dziś wygląda u Was?",
        "ru": "Добрый день, [Имя] из Aura Global Merchants, звоню в ответ на ваше сообщение с сайта. Вижу, что вы спрашивали про [тема] — расскажите, пожалуйста, подробнее, как сейчас обстоят дела у вас?"
      },
      "logic": {
        "pl": "Ciepły lead nie wymaga przełamywania pierwszego oporu — rozmowę zaczyna się od razu od jego konkretnej potrzeby, co skraca czas do sedna i pokazuje sprawność.",
        "ru": "Тёплый лид не требует преодоления первичного сопротивления — разговор сразу начинается с его конкретной потребности, что сокращает путь к сути и демонстрирует эффективность."
      },
      "whatNotToSay": {
        "pl": "Nie zaczynaj od standardowego skryptu \"cold call\" — klient już wie, kim jesteście, więc to brzmi, jakbyście nie czytali jego zgłoszenia.",
        "ru": "Не начинайте со стандартного скрипта \"холодного звонка\" — клиент уже знает, кто вы, и это будет звучать так, будто вы не читали его заявку."
      },
      "howToTransition": {
        "pl": "Po ustaleniu potrzeby przejdź od razu do propozycji terminu konsultacji — ciepłe leady są gotowe na szybszy krok niż zimne telefony.",
        "ru": "После выяснения потребности сразу переходите к предложению даты консультации — тёплые лиды готовы к более быстрому шагу, чем холодные звонки."
      }
    },
    {
      "id": "asks-for-references",
      "title": {
        "pl": "Klient pyta o referencje/portfolio",
        "ru": "Клиент спрашивает про рекомендации/портфолио"
      },
      "situation": {
        "pl": "Klient chce zobaczyć dowody wcześniejszych realizacji, zanim podejmie decyzję.",
        "ru": "Клиент хочет увидеть доказательства предыдущих реализованных проектов, прежде чем принять решение."
      },
      "goal": {
        "pl": "Pokazać konkretne, dopasowane przykłady, budując wiarygodność bez zalewania klienta wszystkim naraz.",
        "ru": "Показать конкретные, релевантные примеры, выстраивая доверие, не заваливая клиента всем сразу."
      },
      "readyPhrase": {
        "pl": "Jasne, mamy kilka projektów z branży zbliżonej do Państwa — mogę wysłać 2-3 przykłady mailem razem z krótkim opisem efektów, jakie osiągnęły. Pasuje?",
        "ru": "Конечно, у нас есть несколько проектов в схожей с вашей сфере — могу прислать 2-3 примера на email вместе с коротким описанием достигнутых результатов. Подойдёт?"
      },
      "badExample": {
        "pl": "Mamy mnóstwo realizacji, wszystko jest na naszej stronie, proszę tam zajrzeć.",
        "ru": "У нас куча реализованных проектов, всё есть на нашем сайте, посмотрите там."
      },
      "goodExample": {
        "pl": "Oczywiście, to dobre pytanie. Robiliśmy m.in. stronę dla [podobna branża] — po wdrożeniu liczba zapytań wzrosła. Wyślę Państwu ten i jeszcze jeden podobny przykład, żeby było łatwiej ocenić.",
        "ru": "Конечно, это хороший вопрос. Мы, среди прочего, делали сайт для [похожая отрасль] — после запуска количество заявок выросло. Пришлю вам этот и ещё один похожий пример, чтобы было легче оценить."
      },
      "logic": {
        "pl": "Wyselekcjonowane, branżowo dopasowane przykłady z konkretnym efektem budują większe zaufanie niż odesłanie do ogólnego portfolio, w którym klient musi sam szukać czegoś trafnego.",
        "ru": "Отобранные, релевантные отрасли примеры с конкретным результатом формируют больше доверия, чем отсылка к общему портфолио, где клиенту приходится самому искать что-то подходящее."
      },
      "whatNotToSay": {
        "pl": "Nie odsyłaj klienta samego \"na stronę, tam wszystko jest\" — to przerzuca na niego pracę, którą powinieneś wykonać Ty.",
        "ru": "Не отправляйте клиента одного \"на сайт, там всё есть\" — так вы перекладываете на него работу, которую должны сделать вы сами."
      },
      "howToTransition": {
        "pl": "Wyślij przykłady mailem od razu po rozmowie i umów krótki follow-up, żeby sprawdzić, czy przekonały klienta.",
        "ru": "Отправьте примеры на email сразу после разговора и договоритесь о коротком follow-up, чтобы узнать, убедили ли они клиента."
      }
    },
    {
      "id": "leaving-voicemail",
      "title": {
        "pl": "Zostawianie wiadomości na poczcie głosowej",
        "ru": "Оставление сообщения на голосовой почте"
      },
      "situation": {
        "pl": "Klient nie odbiera, a telefon przełącza się na pocztę głosową.",
        "ru": "Клиент не берёт трубку, и звонок переключается на голосовую почту."
      },
      "goal": {
        "pl": "Zostawić krótką, konkretną wiadomość, która realnie zwiększa szansę na oddzwonienie.",
        "ru": "Оставить короткое, конкретное сообщение, которое реально повышает шанс на обратный звонок."
      },
      "readyPhrase": {
        "pl": "Dzień dobry, mówi [Imię] z Aura Global Merchants. Dzwonię w sprawie [krótki, konkretny powód, np. obecności Państwa firmy w Google]. Oddzwonię jeszcze [dzień], ale gdyby chcieli Państwo szybciej — mój numer to [numer]. Miłego dnia.",
        "ru": "Добрый день, это [Имя] из Aura Global Merchants. Звоню по поводу [короткая, конкретная причина, например, присутствия вашей компании в Google]. Перезвоню ещё [день], но если хотите быстрее — мой номер [номер]. Хорошего дня."
      },
      "badExample": {
        "pl": "(rozłączenie bez zostawienia wiadomości) albo długa wiadomość z pełną listą usług i cennikiem.",
        "ru": "(отключение без сообщения) или длинное сообщение с полным перечнем услуг и прайс-листом."
      },
      "goodExample": {
        "pl": "Dzień dobry, [Imię] z Aura Global Merchants. Dzwonię, bo sprawdzałem Państwa profil w Google i mam jedną konkretną uwagę, która może pomóc przyciągnąć więcej zapytań. Oddzwonię w czwartek, a numer do mnie to [numer]. Miłego dnia!",
        "ru": "Добрый день, [Имя] из Aura Global Merchants. Звоню, потому что смотрел ваш профиль в Google, и у меня есть одно конкретное замечание, которое может помочь привлечь больше заявок. Перезвоню в четверг, мой номер [номер]. Хорошего дня!"
      },
      "logic": {
        "pl": "Krótka wiadomość z jednym konkretnym, ciekawym powodem i jasną informacją \"kiedy oddzwonię\" działa lepiej niż długi monolog — klient wie, czego się spodziewać i nie musi oddzwaniać sam, żeby się dowiedzieć.",
        "ru": "Короткое сообщение с одной конкретной, интересной причиной и чёткой информацией \"когда я перезвоню\" работает лучше, чем длинный монолог — клиент понимает, чего ожидать, и ему не нужно перезванивать самому, чтобы это узнать."
      },
      "whatNotToSay": {
        "pl": "Nie zostawiaj wiadomości dłuższej niż 20-30 sekund i nie wymieniaj cennika ani pełnej oferty na poczcie głosowej.",
        "ru": "Не оставляйте сообщение длиннее 20-30 секунд и не перечисляйте цены или полный перечень услуг на голосовой почте."
      },
      "howToTransition": {
        "pl": "Zapisz w parserze, że zostawiono wiadomość, z datą i treścią, i ustaw przypomnienie na zapowiedziany termin kolejnego telefonu.",
        "ru": "Зафиксируйте в парсере, что сообщение оставлено, с датой и текстом, и установите напоминание на заявленную дату следующего звонка."
      }
    },
    {
      "id": "closing-hesitant-client",
      "title": {
        "pl": "Domykanie po wahającym się kliencie",
        "ru": "Завершение сделки с сомневающимся клиентом"
      },
      "situation": {
        "pl": "Klient brzmi przychylnie, zadaje pytania, ale nie podejmuje decyzji i zwleka (\"zobaczymy\", \"może\", \"pomyślimy\").",
        "ru": "Клиент настроен благосклонно, задаёт вопросы, но не принимает решение и тянет время (\"посмотрим\", \"может быть\", \"подумаем\")."
      },
      "goal": {
        "pl": "Delikatnie popchnąć rozmowę do konkretnej decyzji, nie wywierając presji, która mogłaby zniechęcić.",
        "ru": "Мягко подтолкнуть разговор к конкретному решению, не оказывая давления, которое могло бы оттолкнуть клиента."
      },
      "readyPhrase": {
        "pl": "Widzę, że temat Państwa interesuje. Co powstrzymuje przed umówieniem krótkiej, niezobowiązującej rozmowy ze specjalistą — może da się to teraz wyjaśnić?",
        "ru": "Вижу, что тема вас интересует. Что мешает назначить короткий, ни к чему не обязывающий разговор со специалистом — может, это можно прояснить прямо сейчас?"
      },
      "badExample": {
        "pl": "To niech Pan/Pani da znać, jak się Pan/Pani zdecyduje.",
        "ru": "Тогда дайте знать, как только определитесь."
      },
      "goodExample": {
        "pl": "Rozumiem, że to nie jest decyzja na już. Zaproponuję coś prostego: umówmy 15-minutową, niezobowiązującą rozmowę ze specjalistą na przyszły tydzień — jeśli po niej uzna Pan/Pani, że to nie dla Was, po prostu na tym się kończy.",
        "ru": "Понимаю, что это не решение на сейчас. Предложу простой вариант: давайте назначим 15-минутный, ни к чему не обязывающий разговор со специалистом на следующей неделе — если после него вы решите, что это не для вас, на этом всё и закончится."
      },
      "logic": {
        "pl": "Nazwanie wahania wprost i obniżenie \"kosztu\" decyzji (niezobowiązująca, krótka rozmowa zamiast zobowiązania) pomaga wahającemu się klientowi przejść przez ostatni krok bez presji.",
        "ru": "Прямое обозначение сомнений и снижение \"цены\" решения (короткий, ни к чему не обязывающий разговор вместо обязательства) помогает сомневающемуся клиенту сделать последний шаг без давления."
      },
      "whatNotToSay": {
        "pl": "Nie mów \"to na kiedy mam zarezerwować\" jako gotowej rezerwacji bez zgody — klient musi poczuć, że to on decyduje o kroku.",
        "ru": "Не говорите \"тогда на когда мне забронировать\" как готовое бронирование без согласия — клиент должен чувствовать, что решение о шаге принимает он сам."
      },
      "howToTransition": {
        "pl": "Jeśli klient się zgodzi — od razu ustal konkretny termin. Jeśli nadal się waha, zapytaj wprost o powód wahania i zapisz go jako notatkę do kolejnej rozmowy.",
        "ru": "Если клиент согласится — сразу согласуйте конкретное время. Если он всё ещё сомневается, прямо спросите о причине сомнений и запишите её как заметку для следующего разговора."
      }
    },
    {
      "id": "client-agreed-then-silent",
      "title": {
        "pl": "Klient mówił \"tak\", a potem zniknął",
        "ru": "Клиент говорил \"да\", а потом пропал"
      },
      "situation": {
        "pl": "Klient wcześniej zgodził się na kolejny krok (np. spotkanie, ofertę), ale przestał odpowiadać na telefony i wiadomości.",
        "ru": "Клиент ранее согласился на следующий шаг (например, встречу, предложение), но перестал отвечать на звонки и сообщения."
      },
      "goal": {
        "pl": "Ponownie nawiązać kontakt bez wywoływania poczucia winy, dając klientowi łatwe wyjście, jeśli zmienił zdanie.",
        "ru": "Восстановить контакт, не вызывая у клиента чувства вины, дав ему простой способ отказаться, если он передумал."
      },
      "readyPhrase": {
        "pl": "Dzień dobry, [Imię] z Aura Global Merchants — wiem, że umawialiśmy się na [ustalenie], ale nie udało nam się połączyć. Chciałem tylko sprawdzić, czy temat jest nadal aktualny, czy coś się zmieniło.",
        "ru": "Добрый день, [Имя] из Aura Global Merchants — знаю, что мы договаривались о [договорённость], но нам не удалось связаться. Хотел просто уточнить, актуальна ли ещё тема, или что-то изменилось."
      },
      "badExample": {
        "pl": "Dzień dobry, dzwonię już trzeci raz, bardzo prosiłbym o odpowiedź.",
        "ru": "Добрый день, звоню уже третий раз, очень прошу ответить."
      },
      "goodExample": {
        "pl": "Dzień dobry, [Imię] z Aura, chciałem tylko na chwilę wrócić do tematu strony, o którym rozmawialiśmy. Jeśli priorytety się zmieniły, śmiało, dam znać za jakiś czas — chciałem tylko wiedzieć, na czym stoimy.",
        "ru": "Добрый день, [Имя] из Aura, хотел на минуту вернуться к теме сайта, о которой мы говорили. Если приоритеты изменились — не стесняйтесь сказать, я дам о себе знать через какое-то время, просто хотел понять, на чём мы остановились."
      },
      "logic": {
        "pl": "Danie klientowi łatwej, niekonfrontacyjnej \"drogi wyjścia\" (np. \"jeśli priorytety się zmieniły\") zwiększa szansę na szczerą odpowiedź niż wywieranie presji przez podkreślanie liczby prób kontaktu.",
        "ru": "Предоставление клиенту простого, неконфронтационного \"выхода\" (например, \"если приоритеты изменились\") повышает шанс получить честный ответ, в отличие от давления через подчёркивание количества попыток связаться."
      },
      "whatNotToSay": {
        "pl": "Nie zaczynaj od \"dzwonię już kolejny raz\" ani nie brzmij, jakbyś miał/a pretensje o brak odpowiedzi.",
        "ru": "Не начинайте с \"звоню уже который раз\" и не звучите так, будто у вас есть претензии из-за отсутствия ответа."
      },
      "howToTransition": {
        "pl": "Jeśli nadal cisza po 2 takich próbach — przełącz na status \"wygasły lead\" i zaplanuj jeden dłuższy odstęp (np. za 2-3 miesiące) zamiast dalej dzwonić co kilka dni.",
        "ru": "Если после 2 таких попыток по-прежнему тишина — переключите статус на \"лид остыл\" и запланируйте один более длинный интервал (например, через 2-3 месяца) вместо того, чтобы продолжать звонить каждые несколько дней."
      }
    },
    {
      "id": "denies-value-of-internet",
      "title": {
        "pl": "Klient neguje wartość internetu/marketingu w ogóle",
        "ru": "Клиент отрицает ценность интернета/маркетинга в принципе"
      },
      "situation": {
        "pl": "Klient twierdzi, że internet czy marketing w ogóle nie jest im potrzebny, bo \"u nas i tak wszystko idzie z polecenia\".",
        "ru": "Клиент утверждает, что интернет или маркетинг им вообще не нужны, потому что \"у нас и так всё идёт по рекомендациям\"."
      },
      "goal": {
        "pl": "Nie kwestionować tego, co dziś działa, tylko pokazać, że polecenia i internet mogą działać razem, a nie zamiast siebie.",
        "ru": "Не подвергать сомнению то, что сегодня работает, а показать, что рекомендации и интернет могут работать вместе, а не вместо друг друга."
      },
      "readyPhrase": {
        "pl": "To świetnie, że polecenia tak dobrze działają — to najlepsza reklama. Czy zdarza się, że ktoś, kto dostał polecenie, i tak sprawdza Państwa w Google, zanim zadzwoni?",
        "ru": "Отлично, что рекомендации так хорошо работают — это лучшая реклама. А бывает, что человек, получивший рекомендацию, всё равно проверяет вас в Google, прежде чем позвонить?"
      },
      "badExample": {
        "pl": "No ale samo polecenie to za mało w dzisiejszych czasach, trzeba być w internecie.",
        "ru": "Но одних рекомендаций сегодня мало, нужно быть в интернете."
      },
      "goodExample": {
        "pl": "Rozumiem, polecenia to mocny fundament. Warto tylko wiedzieć, że większość osób, zanim zadzwoni nawet z polecenia, i tak sprawdza firmę w Google — jeśli tam Państwa nie ma albo profil wygląda słabo, część z nich może zrezygnować, mimo dobrego polecenia.",
        "ru": "Понимаю, рекомендации — это крепкий фундамент. Стоит только учитывать, что большинство людей, даже придя по рекомендации, прежде чем позвонить, всё равно проверяют компанию в Google — если вас там нет или профиль выглядит слабо, часть из них может отказаться, несмотря на хорошую рекомендацию."
      },
      "logic": {
        "pl": "Zamiast podważać skuteczność poleceń, pytanie pokazuje, że internetowa obecność wzmacnia już działający kanał, a nie go zastępuje — to łatwiejsze do zaakceptowania niż sugestia, że dotychczasowy model jest przestarzały.",
        "ru": "Вместо того чтобы ставить под сомнение эффективность рекомендаций, вопрос показывает, что присутствие в интернете усиливает уже работающий канал, а не заменяет его — это легче принять, чем намёк, что нынешняя модель устарела."
      },
      "whatNotToSay": {
        "pl": "Nie mów, że poleganie na poleceniach jest \"staromodne\" albo \"ryzykowne\" — to podważa coś, z czego klient jest dumny.",
        "ru": "Не говорите, что опора на рекомендации — это \"старомодно\" или \"рискованно\" — это подрывает то, чем клиент гордится."
      },
      "howToTransition": {
        "pl": "Jeśli klient przyzna, że klienci \"sprawdzają w Google\" — zaproponuj krótki, bezpłatny przegląd tego, jak firma dziś wygląda w wyszukiwarce.",
        "ru": "Если клиент признает, что его клиенты \"проверяют в Google\" — предложите короткий бесплатный аудит того, как компания сегодня выглядит в поисковике."
      }
    }
  ],
  "examples": [
    {
      "id": "good-first-call",
      "title": {
        "pl": "Dobry pierwszy telefon",
        "ru": "Хороший первый звонок"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Ola z Aura Global Merchants. Dzwonię do firm zajmujących się detailingiem w Warszawie — sprawdzam obecność online. Ma Pan 2 minuty?\nKlient: Tak, słucham.\nSprzedawca: Widzę, że mają Państwo profil na Instagramie, ale nie znalazłam własnej strony — czy to celowe, czy po prostu nie było na to czasu?\nKlient: Raczej nie było czasu, głównie klienci przychodzą z polecenia.\nSprzedawca: Rozumiem. Strona pomogłaby łapać też klientów, którzy szukają w Google, nie tylko z polecenia. Może umówimy krótką, 15-minutową rozmowę z naszym specjalistą, żeby pokazać, jak mogłoby to wyglądać?\nKlient: Dobrze, można spróbować.",
        "ru": "Продавец: Добрый день, меня зовут Оля, компания Aura Global Merchants. Обзваниваю компании, которые занимаются детейлингом в Варшаве — проверяю присутствие в интернете. У вас есть две минуты?\nКлиент: Да, слушаю.\nПродавец: Вижу, что у вас есть профиль в Instagram, но я не нашла собственного сайта — это осознанное решение или просто не было времени этим заняться?\nКлиент: Скорее просто не было времени, клиенты в основном приходят по рекомендациям.\nПродавец: Понимаю. Сайт помог бы привлекать также клиентов, которые ищут в Google, а не только по рекомендациям. Может, договоримся о коротком, 15-минутном разговоре с нашим специалистом, чтобы показать, как это могло бы выглядеть?\nКлиент: Хорошо, можно попробовать."
      },
      "whatWasGood": {
        "pl": "Krótkie przedstawienie, konkretne spostrzeżenie o braku strony, pytanie zamiast oceny, jasna propozycja spotkania.",
        "ru": "Краткое представление, конкретное наблюдение об отсутствии сайта, вопрос вместо оценки, чёткое предложение встречи."
      },
      "whatWasBad": {
        "pl": "Nic istotnego — rozmowa przebiegła zgodnie z dobrymi praktykami.",
        "ru": "Ничего существенного — разговор прошёл в соответствии с лучшими практиками."
      },
      "howItCouldBeBetter": {
        "pl": "Można było dodatkowo zapytać o liczbę zapytań miesięcznie, żeby lepiej ocenić potencjał.",
        "ru": "Можно было дополнительно спросить о количестве заявок в месяц, чтобы лучше оценить потенциал."
      },
      "outcome": {
        "pl": "Klient zgodził się na konsultację z specjalistą.",
        "ru": "Клиент согласился на консультацию со специалистом."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "bad-first-call",
      "title": {
        "pl": "Zły pierwszy telefon",
        "ru": "Плохой первый звонок"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, dzwonię, bo robimy strony, SEO, reklamy i w ogóle cały marketing internetowy, może by Pana zainteresowało?\nKlient: Nie, dziękuję.\nSprzedawca: Ale proszę chwilę posłuchać, mamy naprawdę dobrą ofertę promocyjną...\nKlient: Nie, nie jestem zainteresowany, do widzenia.",
        "ru": "Продавец: Добрый день, звоню, потому что мы делаем сайты, SEO, рекламу и вообще весь интернет-маркетинг, может, вас это заинтересует?\nКлиент: Нет, спасибо.\nПродавец: Но послушайте минутку, у нас действительно хорошее промо-предложение...\nКлиент: Нет, мне не интересно, до свидания."
      },
      "whatWasGood": {
        "pl": "Nic — rozmowa była zbyt ogólna i nachalna od pierwszej sekundy.",
        "ru": "Ничего — разговор был слишком общим и навязчивым с первой секунды."
      },
      "whatWasBad": {
        "pl": "Brak przedstawienia się z imienia, zbyt długa lista usług na start, ignorowanie pierwszej odmowy i naciskanie.",
        "ru": "Отсутствие представления по имени, слишком длинный список услуг в самом начале, игнорирование первого отказа и продолжение давления."
      },
      "howItCouldBeBetter": {
        "pl": "Przedstawić się krótko, wskazać jeden konkretny obszar (np. brak strony) i zapytać o zgodę na rozmowę zamiast od razu sprzedawać.",
        "ru": "Кратко представиться, указать одну конкретную область (например, отсутствие сайта) и спросить согласие на разговор, вместо того чтобы сразу продавать."
      },
      "outcome": {
        "pl": "Klient rozłączył się zirytowany.",
        "ru": "Клиент раздражённо повесил трубку."
      },
      "parserStatusToSet": "not_interested"
    },
    {
      "id": "client-no-website",
      "title": {
        "pl": "Klient bez strony",
        "ru": "Клиент без сайта"
      },
      "transcript": {
        "pl": "Sprzedawca: Sprawdzałem Państwa firmę i widzę tylko profil na Facebooku, bez własnej strony — czy to prawda?\nKlient: Tak, na razie tylko Facebook, wystarcza nam.\nSprzedawca: Rozumiem, że dziś to działa. Warto jednak wiedzieć, że część klientów szuka firm bezpośrednio w Google, a bez strony tam Państwa nie widać. Czy warto by było to sprawdzić na krótkiej rozmowie z naszym specjalistą?\nKlient: Może faktycznie warto zobaczyć, co proponujecie.",
        "ru": "Продавец: Я проверял вашу компанию и вижу только профиль в Facebook, без собственного сайта — это так?\nКлиент: Да, пока только Facebook, нам хватает.\nПродавец: Понимаю, что сегодня это работает. Однако стоит знать, что часть клиентов ищет компании напрямую в Google, а без сайта там вас не видно. Стоило бы это проверить на коротком разговоре с нашим специалистом?\nКлиент: Может, и правда стоит посмотреть, что вы предлагаете."
      },
      "whatWasGood": {
        "pl": "Brak oceniania obecnego rozwiązania, jasne wytłumaczenie utraconej szansy (wyszukiwanie w Google).",
        "ru": "Отсутствие оценки текущего решения, понятное объяснение упущенной возможности (поиск в Google)."
      },
      "whatWasBad": {
        "pl": "Można było dopytać, ile zapytań miesięcznie przychodzi z Facebooka, dla lepszego kontekstu.",
        "ru": "Можно было уточнить, сколько заявок в месяц приходит из Facebook, для лучшего понимания контекста."
      },
      "howItCouldBeBetter": {
        "pl": "Dodać krótkie pytanie o liczbę klientów miesięcznie przed przejściem do propozycji.",
        "ru": "Добавить короткий вопрос о количестве клиентов в месяц перед переходом к предложению."
      },
      "outcome": {
        "pl": "Klient zgodził się na rozmowę ze specjalistą.",
        "ru": "Клиент согласился на разговор со специалистом."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "client-old-website",
      "title": {
        "pl": "Klient ze starą stroną",
        "ru": "Клиент со старым сайтом"
      },
      "transcript": {
        "pl": "Sprzedawca: Widziałem Państwa stronę — działa, ale wygląda na starszą wersję, sprzed kilku lat. Czy przynosi dziś nowe zapytania?\nKlient: Szczerze, to rzadko ktoś przez nią pisze.\nSprzedawca: To dość częsty przypadek przy starszych stronach — nie są dopasowane do telefonów albo nie pojawiają się wysoko w Google. Możemy przygotować krótką propozycję odświeżenia strony, bez zmiany tego, co już działa.\nKlient: Brzmi sensownie, proszę przesłać więcej informacji.",
        "ru": "Продавец: Я посмотрел ваш сайт — он работает, но выглядит как более старая версия, сделанная несколько лет назад. Приносит ли он сегодня новые заявки?\nКлиент: Честно говоря, через него редко кто-то пишет.\nПродавец: Это довольно частый случай со старыми сайтами — они не адаптированы под телефоны или не показываются высоко в Google. Мы можем подготовить короткое предложение по обновлению сайта, не меняя то, что уже работает.\nКлиент: Звучит разумно, пришлите, пожалуйста, больше информации."
      },
      "whatWasGood": {
        "pl": "Pytanie o efekt strony zamiast krytyki wyglądu, zaproponowanie konkretnego, ograniczonego kroku (odświeżenie, nie budowa od zera).",
        "ru": "Вопрос об эффективности сайта вместо критики внешнего вида, предложение конкретного ограниченного шага (обновление, а не создание с нуля)."
      },
      "whatWasBad": {
        "pl": "Zgoda na \"wysłać więcej informacji\" bez próby umówienia konkretnej rozmowy jest słabsza niż spotkanie.",
        "ru": "Согласие на «прислать больше информации» без попытки договориться о конкретном разговоре — более слабый результат, чем встреча."
      },
      "howItCouldBeBetter": {
        "pl": "Spróbować dopytać o krótką rozmowę telefoniczną z specjalistą zamiast tylko wysyłki maila.",
        "ru": "Попробовать предложить короткий телефонный разговор со специалистом вместо того, чтобы ограничиваться отправкой письма."
      },
      "outcome": {
        "pl": "Klient poprosił o więcej informacji mailem.",
        "ru": "Клиент попросил прислать больше информации по электронной почте."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "client-good-website",
      "title": {
        "pl": "Klient z dobrą stroną",
        "ru": "Клиент с хорошим сайтом"
      },
      "transcript": {
        "pl": "Sprzedawca: Sprawdziłem Państwa stronę — wygląda naprawdę dobrze i szybko się ładuje. Czy korzystają Państwo już z reklam w Google albo Meta?\nKlient: Nie, na razie tylko strona.\nSprzedawca: To akurat częsta sytuacja — dobra strona bez ruchu z reklam nie pokazuje pełnego potencjału. Możemy pokazać, jak wyglądałaby prosta kampania testowa.\nKlient: Możemy pogadać, ale bez zobowiązań.",
        "ru": "Продавец: Я посмотрел ваш сайт — он выглядит действительно хорошо и быстро загружается. Вы уже используете рекламу в Google или Meta?\nКлиент: Нет, пока только сайт.\nПродавец: Это как раз частая ситуация — хороший сайт без трафика из рекламы не раскрывает весь свой потенциал. Мы можем показать, как выглядела бы простая тестовая кампания.\nКлиент: Можем поговорить, но без каких-либо обязательств."
      },
      "whatWasGood": {
        "pl": "Docenienie dobrej strony zamiast szukania problemu na siłę, przesunięcie rozmowy na inny obszar (reklamy).",
        "ru": "Признание достоинств сайта вместо попытки во что бы то ни стало найти проблему, перевод разговора в другую область (реклама)."
      },
      "whatWasBad": {
        "pl": "Brak konkretnego terminu rozmowy na końcu, \"możemy pogadać\" jest zbyt ogólne.",
        "ru": "Отсутствие конкретной даты разговора в конце, «можем поговорить» — слишком общая формулировка."
      },
      "howItCouldBeBetter": {
        "pl": "Zaproponować konkretny dzień i godzinę krótkiej rozmowy zamiast zostawiać to otwarte.",
        "ru": "Предложить конкретный день и время короткого разговора, а не оставлять этот вопрос открытым."
      },
      "outcome": {
        "pl": "Klient otwarty na dalszy kontakt, bez konkretnego terminu.",
        "ru": "Клиент открыт для дальнейшего контакта, но без конкретной даты."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "client-send-offer",
      "title": {
        "pl": "Klient mówi \"wyślij ofertę\"",
        "ru": "Клиент говорит «пришлите предложение»"
      },
      "transcript": {
        "pl": "Klient: Proszę po prostu wysłać ofertę mailem.\nSprzedawca: Oczywiście, wyślę. Żeby oferta była konkretna, a nie ogólna — czy chodzi bardziej o nową stronę, czy o reklamy przynoszące klientów?\nKlient: Głównie o stronę.\nSprzedawca: Dobrze, przygotuję propozycję pod stronę. Czy mogę oddzwonić w piątek, żeby ją krótko omówić?\nKlient: Dobrze, piątek pasuje.",
        "ru": "Клиент: Пришлите, пожалуйста, просто предложение по почте.\nПродавец: Конечно, пришлю. Чтобы предложение было конкретным, а не общим — речь идёт больше о новом сайте или о рекламе, которая приносит клиентов?\nКлиент: В основном о сайте.\nПродавец: Хорошо, подготовлю предложение по сайту. Могу я перезвонить в пятницу, чтобы коротко его обсудить?\nКлиент: Хорошо, пятница подходит."
      },
      "whatWasGood": {
        "pl": "Dopytanie o zakres przed wysyłką oferty, umówienie konkretnego terminu follow-upu.",
        "ru": "Уточнение объёма работ перед отправкой предложения, договорённость о конкретной дате follow-up звонка."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można dodatkowo zapytać o budżet orientacyjny, żeby oferta była jeszcze bardziej trafna.",
        "ru": "Можно было дополнительно спросить об ориентировочном бюджете, чтобы предложение было ещё более точным."
      },
      "outcome": {
        "pl": "Ustalono zakres oferty i termin follow-upu.",
        "ru": "Согласованы объём предложения и дата follow-up звонка."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "client-asks-price",
      "title": {
        "pl": "Klient pyta o cenę",
        "ru": "Клиент спрашивает о цене"
      },
      "transcript": {
        "pl": "Klient: Ile to w ogóle kosztuje?\nSprzedawca: Proste strony zaczynają się od około 400–500 EUR, bardziej rozbudowane projekty to 1200 EUR i więcej — dokładna cena zależy od zakresu. Najlepiej krótko sprawdzić, czego dokładnie Państwo potrzebują.\nKlient: Rozumiem, to ile by kosztowała prosta strona wizytówka?\nSprzedawca: Taki projekt zwykle mieści się w widełkach Starter, czyli około 400–500 EUR. Umówmy krótką rozmowę ze specjalistą, żeby potwierdzić dokładny zakres i cenę.",
        "ru": "Клиент: А сколько это вообще стоит?\nПродавец: Простые сайты начинаются примерно от 400–500 EUR, более сложные проекты — от 1200 EUR и выше — точная цена зависит от объёма работ. Лучше всего коротко выяснить, что именно вам нужно.\nКлиент: Понимаю, а сколько бы стоил простой сайт-визитка?\nПродавец: Такой проект обычно укладывается в вилку цен Starter, то есть примерно 400–500 EUR. Давайте договоримся о коротком разговоре со специалистом, чтобы подтвердить точный объём и цену."
      },
      "whatWasGood": {
        "pl": "Podanie konkretnych widełek zamiast wymijającej odpowiedzi, przejście do umówienia rozmowy.",
        "ru": "Указание конкретной вилки цен вместо уклончивого ответа, переход к договорённости о разговоре."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Bez zmian — dobry przykład prowadzenia rozmowy o cenie.",
        "ru": "Без изменений — хороший пример ведения разговора о цене."
      },
      "outcome": {
        "pl": "Klient otrzymał orientacyjne widełki cenowe i zgodził się na rozmowę ze specjalistą.",
        "ru": "Клиент получил ориентировочную вилку цен и согласился на разговор со специалистом."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "client-distrustful",
      "title": {
        "pl": "Klient nie ufa",
        "ru": "Клиент не доверяет"
      },
      "transcript": {
        "pl": "Klient: Skąd w ogóle macie mój numer? To jakieś oszustwo?\nSprzedawca: Rozumiem ostrożność. Numer znalazłem w publicznym profilu Google Business Państwa firmy. Nie sprzedajemy niczego przez telefon — jedynie umawiamy krótką, bezpłatną konsultację.\nKlient: Aha, dobrze, to o co dokładnie chodzi?\nSprzedawca: Sprawdzałem Państwa obecność w internecie i zauważyłem kilka rzeczy, które można łatwo poprawić. Mogę je krótko omówić?\nKlient: Dobrze, proszę mówić.",
        "ru": "Клиент: А откуда у вас вообще мой номер? Это что, какое-то мошенничество?\nПродавец: Понимаю вашу настороженность. Номер я нашёл в публичном профиле Google компании. Мы ничего не продаём по телефону — только договариваемся о короткой бесплатной консультации.\nКлиент: А, ладно, а о чём конкретно речь?\nПродавец: Я проверял ваше присутствие в интернете и заметил несколько моментов, которые можно легко улучшить. Можно я коротко их расскажу?\nКлиент: Хорошо, говорите."
      },
      "whatWasGood": {
        "pl": "Spokojne, konkretne wyjaśnienie źródła numeru, podkreślenie braku presji sprzedażowej.",
        "ru": "Спокойное, конкретное объяснение источника номера, подчёркивание отсутствия давления со стороны продажи."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Bez zmian — dobre rozładowanie nieufności.",
        "ru": "Без изменений — хорошее снятие недоверия."
      },
      "outcome": {
        "pl": "Klient uspokojony, zgodził się kontynuować rozmowę.",
        "ru": "Клиент успокоился и согласился продолжить разговор."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "client-busy-example",
      "title": {
        "pl": "Klient zajęty",
        "ru": "Клиент занят"
      },
      "transcript": {
        "pl": "Klient: Teraz naprawdę nie mam czasu.\nSprzedawca: Rozumiem, nie zabiorę więcej. Kiedy lepiej oddzwonić — dziś po południu czy jutro rano?\nKlient: Jutro rano, koło 9.\nSprzedawca: Dobrze, zapisuję: jutro, 9:00. Miłego dnia.",
        "ru": "Клиент: Сейчас у меня правда нет времени.\nПродавец: Понимаю, больше не задерживаю. Когда лучше перезвонить — сегодня после обеда или завтра утром?\nКлиент: Завтра утром, около 9.\nПродавец: Хорошо, записываю: завтра, 9:00. Хорошего дня."
      },
      "whatWasGood": {
        "pl": "Brak naciskania, szybkie ustalenie konkretnego terminu oddzwonienia.",
        "ru": "Отсутствие давления, быстрое согласование конкретного времени перезвона."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Bez zmian — krótko, konkretnie, z szacunkiem dla czasu klienta.",
        "ru": "Без изменений — коротко, конкретно, с уважением ко времени клиента."
      },
      "outcome": {
        "pl": "Ustalono konkretny termin oddzwonienia.",
        "ru": "Согласовано конкретное время перезвона."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "successful-meeting-booked",
      "title": {
        "pl": "Udane umówienie spotkania",
        "ru": "Успешное назначение встречи"
      },
      "transcript": {
        "pl": "Sprzedawca: Podsumowując, moglibyśmy przygotować propozycję nowej strony z formularzem zapytań. Umówmy 15-minutową rozmowę z naszym specjalistą — środa 14:00 czy czwartek 11:00?\nKlient: Środa pasuje bardziej.\nSprzedawca: Świetnie, zapisuję środę 14:00. Wyślę potwierdzenie mailem. Dziękuję za rozmowę, do usłyszenia!\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Подводя итог, мы могли бы подготовить предложение по новому сайту с формой для заявок. Давайте договоримся о 15-минутном разговоре с нашим специалистом — среда, 14:00, или четверг, 11:00?\nКлиент: Среда подходит больше.\nПродавец: Отлично, записываю среду, 14:00. Отправлю подтверждение по почте. Спасибо за разговор, до связи!\nКлиент: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Jasne podsumowanie ustaleń, dwie konkretne opcje terminu, potwierdzenie mailowe, profesjonalne zakończenie.",
        "ru": "Чёткое подведение итогов договорённостей, два конкретных варианта времени, подтверждение по почте, профессиональное завершение разговора."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Bez zmian — wzorcowe zamknięcie rozmowy.",
        "ru": "Без изменений — образцовое завершение разговора."
      },
      "outcome": {
        "pl": "Spotkanie/konsultacja umówione na konkretny termin.",
        "ru": "Встреча/консультация назначена на конкретное время."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-googleads-kancelaria",
      "title": {
        "pl": "Zimny telefon: kancelaria prawna i Google Ads",
        "ru": "Холодный звонок: юридическая фирма и Google Ads"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Kuba z Aura Global Merchants. Dzwonię do kancelarii prawnych w Warszawie, sprawdzam jak wyglądają Państwa reklamy w Google. Ma Pan 2 minuty?\nKlient: No dobra, ale krótko, bo mam klienta za dziesięć minut.\nSprzedawca: Jasne, streszczę się. Wpisałem w Google „prawnik od rozwodów Warszawa” i Państwa kancelarii nie było na pierwszej stronie, tylko konkurencja z płatnymi reklamami. Czy Państwo w ogóle korzystają z Google Ads?\nKlient: Nie, nigdy nie robiliśmy reklam, klienci przychodzą głównie z polecenia.\nSprzedawca: Rozumiem, polecenia to najlepszy klient. Ale przy takich sprawach jak rozwód ludzie często szukają prawnika sami, w nocy, w Google, bo wstydzą się pytać znajomych. Reklama w wyszukiwarce pokazuje się dokładnie takim osobom, w momencie gdy szukają pomocy.\nKlient: No dobra, ale ile to kosztuje, bo zaraz muszę kończyć.\nSprzedawca: Budżet na samą reklamę ustala się osobno od naszej pracy, zwykle zaczyna się od kilkuset złotych miesięcznie i można go zmieniać w każdej chwili. Nasza rola to ustawienie kampanii tak, żeby nie płacić za przypadkowe kliknięcia.\nKlient: A skąd wiadomo, że to się w ogóle zwróci?\nSprzedawca: Nie obiecam Panu konkretnej liczby spraw, bo to zależy od wielu rzeczy, ale mogę pokazać na krótkiej rozmowie, jak wygląda konkurencja w Google i ile orientacyjnie kosztuje kliknięcie w Państwa branży, żeby sam Pan ocenił, czy to ma sens.\nKlient: Dobra, niech będzie, tylko krótko. Kiedy?\nSprzedawca: Pasuje jutro po godzinie 17, jak nie będzie już Pan miał klientów?\nKlient: Może być, ale niech to będzie faktycznie 15 minut, nie więcej.\nSprzedawca: Oczywiście, zapisuję jutro 17:00. Dziękuję za czas, do usłyszenia.\nKlient: Do usłyszenia.",
        "ru": "Продавец: Добрый день, это Куба из Aura Global Merchants. Обзваниваю юридические фирмы в Варшаве, смотрю, как у вас обстоят дела с рекламой в Google. У вас есть две минуты?\nКлиент: Ну хорошо, но коротко, через десять минут у меня клиент.\nПродавец: Конечно, буду краток. Я вбил в Google «адвокат по разводам Варшава», и вашей фирмы на первой странице не было — только конкуренты с платной рекламой. Вы вообще пользуетесь Google Ads?\nКлиент: Нет, мы никогда не давали рекламу, клиенты приходят в основном по рекомендации.\nПродавец: Понимаю, клиент по рекомендации — лучший клиент. Но в таких делах, как развод, люди часто сами ищут адвоката ночью в Google, потому что стесняются спрашивать знакомых. Реклама в поиске показывается именно таким людям — в момент, когда они ищут помощь.\nКлиент: Ну хорошо, а сколько это стоит, мне скоро заканчивать разговор.\nПродавец: Бюджет на саму рекламу устанавливается отдельно от нашей работы, обычно начинается от нескольких сотен злотых в месяц, и его можно менять в любой момент. Наша задача — настроить кампанию так, чтобы не платить за случайные клики.\nКлиент: А откуда мне знать, что это вообще окупится?\nПродавец: Я не обещаю вам конкретное количество дел, потому что это зависит от многих факторов, но могу на короткой встрече показать, как выглядит конкуренция в Google и сколько примерно стоит клик в вашей отрасли, чтобы вы сами оценили, есть ли в этом смысл.\nКлиент: Хорошо, ладно, только коротко. Когда?\nПродавец: Подойдёт завтра после 17 часов, когда у вас уже не будет клиентов?\nКлиент: Можно, но пусть это реально будет 15 минут, не больше.\nПродавец: Конечно, записываю: завтра в 17:00. Спасибо за уделённое время, до связи.\nКлиент: До связи."
      },
      "whatWasGood": {
        "pl": "Konkretny research przed telefonem (sprawdzenie wyników w Google), dopasowanie przykładu do specyfiki branży (szukanie nocą, anonimowo), dostosowanie tempa do zabieganego klienta, brak obietnicy liczby spraw.",
        "ru": "Конкретная подготовка перед звонком (проверка результатов в Google), пример, подобранный под специфику отрасли (ночной, анонимный поиск), темп разговора подстроен под занятого клиента, отсутствие обещаний по количеству дел."
      },
      "whatWasBad": {
        "pl": "Nic istotnego — rozmowa była zwięzła i dobrze dopasowana do klienta, który wyraźnie miał mało czasu.",
        "ru": "Ничего существенного — разговор был лаконичным и хорошо подстроенным под клиента, у которого явно было мало времени."
      },
      "howItCouldBeBetter": {
        "pl": "Można było dodatkowo zapytać, czy strona kancelarii w ogóle nadaje się na przyjęcie ruchu z reklam (np. czy ma formularz kontaktowy), żeby nie wychodziło to dopiero na spotkaniu.",
        "ru": "Можно было дополнительно спросить, готов ли вообще сайт фирмы принимать трафик с рекламы (например, есть ли на нём форма обратной связи), чтобы это не всплыло только на встрече."
      },
      "outcome": {
        "pl": "Klient zgodził się na krótką rozmowę ze specjalistą następnego dnia o 17:00.",
        "ru": "Клиент согласился на короткий разговор со специалистом на следующий день в 17:00."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-metaads-silownia",
      "title": {
        "pl": "Zimny telefon: siłownia i reklamy Meta Ads",
        "ru": "Холодный звонок: фитнес-клуб и реклама Meta Ads"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Ania z Aura Global Merchants. Dzwonię do klubów fitness w Krakowie, sprawdzam jak wyglądają social media siłowni. Ma Pani chwilę?\nKlientka: O, dzień dobry, tak, mam chwilę, akurat mało ludzi teraz na sali.\nSprzedawca: Super. Widziałam Państwa profil na Instagramie, macie ładne zdjęcia sprzętu i zajęć grupowych, ale nie widziałam, żeby te posty były promowane jako reklama. Robicie kiedyś płatne kampanie na Facebooku czy Instagramie?\nKlientka: Nie, tylko normalne posty, czasem coś udostępnimy w insta stories.\nSprzedawca: To bardzo częsty przypadek. Reklamy na Meta, czyli Facebook i Instagram, dobrze sprawdzają się właśnie dla siłowni, bo można pokazać film z zajęć konkretnie osobom w promieniu kilku kilometrów od Państwa lokalizacji, w odpowiednim wieku.\nKlientka: To brzmi sensownie, bo nowy rok szkolny się zbliża i ludzie zawsze wtedy wracają na siłownię.\nSprzedawca: Dokładnie, to dobry moment na kampanię przed wrześniem. Możemy przygotować prosty plan, na przykład jedna kampania pod karnety wrześniowe, żeby zdążyć zanim inne siłownie zaczną reklamować się do tej samej grupy ludzi.\nKlientka: A dużo trzeba by wydać na start?\nSprzedawca: Testowy budżet zwykle zaczyna się od niewielkich kwot miesięcznie, dokładne liczby najlepiej ustalić na krótkiej rozmowie ze specjalistą, żeby dopasować je do Państwa celu, czyli liczby nowych karnetów.\nKlientka: Dobra, chętnie się umówię, tylko nie w weekend, bo wtedy najwięcej klientów.\nSprzedawca: Jasne, to może wtorek albo środa, w ciągu dnia?\nKlientka: Wtorek koło 12 pasuje.\nSprzedawca: Super, zapisuję wtorek 12:00. Dziękuję za rozmowę, do usłyszenia!\nKlientka: Do usłyszenia, miłego dnia.",
        "ru": "Продавец: Добрый день, это Аня из Aura Global Merchants. Обзваниваю фитнес-клубы в Кракове, смотрю, как обстоят дела с соцсетями у спортзалов. У вас найдётся минутка?\nКлиентка: О, добрый день, да, есть минутка, сейчас как раз мало народу в зале.\nПродавец: Отлично. Я посмотрела ваш профиль в Instagram, у вас красивые фото оборудования и групповых занятий, но я не заметила, чтобы эти посты продвигались как реклама. Вы когда-нибудь запускали платные кампании в Facebook или Instagram?\nКлиентка: Нет, только обычные посты, иногда что-то выкладываем в сторис.\nПродавец: Это очень частая ситуация. Реклама в Meta, то есть в Facebook и Instagram, хорошо работает именно для спортзалов, потому что можно показывать видео с занятий конкретно людям в радиусе нескольких километров от вашего клуба, нужного возраста.\nКлиентка: Звучит разумно, потому что скоро новый учебный год, и люди всегда в это время возвращаются в спортзал.\nПродавец: Именно, это хороший момент для запуска кампании перед сентябрём. Мы можем подготовить простой план, например одну кампанию под сентябрьские абонементы, чтобы успеть раньше, чем другие спортзалы начнут рекламироваться той же аудитории.\nКлиентка: А много нужно потратить на старте?\nПродавец: Тестовый бюджет обычно начинается с небольших сумм в месяц, точные цифры лучше всего определить на короткой встрече со специалистом, чтобы подобрать их под вашу цель — количество новых абонементов.\nКлиентка: Хорошо, с удовольствием договорюсь, только не на выходные, потому что тогда больше всего клиентов.\nПродавец: Конечно, может, вторник или среда, в течение дня?\nКлиентка: Вторник около 12 подходит.\nПродавец: Отлично, записываю: вторник, 12:00. Спасибо за разговор, до связи!\nКлиентка: До связи, хорошего дня."
      },
      "whatWasGood": {
        "pl": "Dobre zauważenie realnego braku (brak płatnych reklam), powiązanie kampanii z sezonowością (wrzesień), dopasowanie terminu rozmowy do rytmu pracy klientki.",
        "ru": "Точно подмечен реальный пробел (отсутствие платной рекламы), кампания увязана с сезонностью (сентябрь), время встречи подстроено под рабочий ритм клиентки."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można było zapytać o obecną liczbę karnetów lub członków, żeby lepiej ocenić potencjał kampanii przed spotkaniem.",
        "ru": "Можно было спросить о текущем количестве абонементов или участников, чтобы лучше оценить потенциал кампании ещё до встречи."
      },
      "outcome": {
        "pl": "Klientka umówiła się na rozmowę ze specjalistą we wtorek o 12:00.",
        "ru": "Клиентка договорилась о встрече со специалистом во вторник в 12:00."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-tiktokads-streetwear",
      "title": {
        "pl": "Zimny telefon: sklep streetwear i reklama TikTok",
        "ru": "Холодный звонок: стритвир-магазин и реклама в TikTok"
      },
      "transcript": {
        "pl": "Sprzedawca: Cześć, tu Michał z Aura Global Merchants. Dzwonię do sklepów z odzieżą, sprawdzałem Wasz sklep na Insta i TikToku. Masz 2 minuty?\nKlient: Ej, spoko, mów, akurat robię przecenę metek, więc jest czas.\nSprzedawca: Widzę, że macie konto na TikToku, ale ostatni film wrzucony chyba z pół roku temu. Robicie tam reklamy płatne czy tylko organicznie coś wrzucacie?\nKlient: Nie no, żadnych reklam, po prostu nie ogarniam czasu na to wszystko.\nSprzedawca: To akurat idealna sytuacja pod reklamy na TikToku, bo tam liczy się krótkie, naturalne wideo, niekoniecznie super wypasione, a Wasza grupa docelowa, czyli młodzi ludzie, spędza tam mnóstwo czasu.\nKlient: No fakt, cała paczka moich klientów tam siedzi. Ile by to kosztowało?\nSprzedawca: Zależy od zasięgu, jaki chcecie osiągnąć, ale zaczyna się od niewielkich kwot testowych. Zanim podam liczby, warto ustalić, co dokładnie promujemy — nową kolekcję, konkretny drop, czy cały sklep.\nKlient: Mamy za dwa tygodnie drop nowej kolekcji bluz, można by pod to zrobić coś.\nSprzedawca: Świetnie, to bardzo konkretny cel i dobry moment na kampanię przed premierą. Umówmy krótką rozmowę ze specjalistą od TikToka, żeby zdążyć przygotować to przed dropem.\nKlient: Ok, tylko szybko bo mało czasu mam w tygodniu.\nSprzedawca: Rozumiem, to może w piątek wieczorem, jak sklep już zamknięty?\nKlient: Piątek 19 spoko.\nSprzedawca: Zapisuję piątek 19:00. Dzięki za rozmowę, do usłyszenia!\nKlient: Nara.",
        "ru": "Продавец: Привет, это Михал из Aura Global Merchants. Обзваниваю магазины одежды, посмотрел ваш магазин в Instagram и TikTok. Есть две минуты?\nКлиент: Э, без проблем, говори, я как раз переоцениваю бирки, так что время есть.\nПродавец: Вижу, у вас есть аккаунт в TikTok, но последнее видео выложено, кажется, полгода назад. Вы там даёте платную рекламу или просто выкладываете что-то органически?\nКлиент: Не, никакой рекламы, просто не хватает времени на всё это.\nПродавец: Это как раз идеальная ситуация для рекламы в TikTok, потому что там ценится короткое, естественное видео, не обязательно суперпрофессиональное, а ваша целевая аудитория, то есть молодёжь, проводит там кучу времени.\nКлиент: Да, точно, вся моя тусовка клиентов там сидит. Сколько бы это стоило?\nПродавец: Зависит от охвата, которого вы хотите достичь, но начинается с небольших тестовых сумм. Прежде чем называть цифры, стоит определить, что именно мы продвигаем — новую коллекцию, конкретный дроп или весь магазин.\nКлиент: У нас через две недели дроп новой коллекции худи, можно бы под это что-то сделать.\nПродавец: Отлично, это очень конкретная цель и хороший момент для кампании перед премьерой. Давай назначим короткую встречу со специалистом по TikTok, чтобы успеть всё подготовить до дропа.\nКлиент: Ок, только быстро, потому что мало времени на неделе.\nПродавец: Понимаю, может, в пятницу вечером, когда магазин уже закрыт?\nКлиент: Пятница, 19 часов, норм.\nПродавец: Записываю: пятница, 19:00. Спасибо за разговор, до связи!\nКлиент: Пока."
      },
      "whatWasGood": {
        "pl": "Szybkie dopasowanie tonu do klienta, powiązanie kampanii z konkretnym wydarzeniem biznesowym (drop kolekcji), elastyczność co do terminu rozmowy.",
        "ru": "Быстрая подстройка тона под клиента, увязка кампании с конкретным бизнес-событием (дроп коллекции), гибкость по времени встречи."
      },
      "whatWasBad": {
        "pl": "Sprzedawca nie zapytał w ogóle o orientacyjny budżet ani o wcześniejsze doświadczenia klienta z płatnymi reklamami, tylko od razu przeszedł do konkretnego terminu spotkania — nie sprawdził też, czy dwa tygodnie to realnie wystarczająco dużo czasu, żeby przygotować kampanię przed dropem.",
        "ru": "Продавец вообще не спросил ни об ориентировочном бюджете, ни о предыдущем опыте клиента с платной рекламой, а сразу перешёл к конкретному времени встречи — также не проверил, реально ли двух недель достаточно, чтобы подготовить кампанию до дропа."
      },
      "howItCouldBeBetter": {
        "pl": "Warto było dopytać o orientacyjny budżet i realistyczny czas przygotowania kampanii, zanim padła obietnica zdążenia na konkretny termin premiery kolekcji.",
        "ru": "Стоило уточнить ориентировочный бюджет и реалистичные сроки подготовки кампании, прежде чем давать обещание успеть к конкретной дате премьеры коллекции."
      },
      "outcome": {
        "pl": "Klient zgodził się na rozmowę ze specjalistą w piątek wieczorem.",
        "ru": "Клиент согласился на встречу со специалистом в пятницу вечером."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-seo-remont",
      "title": {
        "pl": "Zimny telefon: firma remontowa i pozycjonowanie SEO",
        "ru": "Холодный звонок: ремонтно-строительная компания и SEO-продвижение"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Tomek z Aura Global Merchants. Dzwonię do firm remontowo-budowlanych w regionie, sprawdzałem jak wypadają Państwo w wyszukiwarce Google. Ma Pan 2 minuty?\nKlient: No mam, ale niech Pan mówi konkretnie, bo nie lubię tych telefonów.\nSprzedawca: Jasne. Wpisałem „remonty mieszkań [miasto]” i Państwa firmy nie było w wynikach, tylko dwie inne ekipy. Macie Państwo w ogóle stronę internetową?\nKlient: Mamy, prostą, wisi sobie kilka lat i tyle.\nSprzedawca: To dość częsty przypadek. Można poprawić tak zwane SEO, czyli sposób, w jaki strona jest widoczna w Google, żeby pojawiała się wyżej, kiedy ktoś szuka ekipy remontowej.\nKlient: SEO, SEO, wszyscy mi to obiecują, jeden gość dzwonił rok temu i nic z tego nie było.\nSprzedawca: Rozumiem sceptycyzm, bo faktycznie wiele firm obiecuje szybkie efekty, a SEO tak nie działa — to raczej praca na kilka miesięcy, nie na tydzień, i nikt uczciwie nie obieca konkretnego miejsca w wynikach.\nKlient: No to po co mi to, jak to tyle trwa?\nSprzedawca: Bo w przeciwieństwie do reklam, które przestają działać, gdy się przestaje płacić, dobra pozycja w Google zostaje na dłużej i przyciąga zapytania bez ciągłego dopłacania. To inwestycja długoterminowa, nie szybki efekt.\nKlient: Hm, no dobra, to co konkretnie by Pan zrobił?\nSprzedawca: Na start sprawdzilibyśmy, na jakie frazy szukają Was klienci i co trzeba poprawić na stronie, żeby Google lepiej ją rozumiał. Możemy to pokazać na krótkiej rozmowie, bez zobowiązań.\nKlient: No dobra, ale niech to będzie krótkie, bo naprawdę nie mam czasu na przegadywanie.\nSprzedawca: Rozumiem, 15 minut maksymalnie. Pasuje czwartek rano?\nKlient: Niech będzie czwartek, ale proszę zadzwonić punktualnie.\nSprzedawca: Zapisuję czwartek. Dziękuję za rozmowę.",
        "ru": "Продавец: Добрый день, это Томек из Aura Global Merchants. Обзваниваю ремонтно-строительные компании в регионе, смотрел, как вы выглядите в поиске Google. У вас есть две минуты?\nКлиент: Ну есть, но говорите конкретно, я не люблю такие звонки.\nПродавец: Хорошо. Я вбил «ремонт квартир [город]», и вашей компании в результатах не было — только две другие бригады. У вас вообще есть сайт?\nКлиент: Есть, простой, висит уже несколько лет, и всё.\nПродавец: Это довольно частая ситуация. Можно улучшить так называемое SEO, то есть то, как сайт виден в Google, чтобы он показывался выше, когда кто-то ищет ремонтную бригаду.\nКлиент: SEO, SEO, все мне это обещают, один тип звонил год назад, и ничего из этого не вышло.\nПродавец: Понимаю скептицизм, потому что действительно многие компании обещают быстрые результаты, а SEO так не работает — это скорее работа на несколько месяцев, а не на неделю, и никто честно не пообещает конкретное место в результатах.\nКлиент: Ну и зачем оно мне, если это так долго тянется?\nПродавец: Потому что, в отличие от рекламы, которая перестаёт работать, как только перестаёшь платить, хорошая позиция в Google держится дольше и приносит заявки без постоянных доплат. Это долгосрочная инвестиция, а не быстрый эффект.\nКлиент: Хм, ну ладно, и что конкретно вы бы сделали?\nПродавец: Для начала мы бы проверили, по каким запросам вас ищут клиенты, и что нужно доработать на сайте, чтобы Google лучше его понимал. Мы можем показать это на короткой встрече, без обязательств.\nКлиент: Ну хорошо, но пусть это будет коротко, у меня правда нет времени на долгие разговоры.\nПродавец: Понимаю, максимум 15 минут. Подойдёт четверг утром?\nКлиент: Пусть будет четверг, но, пожалуйста, позвоните точно вовремя.\nПродавец: Записываю четверг. Спасибо за разговор."
      },
      "whatWasGood": {
        "pl": "Uczciwe zarządzanie oczekiwaniami co do czasu działania SEO (brak obietnicy szybkich efektów), bezpośrednie odniesienie się do wcześniejszego złego doświadczenia klienta zamiast ignorowania go.",
        "ru": "Честное управление ожиданиями по срокам работы SEO (отсутствие обещаний быстрых результатов), прямое обращение к негативному прошлому опыту клиента вместо того, чтобы его игнорировать."
      },
      "whatWasBad": {
        "pl": "Sprzedawca nie zaproponował żadnego szybszego, równoległego rozwiązania dla klienta, który wyraźnie chciał zobaczyć efekty szybciej — zostawił go z wrażeniem, że jedyna opcja to długie miesiące czekania na SEO.",
        "ru": "Продавец не предложил никакого более быстрого, параллельного решения клиенту, который явно хотел увидеть результаты раньше, — оставил у него впечатление, что единственный вариант это долгие месяцы ожидания эффекта от SEO."
      },
      "howItCouldBeBetter": {
        "pl": "Warto było wspomnieć, że obok SEO można równolegle uzupełnić wizytówkę Google (GBP), co daje efekt widoczności znacznie szybciej i uspokaja klienta czekającego na wyniki.",
        "ru": "Стоило упомянуть, что параллельно с SEO можно доработать профиль Google (GBP), что даёт эффект видимости значительно быстрее и успокаивает клиента, ожидающего результатов."
      },
      "outcome": {
        "pl": "Klient zgodził się na krótką rozmowę w czwartek, ale wyraźnie z rezerwą.",
        "ru": "Клиент согласился на короткий разговор в четверг, но явно с недоверием."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "cold-gbp-restauracja",
      "title": {
        "pl": "Zimny telefon: restauracja i wizytówka Google (GBP)",
        "ru": "Холодный звонок: ресторан и профиль Google (GBP)"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Kasia z Aura Global Merchants. Dzwonię do restauracji, sprawdzałam Państwa wizytówkę w Google Maps. Ma Pan minutę, czy lepiej oddzwonić?\nKlient: Mam może minutę, zaraz lunch, niech Pani mówi szybko.\nSprzedawca: Dobrze, w skrócie: godziny otwarcia na Państwa wizytówce w Google są nieaktualne, brakuje zdjęć wnętrza i menu, a to często pierwsza rzecz, którą widzi klient szukający „restauracja w pobliżu”.\nKlient: No mogło tak być, nikt się tym u nas nie zajmuje.\nSprzedawca: To akurat najszybsza rzecz do poprawienia, bo nie wymaga budowy nowej strony — wystarczy uzupełnić i poprawić samą wizytówkę, żeby lepiej wyglądała w wyszukiwaniu i na mapach.\nKlient: A to długo trwa?\nSprzedawca: Uzupełnienie i optymalizacja wizytówki to jedna z szybszych rzeczy, jakie robimy, efekty widoczności widać zwykle po kilku tygodniach, nie miesiącach jak przy pełnym SEO strony.\nKlient: Dobra, brzmi sensownie, bo teraz naprawdę tracę czas na lunch, niech Pani zadzwoni później.\nSprzedawca: Jasne, o której lepiej, koło 16, jak lunch się skończy?\nKlient: Tak, 16 dobrze.\nSprzedawca: Super, zapisuję 16:00 dzisiaj, na krótką rozmowę o wizytówce. Do usłyszenia!\nKlient: Dobra, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Кася из Aura Global Merchants. Обзваниваю рестораны, проверяла ваш профиль в Google Картах. У вас есть минута, или лучше перезвонить?\nКлиент: Минута, может, есть, скоро ланч, говорите быстро.\nПродавец: Хорошо, вкратце: часы работы в вашем профиле Google устарели, не хватает фото интерьера и меню, а это часто первое, что видит клиент, ищущий «ресторан поблизости».\nКлиент: Ну могло так быть, этим у нас никто не занимается.\nПродавец: Это как раз самая быстрая вещь для исправления, потому что не требует создания нового сайта — достаточно дополнить и поправить сам профиль, чтобы он лучше выглядел в поиске и на картах.\nКлиент: А это долго длится?\nПродавец: Заполнение и оптимизация профиля — одна из самых быстрых вещей, которые мы делаем, эффект по видимости обычно заметен через несколько недель, а не месяцев, как при полном SEO сайта.\nКлиент: Хорошо, звучит разумно, но сейчас я правда теряю время ланча, перезвоните попозже.\nПродавец: Конечно, во сколько лучше, около 16, когда ланч закончится?\nКлиент: Да, 16 хорошо.\nПродавец: Отлично, записываю сегодня на 16:00, короткий разговор о профиле. До связи!\nКлиент: Хорошо, до связи."
      },
      "whatWasGood": {
        "pl": "Dostosowanie tempa i długości rozmowy do bardzo zajętego klienta, konkretne, sprawdzalne spostrzeżenie (nieaktualne godziny, brak zdjęć), jasne rozróżnienie GBP od pełnego SEO pod względem czasu oczekiwania na efekty.",
        "ru": "Темп и длительность разговора подстроены под очень занятого клиента, конкретное, проверяемое наблюдение (неактуальные часы работы, отсутствие фото), чёткое разграничение GBP и полного SEO по срокам ожидания результата."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można było od razu zapytać, czy ktoś w restauracji odpowiada za social media, żeby mieć szerszy kontekst na później umówioną rozmowę.",
        "ru": "Можно было сразу спросить, отвечает ли кто-то в ресторане за соцсети, чтобы иметь более широкий контекст для назначенного позже разговора."
      },
      "outcome": {
        "pl": "Klient zgodził się na oddzwonienie tego samego dnia o 16:00.",
        "ru": "Клиент согласился на звонок в тот же день в 16:00."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "cold-remarketing-meble",
      "title": {
        "pl": "Zimny telefon: sklep meblowy i remarketing",
        "ru": "Холодный звонок: мебельный магазин и ремаркетинг"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Paweł z Aura Global Merchants. Dzwonię do sklepów meblowych, sprawdzałem Państwa sklep internetowy. Ma Pani 2 minuty?\nKlientka: Tak, proszę mówić.\nSprzedawca: Widziałem, że macie spory ruch na stronie, sklep wygląda profesjonalnie. Czy korzystacie z tak zwanego remarketingu, czyli reklam pokazujących się osobom, które już były na Państwa stronie, ale nic nie kupiły?\nKlientka: Remarketing? Coś podobnego robiliśmy chyba rok temu, ale już nie pamiętam czy to działało.\nSprzedawca: To akurat bardzo skuteczne narzędzie właśnie przy meblach, bo ludzie rzadko kupują kanapę od razu — oglądają, porównują, wracają po kilku dniach. Remarketing przypomina im o Państwa ofercie w tym czasie.\nKlientka: No faktycznie, u nas ścieżka zakupu jest długa, ludzie oglądają kilka razy zanim kupią.\nSprzedawca: Dokładnie dlatego to ma sens u Państwa. Warunek jest jeden — musicie już mieć jakiś ruch na stronie, bo remarketing działa na osobach, które już Was odwiedziły, a z tego co widzę, ruchu Wam nie brakuje.\nKlientka: A jak to się mierzy, skąd wiadomo, że działa?\nSprzedawca: To dobre pytanie, do tego potrzebne jest odpowiednie mierzenie ruchu na stronie, ale to możemy omówić razem na krótkiej rozmowie, żeby pokazać, jak wyglądałaby taka kampania konkretnie dla Państwa sklepu.\nKlientka: Dobrze, jestem ciekawa, umówmy się.\nSprzedawca: Pasuje Pani poniedziałek czy środa, po południu?\nKlientka: Środa lepiej, koło 15.\nSprzedawca: Zapisuję środę 15:00. Dziękuję za rozmowę, do usłyszenia.\nKlientka: Do usłyszenia.",
        "ru": "Продавец: Добрый день, это Павел из Aura Global Merchants. Звоню в мебельные магазины, я посмотрел ваш интернет-магазин. У вас есть 2 минуты?\nКлиентка: Да, слушаю.\nПродавец: Я видел, что у вас довольно большой трафик на сайте, магазин выглядит профессионально. Вы пользуетесь так называемым ремаркетингом — рекламой, которая показывается людям, уже заходившим на ваш сайт, но ничего не купившим?\nКлиентка: Ремаркетинг? Кажется, мы делали что-то похожее год назад, но уже не помню, работало ли это.\nПродавец: Это как раз очень эффективный инструмент именно для мебели, потому что диван редко покупают сразу — люди смотрят, сравнивают, возвращаются через несколько дней. Ремаркетинг в этот период напоминает им о вашем предложении.\nКлиентка: Да, действительно, у нас путь до покупки долгий, люди смотрят по несколько раз, прежде чем купить.\nПродавец: Именно поэтому это имеет смысл у вас. Условие только одно — на сайте уже должен быть какой-то трафик, потому что ремаркетинг работает с людьми, которые уже вас посещали, а с трафиком, как я вижу, у вас всё в порядке.\nКлиентка: А как это измеряется, откуда известно, что это работает?\nПродавец: Хороший вопрос, для этого нужна правильная аналитика трафика на сайте, но это мы можем обсудить вместе на короткой встрече, чтобы показать, как такая кампания выглядела бы конкретно для вашего магазина.\nКлиентка: Хорошо, мне любопытно, давайте договоримся.\nПродавец: Вам удобнее понедельник или среда, во второй половине дня?\nКлиентка: Среда лучше, около 15.\nПродавец: Записываю среду, 15:00. Спасибо за разговор, до связи.\nКлиентка: До связи."
      },
      "whatWasGood": {
        "pl": "Dobre wyjaśnienie mechanizmu remarketingu w kontekście długiego cyklu zakupowego mebli, sprawdzenie warunku wstępnego (istniejący ruch na stronie) zamiast ogólnikowej oferty.",
        "ru": "Хорошее объяснение механизма ремаркетинга в контексте долгого цикла покупки мебели, проверка предварительного условия (наличие трафика на сайте) вместо общего предложения без разбора."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Mógł krótko wspomnieć, że do skutecznego remarketingu potrzebne jest też poprawnie wdrożone mierzenie ruchu (analityka), żeby klientka miała pełny obraz przed spotkaniem.",
        "ru": "Можно было коротко упомянуть, что для эффективного ремаркетинга также нужна правильно настроенная аналитика трафика, чтобы у клиентки была полная картина перед встречей."
      },
      "outcome": {
        "pl": "Klientka umówiła się na rozmowę w środę o 15:00.",
        "ru": "Клиентка договорилась о встрече в среду в 15:00."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-analytics-nieruchomosci",
      "title": {
        "pl": "Zimny telefon: biuro nieruchomości i analityka GA4",
        "ru": "Холодный звонок: агентство недвижимости и аналитика GA4"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Marta z Aura Global Merchants. Dzwonię do biur nieruchomości, chciałabym zapytać, jak mierzycie Państwo skuteczność swojej strony internetowej. Czy ma Pan chwilę?\nKlient: Dzień dobry, tak, słucham, o co dokładnie chodzi.\nSprzedawca: Sprawdzałam Państwa stronę, wygląda solidnie, jest sporo ofert. Chciałam zapytać, czy macie wdrożoną analitykę, czyli narzędzie pokazujące, ile osób wchodzi na stronę, które oferty oglądają najdłużej i skąd tak naprawdę przychodzą klienci.\nKlient: Mamy chyba jakiś Google Analytics podpięty, ale szczerze mówiąc nikt tego nie sprawdza.\nSprzedawca: To bardzo częsta sytuacja. Problem w tym, że stara wersja Analytics przestała działać jakiś czas temu, więc jeśli nikt tego nie aktualizował, dane mogą być niekompletne albo w ogóle nie zbierają się od miesięcy.\nKlient: Możliwe, szczerze to nie wiem, tym zajmował się poprzedni pracownik, który już u nas nie pracuje.\nSprzedawca: Rozumiem. Bez dobrze skonfigurowanej analityki trudno ocenić, czy pieniądze wydane na reklamy czy portale ogłoszeniowe w ogóle się zwracają, bo nie widać, co realnie przynosi zapytania.\nKlient: To prawda, wydajemy na kilka portali i nie do końca wiadomo, który działa najlepiej.\nSprzedawca: Właśnie o to chodzi — dobra analityka pokazuje to jasno, jednym raportem, zamiast zgadywania. Możemy to sprawdzić i poprawnie skonfigurować, a przy okazji przygotować prosty raport pokazujący, co dziś działa.\nKlient: Brzmi sensownie, muszę to jednak omówić ze wspólnikiem, sam nie podejmuję takich decyzji.\nSprzedawca: Rozumiem, to zupełnie naturalne. Czy mogę zadzwonić w przyszłym tygodniu, żeby zapytać, co ustaliliście?\nKlient: Tak, proszę zadzwonić w przyszły wtorek.\nSprzedawca: Dobrze, zapisuję wtorek. Dziękuję za rozmowę, miłego dnia.\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Марта из Aura Global Merchants. Звоню в агентства недвижимости, хотела бы спросить, как вы измеряете эффективность своего сайта. У вас есть минутка?\nКлиент: Добрый день, да, слушаю, о чём именно речь.\nПродавец: Я посмотрела ваш сайт, выглядит солидно, предложений немало. Хотела спросить, у вас внедрена аналитика — инструмент, который показывает, сколько людей заходит на сайт, какие объявления они смотрят дольше всего и откуда на самом деле приходят клиенты.\nКлиент: У нас вроде подключен какой-то Google Analytics, но, честно говоря, никто это не проверяет.\nПродавец: Это очень распространённая ситуация. Проблема в том, что старая версия Analytics какое-то время назад перестала работать, поэтому если никто её не обновлял, данные могут быть неполными или вообще не собираться уже несколько месяцев.\nКлиент: Возможно, честно говоря, не знаю, этим занимался предыдущий сотрудник, который у нас уже не работает.\nПродавец: Понимаю. Без правильно настроенной аналитики трудно оценить, окупаются ли вообще деньги, потраченные на рекламу или сайты объявлений, потому что не видно, что реально приносит заявки.\nКлиент: Это правда, мы тратим на несколько сайтов объявлений, и не совсем понятно, какой работает лучше всего.\nПродавец: Вот именно об этом и речь — хорошая аналитика показывает это чётко, одним отчётом, вместо гаданий. Мы можем это проверить и правильно настроить, а заодно подготовить простой отчёт о том, что сегодня работает.\nКлиент: Звучит разумно, но мне нужно обсудить это с партнёром, я сам такие решения не принимаю.\nПродавец: Понимаю, это совершенно естественно. Могу я позвонить на следующей неделе, чтобы узнать, что вы решили?\nКлиент: Да, позвоните, пожалуйста, в следующий вторник.\nПродавец: Хорошо, записываю вторник. Спасибо за разговор, хорошего дня.\nКлиент: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Konkretne wyjaśnienie problemu (stary Analytics przestał zbierać dane), powiązanie tematu z realnym bólem klienta (wydatki na kilka portali bez wiedzy, co działa).",
        "ru": "Конкретное объяснение проблемы (старый Analytics перестал собирать данные), увязка темы с реальной болью клиента (расходы на несколько сайтов объявлений без понимания, что работает)."
      },
      "whatWasBad": {
        "pl": "Sprzedawczyni nie zapytała wcześniej, kto w firmie podejmuje decyzje o takich usługach, więc o wspólniku dowiedziała się dopiero na końcu rozmowy, co wydłużyło cały proces.",
        "ru": "Продавец не спросила заранее, кто в компании принимает решения по таким услугам, поэтому о партнёре она узнала только в конце разговора, что затянуло весь процесс."
      },
      "howItCouldBeBetter": {
        "pl": "Zapytać na początku rozmowy, kto podejmuje decyzje o tego typu usługach, i od razu zaproponować spotkanie z udziałem wspólnika zamiast dzwonić ponownie za tydzień.",
        "ru": "Спросить в начале разговора, кто принимает решения по такого рода услугам, и сразу предложить встречу с участием партнёра вместо повторного звонка через неделю."
      },
      "outcome": {
        "pl": "Klient obiecał omówić temat ze wspólnikiem, ustalono telefon kontrolny za tydzień.",
        "ru": "Клиент пообещал обсудить тему с партнёром, договорились о контрольном звонке через неделю."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "cold-funnels-szkolenia",
      "title": {
        "pl": "Zimny telefon: firma szkoleniowa i lejek sprzedażowy",
        "ru": "Холодный звонок: тренинговая компания и воронка продаж"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Bartek z Aura Global Merchants. Dzwonię do firm szkoleniowych, sprawdzałem jak wygląda Państwa droga od reklamy do zapisu na szkolenie. Ma Pani 2 minuty?\nKlientka: No dobra, tylko szybko, bo za chwilę mam webinar.\nSprzedawca: Rozumiem. Widziałem, że prowadzicie reklamy na Facebooku, ale prowadzą one na zwykłą stronę główną, nie na dedykowaną stronę zapisu. Czy tak to dziś wygląda?\nKlientka: Tak, mamy jedną stronę dla wszystkiego, nie mieliśmy czasu robić osobnych podstron.\nSprzedawca: To bardzo częsty problem. My zajmujemy się budowaniem tak zwanych lejków sprzedażowych, czyli całej ścieżki: reklama prowadzi na dedykowaną stronę pod konkretne szkolenie, stamtąd formularz zapisu, a potem automatyczne follow-upy dla osób, które się zapisały, ale nie dokończyły płatności.\nKlientka: To dużo naraz, ja nawet nie wiem od czego by Pan zaczął.\nSprzedawca: Ma Pani rację, powiedziałem to zbyt technicznie. Mówiąc prościej: chodzi o to, żeby każda osoba klikająca w reklamę trafiała na stronę mówiącą dokładnie o tym szkoleniu, a nie musiała szukać informacji na ogólnej stronie firmy — to zwykle podnosi liczbę zapisów z tej samej liczby kliknięć w reklamę.\nKlientka: A, to rozumiem, brzmi lepiej jak Pan tak to tłumaczy. Ale to pewnie kosztowny projekt?\nSprzedawca: To rzeczywiście większy projekt niż pojedyncza strona, bo obejmuje kilka elementów naraz, dlatego zwykle wyceniamy go po krótkiej rozmowie, gdy wiadomo, ile szkoleń rocznie promujecie i jak wygląda dziś proces zapisu.\nKlientka: Muszę to przemyśleć, mamy teraz dużo wydatków przed nowym kwartałem, proszę może napisać na maila z ogólnym zarysem, wrócę do tego po wakacjach.\nSprzedawca: Dobrze, wyślę krótkie podsumowanie tego, o czym rozmawialiśmy, i odezwę się z pytaniem pod koniec sierpnia, dobrze?\nKlientka: Tak, tak będzie dobrze.\nSprzedawca: Dziękuję za czas, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Бартек из Aura Global Merchants. Звоню в тренинговые компании, я изучал, как у вас выглядит путь от рекламы до записи на тренинг. У вас есть 2 минуты?\nКлиентка: Ну ладно, только быстро, у меня скоро вебинар.\nПродавец: Понимаю. Я видел, что вы ведёте рекламу в Facebook, но она ведёт на обычную главную страницу, а не на специальную страницу записи. Сейчас это выглядит именно так?\nКлиентка: Да, у нас одна страница для всего, не было времени делать отдельные подстраницы.\nПродавец: Это очень частая проблема. Мы занимаемся построением так называемых воронок продаж — то есть всего пути: реклама ведёт на специальную страницу под конкретный тренинг, оттуда — форма записи, а затем автоматические follow-up для тех, кто записался, но не завершил оплату.\nКлиентка: Это много всего сразу, я даже не знаю, с чего бы вы начали.\nПродавец: Вы правы, я сказал это слишком технично. Проще говоря: суть в том, чтобы каждый человек, кликнувший по рекламе, попадал на страницу, которая рассказывает именно об этом тренинге, а не искал информацию на общей странице компании — это обычно повышает число записей при том же количестве кликов по рекламе.\nКлиентка: А, вот это понятно, звучит лучше, когда вы так объясняете. Но это, наверное, дорогой проект?\nПродавец: Это действительно более крупный проект, чем одна страница, потому что включает сразу несколько элементов, поэтому мы обычно оцениваем его после короткого разговора, когда известно, сколько тренингов в год вы продвигаете и как сегодня выглядит процесс записи.\nКлиентка: Мне нужно это обдумать, сейчас у нас много расходов перед новым кварталом, напишите, пожалуйста, письмо с общим описанием, я вернусь к этому после отпуска.\nПродавец: Хорошо, я вышлю короткое резюме того, о чём мы говорили, и свяжусь с вами в конце августа, хорошо?\nКлиентка: Да, так будет хорошо.\nПродавец: Спасибо за время, до связи."
      },
      "whatWasGood": {
        "pl": "Sprzedawca zauważył, że przesadził z żargonem i od razu poprawił się prostszym tłumaczeniem, konkretne, trafne spostrzeżenie o jednej wspólnej stronie dla wszystkich reklam.",
        "ru": "Продавец заметил, что перегрузил речь жаргоном, и сразу поправился более простым объяснением; конкретное, точное наблюдение о единой странице для всех реклам."
      },
      "whatWasBad": {
        "pl": "Pierwsze wytłumaczenie lejka sprzedażowego było zbyt techniczne i naraz wymieniło zbyt wiele elementów, co wyraźnie przytłoczyło klientkę, zanim zdążyła zrozumieć podstawową korzyść.",
        "ru": "Первое объяснение воронки продаж было слишком техничным и сразу перечислило слишком много элементов, что явно перегрузило клиентку, прежде чем она успела понять основную выгоду."
      },
      "howItCouldBeBetter": {
        "pl": "Od razu zacząć od prostego, jednozdaniowego wytłumaczenia korzyści (więcej zapisów z tych samych reklam), a dopiero potem, jeśli klientka dopyta, rozwijać szczegóły techniczne krok po kroku.",
        "ru": "Сразу начать с простого объяснения выгоды в одном предложении (больше записей с тех же реклам), и только потом, если клиентка переспросит, раскрывать технические детали шаг за шагом."
      },
      "outcome": {
        "pl": "Klientka poprosiła o materiały mailowe i kontakt dopiero po wakacjach, bez konkretnego spotkania.",
        "ru": "Клиентка попросила прислать материалы на почту и связаться только после отпуска, без конкретной встречи."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "cold-geoai-ksiegowosc",
      "title": {
        "pl": "Zimny telefon: biuro rachunkowe i widoczność w wyszukiwaniu AI",
        "ru": "Холодный звонок: бухгалтерская контора и видимость в AI-поиске"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Ola z Aura Global Merchants. Dzwonię do biur rachunkowych, sprawdzałam jak Państwa firma wypada w wynikach wyszukiwania, także tych generowanych przez AI. Ma Pani 2 minuty?\nKlientka: Dzień dobry, mam chwilę, ale co to znaczy wyszukiwanie przez AI?\nSprzedawca: Coraz więcej osób zamiast wpisywać pytanie w Google, pyta na przykład ChatGPT: „polecisz biuro rachunkowe w [miasto] dla małej firmy”. Sprawdzałam, co taki asystent odpowiada w Państwa przypadku, i Państwa firma się nie pojawiła, mimo że macie dobre opinie w Google.\nKlientka: O, nie miałam pojęcia, że to w ogóle tak działa.\nSprzedawca: To dość nowy temat, mało kto jeszcze o tym myśli, dlatego to dobry moment, żeby się tym zająć wcześniej niż konkurencja. Chodzi w skrócie o to, żeby informacje o Państwa firmie — czym się zajmujecie, dla kogo, jakie macie opinie — były zapisane w internecie w sposób jasny i spójny, bo właśnie stamtąd takie narzędzia AI czerpią odpowiedzi.\nKlientka: Czyli to trochę jak SEO, tylko pod sztuczną inteligencję?\nSprzedawca: Dokładnie, można tak to ująć — pokrywa się to częściowo ze zwykłym SEO, ale wymaga też innych rzeczy, na przykład jasno opisanej oferty i uporządkowanych opinii klientów.\nKlientka: To brzmi sensownie, bo coraz więcej młodszych klientów pyta mnie, czy da się coś takiego zrobić przez AI.\nSprzedawca: Właśnie o to chodzi, to naturalny kierunek. Możemy na krótkiej rozmowie pokazać, jak dziś wygląda Państwa widoczność w takich narzędziach i co warto poprawić.\nKlientka: Dobrze, jestem ciekawa, można się umówić.\nSprzedawca: Pasuje Pani czwartek po południu?\nKlientka: Tak, czwartek 14 będzie dobrze.\nSprzedawca: Świetnie, zapisuję czwartek 14:00. Dziękuję za rozmowę.\nKlientka: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Оля из Aura Global Merchants. Звоню в бухгалтерские конторы, я проверяла, как ваша компания выглядит в результатах поиска, в том числе тех, что генерирует AI. У вас есть 2 минуты?\nКлиентка: Добрый день, минутка есть, но что значит поиск через AI?\nПродавец: Всё больше людей вместо того, чтобы вводить вопрос в Google, спрашивают, например, ChatGPT: «посоветуй бухгалтерскую контору в [город] для маленькой компании». Я проверила, что отвечает такой ассистент в вашем случае, и ваша компания не появилась, несмотря на то, что у вас хорошие отзывы в Google.\nКлиентка: О, я понятия не имела, что это вообще так работает.\nПродавец: Это довольно новая тема, мало кто ещё об этом задумывается, поэтому сейчас хороший момент заняться этим раньше конкурентов. Если коротко, суть в том, чтобы информация о вашей компании — чем вы занимаетесь, для кого, какие у вас отзывы — была зафиксирована в интернете чётко и последовательно, потому что именно оттуда такие AI-инструменты берут ответы.\nКлиентка: То есть это что-то вроде SEO, только под искусственный интеллект?\nПродавец: Именно, можно и так сказать — это частично пересекается с обычным SEO, но требует также других вещей, например чётко описанного предложения и упорядоченных отзывов клиентов.\nКлиентка: Звучит разумно, потому что всё больше молодых клиентов спрашивают меня, можно ли что-то подобное сделать через AI.\nПродавец: Вот именно, это естественное направление. На короткой встрече мы можем показать, как сегодня выглядит ваша видимость в таких инструментах и что стоит улучшить.\nКлиентка: Хорошо, мне интересно, можно договориться.\nПродавец: Вам подойдёт четверг во второй половине дня?\nКлиентка: Да, четверг, 14:00, будет хорошо.\nПродавец: Отлично, записываю четверг, 14:00. Спасибо за разговор.\nКлиентка: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Bardzo przystępne wytłumaczenie nowego i niszowego pojęcia na konkretnym przykładzie (pytanie do ChatGPT), powiązanie z prostszym, znanym pojęciem SEO, żeby klientka miała punkt odniesienia.",
        "ru": "Очень доступное объяснение нового и нишевого понятия на конкретном примере (вопрос к ChatGPT), увязка с более простым, знакомым понятием SEO, чтобы у клиентки была точка отсчёта."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można było zapytać, czy klientka sama korzysta z narzędzi typu ChatGPT, żeby jeszcze lepiej dopasować przykład do jej własnych doświadczeń.",
        "ru": "Можно было спросить, пользуется ли клиентка сама инструментами типа ChatGPT, чтобы ещё лучше подобрать пример под её собственный опыт."
      },
      "outcome": {
        "pl": "Klientka umówiła się na rozmowę w czwartek o 14:00.",
        "ru": "Клиентка договорилась о встрече в четверг в 14:00."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-aichatbot-stomatologia",
      "title": {
        "pl": "Zimny telefon: klinika stomatologiczna i chatbot AI",
        "ru": "Холодный звонок: стоматологическая клиника и AI-чат-бот"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Michał z Aura Global Merchants. Dzwonię do klinik stomatologicznych, sprawdzałem Państwa stronę internetową. Ma Pani 2 minuty?\nKlientka: Chwilę mam, ale telefon w recepcji dzwoni co pięć minut, więc proszę szybko.\nSprzedawca: Rozumiem. Widziałem, że na stronie jest tylko numer telefonu i formularz kontaktowy. Czy dużo zapytań przychodzi wieczorem albo w weekend, kiedy recepcja jest zamknięta?\nKlientka: Bardzo dużo, ludzie piszą przez formularz albo dzwonią po godzinach i nikt nie odbiera, a rano czasem zapominamy oddzwonić.\nSprzedawca: To bardzo częsty problem w gabinetach. Można na stronie postawić prostego chatbota opartego o AI, który odpowiada na najczęstsze pytania od razu — na przykład godziny otwarcia, cennik podstawowych zabiegów, czy przyjmujecie nowych pacjentów — i zbiera dane kontaktowe, żeby recepcja mogła oddzwonić rano.\nKlientka: To brzmi jak coś, co odciążyłoby nas naprawdę mocno, bo te same pytania słyszymy dwadzieścia razy dziennie.\nSprzedawca: Właśnie o to chodzi — chatbot przejmuje te powtarzalne pytania, a Państwo skupiacie się na pacjentach, którzy już są w gabinecie, zamiast ciągle odbierać telefon.\nKlientka: A czy to nie będzie brzmiało sztucznie dla pacjentów, mamy też starszych pacjentów.\nSprzedawca: To dobre pytanie, dlatego zawsze zostawiamy prostą opcję „zadzwoń do recepcji” widoczną obok chatbota, dla osób, które wolą rozmawiać z człowiekiem — chatbot to dodatek, nie zamiennik.\nKlientka: Ok, to ma sens, chętnie bym to zobaczyła na żywo, jak to działa u innych.\nSprzedawca: Świetnie, mogę pokazać przykłady na krótkiej rozmowie ze specjalistą. Pasuje Pani jutro rano, przed otwarciem recepcji?\nKlientka: Tak, 8:30 dobrze, zanim zacznie się ruch.\nSprzedawca: Zapisuję 8:30 jutro. Dziękuję za rozmowę, do usłyszenia.\nKlientka: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Михал из Aura Global Merchants. Звоню в стоматологические клиники, я посмотрел ваш сайт. У вас есть 2 минуты?\nКлиентка: Минутка есть, но телефон на ресепшене звонит каждые пять минут, так что давайте быстро.\nПродавец: Понимаю. Я видел, что на сайте есть только номер телефона и контактная форма. Много ли заявок приходит вечером или в выходные, когда ресепшен закрыт?\nКлиентка: Очень много, люди пишут через форму или звонят после закрытия, и никто не отвечает, а утром мы иногда забываем перезвонить.\nПродавец: Это очень частая проблема в клиниках. На сайт можно поставить простого чат-бота на базе AI, который сразу отвечает на самые частые вопросы — например, часы работы, цены на основные процедуры, принимаете ли вы новых пациентов — и собирает контактные данные, чтобы ресепшен мог перезвонить утром.\nКлиентка: Звучит как то, что действительно сильно бы нас разгрузило, потому что одни и те же вопросы мы слышим по двадцать раз в день.\nПродавец: Вот именно — чат-бот берёт на себя эти повторяющиеся вопросы, а вы сосредотачиваетесь на пациентах, которые уже находятся в кабинете, вместо того чтобы постоянно отвечать на звонки.\nКлиентка: А не будет ли это звучать искусственно для пациентов, у нас есть и пожилые пациенты.\nПродавец: Хороший вопрос, поэтому мы всегда оставляем рядом с чат-ботом простую опцию «позвонить на ресепшен» — для тех, кто предпочитает разговаривать с человеком. Чат-бот — это дополнение, а не замена.\nКлиентка: Хорошо, это разумно, я бы с удовольствием посмотрела вживую, как это работает у других.\nПродавец: Отлично, я могу показать примеры на короткой встрече со специалистом. Вам подойдёт завтра утром, до открытия ресепшена?\nКлиентка: Да, 8:30 подходит, пока не начался наплыв.\nПродавец: Записываю 8:30 завтра. Спасибо за разговор, до связи.\nКлиентка: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Trafne zdiagnozowanie realnego bólu (nieodebrane telefony po godzinach), spokojne i konkretne odniesienie się do obawy o „sztuczność” chatbota dla starszych pacjentów, dopasowanie terminu do rytmu pracy recepcji.",
        "ru": "Точная диагностика реальной боли (неотвеченные звонки после закрытия), спокойная и конкретная реакция на опасение по поводу «искусственности» чат-бота для пожилых пациентов, подбор времени встречи под ритм работы ресепшена."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można było dodatkowo zapytać, ile w przybliżeniu zapytań miesięcznie ginie po godzinach, żeby mieć konkretną liczbę do pokazania na spotkaniu.",
        "ru": "Можно было дополнительно спросить, сколько примерно заявок в месяц теряется после закрытия, чтобы иметь конкретную цифру для демонстрации на встрече."
      },
      "outcome": {
        "pl": "Klientka umówiła się na rozmowę następnego dnia o 8:30.",
        "ru": "Клиентка договорилась о встрече на следующий день в 8:30."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-aiqualify-fotowoltaika",
      "title": {
        "pl": "Zimny telefon: firma fotowoltaiczna i automatyczna kwalifikacja leadów",
        "ru": "Холодный звонок: компания по солнечным батареям и автоматическая квалификация лидов"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Rafał z Aura Global Merchants. Dzwonię do firm instalujących fotowoltaikę, sprawdzałem jak wygląda u Państwa obsługa zapytań z reklam. Ma Pan 2 minuty?\nKlient: No mam chwilę, ale u nas zapytań to jest zalew, nie brakuje nam leadów, jak coś to brakuje nam rąk do pracy.\nSprzedawca: To akurat bardzo częsty problem w tej branży, dużo zapytań, ale różnej jakości. Ile mniej więcej dziennie przychodzi zapytań z formularza czy telefonu?\nKlient: Czasem dwadzieścia, trzydzieści dziennie, ale połowa to ludzie, którzy tylko sprawdzają ceny albo mają dach nienadający się pod panele.\nSprzedawca: I ktoś u Państwa ręcznie dzwoni do każdego, żeby to sprawdzić?\nKlient: Tak, dwie osoby siedzą i obdzwaniają wszystkich po kolei, czasem dopiero po dwóch dniach docierają do dobrego klienta, bo kolejka jest długa.\nSprzedawca: Rozumiem, to dokładnie sytuacja, w której pomaga automatyczne kwalifikowanie leadów przez AI. W skrócie: zanim zapytanie trafi do Państwa handlowca, prosty system zadaje kilka pytań — na przykład o powierzchnię dachu, rachunki za prąd, czy dom jest własny — i od razu oznacza, czy to dobry klient, czy nie, więc handlowiec dzwoni najpierw do najlepszych, a nie po kolei.\nKlient: O, to by realnie pomogło, bo teraz tracimy czas na ludzi, którzy i tak nic nie kupią.\nSprzedawca: Dokładnie o to chodzi, to nie zastępuje ludzi, tylko pomaga im dzwonić w dobrej kolejności, zamiast losowo.\nKlient: A to trudne do wdrożenia, mamy prosty formularz na stronie teraz.\nSprzedawca: Można to podpiąć pod istniejący formularz, nie trzeba budować niczego od zera. Najlepiej pokazać to na krótkiej rozmowie, żeby zobaczył Pan, jak wyglądałyby te dodatkowe pytania konkretnie dla Państwa.\nKlient: Dobra, jestem zainteresowany, tylko dzwońcie po 16, bo rano mam zebrania z ekipami.\nSprzedawca: Jasne, to może jutro 16:30?\nKlient: Pasuje.\nSprzedawca: Zapisuję jutro 16:30. Dziękuję za rozmowę.",
        "ru": "Продавец: Добрый день, это Рафал из Aura Global Merchants. Я обзваниваю компании, устанавливающие солнечные батареи, хотел узнать, как у вас организована обработка заявок с рекламы. У вас есть 2 минуты?\nКлиент: Ну, минутка есть, но у нас заявок просто вал, лидов нам хватает, если чего и не хватает, так это рабочих рук.\nПродавец: Это как раз очень частая проблема в этой отрасли — заявок много, но разного качества. Сколько примерно заявок в день приходит через форму или по телефону?\nКлиент: Иногда двадцать-тридцать в день, но половина — это люди, которые просто узнают цены или у которых крыша не подходит под панели.\nПродавец: И у вас кто-то вручную обзванивает каждого, чтобы это проверить?\nКлиент: Да, два человека сидят и обзванивают всех по очереди, иногда до хорошего клиента доходят только через два дня, потому что очередь длинная.\nПродавец: Понимаю, это как раз та ситуация, где помогает автоматическая квалификация лидов через AI. Вкратце: прежде чем заявка попадёт к вашему менеджеру по продажам, простая система задаёт несколько вопросов — например, о площади крыши, счетах за электричество, является ли дом собственным — и сразу помечает, хороший это клиент или нет. Тогда менеджер сначала звонит лучшим, а не по порядку.\nКлиент: О, это реально помогло бы, потому что сейчас мы теряем время на людей, которые всё равно ничего не купят.\nПродавец: Именно об этом и речь — это не заменяет людей, а лишь помогает им звонить в правильном порядке, а не наугад.\nКлиент: А это сложно внедрить? У нас сейчас на сайте простая форма.\nПродавец: Это можно подключить к уже существующей форме, ничего не нужно строить с нуля. Лучше всего показать это на короткой встрече, чтобы вы увидели, как именно эти дополнительные вопросы выглядели бы конкретно для вас.\nКлиент: Хорошо, мне интересно, только звоните после 16, потому что утром у меня совещания с бригадами.\nПродавец: Хорошо, тогда, может быть, завтра в 16:30?\nКлиент: Подходит.\nПродавец: Записываю — завтра в 16:30. Спасибо за разговор."
      },
      "whatWasGood": {
        "pl": "Sprzedawca zadał konkretne pytania diagnostyczne o liczbę i jakość leadów zanim zaczął tłumaczyć usługę, przełożył techniczne pojęcie kwalifikacji leadów przez AI na bardzo konkretny, zrozumiały przykład z branży klienta, uspokoił obawę, że system zastąpi ludzi.",
        "ru": "Продавец задал конкретные диагностические вопросы о количестве и качестве лидов, прежде чем начать объяснять услугу, перевёл техническое понятие квалификации лидов через AI в очень конкретный, понятный пример из отрасли клиента, снял опасение, что система заменит людей."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można było dopytać, jak długo dziś trwa dotarcie do najlepszych leadów, żeby mieć punkt odniesienia do porównania po wdrożeniu.",
        "ru": "Можно было уточнить, сколько сейчас в среднем занимает время до контакта с лучшими лидами, чтобы иметь точку отсчёта для сравнения после внедрения."
      },
      "outcome": {
        "pl": "Klient umówił się na rozmowę następnego dnia o 16:30.",
        "ru": "Клиент договорился о разговоре на следующий день в 16:30."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-aifollowup-kosmetyczny",
      "title": {
        "pl": "Zimny telefon: salon kosmetyczny i automatyczny follow-up AI",
        "ru": "Холодный звонок: салон красоты и автоматический follow-up на базе AI"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Zosia z Aura Global Merchants. Dzwonię do salonów kosmetycznych, sprawdzałam, jak wygląda u Państwa kontakt z klientkami, które pytały o zabieg, ale się nie zapisały. Ma Pani 2 minuty?\nKlientka: O tak, akurat mam przerwę między klientkami. Pyta Pani o co dokładnie?\nSprzedawca: Chodzi o sytuację, kiedy ktoś pisze przez Instagram albo formularz z pytaniem o cenę zabiegu, ale potem nie umawia wizyty. Czy zdarza się, że takie osoby po prostu gdzieś Wam „giną”?\nKlientka: O Boże, cały czas, mamy tyle wiadomości, że fizycznie nie nadążamy odpisywać wszystkim po kilku dniach, a potem jest niezręcznie się odzywać, bo minęło już tyle czasu.\nSprzedawca: To bardzo częsty problem. Można to zautomatyzować tak zwanym follow-upem przez AI — czyli jeśli ktoś zapyta o zabieg i nie umówi się w ciągu na przykład trzech dni, system sam wysyła krótką, przyjazną wiadomość z przypomnieniem i propozycją terminu, bez angażowania Was ręcznie.\nKlientka: To by było super, bo my po prostu nie mamy na to czasu między klientkami.\nSprzedawca: Właśnie o to chodzi, to nie zastępuje Waszego kontaktu, tylko łapie te osoby, które inaczej po prostu wypadłyby z procesu.\nKlientka: A czy to nie będzie brzmiało jak spam, nie chciałabym straszyć klientek.\nSprzedawca: Rozumiem obawę, dlatego wiadomości są krótkie, ciepłe i wysyłane tylko raz albo dwa, nie codziennie — chodzi o delikatne przypomnienie, nie naganianie.\nKlientka: Ok, to brzmi rozsądnie, chętnie bym to zobaczyła.\nSprzedawca: Świetnie, umówmy krótką rozmowę ze specjalistą, pokażemy przykładowe wiadomości. Pasuje Pani poniedziałek rano, kiedy salon jeszcze zamknięty?\nKlientka: Tak, poniedziałek 9 będzie dobrze.\nSprzedawca: Zapisuję poniedziałek 9:00. Dziękuję za rozmowę, do usłyszenia!\nKlientka: Do usłyszenia, dziękuję.",
        "ru": "Продавец: Добрый день, это Зося из Aura Global Merchants. Я обзваниваю салоны красоты, хотела узнать, как у вас организован контакт с клиентками, которые спрашивали о процедуре, но не записались. У вас есть 2 минуты?\nКлиентка: О да, у меня как раз перерыв между клиентками. О чём именно вы спрашиваете?\nПродавец: Речь о ситуации, когда кто-то пишет в Instagram или через форму с вопросом о цене процедуры, но потом не записывается на визит. Бывает так, что такие люди у вас просто где-то «теряются»?\nКлиентка: Боже, постоянно, у нас столько сообщений, что мы физически не успеваем отвечать всем через несколько дней, а потом уже неловко писать, потому что прошло столько времени.\nПродавец: Это очень частая проблема. Это можно автоматизировать так называемым follow-up на базе AI — то есть если кто-то спросил о процедуре и не записался в течение, скажем, трёх дней, система сама отправляет короткое, дружелюбное сообщение с напоминанием и предложением записаться, без вашего ручного участия.\nКлиентка: Это было бы супер, потому что у нас просто нет на это времени между клиентками.\nПродавец: Именно об этом и речь — это не заменяет ваш личный контакт, а просто «ловит» тех людей, которые иначе выпали бы из процесса.\nКлиентка: А это не будет звучать как спам? Не хотелось бы отпугивать клиенток.\nПродавец: Понимаю это опасение, поэтому сообщения короткие, тёплые и отправляются всего один-два раза, не каждый день — речь о деликатном напоминании, а не о навязчивости.\nКлиентка: Хорошо, звучит разумно, я бы с удовольствием на это посмотрела.\nПродавец: Отлично, давайте назначим короткий разговор со специалистом, покажем примеры сообщений. Вам подойдёт понедельник утром, пока салон ещё закрыт?\nКлиентка: Да, понедельник в 9 будет хорошо.\nПродавец: Записываю — понедельник, 9:00. Спасибо за разговор, до связи!\nКлиентка: До связи, спасибо."
      },
      "whatWasGood": {
        "pl": "Trafna diagnoza bardzo konkretnego, emocjonalnie rozpoznawalnego problemu (wiadomości „giną”), spokojne rozwianie obawy o spam poprzez konkretne wyjaśnienie tonu i częstotliwości wiadomości.",
        "ru": "Точная диагностика очень конкретной, эмоционально узнаваемой проблемы (сообщения «теряются»), спокойное снятие опасения по поводу спама через конкретное объяснение тона и частоты сообщений."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można było zapytać, ilu klientek miesięcznie to dotyczy, żeby lepiej pokazać skalę problemu na spotkaniu.",
        "ru": "Можно было спросить, скольких клиенток в месяц это касается, чтобы лучше показать масштаб проблемы на встрече."
      },
      "outcome": {
        "pl": "Klientka umówiła się na rozmowę w poniedziałek o 9:00.",
        "ru": "Клиентка договорилась о разговоре на понедельник в 9:00."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-crmauto-spedycja",
      "title": {
        "pl": "Zimny telefon: firma spedycyjna i automatyzacja CRM",
        "ru": "Холодный звонок: транспортно-экспедиционная компания и автоматизация CRM"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Dawid z Aura Global Merchants. Dzwonię do firm transportowo-spedycyjnych, chciałem zapytać, jak dziś zarządzacie kontaktami z klientami i zleceniami. Ma Pan 2 minuty?\nKlient: Kto mówi, jaka firma?\nSprzedawca: Aura Global Merchants, zajmujemy się między innymi automatyzacją pracy biurowej dla firm. Chodzi mi o to, czy korzystacie z jakiegoś systemu CRM do śledzenia zleceń, czy raczej wszystko jest w Excelu albo na kartce.\nKlient: A co to ma do rzeczy, my jeździmy, nie siedzimy przy komputerze.\nSprzedawca: Rozumiem, pytam bo w spedycji często zdarza się, że ktoś zapomni oddzwonić do klienta albo zgubi się informacja, na jakim etapie jest zlecenie, zwłaszcza przy większej liczbie kursów.\nKlient: U nas to ogarnia dyspozytor, jakoś to działa od dziesięciu lat, nie potrzebujemy programu, który będzie nas pilnował.\nSprzedawca: Rozumiem, ale to nie chodzi o pilnowanie ludzi, tylko o to, żeby system sam przypominał o kontakcie z klientem albo automatycznie przesuwał zlecenie na kolejny etap, żeby nic nie umknęło, kiedy dyspozytor jest zawalony robotą.\nKlient: Nie, dziękuję, nie jesteśmy zainteresowani, u nas to działa dobrze.\nSprzedawca: Rozumiem, ale może warto by chociaż zobaczyć, jak to wygląda, bo wielu przewoźników mówiło podobnie, zanim zobaczyli, ile czasu to oszczędza.\nKlient: Powiedziałem, że nie, dziękuję, muszę kończyć, mam kierowcę na linii.\nSprzedawca: Rozumiem, dziękuję za rozmowę, miłego dnia.\nKlient: Dobra, do widzenia.",
        "ru": "Продавец: Добрый день, это Давид из Aura Global Merchants. Я обзваниваю транспортно-экспедиционные компании, хотел спросить, как у вас сегодня организовано управление контактами с клиентами и заказами. У вас есть 2 минуты?\nКлиент: Кто это, из какой компании?\nПродавец: Aura Global Merchants, мы занимаемся, среди прочего, автоматизацией офисной работы для компаний. Я имею в виду — пользуетесь ли вы какой-то системой CRM для отслеживания заказов, или же всё ведётся в Excel или на бумаге.\nКлиент: А какое это имеет отношение к делу, мы же ездим, а не сидим за компьютером.\nПродавец: Понимаю, спрашиваю потому, что в экспедиции часто случается, что кто-то забывает перезвонить клиенту или теряется информация о том, на каком этапе находится заказ, особенно при большом количестве рейсов.\nКлиент: У нас этим занимается диспетчер, как-то это работает уже десять лет, нам не нужна программа, которая будет за нами следить.\nПродавец: Понимаю, но речь не о слежке за людьми, а о том, чтобы система сама напоминала о контакте с клиентом или автоматически переводила заказ на следующий этап, чтобы ничего не упускалось, когда диспетчер завален работой.\nКлиент: Нет, спасибо, нам это не интересно, у нас всё и так хорошо работает.\nПродавец: Понимаю, но, может быть, стоило бы хотя бы посмотреть, как это выглядит, потому что многие перевозчики говорили то же самое, пока не увидели, сколько времени это экономит.\nКлиент: Я сказал — нет, спасибо, мне нужно заканчивать, у меня водитель на линии.\nПродавец: Понимаю, спасибо за разговор, хорошего дня.\nКлиент: Ладно, до свидания."
      },
      "whatWasGood": {
        "pl": "Rzeczowe i konkretne pierwsze wytłumaczenie pojęcia CRM w kontekście branży (gubienie informacji o zleceniu), spokojne zakończenie rozmowy bez podnoszenia głosu mimo wyraźnej odmowy.",
        "ru": "Деловое и конкретное первое объяснение понятия CRM в контексте отрасли (потеря информации о заказе), спокойное завершение разговора без повышения тона, несмотря на явный отказ."
      },
      "whatWasBad": {
        "pl": "Po jasnym „nie, dziękuję, nie jesteśmy zainteresowani” sprzedawca nie odpuścił od razu, tylko spróbował jeszcze raz przekonywać, co wyraźnie zirytowało klienta i zabrało cenny czas zamiast zakończyć rozmowę na dobrej nucie.",
        "ru": "После чёткого «нет, спасибо, нам не интересно» продавец не отступил сразу, а попытался ещё раз переубедить клиента, что явно раздражило его и отняло ценное время вместо того, чтобы завершить разговор на хорошей ноте."
      },
      "howItCouldBeBetter": {
        "pl": "Przy pierwszej jasnej odmowie należało od razu podziękować i zapytać o zgodę na kontakt w przyszłości, zamiast próbować przekonywać po raz drugi.",
        "ru": "При первом же чётком отказе следовало сразу поблагодарить и спросить разрешения на контакт в будущем, вместо того чтобы пытаться переубедить во второй раз."
      },
      "outcome": {
        "pl": "Klient stanowczo odmówił i zakończył rozmowę.",
        "ru": "Клиент решительно отказался и завершил разговор."
      },
      "parserStatusToSet": "not_interested"
    },
    {
      "id": "cold-ecommerce-bizuteria",
      "title": {
        "pl": "Zimny telefon: pracownia biżuterii i sklep internetowy",
        "ru": "Холодный звонок: мастерская украшений и интернет-магазин"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Agata z Aura Global Merchants. Dzwonię do lokalnych twórców biżuterii, sprawdzałam Państwa profil na Instagramie, piękne projekty. Ma Pani 2 minuty?\nKlientka: O dziękuję! Tak, mam chwilę, akurat pakuję zamówienia po targach rękodzieła.\nSprzedawca: Widzę, że sprzedaje Pani głównie na targach i przez wiadomości na Instagramie. Czy ma Pani osobny sklep internetowy, gdzie ludzie mogą kupić bez pisania do Pani prywatnie?\nKlientka: Nie, na razie tylko tak, ludzie piszą, ja wysyłam numer konta, potem paczkę, to trochę chaotyczne.\nSprzedawca: To bardzo częsty etap rozwoju takiej marki. Prosty sklep internetowy pozwoliłby klientom samodzielnie wybrać kolczyki czy naszyjnik, zapłacić od razu online i dostać automatyczne potwierdzenie, bez konieczności ręcznego pisania z każdą osobą.\nKlientka: To by mi naprawdę zaoszczędziło czasu, bo teraz wieczorami tylko odpisuję na wiadomości.\nSprzedawca: Dokładnie, a przy okazji sklep działa całą dobę, nawet gdy Pani śpi albo jest na targach, co przy takich unikalnych, ręcznie robionych produktach może dać dodatkowe zamówienia poza godzinami, w których Pani normalnie odpisuje.\nKlientka: To brzmi świetnie, ale czy to skomplikowane do prowadzenia, ja się nie znam na komputerach za bardzo.\nSprzedawca: Rozumiem obawę, dlatego budujemy sklepy tak, żeby dodawanie nowych produktów było proste, podobne do dodawania posta na Instagramie, bez znajomości programowania.\nKlientka: Ok, to chętnie bym zobaczyła, jak to może wyglądać dla mojej marki.\nSprzedawca: Świetnie, umówmy krótką rozmowę ze specjalistą, pokażemy przykłady podobnych sklepów. Pasuje Pani wtorek wieczorem, po targach?\nKlientka: Tak, wtorek 18 będzie idealnie.\nSprzedawca: Zapisuję wtorek 18:00. Dziękuję za rozmowę, do usłyszenia!\nKlientka: Dziękuję bardzo, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Агата из Aura Global Merchants. Я обзваниваю местных мастеров, создающих украшения, посмотрела ваш профиль в Instagram — прекрасные работы. У вас есть 2 минуты?\nКлиентка: О, спасибо! Да, минутка есть, как раз упаковываю заказы после ярмарки хендмейда.\nПродавец: Вижу, что вы продаёте в основном на ярмарках и через сообщения в Instagram. У вас есть отдельный интернет-магазин, где люди могли бы купить, не переписываясь с вами лично?\nКлиентка: Нет, пока только так — люди пишут, я отправляю номер счёта, потом посылку, это немного хаотично.\nПродавец: Это очень типичный этап развития такого бренда. Простой интернет-магазин позволил бы клиентам самостоятельно выбирать серьги или колье, сразу оплачивать онлайн и получать автоматическое подтверждение, без необходимости вручную переписываться с каждым человеком.\nКлиентка: Это действительно сэкономило бы мне время, потому что сейчас вечерами я только и делаю, что отвечаю на сообщения.\nПродавец: Именно, и к тому же магазин работает круглосуточно, даже когда вы спите или находитесь на ярмарке, что при таких уникальных, ручной работы изделиях может принести дополнительные заказы вне часов, когда вы обычно отвечаете.\nКлиентка: Звучит здорово, но насколько это сложно вести? Я не очень разбираюсь в компьютерах.\nПродавец: Понимаю это опасение, поэтому мы строим магазины так, чтобы добавление новых товаров было простым, похожим на публикацию поста в Instagram, без знания программирования.\nКлиентка: Хорошо, я бы с удовольствием посмотрела, как это могло бы выглядеть для моего бренда.\nПродавец: Отлично, давайте назначим короткий разговор со специалистом, покажем примеры похожих магазинов. Вам подойдёт вторник вечером, после ярмарки?\nКлиентка: Да, вторник в 18 будет идеально.\nПродавец: Записываю — вторник, 18:00. Спасибо за разговор, до связи!\nКлиентка: Большое спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Trafne rozpoznanie etapu rozwoju biznesu (sprzedaż przez wiadomości prywatne) i pokazanie konkretnej korzyści (oszczędność czasu wieczorami, sprzedaż całodobowa), spokojne rozwianie obawy o trudność obsługi sklepu.",
        "ru": "Точное определение этапа развития бизнеса (продажи через личные сообщения) и демонстрация конкретной выгоды (экономия времени по вечерам, круглосуточные продажи), спокойное снятие опасения по поводу сложности ведения магазина."
      },
      "whatWasBad": {
        "pl": "Nic istotnego.",
        "ru": "Ничего существенного."
      },
      "howItCouldBeBetter": {
        "pl": "Można było zapytać o liczbę zamówień miesięcznie, żeby jeszcze precyzyjniej pokazać skalę oszczędności czasu na spotkaniu.",
        "ru": "Можно было спросить о количестве заказов в месяц, чтобы ещё точнее показать масштаб экономии времени на встрече."
      },
      "outcome": {
        "pl": "Klientka umówiła się na rozmowę we wtorek o 18:00.",
        "ru": "Клиентка договорилась о разговоре во вторник в 18:00."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "cold-cro-czesci-samochodowe",
      "title": {
        "pl": "Zimny telefon: sklep z częściami samochodowymi i optymalizacja konwersji (CRO)",
        "ru": "Холодный звонок: магазин автозапчастей и оптимизация конверсии (CRO)"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Konrad z Aura Global Merchants. Dzwonię do sklepów internetowych z częściami samochodowymi, sprawdzałem typowe problemy przy tego typu sklepach. Ma Pan 2 minuty?\nKlient: Jakie problemy, niby jak Pan to sprawdzał, to niby publiczne dane?\nSprzedawca: Nie, mówię ogólnie o typowych problemach przy tego typu sklepach — długi proces wyszukiwania części po numerze VIN, skomplikowany koszyk. Ile Państwo mniej więcej macie odwiedzin miesięcznie na stronie?\nKlient: Sporo, kilkanaście tysięcy, ale konwersja to nasza sprawa, nie będę tego z Panem omawiał przez telefon.\nSprzedawca: Rozumiem, w pełni to szanuję. Chodziło mi tylko o to, że przy dużym ruchu, nawet niewielka poprawa w samej ścieżce zakupowej — na przykład prostsze wyszukiwanie części — może przełożyć się na więcej zamówień z tego samego ruchu, bez wydawania dodatkowych pieniędzy na reklamy.\nKlient: My i tak konkurujemy głównie ceną, ludzie i tak porównują ceny w kilku sklepach naraz, nie wiem czy jakiś przycisk coś tu zmieni.\nSprzedawca: To prawda, że przy częściach cena mocno decyduje, ale często klienci rezygnują nie przez cenę, tylko bo nie mogą szybko znaleźć właściwej części do swojego modelu — to akurat da się poprawić niezależnie od ceny.\nKlient: Może i tak, ale my teraz w ogóle nie mamy budżetu na takie rzeczy, cały budżet idzie w zapasy magazynowe przed sezonem.\nSprzedawca: Rozumiem, to zupełnie zrozumiałe w Państwa branży. Czy mogę zostawić kontakt i wrócić do tematu, kiedy sezon się uspokoi?\nKlient: Szczerze, wątpię żebyśmy w ogóle w to wchodzili, wolimy inwestować w towar, a nie w stronę, ale niech Pan zostawi kontakt na mailu, jakby co to się odezwiemy.\nSprzedawca: Rozumiem, dziękuję za szczerość i za czas, miłego dnia.\nKlient: Dobrze, do widzenia.",
        "ru": "Продавец: Добрый день, это Конрад из Aura Global Merchants. Я обзваниваю интернет-магазины автозапчастей, изучал типичные проблемы таких магазинов. У вас есть 2 минуты?\nКлиент: Какие проблемы, и как вы это, интересно, изучали, это что, публичные данные?\nПродавец: Нет, я говорю в общем о типичных проблемах таких магазинов — долгий процесс поиска запчасти по VIN-номеру, сложная корзина. Сколько у вас примерно посещений сайта в месяц?\nКлиент: Немало, десяток с лишним тысяч, но конверсия — это наше дело, я не буду это с вами обсуждать по телефону.\nПродавец: Понимаю, полностью уважаю это. Я лишь имел в виду, что при большом трафике даже небольшое улучшение в самом пути покупки — например, более простой поиск запчастей — может привести к увеличению числа заказов с того же трафика, без дополнительных затрат на рекламу.\nКлиент: Мы и так конкурируем в основном ценой, люди всё равно сравнивают цены сразу в нескольких магазинах, не знаю, изменит ли тут что-то какая-то кнопка.\nПродавец: Это правда, что в случае с запчастями цена сильно влияет на решение, но часто клиенты отказываются от покупки не из-за цены, а потому что не могут быстро найти нужную деталь для своей модели — а это как раз можно улучшить независимо от цены.\nКлиент: Может и так, но у нас сейчас вообще нет бюджета на такие вещи, весь бюджет уходит на складские запасы перед сезоном.\nПродавец: Понимаю, это совершенно объяснимо в вашей отрасли. Могу я оставить контакт и вернуться к этой теме, когда сезон немного успокоится?\nКлиент: Честно говоря, сомневаюсь, что мы вообще будем этим заниматься, мы предпочитаем вкладывать в товар, а не в сайт, но оставьте контакт по почте, если что — мы сами свяжемся.\nПродавец: Понимаю, спасибо за честность и за уделённое время, хорошего дня.\nКлиент: Хорошо, до свидания."
      },
      "whatWasGood": {
        "pl": "Sprzedawca wycofał się z pierwszego niezręcznego sformułowania i przeszedł do ogólnego, bezpiecznego wyjaśnienia problemu, spokojnie zaakceptował odmowę i priorytety budżetowe klienta bez naciskania.",
        "ru": "Продавец отступил от первой неудачной формулировки и перешёл к общему, безопасному объяснению проблемы, спокойно принял отказ и бюджетные приоритеты клиента, не настаивая."
      },
      "whatWasBad": {
        "pl": "Pierwsze zdanie sugerujące, że sprzedawca „sprawdzał typowe problemy” w Państwa sklepie zabrzmiało niejasno i od razu wzbudziło podejrzliwość klienta, jakby sprzedawca miał wgląd w prywatne dane sklepu — lepiej było od razu mówić wprost o ogólnych, powszechnych problemach branży.",
        "ru": "Первая фраза, из которой следовало, что продавец «изучал типичные проблемы» именно вашего магазина, прозвучала неясно и сразу вызвала у клиента подозрение, будто продавец имеет доступ к приватным данным магазина — лучше было сразу говорить прямо об общих, распространённых проблемах отрасли."
      },
      "howItCouldBeBetter": {
        "pl": "Unikać sformułowań sugerujących wgląd w prywatne dane klienta i od razu mówić wprost o ogólnych, powszechnych problemach branży, żeby nie wzbudzać nieufności na starcie rozmowy.",
        "ru": "Избегать формулировок, намекающих на доступ к приватным данным клиента, и сразу говорить прямо об общих, распространённых проблемах отрасли, чтобы не вызывать недоверие в самом начале разговора."
      },
      "outcome": {
        "pl": "Klient jasno zasygnalizował brak budżetu i inne priorytety, zgodził się jedynie zostawić kontakt na przyszłość.",
        "ru": "Клиент чётко дал понять, что бюджета нет и приоритеты другие, согласился лишь оставить контакт на будущее."
      },
      "parserStatusToSet": "bad_fit"
    },
    {
      "id": "inbound-restaurant-order-form",
      "title": {
        "pl": "Zapytanie z formularza – restauracja",
        "ru": "Заявка с формы — ресторан"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Kasia z Aura Global Merchants, oddzwaniam w sprawie formularza, który Pan wypełnił na naszej stronie — pisał Pan o zamawianiu online. Ma Pan teraz chwilę?\nKlient: Tak, tak, czekałem na telefon. Chodzi o to, że chcemy mieć zamawianie przez stronę, bo teraz ludzie dzwonią albo piszą na Facebooku i się gubimy.\nSprzedawca: Rozumiem, czyli głównie chodzi o to, żeby zamówienia nie ginęły, a nie koniecznie o samą stronę?\nKlient: No właśnie tak, dokładnie. Czasem ktoś napisze wieczorem, a my zobaczymy dopiero rano i już się obraził.\nSprzedawca: A ile takich zamówień miesięcznie mniej więcej Wam ucieka przez to, że coś przeoczycie?\nKlient: Trudno powiedzieć, ale na pewno kilka-kilkanaście, zwłaszcza w weekend.\nSprzedawca: Okej, to ważna informacja. Bo sama ładna strona z formularzem zamawiania to jedno, ale jeśli zamówienia mają nie ginąć, to potrzebne jest też powiadomienie na telefon czy mail w momencie złożenia zamówienia, żeby nikt nie musiał odświeżać strony. Korzystają Państwo dziś z jakiejś aplikacji do dostaw, typu Glovo, Pyszne.pl?\nKlient: Tak, mamy Pyszne.pl, ale prowizje nas zjadają.\nSprzedawca: To bardzo częsty temat. Własne zamawianie na stronie ma sens właśnie po to, żeby część zamówień szła z pominięciem tej prowizji. Zaproponuję tak — umówmy 20 minut z naszym specjalistą od e-commerce, pokaże Panu, jak wyglądałby taki system zamawiania i ile realnie mogliby Państwo zaoszczędzić na prowizjach przy obecnej liczbie zamówień.\nKlient: Dobrze, brzmi sensownie.\nSprzedawca: Świetnie, pasuje bardziej jutro po południu czy pojutrze rano?\nKlient: Jutro po południu, powiedzmy 15:00.\nSprzedawca: Zapisuję, jutro 15:00. Wyślę potwierdzenie SMS-em. Dziękuję za rozmowę!\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Кася из Aura Global Merchants, перезваниваю по поводу формы, которую вы заполнили на нашем сайте — вы писали про заказы онлайн. У вас есть сейчас минутка?\nКлиент: Да, да, я ждал звонка. Дело в том, что мы хотим сделать заказы через сайт, потому что сейчас люди звонят или пишут в Facebook, и мы путаемся.\nПродавец: Понимаю, то есть главное, чтобы заказы не терялись, а не обязательно сам сайт?\nКлиент: Именно так, точно. Иногда кто-то напишет вечером, а мы увидим только утром, и человек уже обиделся.\nПродавец: А сколько таких заказов в месяц примерно у вас уходит из-за того, что вы что-то упускаете?\nКлиент: Сложно сказать, но точно несколько — может, десяток с лишним, особенно на выходных.\nПродавец: Хорошо, это важная информация. Потому что просто красивый сайт с формой заказа — это одно, но если заказы не должны теряться, нужно ещё уведомление на телефон или почту в момент оформления заказа, чтобы никому не приходилось обновлять страницу. Вы сегодня пользуетесь каким-нибудь приложением для доставки, типа Glovo, Pyszne.pl?\nКлиент: Да, у нас есть Pyszne.pl, но комиссии нас съедают.\nПродавец: Это очень частая тема. Собственная система заказов на сайте как раз имеет смысл для того, чтобы часть заказов шла в обход этой комиссии. Предложу так — давайте назначим 20 минут с нашим специалистом по e-commerce, он покажет вам, как выглядела бы такая система заказов и сколько реально вы могли бы сэкономить на комиссиях при нынешнем количестве заказов.\nКлиент: Хорошо, звучит разумно.\nПродавец: Отлично, вам удобнее завтра во второй половине дня или послезавтра утром?\nКлиент: Завтра во второй половине дня, скажем, в 15:00.\nПродавец: Записываю, завтра в 15:00. Пришлю подтверждение по SMS. Спасибо за разговор!\nКлиент: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Sprzedawca nie przyjął zgłoszenia dosłownie, tylko dopytał, jaki jest prawdziwy problem (gubiące się zamówienia), skwantyfikował go i powiązał z realnym kosztem (prowizje aplikacji dostawczych), zanim zaproponował konkretny krok.",
        "ru": "Продавец не принял заявку буквально, а расспросил, в чём настоящая проблема (теряющиеся заказы), оценил её масштаб и связал с реальными затратами (комиссии приложений доставки), прежде чем предложить конкретный шаг."
      },
      "whatWasBad": {
        "pl": "Nie zapytał, czy klient w ogóle ma dziś działającą stronę, zanim zaczął mówić o funkcji zamawiania — założył kontekst zamiast go potwierdzić.",
        "ru": "Не спросил, есть ли у клиента вообще уже работающий сайт, прежде чем начал говорить о функции заказа — предположил контекст вместо того, чтобы его подтвердить."
      },
      "howItCouldBeBetter": {
        "pl": "Na początku rozmowy dopytać, czy istnieje już strona, czy zamawianie miałoby powstać od zera, żeby lepiej dopasować zakres propozycji przed spotkaniem.",
        "ru": "В начале разговора уточнить, существует ли уже сайт, или систему заказов нужно создавать с нуля, чтобы лучше подобрать объём предложения перед встречей."
      },
      "outcome": {
        "pl": "Umówiono spotkanie na następny dzień po południu w sprawie systemu zamawiania online i ograniczenia prowizji od aplikacji dostawczych.",
        "ru": "Назначена встреча на следующий день во второй половине дня по вопросу системы онлайн-заказов и снижения комиссий приложений доставки."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "inbound-dental-referral",
      "title": {
        "pl": "Polecenie – gabinet stomatologiczny",
        "ru": "Рекомендация — стоматологический кабинет"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Tomek z Aura Global Merchants. Dostałem numer od Pani Agnieszki z salonu Elite, mówiła, że mogę zadzwonić w sprawie strony dla gabinetu.\nKlient: A tak, tak, mówiła mi, że jest zadowolona z Was. Mamy teraz w zasadzie tylko wizytówkę Google i profil na Facebooku.\nSprzedawca: Rozumiem. A co dokładnie chcieliby Państwo osiągnąć — chodzi bardziej o wizerunek, czy o to, żeby przybywało nowych pacjentów?\nKlient: Szczerze to nowych pacjentów, bo mamy trochę wolnych terminów w tygodniu, głównie rano.\nSprzedawca: Czyli zależy Państwu na tym, żeby zapełnić konkretnie te poranne terminy?\nKlient: Tak, dokładnie, bo popołudniami i tak mamy pełno.\nSprzedawca: To bardzo konkretny cel, dobrze że Pani o tym mówi, bo strona sama w sobie tego nie załatwi — potrzebna byłaby strona plus widoczność w Google w momencie, kiedy ktoś szuka dentysty w danej dzielnicy rano, i ewentualnie system rezerwacji online, żeby ludzie mogli sami wybrać wolny termin, nie dzwoniąc.\nKlient: O, to by nawet ułatwiło pracę recepcji.\nSprzedawca: Dokładnie. Zaproponuję spotkanie z naszym specjalistą, który zrobi krótki przegląd Państwa obecności w Google i pokaże, jak mogłaby wyglądać strona z rezerwacją. To nic nie kosztuje na tym etapie. Pasuje bardziej wtorek czy środa?\nKlient: Środa, ale po 16, bo mam pacjentów.\nSprzedawca: Świetnie, środa 16:30?\nKlient: Może być.\nSprzedawca: Super, zapisuję. Pozdrowienia dla Pani Agnieszki i dziękuję za rozmowę.\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Томек из Aura Global Merchants. Мне дала ваш номер пани Агнешка из салона Elite, сказала, что я могу позвонить по поводу сайта для кабинета.\nКлиентка: А да, да, она говорила мне, что довольна вами. У нас сейчас, по сути, только профиль Google и страница на Facebook.\nПродавец: Понимаю. А чего именно вы хотели бы добиться — это больше про имидж, или про то, чтобы прибавлялось новых пациентов?\nКлиентка: Честно говоря, новых пациентов, потому что у нас есть свободные окна в течение недели, в основном утром.\nПродавец: То есть вам важно заполнить именно эти утренние окна?\nКлиентка: Да, именно, потому что во второй половине дня у нас и так всё занято.\nПродавец: Это очень конкретная цель, хорошо, что вы об этом говорите, потому что сам по себе сайт этого не решит — нужен сайт плюс видимость в Google в момент, когда кто-то ищет стоматолога в этом районе утром, и, возможно, система онлайн-записи, чтобы люди могли сами выбрать свободное время, не звоня.\nКлиентка: О, это бы даже облегчило работу ресепшн.\nПродавец: Именно. Предложу встречу с нашим специалистом, который сделает краткий обзор вашего присутствия в Google и покажет, как мог бы выглядеть сайт с записью. На этом этапе это ничего не стоит. Вам удобнее вторник или среда?\nКлиентка: Среда, но после 16, потому что у меня пациенты.\nПродавец: Отлично, среда, 16:30?\nКлиентка: Подойдёт.\nПродавец: Отлично, записываю. Передавайте привет пани Агнешке, и спасибо за разговор.\nКлиентка: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Naturalne wykorzystanie polecenia jako otwarcia, pytanie o realny cel zamiast założenia, że chodzi tylko o nową stronę, powiązanie rozwiązania (rezerwacja online) z konkretną luką (puste poranne terminy).",
        "ru": "Естественное использование рекомендации как повода для звонка, вопрос о реальной цели вместо предположения, что речь идёт только о новом сайте, увязка решения (онлайн-запись) с конкретным пробелом (пустые утренние окна)."
      },
      "whatWasBad": {
        "pl": "Nie dopytał, ile dokładnie wolnych terminów tygodniowo pozostaje niewykorzystanych, przez co skala problemu została oszacowana tylko z grubsza.",
        "ru": "Не уточнил, сколько именно свободных окон в неделю остаётся неиспользованными, из-за чего масштаб проблемы был оценён лишь приблизительно."
      },
      "howItCouldBeBetter": {
        "pl": "Zapytać o liczbę wolnych terminów rano w tygodniu przed spotkaniem, żeby specjalista przyszedł z bardziej precyzyjną propozycją.",
        "ru": "Спросить о количестве свободных утренних окон в неделю ещё до встречи, чтобы специалист пришёл с более точным предложением."
      },
      "outcome": {
        "pl": "Umówiono spotkanie na środę 16:30 w sprawie przeglądu widoczności w Google i systemu rezerwacji online.",
        "ru": "Назначена встреча на среду, 16:30, по вопросу обзора видимости в Google и системы онлайн-записи."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "inbound-gym-instagram-request",
      "title": {
        "pl": "Telefon przychodzący – siłownia",
        "ru": "Входящий звонок — тренажёрный зал"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, Aura Global Merchants, przy telefonie Marta.\nKlient: Dzień dobry, dzwonię, bo widziałem Waszą reklamę, robicie prowadzenie Instagrama? Bo mamy siłownię i nikt nie ogarnia social mediów.\nSprzedawca: Tak, robimy. Zanim powiem, jak to u nas wygląda — może Pan powie, co konkretnie chciałby Pan osiągnąć dzięki Instagramowi? Nowych klientów, czy bardziej wizerunek wśród obecnych?\nKlient: No nowych klientów oczywiście, karnety.\nSprzedawca: Jasne. A skąd dziś głównie przychodzą nowi klienci — z polecenia, z Instagrama, z Google?\nKlient: Chyba głównie z polecenia i jak ktoś przejdzie obok, zobaczy szyld.\nSprzedawca: A stronę internetową mają Państwo?\nKlient: Mamy, ale starą, nikt jej nie aktualizuje, jest tam chyba stary cennik.\nSprzedawca: To ważne, bo jeśli ktoś zobaczy fajny post na Instagramie i kliknie w link do strony, a trafi na nieaktualny cennik albo stronę, która się źle wyświetla na telefonie, to często rezygnuje, mimo że sam Instagram zrobił swoje. Instagram bez uporządkowanej strony i sposobu na zapis na karnet online czasem generuje zainteresowanie, które się gubi na końcu.\nKlient: Hmm, no faktycznie nikt nie może się zapisać przez stronę, trzeba przyjść albo zadzwonić.\nSprzedawca: Właśnie o to pytam, bo wolałabym nie sprzedać Panu samego Instagrama, jeśli największa dziura jest gdzie indziej. Proponuję tak — umówmy krótką rozmowę z naszym specjalistą, przejrzymy razem stronę, Instagram i to, jak dziś wygląda cała ścieżka od zobaczenia posta do zapisania się na karnet, i dopiero wtedy powiemy, co ma największy sens zrobić najpierw.\nKlient: Dobra, to ma sens, bo sam nie do końca wiem, od czego zacząć.\nSprzedawca: Super. Czy jutro koło 12 albo w piątek rano — co bardziej pasuje?\nKlient: Piątek rano, tak koło 9.\nSprzedawca: Zapisuję, piątek 9:00. Do usłyszenia!",
        "ru": "Продавец: Добрый день, Aura Global Merchants, на связи Марта.\nКлиент: Добрый день, звоню, потому что видел вашу рекламу, вы занимаетесь ведением Instagram? У нас тренажёрный зал, и никто не занимается соцсетями.\nПродавец: Да, занимаемся. Прежде чем я расскажу, как это у нас устроено — может, вы скажете, чего конкретно вы хотели бы добиться с помощью Instagram? Новых клиентов, или скорее имиджа среди уже существующих?\nКлиент: Ну новых клиентов, конечно, абонементы.\nПродавец: Ясно. А откуда сегодня в основном приходят новые клиенты — по рекомендации, из Instagram, из Google?\nКлиент: Наверное, в основном по рекомендации, и когда кто-то проходит мимо, видит вывеску.\nПродавец: А сайт у вас есть?\nКлиент: Есть, но старый, никто его не обновляет, там, кажется, старый прайс висит.\nПродавец: Это важно, потому что если кто-то увидит классный пост в Instagram и перейдёт по ссылке на сайт, а попадёт на неактуальный прайс или на страницу, которая плохо отображается на телефоне, то часто отказывается от идеи, хотя сам Instagram свою работу сделал. Instagram без приведённого в порядок сайта и способа онлайн-записи на абонемент иногда генерирует интерес, который в итоге теряется.\nКлиент: Хм, ну действительно, через сайт записаться нельзя, нужно прийти или позвонить.\nПродавец: Я как раз об этом и спрашиваю, потому что не хотела бы продать вам просто Instagram, если самая большая дыра находится в другом месте. Предлагаю так — давайте назначим короткий разговор с нашим специалистом, вместе посмотрим сайт, Instagram и то, как сегодня выглядит весь путь от просмотра поста до оформления абонемента, и только тогда скажем, что имеет наибольший смысл сделать в первую очередь.\nКлиент: Хорошо, в этом есть смысл, потому что я сам не до конца понимаю, с чего начать.\nПродавец: Отлично. Завтра около 12 или в пятницу утром — что вам больше подходит?\nКлиент: Пятница утром, где-то около 9.\nПродавец: Записываю, пятница, 9:00. До связи!"
      },
      "whatWasGood": {
        "pl": "Sprzedawca nie przyjęła zamówionej usługi w ciemno, tylko wykryła prawdziwe wąskie gardło (przestarzała strona, brak zapisu online) i przeformułowała wartość rozmowy bez deprecjonowania pierwotnej prośby klienta.",
        "ru": "Продавец не приняла заказанную услугу вслепую, а выявила настоящее узкое место (устаревший сайт, отсутствие онлайн-записи) и переформулировала ценность разговора, не обесценивая изначальную просьбу клиента."
      },
      "whatWasBad": {
        "pl": "Nie zapytała o orientacyjny budżet, jaki klient rozważa, przez co spotkanie może trafić na propozycję poza jego możliwościami.",
        "ru": "Не спросила об ориентировочном бюджете, который рассматривает клиент, из-за чего встреча может завершиться предложением, выходящим за пределы его возможностей."
      },
      "howItCouldBeBetter": {
        "pl": "Dorzucić lekkie pytanie o widełki budżetowe przed umówieniem spotkania, żeby specjalista nie tracił czasu na zakres, którego klienta nie stać.",
        "ru": "Добавить лёгкий вопрос о вилке бюджета перед назначением встречи, чтобы специалист не тратил время на объём работ, который клиенту не по карману."
      },
      "outcome": {
        "pl": "Umówiono spotkanie na piątek rano — pełny przegląd strony, Instagrama i ścieżki zapisu na karnet.",
        "ru": "Назначена встреча на пятницу утром — полный обзор сайта, Instagram и пути записи на абонемент."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "inbound-law-firm-seo-request",
      "title": {
        "pl": "Formularz – kancelaria prawna",
        "ru": "Форма — юридическая фирма"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Piotr z Aura Global Merchants, oddzwaniam w sprawie formularza — pisała Pani, że interesuje Panią pozycjonowanie kancelarii. Ma Pani chwilę?\nKlient: Tak, tak. Chcemy być wyżej w Google, bo teraz nas prawie nie widać.\nSprzedawca: Rozumiem. Zanim przejdziemy do pozycjonowania — jakiego typu spraw głównie Państwo szukają, jaka to specjalizacja?\nKlient: Głównie prawo rodzinne i spadkowe.\nSprzedawca: A obecna strona — jest tam osobna podstrona dla prawa rodzinnego i osobna dla spadkowego, czy jedna ogólna \"usługi\"?\nKlient: Chyba jedna ogólna, szczerze nie pamiętam dokładnie jak to wygląda.\nSprzedawca: To akurat częsty powód, dla którego pozycjonowanie samo w sobie nie działa dobrze — Google trudniej pokazać jedną ogólną stronę na konkretne, węższe zapytanie, na przykład o rozwód w danej dzielnicy, niż dedykowaną podstronę pod ten temat. Można zainwestować w samo pozycjonowanie, ale bez takich podstron efekt będzie słabszy niż mógłby być.\nKlient: Aha, no to nie wiedziałam, że to tak działa.\nSprzedawca: Dlatego zanim zaproponuję konkretne działania, wolałbym, żeby nasz specjalista od SEO zrobił krótki audyt obecnej strony — zobaczymy, czy potrzebne jest dobudowanie kilku podstron, czy strona jest już gotowa i wystarczy samo pozycjonowanie. To nic nie kosztuje na tym etapie.\nKlient: Dobrze, to możemy się umówić.\nSprzedawca: Świetnie. Pasuje Pani wtorek po południu czy środa rano?\nKlient: Środa rano, o 10 może być.\nSprzedawca: Zapisuję, środa 10:00. Wyślę potwierdzenie mailem. Dziękuję za rozmowę.\nKlient: Dziękuję, do widzenia.",
        "ru": "Продавец: Добрый день, это Пётр из Aura Global Merchants, перезваниваю по поводу формы — вы писали, что вас интересует продвижение сайта юридической фирмы. У вас есть минутка?\nКлиент: Да, да. Мы хотим быть выше в Google, потому что сейчас нас почти не видно.\nПродавец: Понимаю. Прежде чем перейти к продвижению — какого рода дела вы в основном ищете, какая это специализация?\nКлиент: В основном семейное и наследственное право.\nПродавец: А на нынешнем сайте — там есть отдельная страница для семейного права и отдельная для наследственного, или одна общая страница «услуги»?\nКлиент: Кажется, одна общая, честно говоря, точно не помню, как это выглядит.\nПродавец: Это как раз частая причина, по которой само по себе продвижение работает плохо — Google сложнее показать одну общую страницу по конкретному, узкому запросу, например про развод в определённом районе, чем отдельную страницу именно под эту тему. Можно вложиться только в продвижение, но без таких отдельных страниц эффект будет слабее, чем мог бы быть.\nКлиент: А, ну я не знала, что это так работает.\nПродавец: Поэтому, прежде чем предлагать конкретные действия, я бы предпочёл, чтобы наш специалист по SEO сделал короткий аудит текущего сайта — посмотрим, нужно ли добавить несколько страниц, или сайт уже готов и достаточно только продвижения. На этом этапе это ничего не стоит.\nКлиент: Хорошо, можем договориться о встрече.\nПродавец: Отлично. Вам удобнее вторник во второй половине дня или среда утром?\nКлиент: Среда утром, в 10 подойдёт.\nПродавец: Записываю, среда, 10:00. Пришлю подтверждение на почту. Спасибо за разговор.\nКлиент: Спасибо, до свидания."
      },
      "whatWasGood": {
        "pl": "Sprzedawca nie sprzedał od razu tego, o co poproszono (samo SEO), tylko zdiagnozował problem strukturalny strony i wyjaśnił go językiem korzyści, a nie żargonem, po czym zaproponował bezpłatny audyt jako naturalny krok.",
        "ru": "Продавец не стал сразу продавать то, о чём просили (просто SEO), а диагностировал структурную проблему сайта и объяснил её языком выгод, а не жаргоном, после чего предложил бесплатный аудит как естественный следующий шаг."
      },
      "whatWasBad": {
        "pl": "Nie zapytał, ile zapytań miesięcznie dziś przychodzi przez stronę, co dałoby punkt odniesienia do przyszłego porównania efektów.",
        "ru": "Не спросил, сколько заявок в месяц сегодня приходит через сайт, что дало бы точку отсчёта для будущего сравнения результатов."
      },
      "howItCouldBeBetter": {
        "pl": "Zapytać o obecną liczbę zapytań ze strony miesięcznie jako punkt wyjścia, do którego będzie można porównać przyszłe rezultaty pozycjonowania.",
        "ru": "Спросить о текущем количестве заявок с сайта в месяц как об исходной точке, с которой можно будет сравнить будущие результаты продвижения."
      },
      "outcome": {
        "pl": "Umówiono spotkanie na środę 10:00 na bezpłatny audyt strony przed zaproponowaniem zakresu SEO.",
        "ru": "Назначена встреча на среду, 10:00, на бесплатный аудит сайта перед предложением объёма работ по SEO."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "objection-construction-chain",
      "title": {
        "pl": "Łańcuch obiekcji – firma budowlana",
        "ru": "Цепочка возражений — строительная компания"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Adam z Aura Global Merchants. Dzwonię do firm wykończeniowych w Warszawie, sprawdzam jak wyglądają u nich zapytania z internetu. Ma Pan 2 minuty?\nKlient: No dobra, ale szybko, bo jestem na budowie.\nSprzedawca: Jasne, będę konkretny. Widziałem Państwa stronę — jest, ale nie ma tam formularza ani galerii zdjęć realizacji. Skąd dziś głównie przychodzą nowe zlecenia?\nKlient: Głównie z polecenia, czasem z Facebooka.\nSprzedawca: Rozumiem. A ile by Pan chciał mieć nowych zapytań miesięcznie, żeby czuć, że warto to rozbudować?\nKlient: No zawsze się przyda więcej, ale ile to w ogóle kosztuje takie rozbudowanie strony?\nSprzedawca: To zależy od zakresu, ale porządna strona z galerią realizacji i formularzem to zwykle 1500–2500 EUR jednorazowo. Zanim jednak podam dokładną kwotę, chciałbym zrozumieć, czego dokładnie by Pan potrzebował.\nKlient: No dobra, tylko wie Pan co, ja już mam kolegę, co mi robi reklamy na Facebooku, więc chyba nie muszę.\nSprzedawca: To dobrze, że ktoś się tym zajmuje. A jest Pan zadowolony z tego, ile zapytań to przynosi, czy jest miejsce, żeby to jeszcze poprawić?\nKlient: No szczerze to różnie bywa, czasem jest ruch, czasem cisza.\nSprzedawca: To akurat częsty problem, kiedy reklamy prowadzą na stronę bez formularza albo bez galerii — ludzie klikają, ale nie mają jak łatwo zostawić kontaktu, więc część zapytań się gubi. Reklamy kolegi mogą świetnie działać, a i tak część efektu ginie na samej stronie.\nKlient: Hmm, no coś w tym może być. Ale wie Pan, muszę to przemyśleć, nie jestem teraz gotowy nic decydować.\nSprzedawca: Jasne, rozumiem, to nie jest decyzja na już. Zaproponuję coś mniejszego — 20-minutowa rozmowa z naszym specjalistą, bez żadnych zobowiązań, gdzie pokażemy konkretnie, co dziś ogranicza Państwa stronę i ile to mogłoby kosztować. Wtedy Pan zdecyduje spokojnie, czy w ogóle to ma sens.\nKlient: No dobra, tylko ja teraz za tydzień jadę na urlop, więc może jak wrócę to oddzwonię.\nSprzedawca: Rozumiem, urlop urlopem. Zamiast zostawiać to otwarte, może umówmy tę rozmowę już na termin po Pana powrocie, żeby nic nie trzeba było pamiętać — kiedy Pan wraca?\nKlient: Za dwa tygodnie, w poniedziałek powinienem już być.\nSprzedawca: To umówmy na wtorek po powrocie, powiedzmy 14:00 — pasuje?\nKlient: No dobra, niech będzie.\nSprzedawca: Świetnie, zapisuję: wtorek za dwa tygodnie, 14:00. Wyślę SMS przypomnienie dzień wcześniej. Miłego urlopu i do usłyszenia!\nKlient: Dzięki, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Адам из Aura Global Merchants. Обзваниваю отделочные компании в Варшаве, узнаю, как у них обстоят дела с заявками из интернета. У вас есть 2 минуты?\nКлиент: Ну ладно, только быстро, я сейчас на стройке.\nПродавец: Хорошо, буду конкретен. Я посмотрел ваш сайт — он есть, но там нет ни формы обратной связи, ни галереи фото выполненных работ. Откуда сегодня в основном приходят новые заказы?\nКлиент: В основном по рекомендациям, иногда из Facebook.\nПродавец: Понимаю. А сколько новых заявок в месяц вы хотели бы получать, чтобы почувствовать, что расширять сайт есть смысл?\nКлиент: Ну больше заявок всегда пригодится, но сколько вообще стоит такое расширение сайта?\nПродавец: Это зависит от объёма работ, но качественный сайт с галереей реализованных проектов и формой обычно обходится в 1500–2500 EUR разово. Но прежде чем назвать точную сумму, я хотел бы понять, что именно вам нужно.\nКлиент: Ну ладно, только знаете что, у меня уже есть знакомый, который делает мне рекламу в Facebook, так что, наверное, мне это не нужно.\nПродавец: Хорошо, что этим кто-то занимается. А вы довольны тем, сколько заявок это приносит, или есть куда ещё улучшить?\nКлиент: Честно говоря, по-разному бывает, иногда есть движение, иногда тишина.\nПродавец: Это как раз частая проблема, когда реклама ведёт на сайт без формы или без галереи — люди кликают, но у них нет простого способа оставить контакт, поэтому часть заявок теряется. Реклама вашего знакомого может отлично работать, а часть эффекта всё равно пропадает именно на самом сайте.\nКлиент: Хм, ну в этом что-то есть. Но знаете, мне нужно это обдумать, я сейчас не готов ничего решать.\nПродавец: Конечно, понимаю, это не решение, которое нужно принять прямо сейчас. Предложу кое-что попроще — 20-минутный разговор с нашим специалистом, без каких-либо обязательств, на котором мы конкретно покажем, что сегодня ограничивает ваш сайт и сколько это могло бы стоить. Тогда вы спокойно решите, есть ли в этом смысл вообще.\nКлиент: Ну ладно, только я через неделю уезжаю в отпуск, так что, может, как вернусь, перезвоню.\nПродавец: Понимаю, отпуск отпуском. Вместо того чтобы оставлять это открытым, давайте сразу назначим этот разговор на время после вашего возвращения, чтобы ничего не нужно было держать в памяти — когда вы возвращаетесь?\nКлиент: Через две недели, в понедельник я уже должен быть на месте.\nПродавец: Тогда давайте назначим на вторник после вашего возвращения, скажем, на 14:00 — подходит?\nКлиент: Ну ладно, пусть будет так.\nПродавец: Отлично, записываю: вторник через две недели, 14:00. Пришлю SMS-напоминание за день до встречи. Хорошего отпуска, до связи!\nКлиент: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Sprzedawca przeszedł przez cenę, posiadanie kogoś od reklam, potrzebę przemyślenia i odkładanie na urlop bez uległości i bez naciskania, za każdym razem dopytując zamiast od razu bronić oferty, a na końcu zamienił mgliste odłożenie sprawy w konkretny, umówiony termin.",
        "ru": "Продавец прошёл через возражения по цене, наличию знакомого, занимающегося рекламой, необходимости подумать и откладыванию из-за отпуска — не поддаваясь и не давя, каждый раз уточняя вопросами вместо того, чтобы сразу защищать предложение, а в конце превратил расплывчатое откладывание в конкретную, назначенную встречу."
      },
      "whatWasBad": {
        "pl": "Nie zapytał wprost, co dokładnie chciałby Pan jeszcze przemyśleć, więc realny powód wahania mógł zostać nierozpoznany.",
        "ru": "Он не спросил прямо, что именно клиент хотел бы ещё обдумать, поэтому настоящая причина колебаний могла остаться нераспознанной."
      },
      "howItCouldBeBetter": {
        "pl": "Przed zaproponowaniem spotkania dopytać, co konkretnie klient chciałby jeszcze przemyśleć, żeby wyłapać ewentualną niewypowiedzianą obiekcję zanim przejdzie się do umawiania terminu.",
        "ru": "Перед тем как предлагать встречу, стоило уточнить, что конкретно клиент хотел бы ещё обдумать, чтобы выявить возможное невысказанное возражение прежде, чем переходить к назначению даты."
      },
      "outcome": {
        "pl": "Mimo czterech obiekcji z rzędu umówiono konkretny termin spotkania po powrocie klienta z urlopu.",
        "ru": "Несмотря на четыре возражения подряд, была назначена конкретная дата встречи после возвращения клиента из отпуска."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "objection-beauty-salon-chain",
      "title": {
        "pl": "Łańcuch obiekcji – salon kosmetyczny",
        "ru": "Цепочка возражений — салон красоты"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Natalia z Aura Global Merchants. Dzwonię do salonów kosmetycznych na Pradze, sprawdzam jak wygląda ich obecność online. Ma Pani 2 minuty?\nKlient: Mam, ale od razu mówię, że raczej nie jesteśmy zainteresowane, bo już próbowałyśmy marketingu i to nic nie dało.\nSprzedawca: Rozumiem, to zrozumiałe, że jest Pani ostrożna po takim doświadczeniu. Może Pani powiedzieć, co dokładnie robiłyście wcześniej?\nKlient: Płaciłyśmy jakiejś agencji za reklamy na Facebooku, kosztowało sporo, a klientek nie przybyło.\nSprzedawca: To niestety częsty scenariusz, kiedy reklamy idą, ale nikt po drodze nie sprawdza, czy strona albo profil w ogóle ułatwia umówienie wizyty. Ile wtedy kosztowała ta współpraca miesięcznie, jeśli mogę spytać?\nKlient: Coś koło 800 złotych miesięcznie plus budżet na reklamy.\nSprzedawca: Rozumiem, to niemała kwota przy braku efektu. U nas zaczynamy zawsze od sprawdzenia, czy w ogóle jest gdzie złapać tę klientkę — czyli czy jest szybki sposób na umówienie wizyty online, i dopiero potem mówimy o reklamach. Ale rozumiem też, że po takim doświadczeniu cena będzie dla Pani ważna — u nas prosta strona z rezerwacją online to jednorazowo około 500–700 EUR, bez stałych miesięcznych opłat za samą stronę.\nKlient: No to już lepiej niż te 800 złotych co miesiąc za nic. Ale ja sama nic nie decyduję, muszę pogadać z wspólniczką, razem prowadzimy salon.\nSprzedawca: Jasne, to naturalne przy takiej decyzji. Może zamiast ja teraz próbuję Panią przekonywać samą, umówmy krótkie spotkanie, na którym będzie mogła być też wspólniczka — pokażemy wtedy obu Paniom, na czym różni się nasze podejście od tamtej agencji, i obie będziecie mogły zdecydować razem.\nKlient: No dobra, to może tak, ale szczerze to musimy się jeszcze zastanowić, czy w ogóle chcemy znowu w to wchodzić po tamtym.\nSprzedawca: Rozumiem obawę, to uzasadnione. Spotkanie niczego nie przesądza — to 20 minut bez zobowiązań, żeby zobaczyć, czy w ogóle warto dalej rozmawiać. Jeśli po tym uznacie, że to nie dla Was, to żaden problem. Kiedy obie Panie miałyby czas w przyszłym tygodniu?\nKlient: Chyba we czwartek po zamknięciu salonu, tak koło 19.\nSprzedawca: Czwartek 19:00, zapisuję. Wyślę Pani SMS z potwierdzeniem, może Pani przekazać wspólniczce. Dziękuję za szczerość co do poprzedniej współpracy, do usłyszenia w czwartek.\nKlient: Dobrze, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Наталья из Aura Global Merchants. Обзваниваю салоны красоты в Праге [район Варшавы], узнаю, как у них обстоят дела с присутствием в интернете. У вас есть 2 минуты?\nКлиент: Есть, но сразу скажу, что мы, скорее всего, не заинтересованы, потому что мы уже пробовали маркетинг, и это ничего не дало.\nПродавец: Понимаю, вполне естественно, что вы осторожны после такого опыта. Можете рассказать, что именно вы делали раньше?\nКлиент: Мы платили какому-то агентству за рекламу в Facebook, это стоило немало, а клиенток не прибавилось.\nПродавец: К сожалению, это частый сценарий, когда реклама крутится, но никто по пути не проверяет, облегчает ли сайт или профиль вообще запись на визит. Сколько тогда стоило это сотрудничество в месяц, если можно спросить?\nКлиент: Что-то около 800 злотых в месяц плюс бюджет на рекламу.\nПродавец: Понимаю, это немалая сумма при отсутствии результата. У нас мы всегда начинаем с проверки того, есть ли вообще где «поймать» эту клиентку — то есть есть ли быстрый способ записаться онлайн, и только потом говорим о рекламе. Но я понимаю и то, что после такого опыта цена будет для вас важна — у нас простой сайт с онлайн-записью стоит разово около 500–700 EUR, без постоянных ежемесячных платежей за сам сайт.\nКлиент: Ну это уже лучше, чем эти 800 злотых каждый месяц ни за что. Но я сама ничего не решаю, мне нужно поговорить с партнёршей, мы вместе ведём салон.\nПродавец: Конечно, это естественно при таком решении. Может, вместо того чтобы я сейчас пыталась убедить только вас, давайте назначим короткую встречу, на которой сможет присутствовать и партнёрша — тогда мы покажем вам обеим, чем наш подход отличается от того агентства, и вы сможете решить вместе.\nКлиент: Ну ладно, может, и так, но честно говоря, нам ещё нужно подумать, хотим ли мы вообще снова в это ввязываться после того случая.\nПродавец: Понимаю опасение, это обоснованно. Встреча ничего не предрешает — это 20 минут без обязательств, чтобы увидеть, стоит ли вообще продолжать разговор. Если после этого вы решите, что это не для вас, — никаких проблем. Когда у вас обеих найдётся время на следующей неделе?\nКлиент: Наверное, в четверг после закрытия салона, где-то около 19.\nПродавец: Четверг, 19:00, записываю. Отправлю вам SMS с подтверждением, можете передать партнёрше. Спасибо за откровенность насчёт предыдущего сотрудничества, до связи в четверг.\nКлиент: Хорошо, до связи."
      },
      "whatWasGood": {
        "pl": "Sprzedawca uznała złe doświadczenie klientki bez krytykowania poprzedniej agencji, dopytała co dokładnie robiono i ile to kosztowało, żeby znaleźć prawdziwą lukę, a zamiast naciskać na jednoosobową decyzję, zaproponowała włączenie wspólniczki w spotkanie.",
        "ru": "Продавец признала негативный опыт клиентки, не критикуя предыдущее агентство, уточнила, что именно делалось и сколько это стоило, чтобы найти реальный пробел, а вместо того чтобы давить на единоличное решение, предложила включить партнёршу во встречу."
      },
      "whatWasBad": {
        "pl": "Nie dopytała wcześniej, co dokładnie obejmował pakiet poprzedniej agencji, przez co wyjaśnienie różnicy w podejściu Aury pozostało dość ogólne.",
        "ru": "Она не уточнила заранее, что именно входило в пакет предыдущего агентства, из-за чего объяснение отличия подхода Aura осталось довольно общим."
      },
      "howItCouldBeBetter": {
        "pl": "Przed zaproponowaniem spotkania krótko wskazać jeden konkretny element, którym podejście Aury różni się w mierzeniu efektów, żeby klientka nie musiała opierać decyzji wyłącznie na zaufaniu.",
        "ru": "Перед тем как предлагать встречу, стоило коротко указать один конкретный элемент, которым подход Aura отличается в измерении результатов, чтобы клиентке не пришлось основывать решение исключительно на доверии."
      },
      "outcome": {
        "pl": "Umówiono spotkanie z udziałem obu wspólniczek salonu na czwartkowy wieczór po zamknięciu.",
        "ru": "Была назначена встреча с участием обеих совладелиц салона на четверговый вечер после закрытия."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "objection-accounting-chain",
      "title": {
        "pl": "Łańcuch obiekcji – biuro rachunkowe",
        "ru": "Цепочка возражений — бухгалтерская контора"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Robert z Aura Global Merchants. Dzwonię do biur rachunkowych w Warszawie, sprawdzam ich widoczność w internecie. Ma Pani 2 minuty?\nKlient: Właściwie to zaraz mam klienta, więc naprawdę nie mam teraz czasu.\nSprzedawca: Rozumiem, nie zabiorę więcej. Kiedy lepiej oddzwonić — dziś po południu czy jutro rano?\nKlient: Niech Pan już mówi, mam z minutę.\nSprzedawca: Dobrze, w takim razie krótko — sprawdzałem Państwa stronę, jest, ale nie widziałem tam formularza kontaktowego, tylko sam numer telefonu.\nKlient: No mamy stronę, wystarcza nam, klienci głównie i tak przychodzą z polecenia.\nSprzedawca: Rozumiem, że polecenia dobrze działają. A zdarza się, że ktoś szuka biura rachunkowego wpisując w Google, bez polecenia — wie Pani, czy w ogóle Państwa strona się wtedy pokazuje?\nKlient: Nie mam pojęcia, szczerze nigdy tego nie sprawdzałam.\nSprzedawca: To akurat łatwe do sprawdzenia, moglibyśmy to zrobić bezpłatnie. Gdyby się okazało, że jest tam pole do poprawy, ile by to w ogóle kosztowało — prosta rozbudowa istniejącej strony to zwykle 400–600 EUR, bez budowania niczego od zera.\nKlient: Ojej, no nie wiem, teraz akurat trwa u nas sezon rozliczeń, mam głowę zajętą czym innym, muszę to przemyśleć.\nSprzedawca: To zrozumiałe, sezon rozliczeniowy to nie czas na dodatkowe projekty. Powiem szczerze — nie chcę Pani teraz do niczego przekonywać w biegu, bo to i tak nie jest decyzja na 2 minuty między klientami.\nKlient: No właśnie, dokładnie tak to widzę.\nSprzedawca: Może zrobimy tak — zostawiam swój kontakt, a Pani, jak sezon się uspokoi, sama zdecyduje, czy chce Pani do tego wrócić. Nie będę teraz naciskał na spotkanie, skoro to zły moment.\nKlient: To dobre podejście, doceniam. Może rzeczywiście za jakiś czas, jak trochę odetchnę.\nSprzedawca: Jasne, zanotuję sobie, żeby wrócić z telefonem powiedzmy za dwa miesiące, kiedy sezon się skończy — czy to dobry moment?\nKlient: Tak, wtedy spokojnie mogę porozmawiać dłużej.\nSprzedawca: Świetnie, zapisuję kontakt za dwa miesiące. Dziękuję za czas mimo napiętego dnia, powodzenia z sezonem.\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Роберт из Aura Global Merchants. Обзваниваю бухгалтерские конторы в Варшаве, проверяю их видимость в интернете. У вас есть 2 минуты?\nКлиент: Вообще-то у меня скоро клиент, так что времени сейчас правда нет.\nПродавец: Понимаю, больше не отниму времени. Когда лучше перезвонить — сегодня после обеда или завтра утром?\nКлиент: Ладно, говорите уже, у меня есть минута.\nПродавец: Хорошо, тогда коротко — я посмотрел ваш сайт, он есть, но контактной формы там я не увидел, только номер телефона.\nКлиент: Ну у нас есть сайт, нам его хватает, клиенты в основном и так приходят по рекомендациям.\nПродавец: Понимаю, что рекомендации хорошо работают. А бывает, что кто-то ищет бухгалтерскую контору, вбивая запрос в Google, без рекомендации — вы знаете, показывается ли вообще в этом случае ваш сайт?\nКлиент: Понятия не имею, честно говоря, никогда этого не проверяла.\nПродавец: Это как раз легко проверить, мы могли бы сделать это бесплатно. А если бы оказалось, что есть что улучшить, — сколько бы это вообще стоило: простое расширение существующего сайта обычно обходится в 400–600 EUR, без создания чего-либо с нуля.\nКлиент: Ой, ну не знаю, у нас сейчас как раз идёт сезон отчётности, голова занята совсем другим, мне нужно это обдумать.\nПродавец: Это понятно, сезон отчётности — не время для дополнительных проектов. Скажу честно — я не хочу сейчас ни в чём вас убеждать на бегу, ведь это в любом случае не решение, которое принимается за 2 минуты между клиентами.\nКлиент: Вот именно, я это именно так и вижу.\nПродавец: Может, сделаем так — я оставлю свой контакт, а вы, когда сезон утихнет, сами решите, хотите ли вернуться к этому вопросу. Не буду сейчас настаивать на встрече, раз уж момент неподходящий.\nКлиент: Хороший подход, ценю это. Может, действительно через какое-то время, когда немного отдышусь.\nПродавец: Конечно, запишу себе, чтобы перезвонить, скажем, через два месяца, когда сезон закончится — это подходящий момент?\nКлиент: Да, тогда я спокойно смогу поговорить подольше.\nПродавец: Отлично, записываю контакт через два месяца. Спасибо за время, несмотря на напряжённый день, удачи с сезоном.\nКлиент: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Sprzedawca uszanował realną presję czasową, zadał pytanie diagnostyczne zamiast od razu pitchować, odczytał \"muszę przemyśleć\" jako prawdziwy konflikt terminarza, a nie wymówkę, i zamienił niejasne odłożenie sprawy w konkretny, datowany follow-up zamiast naciskać na spotkanie.",
        "ru": "Продавец уважительно отнёсся к реальному дефициту времени клиентки, задал диагностический вопрос вместо того, чтобы сразу питчить, распознал «мне нужно подумать» как настоящий конфликт с расписанием, а не отговорку, и превратил неопределённое откладывание в конкретный follow-up с датой, вместо того чтобы настаивать на встрече."
      },
      "whatWasBad": {
        "pl": "Zaproponował bezpłatne sprawdzenie widoczności w Google, ale nie potwierdził, czy klientka chce, żeby zostało ono wykonane w międzyczasie, przed kolejnym kontaktem za dwa miesiące.",
        "ru": "Он предложил бесплатную проверку видимости в Google, но не уточнил, хочет ли клиентка, чтобы она была проведена в промежутке, до следующего контакта через два месяца."
      },
      "howItCouldBeBetter": {
        "pl": "Przed zakończeniem rozmowy zapytać o zgodę na wykonanie bezpłatnego sprawdzenia widoczności już teraz i przesłanie wyników mailem, żeby telefon za dwa miesiące zaczynał się od konkretów, a nie od zera.",
        "ru": "Перед завершением разговора стоило спросить согласие на проведение бесплатной проверки видимости уже сейчас и отправку результатов по электронной почте, чтобы звонок через два месяца начинался с конкретики, а не с нуля."
      },
      "outcome": {
        "pl": "Nie umówiono spotkania, ale klientka zgodziła się na zaplanowany telefon za dwa miesiące, po zakończeniu sezonu rozliczeniowego.",
        "ru": "Встреча назначена не была, но клиентка согласилась на запланированный звонок через два месяца, после окончания сезона отчётности."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "objection-real-estate-chain",
      "title": {
        "pl": "Łańcuch obiekcji – biuro nieruchomości",
        "ru": "Цепочка возражений — агентство недвижимости"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Ewa z Aura Global Merchants. Dzwonię do biur nieruchomości w Warszawie, sprawdzam obecność w internecie. Ma Pan 2 minuty?\nKlient: Mam chwilę, ale szczerze to ile w ogóle takie rzeczy kosztują, bo już parę razy dzwoniły do nas podobne firmy.\nSprzedawca: Rozumiem, że dzwoni wiele agencji. Zależnie od zakresu, prowadzenie kampanii i strony to zwykle od 600 EUR miesięcznie wzwyż, ale zanim podam cokolwiek dokładnego, wolałabym zrozumieć, co dziś działa, a co nie.\nKlient: No mamy już kogoś, kto robi nam reklamy na Facebooku i Google, więc to jest już ogarnięte.\nSprzedawca: To dobrze, że macie kogoś od tego. A jest Pan zadowolony z liczby zapytań, które to przynosi, czy jest tam jeszcze miejsce na poprawę?\nKlient: Jest nieźle, ale nie powiem, że rewelacyjnie. Tylko wie Pani, teraz mamy szczyt sezonu, ludzie kupują przed wakacjami, nie mam głowy, żeby cokolwiek zmieniać.\nSprzedawca: To akurat rozumiem, w sezonie nie czas na eksperymenty. Gdybyśmy jednak rozmawiali nie o zmianie tego, co już działa, tylko o dodatkowym kanale obok tego, co robi Państwa obecna osoba — czy to w ogóle temat, który by Pana interesował, czy zwyczajnie nie ten moment?\nKlient: Szczerze to nie wiem, czy to w ogóle ma sens, bo nikt mi nie zagwarantuje, że więcej wydam, a będzie więcej klientów. Już się nieraz na tym przejechałem.\nSprzedawca: Ma Pan rację, że nikt uczciwie nie może zagwarantować konkretnej liczby klientów — i ja też tego nie obiecam. To, co możemy zrobić, to pokazać, jak wygląda taki dodatkowy kanał u podobnych biur i zostawić Panu ocenę, czy to ma sens przy Waszej skali.\nKlient: Doceniam szczerość, ale szczerze mówiąc teraz i tak nie mam ani czasu, ani chęci wchodzić w kolejny temat marketingowy. Wolę się skupić na tym co jest.\nSprzedawca: Rozumiem, i to jest w pełni uzasadniona decyzja, zwłaszcza w sezonie. Nie będę naciskał. Zostawię swój numer, gdyby po sezonie temat wrócił, albo gdyby chciał Pan po prostu porównać notatki z tym, co robi obecna osoba.\nKlient: Dobrze, tak zrobimy, dziękuję za rozmowę.\nSprzedawca: Dziękuję, miłego dnia i powodzenia w sezonie.",
        "ru": "Продавец: Добрый день, это Эва из Aura Global Merchants. Обзваниваю агентства недвижимости в Варшаве, проверяю присутствие в интернете. У вас есть 2 минуты?\nКлиент: Минутка есть, но если честно, сколько вообще стоят такие вещи, потому что нам уже несколько раз звонили подобные компании.\nПродавец: Понимаю, что звонит много агентств. В зависимости от объёма, ведение кампании и сайта обычно обходится от 600 EUR в месяц и выше, но прежде чем называть что-то точное, я бы предпочла понять, что сегодня работает, а что нет.\nКлиент: Ну у нас уже есть человек, который делает нам рекламу в Facebook и Google, так что это уже решено.\nПродавец: Хорошо, что у вас есть кто-то для этого. А вы довольны количеством заявок, которые это приносит, или там ещё есть куда улучшать?\nКлиент: Неплохо, но не скажу, что потрясающе. Только знаете, сейчас у нас пик сезона, люди покупают перед отпусками, у меня нет ни времени, ни настроя что-либо менять.\nПродавец: Это я как раз понимаю, в сезон не время для экспериментов. Но если бы мы говорили не об изменении того, что уже работает, а о дополнительном канале рядом с тем, что делает ваш нынешний специалист — это вообще тема, которая могла бы вас заинтересовать, или просто сейчас не тот момент?\nКлиент: Честно говоря, не знаю, есть ли в этом вообще смысл, потому что никто мне не гарантирует, что если я потрачу больше, то будет больше клиентов. Я на этом уже не раз обжигался.\nПродавец: Вы правы, что никто честно не может гарантировать конкретное число клиентов — и я тоже этого обещать не буду. Что мы можем сделать — это показать, как такой дополнительный канал выглядит у похожих агентств, и оставить вам решение, есть ли в этом смысл при вашем масштабе.\nКлиент: Ценю честность, но, честно говоря, сейчас у меня всё равно нет ни времени, ни желания вникать в ещё одну маркетинговую тему. Предпочитаю сосредоточиться на том, что уже есть.\nПродавец: Понимаю, и это вполне обоснованное решение, особенно в сезон. Не буду настаивать. Оставлю свой номер на случай, если после сезона тема снова возникнет, или если вы просто захотите сравнить заметки с тем, что делает нынешний специалист.\nКлиент: Хорошо, так и сделаем, спасибо за разговор.\nПродавец: Спасибо, хорошего дня и удачи в сезоне."
      },
      "whatWasGood": {
        "pl": "Sprzedawca nigdy nie obiecała konkretnych rezultatów liczbowych, doceniła wcześniejsze rozczarowanie klienta bez krytykowania obecnego dostawcy, i zaproponowała mniej zobowiązującą ramę (dodatkowy kanał, a nie zmiana tego, co działa), zanim przyjęła odmowę z klasą.",
        "ru": "Продавец ни разу не пообещала конкретных числовых результатов, признала прошлое разочарование клиента, не критикуя нынешнего подрядчика, и предложила менее обязывающую рамку (дополнительный канал, а не изменение того, что работает), прежде чем достойно принять отказ."
      },
      "whatWasBad": {
        "pl": "Nie dopytała dalej, kiedy klient sam wspomniał, że wyniki są \"nieźle, ale nie rewelacyjnie\" — ten wątek został porzucony, gdy klient użył sezonu jako powodu do zakończenia rozmowy.",
        "ru": "Она не стала расспрашивать дальше, когда клиент сам упомянул, что результаты «неплохие, но не потрясающие» — эта тема была брошена, как только клиент использовал сезон как повод завершить разговор."
      },
      "howItCouldBeBetter": {
        "pl": "Podążyć za sygnałem \"nieźle, ale nie rewelacyjnie\" jednym konkretnym pytaniem, zanim wymówka sezonu zamknie rozmowę, żeby sprawdzić, czy jest tam wąska, mało angażująca oferta warta zaproponowania.",
        "ru": "Стоило развить сигнал «неплохо, но не потрясающе» одним конкретным вопросом, прежде чем отговорка про сезон закроет разговор, чтобы проверить, нет ли там узкого, не требующего больших усилий предложения, которое стоило бы сделать."
      },
      "outcome": {
        "pl": "Klient odmówił na razie, powołując się na szczyt sezonu i sceptycyzm wobec gwarantowanych rezultatów, ale relacja została zachowana na przyszłość.",
        "ru": "Клиент пока отказался, сославшись на пик сезона и скептицизм по поводу гарантированных результатов, но отношения были сохранены на будущее."
      },
      "parserStatusToSet": "not_interested"
    },
    {
      "id": "upsell-car-workshop-seo",
      "title": {
        "pl": "Dosprzedaż SEO – warsztat samochodowy",
        "ru": "Допродажа SEO — автомастерская"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry Panie Krzysztofie, mówi Adam z Aura Global Merchants, robiliśmy dla Państwa stronę warsztatu kilka miesięcy temu. Ma Pan chwilę?\nKlient: A tak, dzień dobry, tak, poznaję. Wszystko w porządku ze stroną, działa dobrze.\nSprzedawca: Cieszę się. Dzwonię właśnie przy okazji przeglądu, jak strona sobie radzi. Sprawdzaliśmy statystyki — ruch powoli rośnie, ale zauważyłem, że większość wejść to osoby, które już znają Państwa nazwę, wpisują ją wprost w Google.\nKlient: No, głównie stali klienci albo z polecenia, tak jak zawsze.\nSprzedawca: Właśnie to chciałem poruszyć. Strona jest gotowa, ale dziś prawie nie pojawia się w wynikach dla osób, które nie znają jeszcze Państwa nazwy, a szukają na przykład wymiany oleju albo warsztatu mechanicznego w Państwa dzielnicy. To jest dokładnie ten ruch, którego teraz brakuje.\nKlient: Hmm, no faktycznie o tym nie myślałem. Co by trzeba było zrobić?\nSprzedawca: To jest pozycjonowanie, czyli SEO — pracujemy nad tym, żeby strona pojawiała się wyżej właśnie na takie lokalne wyszukiwania, plus uzupełniamy i optymalizujemy Państwa wizytówkę Google, żeby pokazywała się na mapie. To naturalne rozszerzenie tego, co już mamy zbudowane — nie zaczynamy od zera.\nKlient: A to drogie?\nSprzedawca: Zależy od zakresu, ale dla lokalnego warsztatu to zwykle rozsądny miesięczny koszt, znacznie mniejszy niż budowa strony od zera, bo bazujemy na tym, co już jest. Zanim podam dokładną kwotę, wolałbym, żeby nasz specjalista SEO zrobił krótki, bezpłatny przegląd, jak dziś wygląda Państwa widoczność względem innych warsztatów w okolicy, i pokazał, co realnie można poprawić.\nKlient: Może być, jestem ciekawy jak wypadamy na tle innych.\nSprzedawca: Świetnie, umówmy 20 minut w przyszłym tygodniu — wtorek czy czwartek bardziej pasuje?\nKlient: Czwartek, ale po 17, bo warsztat zamykamy o 17.\nSprzedawca: Czwartek 17:30, zapisuję. Dziękuję za rozmowę i pozdrawiam ekipę!\nKlient: Dzięki, do usłyszenia.",
        "ru": "Продавец: Добрый день, пан Кшиштоф, это Адам из Aura Global Merchants, мы делали для вас сайт мастерской несколько месяцев назад. Есть у вас минутка?\nКлиент: А, да, добрый день, да, узнаю. Со сайтом всё в порядке, работает хорошо.\nПродавец: Рад слышать. Звоню как раз в рамках проверки того, как сайт справляется. Мы смотрели статистику — трафик потихоньку растёт, но я заметил, что большинство заходов — это люди, которые уже знают ваше название и вбивают его прямо в Google.\nКлиент: Ну да, в основном постоянные клиенты или по рекомендации, как всегда.\nПродавец: Вот об этом я и хотел поговорить. Сайт готов, но сегодня он почти не появляется в результатах для тех, кто ещё не знает вашего названия, а ищет, например, замену масла или автомастерскую в вашем районе. Это как раз тот трафик, которого сейчас не хватает.\nКлиент: Хм, действительно, об этом я не думал. А что нужно было бы сделать?\nПродавец: Это как раз продвижение сайта, то есть SEO — мы работаем над тем, чтобы сайт поднимался выше именно по таким локальным запросам, плюс дополняем и оптимизируем ваш профиль Google, чтобы он показывался на карте. Это естественное продолжение того, что мы уже построили, — начинать с нуля не придётся.\nКлиент: А это дорого?\nПродавец: Зависит от объёма, но для локальной мастерской это обычно разумная ежемесячная сумма, значительно меньше, чем создание сайта с нуля, потому что мы отталкиваемся от того, что уже есть. Прежде чем назвать точную сумму, я бы хотел, чтобы наш SEO-специалист сделал короткий бесплатный обзор того, как сегодня выглядит ваша видимость по сравнению с другими мастерскими в округе, и показал, что реально можно улучшить.\nКлиент: Можно, мне интересно, как мы смотримся на фоне других.\nПродавец: Отлично, давайте назначим 20 минут на следующей неделе — вторник или четверг вам больше подходит?\nКлиент: Четверг, но после 17, потому что мастерскую мы закрываем в 17.\nПродавец: Четверг, 17:30, записываю. Спасибо за разговор, передавайте привет команде!\nКлиент: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Rozmowa otwarta istniejącą relacją i realnymi danymi o ruchu na stronie zamiast ogólnego pitchu, nowa usługa (SEO) powiązana wprost z luką widoczną w danych klienta, zaproponowana jako rozszerzenie istniejącej pracy, a nie nowy projekt.",
        "ru": "Разговор начат с опоры на существующие отношения и реальные данные о трафике сайта, а не с общего питча; новая услуга (SEO) напрямую связана с пробелом, видимым в данных клиента, и предложена как расширение уже выполненной работы, а не как новый проект."
      },
      "whatWasBad": {
        "pl": "Nie zapytał, czy klient zauważył konkurencyjne warsztaty wyżej w wynikach wyszukiwania, co uczyniłoby lukę jeszcze bardziej namacalną.",
        "ru": "Не спросил, замечал ли клиент конкурирующие мастерские выше в результатах поиска, что сделало бы пробел ещё более ощутимым."
      },
      "howItCouldBeBetter": {
        "pl": "Zapytać, czy klient kiedykolwiek sam szukał w Google jako klient i widział, kto wyskakuje na pierwszym miejscu, żeby uczynić lukę konkurencyjną bardziej konkretną przed zaproponowaniem audytu.",
        "ru": "Спросить, искал ли клиент когда-нибудь сам в Google в роли клиента и видел ли, кто выскакивает на первом месте, чтобы сделать конкурентный пробел более конкретным перед тем, как предлагать аудит."
      },
      "outcome": {
        "pl": "Umówiono spotkanie na czwartek po godzinach pracy na bezpłatny audyt SEO i widoczności lokalnej.",
        "ru": "Назначена встреча на четверг после рабочего времени для проведения бесплатного аудита SEO и локальной видимости."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "upsell-online-store-remarketing",
      "title": {
        "pl": "Dosprzedaż remarketingu – sklep internetowy",
        "ru": "Допродажа ремаркетинга — интернет-магазин"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry Pani Aniu, mówi Julia z Aura Global Merchants, prowadzimy Państwa kampanię Google Ads. Ma Pani 5 minut na krótkie podsumowanie miesiąca?\nKlient: Tak, jasne, słucham.\nSprzedawca: W skrócie — ruch na stronę z kampanii trzyma się stabilnie, kliknięcia są, natomiast zauważyliśmy, że sporo osób wchodzi do koszyka i wychodzi bez zakupu. To normalne zjawisko, ale jest sposób, żeby część z tych osób odzyskać.\nKlient: No tak, właśnie sama to widzę w statystykach sklepu, ludzie dodają i znikają.\nSprzedawca: Dokładnie. To jest miejsce na remarketing — czyli te osoby, które już były na Państwa stronie i oglądały konkretny produkt, zaczynają widzieć reklamę z tym właśnie produktem, kiedy przeglądają inne strony czy Instagram. To zwykle jedna z tańszych form reklamy, bo celujemy w kogoś, kto już był zainteresowany, a nie w zupełnie nową osobę.\nKlient: Brzmi sensownie, ale czy to nie będzie ich wkurzać, jak będą widzieć to samo wszędzie?\nSprzedawca: Dobre pytanie, dlatego ustawia się limity, żeby reklama nie pokazywała się za często tej samej osobie, i po jakimś czasie się wygasza. Robimy to z umiarem, nie w formie nachalnej.\nKlient: Okej, to ile by to dodatkowo kosztowało miesięcznie?\nSprzedawca: To zwykle dokłada się do istniejącego budżetu na kampanię, często nawet niewielką kwotą, bo remarketing jest tańszy w przeliczeniu na kliknięcie niż dotarcie do nowych osób. Zanim podam dokładne liczby, chciałabym, żeby nasz specjalista pokazał to na Państwa realnych danych ze sklepu — ile osób dziś porzuca koszyk i jaki to potencjał.\nKlient: Dobra, możemy się umówić na rozmowę, jestem ciekawa liczb.\nSprzedawca: Super, czy pasuje Pani jutro po południu, czy wolałaby Pani w przyszłym tygodniu?\nKlient: Jutro, powiedzmy 14:00.\nSprzedawca: Zapisuję, jutro 14:00. Do usłyszenia, dziękuję za czas!\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, пани Аня, это Юлия из Aura Global Merchants, мы ведём вашу кампанию Google Ads. Есть у вас 5 минут на краткое подведение итогов месяца?\nКлиентка: Да, конечно, слушаю.\nПродавец: Вкратце — трафик на сайт из кампании держится стабильно, клики есть, но мы заметили, что довольно много людей заходит в корзину и уходит без покупки. Это нормальное явление, но есть способ вернуть часть этих людей.\nКлиентка: Ну да, я как раз сама вижу это в статистике магазина, люди добавляют товар и исчезают.\nПродавец: Именно. Вот тут и есть место для ремаркетинга — то есть те люди, которые уже были на вашем сайте и смотрели конкретный товар, начинают видеть рекламу именно с этим товаром, когда просматривают другие сайты или Instagram. Обычно это одна из самых недорогих форм рекламы, потому что мы нацеливаемся на того, кто уже проявил интерес, а не на совершенно нового человека.\nКлиентка: Звучит разумно, но не будет ли это их раздражать, если они будут видеть одно и то же везде?\nПродавец: Хороший вопрос, поэтому устанавливаются лимиты, чтобы реклама не показывалась одному и тому же человеку слишком часто, и через некоторое время она затухает. Мы делаем это в меру, не навязчиво.\nКлиентка: Хорошо, а сколько бы это стоило дополнительно в месяц?\nПродавец: Это обычно добавляется к существующему бюджету кампании, часто даже небольшой суммой, потому что ремаркетинг дешевле в пересчёте на клик, чем привлечение новых людей. Прежде чем назвать точные цифры, я бы хотела, чтобы наш специалист показал это на ваших реальных данных из магазина — сколько людей сегодня бросает корзину и какой это потенциал.\nКлиентка: Хорошо, можем договориться на разговор, мне интересны цифры.\nПродавец: Отлично, вам подходит завтра после обеда, или вы бы предпочли на следующей неделе?\nКлиентка: Завтра, скажем, в 14:00.\nПродавец: Записываю, завтра в 14:00. До связи, спасибо за уделённое время!\nКлиентка: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Rozmowa oparta na realnej obserwacji z istniejącej kampanii (porzucone koszyki), a nie na zimnym pitchu, zaadresowała prawdopodobną obiekcję o nachalności reklam zanim klientka zdążyła ją w pełni sformułować, powiązała cenę z danymi jej sklepu zamiast podawać sztywną kwotę.",
        "ru": "Разговор построен на реальном наблюдении из существующей кампании (брошенные корзины), а не на холодном питче; вероятное возражение о навязчивости рекламы было снято ещё до того, как клиентка успела полностью его сформулировать; цена была привязана к данным её магазина, а не подана как фиксированная сумма."
      },
      "whatWasBad": {
        "pl": "Nie zapytała, jaki procent odwiedzających dziś finalizuje zakup, co uczyniłoby problem porzuconych koszyków jeszcze bardziej konkretnym przed zaproponowaniem spotkania.",
        "ru": "Не спросила, какой процент посетителей сегодня доводит покупку до конца, что сделало бы проблему брошенных корзин ещё более конкретной перед тем, как предложить встречу."
      },
      "howItCouldBeBetter": {
        "pl": "Przygotować wcześniej dokładny wskaźnik porzuceń koszyka z analityki sklepu, żeby przywołać go wprost na rozmowie, zamiast opierać się na ogólnym wrażeniu klientki.",
        "ru": "Заранее подготовить точный показатель брошенных корзин из аналитики магазина, чтобы прямо сослаться на него в разговоре, вместо того чтобы опираться на общее впечатление клиентки."
      },
      "outcome": {
        "pl": "Umówiono spotkanie na następne popołudnie w celu przeglądu danych o porzuconych koszykach i zaproponowania budżetu na remarketing.",
        "ru": "Назначена встреча на следующий день после обеда для разбора данных о брошенных корзинах и предложения бюджета на ремаркетинг."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "upsell-manufacturer-chatbot",
      "title": {
        "pl": "Dosprzedaż czatu – producent mebli",
        "ru": "Допродажа чата — производитель мебели"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry Panie Wojciechu, mówi Marek z Aura Global Merchants, robiliśmy dla Państwa stronę firmową jakiś czas temu. Ma Pan chwilę?\nKlient: Tak, dzień dobry, słucham.\nSprzedawca: Dzwonię, bo przeglądaliśmy statystyki strony i widzimy, że sporo osób ogląda podstronę z ofertą i cennikiem orientacyjnym, ale nie każdy dochodzi do formularza kontaktowego na dole.\nKlient: No, to możliwe, formularz jest chyba na samym końcu strony.\nSprzedawca: Właśnie to zauważyliśmy. Część firm w takiej sytuacji dodaje prosty czat na stronie, który od razu w trakcie przeglądania pyta, czy potrzebna pomoc albo wycena, i zbiera podstawowe dane — rodzaj zamówienia, przybliżoną ilość. To jakby dodatkowy sposób złapania zapytania, zanim ktoś zdąży wyjść ze strony.\nKlient: Hmm, czyli coś jak automatyczna rozmowa?\nSprzedawca: Tak, dokładnie, prosty automatyczny czat, on nie zastępuje kontaktu z Panem czy z handlowcem, tylko zbiera pierwsze informacje i przekazuje je od razu mailem, żeby nie trzeba było czekać, aż ktoś wypełni cały formularz.\nKlient: A to by wymagało dużo pracy z naszej strony, żeby to ogarnąć?\nSprzedawca: Nie, konfiguracja jest po naszej stronie, Państwo dostajecie gotowe zapytania na maila, tak jak dziś z formularza, tylko więcej ich zbieramy. Zanim jednak cokolwiek zaproponuję na twardo, wolałbym pokazać Panu, ile dokładnie osób dziś ogląda ofertę, ale nie dociera do formularza — to pokaże, czy w ogóle jest tu duży potencjał, zanim zdecydujemy się na taki dodatek.\nKlient: Muszę powiedzieć, że nie jestem pewien, czy to teraz priorytet, mamy dużo swojej roboty produkcyjnej teraz.\nSprzedawca: Rozumiem, rozumiem, to nie jest coś, co trzeba wdrażać natychmiast. Może zróbmy tak — wyślę Panu krótkie zestawienie z tymi liczbami, a Pan zobaczy, czy to w ogóle wygląda na coś wartego rozmowy, bez umawiania na razie żadnego spotkania.\nKlient: To dobry pomysł, proszę wysłać, zobaczę.\nSprzedawca: Dobrze, wyślę w tym tygodniu. Czy mogę potem oddzwonić za dwa tygodnie, żeby zapytać, co Pan o tym sądzi?\nKlient: Tak, może być.\nSprzedawca: Świetnie, zapisuję. Dziękuję za rozmowę, pozdrawiam!\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, пан Войцех, это Марек из Aura Global Merchants, мы делали для вас корпоративный сайт некоторое время назад. Есть у вас минутка?\nКлиент: Да, добрый день, слушаю.\nПродавец: Звоню, потому что мы просматривали статистику сайта и видим, что довольно много людей смотрит страницу с предложением и ориентировочным прайсом, но не каждый доходит до контактной формы внизу.\nКлиент: Ну, это возможно, форма, кажется, в самом конце страницы.\nПродавец: Вот это мы и заметили. Некоторые компании в такой ситуации добавляют на сайт простой чат, который прямо во время просмотра спрашивает, нужна ли помощь или расчёт стоимости, и собирает базовые данные — тип заказа, примерное количество. Это как дополнительный способ поймать заявку, прежде чем человек успеет уйти со страницы.\nКлиент: Хм, то есть что-то вроде автоматического разговора?\nПродавец: Да, именно, простой автоматический чат, он не заменяет контакт с вами или с менеджером по продажам, а только собирает первичную информацию и сразу передаёт её на почту, чтобы не нужно было ждать, пока кто-то заполнит всю форму.\nКлиент: А это потребует от нас много работы, чтобы с этим разобраться?\nПродавец: Нет, настройка на нашей стороне, вы получаете готовые заявки на почту, так же как сегодня из формы, только собираем мы их больше. Но прежде чем что-либо конкретно предлагать, я бы хотел показать вам, сколько именно людей сегодня смотрит предложение, но не доходит до формы — это покажет, есть ли здесь вообще большой потенциал, прежде чем мы решимся на такое дополнение.\nКлиент: Должен сказать, я не уверен, что это сейчас приоритет, у нас сейчас много своей производственной работы.\nПродавец: Понимаю, понимаю, это не то, что нужно внедрять немедленно. Может, сделаем так — я вышлю вам короткую сводку с этими цифрами, а вы посмотрите, выглядит ли это вообще как что-то, о чём стоит говорить, без назначения пока какой-либо встречи.\nКлиент: Это хорошая идея, пришлите, я посмотрю.\nПродавец: Хорошо, вышлю на этой неделе. Могу я потом перезвонить через две недели, чтобы узнать, что вы об этом думаете?\nКлиент: Да, можно.\nПродавец: Отлично, записываю. Спасибо за разговор, всего доброго!\nКлиент: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Pitch oparty na realnych danych o zachowaniu na stronie klienta, chatbot wyjaśniony językiem biznesowym (łapie zapytania, zanim ktoś wyjdzie ze strony) zamiast żargonem technicznym, a sygnał \"nie priorytet teraz\" uszanowany przez obniżenie prośby do zestawienia danych zamiast nalegania na spotkanie.",
        "ru": "Питч построен на реальных данных о поведении на сайте клиента, чат-бот объяснён на языке бизнеса (ловит заявки, прежде чем человек уйдёт с сайта), а не техническим жаргоном, а сигнал «сейчас не приоритет» был учтён — просьба была снижена до отправки сводки данных вместо настаивания на встрече."
      },
      "whatWasBad": {
        "pl": "Nie zapytał, ile zapytań miesięcznie klient dziś otrzymuje, co uczyniłoby przyszłe zestawienie danych bardziej przekonującym przez pokazanie liczb bezwzględnych, a nie tylko procentów.",
        "ru": "Не спросил, сколько заявок в месяц клиент получает сегодня, что сделало бы будущую сводку данных более убедительной за счёт показа абсолютных чисел, а не только процентов."
      },
      "howItCouldBeBetter": {
        "pl": "Zapytać o obecną miesięczną liczbę zapytań przed zakończeniem rozmowy, żeby zestawienie mailowe mogło pokazać szacowany wzrost w liczbach bezwzględnych, nie tylko w procentach.",
        "ru": "Спросить о текущем количестве заявок в месяц до завершения разговора, чтобы сводка по почте могла показать предполагаемый рост в абсолютных числах, а не только в процентах."
      },
      "outcome": {
        "pl": "Nie umówiono spotkania; klient zgodził się na otrzymanie zestawienia danych mailem i telefon follow-up za dwa tygodnie.",
        "ru": "Встреча не назначена; клиент согласился получить сводку данных по почте и на повторный звонок через две недели."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "upsell-language-school-gbp",
      "title": {
        "pl": "Dosprzedaż wizytówki Google – szkoła językowa",
        "ru": "Допродажа профиля Google — языковая школа"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry Pani Magdo, mówi Ola z Aura Global Merchants, w marcu robiliśmy dla Państwa nową stronę szkoły językowej. Ma Pani 5 minut?\nKlient: O tak, dzień dobry! Tak, mam chwilę, strona zresztą wygląda świetnie, dostajemy komplementy.\nSprzedawca: Bardzo mi miło to słyszeć. Dzwonię przy okazji małego przeglądu — sprawdzałam, jak wygląda Państwa profil w Google, ten, który pokazuje się na mapie, kiedy ktoś szuka szkoły językowej w okolicy. Zauważyłam, że jest uzupełniony, ale ma tylko 6 opinii i nie ma tam żadnych zdjęć z zajęć.\nKlient: A, no tak, nikt się tym u nas nie zajmuje, szczerze mówiąc zapomnieliśmy o tym profilu.\nSprzedawca: To zupełnie normalne, wielu klientów o tym zapomina, bo skupiają się na stronie. Tyle że przy wyszukiwaniach lokalnych, typu kurs angielskiego dla dzieci w danej dzielnicy, to właśnie ten profil z mapą pokazuje się jako pierwszy, czasem nawet przed samą stroną, i to on w dużej mierze decyduje, czy ktoś kliknie dalej — a liczba opinii i zdjęcia mocno na to wpływają.\nKlient: To ciekawe, bo nie zdawałam sobie sprawy, że to aż tak ważne.\nSprzedawca: Możemy to uzupełnić i ustawić prosty system zbierania opinii po zakończonym kursie, plus dodać zdjęcia z zajęć, żeby profil wyglądał żywo i wiarygodnie. To dość szybkie do wdrożenia i naturalnie uzupełnia stronę, którą już macie.\nKlient: Brzmi dobrze, tylko ile by to kosztowało?\nSprzedawca: To zwykle niewielki jednorazowy koszt za uporządkowanie profilu plus prosty system do zbierania opinii, dużo mniejszy niż koszt samej strony. Żeby podać dokładną kwotę, zaproponuję krótką rozmowę z naszym specjalistą, pokaże Pani dokładnie, jak by to wyglądało i ile realnie zajmuje wdrożenie.\nKlient: Dobrze, chętnie się umówię, akurat mamy teraz zapisy na nowy semestr, to dobry moment.\nSprzedawca: Idealnie się składa. Pasuje Pani jutro rano czy pojutrze po południu?\nKlient: Pojutrze po południu, 15:00.\nSprzedawca: Zapisuję, pojutrze 15:00. Dziękuję za rozmowę i miło słyszeć, że strona się sprawdza!\nKlient: Dziękuję, do usłyszenia.",
        "ru": "Продавец: Добрый день, пани Магда, это Оля из Aura Global Merchants, в марте мы делали для вас новый сайт языковой школы. Есть у вас 5 минут?\nКлиентка: О да, добрый день! Да, есть минутка, сайт, кстати, выглядит отлично, мы получаем комплименты.\nПродавец: Мне очень приятно это слышать. Звоню по случаю небольшой проверки — я смотрела, как выглядит ваш профиль в Google, тот, который показывается на карте, когда кто-то ищет языковую школу поблизости. Я заметила, что он заполнен, но там всего 6 отзывов и нет ни одной фотографии с занятий.\nКлиентка: А, ну да, у нас этим никто не занимается, честно говоря, мы забыли про этот профиль.\nПродавец: Это совершенно нормально, многие клиенты об этом забывают, потому что сосредотачиваются на сайте. Только вот при локальных запросах, типа курс английского для детей в таком-то районе, именно этот профиль с картой показывается первым, иногда даже раньше самого сайта, и именно он во многом решает, кликнет ли человек дальше, — а количество отзывов и фотографии сильно на это влияют.\nКлиентка: Интересно, я не осознавала, что это настолько важно.\nПродавец: Мы можем это дополнить и настроить простую систему сбора отзывов после завершения курса, плюс добавить фотографии с занятий, чтобы профиль выглядел живо и заслуживал доверия. Это довольно быстро внедряется и естественно дополняет сайт, который у вас уже есть.\nКлиентка: Звучит хорошо, только сколько бы это стоило?\nПродавец: Это обычно небольшая единоразовая стоимость за приведение профиля в порядок плюс простая система сбора отзывов, значительно меньше стоимости самого сайта. Чтобы назвать точную сумму, я предложу короткий разговор с нашим специалистом, он покажет вам точно, как бы это выглядело и сколько реально занимает внедрение.\nКлиентка: Хорошо, охотно договорюсь, у нас как раз сейчас идёт запись на новый семестр, это подходящий момент.\nПродавец: Прекрасно совпадает. Вам подходит завтра утром или послезавтра после обеда?\nКлиентка: Послезавтра после обеда, в 15:00.\nПродавец: Записываю, послезавтра в 15:00. Спасибо за разговор, приятно слышать, что сайт себя оправдывает!\nКлиентка: Спасибо, до связи."
      },
      "whatWasGood": {
        "pl": "Otwarcie odwołuje się do konkretnego rezultatu istniejącego projektu (komplementy o stronie) zanim wprowadzono coś nowego, wykryto konkretną, sprawdzalną lukę (6 opinii, brak zdjęć) zamiast ogólnego pitchu, a moment rozmowy powiązano z kalendarzem klientki (zapisy na nowy semestr).",
        "ru": "Начало разговора отсылает к конкретному результату уже выполненного проекта (комплименты о сайте), прежде чем вводится что-то новое; выявлен конкретный, проверяемый пробел (6 отзывов, отсутствие фотографий) вместо общего питча, а момент разговора увязан с календарём клиентки (запись на новый семестр)."
      },
      "whatWasBad": {
        "pl": "Nie zapytała, jaki odsetek nowych zapisów dziś pochodzi od osób, które po prostu znalazły szkołę w Google, w porównaniu do poleceń, co pokazałoby realną skalę utraconej szansy w wyszukiwaniach lokalnych.",
        "ru": "Не спросила, какая доля новых записей сегодня приходится на людей, которые просто нашли школу в Google, по сравнению с рекомендациями, что показало бы реальный масштаб упущенной возможности в локальном поиске."
      },
      "howItCouldBeBetter": {
        "pl": "Zapytać, jaka część nowych zapisów pochodzi dziś z samodzielnego znalezienia szkoły w Google, a jaka z poleceń, żeby oszacować skalę szansy przed spotkaniem ze specjalistą.",
        "ru": "Спросить, какая часть новых записей сегодня приходится на самостоятельное нахождение школы в Google, а какая на рекомендации, чтобы оценить масштаб возможности перед встречей со специалистом."
      },
      "outcome": {
        "pl": "Umówiono spotkanie na pojutrze na 15:00 w sprawie uporządkowania wizytówki Google i systemu zbierania opinii.",
        "ru": "Назначена встреча на послезавтра на 15:00 по вопросу приведения в порядок профиля Google и системы сбора отзывов."
      },
      "parserStatusToSet": "meeting_booked"
    },
    {
      "id": "difficult-cleaning-company-price-jump",
      "title": {
        "pl": "Zbyt szybka cena – firma sprzątająca",
        "ru": "Слишком быстрая цена — клининговая компания"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Bartek z Aura Global Merchants. Dzwonię do firm sprzątających w Warszawie. Ma Pani 2 minuty?\nKlient: Mam chwilę, o co chodzi?\nSprzedawca: Robimy strony internetowe i reklamy w Google, super pakiet dla takich firm jak Wasza, strona z formularzem plus kampania to u nas 1800 EUR plus 400 EUR miesięcznie za prowadzenie reklam.\nKlient: Ojej, no to sporo, nawet nie wiem, czy w ogóle potrzebujemy strony.\nSprzedawca: Rozumiem, ale proszę pomyśleć, że to inwestycja, która się zwraca, bo klienci szukają dziś wszystkiego w Google.\nKlient: No dobra, ale my w ogóle nie wiemy, czy mamy problem z pozyskiwaniem klientów, mamy ich całkiem sporo z przetargów i umów z biurowcami.\nSprzedawca: To jeszcze lepiej, bo strona pomoże też budować wizerunek przy przetargach, no i przy okazji może Pani dorzucić social media, mamy pakiet za dodatkowe 300 EUR miesięcznie.\nKlient: Chwileczkę, ja nawet nie wiem, czy w ogóle chcemy więcej klientów teraz, bo mamy pełne obłożenie ekip.\nSprzedawca: Ale strona to zawsze się przyda, poza tym możemy zrobić SEO żeby...\nKlient: Przepraszam, że przerywam, ale Pan mi tu wymienia same rzeczy, a ja nie powiedziałam nawet, że mamy jakiś problem. Naprawdę nie wiem, czy to ma sens teraz.\nSprzedawca: Rozumiem, ale może niech Pani chociaż zobaczy ofertę, wyślę mailem.\nKlient: Dobrze, niech Pan wyśle, ale szczerze wątpię, żebyśmy z tego skorzystały w najbliższym czasie.\nSprzedawca: Dobrze, wyślę jeszcze dziś. Dziękuję za rozmowę.\nKlient: Dobrze, do widzenia.",
        "ru": "Продавец: Добрый день, это Бартек из Aura Global Merchants. Я обзваниваю клининговые компании в Варшаве. У вас есть 2 минуты?\nКлиент: Есть немного времени, в чём дело?\nПродавец: Мы делаем сайты и рекламу в Google, отличный пакет для таких компаний, как ваша: сайт с формой заявки плюс кампания — у нас это 1800 EUR плюс 400 EUR в месяц за ведение рекламы.\nКлиент: Ого, это немало, я даже не знаю, нужен ли нам вообще сайт.\nПродавец: Понимаю, но подумайте, что это инвестиция, которая окупается, ведь сегодня клиенты всё ищут в Google.\nКлиент: Ну хорошо, но мы вообще не знаем, есть ли у нас проблема с привлечением клиентов, у нас их довольно много благодаря тендерам и договорам с бизнес-центрами.\nПродавец: Тем лучше, ведь сайт поможет также создать имидж при участии в тендерах, а заодно вы можете добавить социальные сети — у нас есть пакет за дополнительные 300 EUR в месяц.\nКлиент: Секунду, я даже не знаю, хотим ли мы сейчас больше клиентов, потому что наши бригады загружены полностью.\nПродавец: Но сайт всегда пригодится, кроме того, мы можем сделать SEO, чтобы...\nКлиент: Извините, что перебиваю, но вы мне тут просто перечисляете разные вещи, а я даже не сказала, что у нас есть какая-то проблема. Я правда не знаю, есть ли в этом смысл сейчас.\nПродавец: Понимаю, но, может быть, вы хотя бы посмотрите предложение, я вышлю по почте.\nКлиент: Хорошо, вышлите, но, честно говоря, сомневаюсь, что мы этим воспользуемся в ближайшее время.\nПродавец: Хорошо, вышлю сегодня же. Спасибо за разговор.\nКлиент: Хорошо, до свидания."
      },
      "whatWasGood": {
        "pl": "Sprzedawca zachował uprzejmy ton mimo oporu klientki, zaproponował wysyłkę informacji zamiast dalszego naciskania i zakończył rozmowę profesjonalnie.",
        "ru": "Продавец сохранял вежливый тон, несмотря на сопротивление клиентки, предложил выслать информацию вместо того, чтобы продолжать давить, и завершил разговор профессионально."
      },
      "whatWasBad": {
        "pl": "Podał pełen pakiet cenowy (1800 EUR plus 400 EUR miesięcznie plus dodatki) już w drugim zdaniu, zanim ustalił, czy klientka w ogóle ma jakąkolwiek potrzebę; dokładał kolejne płatne dodatki (pakiet social media) do niezakwalifikowanego leada zamiast zatrzymać się i zdiagnozować sytuację; kiedy klientka wprost powiedziała, że nie jest pewna, czy chce więcej klientów przy pełnym obłożeniu ekip, sprzedawca mówił przez nią dalej i kontynuował pitch SEO zamiast to zaadresować; przez całą rozmowę nie zadał ani jednego pytania diagnostycznego o to, skąd firma dziś pozyskuje klientów, zanim zaczął sprzedawać.",
        "ru": "Он назвал полный ценовой пакет (1800 EUR плюс 400 EUR в месяц плюс дополнения) уже во втором предложении, ещё не выяснив, есть ли у клиентки вообще какая-либо потребность; добавлял всё новые платные опции (пакет соцсетей) для неквалифицированного лида, вместо того чтобы остановиться и продиагностировать ситуацию; когда клиентка прямо сказала, что не уверена, хочет ли она больше клиентов при полной загрузке бригад, продавец продолжал говорить поверх неё и продолжил питчить SEO, вместо того чтобы отреагировать на это; за весь разговор он не задал ни одного диагностического вопроса о том, откуда компания сегодня получает клиентов, прежде чем начать продавать."
      },
      "howItCouldBeBetter": {
        "pl": "Zaraz po przedstawieniu się sprzedawca powinien był zadać jedno pytanie diagnostyczne — na przykład skąd dziś głównie przychodzą nowi klienci: z przetargów, poleceń, czy też z internetu — zanim wspomniał jakąkolwiek cenę czy usługę, a w momencie, gdy klientka powiedziała o pełnym obłożeniu ekip, powinien był natychmiast przerwać pitch sprzedażowy i zapytać, czy realną wartością nie byłby raczej wizerunek i wiarygodność przy przetargach niż zwiększenie liczby zapytań.",
        "ru": "Сразу после представления продавцу следовало задать один диагностический вопрос — например, откуда сегодня в основном приходят новые клиенты: с тендеров, по рекомендациям или из интернета — прежде чем упоминать какую-либо цену или услугу, а в момент, когда клиентка сказала о полной загрузке бригад, ему следовало немедленно прервать продающий питч и спросить, не была бы реальной ценностью скорее репутация и доверие при участии в тендерах, чем увеличение числа заявок."
      },
      "outcome": {
        "pl": "Klientka poprosiła o przesłanie informacji mailem, ale wyraziła wyraźny sceptycyzm, że skorzysta z tego w najbliższym czasie; nie umówiono spotkania.",
        "ru": "Клиентка попросила выслать информацию по почте, но выразила явный скептицизм по поводу того, что воспользуется этим в ближайшее время; встреча назначена не была."
      },
      "parserStatusToSet": "called"
    },
    {
      "id": "difficult-event-agency-oversell",
      "title": {
        "pl": "Przegadana sprzedaż – agencja eventowa",
        "ru": "Излишне многословная продажа — ивент-агентство"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Kuba z Aura Global Merchants, dzwonię do agencji eventowych w Warszawie. Ma Pani 2 minuty?\nKlient: Mam, ale krótko, bo za chwilę mam telefon z klientem.\nSprzedawca: Jasne, będę szybki. My robimy kompleksowo — strony, SEO, Google Ads, social media, mailing, wszystko w jednym, i naprawdę mamy świetne wyniki, klienci u nas typowo podwajają liczbę zapytań w kilka miesięcy, więc...\nKlient: Przepraszam, podwajają? To dość mocne stwierdzenie.\nSprzedawca: No tak, oczywiście zależy od branży, ale generalnie tak to u nas wygląda, mamy naprawdę mocny zespół, pracujemy z restauracjami, salonami, sklepami, budujemy strony w tydzień, robimy...\nKlient: Dobrze, ale ja pytałam bardziej, jak to wygląda konkretnie u agencji eventowych, bo to jednak inna specyfika niż sklep.\nSprzedawca: Tak, tak, u nas wszystko się dostosowuje, to nieważne jaka branża, mamy uniwersalne podejście, które działa wszędzie, więc mogę już od razu powiedzieć, że najlepiej zacząć od pakietu Growth, to jest strona plus SEO plus reklamy, w Państwa przypadku to by było jakieś 700 EUR miesięcznie plus...\nKlient: Chwileczkę, ja jeszcze nawet nie powiedziałam, czy w ogóle mamy problem ze stroną czy z czymkolwiek innym, a Pan mi już podaje pakiet za 700 EUR.\nSprzedawca: No tak, ale to naprawdę dobra cena jak na to, co Pani dostaje, mogę przesłać pełny cennik, żeby Pani zobaczyła wszystkie opcje, mamy jeszcze wyższy pakiet Premium z...\nKlient: Panie Kubo, ja naprawdę muszę kończyć, i szczerze to nie odpowiada mi sposób tej rozmowy, cały czas mi Pan przerywa i sypie cenami, zanim w ogóle zapytał Pan, czym się zajmujemy i czego potrzebujemy.\nSprzedawca: Rozumiem, przepraszam, mogę w takim razie zadać jedno pytanie o...\nKlient: Nie, dziękuję, teraz naprawdę nie mam czasu i szczerze nie jestem przekonana. Do widzenia.\nSprzedawca: Dobrze, przepraszam za kłopot, do widzenia.",
        "ru": "Продавец: Добрый день, это Куба из Aura Global Merchants, я обзваниваю ивент-агентства в Варшаве. У вас есть 2 минуты?\nКлиент: Есть, но недолго, через минуту у меня звонок с клиентом.\nПродавец: Конечно, буду краток. Мы делаем всё комплексно — сайты, SEO, Google Ads, соцсети, рассылки, всё в одном месте, и у нас действительно отличные результаты, наши клиенты обычно удваивают число заявок за несколько месяцев, так что...\nКлиент: Извините, удваивают? Это довольно смелое заявление.\nПродавец: Ну да, конечно, зависит от отрасли, но в целом у нас так и есть, у нас действительно сильная команда, мы работаем с ресторанами, салонами, магазинами, делаем сайты за неделю, занимаемся...\nКлиент: Хорошо, но я спрашивала скорее о том, как это выглядит конкретно у ивент-агентств, ведь это всё же другая специфика, чем у магазина.\nПродавец: Да-да, у нас всё адаптируется, неважно, какая отрасль, у нас универсальный подход, который работает везде, так что я уже сразу могу сказать, что лучше всего начать с пакета Growth — это сайт плюс SEO плюс реклама, в вашем случае это было бы около 700 EUR в месяц плюс...\nКлиент: Секунду, я ведь даже не сказала, есть ли у нас вообще проблема с сайтом или с чем-либо ещё, а вы мне уже называете пакет за 700 EUR.\nПродавец: Ну да, но это действительно хорошая цена за то, что вы получаете, я могу выслать полный прайс-лист, чтобы вы увидели все варианты, у нас есть ещё более высокий пакет Premium с...\nКлиент: Пан Куба, мне правда нужно заканчивать, и, если честно, меня не устраивает то, как проходит этот разговор — вы всё время меня перебиваете и сыплете ценами, даже не спросив, чем мы занимаемся и что нам нужно.\nПродавец: Понимаю, извините, могу в таком случае задать один вопрос о...\nКлиент: Нет, спасибо, сейчас у меня правда нет времени, и, честно говоря, я не уверена. До свидания.\nПродавец: Хорошо, извините за беспокойство, до свидания."
      },
      "whatWasGood": {
        "pl": "Sprzedawca przeprosił, gdy klientka wprost nazwała problem, i zakończył rozmowę bez dalszego sporu, kiedy odmówiła.",
        "ru": "Продавец извинился, когда клиентка прямо назвала проблему, и завершил разговор без дальнейших споров, когда она отказалась."
      },
      "whatWasBad": {
        "pl": "Otworzył rozmowę ogólną listą wszystkich usług zamiast jednego konkretnego spostrzeżenia; wygłosił szerokie, niepoparte niczym twierdzenie o podwajaniu liczby zapytań, które graniczy z obietnicą konkretnego rezultatu i wprost łamie zasadę niegwarantowania liczb; wielokrotnie mówił przez pytania klientki (o specyfikę branży eventowej) generycznymi frazami o uniwersalnym podejściu; podał konkretny pakiet i cenę (700 EUR miesięcznie) bez zadania choćby jednego pytania kwalifikującego o biznes, cele czy obecną sytuację klientki; kontynuował dosprzedaż pakietu Premium nawet po tym, jak klientka wprost nazwała to zachowanie problemem.",
        "ru": "Он открыл разговор общим перечислением всех услуг вместо одного конкретного наблюдения; выдвинул широкое, ничем не подтверждённое утверждение об удвоении числа заявок, которое граничит с обещанием конкретного результата и прямо нарушает правило негарантирования цифр; многократно говорил поверх вопросов клиентки (о специфике ивент-отрасли) общими фразами об универсальном подходе; назвал конкретный пакет и цену (700 EUR в месяц), не задав ни одного квалифицирующего вопроса о бизнесе, целях или текущей ситуации клиентки; продолжал допродажу пакета Premium даже после того, как клиентка прямо назвала такое поведение проблемой."
      },
      "howItCouldBeBetter": {
        "pl": "Kiedy klientka zapytała, jak to wygląda konkretnie u agencji eventowych, sprzedawca powinien był się zatrzymać, przeprosić za zbytnią ogólność i zadać realne pytanie diagnostyczne, na przykład skąd dziś głównie przychodzą zapytania o organizację eventów, i nigdy nie powinien był podawać ceny ani pakietu przed zrozumieniem sytuacji klientki; w momencie, gdy klientka powiedziała, że cały czas jej przerywa, właściwym ruchem było całkowite zatrzymanie pitchu i poproszenie o szansę na krótszą, lepszą rozmowę innym razem, zamiast próbować wcisnąć jeszcze jedno pytanie.",
        "ru": "Когда клиентка спросила, как это выглядит конкретно у ивент-агентств, продавцу следовало остановиться, извиниться за излишнюю обобщённость и задать реальный диагностический вопрос — например, откуда сегодня в основном приходят заявки на организацию мероприятий, — и ни в коем случае не называть цену или пакет до понимания ситуации клиентки; в момент, когда клиентка сказала, что он всё время её перебивает, правильным шагом было полностью остановить питч и попросить о возможности провести более короткий и качественный разговор в другой раз, вместо того чтобы пытаться втиснуть ещё один вопрос."
      },
      "outcome": {
        "pl": "Klientka wyraźnie zirytowała się, że sprzedawca mówił przez nią i podawał ceny bez kwalifikacji, i zakończyła rozmowę odmową dalszego kontaktu.",
        "ru": "Клиентка явно раздражилась из-за того, что продавец говорил поверх неё и называл цены без квалификации, и завершила разговор отказом от дальнейшего контакта."
      },
      "parserStatusToSet": "not_interested"
    },
    {
      "id": "difficult-pet-grooming-mismatch",
      "title": {
        "pl": "Zła usługa – salon groomerski",
        "ru": "Не та услуга — грумерский салон"
      },
      "transcript": {
        "pl": "Sprzedawca: Dzień dobry, mówi Ania z Aura Global Merchants, dzwonię do salonów groomerskich w Warszawie. Ma Pani chwilę?\nKlient: Tak, słucham.\nSprzedawca: Świetnie, bo akurat mamy teraz promocję na sklepy internetowe — budujemy sklep z płatnościami online, wysyłką, wszystkim, w dwa tygodnie, i gwarantujemy, że w pierwszym miesiącu sprzedaż wzrośnie minimum o 30 procent.\nKlient: Sklep internetowy? Ale my nic nie sprzedajemy przez internet, my strzyżemy psy i koty, na miejscu, w salonie.\nSprzedawca: A no tak, rozumiem, ale mogłaby Pani sprzedawać dodatkowo na przykład karmę, kosmetyki dla zwierząt przez taki sklep, to dodatkowy przychód, i naprawdę przy naszym doświadczeniu widzimy wzrosty sprzedaży rzędu 30-40 procent w pierwszych miesiącach u większości klientów.\nKlient: No nie wiem, my się skupiamy tylko na usłudze strzyżenia, nie planujemy sprzedaży produktów, to zupełnie nie ten profil.\nSprzedawca: Rozumiem, ale to też mogłoby pomóc zbudować markę, może warto by rozważyć, bo naprawdę te liczby, które osiągają nasi klienci, są imponujące, mogę przesłać konkretne case study ze wzrostami sprzedaży.\nKlient: Ale ja nie chcę case study sklepu, bo to nie jest to, czego potrzebujemy. Może macie coś dla usług, typu system rezerwacji wizyt?\nSprzedawca: A, tak, coś takiego też robimy, ale to już inny dział, nie mam teraz przy sobie szczegółów tego pakietu, mogę sprawdzić i oddzwonić.\nKlient: Dobrze, ale szczerze to trochę mnie zdziwiło, że od razu zaproponował mi Pan sklep internetowy, nie pytając nawet, czym się zajmujemy.\nSprzedawca: Ma Pani rację, przepraszam za to, faktycznie powinnam była najpierw zapytać. Oddzwonię z właściwą ofertą.\nKlient: Dobrze, do usłyszenia.",
        "ru": "Продавец: Добрый день, это Аня из Aura Global Merchants, я обзваниваю грумерские салоны в Варшаве. У вас есть минутка?\nКлиент: Да, слушаю.\nПродавец: Отлично, потому что как раз сейчас у нас акция на интернет-магазины — мы создаём магазин с онлайн-оплатой, доставкой, всем необходимым, за две недели, и гарантируем, что в первый месяц продажи вырастут минимум на 30 процентов.\nКлиент: Интернет-магазин? Но мы ничего не продаём через интернет, мы стрижём собак и кошек на месте, в салоне.\nПродавец: А, ну да, понимаю, но вы могли бы дополнительно продавать, например, корм, косметику для животных через такой магазин, это дополнительный доход, и, поверьте, по нашему опыту мы видим рост продаж на уровне 30-40 процентов в первые месяцы у большинства клиентов.\nКлиент: Ну не знаю, мы сосредоточены только на услуге стрижки, продажу товаров мы не планируем, это совершенно не наш профиль.\nПродавец: Понимаю, но это тоже могло бы помочь построить бренд, возможно, стоило бы рассмотреть, потому что цифры, которых достигают наши клиенты, действительно впечатляющие, я могу выслать конкретный кейс с ростом продаж.\nКлиент: Но мне не нужен кейс магазина, потому что это не то, что нам нужно. Может, у вас есть что-то для услуг, например система записи на приём?\nПродавец: А, да, что-то подобное мы тоже делаем, но это уже другой отдел, у меня сейчас нет под рукой деталей этого пакета, могу уточнить и перезвонить.\nКлиент: Хорошо, но, если честно, меня немного удивило, что вы сразу предложили мне интернет-магазин, даже не спросив, чем мы занимаемся.\nПродавец: Вы правы, извините за это, действительно, мне следовало сначала спросить. Перезвоню с подходящим предложением.\nКлиент: Хорошо, до связи."
      },
      "whatWasGood": {
        "pl": "Sprzedawczyni przeprosiła, gdy niedopasowanie stało się oczywiste, i uznała słuszną krytykę klientki zamiast się bronić.",
        "ru": "Продавец извинилась, когда несоответствие стало очевидным, и признала справедливую критику клиентки, вместо того чтобы защищаться."
      },
      "whatWasBad": {
        "pl": "Rozpoczęła od zaprezentowania z góry ustalonej, zupełnie niedopasowanej usługi (sklep internetowy) bez zadania choćby jednego pytania o to, czym firma się w ogóle zajmuje; obiecała konkretny, gwarantowany wynik liczbowy (wzrost sprzedaży minimum o 30 procent, potem 30-40 procent), co wprost łamie zasadę niegwarantowania rezultatów i jest niewiarygodnym twierdzeniem dla stacjonarnego salonu groomerskiego; kontynuowała ten sam niedopasowany pitch (case study, kolejne statystyki) nawet po tym, jak klientka wprost powiedziała, że to nie ma zastosowania do jej modelu biznesowego; nie miała przygotowanego zapasowego pitchu i musiała przyznać, że nie zna szczegółów jedynej faktycznie pasującej usługi, co podważyło wiarygodność zbudowaną w trakcie rozmowy.",
        "ru": "Она начала с презентации заранее заготовленной, совершенно неподходящей услуги (интернет-магазин), не задав ни единого вопроса о том, чем компания вообще занимается; пообещала конкретный, гарантированный числовой результат (рост продаж минимум на 30 процентов, затем 30-40 процентов), что прямо нарушает правило негарантирования результатов и является неправдоподобным заявлением для стационарного грумерского салона; продолжала тот же неподходящий питч (кейс, новые статистические данные) даже после того, как клиентка прямо сказала, что это неприменимо к её бизнес-модели; у неё не было заготовленного запасного питча, и ей пришлось признать, что она не знает деталей единственной реально подходящей услуги, что подорвало доверие, выстроенное в ходе разговора."
      },
      "howItCouldBeBetter": {
        "pl": "Otwierające zdanie powinno być pytaniem diagnostycznym, a nie promocyjnym pitchem — na przykład zapytanie, jak dziś wygląda u nich umawianie wizyt i czy klienci łatwo znajdują salon w internecie — i żaden konkretny wynik liczbowy nigdy nie powinien być obiecywany jako gwarantowany; jeśli sprzedawczyni nie jest pewna, czy usługa pasuje, uczciwym ruchem jest najpierw zapytać, czym zajmuje się firma, dopasować odpowiednią usługę, albo wprost przyznać, że to nie do końca jej obszar, ale może sprawdzić, zamiast proponować oddzwonienie dopiero po całej nieudanej próbie.",
        "ru": "Открывающая фраза должна была быть диагностическим вопросом, а не рекламным питчем — например, вопрос о том, как у них сегодня устроена запись на приём и легко ли клиенты находят салон в интернете, — и ни один конкретный числовой результат никогда не должен обещаться как гарантированный; если продавец не уверен, подходит ли услуга, честным шагом будет сначала спросить, чем занимается компания, подобрать подходящую услугу или прямо признать, что это не совсем её область, но она может уточнить, вместо того чтобы предлагать перезвонить только после целой неудачной попытки."
      },
      "outcome": {
        "pl": "Zaproponowana usługa (sklep internetowy) okazała się całkowicie niedopasowana do stacjonarnego salonu groomerskiego, a sprzedawczyni musiała wycofać się i obiecać oddzwonienie z inną, trafniejszą propozycją.",
        "ru": "Предложенная услуга (интернет-магазин) оказалась совершенно неподходящей для стационарного грумерского салона, и продавцу пришлось отступить и пообещать перезвонить с другим, более подходящим предложением."
      },
      "parserStatusToSet": "bad_fit"
    }
  ]
};
