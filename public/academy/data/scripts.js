window.AURA_SCRIPTS = {
  scripts: [
    {
      id: 'first-call',
      title: 'Pierwszy telefon',
      situation: 'Dzwonisz do firmy pierwszy raz. Klient nie wie, kim jesteś, i jest w połowie czegoś innego.',
      goal: 'Przedstawić się w 10 sekund, powiedzieć po co dzwonisz i sprawdzić, czy ma chwilę.',
      readyPhrase:
        'Dzień dobry, mówi [Imię] z Aura Global Merchants. Dzwonię do lokalnych firm w [branża], bo pomagamy im zdobywać więcej klientów przez internet. Ma Pan/Pani 2 minuty?',
      badExample: 'Dzień dobry, dzwonię, bo robimy strony internetowe i marketing, może Pana zainteresuje...',
      goodExample:
        'Dzień dobry, mówi Marek z Aura Global Merchants. Dzwonię do firm zajmujących się klimatyzacją w Warszawie — sprawdzam, jak wygląda Państwa obecność w internecie. Ma Pan 2 minuty?',
      logic: 'Krótkie przedstawienie + konkretna branża + pytanie o czas buduje wrażenie, że to nie jest przypadkowy spam.',
      whatNotToSay: 'Nie zaczynaj od listy usług. Nie mów "mam dla Pana ofertę" na starcie.',
      howToTransition: 'Jeśli powie "tak, słucham" — przejdź do jednego konkretnego pytania o stronę/Google, nie do oferty.'
    },
    {
      id: 'client-busy',
      title: 'Klient zajęty',
      situation: 'Klient mówi, że jest teraz zajęty i nie ma czasu rozmawiać.',
      goal: 'Nie naciskać, tylko szybko ustalić konkretny termin oddzwonienia.',
      readyPhrase: 'Rozumiem, nie zabiorę więcej czasu. Kiedy lepiej oddzwonić — dziś po południu czy jutro rano?',
      badExample: 'To może chociaż szybko powiem, o co chodzi...',
      goodExample: 'Rozumiem, że dziś ciężki dzień. Czy jutro około 11:00 pasuje na 3-minutową rozmowę?',
      logic: 'Dawanie klientowi kontroli nad terminem zwiększa szansę, że faktycznie odbierze telefon następnym razem.',
      whatNotToSay: 'Nie mów "to zajmie tylko chwilę" i nie ciągnij rozmowy mimo odmowy.',
      howToTransition: 'Zapisz dokładny termin w parserze jako notatkę i ustaw status "poprosił o oddzwonienie".'
    },
    {
      id: 'not-interested',
      title: 'Klient mówi "nie jestem zainteresowany"',
      situation: 'Klient odpowiada od razu odmową, zanim jeszcze cokolwiek wytłumaczysz.',
      goal: 'Sprawdzić, czy to odruchowa odmowa, czy naprawdę świadoma decyzja, bez wywierania presji.',
      readyPhrase:
        'Rozumiem. Czy to dlatego, że mają już Państwo kogoś od strony/marketingu, czy po prostu to nie priorytet teraz?',
      badExample: 'Ale proszę chwilę posłuchać, to naprawdę dobra oferta...',
      goodExample: 'Rozumiem. Czy to dlatego, że temat strony jest już ogarnięty, czy po prostu nie ten moment?',
      logic: 'Jedno pytanie diagnostyczne oddziela "nie mam czasu teraz" od "naprawdę nie potrzebuję", nie brzmiąc przy tym jak nachalny sprzedawca.',
      whatNotToSay: 'Nie mów "proszę dać mi szansę" — to brzmi błagalnie, nie profesjonalnie.',
      howToTransition: 'Jeśli powód to brak priorytetu — zostaw krótką furtkę i zapytaj o zgodę na kontakt za kilka miesięcy.'
    },
    {
      id: 'already-has-website',
      title: 'Klient mówi "mamy już stronę"',
      situation: 'Klient odpowiada, że firma ma już stronę internetową.',
      goal: 'Nie kwestionować od razu jakości strony, tylko zrozumieć, jak ona dziś pracuje na klienta.',
      readyPhrase: 'Super, że mają już Państwo stronę. A czy przynosi ona realnie nowe zapytania, czy działa bardziej jako wizytówka?',
      badExample: 'Ale ta strona pewnie jest już stara i słaba, prawda?',
      goodExample: 'Świetnie. A jak wygląda ruch z tej strony — czy klienci przez nią faktycznie dzwonią lub piszą?',
      logic: 'Pytanie o efekt (leady), nie o wygląd, pozwala uniknąć obrażania klienta i naturalnie prowadzi do tematu redesignu/SEO.',
      whatNotToSay: 'Nie krytykuj strony, której nie widziałeś.',
      howToTransition: 'Jeśli strona nie przynosi zapytań — zaproponuj krótki, bezpłatny przegląd i propozycję poprawek.'
    },
    {
      id: 'send-offer',
      title: 'Klient mówi "proszę wysłać ofertę"',
      situation: 'Klient chce zakończyć rozmowę, prosząc o przesłanie oferty mailem.',
      goal: 'Zebrać minimum informacji, żeby oferta była konkretna, i umówić krótki follow-up.',
      readyPhrase:
        'Oczywiście, wyślę. Żeby oferta była dopasowana, a nie ogólna — czy mogę zadać 2 krótkie pytania o to, czego dokładnie Państwo szukają?',
      badExample: 'Dobrze, wyślę ofertę, do widzenia.',
      goodExample: 'Jasne, wyślę konkretną propozycję. Czy chodzi bardziej o nową stronę, czy o więcej zapytań z Google?',
      logic: '"Wyślij ofertę" to często grzeczna forma odmowy — dopytanie pokazuje profesjonalizm i utrzymuje kontrolę nad rozmową.',
      whatNotToSay: 'Nie kończ rozmowy bez ustalenia konkretnego terminu kontaktu po wysłaniu oferty.',
      howToTransition: 'Zapytaj: "Czy mogę oddzwonić w czwartek, żeby omówić ofertę?" i zapisz to jako kolejny krok w parserze.'
    },
    {
      id: 'asks-price-immediately',
      title: 'Klient od razu pyta o cenę',
      situation: 'Zanim cokolwiek wyjaśnisz, klient pyta wprost "ile to kosztuje?".',
      goal: 'Podać orientacyjne widełki, nie obiecując dokładnej kwoty, i przejść do umówienia konsultacji.',
      readyPhrase:
        'Dokładna cena zależy od zakresu, ale proste projekty zaczynają się od około 400–500 EUR. Najlepiej krótko sprawdzić, czego Państwo potrzebują, i wtedy przygotować konkretną propozycję.',
      badExample: 'To zależy, ciężko powiedzieć, trzeba by zobaczyć.',
      goodExample: 'Proste strony zaczynają się od około 400–500 EUR, bardziej rozbudowane projekty to 1200 EUR i więcej — zależy od zakresu. Sprawdźmy krótko, co dokładnie by się przydało.',
      logic: 'Konkretne widełki budują zaufanie, a przeniesienie rozmowy na "zakres" naturalnie prowadzi do spotkania/konsultacji.',
      whatNotToSay: 'Nie podawaj sztywnej, dokładnej ceny bez znajomości zakresu projektu.',
      howToTransition: 'Od razu zaproponuj: "Umówmy 15-minutową rozmowę z naszym specjalistą, żeby przygotować dokładną wycenę."'
    },
    {
      id: 'asks-where-number-from',
      title: 'Klient pyta, skąd numer',
      situation: 'Klient jest podejrzliwy i pyta, skąd masz jego numer telefonu.',
      goal: 'Odpowiedzieć krótko i uczciwie, bez tłumaczenia się jak intruz.',
      readyPhrase: 'Numer znalazłem w publicznie dostępnym rejestrze firm/wizytówce Google dla [branża] w [miasto].',
      badExample: 'No, mamy taką bazę danych firm...',
      goodExample: 'Kontaktujemy się z firmami z [branża] na podstawie publicznych danych firmowych, np. Google Business czy CEIDG.',
      logic: 'Konkretne, jawne źródło (rejestr publiczny, Google) uspokaja klienta bardziej niż wymijająca odpowiedź.',
      whatNotToSay: 'Nie udawaj, że to "przypadkowy" telefon ani nie mów niejasno "mamy swoje źródła".',
      howToTransition: 'Po wyjaśnieniu od razu wróć do tematu rozmowy: "A propos — sprawdzałem Państwa profil i..."'
    },
    {
      id: 'already-has-agency',
      title: 'Klient mówi, że ma już agencję',
      situation: 'Klient współpracuje już z inną firmą marketingową/webową.',
      goal: 'Nie krytykować konkurencji, tylko sprawdzić, czy klient jest w pełni zadowolony i otwarty na drugą opinię.',
      readyPhrase: 'To dobrze, że mają Państwo kogoś od tego tematu. Czy jest Pan/Pani w pełni zadowolony/a z efektów, czy są obszary, które chcielibyście poprawić?',
      badExample: 'A czy ta agencja w ogóle się do Państwa odzywa i coś robi?',
      goodExample: 'Rozumiem. Gdyby pojawiła się kiedyś potrzeba drugiej opinii albo dodatkowego projektu — czy mogę zostawić kontakt?',
      logic: 'Klienci z istniejącą agencją rzadko zrywają współpracę od razu, ale często są otwarci na "opcję B" na przyszłość.',
      whatNotToSay: 'Nie mów źle o konkurencji — to obniża Twoją wiarygodność.',
      howToTransition: 'Jeśli słychać niezadowolenie — delikatnie zaproponuj bezpłatny przegląd "dla porównania".'
    },
    {
      id: 'irritated-client',
      title: 'Klient jest poirytowany',
      situation: 'Klient odpowiada szorstko, jest zirytowany kolejnym telefonem sprzedażowym.',
      goal: 'Rozładować napięcie, zachować spokój i szybko dać klientowi wyjście z rozmowy bez presji.',
      readyPhrase: 'Rozumiem, przepraszam za kłopot. Nie chcę zabierać czasu — czy mogę tylko zostawić kontakt na przyszłość, gdyby temat strony/marketingu kiedyś się pojawił?',
      badExample: 'Spokojnie, nie ma co się denerwować, to tylko telefon.',
      goodExample: 'Rozumiem Pana irytację, dzwonimy pewnie nie pierwszy raz w tym temacie. Nie zabiorę więcej czasu.',
      logic: 'Spokojny, przepraszający ton rozbraja agresję szybciej niż tłumaczenie się lub obrona.',
      whatNotToSay: 'Nie odpowiadaj tym samym tonem i nie tłumacz się długo.',
      howToTransition: 'Zakończ rozmowę uprzejmie i ustaw status "nie zainteresowany" — nie dzwoń ponownie w krótkim czasie.'
    },
    {
      id: 'asks-callback',
      title: 'Klient prosi o oddzwonienie',
      situation: 'Klient prosi, żeby oddzwonić innym razem, bez podania konkretnego terminu.',
      goal: 'Nie zostawiać tego otwartego — ustalić dokładny dzień i godzinę.',
      readyPhrase: 'Jasne, oddzwonię. Żeby nie trafić znowu w zły moment — czy wtorek około 10:00 będzie pasować?',
      badExample: 'Dobrze, to oddzwonię kiedyś później.',
      goodExample: 'Oczywiście. Zapiszę sobie: wtorek, godzina 10:00 — czy to dobry termin dla Pana?',
      logic: 'Konkretny termin drastycznie zwiększa szansę, że kolejny telefon zostanie odebrany i potraktowany poważnie.',
      whatNotToSay: 'Nie kończ słowami "to oddzwonię kiedyś" bez konkretnej daty i godziny.',
      howToTransition: 'Zapisz dokładny termin jako notatkę w parserze i ustaw status oczekujący na oddzwonienie.'
    },
    {
      id: 'how-to-book-meeting',
      title: 'Jak umówić spotkanie',
      situation: 'Klient wykazuje realne zainteresowanie i jest gotowy na kolejny krok.',
      goal: 'Przejść od rozmowy telefonicznej do konkretnie umówionej konsultacji z terminem.',
      readyPhrase: 'Świetnie, w takim razie umówmy krótką, 15-minutową rozmowę z naszym specjalistą, żeby omówić szczegóły i przygotować propozycję. Pasuje Panu środa czy czwartek?',
      badExample: 'To ja komuś przekażę i ktoś się odezwie.',
      goodExample: 'Umówmy konkretny termin — środa 14:00 czy czwartek 11:00, co pasuje bardziej?',
      logic: 'Dawanie dwóch konkretnych opcji terminu (zamiast pytania otwartego) ułatwia klientowi szybką decyzję.',
      whatNotToSay: 'Nie zostawiaj sprawy na "ktoś się odezwie" bez konkretnej daty.',
      howToTransition: 'Potwierdź termin, zapisz w parserze status "spotkanie umówione" wraz z datą i kanałem kontaktu.'
    },
    {
      id: 'how-to-end-call',
      title: 'Jak zakończyć rozmowę',
      situation: 'Rozmowa dobiega końca, niezależnie od wyniku (sukces, odmowa, oddzwonienie).',
      goal: 'Zakończyć profesjonalnie, zostawiając dobre wrażenie niezależnie od rezultatu.',
      readyPhrase: 'Dziękuję za rozmowę i Pana/Pani czas. Miłego dnia!',
      badExample: '(nagłe rozłączenie bez podsumowania)',
      goodExample: 'Dziękuję za czas, podsumowując: [ustalenie]. Miłego dnia, do usłyszenia!',
      logic: 'Krótkie podsumowanie ustaleń na koniec zmniejsza ryzyko nieporozumień i buduje profesjonalny wizerunek.',
      whatNotToSay: 'Nie kończ rozmowy bez jasnego podsumowania następnego kroku (lub jego braku).',
      howToTransition: 'Zapisz w parserze finalny status rozmowy i wszelkie ustalenia, zanim przejdziesz do kolejnego lead-a.'
    }
  ],
  examples: [
    {
      id: 'good-first-call',
      title: 'Dobry pierwszy telefon',
      transcript:
        'Sprzedawca: Dzień dobry, mówi Ola z Aura Global Merchants. Dzwonię do firm zajmujących się detailingiem w Warszawie — sprawdzam obecność online. Ma Pan 2 minuty?\nKlient: Tak, słucham.\nSprzedawca: Widzę, że mają Państwo profil na Instagramie, ale nie znalazłam własnej strony — czy to celowe, czy po prostu nie było na to czasu?\nKlient: Raczej nie było czasu, głównie klienci przychodzą z polecenia.\nSprzedawca: Rozumiem. Strona pomogłaby łapać też klientów, którzy szukają w Google, nie tylko z polecenia. Może umówimy krótką, 15-minutową rozmowę z naszym specjalistą, żeby pokazać, jak mogłoby to wyglądać?\nKlient: Dobrze, można spróbować.',
      whatWasGood: 'Krótkie przedstawienie, konkretne spostrzeżenie o braku strony, pytanie zamiast oceny, jasna propozycja spotkania.',
      whatWasBad: 'Nic istotnego — rozmowa przebiegła zgodnie z dobrymi praktykami.',
      howItCouldBeBetter: 'Można było dodatkowo zapytać o liczbę zapytań miesięcznie, żeby lepiej ocenić potencjał.',
      outcome: 'Klient zgodził się na konsultację z specjalistą.',
      parserStatusToSet: 'meeting_booked'
    },
    {
      id: 'bad-first-call',
      title: 'Zły pierwszy telefon',
      transcript:
        'Sprzedawca: Dzień dobry, dzwonię, bo robimy strony, SEO, reklamy i w ogóle cały marketing internetowy, może by Pana zainteresowało?\nKlient: Nie, dziękuję.\nSprzedawca: Ale proszę chwilę posłuchać, mamy naprawdę dobrą ofertę promocyjną...\nKlient: Nie, nie jestem zainteresowany, do widzenia.',
      whatWasGood: 'Nic — rozmowa była zbyt ogólna i nachalna od pierwszej sekundy.',
      whatWasBad: 'Brak przedstawienia się z imienia, zbyt długa lista usług na start, ignorowanie pierwszej odmowy i naciskanie.',
      howItCouldBeBetter: 'Przedstawić się krótko, wskazać jeden konkretny obszar (np. brak strony) i zapytać o zgodę na rozmowę zamiast od razu sprzedawać.',
      outcome: 'Klient rozłączył się zirytowany.',
      parserStatusToSet: 'not_interested'
    },
    {
      id: 'client-no-website',
      title: 'Klient bez strony',
      transcript:
        'Sprzedawca: Sprawdzałem Państwa firmę i widzę tylko profil na Facebooku, bez własnej strony — czy to prawda?\nKlient: Tak, na razie tylko Facebook, wystarcza nam.\nSprzedawca: Rozumiem, że dziś to działa. Warto jednak wiedzieć, że część klientów szuka firm bezpośrednio w Google, a bez strony tam Państwa nie widać. Czy warto by było to sprawdzić na krótkiej rozmowie z naszym specjalistą?\nKlient: Może faktycznie warto zobaczyć, co proponujecie.',
      whatWasGood: 'Brak oceniania obecnego rozwiązania, jasne wytłumaczenie utraconej szansy (wyszukiwanie w Google).',
      whatWasBad: 'Można było dopytać, ile zapytań miesięcznie przychodzi z Facebooka, dla lepszego kontekstu.',
      howItCouldBeBetter: 'Dodać krótkie pytanie o liczbę klientów miesięcznie przed przejściem do propozycji.',
      outcome: 'Klient zgodził się na rozmowę ze specjalistą.',
      parserStatusToSet: 'meeting_booked'
    },
    {
      id: 'client-old-website',
      title: 'Klient ze starą stroną',
      transcript:
        'Sprzedawca: Widziałem Państwa stronę — działa, ale wygląda na starszą wersję, sprzed kilku lat. Czy przynosi dziś nowe zapytania?\nKlient: Szczerze, to rzadko ktoś przez nią pisze.\nSprzedawca: To dość częsty przypadek przy starszych stronach — nie są dopasowane do telefonów albo nie pojawiają się wysoko w Google. Możemy przygotować krótką propozycję odświeżenia strony, bez zmiany tego, co już działa.\nKlient: Brzmi sensownie, proszę przesłać więcej informacji.',
      whatWasGood: 'Pytanie o efekt strony zamiast krytyki wyglądu, zaproponowanie konkretnego, ograniczonego kroku (odświeżenie, nie budowa od zera).',
      whatWasBad: 'Zgoda na "wysłać więcej informacji" bez próby umówienia konkretnej rozmowy jest słabsza niż spotkanie.',
      howItCouldBeBetter: 'Spróbować dopytać o krótką rozmowę telefoniczną z specjalistą zamiast tylko wysyłki maila.',
      outcome: 'Klient poprosił o więcej informacji mailem.',
      parserStatusToSet: 'called'
    },
    {
      id: 'client-good-website',
      title: 'Klient z dobrą stroną',
      transcript:
        'Sprzedawca: Sprawdziłem Państwa stronę — wygląda naprawdę dobrze i szybko się ładuje. Czy korzystają Państwo już z reklam w Google albo Meta?\nKlient: Nie, na razie tylko strona.\nSprzedawca: To akurat częsta sytuacja — dobra strona bez ruchu z reklam nie pokazuje pełnego potencjału. Możemy pokazać, jak wyglądałaby prosta kampania testowa.\nKlient: Możemy pogadać, ale bez zobowiązań.',
      whatWasGood: 'Docenienie dobrej strony zamiast szukania problemu na siłę, przesunięcie rozmowy na inny obszar (reklamy).',
      whatWasBad: 'Brak konkretnego terminu rozmowy na końcu, "możemy pogadać" jest zbyt ogólne.',
      howItCouldBeBetter: 'Zaproponować konkretny dzień i godzinę krótkiej rozmowy zamiast zostawiać to otwarte.',
      outcome: 'Klient otwarty na dalszy kontakt, bez konkretnego terminu.',
      parserStatusToSet: 'called'
    },
    {
      id: 'client-send-offer',
      title: 'Klient mówi "wyślij ofertę"',
      transcript:
        'Klient: Proszę po prostu wysłać ofertę mailem.\nSprzedawca: Oczywiście, wyślę. Żeby oferta była konkretna, a nie ogólna — czy chodzi bardziej o nową stronę, czy o reklamy przynoszące klientów?\nKlient: Głównie o stronę.\nSprzedawca: Dobrze, przygotuję propozycję pod stronę. Czy mogę oddzwonić w piątek, żeby ją krótko omówić?\nKlient: Dobrze, piątek pasuje.',
      whatWasGood: 'Dopytanie o zakres przed wysyłką oferty, umówienie konkretnego terminu follow-upu.',
      whatWasBad: 'Nic istotnego.',
      howItCouldBeBetter: 'Można dodatkowo zapytać o budżet orientacyjny, żeby oferta była jeszcze bardziej trafna.',
      outcome: 'Ustalono zakres oferty i termin follow-upu.',
      parserStatusToSet: 'called'
    },
    {
      id: 'client-asks-price',
      title: 'Klient pyta o cenę',
      transcript:
        'Klient: Ile to w ogóle kosztuje?\nSprzedawca: Proste strony zaczynają się od około 400–500 EUR, bardziej rozbudowane projekty to 1200 EUR i więcej — dokładna cena zależy od zakresu. Najlepiej krótko sprawdzić, czego dokładnie Państwo potrzebują.\nKlient: Rozumiem, to ile by kosztowała prosta strona wizytówka?\nSprzedawca: Taki projekt zwykle mieści się w widełkach Starter, czyli około 400–500 EUR. Umówmy krótką rozmowę ze specjalistą, żeby potwierdzić dokładny zakres i cenę.',
      whatWasGood: 'Podanie konkretnych widełek zamiast wymijającej odpowiedzi, przejście do umówienia rozmowy.',
      whatWasBad: 'Nic istotnego.',
      howItCouldBeBetter: 'Bez zmian — dobry przykład prowadzenia rozmowy o cenie.',
      outcome: 'Klient otrzymał orientacyjne widełki cenowe i zgodził się na rozmowę ze specjalistą.',
      parserStatusToSet: 'meeting_booked'
    },
    {
      id: 'client-distrustful',
      title: 'Klient nie ufa',
      transcript:
        'Klient: Skąd w ogóle macie mój numer? To jakieś oszustwo?\nSprzedawca: Rozumiem ostrożność. Numer znalazłem w publicznym profilu Google Business Państwa firmy. Nie sprzedajemy niczego przez telefon — jedynie umawiamy krótką, bezpłatną konsultację.\nKlient: Aha, dobrze, to o co dokładnie chodzi?\nSprzedawca: Sprawdzałem Państwa obecność w internecie i zauważyłem kilka rzeczy, które można łatwo poprawić. Mogę je krótko omówić?\nKlient: Dobrze, proszę mówić.',
      whatWasGood: 'Spokojne, konkretne wyjaśnienie źródła numeru, podkreślenie braku presji sprzedażowej.',
      whatWasBad: 'Nic istotnego.',
      howItCouldBeBetter: 'Bez zmian — dobre rozładowanie nieufności.',
      outcome: 'Klient uspokojony, zgodził się kontynuować rozmowę.',
      parserStatusToSet: 'called'
    },
    {
      id: 'client-busy-example',
      title: 'Klient zajęty',
      transcript:
        'Klient: Teraz naprawdę nie mam czasu.\nSprzedawca: Rozumiem, nie zabiorę więcej. Kiedy lepiej oddzwonić — dziś po południu czy jutro rano?\nKlient: Jutro rano, koło 9.\nSprzedawca: Dobrze, zapisuję: jutro, 9:00. Miłego dnia.',
      whatWasGood: 'Brak naciskania, szybkie ustalenie konkretnego terminu oddzwonienia.',
      whatWasBad: 'Nic istotnego.',
      howItCouldBeBetter: 'Bez zmian — krótko, konkretnie, z szacunkiem dla czasu klienta.',
      outcome: 'Ustalono konkretny termin oddzwonienia.',
      parserStatusToSet: 'called'
    },
    {
      id: 'successful-meeting-booked',
      title: 'Udane umówienie spotkania',
      transcript:
        'Sprzedawca: Podsumowując, moglibyśmy przygotować propozycję nowej strony z formularzem zapytań. Umówmy 15-minutową rozmowę z naszym specjalistą — środa 14:00 czy czwartek 11:00?\nKlient: Środa pasuje bardziej.\nSprzedawca: Świetnie, zapisuję środę 14:00. Wyślę potwierdzenie mailem. Dziękuję za rozmowę, do usłyszenia!\nKlient: Dziękuję, do usłyszenia.',
      whatWasGood: 'Jasne podsumowanie ustaleń, dwie konkretne opcje terminu, potwierdzenie mailowe, profesjonalne zakończenie.',
      whatWasBad: 'Nic istotnego.',
      howItCouldBeBetter: 'Bez zmian — wzorcowe zamknięcie rozmowy.',
      outcome: 'Spotkanie/konsultacja umówione na konkretny termin.',
      parserStatusToSet: 'meeting_booked'
    }
  ]
};
