// Deep per-service lesson bank for the "Services Academy" training module.
// Keyed by the service id used in public/site/data/services.js (canonical catalog).
// Shape per service:
// {
//   title: {pl,ru}, badge: {pl,ru},
//   steps: [{ key, title:{pl,ru}, body:{pl,ru}, bullets:{pl:[...],ru:[...]} }, ...],
//   quiz: [{ type:'single'|'case', question:{pl,ru}, answers:{pl,ru}, correct, explain?:{pl,ru} }
//          | { type:'open', question:{pl,ru}, gradingNotes:{pl,ru} }, ...],
//   objections: [{ say, ru, response, responseRu, why:{pl,ru} }, ...],
//   opener: { say, ru },
//   crossSell: {pl,ru}
// }
// This file is loaded via dynamic import() from academy/app.js.
export const SERVICE_LESSONS = {
  "websites": {
    "title": {
      "pl": "Strony internetowe",
      "ru": "Сайты"
    },
    "badge": {
      "pl": "Fundament firmy online",
      "ru": "Фундамент компании онлайн"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Pełnowartościowa strona firmowa — nie jedna podstrona, tylko cały komplet: strona główna, oferta, realizacje/portfolio, opinie klientów i kontakt. To baza, na której potem stoi wszystko inne — reklama, SEO, wizytówka Google. Bez dobrej strony reklama prowadzi donikąd.",
          "ru": "Полноценный сайт компании — не одна страница, а целый комплект: главная, услуги, портфолио/реализации, отзывы клиентов и контакты. Это фундамент, на котором строится всё остальное — реклама, SEO, профиль в Google. Без нормального сайта реклама ведёт в никуда."
        },
        "bullets": {
          "pl": [
            "Strona główna + oferta + realizacje + opinie + kontakt",
            "Proces: analiza → koncepcja → design → wdrożenie → testy → start",
            "To jest baza pod inne usługi — reklamę, SEO, wizytówkę"
          ],
          "ru": [
            "Главная + услуги + портфолио + отзывы + контакты",
            "Процесс: анализ → концепция → дизайн → разработка → тесты → запуск",
            "Это основа для остальных услуг — рекламы, SEO, профиля в Google"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Głównie lokalny biznes usługowy: gabinety, warsztaty, kancelarie, biura, firmy budowlane i remontowe. To firmy, które mają realną ofertę i klientów, ale w internecie ich praktycznie nie ma — albo mają coś, czego wstyd komuś pokazać.",
          "ru": "В основном локальный сервисный бизнес: клиники, мастерские, юридические конторы, офисы, строительные и ремонтные фирмы. Это компании с реальными услугами и клиентами, но в интернете их практически нет — либо есть что-то, что стыдно показать."
        },
        "bullets": {
          "pl": [
            "Firmy usługowe, gabinety, warsztaty, biura",
            "Lokalny biznes bez strony albo ze starą stroną",
            "Firmy, które dziś polegają tylko na Facebooku albo poleceniach"
          ],
          "ru": [
            "Сервисные компании, клиники, мастерские, офисы",
            "Локальный бизнес без сайта или со старым сайтом",
            "Компании, которые сегодня живут только на Facebook или сарафанном радио"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje dwa scenariusze: (1) strony w ogóle nie ma, klient żyje z Facebooka albo poleceń, (2) strona jest, ale ma 8 lat, źle wygląda na telefonie i nikt przez nią nie dzwoni. Rozpoznajesz to po prostym pytaniu: 'A strona internetowa przynosi Panu jakieś zapytania?' — jeśli słyszysz ciszę, śmiech albo 'no właściwie to nie bardzo', masz zielone światło.",
          "ru": "Решает два сценария: (1) сайта нет вообще, клиент живёт на Facebook или рекомендациях, (2) сайт есть, но ему 8 лет, он плохо выглядит на телефоне и никто через него не звонит. Распознаётся простым вопросом: 'А сайт вообще приносит вам заявки?' — если в ответ пауза, смех или 'да как-то не особо' — это зелёный свет для предложения."
        },
        "bullets": {
          "pl": [
            "Brak strony — tylko Facebook, Instagram albo wizytówka Google",
            "Stara strona, nie działa na telefonie, wygląda nieprofesjonalnie",
            "Klient mówi 'mamy stronę, ale nikt przez nią nie dzwoni'"
          ],
          "ru": [
            "Сайта нет — только Facebook, Instagram или профиль Google",
            "Старый сайт, не работает на телефоне, выглядит непрофессионально",
            "Клиент говорит: 'сайт есть, но никто через него не звонит'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Widziałem Pana stronę — ona nie pracuje na telefon, a dziś 80% ludzi wchodzi właśnie z telefonu.",
            "Robimy strony, które nie tylko ładnie wyglądają, tylko realnie przynoszą zapytania — to jest różnica.",
            "Proszę mi powiedzieć, ile zapytań miesięcznie przychodzi dziś przez stronę? Bo z tego co widzę, powinno być dużo więcej."
          ],
          "ru": [
            "Это заход-крючок: показываешь, что реально смотрел сайт клиента, и называешь конкретную техническую проблему (не работает на телефоне) — звучит как экспертиза, а не как скрипт.",
            "Здесь ключевое слово 'реально' — сразу отделяешь себя от дешёвых фрилансеров, которые делают 'красиво, но бесполезно'. Используй, когда клиент говорит, что сайт 'вроде норм есть'.",
            "Вопрос-ловушка: заставляет клиента произнести вслух низкое число или ноль — тогда проблема становится его собственным выводом, а не твоим утверждением. Сильно работает перед переходом к предложению звонка."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie oferuj pełnej strony, gdy klient wyraźnie potrzebuje czegoś węższego albo gdy to nie jest priorytet. Nigdy nie podawaj konkretnej ceny ani nie obiecuj liczby zapytań — zawsze mówisz 'od 500 EUR, zależy od zakresu' i kierujesz do krótkiej konsultacji.",
          "ru": "Не предлагай полный сайт, если клиенту явно нужно что-то более узкое или это сейчас не приоритет. Никогда не называй точную цену и не обещай конкретное число заявок — всегда 'от 500 евро, зависит от объёма' и перевод на короткую консультацию."
        },
        "bullets": {
          "pl": [
            "Klient chce stronę tylko pod jedną kampanię reklamową → to landing page, nie strona firmowa",
            "Klient ma świeżą, dobrze zrobioną stronę, ale mało ruchu → potrzebuje reklamy/SEO, nie nowej strony",
            "Firma jest w bardzo wczesnej fazie i nie ma jeszcze budżetu na start → nie naciskaj, zostaw kontakt na później",
            "Nigdy nie obiecuj konkretnej liczby zapytań ani pozycji w Google — tego strona sama nie gwarantuje"
          ],
          "ru": [
            "Клиенту нужна страница только под одну рекламную кампанию → это лендинг, а не корпоративный сайт",
            "У клиента свежий, качественно сделанный сайт, но мало трафика → нужна реклама/SEO, а не новый сайт",
            "Компания на очень раннем этапе и пока нет бюджета → не дави, оставь контакт на будущее",
            "Никогда не обещай точное число заявок или позиции в Google — сам сайт этого не гарантирует"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mam stronę, zrobił mi ją siostrzeniec 6 lat temu.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Сайт есть, мне его сделал племянник 6 лет назад.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "To osoba, która na pewno nie kupi — ma już stronę",
            "Duża szansa, że strona jest przestarzała i nie działa na telefonach — warto dopytać o zapytania",
            "Trzeba od razu podać cenę, żeby zamknąć temat"
          ],
          "ru": [
            "Это человек, который точно не купит — у него уже есть сайт",
            "Высокий шанс, что сайт устарел и не работает на телефонах — стоит спросить про заявки",
            "Нужно сразу назвать цену, чтобы закрыть тему"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Co NAJLEPIEJ opisuje różnicę między stroną firmową a landing page?",
          "ru": "Что ЛУЧШЕ всего описывает разницу между корпоративным сайтом и лендингом?"
        },
        "answers": {
          "pl": [
            "Strona firmowa jest droższa, więc zawsze lepiej ją proponować",
            "Strona firmowa pokazuje całą ofertę firmy, landing skupia się na jednym celu jednej kampanii",
            "Landing page to po prostu tańsza wersja strony firmowej"
          ],
          "ru": [
            "Корпоративный сайт дороже, поэтому его всегда лучше предлагать",
            "Корпоративный сайт показывает всё предложение компании, лендинг фокусируется на одной цели одной кампании",
            "Лендинг — это просто более дешёвая версия корпоративного сайта"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do warsztatu samochodowego. Właściciel mówi: 'Stronę mamy, wygląda ok, ale reklamę na Facebooku dajemy i mało z tego jest zapytań.' Co robisz?",
          "ru": "Звонишь в автомастерскую. Владелец говорит: 'Сайт есть, вроде норм, но даём рекламу на Facebook и мало заявок с неё.' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Od razu oferujesz nową stronę za 500 EUR",
            "Dopytujesz, czy problem jest w samej stronie (nie konwertuje) czy w kampanii — i w zależności od odpowiedzi kierujesz albo do CRO/copywritingu, albo dalej badasz stronę",
            "Mówisz, że to nie Twój temat i kończysz rozmowę"
          ],
          "ru": [
            "Сразу предлагаешь новый сайт за 500 евро",
            "Уточняешь, проблема в самом сайте (не конвертирует) или в кампании — и в зависимости от ответа ведёшь либо к CRO/копирайтингу, либо продолжаешь разбирать сайт",
            "Говоришь, что это не твоя тема, и заканчиваешь разговор"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient ma stronę i ruch — problem może nie być 'nowa strona', tylko konwersja albo teksty. Dobry sprzedawca diagnozuje zamiast strzelać pierwszą usługą z listy.",
          "ru": "У клиента уже есть сайт и трафик — проблема может быть не в 'новом сайте', а в конверсии или текстах. Хороший продавец диагностирует, а не стреляет первой услугой из списка."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'A skąd mam wiedzieć, że nowa strona faktycznie przyniesie mi więcej klientów, a nie tylko więcej wydanych pieniędzy?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'А откуда мне знать, что новый сайт реально принесёт больше клиентов, а не просто больше потраченных денег?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź: nie obiecuje konkretnej liczby klientów ani gwarancji sprzedaży. Odwołuje się do mechanizmu (strona działająca na telefonie, jasna oferta, czytelny CTA = więcej ludzi kończy proces kontaktu) zamiast magicznych liczb. Proponuje krótką rozmowę/konsultację, na której omówią konkretnie branżę klienta i pokażą przykłady podobnych realizacji. Nie używa słów 'gwarantuję' ani nie podaje fikcyjnych statystyk.",
          "ru": "Хороший ответ: не обещает конкретное число клиентов и не даёт гарантий продаж. Опирается на механику (сайт работает на телефоне, понятное предложение, чёткий CTA = больше людей доходят до контакта), а не на магические цифры. Предлагает короткий звонок/консультацию, где разберут конкретно нишу клиента и покажут похожие примеры. Не использует слово 'гарантирую' и не выдумывает статистику."
        }
      }
    ],
    "objections": [
      {
        "say": "Mam już stronę, po co mi nowa?",
        "ru": "Классическое возражение — клиент считает, что раз сайт технически существует, тема закрыта. Не воспринимает 'наличие сайта' и 'работающий сайт' как разные вещи.",
        "response": "Rozumiem, ale pytanie nie brzmi czy ją Pan ma, tylko czy ona dziś pracuje. Ile zapytań przyszło z niej w tym miesiącu?",
        "responseRu": "Не споришь с фактом (сайт есть), а меняешь критерий оценки — с 'наличия' на 'результат'. Конкретный вопрос про число заявок обычно обнажает проблему без давления.",
        "why": {
          "pl": "Przenosi rozmowę z 'mam/nie mam' na konkretny, mierzalny efekt, który klient sam sobie oceni.",
          "ru": "Переводит разговор с 'есть/нет' на конкретный измеримый результат, который клиент оценит сам."
        }
      },
      {
        "say": "500 euro to dużo, mój sąsiad zrobi mi coś podobnego za 300 złotych w kreatorze.",
        "ru": "Ценовое возражение с сравнением с дешёвой альтернативой (конструктор сайтов, знакомый-фрилансер). Очень частое возражение в польском малом бизнесе.",
        "response": "Może zrobić, tylko pytanie czy ta strona będzie sprzedawać, czy tylko wisieć w internecie. My robimy pod konkretny cel — więcej telefonów i zapytań, nie tylko ładny obrazek. Zapraszam na krótką rozmowę, tam pokażę dokładnie z czego wynika wycena i co Pan za to dostaje.",
        "responseRu": "Не критикуешь соседа напрямую, а меняешь критерий сравнения: 'дёшево' vs 'работает на результат'. Заканчиваешь переводом на консультацию — не спорь о цене по телефону, покажи ценность на звонке.",
        "why": {
          "pl": "Nie porównujesz ceny, tylko efekt — a efekt jest tym, czego klient naprawdę szuka.",
          "ru": "Сравниваешь не цену, а результат — а результат это то, что клиенту на самом деле нужно."
        }
      },
      {
        "say": "Nie mam teraz czasu się tym zajmować, mam za dużo na głowie.",
        "ru": "Возражение про занятость — часто маскирует неуверенность или страх сложного процесса, а не реальную нехватку времени.",
        "response": "To dobra wiadomość, bo cały proces bierzemy na siebie — Pan tylko akceptuje etapy. Analiza, koncepcja, design, wdrożenie, testy — to robimy my. Od Pana potrzebuję góra godziny na start.",
        "responseRu": "Снимаешь главный страх — 'это отнимет у меня время' — конкретизируя, сколько реально времени потребуется от клиента (час), и показывая, что весь процесс на стороне студии.",
        "why": {
          "pl": "Konkretna liczba (godzina) rozbraja abstrakcyjny lęk przed czasochłonnym projektem.",
          "ru": "Конкретное число (час) снимает абстрактный страх перед долгим проектом."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — sprawdzałem Pana stronę pod kątem tego, jak działa na telefonie i czy przynosi zapytania. Mam dwie minuty, powiem co widzę?",
      "ru": "Открывашка работает, потому что показывает конкретную подготовку (проверил сайт), а не общий скрипт 'у нас есть предложение'. Используй, когда у клиента уже точно есть сайт (проверь заранее, если возможно) — если сайта нет вообще, замени 'stronę' на 'obecność w internecie'."
    },
    "crossSell": {
      "pl": "Nowa strona prawie zawsze potrzebuje dobrych tekstów, więc naturalnie dokładaj copywriting — a jeśli klient planuje reklamę, warto od razu wspomnieć o landing page pod konkretną kampanię.",
      "ru": "Новый сайт почти всегда требует хороших текстов, поэтому естественно предлагать копирайтинг в комплекте — а если клиент планирует рекламу, стоит сразу упомянуть лендинг под конкретную кампанию."
    }
  },
  "landing": {
    "title": {
      "pl": "Landing page",
      "ru": "Лендинг"
    },
    "badge": {
      "pl": "Strona pod jedną kampanię",
      "ru": "Страница под одну кампанию"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Jedna strona, jeden konkretny cel: zapytanie, rezerwacja albo sprzedaż jednej rzeczy. W przeciwieństwie do strony firmowej, landing nie opowiada o całej firmie — skupia się na jednej ofercie i prowadzi każdego odwiedzającego do jednej akcji. Budowana jest pod konkretną kampanię reklamową.",
          "ru": "Одна страница, одна конкретная цель: заявка, бронь или продажа одной вещи. В отличие от корпоративного сайта, лендинг не рассказывает про всю компанию — он фокусируется на одном предложении и ведёт каждого посетителя к одному действию. Строится под конкретную рекламную кампанию."
        },
        "bullets": {
          "pl": [
            "Jedna strona, jeden cel — kontakt, rezerwacja lub sprzedaż",
            "Budowana pod konkretną kampanię Google Ads / Meta Ads",
            "Proces: cel → struktura → treść → design → wdrożenie"
          ],
          "ru": [
            "Одна страница, одна цель — контакт, бронь или продажа",
            "Строится под конкретную кампанию Google Ads / Meta Ads",
            "Процесс: цель → структура → текст → дизайн → запуск"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, które już płacą za reklamę albo dopiero ją planują — Google Ads, Meta Ads. Też firmy z jedną promocją, sezonową ofertą albo nowym produktem, który chcą przetestować bez przebudowy całej strony.",
          "ru": "Компании, которые уже платят за рекламу или только планируют её запустить — Google Ads, Meta Ads. А также компании с одной акцией, сезонным предложением или новым продуктом, который хотят протестировать без переделки всего сайта."
        },
        "bullets": {
          "pl": [
            "Firmy prowadzące lub planujące kampanie reklamowe",
            "Promocje, oferty sezonowe, testy nowego produktu",
            "Firmy z jedną usługą, którą chcą mocno wypromować"
          ],
          "ru": [
            "Компании, ведущие или планирующие рекламные кампании",
            "Акции, сезонные предложения, тесты нового продукта",
            "Компании с одной услугой, которую хотят сильно продвинуть"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, gdy reklama kosztuje, generuje kliknięcia, ale prowadzi na stronę główną, gdzie klient się gubi między dziesięcioma zakładkami i wychodzi. Rozpoznajesz to pytaniem: 'Dokąd prowadzi Pana reklama — na stronę główną czy na osobną stronę pod tę ofertę?' Jeśli słyszysz 'na stronę główną', to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда реклама стоит денег, генерирует клики, но ведёт на главную страницу, где клиент теряется между десятью вкладками и уходит. Распознаётся вопросом: 'Куда ведёт ваша реклама — на главную или на отдельную страницу под это предложение?' Если слышишь 'на главную' — это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Reklama prowadzi na stronę główną zamiast na dedykowaną stronę",
            "Klient płaci za kliknięcia, ale mało z nich zamienia się w zapytania",
            "Klient mówi 'reklama drogo kosztuje, a telefon nie dzwoni'"
          ],
          "ru": [
            "Реклама ведёт на главную страницу вместо специальной страницы",
            "Клиент платит за клики, но мало кто из них становится заявкой",
            "Клиент говорит: 'реклама дорогая, а телефон не звонит'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Jeśli reklama prowadzi na stronę główną, to Pan płaci za kliknięcia, które się gubią — landing page skupia całą uwagę na jednej ofercie i jednym przycisku.",
            "To nie jest cała nowa strona, tylko jedna, konkretna pod tę kampanię — dlatego robi się szybciej i taniej niż pełna strona firmowa.",
            "Zanim wyda Pan kolejną złotówkę na reklamę, warto sprawdzić czy strona, na którą ona prowadzi, w ogóle daje ludziom szansę zostawić kontakt."
          ],
          "ru": [
            "Показывает конкретную техническую причину потери денег — реклама ведёт на 'слишком большую' страницу. Используй сразу после того, как узнал, куда ведёт реклама клиента.",
            "Снимает возражение 'это же ещё один дорогой сайт' — подчёркиваешь, что лендинг меньше и дешевле полного сайта, это апгрейд, а не замена.",
            "Создаёт срочность через уже потраченные деньги на рекламу — подчёркиваешь, что дальнейшие траты без лендинга это слив бюджета."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Landing page ma sens tylko, gdy jest albo będzie ruch, który na niego trafi. Nie sprzedawaj go w oderwaniu od reklamy i nie podawaj konkretnych obietnic co do liczby konwersji — zawsze 'wyższy procent zapytań z tego samego ruchu', bez twardych liczb.",
          "ru": "Лендинг имеет смысл, только если есть или будет трафик, который на него попадёт. Не продавай его в отрыве от рекламы и не давай конкретных обещаний по числу конверсий — всегда 'более высокий процент заявок с того же трафика', без жёстких цифр."
        },
        "bullets": {
          "pl": [
            "Klient nie ma i nie planuje żadnej płatnej reklamy ani innego źródła ruchu → landing będzie stał pusty, zaproponuj najpierw stronę firmową lub reklamę",
            "Klient chce zaprezentować całą, szeroką ofertę firmy → to zadanie strony firmowej, nie landingu",
            "Nigdy nie obiecuj konkretnego procenta wzrostu konwersji ani liczby leadów"
          ],
          "ru": [
            "У клиента нет и не планируется платной рекламы или другого источника трафика → лендинг будет пустовать, предложи сначала сайт или рекламу",
            "Клиент хочет показать всё широкое предложение компании → это задача корпоративного сайта, а не лендинга",
            "Никогда не обещай конкретный процент роста конверсии или число лидов"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Płacę za reklamę na Google, ale ludzie po prostu wchodzą na naszą stronę główną i znikają.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Плачу за рекламу в Google, но люди просто заходят на нашу главную страницу и исчезают.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Reklama jest źle skonfigurowana i trzeba ją wyłączyć",
            "Klasyczny sygnał do landing page — reklama i strona docelowa są rozjechane",
            "Klient nie potrzebuje żadnej usługi, po prostu ma pecha"
          ],
          "ru": [
            "Реклама плохо настроена, её нужно отключить",
            "Классический сигнал для лендинга — реклама и посадочная страница не согласованы",
            "Клиенту не нужна никакая услуга, ему просто не везёт"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego landing page zwykle kosztuje mniej niż pełna strona firmowa?",
          "ru": "Почему лендинг обычно стоит дешевле полноценного корпоративного сайта?"
        },
        "answers": {
          "pl": [
            "Bo jest robiony niedbale i szybciej",
            "Bo to jedna strona z jednym celem, a nie cały komplet podstron jak strona firmowa",
            "Bo nie zawiera żadnego designu"
          ],
          "ru": [
            "Потому что делается небрежно и быстро",
            "Потому что это одна страница с одной целью, а не целый комплект как корпоративный сайт",
            "Потому что там вообще нет дизайна"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Salon kosmetyczny chce zacząć reklamować nowy zabieg. Nie mają jeszcze żadnej reklamy, mają za to skromną, ale w miarę aktualną stronę firmową. Pytają o landing page. Co robisz?",
          "ru": "Косметологический салон хочет начать рекламировать новую процедуру. Рекламы у них ещё нет, но есть скромный, но актуальный сайт. Спрашивают про лендинг. Что делаешь?"
        },
        "answers": {
          "pl": [
            "Odmawiasz, bo landing bez reklamy nie ma sensu",
            "Potwierdzasz sens — landing pod ten konkretny zabieg plus od razu proponujesz kampanię reklamową (Meta Ads), która skieruje na niego ruch",
            "Mówisz, że wystarczy im istniejąca strona firmowa"
          ],
          "ru": [
            "Отказываешь, потому что лендинг без рекламы бессмысленен",
            "Подтверждаешь смысл — лендинг под конкретную процедуру плюс сразу предлагаешь рекламную кампанию (Meta Ads), которая приведёт на него трафик",
            "Говоришь, что им хватит существующего сайта"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Landing ma sens, ale tylko razem z ruchem. Dobry sprzedawca od razu domyka pakiet: landing + kampania, żeby strona nie stała pusta.",
          "ru": "Лендинг имеет смысл, но только вместе с трафиком. Хороший продавец сразу закрывает пакет: лендинг + кампания, чтобы страница не пустовала."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Mam już stronę firmową, po co mi jeszcze jedna strona pod reklamę?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'У меня уже есть корпоративный сайт, зачем мне ещё одна страница под рекламу?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź tłumaczy różnicę funkcji: strona firmowa pokazuje całą firmę i rozprasza uwagę, landing prowadzi jedną osobę z reklamy do jednej konkretnej akcji bez rozpraszaczy (menu, inne podstrony). Podaje analogię (np. sklep z jedną półką kontra cały market). Nie obiecuje konkretnego wzrostu konwersji, kończy propozycją krótkiej rozmowy o konkretnej kampanii klienta.",
          "ru": "Хороший ответ объясняет разницу функций: корпоративный сайт показывает всю компанию и рассеивает внимание, лендинг ведёт одного человека из рекламы к одному конкретному действию без отвлекающих элементов (меню, другие страницы). Даёт аналогию (например, один прилавок против целого магазина). Не обещает конкретный рост конверсии, завершает предложением короткого разговора о конкретной кампании клиента."
        }
      }
    ],
    "objections": [
      {
        "say": "Mam już stronę, niech reklama prowadzi tam.",
        "ru": "Клиент не понимает разницы между 'иметь сайт' и 'иметь страницу под конкретную рекламную цель' — самое частое возражение для этой услуги.",
        "response": "Może prowadzić, tylko wtedy klient z reklamy trafia na stronę główną z dziesięcioma zakładkami i się gubi. Landing to jedna strona, jeden przycisk, zero rozpraszaczy — dlatego konwertuje wyraźnie lepiej.",
        "responseRu": "Не отвергаешь идею клиента, а показываешь конкретный механизм потери (десять вкладок = потерянное внимание) и контрастируешь с простотой лендинга.",
        "why": {
          "pl": "Konkret ('dziesięć zakładek') jest bardziej przekonujący niż ogólne 'landing jest lepszy'.",
          "ru": "Конкретика ('десять вкладок') убедительнее общей фразы 'лендинг лучше'."
        }
      },
      {
        "say": "Zobaczmy najpierw jak pójdzie reklama, a stroną się zajmiemy później.",
        "ru": "Возражение по последовательности — клиент хочет сначала протестировать рекламу 'как есть', откладывая лендинг на потом. Реально это означает слив бюджета на этапе теста.",
        "response": "Rozumiem, tylko wtedy testuje Pan reklamę na stronie, która nie jest do tego przystosowana — i wynik testu będzie fałszywy, bo winna będzie strona, nie kampania. Warto zrobić to w dobrej kolejności: najpierw landing, potem test reklamy da prawdziwy obraz.",
        "responseRu": "Переворачиваешь логику клиента: без лендинга сам тест рекламы становится недостоверным, потому что нельзя понять, реклама плохая или посадочная страница. Это сильный аргумент для клиентов, которые ценят данные.",
        "why": {
          "pl": "Pokazuje, że kolejność klienta psuje jego własny test, a nie tylko 'jest gorsza opcja'.",
          "ru": "Показывает, что порядок действий клиента портит его собственный тест, а не просто 'хуже вариант'."
        }
      },
      {
        "say": "300 euro za jedną stronę? Przecież to tylko jedna podstrona.",
        "ru": "Ценовое возражение с обесцениванием — клиент сравнивает лендинг с 'одной страницей' полного сайта, не учитывая, что вся работа (тексты, дизайн, конверсия) сконцентрирована именно там.",
        "response": "To prawda, że to jedna strona, ale cała robota — teksty, struktura, design, testy — jest skoncentrowana właśnie na tym, żeby ta jedna strona konwertowała najlepiej jak się da. To nie jest podstrona 'przy okazji', to jest główne narzędzie sprzedażowe kampanii.",
        "responseRu": "Меняешь рамку с 'количество страниц' на 'концентрация работы' — объясняешь, что вся ценность именно в том, что вся энергия и экспертиза вложены в одну страницу, а не размазаны.",
        "why": {
          "pl": "Przekierowuje ocenę wartości z liczby stron na jakość i cel tej jednej strony.",
          "ru": "Переносит оценку ценности с количества страниц на качество и цель этой одной страницы."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants. Widziałem, że Państwo reklamują się w sieci — chciałem zapytać, dokąd trafia ta reklama po kliknięciu?",
      "ru": "Открывашка сразу выявляет, есть ли у клиента проблема — если реклама ведёт на общую страницу сайта, это готовый повод для лендинга. Используй, когда точно знаешь, что клиент запускает или планирует рекламу."
    },
    "crossSell": {
      "pl": "Landing page bez ruchu jest bezużyteczny, więc naturalnie sprzedaje się razem z Google Ads albo Meta Ads — a po miesiącu działania warto dołożyć CRO, żeby wycisnąć z niego jeszcze więcej.",
      "ru": "Лендинг без трафика бесполезен, поэтому естественно продаётся вместе с Google Ads или Meta Ads — а через месяц работы стоит добавить CRO, чтобы выжать из него ещё больше результата."
    }
  },
  "ecommerce": {
    "title": {
      "pl": "Sklepy internetowe",
      "ru": "Интернет-магазины"
    },
    "badge": {
      "pl": "Własny kanał sprzedaży",
      "ru": "Свой канал продаж"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Pełny sklep internetowy: katalog produktów, koszyk, płatności online, obsługa dostawy i panel do zarządzania zamówieniami. To nie jest strona z opisem produktów — to działający kanał sprzedaży, przez który klient realnie kupuje i płaci, bez telefonów i wiadomości na Messengerze.",
          "ru": "Полноценный интернет-магазин: каталог товаров, корзина, онлайн-оплата, обработка доставки и панель для управления заказами. Это не страница с описанием товаров — это работающий канал продаж, через который клиент реально покупает и платит, без звонков и переписки в мессенджере."
        },
        "bullets": {
          "pl": [
            "Katalog, koszyk, płatności, dostawa i panel zamówień",
            "Cena zawsze indywidualna — zależy od liczby produktów i integracji",
            "Proces: analiza → architektura → design → wdrożenie → integracje"
          ],
          "ru": [
            "Каталог, корзина, оплата, доставка и панель заказов",
            "Цена всегда индивидуальна — зависит от количества товаров и интеграций",
            "Процесс: анализ → архитектура → дизайн → разработка → интеграции"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Marki z fizycznym lub cyfrowym produktem, lokalne sklepy, które dziś sprzedają tylko stacjonarnie albo przez Instagram/Allegro, oraz firmy B2B sprzedające hurtowo. Wspólny mianownik: mają co sprzedawać, ale nie mają własnego, kontrolowanego kanału sprzedaży online.",
          "ru": "Бренды с физическим или цифровым товаром, локальные магазины, которые сегодня продают только офлайн или через Instagram/Allegro, и B2B-компании с оптовыми продажами. Общий знаменатель: у них есть что продавать, но нет собственного, контролируемого канала продаж онлайн."
        },
        "bullets": {
          "pl": [
            "Marki produktowe i lokalne sklepy stacjonarne",
            "Sprzedawcy działający dziś przez Allegro, Instagram lub OLX",
            "Firmy B2B sprzedające hurtowo, potrzebujące porządku w zamówieniach"
          ],
          "ru": [
            "Товарные бренды и локальные офлайн-магазины",
            "Продавцы, работающие сегодня через Allegro, Instagram или OLX",
            "B2B-компании с оптовыми продажами, которым нужен порядок в заказах"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje zależność od platform, które biorą prowizję i nie dają dostępu do bazy klientów (Allegro, marketplace) albo od sprzedaży 'na wiadomości' przez Instagram, gdzie każde zamówienie to ręczna praca. Rozpoznajesz to pytaniem: 'Gdzie dziś klienci u Pana kupują — macie własny sklep online, czy sprzedaż idzie przez Allegro albo wiadomości?'",
          "ru": "Решает проблему зависимости от платформ, которые берут комиссию и не дают доступа к базе клиентов (Allegro, маркетплейсы), либо продаж 'в директ' через Instagram, где каждый заказ — ручная работа. Распознаётся вопросом: 'Где сегодня клиенты у вас покупают — есть свой интернет-магазин, или продажи идут через Allegro или сообщения?'"
        },
        "bullets": {
          "pl": [
            "Sprzedaż tylko stacjonarna albo przez marketplace z prowizją",
            "Zamówienia przyjmowane ręcznie przez Instagram/Messenger/telefon",
            "Klient mówi 'Allegro zjada mi marżę' albo 'nie mam bazy własnych klientów'"
          ],
          "ru": [
            "Продажи только офлайн или через маркетплейс с комиссией",
            "Заказы принимаются вручную через Instagram/Messenger/телефон",
            "Клиент говорит: 'Allegro съедает мою маржу' или 'у меня нет своей базы клиентов'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Ile dziś oddaje Pan prowizji Allegro albo innym platformom od każdej sprzedaży? Własny sklep to koszt jednorazowy, a nie procent od każdej transakcji do końca świata.",
            "Sprzedaż przez wiadomości działa, dopóki zamówień jest mało — przy większej skali to zaczyna zjadać czas, a klienci czekają na odpowiedź i część po prostu rezygnuje.",
            "Własny sklep to też własna baza klientów — może Pan do nich wracać z ofertą, czego na marketplace zwyczajnie nie może Pan zrobić."
          ],
          "ru": [
            "Бьёт по конкретной боли — комиссии маркетплейсов, которые клиент платит с каждой продажи бессрочно. Используй, когда клиент упоминает Allegro/OLX как основной канал.",
            "Показывает скрытую цену 'бесплатной' продажи через переписку — потерянное время и упущенные заказы. Используй для небольших продавцов, у которых заказы идут через Instagram/Messenger.",
            "Раскрывает стратегическую ценность собственной базы клиентов — на маркетплейсе владелец не видит и не может писать своим покупателям повторно."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Sklep internetowy to poważna inwestycja — nie oferuj go firmom usługowym bez fizycznego lub cyfrowego produktu do sprzedania, ani firmom testującym dopiero pomysł na niskim wolumenie. Cena jest zawsze indywidualna — nigdy nie zgaduj kwoty na telefonie, zawsze mów 'to zależy od liczby produktów i integracji, dokładnie policzymy to na rozmowie'.",
          "ru": "Интернет-магазин — серьёзная инвестиция — не предлагай его сервисным компаниям без физического или цифрового товара, а также компаниям, только тестирующим идею при низком объёме. Цена всегда индивидуальна — никогда не называй сумму на звонке, всегда говори 'зависит от количества товаров и интеграций, точно посчитаем на консультации'."
        },
        "bullets": {
          "pl": [
            "Klient sprzedaje usługi, nie produkty → to raczej strona firmowa albo system rezerwacji",
            "Klient dopiero testuje pomysł z bardzo małą liczbą produktów i minimalnym budżetem → zaproponuj mniejszy start, np. landing z formularzem zamówienia",
            "Nigdy nie podawaj konkretnej ceny sklepu na telefonie — zawsze kieruj do konsultacji"
          ],
          "ru": [
            "Клиент продаёт услуги, а не товары → скорее подойдёт сайт-визитка или система бронирования",
            "Клиент только тестирует идею с очень малым числом товаров и минимальным бюджетом → предложи меньший старт, например лендинг с формой заказа",
            "Никогда не называй конкретную цену магазина по телефону — всегда переводи на консультацию"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Sprzedaję przez Allegro, jest ok, chociaż prowizje bolą.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Продаю через Allegro, всё ок, хотя комиссии бесят.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient jest zadowolony i nie warto go niepokoić",
            "Klient ma realny wolumen sprzedaży, ale traci marżę i bazę klientów — dobry kandydat na własny sklep",
            "Trzeba mu od razu zaproponować kampanię Google Ads"
          ],
          "ru": [
            "Клиент доволен, и не стоит его беспокоить",
            "У клиента реальный объём продаж, но он теряет маржу и базу клиентов — хороший кандидат на свой магазин",
            "Нужно сразу предложить ему кампанию Google Ads"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego cena sklepu internetowego jest zawsze 'indywidualnie', a nie stała kwota jak przy landing page?",
          "ru": "Почему цена интернет-магазина всегда 'индивидуально', а не фиксированная сумма как у лендинга?"
        },
        "answers": {
          "pl": [
            "Bo studio celowo ukrywa cenę, żeby zarobić więcej",
            "Bo zakres mocno się różni: liczba produktów, płatności, logistyka i integracje są za każdym razem inne",
            "Bo sklepy internetowe zawsze kosztują tyle samo, niezależnie od zakresu"
          ],
          "ru": [
            "Потому что студия специально скрывает цену, чтобы заработать больше",
            "Потому что объём сильно варьируется: количество товаров, платежи, логистика и интеграции каждый раз разные",
            "Потому что интернет-магазины всегда стоят одинаково, независимо от объёма"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do właścicielki małej marki biżuterii. Ma 15 produktów, sprzedaje przez Instagram i czasem na targach. Pyta: 'Ile będzie kosztował sklep?' Co robisz?",
          "ru": "Звонишь владелице небольшого бренда украшений. У неё 15 товаров, продаёт через Instagram и иногда на ярмарках. Спрашивает: 'Сколько будет стоить магазин?' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Podajesz konkretną kwotę z głowy, żeby nie stracić klientki",
            "Mówisz orientacyjnie o czynnikach cenowych (liczba produktów, płatności, integracje) i umawiasz krótką rozmowę, na której dostanie dokładną wycenę",
            "Mówisz, że przy tak małej liczbie produktów sklep jej się nie opłaca i kończysz rozmowę"
          ],
          "ru": [
            "Называешь конкретную сумму 'от головы', чтобы не потерять клиентку",
            "Ориентировочно называешь факторы цены (число товаров, платежи, интеграции) и назначаешь короткий звонок для точной оценки",
            "Говоришь, что при таком малом числе товаров магазин ей невыгоден, и заканчиваешь разговор"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Cena jest zawsze indywidualna — nigdy nie zgadujesz kwoty. 15 produktów to zupełnie realny start na własny sklep, więc nie odrzucasz klientki, tylko kierujesz ją do konkretnej wyceny.",
          "ru": "Цена всегда индивидуальна — никогда не угадывай сумму. 15 товаров — вполне реальный старт для своего магазина, поэтому не отказываешь клиентке, а ведёшь её к точной оценке."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Boję się, że nie ogarnę sam zamówień, wysyłek i całej logistyki, teraz robię to na czuja przez Messengera.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Боюсь, что сам не справлюсь с заказами, доставкой и всей логистикой, сейчас делаю это на глаз через Messenger.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź uspokaja, ale konkretnie: tłumaczy, że sklep zawiera panel do zarządzania zamówieniami, który właśnie porządkuje to, co dziś jest chaosem w Messengerze — zamówienia, statusy, powiadomienia w jednym miejscu. Nie obiecuje, że 'wszystko będzie super', tylko opisuje mechanizm. Może zaproponować krótką rozmowę, na której omówią realny proces logistyczny klienta.",
          "ru": "Хороший ответ успокаивает, но конкретно: объясняет, что магазин включает панель управления заказами, которая как раз наводит порядок в том, что сегодня творится хаосом в Messenger — заказы, статусы, уведомления в одном месте. Не обещает 'всё будет супер', а описывает механизм. Может предложить короткий звонок, чтобы разобрать реальный логистический процесс клиента."
        }
      }
    ],
    "objections": [
      {
        "say": "Sprzedaję przez Instagram i Allegro, mi to wystarcza.",
        "ru": "Клиент не видит проблемы, потому что продажи идут — не осознаёт скрытую стоимость (комиссии, потерянное время, чужая база клиентов).",
        "response": "Rozumiem, skoro sprzedaż idzie, to dobrze. Pytanie tylko, ile Pan oddaje z każdej sprzedaży w prowizji i czy ma Pan dostęp do bazy tych klientów, żeby wrócić do nich z nową ofertą? Bo na Allegro tego dostępu Pan nie ma.",
        "responseRu": "Не отрицаешь, что текущий канал работает, а вскрываешь скрытую стоимость — комиссию и отсутствие контроля над базой клиентов, которую клиент обычно не считал проблемой.",
        "why": {
          "pl": "Pokazuje ukryty koszt, którego klient nie liczy jako koszt — prowizję i brak dostępu do własnych klientów.",
          "ru": "Показывает скрытую стоимость, которую клиент не считает расходом, — комиссию и отсутствие доступа к собственным клиентам."
        }
      },
      {
        "say": "Ile to będzie kosztować, bo słyszałem że sklepy internetowe to koszmarne pieniądze.",
        "ru": "Ценовое возражение, основанное на слухах/стереотипе о дорогих интернет-магазинах — часто завышенное ожидание, которое нужно мягко скорректировать.",
        "response": "Cena naprawdę zależy od zakresu — liczby produktów, płatności, dostawy, integracji — dlatego nie rzucam liczbą z sufitu. Na krótkiej rozmowie dopytamy o Pana konkretną sytuację i dostanie Pan realną wycenę, nie orientacyjną.",
        "responseRu": "Не подтверждает и не опровергает стереотип напрямую, а объясняет, почему цена вариативна, и переводит на консультацию — дисциплина 'никогда не гадать цену' особенно важна для этой услуги.",
        "why": {
          "pl": "Uczciwie tłumaczy zmienność ceny, zamiast walczyć ze stereotypem gołymi słowami.",
          "ru": "Честно объясняет вариативность цены, вместо того чтобы бороться со стереотипом голыми словами."
        }
      },
      {
        "say": "Za mało mam produktów, żeby to miało sens.",
        "ru": "Клиент сам себя дисквалифицирует, часто ошибочно — считает, что магазин нужен только при большом ассортименте.",
        "response": "Wiele udanych sklepów startuje z kilkunastoma produktami — liczy się nie ilość na start, tylko czy ma Pan stały popyt. Jeśli sprzedaje Pan regularnie, nawet 10-15 produktów w porządnie zrobionym sklepie potrafi zarabiać więcej niż to samo na marketplace.",
        "responseRu": "Разрушает ложное убеждение клиента (нужно много товаров), заменяя критерий 'количество' на 'стабильный спрос' — более точный показатель готовности к своему магазину.",
        "why": {
          "pl": "Podważa błędne założenie klienta konkretnym, wiarygodnym argumentem liczbowym.",
          "ru": "Опровергает ошибочное предположение клиента конкретным, убедительным числовым аргументом."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants. Widziałem Pana produkty w internecie — sprzedaje Pan dziś głównie przez Allegro czy ma Pan już własny sklep?",
      "ru": "Открывашка сразу диагностирует канал продаж клиента и открывает тему зависимости от маркетплейсов. Используй, когда видел товары клиента на Allegro/Instagram, но не нашёл собственного магазина."
    },
    "crossSell": {
      "pl": "Sklep bez ruchu się nie sprzeda, więc naturalnie łączy się z Meta Ads lub TikTok Ads pod produkty, a automatyczne wiadomości (potwierdzenia zamówień, przypomnienia) domykają całość i redukują pracę ręczną.",
      "ru": "Магазин без трафика не будет продавать, поэтому естественно сочетается с Meta Ads или TikTok Ads под товары, а автоматические сообщения (подтверждения заказов, напоминания) завершают картину и снижают ручную работу."
    }
  },
  "copywriting": {
    "title": {
      "pl": "Copywriting",
      "ru": "Копирайтинг"
    },
    "badge": {
      "pl": "Teksty, które sprzedają",
      "ru": "Тексты, которые продают"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Pisanie treści na stronę: nagłówki, opis oferty, opisy usług i wezwania do działania (CTA). To nie jest 'ładne słowa' — to teksty napisane tak, żeby czytelnik zrozumiał ofertę w 5 sekund i wiedział, co ma zrobić dalej. Bazuje na briefie, researchu branży i kilku rundach poprawek.",
          "ru": "Написание контента для сайта: заголовки, описание предложения, описания услуг и призывы к действию (CTA). Это не 'красивые слова' — это тексты, написанные так, чтобы читатель понял предложение за 5 секунд и знал, что делать дальше. Основано на брифе, исследовании ниши и нескольких раундах правок."
        },
        "bullets": {
          "pl": [
            "Nagłówki, oferta, opisy usług i CTA",
            "Proces: brief → research → draft → poprawki → final",
            "Cena zależy od liczby podstron, researchu i branży"
          ],
          "ru": [
            "Заголовки, предложение, описания услуг и CTA",
            "Процесс: бриф → исследование → черновик → правки → финал",
            "Цена зависит от количества страниц, исследования и ниши"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Praktycznie każda firma z istniejącą stroną, na której teksty są słabe, generyczne albo pisane 'na szybko' przez właściciela. Też firmy zamawiające nową stronę lub landing — dobry design bez dobrych tekstów traci połowę siły.",
          "ru": "Практически любая компания с существующим сайтом, где тексты слабые, шаблонные или написаны 'на скорую руку' самим владельцем. А также компании, заказывающие новый сайт или лендинг — хороший дизайн без хороших текстов теряет половину силы."
        },
        "bullets": {
          "pl": [
            "Firmy z istniejącą stroną, ale słabymi, generycznymi tekstami",
            "Firmy zamawiające nową stronę lub landing page — jako dopełnienie",
            "Firmy wchodzące na nowy rynek lub do nowej grupy klientów"
          ],
          "ru": [
            "Компании с существующим сайтом, но слабыми, шаблонными текстами",
            "Компании, заказывающие новый сайт или лендинг — как дополнение",
            "Компании, выходящие на новый рынок или к новой аудитории"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, gdy strona technicznie działa i ma ruch, ale teksty nie przekonują — są ogólnikowe, nudne albo skopiowane od konkurencji. Rozpoznajesz to, gdy klient mówi 'mamy ruch, ale mało zapytań' i po zajrzeniu na stronę widzisz teksty typu 'jesteśmy najlepsi, oferujemy kompleksowe usługi' bez konkretów.",
          "ru": "Решает ситуацию, когда сайт технически работает и имеет трафик, но тексты не убеждают — они общие, скучные или скопированы у конкурентов. Распознаётся, когда клиент говорит 'трафик есть, а заявок мало', а на сайте видны тексты вроде 'мы лучшие, предлагаем комплексные услуги' без конкретики."
        },
        "bullets": {
          "pl": [
            "Strona ma ruch, ale mało zapytań — teksty nie przekonują",
            "Teksty ogólnikowe: 'kompleksowe usługi', 'indywidualne podejście', bez konkretów",
            "Klient sam pisał teksty 'na szybko' albo skopiował je od kogoś"
          ],
          "ru": [
            "На сайте есть трафик, но мало заявок — тексты не убеждают",
            "Общие фразы: 'комплексные услуги', 'индивидуальный подход', без конкретики",
            "Клиент сам писал тексты 'на скорую руку' или скопировал у кого-то"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Design przyciąga wzrok, ale to teksty decydują, czy ktoś zostawi kontakt — u Pana na stronie widzę sporo ogólników typu 'kompleksowe usługi', a to nie przekonuje nikogo.",
            "Nie chodzi o to, żeby ładnie pisać, tylko żeby czytelnik w 5 sekund zrozumiał, co Pan robi i dlaczego ma wybrać właśnie Pana, a nie konkurencję obok.",
            "Zaczynamy od briefu i researchu Pana branży — to nie są teksty 'z głowy', tylko dopasowane do tego, jak faktycznie mówią i szukają Pana klienci."
          ],
          "ru": [
            "Показывает конкретный технический недостаток текста клиента (общие фразы) — используй только если реально просмотрел сайт и нашёл такие формулировки.",
            "Объясняет суть услуги простыми словами — конверсия, а не 'красота слов'. Хорошо работает как ответ на скепсис 'зачем платить за текст'.",
            "Показывает, что процесс методичный (бриф + исследование), а не 'фрилансер напишет что-то за вечер' — снимает опасение по качеству."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Copywriting samodzielnie ma sens tylko wtedy, gdy jest gdzie te teksty umieścić. Nie sprzedawaj samego copywritingu firmie bez żadnej strony — najpierw potrzebują strony lub landingu, a teksty dodajesz jako element pakietu.",
          "ru": "Копирайтинг отдельно имеет смысл, только если есть куда эти тексты разместить. Не продавай копирайтинг сам по себе компании без сайта — сначала им нужен сайт или лендинг, а тексты добавляй как часть пакета."
        },
        "bullets": {
          "pl": [
            "Klient nie ma żadnej strony ani landingu → zaproponuj najpierw stronę/landing z copywritingiem w pakiecie",
            "Główny problem klienta jest techniczny (formularz nie działa, strona się nie ładuje) → to CRO albo poprawka techniczna, nie copywriting",
            "Nigdy nie obiecuj konkretnego wzrostu konwersji z samej zmiany tekstów"
          ],
          "ru": [
            "У клиента нет ни сайта, ни лендинга → предложи сначала сайт/лендинг с копирайтингом в пакете",
            "Основная проблема клиента техническая (форма не работает, сайт не грузится) → это CRO или техническая правка, а не копирайтинг",
            "Никогда не обещай конкретный рост конверсии только от смены текстов"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Tekst na stronę sam napisałem, chyba jest ok.' Po zajrzeniu widzisz tylko 'oferujemy profesjonalne usługi na najwyższym poziomie'. Co robisz?",
          "ru": "Клиент говорит: 'Текст на сайт я сам написал, вроде норм.' Заглянув, видишь только 'предлагаем профессиональные услуги высшего уровня'. Что делаешь?"
        },
        "answers": {
          "pl": [
            "Nic nie mówisz, bo to nie Twoja sprawa",
            "Delikatnie wskazujesz, że tekst nie mówi nic konkretnego o tym, co klient faktycznie robi i dla kogo — to konkretny sygnał do copywritingu",
            "Od razu mówisz, że tekst jest fatalny i klient się nie zna"
          ],
          "ru": [
            "Ничего не говоришь, это не твоё дело",
            "Мягко указываешь, что текст не говорит ничего конкретного о том, чем клиент реально занимается и для кого — это конкретный сигнал к копирайтингу",
            "Сразу говоришь, что текст ужасен и клиент в этом не разбирается"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Kiedy NAJLEPIEJ sprzedawać copywriting jako osobną usługę (a nie w pakiecie z nową stroną)?",
          "ru": "Когда ЛУЧШЕ всего продавать копирайтинг как отдельную услугу (а не в пакете с новым сайтом)?"
        },
        "answers": {
          "pl": [
            "Nigdy, zawsze musi być razem z nową stroną",
            "Gdy klient ma już działającą stronę z ruchem, ale słabe, nieprzekonujące teksty",
            "Gdy klient w ogóle nie ma jeszcze żadnej strony"
          ],
          "ru": [
            "Никогда, всегда только вместе с новым сайтом",
            "Когда у клиента уже есть работающий сайт с трафиком, но слабые, неубедительные тексты",
            "Когда у клиента вообще ещё нет никакого сайта"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Rozmawiasz z właścicielem kancelarii prawnej. Strona jest nowa (robił ją inny wykonawca miesiąc temu), ale teksty brzmią jak wyciągnięte z Wikipedii — sucho i bezosobowo. Klient pyta czy to w ogóle ma znaczenie. Co odpowiadasz?",
          "ru": "Разговариваешь с владельцем юридической конторы. Сайт новый (делал другой подрядчик месяц назад), но тексты звучат как из Википедии — сухо и безлично. Клиент спрашивает, имеет ли это вообще значение. Что отвечаешь?"
        },
        "answers": {
          "pl": [
            "Mówisz, że skoro strona jest nowa, to na pewno teksty też są dobre",
            "Tak, ma znaczenie — tłumaczysz, że klient szuka prawnika, któremu zaufa, a suchy, bezosobowy tekst nie buduje zaufania tak jak konkretne, ludzkie zdania o tym jak faktycznie pomagacie klientom",
            "Mówisz, że teksty nie mają znaczenia, liczy się tylko design"
          ],
          "ru": [
            "Говоришь, что раз сайт новый, то и тексты наверняка хорошие",
            "Да, имеет значение — объясняешь, что клиент ищет юриста, которому доверится, а сухой безличный текст не строит доверие так, как конкретные, человечные фразы о том, как вы реально помогаете клиентам",
            "Говоришь, что тексты не имеют значения, важен только дизайн"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Nowość strony nie gwarantuje dobrych tekstów — to osobna kompetencja. W branżach opartych na zaufaniu (prawo, medycyna) ton tekstu ma szczególne znaczenie.",
          "ru": "Новизна сайта не гарантирует хорошие тексты — это отдельная компетенция. В нишах на доверии (право, медицина) тон текста имеет особое значение."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Nie wiem czy zmiana kilku zdań na stronie naprawdę coś zmieni, to chyba drobnostka.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Не знаю, изменит ли что-то смена пары фраз на сайте, это вроде мелочь.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź nie obiecuje magicznego wzrostu sprzedaży z 'kilku zdań'. Tłumaczy, że nagłówek i pierwsze zdania to często jedyne, co odwiedzający w ogóle czyta zanim zdecyduje zostać lub wyjść — więc to nie jest drobnostka, tylko najważniejsze kilka sekund kontaktu z marką. Może zaproponować pokazanie przykładu 'przed/po' na rozmowie. Nie używa gwarancji liczbowych.",
          "ru": "Хороший ответ не обещает волшебный рост продаж от 'пары фраз'. Объясняет, что заголовок и первые предложения часто единственное, что посетитель вообще читает, прежде чем решить остаться или уйти — значит, это не мелочь, а самые важные секунды контакта с брендом. Может предложить показать пример 'до/после' на звонке. Не использует числовые гарантии."
        }
      }
    ],
    "objections": [
      {
        "say": "Sam napiszę albo niech napisze mi pracownik, po co płacić za teksty?",
        "ru": "Клиент недооценивает копирайтинг как ремесло — считает, что писать тексты может любой сотрудник, владеющий языком.",
        "response": "Może i pracownik zna język świetnie, tylko pytanie czy zna psychologię sprzedaży i wie, jak pisać, żeby ktoś obcy, kto nic o Panu nie wie, w 5 sekund zrozumiał ofertę i chciał zadzwonić. To zupełnie inna umiejętność niż pisanie po polsku bez błędów.",
        "responseRu": "Разграничивает знание языка и умение писать продающие тексты — показывает, что это профессиональный навык, а не просто грамотность.",
        "why": {
          "pl": "Odróżnia 'umieć pisać po polsku' od 'umieć pisać tak, żeby sprzedawać' — to dwie różne rzeczy.",
          "ru": "Разделяет 'уметь писать по-польски' и 'уметь писать так, чтобы продавать' — это два разных навыка."
        }
      },
      {
        "say": "150 euro za teksty? To chyba trochę dużo jak na kilka zdań.",
        "ru": "Ценовое возражение с недооценкой объёма работы — клиент видит финальный текст (несколько предложений), но не видит процесс (бриф, исследование, черновики, правки).",
        "response": "To nie jest 'kilka zdań na szybko', tylko cały proces: brief, research Pana branży, draft, poprawki i finalna wersja. Cena zależy od liczby podstron i ile researchu potrzeba — na krótkiej rozmowie dokładnie to policzymy pod Pana przypadek.",
        "responseRu": "Показывает весь процесс за конечным результатом — снимает впечатление 'платим за пять предложений'. Заканчивает переводом на консультацию, а не спором о цене.",
        "why": {
          "pl": "Pokazuje niewidoczną pracę (research, poprawki) stojącą za pozornie krótkim tekstem.",
          "ru": "Показывает невидимую работу (исследование, правки), стоящую за внешне коротким текстом."
        }
      },
      {
        "say": "Nie wiem czy zmiana tekstów naprawdę na coś wpłynie.",
        "ru": "Клиент сомневается в измеримости эффекта — частое возражение, поскольку копирайтинг не так осязаем, как новый дизайн.",
        "response": "Rozumiem tę wątpliwość — nikt nie da Panu gwarancji konkretnej liczby, bo na wynik wpływa też ruch i konkurencja. Ale mogę pokazać na rozmowie przykłady 'przed i po' z podobnej branży, żeby zobaczył Pan konkretnie, o jaką różnicę chodzi.",
        "responseRu": "Честно признаёт границы обещания (нет гарантий чисел), но предлагает конкретное доказательство — примеры до/после, а не голословные заверения.",
        "why": {
          "pl": "Nie obiecuje liczby, ale daje konkretny, sprawdzalny dowód zamiast pustych zapewnień.",
          "ru": "Не обещает цифру, но даёт конкретное, проверяемое доказательство вместо пустых заверений."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — przeglądałem opis Pana usług na stronie i zastanawiam się, czy ktoś specjalnie pod kątem sprzedaży pisał te teksty, czy raczej pisane były 'przy okazji'?",
      "ru": "Открывашка мягко проверяет, задумывался ли клиент вообще о качестве текста как об отдельной задаче — часто владельцы никогда не думали об этом как о зоне роста."
    },
    "crossSell": {
      "pl": "Copywriting rzadko sprzedaje się samodzielnie — najsilniej działa w pakiecie z nową stroną albo landing page, a przy istniejącej stronie z ruchem świetnie łączy się z CRO, bo nowe teksty to jedna z pierwszych hipotez do przetestowania.",
      "ru": "Копирайтинг редко продаётся отдельно — сильнее всего работает в пакете с новым сайтом или лендингом, а при существующем сайте с трафиком отлично сочетается с CRO, ведь новые тексты — одна из первых гипотез для теста."
    }
  },
  "branding": {
    "title": {
      "pl": "Branding",
      "ru": "Брендинг"
    },
    "badge": {
      "pl": "Spójny wizerunek marki",
      "ru": "Целостный образ бренда"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Identyfikacja wizualna firmy: logo, paleta kolorów, typografia i zasady stylu spisane w jednym miejscu. Efektem jest paczka plików i zasad, które sprawiają, że firma wygląda tak samo na wizytówce, stronie, Facebooku i szyldzie — zamiast za każdym razem 'jakoś inaczej'.",
          "ru": "Визуальная идентичность компании: логотип, палитра цветов, типографика и правила стиля, собранные в одном месте. Результат — пакет файлов и правил, благодаря которым компания выглядит одинаково на визитке, сайте, Facebook и вывеске — вместо того, чтобы каждый раз выглядеть 'немного по-другому'."
        },
        "bullets": {
          "pl": [
            "Logo, paleta kolorów, typografia i zasady stylu",
            "Zakres: od samego logo do pełnego brandbooka",
            "Proces: moodboard → koncepcje → wybór → dopracowanie → paczka plików"
          ],
          "ru": [
            "Логотип, палитра цветов, типографика и правила стиля",
            "Объём: от одного логотипа до полного брендбука",
            "Процесс: мудборд → концепты → выбор → доработка → пакет файлов"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Nowe firmy, które startują i potrzebują pierwszej tożsamości wizualnej, oraz istniejące marki, które wyglądają przestarzale albo niespójnie — inne logo na Facebooku, inne na szyldzie, inne na fakturach.",
          "ru": "Новые компании, которые запускаются и нуждаются в первой визуальной идентичности, а также существующие бренды, которые выглядят устаревшими или несогласованными — разный логотип на Facebook, на вывеске, на счетах."
        },
        "bullets": {
          "pl": [
            "Nowe firmy budujące tożsamość wizualną od zera",
            "Marki z niespójnym wizerunkiem — różne logo w różnych miejscach",
            "Firmy planujące odświeżenie po latach działania na starym logo"
          ],
          "ru": [
            "Новые компании, строящие визуальную идентичность с нуля",
            "Бренды с несогласованным образом — разный логотип в разных местах",
            "Компании, планирующие обновление после многих лет со старым логотипом"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, gdy firma wygląda przypadkowo — logo zrobione w Canvie albo przez znajomego, inne kolory na różnych materiałach, brak spójności, która buduje zaufanie. Rozpoznajesz to pytaniem: 'Czy Pana logo i kolory wyglądają tak samo na wizytówce, stronie i Facebooku?' — jeśli klient się waha albo mówi 'no różnie bywa', to jest ten problem.",
          "ru": "Решает ситуацию, когда компания выглядит случайно — логотип сделан в Canva или знакомым, разные цвета на разных материалах, нет согласованности, которая строит доверие. Распознаётся вопросом: 'Ваш логотип и цвета выглядят одинаково на визитке, сайте и Facebook?' — если клиент колеблется или говорит 'ну по-разному бывает', это тот самый сигнал."
        },
        "bullets": {
          "pl": [
            "Logo zrobione 'na szybko' w Canvie albo przez znajomego/rodzinę",
            "Różne kolory i style w różnych materiałach firmy",
            "Firma startuje od zera i nie ma jeszcze żadnej identyfikacji"
          ],
          "ru": [
            "Логотип сделан 'на скорую руку' в Canva или знакомым/родственником",
            "Разные цвета и стили в разных материалах компании",
            "Компания стартует с нуля и пока не имеет никакой идентичности"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Zajrzałem na Pana Facebooka i stronę — logo i kolory wyglądają trochę inaczej w każdym miejscu, a to buduje wrażenie przypadkowości, nie profesjonalizmu.",
            "Nie chodzi tylko o ładne logo — chodzi o to, żeby klient rozpoznał Pana firmę i zapamiętał ją, zanim jeszcze przeczyta ofertę.",
            "Możemy zrobić samo logo, albo od razu pełny pakiet z paletą kolorów i zasadami — zależy, jak szeroko chce Pan to poukładać."
          ],
          "ru": [
            "Показывает конкретную несогласованность (разный вид логотипа) — используй, только если реально проверил соцсети/сайт клиента и видишь расхождение.",
            "Объясняет суть услуги в терминах узнаваемости, а не 'красоты' — сильный аргумент для тех, кто считает брендинг эстетической прихотью.",
            "Даёт клиенту выбор объёма (логотип vs полный пакет) — снижает порог входа, не давит на дорогой вариант сразу."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie naciskaj na branding, jeśli firma ma świeżą, spójną identyfikację albo jeśli priorytetem klienta jest po prostu pozyskanie pierwszych klientów, a nie wizerunek. Nigdy nie obiecuj, że nowe logo samo w sobie zwiększy sprzedaż — to buduje rozpoznawalność i zaufanie, a nie gwarantowany wzrost przychodu.",
          "ru": "Не дави на брендинг, если у компании свежая, согласованная идентичность, или если приоритет клиента — просто получить первых клиентов, а не имидж. Никогда не обещай, что новый логотип сам по себе увеличит продажи — это строит узнаваемость и доверие, а не гарантированный рост выручки."
        },
        "bullets": {
          "pl": [
            "Firma ma świeże, spójne logo i identyfikację → nie ma tu problemu do rozwiązania",
            "Firma dopiero startuje i priorytetem jest zdobycie pierwszych klientów, nie wizerunek → zaproponuj to później, po pierwszych przychodach",
            "Nigdy nie obiecuj wzrostu sprzedaży wynikającego wprost z nowego logo"
          ],
          "ru": [
            "У компании свежий, согласованный логотип и идентичность → здесь нет проблемы для решения",
            "Компания только стартует, и приоритет — первые клиенты, а не имидж → предложи это позже, после первых доходов",
            "Никогда не обещай рост продаж напрямую от нового логотипа"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Logo zrobiła mi żona w Canvie, jest ładne.' Co robisz?",
          "ru": "Клиент говорит: 'Логотип мне сделала жена в Canva, красивый.' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Mówisz od razu, że to logo jest złe i nieprofesjonalne",
            "Nie oceniasz logo wprost, tylko pytasz czy to logo i kolory wyglądają tak samo na wszystkich materiałach firmy",
            "Kończysz rozmowę, bo klient już ma logo"
          ],
          "ru": [
            "Сразу говоришь, что этот логотип плохой и непрофессиональный",
            "Не оцениваешь логотип напрямую, а спрашиваешь, выглядят ли этот логотип и цвета одинаково на всех материалах компании",
            "Заканчиваешь разговор, ведь у клиента уже есть логотип"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Co NAJLEPIEJ opisuje, dlaczego branding jest ważny dla nowej firmy?",
          "ru": "Что ЛУЧШЕ всего описывает, почему брендинг важен для новой компании?"
        },
        "answers": {
          "pl": [
            "Bo bez ładnego logo firma nie może legalnie działać",
            "Bo spójny wizerunek buduje rozpoznawalność i zaufanie od pierwszego kontaktu z marką",
            "Bo klienci zawsze pytają wprost o logo przed zakupem"
          ],
          "ru": [
            "Потому что без красивого логотипа компания не может легально работать",
            "Потому что согласованный образ строит узнаваемость и доверие с первого контакта с брендом",
            "Потому что клиенты всегда напрямую спрашивают про логотип перед покупкой"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Rozmawiasz z właścicielem nowo otwartej siłowni. Mają już świetne, spójne logo zrobione przez profesjonalnego grafika miesiąc temu. Pytają czy potrzebują brandingu od Was. Co odpowiadasz?",
          "ru": "Разговариваешь с владельцем недавно открытого спортзала. У них уже отличный, согласованный логотип, сделанный профессиональным дизайнером месяц назад. Спрашивают, нужен ли им брендинг от вас. Что отвечаешь?"
        },
        "answers": {
          "pl": [
            "Mówisz, że i tak powinni zrobić nowe logo u Was",
            "Uczciwie mówisz, że skoro logo jest świeże i spójne, branding nie jest teraz priorytetem — i pytasz o inne obszary, np. stronę czy reklamę",
            "Naciskasz na brandbook, bo to wyższa marża"
          ],
          "ru": [
            "Говоришь, что им всё равно стоит сделать новый логотип у вас",
            "Честно говоришь, что раз логотип свежий и согласованный, брендинг сейчас не приоритет — и спрашиваешь про другие направления, например сайт или рекламу",
            "Давишь на брендбук, потому что это выше маржа"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Uczciwość buduje długoterminowe zaufanie i pozwala przejść do usługi, która faktycznie odpowiada na aktualną potrzebę klienta.",
          "ru": "Честность строит долгосрочное доверие и позволяет перейти к услуге, которая реально отвечает на текущую потребность клиента."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Nie wiem czy nowe logo w ogóle wpłynie na to, ile zarabiam.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Не знаю, повлияет ли новый логотип вообще на то, сколько я зарабатываю.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź NIE obiecuje wzrostu sprzedaży z samego logo. Tłumaczy mechanizm: spójny, profesjonalny wizerunek buduje zaufanie w momencie pierwszego kontaktu (ktoś widzi Pana firmę zanim jeszcze z Panem porozmawia) i to zaufanie ułatwia, ale nie gwarantuje, decyzję o zakupie. Może dodać, że branding to inwestycja długoterminowa w rozpoznawalność, nie szybki trik sprzedażowy.",
          "ru": "Хороший ответ НЕ обещает рост продаж только от логотипа. Объясняет механизм: согласованный, профессиональный образ строит доверие в момент первого контакта (человек видит компанию до разговора с владельцем), и это доверие облегчает, но не гарантирует решение о покупке. Может добавить, что брендинг — это долгосрочная инвестиция в узнаваемость, а не быстрый трюк для продаж."
        }
      }
    ],
    "objections": [
      {
        "say": "Mam logo, syn mi zrobił za darmo, wystarczy.",
        "ru": "Клиент ценит бесплатность выше качества — типичное возражение малого бизнеса, где решения о визуале принимаются 'по знакомству'.",
        "response": "Rozumiem, oszczędził Pan na starcie i to ma sens. Pytanie tylko, czy to logo wygląda tak samo na wizytówce, szyldzie, Facebooku i stronie — bo jeśli nie, to klienci mogą podświadomie odbierać firmę jako mniej poukładaną, niż jest naprawdę.",
        "responseRu": "Не критикует бесплатное решение, а поднимает вопрос согласованности — часто бесплатные/любительские логотипы не имеют файлов под разные форматы использования.",
        "why": {
          "pl": "Nie atakuje decyzji klienta, tylko pokazuje konkretny, praktyczny problem spójności.",
          "ru": "Не атакует решение клиента, а показывает конкретную практическую проблему согласованности."
        }
      },
      {
        "say": "300 euro za logo? To tylko obrazek, czemu tak drogo?",
        "ru": "Классическое обесценивание работы дизайнера — клиент видит финальный файл, но не видит процесс исследования и вариантов.",
        "response": "To nie jest jeden obrazek narysowany na szybko — to proces: moodboard, kilka koncepcji do wyboru, dopracowanie wybranej i cała paczka plików gotowa do druku, strony, social media. Cena zależy też od zakresu — sam znak czy pełny brandbook, to dokładnie ustalimy na rozmowie.",
        "responseRu": "Раскрывает процесс за 'картинкой' — несколько концептов, доработка, разные форматы файлов. Заканчивает переводом на консультацию для уточнения объёма.",
        "why": {
          "pl": "Pokazuje ukrytą pracę i wybór, a nie jeden przypadkowy plik.",
          "ru": "Показывает скрытую работу и выбор, а не один случайный файл."
        }
      },
      {
        "say": "Nie wiem czy to w ogóle coś zmieni w mojej sprzedaży.",
        "ru": "Клиент сомневается в связи брендинга с продажами — справедливое сомнение, так как эффект брендинга косвенный, не прямой.",
        "response": "Szczerze mówiąc, nowe logo samo z siebie sprzedaży nie zrobi — to inwestycja w to, jak Pana firma jest odbierana, a spójny wizerunek ułatwia budowanie zaufania. Jeśli zależy Panu głównie na szybkim wzroście zapytań, możemy to połączyć z inną usługą, która działa bardziej bezpośrednio na leady.",
        "responseRu": "Честно признаёт ограниченность прямого эффекта — важная дисциплина этой академии: никогда не обещать продажи от брендинга. Предлагает связку с другой услугой для прямого эффекта.",
        "why": {
          "pl": "Uczciwość buduje zaufanie i pozwala naturalnie dosprzedać komplementarną usługę.",
          "ru": "Честность строит доверие и позволяет естественно допродать сопутствующую услугу."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — sprawdzałem Pana firmę w internecie i zauważyłem, że logo trochę inaczej wygląda na Facebooku, a inaczej na stronie. Mam chwilę, żeby o tym powiedzieć?",
      "ru": "Открывашка требует, чтобы ты реально проверил профили клиента заранее — показывает конкретное наблюдение, а не общую фразу. Используй только когда действительно нашёл расхождение."
    },
    "crossSell": {
      "pl": "Branding naturalnie otwiera drogę do nowej strony internetowej albo UI/UX — spójna identyfikacja wizualna traci sens, jeśli strona nadal wygląda po staremu, więc warto od razu zaproponować oba razem.",
      "ru": "Брендинг естественно открывает дорогу к новому сайту или UI/UX — согласованная визуальная идентичность теряет смысл, если сайт по-прежнему выглядит по-старому, поэтому стоит сразу предложить оба вместе."
    }
  },
  "uiux": {
    "title": {
      "pl": "UI/UX design",
      "ru": "UI/UX-дизайн"
    },
    "badge": {
      "pl": "Interfejs, który prowadzi klienta",
      "ru": "Интерфейс, который ведёт клиента"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Projektowanie interfejsu — strony, aplikacji albo panelu — tak, żeby użytkownik intuicyjnie wiedział, gdzie kliknąć i jak dokończyć to, po co przyszedł. To głębsza praca niż zwykła strona: obejmuje mapowanie ścieżki użytkownika (flow), szkice (wireframe), warstwę wizualną (UI), interaktywny prototyp i testy z realnymi użytkownikami.",
          "ru": "Проектирование интерфейса — сайта, приложения или панели — так, чтобы пользователь интуитивно понимал, куда кликнуть и как довести до конца то, зачем пришёл. Это более глубокая работа, чем обычный сайт: включает картирование пути пользователя (flow), эскизы (wireframe), визуальный слой (UI), интерактивный прототип и тестирование с реальными пользователями."
        },
        "bullets": {
          "pl": [
            "Projekt interfejsu strony, aplikacji lub panelu wewnętrznego",
            "Proces: flow → wireframe → UI → prototyp → testy",
            "Cena zależy od liczby ekranów, badań i złożoności prototypu"
          ],
          "ru": [
            "Дизайн интерфейса сайта, приложения или внутренней панели",
            "Процесс: flow → wireframe → UI → прототип → тестирование",
            "Цена зависит от числа экранов, исследований и сложности прототипа"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Produkty cyfrowe, aplikacje, SaaS-y i systemy wewnętrzne — czyli projekty bardziej złożone niż standardowa strona firmowa z kilkoma podstronami. Klient zwykle ma już (albo buduje) produkt z wieloma ekranami i procesami, przez które użytkownik musi przejść.",
          "ru": "Цифровые продукты, приложения, SaaS-сервисы и внутренние системы — то есть проекты сложнее стандартного сайта-визитки с несколькими страницами. У клиента обычно уже есть (или строится) продукт с множеством экранов и процессов, через которые должен пройти пользователь."
        },
        "bullets": {
          "pl": [
            "Produkty cyfrowe, aplikacje i SaaS z wieloma ekranami",
            "Systemy wewnętrzne firm — panele, narzędzia dla pracowników",
            "Firmy budujące nowy produkt cyfrowy od zera, przed etapem programowania"
          ],
          "ru": [
            "Цифровые продукты, приложения и SaaS с множеством экранов",
            "Внутренние системы компаний — панели, инструменты для сотрудников",
            "Компании, строящие новый цифровой продукт с нуля, до этапа разработки"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, gdy użytkownicy gubią się w produkcie i nie kończą tego, po co przyszli — zaczynają zamawiać, wypełniać formularz albo korzystać z panelu i rezygnują w połowie. Rozpoznajesz to pytaniem: 'Czy widzi Pan w danych, w którym miejscu ludzie rezygnują albo dzwonią z pytaniem jak coś obsłużyć?'",
          "ru": "Решает ситуацию, когда пользователи теряются в продукте и не доводят до конца то, зачем пришли — начинают заказывать, заполнять форму или пользоваться панелью и бросают на середине. Распознаётся вопросом: 'Видите ли вы в данных, на каком этапе люди уходят или звонят с вопросом, как что-то сделать?'"
        },
        "bullets": {
          "pl": [
            "Użytkownicy zaczynają proces (zamówienie, formularz) i rzucają w połowie",
            "Klienci dzwonią z pytaniami 'jak to obsłużyć', bo interfejs jest niejasny",
            "Firma buduje nowy produkt/aplikację i chce uniknąć błędów projektowych od startu"
          ],
          "ru": [
            "Пользователи начинают процесс (заказ, форма) и бросают на середине",
            "Клиенты звонят с вопросами 'как этим пользоваться', потому что интерфейс неясен",
            "Компания строит новый продукт/приложение и хочет избежать ошибок проектирования с самого начала"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Ile osób w Pana danych zaczyna zamówienie albo formularz i go nie kończy? Bo to zwykle nie jest kwestia ceny, tylko tego, że interfejs gubi ludzi po drodze.",
            "Programista świetnie napisze kod, ale to, czy proces jest logiczny dla zwykłego użytkownika, to zupełnie inna specjalizacja — projektowanie UX.",
            "Zanim zaczniemy kodować, robimy prototyp, który można kliknąć i przetestować na prawdziwych ludziach — żeby błędy poprawić na etapie szkicu, a nie po wdrożeniu."
          ],
          "ru": [
            "Опирается на данные (брошенные заказы/формы), а не на впечатление — сильный аргумент для клиентов, ориентированных на цифры.",
            "Отделяет работу разработчика от работы UX-дизайнера — снимает частое возражение 'у нас уже есть программист'.",
            "Показывает конкретную практическую выгоду прототипа — ошибки дешевле исправить до разработки, чем после."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "UI/UX to głęboka, droższa usługa dla złożonych produktów — nie oferuj jej zamiast zwykłej strony firmowej z 5 podstronami, bo to przepłacanie za zakres, którego klient nie potrzebuje. Zawsze podkreślaj, że lepsza obsługa i konwersja to efekt procesu, nie gwarancja konkretnej liczby.",
          "ru": "UI/UX — глубокая, более дорогая услуга для сложных продуктов — не предлагай её вместо обычного сайта на 5 страниц, это переплата за объём, который клиенту не нужен. Всегда подчёркивай, что лучшее удобство и конверсия — результат процесса, а не гарантия конкретного числа."
        },
        "bullets": {
          "pl": [
            "Klient potrzebuje prostej strony firmowej na kilka podstron → to usługa 'Strony internetowe', nie UI/UX",
            "Klient nie ma jeszcze żadnego produktu ani konkretnego procesu do zaprojektowania → za wcześnie, zacznij od rozmowy o samym pomyśle",
            "Nigdy nie obiecuj konkretnego procentu wzrostu konwersji po redesignie"
          ],
          "ru": [
            "Клиенту нужен простой сайт на несколько страниц → это услуга 'Сайты', а не UI/UX",
            "У клиента ещё нет продукта или конкретного процесса для проектирования → рано, начни с разговора о самой идее",
            "Никогда не обещай конкретный процент роста конверсии после редизайна"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mamy programistę, on ogarnie design.' Co odpowiadasz?",
          "ru": "Клиент говорит: 'У нас есть программист, он разберётся с дизайном.' Что отвечаешь?"
        },
        "answers": {
          "pl": [
            "Zgadzasz się, programista faktycznie ogarnie wszystko",
            "Tłumaczysz, że kodowanie i projektowanie doświadczenia użytkownika to dwie różne specjalizacje, i pytasz czy mają dane o tym, gdzie użytkownicy rezygnują",
            "Mówisz, że programiści nigdy nie potrafią robić dobrego designu"
          ],
          "ru": [
            "Соглашаешься, программист правда со всем справится",
            "Объясняешь, что программирование и проектирование пользовательского опыта — две разные специализации, и спрашиваешь, есть ли у них данные о том, где пользователи уходят",
            "Говоришь, что программисты никогда не умеют делать хороший дизайн"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dla jakiego typu projektu UI/UX design jest NAJBARDZIEJ uzasadniony?",
          "ru": "Для какого типа проекта UI/UX-дизайн НАИБОЛЕЕ оправдан?"
        },
        "answers": {
          "pl": [
            "Prostej, 5-podstronowej strony wizytówkowej dla warsztatu samochodowego",
            "Aplikacji SaaS z wieloma ekranami i skomplikowanym procesem zamawiania",
            "Landing page pod jedną kampanię reklamową"
          ],
          "ru": [
            "Простого сайта-визитки на 5 страниц для автомастерской",
            "SaaS-приложения с множеством экранов и сложным процессом заказа",
            "Лендинга под одну рекламную кампанию"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Firma buduje własną aplikację do rezerwacji wizyt. Mają już programistę, który 'na oko' zaprojektował ekrany i zaczął kodować. Klient pyta, czy UI/UX design ma sens na tym etapie. Co odpowiadasz?",
          "ru": "Компания строит собственное приложение для бронирования визитов. У них уже есть программист, который 'на глаз' спроектировал экраны и начал кодить. Клиент спрашивает, есть ли смысл в UI/UX на этом этапе. Что отвечаешь?"
        },
        "answers": {
          "pl": [
            "Mówisz, że skoro programowanie już ruszyło, jest za późno na cokolwiek",
            "Mówisz, że im wcześniej wejdzie projektant, tym taniej — poprawianie już zakodowanych ekranów kosztuje więcej niż poprawa szkicu, więc warto zrobić to teraz",
            "Mówisz, że UI/UX jest zbędny, skoro apka już działa"
          ],
          "ru": [
            "Говоришь, что раз разработка уже началась, поздно что-либо менять",
            "Говоришь, что чем раньше подключится дизайнер, тем дешевле — исправлять уже закодированные экраны дороже, чем исправить эскиз, поэтому стоит сделать это сейчас",
            "Говоришь, что UI/UX не нужен, раз приложение уже работает"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klasyczna zasada projektowa: koszt poprawki rośnie z każdym etapem. Wczesne wejście UX designera oszczędza pieniądze na przeróbkach po fakcie.",
          "ru": "Классический принцип проектирования: стоимость исправления растёт с каждым этапом. Раннее подключение UX-дизайнера экономит деньги на переделках постфактум."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Nasza apka wygląda w porządku, nie widzę problemu.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Наше приложение выглядит нормально, я не вижу проблемы.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź nie kłóci się z opinią klienta o wyglądzie, tylko przesuwa rozmowę z 'wygląda' na 'działa' — pyta o konkretne dane: wskaźnik rezygnacji, liczbę zgłoszeń typu 'nie wiem jak to obsłużyć', czas potrzebny na wykonanie kluczowej akcji. Sugeruje, że subiektywne wrażenie właściciela różni się od doświadczenia nowego użytkownika, który widzi produkt pierwszy raz. Nie atakuje produktu klienta wprost.",
          "ru": "Хороший ответ не спорит с мнением клиента о внешнем виде, а переводит разговор с 'выглядит' на 'работает' — спрашивает про конкретные данные: показатель отказов, число обращений 'не понимаю, как этим пользоваться', время на выполнение ключевого действия. Намекает, что субъективное впечатление владельца отличается от опыта нового пользователя, который видит продукт впервые. Не атакует продукт клиента напрямую."
        }
      }
    ],
    "objections": [
      {
        "say": "Mamy programistę, on się tym zajmie.",
        "ru": "Самое частое возражение для этой услуги — путаница между разработкой и проектированием опыта. Клиент считает, что 'технический человек' покрывает всё.",
        "response": "Programista zrobi tak, żeby to działało technicznie, ale to, czy użytkownik intuicyjnie wie, gdzie kliknąć, to osobna umiejętność — UX design. To trochę jak budowniczy i architekt: jeden postawi ściany, drugi zaprojektuje układ, żeby się dało w tym mieszkać wygodnie.",
        "responseRu": "Использует понятную аналогию (строитель vs архитектор) для объяснения разделения ролей — упрощает абстрактную концепцию UX для нетехнического владельца бизнеса.",
        "why": {
          "pl": "Analogia budowlana jest zrozumiała dla nietechnicznego właściciela firmy i nie umniejsza pracy programisty.",
          "ru": "Строительная аналогия понятна нетехническому владельцу бизнеса и не принижает работу программиста."
        }
      },
      {
        "say": "400 euro to dopiero start, ile finalnie wyjdzie?",
        "ru": "Клиент справедливо замечает, что 'от 400 евро' — это открытая цена, и хочет понять реальный порядок величины.",
        "response": "Cena rośnie wraz z liczbą ekranów, głębokością badań i złożonością prototypu — dlatego nie da się tego uczciwie zgadnąć na telefonie. Na krótkiej rozmowie przejdziemy przez to, ile ekranów faktycznie potrzebuje Pana produkt, i dostanie Pan konkretny widełkowy kosztorys.",
        "responseRu": "Не пытается угадать финальную сумму, а объясняет, от чего она зависит, и переводит на консультацию — важная дисциплина: никогда не гадать точную цену по телефону.",
        "why": {
          "pl": "Uczciwość co do zmienności ceny buduje wiarygodność bardziej niż zgadywanie liczby.",
          "ru": "Честность в отношении вариативности цены строит доверие лучше, чем угадывание числа."
        }
      },
      {
        "say": "Wygląda ok, klienci się nie skarżą.",
        "ru": "Клиент опирается на отсутствие жалоб как доказательство отсутствия проблемы — но большинство разочарованных пользователей просто молча уходят, не жалуясь.",
        "response": "To dobry znak, że nikt się nie skarży wprost — tylko że większość ludzi, którzy się zgubią w procesie, nie dzwoni z reklamacją, tylko po prostu wychodzi i idzie do konkurencji. Dlatego warto spojrzeć w dane: ile osób zaczyna proces, a ile go kończy.",
        "responseRu": "Разрушает ложную корреляцию 'нет жалоб = нет проблемы', вводя понятие тихого ухода пользователей — сильный, но не агрессивный аргумент, опирающийся на данные.",
        "why": {
          "pl": "Podważa błędne założenie 'brak skarg = brak problemu' realistycznym opisem zachowania użytkowników.",
          "ru": "Опровергает ошибочное допущение 'нет жалоб = нет проблемы' реалистичным описанием поведения пользователей."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — widziałem Państwa aplikację/panel i chciałem zapytać, czy macie dane o tym, w którym miejscu użytkownicy najczęściej rezygnują z procesu?",
      "ru": "Открывашка сразу ставит вопрос про данные, а не про эстетику — сигнализирует профессиональный, аналитический подход, а не 'продажу красоты'. Используй для клиентов с реальным цифровым продуктом (приложение, панель, SaaS)."
    },
    "crossSell": {
      "pl": "UI/UX najczęściej idzie w parze z brandingiem, żeby produkt był spójny wizualnie z resztą marki, a dla produktów z panelem administracyjnym świetnie łączy się z panelami admina lub custom tools jako kolejny etap wdrożenia.",
      "ru": "UI/UX чаще всего идёт в паре с брендингом, чтобы продукт был визуально согласован с остальной частью бренда, а для продуктов с админ-панелью отлично сочетается с панелями администратора или custom tools как следующий этап внедрения."
    }
  },
  "anim3d": {
    "title": {
      "pl": "Animacje 3D",
      "ru": "3D-анимации"
    },
    "badge": {
      "pl": "Efekt WOW na stronie",
      "ru": "WOW-эффект на сайте"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Obiekty 3D, animacje uruchamiane przy przewijaniu strony (scroll) i interaktywne sceny, które reagują na ruch myszki albo dotyk. To usługa premium, dodawana na strony, które mają być zapamiętane, a nie tylko obejrzane — produkt obracający się w 3D, scena reagująca na scroll, efekty, których nie znajdzie się na typowej stronie z szablonu.",
          "ru": "3D-объекты, анимации, запускающиеся при прокрутке страницы (scroll), и интерактивные сцены, реагирующие на движение мыши или касание. Это премиум-услуга, добавляемая на сайты, которые должны запомниться, а не просто быть просмотренными, — вращающийся в 3D продукт, сцена, реагирующая на скролл, эффекты, которых не найти на типовом шаблонном сайте."
        },
        "bullets": {
          "pl": [
            "Obiekty 3D, scroll-animacje i interaktywne sceny na stronie",
            "Cena zależy od złożoności sceny, optymalizacji i liczby animacji",
            "Proces: koncepcja → scena → animacja → optymalizacja"
          ],
          "ru": [
            "3D-объекты, scroll-анимации и интерактивные сцены на сайте",
            "Цена зависит от сложности сцены, оптимизации и числа анимаций",
            "Процесс: концепция → сцена → анимация → оптимизация"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Marki premium działające w konkurencyjnych, wizualnych branżach — deweloperzy, architektura, motoryzacja, jubilerstwo, luksusowe produkty — którym zależy, żeby strona wyróżniała się na tle konkurencji i budowała wrażenie 'wyższej ligi'.",
          "ru": "Премиальные бренды в конкурентных, визуальных нишах — застройщики, архитектура, автомобили, ювелирные изделия, люксовые продукты — которым важно, чтобы сайт выделялся на фоне конкурентов и создавал впечатление 'высшей лиги'."
        },
        "bullets": {
          "pl": [
            "Deweloperzy, architektura, motoryzacja, jubilerstwo, marki luksusowe",
            "Firmy, których strona ma robić pierwsze wrażenie 'premium'",
            "Marki chcące się mocno odróżnić od konkurencji wizualnie"
          ],
          "ru": [
            "Застройщики, архитектура, автомобили, ювелирные изделия, люксовые бренды",
            "Компании, чей сайт должен производить первое впечатление 'премиум'",
            "Бренды, желающие сильно визуально выделиться на фоне конкурентов"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje problem 'strona wygląda jak tysiące innych' — klient ma poprawną, ale przewidywalną stronę z szablonu, w niczym nieodróżniającą się od konkurencji w tej samej, konkurencyjnej i wizualnej branży. Rozpoznajesz to, gdy klient działa w premium niszy i mówi coś w stylu 'nasza strona jest ok, ale nie robi wrażenia, jakiego byśmy chcieli'.",
          "ru": "Решает проблему 'сайт выглядит как тысячи других' — у клиента корректный, но предсказуемый шаблонный сайт, ничем не выделяющийся среди конкурентов в той же конкурентной и визуальной нише. Распознаётся, когда клиент работает в премиум-нише и говорит что-то вроде 'наш сайт нормальный, но не производит того впечатления, которое нам нужно'."
        },
        "bullets": {
          "pl": [
            "Firma działa w konkurencyjnej, wizualnej branży (deweloperka, motoryzacja, luksus)",
            "Strona jest poprawna, ale nie wyróżnia się i wygląda jak z szablonu",
            "Klient mówi 'chcemy zrobić wrażenie', 'chcemy wyglądać jak marka premium'"
          ],
          "ru": [
            "Компания работает в конкурентной, визуальной нише (девелопмент, авто, люкс)",
            "Сайт корректный, но не выделяется и выглядит шаблонно",
            "Клиент говорит 'хотим произвести впечатление', 'хотим выглядеть как премиум-бренд'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "W Pana branży wszyscy mają podobne strony z gotowych szablonów — animacje 3D to jeden z niewielu sposobów, żeby ktoś naprawdę zapamiętał Pana stronę, a nie przewinął ją jak dziesięć innych.",
            "To nie jest tylko ozdoba — dobrze zrobiona scena 3D pokazuje produkt albo realizację w sposób, którego zwykłe zdjęcia nie oddają.",
            "Cała animacja jest optymalizowana pod szybkość ładowania — to nie jest tak, że strona zaczyna działać wolniej, robimy to tak, żeby nadal działała płynnie."
          ],
          "ru": [
            "Позиционирует услугу как способ выделиться в конкурентной, шаблонной нише — используй только для клиентов из визуально насыщенных ниш (девелопмент, авто, люкс).",
            "Отвечает на скепсис 'это просто украшение' — показывает практическую пользу (демонстрация продукта в 3D лучше, чем фото).",
            "Заранее снимает техническое возражение про скорость загрузки — важно упомянуть проактивно, это частый страх клиентов."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "To usługa premium, dodatkowa — nie proponuj jej firmom z ciasnym budżetem, prostym lokalnym biznesem (hydraulik, mały sklep spożywczy) ani firmom, które nie mają jeszcze solidnej strony bazowej. Animacje dokłada się na dobrą stronę, nie zamiast niej.",
          "ru": "Это премиальная, дополнительная услуга — не предлагай её компаниям с ограниченным бюджетом, простому локальному бизнесу (сантехник, небольшой продуктовый магазин) или компаниям, у которых ещё нет добротного базового сайта. Анимации добавляются на хороший сайт, а не вместо него."
        },
        "bullets": {
          "pl": [
            "Firma ma napięty budżet i priorytetem jest zdobycie pierwszych klientów, nie efekt wow",
            "Prosty lokalny biznes bez wizualnej konkurencji premium (hydraulik, warzywniak, mały serwis)",
            "Klient nie ma jeszcze dobrej strony bazowej → najpierw strona, animacje jako dodatek później",
            "Nigdy nie obiecuj, że animacje same w sobie przełożą się na więcej sprzedaży"
          ],
          "ru": [
            "У компании ограниченный бюджет, и приоритет — первые клиенты, а не wow-эффект",
            "Простой локальный бизнес без визуальной премиум-конкуренции (сантехник, овощной магазин, небольшой сервис)",
            "У клиента ещё нет хорошего базового сайта → сначала сайт, анимации как дополнение позже",
            "Никогда не обещай, что анимации сами по себе приведут к росту продаж"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Do jakiej firmy animacje 3D pasują NAJLEPIEJ?",
          "ru": "Какой компании 3D-анимации подходят ЛУЧШЕ всего?"
        },
        "answers": {
          "pl": [
            "Do lokalnego warsztatu samochodowego z ciasnym budżetem",
            "Do dewelopera mieszkań premium, który chce pokazać realizacje w wyjątkowy sposób",
            "Do małego sklepu spożywczego na osiedlu"
          ],
          "ru": [
            "Локальной автомастерской с ограниченным бюджетом",
            "Застройщику премиум-жилья, который хочет показать проекты необычным способом",
            "Небольшому продуктовому магазину в микрорайоне"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Klient pyta: 'Czy animacje nie spowolnią mojej strony?' Jaka jest poprawna odpowiedź merytorycznie?",
          "ru": "Клиент спрашивает: 'Анимации не замедлят мой сайт?' Какой ответ верен по сути?"
        },
        "answers": {
          "pl": [
            "Tak, animacje zawsze mocno spowalniają stronę, to nieunikniony kompromis",
            "Optymalizacja jest częścią procesu — scena jest projektowana i optymalizowana tak, żeby działała płynnie",
            "To pytanie nie ma znaczenia dla animacji 3D"
          ],
          "ru": [
            "Да, анимации всегда сильно замедляют сайт, это неизбежный компромисс",
            "Оптимизация — часть процесса, сцена проектируется и оптимизируется так, чтобы работать плавно",
            "Этот вопрос не имеет значения для 3D-анимаций"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do małej firmy sprzątającej mieszkania. Właściciel ma napięty budżet i pyta o animacje 3D, bo 'widział u konkurencji i mu się spodobało'. Co robisz?",
          "ru": "Звонишь в небольшую фирму по уборке квартир. У владельца ограниченный бюджет, он спрашивает про 3D-анимации, потому что 'видел у конкурента и понравилось'. Что делаешь?"
        },
        "answers": {
          "pl": [
            "Od razu sprzedajesz animacje, skoro klient sam pyta",
            "Uczciwie mówisz, że przy jego budżecie lepszą inwestycją będzie solidna strona albo CRO, a animacje 3D to raczej coś dla branż premium — i pytasz, czy ma już dobrą stronę bazową",
            "Mówisz, że animacje 3D w ogóle nie istnieją dla małych firm"
          ],
          "ru": [
            "Сразу продаёшь анимации, раз клиент сам спрашивает",
            "Честно говоришь, что при его бюджете лучшей инвестицией будет добротный сайт или CRO, а 3D-анимации — скорее для премиум-ниш — и спрашиваешь, есть ли у него уже хороший базовый сайт",
            "Говоришь, что 3D-анимации вообще не существуют для малого бизнеса"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Dobry sprzedawca nie sprzedaje tego, o co klient pyta, tylko tego, czego klient realnie potrzebuje — to buduje długoterminowe zaufanie i lepsze dopasowanie usługi.",
          "ru": "Хороший продавец продаёт не то, о чём клиент спрашивает, а то, что клиенту реально нужно, — это строит долгосрочное доверие и лучшее соответствие услуги."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Nie wiem czy to pasuje do mojej branży, jestem firmą budowlaną, nie modową marką.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Не знаю, подходит ли это моей нише, я строительная компания, а не модный бренд.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź pokazuje, że animacje 3D pasują też do branż 'technicznych', jeśli mają coś wizualnego do pokazania — np. wizualizacja realizacji, proces budowy krok po kroku, model 3D inwestycji. Nie naciska na sprzedaż na siłę — jeśli po dopytaniu okaże się, że firma nie ma nic wizualnie mocnego do pokazania, dobra odpowiedź uczciwie to przyznaje i proponuje alternatywę (np. dobre zdjęcia realizacji, standardową stronę).",
          "ru": "Хороший ответ показывает, что 3D-анимации подходят и 'техническим' нишам, если есть что показать визуально — например, визуализация проекта, процесс стройки по шагам, 3D-модель объекта. Не давит на продажу любой ценой — если после уточнения окажется, что у компании нет ничего сильного визуально, хороший ответ честно это признаёт и предлагает альтернативу (например, хорошие фото объектов, обычный сайт)."
        }
      }
    ],
    "objections": [
      {
        "say": "Czy to nie spowolni mi strony? Słyszałem, że takie efekty są ciężkie.",
        "ru": "Технически обоснованное возражение — 3D-контент реально может быть тяжёлым, если сделан непрофессионально, поэтому клиент прав быть осторожным.",
        "response": "To uzasadniona obawa, bo źle zrobione animacje faktycznie potrafią spowolnić stronę. Dlatego optymalizacja jest osobnym etapem naszego procesu — testujemy, jak scena działa na różnych urządzeniach, zanim uznamy projekt za gotowy.",
        "responseRu": "Не отмахивается от опасения, а подтверждает его обоснованность, затем показывает, что оптимизация — встроенный этап процесса, а не то, о чём клиент должен сам беспокоиться.",
        "why": {
          "pl": "Uznanie zasadności obawy buduje wiarygodność bardziej niż od razu zbywanie jej.",
          "ru": "Признание обоснованности опасения строит доверие лучше, чем немедленное его отрицание."
        }
      },
      {
        "say": "250 euro za animacje to dużo jak na coś, co jest tylko dodatkiem.",
        "ru": "Клиент воспринимает анимации как второстепенный, необязательный элемент — недооценивает работу над сценой и оптимизацией.",
        "response": "Rozumiem, że to brzmi jak dodatek, ale za tym stoi cały proces: koncepcja, budowa sceny 3D, animacja i optymalizacja pod różne urządzenia. Cena zależy od złożoności — im prostsza scena, tym niższy koszt, więc na rozmowie możemy dobrać zakres pod Pana budżet.",
        "responseRu": "Не спорит с восприятием клиента напрямую, а раскрывает объём работы за 'дополнением' и предлагает гибкость по объёму под бюджет.",
        "why": {
          "pl": "Pokazuje elastyczność zakresu, co obniża próg wejścia bez zaniżania wartości pracy.",
          "ru": "Показывает гибкость объёма, что снижает порог входа, не занижая ценность работы."
        }
      },
      {
        "say": "Jestem firmą budowlaną, nie wiem czy takie efekty pasują do mojej branży.",
        "ru": "Клиент считает, что 3D-анимации подходят только 'модным', визуальным брендам, не техническим/строительным нишам.",
        "response": "Wręcz przeciwnie — dla budowlanki to świetne narzędzie do pokazania realizacji: model 3D inwestycji, animowany proces budowy krok po kroku, coś czego zwykłe zdjęcia nie oddają. Pytanie, czy ma Pan materiały (projekty, wizualizacje), które moglibyśmy tak pokazać?",
        "responseRu": "Опровергает ошибочное предположение клиента конкретным примером применения в его нише и сразу квалифицирует, есть ли у клиента материал для работы.",
        "why": {
          "pl": "Konkretny przykład z branży klienta obala uprzedzenie skuteczniej niż ogólne zapewnienie.",
          "ru": "Конкретный пример из ниши клиента опровергает предубеждение эффективнее общего заверения."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — widziałem stronę Pana inwestycji, wygląda solidnie, ale bardzo podobnie do kilku innych deweloperów, których sprawdzałem. Ma Pan chwilę, powiem jak można to zmienić?",
      "ru": "Открывашка работает только для действительно конкурентных, визуальных ниш (девелопмент, авто, люкс) — используй, только когда реально сравнил сайт клиента с конкурентами и он выглядит шаблонно."
    },
    "crossSell": {
      "pl": "Animacje 3D mają sens tylko na solidnej bazie, więc naturalnie sprzedają się jako dodatek do strony internetowej lub UI/UX, a razem z brandingiem tworzą spójny, premium wizerunek marki.",
      "ru": "3D-анимации имеют смысл только на прочной базе, поэтому естественно продаются как дополнение к сайту или UI/UX, а вместе с брендингом создают согласованный премиальный образ бренда."
    }
  },
  "cro": {
    "title": {
      "pl": "Optymalizacja konwersji (CRO)",
      "ru": "Оптимизация конверсии (CRO)"
    },
    "badge": {
      "pl": "Więcej zapytań z tego ruchu",
      "ru": "Больше заявок с того же трафика"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Audyt i poprawa strony pod kątem tego, żeby więcej odwiedzających zostawiało kontakt: przyciski CTA, formularze, struktura strony i to, gdzie ludzie faktycznie klikają. Opiera się na danych, nie na domysłach — analiza tego, co dziś nie działa, hipotezy zmian, wdrożenie, pomiar i kolejne iteracje.",
          "ru": "Аудит и улучшение сайта с целью, чтобы больше посетителей оставляли контакт: кнопки CTA, формы, структура страницы и то, куда люди реально кликают. Основано на данных, а не на догадках — анализ того, что сегодня не работает, гипотезы изменений, внедрение, измерение и следующие итерации."
        },
        "bullets": {
          "pl": [
            "Audyt i poprawa: CTA, formularze i struktura strony",
            "Wymaga istniejącego ruchu na stronie, żeby było co analizować",
            "Proces: audyt → hipotezy → zmiany → pomiar → iteracje"
          ],
          "ru": [
            "Аудит и улучшение: CTA, формы и структура страницы",
            "Требует существующего трафика на сайте, чтобы было что анализировать",
            "Процесс: аудит → гипотезы → изменения → измерение → итерации"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, które już mają realny ruch na stronie — z reklamy, SEO albo social media — ale ten ruch nie zamienia się w zapytania. To usługa dla klientów, którzy już płacą za pozyskanie ruchu i chcą wycisnąć z niego więcej, zamiast dokładać kolejny budżet reklamowy.",
          "ru": "Компании, у которых уже есть реальный трафик на сайте — из рекламы, SEO или соцсетей — но этот трафик не превращается в заявки. Это услуга для клиентов, которые уже платят за привлечение трафика и хотят выжать из него больше, вместо того чтобы добавлять новый рекламный бюджет."
        },
        "bullets": {
          "pl": [
            "Firmy z realnym ruchem z reklamy, SEO lub social media",
            "Klienci, którzy już inwestują w marketing i chcą lepszego zwrotu",
            "Firmy z zainstalowaną analityką, gdzie widać dane o ruchu"
          ],
          "ru": [
            "Компании с реальным трафиком из рекламы, SEO или соцсетей",
            "Клиенты, которые уже инвестируют в маркетинг и хотят лучшей отдачи",
            "Компании с установленной аналитикой, где видны данные о трафике"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację 'mamy ruch, ale mało kontaktów' — ludzie wchodzą na stronę i wychodzą bez zostawienia numeru czy wypełnienia formularza. Rozpoznajesz to pytaniem: 'Ile osób wchodzi miesięcznie na stronę i ile z tego zostawia kontakt?' — jeśli klient zna pierwszą liczbę, a nie zna drugiej, albo druga liczba jest bardzo niska, to jest dokładnie ten problem.",
          "ru": "Решает ситуацию 'трафик есть, а обращений мало' — люди заходят на сайт и уходят, не оставив номер или не заполнив форму. Распознаётся вопросом: 'Сколько человек в месяц заходит на сайт и сколько из них оставляет контакт?' — если клиент знает первое число, но не знает второе, или второе число очень низкое, это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient ma ruch (z reklamy, SEO, social), ale mało zapytań",
            "Klient nie wie, jaki procent odwiedzających zostawia kontakt",
            "Klient mówi 'wydajemy na reklamę, a telefon nie dzwoni tak jak powinien'"
          ],
          "ru": [
            "У клиента есть трафик (реклама, SEO, соцсети), но мало заявок",
            "Клиент не знает, какой процент посетителей оставляет контакт",
            "Клиент говорит: 'тратим на рекламу, а телефон звонит не так, как должен'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Nie chodzi o to, żeby wydawać więcej na reklamę — chodzi o to, żeby z ruchu, który Pan już ma, wyciągnąć więcej zapytań, bez dokładania budżetu.",
            "Ile procent osób, które wchodzą na Pana stronę, faktycznie zostawia kontakt? Bo jeśli Pan tego nie wie, to prawdopodobnie tracimy tam pieniądze, które już Pan wydał na reklamę.",
            "Zaczynamy od audytu — konkretnie pokazujemy, w którym miejscu ludzie rezygnują, zanim zaproponujemy jakiekolwiek zmiany."
          ],
          "ru": [
            "Ключевой аргумент этой услуги — не тратить больше, а лучше использовать уже оплаченный трафик. Используй как открывающий тезис, особенно с клиентами, уставшими от рекламных расходов.",
            "Вопрос-диагностика, который выявляет, отслеживает ли клиент вообще конверсию — часто владельцы знают трафик, но не знают конверсию.",
            "Показывает методичность процесса (сначала аудит, потом решения) — снимает опасение 'а вдруг это просто угадывание изменений'."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "CRO wymaga realnego ruchu do analizy — bez tego nie ma czego optymalizować i nie ma na czym się oprzeć. Nie oferuj jej firmom bez strony albo bez żadnego źródła ruchu. Nigdy nie obiecuj konkretnego procenta wzrostu konwersji — to zależy od punktu startowego i liczby przetestowanych hipotez.",
          "ru": "CRO требует реального трафика для анализа — без него нечего оптимизировать и не на что опереться. Не предлагай эту услугу компаниям без сайта или без какого-либо источника трафика. Никогда не обещай конкретный процент роста конверсии — это зависит от стартовой точки и числа протестированных гипотез."
        },
        "bullets": {
          "pl": [
            "Firma nie ma jeszcze strony albo ma znikomy ruch → najpierw strona i/lub reklama, potem CRO",
            "Klient nie ma żadnej analityki ani danych o ruchu → zacznij od podstawowej analityki, inaczej CRO nie ma się na czym oprzeć",
            "Nigdy nie obiecuj konkretnego procenta wzrostu liczby zapytań"
          ],
          "ru": [
            "У компании ещё нет сайта или ничтожный трафик → сначала сайт и/или реклама, потом CRO",
            "У клиента нет никакой аналитики или данных о трафике → начни с базовой аналитики, иначе CRO не на что опереться",
            "Никогда не обещай конкретный процент роста числа заявок"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mamy 2000 wejść miesięcznie na stronę, ale tylko 3 telefony.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'У нас 2000 посещений в месяц на сайт, но только 3 звонка.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient po prostu ma złych klientów i nic się nie da zrobić",
            "Bardzo niski wskaźnik konwersji przy realnym ruchu — klasyczny sygnał do CRO",
            "Trzeba mu zaproponować więcej reklamy, żeby zwiększyć ruch"
          ],
          "ru": [
            "У клиента просто плохие клиенты, и ничего не поделаешь",
            "Очень низкий показатель конверсии при реальном трафике — классический сигнал для CRO",
            "Нужно предложить больше рекламы, чтобы увеличить трафик"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego CRO nie ma sensu dla firmy, która dopiero uruchamia swoją pierwszą stronę bez żadnego ruchu?",
          "ru": "Почему CRO не имеет смысла для компании, только запускающей свой первый сайт без всякого трафика?"
        },
        "answers": {
          "pl": [
            "Bo CRO zawsze jest za drogie na start",
            "Bo optymalizacja opiera się na analizie realnych danych o zachowaniu odwiedzających, a bez ruchu nie ma czego analizować",
            "Bo CRO działa tylko dla sklepów internetowych"
          ],
          "ru": [
            "Потому что CRO всегда слишком дорого для старта",
            "Потому что оптимизация основана на анализе реальных данных о поведении посетителей, а без трафика нечего анализировать",
            "Потому что CRO работает только для интернет-магазинов"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do gabinetu stomatologicznego. Właściciel mówi: 'Wydajemy 2000 zł miesięcznie na Google Ads, ruch jest spory, ale telefon dzwoni rzadko.' Co proponujesz?",
          "ru": "Звонишь в стоматологическую клинику. Владелец говорит: 'Тратим 2000 злотых в месяц на Google Ads, трафика много, но телефон звонит редко.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz zwiększenie budżetu na reklamę, żeby było więcej ruchu",
            "Proponujesz audyt CRO strony, na którą prowadzi reklama — sprawdzenie, dlaczego istniejący ruch nie zamienia się w telefony, zanim dołoży kolejne pieniądze w reklamę",
            "Mówisz, że stomatologia to zła branża na reklamę internetową"
          ],
          "ru": [
            "Предлагаешь увеличить рекламный бюджет, чтобы было больше трафика",
            "Предлагаешь аудит CRO страницы, на которую ведёт реклама — проверить, почему существующий трафик не превращается в звонки, прежде чем добавлять деньги в рекламу",
            "Говоришь, что стоматология — плохая ниша для интернет-рекламы"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient ma ruch, ale niską konwersję — klasyczny przypadek na CRO. Zwiększanie budżetu na reklamę bez naprawienia strony to wyrzucanie pieniędzy w tę samą dziurawą studnię.",
          "ru": "У клиента есть трафик, но низкая конверсия — классический случай для CRO. Увеличение рекламного бюджета без починки сайта — это выбрасывание денег в ту же дырявую бочку."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'A wy gwarantujecie, że po tej optymalizacji będzie więcej zapytań?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'А вы гарантируете, что после этой оптимизации будет больше заявок?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST odmawia gwarancji konkretnej liczby czy procenta — to niedopuszczalne w tej akademii. Tłumaczy, że CRO to proces oparty na hipotezach, testach i iteracjach, a nie jednorazowa magiczna zmiana z gwarantowanym wynikiem. Podkreśla, że celem jest systematyczne poprawianie wskaźnika konwersji na bazie danych, i że pierwszy audyt pokaże, ile realnie jest do poprawy. Nie używa słowa 'gwarantuję' ani nie podaje wymyślonego procenta.",
          "ru": "Хороший ответ ПРЯМО отказывается от гарантии конкретного числа или процента — это недопустимо в этой академии. Объясняет, что CRO — процесс, основанный на гипотезах, тестах и итерациях, а не разовое волшебное изменение с гарантированным результатом. Подчёркивает, что цель — систематическое улучшение показателя конверсии на основе данных, и что первый аудит покажет, сколько реально есть пространства для улучшения. Не использует слово 'гарантирую' и не называет выдуманный процент."
        }
      }
    ],
    "objections": [
      {
        "say": "Strona wygląda dobrze, o co chodzi z tą optymalizacją?",
        "ru": "Клиент путает эстетику ('выглядит хорошо') с эффективностью ('конвертирует хорошо') — фундаментальное непонимание, лежащее в основе всей услуги CRO.",
        "response": "To, że strona ładnie wygląda, i to, że ludzie na niej zostawiają kontakt, to niestety dwie różne rzeczy. Można mieć bardzo ładną stronę, na której przycisk kontaktu jest niewidoczny albo formularz jest zbyt długi — i wtedy ruch się marnuje mimo dobrego designu.",
        "responseRu": "Прямо разграничивает два разных критерия оценки сайта — красоту и конверсию — конкретными примерами (незаметная кнопка, слишком длинная форма), которые клиент легко представит.",
        "why": {
          "pl": "Konkretne przykłady (niewidoczny przycisk, długi formularz) czynią abstrakcyjny problem namacalnym.",
          "ru": "Конкретные примеры (незаметная кнопка, длинная форма) делают абстрактную проблему осязаемой."
        }
      },
      {
        "say": "A gwarantujecie, że będzie więcej zapytań po tej optymalizacji?",
        "ru": "Клиент просит гарантию результата — критический момент, где нельзя обещать конкретную цифру, но нужно дать уверенность в процессе.",
        "response": "Gwarancji konkretnej liczby nie dam, bo szczerze nikt uczciwy takiej gwarancji dać nie może — zbyt wiele zależy od punktu startowego. Mogę za to zagwarantować proces: audyt pokazujący, co dziś nie działa, konkretne hipotezy zmian i pomiar efektu każdej z nich.",
        "responseRu": "Прямо и честно отказывается от гарантии числа — важнейшая дисциплина академии. Компенсирует это гарантией прозрачного процесса вместо магических обещаний.",
        "why": {
          "pl": "Uczciwa odmowa gwarancji liczby buduje wiarygodność, a gwarancja procesu daje klientowi coś konkretnego do trzymania.",
          "ru": "Честный отказ от гарантии числа строит доверие, а гарантия процесса даёт клиенту что-то конкретное, за что держаться."
        }
      },
      {
        "say": "Nie mamy teraz budżetu na testy, wydaliśmy już sporo na reklamę.",
        "ru": "Клиент воспринимает CRO как дополнительный расход поверх уже потраченного рекламного бюджета, а не как способ защитить эти инвестиции.",
        "response": "To akurat argument za, a nie przeciw — skoro już Pan zainwestował w reklamę, szkoda żeby ten ruch się marnował na stronie, która go nie zamienia w kontakty. CRO nie dokłada kosztu do reklamy, tylko chroni to, co Pan już w nią włożył.",
        "responseRu": "Переворачивает возражение — превращает уже потраченный бюджет из причины отказа в причину согласиться, показывая, что CRO защищает уже сделанные инвестиции, а не добавляет новые.",
        "why": {
          "pl": "Reframing 'już wydanych pieniędzy' z argumentu przeciw na argument za jest psychologicznie mocny.",
          "ru": "Реформулирование 'уже потраченных денег' из аргумента против в аргумент за психологически сильно работает."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, czy wie Pan, jaki procent osób wchodzących dziś na Pana stronę faktycznie zostawia kontakt?",
      "ru": "Открывашка сразу выявляет, отслеживает ли клиент конверсию — большинство владельцев не знают этого числа, что естественно открывает разговор про CRO. Используй только с клиентами, у которых точно есть трафик (реклама, SEO, соцсети)."
    },
    "crossSell": {
      "pl": "CRO ma sens tylko przy realnym ruchu, więc naturalnie łączy się z Google Ads i Meta Ads jako ochrona już wydanego budżetu reklamowego, a razem z analityką daje pełny obraz tego, co działa, a co trzeba poprawić.",
      "ru": "CRO имеет смысл только при реальном трафике, поэтому естественно сочетается с Google Ads и Meta Ads как защита уже потраченного рекламного бюджета, а вместе с аналитикой даёт полную картину того, что работает, а что нужно улучшить."
    }
  },
  "googleads": {
    "title": {
      "pl": "Google Ads",
      "ru": "Google Ads (реклама в поиске)"
    },
    "badge": {
      "pl": "Ruch od ludzi, którzy już szukają Twojej usługi",
      "ru": "Трафик от людей, которые уже ищут твою услугу"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Kampanie reklamowe w wyszukiwarce Google, nastawione na telefon, formularz kontaktowy i rezerwacje. Reklama pokazuje się, gdy ktoś wpisuje w Google dokładnie to, czego szuka — np. 'hydraulik Warszawa' czy 'księgowość dla firm Kraków'. Proces: analiza słów kluczowych i konkurencji → budowa struktury kampanii → start → cotygodniowa optymalizacja na bazie wyników.",
          "ru": "Рекламные кампании в поисковике Google, нацеленные на звонок, форму или запись. Реклама показывается, когда кто-то вбивает в Google именно то, что ищет — например «сантехник Варшава» или «бухгалтерия для бизнеса Краков». Процесс: анализ ключевых слов и конкурентов → построение структуры кампании → запуск → еженедельная оптимизация на основе результатов."
        },
        "bullets": {
          "pl": [
            "Reklama w wynikach wyszukiwania Google, dopasowana do konkretnych zapytań",
            "Proces: analiza słów kluczowych → struktura kampanii → start → optymalizacja co tydzień",
            "Płatność za kliknięcie — budżet kontrolowany, widoczny w czasie rzeczywistym"
          ],
          "ru": [
            "Реклама в результатах поиска Google, подобранная под конкретные запросы",
            "Процесс: анализ ключевых слов → структура кампании → запуск → еженедельная оптимизация",
            "Оплата за клик — бюджет контролируется, виден в реальном времени"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, u których klient sam aktywnie szuka danej usługi w Google — usługi lokalne (hydraulik, prawnik, klinika), B2B i e-commerce. To usługa dla firm, które chcą trafiać do ludzi z gotową potrzebą, a nie budować popyt od zera.",
          "ru": "Компании, у которых клиент сам активно ищет данную услугу в Google — локальные услуги (сантехник, юрист, клиника), B2B и e-commerce. Это услуга для компаний, которые хотят попадать к людям с уже готовой потребностью, а не создавать спрос с нуля."
        },
        "bullets": {
          "pl": [
            "Usługi lokalne: hydraulik, prawnik, klinika, warsztat, biuro rachunkowe",
            "Firmy B2B, gdzie klient szuka konkretnego rozwiązania czy dostawcy",
            "Sklepy internetowe, które chcą sprzedawać konkretne produkty z wyszukiwania"
          ],
          "ru": [
            "Локальные услуги: сантехник, юрист, клиника, автосервис, бухгалтерия",
            "B2B-компании, где клиент ищет конкретное решение или поставщика",
            "Интернет-магазины, которые хотят продавать конкретные товары из поиска"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której klienci szukają danej usługi w Google, ale znajdują konkurencję, bo firma się tam po prostu nie pojawia. Rozpoznajesz to pytaniem: 'Jak myśli Pan, gdzie ludzie szukają dziś takich usług jak Pana?' — jeśli odpowiedź brzmi 'w Google', a firmy tam nie ma albo jest na drugiej stronie wyników, to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда клиенты ищут данную услугу в Google, но находят конкурентов, потому что компания там просто не появляется. Распознаётся вопросом: «Как вы думаете, где сегодня люди ищут такие услуги, как ваша?» — если ответ «в Google», а компании там нет или она на второй странице выдачи, это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient mówi 'ludzie do nas nie dzwonią, chociaż wiem, że szukają takich usług'",
            "Firmy konkurencji wyskakują na górze Google, a klient nie wie dlaczego jego nie ma",
            "Klient polega tylko na poleceniach, a to źródło ruchu jest ograniczone i niestabilne"
          ],
          "ru": [
            "Клиент говорит: 'нам не звонят, хотя я знаю, что такие услуги ищут'",
            "Конкуренты выскакивают наверху Google, а клиент не понимает, почему его там нет",
            "Клиент полагается только на рекомендации, а этот источник трафика ограничен и нестабилен"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Jak ktoś dzisiaj wpisze w Google 'usługa jaką Pan oferuje plus miasto', to czy Pana firma się tam w ogóle pokazuje?",
            "Google Ads to nie jest reklama do wszystkich — to reklama tylko dla ludzi, którzy w tej chwili aktywnie szukają tego, co Pan sprzedaje.",
            "Zaczynamy od analizy, jakich słów faktycznie szukają Pana klienci, i budujemy kampanię pod te zapytania, nie strzelamy na oślep."
          ],
          "ru": [
            "Диагностический вопрос, который заставляет клиента представить себя на месте своего потенциального клиента и сразу увидеть проблему — сильнее, чем прямое заявление 'вас не видно в Google'.",
            "Ключевое отличие от соцсетей — здесь показываешь рекламу только тем, кто уже ищет, а не всем подряд; используй, когда клиент путает Google Ads с Meta Ads.",
            "Снимает страх 'слить бюджет в никуда' — показывает, что кампания строится на данных о реальных запросах, а не наугад."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Google Ads wymaga, żeby ludzie faktycznie szukali danej usługi w wyszukiwarce — jeśli popyt praktycznie nie istnieje (produkt zupełnie nowy na rynku, nikt o nim nie szuka), kampania w wyszukiwarce nie zadziała tak jak powinna. Nie oferuj jej firmom bez strony, na którą można kierować ruch, ani z zerowym budżetem na start. Nigdy nie obiecuj konkretnej liczby leadów ani konkretnej ceny za kliknięcie — to zależy od konkurencji w danej branży i regionie.",
          "ru": "Google Ads требует, чтобы люди реально искали данную услугу в поисковике — если спроса практически нет (продукт совсем новый на рынке, никто его не ищет), поисковая кампания не сработает так, как должна. Не предлагай эту услугу компаниям без сайта, куда вести трафик, и с нулевым стартовым бюджетом. Никогда не обещай конкретное число лидов или конкретную цену за клик — это зависит от конкуренции в отрасли и регионе."
        },
        "bullets": {
          "pl": [
            "Produkt/usługa, której nikt jeszcze w Google nie szuka → najpierw budowanie świadomości (Meta Ads, TikTok Ads), potem Google Ads",
            "Firma nie ma strony ani landing page, na który można kierować ruch → najpierw strona/landing",
            "Nigdy nie obiecuj konkretnej liczby leadów ani gwarantowanej ceny za kliknięcie"
          ],
          "ru": [
            "Продукт/услугу, которую в Google ещё никто не ищет → сначала формирование спроса (Meta Ads, TikTok Ads), потом Google Ads",
            "У компании нет сайта или лендинга, куда вести трафик → сначала сайт/лендинг",
            "Никогда не обещай конкретное число лидов или гарантированную цену за клик"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Ludzie chyba szukają hydraulika w Google, ale u nas telefon prawie nie dzwoni.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Люди, наверное, ищут сантехника в Google, но у нас телефон почти не звонит.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient ma po prostu za mało klientów w swojej okolicy",
            "Firmy prawdopodobnie nie ma widocznej w wynikach wyszukiwania na te zapytania — klasyczny sygnał do Google Ads",
            "Trzeba mu zaproponować kampanię na Facebooku zamiast Google"
          ],
          "ru": [
            "У клиента просто слишком мало клиентов в его районе",
            "Компания, вероятно, не видна в результатах поиска по этим запросам — классический сигнал для Google Ads",
            "Нужно предложить кампанию в Facebook вместо Google"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego Google Ads nie ma sensu dla usługi, której nikt jeszcze nie wyszukuje w Google?",
          "ru": "Почему Google Ads не имеет смысла для услуги, которую в Google ещё никто не ищет?"
        },
        "answers": {
          "pl": [
            "Bo Google Ads zawsze jest za drogie na start",
            "Bo ta reklama pokazuje się osobom, które już aktywnie szukają danej rzeczy — bez zapytań w wyszukiwarce nie ma komu tej reklamy pokazać",
            "Bo Google Ads działa tylko dla sklepów internetowych"
          ],
          "ru": [
            "Потому что Google Ads всегда слишком дорогой для старта",
            "Потому что эта реклама показывается людям, которые уже активно что-то ищут — без запросов в поиске некому показывать эту рекламу",
            "Потому что Google Ads работает только для интернет-магазинов"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do warsztatu samochodowego. Właściciel mówi: 'Mam stronę, ale nikt przez nią do mnie nie trafia, wszyscy klienci są z poleceń.' Co proponujesz?",
          "ru": "Звонишь в автосервис. Владелец говорит: 'У меня есть сайт, но через него никто ко мне не попадает, все клиенты по рекомендациям.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz przebudowę całej strony od zera, zanim cokolwiek innego",
            "Proponujesz kampanię Google Ads, bo klienci szukający warsztatu w swojej okolicy wpisują to w wyszukiwarkę — strona już jest, więc można od razu kierować na nią ruch z konkretnych zapytań",
            "Mówisz, że polecenia to najlepsze źródło klientów i nic nie trzeba zmieniać"
          ],
          "ru": [
            "Предлагаешь перестроить весь сайт с нуля, прежде чем что-либо ещё",
            "Предлагаешь кампанию Google Ads, потому что клиенты, ищущие автосервис в своём районе, вбивают это в поиск — сайт уже есть, значит можно сразу вести на него трафик по конкретным запросам",
            "Говоришь, что рекомендации — лучший источник клиентов и менять ничего не нужно"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient ma stronę, czyli jest gdzie kierować ruch, a polega tylko na jednym, niestabilnym źródle klientów. Google Ads to naturalne rozszerzenie — dotarcie do ludzi, którzy w danym momencie aktywnie szukają warsztatu.",
          "ru": "У клиента есть сайт, то есть куда вести трафик, а полагается он только на один нестабильный источник клиентов. Google Ads — естественное расширение: охват людей, которые именно сейчас активно ищут автосервис."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'A ile dokładnie zapytań miesięcznie mi to da?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'А сколько именно заявок в месяц мне это даст?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST odmawia podania konkretnej liczby zapytań — to niedopuszczalne w tej akademii, bo zależy od konkurencji w branży, budżetu i sezonowości. Tłumaczy, że po starcie kampanii widać realne dane (koszt kliknięcia, liczba wejść, liczba konwersji) i na tej podstawie optymalizuje się kampanię co tydzień. Podkreśla zależność wyniku od budżetu i konkurencji w danej lokalizacji. Nie podaje wymyślonej liczby ani nie używa słowa 'gwarantuję'.",
          "ru": "Хороший ответ ПРЯМО отказывается назвать конкретное число заявок — это недопустимо в этой академии, так как зависит от конкуренции в отрасли, бюджета и сезонности. Объясняет, что после запуска кампании видны реальные данные (цена клика, число переходов, число конверсий), и на этой основе кампания еженедельно оптимизируется. Подчёркивает зависимость результата от бюджета и конкуренции в конкретной локации. Не называет выдуманное число и не использует слово 'гарантирую'."
        }
      }
    ],
    "objections": [
      {
        "say": "Już próbowaliśmy Google Ads i nic z tego nie było.",
        "ru": "Классическое возражение из негативного опыта — часто причина в плохой настройке кампании прошлым исполнителем (не в самом канале), это нужно выяснить, а не спорить.",
        "response": "Rozumiem, to częsty temat. Zwykle jak pytam, co dokładnie wtedy się działo, okazuje się, że kampania była ustawiona na zbyt ogólne słowa albo nikt jej nie doglądał po starcie. Mogę spojrzeć, jak to wcześniej wyglądało, i pokazać, co konkretnie było nie tak, zanim powiem, że to na pewno zadziała inaczej.",
        "responseRu": "Не спорит и не защищает канал абстрактно — предлагает конкретно посмотреть, что было не так в прошлой кампании, переводя эмоциональное возражение в диагностику.",
        "why": {
          "pl": "Zamiast bronić kanału ogólnikami, proponuje konkretną diagnozę poprzedniej kampanii — to buduje wiarygodność i przenosi rozmowę na fakty.",
          "ru": "Вместо защиты канала общими фразами предлагает конкретную диагностику прошлой кампании — это укрепляет доверие и переводит разговор в плоскость фактов."
        }
      },
      {
        "say": "To chyba drogie, jak Allegro Ads, nie stać mnie na to.",
        "ru": "Клиент путает разные рекламные платформы и предполагает высокий бюджетный порог входа — нужно развести понятия и показать гибкость бюджета.",
        "response": "Google Ads to zupełnie inny mechanizm niż reklama na Allegro — tu Pan sam ustala budżet miesięczny i płaci tylko za kliknięcia, czyli za realne wejścia na stronę, a nie za samo wyświetlenie. Zaczynamy od budżetu, który Pan czuje się komfortowo wydać, i patrzymy, jak to działa.",
        "responseRu": "Разграничивает конкретные платформы, чтобы снять неверное сравнение, и подчёркивает контроль бюджета клиентом — снижает воспринимаемый риск.",
        "why": {
          "pl": "Rozróżnienie mechanizmów (płatność za kliknięcie vs. inne modele) i podkreślenie kontroli budżetu obniża postrzegane ryzyko finansowe.",
          "ru": "Разграничение механизмов (оплата за клик против других моделей) и подчёркивание контроля над бюджетом снижает воспринимаемый финансовый риск."
        }
      },
      {
        "say": "Mam już stronę w Google, wyskakuję za darmo, po co mi płatna reklama?",
        "ru": "Клиент путает органическую видимость (SEO) с платной рекламой — нужно объяснить разницу и показать, что они работают вместе, а не заменяют друг друга.",
        "response": "To świetnie, że Pana strona się pokazuje organicznie — to zupełnie inne miejsce na stronie wyników niż reklama płatna, która jest na samej górze i widać ją jako pierwszą. Wiele firm łączy jedno z drugim, bo reklama daje wynik od razu, a pozycja organiczna buduje się miesiącami.",
        "responseRu": "Разводит SEO и платную рекламу как взаимодополняющие каналы, а не конкурирующие — снимает ощущение 'зачем платить, если и так есть'.",
        "why": {
          "pl": "Pokazanie, że oba kanały się uzupełniają, a nie wykluczają, otwiera drogę do sprzedaży bez deprecjonowania tego, co klient już ma.",
          "ru": "Показ того, что оба канала дополняют, а не исключают друг друга, открывает путь к продаже, не обесценивая то, что у клиента уже есть."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, czy wie Pan, ile osób miesięcznie szuka w Google usługi takiej jak Pana, i czy Pana firma się im wtedy pokazuje?",
      "ru": "Открывашка сразу указывает на конкретный, измеримый пробел (видимость по релевантным запросам) — работает лучше всего с локальными услугами и B2B, где есть явный поисковый спрос. Не используй с продуктами, которые никто ещё не ищет по имени."
    },
    "crossSell": {
      "pl": "Google Ads naturalnie łączy się z remarketingiem, który dogania osoby klikające w reklamę, ale niezostawiające kontaktu za pierwszym razem, a z CRO i landing page daje pewność, że ten płatny ruch faktycznie się zamienia w zapytania.",
      "ru": "Google Ads естественно сочетается с ремаркетингом, который догоняет людей, кликнувших по рекламе, но не оставивших контакт с первого раза, а вместе с CRO и лендингом даёт уверенность, что этот платный трафик реально превращается в заявки."
    }
  },
  "metaads": {
    "title": {
      "pl": "Meta Ads (Facebook i Instagram)",
      "ru": "Meta Ads (реклама в Facebook и Instagram)"
    },
    "badge": {
      "pl": "Widoczność i zapytania tam, gdzie klienci spędzają czas",
      "ru": "Узнаваемость и заявки там, где клиенты проводят время"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Kampanie reklamowe na Facebooku i Instagramie, budujące zasięg, generujące zapytania i domykające sprzedaż przez remarketing do osób, które już weszły w kontakt z marką. W przeciwieństwie do Google Ads, gdzie ludzie aktywnie czegoś szukają, tutaj reklama pokazuje się w trakcie przeglądania feedu — trzeba przyciągnąć uwagę kreacją, a nie tylko trafić w zapytanie. Proces: strategia i dobór grup odbiorców → kreacje (zdjęcia/wideo/teksty) → testy różnych wariantów → skalowanie tego, co działa.",
          "ru": "Рекламные кампании в Facebook и Instagram, создающие охват, генерирующие заявки и дожимающие продажу через ремаркетинг к людям, уже контактировавшим с брендом. В отличие от Google Ads, где люди активно что-то ищут, здесь реклама показывается во время просмотра ленты — нужно зацепить внимание креативом, а не просто попасть в запрос. Процесс: стратегия и подбор аудиторий → креативы (фото/видео/тексты) → тесты разных вариантов → масштабирование того, что работает."
        },
        "bullets": {
          "pl": [
            "Reklama w feedzie i stories na Facebooku i Instagramie, oparta na zainteresowaniach i zachowaniach odbiorców",
            "Proces: strategia → kreacje → testy → skalowanie tego, co działa",
            "Buduje rozpoznawalność marki i generuje zapytania jednocześnie"
          ],
          "ru": [
            "Реклама в ленте и историях Facebook и Instagram, основанная на интересах и поведении аудитории",
            "Процесс: стратегия → креативы → тесты → масштабирование того, что работает",
            "Строит узнаваемость бренда и одновременно генерирует заявки"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy z branż, gdzie decyzja o zakupie jest częściowo emocjonalna albo wizualna — beauty, gastronomia, e-commerce, usługi B2C. To usługa dla marek, które chcą być widoczne tam, gdzie ich klienci codziennie spędzają czas przeglądając telefon, niekoniecznie w momencie aktywnego szukania.",
          "ru": "Компании из отраслей, где решение о покупке частично эмоциональное или визуальное — бьюти, гастрономия, e-commerce, услуги B2C. Это услуга для брендов, которые хотят быть заметными там, где их клиенты ежедневно проводят время, листая телефон, необязательно в момент активного поиска."
        },
        "bullets": {
          "pl": [
            "Beauty, gastronomia i inne branże, gdzie liczy się wygląd i emocje",
            "Sklepy internetowe, które chcą pokazywać produkty konkretnym grupom odbiorców",
            "Usługi B2C, gdzie klient nie zawsze wie, że danej usługi szuka, dopóki jej nie zobaczy"
          ],
          "ru": [
            "Бьюти, гастрономия и другие отрасли, где важны внешний вид и эмоции",
            "Интернет-магазины, которые хотят показывать товары конкретным аудиториям",
            "Услуги B2C, где клиент не всегда знает, что ищет данную услугу, пока её не увидит"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której marka jest niewidoczna tam, gdzie ludzie faktycznie spędzają czas — klient może mieć świetny produkt, ale nikt o nim nie wie, bo cała jego widoczność opiera się na tych, którzy już go znają. Rozpoznajesz to pytaniem: 'Skąd biorą się nowi klienci, którzy wcześniej Pana nie znali?' — jeśli odpowiedź to głównie polecenia albo lokalizacja, a firma nie jest widoczna na Facebooku ani Instagramie, to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда бренд невиден там, где люди реально проводят время — у клиента может быть отличный продукт, но никто о нём не знает, потому что вся его видимость держится на тех, кто его уже знает. Распознаётся вопросом: «Откуда берутся новые клиенты, которые раньше вас не знали?» — если ответ в основном рекомендации или локация, а компания невидима в Facebook и Instagram, это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient mówi 'wszyscy moi klienci to stali klienci albo polecenia, nowych prawie nie mam'",
            "Firma ma słabe albo nieaktywne konto na Instagramie/Facebooku mimo dobrej oferty wizualnej",
            "Konkurencja jest widoczna w social media, a klient czuje, że traci przez to udział rynku"
          ],
          "ru": [
            "Клиент говорит: 'все мои клиенты — постоянные или по рекомендациям, новых почти нет'",
            "У компании слабый или неактивный аккаунт в Instagram/Facebook, несмотря на хорошее визуальное предложение",
            "Конкуренты заметны в соцсетях, и клиент чувствует, что теряет из-за этого долю рынка"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Pana klienci codziennie scrollują Facebooka i Instagrama, nawet jeśli akurat nie szukają Pana usługi — to jest miejsce, gdzie można im się pokazać, zanim jeszcze zaczną szukać.",
            "Nie chodzi tylko o sprzedaż od razu — pierwszy kontakt to często zbudowanie rozpoznawalności, a dopiero remarketing domyka tych, którzy już widzieli markę.",
            "Zaczynamy od testów kilku wersji kreacji na małym budżecie, i skalujemy tylko to, co faktycznie przynosi zapytania."
          ],
          "ru": [
            "Показывает разницу с Google Ads (не ждём активного поиска, а ловим внимание раньше) — используй с клиентами, у которых уже пробовали Google Ads, чтобы объяснить разницу каналов.",
            "Управляет ожиданиями: реклама в соцсетях часто работает многоступенчато (охват → ремаркетинг → заявка), а не мгновенным звонком после одного показа.",
            "Снимает страх 'слить бюджет на непроверенный креатив' — показывает дисциплину тестирования на малом бюджете перед масштабированием."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Meta Ads wymaga dobrych materiałów wizualnych (zdjęć, wideo) i jasno określonej grupy odbiorców — bez tego kreacje nie przyciągną uwagi w zatłoczonym feedzie. Nie oferuj jej firmom, które nie mają żadnych materiałów wizualnych ani możliwości ich szybkiego zrobienia, ani firmom czysto B2B z bardzo wąską, techniczną grupą docelową, gdzie Google Ads działa zwykle lepiej. Nigdy nie obiecuj konkretnej liczby zapytań ani konkretnego zasięgu — zależy to od budżetu, jakości kreacji i konkurencji o uwagę w danej branży.",
          "ru": "Meta Ads требует хороших визуальных материалов (фото, видео) и чётко определённой аудитории — без этого креативы не привлекут внимание в переполненной ленте. Не предлагай эту услугу компаниям без визуальных материалов и без возможности быстро их сделать, а также чисто B2B-компаниям с очень узкой технической аудиторией, где обычно лучше работает Google Ads. Никогда не обещай конкретное число заявок или конкретный охват — это зависит от бюджета, качества креативов и конкуренции за внимание в отрасли."
        },
        "bullets": {
          "pl": [
            "Brak jakichkolwiek materiałów wizualnych i brak możliwości ich szybkiego zrobienia → najpierw sesja zdjęciowa/wideo, potem kampania",
            "Wąska, techniczna branża B2B, gdzie decyzje zapadają inaczej niż impulsowo w social media → rozważ Google Ads zamiast lub przed Meta Ads",
            "Nigdy nie obiecuj konkretnej liczby zapytań ani konkretnego zasięgu"
          ],
          "ru": [
            "Отсутствие визуальных материалов и невозможность быстро их сделать → сначала фото/видеосъёмка, потом кампания",
            "Узкая техническая B2B-отрасль, где решения принимаются не импульсивно, как в соцсетях → рассмотри Google Ads вместо или перед Meta Ads",
            "Никогда не обещай конкретное число заявок или конкретный охват"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mam świetne produkty i dobre zdjęcia, ale poza stałymi klientami prawie nikt o mnie nie wie.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'У меня отличные продукты и хорошие фото, но кроме постоянных клиентов почти никто обо мне не знает.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient powinien obniżyć ceny, żeby przyciągnąć nowych klientów",
            "Marka jest niewidoczna tam, gdzie mogliby ją zobaczyć nowi klienci — klasyczny sygnał do Meta Ads, tym bardziej że ma dobre zdjęcia",
            "Klient powinien zamknąć social media i skupić się tylko na poleceniach"
          ],
          "ru": [
            "Клиенту нужно снизить цены, чтобы привлечь новых клиентов",
            "Бренд невиден там, где его могли бы увидеть новые клиенты — классический сигнал для Meta Ads, тем более что есть хорошие фото",
            "Клиенту нужно закрыть соцсети и сосредоточиться только на рекомендациях"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego Meta Ads zwykle działa gorzej niż Google Ads dla wąskiej, technicznej firmy B2B sprzedającej np. części do maszyn przemysłowych?",
          "ru": "Почему Meta Ads обычно работает хуже, чем Google Ads, для узкой технической B2B-компании, продающей, например, детали для промышленных машин?"
        },
        "answers": {
          "pl": [
            "Bo Meta Ads jest zawsze droższe niż Google Ads",
            "Bo w social media ludzie nie szukają aktywnie takiego produktu, a bardzo wąska grupa decydentów B2B może być trudna do trafienia poprzez zainteresowania i zachowania w feedzie",
            "Bo Facebook i Instagram nie pozwalają na reklamę dla firm B2B"
          ],
          "ru": [
            "Потому что Meta Ads всегда дороже, чем Google Ads",
            "Потому что в соцсетях люди не ищут такой продукт активно, а очень узкую группу B2B-лиц, принимающих решения, может быть сложно охватить через интересы и поведение в ленте",
            "Потому что Facebook и Instagram не позволяют показывать рекламу для B2B-компаний"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do salonu kosmetycznego. Właścicielka mówi: 'Mam ładny Instagram, ale rośnie bardzo wolno, a chciałabym więcej nowych klientek na zabiegi.' Co proponujesz?",
          "ru": "Звонишь в косметический салон. Владелица говорит: 'У меня красивый Instagram, но растёт очень медленно, а хотелось бы больше новых клиенток на процедуры.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz, żeby publikowała więcej postów organicznie i poczekała, aż konto samo urośnie",
            "Proponujesz kampanię Meta Ads wykorzystującą jej istniejące zdjęcia i materiały, kierowaną do kobiet w okolicy zainteresowanych danym typem zabiegów",
            "Mówisz, że Instagram nie działa dla branży beauty i lepiej postawić na ulotki"
          ],
          "ru": [
            "Предлагаешь публиковать больше постов органически и подождать, пока аккаунт вырастет сам",
            "Предлагаешь кампанию Meta Ads, использующую её существующие фото и материалы, нацеленную на женщин в районе, интересующихся данным типом процедур",
            "Говоришь, что Instagram не работает для бьюти-отрасли и лучше сделать листовки"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klientka ma dobre materiały wizualne, czyli podstawę do kreacji, a organiczny wzrost jest zbyt wolny na jej potrzeby. Meta Ads pozwala precyzyjnie kierować te materiały do lokalnej grupy odbiorców zainteresowanych zabiegami.",
          "ru": "У клиентки есть хорошие визуальные материалы, то есть основа для креативов, а органический рост слишком медленный для её нужд. Meta Ads позволяет точно направлять эти материалы на локальную аудиторию, интересующуюся процедурами."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A jak dokładnie liczycie, ile osób kupi dzięki tej reklamie?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А как именно вы считаете, сколько человек купит благодаря этой рекламе?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST unika podania konkretnej liczby sprzedaży czy konwersji — to niedopuszczalne w tej akademii, bo wynik zależy od jakości kreacji, budżetu i konkurencji o uwagę w feedzie. Tłumaczy, że mierzy się realne wskaźniki (zasięg, kliknięcia, zapytania, koszt pozyskania kontaktu) i optymalizuje kampanię na bazie testów różnych kreacji i grup odbiorców. Nie obiecuje konkretnej liczby klientów ani nie używa słowa 'gwarantuję'.",
          "ru": "Хороший ответ ПРЯМО избегает называть конкретное число продаж или конверсий — это недопустимо в этой академии, так как результат зависит от качества креативов, бюджета и конкуренции за внимание в ленте. Объясняет, что измеряются реальные показатели (охват, клики, заявки, стоимость привлечения контакта), и кампания оптимизируется на основе тестов разных креативов и аудиторий. Не обещает конкретное число клиентов и не использует слово 'гарантирую'."
        }
      }
    ],
    "objections": [
      {
        "say": "Mam już Instagram, sam się rozwija, po co mi płacić za reklamę?",
        "ru": "Клиент путает органический рост в соцсетях с платной рекламой — считает, что раз аккаунт уже существует, реклама не нужна; важно показать разницу в скорости и охвате.",
        "response": "To, że ma Pani konto i publikuje Pani posty, to dobra baza — ale organiczny zasięg dziś dociera głównie do osób, które już Panią obserwują. Reklama pozwala pokazać te same treści osobom, które jeszcze Pani nie znają, a mieszkają blisko i pasują do profilu klientki.",
        "responseRu": "Разграничивает 'публиковать посты' и 'показываться новым людям' — не критикует то, что клиент уже делает, а достраивает к этому недостающий элемент охвата.",
        "why": {
          "pl": "Docenienie tego, co klient już robi (konto, posty), zanim pokaże się lukę (brak zasięgu do nowych osób), obniża opór.",
          "ru": "Признание того, что клиент уже делает (аккаунт, посты), прежде чем показать пробел (нет охвата новых людей), снижает сопротивление."
        }
      },
      {
        "say": "Boję się, że reklama w social media to strzał w ciemno i wydam pieniądze na nic.",
        "ru": "Страх непредсказуемого результата — типичен для клиентов, не имевших опыта с платной рекламой в соцсетях; нужно показать, что процесс контролируемый, а не азартная игра.",
        "response": "Rozumiem tę obawę, dlatego nie zaczynamy od dużego budżetu na jedną kreację. Testujemy kilka wersji zdjęć i tekstów na małej kwocie, patrzymy, co faktycznie przyciąga uwagę, i dopiero to, co działa, skalujemy dalej.",
        "responseRu": "Отвечает на страх конкретным описанием методичного процесса тестирования на малом бюджете — превращает 'выстрел в темноту' в управляемый эксперимент.",
        "why": {
          "pl": "Konkretny opis procesu testowania na małym budżecie zamienia abstrakcyjny lęk w konkretny, kontrolowany plan działania.",
          "ru": "Конкретное описание процесса тестирования на малом бюджете превращает абстрактный страх в конкретный, управляемый план действий."
        }
      },
      {
        "say": "U mnie klienci nie kupują przez internet, muszą przyjść osobiście, więc reklama w social media mi nie pomoże.",
        "ru": "Клиент путает 'покупка онлайн' с 'узнал онлайн, пришёл офлайн' — частое возражение у локального бизнеса (салоны, гастрономия); нужно объяснить, что реклама ведёт не к продаже в моменте, а к записи/визиту.",
        "response": "Reklama w social media nie musi kończyć się zakupem online — u wielu naszych klientów z usług lokalnych kończy się telefonem, wiadomością albo rezerwacją wizyty, a sama transakcja i tak dzieje się na miejscu.",
        "responseRu": "Прямо переформулирует цель рекламы с 'онлайн-продажа' на 'офлайн-визит через звонок/запись' — устраняет ложную предпосылку возражения.",
        "why": {
          "pl": "Przeformułowanie celu reklamy z 'sprzedaży online' na 'umówienia wizyty' usuwa fałszywe założenie leżące u podstaw zastrzeżenia.",
          "ru": "Переформулирование цели рекламы с 'онлайн-продажи' на 'запись на визит' устраняет ложное предположение, лежащее в основе возражения."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — widziałem Pana profil na Instagramie, ma Pan naprawdę dobre zdjęcia. Chciałem zapytać, czy te zdjęcia dziś w ogóle trafiają do nowych osób, czy tylko do tych, którzy już Pana obserwują?",
      "ru": "Открывашка начинается с конкретного, персонализированного комплимента (важно реально посмотреть профиль перед звонком) и сразу переходит к диагностике охвата — работает лучше всего с визуальными отраслями (бьюти, гастрономия), где уже есть какой-то контент."
    },
    "crossSell": {
      "pl": "Meta Ads dobrze łączy się z TikTok Ads przy młodszej grupie odbiorców oraz z remarketingiem, który domyka osoby klikające w reklamę, ale niedecydujące się od razu, a dobre kreacje wideo warto wesprzeć usługą anim3d albo copywriting.",
      "ru": "Meta Ads хорошо сочетается с TikTok Ads при более молодой аудитории и с ремаркетингом, который дожимает людей, кликнувших по рекламе, но не решившихся сразу, а хорошие видеокреативы стоит подкрепить услугами anim3d или copywriting."
    }
  },
  "tiktokads": {
    "title": {
      "pl": "TikTok Ads",
      "ru": "TikTok Ads (реклама в TikTok)"
    },
    "badge": {
      "pl": "Tani zasięg u młodszej grupy klientów",
      "ru": "Недорогой охват молодой аудитории"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Kampanie wideo na TikToku, oparte na natywnych, krótkich kreacjach, które wyglądają jak zwykłe filmiki, a nie jak klasyczna reklama — to warunek, żeby w ogóle ktoś je obejrzał do końca. Proces: koncepcje kreatywne dopasowane do platformy → produkcja wideo → testy kilku wariantów → optymalizacja na bazie tego, co ludzie faktycznie oglądają i z czym wchodzą w interakcję.",
          "ru": "Видеокампании в TikTok, основанные на нативных коротких креативах, которые выглядят как обычные ролики, а не как классическая реклама — это условие, чтобы их вообще досмотрели до конца. Процесс: креативные концепции, подходящие под платформу → производство видео → тесты нескольких вариантов → оптимизация на основе того, что люди реально смотрят и с чем взаимодействуют."
        },
        "bullets": {
          "pl": [
            "Krótkie, natywne wideo, które nie wygląda jak klasyczna reklama",
            "Proces: koncepcje → produkcja wideo → testy → optymalizacja",
            "Zwykle tańszy zasięg niż inne platformy, szczególnie u młodszej grupy"
          ],
          "ru": [
            "Короткое нативное видео, не похожее на классическую рекламу",
            "Процесс: концепции → производство видео → тесты → оптимизация",
            "Обычно более дешёвый охват, чем на других площадках, особенно у молодой аудитории"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Marki B2C, e-commerce, edukacja i beauty, których klientem jest młodsza grupa odbiorców — nastolatkowie i osoby w wieku 20-35 lat, które spędzają na TikToku dużo czasu, ale rzadko oglądają telewizję czy klasyczne reklamy. To usługa dla firm, które chcą dotrzeć tam, gdzie starsze kanały reklamowe już nie sięgają.",
          "ru": "Бренды B2C, e-commerce, образование и бьюти, чей клиент — более молодая аудитория: подростки и люди 20-35 лет, проводящие в TikTok много времени, но редко смотрящие телевизор или классическую рекламу. Это услуга для компаний, которые хотят охватить тех, до кого уже не дотягиваются старые рекламные каналы."
        },
        "bullets": {
          "pl": [
            "Marki B2C kierowane do klientów w wieku ok. 16-35 lat",
            "E-commerce, edukacja i beauty z produktem, który dobrze pokazać w wideo",
            "Firmy, które chcą dotrzeć do młodszej grupy, niedostępnej przez klasyczne kanały"
          ],
          "ru": [
            "Бренды B2C, ориентированные на клиентов примерно 16-35 лет",
            "E-commerce, образование и бьюти с продуктом, который хорошо показать на видео",
            "Компании, которые хотят охватить молодую аудиторию, недоступную через классические каналы"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której firma nie potrafi dotrzeć do młodszej grupy klientów — jej dotychczasowe kanały (Facebook, ulotki, reklama lokalna) trafiają głównie do starszych odbiorców, a młodsi klienci po prostu nie widzą marki. Rozpoznajesz to pytaniem: 'Czy zauważa Pan, że młodsi klienci trafiają do Pana rzadziej niż starsi?' — jeśli tak, i firma nigdy nie próbowała TikToka, to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда компания не может достучаться до молодой аудитории — её нынешние каналы (Facebook, листовки, локальная реклама) охватывают в основном более старших людей, а молодые клиенты просто не видят бренд. Распознаётся вопросом: «Замечаете ли вы, что молодые клиенты приходят к вам реже, чем старшие?» — если да, и компания никогда не пробовала TikTok, это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient mówi 'moi klienci to głównie starsze osoby, młodszych prawie nie mam'",
            "Firma inwestuje w Facebooka, ale zauważa, że młodsza grupa tam już prawie nie zagląda",
            "Konkurencja skierowana do młodszych klientów jest widoczna na TikToku, a klient tego kanału w ogóle nie próbował"
          ],
          "ru": [
            "Клиент говорит: 'мои клиенты в основном постарше, молодых почти нет'",
            "Компания инвестирует в Facebook, но замечает, что молодая аудитория туда почти не заходит",
            "Конкуренты, ориентированные на молодых клиентов, заметны в TikTok, а клиент этот канал вообще не пробовал"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Jeśli Pana klienci mają poniżej trzydziestu paru lat, to duża ich część dziś jest głównie na TikToku, a nie na Facebooku.",
            "Reklama na TikToku musi wyglądać jak zwykły filmik, a nie jak baner — inaczej ludzie przewijają dalej w sekundę, dlatego zaczynamy od dobrego pomysłu na wideo, nie od budżetu.",
            "To zwykle tańszy sposób na zasięg niż starsze platformy, więc dobrze sprawdza się jako dodatkowy kanał obok tego, co już Pan robi."
          ],
          "ru": [
            "Прямо связывает канал с демографией клиента — используй как быструю диагностику: если аудитория старше 40, TikTok Ads, скорее всего, не подходит.",
            "Управляет ожиданиями по формату — клиент может представлять рекламу как баннер; важно с самого начала объяснить требование нативности видео.",
            "Позиционирует TikTok как дополнительный, а не единственный канал — снижает риск восприятия как замены существующего маркетинга."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "TikTok Ads wymaga produkcji wideo i zgody na styl, który jest lekki, nieformalny i szybki — nie każda firma czuje się z tym komfortowo, a nie każdy produkt się do tego nadaje. Nie oferuj tej usługi firmom, których klienci są głównie starsi (50+) albo które sprzedają bardzo formalne usługi B2B. Nigdy nie obiecuj konkretnej liczby wyświetleń czy konkretnego kosztu dotarcia — zależy to od jakości kreacji, branży i konkurencji o uwagę.",
          "ru": "TikTok Ads требует производства видео и готовности к стилю, который лёгкий, неформальный и быстрый — не каждой компании это комфортно, и не каждый продукт для этого подходит. Не предлагай эту услугу компаниям, чьи клиенты в основном старше (50+), или тем, кто продаёт очень формальные B2B-услуги. Никогда не обещай конкретное число показов или конкретную стоимость охвата — это зависит от качества креативов, отрасли и конкуренции за внимание."
        },
        "bullets": {
          "pl": [
            "Klienci firmy są głównie w wieku 50+ → TikTok raczej nie dotrze do nich w istotnej skali, lepiej Meta Ads albo Google Ads",
            "Bardzo formalna branża B2B, gdzie styl TikToka nie pasuje do wizerunku → rozważ inne kanały",
            "Nigdy nie obiecuj konkretnej liczby wyświetleń ani kosztu dotarcia do jednej osoby"
          ],
          "ru": [
            "Клиенты компании в основном 50+ → TikTok вряд ли охватит их в значимом масштабе, лучше Meta Ads или Google Ads",
            "Очень формальная B2B-отрасль, где стиль TikTok не подходит имиджу → рассмотри другие каналы",
            "Никогда не обещай конкретное число показов или стоимость охвата одного человека"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Moi klienci to głównie osoby koło dwudziestki, ale cała moja reklama idzie na Facebooka.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Мои клиенты в основном около двадцати лет, но вся моя реклама идёт в Facebook.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient robi wszystko dobrze i nie trzeba nic zmieniać",
            "Kanał reklamowy nie pasuje do wieku odbiorców — klasyczny sygnał do TikTok Ads",
            "Facebook zawsze jest lepszym wyborem niż TikTok, niezależnie od wieku klientów"
          ],
          "ru": [
            "Клиент делает всё правильно, и менять ничего не нужно",
            "Рекламный канал не соответствует возрасту аудитории — классический сигнал для TikTok Ads",
            "Facebook всегда лучший выбор, чем TikTok, независимо от возраста клиентов"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego reklama na TikToku, która wygląda jak klasyczny, sztywny baner reklamowy, zwykle działa słabo?",
          "ru": "Почему реклама в TikTok, которая выглядит как классический, жёсткий рекламный баннер, обычно работает слабо?"
        },
        "answers": {
          "pl": [
            "Bo TikTok technicznie nie pozwala wyświetlać takich reklam",
            "Bo użytkownicy TikToka oczekują treści, które wyglądają jak naturalne, krótkie filmiki, a reklamę wyglądającą inaczej po prostu przewijają dalej",
            "Bo banery reklamowe są zawsze droższe w produkcji niż wideo"
          ],
          "ru": [
            "Потому что TikTok технически не позволяет показывать такую рекламу",
            "Потому что пользователи TikTok ожидают контент, похожий на естественные короткие ролики, а рекламу, которая выглядит иначе, просто пролистывают",
            "Потому что рекламные баннеры всегда дороже в производстве, чем видео"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do marki odzieżowej dla nastolatków. Właściciel mówi: 'Mamy fajne ubrania, ale cała nasza reklama to Facebook, a mam wrażenie, że młodzi tam już prawie nie siedzą.' Co proponujesz?",
          "ru": "Звонишь в бренд одежды для подростков. Владелец говорит: 'У нас классная одежда, но вся наша реклама в Facebook, а у меня ощущение, что молодёжь там уже почти не сидит.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz zwiększenie budżetu na Facebooku, żeby dotrzeć do większej liczby osób",
            "Proponujesz kampanię TikTok Ads z natywnymi wideo, bo to kanał, w którym faktycznie jest jego docelowa, młodsza grupa klientów",
            "Mówisz, że dla marki odzieżowej żadna reklama internetowa nie ma sensu"
          ],
          "ru": [
            "Предлагаешь увеличить бюджет в Facebook, чтобы охватить больше людей",
            "Предлагаешь кампанию TikTok Ads с нативными видео, потому что это канал, где реально находится его целевая, более молодая аудитория",
            "Говоришь, что для бренда одежды никакая интернет-реклама не имеет смысла"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient trafnie zauważa niedopasowanie kanału do wieku odbiorców. TikTok Ads to naturalne rozwiązanie dla marki kierowanej do nastolatków i młodych dorosłych.",
          "ru": "Клиент верно замечает несоответствие канала возрасту аудитории. TikTok Ads — естественное решение для бренда, ориентированного на подростков и молодых взрослых."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A ile dokładnie osób obejrzy nasze wideo i ile z nich kupi?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А сколько именно человек посмотрит наше видео и сколько из них купит?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST unika podania konkretnej liczby wyświetleń czy sprzedaży — to niedopuszczalne w tej akademii, bo zależy od jakości i chwytliwości kreacji, budżetu oraz tego, jak platforma oceni dopasowanie treści do odbiorców. Tłumaczy, że zaczyna się od testów kilku wariantów wideo na mniejszym budżecie i skaluje się to, co faktycznie przyciąga uwagę i interakcje. Nie podaje wymyślonej liczby ani nie używa słowa 'gwarantuję'.",
          "ru": "Хороший ответ ПРЯМО избегает называть конкретное число показов или продаж — это недопустимо в этой академии, так как зависит от качества и цепляющести креатива, бюджета и того, как платформа оценит соответствие контента аудитории. Объясняет, что начинается с тестов нескольких видеовариантов на меньшем бюджете, и масштабируется то, что реально привлекает внимание и вовлечённость. Не называет выдуманное число и не использует слово 'гарантирую'."
        }
      }
    ],
    "objections": [
      {
        "say": "Nie mam nikogo, kto zrobi mi takie wideo jak na TikToku, to nie dla mnie.",
        "ru": "Клиент воспринимает продакшн видео как непреодолимое препятствие — не знает, что студия сама берёт на себя производство; нужно снять эту преграду сразу.",
        "response": "To akurat bierzemy na siebie — od koncepcji, przez nagranie, po montaż. Pana rola to głównie pokazać nam produkt czy miejsce, a resztą się zajmujemy, bo wiemy, jaki styl wideo faktycznie działa na TikToku.",
        "responseRu": "Прямо снимает воспринимаемое препятствие (нет ресурсов на продакшн), беря производство на себя и определяя минимальную роль клиента — уменьшает воспринимаемую сложность.",
        "why": {
          "pl": "Usunięcie konkretnej bariery (brak zasobów produkcyjnych) i jasne określenie minimalnej roli klienta zmniejsza opór przed rozpoczęciem współpracy.",
          "ru": "Устранение конкретного барьера (нет производственных ресурсов) и чёткое определение минимальной роли клиента снижает сопротивление перед началом сотрудничества."
        }
      },
      {
        "say": "TikTok to chyba tylko dla nastolatków tańczących, moja firma to nie pasuje.",
        "ru": "Клиент стереотипно сужает платформу до вирусных танцевальных роликов — нужно расширить представление до формата рекламы под конкретный бизнес.",
        "response": "TikTok faktycznie zaczynał od tańców, ale dziś jest tam mnóstwo firm z bardzo różnych branż, które po prostu pokazują swój produkt czy usługę w krótkiej, naturalnej formie — nie chodzi o tańczenie, tylko o pokazanie tego, co Pan sprzedaje, w stylu, który pasuje do platformy.",
        "responseRu": "Признаёт исходное восприятие как частично верное историческое, но сразу обновляет его текущей реальностью платформы — снимает стереотип без спора.",
        "why": {
          "pl": "Uznanie ziarna prawdy w stereotypie klienta, zanim pokaże się aktualny obraz platformy, brzmi bardziej wiarygodnie niż zaprzeczenie wprost.",
          "ru": "Признание доли правды в стереотипе клиента перед показом актуальной картины платформы звучит убедительнее, чем прямое отрицание."
        }
      },
      {
        "say": "Moi klienci to raczej osoby po czterdziestce, po co mi TikTok?",
        "ru": "Валидное возражение по демографии — здесь важно НЕ пытаться продать TikTok любой ценой, а честно признать несоответствие и предложить альтернативу (тест на честность академии).",
        "response": "Ma Pan rację, że przy takiej grupie wiekowej TikTok raczej nie będzie priorytetem — w tym przypadku lepiej sprawdzi się Meta Ads albo Google Ads, gdzie faktycznie jest Pana grupa odbiorców. TikTok wracałby do rozmowy, gdyby zależało Panu też na młodszych klientach.",
        "responseRu": "Честно соглашается с клиентом вместо того, чтобы продавливать неподходящий канал — редкий, но важный момент академии: не каждое возражение нужно 'преодолевать', иногда клиент прав.",
        "why": {
          "pl": "Uczciwe przyznanie racji klientowi, gdy ma rację, buduje długoterminowe zaufanie i otwiera drzwi do sprzedaży innej, trafniejszej usługi.",
          "ru": "Честное согласие с клиентом, когда он прав, строит долгосрочное доверие и открывает дверь к продаже другой, более подходящей услуги."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, jaka część Pana klientów jest w wieku dwadzieścia-trzydzieści parę lat, i czy próbował Pan już dotrzeć do nich przez TikToka?",
      "ru": "Открывашка сразу фильтрует релевантность — если аудитория молодая, разговор продолжается про TikTok Ads; если нет, честно переключись на Google Ads или Meta Ads. Не звони с этим открывашкой в компании с явно возрастной клиентурой."
    },
    "crossSell": {
      "pl": "TikTok Ads dobrze uzupełnia się z Meta Ads jako drugi kanał dotarcia do młodszej grupy, a wyprodukowane wideo można później wykorzystać też w kampaniach Meta Ads i na stronie, więc warto to połączyć z anim3d albo copywriting przy tworzeniu scenariuszy.",
      "ru": "TikTok Ads хорошо дополняет Meta Ads как второй канал охвата молодой аудитории, а произведённое видео потом можно использовать и в кампаниях Meta Ads, и на сайте, поэтому стоит сочетать это с anim3d или copywriting при создании сценариев."
    }
  },
  "seo": {
    "title": {
      "pl": "SEO (pozycjonowanie)",
      "ru": "SEO (поисковая оптимизация)"
    },
    "badge": {
      "pl": "Ruch z Google, za który nie płacisz za każde kliknięcie",
      "ru": "Трафик из Google, за который не платишь за каждый клик"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Optymalizacja techniczna strony, dobór i pisanie treści pod frazy, których faktycznie szukają klienci, oraz budowanie linków i autorytetu domeny — wszystko po to, żeby strona pojawiała się wyżej w wynikach wyszukiwania Google. To proces, nie jednorazowa poprawka: zaczynamy od audytu, ustalamy plan fraz, poprawiamy stronę, publikujemy treści i cały czas monitorujemy, co się dzieje z pozycjami.",
          "ru": "Техническая оптимизация сайта, подбор и написание текстов под запросы, которые реально ищут клиенты, а также наращивание ссылок и авторитета домена — всё для того, чтобы сайт появлялся выше в результатах поиска Google. Это процесс, а не разовая правка: начинаем с аудита, составляем план по фразам, дорабатываем сайт, публикуем контент и постоянно следим за позициями."
        },
        "bullets": {
          "pl": [
            "Audyt techniczny, dobór fraz, optymalizacja, treści i monitoring pozycji",
            "Efekt buduje się w miesiącach, nie w dniach czy tygodniach",
            "Im wyższa konkurencja frazy, tym dłużej i drożej trzeba nad nią pracować"
          ],
          "ru": [
            "Технический аудит, подбор фраз, оптимизация, контент и мониторинг позиций",
            "Результат формируется месяцами, а не днями или неделями",
            "Чем выше конкуренция по фразе, тем дольше и дороже над ней работать"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, które myślą długoterminowo i chcą mieć stabilne źródło ruchu, niezależne od tego, czy akurat płacą za reklamę. To dobra usługa dla klientów, którzy już próbowali reklamy płatnej i wiedzą, że ruch znika, gdy tylko wyłączą kampanię — a chcą czegoś, co zostaje z nimi na dłużej.",
          "ru": "Компании, которые думают на перспективу и хотят иметь стабильный источник трафика, независимый от того, платят ли они сейчас за рекламу. Это хорошая услуга для клиентов, которые уже пробовали платную рекламу и знают, что трафик исчезает, как только выключаешь кампанию, — и хотят чего-то, что остаётся с ними надолго."
        },
        "bullets": {
          "pl": [
            "Firmy nastawione na wynik długoterminowy, nie na 'szybki telefon jutro'",
            "Klienci, którzy już płacili za reklamę i wiedzą, że ruch znika po wyłączeniu kampanii",
            "Branże z realną konkurencją w wyszukiwarce, gdzie warto o pozycje powalczyć"
          ],
          "ru": [
            "Компании, ориентированные на долгосрочный результат, а не на 'быстрый звонок завтра'",
            "Клиенты, которые уже платили за рекламу и знают, что трафик исчезает после выключения кампании",
            "Ниши с реальной конкуренцией в поиске, где есть смысл бороться за позиции"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której firma po prostu nie istnieje w wynikach wyszukiwania — klient wpisuje frazę związaną z branżą i nie widzi tam swojej strony, tylko konkurencję. Rozpoznajesz to pytaniem: 'Jak Pana firma wygląda, jak ktoś wpisze w Google to, czym się Pan zajmuje, plus miasto?' Jeśli klient milczy albo mówi 'szczerze, nie sprawdzałem' — to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда компания просто не существует в результатах поиска — клиент вводит запрос, связанный с нишей, и не видит там своего сайта, только конкурентов. Распознаётся вопросом: 'Как выглядит ваша компания, если кто-то вобьёт в Google то, чем вы занимаетесь, плюс город?' Если клиент молчит или говорит 'честно, не проверял' — это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Strona firmy nie pojawia się w wynikach wyszukiwania na frazy związane z branżą",
            "Klient nie wie, na jakiej pozycji jest jego strona ani czy w ogóle tam jest",
            "Cały ruch klienta idzie tylko z reklamy albo z poleceń, zero z wyszukiwarki"
          ],
          "ru": [
            "Сайт компании не появляется в результатах поиска по отраслевым запросам",
            "Клиент не знает, на какой позиции его сайт и появляется ли он вообще",
            "Весь трафик клиента идёт только из рекламы или рекомендаций, ноль из поиска"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Niech Pan sam spróbuje: proszę wpisać w Google to, czym się Pan zajmuje, i miasto. Jeśli Pana strony tam nie ma, to znaczy, że klienci trafiają dziś do konkurencji, a nie do Pana.",
            "SEO to nie jest coś, co zadziała jutro — mówię to od razu szczerze. To praca na kilka miesięcy, ale efekt zostaje i nie znika, jak tylko przestanie Pan płacić, tak jak w przypadku reklamy.",
            "Zaczynamy od audytu strony i sprawdzenia, na jakie frazy realnie ma Pan szansę się przebić — dopiero potem układamy plan, ile to potrwa i ile będzie kosztować."
          ],
          "ru": [
            "Живая демонстрация — предлагаешь клиенту прямо во время звонка ввести запрос и убедиться в отсутствии своего сайта. Личное открытие проблемы работает сильнее любого рассказа о ней.",
            "Ключевая фраза дисциплины продаж SEO — сразу честно обозначить, что результат не мгновенный. Это фильтрует клиентов с нереалистичными ожиданиями и строит доверие через честность.",
            "Показывает, что решение начинается с диагностики (аудит фраз), а не с продажи абстрактного 'позиционирования' — снимает ощущение, что покупаешь кота в мешке."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nigdy nie obiecuj konkretnej pozycji w Google ani konkretnego terminu — to zależy od konkurencji frazy i punktu startowego, a fałszywa obietnica wybuchnie po dwóch miesiącach, gdy klient zacznie pytać, gdzie jest 'top 1'. Nie oferuj SEO klientowi, który potrzebuje wyniku w tym miesiącu — to zwyczajnie nie ten produkt.",
          "ru": "Никогда не обещай конкретную позицию в Google или конкретный срок — это зависит от конкуренции по фразе и стартовой точки, а ложное обещание взорвётся через два месяца, когда клиент начнёт спрашивать, где 'топ 1'. Не предлагай SEO клиенту, которому нужен результат в этом месяце, — это просто не тот продукт."
        },
        "bullets": {
          "pl": [
            "Klient potrzebuje wyniku w tym miesiącu → zaproponuj Google Ads albo GBP, SEO to za wolno",
            "Nigdy nie obiecuj konkretnej pozycji w Google ani konkretnej daty jej osiągnięcia",
            "Firma nie ma jeszcze gotowej strony → najpierw strona, dopiero potem sensownie da się robić SEO"
          ],
          "ru": [
            "Клиенту нужен результат в этом месяце → предложи Google Ads или GBP, SEO слишком медленное",
            "Никогда не обещай конкретную позицию в Google или конкретную дату её достижения",
            "У компании ещё нет готового сайта → сначала сайт, только потом имеет смысл заниматься SEO"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Chcę być na pierwszym miejscu w Google w ciągu dwóch tygodni.' Co robisz?",
          "ru": "Клиент говорит: 'Хочу быть на первом месте в Google в течение двух недель.' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Obiecujesz to, żeby domknąć sprzedaż, a szczegóły ustalisz później",
            "Tłumaczysz uczciwie, że SEO działa w miesiącach, nie tygodniach, i proponujesz np. Google Ads albo GBP jako szybsze uzupełnienie",
            "Mówisz, że to niemożliwe i kończysz rozmowę"
          ],
          "ru": [
            "Обещаешь это, чтобы закрыть продажу, а детали решишь потом",
            "Честно объясняешь, что SEO работает месяцами, а не неделями, и предлагаешь, например, Google Ads или GBP как более быстрое дополнение",
            "Говоришь, что это невозможно, и заканчиваешь разговор"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego cena SEO zależy od konkurencyjności fraz, a nie jest stałą kwotą dla każdej firmy?",
          "ru": "Почему цена SEO зависит от конкурентности фраз, а не является фиксированной суммой для каждой компании?"
        },
        "answers": {
          "pl": [
            "Bo agencje po prostu ustalają ceny losowo",
            "Bo im więcej firm walczy o te same frazy, tym więcej pracy (treści, linki, optymalizacja) trzeba włożyć, żeby się przebić",
            "Bo cena zależy wyłącznie od wielkości firmy klienta"
          ],
          "ru": [
            "Потому что агентства просто устанавливают цены случайно",
            "Потому что чем больше компаний борется за одни и те же фразы, тем больше работы (контент, ссылки, оптимизация) нужно вложить, чтобы пробиться",
            "Потому что цена зависит исключительно от размера компании клиента"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do firmy remontowej. Właściciel mówi: 'Mamy ładną stronę, robiliście ją Wy zresztą, ale jak wpisuję w Google \"remonty mieszkań Kraków\", to nas nigdzie nie widać, tylko konkurencja.' Co proponujesz?",
          "ru": "Звонишь в ремонтную компанию. Владелец говорит: 'У нас красивый сайт, вы же его и делали, но когда вбиваю в Google \"ремонт квартир Краков\", нас нигде не видно, только конкуренты.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz zrobić nową stronę, bo ta obecna musi być wadliwa",
            "Proponujesz SEO — audyt strony pod kątem tej i podobnych fraz, plan treści i optymalizacji, żeby zacząć się pojawiać w wynikach na frazy związane z lokalizacją i usługą",
            "Mówisz, że w budowlance SEO nie działa i lepiej dać spokój"
          ],
          "ru": [
            "Предлагаешь сделать новый сайт, потому что нынешний наверняка с изъяном",
            "Предлагаешь SEO — аудит сайта под этот и похожие запросы, план по контенту и оптимизации, чтобы начать появляться в результатах по запросам, связанным с локацией и услугой",
            "Говоришь, что в строительной нише SEO не работает, и лучше оставить как есть"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Strona istnieje i wygląda dobrze, ale nie jest widoczna na kluczowe frazy — to nie problem designu, tylko brak optymalizacji pod wyszukiwanie i najprawdopodobniej brak treści pod te frazy. Dokładnie to naprawia SEO.",
          "ru": "Сайт существует и хорошо выглядит, но не виден по ключевым фразам — это не проблема дизайна, а отсутствие оптимизации под поиск и, скорее всего, отсутствие контента под эти фразы. Именно это исправляет SEO."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'Jak szybko będę na pierwszej stronie Google?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'Как быстро я окажусь на первой странице Google?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź NIE podaje konkretnej liczby tygodni ani nie obiecuje pierwszej strony czy konkretnej pozycji — to niedopuszczalne w tej akademii. Wyjaśnia, że efekty SEO widać zwykle po kilku miesiącach, a tempo zależy od konkurencyjności fraz i stanu strony na starcie. Podkreśla, że proces zaczyna się od audytu, który pokaże realny punkt wyjścia, i że pierwsze efekty (np. wzrost ruchu) pojawiają się wcześniej niż konkretne wysokie pozycje. Nie używa słów 'gwarantuję' ani nie podaje wymyślonej daty.",
          "ru": "Хороший ответ НЕ называет конкретное число недель и не обещает первую страницу или конкретную позицию — это недопустимо в этой академии. Объясняет, что эффект SEO обычно виден через несколько месяцев, а темп зависит от конкурентности фраз и состояния сайта на старте. Подчёркивает, что процесс начинается с аудита, который покажет реальную стартовую точку, и что первые эффекты (например, рост трафика) появляются раньше, чем конкретные высокие позиции. Не использует слово 'гарантирую' и не называет выдуманную дату."
        }
      }
    ],
    "objections": [
      {
        "say": "SEO trwa wieki, nie mam na to czasu czekać.",
        "ru": "Классическое возражение против SEO — клиент прав насчёт скорости, поэтому не стоит спорить с фактом, а нужно переключить его ожидания на инструмент, который решает срочность (GBP, реклама), не отказываясь от SEO как долгосрочной стратегии.",
        "response": "Ma Pan rację, że to nie jest coś na jutro — i będę szczery, że nikt uczciwy nie powie Panu inaczej. Dlatego często robimy to równolegle: coś, co daje ruch od razu, na przykład Google Ads albo dopracowanie wizytówki w Google, a SEO buduje się w tle i za kilka miesięcy zaczyna przynosić ruch, za który Pan już nie płaci od kliknięcia.",
        "responseRu": "Не спорит с правдивым возражением клиента (SEO действительно медленное), а признаёт его и предлагает комбинацию: быстрый канал сейчас + SEO как долгосрочная инвестиция в фоне — снимает ощущение 'или-или'.",
        "why": {
          "pl": "Zgoda z prawdziwym zastrzeżeniem klienta buduje wiarygodność, a propozycja połączenia kanałów pokazuje rozwiązanie zamiast konfrontacji.",
          "ru": "Согласие с истинным замечанием клиента строит доверие, а предложение комбинации каналов показывает решение вместо конфронтации."
        }
      },
      {
        "say": "Próbowałem już SEO z inną firmą i nic to nie dało.",
        "ru": "Частое возражение из-за негативного опыта — важно не критиковать прошлого подрядчика напрямую, а выяснить, что конкретно делалось, чтобы показать разницу в подходе.",
        "response": "Rozumiem, to częsty problem, bo SEO robione na zasadzie 'zoptymalizujemy coś i zobaczymy' faktycznie rzadko działa. Czym się różni nasze podejście, to że zaczynamy od audytu i konkretnego planu fraz, i co miesiąc pokazujemy Panu, jakie pozycje i jaki ruch faktycznie się zmienił, żeby było widać, czy to działa.",
        "responseRu": "Не защищает индустрию SEO в целом, а признаёт, что плохое SEO существует, и сразу же дифференцирует свой подход через прозрачность и измеримую отчётность.",
        "why": {
          "pl": "Przyznanie, że złe SEO istnieje, jest bardziej przekonujące niż obrona całej branży, a konkret (audyt, raport co miesiąc) pokazuje różnicę w działaniu.",
          "ru": "Признание того, что плохое SEO существует, убедительнее, чем защита всей отрасли, а конкретика (аудит, отчёт каждый месяц) показывает разницу в работе."
        }
      },
      {
        "say": "Skąd mam wiedzieć, że to, co robicie, w ogóle ma sens i coś zmienia?",
        "ru": "Клиент требует прозрачности и доказательств процесса — типичное недоверие к 'чёрному ящику' SEO-услуг.",
        "response": "Dokładnie dlatego zaczynamy od audytu, który pokazuje punkt startowy, i co miesiąc dostaje Pan raport z pozycjami fraz i ruchem na stronie, więc widać czarno na białym, czy coś się zmienia, a nie musi Pan wierzyć nam na słowo.",
        "responseRu": "Отвечает на требование прозрачности конкретным артефактом — измеримым ежемесячным отчётом, а не абстрактным обещанием 'мы работаем'.",
        "why": {
          "pl": "Konkretny, mierzalny raport zamienia niewidoczną pracę SEO w coś, co klient może samodzielnie ocenić.",
          "ru": "Конкретный измеримый отчёт превращает невидимую работу SEO в то, что клиент может оценить самостоятельно."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — czy próbował Pan kiedyś wpisać w Google to, czym się Pan zajmuje, razem z miastem, żeby sprawdzić, czy Pana firma się tam w ogóle pojawia?",
      "ru": "Открывашка сразу создаёт лёгкий диагностический момент — большинство владельцев никогда этого не проверяли, поэтому вопрос вызывает любопытство, а не защитную реакцию. Хорошо работает как первый вопрос звонка про SEO."
    },
    "crossSell": {
      "pl": "SEO naturalnie łączy się z analityką, żeby pokazać klientowi realny wzrost ruchu z wyszukiwarki, oraz z GEO/AI, bo obie usługi dotyczą tego, czy firma jest w ogóle znajdowana — jedna w klasycznym Google, druga w wynikach generowanych przez AI.",
      "ru": "SEO естественно сочетается с аналитикой, чтобы показать клиенту реальный рост трафика из поиска, а также с GEO/AI, поскольку обе услуги касаются того, находят ли компанию вообще — одна в классическом Google, другая в результатах, генерируемых AI."
    }
  },
  "gbp": {
    "title": {
      "pl": "Wizytówka Google (Google Business Profile)",
      "ru": "Профиль компании в Google (Google Business Profile)"
    },
    "badge": {
      "pl": "Więcej telefonów i wizyt z Map Google, i to szybko",
      "ru": "Больше звонков и визитов из Google Карт, причём быстро"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Optymalizacja profilu firmy w Google: zdjęcia, opis działalności, godziny otwarcia, kategorie, posty i przede wszystkim opinie klientów. To profil, który wyświetla się w Mapach Google i w wynikach lokalnych, kiedy ktoś szuka firmy typu Pana w swojej okolicy.",
          "ru": "Оптимизация профиля компании в Google: фото, описание деятельности, часы работы, категории, посты и, прежде всего, отзывы клиентов. Это профиль, который отображается в Картах Google и в локальных результатах поиска, когда кто-то ищет такую компанию, как ваша, поблизости."
        },
        "bullets": {
          "pl": [
            "Zdjęcia, opis, godziny, kategorie, posty i system zbierania opinii",
            "Efekty widać dużo szybciej niż w SEO — czasem już w kilka tygodni",
            "Dotyczy wyłącznie widoczności lokalnej, nie ogólnokrajowej"
          ],
          "ru": [
            "Фото, описание, часы работы, категории, посты и система сбора отзывов",
            "Результат виден намного быстрее, чем в SEO — иногда уже через несколько недель",
            "Касается исключительно локальной видимости, а не общенациональной"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Każdy lokalny biznes, do którego klient przychodzi osobiście albo dzwoni po to, żeby się umówić — gabinety, salony, warsztaty, restauracje, kancelarie. Jeśli firma ma adres i obsługuje klientów z okolicy, ta usługa niemal zawsze ma sens.",
          "ru": "Любой локальный бизнес, к которому клиент приходит лично или звонит, чтобы записаться, — кабинеты, салоны, автосервисы, рестораны, юридические конторы. Если у компании есть адрес и она обслуживает клиентов из округи, эта услуга почти всегда имеет смысл."
        },
        "bullets": {
          "pl": [
            "Gabinety, salony, warsztaty, restauracje — każdy biznes z fizyczną lokalizacją",
            "Firmy, które klienci szukają w Mapach Google zamiast w klasycznej wyszukiwarce",
            "Świetna pierwsza usługa dla klienta, który dopiero co kupił stronę"
          ],
          "ru": [
            "Кабинеты, салоны, автосервисы, рестораны — любой бизнес с физической локацией",
            "Компании, которые клиенты ищут в Картах Google, а не в классическом поиске",
            "Отличная первая услуга для клиента, который только что купил сайт"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której klienci wybierają konkurencję tylko dlatego, że ma lepszy profil w Google i więcej opinii — nawet jeśli Pana usługa jest tak samo dobra albo lepsza. Rozpoznajesz to, wpisując w Google nazwę branży i miasto i patrząc, gdzie w ogóle jest profil klienta i ile ma opinii w porównaniu z sąsiadami na liście.",
          "ru": "Решает ситуацию, когда клиенты выбирают конкурентов только потому, что у них лучше профиль в Google и больше отзывов — даже если ваша услуга такая же хорошая или лучше. Распознаётся так: вбиваешь в Google название ниши и город и смотришь, есть ли вообще профиль клиента и сколько у него отзывов по сравнению с соседями по списку."
        },
        "bullets": {
          "pl": [
            "Profil firmy jest pusty, bez zdjęć albo z nieaktualnymi informacjami",
            "Klient ma mało opinii albo złe opinie, na które nikt nie odpowiada",
            "Konkurencja w tej samej okolicy ma wyraźnie lepszy, bardziej rozbudowany profil"
          ],
          "ru": [
            "Профиль компании пустой, без фото или с устаревшей информацией",
            "У клиента мало отзывов или плохие отзывы, на которые никто не отвечает",
            "У конкурентов в том же районе заметно более качественный и полный профиль"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Niech Pan sprawdzi, jak wygląda Pana wizytówka w Google obok konkurencji — ile ma Pan zdjęć i opinii, a ile mają oni. Klienci często wybierają na oko, zanim jeszcze wejdą na stronę.",
            "To jedna z najszybszych rzeczy, jakie możemy zrobić — w przeciwieństwie do SEO czy strony, efekty w Mapach Google widać nieraz już po kilku tygodniach.",
            "Zaczynamy od uporządkowania profilu i wdrożenia prostego systemu zbierania opinii od zadowolonych klientów, bo to one najbardziej wpływają na to, czy ktoś do Pana zadzwoni."
          ],
          "ru": [
            "Приём сравнения с конкурентами в тех же Картах — визуально нагляднее любого объяснения и создаёт лёгкое ощущение отставания, мотивирующее к действию.",
            "Ключевой аргумент скорости этой услуги — используй как контраст с SEO, если клиент уже слышал, что 'позиционирование — это долго'.",
            "Показывает, что система отзывов — не разовая просьба, а процесс, встроенный в работу с довольными клиентами."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie obiecuj konkretnej liczby telefonów ani konkretnego miejsca w Mapach Google — to zależy też od konkurencji w okolicy i od tego, ile realnie opinii uda się zebrać. Nie oferuj GBP jako jedynego rozwiązania firmie, która działa ogólnokrajowo albo online i nie ma fizycznych klientów z okolicy — tam lokalna wizytówka ma mniejsze znaczenie.",
          "ru": "Не обещай конкретное число звонков или конкретное место в Картах Google — это зависит и от конкуренции в округе, и от того, сколько отзывов реально удастся собрать. Не предлагай GBP как единственное решение компании, которая работает по всей стране или онлайн и не имеет физических клиентов из округи — там локальный профиль имеет меньшее значение."
        },
        "bullets": {
          "pl": [
            "Firma działa wyłącznie online/ogólnokrajowo, bez lokalnych klientów → GBP ma mniejszy sens, lepiej SEO albo reklama",
            "Nigdy nie obiecuj konkretnej liczby telefonów ani konkretnej pozycji w Mapach",
            "Klient bez żadnej fizycznej lokalizacji albo obszaru obsługi → nie ma czego optymalizować w profilu lokalnym"
          ],
          "ru": [
            "Компания работает только онлайн/по всей стране, без локальных клиентов → GBP менее актуален, лучше SEO или реклама",
            "Никогда не обещай конкретное число звонков или конкретную позицию в Картах",
            "У клиента нет никакой физической локации или зоны обслуживания → нечего оптимизировать в локальном профиле"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mam już wizytówkę w Google, założyłem ją sam kilka lat temu.' Co to oznacza dla oferty?",
          "ru": "Клиент говорит: 'У меня уже есть профиль в Google, я сам его создал несколько лет назад.' Что это значит для предложения?"
        },
        "answers": {
          "pl": [
            "Skoro wizytówka istnieje, nie ma nic do zrobienia",
            "Istnienie wizytówki to dopiero początek — kluczowe jest to, czy jest zoptymalizowana, ma zdjęcia, aktualne dane i opinie",
            "Trzeba mu od razu zaproponować zupełnie nową stronę internetową"
          ],
          "ru": [
            "Раз профиль существует, делать больше нечего",
            "Существование профиля — это только начало, ключевое — оптимизирован ли он, есть ли фото, актуальные данные и отзывы",
            "Нужно сразу предложить совершенно новый сайт"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego GBP często działa szybciej niż SEO?",
          "ru": "Почему GBP часто работает быстрее, чем SEO?"
        },
        "answers": {
          "pl": [
            "Bo GBP jest tańsze, więc automatycznie jest szybsze",
            "Bo zmiany w profilu (zdjęcia, opinie, posty) są widoczne w Mapach Google praktycznie od razu, bez potrzeby budowania autorytetu domeny miesiącami",
            "Bo GBP nie wymaga żadnej pracy ze strony agencji"
          ],
          "ru": [
            "Потому что GBP дешевле, значит автоматически быстрее",
            "Потому что изменения в профиле (фото, отзывы, посты) видны в Картах Google практически сразу, без необходимости месяцами наращивать авторитет домена",
            "Потому что GBP вообще не требует работы со стороны агентства"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do gabinetu fizjoterapii. Właścicielka mówi: 'Mamy 4 opinie w Google, konkurencja obok ma 60. Nie mamy nawet zdjęć w profilu.' Co proponujesz?",
          "ru": "Звонишь в кабинет физиотерапии. Владелица говорит: 'У нас 4 отзыва в Google, у конкурента по соседству — 60. У нас даже нет фото в профиле.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz od razu drogą kampanię reklamową w Google Ads, żeby zagłuszyć konkurencję",
            "Proponujesz optymalizację profilu GBP: zdjęcia, opis i system systematycznego zbierania opinii od pacjentów",
            "Mówisz, że przy takiej różnicy w opiniach nic już się nie da zrobić"
          ],
          "ru": [
            "Предлагаешь сразу дорогую рекламную кампанию в Google Ads, чтобы заглушить конкурента",
            "Предлагаешь оптимизацию профиля GBP: фото, описание и систему регулярного сбора отзывов от пациентов",
            "Говоришь, что при такой разнице в отзывах уже ничего не поделать"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "To podręcznikowy przypadek na GBP — profil jest zaniedbany, konkurencja wygrywa wizualnie i liczbą opinii, a to są dokładnie elementy, które optymalizuje ta usługa, i to stosunkowo szybko.",
          "ru": "Это учебный случай для GBP — профиль заброшен, конкурент выигрывает визуально и числом отзывов, а это именно те элементы, которые оптимизирует эта услуга, причём довольно быстро."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'Ile dokładnie nowych telefonów dostanę po optymalizacji wizytówki?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'Сколько конкретно новых звонков я получу после оптимизации профиля?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź NIE podaje konkretnej liczby telefonów czy wizyt — to niedopuszczalne w tej akademii. Wyjaśnia, że liczba kontaktów zależy od konkurencji w okolicy, branży i tego, jak profil wygląda na starcie, ale że lepszy profil z aktualnymi zdjęciami i większą liczbą opinii statystycznie zwiększa szansę, że klient wybierze właśnie tę firmę, a nie sąsiada z listy. Nie używa słowa 'gwarantuję' ani nie wymyśla liczby.",
          "ru": "Хороший ответ НЕ называет конкретное число звонков или визитов — это недопустимо в этой академии. Объясняет, что число обращений зависит от конкуренции в округе, ниши и того, как профиль выглядит на старте, но что более качественный профиль с актуальными фото и большим числом отзывов статистически увеличивает шанс, что клиент выберет именно эту компанию, а не соседа по списку. Не использует слово 'гарантирую' и не выдумывает число."
        }
      }
    ],
    "objections": [
      {
        "say": "Mam już wizytówkę w Google, po co mi jeszcze coś płacić?",
        "ru": "Классическое возражение 'у меня уже есть Х' — путает факт существования профиля с его эффективностью. Нужно провести чёткую границу между 'существует' и 'работает на привлечение клиентов'.",
        "response": "Sama wizytówka to jak sklep z zamkniętymi żaluzjami — istnieje, ale nikt nie widzi, co jest w środku. Chodzi o to, żeby ją uzupełnić o zdjęcia, aktualne informacje i regularnie zbierane opinie, bo to one decydują, czy klient wybierze Pana, czy sąsiada z listy obok.",
        "responseRu": "Использует метафору 'закрытых жалюзи', чтобы конкретно и наглядно показать разницу между наличием профиля и его реальной работой на привлечение клиентов.",
        "why": {
          "pl": "Metafora zamkniętych żaluzji sprawia, że abstrakcyjna różnica między 'istnieje' a 'jest zoptymalizowane' staje się natychmiast zrozumiała.",
          "ru": "Метафора с закрытыми жалюзи делает абстрактную разницу между 'существует' и 'оптимизирован' мгновенно понятной."
        }
      },
      {
        "say": "Opinie w internecie to i tak ludzie piszą, jak mają zły humor, nie da się tego kontrolować.",
        "ru": "Клиент оправдывает бездействие тем, что не может контролировать отзывы — путает управление мнением людей с управлением процессом их сбора.",
        "response": "To prawda, że nie da się kontrolować, co ktoś napisze, ale da się zadbać o to, żeby zadowoleni klienci w ogóle zostawiali opinię, bo zwykle to niezadowoleni piszą sami z siebie, a zadowoleni trzeba delikatnie poprosić. My wdrażamy właśnie taki prosty system proszenia o opinię w dobrym momencie.",
        "responseRu": "Не спорит с тем, что нельзя контролировать содержание отзыва, но смещает фокус на то, что МОЖНО контролировать — момент и вероятность того, что довольный клиент вообще оставит отзыв.",
        "why": {
          "pl": "Rozróżnienie między tym, czego nie da się kontrolować (treść opinii), a tym, co da się kontrolować (czy w ogóle powstanie), rozbraja wymówkę klienta.",
          "ru": "Разграничение того, что нельзя контролировать (содержание отзыва), и того, что можно (появится ли он вообще), обезоруживает отговорку клиента."
        }
      },
      {
        "say": "Ile to w ogóle kosztuje, bo to chyba jakiś drobiazg w porównaniu do strony?",
        "ru": "Клиент недооценивает услугу как 'мелочь' по сравнению с сайтом — нужно показать, что низкая цена — это преимущество (низкий порог входа), а не признак незначительности.",
        "response": "To jedna z tańszych usług, jakie mamy, i właśnie dlatego często proponujemy ją jako pierwszy krok — już od 150 euro można uporządkować profil i zacząć zbierać opinie, a efekty widać szybciej niż przy większości innych usług.",
        "responseRu": "Превращает низкую цену из повода недооценивать услугу в аргумент за лёгкое, малорискованное решение попробовать.",
        "why": {
          "pl": "Niska cena przedstawiona jako zaleta ('łatwy pierwszy krok'), a nie wada, obniża próg decyzji klienta.",
          "ru": "Низкая цена, поданная как преимущество ('лёгкий первый шаг'), а не недостаток, снижает порог принятия решения клиентом."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — sprawdzałem Pana firmę w Mapach Google i zauważyłem, że profil nie jest w pełni uzupełniony, a to często pierwsze miejsce, gdzie klienci Pana szukają, zanim jeszcze wejdą na stronę.",
      "ru": "Открывашка показывает, что ты уже проверил профиль клиента лично — конкретное наблюдение вместо общей фразы создаёт ощущение персонального подхода, а не шаблонного звонка."
    },
    "crossSell": {
      "pl": "GBP to naturalny pierwszy upsell dla każdego klienta, który właśnie kupił stronę internetową — świeża strona plus zoptymalizowana wizytówka od razu dają lepsze pierwsze wrażenie, a w dłuższej perspektywie dobrze łączy się z SEO, bo obie usługi budują widoczność w Google, tylko na różnych poziomach.",
      "ru": "GBP — естественный первый апсейл для любого клиента, который только что купил сайт: свежий сайт плюс оптимизированный профиль сразу создают лучшее первое впечатление, а в долгосрочной перспективе хорошо сочетается с SEO, поскольку обе услуги строят видимость в Google, только на разных уровнях."
    }
  },
  "remarketing": {
    "title": {
      "pl": "Remarketing",
      "ru": "Ремаркетинг"
    },
    "badge": {
      "pl": "Drugi kontakt z klientem za ułamek kosztu",
      "ru": "Повторный контакт с клиентом за долю стоимости"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Kampanie kierowane do osób, które już odwiedziły stronę, ale nie zostawiły kontaktu — czyli do ludzi, którzy już znają markę, zamiast do zupełnie obcych. Działa dzięki pikselom zainstalowanym na stronie, które zapamiętują odwiedzających i pozwalają pokazać im reklamę ponownie na Facebooku, Instagramie czy w sieci Google. Proces: instalacja pikseli → segmentacja odwiedzających (np. ci, którzy tylko weszli, vs. ci, którzy dodali coś do koszyka) → kreacje dopasowane do segmentu → kampanie.",
          "ru": "Кампании, направленные на людей, которые уже посетили сайт, но не оставили контакт — то есть на тех, кто уже знает бренд, а не на совсем чужих людей. Работает благодаря пикселям, установленным на сайте, которые запоминают посетителей и позволяют показать им рекламу повторно в Facebook, Instagram или сети Google. Процесс: установка пикселей → сегментация посетителей (например, те, кто просто зашёл, против тех, кто добавил что-то в корзину) → креативы под сегмент → кампании."
        },
        "bullets": {
          "pl": [
            "Reklama tylko dla ludzi, którzy już byli na stronie — nie do obcych",
            "Wymaga zainstalowanych pikseli na stronie, żeby było kogo 'zapamiętać'",
            "Proces: piksele → segmenty → kreacje → kampanie"
          ],
          "ru": [
            "Реклама только для людей, которые уже были на сайте — не для чужих",
            "Требует установленных на сайте пикселей, чтобы было кого 'запомнить'",
            "Процесс: пиксели → сегменты → креативы → кампании"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, które mają już realny ruch na stronie i dłuższy proces decyzji zakupowej — klient rzadko zostawia kontakt czy kupuje przy pierwszej wizycie, potrzebuje czasu albo kilku kontaktów z marką. To usługa dla firm, które już inwestują w Google Ads, Meta Ads albo SEO i chcą wycisnąć więcej z tego ruchu, zamiast tracić większość odwiedzających bezpowrotnie.",
          "ru": "Компании, у которых уже есть реальный трафик на сайте и более длинный процесс принятия решения о покупке — клиент редко оставляет контакт или покупает при первом визите, ему нужно время или несколько контактов с брендом. Это услуга для компаний, которые уже инвестируют в Google Ads, Meta Ads или SEO и хотят выжать больше из этого трафика, вместо того чтобы безвозвратно терять большинство посетителей."
        },
        "bullets": {
          "pl": [
            "Firmy z realnym ruchem na stronie, np. z Google Ads, Meta Ads lub SEO",
            "Branże z dłuższym procesem decyzji: nieruchomości, usługi finansowe, droższe produkty",
            "Klienci, którzy chcą wycisnąć więcej z już opłaconego ruchu, zamiast tylko zwiększać budżet"
          ],
          "ru": [
            "Компании с реальным трафиком на сайте, например из Google Ads, Meta Ads или SEO",
            "Отрасли с более длинным циклом принятия решения: недвижимость, финансовые услуги, более дорогие товары",
            "Клиенты, которые хотят выжать больше из уже оплаченного трафика, а не просто увеличивать бюджет"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której 95% odwiedzających wychodzi ze strony bez zostawienia kontaktu i znika bezpowrotnie, mimo że firma zapłaciła za to, żeby ci ludzie w ogóle tam trafili. Rozpoznajesz to pytaniem: 'Co się dzieje z osobami, które weszły na stronę, ale nie zostawiły kontaktu — czy próbuje Pan do nich jeszcze raz dotrzeć?' — jeśli odpowiedź brzmi 'nie, po prostu znikają', to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда 95% посетителей уходят с сайта, не оставив контакт, и исчезают безвозвратно, хотя компания заплатила за то, чтобы эти люди вообще туда попали. Распознаётся вопросом: «Что происходит с людьми, которые зашли на сайт, но не оставили контакт — пытаетесь ли вы ещё раз до них достучаться?» — если ответ «нет, они просто исчезают», это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient płaci za ruch (reklama, SEO), ale większość odwiedzających znika bez śladu",
            "Klient nigdy nie próbował dotrzeć drugi raz do osób, które już były na stronie",
            "Branża klienta ma dłuższy proces decyzji, więc pierwsza wizyta rzadko kończy się kontaktem"
          ],
          "ru": [
            "Клиент платит за трафик (реклама, SEO), но большинство посетителей исчезают бесследно",
            "Клиент никогда не пытался повторно достучаться до людей, которые уже были на сайте",
            "В отрасли клиента длинный цикл принятия решения, поэтому первый визит редко заканчивается контактом"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Prawie wszyscy, którzy wchodzą dziś na Pana stronę, wychodzą bez zostawienia kontaktu i znikają na zawsze — a można do nich dotrzeć jeszcze raz, dużo taniej niż za pierwszym razem.",
            "To nie jest nowy budżet na pozyskanie zupełnie obcych ludzi, tylko dogranie tych, którzy już Pana widzieli, ale jeszcze nie byli gotowi.",
            "Wystarczy, że ma Pan już jakiś ruch na stronie — reszta to instalacja piksela i pokazywanie reklamy tylko tym, którzy już tam byli."
          ],
          "ru": [
            "Использует конкретную статистику (95% уходят без контакта) как эмоциональный крючок — большинство владельцев никогда не задумывались об этой потере, это открывает разговор.",
            "Разграничивает ремаркетинг от 'нового' бюджета на рекламу — ключевой аргумент для клиентов, уставших от рекламных расходов, аналогично логике CRO.",
            "Проверяет базовое условие продажи (наличие трафика) прямо в разговоре — если у клиента нет трафика, здесь нужно остановиться и не продавать эту услугу."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Remarketing wymaga istniejącego ruchu na stronie, żeby było kogo 'dogonić' — bez ruchu nie ma z kim pracować, tak samo jak przy CRO. Nie oferuj tej usługi firmom bez strony albo z minimalnym ruchem, i nigdy nie sprzedawaj jej jako samodzielnej usługi klientowi, który jeszcze nie inwestuje w Google Ads, Meta Ads czy SEO. Nigdy nie obiecuj konkretnej liczby odzyskanych kontaktów — zależy to od wielkości ruchu i tego, jak dobrze dopasowane są kreacje do segmentu.",
          "ru": "Ремаркетинг требует существующего трафика на сайте, чтобы было кого 'догонять' — без трафика не с кем работать, так же как и в CRO. Не предлагай эту услугу компаниям без сайта или с минимальным трафиком, и никогда не продавай её как самостоятельную услугу клиенту, который ещё не инвестирует в Google Ads, Meta Ads или SEO. Никогда не обещай конкретное число возвращённых контактов — это зависит от объёма трафика и того, насколько хорошо креативы подобраны под сегмент."
        },
        "bullets": {
          "pl": [
            "Firma nie ma strony albo ma znikomy ruch → najpierw strona i źródło ruchu (Google Ads, Meta Ads, SEO), potem remarketing",
            "Klient nie inwestuje jeszcze w żaden ruch płatny ani organiczny → remarketing nie ma czego 'dogonić'",
            "Nigdy nie obiecuj konkretnej liczby odzyskanych kontaktów czy konkretnego procenta"
          ],
          "ru": [
            "У компании нет сайта или ничтожный трафик → сначала сайт и источник трафика (Google Ads, Meta Ads, SEO), потом ремаркетинг",
            "Клиент ещё не инвестирует ни в платный, ни в органический трафик → ремаркетингу некого 'догонять'",
            "Никогда не обещай конкретное число возвращённых контактов или конкретный процент"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mamy sporo wejść na stronę z reklamy, ale nigdy nie próbowaliśmy dotrzeć drugi raz do tych, którzy nie zostawili kontaktu.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'У нас много переходов на сайт из рекламы, но мы никогда не пытались повторно достучаться до тех, кто не оставил контакт.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient robi wszystko poprawnie i nie ma czego poprawiać",
            "Klient traci bezpowrotnie większość ruchu, za który zapłacił — klasyczny sygnał do remarketingu",
            "Trzeba mu zaproponować zwiększenie budżetu na Google Ads, żeby było więcej ruchu"
          ],
          "ru": [
            "Клиент делает всё правильно, и улучшать нечего",
            "Клиент безвозвратно теряет большинство трафика, за который заплатил — классический сигнал для ремаркетинга",
            "Нужно предложить увеличить бюджет на Google Ads, чтобы было больше трафика"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego remarketing nie ma sensu jako pierwsza usługa dla firmy, która nie ma jeszcze żadnego ruchu na stronie?",
          "ru": "Почему ремаркетинг не имеет смысла как первая услуга для компании, у которой ещё нет никакого трафика на сайте?"
        },
        "answers": {
          "pl": [
            "Bo remarketing zawsze jest droższy niż zwykła reklama",
            "Bo remarketing pokazuje reklamę osobom, które już odwiedziły stronę — bez wcześniejszego ruchu nie ma nikogo do 'dogonienia'",
            "Bo remarketing działa tylko dla sklepów internetowych"
          ],
          "ru": [
            "Потому что ремаркетинг всегда дороже обычной рекламы",
            "Потому что ремаркетинг показывает рекламу людям, которые уже посетили сайт — без предварительного трафика некого 'догонять'",
            "Потому что ремаркетинг работает только для интернет-магазинов"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do biura nieruchomości. Właściciel mówi: 'Wydajemy na Google Ads, ludzie wchodzą, oglądają oferty, ale rzadko dzwonią od razu — pewnie muszą to przemyśleć.' Co proponujesz?",
          "ru": "Звонишь в агентство недвижимости. Владелец говорит: 'Тратим на Google Ads, люди заходят, смотрят объявления, но редко звонят сразу — наверное, им нужно подумать.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz zwiększenie budżetu na Google Ads, żeby przyciągnąć jeszcze więcej nowych osób",
            "Proponujesz remarketing do osób, które już oglądały oferty — przypomnienie się im w trakcie procesu decyzyjnego, zamiast liczyć tylko na to, że wrócą sami",
            "Mówisz, że w nieruchomościach reklama internetowa w ogóle nie działa"
          ],
          "ru": [
            "Предлагаешь увеличить бюджет на Google Ads, чтобы привлечь ещё больше новых людей",
            "Предлагаешь ремаркетинг для людей, которые уже смотрели объявления — напомнить о себе в процессе принятия решения, вместо того чтобы рассчитывать только на то, что они вернутся сами",
            "Говоришь, что в недвижимости интернет-реклама вообще не работает"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient sam opisuje dokładnie sytuację, do której remarketing został stworzony — dłuższy proces decyzji i ruch, który znika bez kontaktu. To naturalne rozszerzenie jego obecnej kampanii Google Ads.",
          "ru": "Клиент сам описывает именно ту ситуацию, для которой создан ремаркетинг — длинный цикл принятия решения и трафик, который исчезает без контакта. Это естественное расширение его текущей кампании Google Ads."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A ilu dokładnie z tych ludzi w końcu do nas zadzwoni dzięki remarketingowi?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А сколько именно из этих людей в итоге нам позвонит благодаря ремаркетингу?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST unika podania konkretnej liczby czy procenta odzyskanych kontaktów — to niedopuszczalne w tej akademii, bo zależy od wielkości ruchu, długości procesu decyzyjnego w danej branży i jakości kreacji. Tłumaczy, że remarketing to dodatkowa szansa dotarcia do osób, które już wykazały zainteresowanie, i że efekty mierzy się i optymalizuje w czasie na bazie realnych danych, a nie z góry ustalonej liczby. Nie podaje wymyślonego procenta ani nie używa słowa 'gwarantuję'.",
          "ru": "Хороший ответ ПРЯМО избегает называть конкретное число или процент возвращённых контактов — это недопустимо в этой академии, так как зависит от объёма трафика, длины цикла принятия решения в отрасли и качества креативов. Объясняет, что ремаркетинг — это дополнительный шанс достучаться до людей, уже проявивших интерес, и что результаты измеряются и оптимизируются со временем на основе реальных данных, а не заранее заданного числа. Не называет выдуманный процент и не использует слово 'гарантирую'."
        }
      }
    ],
    "objections": [
      {
        "say": "To brzmi trochę jak śledzenie ludzi po internecie, czy to w ogóle legalne?",
        "ru": "Реалистичное возражение о приватности — часто встречается у клиентов, слышавших о cookie-баннерах и GDPR; нужен честный, спокойный ответ, а не отмахивание.",
        "response": "Rozumiem, że to może tak brzmieć, ale to standardowy, w pełni legalny mechanizm, z którego korzysta większość dużych firm — działa na podstawie zgody na pliki cookie, którą użytkownik widzi na stronie, a nie na żadnych danych osobowych czy śledzeniu poza tym.",
        "responseRu": "Не защищается, а спокойно объясняет юридическую основу (согласие на cookie) простым языком — снимает тревогу конкретным фактом, а не общим заверением.",
        "why": {
          "pl": "Spokojne wyjaśnienie mechanizmu (zgoda na cookie) zamiast defensywnej reakcji buduje zaufanie i pokazuje, że firma zna temat.",
          "ru": "Спокойное объяснение механизма (согласие на cookie) вместо защитной реакции строит доверие и показывает, что компания разбирается в теме."
        }
      },
      {
        "say": "Skoro ktoś nie zostawił kontaktu za pierwszym razem, to znaczy, że nie był zainteresowany, po co go gonić?",
        "ru": "Клиент неверно интерпретирует отсутствие немедленного контакта как отсутствие интереса — нужно объяснить, что процесс принятия решения не мгновенный, особенно в его отрасли.",
        "response": "Niekoniecznie brak kontaktu oznacza brak zainteresowania — czasem to po prostu nie był dobry moment, ktoś porównywał jeszcze inne opcje albo chciał się zastanowić. Remarketing to właśnie przypomnienie się w momencie, kiedy ta osoba jest gotowa podjąć decyzję.",
        "responseRu": "Прямо оспаривает ложную предпосылку клиента (нет контакта = нет интереса), заменяя её более реалистичной моделью процесса принятия решения.",
        "why": {
          "pl": "Podważenie fałszywego założenia klienta konkretnym, realistycznym wyjaśnieniem zachowania kupujących jest skuteczniejsze niż ogólne zapewnienie.",
          "ru": "Опровержение ложного предположения клиента конкретным, реалистичным объяснением поведения покупателей эффективнее, чем общее заверение."
        }
      },
      {
        "say": "Nie mamy jeszcze żadnej reklamy, tylko stronę, czy remarketing zadziała?",
        "ru": "Ключевой квалификационный вопрос — правильный ответ здесь тест на честность продавца: без трафика ремаркетинг работать не будет, это нужно признать прямо, а не пытаться продать любой ценой.",
        "response": "Bez ruchu na stronie remarketing nie ma kogo 'dogonić', więc na razie by nie zadziałał. Najpierw potrzebuje Pan jakiegoś źródła ruchu, np. Google Ads albo Meta Ads, a remarketing dokładamy, kiedy już jest komu pokazywać tę drugą reklamę.",
        "responseRu": "Честно признаёт, что услуга сейчас не подходит, вместо того чтобы продавливать продажу — редкая, но критически важная дисциплина: не продавать то, что не сработает, ради закрытия сделки.",
        "why": {
          "pl": "Uczciwe przyznanie, że usługa na razie się nie nada, buduje wiarygodność i otwiera naturalną drogę do sprzedaży najpierw źródła ruchu.",
          "ru": "Честное признание, что услуга пока не подходит, строит доверие и открывает естественный путь к продаже сначала источника трафика."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, czy wie Pan, ile osób wchodzi miesięcznie na Pana stronę i co się dzieje z tymi, którzy nie zostawiają kontaktu za pierwszym razem?",
      "ru": "Открывашка похожа на CRO-открывашку, но веди разговор к другому решению — если у клиента низкая конверсия из-за проблем самого сайта, это CRO; если сайт в порядке, но людям нужно время/повторный контакт, это ремаркетинг. Используй только с клиентами, у которых уже есть трафик."
    },
    "crossSell": {
      "pl": "Remarketing nie działa samodzielnie bez ruchu, więc zawsze sprzedawaj go razem z Google Ads, Meta Ads albo SEO jako źródłem tego ruchu, a w połączeniu z CRO daje pełny system: przyciągnięcie ruchu, poprawienie strony i dogonienie tych, którzy i tak nie zostali za pierwszym razem.",
      "ru": "Ремаркетинг не работает самостоятельно без трафика, поэтому всегда продавай его вместе с Google Ads, Meta Ads или SEO как источником этого трафика, а в сочетании с CRO даёт полную систему: привлечение трафика, улучшение сайта и дожим тех, кто всё равно не остался с первого раза."
    }
  },
  "analytics": {
    "title": {
      "pl": "Analityka (GA4 i raporty)",
      "ru": "Аналитика (GA4 и отчёты)"
    },
    "badge": {
      "pl": "Wiesz, co w marketingu naprawdę działa, a co pożera budżet",
      "ru": "Знаешь, что в маркетинге реально работает, а что съедает бюджет"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Konfiguracja Google Analytics 4, ustawienie celów i konwersji, spięcie źródeł ruchu (reklama, SEO, social media) w jedno miejsce oraz czytelne raporty pokazujące, co się dzieje na stronie i skąd biorą się realne zapytania. To fundament, bez którego trudno ocenić, czy jakikolwiek marketing w ogóle działa.",
          "ru": "Настройка Google Analytics 4, установка целей и конверсий, объединение источников трафика (реклама, SEO, соцсети) в одном месте и понятные отчёты, показывающие, что происходит на сайте и откуда берутся реальные обращения. Это фундамент, без которого сложно оценить, работает ли вообще какой-либо маркетинг."
        },
        "bullets": {
          "pl": [
            "Konfiguracja GA4, celów, konwersji i połączenie źródeł ruchu w jeden obraz",
            "Fundament pod każdą inną usługę marketingową — bez danych nie wiadomo, co poprawiać",
            "Proces: audyt → konfiguracja → ustawienie celów → raporty"
          ],
          "ru": [
            "Настройка GA4, целей, конверсий и объединение источников трафика в единую картину",
            "Фундамент под любую другую маркетинговую услугу — без данных непонятно, что улучшать",
            "Процесс: аудит → настройка → установка целей → отчёты"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, które już inwestują w marketing — reklamę, SEO, social media — i chcą podejmować decyzje na podstawie danych, a nie przeczucia. To też naturalna pierwsza usługa dla każdego, kto dopiero zaczyna płacić za reklamę, żeby od pierwszego dnia widzieć, co się dzieje z tymi pieniędzmi.",
          "ru": "Компании, которые уже инвестируют в маркетинг — рекламу, SEO, соцсети — и хотят принимать решения на основе данных, а не интуиции. Это также естественная первая услуга для тех, кто только начинает платить за рекламу, чтобы с первого дня видеть, что происходит с этими деньгами."
        },
        "bullets": {
          "pl": [
            "Firmy inwestujące w reklamę, SEO lub social media, które chcą wiedzieć, co działa",
            "Klienci planujący dopiero zacząć płacić za marketing — dobrze zacząć od pomiaru",
            "Właściciele, którzy podejmują decyzje 'na wyczucie', bo nie mają danych"
          ],
          "ru": [
            "Компании, инвестирующие в рекламу, SEO или соцсети, которые хотят знать, что работает",
            "Клиенты, только планирующие начать платить за маркетинг — хорошо начать с измерения",
            "Владельцы, принимающие решения 'на ощупь', потому что у них нет данных"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację 'wydajemy pieniądze na marketing, ale nie wiadomo, co działa' — budżet idzie w reklamę, stronę, social media, a właściciel nie potrafi powiedzieć, który kanał faktycznie przynosi klientów. Rozpoznajesz to pytaniem: 'Skąd Pan wie, który kanał marketingowy najlepiej się zwraca?' Jeśli odpowiedź brzmi 'no, tak mniej więcej czuję' — to jest dokładnie ten problem.",
          "ru": "Решает ситуацию 'тратим деньги на маркетинг, но непонятно, что работает' — бюджет уходит в рекламу, сайт, соцсети, а владелец не может сказать, какой канал реально приносит клиентов. Распознаётся вопросом: 'Откуда вы знаете, какой маркетинговый канал лучше всего окупается?' Если ответ звучит как 'ну, я примерно чувствую' — это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient wydaje na kilka kanałów marketingowych naraz i nie wie, który działa",
            "Brak zainstalowanej albo poprawnie skonfigurowanej analityki na stronie",
            "Decyzje o budżecie marketingowym podejmowane 'na wyczucie', bez danych"
          ],
          "ru": [
            "Клиент тратит на несколько маркетинговых каналов сразу и не знает, какой работает",
            "Отсутствие установленной или правильно настроенной аналитики на сайте",
            "Решения о маркетинговом бюджете принимаются 'на ощупь', без данных"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Skąd Pan dziś wie, który kanał marketingowy faktycznie się zwraca — reklama, SEO czy social media? Bo jeśli nie ma Pan tych danych w jednym miejscu, to podejmuje Pan decyzje o budżecie na wyczucie.",
            "Zanim dołoży Pan kolejne pieniądze w reklamę, warto najpierw dokładnie zmierzyć, co robi ta, którą już Pan płaci — czasem okazuje się, że jeden kanał ciągnie wszystko, a drugi tylko pożera budżet.",
            "To jest usługa, która się właściwie zwraca sama z siebie, bo pokazuje, gdzie wyłączyć coś, co nie działa, i przekierować te pieniądze tam, gdzie faktycznie przynoszą klientów."
          ],
          "ru": [
            "Диагностический вопрос, обнажающий отсутствие единой картины по каналам — большинство владельцев интуитивно чувствуют, но не могут доказать цифрами, что работает.",
            "Позиционирует аналитику как условие ПЕРЕД тратой новых денег на рекламу — сильный аргумент для клиентов, уже вкладывающихся в платный трафик.",
            "Аргумент самоокупаемости — аналитика не добавляет расход, а перераспределяет уже существующий бюджет эффективнее."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie obiecuj konkretnego wzrostu skuteczności marketingu — analityka sama w sobie niczego nie poprawia, ona tylko pokazuje, co się dzieje, żeby można było podjąć lepsze decyzje. Nie oferuj rozbudowanej analityki firmie, która nie ma jeszcze żadnego ruchu ani żadnych działań marketingowych do zmierzenia — tam po prostu nie ma jeszcze czego analizować.",
          "ru": "Не обещай конкретный рост эффективности маркетинга — аналитика сама по себе ничего не улучшает, она только показывает, что происходит, чтобы можно было принимать более взвешенные решения. Не предлагай развёрнутую аналитику компании, у которой ещё нет ни трафика, ни маркетинговых активностей для измерения, — там пока просто нечего анализировать."
        },
        "bullets": {
          "pl": [
            "Firma nie ma jeszcze strony ani żadnego ruchu do zmierzenia → najpierw strona, potem analityka ma sens",
            "Nigdy nie obiecuj, że sama analityka zwiększy sprzedaż czy liczbę zapytań",
            "Klient prowadzi tylko jeden prosty kanał i sam doskonale wie, co się dzieje → skala może nie uzasadniać rozbudowanego raportowania"
          ],
          "ru": [
            "У компании ещё нет сайта или трафика для измерения → сначала сайт, потом аналитика имеет смысл",
            "Никогда не обещай, что сама аналитика увеличит продажи или число обращений",
            "Клиент ведёт только один простой канал и прекрасно знает, что происходит → масштаб может не оправдывать развёрнутую отчётность"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Wydaję na Google Ads, Meta Ads i SEO jednocześnie, ale nie wiem, co z tego działa.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Трачу на Google Ads, Meta Ads и SEO одновременно, но не знаю, что из этого работает.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Że powinien po prostu wyłączyć wszystkie kanały naraz",
            "Brak spiętej analityki i celów — klasyczny sygnał do wdrożenia GA4 i raportów, zanim dołoży kolejny budżet",
            "Że wszystkie trzy kanały na pewno działają tak samo dobrze"
          ],
          "ru": [
            "Что нужно просто выключить все каналы сразу",
            "Об отсутствии объединённой аналитики и целей — классический сигнал для внедрения GA4 и отчётов, прежде чем добавлять новый бюджет",
            "Что все три канала точно работают одинаково хорошо"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego analityka często powinna być sprzedana przed albo razem z pierwszą kampanią reklamową, a nie długo po niej?",
          "ru": "Почему аналитику часто нужно продавать до или вместе с первой рекламной кампанией, а не спустя долгое время после неё?"
        },
        "answers": {
          "pl": [
            "Bo bez tego agencja nie może wystawić faktury za reklamę",
            "Bo bez poprawnie skonfigurowanych celów i konwersji nie da się ocenić, czy wydane pieniądze na reklamę w ogóle się zwracają",
            "Bo klienci lubią płacić za więcej usług naraz"
          ],
          "ru": [
            "Потому что без этого агентство не может выставить счёт за рекламу",
            "Потому что без правильно настроенных целей и конверсий невозможно оценить, окупаются ли вообще потраченные на рекламу деньги",
            "Потому что клиенты любят платить за несколько услуг сразу"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do właściciela sklepu meblowego. Mówi: 'Płacimy agencji za Google Ads od pół roku, ruch chyba jest, ale nie mam pojęcia, czy to się zwraca.' Co proponujesz?",
          "ru": "Звонишь владельцу мебельного магазина. Он говорит: 'Платим агентству за Google Ads уже полгода, трафик вроде есть, но понятия не имею, окупается ли это.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz od razu zwiększenie budżetu na Google Ads, żeby było więcej ruchu",
            "Proponujesz najpierw wdrożenie analityki i celów, żeby dokładnie zmierzyć, ile z tego ruchu faktycznie zamienia się w zapytania czy sprzedaż, zanim podejmie decyzję o budżecie",
            "Mówisz, że skoro nie ma danych, to na pewno reklama nie działa i trzeba ją wyłączyć"
          ],
          "ru": [
            "Предлагаешь сразу увеличить бюджет на Google Ads, чтобы было больше трафика",
            "Предлагаешь сначала внедрить аналитику и цели, чтобы точно измерить, сколько из этого трафика реально превращается в обращения или продажи, прежде чем принимать решение о бюджете",
            "Говоришь, что раз нет данных, значит реклама точно не работает и нужно её выключить"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient wydaje pieniądze bez pomiaru efektu — klasyczny przypadek na analitykę. Zanim cokolwiek zmienimy w budżecie reklamowym, trzeba najpierw zobaczyć, co faktycznie się dzieje z tym ruchem.",
          "ru": "Клиент тратит деньги без измерения эффекта — классический случай для аналитики. Прежде чем менять что-либо в рекламном бюджете, нужно сначала увидеть, что реально происходит с этим трафиком."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'Czy dzięki analityce moja sprzedaż na pewno wzrośnie?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'Благодаря аналитике мои продажи точно вырастут?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź NIE obiecuje wzrostu sprzedaży ani konkretnego procenta — to niedopuszczalne w tej akademii. Wyjaśnia, że analityka sama w sobie nie generuje sprzedaży, tylko pokazuje, które kanały i działania faktycznie działają, dzięki czemu można podejmować lepsze decyzje o budżecie i skalować to, co działa, a wyłączać to, co nie działa. Podkreśla, że wzrost jest efektem decyzji podjętych na bazie danych, a nie samej konfiguracji narzędzia. Nie używa słowa 'gwarantuję'.",
          "ru": "Хороший ответ НЕ обещает роста продаж или конкретного процента — это недопустимо в этой академии. Объясняет, что сама по себе аналитика не генерирует продажи, а только показывает, какие каналы и действия реально работают, благодаря чему можно принимать более взвешенные решения о бюджете, масштабировать то, что работает, и выключать то, что не работает. Подчёркивает, что рост — это результат решений, принятых на основе данных, а не самой настройки инструмента. Не использует слово 'гарантирую'."
        }
      }
    ],
    "objections": [
      {
        "say": "I tak wiem, co u mnie działa, po co mi jakieś wykresy.",
        "ru": "Клиент переоценивает собственную интуицию и не видит ценности в данных — не стоит спорить с его опытом напрямую, лучше показать конкретный слепой участок, который интуиция не закрывает.",
        "response": "Może i ma Pan dobre wyczucie, ale wyczucie nie pokaże Panu dokładnie, ile kosztuje jedno zapytanie z każdego kanału — a to jest coś, co można łatwo sprawdzić i czasem naprawdę zaskakuje, który kanał w rzeczywistości najlepiej się zwraca.",
        "responseRu": "Не отрицает интуицию клиента, а указывает на конкретный, измеримый пробел (стоимость обращения по каналам), который интуиция физически не может закрыть.",
        "why": {
          "pl": "Uznanie wyczucia klienta przy jednoczesnym wskazaniu konkretnej luki, której wyczucie nie zamknie, jest mniej konfrontacyjne niż podważanie jego kompetencji.",
          "ru": "Признание чутья клиента при одновременном указании на конкретный пробел, который это чутьё не закрывает, менее конфронтационно, чем прямое сомнение в его компетентности."
        }
      },
      {
        "say": "To brzmi jak dodatkowy koszt, a ja już i tak dużo wydaję na marketing.",
        "ru": "Клиент воспринимает услугу как дополнительный расход поверх и так большого маркетингового бюджета — нужно показать, что аналитика перераспределяет, а не увеличивает траты.",
        "response": "Rozumiem, ale to akurat usługa, która zwykle się sama zwraca, bo pokazuje, gdzie wyłączyć to, co nie działa, i przekierować te same pieniądze tam, gdzie faktycznie przynoszą klientów — nie dokłada Pan nowego budżetu, tylko lepiej wykorzystuje ten, który już Pan wydaje.",
        "responseRu": "Переворачивает восприятие затрат — аналитика подаётся не как новый расход, а как способ эффективнее использовать уже потраченные деньги за счёт отключения неработающих каналов.",
        "why": {
          "pl": "Reframing z 'nowy koszt' na 'lepsze wykorzystanie już wydanych pieniędzy' to ten sam mechanizm, co przy budżecie reklamowym w CRO — działa, bo nie prosi o nowe pieniądze.",
          "ru": "Реформулирование с 'нового расхода' на 'лучшее использование уже потраченных денег' — тот же приём, что и с рекламным бюджетом в CRO, — работает, потому что не просит новых денег."
        }
      },
      {
        "say": "Nie znam się na tych wszystkich statystykach, na pewno bym tego nie ogarnął.",
        "ru": "Клиент боится сложности и технической некомпетентности — важно не убеждать его 'научиться', а снять с него саму необходимость разбираться.",
        "response": "Nie musi Pan analizować tego samodzielnie — dostaje Pan czytelny raport w prostym języku, bez żargonu, gdzie widać jasno: ten kanał przynosi zapytania, ten nie, tu warto dołożyć budżet, a tu go wyłączyć.",
        "responseRu": "Полностью снимает с клиента бремя технической грамотности, обещая понятный итоговый отчёт вместо сырых данных, которые нужно самостоятельно интерпретировать.",
        "why": {
          "pl": "Zdjęcie z klienta obowiązku rozumienia technikaliów i przesunięcie tego na czytelny raport usuwa realną barierę psychologiczną przed zakupem.",
          "ru": "Снятие с клиента обязанности разбираться в технических деталях и перенос этого на понятный отчёт устраняет реальный психологический барьер перед покупкой."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — czy wie Pan dziś dokładnie, ile kosztuje jedno zapytanie z każdego kanału marketingowego, który Pan opłaca?",
      "ru": "Открывашка сразу задаёт диагностический вопрос про стоимость обращения по каналам — большинство владельцев этого не знают, что естественно открывает разговор про аналитику, не звуча как навязчивая продажа."
    },
    "crossSell": {
      "pl": "Analityka to fundament pod każdą usługę związaną z ruchem płatnym — Google Ads, Meta Ads, TikTok Ads czy CRO — dlatego dobrze sprzedać ją jako pierwszą albo w pakiecie, zanim klient zacznie wydawać budżet na reklamę bez pomiaru efektu.",
      "ru": "Аналитика — это фундамент под любую услугу, связанную с платным трафиком: Google Ads, Meta Ads, TikTok Ads или CRO, — поэтому её хорошо продавать первой или в пакете, прежде чем клиент начнёт тратить рекламный бюджет без измерения эффекта."
    }
  },
  "funnels": {
    "title": {
      "pl": "Lejki sprzedażowe",
      "ru": "Воронки продаж"
    },
    "badge": {
      "pl": "Cały system sprzedaży, nie jedno działanie",
      "ru": "Вся система продаж, а не одно действие"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Projektujemy całą drogę klienta: od momentu, kiedy widzi reklamę, przez wejście na stronę, zostawienie kontaktu, aż po to, co się dzieje później — czyli follow-up. Lejek to nie jedna usługa, tylko spięcie kilku elementów (reklama, strona, formularz, automatyzacja, CRM) w jeden logiczny proces, gdzie każdy etap prowadzi klienta do kolejnego, a żaden lead się po drodze nie gubi.",
          "ru": "Мы проектируем весь путь клиента: от момента, когда он видит рекламу, через переход на сайт, оставление контакта, вплоть до того, что происходит дальше — то есть фоллоу-ап. Воронка — это не одна услуга, а связка нескольких элементов (реклама, сайт, форма, автоматизация, CRM) в один логичный процесс, где каждый этап ведёт клиента к следующему, и ни один лид не теряется по дороге."
        },
        "bullets": {
          "pl": [
            "Łączymy w jedną całość: reklamę, stronę, formularz kontaktowy i follow-up",
            "To projekt strategiczny — mapujemy całą drogę klienta, a nie jeden element",
            "Proces: mapa lejka → strony → automatyzacje → pomiar wyników"
          ],
          "ru": [
            "Объединяем в одно целое: рекламу, сайт, форму контакта и фоллоу-ап",
            "Это стратегический проект — мы картируем весь путь клиента, а не один элемент",
            "Процесс: карта воронки → страницы → автоматизации → измерение результатов"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, które próbowały już różnych działań osobno — reklamy, nowej strony, CRM — i widzą, że coś nie gra, ale nie wiedzą co dokładnie. To klienci gotowi myśleć systemowo, często tacy, którzy kupili już u nas jedną lub dwie usługi i chcą, żeby to wszystko zaczęło działać razem, a nie jako osobne, niepowiązane elementy.",
          "ru": "Компании, которые уже пробовали разные действия по отдельности — рекламу, новый сайт, CRM — и видят, что что-то не работает, но не понимают, что именно. Это клиенты, готовые мыслить системно, часто те, кто уже купил у нас одну-две услуги и хочет, чтобы всё это наконец заработало вместе, а не как отдельные, несвязанные элементы."
        },
        "bullets": {
          "pl": [
            "Firmy, które chcą przewidywalnego procesu pozyskiwania klientów, a nie przypadkowych efektów",
            "Klienci, którzy już mają część elementów (stronę, reklamę) i chcą je spiąć w całość",
            "Firmy z większym budżetem i dłuższą perspektywą, gotowe na projekt strategiczny"
          ],
          "ru": [
            "Компании, которые хотят предсказуемого процесса привлечения клиентов, а не случайных результатов",
            "Клиенты, у которых уже есть часть элементов (сайт, реклама) и которые хотят связать их в целое",
            "Компании с большим бюджетом и долгосрочной перспективой, готовые к стратегическому проекту"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której każdy element działa osobno i leady gubią się po drodze — na przykład reklama jest dobra i przyciąga ruch, ale strona nie zbiera kontaktu, albo kontakt wpada do skrzynki i nikt nie robi follow-upu w porę. Rozpoznajesz to, gdy klient ma kilka działań marketingowych naraz, ale nie potrafi powiedzieć, co się dzieje z leadem od momentu kliknięcia w reklamę do podpisania umowy.",
          "ru": "Решает ситуацию, когда каждый элемент работает по отдельности и лиды теряются по дороге — например, реклама хорошая и привлекает трафик, но сайт не собирает контакт, или контакт попадает в почту, и никто вовремя не делает фоллоу-ап. Распознаётся, когда у клиента одновременно несколько маркетинговых действий, но он не может чётко описать, что происходит с лидом от клика по рекламе до подписания договора."
        },
        "bullets": {
          "pl": [
            "Klient inwestuje w reklamę, stronę i CRM osobno, ale wyniki są poniżej oczekiwań mimo wydatków",
            "Nikt w firmie nie potrafi jasno opisać, co się dzieje z leadem krok po kroku",
            "Klient mówi 'coś nam ucieka po drodze, ale nie wiem gdzie dokładnie'"
          ],
          "ru": [
            "Клиент вкладывается в рекламу, сайт и CRM по отдельности, но результаты ниже ожиданий, несмотря на расходы",
            "Никто в компании не может чётко описать, что происходит с лидом шаг за шагом",
            "Клиент говорит: 'что-то у нас теряется по дороге, но не знаю точно где'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Ma Pan reklamę, ma Pan stronę, ma Pan może nawet CRM — ale czy ktoś kiedyś sprawdził, co się dzieje z leadem między tymi elementami? Bo często właśnie tam się on gubi.",
            "Nie proponuję Panu kolejnej pojedynczej usługi, tylko spięcie tego, co już Pan ma, w jeden proces, żeby leady same przechodziły dalej, a nie znikały po drodze.",
            "Zanim zaczniemy, robimy mapę całej drogi klienta — od reklamy do podpisania umowy — i dopiero wtedy widać, gdzie realnie tracimy ludzi."
          ],
          "ru": [
            "Эта фраза превращает разрозненные покупки клиента в общий диагностический вопрос — используй с клиентами, у которых уже есть и реклама, и сайт.",
            "Разворот от 'ещё одной услуги' к 'связке того, что уже есть' — заранее снимает возражение 'ещё один дорогой проект'.",
            "Начало с 'карты' (диагностический первый шаг) повторяет доверительный паттерн CRO 'сначала анализируем, потом предлагаем' — снижает воспринимаемый риск при крупной покупке."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Lejek ma sens tylko wtedy, gdy klient ma już przynajmniej dwa działające elementy (np. reklamę i stronę) albo jest gotowy zbudować je od zera w ramach jednego dużego projektu — inaczej to zbyt duży i drogi krok na start. Nie proponuj lejka jako pierwszej usługi firmie, która nigdy nic nie kupowała i nie ma jeszcze zaufania do studia — zacznij od jednego konkretnego elementu i buduj relację. Nigdy nie obiecuj konkretnej liczby leadów ani gwarantowanego wzrostu sprzedaży.",
          "ru": "Воронка имеет смысл только тогда, когда у клиента уже есть минимум два работающих элемента (например, реклама и сайт) или он готов построить их с нуля в рамках одного большого проекта — иначе это слишком крупный и дорогой шаг для старта. Не предлагай воронку как первую услугу компании, которая никогда ничего не покупала и ещё не доверяет студии — начни с одного конкретного элемента и выстраивай отношения. Никогда не обещай конкретное число лидов или гарантированный рост продаж."
        },
        "bullets": {
          "pl": [
            "Firma bez żadnych istniejących działań marketingowych i bez wcześniejszej współpracy → zacznij od jednej usługi, np. strony albo reklamy",
            "Klient z bardzo małym budżetem, dla którego 4-8 tygodni realizacji i cena od 400 EUR to zbyt duży krok → zaproponuj pojedynczy element",
            "Nigdy nie obiecuj konkretnej liczby leadów ani gwarantowanego wzrostu sprzedaży"
          ],
          "ru": [
            "Компания без каких-либо существующих маркетинговых действий и без предыдущего сотрудничества → начни с одной услуги, например сайта или рекламы",
            "Клиент с очень маленьким бюджетом, для которого 4-8 недель реализации и цена от 400 евро — слишком большой шаг → предложи отдельный элемент",
            "Никогда не обещай конкретное число лидов или гарантированный рост продаж"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient ma reklamę na Facebooku, stronę internetową i CRM, ale mówi, że 'coś nie gra' i nie wie co. Co to sygnalizuje?",
          "ru": "У клиента есть реклама в Facebook, сайт и CRM, но он говорит, что 'что-то не работает', и не знает что. О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient po prostu źle wybrał agencję reklamową",
            "Elementy działają osobno i prawdopodobnie leady gubią się gdzieś pomiędzy nimi — klasyczny sygnał do lejka",
            "Trzeba mu zaproponować wyłącznie nową stronę, to zawsze rozwiązuje problem"
          ],
          "ru": [
            "Клиент просто плохо выбрал рекламное агентство",
            "Элементы работают по отдельности, и лиды, вероятно, теряются где-то между ними — классический сигнал для воронки",
            "Нужно предложить ему исключительно новый сайт, это всегда решает проблему"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Czym różni się lejek sprzedażowy od pojedynczej usługi, np. samej strony internetowej?",
          "ru": "Чем воронка продаж отличается от отдельной услуги, например, просто сайта?"
        },
        "answers": {
          "pl": [
            "Niczym, to inna nazwa tego samego produktu",
            "Lejek to strategiczne spięcie kilku elementów (reklama, strona, formularz, follow-up) w jeden proces, a nie pojedyncze działanie",
            "Lejek jest zawsze tańszy, bo obejmuje mniej pracy"
          ],
          "ru": [
            "Ничем, это просто другое название того же продукта",
            "Воронка — это стратегическая связка нескольких элементов (реклама, сайт, форма, фоллоу-ап) в один процесс, а не отдельное действие",
            "Воронка всегда дешевле, потому что включает меньше работы"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do firmy remontowej. Właściciel mówi: 'Mamy reklamę na Google, ludzie wchodzą na stronę, ale potem cisza — nikt z nimi nie rozmawia, chyba że sami zadzwonią.' Co proponujesz?",
          "ru": "Звонишь в ремонтную компанию. Владелец говорит: 'У нас есть реклама в Google, люди заходят на сайт, но потом тишина — никто с ними не разговаривает, если только они сами не позвонят.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Wyłącznie więcej budżetu na reklamę Google, żeby zwiększyć ruch",
            "Zaprojektowanie całego lejka: strona, która lepiej zbiera kontakt, i automatyczny follow-up, żeby żaden lead nie czekał na to, aż sam zadzwoni ponownie",
            "Nową stronę internetową i nic więcej, bo to na pewno rozwiąże problem"
          ],
          "ru": [
            "Только увеличение бюджета на рекламу в Google, чтобы было больше трафика",
            "Спроектировать всю воронку: сайт, который лучше собирает контакт, и автоматический фоллоу-ап, чтобы ни один лид не ждал, пока сам перезвонит",
            "Только новый сайт и ничего больше, потому что это точно решит проблему"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient traci leady na etapie po kontakcie (brak follow-upu) — to typowy przypadek na lejek, bo problem nie leży w jednym miejscu, tylko w całym procesie.",
          "ru": "Клиент теряет лиды на этапе после контакта (нет фоллоу-апа) — типичный случай для воронки, потому что проблема не в одном месте, а во всём процессе."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A ile dokładnie nowych klientów miesięcznie da mi taki lejek?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А сколько именно новых клиентов в месяц даст мне такая воронка?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST odmawia obiecania konkretnej liczby leadów czy klientów. Tłumaczy, że lejek daje przewidywalny, mierzalny PROCES (każdy etap można śledzić i poprawiać), a nie gwarantowaną liczbę. Wspomina, że wynik zależy od budżetu, branży i oferty. Nie używa słowa 'gwarantuję' ani nie podaje wymyślonych liczb.",
          "ru": "Хороший ответ прямо отказывается обещать конкретное число лидов или клиентов, объясняет, что воронка даёт предсказуемый, измеримый ПРОЦЕСС (каждый этап можно отслеживать и улучшать), а не гарантированное количество, упоминает, что это зависит от бюджета, ниши, предложения; не использует слово 'гарантирую' и не называет выдуманные цифры."
        }
      }
    ],
    "objections": [
      {
        "say": "Brzmi jak duży projekt, nie jestem pewien, czy tego w ogóle potrzebuję.",
        "ru": "Клиент выражает сомнение в масштабе/объёме проекта, ему нужно успокоение через разбивку на конкретные этапы.",
        "response": "Rozumiem, to faktycznie większy projekt niż pojedyncza usługa, dlatego zaczynamy od mapy tego, co Pan już ma — i dopiero na tej podstawie mówimy, co realnie warto dobudować, a nie sprzedajemy z góry całego pakietu.",
        "responseRu": "Разбивка крупного проекта на первый небольшой аудито-подобный шаг снижает порог принятия решения — отвечай, начиная с малого конкретного действия, а не с продажи всего пакета сразу.",
        "why": {
          "pl": "Rozbicie dużego projektu na pierwszy, mały krok w formie mapy obniża próg decyzyjny klienta.",
          "ru": "Разбивка крупного проекта на первый небольшой шаг в виде карты снижает порог принятия решения у клиента."
        }
      },
      {
        "say": "Czy to nie jest to samo, co strona internetowa? Przecież już ją mam.",
        "ru": "Клиент путает воронку с одним конкретным продуктом (сайтом), который у него уже есть — базовое непонимание масштаба услуги.",
        "response": "Strona to jeden element, ważny, ale sam w sobie nie prowadzi klienta dalej. Lejek to spięcie strony z tym, co się dzieje przed nią, czyli reklamą, i po niej, czyli kontaktem i follow-upem — więc może Pan mieć bardzo dobrą stronę i dalej tracić leady, bo reszta procesu nie jest domknięta.",
        "responseRu": "Чётко разграничивает сайт как один элемент от всего процесса (реклама до сайта, контакт и фоллоу-ап после) — конкретный пример показывает, что хороший сайт сам по себе не гарантирует, что лиды не теряются.",
        "why": {
          "pl": "Rozróżnienie 'jeden element' vs 'cały proces' na konkretnym przykładzie klienta jest łatwe do zrozumienia i trudne do podważenia.",
          "ru": "Разграничение 'один элемент' против 'весь процесс' на конкретном примере клиента легко понять и трудно оспорить."
        }
      },
      {
        "say": "To brzmi drogo jak na coś, czego efektów nie widać od razu.",
        "ru": "Ценовое возражение, связанное со стратегическим, долгосрочным характером услуги — клиент боится платить за что-то без немедленного результата.",
        "response": "To prawda, że to inwestycja na dłuższą metę, nie jednorazowa poprawka — ale właśnie dlatego zaczynamy od mapy lejka, żeby Pan widział dokładnie, za co płaci na każdym etapie, zamiast kupować czarną skrzynkę.",
        "responseRu": "Честно признаёт, что это долгосрочная инвестиция, но сразу компенсирует это прозрачностью первого этапа (карты воронки), чтобы клиент видел, за что платит на каждом шаге, а не покупал 'чёрный ящик'.",
        "why": {
          "pl": "Uczciwe przyznanie 'to droższa inwestycja' połączone z konkretną obietnicą przejrzystości (mapa) redukuje lęk przed 'czarną skrzynką'.",
          "ru": "Честное признание 'это более дорогая инвестиция' в сочетании с конкретным обещанием прозрачности (карта) снижает страх перед 'чёрным ящиком'."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, czy wie Pan, co się dzieje z klientem od momentu, kiedy kliknie w Pana reklamę, aż do tego, jak podpisuje z Panem umowę?",
      "ru": "Открывашка нацелена на клиентов, у которых, скорее всего, уже есть какой-то маркетинг — проверяет пробелы во всём пути клиента, а не в одном слабом месте, хорошо подходит для допродажи существующим клиентам."
    },
    "crossSell": {
      "pl": "Lejek to nie osobna usługa, tylko spięcie tego, co klient już ma albo dopiero kupuje — strony lub landing page, reklamy Google Ads czy Meta Ads, formularzy leadowych i automatyzacji w CRM czy follow-upie AI. Najlepiej sprzedaje się jako naturalny kolejny krok klientowi, który już kupił jeden lub dwa elementy i widzi, że brakuje spięcia całości.",
      "ru": "Воронка — это не отдельная услуга, а связка того, что клиент уже имеет или только покупает: сайта или лендинга, рекламы Google Ads или Meta Ads, лид-форм и автоматизации в CRM или AI-фоллоу-апе. Лучше всего продаётся как естественный следующий шаг клиенту, который уже купил один-два элемента и видит, что не хватает связки в единое целое."
    }
  },
  "geoai": {
    "title": {
      "pl": "GEO / Widoczność w AI (GEO AI)",
      "ru": "GEO / Видимость в AI (GEO AI)"
    },
    "badge": {
      "pl": "Żeby AI wiedziało, że Pana firma istnieje i czym się zajmuje",
      "ru": "Чтобы AI знал, что ваша компания существует и чем занимается"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Audyt widoczności firmy oraz uporządkowanie tego, jak wyszukiwarki i systemy AI (typu ChatGPT, Gemini, AI Overviews w Google) 'rozumieją', czym firma się zajmuje i czy w ogóle mogą ją komuś polecić. W praktyce to porządkowanie opisów, danych technicznych i źródeł, które potwierdzają, że firma robi to, co mówi, że robi — tak żeby AI miało z czego skorzystać, kiedy ktoś zapyta o polecenie w danej branży.",
          "ru": "Аудит видимости компании и упорядочивание того, как поисковые системы и AI-системы (такие как ChatGPT, Gemini, AI Overviews в Google) 'понимают', чем занимается компания, и могут ли они вообще кому-то её порекомендовать. На практике это упорядочивание описаний, технических данных и источников, подтверждающих, что компания действительно делает то, что заявляет, — чтобы AI было из чего исходить, когда кто-то спросит рекомендацию в этой нише."
        },
        "bullets": {
          "pl": [
            "Porządkowanie opisów, danych i źródeł, żeby AI rozumiało ofertę firmy",
            "To nowa, wciąż ewoluująca dziedzina — nikt nie gwarantuje konkretnych wzmianek w AI",
            "Obejmuje audyt, mapę tematów, treści, dane techniczne i monitoring"
          ],
          "ru": [
            "Упорядочивание описаний, данных и источников, чтобы AI понимал предложение компании",
            "Это новая, всё ещё развивающаяся область — никто не гарантирует конкретных упоминаний в AI",
            "Включает аудит, карту тем, контент, технические данные и мониторинг"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy eksperckie, B2B, firmy z branży SaaS oraz marki działające na kilku rynkach albo w kilku językach — czyli te, gdzie klient zanim kupi, najpierw research'uje i porównuje, a coraz częściej robi to, pytając wprost ChatGPT albo podobne narzędzie o polecenie.",
          "ru": "Экспертные компании, B2B, компании из сферы SaaS и бренды, работающие на нескольких рынках или языках, — то есть те, где клиент перед покупкой сначала изучает вопрос и сравнивает варианты, и всё чаще делает это, напрямую спрашивая ChatGPT или похожий инструмент о рекомендации."
        },
        "bullets": {
          "pl": [
            "Firmy eksperckie i B2B, gdzie klienci research'ują przed zakupem",
            "Firmy typu SaaS oraz marki działające na kilku rynkach lub w kilku językach",
            "Klienci, którzy już mają dopracowaną stronę i SEO, i chcą być krok do przodu"
          ],
          "ru": [
            "Экспертные и B2B-компании, чьи клиенты изучают вопрос перед покупкой",
            "Компании типа SaaS и бренды, работающие на нескольких рынках или языках",
            "Клиенты, у которых уже есть отлаженный сайт и SEO и которые хотят быть на шаг впереди"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której firma ma stronę i treści, ale jej oferta jest niespójnie opisana albo po prostu słabo zrozumiała dla wyszukiwarek i systemów AI. Rozpoznajesz to prostym testem: 'Niech Pan zapyta ChatGPT, żeby polecił firmę z Pana branży w Pana mieście, i zobaczy Pan, czy w ogóle się pojawiacie.' Jeśli firma ma dobrą stronę, ale nie pojawia się w takiej odpowiedzi — to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда у компании есть сайт и контент, но её предложение непоследовательно описано или просто плохо понятно поисковым системам и AI-системам. Распознаётся простым тестом: 'Спросите ChatGPT порекомендовать компанию из вашей ниши в вашем городе и посмотрите, появляетесь ли вы вообще.' Если у компании хороший сайт, но она не появляется в таком ответе — это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Firma ma stronę, ale nie pojawia się, gdy ktoś pyta AI o polecenie w tej branży",
            "Opis oferty firmy jest niespójny między stroną, social media i innymi źródłami w sieci",
            "Klient działa na kilku rynkach lub językach i chce być rozumiany wszędzie tak samo"
          ],
          "ru": [
            "У компании есть сайт, но она не появляется, когда кто-то спрашивает AI о рекомендации в этой нише",
            "Описание предложения компании непоследовательно между сайтом, соцсетями и другими источниками в сети",
            "Клиент работает на нескольких рынках или языках и хочет, чтобы его везде понимали одинаково"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Niech Pan zada ChatGPT pytanie: 'polecisz firmę zajmującą się [branża klienta] w [miasto]?' i zobaczy Pan, czy w ogóle się pojawiacie w odpowiedzi — coraz więcej ludzi szuka w ten sposób zamiast wpisywać frazę w Google.",
            "To nie jest to samo co SEO — SEO to pozycje w klasycznym Google, a to jest o tym, czy sztuczna inteligencja w ogóle rozumie i potrafi opisać, czym Pana firma się zajmuje.",
            "Będę szczery — nikt nie zagwarantuje Panu konkretnej wzmianki w ChatGPT, bo to bardzo nowa i zmieniająca się dziedzina, ale możemy uporządkować dane o firmie tak, żeby AI miało z czego korzystać, zamiast zgadywać."
          ],
          "ru": [
            "Живая демонстрация через ChatGPT — самый понятный способ показать проблему клиенту без технического жаргона, аналогично приёму 'вбейте в Google' из SEO, но для AI-эры.",
            "Ключевое разграничение с SEO — важно проговорить это прямо, иначе клиент решит, что это то же самое, что он уже покупает.",
            "Обязательная честная оговорка об отсутствии гарантий — эта услуга особенно новая, и завышенные ожидания здесь разрушительнее всего для доверия."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nigdy nie obiecuj, że firma zacznie pojawiać się w odpowiedziach ChatGPT czy innego systemu AI — to nowa, ewoluująca dziedzina i nikt tego nie gwarantuje, nawet duże agencje. Nie tłumacz tej usługi żargonem typu 'encje' czy 'dane strukturalne' — klient tego nie kupi, bo tego nie zrozumie. Nie oferuj GEO AI firmie, która nie ma jeszcze uporządkowanej strony ani SEO — to nadbudowa, nie fundament.",
          "ru": "Никогда не обещай, что компания начнёт появляться в ответах ChatGPT или другой AI-системы — это новая, развивающаяся область, и этого не гарантирует никто, даже крупные агентства. Не объясняй эту услугу жаргоном типа 'сущности' или 'структурированные данные' — клиент этого не купит, потому что не поймёт. Не предлагай GEO AI компании, у которой ещё нет упорядоченного сайта и базового SEO — это надстройка, а не фундамент."
        },
        "bullets": {
          "pl": [
            "Nigdy nie obiecuj konkretnych wzmianek czy poleceń ze strony ChatGPT lub innego AI",
            "Firma bez ogarniętej strony i podstawowego SEO → najpierw fundamenty, GEO AI to nadbudowa",
            "Nie tłumacz usługi żargonem — mów o 'rozumieniu przez AI', a nie o 'encjach' czy 'schema'"
          ],
          "ru": [
            "Никогда не обещай конкретные упоминания или рекомендации со стороны ChatGPT или другого AI",
            "У компании нет отлаженного сайта и базового SEO → сначала фундамент, GEO AI — это надстройка",
            "Не объясняй услугу жаргоном — говори о 'понимании со стороны AI', а не о 'сущностях' или 'schema'"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient pyta: 'Czy zagwarantujecie, że ChatGPT zacznie polecać moją firmę?' Co odpowiadasz?",
          "ru": "Клиент спрашивает: 'Вы гарантируете, что ChatGPT начнёт рекомендовать мою компанию?' Что отвечаешь?"
        },
        "answers": {
          "pl": [
            "Tak, gwarantujemy pierwsze miejsce w odpowiedziach AI w ciągu miesiąca",
            "Nie, nikt nie może tego zagwarantować — to nowa dziedzina, ale można uporządkować dane o firmie, żeby AI miało z czego korzystać",
            "Nie, ta usługa w ogóle nie ma żadnego wpływu na to, co mówi AI"
          ],
          "ru": [
            "Да, гарантируем первое место в ответах AI в течение месяца",
            "Нет, никто не может этого гарантировать — это новая область, но можно упорядочить данные о компании, чтобы AI было из чего исходить",
            "Нет, эта услуга вообще никак не влияет на то, что говорит AI"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Czym GEO AI różni się od klasycznego SEO?",
          "ru": "Чем GEO AI отличается от классического SEO?"
        },
        "answers": {
          "pl": [
            "Niczym, to dokładnie ta sama usługa pod inną nazwą",
            "SEO dotyczy pozycji w klasycznych wynikach wyszukiwania Google, a GEO AI dotyczy tego, czy systemy AI rozumieją i potrafią opisać ofertę firmy",
            "GEO AI dotyczy wyłącznie sklepów internetowych"
          ],
          "ru": [
            "Ничем, это точно та же услуга под другим названием",
            "SEO касается позиций в классических результатах поиска Google, а GEO AI касается того, понимают ли AI-системы и могут ли описать предложение компании",
            "GEO AI касается исключительно интернет-магазинов"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do firmy konsultingowej działającej w Polsce, Niemczech i Czechach. Właściciel mówi: 'Mamy dobrą stronę po trzech językach, ale konkurent, który jest gorszy od nas, pojawia się, jak pytam ChatGPT o polecenie firmy konsultingowej.' Co proponujesz?",
          "ru": "Звонишь в консалтинговую компанию, работающую в Польше, Германии и Чехии. Владелец говорит: 'У нас хороший сайт на трёх языках, но конкурент, который хуже нас, появляется, когда я спрашиваю ChatGPT о рекомендации консалтинговой компании.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz zrobić od zera nową stronę we wszystkich trzech językach",
            "Proponujesz GEO AI — audyt tego, jak opisana jest oferta firmy w sieci, uporządkowanie danych i treści na wszystkich rynkach, żeby AI miało spójny obraz firmy",
            "Mówisz, że to niemożliwe do poprawienia i trzeba czekać, aż samo się zmieni"
          ],
          "ru": [
            "Предлагаешь сделать с нуля новый сайт на всех трёх языках",
            "Предлагаешь GEO AI — аудит того, как описано предложение компании в сети, упорядочивание данных и контента на всех рынках, чтобы у AI была целостная картина компании",
            "Говоришь, что это невозможно исправить и нужно ждать, пока само изменится"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klasyczny przypadek na GEO AI — strona jest dobra, ale firma działa na kilku rynkach i AI najwyraźniej lepiej 'rozumie' konkurenta. To dokładnie problem niespójnych albo niepełnych danych o firmie w sieci, który ta usługa porządkuje.",
          "ru": "Классический случай для GEO AI — сайт хороший, но компания работает на нескольких рынках, и AI явно 'понимает' конкурента лучше. Это именно проблема непоследовательных или неполных данных о компании в сети, которую упорядочивает эта услуга."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'To brzmi jak marketingowy bełkot, nie rozumiem, o co tu w ogóle chodzi.' Napisz dokładnie, jak byś mu to wytłumaczył prostymi słowami.",
          "ru": "Клиент говорит: 'Это звучит как маркетинговая тарабарщина, я вообще не понимаю, о чём речь.' Напиши точно, как бы ты объяснил ему это простыми словами."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź tłumaczy usługę bez żargonu (bez słów 'encje', 'schema', 'dane strukturalne') — najlepiej przez prostą analogię, np. 'to jak dbanie o to, żeby ChatGPT i Google wiedziały dokładnie, czym się Pan zajmuje, tak samo jak dbamy o to, żeby to wiedzieli ludzie.' Nie obiecuje konkretnych wzmianek ani poleceń ze strony AI — podkreśla, że to nowa dziedzina bez gwarancji. Nie używa słowa 'gwarantuję'.",
          "ru": "Хороший ответ объясняет услугу без жаргона (без слов 'сущности', 'schema', 'структурированные данные') — лучше всего через простую аналогию, например: 'это как забота о том, чтобы ChatGPT и Google точно знали, чем вы занимаетесь, точно так же, как мы заботимся о том, чтобы это знали люди.' Не обещает конкретных упоминаний или рекомендаций со стороны AI — подчёркивает, что это новая область без гарантий. Не использует слово 'гарантирую'."
        }
      }
    ],
    "objections": [
      {
        "say": "To brzmi jak marketingowy bełkot, nie rozumiem o co chodzi.",
        "ru": "Клиент отвергает услугу как непонятный маркетинговый жаргон — нельзя защищаться терминами, нужно тут же перейти на бытовой язык и понятную аналогию с ChatGPT.",
        "response": "Rozumiem, to faktycznie nowa rzecz, więc powiem prosto: coraz więcej ludzi zamiast wpisywać frazę w Google, pyta wprost ChatGPT o polecenie firmy. Ta usługa dba o to, żeby AI w ogóle wiedziało, że Pana firma istnieje i czym się zajmuje, tak samo jak SEO dba o to samo w klasycznym Google.",
        "responseRu": "Сразу переключается с абстракции на конкретный, знакомый клиенту сценарий (спросить ChatGPT) и проводит прямую параллель с уже понятным SEO.",
        "why": {
          "pl": "Analogia do znanego już SEO i konkretny, namacalny scenariusz (pytanie do ChatGPT) tłumaczy nową usługę bez żargonu.",
          "ru": "Аналогия с уже знакомым SEO и конкретный, наглядный сценарий (вопрос к ChatGPT) объясняют новую услугу без жаргона."
        }
      },
      {
        "say": "A jak niby możecie zagwarantować, że ChatGPT nas poleci?",
        "ru": "Клиент требует гарантию в самой рискованной для гарантий области — важно не поддаться и не пообещать конкретный результат, а честно объяснить природу новой, неустоявшейся технологии.",
        "response": "Szczerze — nie mogę tego zagwarantować i każdy, kto by Panu to obiecał, mijałby się z prawdą, bo to bardzo nowa i zmieniająca się dziedzina. Mogę za to zagwarantować, że uporządkujemy dane o Pana firmie tak, żeby AI miało z czego korzystać, zamiast zgadywać albo polecać konkurencję, która akurat ma to lepiej poukładane.",
        "responseRu": "Прямо и без уклонений отказывается от гарантии, признавая новизну и нестабильность области, но сразу предлагает взамен конкретную, выполнимую гарантию процесса — упорядочивание данных.",
        "why": {
          "pl": "Szczera odmowa gwarancji w tak nowej dziedzinie buduje wiarygodność bardziej niż jakakolwiek obietnica, której nie da się dotrzymać.",
          "ru": "Честный отказ от гарантии в столь новой области строит доверие сильнее, чем любое обещание, которое невозможно сдержать."
        }
      },
      {
        "say": "Nie znam nikogo, kto by pytał ChatGPT o polecenie firmy, to niszowa sprawa.",
        "ru": "Клиент считает явление нишевым и незначительным — нужно не преувеличивать текущий масштаб, а сместить рамку на тренд и подготовку на опережение.",
        "response": "Rozumiem sceptycyzm, ale to zmienia się bardzo szybko — coraz więcej osób, szczególnie młodszych i w B2B, zaczyna research od razu od AI zamiast od Google. Nie mówię, że to zastąpi wyszukiwarkę, ale lepiej być przygotowanym na to, gdzie ludzie już dziś zaczynają szukać, niż nadrabiać, jak to się upowszechni.",
        "responseRu": "Не спорит с текущим масштабом явления, а меняет рамку разговора с 'сейчас' на 'куда всё движется', позиционируя действие как разумную подготовку, а не панику.",
        "why": {
          "pl": "Przesunięcie ramy z 'ile osób robi to dziś' na 'dokąd to zmierza' neutralizuje zarzut o niszowości bez wchodzenia w spór o liczby.",
          "ru": "Смещение рамки с 'сколько людей делает это сегодня' на 'куда это движется' нейтрализует упрёк в нишевости без спора о цифрах."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — czy próbował Pan kiedyś zapytać ChatGPT, żeby polecił firmę taką jak Pana w Pana mieście, i sprawdzić, czy w ogóle się pojawiacie?",
      "ru": "Открывашка использует тот же приём демонстрации, что и в SEO ('вбейте в Google'), но переносит его в AI-контекст — работает лучше всего с клиентами, которые уже слышали про ChatGPT, особенно в B2B и экспертных нишах."
    },
    "crossSell": {
      "pl": "GEO AI naturalnie łączy się z SEO, bo obie usługi dotyczą tego, czy firma jest w ogóle znajdowana — jedna w klasycznym Google, druga w wynikach i odpowiedziach AI — a z analityką pozwala śledzić, czy ruch i zapytania z nowych, AI-owych źródeł w ogóle rosną.",
      "ru": "GEO AI естественно сочетается с SEO, поскольку обе услуги касаются того, находят ли компанию вообще — одна в классическом Google, другая в результатах и ответах AI, — а с аналитикой позволяет отслеживать, растёт ли вообще трафик и обращения из новых, AI-источников."
    }
  },
  "aichatbot": {
    "title": {
      "pl": "AI Chatbot na stronie",
      "ru": "ИИ-чат-бот на сайте"
    },
    "badge": {
      "pl": "odpowiada 24/7",
      "ru": "отвечает 24/7"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "AI Chatbot to asystent osadzony na stronie klienta, który rozmawia z odwiedzającymi w czasie rzeczywistym: odpowiada na pytania, zbiera dane kontaktowe i może zaproponować umówienie kontaktu. Działa na bazie wiedzy zbudowanej z realnych materiałów klienta — cennika, FAQ, zasad działania firmy — więc nie improwizuje odpowiedzi, tylko trzyma się tego, czego go nauczono.",
          "ru": "ИИ-чат-бот — это ассистент, встроенный в сайт клиента, который в реальном времени общается с посетителями: отвечает на вопросы, собирает контактные данные и может предложить связаться с компанией. Он работает на базе знаний, составленной из реальных материалов клиента — прайса, FAQ, правил работы компании — поэтому не выдумывает ответы, а строго придерживается того, чему его обучили."
        },
        "bullets": {
          "pl": [
            "Widget na stronie internetowej, wygląda jak okienko czatu w rogu ekranu",
            "Odpowiada natychmiast, także w nocy i w weekend",
            "Umie zebrać dane kontaktowe i przekazać rozmowę żywej osobie, kiedy pytanie wykracza poza jego wiedzę"
          ],
          "ru": [
            "Виджет на сайте, выглядит как окошко чата в углу экрана",
            "Отвечает мгновенно, в том числе ночью и в выходные",
            "Умеет собрать контактные данные и передать разговор живому человеку, если вопрос выходит за пределы его знаний"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmom, które dostają dużo powtarzalnych pytań przez stronę czy komunikator, zwłaszcza poza godzinami pracy — kliniki, nieruchomości, e-commerce, usługi z jasnym cennikiem i FAQ, gdzie recepcja albo właściciel codziennie odpowiada na te same dziesięć pytań.",
          "ru": "Компаниям, которые получают много однотипных вопросов через сайт или мессенджер, особенно вне рабочего времени — клиники, недвижимость, e-commerce, услуги с понятным прайсом и FAQ, где ресепшн или владелец каждый день отвечает на одни и те же десять вопросов."
        },
        "bullets": {
          "pl": [
            "Firmy, gdzie klienci piszą wieczorami i w weekendy, kiedy nikt nie odbiera",
            "Branże z powtarzalnymi pytaniami: cennik, godziny, dostępność, jak to działa",
            "Firmy, które mają ruch na stronie, ale tracą zapytania, bo nikt szybko nie odpowiada"
          ],
          "ru": [
            "Компании, где клиенты пишут вечерами и в выходные, когда никто не отвечает",
            "Отрасли с повторяющимися вопросами: цена, часы работы, наличие, как это работает",
            "Компании с трафиком на сайте, теряющие заявки из-за медленного ответа"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: zapytania giną albo są opóźnione, bo nikt nie odpowiada wystarczająco szybko, zwłaszcza poza godzinami — a klient w tym czasie idzie do konkurencji. Rozpoznajesz to, pytając, czy wiadomości na stronie czy Messengerze się kumulują, jak szybko zwykle odpisują i czy tracą ludzi, bo ktoś napisał wieczorem, a odpowiedź dostał dopiero następnego dnia.",
          "ru": "Проблема: заявки теряются или задерживаются, потому что никто не отвечает достаточно быстро, особенно вне рабочего времени — а клиент за это время уходит к конкурентам. Распознать это можно, спросив, копятся ли сообщения на сайте или в мессенджере, как быстро на них обычно отвечают, и теряют ли клиентов из-за того, что человек написал вечером, а ответ получил только на следующий день."
        },
        "bullets": {
          "pl": [
            "Klient mówi, że 'nie nadążamy odpisywać na wiadomości'",
            "Ruch na stronie jest spory, ale mało z tego telefonów czy rezerwacji",
            "Te same pytania (cena, godziny, wolny termin) wracają codziennie"
          ],
          "ru": [
            "Клиент говорит, что 'не успевают отвечать на сообщения'",
            "Трафик на сайте приличный, но мало звонков или бронирований",
            "Одни и те же вопросы (цена, часы работы, свободный слот) повторяются каждый день"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od diagnozy skali problemu, potem przejdź do konkretnej korzyści, na końcu rozwiej najczęstszy strach o to, że bot 'coś nawymyśla'.",
          "ru": "Начни с диагностики масштаба проблемы, затем переходи к конкретной выгоде, в конце сними главный страх — что бот 'что-то придумает от себя'."
        },
        "bullets": {
          "pl": [
            "Ile razy dziennie ktoś pyta Państwa o to samo przez czat albo Messengera?",
            "Możemy dać Państwa stronie asystenta, który odpowie klientowi od razu, nawet o 23, i przekaże Wam tylko te kontakty, które są konkretne.",
            "To nie jest automat, który zgaduje — uczymy go tylko na Waszych realnych informacjach, więc nie powie nic, czego nie powinien."
          ],
          "ru": [
            "Диагностический вопрос — узнать масштаб проблемы (сколько раз в день повторяются одни и те же вопросы), это открывает разговор и подводит клиента к тому, что бот сэкономит время.",
            "Главный питч — говорим на языке выгоды (клиент получает ответ сразу, даже ночью) и сразу снимаем страх 'бот наспамит мусорными лидами' — уточняем, что передаём только конкретные контакты.",
            "Закрывает возражение 'бот наврёт что-то клиенту' — объясняем, что бот отвечает строго по базе знаний компании, а не выдумывает."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj chatbota, gdy firma ma znikomy ruch na stronie (nie ma czego obsługiwać) albo sprzedaje przez długą, indywidualną rozmowę, gdzie bot bardziej przeszkodzi niż pomoże. Nigdy nie sprzedawaj tego jako pełnego zastępstwa recepcji czy sprzedawcy — bot odciąża zespół od rutyny, ale nie zastępuje go w trudniejszych rozmowach.",
          "ru": "Не предлагай чат-бота, если у компании почти нет трафика на сайте (обслуживать нечего) или продажа строится на долгом индивидуальном разговоре, где бот скорее помешает, чем поможет. Никогда не продавай это как полную замену ресепшн или продавца — бот снимает с команды рутину, но не заменяет её в сложных разговорах."
        },
        "bullets": {
          "pl": [
            "Firma ma bardzo mały ruch na stronie — chatbot nie ma czego obsługiwać",
            "Sprzedaż wymaga długiej, indywidualnej rozmowy (np. skomplikowane usługi prawne, duże kontrakty B2B) — bot zniechęci zamiast pomóc",
            "Klient oczekuje, że bot 'zastąpi recepcję' w 100% — trzeba jasno powiedzieć, że on odciąża, a nie zastępuje ludzi"
          ],
          "ru": [
            "У компании очень мало трафика на сайте — боту нечего обслуживать",
            "Продажа требует долгого индивидуального разговора (сложные юридические услуги, крупные B2B-контракты) — бот скорее оттолкнёт, чем поможет",
            "Клиент ждёт, что бот на 100% заменит ресепшн — нужно чётко сказать, что бот разгружает, а не заменяет людей"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient pyta: 'Czym się różni ten chatbot od tej automatyzacji zapytań, o której też mówiliście?' Jak najlepiej to wytłumaczyć?",
          "ru": "Клиент спрашивает: 'А чем этот чат-бот отличается от автоматизации заявок, о которой вы тоже говорили?' Как лучше это объяснить?"
        },
        "answers": {
          "pl": [
            "Chatbot rozmawia z klientem na żywo na stronie i odpowiada na pytania, automatyzacja zapytań to system, który już złożone zgłoszenie przenosi do CRM i do odpowiedniej osoby",
            "To dokładnie ta sama usługa pod dwoma nazwami",
            "Automatyzacja zapytań też rozmawia z klientem, tylko wolniej"
          ],
          "ru": [
            "Чат-бот в реальном времени общается с клиентом на сайте и отвечает на вопросы, а автоматизация заявок — это система, которая уже поданную заявку переносит в CRM и к нужному человеку",
            "Это одна и та же услуга под двумя названиями",
            "Автоматизация заявок тоже общается с клиентом, только медленнее"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Kiedy NIE warto proponować chatbota?",
          "ru": "Когда НЕ стоит предлагать чат-бота?"
        },
        "answers": {
          "pl": [
            "Kiedy firma ma bardzo mały ruch na stronie i sprzedaje przez długie, indywidualne rozmowy",
            "Kiedy firma dostaje dużo powtarzalnych pytań wieczorami",
            "Kiedy klient ma stronę internetową"
          ],
          "ru": [
            "Когда у компании очень мало трафика на сайте и продажа строится на долгих индивидуальных разговорах",
            "Когда компания получает много повторяющихся вопросов по вечерам",
            "Когда у клиента есть сайт"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'Fajnie, czyli zamiast recepcjonistki będę miał bota i zwolnię etat?' Co robisz?",
          "ru": "Клиент говорит: 'Отлично, значит вместо ресепшн у меня будет бот, и я смогу сократить ставку?' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Potwierdzasz, że tak, bot w pełni zastąpi recepcjonistkę",
            "Tłumaczysz, że bot odciąża recepcję od powtarzalnych pytań, ale nie zastępuje człowieka przy trudniejszych czy nietypowych sprawach",
            "Zmieniasz temat, bo to niewygodne pytanie"
          ],
          "ru": [
            "Подтверждаешь, что да, бот полностью заменит ресепшн",
            "Объясняешь, что бот снимает с ресепшн рутинные вопросы, но не заменяет человека в сложных или нестандартных случаях",
            "Меняешь тему, потому что вопрос неудобный"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Obiecywanie pełnej zamiany ludzi automatyzacją to nierealna obietnica, która wraca jako reklamacja — bot wspiera zespół, nie usuwa go.",
          "ru": "Обещание полной замены людей автоматизацией — нереалистичное обещание, которое потом обернётся жалобой. Бот поддерживает команду, а не устраняет её."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'A jeśli bot odpowie klientowi coś głupiego albo błędnego, kto za to odpowiada?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'А если бот ответит клиенту что-то глупое или неверное, кто за это отвечает?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź powinna zawierać: bot odpowiada wyłącznie na podstawie bazy wiedzy przygotowanej z materiałów klienta, a nie improwizuje; ma wyznaczone granice — gdy pytanie wykracza poza wiedzę, przekazuje kontakt zamiast zgadywać; przed uruchomieniem jest testowany na realnych pytaniach; odpowiedź powinna być uczciwa, nie obiecywać 'to się nigdy nie zdarzy', tylko pokazać mechanizm, który minimalizuje ryzyko.",
          "ru": "Хороший ответ должен включать: бот отвечает исключительно на основе базы знаний, составленной из материалов клиента, а не импровизирует; у него есть заданные границы — при выходе за пределы знаний он передаёт контакт, а не гадает; перед запуском бот тестируется на реальных вопросах; ответ должен быть честным, не обещать 'такого никогда не случится', а показывать механизм, минимизирующий риск."
        }
      }
    ],
    "objections": [
      {
        "say": "A skąd bot będzie wiedział, co odpowiadać? Będzie zmyślał?",
        "ru": "Клиент боится, что бот будет 'галлюцинировать' и придумывать неправильные ответы — типичный страх, связанный с ИИ.",
        "response": "Nie zmyśla. Bot działa tylko na bazie tego, co mu przygotujemy z Waszych materiałów — cennik, FAQ, zasady. Jak pytanie wychodzi poza to, po prostu mówi, że przekaże je do Was, zamiast zgadywać.",
        "responseRu": "Объясняем логику: бот ограничен базой знаний клиента, за пределами базы он не выдумывает, а передаёт вопрос человеку. Это снимает страх и звучит конкретно, не как магическое заверение.",
        "why": {
          "pl": "Konkretny mechanizm (baza wiedzy + granice) jest bardziej przekonujący niż ogólne zapewnienie 'to bezpieczne'.",
          "ru": "Конкретный механизм убеждает лучше, чем общее заверение «это безопасно»."
        }
      },
      {
        "say": "Mam już czat na stronie, taki podstawowy z Facebooka, po co mi coś więcej?",
        "ru": "Клиент уже пользуется бесплатным/базовым чатом и не видит разницы с полноценным ИИ-ботом.",
        "response": "Ten podstawowy czat tylko przekazuje wiadomość dalej — ktoś i tak musi usiąść i odpisać. Nasz bot faktycznie odpowiada od razu na konkretne pytania, więc klient dostaje odpowiedź, zanim ktoś z Was to w ogóle zobaczy.",
        "responseRu": "Подчёркиваем разницу между 'просто чатом для переписки' и 'ботом, который реально отвечает без участия человека' — ключевое отличие в мгновенном автоматическом ответе.",
        "why": {
          "pl": "Pokazujesz konkretną różnicę funkcjonalną zamiast spierać się, które narzędzie jest 'lepsze'.",
          "ru": "Показываем функциональную разницу вместо спора, чей инструмент лучше."
        }
      },
      {
        "say": "Klienci lubią rozmawiać z żywym człowiekiem, boję się, że bot ich zniechęci.",
        "ru": "Страх потери 'человечности' в общении с клиентами.",
        "response": "Dlatego bot odpowiada tylko na te proste, powtarzalne pytania — cennik, godziny, dostępność. Jak sprawa jest bardziej złożona, od razu przekazuje kontakt do Was. Człowiek wchodzi tam, gdzie naprawdę jest potrzebny.",
        "responseRu": "Объясняем, что бот берёт на себя только простые повторяющиеся вопросы, а сложные случаи сразу передаются живому человеку — то есть 'человечность' не теряется, а освобождается для важных разговоров.",
        "why": {
          "pl": "Nie walczysz z emocją klienta, tylko pokazujesz, że bot i człowiek mają różne role.",
          "ru": "Не спорим с эмоцией клиента, а показываем разделение ролей между ботом и человеком."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię, bo zauważyłem, że macie ruch na stronie, ale nie widziałem u Was czegoś, co odpowiada klientom po godzinach — mogę o tym w dwóch zdaniach opowiedzieć?",
      "ru": "Подходит для холодного звонка компаниям с активным сайтом, где виден трафик, но нет вечерней/ночной поддержки — открывашка сразу называет конкретную наблюдаемую проблему, а не общую фразу."
    },
    "crossSell": {
      "pl": "Naturalnie łączy się z Automatyzacją zapytań (aiauto) — bot zbiera kontakt, a automatyzacja od razu wrzuca go do CRM i przypisuje do odpowiedniej osoby, więc żaden lead nie ginie między czatem a systemem sprzedaży.",
      "ru": "Естественно сочетается с автоматизацией заявок (aiauto) — бот собирает контакт, а автоматизация сразу заносит его в CRM и назначает ответственного, чтобы ни один лид не терялся между чатом и отделом продаж."
    }
  },
  "aiauto": {
    "title": {
      "pl": "Automatyzacja zapytań",
      "ru": "Автоматизация заявок"
    },
    "badge": {
      "pl": "zero ręcznego przepisywania",
      "ru": "без ручного переноса"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Gdy ktoś wypełni formularz na stronie, napisze na Messengerze albo wyśle zapytanie mailem, ten system automatycznie łapie zgłoszenie i przenosi je w jedno miejsce, zwykle do CRM, powiadamia odpowiedzialną osobę i tworzy zadanie, żeby nikt nie zapomniał oddzwonić. Nikt nie musi ręcznie przepisywać imienia i numeru ze skrzynki mailowej do arkusza.",
          "ru": "Когда кто-то заполняет форму на сайте, пишет в мессенджере или отправляет запрос по почте, эта система автоматически подхватывает заявку и переносит её в одно место, обычно в CRM, уведомляет ответственного и создаёт задачу, чтобы никто не забыл перезвонить. Никому не нужно вручную переписывать имя и номер из почты в таблицу."
        },
        "bullets": {
          "pl": [
            "Zgłoszenie z formularza, maila czy Messengera trafia od razu do jednego miejsca, np. CRM",
            "Odpowiedzialna osoba dostaje powiadomienie w tej samej minucie, nie następnego dnia",
            "System sam tworzy zadanie 'zadzwoń do klienta', żeby nikt nie zapomniał"
          ],
          "ru": [
            "Заявка с формы, почты или мессенджера сразу попадает в одно место, например в CRM",
            "Ответственный получает уведомление в ту же минуту, а не на следующий день",
            "Система сама создаёт задачу 'позвонить клиенту', чтобы никто не забыл"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmom, które dostają zapytania z kilku kanałów naraz — formularz, mail, Messenger, telefon — i gdzie ktoś ręcznie przepisuje dane klienta ze skrzynki do CRM albo Excela, albo gorzej: nie przepisuje wcale, więc zgłoszenie po prostu leży.",
          "ru": "Компаниям, которые получают заявки сразу из нескольких каналов — форма, почта, мессенджер, телефон — и где кто-то вручную переносит данные клиента из почты в CRM или Excel, а то и вовсе не переносит, и заявка просто лежит без движения."
        },
        "bullets": {
          "pl": [
            "Firmy, które dostają zapytania z kilku źródeł naraz: formularz, mail, Messenger, telefon",
            "Ktoś w firmie ręcznie przepisuje dane klienta z maila do Excela czy CRM",
            "Firmy, gdzie zapytania czasem po prostu giną, bo nikt ich nie zauważył na czas"
          ],
          "ru": [
            "Компании, получающие заявки сразу из нескольких источников: форма, почта, мессенджер, телефон",
            "Кто-то в компании вручную переносит данные клиента из почты в Excel или CRM",
            "Компании, где заявки иногда просто теряются, потому что их вовремя не заметили"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: leady giną albo są opóźnione, bo są rozproszone po różnych kanałach i ktoś musi je ręcznie zauważyć. Rozpoznajesz to, pytając, gdzie trafiają zapytania, ile miejsc trzeba sprawdzić, żeby nic nie przegapić, i czy zdarza się, że ktoś dzwoni do klienta trzy dni po tym, jak on napisał.",
          "ru": "Проблема: лиды теряются или обрабатываются с опозданием, потому что они разбросаны по разным каналам, и кто-то должен вручную их заметить. Распознать это можно, спросив, куда попадают заявки, сколько мест нужно проверять, чтобы ничего не упустить, и бывает ли, что клиенту перезванивают через три дня после его обращения."
        },
        "bullets": {
          "pl": [
            "Klient mówi, że 'czasem ktoś napisze, a my zauważamy to dopiero za kilka dni'",
            "Zapytania przychodzą na kilka różnych adresów mailowych czy komunikatorów",
            "Nikt konkretny nie jest odpowiedzialny za 'złapanie' nowego zapytania"
          ],
          "ru": [
            "Клиент говорит, что 'иногда кто-то пишет, а мы замечаем это только через несколько дней'",
            "Заявки приходят на несколько разных адресов почты или мессенджеров",
            "Никто конкретно не отвечает за то, чтобы 'поймать' новую заявку"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od pytania diagnostycznego, które ujawnia chaos, potem pokaż wynik, na końcu zdejmij obawę, że to 'kolejny system do pilnowania'.",
          "ru": "Начни с диагностического вопроса, вскрывающего хаос, затем покажи результат, в конце сними страх 'ещё одной системы, за которой нужно следить'."
        },
        "bullets": {
          "pl": [
            "Jak to u Was wygląda — jak klient wypełni formularz na stronie, to gdzie to trafia i kto to widzi jako pierwszy?",
            "Możemy to spiąć tak, że każde zapytanie — czy to z formularza, maila czy Messengera — samo ląduje w jednym miejscu i od razu ktoś dostaje o tym info.",
            "To nie jest dodatkowy program do pilnowania, tylko coś, co działa w tle — Wy tylko dostajecie gotowe zgłoszenie z zadaniem 'zadzwoń'."
          ],
          "ru": [
            "Диагностический вопрос, вскрывающий хаос — куда падают заявки и кто первым их видит; часто выясняется, что несколько человек «вроде бы» за это отвечают, то есть по факту никто.",
            "Питч на языке результата — объединяем разрозненные источники в один поток, снимаем нагрузку с человека, который должен был всё это «ловить».",
            "Снимаем страх «ещё одна система, за которой надо следить» — объясняем, что это фоновый процесс, а не дополнительная работа."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj tego firmie, która dostaje zapytania z jednego kanału i już dobrze trafiają do CRM, ani firmie z bardzo małą liczbą zapytań tygodniowo, gdzie koszt wdrożenia się nie zwróci. Nie sprzedawaj też aiauto jako lekarstwa na problem, którym jest brak dyscypliny — jeśli handlowcy po prostu nie oddzwaniają, to nie naprawi żadna automatyzacja.",
          "ru": "Не предлагай это компании, у которой заявки идут из одного канала и уже хорошо попадают в CRM, а также компании с очень малым числом заявок в неделю, где внедрение не окупится. Не продавай aiauto как лекарство от проблемы отсутствия дисциплины — если продавцы просто не перезванивают, никакая автоматизация это не исправит."
        },
        "bullets": {
          "pl": [
            "Firma dostaje zapytania z jednego źródła i już dobrze trafiają do CRM — nie ma czego naprawiać",
            "Bardzo mała liczba zapytań tygodniowo — koszt wdrożenia się nie zwróci",
            "Problemem nie jest gubienie zapytań, tylko to, że nikt do klientów nie oddzwania — to naprawi dyscyplina zespołu, nie automatyzacja"
          ],
          "ru": [
            "У компании заявки идут из одного источника и уже хорошо попадают в CRM — чинить нечего",
            "Очень мало заявок в неделю — внедрение не окупится",
            "Проблема не в потере заявок, а в том, что никто клиентам не перезванивает — это лечится дисциплиной команды, а не автоматизацией"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Czym aiauto różni się od crmauto (CRM automations)?",
          "ru": "Чем aiauto отличается от crmauto (CRM automations)?"
        },
        "answers": {
          "pl": [
            "aiauto zajmuje się tym, żeby zapytanie w ogóle trafiło do CRM i do właściwej osoby; crmauto zajmuje się tym, co dzieje się z nim już wewnątrz CRM — statusami, zadaniami, przypomnieniami",
            "To ta sama usługa pod inną nazwą",
            "crmauto dotyczy tylko formularzy na stronie"
          ],
          "ru": [
            "aiauto отвечает за то, чтобы заявка вообще попала в CRM и к нужному человеку; crmauto отвечает за то, что происходит с ней уже внутри CRM — статусы, задачи, напоминания",
            "Это одна и та же услуга под другим названием",
            "crmauto касается только форм на сайте"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Który sygnał od klienta najlepiej wskazuje, że warto zaproponować automatyzację zapytań?",
          "ru": "Какой сигнал от клиента лучше всего указывает, что стоит предложить автоматизацию заявок?"
        },
        "answers": {
          "pl": [
            "'Czasem zauważamy zapytanie dopiero po kilku dniach, bo przychodzi na różne adresy'",
            "'Mamy mało zapytań, ale świetnie nimi zarządzamy'",
            "'Nasz CRM ma za mało kolorowych statusów'"
          ],
          "ru": [
            "'Иногда мы замечаем заявку только через несколько дней, потому что она приходит на разные адреса'",
            "'У нас мало заявок, но мы отлично ими управляем'",
            "'В нашем CRM слишком мало цветных статусов'"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'U nas zapytania przychodzą tylko przez jeden formularz i od razu widzi je handlowiec, wszystko gra.' Co robisz?",
          "ru": "Клиент говорит: 'У нас заявки приходят только через одну форму, и продавец сразу их видит, всё работает.' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Mimo to naciskasz mocno na automatyzację zapytań, bo to Twój produkt",
            "Przyznajesz, że w tym akurat obszarze wygląda to dobrze, i pytasz o inne miejsca, gdzie mogą się gubić zgłoszenia albo o CRM czy raporty",
            "Kończysz rozmowę, bo klient nie potrzebuje żadnej usługi"
          ],
          "ru": [
            "Всё равно настойчиво предлагаешь автоматизацию заявок, потому что это твой продукт",
            "Признаёшь, что именно в этой части всё выглядит хорошо, и спрашиваешь про другие места, где заявки могут теряться, либо про CRM или отчёты",
            "Завершаешь разговор, потому что клиенту ничего не нужно"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Uczciwe przyznanie, że akurat to nie jest problem, buduje zaufanie i otwiera drzwi do innej, faktycznie potrzebnej usługi.",
          "ru": "Честное признание, что именно здесь проблемы нет, укрепляет доверие и открывает дорогу к другой, реально нужной услуге."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Mamy tylko z 5 zapytań tygodniowo, to się w ogóle opłaca?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'У нас всего около 5 заявок в неделю, это вообще окупается?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź powinna uczciwie przyznać, że przy tak małej skali zwrot z inwestycji jest wątpliwy, zapytać nie tylko o liczbę, ale ile czasu zajmuje ręczna obsługa każdego zgłoszenia i czy zdarzają się zgubione leady, i nie sprzedawać na siłę — nagradzana jest uczciwość, nie nachalność.",
          "ru": "Хороший ответ должен честно признать, что при такой малой нагрузке окупаемость сомнительна, спросить не только про количество, но и сколько времени уходит на ручную обработку каждой заявки и теряются ли лиды, и не продавать любой ценой — ценится честность, а не напор."
        }
      }
    ],
    "objections": [
      {
        "say": "Mamy już CRM, nasz handlowiec sam wpisuje dane, to działa.",
        "ru": "Клиент считает, что раз хоть какой-то процесс существует (ручной), то всё в порядке.",
        "response": "Ok, czyli działa, dopóki ktoś pamięta i ma czas. Pytanie, czy zdarzyło się, że akurat był urlop, dzień wolny, albo napłynęło więcej zapytań naraz i coś umknęło?",
        "responseRu": "Не спорим напрямую, а задаём вопрос, который показывает уязвимость ручного процесса (отпуск, перегрузка), не называя это провалом клиента.",
        "why": {
          "pl": "Pytanie zamiast kontrargumentu pozwala klientowi samemu dojść do słabości obecnego procesu.",
          "ru": "Вопрос вместо спора позволяет клиенту самому увидеть слабое место процесса."
        }
      },
      {
        "say": "Boję się, że coś się popsuje i zapytania będą znikać w nowym systemie, a teraz chociaż wiem, że wszystko jest w mailu.",
        "ru": "Страх, что автоматизация станет 'чёрным ящиком', и всё будет ещё хуже, чем сейчас.",
        "response": "Rozumiem, dlatego nic nie znika ze starego miejsca — mail dalej działa jak działał, po prostu dokładamy krok, który automatycznie kopiuje zgłoszenie dalej i pilnuje, żeby ktoś je zobaczył.",
        "responseRu": "Снимаем страх 'чёрного ящика' — объясняем, что старый канал не отключается, автоматизация добавляется поверх, а не вместо.",
        "why": {
          "pl": "Pokazujesz, że zmiana jest dodatkiem, a nie ryzykownym zastąpieniem czegoś, co już działa.",
          "ru": "Показываем, что изменение — это дополнение, а не рискованная замена существующего процесса."
        }
      },
      {
        "say": "To brzmi bardzo technicznie, nie mamy nikogo, kto by to ogarnął.",
        "ru": "Страх сложности внедрения и того, что клиенту самому придётся во всём разбираться технически.",
        "response": "Nie musicie niczego ogarniać technicznie — my to spinamy i testujemy, Wy dostajecie gotowy proces. Od Waszej strony zmienia się tylko to, że dostajecie zgłoszenia w jednym miejscu zamiast szukać ich po skrzynkach.",
        "responseRu": "Убираем техническую нагрузку с клиента — подчёркиваем, что вся сложность на стороне студии, а клиент получает только простой результат.",
        "why": {
          "pl": "Oddzielasz 'skomplikowane wdrożenie' (nasz problem) od 'prosty efekt' (ich korzyść).",
          "ru": "Разделяем «сложное внедрение» (наша забота) и «простой результат» (их выгода)."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, mam pytanie — jak u Was wygląda droga zapytania od klienta, od momentu jak ktoś wypełni formularz na stronie, do momentu jak ktoś do niego oddzwoni?",
      "ru": "Подходит для холодного звонка — открывашка не про продукт, а про диагностический вопрос, который сам обнажает проблему (если процесс запутанный, клиент сам это скажет)."
    },
    "crossSell": {
      "pl": "Świetnie łączy się z AI lead qualification (aiqualify) — jak zapytania już trafiają w jedno miejsce, można od razu dodać ocenę, które z nich są najbardziej wartościowe, żeby zespół zaczynał od najlepszych.",
      "ru": "Хорошо сочетается с AI lead qualification (aiqualify) — когда заявки уже стекаются в одно место, можно сразу добавить оценку их ценности, чтобы команда начинала с лучших лидов."
    }
  },
  "aiqualify": {
    "title": {
      "pl": "AI lead qualification",
      "ru": "ИИ-квалификация лидов"
    },
    "badge": {
      "pl": "najpierw najlepsze leady",
      "ru": "сначала лучшие лиды"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "To automatyczny system oceny: każde nowe zapytanie jest sprawdzane według uzgodnionych kryteriów (np. sygnały budżetu, pilność, lokalizacja, rodzaj zapytania) i dostaje ocenę albo etykietę, np. 'gorący / ciepły / zimny lead', żeby zespół sprzedaży dzwonił najpierw do tych najbardziej obiecujących, a nie w losowej kolejności.",
          "ru": "Это система автоматической оценки: каждая новая заявка проверяется по согласованным критериям (сигналы бюджета, срочность, локация, тип запроса) и получает оценку или метку, например 'горячий / тёплый / холодный лид', чтобы отдел продаж звонил сначала самым перспективным, а не в случайном порядке."
        },
        "bullets": {
          "pl": [
            "Każde nowe zapytanie dostaje ocenę albo etykietę, np. 'gorący / ciepły / zimny lead'",
            "Kryteria oceny są ustalane wspólnie z zespołem sprzedaży — to nie jest czarna skrzynka",
            "Handlowiec widzi od razu, od kogo zacząć dzwonić w danym dniu"
          ],
          "ru": [
            "Каждая новая заявка получает оценку или метку, например 'горячий / тёплый / холодный лид'",
            "Критерии оценки согласовываются вместе с отделом продаж — это не чёрный ящик",
            "Продавец сразу видит, с кого начать звонки в этот день"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmom z dużą liczbą zapytań dziennie i ograniczonym zespołem sprzedaży, gdzie handlowiec traci czas, przechodząc przez leady w losowej kolejności, wśród których jest sporo słabych kontaktów wymieszanych z realnymi kupującymi.",
          "ru": "Компаниям с большим количеством заявок в день и ограниченной командой продаж, где продавец теряет время, проходя по лидам в случайном порядке, среди которых много слабых контактов вперемешку с реальными покупателями."
        },
        "bullets": {
          "pl": [
            "Firmy z dużą liczbą zapytań dziennie i małym zespołem sprzedaży",
            "Wśród zapytań jest dużo 'słabych' kontaktów, które zabierają czas bez efektu",
            "Zespół narzeka, że nie wie, od kogo zacząć dzień"
          ],
          "ru": [
            "Компании с большим количеством заявок в день и небольшой командой продаж",
            "Среди заявок много 'слабых' контактов, отнимающих время без результата",
            "Команда жалуется, что не знает, с кого начать день"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: czas sprzedaży marnowany jest na słabe kontakty, a dobre leady czekają albo stygną, bo handlowiec dzwoni w kolejności napływu, nie wartości. Rozpoznajesz to, pytając, jak dziś zespół decyduje, do kogo zadzwonić najpierw, i czy handlowiec za każdym razem ręcznie ocenia, czy dany kontakt w ogóle ma sens.",
          "ru": "Проблема: время продавцов тратится на слабые контакты, а хорошие лиды ждут или остывают, потому что продавец звонит в порядке поступления, а не по ценности. Распознать это можно, спросив, как сегодня команда решает, кому звонить первым, и оценивает ли продавец каждый раз вручную, стоит ли вообще связываться с этим контактом."
        },
        "bullets": {
          "pl": [
            "Klient mówi, że handlowcy 'dzwonią po kolei, jak leady wpadają'",
            "Część zapytań w ogóle nie ma sensu obdzwaniać (zły budżet, zła lokalizacja, niewłaściwa usługa)",
            "Najlepsze leady czasem czekają dłużej niż te słabe, bo trafiają się przypadkiem później na liście"
          ],
          "ru": [
            "Клиент говорит, что продавцы 'звонят по порядку, как приходят лиды'",
            "Часть заявок вообще не имеет смысла обзванивать (неподходящий бюджет, локация, услуга)",
            "Лучшие лиды иногда ждут дольше слабых, потому что случайно оказались позже в списке"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od pytania o dzisiejszy sposób ustalania kolejności dzwonienia, potem pokaż mechanizm etykietowania, na końcu podkreśl, że decyzja i tak zostaje przy człowieku.",
          "ru": "Начни с вопроса о том, как сейчас определяется порядок звонков, затем покажи механизм присвоения меток, в конце подчеркни, что финальное решение всё равно за человеком."
        },
        "bullets": {
          "pl": [
            "Jak teraz Wasz zespół decyduje, do kogo zadzwonić najpierw, jak jest kilkanaście nowych zapytań na raz?",
            "Możemy sprawić, że każde zapytanie od razu dostanie etykietę — gorący, ciepły albo zimny lead — według kryteriów, które sami ustalicie, więc handlowiec zaczyna dzień od najlepszych kontaktów.",
            "To nie zastępuje decyzji handlowca, tylko podpowiada mu kolejność — on i tak widzi wszystkie leady, po prostu wie, od czego zacząć."
          ],
          "ru": [
            "Диагностический вопрос — как сейчас команда решает порядок звонков; часто ответ «по порядку поступления», что и есть проблема.",
            "Питч — объясняем механику: каждая заявка получает метку по критериям, согласованным с самим клиентом (не навязанным нами), это снимает недоверие «AI решает за нас».",
            "Снимаем страх подмены решения продавца — скоринг только подсказывает порядок, финальное решение остаётся у человека."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj, gdy liczba zapytań jest tak mała, że zespół i tak obdzwania wszystkich tego samego dnia, gdy wszystkie leady są praktycznie takie same i nie ma czego różnicować, albo gdy zespół w ogóle nie chce lub nie potrafi określić, co czyni leada 'dobrym' — bez tych kryteriów ocena nie ma się na czym oprzeć.",
          "ru": "Не предлагай, если заявок так мало, что команда всё равно обзванивает всех в тот же день, если все лиды практически одинаковые и различать нечего, или если команда вообще не хочет или не может определить, что делает лида 'хорошим' — без этих критериев оценке не на чем строиться."
        },
        "bullets": {
          "pl": [
            "Bardzo mała liczba zapytań — zespół i tak obdzwania wszystkich tego samego dnia",
            "Wszystkie zapytania są praktycznie takie same, nie ma czego różnicować",
            "Zespół nie chce albo nie potrafi określić, co czyni leada 'dobrym' — bez tego nie ma na czym oprzeć oceny"
          ],
          "ru": [
            "Заявок очень мало — команда и так обзванивает всех в тот же день",
            "Все заявки практически одинаковые, различать нечего",
            "Команда не хочет или не может определить, что делает лида 'хорошим' — без этого оценке не на чем строиться"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Czym aiqualify różni się od aiauto?",
          "ru": "Чем aiqualify отличается от aiauto?"
        },
        "answers": {
          "pl": [
            "aiauto sprawia, że zapytanie w ogóle trafia w odpowiednie miejsce; aiqualify ocenia już zebrane zapytania i ustala, które są najcenniejsze",
            "aiqualify wysyła wiadomości do klientów, aiauto tylko je zbiera",
            "To dokładnie to samo"
          ],
          "ru": [
            "aiauto делает так, чтобы заявка вообще попала в нужное место; aiqualify оценивает уже собранные заявки и определяет, какие самые ценные",
            "aiqualify отправляет сообщения клиентам, а aiauto только собирает их",
            "Это одно и то же"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Co jest niezbędne, żeby aiqualify w ogóle miało sens?",
          "ru": "Что необходимо, чтобы aiqualify вообще имело смысл?"
        },
        "answers": {
          "pl": [
            "Jasne, uzgodnione z zespołem sprzedaży kryteria tego, co czyni leada wartościowym",
            "Duży budżet reklamowy klienta",
            "Brak jakiegokolwiek CRM"
          ],
          "ru": [
            "Чёткие, согласованные с отделом продаж критерии того, что делает лида ценным",
            "Большой рекламный бюджет клиента",
            "Отсутствие какого-либо CRM"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'Super, czyli AI samo zdecyduje, komu mamy sprzedawać, a komu nie?' Co odpowiadasz?",
          "ru": "Клиент говорит: 'Отлично, значит ИИ сам решит, кому нам продавать, а кому нет?' Что отвечаешь?"
        },
        "answers": {
          "pl": [
            "Tak, AI podejmuje decyzję zamiast zespołu",
            "Tłumaczysz, że AI tylko sugeruje priorytet na podstawie uzgodnionych kryteriów, a decyzję i tak podejmuje handlowiec",
            "Mówisz, że to nieprawda i usługa nie ma nic wspólnego z priorytetami"
          ],
          "ru": [
            "Да, ИИ принимает решение вместо команды",
            "Объясняешь, что ИИ только подсказывает приоритет на основе согласованных критериев, а решение всё равно принимает продавец",
            "Говоришь, что это неправда и услуга не имеет отношения к приоритетам"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient musi rozumieć, że to narzędzie wspierające decyzję człowieka, a nie system, który sam odrzuca klientów — inaczej pojawi się obawa o utratę kontroli.",
          "ru": "Клиент должен понимать, что это инструмент поддержки решения человека, а не система, самостоятельно отсеивающая клиентов — иначе появится страх потери контроля."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'A jeśli wasz system źle oceni leada i przez to stracimy dobrego klienta, bo trafi na koniec listy?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'А если ваша система неправильно оценит лида, и мы потеряем хорошего клиента, потому что он окажется в конце списка?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź powinna wyjaśnić, że ocena to tylko kolejność, a nie eliminacja — żaden lead nie znika ani nie jest ukrywany, wszystkie pozostają widoczne dla zespołu; kryteria kalibruje się razem z klientem na przykładowych realnych leadach i można je poprawiać; uczciwie przyznać, że żaden model oceny nie jest w stu procentach idealny, tylko zwiększa szansę na lepsze wykorzystanie czasu.",
          "ru": "Хороший ответ должен объяснить, что оценка — это только порядок, а не исключение: ни один лид не удаляется и не скрывается, все остаются видны команде; критерии калибруются вместе с клиентом на реальных примерах и могут корректироваться; честно признать, что ни одна модель оценки не идеальна на сто процентов, она лишь повышает шансы лучше распорядиться временем."
        }
      }
    ],
    "objections": [
      {
        "say": "A kto ustala te kryteria? Nie chcę, żeby jakiś algorytm decydował za nas, kto jest dobrym klientem.",
        "ru": "Страх, что 'чужой' алгоритм навяжет свои критерии, непонятные бизнесу.",
        "response": "Kryteria ustalamy razem z Wami, na start pytamy Waszych najlepszych handlowców, co odróżnia dobrego leada od słabego, i na tym budujemy model. To Wasza wiedza, tylko ubrana w system.",
        "responseRu": "Подчёркиваем, что критерии не придумывает алгоритм 'из воздуха', а формулирует сам клиент вместе с нами — это его экспертиза, просто оформленная в систему.",
        "why": {
          "pl": "Pokazujesz, że klient ma pełną kontrolę nad definicją 'dobrego leada', a nie oddaje ją czarnej skrzynce.",
          "ru": "Показываем, что клиент полностью контролирует определение «хорошего лида», а не отдаёт его чёрному ящику."
        }
      },
      {
        "say": "A co jeśli lead oznaczony jako słaby okaże się świetnym klientem? Stracimy go.",
        "ru": "Страх ложноотрицательного результата — хороший лид будет пропущен из-за неправильной метки.",
        "response": "Nikt nie znika z listy — oznaczenie to tylko kolejność, nie eliminacja. Słabszy lead nadal jest widoczny, tylko handlowiec dzwoni do niego trochę później, a nie wcale.",
        "responseRu": "Важное уточнение — скоринг не удаляет и не скрывает лида, а лишь меняет порядок звонков; ничего не теряется безвозвратно.",
        "why": {
          "pl": "Rozwiewasz konkretną obawę faktem, nie ogólnikiem — nic nie znika, zmienia się tylko kolejność.",
          "ru": "Снимаем конкретный страх фактом, а не общей фразой — ничего не пропадает, меняется только очередность."
        }
      },
      {
        "say": "Mamy tylko dwóch handlowców, po co nam ocena leadów, i tak wszystkich obdzwaniamy.",
        "ru": "Клиент считает услугу лишней при малой команде — с этим возражением можно и согласиться, если это правда.",
        "response": "Jeśli faktycznie obdzwaniacie wszystkich tego samego dnia, to na razie faktycznie nie jest to priorytet — to się przydaje, jak zapytań jest więcej niż da się obsłużyć od razu.",
        "responseRu": "Здесь честный ответ — если у клиента правда мало заявок и он всех обзванивает, не стоит навязывать услугу, лучше признать это и предложить другое решение или вернуться позже.",
        "why": {
          "pl": "Uczciwość buduje zaufanie na przyszłość — lepiej nie sprzedać czegoś niepotrzebnego, niż stracić wiarygodność.",
          "ru": "Честность строит доверие на будущее — лучше не продать лишнее, чем потерять репутацию."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, pytanie — jak Wasz zespół sprzedaży decyduje dzisiaj, do kogo zadzwonić najpierw, jak przychodzi kilkanaście zapytań naraz?",
      "ru": "Открывашка через диагностический вопрос — подходит для компаний с явно активным потоком лидов (не для микробизнеса с парой заявок в неделю)."
    },
    "crossSell": {
      "pl": "Dobrze uzupełnia się z Automatyzacją zapytań (aiauto), bo bez uporządkowanego napływu zgłoszeń w jednym miejscu nie ma na czym budować oceny — razem dają pełny proces: zbieranie i priorytetyzacja.",
      "ru": "Хорошо дополняется автоматизацией заявок (aiauto) — без упорядоченного потока заявок в одном месте не на чем строить оценку; вместе они дают полный процесс: сбор и приоритизация."
    }
  },
  "aifollowup": {
    "title": {
      "pl": "AI follow-up",
      "ru": "AI follow-up (дожим лидов)"
    },
    "badge": {
      "pl": "odzyskuje ciche leady",
      "ru": "возвращает молчащих лидов"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "To automatyczna seria wiadomości do leadów, którzy zapytali, ale przestali odpisywać — przypomnienia rozłożone w czasie na kilka dni czy tygodni, w różnych kanałach (mail, SMS, WhatsApp), z jasną zasadą, kiedy się zatrzymać i przekazać sprawę żywej osobie, jeśli lead się odezwie. Chodzi o odzyskanie transakcji, które inaczej po cichu by przepadły.",
          "ru": "Это автоматическая серия сообщений для лидов, которые задали вопрос, но перестали отвечать — напоминания, растянутые во времени на несколько дней или недель, в разных каналах (почта, SMS, WhatsApp), с чёткими правилами, когда остановиться и передать дело живому человеку, если лид ответит. Цель — вернуть сделки, которые иначе тихо потерялись бы."
        },
        "bullets": {
          "pl": [
            "Lead, który zapytał i przestał odpisywać, dostaje serię przypomnień w odstępach czasu",
            "Wiadomości są zaplanowane wcześniej — treść, kolejność i kanały ustalacie razem z nami",
            "Jak tylko lead odpowie, sekwencja się zatrzymuje i sprawa trafia do żywej osoby"
          ],
          "ru": [
            "Лид, который спросил и перестал отвечать, получает серию напоминаний с интервалами",
            "Сообщения планируются заранее — содержание, порядок и каналы согласовываются вместе с нами",
            "Как только лид отвечает, последовательность останавливается, и дело переходит к живому человеку"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Usługom z dłuższym procesem decyzyjnym, gdzie klient nie kupuje od razu, tylko musi to przemyśleć — nieruchomości, edukacja, usługi B2B, gdzie handlowiec wysyła ofertę i potem zapomina do niej wrócić, a klient po prostu milknie.",
          "ru": "Услугам с более длинным циклом принятия решения, где клиент не покупает сразу, а должен подумать — недвижимость, образование, B2B-услуги, где продавец отправляет предложение, а потом забывает к нему вернуться, а клиент просто замолкает."
        },
        "bullets": {
          "pl": [
            "Usługi, gdzie klient nie decyduje się od razu, tylko 'musi to przemyśleć'",
            "Firmy, gdzie handlowiec wysyła ofertę i potem zapomina wrócić do tematu",
            "Branże z dłuższym cyklem sprzedaży: nieruchomości, edukacja, usługi B2B"
          ],
          "ru": [
            "Услуги, где клиент не решается сразу, а 'должен подумать'",
            "Компании, где продавец отправляет предложение, а потом забывает к нему вернуться",
            "Отрасли с более длинным циклом продаж: недвижимость, образование, B2B-услуги"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: lead, który przestaje odpisywać po pierwszym kontakcie, jest traktowany jako 'martwy', chociaż wielu kupujących potrzebuje po prostu przypomnienia we właściwym momencie. Rozpoznajesz to, pytając, co się dzieje, gdy klient nie odpowie na ofertę — czy jest jakikolwiek system, czy sprawa po prostu przepada.",
          "ru": "Проблема: лид, переставший отвечать после первого контакта, считается 'мёртвым', хотя многим покупателям нужно просто напоминание в нужный момент. Распознать это можно, спросив, что происходит, когда клиент не отвечает на предложение — есть ли какая-то система, или дело просто пропадает."
        },
        "bullets": {
          "pl": [
            "Klient mówi: 'wysłaliśmy ofertę i cisza, no i tyle'",
            "Handlowcy nie mają czasu ręcznie wracać do każdego, kto nie odpisał",
            "Duża część 'martwych' leadów to tak naprawdę leady, do których po prostu nikt nie wrócił"
          ],
          "ru": [
            "Клиент говорит: 'отправили предложение и тишина, и всё'",
            "У продавцов нет времени вручную возвращаться к каждому, кто не ответил",
            "Значительная часть 'мёртвых' лидов — это на самом деле лиды, к которым просто никто не вернулся"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od pytania o los ofert bez odpowiedzi, potem pokaż mechanizm sekwencji z jasnym stopem, na końcu rozwiej obawę o spam.",
          "ru": "Начни с вопроса о судьбе предложений без ответа, затем покажи механизм последовательности с чёткой остановкой, в конце сними страх спама."
        },
        "bullets": {
          "pl": [
            "Co się dzieje, jak wyślecie komuś ofertę, a on nie odpisze? Ktoś do niego wraca, czy zostaje tak jak jest?",
            "Możemy ustawić automatyczne przypomnienia, które idą do takiego klienta w odstępach — jak on wciąż milczy po dwóch, trzech wiadomościach, temat się zamyka, ale jak odpowie, od razu trafia do Waszego handlowca.",
            "To nie jest spamowanie — wiadomości są rozłożone w czasie i przestają się wysyłać, jak tylko klient da znak życia albo powie 'nie, dziękuję'."
          ],
          "ru": [
            "Диагностический вопрос — вскрывает 'молчаливую смерть' сделки после отправки предложения без ответа.",
            "Питч — объясняем механику: серия напоминаний с чёткой остановкой (после нескольких сообщений) и мгновенной передачей человеку при первом ответе клиента.",
            "Снимаем страх 'это будет спам' — подчёркиваем контролируемость: сообщения ограничены по количеству и останавливаются при любом сигнале от клиента (ответ или отказ)."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj tego przy sprzedaży impulsowej, gdzie decyzja zapada od razu albo wcale — nie ma czego 'podgrzewać'. Nie stosuj też, gdy klient wyraźnie odmówił — to zamknięty temat, nie kandydat do follow-upu. I nigdy nie obiecuj, że follow-up gwarantuje powrót leada — zwiększa szansę, nie wymusza sprzedaży.",
          "ru": "Не предлагай это при импульсных продажах, где решение принимается сразу или никогда — 'подогревать' нечего. Также не применяй, если клиент явно отказался — это закрытая тема, а не кандидат на follow-up. И никогда не обещай, что follow-up гарантирует возвращение лида — это повышает шансы, а не принуждает к покупке."
        },
        "bullets": {
          "pl": [
            "Sprzedaż jest impulsowa, decyzja zapada od razu albo wcale — nie ma czego 'podgrzewać'",
            "Klient wyraźnie odmówił — to nie jest przypadek do follow-upu, tylko zamknięty temat",
            "Branże bardzo wrażliwe, gdzie powtarzalne wiadomości mogą być odebrane jako nachalne"
          ],
          "ru": [
            "Продажа импульсная, решение принимается сразу или никогда — «подогревать» нечего",
            "Клиент явно отказался — это не случай для follow-up, а закрытая тема",
            "Очень чувствительные отрасли, где повторяющиеся сообщения могут восприниматься как навязчивые"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Czym aifollowup różni się od automsg?",
          "ru": "Чем aifollowup отличается от automsg?"
        },
        "answers": {
          "pl": [
            "aifollowup to wiadomości mające przekonać leada, który nie odpowiedział, żeby wrócił do rozmowy; automsg to wiadomości operacyjne jak potwierdzenia czy przypomnienia o wizycie",
            "To dokładnie ta sama usługa",
            "automsg dotyczy tylko leadów, które nie odpowiedziały"
          ],
          "ru": [
            "aifollowup — это сообщения, призванные убедить не ответившего лида вернуться к разговору; automsg — это операционные сообщения вроде подтверждений или напоминаний о визите",
            "Это одна и та же услуга",
            "automsg касается только лидов, которые не ответили"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Kiedy sekwencja follow-up powinna się zatrzymać?",
          "ru": "Когда последовательность follow-up должна остановиться?"
        },
        "answers": {
          "pl": [
            "Gdy klient odpowie w dowolny sposób albo wyraźnie odmówi",
            "Dopiero po roku, niezależnie od reakcji klienta",
            "Nigdy, wiadomości idą bezterminowo"
          ],
          "ru": [
            "Когда клиент ответит любым образом или явно откажется",
            "Только через год, независимо от реакции клиента",
            "Никогда, сообщения идут бессрочно"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'A jeśli klient trzy razy dostanie wiadomość i się wkurzy, że go spamujemy?' Co odpowiadasz?",
          "ru": "Клиент говорит: 'А если клиент получит три сообщения и разозлится, что мы его спамим?' Что отвечаешь?"
        },
        "answers": {
          "pl": [
            "Zapewniasz, że to niemożliwe, bo AI wie najlepiej",
            "Tłumaczysz, że liczbę wiadomości i odstępy między nimi ustala się razem z klientem, sekwencja ma jasny koniec, a każda odpowiedź — nawet odmowa — ją zatrzymuje",
            "Proponujesz wysyłanie wiadomości codziennie, żeby szybciej dostać odpowiedź"
          ],
          "ru": [
            "Заверяешь, что это невозможно, потому что ИИ знает лучше",
            "Объясняешь, что количество сообщений и интервалы между ними согласовываются вместе с клиентом, у последовательности есть чёткий конец, и любой ответ — даже отказ — её останавливает",
            "Предлагаешь отправлять сообщения каждый день, чтобы быстрее получить ответ"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Kontrola nad liczbą i częstotliwością wiadomości to główny argument przeciwko obawie o spam — trzeba to pokazać konkretnie, a nie tylko zapewniać.",
          "ru": "Контроль над количеством и частотой сообщений — главный аргумент против опасения спама, это нужно показать конкретно, а не просто заверять."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Wolę, żeby handlowiec sam dzwonił i pamiętał, komu ma wrócić, niż jakieś automatyczne wiadomości.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Я предпочитаю, чтобы продавец сам звонил и помнил, кому нужно вернуться, а не какие-то автоматические сообщения.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź powinna docenić wartość osobistego kontaktu, ale wskazać, że ręczny follow-up zależy od tego, czy handlowiec pamięta o każdym leadzie, co realnie zawodzi przy większej skali; follow-up przedstawić jako siatkę bezpieczeństwa, która łapie to, o czym zapracowany handlowiec by zapomniał, a nie zastępstwo jego telefonów, i podkreślić, że handlowiec i tak dostaje info, gdy lead odpowie.",
          "ru": "Хороший ответ должен признать ценность личного контакта, но указать, что ручной follow-up зависит от того, помнит ли продавец о каждом лиде, что реально даёт сбой при росте масштаба; follow-up описать как страховочную сеть, которая ловит то, о чём забыл бы занятой продавец, а не замену его звонков, и подчеркнуть, что продавец всё равно узнаёт, когда лид отвечает."
        }
      }
    ],
    "objections": [
      {
        "say": "Nie chcę, żeby klienci czuli, że dostają wiadomości od robota.",
        "ru": "Страх, что автоматические сообщения будут звучать безлично и оттолкнут клиента.",
        "response": "Treści piszemy razem z Wami, tak jak normalnie napisałby handlowiec — bez 'Drogi Kliencie' i sztywnych formułek. Klient dostaje wiadomość, a nie widzi w niej żadnego 'to jest automat'.",
        "responseRu": "Подчёркиваем, что тексты пишутся вместе с клиентом в его тоне голоса, а не генерируются шаблонно — сообщение выглядит как обычное человеческое сообщение.",
        "why": {
          "pl": "Odpowiadasz na obawę o ton, a nie o samą automatyzację — to konkretniejsze i łatwiej to obiecać uczciwie.",
          "ru": "Отвечаем именно на страх тона сообщения, а не на автоматизацию как таковую — это конкретнее и честнее."
        }
      },
      {
        "say": "A jeśli klient już kupił gdzie indziej, zanim dostanie trzecią wiadomość?",
        "ru": "Клиент переживает, что автоматика будет 'приставать' к тому, кто уже неактуален.",
        "response": "Dlatego sekwencja ma jasny koniec i można ją w każdej chwili wyłączyć ręcznie dla konkretnej osoby, jak wiecie, że sprawa się zamknęła gdzie indziej.",
        "responseRu": "Объясняем, что процесс управляем — можно вручную остановить рассылку для конкретного лида в любой момент, если он уже неактуален.",
        "why": {
          "pl": "Pokazujesz, że automatyzacja nie działa w oderwaniu od rzeczywistości, tylko można ją kontrolować ręcznie w wyjątkach.",
          "ru": "Показываем, что автоматизация не оторвана от реальности — её можно вручную скорректировать в исключениях."
        }
      },
      {
        "say": "Ile to w ogóle wiadomości i przez jak długo to leci? Nie chcę, żeby to ciągnęło się miesiącami.",
        "ru": "Клиент хочет чётких границ по времени и количеству сообщений — боится 'бесконечной' рассылки.",
        "response": "Zwykle to dwa, trzy przypomnienia rozłożone na kilka tygodni, potem sekwencja się kończy sama. Dokładny harmonogram ustalamy razem, pod Wasz proces sprzedaży.",
        "responseRu": "Даём конкретные, разумные рамки (2-3 сообщения, несколько недель) — это снимает страх неопределённости и показывает, что процесс контролируем и настраивается под клиента.",
        "why": {
          "pl": "Konkretna liczba i czas są bardziej uspokajające niż ogólne 'to się samo ureguluje'.",
          "ru": "Конкретные цифры успокаивают лучше, чем общие обещания."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, pytanie — jak wygląda u Was sytuacja, kiedy wyślecie komuś wycenę czy ofertę, a on nie odpowie? Ktoś do tego wraca?",
      "ru": "Открывашка через диагностический вопрос о судьбе 'молчащих' сделок — хорошо работает для B2B и услуг с более длинным циклом принятия решения."
    },
    "crossSell": {
      "pl": "Naturalnie łączy się z CRM automations (crmauto) — sekwencja follow-up najlepiej działa, gdy uruchamia się sama na podstawie statusu w CRM, więc warto to od razu spiąć razem.",
      "ru": "Естественно сочетается с CRM automations (crmauto) — последовательность follow-up лучше всего работает, когда запускается автоматически по статусу в CRM, поэтому имеет смысл настраивать это вместе."
    }
  },
  "crmauto": {
    "title": {
      "pl": "CRM automations",
      "ru": "Автоматизация CRM"
    },
    "badge": {
      "pl": "CRM, który się pilnuje",
      "ru": "CRM следит сам за собой"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Konfigurujemy CRM klienta tak, żeby dużo z tego, co handlowiec musiałby pamiętać zrobić ręcznie, działo się samo: przesunięcie sprawy do kolejnego etapu tworzy zadanie, lead bez kontaktu przez kilka dni wywołuje przypomnienie, statusy zmieniają się na podstawie jasnych zdarzeń, a nie tego, czy ktoś pamiętał kliknąć. Efekt: CRM odzwierciedla rzeczywistość bez ciągłego pilnowania.",
          "ru": "Мы настраиваем CRM клиента так, чтобы многое из того, что продавцу пришлось бы вручную запоминать, происходило само: перемещение сделки на следующий этап создаёт задачу, лид без контакта в течение нескольких дней вызывает напоминание, статусы меняются по чётким событиям, а не по тому, вспомнил ли кто-то кликнуть. Итог: CRM отражает реальность без постоянного надзора."
        },
        "bullets": {
          "pl": [
            "Pipeline i statusy są dopasowane do tego, jak faktycznie sprzedajecie, a nie do domyślnego szablonu",
            "System sam tworzy zadania i przypomnienia, np. 'zadzwoń, bo lead czeka 3 dni bez kontaktu'",
            "Dane w CRM są aktualne, bo duża część aktualizacji dzieje się automatycznie, a nie ręcznie"
          ],
          "ru": [
            "Воронка и статусы соответствуют тому, как вы реально продаёте, а не стандартному шаблону",
            "Система сама создаёт задачи и напоминания, например 'позвони, лид без контакта уже 3 дня'",
            "Данные в CRM актуальны, потому что большая часть обновлений происходит автоматически, а не вручную"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Zespołom sprzedaży i firmom usługowym, które mają CRM, ale jest w połowie pusty albo nieaktualny, bo handlowcy pomijają ręczne uzupełnianie, albo firmom wdrażającym CRM od zera, które chcą, żeby pasował do ich realnego procesu, a nie do domyślnego szablonu.",
          "ru": "Отделам продаж и сервисным компаниям, у которых уже есть CRM, но он наполовину пуст или устарел, потому что продавцы пропускают ручное заполнение, либо компаниям, только внедряющим CRM с нуля и желающим, чтобы он соответствовал их реальному процессу, а не стандартному шаблону."
        },
        "bullets": {
          "pl": [
            "Firmy, które mają CRM, ale dane w nim są nieaktualne albo niepełne",
            "Zespoły sprzedaży, gdzie każdy prowadzi swoje notatki 'po swojemu', poza systemem",
            "Firmy wdrażające CRM od zera, które chcą, żeby pasował do ich procesu, a nie odwrotnie"
          ],
          "ru": [
            "Компании, у которых есть CRM, но данные в нём неактуальны или неполны",
            "Отделы продаж, где каждый ведёт заметки 'по-своему', вне системы",
            "Компании, внедряющие CRM с нуля, которые хотят, чтобы он подходил под их процесс, а не наоборот"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: CRM istnieje na papierze, ale nikt mu nie ufa i nikt z niego nie korzysta, bo utrzymanie go aktualnym to żmudna, ręczna praca, która ginie pod presją czasu — więc szef nie widzi prawdziwego obrazu sprzedaży. Rozpoznajesz to, pytając, czy dane w CRM są aktualne, czy trzeba dopytywać handlowców ustnie, na jakim etapie jest dana sprawa.",
          "ru": "Проблема: CRM существует формально, но никто ему не доверяет и не пользуется, потому что поддержание актуальности — это утомительная ручная работа, которая теряется под давлением времени, поэтому руководитель не видит реальной картины продаж. Распознать это можно, спросив, актуальны ли данные в CRM или приходится устно расспрашивать продавцов, на каком этапе находится сделка."
        },
        "bullets": {
          "pl": [
            "Klient mówi: 'mamy CRM, ale nikt go nie uzupełnia'",
            "Szef musi pytać handlowców ustnie, na jakim etapie jest dana sprawa",
            "Leady wiszą w systemie tygodniami bez żadnej aktualizacji statusu"
          ],
          "ru": [
            "Клиент говорит: 'у нас есть CRM, но его никто не заполняет'",
            "Руководитель вынужден устно спрашивать продавцов, на каком этапе находится сделка",
            "Лиды неделями висят в системе без обновления статуса"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od pytania, czy CRM w ogóle jest realnie używany, potem uderz w najczęstsze zdanie klientów o CRM, na końcu odwróć perspektywę: system ma pilnować ludzi, nie odwrotnie.",
          "ru": "Начни с вопроса, реально ли используется CRM, затем попади в самую частую фразу клиентов о CRM, в конце переверни перспективу: система должна следить за людьми, а не наоборот."
        },
        "bullets": {
          "pl": [
            "Macie już jakiś CRM, czy dane sprzedażowe siedzą bardziej w głowach handlowców i w Excelu?",
            "Jeśli macie CRM, ale nikt go porządnie nie uzupełnia — możemy to tak poustawiać, że duża część rzeczy dzieje się sama: zadania, przypomnienia, zmiana statusu.",
            "Nie chodzi o to, żeby dokładać handlowcom pracy klikania w system, tylko odwrotnie — system ma pilnować ich, a nie oni jego."
          ],
          "ru": [
            "Диагностический вопрос — узнаём, есть ли уже CRM и насколько реально ей пользуются (или всё «в головах и в Excel»).",
            "Питч под самое частое возражение «CRM есть, но им никто не пользуется» — объясняем, что автоматизация именно это и лечит, снимая рутину с продавца.",
            "Ключевая формулировка, переворачивающая восприятие: не человек обслуживает систему, а система следит за человеком — это снимает страх «больше бюрократии»."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj, gdy firma nie ma realnego procesu sprzedaży wartego strukturyzowania (kilka transakcji miesięcznie ogarniętych na kartce), gdy zespół w ogóle nie chce korzystać z żadnego systemu niezależnie od automatyzacji (to problem dyscypliny, nie narzędzia), albo gdy klient jest zadowolony z bardzo prostego rozwiązania i nie chce większego systemu.",
          "ru": "Не предлагай, если у компании нет реального процесса продаж, который стоило бы структурировать (несколько сделок в месяц, отслеживаемых на бумаге), если команда вообще не хочет пользоваться никакой системой независимо от автоматизации (это проблема дисциплины, а не инструмента), или если клиента устраивает очень простое решение и он не хочет более крупной системы."
        },
        "bullets": {
          "pl": [
            "Bardzo mała firma bez realnego procesu sprzedaży — parę transakcji miesięcznie ogarniętych na kartce",
            "Zespół w ogóle nie chce korzystać z żadnego systemu, niezależnie od automatyzacji — to problem dyscypliny, nie narzędzia",
            "Klient jest zadowolony z bardzo prostego rozwiązania i nie chce większego systemu"
          ],
          "ru": [
            "Очень маленькая компания без реального процесса продаж — пара сделок в месяц на бумаге",
            "Команда вообще не хочет пользоваться никакой системой, независимо от автоматизации — это проблема дисциплины, а не инструмента",
            "Клиента устраивает очень простое решение, и он не хочет более крупной системы"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Czym crmauto różni się od aiauto?",
          "ru": "Чем crmauto отличается от aiauto?"
        },
        "answers": {
          "pl": [
            "crmauto dotyczy tego, co dzieje się już wewnątrz CRM — statusy, zadania, przypomnienia; aiauto dotyczy tego, jak zapytanie w ogóle trafia do CRM",
            "To dokładnie ta sama usługa",
            "aiauto działa tylko wewnątrz CRM, a crmauto na zewnątrz"
          ],
          "ru": [
            "crmauto касается того, что происходит уже внутри CRM — статусы, задачи, напоминания; aiauto касается того, как заявка вообще попадает в CRM",
            "Это одна и та же услуга",
            "aiauto работает только внутри CRM, а crmauto снаружи"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mamy CRM, ale nikt go nie uzupełnia.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'У нас есть CRM, но его никто не заполняет.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Że to dokładnie sytuacja, w której crmauto ma sens — CRM istnieje, ale nie jest samopodtrzymujący się",
            "Że klient w ogóle nie potrzebuje CRM",
            "Że trzeba mu zaproponować zupełnie inny CRM, sam produkt to naprawi"
          ],
          "ru": [
            "Что это как раз та ситуация, где crmauto имеет смысл — CRM существует, но не поддерживает себя сам",
            "Что клиенту вообще не нужен CRM",
            "Что нужно предложить совершенно другой CRM, сам продукт это исправит"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'Próbowaliśmy już wdrożyć CRM rok temu, zespół i tak go nie używał, więc chyba nie warto próbować znowu.' Co robisz?",
          "ru": "Клиент говорит: 'Мы уже пробовали внедрить CRM год назад, команда всё равно им не пользовалась, так что, наверное, не стоит пробовать снова.' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Naciskasz, że tym razem na pewno zadziała, bo macie lepszy CRM",
            "Pytasz, dlaczego zespół go nie używał — czy dlatego, że wymagał ręcznego klikania i uzupełniania — bo jeśli tak, to właśnie to automatyzujemy, a nie próbujemy tego samego jeszcze raz",
            "Rezygnujesz od razu, bo klient już miał złe doświadczenie"
          ],
          "ru": [
            "Настаиваешь, что на этот раз точно сработает, потому что у вас CRM лучше",
            "Спрашиваешь, почему команда им не пользовалась — не потому ли, что требовалось ручное заполнение и клики — потому что если так, то именно это мы автоматизируем, а не повторяем то же самое снова",
            "Сразу отказываешься от предложения, потому что у клиента уже был плохой опыт"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Trzeba zdiagnozować przyczynę poprzedniej porażki — jeśli to był problem ręcznej pracy, automatyzacja realnie to rozwiązuje, więc warto to pokazać, zamiast po prostu odpuszczać albo ślepo naciskać.",
          "ru": "Нужно диагностировать причину прошлой неудачи — если это была проблема ручного труда, автоматизация реально её решает, и это стоит показать, вместо того чтобы просто сдаться или слепо настаивать."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Nasz zespół nienawidzi wpisywać dane do systemów, będą to sabotować niezależnie od automatyzacji.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Наша команда ненавидит вносить данные в системы, они будут саботировать это независимо от автоматизации.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź powinna uznać, że to realne ryzyko, rozróżnić 'system wymagający ciągłego ręcznego wpisywania' (co budzi opór) od 'systemu, który aktualizuje się sam na podstawie działań, które ludzie i tak wykonują' (dużo mniejszy opór), zaproponować start od automatyzacji, które usuwają najwięcej klikania, i uczciwie przyznać, że automatyzacja redukuje, ale nie usuwa w 100% ręcznej pracy, oraz że wciąż liczy się krótkie wdrożenie zespołu.",
          "ru": "Хороший ответ должен признать это реальным риском, разграничить 'систему, требующую постоянного ручного ввода' (вызывает сопротивление) и 'систему, обновляющуюся саму на основе действий, которые люди и так выполняют' (гораздо меньше сопротивления), предложить начать с автоматизаций, убирающих больше всего кликов, и честно признать, что автоматизация снижает, но не устраняет на 100% ручной труд, и что короткое обучение команды всё ещё важно."
        }
      }
    ],
    "objections": [
      {
        "say": "Próbowaliśmy CRM, zespół i tak nie chciał go uzupełniać, po co nam kolejne narzędzie.",
        "ru": "У клиента уже был неудачный опыт внедрения CRM, и он проецирует его на новое предложение.",
        "response": "To bardzo częsty scenariusz i zwykle wynika z tego, że CRM wymagał ręcznego klikania na każdym kroku. My właśnie to automatyzujemy — handlowiec robi swoją normalną robotę, a system sam aktualizuje status w tle.",
        "responseRu": "Показываем, что причина провала — ручной труд, а не сама идея CRM, и именно эту причину устраняет автоматизация.",
        "why": {
          "pl": "Diagnozujesz przyczynę porażki, zamiast ignorować doświadczenie klienta — to buduje wiarygodność.",
          "ru": "Диагностируем причину неудачи, а не игнорируем опыт клиента — это укрепляет доверие."
        }
      },
      {
        "say": "Boję się, że automatyczne statusy będą się zmieniać źle i pokażą nieprawdziwy obraz sprzedaży.",
        "ru": "Страх, что автоматика начнёт менять статусы неправильно и исказит реальную картину продаж.",
        "response": "Reguły automatyzacji ustawiamy razem z Wami na podstawie konkretnych zdarzeń, np. wysłania oferty czy braku kontaktu przez kilka dni — i testujemy to na Waszych realnych sprawach, zanim to ruszy na pełną skalę.",
        "responseRu": "Снимаем страх через прозрачность — правила видимы, понятны и тестируются на реальных примерах перед полным запуском.",
        "why": {
          "pl": "Testy na prawdziwych danych przed startem to konkret, który redukuje niepewność lepiej niż ogólne zapewnienia.",
          "ru": "Тесты на реальных данных перед запуском убеждают лучше общих заверений."
        }
      },
      {
        "say": "Zmiana CRM albo jego przebudowa to chyba miesiące pracy i chaos dla zespołu.",
        "ru": "Страх долгого и болезненного внедрения, который остановит работу команды.",
        "response": "Nie budujemy tego od zera przez pół roku — zaczynamy od procesu, który już macie, i dokładamy automatyzacje krok po kroku, więc zespół cały czas normalnie pracuje, a nie czeka na 'wielkie wdrożenie'.",
        "responseRu": "Снимаем страх «большого взрыва» при внедрении — процесс поэтапный, команда не останавливает работу на время внедрения.",
        "why": {
          "pl": "Pokazujesz wdrożenie krokowe zamiast ryzykownej rewolucji na raz.",
          "ru": "Показываем поэтапное внедрение вместо рискованной единовременной революции."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, pytanie — macie CRM, którym zespół faktycznie się posługuje na co dzień, czy bardziej wszystko siedzi w głowach i w Excelu?",
      "ru": "Открывашка через диагностический вопрос — сразу вскрывает самую частую боль (CRM есть, но не используется) и не звучит как питч."
    },
    "crossSell": {
      "pl": "Dobrze łączy się z Raportami AI (aireports) — gdy CRM ma aktualne, uporządkowane dane dzięki automatyzacji, można na ich podstawie generować sensowne, wiarygodne podsumowania zamiast raportów z niepełnych danych.",
      "ru": "Хорошо сочетается с AI-отчётами (aireports) — когда CRM благодаря автоматизации содержит актуальные, упорядоченные данные, на их основе можно строить осмысленные и достоверные отчёты, а не отчёты по неполным данным."
    }
  },
  "aireports": {
    "title": {
      "pl": "Raporty AI",
      "ru": "AI-отчёты"
    },
    "badge": {
      "pl": "jedno podsumowanie zamiast paneli",
      "ru": "одна сводка вместо панелей"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Zamiast logować się do kilku osobnych paneli (reklama, CRM, statystyki strony), żeby sprawdzić, jak idzie biznes, ten system zbiera uzgodnione źródła danych w jedno miejsce i automatycznie, według harmonogramu, pisze krótkie podsumowanie prostym językiem — np. 'w tym tygodniu: X nowych leadów, Y z reklamy, sprzedaż w górę czy w dół względem poprzedniego tygodnia'. Właściciel czyta jedną wiadomość zamiast przeszukiwać panele.",
          "ru": "Вместо того чтобы заходить в несколько отдельных панелей (реклама, CRM, статистика сайта), чтобы проверить, как идут дела в бизнесе, эта система собирает согласованные источники данных в одном месте и автоматически, по расписанию, пишет короткую сводку простым языком — например, 'на этой неделе: X новых лидов, Y из рекламы, продажи выросли или упали относительно прошлой недели'. Владелец читает одно сообщение вместо того, чтобы искать по панелям."
        },
        "bullets": {
          "pl": [
            "Dane z ustalonych źródeł (CRM, reklama, strona) są zbierane automatycznie w jednym miejscu",
            "Raport jest pisany prostym językiem, nie w postaci tabelek i wykresów do samodzielnej interpretacji",
            "Przychodzi cyklicznie, np. co tydzień, bez pytania o niego"
          ],
          "ru": [
            "Данные из согласованных источников (CRM, реклама, сайт) автоматически собираются в одном месте",
            "Отчёт написан простым языком, а не в виде таблиц и графиков, которые нужно самостоятельно интерпретировать",
            "Приходит регулярно, например раз в неделю, без необходимости его запрашивать"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Właścicielom i menedżerom firm, którzy nie mają czasu ani ochoty siedzieć w kilku panelach analitycznych i wolą szybkie 'jak nam idzie' zamiast surowych liczb — typowo mniejsze firmy bez własnego analityka.",
          "ru": "Владельцам и менеджерам компаний, у которых нет времени или желания сидеть в нескольких аналитических панелях и которые предпочитают быстрое 'как у нас дела' вместо сырых цифр — как правило, небольшие компании без собственного аналитика."
        },
        "bullets": {
          "pl": [
            "Właściciele firm, którzy sami nie mają czasu siedzieć w panelach analitycznych",
            "Firmy korzystające z kilku narzędzi naraz (reklama, CRM, strona), gdzie dane są rozproszone",
            "Osoby, które wolą przeczytać jedno zdanie podsumowania niż analizować wykres"
          ],
          "ru": [
            "Владельцы компаний, у которых нет времени сидеть в аналитических панелях",
            "Компании, использующие сразу несколько инструментов (реклама, CRM, сайт), где данные разбросаны",
            "Люди, предпочитающие прочитать одно предложение сводки вместо анализа графика"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: dane istnieją w kilku narzędziach, ale nikt ich regularnie nie sprawdza, bo zebranie i zinterpretowanie ich wymaga wysiłku, więc decyzje zapadają 'na wyczucie' zamiast na podstawie liczb. Rozpoznajesz to, pytając, czy właściciel realnie zagląda do panelu reklamowego czy CRM na bieżąco, czy raczej te dane sobie leżą nieprzeczytane.",
          "ru": "Проблема: данные существуют в нескольких инструментах, но их никто регулярно не проверяет, потому что для сбора и интерпретации нужны усилия, поэтому решения принимаются 'на глазок', а не на основе цифр. Распознать это можно, спросив, реально ли владелец регулярно заглядывает в рекламную панель или CRM, или эти данные просто лежат непрочитанными."
        },
        "bullets": {
          "pl": [
            "Klient mówi: 'mamy dane w kilku miejscach, ale szczerze nikt tego nie ogarnia na bieżąco'",
            "Decyzje podejmowane są 'na wyczucie', bo sprawdzenie liczb zajmuje za dużo czasu",
            "Właściciel dowiaduje się o spadku sprzedaży z opóźnieniem, a nie na bieżąco"
          ],
          "ru": [
            "Клиент говорит: 'у нас данные в нескольких местах, но, если честно, никто их регулярно не смотрит'",
            "Решения принимаются 'на глазок', потому что проверка цифр занимает слишком много времени",
            "Владелец узнаёт о падении продаж с опозданием, а не в реальном времени"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od pytania o realny czas spędzany na sprawdzaniu statystyk, potem pokaż konkretną korzyść bez logowania się nigdzie, na końcu podkreśl prostotę formy.",
          "ru": "Начни с вопроса о реальном времени, потраченном на проверку статистики, затем покажи конкретную выгоду без необходимости куда-либо заходить, в конце подчеркни простоту формата."
        },
        "bullets": {
          "pl": [
            "Jak często realnie zagląda Pan czy Pani do statystyk — reklamy, CRM, strony — czy raczej nie ma na to czasu w tygodniu?",
            "Możemy to spiąć tak, że raz w tygodniu dostaje Pan czy Pani krótkie podsumowanie, napisane po ludzku — ile leadów, skąd, jak sprzedaż wygląda na tle poprzedniego tygodnia — bez logowania się do niczego.",
            "To nie jest kolejny panel do nauki, tylko wiadomość, którą się po prostu czyta, jak mejla."
          ],
          "ru": [
            "Диагностический вопрос — часто оказывается, что владелец физически не заходит в панели аналитики из-за нехватки времени.",
            "Питч — подчёркиваем ключевую выгоду: не нужно логиниться никуда, отчёт сам приходит в понятном виде.",
            "Снимаем страх «ещё одна система для изучения» — это не панель, а просто сообщение, которое читается как письмо."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj, gdy firma w ogóle nie zbiera jeszcze danych w żadnym systemie — najpierw trzeba to poukładać, np. przez apiint czy aiauto. Nie proponuj też klientowi, który sam świetnie zna się na danych i chce szczegółowych wykresów, a nie uproszczonego podsumowania, ani firmie tak małej, że raport tygodniowy powtarzałby tylko 'trzy nowe leady' bez realnej wartości.",
          "ru": "Не предлагай, если компания вообще ещё не собирает данные ни в одной системе — сначала нужно это наладить, например через apiint или aiauto. Также не предлагай клиенту, который сам отлично разбирается в данных и хочет подробных графиков, а не упрощённой сводки, или компании настолько маленькой, что еженедельный отчёт будет просто повторять 'три новых лида' без реальной ценности."
        },
        "bullets": {
          "pl": [
            "Firma w ogóle nie zbiera jeszcze danych w żadnym systemie — najpierw trzeba to poukładać",
            "Klient sam świetnie zna się na danych i chce szczegółowych wykresów, a nie uproszczonego podsumowania",
            "Bardzo mała skala działania, gdzie raport tygodniowy nie wniesie realnej informacji"
          ],
          "ru": [
            "Компания вообще ещё не собирает данные ни в одной системе — сначала нужно это наладить",
            "Клиент сам отлично разбирается в данных и хочет подробных графиков, а не упрощённой сводки",
            "Очень маленький масштаб деятельности, где еженедельный отчёт не даст реальной новой информации"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Czym aireports różni się od crmauto?",
          "ru": "Чем aireports отличается от crmauto?"
        },
        "answers": {
          "pl": [
            "aireports podsumowuje dane, które już są w systemach, w formie czytelnego raportu; crmauto dba o to, żeby dane w CRM były w ogóle aktualne i kompletne",
            "To ta sama usługa, tylko pod inną nazwą",
            "crmauto tworzy raporty, a aireports aktualizuje statusy"
          ],
          "ru": [
            "aireports обобщает данные, уже находящиеся в системах, в виде понятного отчёта; crmauto следит за тем, чтобы данные в CRM вообще были актуальными и полными",
            "Это одна и та же услуга под другим названием",
            "crmauto создаёт отчёты, а aireports обновляет статусы"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Dla kogo aireports jest najlepszym rozwiązaniem?",
          "ru": "Для кого aireports является лучшим решением?"
        },
        "answers": {
          "pl": [
            "Dla właściciela, który nie ma czasu regularnie sprawdzać kilku paneli i woli jedno proste podsumowanie",
            "Dla analityka, który chce surowych danych i szczegółowych wykresów do własnej analizy",
            "Dla firmy, która jeszcze nie zbiera żadnych danych"
          ],
          "ru": [
            "Для владельца, у которого нет времени регулярно проверять несколько панелей и который предпочитает одну простую сводку",
            "Для аналитика, которому нужны сырые данные и подробные графики для собственного анализа",
            "Для компании, которая ещё не собирает никаких данных"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'Ja i tak codziennie siedzę w panelu reklamowym i w CRM, znam się na liczbach, po co mi jeszcze jakieś podsumowanie?' Co robisz?",
          "ru": "Клиент говорит: 'Я и так каждый день сижу в рекламной панели и в CRM, разбираюсь в цифрах, зачем мне ещё какая-то сводка?' Что делаешь?"
        },
        "answers": {
          "pl": [
            "Mówisz, że to i tak najlepsza usługa dla każdego, bo oszczędza czas",
            "Przyznajesz, że przy takim zaangażowaniu raport może nie wnieść wiele nowego, i pytasz, czy jest ktoś inny w firmie, kto potrzebowałby prostego podsumowania, np. wspólnik czy inwestor",
            "Kończysz rozmowę"
          ],
          "ru": [
            "Говоришь, что это всё равно лучшая услуга для всех, потому что экономит время",
            "Признаёшь, что при таком уровне вовлечённости отчёт может не дать многого нового, и спрашиваешь, есть ли в компании кто-то ещё, кому нужна простая сводка, например партнёр или инвестор",
            "Завершаешь разговор"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Usługa nie pasuje do każdego — trzeba to szczerze przyznać i poszukać innego odbiorcy wewnątrz firmy albo zaproponować coś innego.",
          "ru": "Услуга подходит не всем — нужно честно это признать и поискать другого получателя внутри компании либо предложить что-то другое."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'A skąd mam wiedzieć, że te liczby w raporcie są w ogóle prawdziwe i nic nie pomija?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'А откуда мне знать, что цифры в отчёте вообще верные и ничего не упускают?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź powinna wyjaśnić, że raport odzwierciedla tylko te źródła danych, które zostały podłączone i uzgodnione — to jest przejrzyste; że szablon i zakres raportu jest sprawdzany z klientem przed uruchomieniem automatyzacji; i uczciwie przyznać, że raport jest tak dobry, jak dane, które go zasilają — jeśli jakieś źródło nie jest podłączone, nie pojawi się w raporcie, dlatego warto to połączyć z porządkiem w danych (crmauto, apiint).",
          "ru": "Хороший ответ должен объяснить, что отчёт отражает только те источники данных, которые были подключены и согласованы — это прозрачно; что шаблон и охват отчёта проверяются с клиентом до запуска автоматизации; и честно признать, что отчёт настолько хорош, насколько хороши питающие его данные — если какой-то источник не подключён, он не появится в отчёте, поэтому стоит сочетать это с порядком в данных (crmauto, apiint)."
        }
      }
    ],
    "objections": [
      {
        "say": "Mam już wykresy w panelu reklamowym, po co mi jeszcze jakiś raport.",
        "ru": "Клиент не видит разницы между 'сырыми' графиками в рекламном кабинете и текстовым отчётом.",
        "response": "Ten panel pokazuje reklamę, ale nie pokazuje np. ile z tego faktycznie stało się sprzedażą w CRM. Nasz raport łączy te źródła w jedno zdanie, którego nie da się złożyć z samego panelu reklamowego.",
        "responseRu": "Показываем, что рекламная панель — это только один источник, а отчёт объединяет несколько источников (реклама + CRM) в единую картину, которую нельзя получить из одной панели.",
        "why": {
          "pl": "Pokazujesz konkretną lukę informacyjną, której panel reklamowy sam nie wypełnia.",
          "ru": "Показываем конкретный информационный пробел, который рекламная панель сама не закрывает."
        }
      },
      {
        "say": "Nie chcę dostawać kolejnego maila, którego nie będę czytać.",
        "ru": "Страх, что отчёт станет ещё одним неоткрытым письмом в почте.",
        "response": "Dlatego to jest krótkie, kilka zdań, nie raport na trzy strony — dokładnie po to, żeby dało się to przeczytać w 30 sekund, stojąc przy kawie.",
        "responseRu": "Снимаем страх «ещё одного игнорируемого письма» через конкретику — отчёт короткий и читается за секунды, а не требует времени на изучение.",
        "why": {
          "pl": "Konkretna, mała obietnica (kilka zdań, 30 sekund) jest bardziej wiarygodna niż ogólne 'to będzie przydatne'.",
          "ru": "Конкретное скромное обещание убедительнее общих слов о пользе."
        }
      },
      {
        "say": "A jeśli coś się zmieni w moim biznesie, muszę znowu płacić za przebudowę raportu?",
        "ru": "Страх скрытых будущих затрат при любом изменении в бизнесе.",
        "response": "Podstawowy format ustalamy raz, na start, tak żeby pasował do tego, co realnie chcecie śledzić — drobne zmiany, jak dodanie nowego źródła, to nie jest budowanie od nowa.",
        "responseRu": "Снимаем страх скрытых расходов — базовый формат фиксируется один раз, небольшие изменения не требуют пересборки с нуля.",
        "why": {
          "pl": "Uspokajasz obawę o koszty w przyszłości konkretnym rozróżnieniem: mała zmiana to nie przebudowa.",
          "ru": "Успокаиваем страх будущих расходов, чётко разграничивая мелкие правки и полную пересборку."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, pytanie — ile czasu w tygodniu realnie poświęca Pan czy Pani na sprawdzanie, jak idzie sprzedaż i reklama w różnych panelach?",
      "ru": "Открывашка через вопрос про время — хорошо работает для владельцев, у которых сразу несколько источников данных (реклама, CRM, сайт)."
    },
    "crossSell": {
      "pl": "Naturalnie opiera się na CRM automations (crmauto) i Automatyzacji zapytań (aiauto) — im bardziej uporządkowane dane na wejściu, tym dokładniejszy i bardziej wiarygodny raport na wyjściu.",
      "ru": "Естественно опирается на CRM automations (crmauto) и автоматизацию заявок (aiauto) — чем упорядоченнее данные на входе, тем точнее и достовернее отчёт на выходе."
    }
  },
  "apiint": {
    "title": {
      "pl": "Integracje API",
      "ru": "API-интеграции"
    },
    "badge": {
      "pl": "systemy zaczynają się dogadywać",
      "ru": "системы начинают общаться"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Wiele firm ma już kilka osobnych narzędzi — stronę, CRM, płatności, magazyn czy ERP — które nie rozmawiają ze sobą automatycznie, więc ktoś ręcznie przepisuje te same informacje w kilka miejsc. Ta usługa buduje techniczne połączenie między systemami, które klient już ma, żeby dane przepływały między nimi same — zamówienie w sklepie pojawia się w magazynie, płatność aktualizuje CRM, bez przepisywania. To bardziej indywidualna, techniczna praca niż inne automatyzacje, bo u każdego klienta zestaw systemów jest inny, dlatego wycena też jest ustalana indywidualnie, a nie z góry.",
          "ru": "У многих компаний уже есть несколько отдельных инструментов — сайт, CRM, платежи, склад или ERP — которые не общаются друг с другом автоматически, поэтому кто-то вручную переносит одну и ту же информацию в несколько мест. Эта услуга строит техническую связь между системами, которые у клиента уже есть, чтобы данные передавались между ними сами — заказ в магазине появляется на складе, оплата обновляет CRM, без переписывания вручную. Это более индивидуальная, техническая работа, чем другие автоматизации, потому что у каждого клиента набор систем свой, поэтому и цена определяется индивидуально, а не заранее."
        },
        "bullets": {
          "pl": [
            "Łączymy systemy, które klient już ma — stronę, CRM, płatności, magazyn, ERP",
            "Dane przepływają między nimi automatycznie, bez ręcznego przepisywania",
            "Zakres i wycena zależą od konkretnych systemów i tego, jak są ze sobą powiązane"
          ],
          "ru": [
            "Соединяем системы, которые у клиента уже есть — сайт, CRM, платежи, склад, ERP",
            "Данные автоматически передаются между ними, без ручного переноса",
            "Объём работ и цена зависят от конкретных систем и того, как они связаны между собой"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmom z kilkoma osobnymi systemami, które logicznie powinny dzielić się danymi, ale tego nie robią, zwłaszcza tym, gdzie ręczne przepisywanie danych między programami zaczęło kosztować realny czas albo powoduje błędy — złe stany magazynowe, zdublowane wpisy, rozjazdy w liczbach.",
          "ru": "Компаниям с несколькими отдельными системами, которые логически должны обмениваться данными, но не делают этого — особенно тем, где ручной перенос данных между программами стал отнимать реальное время или вызывает ошибки: неверные остатки на складе, дублирующиеся записи, расхождения в цифрах."
        },
        "bullets": {
          "pl": [
            "Firmy z kilkoma osobnymi systemami: sklep, magazyn, księgowość, CRM, płatności",
            "Ktoś ręcznie przepisuje dane z jednego programu do drugiego codziennie",
            "Firmy, które chcą wdrożyć inne automatyzacje (raporty, CRM), ale ich systemy nie są ze sobą połączone"
          ],
          "ru": [
            "Компании с несколькими отдельными системами: магазин, склад, бухгалтерия, CRM, платежи",
            "Кто-то ежедневно вручную переносит данные из одной программы в другую",
            "Компании, желающие внедрить другие автоматизации (отчёты, CRM), но их системы не связаны между собой"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: ręczne przenoszenie danych między osobnymi systemami zabiera czas i nieuchronnie tworzy błędy — złe stany magazynowe, zdublowane rekordy klientów, liczby, które się nie zgadzają między systemami, które powinny się zgadzać. Rozpoznajesz to, pytając, czy systemy klienta 'wiedzą o sobie nawzajem', czy raczej ktoś jest ludzkim mostem między nimi.",
          "ru": "Проблема: ручной перенос данных между отдельными системами отнимает время и неизбежно создаёт ошибки — неверные остатки на складе, дублирующиеся записи клиентов, цифры, которые не сходятся между системами, которые должны совпадать. Распознать это можно, спросив, 'знают ли' системы клиента друг о друге, или кто-то является человеческим мостом между ними."
        },
        "bullets": {
          "pl": [
            "Klient mówi: 'mamy osobno sklep, osobno magazyn i osobno księgowość, i to się nie zgadza'",
            "Te same dane (np. zamówienie) są wpisywane ręcznie do kilku systemów",
            "Zdarzają się błędy wynikające z ręcznego przepisywania — złe stany magazynowe, podwójne wpisy"
          ],
          "ru": [
            "Клиент говорит: 'у нас отдельно магазин, отдельно склад и отдельно бухгалтерия, и это не сходится'",
            "Одни и те же данные (например, заказ) вручную вносятся в несколько систем",
            "Случаются ошибки из-за ручного переноса — неверные остатки на складе, дублирующиеся записи"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od pytania o liczbę systemów i ludzki 'most' między nimi, potem pokaż efekt na prostym przykładzie, na końcu od razu uczciwie powiedz, że cena jest indywidualna.",
          "ru": "Начни с вопроса о количестве систем и человеческом 'мосте' между ними, затем покажи эффект на простом примере, в конце сразу честно скажи, что цена индивидуальна."
        },
        "bullets": {
          "pl": [
            "Ile macie osobnych systemów, które teoretycznie powinny się ze sobą komunikować, a w praktyce ktoś ręcznie przenosi dane między nimi?",
            "Możemy je ze sobą połączyć tak, żeby dane, np. zamówienie czy płatność, same przechodziły z jednego systemu do drugiego, bez przepisywania.",
            "To zawsze wycena indywidualna, bo zależy dokładnie od tego, jakich systemów używacie i jak są ze sobą powiązane — na starcie po prostu to sprawdzamy."
          ],
          "ru": [
            "Диагностический вопрос — выявляем, сколько систем у клиента и есть ли «человек-мост» между ними, вручную переносящий данные.",
            "Питч — объясняем суть на примере (заказ, оплата) без технического жаргона, фокус на результате: данные сами переходят между системами.",
            "Честно и заранее проговариваем, что цена индивидуальная — это не уклонение, а факт: масштаб работы напрямую зависит от конкретных систем клиента, и это выясняется на старте."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj, gdy klient używa tylko jednego systemu albo narzędzi, które już mają gotową integrację 'z pudełka' — po co budować coś na zamówienie, jeśli istnieje darmowe, gotowe rozwiązanie. Nie obiecuj też sukcesu z góry, gdy systemy klienta są bardzo stare albo zamknięte — trzeba to sprawdzić technicznie, zanim się cokolwiek obieca, i nigdy nie podawaj konkretnej ceny ani terminu na samej rozmowie.",
          "ru": "Не предлагай, если клиент использует только одну систему или инструменты, у которых уже есть готовая интеграция 'из коробки' — зачем строить что-то на заказ, если есть бесплатное готовое решение. Также не обещай успех заранее, если системы клиента очень старые или закрытые — это нужно проверить технически, прежде чем что-либо обещать, и никогда не называй конкретную цену или срок прямо на звонке."
        },
        "bullets": {
          "pl": [
            "Klient używa tylko jednego systemu albo narzędzi, które już mają gotową integrację 'z pudełka'",
            "Systemy klienta są na tyle stare albo zamknięte, że techniczne połączenie może być niemożliwe — trzeba to sprawdzić, zanim się cokolwiek obieca",
            "Nie podajesz konkretnej ceny ani terminu na rozmowie — to zawsze wycena po analizie"
          ],
          "ru": [
            "Клиент использует только одну систему или инструменты, у которых уже есть готовая интеграция «из коробки»",
            "Системы клиента настолько старые или закрытые, что техническое соединение может быть невозможным — это нужно проверить, прежде чем что-либо обещать",
            "Не называй конкретную цену или срок на звонке — это всегда оценка после анализа"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego apiint nie ma stałej ceny w cenniku, w przeciwieństwie do np. aichatbot?",
          "ru": "Почему у apiint нет фиксированной цены в прайсе, в отличие, например, от aichatbot?"
        },
        "answers": {
          "pl": [
            "Bo zakres pracy zależy całkowicie od konkretnych systemów klienta i tego, jak są zbudowane — nie da się tego zrównać do jednego uniwersalnego pakietu",
            "Bo to najdroższa usługa w ofercie",
            "Bo klienci zawsze negocjują cenę tej usługi"
          ],
          "ru": [
            "Потому что объём работы полностью зависит от конкретных систем клиента и того, как они устроены — это невозможно свести к одному универсальному пакету",
            "Потому что это самая дорогая услуга в предложении",
            "Потому что клиенты всегда торгуются по цене этой услуги"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Kiedy warto zaproponować apiint zamiast np. crmauto?",
          "ru": "Когда стоит предложить apiint вместо, например, crmauto?"
        },
        "answers": {
          "pl": [
            "Gdy problem leży pomiędzy kilkoma osobnymi systemami klienta (np. sklep i magazyn), a nie wewnątrz jednego systemu jak CRM",
            "Gdy klient ma tylko jeden system i chce w nim lepszy pipeline",
            "Nigdy, to zawsze ta sama usługa co crmauto"
          ],
          "ru": [
            "Когда проблема находится между несколькими отдельными системами клиента (например, магазин и склад), а не внутри одной системы, как CRM",
            "Когда у клиента только одна система, и он хочет в ней лучшую воронку",
            "Никогда, это всегда та же услуга, что и crmauto"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'Super, to ile to będzie kosztować za połączenie naszego sklepu z magazynem?' Co odpowiadasz na rozmowie?",
          "ru": "Клиент говорит: 'Отлично, сколько будет стоить соединить наш магазин со складом?' Что отвечаешь на звонке?"
        },
        "answers": {
          "pl": [
            "Podajesz orientacyjną cenę z głowy, żeby nie stracić klienta",
            "Mówisz uczciwie, że to wycena indywidualna zależna od konkretnych systemów, i umawiasz krótką analizę, po której dostanie realną wycenę",
            "Mówisz, że cena jest taka sama jak za crmauto"
          ],
          "ru": [
            "Называешь примерную цену наугад, чтобы не потерять клиента",
            "Честно говоришь, что это индивидуальная оценка, зависящая от конкретных систем, и договариваешься о коротком анализе, после которого клиент получит реальную цену",
            "Говоришь, что цена такая же, как за crmauto"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Podanie ceny bez analizy systemów klienta to obietnica bez pokrycia — apiint zawsze wymaga sprawdzenia konkretnych narzędzi klienta przed wyceną.",
          "ru": "Назвать цену без анализа систем клиента — это обещание без обеспечения; apiint всегда требует проверки конкретных инструментов клиента перед оценкой."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'Nasz system magazynowy to coś napisanego przez kogoś 10 lat temu, chyba nikt już go nie rozumie.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'Наша складская система написана кем-то 10 лет назад, кажется, её уже никто не понимает.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź nie powinna obiecywać, że na pewno się uda, powinna uczciwie przyznać, że stare albo niestandardowe systemy bywają trudne albo czasem niemożliwe do połączenia, zaproponować krótkie techniczne sprawdzenie możliwości przed jakimkolwiek zobowiązaniem, i uczciwie zasygnalizować, że odpowiedź może brzmieć 'da się połączyć częściowo' albo 'nie da się', a nie gwarantować sukces z góry.",
          "ru": "Хороший ответ не должен обещать гарантированный успех, должен честно признать, что старые или нестандартные системы бывают сложными или иногда невозможными для соединения, предложить короткую техническую проверку возможностей перед любыми обязательствами, и честно обозначить, что ответом может быть «можно соединить частично» или «нельзя», а не гарантировать успех заранее."
        }
      }
    ],
    "objections": [
      {
        "say": "Brzmi bardzo skomplikowanie i drogo, może się nie opłaca.",
        "ru": "Клиент боится, что это дорого и сложно, ещё до того как узнал цену.",
        "response": "Zanim cokolwiek wycenimy, sprawdzamy, jakie dokładnie systemy macie i co da się połączyć — dopiero wtedy wiadomo, czy to prosta sprawa, czy większy projekt. Rozmowa o cenie nic nie kosztuje.",
        "responseRu": "Снимаем страх неизвестности — предлагаем бесплатный первый шаг (анализ систем), после которого станет ясен реальный масштаб и цена, а не гадать заранее.",
        "why": {
          "pl": "Obniżasz próg wejścia do rozmowy — nie prosisz o decyzję finansową, tylko o zgodę na darmowe sprawdzenie.",
          "ru": "Снижаем порог входа в разговор — просим не финансовое решение, а согласие на бесплатную проверку."
        }
      },
      {
        "say": "Boję się, że jak połączycie te systemy, to coś się popsuje w tym, co już działa.",
        "ru": "Страх, что интеграция сломает существующие, уже работающие процессы.",
        "response": "Nie ruszamy Waszych systemów w sposób, który mógłby zepsuć to, co już działa — najpierw testujemy połączenie na wybranym fragmencie danych, a dopiero potem uruchamiamy to na pełną skalę.",
        "responseRu": "Объясняем поэтапный подход с тестированием на ограниченном участке перед полным запуском — снижает риск поломки уже работающих процессов.",
        "why": {
          "pl": "Pokazujesz konkretny proces (test na fragmencie danych), a nie tylko zapewnienie 'będzie bezpiecznie'.",
          "ru": "Показываем конкретный процесс, а не просто заверение «будет безопасно»."
        }
      },
      {
        "say": "Mamy już kogoś od IT, on chyba by to sam ogarnął, tylko nie ma czasu.",
        "ru": "У клиента уже есть свой ИТ-специалист, но он перегружен — это скорее вопрос приоритетов, чем невозможности.",
        "response": "To bardzo częsty przypadek — wiedza jest, tylko brakuje czasu, żeby to zrobić porządnie obok bieżącej pracy. Możemy to zrobić równolegle, a Wasz IT może to potem tylko zweryfikować.",
        "responseRu": "Не соревнуемся с внутренним ИТ, а предлагаем разгрузить его — компания сохраняет контроль через проверку результата своим специалистом.",
        "why": {
          "pl": "Nie stawiasz się w konkurencji do wewnętrznego IT, tylko proponujesz odciążenie, co jest łatwiejsze do zaakceptowania.",
          "ru": "Не конкурируем с внутренним ИТ, а предлагаем разгрузку — это проще принять."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, pytanie — ile macie osobnych systemów w firmie, typu sklep, magazyn, CRM, księgowość, i czy one się ze sobą jakoś komunikują, czy raczej ktoś ręcznie przenosi dane między nimi?",
      "ru": "Открывашка через диагностику масштаба ручной работы между системами — подходит для компаний с явно несколькими инструментами (не для микробизнеса с одним CRM)."
    },
    "crossSell": {
      "pl": "Często jest fundamentem pod inne automatyzacje — Automatyzację zapytań (aiauto), CRM automations (crmauto) czy Raporty AI (aireports) trudno dobrze zrobić, jeśli systemy klienta w ogóle się ze sobą nie komunikują.",
      "ru": "Часто является фундаментом для других автоматизаций — автоматизацию заявок (aiauto), CRM automations (crmauto) или AI-отчёты (aireports) сложно сделать хорошо, если системы клиента вообще не взаимодействуют друг с другом."
    }
  },
  "automsg": {
    "title": {
      "pl": "Automatyczne wiadomości",
      "ru": "Автоматические сообщения"
    },
    "badge": {
      "pl": "mniej niezjawionych klientów",
      "ru": "меньше пропущенных визитов"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "To wiadomości powiązane z czymś, co już się wydarzyło — rezerwacją, zamówieniem, wizytą — wysyłane automatycznie w odpowiednim momencie, bez konieczności pamiętania o tym przez człowieka: potwierdzenie zaraz po rezerwacji, przypomnienie dzień przed wizytą, podziękowanie po zakupie. To nie są wiadomości, które mają kogoś do czegoś przekonać, tylko rutynowa komunikacja operacyjna, która informuje klienta i sama pilnuje terminów.",
          "ru": "Это сообщения, привязанные к тому, что уже произошло — бронированию, заказу, визиту — отправляемые автоматически в нужный момент, без необходимости, чтобы человек об этом помнил: подтверждение сразу после бронирования, напоминание за день до визита, благодарность после покупки. Это не сообщения, призванные кого-то в чём-то убедить, а рутинная операционная коммуникация, которая информирует клиента и сама следит за сроками."
        },
        "bullets": {
          "pl": [
            "Wiadomość wysyła się sama, w momencie konkretnego zdarzenia: rezerwacji, zamówienia, wizyty",
            "Kanał (SMS, email, WhatsApp) i treść ustalacie razem z nami pod Wasz proces",
            "To wiadomości informacyjne, nie sprzedażowe — potwierdzenie, przypomnienie, podziękowanie"
          ],
          "ru": [
            "Сообщение отправляется само в момент конкретного события: бронирования, заказа, визита",
            "Канал (SMS, email, WhatsApp) и содержание согласовываются вместе с нами под ваш процесс",
            "Это информационные, а не продающие сообщения — подтверждение, напоминание, благодарность"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmom z rezerwacjami i cyklicznymi wizytami — gabinety, salony, serwisy — oraz e-commerce, gdzie trzeba potwierdzić zamówienie i poinformować o wysyłce. Czyli każdej firmie, gdzie klient zobowiązuje się do czegoś (terminu, zamówienia) i potrzebuje przypomnienia przed tym albo potwierdzenia zaraz po tym.",
          "ru": "Компаниям с бронированиями и регулярными визитами — клиники, салоны, сервисы — а также e-commerce, где нужно подтвердить заказ и сообщить об отправке. То есть любой компании, где клиент берёт на себя обязательство (запись, заказ) и нуждается в напоминании перед этим или подтверждении сразу после."
        },
        "bullets": {
          "pl": [
            "Firmy z rezerwacjami i wizytami: gabinety, salony, serwisy",
            "E-commerce, gdzie trzeba potwierdzić zamówienie i poinformować o wysyłce",
            "Usługi cykliczne, gdzie klienci regularnie umawiają się na kolejne terminy"
          ],
          "ru": [
            "Компании с бронированиями и визитами: клиники, салоны, сервисы",
            "E-commerce, где нужно подтвердить заказ и сообщить об отправке",
            "Циклические услуги, где клиенты регулярно записываются на следующие визиты"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Problem: klienci zapominają o wizytach czy zamówieniach, bo nikt im nie przypomina, co prowadzi do niezjawień i zmarnowanych terminów, albo klienci czują niepewność po rezerwacji, bo nie dostali żadnego potwierdzenia i zaczynają wątpić, czy w ogóle do niej doszło. Rozpoznajesz to, pytając o odsetek niezjawień i czy potwierdzenia są wysyłane ręcznie, czasem albo wcale.",
          "ru": "Проблема: клиенты забывают о визитах или заказах, потому что никто им не напоминает, что приводит к неявкам и потерянным слотам, либо клиенты чувствуют неуверенность после бронирования, потому что не получили никакого подтверждения, и начинают сомневаться, состоялось ли оно вообще. Распознать это можно, спросив о проценте неявок и о том, отправляются ли подтверждения вручную, иногда или вообще нет."
        },
        "bullets": {
          "pl": [
            "Klient mówi: 'mamy sporo niezjawionych wizyt, ludzie po prostu zapominają'",
            "Potwierdzenia rezerwacji czy zamówienia wysyłane są ręcznie albo wcale",
            "Klienci dzwonią z pytaniem 'czy na pewno moje zamówienie doszło', bo nikt im nie potwierdził"
          ],
          "ru": [
            "Клиент говорит: 'у нас много неявок на визиты, люди просто забывают'",
            "Подтверждения бронирования или заказа отправляются вручную или не отправляются вообще",
            "Клиенты звонят с вопросом 'точно ли дошёл мой заказ', потому что никто им не подтвердил"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Zacznij od konkretnej, policzalnej bolączki — niezjawień, potem pokaż dwa proste scenariusze, na końcu wyraźnie odróżnij to od follow-upu sprzedażowego.",
          "ru": "Начни с конкретной, измеримой боли — неявок, затем покажи два простых сценария, в конце чётко отдели это от продающего follow-up."
        },
        "bullets": {
          "pl": [
            "Ile mniej więcej osób nie pojawia się na umówionej wizycie, bo po prostu zapomniało?",
            "Możemy ustawić automatyczne przypomnienie SMS-em czy mailem dzień przed wizytą, i potwierdzenie od razu po rezerwacji, żeby klient wiedział, że wszystko gra.",
            "To nie są wiadomości sprzedażowe, tylko czysto informacyjne — potwierdzenie, przypomnienie, podziękowanie — dokładnie w momencie, kiedy są potrzebne."
          ],
          "ru": [
            "Диагностический вопрос — узнаём масштаб проблемы неявок, это конкретная измеримая боль, легко представимая владельцем.",
            "Питч — приводим два конкретных сценария (подтверждение сразу после брони и напоминание за день), понятные без всякого технического языка.",
            "Важное разграничение с aifollowup — подчёркиваем, что это не продающие сообщения, а чисто информационные, что снимает возможную путаницу со 'спамом' или 'уговариванием'."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Nie proponuj, gdy firma nie ma rezerwacji ani powtarzalnych transakcji, więc nie ma czego przypominać, ani gdy klient ma już system rezerwacji z działającymi potwierdzeniami i przypomnieniami — nie ma sensu tego dublować. Uważaj też, żeby nie pomylić tego z aifollowup — automsg nie 'odzyska' cichego leada, obsługuje tylko kogoś, kto już się na coś zdecydował.",
          "ru": "Не предлагай, если у компании нет бронирований или повторяющихся транзакций, значит, напоминать не о чем, или если у клиента уже есть система бронирования с работающими подтверждениями и напоминаниями — дублировать это не имеет смысла. Также важно не путать это с aifollowup — automsg не 'вернёт' молчащего лида, он обслуживает только того, кто уже на что-то решился."
        },
        "bullets": {
          "pl": [
            "Firma nie ma rezerwacji ani powtarzalnych transakcji — nie ma czego przypominać",
            "Klient już ma system rezerwacji z działającymi potwierdzeniami i przypomnieniami — nie trzeba dublować",
            "Klient myli to z odzyskiwaniem cichych leadów — to nie ta usługa, do tego służy aifollowup"
          ],
          "ru": [
            "У компании нет бронирований или повторяющихся транзакций — напоминать не о чем",
            "У клиента уже есть система бронирования с работающими подтверждениями и напоминаниями — дублировать не нужно",
            "Клиент путает это с возвратом молчащих лидов — это не та услуга, для этого есть aifollowup"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Czym automsg różni się od aifollowup?",
          "ru": "Чем automsg отличается от aifollowup?"
        },
        "answers": {
          "pl": [
            "automsg to wiadomości informacyjne dla kogoś, kto już się zapisał czy zamówił — potwierdzenia i przypomnienia; aifollowup to wiadomości mające przekonać leada, który nie odpowiedział, żeby wrócił do rozmowy",
            "To dokładnie ta sama usługa",
            "aifollowup dotyczy tylko SMS-ów, automsg tylko maili"
          ],
          "ru": [
            "automsg — это информационные сообщения для того, кто уже записался или заказал — подтверждения и напоминания; aifollowup — это сообщения, призванные убедить не ответившего лида вернуться к разговору",
            "Это одна и та же услуга",
            "aifollowup касается только SMS, automsg только почты"
          ]
        },
        "correct": 0
      },
      {
        "type": "single",
        "question": {
          "pl": "Kiedy NIE warto proponować automsg?",
          "ru": "Когда НЕ стоит предлагать automsg?"
        },
        "answers": {
          "pl": [
            "Gdy klient już ma działający system rezerwacji z potwierdzeniami i przypomnieniami",
            "Gdy klient ma dużo niezjawionych wizyt",
            "Gdy klient prowadzi gabinet z cyklicznymi wizytami"
          ],
          "ru": [
            "Когда у клиента уже есть работающая система бронирования с подтверждениями и напоминаниями",
            "Когда у клиента много неявок на визиты",
            "Когда клиент ведёт кабинет с регулярными визитами"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Klient mówi: 'Czyli to jest to samo, co te przypomnienia do leadów, o których wcześniej mówiliście?' Jak wyjaśniasz różnicę?",
          "ru": "Клиент говорит: 'Значит, это то же самое, что и напоминания для лидов, о которых вы говорили раньше?' Как объясняешь разницу?"
        },
        "answers": {
          "pl": [
            "Potwierdzasz, że to dokładnie to samo",
            "Tłumaczysz, że automsg to wiadomości dla klientów, którzy już coś zamówili czy zarezerwowali — czysto informacyjne, a follow-up to próba odzyskania kogoś, kto zapytał i przestał odpisywać, zanim cokolwiek kupił",
            "Mówisz, że to nieistotne rozróżnienie"
          ],
          "ru": [
            "Подтверждаешь, что это одно и то же",
            "Объясняешь, что automsg — это сообщения для клиентов, которые уже что-то заказали или забронировали — чисто информационные, а follow-up — это попытка вернуть того, кто спросил и перестал отвечать, ещё до покупки",
            "Говоришь, что это неважное различие"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "To dwie różne usługi z różnym celem — jedna informuje kogoś, kto już zdecydował, druga próbuje przekonać kogoś, kto jeszcze nie zdecydował. Trzeba to jasno rozróżnić, żeby klient wiedział, co kupuje.",
          "ru": "Это две разные услуги с разной целью — одна информирует того, кто уже решился, другая пытается убедить того, кто ещё не решился. Это нужно чётко разграничивать, чтобы клиент понимал, что покупает."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient mówi: 'A jeśli klient dostanie przypomnienie SMS-em, a i tak się nie zjawi? To nic nie zmienia.' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент говорит: 'А если клиент получит SMS-напоминание и всё равно не придёт? Это ничего не меняет.' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź powinna być uczciwa: przypomnienia zmniejszają liczbę niezjawień, ale nie eliminują ich całkowicie; warto wskazać realny mechanizm — spora część niezjawień to zwykłe zapomnienie, które przypomnienie bezpośrednio rozwiązuje, ale nie wszystkie, część to świadome rezygnacje; unikać obiecywania gwarantowanego spadku liczby niezjawień o konkretny procent.",
          "ru": "Хороший ответ должен быть честным: напоминания снижают число неявок, но не устраняют их полностью; стоит указать реальный механизм — значительная часть неявок это обычная забывчивость, которую напоминание напрямую решает, но не все, часть — осознанные отказы; избегать обещания гарантированного снижения числа неявок на конкретный процент."
        }
      }
    ],
    "objections": [
      {
        "say": "Klienci będą się wkurzać, że dostają SMS-y, to trochę nachalne.",
        "ru": "Страх, что напоминания будут восприниматься как навязчивость.",
        "response": "To nie są wiadomości namawiające do czegokolwiek, tylko czyste info — 'przypominamy o wizycie jutro o 12'. Ludzie zwykle to lubią, bo sami nie muszą pamiętać terminu.",
        "responseRu": "Разграничиваем 'информационное' и 'навязчивое' — подчёркиваем, что подобные напоминания обычно воспринимаются клиентами как забота, а не как спам.",
        "why": {
          "pl": "Rozróżniasz konkretnie 'informacja' od 'namawianie', co rozwiewa obawę o nachalność.",
          "ru": "Чётко разграничиваем «информацию» и «уговоры» — это снимает страх навязчивости."
        }
      },
      {
        "say": "Mamy już system do rezerwacji, chyba on to robi.",
        "ru": "Клиент считает, что действующая система бронирования уже покрывает эту функцию.",
        "response": "Możliwe, że część tego już macie — warto sprawdzić, czy potwierdzenia i przypomnienia faktycznie działają za każdym razem, czy tylko czasami. Jeśli to już działa dobrze, to super, nie ma sensu tego dublować.",
        "responseRu": "Не спорим, а предлагаем честно проверить — если у клиента уже всё работает, признаём это и не навязываем услугу, если функция реально дублируется.",
        "why": {
          "pl": "Uczciwe sprawdzenie zamiast automatycznego sprzedawania buduje zaufanie i pokazuje, że nie sprzedajesz na siłę.",
          "ru": "Честная проверка вместо автоматической продажи укрепляет доверие и показывает, что мы не продаём ради продажи."
        }
      },
      {
        "say": "Nie chcę płacić za coś, co i tak moja recepcjonistka mogłaby robić.",
        "ru": "Клиент считает автоматизацию излишней, если есть сотрудник, теоретически способный сделать то же самое.",
        "response": "Może i mogłaby, pytanie czy realnie to robi przy każdej rezerwacji, codziennie, bez wyjątków — bo wystarczy jeden zapracowany dzień, żeby ktoś zapomniał wysłać przypomnienie, a automatyzacja tego nie pomija nigdy.",
        "responseRu": "Не спорим с тем, что человек теоретически может это делать, а указываем на разницу между «может» и «делает это стабильно каждый раз» — в этом ценность автоматизации.",
        "why": {
          "pl": "Pokazujesz różnicę między teoretyczną możliwością a rzeczywistą, stałą niezawodnością.",
          "ru": "Показываем разницу между теоретической возможностью и реальной постоянной надёжностью."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, pytanie — ile mniej więcej osób miesięcznie nie zjawia się na umówionej wizycie mimo rezerwacji?",
      "ru": "Открывашка через конкретную измеримую боль (неявки) — легко подхватывается владельцем бизнеса с записями или бронированиями."
    },
    "crossSell": {
      "pl": "Dobrze łączy się z Automatyzacją zapytań (aiauto) — jak nowa rezerwacja czy zamówienie trafia do systemu automatycznie, to automatyczne potwierdzenie może wystartować w tym samym momencie, bez żadnego dodatkowego kroku.",
      "ru": "Хорошо сочетается с автоматизацией заявок (aiauto) — когда новая бронь или заказ автоматически попадает в систему, автоматическое подтверждение может запускаться в тот же момент без дополнительных шагов."
    }
  },
  "leadforms": {
    "title": {
      "pl": "Formularze leadowe",
      "ru": "Лид-формы"
    },
    "badge": {
      "pl": "Więcej wypełnień, lepsze dane o kliencie",
      "ru": "Больше заполнений, лучшие данные о клиенте"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Interaktywne formularze wieloetapowe z logiką warunkową — czyli takie, gdzie pytanie numer dwa zależy od tego, co klient odpowiedział w pytaniu numer jeden. Zamiast jednego długiego formularza ze wszystkimi polami naraz, klient widzi krótkie, proste kroki jeden po drugim, co sprawia, że chętniej go dokańcza.",
          "ru": "Интерактивные многошаговые формы с условной логикой — то есть такие, где второй вопрос зависит от того, что клиент ответил на первый. Вместо одной длинной формы со всеми полями сразу клиент видит короткие, простые шаги один за другим, из-за чего охотнее доводит её до конца."
        },
        "bullets": {
          "pl": [
            "Formularz wieloetapowy z logiką warunkową (pytania dopasowują się do odpowiedzi)",
            "Krótkie kroki zamiast jednego długiego formularza ze wszystkimi polami naraz",
            "Proces: pytania → design → logika → integracja z CRM lub skrzynką"
          ],
          "ru": [
            "Многошаговая форма с условной логикой (вопросы подстраиваются под ответы)",
            "Короткие шаги вместо одной длинной формы со всеми полями сразу",
            "Процесс: вопросы → дизайн → логика → интеграция с CRM или почтой"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Każda firma, która dziś zbiera zapytania online — czyli praktycznie każdy klient ze stroną internetową. To szczególnie dobra usługa dla firm, które mają już stronę i formularz kontaktowy, ale chcą, żeby zapytania, które przychodzą, były od razu bardziej konkretne i łatwiejsze do obsłużenia przez handlowca.",
          "ru": "Любая компания, которая сегодня собирает заявки онлайн — то есть практически любой клиент с сайтом. Это особенно хорошая услуга для компаний, у которых уже есть сайт и контактная форма, но которые хотят, чтобы приходящие заявки были сразу конкретнее и легче в обработке для менеджера по продажам."
        },
        "bullets": {
          "pl": [
            "Firmy, które już zbierają zapytania online przez formularz kontaktowy",
            "Klienci, którym zależy na jakości leadów, nie tylko na ich liczbie",
            "Dobry, szybki dodatek do prawie każdej strony internetowej"
          ],
          "ru": [
            "Компании, которые уже собирают заявки онлайн через контактную форму",
            "Клиенты, которым важно качество лидов, а не только их количество",
            "Хорошее, быстрое дополнение почти к любому сайту"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje problem długich, nudnych formularzy, które odstraszają klientów — ludzie widzą formularz z piętnastoma polami do wypełnienia naraz i po prostu uciekają, zanim skończą. Rozpoznajesz to pytaniem o to, ile osób zaczyna wypełniać formularz, a ile go faktycznie wysyła — jeśli klient nie zna tej liczby albo jest ona niska, to jest właśnie ten problem.",
          "ru": "Решает проблему длинных, скучных форм, которые отпугивают клиентов — люди видят форму с пятнадцатью полями для заполнения сразу и просто уходят, не закончив. Распознаётся вопросом о том, сколько человек начинает заполнять форму, а сколько реально её отправляет — если клиент не знает этого числа или оно низкое, это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient ma formularz kontaktowy, ale mało osób go dokańcza",
            "Zapytania, które przychodzą, są ogólnikowe — trzeba dzwonić i dopytywać o podstawy",
            "Klient mówi 'ludzie zaczynają wypełniać i znikają w połowie'"
          ],
          "ru": [
            "У клиента есть контактная форма, но мало кто доводит её до конца",
            "Приходящие заявки общие — приходится звонить и доспрашивать про базовые вещи",
            "Клиент говорит: 'люди начинают заполнять и пропадают на середине'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Ile osób zaczyna wypełniać formularz na Pana stronie, a ile go faktycznie wysyła? Bo zwykle różnica jest spora, i to właśnie tam tracimy zapytania.",
            "Zamiast jednego długiego formularza proponuję kilka krótkich kroków — klient odpowiada na proste pytania jedno po drugim, a Pan od razu dostaje więcej informacji o tym, czego dokładnie potrzebuje.",
            "To jest szybki dodatek do strony, którą Pan już ma — nie zmieniamy całej strony, tylko wymieniamy formularz na taki, który więcej osób faktycznie wysyła."
          ],
          "ru": [
            "Диагностический вопрос про отвал на форме, повторяет стиль CRO, но применительно конкретно к форме.",
            "Переформулирует страх 'больше полей = больше усилий', подчёркивая, что пошаговый формат ощущается короче.",
            "Подчёркивает рамку 'быстрое дополнение', снижающее воспринимаемую стоимость/усилие — хорошо для чувствительных к цене клиентов."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Formularz leadowy ma sens tylko wtedy, gdy klient ma już miejsce, żeby go osadzić — czyli działającą stronę internetową. Nie oferuj tej usługi firmie, która w ogóle nie ma jeszcze strony — najpierw strona, potem formularz. Nigdy nie obiecuj konkretnej liczby dodatkowych zapytań miesięcznie, bo to zależy od ruchu na stronie i branży.",
          "ru": "Лид-форма имеет смысл только тогда, когда у клиента уже есть место, куда её встроить — то есть работающий сайт. Не предлагай эту услугу компании, у которой ещё вообще нет сайта — сначала сайт, потом форма. Никогда не обещай конкретное число дополнительных заявок в месяц, потому что это зависит от трафика на сайте и ниши."
        },
        "bullets": {
          "pl": [
            "Firma nie ma jeszcze strony internetowej → najpierw strona, formularz można dodać później",
            "Firma ma bardzo mały ruch na stronie → sam formularz nie pomoże, jeśli nikt go nie widzi, warto najpierw pomyśleć o ruchu",
            "Nigdy nie obiecuj konkretnej liczby dodatkowych zapytań miesięcznie"
          ],
          "ru": [
            "У компании ещё нет сайта → сначала сайт, форму можно добавить позже",
            "У компании очень маленький трафик на сайте → сама форма не поможет, если её никто не видит, стоит сначала подумать о трафике",
            "Никогда не обещай конкретное число дополнительных заявок в месяц"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mamy formularz kontaktowy, ale mało kto go wysyła do końca.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'У нас есть контактная форма, но мало кто доводит её до конца.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient ma po prostu złych klientów, nic się nie da zrobić",
            "Formularz jest prawdopodobnie za długi lub zniechęcający, i to sygnał do zamiany go na formularz wieloetapowy",
            "Trzeba usunąć formularz całkowicie i zostawić tylko numer telefonu"
          ],
          "ru": [
            "У клиента просто плохие клиенты, ничего не поделаешь",
            "Форма, вероятно, слишком длинная или отпугивающая, и это сигнал заменить её на многошаговую",
            "Нужно полностью убрать форму и оставить только номер телефона"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Na czym polega logika warunkowa w formularzu leadowym?",
          "ru": "В чём суть условной логики в лид-форме?"
        },
        "answers": {
          "pl": [
            "Formularz ma dokładnie jedno pytanie i nic więcej",
            "Kolejne pytanie w formularzu dopasowuje się do odpowiedzi, którą klient dał wcześniej",
            "Formularz losowo zmienia kolejność pytań za każdym razem"
          ],
          "ru": [
            "В форме ровно один вопрос и больше ничего",
            "Следующий вопрос в форме подстраивается под ответ, который клиент дал раньше",
            "Форма случайно меняет порядок вопросов каждый раз"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do firmy sprzątającej biura. Właścicielka mówi: 'Mamy formularz na stronie, ale przychodzą zapytania typu 'proszę o kontakt' bez żadnych szczegółów, i musimy dzwonić, żeby się czegokolwiek dowiedzieć.' Co proponujesz?",
          "ru": "Звонишь в клининговую компанию. Владелица говорит: 'У нас есть форма на сайте, но приходят заявки типа 'прошу связаться' без всяких деталей, и приходится звонить, чтобы хоть что-то узнать.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Usunięcie formularza, bo i tak trzeba dzwonić",
            "Formularz wieloetapowy z pytaniami o metraż, częstotliwość sprzątania i lokalizację, żeby zapytanie od razu było konkretne",
            "Zwiększenie budżetu na reklamę, żeby przychodziło więcej takich zapytań"
          ],
          "ru": [
            "Убрать форму совсем, раз всё равно нужно звонить",
            "Многошаговую форму с вопросами про метраж, частоту уборки и локацию, чтобы заявка сразу была конкретной",
            "Увеличить бюджет на рекламу, чтобы приходило больше таких заявок"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Problem nie tkwi w liczbie leadów, tylko w jakości i konkretności danych — formularz z logicznymi pytaniami kwalifikuje leada od razu.",
          "ru": "Проблема не в количестве лидов, а в качестве/конкретности данных — форма с логичными вопросами квалифицирует лида сразу."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A czy taki formularz na pewno zwiększy liczbę zapytań, a nie zniechęci ludzi jeszcze bardziej?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А точно такая форма увеличит число заявок, а не отпугнёт людей ещё сильнее?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź nie obiecuje konkretnego wzrostu liczby zapytań. Tłumaczy, że krótkie, wieloetapowe formularze zwykle odbierane są jako łatwiejsze do wypełnienia niż długie, ale realne liczby zależą od ruchu, designu i branży. Proponuje zmierzenie wyniku przed i po zmianie. Nie podaje konkretnego procenta.",
          "ru": "Хороший ответ не обещает точный рост числа заявок; объясняет, что короткие пошаговые формы обычно воспринимаются легче для заполнения, чем длинные, но реальные цифры зависят от трафика, дизайна, ниши; предлагает измерить до/после; не обещает конкретный процент."
        }
      }
    ],
    "objections": [
      {
        "say": "Mamy już formularz kontaktowy, po co go zmieniać?",
        "ru": "Клиент воспринимает существующую форму как 'достаточно хорошую', сопротивление изменению того, что кажется рабочим.",
        "response": "Ma Pan formularz, to dobry punkt startowy. Pytanie tylko, ile osób, które zaczynają go wypełniać, faktycznie go wysyła — jeśli tego Pan nie sprawdzał, może się okazać, że sporo osób rezygnuje w połowie, i to jest do odzyskania bez zmiany całej strony.",
        "responseRu": "Разворачивает вопрос 'зачем менять' в диагностический вопрос, который, скорее всего, раскроет скрытый отвал на форме — вместо спора предлагает сначала просто проверить цифры.",
        "why": {
          "pl": "Zamiast przekonywać wprost, zadajesz pytanie diagnostyczne, które samo pokazuje problem — klient dochodzi do wniosku sam.",
          "ru": "Вместо прямого убеждения задаётся диагностический вопрос, который сам показывает проблему — клиент приходит к выводу самостоятельно."
        }
      },
      {
        "say": "Nie chcę męczyć klientów dodatkowymi pytaniami, to ich zniechęci.",
        "ru": "Страх, что больше вопросов = больше трения, недопонимание разницы между многошаговой и одной длинной формой.",
        "response": "To akurat odwrotnie działa niż się wydaje — jedno długie okno z piętnastoma polami naraz wygląda dużo bardziej męcząco niż kilka krótkich kroków, gdzie klient widzi jedno proste pytanie na raz i łatwo je przeskakuje.",
        "responseRu": "Контраргумент работает против интуиции — противопоставляет 'одно длинное окно с пятнадцатью полями' и 'несколько коротких шагов', используя визуальный контраст, который клиент легко представит.",
        "why": {
          "pl": "Kontrastowe porównanie (jedno długie okno vs kilka krótkich kroków) obala intuicyjny, ale błędny lęk klienta.",
          "ru": "Контрастное сравнение (одно длинное окно против нескольких коротких шагов) опровергает интуитивный, но ошибочный страх клиента."
        }
      },
      {
        "say": "To pewnie skomplikowane i drogie do zrobienia.",
        "ru": "Возражение по цене/сложности, контрастирующее с реальным дешёвым/быстрым позиционированием услуги.",
        "response": "Właśnie nie — to jeden z najszybszych i najtańszych dodatków, jakie możemy zrobić do strony, którą Pan już ma. Nie przebudowujemy całej strony, tylko wymieniamy formularz na lepszy.",
        "responseRu": "Прямо опровергает ложное предположение реальным позиционированием цены (дешёвое, быстрое дополнение), укрепляя доверие и снижая барьер к согласию.",
        "why": {
          "pl": "Skorygowanie błędnego założenia realną, niską ceną buduje zaufanie i obniża próg decyzyjny.",
          "ru": "Исправление ошибочного предположения реальной, низкой ценой строит доверие и снижает порог принятия решения."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, czy wie Pan, ile osób zaczyna wypełniać formularz kontaktowy na Pana stronie, a ile go faktycznie wysyła?",
      "ru": "Диагностический опенер, раскрывающий скрытый отвал заявок — хорошо подходит для клиентов, у которых уже есть сайт и контактная форма, естественная дверь для недорогой быстрой услуги."
    },
    "crossSell": {
      "pl": "Formularz leadowy to świetny, szybki dodatek do strony czy landing page, ale dane, które zbiera, muszą gdzieś trafiać — dlatego naturalnie łączy się z automatyzacją w CRM albo z kwalifikacją leadów przez AI, a przy większym projekcie staje się jednym z elementów całego lejka sprzedażowego.",
      "ru": "Лид-форма — отличное, быстрое дополнение к сайту или лендингу, но данные, которые она собирает, должны куда-то попадать — поэтому она естественно сочетается с автоматизацией в CRM или квалификацией лидов через AI, а при более крупном проекте становится одним из элементов всей воронки продаж."
    }
  },
  "calculators": {
    "title": {
      "pl": "Kalkulatory ofert",
      "ru": "Калькуляторы стоимости"
    },
    "badge": {
      "pl": "Ciepły lead zamiast pytania 'ile to kosztuje?'",
      "ru": "Тёплый лид вместо вопроса 'сколько это стоит?'"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Interaktywny kalkulator wyceny na stronie — klient sam wpisuje parametry swojego zlecenia, na przykład metraż, zakres prac czy ilość, i widzi orientacyjną cenę bez konieczności dzwonienia czy pisania. Kalkulator opiera się na wcześniej ustalonej logice cenowej, którą programujemy razem z klientem na podstawie tego, jak on faktycznie wycenia swoje usługi.",
          "ru": "Интерактивный калькулятор расчёта стоимости на сайте — клиент сам вводит параметры своего заказа, например метраж, объём работ или количество, и видит ориентировочную цену без необходимости звонить или писать. Калькулятор основан на заранее установленной ценовой логике, которую мы программируем вместе с клиентом на основе того, как он реально оценивает свои услуги."
        },
        "bullets": {
          "pl": [
            "Klient sam wpisuje parametry (metraż, zakres, ilość) i widzi orientacyjną cenę",
            "Logika wyceny jest ustalana razem z klientem na bazie jego realnego cennika",
            "Proces: logika cen → interfejs → wdrożenie → integracja z leadami"
          ],
          "ru": [
            "Клиент сам вводит параметры (метраж, объём, количество) и видит ориентировочную цену",
            "Ценовая логика устанавливается вместе с клиентом на базе его реального прайса",
            "Процесс: логика цен → интерфейс → внедрение → интеграция с лидами"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Branże, w których cena zależy od konkretnych parametrów zlecenia, a nie jest jedną stałą kwotą — budowlanka, remonty, sprzątanie, transport, produkcja na zamówienie. To firmy, gdzie pytanie 'ile to będzie kosztować' pojawia się przy każdym kontakcie, a odpowiedź zawsze wymaga policzenia czegoś na podstawie kilku zmiennych.",
          "ru": "Ниши, в которых цена зависит от конкретных параметров заказа, а не является одной фиксированной суммой — строительство, ремонт, уборка, транспорт, производство на заказ. Это компании, где вопрос 'сколько это будет стоить' возникает при каждом обращении, а ответ всегда требует расчёта на основе нескольких переменных."
        },
        "bullets": {
          "pl": [
            "Budowlanka, remonty, sprzątanie, transport, produkcja na zamówienie",
            "Firmy, gdzie cena zależy od kilku zmiennych, a nie jest jedną stałą kwotą",
            "Branże, gdzie klienci najpierw chcą się zorientować w cenie, zanim zadzwonią"
          ],
          "ru": [
            "Строительство, ремонт, уборка, транспорт, производство на заказ",
            "Компании, где цена зависит от нескольких переменных, а не является одной фиксированной суммой",
            "Ниши, где клиенты сначала хотят сориентироваться в цене, прежде чем звонить"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje najczęstsze pytanie bez odpowiedzi — 'ile to kosztuje?' — na które dziś klient musi zadzwonić albo napisać, żeby poznać choćby orientacyjną cenę, a wielu ludzi po prostu rezygnuje po drodze, zamiast czekać na kontakt. Rozpoznajesz to pytaniem, czy na stronie klienta widać jakikolwiek sposób na wstępną orientację w cenie — jeśli jedyną opcją jest 'zadzwoń po wycenę', to jest dokładnie ten problem.",
          "ru": "Решает самый частый вопрос без ответа — 'сколько это стоит?' — на который сегодня клиент должен позвонить или написать, чтобы узнать хотя бы ориентировочную цену, а многие просто отказываются по дороге, вместо того чтобы ждать контакта. Распознаётся вопросом, виден ли на сайте клиента какой-либо способ предварительно сориентироваться в цене — если единственный вариант это 'позвоните за расчётом', это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Jedyny sposób poznania ceny to kontakt telefoniczny lub mailowy, co odstrasza część klientów",
            "Klient nie wie, ile osób odwiedza stronę i rezygnuje, bo nie widzi nawet orientacyjnej ceny",
            "Klient mówi 'ludzie pytają o cenę i znikają, jak nie odpowiemy od razu'"
          ],
          "ru": [
            "Единственный способ узнать цену — телефонный или email-контакт, что отпугивает часть клиентов",
            "Клиент не знает, сколько человек заходит на сайт и уходит, потому что не видит даже ориентировочной цены",
            "Клиент говорит: 'люди спрашивают цену и пропадают, если не ответим сразу'"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Ile razy dziennie ktoś pyta Pana 'ile to będzie kosztować', zanim jeszcze cokolwiek ustalicie? Kalkulator na stronie odpowiada na to pytanie od razu, zanim klient w ogóle do Pana zadzwoni.",
            "Klient sam wpisuje metraż czy zakres prac, widzi orientacyjną cenę i zostawia kontakt — bo skoro już poświęcił dwie minuty na wpisanie danych, jest dużo bardziej zaangażowany niż ktoś, kto tylko przeczytał 'zadzwoń po wycenę'.",
            "To nie jest ostateczna oferta, tylko orientacyjne widełki — dokładną wycenę i tak Pan potwierdza później, ale klient już wie, w jakich granicach się porusza."
          ],
          "ru": [
            "Эта фраза переводит ежедневную боль (повторяющиеся вопросы о цене) в конкретную, ощутимую цифру — делает ценность калькулятора наглядной.",
            "Объясняет психологический принцип: вложенное усилие (ввод параметров) создаёт эффект 'вложенных затрат', даёт более тёплого лида, чем пассивный посетитель — полезно для обоснования цены услуги.",
            "Заранее формулирует 'ориентировочную цену' как приблизительную, снимая страх, что клиенты будут держаться за это число как за окончательное — эту фразу нужно включать всегда."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Kalkulator ma sens tylko tam, gdzie cena faktycznie zależy od policzalnych parametrów — jeśli firma ma sztywny, jeden cennik albo każda wycena jest w pełni indywidualna i niemożliwa do uproszczenia w logikę, kalkulator nie zadziała dobrze. Nie oferuj go firmom, które celowo nie chcą podawać żadnych widełek cenowych na stronie, np. ze względów konkurencyjnych. Nigdy nie przedstawiaj wyniku kalkulatora jako gwarantowanej, ostatecznej ceny.",
          "ru": "Калькулятор имеет смысл только там, где цена реально зависит от исчисляемых параметров — если у компании один жёсткий прайс или каждая оценка полностью индивидуальна и её невозможно упростить в логику, калькулятор не сработает хорошо. Не предлагай его компаниям, которые сознательно не хотят показывать никакие ценовые вилки на сайте, например по конкурентным причинам. Никогда не представляй результат калькулятора как гарантированную, окончательную цену."
        },
        "bullets": {
          "pl": [
            "Firma ma jeden sztywny cennik lub w pełni indywidualną wycenę bez policzalnych parametrów → kalkulator się nie sprawdzi",
            "Klient nie chce w ogóle pokazywać orientacyjnych cen na stronie ze względów konkurencyjnych → uszanuj to i zaproponuj inną usługę",
            "Nigdy nie przedstawiaj wyniku kalkulatora jako gwarantowanej, ostatecznej ceny"
          ],
          "ru": [
            "У компании один жёсткий прайс или полностью индивидуальная оценка без исчисляемых параметров → калькулятор не сработает",
            "Клиент вообще не хочет показывать ориентировочные цены на сайте по конкурентным причинам → уважай это и предложи другую услугу",
            "Никогда не представляй результат калькулятора как гарантированную, окончательную цену"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Ludzie ciągle pytają, ile będzie kosztować remont, a ja nie mogę im tak od razu odpowiedzieć bez oględzin.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Люди постоянно спрашивают, сколько будет стоить ремонт, а я не могу сразу ответить без осмотра.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Trzeba mu zaproponować obniżenie cen, żeby klienci przestali pytać",
            "Dobry sygnał do kalkulatora ofert, który da orientacyjną cenę na bazie podstawowych parametrów, zanim dojdzie do oględzin",
            "Nic się nie da zrobić, dopóki nie zobaczy obiektu na żywo"
          ],
          "ru": [
            "Нужно предложить ему снизить цены, чтобы клиенты перестали спрашивать",
            "Хороший сигнал для калькулятора стоимости, который даст ориентировочную цену на основе базовых параметров, ещё до осмотра",
            "Ничего не поделаешь, пока он не увидит объект вживую"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dla jakich branż kalkulator wyceny sprawdza się najlepiej?",
          "ru": "Для каких ниш калькулятор расчёта стоимости работает лучше всего?"
        },
        "answers": {
          "pl": [
            "Dla firm, gdzie cena jest zawsze taka sama, niezależnie od zlecenia",
            "Dla branż, gdzie cena zależy od policzalnych parametrów, np. metrażu, zakresu prac czy ilości — budowlanka, remonty, sprzątanie, transport",
            "Wyłącznie dla sklepów internetowych sprzedających jeden produkt"
          ],
          "ru": [
            "Для компаний, где цена всегда одинаковая, независимо от заказа",
            "Для ниш, где цена зависит от исчисляемых параметров, например метража, объёма работ или количества — строительство, ремонт, уборка, транспорт",
            "Исключительно для интернет-магазинов, продающих один товар"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do firmy transportowej. Właściciel mówi: 'Non stop dzwonią ludzie pytać o cenę przewozu, a każda trasa jest inna, więc tracę godziny na liczenie widełek przez telefon.' Co proponujesz?",
          "ru": "Звонишь в транспортную компанию. Владелец говорит: 'Постоянно звонят люди спросить цену перевозки, а каждый маршрут разный, поэтому я трачу часы на расчёт вилок по телефону.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Kalkulator na stronie, w którym klient wpisuje trasę i parametry przesyłki i od razu widzi orientacyjną cenę, a Pan dostaje gotowy, ciepły kontakt",
            "Zatrudnienie dodatkowej osoby do odbierania telefonów",
            "Ujednolicenie cennika na jedną stałą kwotę niezależnie od trasy"
          ],
          "ru": [
            "Калькулятор на сайте, в котором клиент вводит маршрут и параметры груза и сразу видит ориентировочную цену, а вы получаете готовый тёплый контакт",
            "Нанять дополнительного человека для приёма звонков",
            "Унифицировать прайс до одной фиксированной суммы независимо от маршрута"
          ]
        },
        "correct": 0,
        "explain": {
          "pl": "Problem to powtarzalne liczenie ceny na podstawie zmiennych parametrów — dokładnie do tego służy kalkulator, odciąża telefon i daje gotowego leada.",
          "ru": "Проблема — повторяющийся расчёт цены на основе переменных параметров, именно для этого нужен калькулятор, он разгружает телефон и даёт готового лида."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A jeśli klient wpisze dane w kalkulatorze i potem będzie się upierał, że to jest ostateczna cena?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А если клиент введёт данные в калькулятор и потом будет настаивать, что это окончательная цена?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź tłumaczy, że wynik kalkulatora jest zawsze jasno opisany i oznaczony jako cena orientacyjna, a nie ostateczna oferta, a ostateczna cena i tak wymaga potwierdzenia. Nie obiecuje stuprocentowej dokładności. Tłumaczy, że to standardowa praktyka i część treści/designu kalkulatora, która ustawia oczekiwania klienta. Nie twierdzi, że to całkowicie wyeliminuje wszystkie spory o cenę.",
          "ru": "Хороший ответ объясняет, что результат калькулятора всегда оформлен и подписан как ориентировочный/примерный, а не окончательное предложение, и окончательная цена всё равно требует подтверждения; не переобещает точность; объясняет, что это стандартная практика и часть текста/дизайна калькулятора, задающая ожидания. Не должен утверждать, что это полностью устранит все споры о цене."
        }
      }
    ],
    "objections": [
      {
        "say": "Boję się, że klienci będą się przyczepiać do orientacyjnej ceny z kalkulatora, jakby to była ostateczna oferta.",
        "ru": "Реальное опасение, требует решения через приём формулировки/подписи на результате.",
        "response": "Dlatego kalkulator zawsze jasno pokazuje, że to cena orientacyjna, nie ostateczna oferta — dokładnie to samo robi Pan dzisiaj, kiedy mówi komuś 'widełki to mniej więcej tyle', tylko robi to teraz strona, zamiast Pan przez telefon.",
        "responseRu": "Переформулирует калькулятор как автоматизацию того, что владелец уже делает устно — снижает воспринимаемую новизну/риск.",
        "why": {
          "pl": "Kalkulator jest przedstawiony jako automatyzacja czegoś, co klient i tak już robi ustnie, a nie jako coś zupełnie nowego i ryzykownego.",
          "ru": "Калькулятор представлен как автоматизация того, что клиент и так уже делает устно, а не как что-то совершенно новое и рискованное."
        }
      },
      {
        "say": "Nasza wycena jest zbyt skomplikowana, żeby to zamienić w prosty kalkulator.",
        "ru": "Возражение о сложности — часто переоценивается владельцем.",
        "response": "Prawie każda wycena da się rozbić na kilka głównych parametrów, które najbardziej wpływają na cenę — resztę można zostawić jako 'cena do potwierdzenia po kontakcie'. Nie musimy ubrać w kalkulator stu procent Pana cennika, wystarczy, że klient dostanie sensowny punkt startowy.",
        "responseRu": "Показывает технику упрощения до ключевых переменных, а не моделирования полной сложности — практическое успокоение.",
        "why": {
          "pl": "Redukcja 'całego cennika' do kilku kluczowych zmiennych pokazuje, że projekt jest wykonalny bez utraty sensu.",
          "ru": "Сведение 'всего прайса' к нескольким ключевым переменным показывает, что проект выполним без потери смысла."
        }
      },
      {
        "say": "Konkurencja zobaczy nasze ceny i będzie mogła je podbić.",
        "ru": "Страх раскрытия ценовой логики конкурентам — специфичен для публичного показа цен.",
        "response": "Kalkulator pokazuje orientacyjną cenę końcową, a nie Pana wewnętrzny cennik czy marże — konkurencja widzi to samo, co każdy klient, czyli wynik, a nie sposób, w jaki go Pan liczy.",
        "responseRu": "Разграничивает 'виден результат' и 'видна ценовая логика' — прямо снимает этот страх.",
        "why": {
          "pl": "Rozróżnienie 'widoczny wynik' od 'widocznej logiki liczenia' bezpośrednio neutralizuje lęk konkurencyjny.",
          "ru": "Разграничение 'виден результат' и 'видна логика расчёта' напрямую нейтрализует конкурентный страх."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, czy klienci często pytają Pana o orientacyjną cenę, zanim jeszcze cokolwiek ustalicie?",
      "ru": "Открывашка с универсальной болью для бизнесов с параметрическим ценообразованием, хороший ледокол для строительства/уборки/транспорта, естественно подводит к питчу калькулятора."
    },
    "crossSell": {
      "pl": "Kalkulator to konkretny, wysoko konwertujący typ formularza dla branż z wyceną zależną od parametrów, więc dobrze łączy się z formularzem leadowym przy zbieraniu danych kontaktowych, a przy większym budżecie staje się jednym z elementów całego lejka sprzedażowego razem z reklamą i automatyzacją w CRM.",
      "ru": "Калькулятор — это конкретный, высококонвертирующий тип формы для ниш с ценообразованием, зависящим от параметров, поэтому хорошо сочетается с лид-формой при сборе контактных данных, а при большем бюджете становится одним из элементов всей воронки продаж вместе с рекламой и автоматизацией в CRM."
    }
  },
  "adminpanels": {
    "title": {
      "pl": "Panele admina",
      "ru": "Админ-панели"
    },
    "badge": {
      "pl": "Jedno miejsce kontroli nad firmą",
      "ru": "Единое место контроля над бизнесом"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Dedykowany panel zbudowany pod konkretną firmę — nie gotowe narzędzie z pudełka, tylko system szyty na miarę: leady, klienci, treści i statystyki w jednym miejscu, z rolami określającymi kto co widzi i może zmieniać. Buduje się go pod realne procesy firmy, a nie odwrotnie — firma nie musi dopasowywać się do cudzego oprogramowania.",
          "ru": "Отдельная панель, построенная под конкретную компанию — не готовый инструмент из коробки, а система, сшитая по мерке: лиды, клиенты, контент и статистика в одном месте, с ролями, определяющими кто что видит и может менять. Строится под реальные процессы компании, а не наоборот — компании не приходится подстраиваться под чужой софт."
        },
        "bullets": {
          "pl": [
            "Własny panel zbudowany pod firmę, nie gotowy SaaS z pudełka",
            "Leady, klienci, treści i statystyki w jednym miejscu",
            "Role użytkowników: kto co widzi i może zmieniać"
          ],
          "ru": [
            "Собственная панель под компанию, не готовый SaaS из коробки",
            "Лиды, клиенты, контент и статистика в одном месте",
            "Роли пользователей: кто что видит и может менять"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy z własnymi procesami, których nie ma w gotowych narzędziach — urosły na tyle, że Excel przestał wystarczać, a standardowe CRM-y z rynku mają sztywną strukturę, która nie pasuje do specyfiki ich pracy.",
          "ru": "Компании со своими процессами, которых нет в готовых инструментах — выросли настолько, что Excel перестал справляться, а стандартные CRM с рынка имеют жёсткую структуру, которая не подходит под специфику их работы."
        },
        "bullets": {
          "pl": [
            "Firmy, które urosły i mają złożone, nietypowe procesy",
            "Firmy, którym gotowe CRM-y 'z pudełka' nie pasują do specyfiki",
            "Firmy z kilkoma osobami lub działami, które potrzebują różnych poziomów dostępu"
          ],
          "ru": [
            "Компании, которые выросли и имеют сложные, нетипичные процессы",
            "Компании, которым готовые CRM 'из коробки' не подходят по специфике",
            "Компании с несколькими людьми или отделами, которым нужны разные уровни доступа"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Excel i notatki przestają wystarczać — firma urosła, dane są porozrzucane po plikach, mailach i głowach ludzi, nikt nie ma pełnego obrazu. Gotowe narzędzia nie pasują, bo mają sztywną strukturę. Rozpoznajesz to pytaniem: 'Gdzie dziś trzymacie dane o klientach i leadach?' — jeśli odpowiedź to 'w Excelu, częściowo w mailach, częściowo w głowie', to jest dokładnie ten problem.",
          "ru": "Excel и заметки перестают справляться — компания выросла, данные разбросаны по файлам, почте и головам людей, ни у кого нет полной картины. Готовые инструменты не подходят, потому что имеют жёсткую структуру. Распознаётся вопросом: 'Где сегодня храните данные о клиентах и лидах?' — если ответ 'в Excel, частично в почте, частично в голове', это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient mówi 'mamy to rozrzucone po kilku Excelach i mailach'",
            "Firma próbowała gotowego CRM-u, ale 'nie pasował' do ich procesu",
            "Nikt w firmie nie ma pełnego obrazu tego, co się dzieje"
          ],
          "ru": [
            "Клиент говорит 'у нас всё разбросано по нескольким Excel-файлам и почте'",
            "Компания пробовала готовый CRM, но он 'не подошёл' под их процесс",
            "Ни у кого в компании нет полной картины происходящего"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Rozumiem, że dziś ogarniacie to Excelem — pytanie tylko, czy to jeszcze wystarcza, czy już ktoś gubi dane albo traci czas na szukanie.",
            "Nie sprzedaję gotowego programu z pudełka — budujemy panel dokładnie pod to, jak Pan dziś pracuje, a nie na odwrót.",
            "Zaczynamy od tego, jak dziś wygląda Pana proces, i dopiero na tej podstawie proponujemy, co ma się znaleźć w panelu."
          ],
          "ru": [
            "Не критикует Excel напрямую, а pytaniem otwiera temat: sprawdza, czy obecne rozwiązanie już boli, zamiast zakładać to z góry.",
            "Kluczowe zdanie odróżniające tę usługę od gotowego CRM-u — usuwa obawę 'będę musiał dopasować firmę do cudzego programu'.",
            "Pokazuje kolejność: najpierw proces klienta, potem produkt — buduje zaufanie, że panel nie będzie 'wciśnięty' na siłę."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Panel admina to spora, dedykowana inwestycja — nie oferuj jej firmom z prostym procesem, gdzie Excel spokojnie wystarcza jeszcze długo, ani klientom, którzy szukają szybkiego, taniego rozwiązania od zaraz. Nigdy nie obiecuj gotowego terminu ani ceny bez wcześniejszego zebrania procesów firmy — zakres modułów i ról bezpośrednio wpływa na czas i cenę.",
          "ru": "Админ-панель — это крупная, выделенная инвестиция — не предлагай её компаниям с простым процессом, где Excel спокойно справится ещё долго, и клиентам, которые ищут быстрое, дешёвое решение прямо сейчас. Никогда не обещай готовый срок или цену без предварительного сбора процессов компании — объём модулей и ролей напрямую влияет на срок и цену."
        },
        "bullets": {
          "pl": [
            "Mała firma z prostym procesem, gdzie Excel spokojnie wystarcza → nie sprzedawaj przedwcześnie",
            "Klient szuka gotowego, taniego rozwiązania od zaraz, a nie inwestycji w dedykowane narzędzie",
            "Nigdy nie obiecuj konkretnego terminu ani ceny, zanim nie poznasz procesów i modułów"
          ],
          "ru": [
            "Маленькая компания с простым процессом, где Excel справляется → не продавай преждевременно",
            "Клиент ищет готовое, дешёвое решение прямо сейчас, а не инвестицию в отдельный инструмент",
            "Никогда не обещай конкретный срок или цену, пока не узнаешь процессы и модули"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mamy wszystko w Excelu, ale robi się coraz trudniej to ogarnąć, bo każdy ma swoją wersję pliku.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'У нас всё в Excel, но становится всё сложнее с этим справляться, потому что у каждого своя версия файла.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Trzeba mu polecić, żeby po prostu lepiej pilnował Excela",
            "Klasyczny sygnał, że firma urosła z gotowych narzędzi i potrzebuje dedykowanego panelu",
            "To nie jest problem, który da się rozwiązać technicznie"
          ],
          "ru": [
            "Нужно посоветовать ему просто лучше следить за Excel",
            "Классический сигнал, что компания переросла подручные инструменты и нуждается в выделенной панели",
            "Это не проблема, которую можно решить технически"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego panel admina to nie to samo co gotowy CRM z pudełka?",
          "ru": "Почему админ-панель — это не то же самое, что готовый CRM из коробки?"
        },
        "answers": {
          "pl": [
            "Bo panel admina jest zawsze tańszy",
            "Bo panel buduje się pod konkretne procesy i role tej jednej firmy, a nie pod uniwersalny szablon",
            "Bo gotowe CRM-y w ogóle nie mają statystyk"
          ],
          "ru": [
            "Потому что админ-панель всегда дешевле",
            "Потому что панель строится под конкретные процессы и роли именно этой компании, а не под универсальный шаблон",
            "Потому что готовые CRM вообще не имеют статистики"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do firmy zajmującej się wynajmem sprzętu budowlanego. Właściciel mówi: 'Mamy już z 200 klientów, umowy w Wordzie, dostępność sprzętu w Excelu, a faktury osobno w programie księgowym. Nikt nie wie na bieżąco, co jest wolne.' Co proponujesz?",
          "ru": "Звонишь в компанию по аренде строительной техники. Владелец говорит: 'У нас уже около 200 клиентов, договоры в Word, доступность техники в Excel, а счета отдельно в бухгалтерской программе. Никто не знает в реальном времени, что свободно.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Zaproponuj im gotowy CRM z rynku, będzie taniej i szybciej",
            "Zaproponuj dedykowany panel łączący dostępność sprzętu, klientów i umowy w jednym miejscu, zbudowany pod ich proces wynajmu",
            "Powiedz, że potrzebują tylko lepiej zorganizowanego Excela"
          ],
          "ru": [
            "Предложить им готовый CRM с рынка, будет дешевле и быстрее",
            "Предложить выделенную панель, объединяющую доступность техники, клиентов и договоры в одном месте, построенную под их процесс аренды",
            "Сказать, что им нужен просто лучше организованный Excel"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Rozproszone dane w kilku systemach bez wspólnego obrazu to klasyczny case pod panel admina. Gotowy CRM nie obejmie specyfiki wynajmu (dostępność sprzętu w czasie), więc dedykowany panel jest tu trafniejszym rozwiązaniem niż uniwersalne narzędzie.",
          "ru": "Разрозненные данные в нескольких системах без общей картины — классический кейс для админ-панели. Готовый CRM не покроет специфику аренды (доступность техники во времени), поэтому выделенная панель здесь точнее, чем универсальный инструмент."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta 'Ile to będzie kosztować i jak długo to potrwa?' zanim jeszcze opisał swoje procesy. Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает 'Сколько это будет стоить и сколько времени займёт?', ещё не описав свои процессы. Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź nie podaje sztywnej ceny ani terminu od razu — tłumaczy, że cena zależy od liczby modułów, ról i integracji, a najpierw trzeba poznać procesy firmy (Procesy → prototyp → wdrożenie → iteracje). Może podać 'od 500 EUR' jako punkt odniesienia, ale nie jako ostateczną cenę. Nie obiecuje konkretnego terminu bez doprecyzowania zakresu.",
          "ru": "Хороший ответ не называет жёсткую цену или срок сразу — объясняет, что цена зависит от числа модулей, ролей и интеграций, а сначала нужно узнать процессы компании (Процессы → прототип → внедрение → итерации). Может назвать 'от 500 евро' как ориентир, но не как окончательную цену. Не обещает конкретный срок без уточнения объёма."
        }
      }
    ],
    "objections": [
      {
        "say": "Używamy Excela i jakoś działa, po co nam kolejny system?",
        "ru": "Клиент не видит боли, потому что привык к текущему решению — нужно показать скрытую цену (время, ошибки), а не саму функцию.",
        "response": "Rozumiem, Excel długo może działać. Pytanie, ile czasu Pan albo ktoś z zespołu traci co tydzień na szukanie danych albo poprawianie błędów, kiedy ktoś nadpisze plik. Panel nie zabiera Excela, tylko zabiera ten chaos.",
        "responseRu": "Не атакует Excel напрямую, а спрашивает про скрытую цену времени — позволяет клиенту самому прийти к выводу, а не спорить с продавцом.",
        "why": {
          "pl": "Pytanie o ukryty koszt czasu jest mniej konfrontacyjne niż krytyka obecnego rozwiązania i skłania klienta do samodzielnej refleksji.",
          "ru": "Вопрос о скрытой цене времени менее конфронтационен, чем критика текущего решения, и подталкивает клиента к самостоятельному размышлению."
        }
      },
      {
        "say": "To brzmi jak duży, drogi projekt na miesiące.",
        "ru": "Страх крупной инвестиции и долгого внедрения — нужно показать, что старт маленький и поэтапный.",
        "response": "Nie musimy budować wszystkiego naraz. Zaczynamy od jednego, najbardziej bolesnego kawałka — na przykład leadów i klientów — i rozbudowujemy panel krok po kroku, w miarę jak widzimy, że działa.",
        "responseRu": "Техника разбиения крупного проекта на этапы снижает воспринимаемый риск и делает решение психологически проще.",
        "why": {
          "pl": "Podział na etapy zmniejsza postrzegane ryzyko i pozwala klientowi zacząć od małej, bezpiecznej decyzji.",
          "ru": "Разбивка на этапы уменьшает воспринимаемый риск и позволяет клиенту начать с малого, безопасного решения."
        }
      },
      {
        "say": "A co jak coś się zepsuje albo będziemy chcieli to zmienić za rok?",
        "ru": "Страх застрять с нестандартным решением без поддержки — надо подчеркнуть, что панель принадлежит клиенту, а не поставщику.",
        "response": "Panel jest Pana — nie jest zamknięty w cudzym systemie. Zawsze można go rozbudować albo zmienić, bo budujemy go pod Pana procesy, a nie pod cudzy produkt, który sam decyduje, co można, a czego nie.",
        "responseRu": "Подчёркивает владение и гибкость как противовес страху зависимости от поставщика — снимает главное возражение против кастомных решений.",
        "why": {
          "pl": "Podkreślenie własności panelu odwraca typową obawę przed rozwiązaniami 'szytymi na miarę' — brak elastyczności w przyszłości.",
          "ru": "Акцент на владении панелью снимает типичный страх перед 'индивидуальными' решениями — отсутствие гибкости в будущем."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, jak dziś w firmie ogarniacie dane o klientach i leadach: w jednym systemie, czy raczej rozrzucone po Excelach i mailach?",
      "ru": "Открывашка сразу диагностирует степень хаоса в данных открытым вопросом, на который трудно ответить односложным отказом — заставляет клиента задуматься и честно описать ситуацию."
    },
    "crossSell": {
      "pl": "Panel admina często rozrasta się o połączenia z innymi systemami (fakturowanie, magazyn, kalendarz) — tu naturalnie wchodzi apiint jako most do zewnętrznych systemów oraz customtools, gdy potrzebna jest dodatkowa, nietypowa funkcja szyta pod firmę.",
      "ru": "Админ-панель часто разрастается связями с другими системами (выставление счетов, склад, календарь) — здесь естественно подключается apiint как мост к внешним системам и customtools, когда нужна дополнительная нетипичная функция под компанию."
    }
  },
  "booking": {
    "title": {
      "pl": "Systemy rezerwacji",
      "ru": "Системы бронирования"
    },
    "badge": {
      "pl": "Mniej telefonów, mniej dziur w kalendarzu",
      "ru": "Меньше звонков, меньше пустых окон в календаре"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Rezerwacje online z automatycznymi potwierdzeniami i przypomnieniami przed wizytą (SMS/mail) — klient sam wybiera termin z dostępnego kalendarza, a system pilnuje, żeby nie było dwóch osób na ten sam termin.",
          "ru": "Онлайн-бронирование с автоматическими подтверждениями и напоминаниями перед визитом (SMS/почта) — клиент сам выбирает время из доступного календаря, а система следит, чтобы не было двух человек на одно и то же время."
        },
        "bullets": {
          "pl": [
            "Klient rezerwuje termin sam, online, o dowolnej porze",
            "Automatyczne potwierdzenia i przypomnienia SMS/mail przed wizytą",
            "System pilnuje dostępności — brak double-bookingu"
          ],
          "ru": [
            "Клиент бронирует время сам, онлайн, в любое время",
            "Автоматические подтверждения и напоминания SMS/почта перед визитом",
            "Система следит за доступностью — исключает двойное бронирование"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Salony, gabinety, korepetycje, wynajem — wszystko, co sprzedaje się 'na godziny' albo 'na wizyty', gdzie termin jest zasobem, który da się zająć tylko raz.",
          "ru": "Салоны, кабинеты, репетиторство, аренда — всё, что продаётся 'по часам' или 'по визитам', где время — это ресурс, который можно занять только один раз."
        },
        "bullets": {
          "pl": [
            "Salony fryzjerskie, kosmetyczne i gabinety (fizjoterapia, stomatologia itd.)",
            "Korepetytorzy, trenerzy, konsultanci pracujący na umówione godziny",
            "Wynajem sal, sprzętu czy pokoi rozliczany czasowo"
          ],
          "ru": [
            "Парикмахерские, косметические салоны и кабинеты (физиотерапия, стоматология и т.д.)",
            "Репетиторы, тренеры, консультанты, работающие по назначенным часам",
            "Аренда залов, оборудования или помещений с почасовой оплатой"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Umawianie wizyt przez telefon tworzy chaos i nieobecności — recepcja albo właściciel non-stop na telefonie zamiast pracować, zdarza się double-booking, a klienci zapominają o wizycie i po prostu nie przychodzą. Rozpoznajesz to pytaniem: 'Ile razy w tygodniu zdarza się, że ktoś umówiony nie przychodzi?' — jeśli odpowiedź to nie 'prawie nigdy', to jest dokładnie ten problem.",
          "ru": "Запись по телефону создаёт хаос и неявки — ресепшн или владелец постоянно на телефоне вместо работы, случается двойное бронирование, а клиенты забывают о визите и просто не приходят. Распознаётся вопросом: 'Сколько раз в неделю бывает, что записанный человек не приходит?' — если ответ не 'почти никогда', это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Właściciel lub recepcja ciągle na telefonie zamiast obsługiwać klientów na miejscu",
            "Zdarzają się pomyłki w kalendarzu — dwie osoby na ten sam termin",
            "Klienci zapominają o wizycie i nie przychodzą — puste okno w grafiku"
          ],
          "ru": [
            "Владелец или ресепшн постоянно на телефоне вместо обслуживания клиентов на месте",
            "Случаются ошибки в календаре — два человека на одно время",
            "Клиенты забывают о визите и не приходят — пустое окно в графике"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Ile razy w tygodniu zdarza się, że ktoś umówiony po prostu nie przychodzi? Bo to zwykle da się mocno ograniczyć samym przypomnieniem SMS przed wizytą.",
            "Zamiast Pan/Pani non-stop odbiera telefony, żeby umówić wizytę, klient sam wybiera wolny termin online, a system pilnuje, żeby nie zderzyły się dwie osoby.",
            "To nie zabiera Panu telefonu — kto chce, nadal dzwoni. Po prostu dokładamy opcję dla tych, którzy wolą zarezerwować sami, o dowolnej porze."
          ],
          "ru": [
            "Диагностический вопрос, который сразу называет конкретную, легко считаемую боль — неявки; владелец обычно сходу называет число.",
            "Показывает прямую выгоду — освобождение времени владельца/ресепшн от телефона — и сразу объясняет механизм (система следит сама).",
            "Снимает возражение 'а если клиенты привыкли звонить' заранее — подчёркивает, что это дополнение, а не замена."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "System rezerwacji ma sens tylko tam, gdzie firma pracuje na umówione terminy. Nie oferuj go firmom, gdzie ruch jest 'z ulicy' bez umawiania się na godziny, ani bardzo małym firmom z kilkoma wizytami tygodniowo, gdzie właściciel spokojnie ogarnia to sam. Nigdy nie obiecuj konkretnego procentowego spadku liczby nieobecności — to zależy od branży i od tego, czy klienci faktycznie zaczną korzystać z systemu.",
          "ru": "Система бронирования имеет смысл только там, где компания работает по назначенным визитам. Не предлагай её компаниям, где поток 'с улицы' без записи на часы, и очень маленьким компаниям с несколькими визитами в неделю, где владелец спокойно справляется сам. Никогда не обещай конкретный процент снижения неявок — это зависит от отрасли и от того, начнут ли клиенты реально пользоваться системой."
        },
        "bullets": {
          "pl": [
            "Firma nie pracuje na umówione terminy (np. ruch 'z ulicy') → rezerwacje nie mają zastosowania",
            "Bardzo mała liczba wizyt tygodniowo, właściciel spokojnie ogarnia to sam → priorytet niski",
            "Nigdy nie obiecuj konkretnego procentowego spadku liczby nieobecności"
          ],
          "ru": [
            "Компания не работает по назначенным визитам (например, поток 'с улицы') → бронирование неприменимо",
            "Очень мало визитов в неделю, владелец спокойно справляется сам → низкий приоритет",
            "Никогда не обещай конкретный процент снижения числа неявок"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Co tydzień mam z 3-4 osoby, które się umówiły i nie przyszły.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Каждую неделю у меня 3-4 человека, которые записались и не пришли.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Trzeba brać zaliczki i tyle, to załatwia sprawę",
            "Klasyczny sygnał na system rezerwacji z automatycznymi przypomnieniami",
            "Klient ma po prostu złych klientów"
          ],
          "ru": [
            "Нужно просто брать предоплату, и всё решится",
            "Классический сигнал на систему бронирования с автоматическими напоминаниями",
            "У клиента просто плохие клиенты"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego rezerwacje online zmniejszają liczbę telefonów do recepcji?",
          "ru": "Почему онлайн-бронирование уменьшает количество звонков на ресепшн?"
        },
        "answers": {
          "pl": [
            "Bo strona automatycznie odrzuca trudnych klientów",
            "Bo klient sam wybiera dostępny termin z kalendarza zamiast dzwonić i pytać o wolne godziny",
            "Bo telefon przestaje działać po wdrożeniu systemu"
          ],
          "ru": [
            "Потому что сайт автоматически отсеивает сложных клиентов",
            "Потому что клиент сам выбирает доступное время из календаря вместо того, чтобы звонить и спрашивать о свободных часах",
            "Потому что телефон перестаёт работать после внедрения системы"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do gabinetu fizjoterapii. Właścicielka mówi: 'Recepcja non stop na telefonie, a i tak 2-3 razy w tygodniu ktoś nie przychodzi na umówioną wizytę i tracimy ten czas.' Co proponujesz?",
          "ru": "Звонишь в кабинет физиотерапии. Владелица говорит: 'Ресепшн постоянно на телефоне, а всё равно 2-3 раза в неделю кто-то не приходит на назначенный визит, и мы теряем это время.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "System rezerwacji online z automatycznym potwierdzeniem i przypomnieniem SMS przed wizytą, żeby odciążyć recepcję i ograniczyć nieobecności",
            "Więcej reklamy, żeby mieć więcej klientów na zapas",
            "Zatrudnienie drugiej recepcjonistki, żeby ogarniała telefon"
          ],
          "ru": [
            "Систему онлайн-бронирования с автоматическим подтверждением и SMS-напоминанием перед визитом, чтобы разгрузить ресепшн и снизить неявки",
            "Больше рекламы, чтобы иметь клиентов про запас",
            "Нанять вторую сотрудницу на ресепшн, чтобы справляться с телефоном"
          ]
        },
        "correct": 0,
        "explain": {
          "pl": "Dwa problemy naraz — obciążenie recepcji telefonami i nieobecności na wizytach — to dokładnie to, co rozwiązuje system rezerwacji: samoobsługowe umawianie odciąża telefon, a automatyczne przypomnienia ograniczają zapominanie o wizycie.",
          "ru": "Две проблемы сразу — загрузка ресепшн звонками и неявки на визиты — это именно то, что решает система бронирования: самостоятельная запись разгружает телефон, а автоматические напоминания снижают число забытых визитов."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A gwarantujecie, że nikt już nie odwoła albo nie zapomni wizyty?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А вы гарантируете, что никто больше не отменит и не забудет визит?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST odmawia gwarancji zera nieobecności — to niedopuszczalne w tej akademii. Tłumaczy, że przypomnienie SMS/mail realnie redukuje zapominanie, ale ludzie czasem i tak odwołają albo nie przyjdą, to naturalna rzecz. Podkreśla, że celem jest ograniczenie problemu, a nie stuprocentowa gwarancja. Nie używa słowa 'gwarantuję' ani nie podaje wymyślonego procenta.",
          "ru": "Хороший ответ ПРЯМО отказывается гарантировать ноль неявок — это недопустимо в этой академии. Объясняет, что напоминание SMS/почта реально снижает забывчивость, но люди иногда всё равно отменяют или не приходят — это естественно. Подчёркивает, что цель — снизить проблему, а не дать стопроцентную гарантию. Не использует слово 'гарантирую' и не называет выдуманный процент."
        }
      }
    ],
    "objections": [
      {
        "say": "Klienci wolą zadzwonić, nie lubią rezerwować online.",
        "ru": "Типичное сопротивление переменам — владелец переносит свою привычку на клиентов; не спорить, а показать, что это опция, а не замена.",
        "response": "Nikt nie zabiera telefonu — kto chce dzwonić, dalej dzwoni. Rezerwacja online to dodatkowa opcja dla tych, którzy wolą umówić się wieczorem albo w weekend, kiedy i tak nikt nie odbiera.",
        "responseRu": "Не спорит с клиентом о его клиентах, а сразу переопределяет продукт как дополнение, а не замену — снимает напряжение.",
        "why": {
          "pl": "Podkreślenie 'to dodatek, nie zamiana' usuwa strach przed utratą dotychczasowego kanału kontaktu z klientami.",
          "ru": "Акцент 'это дополнение, а не замена' снимает страх потери привычного канала связи с клиентами."
        }
      },
      {
        "say": "Co jak ktoś się nie zna na komputerach i nie umie zarezerwować sam?",
        "ru": "Забота о неудобстве для части клиентов — не спорить, а подтвердить, что это не замена, а дополнение.",
        "response": "Dokładnie dlatego to jest opcja, a nie jedyna droga. Starsi albo mniej techniczni klienci nadal dzwonią jak zawsze, a Pan/Pani odciąża się tylko od tej części klientów, która i tak woli sama wybrać termin.",
        "responseRu": "Обращает возражение в подтверждение — 'именно поэтому это опция' — вместо защиты продукта, соглашается и уточняет масштаб пользы.",
        "why": {
          "pl": "Zgoda z obawą klienta zamiast obrony produktu buduje zaufanie i pokazuje realistyczne podejście.",
          "ru": "Согласие с опасением клиента вместо защиты продукта строит доверие и показывает реалистичный подход."
        }
      },
      {
        "say": "To pewnie skomplikowane we wdrożeniu i będziemy musieli się tego uczyć.",
        "ru": "Страх сложности внедрения — снять коротким, конкретным описанием процесса.",
        "response": "Konfiguracja to Pana usługi i grafik pracowników, potem podpinamy to pod Pana kalendarz, a wiadomości do klientów wysyłają się same. Wdrożenie to dosłownie kilka dni, nie tygodnie nauki.",
        "responseRu": "Конкретизирует процесс в три коротких шага и называет реальный срок — превращает абстрактный страх в понятную, короткую последовательность.",
        "why": {
          "pl": "Konkretny, krótki opis procesu z ramami czasowymi zmniejsza postrzeganą złożoność wdrożenia.",
          "ru": "Конкретное, короткое описание процесса с временными рамками снижает воспринимаемую сложность внедрения."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, ile razy w tygodniu zdarza się u Państwa, że ktoś umówiony na wizytę po prostu nie przychodzi?",
      "ru": "Открывашка сразу бьёт в конкретную, легко представимую боль (неявки), которую владелец сразу подтвердит или опровергнет числом — хороший тест на то, стоит ли продолжать разговор."
    },
    "crossSell": {
      "pl": "System rezerwacji działa najlepiej razem z automatycznymi wiadomościami (automsg) albo integracją z mailem (emailint) do przypomnień, a dane o klientach z rezerwacji świetnie zasilają crmauto, żeby nic nie ginęło po wizycie.",
      "ru": "Система бронирования лучше всего работает вместе с автоматическими сообщениями (automsg) или email-интеграцией (emailint) для напоминаний, а данные о клиентах из бронирования отлично питают crmauto, чтобы ничего не терялось после визита."
    }
  },
  "dashboards": {
    "title": {
      "pl": "Dashboardy",
      "ru": "Дашборды"
    },
    "badge": {
      "pl": "Decyzje na podstawie liczb, nie przeczucia",
      "ru": "Решения на основе цифр, а не интуиции"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Panel z kluczowymi wskaźnikami firmy — leady, sprzedaż, marketing i finanse — zebrane na jednym ekranie zamiast w pięciu różnych systemach. To nie jest narzędzie do zbierania danych, tylko do ich pokazywania w jednym, czytelnym miejscu.",
          "ru": "Панель с ключевыми показателями компании — лиды, продажи, маркетинг и финансы — собранными на одном экране вместо пяти разных систем. Это не инструмент для сбора данных, а инструмент для их показа в одном, понятном месте."
        },
        "bullets": {
          "pl": [
            "Jeden ekran zamiast logowania się do pięciu systemów",
            "Kluczowe wskaźniki: leady, sprzedaż, marketing, finanse",
            "To warstwa wizualna nad danymi, które już gdzieś są zbierane"
          ],
          "ru": [
            "Один экран вместо входа в пять разных систем",
            "Ключевые показатели: лиды, продажи, маркетинг, финансы",
            "Это визуальный слой поверх данных, которые уже где-то собираются"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Właściciele i managerowie, którzy chcą widzieć całość firmy na raz — szczególnie firmy z kilkoma lokalizacjami albo kilkoma źródłami danych, gdzie zebranie pełnego obrazu dziś zajmuje godziny.",
          "ru": "Владельцы и менеджеры, которые хотят видеть всю компанию сразу — особенно компании с несколькими локациями или несколькими источниками данных, где сбор полной картины сегодня занимает часы."
        },
        "bullets": {
          "pl": [
            "Właściciele lub managerowie kilku lokalizacji albo kilku zespołów",
            "Firmy z danymi rozrzuconymi po kilku narzędziach (CRM, reklama, Excel, księgowość)",
            "Osoby podejmujące decyzje, które dziś muszą 'pytać kogoś' o liczby"
          ],
          "ru": [
            "Владельцы или менеджеры нескольких локаций или нескольких команд",
            "Компании с данными, разбросанными по нескольким инструментам (CRM, реклама, Excel, бухгалтерия)",
            "Люди, принимающие решения, которым сегодня приходится 'спрашивать кого-то' о цифрах"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Dane są rozrzucone po pięciu systemach — Excel tu, CRM tam, reklama gdzie indziej — właściciel nie ma jednego miejsca, żeby zobaczyć, jak naprawdę idzie firmie, więc decyzje często opierają się na przeczuciu, a nie na liczbach. Rozpoznajesz to pytaniem: 'Gdzie dziś sprawdza Pan, jak idzie miesiąc — sprzedaż, leady i koszty razem?' — jeśli odpowiedź to 'trzeba by zajrzeć w kilka miejsc', to jest dokładnie ten problem.",
          "ru": "Данные разбросаны по пяти системам — Excel тут, CRM там, реклама ещё где-то — у владельца нет единого места, чтобы увидеть, как на самом деле идут дела в компании, поэтому решения часто основаны на интуиции, а не на цифрах. Распознаётся вопросом: 'Где сегодня вы проверяете, как идёт месяц — продажи, лиды и расходы вместе?' — если ответ 'нужно заглянуть в несколько мест', это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient loguje się do kilku systemów, żeby zebrać pełny obraz",
            "Decyzje podejmowane 'na wyczucie', bo liczby są rozproszone",
            "Nikt nie ma szybkiego przeglądu bieżącego miesiąca bez ręcznego zestawienia"
          ],
          "ru": [
            "Клиент заходит в несколько систем, чтобы собрать полную картину",
            "Решения принимаются 'по ощущению', потому что цифры разрознены",
            "Ни у кого нет быстрого обзора текущего месяца без ручного сведения данных"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Gdzie dziś Pan sprawdza, jak idzie miesiąc — sprzedaż, leady i koszty razem, na jednym widoku, czy trzeba zaglądać w kilka miejsc?",
            "Nie zbieramy nowych danych — bierzemy to, co już Pan gdzieś zbiera, i pokazujemy to na jednym ekranie, żeby nie trzeba było się logować w pięć miejsc.",
            "Chodzi o to, żeby decyzję 'dokładamy budżet czy nie' podejmował Pan, patrząc na liczby na ekranie, a nie na wyczucie po rozmowie z handlowcem."
          ],
          "ru": [
            "Диагностический вопрос, выявляющий степень раздробленности данных клиента — заставляет задуматься, а не просто ответить отказом.",
            "Ключевое разграничение — dashboard не собирает новые данные, только показывает существующие — снимает страх 'ещё одна система для наполнения'.",
            "Показывает конечную выгоду в терминах реального решения (бюджет), а не абстрактного 'красивого экрана' — переводит продукт в язык бизнес-решений."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Dashboard pokazuje dane, których jeszcze nie ma — jeśli firma nie zbiera żadnych danych (nie ma analityki, CRM-u, systemu sprzedaży), najpierw trzeba to poukładać, bo dashboard nie ma z czego czerpać. Nigdy nie obiecuj, że dashboard 'poprawi wyniki' sam z siebie — to narzędzie do patrzenia na dane, decyzje i tak podejmuje człowiek.",
          "ru": "Dashboard показывает данные, которых ещё нет — если компания не собирает никаких данных (нет аналитики, CRM, системы продаж), сначала нужно это наладить, потому что dashboard'у неоткуда брать данные. Никогда не обещай, что dashboard сам по себе 'улучшит результаты' — это инструмент для просмотра данных, решения всё равно принимает человек."
        },
        "bullets": {
          "pl": [
            "Firma nie zbiera jeszcze żadnych danych → najpierw analytics lub crmauto, dashboard nie ma z czego czerpać",
            "Bardzo mała firma z jednym prostym źródłem danych, gdzie jeden Excel w zupełności wystarcza → priorytet niski",
            "Nigdy nie obiecuj, że dashboard sam z siebie poprawi wyniki firmy"
          ],
          "ru": [
            "Компания ещё не собирает данные → сначала analytics или crmauto, dashboard'у неоткуда брать данные",
            "Очень маленькая компания с одним простым источником данных, где вполне хватает одного Excel → низкий приоритет",
            "Никогда не обещай, что dashboard сам по себе улучшит результаты компании"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Sprzedaż mam w jednym systemie, reklamę sprawdzam osobno na koncie Google i Meta, a koszty ma księgowa w Excelu.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Продажи у меня в одной системе, рекламу проверяю отдельно в Google и Meta, а расходы у бухгалтера в Excel.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient ma dobrze poukładane dane i dashboard nie jest potrzebny",
            "Dane są rozproszone po kilku źródłach — klasyczny sygnał na dashboard, który zbierze to na jednym ekranie",
            "Trzeba mu polecić zmianę księgowej"
          ],
          "ru": [
            "У клиента хорошо организованы данные, и dashboard не нужен",
            "Данные разрознены по нескольким источникам — классический сигнал для dashboard, который соберёт это на одном экране",
            "Нужно посоветовать ему сменить бухгалтера"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Czym dashboard różni się od systemów typu analytics czy crmauto?",
          "ru": "Чем dashboard отличается от таких систем, как analytics или crmauto?"
        },
        "answers": {
          "pl": [
            "Dashboard to warstwa wizualna, pokazuje dane zebrane przez inne systemy w jednym miejscu, sam ich nie zbiera",
            "Dashboard zastępuje CRM i analitykę, więc nie trzeba już tamtych systemów",
            "Dashboard to po prostu inna nazwa na to samo co CRM"
          ],
          "ru": [
            "Dashboard — это визуальный слой, показывает данные, собранные другими системами, в одном месте, сам их не собирает",
            "Dashboard заменяет CRM и аналитику, поэтому те системы больше не нужны",
            "Dashboard — это просто другое название того же, что и CRM"
          ]
        },
        "correct": 0
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do właściciela sieci trzech siłowni. Mówi: 'Każda siłownia ma swój Excel z zapisami, reklamę sprawdzam osobno dla każdej lokalizacji, a żeby porównać miesiąc, muszę siedzieć pół dnia i to ręcznie zestawiać.' Co proponujesz?",
          "ru": "Звонишь владельцу сети из трёх фитнес-залов. Он говорит: 'У каждого зала свой Excel с записями, рекламу проверяю отдельно для каждой локации, а чтобы сравнить месяц, приходится полдня сидеть и вручную сводить это.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Dashboard zbierający dane ze wszystkich trzech lokalizacji na jednym ekranie z porównaniem miesiąc do miesiąca",
            "Osobny, niepowiązany system dla każdej siłowni z osobna",
            "Rezygnację z Excela na rzecz jeszcze jednego Excela, tylko ładniejszego"
          ],
          "ru": [
            "Dashboard, собирающий данные всех трёх локаций на одном экране со сравнением месяц к месяцу",
            "Отдельную, не связанную друг с другом систему для каждого зала",
            "Отказ от Excel в пользу ещё одного Excel, только красивее"
          ]
        },
        "correct": 0,
        "explain": {
          "pl": "Kilka lokalizacji plus ręczne zestawianie danych z różnych źródeł to dokładnie przypadek na dashboard — automatyzuje to, co dziś robi się ręcznie przez pół dnia, i daje porównanie między lokalizacjami na jednym ekranie.",
          "ru": "Несколько локаций плюс ручное сведение данных из разных источников — это именно тот случай для dashboard: он автоматизирует то, что сегодня делается вручную полдня, и даёт сравнение локаций на одном экране."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'Czy dashboard sam poprawi mi wyniki firmy?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'Dashboard сам по себе улучшит результаты моей компании?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST tłumaczy, że dashboard sam z siebie niczego nie poprawia — to narzędzie do patrzenia na dane, decyzje i działania i tak podejmuje właściciel lub manager. Wartość jest w tym, że decyzje są szybsze i oparte na faktycznych liczbach, a nie w automatycznej poprawie wyników. Nie obiecuje wzrostu sprzedaży ani żadnego konkretnego efektu biznesowego, nie używa słowa 'gwarantuję'.",
          "ru": "Хороший ответ ПРЯМО объясняет, что dashboard сам по себе ничего не улучшает — это инструмент для просмотра данных, решения и действия всё равно принимает владелец или менеджер. Ценность в том, что решения становятся быстрее и основаны на реальных цифрах, а не в автоматическом улучшении результатов. Не обещает роста продаж или какого-либо конкретного бизнес-эффекта, не использует слово 'гарантирую'."
        }
      }
    ],
    "objections": [
      {
        "say": "I tak wiem, jak idzie mojej firmie, czuję to.",
        "ru": "Владелец опирается на интуицию как источник уверенности — не спорить с интуицией напрямую, а предложить проверить её цифрами.",
        "response": "Wierzę, że Pan to czuje, i pewnie w dużej mierze ma Pan rację. Pytanie, czy to przeczucie da się potwierdzić liczbami w 10 sekund, czy trzeba by usiąść i to sprawdzać. Dashboard nie zastępuje wyczucia, tylko daje mu potwierdzenie na ekranie.",
        "responseRu": "Соглашается с интуицией клиента вместо спора, затем переопределяет продукт как подтверждение интуиции, а не её замену — снижает сопротивление.",
        "why": {
          "pl": "Zgoda z klientem zamiast konfrontacji, a potem przeformułowanie produktu jako potwierdzenia, nie zamiany, obniża opór.",
          "ru": "Согласие с клиентом вместо конфронтации, а затем переформулирование продукта как подтверждения, а не замены, снижает сопротивление."
        }
      },
      {
        "say": "Mamy już Excel z wykresami, po co mi kolejny system?",
        "ru": "Клиент считает, что уже решил проблему — надо выявить скрытую боль (ручное обновление, разрозненность источников).",
        "response": "Excel to dobry start. Pytanie, kto go dziś aktualizuje i ile to zajmuje czasu, i czy są tam też dane z reklamy i CRM-u, czy tylko sprzedaż. Dashboard robi dokładnie to co Excel, tylko aktualizuje się sam i łączy wszystkie źródła w jednym miejscu.",
        "responseRu": "Хвалит текущее решение клиента, а затем задаёт два уточняющих вопроса, которые сами вскрывают ограничения — без прямой критики.",
        "why": {
          "pl": "Pochwała obecnego rozwiązania plus pytania odkrywające jego ograniczenia jest mniej konfrontacyjna niż bezpośrednia krytyka.",
          "ru": "Похвала текущего решения плюс вопросы, вскрывающие его ограничения, менее конфронтационны, чем прямая критика."
        }
      },
      {
        "say": "To brzmi jak coś dla dużych firm, nie dla mnie.",
        "ru": "Клиент считает продукт 'не для его масштаба' — показать, что размер решает не бизнес, а количество источников данных.",
        "response": "To nie jest kwestia wielkości firmy, tylko tego, z ilu miejsc dziś trzeba zbierać dane, żeby zobaczyć całość. Nawet mała firma z reklamą, sprzedażą i kosztami w trzech różnych miejscach zyskuje na jednym ekranie.",
        "responseRu": "Меняет критерий применимости с 'размера компании' на 'число источников данных' — конкретный, проверяемый критерий вместо абстрактного статуса.",
        "why": {
          "pl": "Zmiana kryterium z 'wielkości firmy' na 'liczbę źródeł danych' jest konkretnym, sprawdzalnym argumentem zamiast abstrakcyjnego statusu.",
          "ru": "Смена критерия с 'размера компании' на 'число источников данных' — конкретный, проверяемый аргумент вместо абстрактного статуса."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — chciałem zapytać, gdzie dziś sprawdza Pan, jak idzie miesiąc: sprzedaż, leady i koszty razem, na jednym widoku, czy trzeba zaglądać w kilka różnych miejsc?",
      "ru": "Открывашка диагностирует степень раздробленности данных тем же открытым вопросом, что и в шаге phone — вынуждает клиента задуматься и честно ответить, а не просто отказаться."
    },
    "crossSell": {
      "pl": "Dashboard to ekran, który pokazuje dane zbierane przez inne systemy — nie działa w próżni, więc najlepiej sprzedaje się razem z analytics, crmauto i aireports: to one zbierają dane, a dashboard je pokazuje w jednym miejscu.",
      "ru": "Dashboard — это экран, показывающий данные, собираемые другими системами — он не работает в вакууме, поэтому лучше всего продаётся вместе с analytics, crmauto и aireports: именно они собирают данные, а dashboard показывает их в одном месте."
    }
  },
  "emailint": {
    "title": {
      "pl": "Integracje z e-mail",
      "ru": "Интеграции с email"
    },
    "badge": {
      "pl": "Baza klientów, która sama się przypomina",
      "ru": "База клиентов, которая сама напоминает о себе"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Automatyczne maile, które wysyłają się same, kiedy trzeba: powitalny do nowego klienta, potwierdzenie zamówienia, oferta do kogoś, kto pytał i nie kupił, albo regularny newsletter do całej bazy. Maile wychodzą po zdarzeniu (np. ktoś kupił, ktoś zapisał się na listę) albo według harmonogramu — bez tego, żeby ktoś w firmie musiał pamiętać i klikać 'wyślij'.",
          "ru": "Автоматические письма, которые отправляются сами, когда нужно: приветственное новому клиенту, подтверждение заказа, предложение тому, кто спрашивал и не купил, или регулярная рассылка по всей базе. Письма уходят по событию (например, кто-то купил, кто-то подписался) или по расписанию — без того, чтобы кто-то в компании должен был помнить и нажимать 'отправить'."
        },
        "bullets": {
          "pl": [
            "Automatyczne maile: powitania, oferty, potwierdzenia, newslettery",
            "Wysyłka wyzwalana zdarzeniem (np. nowy klient) albo zaplanowana (np. co miesiąc)",
            "Wymaga bazy kontaktów lub CRM, z którego maile czerpią dane"
          ],
          "ru": [
            "Автоматические письма: приветствия, предложения, подтверждения, рассылки",
            "Отправка запускается событием (например, новый клиент) или идёт по расписанию (например, раз в месяц)",
            "Требует базы контактов или CRM, из которой письма берут данные"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy, które budują relację z bazą klientów, a nie sprzedają raz i zapominają. Mają listę kontaktów — klientów, leadów, osób, które kiedyś pytały — ale ta lista leży i nikt do niej nie pisze, bo nie ma na to czasu ani systemu. To usługa dla kogoś, kto chce, żeby kontakt z bazą działał regularnie, a nie tylko wtedy, kiedy ktoś sobie o tym przypomni.",
          "ru": "Компании, которые строят отношения с базой клиентов, а не продают один раз и забывают. У них есть список контактов — клиентов, лидов, людей, которые когда-то спрашивали — но этот список лежит без дела, потому что нет ни времени, ни системы. Это услуга для тех, кто хочет, чтобы контакт с базой работал регулярно, а не только тогда, когда кто-то вспомнит об этом сам."
        },
        "bullets": {
          "pl": [
            "Firmy z bazą klientów w CRM albo Excelu, do której nikt regularnie nie pisze",
            "Firmy sprzedające powtarzalnie, gdzie warto przypominać się starym klientom",
            "Firmy, które chcą ujednolicić komunikację (powitania, potwierdzenia) zamiast pisać to ręcznie za każdym razem"
          ],
          "ru": [
            "Компании с базой клиентов в CRM или Excel, которой никто регулярно не пишет",
            "Компании с повторными продажами, где стоит напоминать о себе старым клиентам",
            "Компании, которые хотят унифицировать коммуникацию (приветствия, подтверждения) вместо ручного написания каждый раз"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację 'baza kontaktów leży i nie pracuje' — firma ma listę setek klientów albo leadów w Excelu czy CRM i nigdy do nich nie wraca, więc traci powtórną sprzedaż i poleca się tylko z pamięci. Rozpoznajesz to pytaniem: 'Co się dzieje z kontaktem do klienta, jak już raz coś u Pana kupi albo zapyta?' — jeśli odpowiedź brzmi 'no nic, leży w bazie', to jest dokładnie ten problem.",
          "ru": "Решает ситуацию 'база контактов лежит и не работает' — у компании список из сотен клиентов или лидов в Excel или CRM, и она никогда к ним не возвращается, теряя повторные продажи и полагаясь только на память. Распознаётся вопросом: 'Что происходит с контактом клиента после того, как он один раз что-то купил или спросил?' — если ответ 'да ничего, просто лежит в базе', это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Klient ma listę setek klientów lub leadów, ale nigdy do nich nie wraca",
            "Wysyłki robi się ręcznie, nieregularnie albo wcale",
            "Firma traci powtórną sprzedaż i poleca się tylko z pamięci, nie systemowo"
          ],
          "ru": [
            "У клиента список из сотен клиентов или лидов, но он никогда к ним не возвращается",
            "Рассылки делаются вручную, нерегулярно или вообще не делаются",
            "Компания теряет повторные продажи и полагается только на память, а не на систему"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Ile Pan ma dzisiaj kontaktów klientów, do których nikt od miesięcy nie napisał, mimo że kiedyś coś u Pana kupili albo o coś pytali?",
            "Nie chodzi o to, żeby wysyłać więcej reklam, tylko o to, żeby baza, którą Pan już ma, sama się przypominała klientom — bez tego, że ktoś musi codziennie o tym pamiętać.",
            "To nie są maile masowe do przypadkowych ludzi — to wiadomości do osób, które już Pana znają: klientów, którzy kupili, albo tych, co pytali i się zawahali."
          ],
          "ru": [
            "Диагностический вопрос, который вскрывает размер заброшенного актива — почти у каждого владельца есть такая 'мёртвая' база, о размере которой он даже не задумывался.",
            "Переформулирует услугу: не 'больше рекламы', а 'заставить уже существующий актив работать самостоятельно' — снимает страх дополнительных расходов на рекламу.",
            "Превентивно снимает возражение про спам: подчёркивает, что это не холодная рассылка незнакомцам, а письма людям, которые уже в отношениях с компанией."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Automatyzacja maili wymaga bazy kontaktów, na której się opiera — bez tego nie ma do kogo wysyłać. Nie oferuj jej firmom, które nie mają jeszcze żadnej listy klientów ani leadów. Sprawdź też, czy klient w ogóle ma prawo pisać do tych ludzi mailowo (zgody), bo inaczej trzeba to najpierw uporządkować. Nigdy nie obiecuj konkretnego wskaźnika otwieralności ani wzrostu sprzedaży z maili.",
          "ru": "Автоматизация писем требует базы контактов, на которую она опирается — без этого некому отправлять. Не предлагай её компаниям, у которых ещё нет никакого списка клиентов или лидов. Также проверь, есть ли у клиента вообще право писать этим людям на email (согласия), иначе сначала нужно навести в этом порядок. Никогда не обещай конкретный показатель открываемости или роста продаж от писем."
        },
        "bullets": {
          "pl": [
            "Firma nie ma jeszcze żadnej bazy kontaktów ani CRM → najpierw leadforms/crmauto, żeby było co zasilać automatyzacją",
            "Firma nie ma zgód na wysyłkę maili marketingowych do swojej listy → trzeba to najpierw wyjaśnić i uporządkować",
            "Nigdy nie obiecuj konkretnego wskaźnika otwieralności, kliknięć czy sprzedaży z kampanii mailowej"
          ],
          "ru": [
            "У компании ещё нет базы контактов или CRM → сначала leadforms/crmauto, чтобы было чем питать автоматизацию",
            "У компании нет согласий на маркетинговую рассылку по своему списку → сначала нужно это выяснить и упорядочить",
            "Никогда не обещай конкретный показатель открываемости, кликов или продаж от email-кампании"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Mamy listę 800 klientów w Excelu, ale nikt do nich nie pisał od roku.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'У нас список из 800 клиентов в Excel, но никто им не писал уже год.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient po prostu nie ma czasu i nic się z tym nie da zrobić",
            "Klasyczny sygnał do integracji z e-mail — baza istnieje, ale nie pracuje",
            "Trzeba mu zaproponować kupno nowej bazy kontaktów"
          ],
          "ru": [
            "У клиента просто нет времени, и с этим ничего не поделаешь",
            "Классический сигнал для интеграции с email — база существует, но не работает",
            "Нужно предложить купить новую базу контактов"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego integracja z e-mail nie ma sensu dla firmy, która nie ma jeszcze żadnej listy klientów ani leadów?",
          "ru": "Почему интеграция с email не имеет смысла для компании, у которой ещё нет никакого списка клиентов или лидов?"
        },
        "answers": {
          "pl": [
            "Bo automatyzacja maili zawsze jest za droga na start",
            "Bo automatyzacja opiera się na istniejącej bazie kontaktów, a bez niej nie ma do kogo wysyłać",
            "Bo maile działają tylko w sklepach internetowych"
          ],
          "ru": [
            "Потому что автоматизация писем всегда слишком дорога для старта",
            "Потому что автоматизация опирается на существующую базу контактов, а без неё некому отправлять",
            "Потому что письма работают только в интернет-магазинах"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do salonu meblowego. Właścicielka mówi: 'Mamy klientów z kilku lat w systemie, ale kontaktujemy się z nimi tylko, jak sami do nas zadzwonią.' Co proponujesz?",
          "ru": "Звонишь в мебельный салон. Владелица говорит: 'У нас клиенты за несколько лет в системе, но мы контактируем с ними только когда они сами звонят.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz kupno reklamy, żeby przyciągnąć nowych klientów zamiast starych",
            "Proponujesz automatyzację maili do istniejącej bazy — regularne przypomnienia, oferty i newsletter, żeby baza sama pracowała",
            "Mówisz, że w branży meblowej maile i tak nie działają"
          ],
          "ru": [
            "Предлагаешь купить рекламу, чтобы привлечь новых клиентов вместо старых",
            "Предлагаешь автоматизацию писем по существующей базе — регулярные напоминания, предложения и рассылку, чтобы база работала сама",
            "Говоришь, что в мебельной индустрии письма всё равно не работают"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient ma dużą, nieużywaną bazę kontaktów — dokładnie ten przypadek, w którym automatyzacja maili odzyskuje wartość z czegoś, co już istnieje, zamiast płacić za nowych klientów od zera.",
          "ru": "У клиента большая неиспользуемая база контактов — именно тот случай, когда автоматизация писем возвращает ценность из того, что уже есть, вместо оплаты за новых клиентов с нуля."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A gwarantujecie, że dzięki tym mailom sprzedaż nam wzrośnie?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А вы гарантируете, что благодаря этим письмам у нас вырастут продажи?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST odmawia gwarancji wzrostu sprzedaży czy konkretnej liczby — to niedopuszczalne w tej akademii. Tłumaczy, że automatyzacja maili daje regularny, systemowy kontakt z bazą zamiast przypadkowego, i że to zwiększa szansę na powtórną sprzedaż, ale nie jest magicznym mechanizmem z gwarantowanym wynikiem. Może wspomnieć, że efekt zależy od jakości bazy i tego, co się w mailach proponuje. Nie używa słowa 'gwarantuję' i nie podaje wymyślonej liczby czy procenta.",
          "ru": "Хороший ответ ПРЯМО отказывается от гарантии роста продаж или конкретного числа — это недопустимо в этой академии. Объясняет, что автоматизация писем даёт регулярный, системный контакт с базой вместо случайного, и это повышает шанс повторной продажи, но не является волшебным механизмом с гарантированным результатом. Может упомянуть, что эффект зависит от качества базы и содержания предложений в письмах. Не использует слово 'гарантирую' и не называет выдуманное число или процент."
        }
      }
    ],
    "objections": [
      {
        "say": "Ludzie i tak nie czytają maili, to strata czasu.",
        "ru": "Классическое обобщение — клиент судит по своей личной скрытой рассылке или спаму, а не по релевантным письмам существующим клиентам. Нужно разграничить эти два случая.",
        "response": "Chodzi o co innego niż masowa wysyłka do obcych ludzi — to maile do Pana własnych klientów, którzy już Pana znają, więc otwieralność jest zupełnie inna niż w przypadku spamu. Do tego można to dopasować — segmentować bazę, żeby klient dostawał tylko to, co go faktycznie interesuje.",
        "responseRu": "Разграничивает 'массовую рассылку незнакомцам' и 'письма существующим клиентам' — это меняет весь контекст возражения. Дополнительно предлагает сегментацию как способ повысить релевантность.",
        "why": {
          "pl": "Rozróżnienie 'obcy odbiorcy' vs 'Pana klienci' zmienia całe postrzeganie ryzyka spamu i czyni przykład namacalnym.",
          "ru": "Разграничение 'чужие получатели' против 'ваши клиенты' меняет всё восприятие риска спама и делает пример осязаемым."
        }
      },
      {
        "say": "Nie chcę wyglądać jak spam, klienci się obrażą.",
        "ru": "Клиент боится репутационного риска — это реальный и обоснованный страх, который нельзя просто отмахнуть, а нужно показать конкретные механизмы защиты (частота, релевантность, отписka).",
        "response": "Rozumiem obawę — dlatego nie robimy tego jako jedną masową wysyłkę bez ładu i składu. Ustalamy, jak często maile idą, do kogo dokładnie, i zawsze jest łatwa opcja wypisania się. To ma wyglądać jak profesjonalny kontakt od firmy, którą klient zna, a nie jak przypadkowa reklama.",
        "responseRu": "Не отрицает риск, а показывает конкретные механизмы контроля (частота, сегментация, отписка), которые превращают абстрактный страх в управляемый процесс.",
        "why": {
          "pl": "Pokazanie konkretnych mechanizmów kontroli (częstotliwość, wypisanie się) zamienia abstrakcyjny lęk w zarządzalny proces.",
          "ru": "Показ конкретных механизмов контроля (частота, отписка) превращает абстрактный страх в управляемый процесс."
        }
      },
      {
        "say": "Mamy newsletter, wysyłamy go czasem ręcznie, jak ktoś pamięta.",
        "ru": "Клиент считает, что у него уже 'есть' эта услуга — нужно показать разницу между ручной, нерегулярной рассылкой и системной автоматизацией с триггерными письмами.",
        "response": "To dobrze, że coś już Pan robi — ale 'jak ktoś pamięta' to właśnie jest problem, bo wtedy zdarza się, że przez dwa miesiące nic nie idzie. Automatyzacja robi to regularnie bez pilnowania, a do tego dochodzą maile, o których ręcznie się zapomina — powitalny czy potwierdzenie — bo one muszą iść od razu, nie 'jak ktoś znajdzie chwilę'.",
        "responseRu": "Признаёт существующие усилия клиента, но точечно указывает на слабое место — зависимость от человеческой памяти, и показывает конкретный тип писем (триггерные), которые ручной процесс физически не покрывает.",
        "why": {
          "pl": "Docenienie tego, co klient już robi, przed pokazaniem luki, obniża opór — a przykład maili wyzwalanych zdarzeniem pokazuje coś, czego ręcznie się nie da dobrze zrobić.",
          "ru": "Признание того, что клиент уже делает, перед показом пробела снижает сопротивление — а пример триггерных писем показывает то, что вручную сделать хорошо невозможно."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — mam pytanie: klienci, którzy już coś u Pana kupili, dostają jakąś wiadomość później, czy to zależy od tego, czy akurat ktoś pamięta, żeby do nich napisać?",
      "ru": "Открывашка сразу нацелена на выявление 'мёртвой' базы — большинство владельцев признают, что контакт с прошлыми клиентами держится только на чьей-то памяти, а не на системе. Используй с клиентами, у которых точно есть повторные продажи или база из прошлых сделок."
    },
    "crossSell": {
      "pl": "Automatyzacja maili działa najlepiej, kiedy jest skąd brać dane — dlatego naturalnie łączy się z crmauto, który porządkuje i wyzwala te scenariusze z jednego miejsca, oraz z aifollowup, który dogląda kontaktu z leadami, zanim jeszcze trafią do stałej bazy klientów.",
      "ru": "Автоматизация писем работает лучше всего, когда есть откуда брать данные — поэтому она естественно сочетается с crmauto, который упорядочивает и запускает эти сценарии из одного места, и с aifollowup, который ведёт контакт с лидами ещё до того, как они попадут в постоянную базу клиентов."
    }
  },
  "messengers": {
    "title": {
      "pl": "Integracje z komunikatorami (Telegram / WhatsApp)",
      "ru": "Интеграции с мессенджерами (Telegram / WhatsApp)"
    },
    "badge": {
      "pl": "Lead nie czeka 6 godzin na odpowiedź",
      "ru": "Лид не ждёт ответа 6 часов"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Nowe zapytania, alerty i raporty trafiają od razu na Telegram albo WhatsApp — zamiast albo obok maila. Klient wypełnia formularz na stronie, ktoś z zespołu od razu dostaje powiadomienie na komunikatorze, który i tak ma cały czas otwarty na telefonie. Wpina się w istniejące źródła leadów: formularz na stronie, reklamę, CRM.",
          "ru": "Новые заявки, оповещения и отчёты сразу попадают в Telegram или WhatsApp — вместо email или вместе с ним. Клиент заполняет форму на сайте, кто-то из команды сразу получает уведомление в мессенджере, который и так постоянно открыт на телефоне. Подключается к существующим источникам лидов: форме на сайте, рекламе, CRM."
        },
        "bullets": {
          "pl": [
            "Powiadomienia o nowych leadach, zapytaniach i raportach trafiają na Telegram lub WhatsApp",
            "Może działać zamiast maila albo równolegle z nim",
            "Wpięte w istniejące źródła leadów: formularz, reklamę, CRM"
          ],
          "ru": [
            "Уведомления о новых лидах, заявках и отчётах приходят в Telegram или WhatsApp",
            "Может работать вместо email или параллельно с ним",
            "Подключается к существующим источникам лидов: форме, рекламе, CRM"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Zespoły, które w ciągu dnia żyją w komunikatorze, a nie w skrzynce mailowej — handlowcy w terenie, ekipy serwisowe, małe firmy usługowe, gdzie telefon jest zawsze pod ręką, a komputer nie. To usługa dla firm, gdzie liczy się szybka reakcja na nowe zapytanie i gdzie kilka osób powinno widzieć nowy lead od razu, a nie tylko ta jedna, która akurat sprawdza maila.",
          "ru": "Команды, которые в течение дня живут в мессенджере, а не в почтовом ящике — выездные продавцы, сервисные бригады, небольшие сервисные компании, где телефон всегда под рукой, а компьютер нет. Это услуга для компаний, где важна быстрая реакция на новую заявку и где несколько человек должны видеть новый лид сразу, а не только тот один, кто как раз проверяет почту."
        },
        "bullets": {
          "pl": [
            "Zespoły, które w ciągu dnia patrzą w telefon i komunikator, a nie w skrzynkę mailową",
            "Firmy, gdzie liczy się szybka reakcja na nowe zapytanie (usługi, sprzedaż, nieruchomości)",
            "Firmy z kilkoma osobami odpowiedzialnymi za leady, które mają je widzieć razem, na bieżąco"
          ],
          "ru": [
            "Команды, которые в течение дня смотрят в телефон и мессенджер, а не в почтовый ящик",
            "Компании, где важна быстрая реакция на новую заявку (услуги, продажи, недвижимость)",
            "Компании с несколькими людьми, отвечающими за лиды, которые должны видеть их вместе, в реальном времени"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której zapytanie przychodzi na mail i zostaje zauważone dopiero po kilku godzinach — a klient w tym czasie już zadzwonił do konkurencji. Rozpoznajesz to pytaniem: 'Jak szybko ktoś u Pana odpowiada na nowe zapytanie, jak przyjdzie wieczorem albo w weekend?' — jeśli odpowiedź to 'no, jak ktoś zauważy' albo 'następnego dnia', to jest dokładnie ten problem.",
          "ru": "Решает ситуацию, когда заявка приходит на почту и её замечают только через несколько часов — а клиент за это время уже позвонил конкуренту. Распознаётся вопросом: 'Как быстро у вас кто-то отвечает на новую заявку, если она приходит вечером или в выходные?' — если ответ 'ну, когда кто-то заметит' или 'на следующий день', это именно та проблема."
        },
        "bullets": {
          "pl": [
            "Zapytania trafiają na mail, który ktoś sprawdza raz czy dwa razy dziennie",
            "Klient traci leady, bo konkurencja odpowiada szybciej",
            "Nikt w firmie nie wie od razu, że przyszło nowe zapytanie — dowiaduje się z opóźnieniem"
          ],
          "ru": [
            "Заявки приходят на почту, которую кто-то проверяет раз-два в день",
            "Клиент теряет лиды, потому что конкуренты отвечают быстрее",
            "Никто в компании сразу не знает о новой заявке — узнаёт с опозданием"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Jak szybko u Pana ktoś odpowiada na nowe zapytanie, jak przyjdzie wieczorem albo w weekend, kiedy nikt nie siedzi przy komputerze?",
            "Klient, który dzisiaj pyta o ofertę, zwykle pyta w kilku miejscach naraz — wygrywa nie ten, kto ma lepszą ofertę, tylko ten, kto pierwszy odpisze.",
            "To nie trafia na prywatny telefon jednej osoby — tylko na wspólny kanał firmowy, więc widzi to cały zespół, a nie tylko ten, kto akurat jest online."
          ],
          "ru": [
            "Диагностический вопрос, вскрывающий реальное время реакции вне рабочих часов — момент, о котором владелец обычно не задумывался конкретными цифрами.",
            "Ключевой тезис услуги — скорость ответа важнее качества предложения в конкурентной ситуации. Используй как аргумент срочности, не как страшилку.",
            "Превентивно снимает главное возражение — страх, что это личный телефон сотрудника. Подчёркивает командный, а не персональный характер канала."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Trasowanie leadów do komunikatora ma sens tylko wtedy, kiedy w ogóle jest co trasować — firma musi mieć jakieś źródło nowych zapytań: stronę, formularz, reklamę. Bez tego nie ma czego przyspieszać. Uważaj też, jeśli problemem klienta nie jest szybkość powiadomienia, tylko brak ludzi do odpowiadania — wtedy ta usługa przyspieszy wiadomość, ale nie rozwiąże braku rąk do pracy. Nigdy nie obiecuj konkretnego wzrostu sprzedaży, tylko szybszy czas reakcji.",
          "ru": "Маршрутизация лидов в мессенджер имеет смысл только тогда, когда вообще есть что маршрутизировать — у компании должен быть источник новых заявок: сайт, форма, реклама. Без этого нечего ускорять. Также будь внимателен, если проблема клиента не в скорости уведомления, а в нехватке людей для ответа — тогда услуга ускорит сообщение, но не решит нехватку рук. Никогда не обещай конкретный рост продаж, только более быстрое время реакции."
        },
        "bullets": {
          "pl": [
            "Firma nie ma żadnego źródła nowych zapytań (strony, reklamy, formularza) → najpierw leadforms lub reklama, potem trasowanie",
            "W firmie nikt nie ma czasu w ogóle odpowiadać na leady → to nie rozwiąże braku ludzi, tylko przyspieszy powiadomienie",
            "Nigdy nie obiecuj konkretnego wzrostu sprzedaży — tylko szybszy czas reakcji na zapytanie"
          ],
          "ru": [
            "У компании нет источника новых заявок (сайта, рекламы, формы) → сначала leadforms или реклама, потом маршрутизация",
            "В компании вообще некому отвечать на лиды → это не решит нехватку людей, только ускорит уведомление",
            "Никогда не обещай конкретный рост продаж — только более быстрое время реакции на заявку"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient mówi: 'Zapytania przychodzą na mail, sprawdzamy go rano i wieczorem.' Co to sygnalizuje?",
          "ru": "Клиент говорит: 'Заявки приходят на почту, мы проверяем её утром и вечером.' О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient dobrze radzi sobie z obsługą zapytań, nic nie trzeba zmieniać",
            "Duże opóźnienie w reakcji na nowe zapytania — klasyczny sygnał do integracji z komunikatorem",
            "Trzeba mu zaproponować więcej reklamy, żeby było więcej zapytań"
          ],
          "ru": [
            "Клиент хорошо справляется с обработкой заявок, менять ничего не нужно",
            "Большая задержка в реакции на новые заявки — классический сигнал для интеграции с мессенджером",
            "Нужно предложить больше рекламы, чтобы было больше заявок"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego integracja z komunikatorem nie ma sensu dla firmy, która nie ma żadnego źródła nowych zapytań?",
          "ru": "Почему интеграция с мессенджером не имеет смысла для компании, у которой нет источника новых заявок?"
        },
        "answers": {
          "pl": [
            "Bo Telegram i WhatsApp są za drogie we wdrożeniu",
            "Bo usługa trasuje istniejące zapytania szybciej, a bez źródła zapytań nie ma czego trasować",
            "Bo klienci nie lubią pisać przez komunikatory"
          ],
          "ru": [
            "Потому что Telegram и WhatsApp слишком дороги во внедрении",
            "Потому что услуга ускоряет маршрутизацию существующих заявок, а без источника заявок нечего маршрутизировать",
            "Потому что клиенты не любят писать через мессенджеры"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do warsztatu samochodowego. Właściciel mówi: 'Klienci piszą przez formularz na stronie, ale często odpowiadamy dopiero następnego dnia, bo mechanicy nie siedzą przy komputerze.' Co proponujesz?",
          "ru": "Звонишь в автосервис. Владелец говорит: 'Клиенты пишут через форму на сайте, но часто отвечаем только на следующий день, потому что механики не сидят за компьютером.' Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Proponujesz zamknięcie formularza na stronie, bo i tak nikt na niego nie odpowiada",
            "Proponujesz trasowanie zapytań z formularza na wspólny kanał Telegram lub WhatsApp, żeby zespół widział je od razu na telefonie, bez komputera",
            "Mówisz, że warsztaty samochodowe nie powinny w ogóle zbierać zapytań przez internet"
          ],
          "ru": [
            "Предлагаешь закрыть форму на сайте, раз всё равно никто на неё не отвечает",
            "Предлагаешь маршрутизацию заявок с формы на общий канал Telegram или WhatsApp, чтобы команда видела их сразу на телефоне, без компьютера",
            "Говоришь, что автосервисам вообще не стоит собирать заявки через интернет"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Klient ma źródło zapytań, ale zespół fizycznie nie siedzi przy komputerze — dokładnie ten przypadek, w którym trasowanie na komunikator, który mechanicy i tak mają w kieszeni, rozwiązuje realny problem opóźnienia.",
          "ru": "У клиента есть источник заявок, но команда физически не сидит за компьютером — именно тот случай, когда маршрутизация в мессенджер, который у механиков и так в кармане, решает реальную проблему задержки."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient pyta: 'A gwarantujecie, że dzięki temu zamkniemy więcej sprzedaży?' Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент спрашивает: 'А вы гарантируете, что благодаря этому мы закроем больше продаж?' Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST odmawia gwarancji wzrostu sprzedaży — to niedopuszczalne w tej akademii. Tłumaczy, że usługa gwarantuje coś innego i konkretnego: szybsze dotarcie informacji o nowym zapytaniu do zespołu, a to, czy dana rozmowa zamieni się w sprzedaż, zależy od wielu innych czynników (oferty, ceny, negocjacji). Może podkreślić, że szybsza reakcja statystycznie zwiększa szansę, ale nie jest gwarancją wyniku. Nie używa słowa 'gwarantuję' przy sprzedaży ani nie podaje wymyślonej liczby.",
          "ru": "Хороший ответ ПРЯМО отказывается от гарантии роста продаж — это недопустимо в этой академии. Объясняет, что услуга гарантирует другое, конкретное: более быстрое получение информации о новой заявке командой, а превратится ли конкретный разговор в продажу, зависит от многих других факторов (предложения, цены, переговоров). Может подчеркнуть, что более быстрая реакция статистически повышает шанс, но не является гарантией результата. Не использует слово 'гарантирую' применительно к продажам и не называет выдуманное число."
        }
      }
    ],
    "objections": [
      {
        "say": "Nie chcemy być non-stop dostępni na prywatnym telefonie.",
        "ru": "Реальный и обоснованный страх — сотрудники не хотят смешивать личный телефон с рабочими уведомлениями 24/7. Нужно чётко развести личный номер и рабочий канал.",
        "response": "To akurat nie trafia na czyjś prywatny numer — budujemy to na wspólnym kanale albo firmowym bocie, więc widzi to cały zespół, a nie jedna osoba na swoim telefonie. Do tego można ustalić godziny, w których powiadomienia w ogóle przychodzą, więc to Pan decyduje o zasadach, a nie komunikator decyduje za Pana.",
        "responseRu": "Прямо разграничивает личный номер и общий бизнес-канал/бота — снимает главный страх. Дополнительно предлагает контроль над часами уведомлений, отдавая клиенту решение.",
        "why": {
          "pl": "Rozróżnienie 'prywatny telefon' vs 'wspólny kanał firmowy' bezpośrednio adresuje sedno obawy, a opcja ustawienia godzin daje klientowi poczucie kontroli.",
          "ru": "Разграничение 'личный телефон' против 'общий бизнес-канал' напрямую снимает суть страха, а опция настройки часов даёт клиенту ощущение контроля."
        }
      },
      {
        "say": "Mamy już maila, po co nam jeszcze coś.",
        "ru": "Клиент не видит разницы между 'есть канал связи' и 'канал связи, который реально проверяют вовремя' — нужно показать, что мессенджер дополняет, а не дублирует почту.",
        "response": "Mail zostaje, nic mu nie zabieramy — tylko dokładamy kanał, który ktoś faktycznie sprawdza na bieżąco. Chodzi konkretnie o nowe, pilne zapytania, a nie o całą korespondencję — to ma być alert, nie kolejna skrzynka do przeglądania.",
        "responseRu": "Успокаивает, что email не заменяется, а дополняется — снижает ощущение избыточности. Уточняет узкую роль мессенджера (только срочные новые заявки), что делает предложение конкретным, а не абстрактным 'ещё одним каналом'.",
        "why": {
          "pl": "Zapewnienie, że mail zostaje, obniża opór przed zmianą, a zawężenie roli komunikatora do 'alertów o nowych zapytaniach' czyni propozycję konkretną, nie ogólnikową.",
          "ru": "Заверение, что email остаётся, снижает сопротивление изменениям, а сужение роли мессенджера до 'оповещений о новых заявках' делает предложение конкретным, а не общим."
        }
      },
      {
        "say": "A co jak ktoś odejdzie z firmy — czy nie stracimy dostępu do tych leadów razem z jego WhatsAppem?",
        "ru": "Обоснованное опасение о собственности данных — важно чётко объяснить, что канал строится на бизнес-аккаунте/группе, а не на личном номере сотрудника.",
        "response": "Nie, dlatego budujemy to na firmowym kanale albo bocie, a nie na prywatnym numerze konkretnej osoby — to jest własność firmy, nie pracownika. Jak ktoś odejdzie, dostęp traci on, a nie firma.",
        "responseRu": "Прямо и коротко отвечает на страх потери данных — подчёркивает архитектурное решение (бизнес-канал, а не личный номер), которое делает актив собственностью компании.",
        "why": {
          "pl": "Krótka, konkretna odpowiedź na temat własności kanału rozwiewa obawę bez potrzeby dalszego przekonywania.",
          "ru": "Короткий, конкретный ответ о собственности канала снимает опасение без необходимости дальнейшего убеждения."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — jak szybko u Pana ktoś odpowiada na nowe zapytanie, jak przyjdzie wieczorem albo w weekend, kiedy nikt nie siedzi przy komputerze?",
      "ru": "Открывашка сразу вскрывает разрыв между временем поступления заявки и временем реакции — большинство владельцев признают задержку вне рабочих часов. Используй с клиентами, у которых точно есть источник входящих заявок (сайт, реклама, форма)."
    },
    "crossSell": {
      "pl": "Trasowanie do komunikatora ma sens tylko, kiedy jest skąd brać nowe leady, więc naturalnie łączy się z leadforms i aiqualify jako źródłem zapytań, a z crmauto tworzy pełny łańcuch: lead przychodzi, zespół dostaje alert od razu, a dane i tak trafiają do systemu.",
      "ru": "Маршрутизация в мессенджер имеет смысл только тогда, когда есть откуда брать новые лиды, поэтому она естественно сочетается с leadforms и aiqualify как источником заявок, а вместе с crmauto образует полную цепочку: лид приходит, команда получает оповещение сразу, а данные всё равно попадают в систему."
    }
  },
  "customtools": {
    "title": {
      "pl": "Dedykowane narzędzia (Custom Tools)",
      "ru": "Индивидуальные инструменты (Custom Tools)"
    },
    "badge": {
      "pl": "Gdy nic gotowego nie pasuje",
      "ru": "Когда ничего готового не подходит"
    },
    "steps": [
      {
        "key": "what",
        "title": {
          "pl": "Co to jest",
          "ru": "Что это"
        },
        "body": {
          "pl": "Dedykowane aplikacje i narzędzia budowane od zera pod konkretną firmę — od generatorów ofert po systemy wewnętrzne — kiedy żadne gotowe rozwiązanie nie pasuje do tego, jak firma faktycznie pracuje. Zaczyna się od analizy tego, czego naprawdę potrzeba, potem robi się prototyp, wdrożenie, a narzędzie dalej się rozwija razem z firmą.",
          "ru": "Индивидуальные приложения и инструменты, создаваемые с нуля под конкретную компанию — от генераторов предложений до внутренних систем — когда ни одно готовое решение не подходит под то, как компания реально работает. Начинается с анализа реальной потребности, затем делается прототип, внедрение, а инструмент дальше развивается вместе с компанией."
        },
        "bullets": {
          "pl": [
            "Dedykowane aplikacje i narzędzia budowane od zera pod konkretną firmę",
            "Od generatorów ofert po wewnętrzne systemy zarządzania",
            "Proces: analiza potrzeb → prototyp → wdrożenie → dalszy rozwój"
          ],
          "ru": [
            "Индивидуальные приложения и инструменты, создаваемые с нуля под конкретную компанию",
            "От генераторов предложений до внутренних систем управления",
            "Процесс: анализ потребностей → прототип → внедрение → дальнейшее развитие"
          ]
        }
      },
      {
        "key": "who",
        "title": {
          "pl": "Komu to potrzebne",
          "ru": "Кому это нужно"
        },
        "body": {
          "pl": "Firmy z procesem na tyle nietypowym, że żadne gotowe narzędzie go nie obsłuży — bo albo próbowały już czegoś gotowego i się w to nie zmieściły, albo od razu wiedzą, że ich sposób pracy jest inny niż standard w branży. To klienci gotowi zainwestować w rozwiązanie skrojone pod nich, zamiast dalej kombinować w Excelu czy na kartce.",
          "ru": "Компании с процессом, настолько нетипичным, что никакой готовый инструмент его не обслужит — потому что либо они уже пробовали что-то готовое и не вписались, либо сразу знают, что их способ работы отличается от стандарта в отрасли. Это клиенты, готовые инвестировать в решение, скроенное под них, вместо того чтобы дальше выкручиваться в Excel или на бумаге."
        },
        "bullets": {
          "pl": [
            "Firmy z procesem, który różni się od standardowych schematów w branży",
            "Firmy, które próbowały gotowych narzędzi (SaaS) i się w nie nie zmieściły",
            "Firmy gotowe zainwestować w rozwiązanie zamiast dalej kombinować w Excelu czy na kartce"
          ],
          "ru": [
            "Компании с процессом, отличающимся от стандартных схем в отрасли",
            "Компании, которые пробовали готовые инструменты (SaaS) и не вписались в них",
            "Компании, готовые инвестировать в решение вместо дальнейших ухищрений в Excel или на бумаге"
          ]
        }
      },
      {
        "key": "problem",
        "title": {
          "pl": "Jaki problem rozwiązuje i jak to rozpoznać u klienta",
          "ru": "Какую проблему решает и как это распознать у клиента"
        },
        "body": {
          "pl": "Rozwiązuje sytuację, w której gotowe narzędzia wymuszają cudzy proces — firma musi dopasować SWOJĄ pracę do ograniczeń jakiegoś gotowego programu, zamiast na odwrót. Rozpoznajesz to, kiedy klient opisuje swój sposób pracy i mówi 'próbowaliśmy [jakiegoś narzędzia], ale ono nie robi tego, co nam potrzeba, więc i tak część robimy ręcznie w Excelu'.",
          "ru": "Решает ситуацию, когда готовые инструменты навязывают чужой процесс — компания вынуждена подстраивать СВОЮ работу под ограничения какой-то готовой программы, вместо того чтобы было наоборот. Распознаётся, когда клиент описывает свой способ работы и говорит: 'мы пробовали [какой-то инструмент], но он не делает того, что нам нужно, так что часть всё равно делаем вручную в Excel'."
        },
        "bullets": {
          "pl": [
            "Klient mówi 'próbowaliśmy gotowego programu, ale on nie robi tego, co nam potrzebne'",
            "Firma nadal robi coś ręcznie w Excelu albo na papierze, bo żaden gotowy system tego nie ogarnia",
            "Proces klienta jest na tyle nietypowy, że żadna z pozostałych usług w katalogu nie opisuje go wprost"
          ],
          "ru": [
            "Клиент говорит 'мы пробовали готовую программу, но она не делает того, что нам нужно'",
            "Компания всё ещё делает что-то вручную в Excel или на бумаге, потому что ни одна готовая система это не покрывает",
            "Процесс клиента настолько нетипичен, что ни одна из остальных услуг в каталоге его прямо не описывает"
          ]
        }
      },
      {
        "key": "phone",
        "title": {
          "pl": "Jak powiedzieć przez telefon",
          "ru": "Как сказать по телефону"
        },
        "body": {
          "pl": "Trzy gotowe zdania do użycia na żywo.",
          "ru": "Три готовые фразы для звонка."
        },
        "bullets": {
          "pl": [
            "Niech Pan mi opowie dokładnie, jak to u Pana wygląda — bo może akurat nie ma na rynku gotowego narzędzia, które to robi, i wtedy budujemy je od zera pod Pana.",
            "Nie zaczynamy od razu od dużego budżetu — najpierw rozkładamy to, czego Pan potrzebuje, na czynniki pierwsze i pokazujemy, co realnie da się zrobić i za ile.",
            "Skoro żadne gotowe rozwiązanie nie robi tego tak, jak Pan by chciał, to jest dokładnie ten przypadek, kiedy robimy coś od zera, dopasowanego wyłącznie do Pana firmy."
          ],
          "ru": [
            "Ключевая фраза для распознавания момента, когда нужно предложить именно customtools — открывает клиента на детальное описание процесса, вместо того чтобы пытаться втиснуть его в готовую услугу из каталога.",
            "Снимает страх дороговизны и сложности — показывает, что решение начинается с малого шага анализа, а не с обязательства на большой бюджет сразу.",
            "Переформулирует нестандартность процесса клиента из проблемы в аргумент за услугу — 'раз ничего не подходит, значит это именно наш случай'."
          ]
        }
      },
      {
        "key": "avoid",
        "title": {
          "pl": "Kiedy NIE oferować tej usługi",
          "ru": "Когда НЕ предлагать эту услугу"
        },
        "body": {
          "pl": "Jeśli potrzeba klienta pasuje do istniejącej, tańszej i szybszej usługi — na przykład prosty formularz kontaktowy, kalkulator albo panel administracyjny — zaproponuj to, a nie od razu narzędzie budowane od zera. Custom tools to rozwiązanie na sytuacje, gdzie naprawdę nic innego nie pasuje, nie domyślna odpowiedź na każde pytanie. Nigdy nie podawaj ceny ani terminu przed analizą zakresu i nigdy nie obiecuj, że narzędzie będzie od razu idealne — to proces z prototypem i dalszym rozwojem, nie jednorazowa dostawa.",
          "ru": "Если потребность клиента вписывается в существующую, более дешёвую и быструю услугу — например, простую контактную форму, калькулятор или админ-панель — предложи именно её, а не сразу инструмент с нуля. Custom tools — решение для ситуаций, где действительно ничего другое не подходит, а не ответ по умолчанию на любой запрос. Никогда не называй цену или срок до анализа объёма и никогда не обещай, что инструмент будет сразу идеальным — это процесс с прототипом и дальнейшим развитием, а не разовая поставка."
        },
        "bullets": {
          "pl": [
            "Potrzeba klienta pasuje do istniejącej, tańszej usługi (formularz, kalkulator, panel) → zaproponuj tamto, nie custom tools",
            "Nie podawaj ceny ani terminu, zanim nie zrobisz analizy zakresu — tu naprawdę 'to zależy'",
            "Nie obiecuj, że narzędzie będzie od razu idealne — to proces z prototypem i dalszym rozwojem, nie jednorazowa dostawa"
          ],
          "ru": [
            "Потребность клиента вписывается в существующую, более дешёвую услугу (форма, калькулятор, панель) → предложи её, а не custom tools",
            "Не называй цену или срок до анализа объёма — здесь реально 'зависит от ситуации'",
            "Не обещай, что инструмент будет сразу идеальным — это процесс с прототипом и дальнейшим развитием, а не разовая поставка"
          ]
        }
      }
    ],
    "quiz": [
      {
        "type": "single",
        "question": {
          "pl": "Klient opisuje bardzo specyficzny sposób obsługi zamówień, którego nie mieści w sobie żaden gotowy program, jaki próbował. Co to sygnalizuje?",
          "ru": "Клиент описывает очень специфический способ обработки заказов, который не вмещает ни одна готовая программа, которую он пробовал. О чём это говорит?"
        },
        "answers": {
          "pl": [
            "Klient po prostu źle szukał i trzeba mu polecić inny gotowy program",
            "Klasyczny sygnał do custom tools — proces jest na tyle nietypowy, że wymaga rozwiązania szytego na miarę",
            "To nie jest sprawa dla studia, tylko dla samego klienta do rozwiązania"
          ],
          "ru": [
            "Клиент просто плохо искал, и нужно порекомендовать другую готовую программу",
            "Классический сигнал для custom tools — процесс настолько нетипичен, что требует решения, сшитого на заказ",
            "Это не задача для студии, а дело самого клиента"
          ]
        },
        "correct": 1
      },
      {
        "type": "single",
        "question": {
          "pl": "Dlaczego nie warto proponować custom tools klientowi, który potrzebuje prostego formularza kontaktowego na stronie?",
          "ru": "Почему не стоит предлагать custom tools клиенту, которому нужна простая контактная форма на сайте?"
        },
        "answers": {
          "pl": [
            "Bo formularze kontaktowe w ogóle nie istnieją jako usługa",
            "Bo taka potrzeba jest już obsłużona przez istniejącą, tańszą i szybszą usługę (leadforms), więc budowanie czegoś od zera to niepotrzebny koszt i czas",
            "Bo custom tools działa tylko dla dużych firm"
          ],
          "ru": [
            "Потому что контактных форм вообще не существует как услуги",
            "Потому что такая потребность уже покрывается существующей, более дешёвой и быстрой услугой (leadforms), поэтому строить что-то с нуля — лишние деньги и время",
            "Потому что custom tools работает только для крупных компаний"
          ]
        },
        "correct": 1
      },
      {
        "type": "case",
        "question": {
          "pl": "Dzwonisz do firmy logistycznej. Właściciel opisuje bardzo specyficzny sposób przypisywania kierowców do tras, którego żaden znany mu program nie ogarnia, więc robią to na tablicy w biurze. Co proponujesz?",
          "ru": "Звонишь в логистическую компанию. Владелец описывает очень специфический способ распределения водителей по маршрутам, который не покрывает ни одна известная ему программа, поэтому они делают это на доске в офисе. Что предлагаешь?"
        },
        "answers": {
          "pl": [
            "Mówisz, że powinni po prostu kupić popularny program do logistyki, nawet jeśli nie pasuje",
            "Proponujesz analizę tego procesu i zbudowanie dedykowanego narzędzia dopasowanego dokładnie do tego, jak przypisują trasy — bo to klasyczny przypadek na custom tools",
            "Mówisz, że tablica w biurze to i tak dobre rozwiązanie i nic nie trzeba zmieniać"
          ],
          "ru": [
            "Говоришь, что им нужно просто купить популярную логистическую программу, даже если она не подходит",
            "Предлагаешь анализ этого процесса и создание индивидуального инструмента, подогнанного точно под то, как они распределяют маршруты — классический случай для custom tools",
            "Говоришь, что доска в офисе — и так хорошее решение и менять ничего не нужно"
          ]
        },
        "correct": 1,
        "explain": {
          "pl": "Proces klienta jest na tyle specyficzny, że żadne gotowe narzędzie go nie obsługuje — dokładnie ten przypadek, dla którego istnieje custom tools jako opcja, kiedy nic innego z katalogu nie pasuje.",
          "ru": "Процесс клиента настолько специфичен, что ни один готовый инструмент его не обслуживает — именно тот случай, для которого существует custom tools как вариант, когда ничто другое из каталога не подходит."
        }
      },
      {
        "type": "open",
        "question": {
          "pl": "Klient od razu pyta: 'Ile to będzie kosztować i kiedy będzie gotowe?' zanim jeszcze opowiedział, czego dokładnie potrzebuje. Napisz dokładnie, jak byś mu odpowiedział.",
          "ru": "Клиент сразу спрашивает: 'Сколько это будет стоить и когда будет готово?' ещё до того, как рассказал, что именно ему нужно. Напиши точно, как бы ты ему ответил."
        },
        "gradingNotes": {
          "pl": "Dobra odpowiedź WPROST odmawia podania konkretnej ceny czy terminu bez analizy — to niedopuszczalne w tej akademii, bo przy narzędziach budowanych od zera cena naprawdę zależy od zakresu. Tłumaczy, że pierwszym krokiem jest rozmowa o tym, czego dokładnie potrzeba, i że dopiero po analizie zakresu można podać realny koszt i termin. Nie wymyśla liczby 'na oko' ani nie mówi 'to zależy' bez żadnego konkretnego następnego kroku — proponuje konkretny pierwszy krok (rozmowa/analiza).",
          "ru": "Хороший ответ ПРЯМО отказывается называть конкретную цену или срок без анализа — это недопустимо в этой академии, поскольку при инструментах, создаваемых с нуля, цена реально зависит от объёма. Объясняет, что первый шаг — разговор о том, что именно нужно, и только после анализа объёма можно назвать реальную стоимость и срок. Не придумывает число 'на глаз' и не говорит просто 'зависит' без конкретного следующего шага — предлагает конкретный первый шаг (разговор/анализ)."
        }
      }
    ],
    "objections": [
      {
        "say": "To brzmi drogo i skomplikowanie.",
        "ru": "Клиент воспринимает 'индивидуальную разработку' как большой и рискованный проект целиком — нужно разбить это на маленький, безопасный первый шаг.",
        "response": "Rozumiem, tak to często brzmi na starcie — dlatego nie zaczynamy od razu od dużego zlecenia, tylko od krótkiej analizy tego, czego Pan realnie potrzebuje. Dopiero po niej wiadomo, ile to kosztuje i jak długo trwa — i wtedy Pan decyduje, czy w ogóle iść dalej.",
        "responseRu": "Разбивает большой пугающий проект на маленький, конкретный первый шаг (анализ), к которому клиент ещё не обязан коммититься полностью. Снижает воспринимаемый риск и возвращает клиенту контроль над решением.",
        "why": {
          "pl": "Podział dużego, strasznego zobowiązania na mały, konkretny pierwszy krok obniża postrzegane ryzyko i oddaje klientowi kontrolę nad decyzją.",
          "ru": "Разбивка большого, пугающего обязательства на маленький, конкретный первый шаг снижает воспринимаемый риск и отдаёт клиенту контроль над решением."
        }
      },
      {
        "say": "A co jak wy zrobicie to źle, bo to coś niestandardowego?",
        "ru": "Обоснованный страх при заказе чего-то нестандартного — 'нет референса, который можно проверить'. Нужно показать процесс с промежуточными точками проверки, а не разовую поставку 'втёмную'.",
        "response": "Dlatego to nie jest tak, że znikamy na miesiące i wracamy z gotową rzeczą — najpierw robimy prototyp, który Pan ogląda i mówi, czy to w ogóle idzie w dobrą stronę, zanim zbudujemy całość. A po wdrożeniu narzędzie dalej się rozwija i poprawia, to nie jest zamknięty temat po jednej dostawie.",
        "responseRu": "Показывает конкретную структуру процесса (прототип для проверки до полной сборки + дальнейшее развитие после внедрения) — превращает абстрактный страх 'сделают неправильно' в управляемый, поэтапный процесс с точками контроля.",
        "why": {
          "pl": "Pokazanie punktów kontrolnych (prototyp do akceptacji, dalszy rozwój po wdrożeniu) zamienia abstrakcyjny lęk w zarządzalny, etapowy proces.",
          "ru": "Показ контрольных точек (прототип на утверждение, дальнейшее развитие после внедрения) превращает абстрактный страх в управляемый, поэтапный процесс."
        }
      },
      {
        "say": "Może po prostu kupimy jakiś gotowy program, będzie taniej.",
        "ru": "Возражение частично справедливое — не нужно спорить, а честно обозначить, при каких условиях готовое решение действительно лучше, и когда именно кастомная разработка окупается.",
        "response": "Jeśli jest gotowy program, który robi dokładnie to, czego Pan potrzebuje — to szczerze, warto go po prostu kupić, będzie i taniej, i szybciej. Problem pojawia się wtedy, kiedy taki program zmusza Pana do zmiany swojego sposobu pracy, żeby się w niego zmieścić — i to obchodzenie ograniczeń kosztuje później więcej czasu niż narzędzie zrobione raz, dobrze, pod Pana proces.",
        "responseRu": "Честно признаёт, что готовое решение иногда действительно лучше — это строит доверие и не звучит как заученная защита услуги. Затем чётко очерчивает границу, где именно кастомная разработка окупается — скрытая цена подгонки процесса под чужой инструмент.",
        "why": {
          "pl": "Uczciwe przyznanie, że czasem gotowe rozwiązanie jest lepsze, buduje wiarygodność, a potem precyzyjnie pokazuje ukryty koszt naginania swojego procesu pod cudze narzędzie.",
          "ru": "Честное признание, что иногда готовое решение лучше, строит доверие, а затем точно показывает скрытую цену подстройки своего процесса под чужой инструмент."
        }
      }
    ],
    "opener": {
      "say": "Dzień dobry, dzwonię z Aura Global Merchants — czy zdarza się, że coś w firmie robicie ręcznie, na przykład w Excelu albo na kartce, bo żaden gotowy program czy strona tego nie ogarnia?",
      "ru": "Эта услуга обычно не является целью холодного звонка из списка — она открывается в разговоре, когда клиент описывает нетипичную потребность, не покрытую ничем из каталога. Этот вопрос — диагностический: он специально ищет 'ручной' процесс как признак того, что готовые инструменты клиенту не подошли. Слушай внимательно ответ вместо того, чтобы сразу переходить к питчу."
    },
    "crossSell": {
      "pl": "Custom tools to naturalne dopełnienie apiint i adminpanels, kiedy potrzeba klienta wykracza poza to, co te usługi obsługują wprost — jeśli klient opisuje coś, co nie mieści się w żadnej z pozostałych 32 usług z katalogu, to jest właśnie moment, żeby zaproponować custom tools zamiast na siłę wciskać go w niepasującą usługę.",
      "ru": "Custom tools — естественное дополнение к apiint и adminpanels, когда потребность клиента выходит за рамки того, что эти услуги обслуживают напрямую — если клиент описывает нечто, не вписывающееся ни в одну из остальных 32 услуг каталога, это именно тот момент, чтобы предложить custom tools вместо того, чтобы насильно втискивать его в неподходящую услугу."
    }
  }
};
