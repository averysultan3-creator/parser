// "Pick the best response" scenario decision cards for the Script Trainer,
// Obiekcje and Statusy training modules.
// Shape: { client: 'Polish, what the client says', choices: [[responseTextPl, isCorrect, {pl,ru}], ...] }
// Client lines and response option text stay Polish-only (literal spoken dialogue);
// the third item in each choice is the bilingual coaching explanation.
export const SCENARIO_BANK = {
  "scripts": [
    {
      "client": "Dzień dobry, o co chodzi?",
      "choices": [
        [
          "Dzwonię sprzedać stronę internetową, mamy promocję.",
          false,
          {
            "pl": "Za wcześnie. Brzmi jak zwykła sprzedaż i klient będzie się bronił.",
            "ru": "Слишком рано. Звучит как обычная продажа, клиент сразу начнёт защищаться."
          }
        ],
        [
          "Krótko: sprawdzamy lokalne firmy, które mogą tracić zapytania przez słabszą obecność w Google. Chcę tylko zadać jedno pytanie.",
          true,
          {
            "pl": "Dobrze. Jest krótko, konkretnie i nie sprzedajesz od razu.",
            "ru": "Хорошо. Коротко, конкретно, и ты не продаёшь с ходу."
          }
        ],
        [
          "Proszę wejść na naszą stronę i zobaczyć ofertę.",
          false,
          {
            "pl": "To oddaje kontrolę klientowi i nie buduje rozmowy.",
            "ru": "Это отдаёт контроль клиенту и не строит разговор."
          }
        ]
      ]
    },
    {
      "client": "Nie mam teraz czasu.",
      "choices": [
        [
          "Rozumiem. Czy lepiej zadzwonić dziś po 16:00 czy jutro rano?",
          true,
          {
            "pl": "Dobrze. Dajesz dwie proste opcje i idziesz do następnego kroku.",
            "ru": "Хорошо. Даёшь два простых варианта и двигаешься к следующему шагу."
          }
        ],
        [
          "To ja wyślę ofertę.",
          false,
          {
            "pl": "Bez kontekstu oferta zwykle zginie. Najpierw ustal kolejny kontakt.",
            "ru": "Без контекста предложение обычно теряется. Сначала договорись о следующем контакте."
          }
        ],
        [
          "Ale to zajmie tylko 20 minut.",
          false,
          {
            "pl": "Za dużo. Klient powiedział, że nie ma czasu.",
            "ru": "Слишком много. Клиент сказал, что у него нет времени."
          }
        ]
      ]
    },
    {
      "client": "Halo, kto mówi?",
      "choices": [
        [
          "Dzień dobry, mówi [Imię] z Aura Global Merchants. Dzwonię w krótkiej sprawie, zajmę może dwie minuty.",
          true,
          {
            "pl": "Dobrze. Podajesz imię i firmę od razu, bez owijania, i uczciwie mówisz ile to zajmie.",
            "ru": "Хорошо. Сразу называешь имя и компанию, без вступлений, и честно говоришь, сколько это займёт."
          }
        ],
        [
          "Dzień dobry, dzwonię, bo mamy dla Państwa świetną ofertę na strony internetowe, na pewno się spodoba.",
          false,
          {
            "pl": "Klient pyta kto dzwoni, a nie dostaje odpowiedzi, tylko od razu ofertę. Brzmi jak typowy telemarketing i budzi opór.",
            "ru": "Клиент спросил, кто звонит, а в ответ сразу получает предложение. Звучит как типичный телемаркетинг и вызывает сопротивление."
          }
        ],
        [
          "A, to nieważne, chodzi o coś dla Państwa firmy, ma Pan/Pani chwilę?",
          false,
          {
            "pl": "Unikanie prostego pytania \"kto mówi\" brzmi podejrzanie i od razu obniża zaufanie.",
            "ru": "Уклонение от простого вопроса \"кто звонит\" звучит подозрительно и сразу снижает доверие."
          }
        ]
      ]
    },
    {
      "client": "Proszę szybko, bo zaraz mam klienta na miejscu.",
      "choices": [
        [
          "Dobrze, w takim razie jedno zdanie: sprawdzamy, czy firmy z Państwa branży nie tracą klientów przez stronę albo Google. Pasuje, żebym oddzwonił/a jutro na spokojnie?",
          true,
          {
            "pl": "Dobrze. Szanujesz czas klienta, kompresujesz temat do jednego zdania i od razu proponujesz konkretny powrót do rozmowy.",
            "ru": "Хорошо. Уважаешь время клиента, сжимаешь тему до одной фразы и сразу предлагаешь конкретный возврат к разговору."
          }
        ],
        [
          "Jasne, ale to nie zajmie długo, chciałbym/chciałabym opowiedzieć o naszych usługach...",
          false,
          {
            "pl": "Klient wyraźnie powiedział, że nie ma czasu, a Ty ignorujesz to i jedziesz dalej ze skryptem.",
            "ru": "Клиент ясно сказал, что у него нет времени, а ты игнорируешь это и продолжаешь по скрипту."
          }
        ],
        [
          "Ok, przepraszam za kłopot, to może innym razem, dziękuję, do widzenia.",
          false,
          {
            "pl": "Rezygnujesz z rozmowy zamiast po prostu umówić konkretny termin powrotu. Zajęty klient to nie to samo co niezainteresowany.",
            "ru": "Ты сдаёшься вместо того, чтобы просто договориться о конкретном времени для звонка. Занятой клиент — не то же самое, что незаинтересованный."
          }
        ]
      ]
    },
    {
      "client": "A z jakiej Pan/Pani firmy dzwoni?",
      "choices": [
        [
          "Z Aura Global Merchants, zajmujemy się stronami i widocznością firm w internecie.",
          true,
          {
            "pl": "Dobrze. Jasna, krótka odpowiedź bez owijania i bez przesadnego pitchowania.",
            "ru": "Хорошо. Ясный, короткий ответ без уверток и без лишнего питча."
          }
        ],
        [
          "Z agencji marketingowej, ale to teraz nieważne, chciałbym/chciałabym zapytać o co innego.",
          false,
          {
            "pl": "Zbywanie prostego pytania o nazwę firmy brzmi wymijająco i podkopuje zaufanie od pierwszych sekund.",
            "ru": "Уклонение от простого вопроса о названии компании звучит уклончиво и подрывает доверие с первых секунд."
          }
        ],
        [
          "Jesteśmy jedną z wiodących agencji digitalowych w Polsce, działamy już 12 lat, mamy setki klientów...",
          false,
          {
            "pl": "Klient zadał proste pytanie, a dostaje mini-prezentację firmy. To zabiera czas i brzmi jak laurka na sprzedaż.",
            "ru": "Клиент задал простой вопрос, а получает мини-презентацию компании. Это отнимает время и звучит как рекламная самопохвала."
          }
        ]
      ]
    },
    {
      "client": "O, ładna pogoda dzisiaj, prawda? Też Pan/Pani z Warszawy dzwoni?",
      "choices": [
        [
          "Tak, ładnie dziś. Dzwonię z Warszawy, ale w sprawie Państwa firmy: chciałbym/chciałabym zapytać, jak teraz radzicie sobie z pozyskiwaniem klientów przez internet.",
          true,
          {
            "pl": "Dobrze. Krótko odpowiadasz na small talk i naturalnie przechodzisz mostkiem do pytania kwalifikującego.",
            "ru": "Хорошо. Коротко отвечаешь на светскую беседу и естественным мостиком переходишь к квалифицирующему вопросу."
          }
        ],
        [
          "Tak, pogoda super, a propos, czy zna Pan/Pani dobrą kawiarnię w centrum? Ja akurat...",
          false,
          {
            "pl": "Rozmowa utyka w pogawędce i nigdy nie dochodzi do tematu biznesowego. Grzeczność nie może zastąpić celu rozmowy.",
            "ru": "Разговор застревает в светской беседе и никогда не доходит до делового вопроса. Вежливость не может заменить цель звонка."
          }
        ],
        [
          "Dobrze, dobrze, ale przejdźmy do rzeczy, bo mam mało czasu.",
          false,
          {
            "pl": "Ucinasz klienta zbyt szorstko. To on prowadzi small talk, a nagłe \"do rzeczy\" brzmi niegrzecznie i zimno.",
            "ru": "Ты слишком резко обрываешь клиента. Это он завёл светскую беседу, и резкое \"к делу\" звучит грубо и холодно."
          }
        ]
      ]
    },
    {
      "client": "Firma Kowalski i Wspólnicy, słucham.",
      "choices": [
        [
          "Dzień dobry, mówi [Imię] z Aura Global Merchants. Dzwonię w sprawie obecności Państwa firmy w internecie, mam do tego jedno pytanie.",
          true,
          {
            "pl": "Dobrze. Dopasowujesz ton do formalnego odbioru i przechodzisz do rzeczy bez zbędnego luzu.",
            "ru": "Хорошо. Подстраиваешь тон под формальный ответ и переходишь к делу без лишней фамильярности."
          }
        ],
        [
          "Cześć, tu Marek z agencji, mamy dla Was mega ofertę na start!",
          false,
          {
            "pl": "Klient odebrał bardzo formalnie, a Ty wchodzisz na luzie i z \"mega ofertą\". Rozjazd tonu od razu razi.",
            "ru": "Клиент ответил очень формально, а ты влетаешь в разговор фамильярно с \"супер предложением\". Разница в тоне сразу бросается в глаза."
          }
        ],
        [
          "Eee, dzień dobry... ja... dzwonię, bo, no, chodzi o strony internetowe, no i...",
          false,
          {
            "pl": "Formalny odbiór wybija Cię z rytmu i słychać niepewność. Zamiast tego trzeba mieć gotowe, pewne otwarcie na każdy typ odbioru.",
            "ru": "Формальный ответ сбивает тебя с ритма, и слышна неуверенность. Нужно иметь готовое, уверенное открытие на любой тип ответа."
          }
        ]
      ]
    },
    {
      "client": "To nie jest przypadkiem jakaś reklama albo oszustwo?",
      "choices": [
        [
          "Rozumiem pytanie. Nazywam się [Imię], dzwonię z Aura Global Merchants, niczego teraz nie sprzedaję, tylko sprawdzam jedną rzecz dotyczącą Państwa strony i widoczności w Google.",
          true,
          {
            "pl": "Dobrze. Spokojnie podajesz konkret: kim jesteś i co robisz teraz, bez tłumaczenia się nadmiernie.",
            "ru": "Хорошо. Спокойно даёшь конкретику: кто ты и что делаешь сейчас, без чрезмерных оправданий."
          }
        ],
        [
          "Ale skąd, na pewno nie, to nie jest żadne oszustwo, proszę mi zaufać, jestem uczciwą osobą.",
          false,
          {
            "pl": "Nadmierne zapewnianie o uczciwości brzmi podejrzanie, tak jakby było coś do ukrycia.",
            "ru": "Чрезмерные заверения в честности звучат подозрительно, будто есть что скрывать."
          }
        ],
        [
          "A, to przepraszam za kłopot, w takim razie dziękuję, do widzenia.",
          false,
          {
            "pl": "Poddajesz się przy pierwszej wątpliwości klienta, zamiast spokojnie wyjaśnić, kim jesteś. To zwykłe, uzasadnione pytanie, nie odrzucenie.",
            "ru": "Сдаёшься при первом же сомнении клиента, вместо того чтобы спокойно объяснить, кто ты. Это обычный, обоснованный вопрос, а не отказ."
          }
        ]
      ]
    },
    {
      "client": "W jakiej sprawie Pan/Pani dzwoni? (odbiera recepcja)",
      "choices": [
        [
          "Dzwonię w sprawie widoczności firmy w internecie, chciałbym/chciałabym zamienić dwa słowa z osobą, która się tym zajmuje albo decyduje o takich tematach.",
          true,
          {
            "pl": "Dobrze. Krótki, biznesowy powód i proste pytanie o przekierowanie do właściwej osoby.",
            "ru": "Хорошо. Короткая, деловая причина и простая просьба соединить с нужным человеком."
          }
        ],
        [
          "To prywatna sprawa, proszę mnie połączyć z właścicielem.",
          false,
          {
            "pl": "Kłamstwo o \"prywatnej sprawie\", żeby ominąć recepcję, jest nieuczciwe i może zniszczyć wiarygodność firmy, gdy się wyda.",
            "ru": "Ложь о \"личном деле\", чтобы обойти ресепшн, нечестна и может подорвать доверие к компании, когда раскроется."
          }
        ],
        [
          "Dzwonię, bo mamy świetną promocję na strony internetowe i pozycjonowanie, to może zainteresować Państwa firmę, bo...",
          false,
          {
            "pl": "Pełny pitch wygłoszony do recepcji to strata czasu, bo to nie ona podejmuje decyzję.",
            "ru": "Полный питч, произнесённый ресепшн, это трата времени, ведь решение принимает не он."
          }
        ]
      ]
    },
    {
      "client": "Ile to zajmie, bo mam mało czasu?",
      "choices": [
        [
          "Dwie minuty, może krócej, jeśli okaże się, że to nie dla Państwa.",
          true,
          {
            "pl": "Dobrze. Uczciwy, krótki czas, którego potem faktycznie trzeba dotrzymać.",
            "ru": "Хорошо. Честное, короткое время, которое потом действительно нужно соблюсти."
          }
        ],
        [
          "Tylko chwilkę... (i zaczyna długi, kilkuminutowy wywód o firmie i usługach)",
          false,
          {
            "pl": "Obiecujesz \"chwilkę\", a potem łamiesz tę obietnicę długim monologiem. Klient poczuje się oszukany co do czasu.",
            "ru": "Обещаешь \"минутку\", а потом нарушаешь обещание длинным монологом. Клиент почувствует себя обманутым насчёт времени."
          }
        ],
        [
          "No, z 20 minut, bo temat jest dość obszerny.",
          false,
          {
            "pl": "Klient wprost powiedział, że ma mało czasu, a Ty od razu podajesz nierealny, zbyt długi czas i tracisz go, zanim zaczniesz.",
            "ru": "Клиент прямо сказал, что у него мало времени, а ты сразу называешь нереально долгий срок и теряешь его, ещё не начав."
          }
        ]
      ]
    }
  ],
  "objections": [
    {
      "client": "Nie jestem zainteresowany.",
      "choices": [
        [
          "Rozumiem. Nie chcę nic sprzedawać teraz. Chodzi tylko o krótkie sprawdzenie, czy nie tracicie zapytań przez stronę lub Google. Mogę zadać jedno pytanie?",
          true,
          {
            "pl": "Dobrze. Obniżasz presję i wracasz do diagnozy.",
            "ru": "Хорошо. Снижаешь давление и возвращаешься к диагностике."
          }
        ],
        [
          "Dlaczego nie? Przecież to ważne.",
          false,
          {
            "pl": "Brzmi konfrontacyjnie.",
            "ru": "Звучит как конфронтация."
          }
        ],
        [
          "To proszę dać maila.",
          false,
          {
            "pl": "Mail bez zgody na temat nie ma wartości.",
            "ru": "Email без согласия по теме не имеет ценности."
          }
        ]
      ]
    },
    {
      "client": "Mamy stronę.",
      "choices": [
        [
          "Super. Właśnie dlatego pytam: czy ta strona realnie daje wam zapytania, czy raczej tylko jest w internecie?",
          true,
          {
            "pl": "Dobrze. Nie kłócisz się, tylko otwierasz temat efektu.",
            "ru": "Хорошо. Не споришь, а открываешь тему эффективности."
          }
        ],
        [
          "Ale pewnie jest słaba.",
          false,
          {
            "pl": "Nie oceniaj agresywnie bez audytu.",
            "ru": "Не оценивай агрессивно без аудита."
          }
        ],
        [
          "To nie potrzebujecie nic.",
          false,
          {
            "pl": "Możesz stracić dobrego leada, bo problemem może być jakość, SEO albo reklamy.",
            "ru": "Можешь потерять хорошего лида — проблема может быть в качестве, SEO или рекламе."
          }
        ]
      ]
    },
    {
      "client": "Proszę wysłać ofertę.",
      "choices": [
        [
          "Mogę wysłać, tylko żeby nie wysłać czegoś przypadkowego: czy chodzi bardziej o stronę, Google czy pozyskiwanie zapytań?",
          true,
          {
            "pl": "Dobrze. Warunkujesz ofertę krótką kwalifikacją.",
            "ru": "Хорошо. Обуславливаешь предложение короткой квалификацией."
          }
        ],
        [
          "Dobrze, wyślę wszystko.",
          false,
          {
            "pl": "Za szeroko. Klient nie dostanie konkretu.",
            "ru": "Слишком широко. Клиент не получит конкретики."
          }
        ],
        [
          "Nie wysyłamy ofert.",
          false,
          {
            "pl": "Za twardo i niepotrzebnie.",
            "ru": "Слишком жёстко и не нужно."
          }
        ]
      ]
    },
    {
      "client": "Ile to kosztuje?",
      "choices": [
        [
          "Zależy od zakresu. Najpierw trzeba zobaczyć, co realnie jest potrzebne. Możemy umówić 15 minut i wtedy podać sensowny wariant.",
          true,
          {
            "pl": "Dobrze. Nie rzucasz ceny bez diagnozy.",
            "ru": "Хорошо. Не называешь цену без диагностики."
          }
        ],
        [
          "Od 500 zł.",
          false,
          {
            "pl": "Przypadkowa cena obniża wartość i może być nieprawdziwa.",
            "ru": "Случайная цена снижает ценность и может быть неверной."
          }
        ],
        [
          "Drogo, ale warto.",
          false,
          {
            "pl": "Nieprofesjonalne i bez konkretu.",
            "ru": "Непрофессионально и без конкретики."
          }
        ]
      ]
    },
    {
      "client": "Niech Pan/Pani wyśle to na maila, później sobie przeczytam.",
      "choices": [
        [
          "Dobrze, wyślę. Żeby nie leciało w próżnię, na jaki adres mam wysłać i czy pasuje, żebym oddzwonił/a w czwartek, żeby krótko to omówić?",
          true,
          {
            "pl": "Dobrze. Spełniasz prośbę klienta, ale nie zostawiasz sprawy przypadkowi, tylko ustalasz konkretny kolejny kontakt.",
            "ru": "Хорошо. Выполняешь просьбу клиента, но не оставляешь дело на самотёк, а назначаешь конкретный следующий контакт."
          }
        ],
        [
          "Dobrze, wysyłam, dziękuję za rozmowę, miłego dnia.",
          false,
          {
            "pl": "Wysyłasz maila bez żadnego umówionego follow-upu. Taki mail w 9 na 10 przypadków zginie bez odpowiedzi.",
            "ru": "Отправляешь письмо без какой-либо договорённости о дальнейшем контакте. Такое письмо в 9 из 10 случаев потеряется без ответа."
          }
        ],
        [
          "Mail to i tak nikt nie czyta, lepiej porozmawiajmy teraz przez telefon, to szybciej.",
          false,
          {
            "pl": "Ignorujesz wyraźną prośbę klienta o formę kontaktu, którą wybrał. To wywiera presję i brzmi na nachalne.",
            "ru": "Игнорируешь явную просьбу клиента о выбранном им способе связи. Это давит и звучит навязчиво."
          }
        ]
      ]
    },
    {
      "client": "Nie mamy teraz na to budżetu.",
      "choices": [
        [
          "Rozumiem, to częsty temat. Czy to kwestia tego kwartału, czy budżet w ogóle nie jest planowany na coś takiego w tym roku?",
          true,
          {
            "pl": "Dobrze. Nie kwestionujesz brak budżetu, tylko delikatnie sprawdzasz, czy to bariera czasowa, żeby wiedzieć, kiedy wrócić.",
            "ru": "Хорошо. Не оспариваешь отсутствие бюджета, а мягко проверяешь, временное ли это препятствие, чтобы знать, когда вернуться."
          }
        ],
        [
          "Rozumiem, to może zrobimy to za pół ceny, żeby się zmieścić w budżecie?",
          false,
          {
            "pl": "Od razu schodzisz z ceną, nie wiedząc nawet, czego klient potrzebuje. To obniża wartość usługi i wygląda na desperację.",
            "ru": "Сразу сбрасываешь цену, даже не зная, что нужно клиенту. Это снижает ценность услуги и выглядит как отчаяние."
          }
        ],
        [
          "Rozumiem, to w takim razie nie będę zawracać głowy, dziękuję za rozmowę.",
          false,
          {
            "pl": "Poddajesz się od razu, chociaż brak budżetu \"teraz\" nie znaczy brak budżetu za kwartał. Lead nie jest stracony.",
            "ru": "Сразу сдаёшься, хотя отсутствие бюджета \"сейчас\" не значит отсутствие бюджета через квартал. Лид не потерян."
          }
        ]
      ]
    },
    {
      "client": "Musimy to jeszcze przemyśleć.",
      "choices": [
        [
          "Jasne, to naturalne. Żebym wiedział/a, co dopracować na później: co konkretnie budzi największą wątpliwość?",
          true,
          {
            "pl": "Dobrze. Nie naciskasz na decyzję, tylko schodzisz do konkretu, co właściwie trzeba przemyśleć.",
            "ru": "Хорошо. Не давишь на решение, а уточняешь конкретику, что именно нужно обдумать."
          }
        ],
        [
          "Rozumiem, ale ta oferta jest ważna tylko do końca tygodnia, warto się szybko zdecydować.",
          false,
          {
            "pl": "Sztuczna presja czasu, której klient nie prosił, brzmi na manipulację i zniechęca.",
            "ru": "Искусственное давление временем, о котором клиент не просил, звучит как манипуляция и отталкивает."
          }
        ],
        [
          "Dobrze, to czekam, aż Państwo się odezwiecie.",
          false,
          {
            "pl": "Oddajesz całą inicjatywę klientowi, zamiast umówić konkretny termin kolejnego kontaktu. Taki lead zwykle po prostu wygasa.",
            "ru": "Отдаёшь всю инициативу клиенту, вместо того чтобы назначить конкретную дату следующего контакта. Такой лид обычно просто угасает."
          }
        ]
      ]
    },
    {
      "client": "Mamy już kogoś, kto się tym zajmuje.",
      "choices": [
        [
          "Super, dobrze to słyszeć. A jak oceniacie efekty tej współpracy, jesteście zadowoleni z liczby zapytań?",
          true,
          {
            "pl": "Dobrze. Nie podważasz obecnego dostawcy, tylko sprawdzasz, czy klient faktycznie jest zadowolony z efektów.",
            "ru": "Хорошо. Не критикуешь текущего подрядчика, а проверяешь, действительно ли клиент доволен результатами."
          }
        ],
        [
          "No to pewnie robią to słabo, skoro Pan/Pani jeszcze ze mną rozmawia.",
          false,
          {
            "pl": "Atakujesz konkurencję bez żadnych podstaw. To nieprofesjonalne i klient może to odebrać jako brak szacunku.",
            "ru": "Атакуешь конкурента без каких-либо оснований. Это непрофессионально, и клиент может воспринять это как неуважение."
          }
        ],
        [
          "A, to w takim razie nic więcej nie trzeba, przepraszam za telefon.",
          false,
          {
            "pl": "Rezygnujesz, gdy tylko słyszysz, że jest inny dostawca, chociaż klient wcale nie musi być z niego zadowolony.",
            "ru": "Сдаёшься, как только слышишь про другого подрядчика, хотя клиент вовсе не обязательно им доволен."
          }
        ]
      ]
    },
    {
      "client": "A skąd w ogóle macie mój numer?",
      "choices": [
        [
          "Dane firmy, w tym numer kontaktowy, mieliśmy z publicznie dostępnego rejestru firm. Wracając do tematu...",
          true,
          {
            "pl": "Dobrze. Odpowiadasz uczciwie i konkretnie, bez usprawiedliwiania się, i naturalnie wracasz do rozmowy.",
            "ru": "Хорошо. Отвечаешь честно и конкретно, без оправданий, и естественно возвращаешься к разговору."
          }
        ],
        [
          "No, mamy taką bazę, to standardowa sprawa, nie ma co się przejmować.",
          false,
          {
            "pl": "Wymijająca odpowiedź jeszcze bardziej wzmacnia podejrzliwość klienta, zamiast ją rozwiać.",
            "ru": "Уклончивый ответ ещё больше усиливает подозрительность клиента, вместо того чтобы её развеять."
          }
        ],
        [
          "Przepraszam bardzo, jeśli to jest problem, to już się rozłączam.",
          false,
          {
            "pl": "Traktujesz zwykłe pytanie jak zarzut i uciekasz z rozmowy, zamiast po prostu spokojnie odpowiedzieć.",
            "ru": "Воспринимаешь обычный вопрос как обвинение и убегаешь из разговора, вместо того чтобы просто спокойно ответить."
          }
        ]
      ]
    },
    {
      "client": "Proszę zadzwonić za pół roku, teraz to nie temat.",
      "choices": [
        [
          "Dobrze, zapisuję to sobie na konkretny termin. Który miesiąc pasuje najlepiej, żeby nie trafić znowu w zły moment?",
          true,
          {
            "pl": "Dobrze. Szanujesz decyzję klienta, ale zamieniasz ją w konkretne zobowiązanie z datą, a nie w ogólnik.",
            "ru": "Хорошо. Уважаешь решение клиента, но превращаешь его в конкретную договорённость с датой, а не в общую фразу."
          }
        ],
        [
          "Dobrze, zadzwonimy kiedyś w przyszłości, dziękuję.",
          false,
          {
            "pl": "Bez konkretnej daty ten kontakt praktycznie nigdy się nie wydarzy, bo nic nie zostanie zaplanowane.",
            "ru": "Без конкретной даты этот контакт практически никогда не состоится, потому что ничего не будет запланировано."
          }
        ],
        [
          "Pół roku to długo, może jednak warto zacząć już teraz, żeby nie tracić czasu?",
          false,
          {
            "pl": "Ignorujesz jasno podany przez klienta harmonogram i naciskasz na własny. To buduje opór, a nie zaufanie.",
            "ru": "Игнорируешь чётко озвученный клиентом график и давишь на свой. Это вызывает сопротивление, а не доверие."
          }
        ]
      ]
    },
    {
      "client": "To pewnie jakieś oszustwo, takie telefony to zwykle naciąganie.",
      "choices": [
        [
          "Rozumiem obawę, dużo jest teraz naciągaczy. Jesteśmy realną firmą, można nas sprawdzić w KRS albo na naszej stronie, i niczego teraz nie sprzedaję, tylko pytam o jedną rzecz.",
          true,
          {
            "pl": "Dobrze. Nie obrażasz się na wątpliwość klienta, tylko dajesz mu konkretny, sprawdzalny sposób na weryfikację.",
            "ru": "Хорошо. Не обижаешься на сомнение клиента, а даёшь конкретный, проверяемый способ убедиться."
          }
        ],
        [
          "Na pewno nie, gwarantuję, że to legalna firma, proszę mi po prostu zaufać.",
          false,
          {
            "pl": "Puste zapewnienia i słowo \"gwarantuję\" bez żadnego dowodu brzmią jeszcze bardziej podejrzanie.",
            "ru": "Пустые заверения и слово \"гарантирую\" без каких-либо доказательств звучат ещё более подозрительно."
          }
        ],
        [
          "Rozumiem, to nie będę się przekonywać, przepraszam za kłopot.",
          false,
          {
            "pl": "Poddajesz się przy pierwszej wątpliwości, zamiast spokojnie ją rozwiać konkretami.",
            "ru": "Сдаёшься при первом же сомнении, вместо того чтобы спокойно развеять его конкретикой."
          }
        ]
      ]
    },
    {
      "client": "Ja tu tylko pracuję, nie decyduję o takich rzeczach.",
      "choices": [
        [
          "Jasne, rozumiem. A kto w firmie zajmuje się takimi tematami? Mogę też przygotować krótkie podsumowanie, które Pan/Pani mu przekaże.",
          true,
          {
            "pl": "Dobrze. Uznajesz rolę rozmówcy i szukasz drogi do właściwej osoby decyzyjnej, zamiast tracić czas na presję.",
            "ru": "Хорошо. Признаёшь роль собеседника и ищешь путь к нужному лицу, принимающему решения, вместо того чтобы тратить время на давление."
          }
        ],
        [
          "No ale jakie jest Pana/Pani zdanie, może dałoby się to jakoś przepchnąć?",
          false,
          {
            "pl": "Naciskasz na osobę, która wprost powiedziała, że nie decyduje. To niezręczne i nie prowadzi donikąd.",
            "ru": "Давишь на человека, который прямо сказал, что не принимает решения. Это неловко и никуда не ведёт."
          }
        ],
        [
          "A, to w takim razie nie ma sensu rozmawiać, dziękuję za czas.",
          false,
          {
            "pl": "Kończysz rozmowę, zamiast wykorzystać ją do zdobycia kontaktu do właściwej osoby decyzyjnej.",
            "ru": "Заканчиваешь разговор, вместо того чтобы использовать его для получения контакта нужного лица."
          }
        ]
      ]
    },
    {
      "client": "Dziękuję, ale robimy to sami.",
      "choices": [
        [
          "Rozumiem, sporo firm tak robi. Jak to u Was wygląda, ile czasu to zajmuje w miesiącu i jesteście zadowoleni z efektów?",
          true,
          {
            "pl": "Dobrze. Traktujesz to poważnie, bez oceniania, i pytasz o realny koszt czasu i efekty, nie o samą metodę.",
            "ru": "Хорошо. Относишься к этому серьёзно, без оценок, и спрашиваешь о реальных затратах времени и результатах, а не о самом методе."
          }
        ],
        [
          "No ale to pewnie wygląda dość amatorsko, jak się robi to samemu bez agencji.",
          false,
          {
            "pl": "Oceniasz i lekceważysz pracę klienta bez żadnej podstawy. To obraźliwe i od razu stawia go w defensywie.",
            "ru": "Оцениваешь и принижаешь работу клиента без всяких оснований. Это оскорбительно и сразу ставит его в оборону."
          }
        ],
        [
          "OK, to w takim razie nas nie potrzebujecie, dziękuję za rozmowę.",
          false,
          {
            "pl": "Rezygnujesz, zanim sprawdzisz, czy samodzielna praca faktycznie daje dobre efekty, czy tylko zajmuje czas bez rezultatów.",
            "ru": "Сдаёшься, не проверив, действительно ли самостоятельная работа даёт хороший результат, или просто отнимает время без отдачи."
          }
        ]
      ]
    },
    {
      "client": "Nie ufam ofertom, które słyszę przez telefon.",
      "choices": [
        [
          "To zrozumiałe, przez telefon trudno wszystko zweryfikować. Mogę zamiast tego przesłać krótką informację na piśmie, żeby mieć to na spokojnie, bez presji rozmowy.",
          true,
          {
            "pl": "Dobrze. Uznajesz tę nieufność za rozsądną i proponujesz mniej zobowiązującą formę kontaktu, zamiast przekonywać na siłę.",
            "ru": "Хорошо. Признаёшь эту недоверчивость разумной и предлагаешь менее обязывающую форму контакта, вместо того чтобы силой убеждать."
          }
        ],
        [
          "Ale ja naprawdę jestem osobą godną zaufania, proszę mi wierzyć, mówię szczerze.",
          false,
          {
            "pl": "Zapewnienia o własnej wiarygodności nic nie znaczą dla obcej osoby i brzmią jak puste słowa.",
            "ru": "Заверения в собственной надёжности ничего не значат для незнакомого человека и звучат как пустые слова."
          }
        ],
        [
          "No cóż, trudno, każdy tak mówi, dziękuję za rozmowę.",
          false,
          {
            "pl": "Reagujesz zniechęceniem i lekką irytacją zamiast zaproponować rozwiązanie, które obniży opór klienta.",
            "ru": "Реагируешь раздражением и разочарованием вместо того, чтобы предложить решение, снижающее сопротивление клиента."
          }
        ]
      ]
    },
    {
      "client": "Inni robią to samo taniej.",
      "choices": [
        [
          "Możliwe. A wie Pan/Pani, co dokładnie wchodzi w tę tańszą ofertę? Pytam, bo różnice w zakresie potrafią być spore.",
          true,
          {
            "pl": "Dobrze. Nie kłócisz się o cenę, tylko pytasz o zakres, żeby porównanie było uczciwe, a nie oparte tylko na liczbie.",
            "ru": "Хорошо. Не споришь о цене, а спрашиваешь про объём, чтобы сравнение было честным, а не основанным только на цифре."
          }
        ],
        [
          "No bo pewnie robią to byle jak, tanie rzeczy zwykle są słabej jakości.",
          false,
          {
            "pl": "Oceniasz nieznaną Ci konkurencję bez żadnych dowodów. To nieuczciwe i może zabrzmieć na desperację.",
            "ru": "Оцениваешь незнакомого конкурента без каких-либо доказательств. Это нечестно и может звучать как отчаяние."
          }
        ],
        [
          "Rozumiem, to możemy zejść z ceny, żeby było porównywalnie.",
          false,
          {
            "pl": "Od razu obniżasz cenę, nie wiedząc, co konkretnie klient porównuje. To osłabia wartość oferty jeszcze przed rozmową o zakresie.",
            "ru": "Сразу снижаешь цену, не зная, что именно сравнивает клиент. Это ослабляет ценность предложения ещё до разговора об объёме."
          }
        ]
      ]
    },
    {
      "client": "Muszę to jeszcze skonsultować ze wspólnikiem.",
      "choices": [
        [
          "Jasne, to ważna decyzja. Mogę przygotować krótkie podsumowanie, żeby łatwiej Wam się to omawiało, i umówmy się na telefon, powiedzmy w środę, żeby wiedzieć, na czym stoimy.",
          true,
          {
            "pl": "Dobrze. Wspierasz proces decyzyjny klienta i jednocześnie zabezpieczasz konkretny kolejny kontakt.",
            "ru": "Хорошо. Поддерживаешь процесс принятия решения клиента и одновременно фиксируешь конкретный следующий контакт."
          }
        ],
        [
          "Rozumiem, ale to w sumie też Pana/Pani decyzja, może po prostu się Pan/Pani zgodzi, a wspólnika poinformujecie później?",
          false,
          {
            "pl": "Naciskasz na decyzję wbrew jasno opisanemu przez klienta procesowi. To wygląda na próbę obejścia normalnej procedury.",
            "ru": "Давишь на решение вопреки чётко описанному клиентом процессу. Это выглядит как попытка обойти нормальную процедуру."
          }
        ],
        [
          "Dobrze, to niech Pan/Pani zapyta, a potem się odezwie, jak będzie wiadomo.",
          false,
          {
            "pl": "Zostawiasz cały następny krok w rękach klienta bez żadnego terminu. Taki temat zwykle po prostu ucicha.",
            "ru": "Оставляешь весь следующий шаг в руках клиента без какого-либо срока. Такая тема обычно просто затихает."
          }
        ]
      ]
    }
  ],
  "statuses": [
    {
      "client": "Nikt nie odebrał telefonu.",
      "choices": [
        [
          "Ustaw status: Nie odebrał i zaplanuj ponowny kontakt.",
          true,
          {
            "pl": "Poprawnie. Taki lead nie jest stracony.",
            "ru": "Верно. Такой лид не потерян."
          }
        ],
        [
          "Usuń firmę.",
          false,
          {
            "pl": "Nie usuwaj tylko dlatego, że nikt nie odebrał.",
            "ru": "Не удаляй только потому, что никто не ответил."
          }
        ],
        [
          "Oznacz jako nie pasuje.",
          false,
          {
            "pl": "Brak odpowiedzi to nie kwalifikacja.",
            "ru": "Отсутствие ответа — это не квалификация."
          }
        ]
      ]
    },
    {
      "client": "Klient chce rozmowę jutro o 11:00.",
      "choices": [
        [
          "Status: Spotkanie umówione, notatka z terminem i tematem.",
          true,
          {
            "pl": "Poprawnie. To najważniejszy pozytywny status.",
            "ru": "Верно. Это самый важный позитивный статус."
          }
        ],
        [
          "Status: Zainteresowany bez notatki.",
          false,
          {
            "pl": "Za mało. Termin musi być zapisany.",
            "ru": "Недостаточно. Дата и время должны быть записаны."
          }
        ],
        [
          "Status: Completed.",
          false,
          {
            "pl": "Proces nie jest zakończony, tylko przekazany dalej.",
            "ru": "Процесс не завершён, а передан дальше."
          }
        ]
      ]
    },
    {
      "client": "Włączyła się poczta głosowa.",
      "choices": [
        [
          "Ustaw status: Poczta głosowa, zostaw krótką wiadomość z imieniem i firmą, zaplanuj kolejną próbę innego dnia.",
          true,
          {
            "pl": "Poprawnie. Krótka wiadomość plus zaplanowana kolejna próba, lead zostaje aktywny.",
            "ru": "Верно. Короткое сообщение плюс запланированная следующая попытка, лид остаётся активным."
          }
        ],
        [
          "Zostaw na poczcie długą wiadomość z pełną ofertą i ustaw status: Zainteresowany.",
          false,
          {
            "pl": "Poczta głosowa to nie zgoda na rozmowę o ofercie, a status \"Zainteresowany\" jest nieprawdziwy, bo nikt nic nie potwierdził.",
            "ru": "Голосовая почта — это не согласие на разговор о предложении, а статус \"Заинтересован\" неверен, ведь никто ничего не подтвердил."
          }
        ],
        [
          "Oznacz numer jako nieaktywny i przejdź do kolejnego kontaktu.",
          false,
          {
            "pl": "Poczta głosowa nie oznacza, że numer jest martwy. To zbyt pochopna decyzja, która niepotrzebnie zamyka leada.",
            "ru": "Голосовая почта не значит, что номер нерабочий. Это слишком поспешное решение, которое напрасно закрывает лида."
          }
        ]
      ]
    },
    {
      "client": "Pod tym numerem odebrała zupełnie inna osoba, nie ta firma, do której mieliśmy dzwonić.",
      "choices": [
        [
          "Popraw dane kontaktowe w CRM jako błędne, dodaj notatkę i poszukaj aktualnego numeru do właściwej firmy.",
          true,
          {
            "pl": "Poprawnie. Naprawiasz dane zamiast tracić leada tylko dlatego, że numer był nieaktualny.",
            "ru": "Верно. Исправляешь данные вместо того, чтобы терять лида только из-за неактуального номера."
          }
        ],
        [
          "Zostaw dane bez zmian i zadzwoń jeszcze raz na ten sam numer za tydzień.",
          false,
          {
            "pl": "Bez poprawienia danych powtórzysz dokładnie ten sam błąd przy kolejnej próbie.",
            "ru": "Без исправления данных ты повторишь точно ту же ошибку при следующей попытке."
          }
        ],
        [
          "Usuń całą firmę z bazy jako nieaktualną.",
          false,
          {
            "pl": "Firma może być wciąż aktywna, tylko z innym numerem. Usuwanie całego rekordu to za daleko idąca decyzja.",
            "ru": "Компания может быть по-прежнему активна, просто с другим номером. Удаление всей записи — слишком радикальное решение."
          }
        ]
      ]
    },
    {
      "client": "Proszę zadzwonić za miesiąc, teraz mamy w firmie urlopy.",
      "choices": [
        [
          "Ustaw status z konkretną datą przypomnienia za miesiąc i dodaj notatkę o powodzie (urlopy w firmie).",
          true,
          {
            "pl": "Poprawnie. Konkretna data i kontekst w notatce sprawiają, że kolejny kontakt faktycznie się odbędzie i będzie trafny.",
            "ru": "Верно. Конкретная дата и контекст в заметке гарантируют, что следующий контакт действительно состоится и будет уместным."
          }
        ],
        [
          "Ustaw status: Zainteresowany, bez daty przypomnienia.",
          false,
          {
            "pl": "Bez konkretnej daty przypomnienie łatwo zgubić w kolejce zadań i kontakt się nie odbędzie.",
            "ru": "Без конкретной даты напоминание легко потерять в очереди задач, и контакт не состоится."
          }
        ],
        [
          "Ustaw status: Odrzucone.",
          false,
          {
            "pl": "Klient nie odmówił, tylko poprosił o inny moment. Oznaczanie tego jako odrzucenie to błędna kwalifikacja.",
            "ru": "Клиент не отказал, а попросил перезвонить в другое время. Отмечать это как отказ — неверная квалификация."
          }
        ]
      ]
    },
    {
      "client": "Firma zatrudnia dwie osoby, działa lokalnie tylko z poleceń i wyraźnie nie potrzebuje strony ani reklamy online.",
      "choices": [
        [
          "Ustaw status: Brak dopasowania, z krótką notatką dlaczego, żeby zespół nie dzwonił tu ponownie bez potrzeby.",
          true,
          {
            "pl": "Poprawnie. Uczciwa kwalifikacja z powodem w notatce oszczędza czas całego zespołu.",
            "ru": "Верно. Честная квалификация с указанием причины в заметке экономит время всей команды."
          }
        ],
        [
          "Ustaw status: Nie odebrał.",
          false,
          {
            "pl": "To nieprawdziwy status, rozmowa się odbyła. Błędne statusy zaburzają statystyki i dalszą pracę na leadzie.",
            "ru": "Это неверный статус, разговор состоялся. Ошибочные статусы искажают статистику и дальнейшую работу с лидом."
          }
        ],
        [
          "Umów spotkanie mimo wszystko, na wszelki wypadek.",
          false,
          {
            "pl": "Umawianie spotkania z firmą, która wyraźnie nie pasuje, marnuje czas obu stron zamiast go oszczędzić.",
            "ru": "Назначение встречи с явно неподходящей компанией тратит время обеих сторон вместо того, чтобы его экономить."
          }
        ]
      ]
    },
    {
      "client": "Klient podniósł głos, powiedział, żeby więcej nie dzwonić, i się rozłączył.",
      "choices": [
        [
          "Ustaw status: Nie kontaktować ponownie, dodaj notatkę o przebiegu rozmowy, żeby nikt inny z zespołu tam nie zadzwonił.",
          true,
          {
            "pl": "Poprawnie. Wyraźna prośba o brak kontaktu musi być uszanowana i zapisana, żeby nie powtórzyć sytuacji.",
            "ru": "Верно. Явную просьбу не звонить нужно уважить и зафиксировать, чтобы ситуация не повторилась."
          }
        ],
        [
          "Zaplanuj kolejny telefon za tydzień, może się uspokoi.",
          false,
          {
            "pl": "Ignorowanie wprost wyrażonej prośby o zaprzestanie kontaktu jest nieprofesjonalne i ryzykowne.",
            "ru": "Игнорирование чётко высказанной просьбы прекратить контакт непрофессионально и рискованно."
          }
        ],
        [
          "Usuń notatkę z przebiegu rozmowy, żeby nie było śladu po niemiłej sytuacji.",
          false,
          {
            "pl": "Kasowanie informacji zamiast jej zapisania to zły nawyk, który naraża kolejnych sprzedawców na tę samą awanturę.",
            "ru": "Удаление информации вместо её фиксации — плохая привычка, которая подставляет следующих продавцов под тот же конфликт."
          }
        ]
      ]
    },
    {
      "client": "Klient zapytał w trakcie rozmowy: \"A dzwoniliście już do mojej konkurencji? I jak im poszło?\"",
      "choices": [
        [
          "Odpowiedz ogólnie, bez zdradzania nazw innych klientów, i zapisz w notatce, że klient porównuje się do konkurencji.",
          true,
          {
            "pl": "Poprawnie. Chronisz poufność innych rozmów, a jednocześnie zapisujesz sygnał, który przyda się przy kolejnym kontakcie.",
            "ru": "Верно. Защищаешь конфиденциальность других разговоров и при этом фиксируешь сигнал, полезный для следующего контакта."
          }
        ],
        [
          "Podaj nazwę konkretnej firmy z konkurencji i opowiedz, jak poszła z nią rozmowa.",
          false,
          {
            "pl": "Zdradzanie szczegółów innych rozmów łamie zaufanie i poufność, to może zaszkodzić relacji z obiema firmami.",
            "ru": "Раскрытие деталей других разговоров нарушает доверие и конфиденциальность, это может навредить отношениям с обеими компаниями."
          }
        ],
        [
          "Zignoruj pytanie, zmień temat i nie zapisuj tego w CRM.",
          false,
          {
            "pl": "Ucinanie pytania wygląda niezręcznie, a pominięcie tego w notatce oznacza utratę użytecznej informacji o kliencie.",
            "ru": "Игнорирование вопроса выглядит неловко, а пропуск этого в заметке означает потерю полезной информации о клиенте."
          }
        ]
      ]
    },
    {
      "client": "Recepcjonistka powiedziała, że decydent nigdy nie odbiera takich telefonów, i się rozłączyła.",
      "choices": [
        [
          "Ustaw status z notatką \"blokada na recepcji\" i zaplanuj alternatywną próbę kontaktu, np. o innej porze dnia lub przez mail/LinkedIn.",
          true,
          {
            "pl": "Poprawnie. Odmowa recepcji to nie decyzja decydenta, więc lead zostaje otwarty z inną strategią kontaktu.",
            "ru": "Верно. Отказ ресепшн — это не решение лица, принимающего решения, поэтому лид остаётся открытым с другой стратегией контакта."
          }
        ],
        [
          "Ustaw status: Odrzucone na stałe.",
          false,
          {
            "pl": "Decyzję podjęła recepcja, nie osoba decyzyjna. Trwałe odrzucenie na tej podstawie jest przedwczesne.",
            "ru": "Решение приняла ресепшн, а не лицо, принимающее решения. Окончательный отказ на этом основании преждевременен."
          }
        ],
        [
          "Dzwoń jeszcze pięć razy tego samego dnia na ten sam numer, aż ktoś przełączy.",
          false,
          {
            "pl": "Nachalne, powtarzalne dzwonienie tego samego dnia irytuje i szkodzi wizerunkowi firmy.",
            "ru": "Навязчивые повторные звонки в тот же день раздражают и вредят репутации компании."
          }
        ]
      ]
    },
    {
      "client": "Klient zgodził się na spotkanie, ale od trzech dni nie odpowiada na wiadomość z potwierdzeniem terminu na WhatsAppie.",
      "choices": [
        [
          "Ustaw status: Do potwierdzenia / brak odpowiedzi, zaplanuj telefon zamiast czekać w nieskończoność na WhatsAppie, zapisz liczbę prób.",
          true,
          {
            "pl": "Poprawnie. Nie zakładasz automatycznie \"tak\" ani \"nie\", tylko aktywnie sprawdzasz status przez inny kanał.",
            "ru": "Верно. Не считаешь автоматически ответ \"да\" или \"нет\", а активно проверяешь статус через другой канал."
          }
        ],
        [
          "Zostaw status: Spotkanie umówione bez zmian i po prostu czekaj na odpowiedź.",
          false,
          {
            "pl": "Trzy dni ciszy to sygnał ryzyka, którego status nie odzwierciedla. Bierne czekanie może skończyć się przepadkiem terminu.",
            "ru": "Три дня молчания — сигнал риска, который статус не отражает. Пассивное ожидание может закончиться срывом встречи."
          }
        ],
        [
          "Zmień status na Rezygnacja, skoro nie odpisuje.",
          false,
          {
            "pl": "Trzy dni ciszy na jednym kanale to za mało, żeby uznać sprawę za przegraną. Trzeba jeszcze spróbować innego kontaktu.",
            "ru": "Три дня молчания в одном канале — недостаточно, чтобы считать дело проигранным. Стоит попробовать другой способ связи."
          }
        ]
      ]
    }
  ]
};
