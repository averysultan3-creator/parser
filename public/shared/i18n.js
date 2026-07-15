// Shared i18n dictionary for Academy + Admin UI chrome (nav, buttons, statuses,
// confirmation modals, toasts, empty states). Deep content (services catalog,
// scripts, quizzes) stays Polish-only and is NOT routed through this module —
// see fixpromt.txt scoping decision. Persisted language is shared with Parser
// via the same 'auraLanguage' localStorage key so switching language in one app
// carries over when navigating to another.
(function (global) {
  const STORAGE_KEY = 'auraLanguage';
  const PARSER_STORAGE_KEY = 'parserLanguage';
  const FALLBACK = 'pl';
  const SUPPORTED = ['pl', 'ru', 'en'];

  const dict = {
    // Navigation
    nav_home: { pl: 'Główna', ru: 'Главная', en: 'Home' },
    nav_training: { pl: 'Trening', ru: 'Обучение', en: 'Training' },
    nav_services: { pl: 'Nasze usługi', ru: 'Наши услуги', en: 'Our services' },
    nav_scripts: { pl: 'Skrypty i przykłady', ru: 'Скрипты и примеры', en: 'Scripts & examples' },
    nav_parser_guide: { pl: 'Praca z parserem', ru: 'Работа с парсером', en: 'Parser guide' },
    nav_ai_training: { pl: 'Trening rozmów z AI', ru: 'AI-тренировка', en: 'AI training' },
    nav_parser: { pl: 'Parser', ru: 'Парсер', en: 'Parser' },
    nav_academy: { pl: 'Akademia', ru: 'Академия', en: 'Academy' },
    nav_admin: { pl: 'Panel admina', ru: 'Админ-панель', en: 'Admin panel' },
    nav_logout: { pl: 'Wyloguj', ru: 'Выйти', en: 'Logout' },
    nav_workers: { pl: 'Workerzy', ru: 'Сотрудники', en: 'Workers' },
    nav_lead_pool: { pl: 'Globalna pula leadów', ru: 'Глобальный пул лидов', en: 'Global lead pool' },
    nav_parser_queries: { pl: 'Zapytania parsera', ru: 'Запросы парсера', en: 'Parser queries' },
    nav_audit_log: { pl: 'Dziennik zdarzeń', ru: 'Журнал действий', en: 'Audit log' },
    nav_ai_usage: { pl: 'Koszty AI', ru: 'Расходы AI', en: 'AI usage & costs' },

    // Buttons
    btn_open: { pl: 'Otwórz', ru: 'Открыть', en: 'Open' },
    btn_collapse: { pl: 'Zwiń', ru: 'Свернуть', en: 'Collapse' },
    btn_continue: { pl: 'Kontynuuj', ru: 'Продолжить', en: 'Continue' },
    btn_continue_learning: { pl: 'Kontynuuj naukę', ru: 'Продолжить обучение', en: 'Continue learning' },
    btn_go_to_parser: { pl: 'Przejdź do parsera', ru: 'Перейти в парсер', en: 'Go to parser' },
    btn_start_training: { pl: 'Rozpocznij trening', ru: 'Начать тренировку', en: 'Start training' },
    btn_finish_training: { pl: 'Zakończ trening', ru: 'Завершить тренировку', en: 'Finish training' },
    btn_send: { pl: 'Wyślij', ru: 'Отправить', en: 'Send' },
    btn_confirm: { pl: 'Potwierdź', ru: 'Подтвердить', en: 'Confirm' },
    btn_cancel: { pl: 'Anuluj', ru: 'Отмена', en: 'Cancel' },
    btn_return_to_pool: { pl: 'Zwróć do puli', ru: 'Вернуть в пул', en: 'Return to pool' },
    btn_delete_permanently: { pl: 'Usuń trwale', ru: 'Удалить навсегда', en: 'Delete permanently' },
    btn_create_worker: { pl: 'Stwórz workera', ru: 'Создать сотрудника', en: 'Create worker' },
    btn_save: { pl: 'Zapisz', ru: 'Сохранить', en: 'Save' },
    btn_refresh: { pl: 'Odśwież', ru: 'Обновить', en: 'Refresh' },
    btn_close: { pl: 'Zamknij', ru: 'Закрыть', en: 'Close' },

    // Progress/status
    status_not_started: { pl: 'Nie rozpoczęto', ru: 'Не начато', en: 'Not started' },
    status_in_progress: { pl: 'W trakcie', ru: 'В процессе', en: 'In progress' },
    status_completed: { pl: 'Ukończono', ru: 'Завершено', en: 'Completed' },

    // Confirmation modals
    confirm_return_to_pool_title: { pl: 'Zwrócić lead do wspólnej puli?', ru: 'Вернуть лид в общий пул?', en: 'Return lead to the shared pool?' },
    confirm_return_to_pool_body: {
      pl: 'Lead ponownie pojawi się u workerów podczas nowego wyszukiwania.',
      ru: 'Лид снова сможет появиться у сотрудников при новом поиске.',
      en: 'The lead can be found by workers again in a future search.'
    },
    confirm_delete_title: { pl: 'Usunąć ten lead trwale?', ru: 'Удалить этот лид навсегда?', en: 'Delete this lead permanently?' },
    confirm_delete_body: {
      pl: 'Ta operacja jest trudna do cofnięcia. Wpisz DELETE, aby potwierdzić.',
      ru: 'Это действие практически необратимо. Введите DELETE для подтверждения.',
      en: 'This action is hard to undo. Type DELETE to confirm.'
    },
    confirm_delete_all_body: {
      pl: 'Wpisz DELETE ALL, aby potwierdzić masowe usunięcie.',
      ru: 'Введите DELETE ALL для подтверждения массового удаления.',
      en: 'Type DELETE ALL to confirm the bulk delete.'
    },
    confirm_type_delete_placeholder: { pl: 'Wpisz DELETE', ru: 'Введите DELETE', en: 'Type DELETE' },

    // Toasts
    toast_saved: { pl: 'Zapisano', ru: 'Сохранено', en: 'Saved' },
    toast_error: { pl: 'Wystąpił błąd', ru: 'Произошла ошибка', en: 'Something went wrong' },
    toast_worker_created: { pl: 'Worker utworzony', ru: 'Сотрудник создан', en: 'Worker created' },
    toast_returned_to_pool: { pl: 'Zwrócono do puli', ru: 'Возвращено в пул', en: 'Returned to pool' },
    toast_deleted: { pl: 'Usunięto trwale', ru: 'Удалено навсегда', en: 'Deleted permanently' },

    // Empty states
    empty_no_data: { pl: 'Brak danych', ru: 'Нет данных', en: 'No data yet' },
    empty_no_sessions: { pl: 'Brak sesji treningowych', ru: 'Нет тренировочных сессий', en: 'No training sessions yet' },

    // Academy auth screen (pre-login, no in-app language switcher visible yet —
    // language is detected via AuraI18n.applyInitialLanguage() from stored/browser language)
    auth_login_title: { pl: 'Logowanie', ru: 'Вход', en: 'Login' },
    auth_login_hint: {
      pl: 'Wpisz login i haslo otrzymane od administratora.',
      ru: 'Введите логин и пароль, полученные от администратора.',
      en: 'Enter the login and password provided by the administrator.'
    },
    btn_login: { pl: 'Zaloguj', ru: 'Войти', en: 'Log in' },
    auth_logging_in: { pl: 'Loguje...', ru: 'Вход...', en: 'Logging in...' },
    auth_invalid_credentials: { pl: 'Bledny login lub haslo.', ru: 'Неверный логин или пароль.', en: 'Invalid login or password.' },
    auth_server_unavailable: { pl: 'Serwer nie odpowiada.', ru: 'Сервер не отвечает.', en: 'Server is not responding.' },

    // Academy static shell chrome (index.html sidebar/hero/stat cards, baked
    // into the markup — re-applied on every render() via applyShellChrome())
    academy_tagline: { pl: 'Akademia dzwoniącego', ru: 'Академия звонящего', en: 'Caller academy' },
    academy_logged_in_as: { pl: 'Zalogowany jako', ru: 'Вы вошли как', en: 'Logged in as' },
    academy_hero_title: {
      pl: 'Interaktywne wdrożenie dla nowych callerów',
      ru: 'Интерактивное обучение для новых колл-менеджеров',
      en: 'Interactive onboarding for new callers'
    },
    academy_hero_copy: {
      pl: 'Nie uczysz się sprzedaży z tekstu. Przechodzisz realny proces: rozumiesz usługę, wybierasz dobry lead, prowadzisz rozmowę i umawiasz spotkanie.',
      ru: 'Ты не учишь продажи по тексту. Ты проходишь реальный процесс: разбираешься в услуге, выбираешь хороший лид, ведёшь разговор и назначаешь встречу.',
      en: 'You are not learning sales from a text. You go through the real process: understand the service, pick a good lead, run the call, and book the meeting.'
    },
    academy_completed_caption: { pl: 'ukończone', ru: 'завершено', en: 'completed' },
    academy_stat_modules: { pl: 'Moduły', ru: 'Модули', en: 'Modules' },
    academy_stat_next: { pl: 'Najbliższy krok', ru: 'Следующий шаг', en: 'Next step' },
    academy_stat_score: { pl: 'Wynik testów', ru: 'Результат тестов', en: 'Test score' },

    // Academy portal home (renderPortalHome)
    academy_home_greeting_prefix: { pl: 'Witaj', ru: 'Привет', en: 'Welcome' },
    academy_home_intro: {
      pl: 'Akademia to Twój portal wdrożeniowy: poznajesz nasze usługi, uczysz się rozmawiać z klientem, trenujesz z AI i wiesz, jak pracować z parserem. Ścieżka jest prowadzona krok po kroku — usługi → szkolenie → skrypty → trener AI — a postęp na każdym etapie zapisuje się automatycznie i jest widoczny dla administratora.',
      ru: 'Академия — это твой портал адаптации: ты знакомишься с нашими услугами, учишься общаться с клиентом, тренируешься с AI и узнаёшь, как работать с парсером. Путь построен шаг за шагом — услуги → обучение → скрипты → AI-тренер — а прогресс на каждом этапе сохраняется автоматически и виден администратору.',
      en: 'The Academy is your onboarding portal: you learn our services, learn to talk to clients, train with AI, and learn how to work with the parser. The path is guided step by step — services → training → scripts → AI trainer — and progress at every stage is saved automatically and visible to the administrator.'
    },
    academy_home_overall_progress_label: { pl: 'Ogólny postęp:', ru: 'Общий прогресс:', en: 'Overall progress:' },
    academy_card_services_body: {
      pl: 'Pełny katalog usług: co to jest, komu proponować, ile to może kosztować i jak o tym mówić.',
      ru: 'Полный каталог услуг: что это, кому предлагать, сколько это может стоить и как об этом говорить.',
      en: 'Full service catalog: what it is, who to offer it to, what it might cost, and how to talk about it.'
    },
    academy_card_training_body: {
      pl: 'Moduły od startu pracy do finalnego testu. Ten wynik widzi administrator.',
      ru: 'Модули от старта работы до финального теста. Этот результат видит администратор.',
      en: 'Modules from day one to the final test. The administrator sees this result.'
    },
    academy_card_scripts_body: {
      pl: 'Gotowe skrypty rozmów, obsługa obiekcji i przykłady prawdziwych rozmów z klientami.',
      ru: 'Готовые скрипты разговоров, отработка возражений и примеры реальных разговоров с клиентами.',
      en: 'Ready-made call scripts, objection handling, and real examples of client calls.'
    },
    academy_card_ai_training_body: {
      pl: 'Trenuj rozmowy z AI, które gra różne typy klientów, i otrzymuj ocenę po każdej sesji.',
      ru: 'Тренируй разговоры с AI, который играет разные типы клиентов, и получай оценку после каждой сессии.',
      en: 'Train calls with AI playing different client types, and get scored after every session.'
    },
    academy_card_parser_guide_body: {
      pl: 'Jak wybrać kategorię, czytać AI score i poprawnie ustawiać statusy leadów.',
      ru: 'Как выбрать категорию, читать AI score и правильно ставить статусы лидов.',
      en: 'How to choose a category, read the AI score, and set lead statuses correctly.'
    },
    // Locked-stage hint shown on a locked portal card and in the toolbar lock
    // toast (viewUnlockHint()) — replaces the portal card body text above when
    // a stage isn't unlocked yet, so it needs the same coverage.
    academy_unlock_hint_template: {
      pl: 'Najpierw ukończ „{stage}” (masz {have}% z wymaganych {threshold}%).',
      ru: 'Сначала заверши «{stage}» (у тебя {have}% из необходимых {threshold}%).',
      en: 'First finish "{stage}" (you have {have}% of the required {threshold}%).'
    },

    // Academy services catalog (renderServicesCatalogSection / renderServiceDetail)
    academy_eyebrow_knowledge_base: { pl: 'Baza wiedzy', ru: 'База знаний', en: 'Knowledge base' },
    academy_services_h2: { pl: 'Nasze usługi', ru: 'Наши услуги', en: 'Our services' },
    academy_services_intro: {
      pl: 'Poznaj każdą usługę na tyle, żeby nie brzmieć jak robot: rozumieć problem klienta, umieć wytłumaczyć wartość i doprowadzić rozmowę do spotkania. Dokładnej ceny nie obiecujemy przez telefon — zadaniem rozmowy jest umówić konsultację.',
      ru: 'Изучи каждую услугу настолько, чтобы не звучать как робот: понимать проблему клиента, уметь объяснить ценность и довести разговор до встречи. Точную цену по телефону мы не обещаем — задача разговора — договориться о консультации.',
      en: 'Learn each service well enough to not sound like a robot: understand the client problem, explain the value, and steer the call toward a meeting. We never promise an exact price on the phone — the goal of the call is to book a consultation.'
    },
    academy_services_cta: { pl: 'Otwórz stronę z ofertą', ru: 'Открыть страницу с услугами', en: 'Open the offer page' },
    academy_loading_catalog: { pl: 'Ładowanie katalogu usług...', ru: 'Загрузка каталога услуг...', en: 'Loading the service catalog...' },

    // Academy scripts & examples (renderScriptsExamplesSection)
    academy_scripts_h2: { pl: 'Skrypty i przykłady rozmów', ru: 'Скрипты и примеры разговоров', en: 'Scripts and call examples' },
    academy_scripts_intro: {
      pl: 'Gotowe frazy na typowe sytuacje oraz prawdziwe przykłady rozmów — ucz się logiki, nie tylko tekstu na pamięć.',
      ru: 'Готовые фразы для типичных ситуаций и реальные примеры разговоров — учи логику, а не просто текст наизусть.',
      en: 'Ready-made phrases for typical situations and real call examples — learn the logic, not just the text by heart.'
    },
    academy_scripts_tab_scripts: { pl: 'A. Skrypty', ru: 'A. Скрипты', en: 'A. Scripts' },
    academy_scripts_tab_examples: { pl: 'B. Przykłady rozmów', ru: 'B. Примеры разговоров', en: 'B. Call examples' },

    // Academy parser guide (renderParserGuideSection)
    academy_parser_guide_eyebrow: { pl: 'Instrukcja', ru: 'Инструкция', en: 'Guide' },
    academy_parser_guide_intro: {
      pl: 'Krótki przewodnik, jak korzystać z parsera leadów: od wyboru kategorii do ustawienia statusu po rozmowie.',
      ru: 'Краткое руководство, как пользоваться парсером лидов: от выбора категории до установки статуса после разговора.',
      en: 'A short guide to using the lead parser: from picking a category to setting the status after a call.'
    },

    // Academy AI training (renderAiTrainingSection)
    academy_ai_training_h2: { pl: 'Trenuj rozmowy z AI', ru: 'Тренируй разговоры с AI', en: 'Train calls with AI' },
    academy_ai_training_intro: {
      pl: 'Wybierz typ klienta — AI odegra jego rolę w symulowanej rozmowie telefonicznej. Po zakończeniu otrzymasz ocenę i feedback.',
      ru: 'Выбери тип клиента — AI сыграет его роль в смоделированном телефонном разговоре. После завершения ты получишь оценку и обратную связь.',
      en: 'Pick a client type — AI will play that role in a simulated phone call. When you finish, you get a score and feedback.'
    },
    academy_ai_training_history_heading: { pl: 'Historia treningów', ru: 'История тренировок', en: 'Training history' },

    // Academy AI training post-session feedback (renderAiTrainingFeedback)
    academy_ai_feedback_eyebrow: { pl: 'Wynik treningu', ru: 'Результат тренировки', en: 'Training result' },
    academy_ai_feedback_meeting_booked: { pl: '✅ Spotkanie zostało umówione', ru: '✅ Встреча была назначена', en: '✅ Meeting was booked' },
    academy_ai_feedback_meeting_not_booked: { pl: '❌ Spotkanie nie zostało umówione', ru: '❌ Встреча не была назначена', en: '❌ Meeting was not booked' },
    academy_ai_feedback_new_training: { pl: 'Nowy trening', ru: 'Новая тренировка', en: 'New training' },
    academy_ai_feedback_back_to_list: { pl: 'Powrót do listy', ru: 'Назад к списку', en: 'Back to list' },

    // Academy module 1 — Start (renderStart)
    academy_start_eyebrow: { pl: 'Moduł 1', ru: 'Модуль 1', en: 'Module 1' },
    academy_start_h2: { pl: 'Jak myśleć o tej pracy', ru: 'Как думать об этой работе', en: 'How to think about this job' },
    academy_start_intro: {
      pl: 'Caller nie jest osobą od wciskania strony. Caller jest pierwszym filtrem: znajduje firmę, rozpoznaje realny problem i umawia rozmowę z managerem.',
      ru: 'Звонящий — это не человек, который впаривает сайт. Звонящий — это первый фильтр: находит компанию, распознаёт реальную проблему и договаривается о разговоре с менеджером.',
      en: 'A caller is not someone pushing a website. A caller is the first filter: finds the company, spots the real problem, and books a call with the manager.'
    },
    academy_start_rule_heading: { pl: 'Najważniejsza zasada', ru: 'Главное правило', en: 'The most important rule' },
    academy_start_rule_body: {
      pl: 'Nie sprzedajesz przez telefon. Umawiasz rozmowę, kiedy widzisz konkretny powód: brak strony, słaby profil Google, brak widoczności, chaos w leadach albo niewykorzystane reklamy.',
      ru: 'Ты не продаёшь по телефону. Ты договариваешься о разговоре, когда видишь конкретную причину: нет сайта, слабый профиль Google, отсутствие видимости, хаос в лидах или неиспользуемая реклама.',
      en: 'You do not sell over the phone. You book a call when you see a concrete reason: no website, a weak Google profile, poor visibility, chaos in leads, or unused ads.'
    },

    // Academy final test (renderFinal)
    academy_final_eyebrow: { pl: 'Egzamin', ru: 'Экзамен', en: 'Exam' },
    academy_final_h2: { pl: 'Test końcowy', ru: 'Финальный тест', en: 'Final Test' },
    academy_final_intro: {
      pl: 'Wymagany wynik: 80%. Test sprawdza logikę pracy, usługi, obiekcje, kwalifikację i statusy. Pytania otwarte oceń przyciskiem „Sprawdź z AI”, zanim oddasz test.',
      ru: 'Проходной балл: 80%. Тест проверяет логику работы, услуги, возражения, квалификацию и статусы. Открытые вопросы оцени кнопкой «Проверить с AI», прежде чем сдать тест.',
      en: 'Required score: 80%. The test checks work logic, services, objections, qualification, and statuses. Grade open questions with the "Check with AI" button before submitting the test.'
    },
    academy_loading_questions: { pl: 'Ładowanie pytań...', ru: 'Загрузка вопросов...', en: 'Loading questions...' },
    academy_final_checking: { pl: 'Sprawdzanie...', ru: 'Проверка...', en: 'Checking...' },
    academy_final_submit: { pl: 'Sprawdź wynik', ru: 'Проверить результат', en: 'Check result' },
    academy_final_answers_count: { pl: 'odpowiedzi', ru: 'ответов', en: 'answers' },
    academy_final_passed_prefix: { pl: 'Zdane:', ru: 'Сдано:', en: 'Passed:' },
    academy_final_passed_suffix: { pl: 'Możesz pracować z parserem.', ru: 'Можешь работать с парсером.', en: 'You can work with the parser now.' },
    academy_final_failed_prefix: { pl: 'Jeszcze nie:', ru: 'Пока нет:', en: 'Not yet:' },
    academy_final_failed_suffix: {
      pl: 'Wróć do modułów i popraw wynik do 80%.',
      ru: 'Вернись к модулям и улучши результат до 80%.',
      en: 'Go back to the modules and improve your score to 80%.'
    },

    // Academy module eyebrows (chapter kickers) for modules 2/3 and the
    // shared scenario/qualification/calculator/workday renderers.
    academy_services_eyebrow: { pl: 'Moduł 2', ru: 'Модуль 2', en: 'Module 2' },
    academy_article_eyebrow: { pl: 'Moduł 3', ru: 'Модуль 3', en: 'Module 3' },
    academy_scenario_eyebrow: { pl: 'Trening odpowiedzi', ru: 'Тренировка ответов', en: 'Response training' },
    academy_qualification_eyebrow: { pl: 'Kwalifikacja', ru: 'Квалификация', en: 'Qualification' },
    academy_calculator_eyebrow: { pl: 'Matematyka pracy', ru: 'Математика работы', en: 'Work math' },
    academy_workday_eyebrow: { pl: 'Rutyna', ru: 'Рутина', en: 'Routine' },

    // Academy services module — link to the studio's own business-card site
    academy_services_site_link: { pl: 'Strona wizytówka', ru: 'Сайт-визитка', en: 'Business-card website' },

    // Academy module sidebar nav titles (public/academy/app.js `modules` array)
    academy_module_start: { pl: 'Start', ru: 'Старт', en: 'Start' },
    academy_module_services: { pl: 'Akademia usług', ru: 'Академия услуг', en: 'Services Academy' },
    academy_module_call_logic: { pl: 'Logika rozmowy', ru: 'Логика разговора', en: 'Call logic' },
    academy_module_scripts: { pl: 'Trener skryptów', ru: 'Тренажёр скриптов', en: 'Script Trainer' },
    academy_module_objections: { pl: 'Obiekcje', ru: 'Возражения', en: 'Objections' },
    academy_module_qualification: { pl: 'Kwalifikacja leadów', ru: 'Квалификация лидов', en: 'Lead qualification' },
    academy_module_numbers: { pl: 'Efekt dużych liczb', ru: 'Эффект больших чисел', en: 'Big numbers effect' },
    academy_module_workday: { pl: 'Dzień pracy', ru: 'Рабочий день', en: 'Workday' },
    academy_module_statuses: { pl: 'Statusy', ru: 'Статусы', en: 'Statuses' },
    academy_module_final: { pl: 'Test końcowy', ru: 'Финальный тест', en: 'Final Test' },

    // Academy completion button (completionButton)
    academy_btn_completed: { pl: 'Ukończone', ru: 'Завершено', en: 'Completed' },
    academy_btn_mark_completed: { pl: 'Oznacz jako ukończone', ru: 'Отметить как завершённое', en: 'Mark as completed' },

    // Academy "big numbers" calculator (updateCalculator)
    academy_calc_estimated_month: { pl: 'Szacowany miesiąc', ru: 'Ориентировочный месяц', en: 'Estimated month' },
    academy_calc_result_template: {
      pl: '{n} spotkań × 100 PLN + 4500 PLN podstawy. To model orientacyjny, nie gwarancja.',
      ru: '{n} встреч × 100 PLN + 4500 PLN базовой ставки. Это ориентировочная модель, а не гарантия.',
      en: '{n} meetings × 100 PLN + 4500 PLN base. This is an indicative model, not a guarantee.'
    },

    // poolState stable-ID labels (spec explicitly asks for this pattern)
    pool_available: { pl: 'Dostępny', ru: 'Доступен', en: 'Available' },
    pool_reserved: { pl: 'Zarezerwowany', ru: 'Зарезервирован', en: 'Reserved' },
    pool_processed: { pl: 'Przetworzony', ru: 'Обработан', en: 'Processed' },
    pool_reset: { pl: 'Przywrócony do puli', ru: 'Возвращён в пул', en: 'Returned to pool' },
    pool_deleted: { pl: 'Usunięty', ru: 'Удалён', en: 'Deleted' },

    // ---------------------------------------------------------------------
    // Admin panel (public/admin) - shell chrome, section tabs, workers/leads/
    // inbox/history/academy panels, modals, toasts and confirm dialogs.
    // Deep data values (company names, phone numbers, worker logins, dates,
    // raw status/pool enum codes) are NOT routed through this dictionary -
    // only the human-readable labels around them are.
    // ---------------------------------------------------------------------

    // Header/shell + section tabs
    admin_panel_title: { pl: 'Panel administratora', ru: 'Панель администратора', en: 'Admin panel' },
    admin_panel_subtitle: {
      pl: 'Pracownicy, ich historia parsera, statusy leadow i progres akademii w jednym miejscu.',
      ru: 'Сотрудники, их история парсера, статусы лидов и прогресс академии в одном месте.',
      en: 'Workers, their parser history, lead statuses, and academy progress in one place.'
    },
    admin_tab_workers: { pl: 'Pracownicy', ru: 'Сотрудники', en: 'Workers' },
    admin_tab_leads: { pl: 'Leady', ru: 'Лиды', en: 'Leads' },
    admin_tab_inbox: { pl: 'Zgłoszenia ze strony', ru: 'Заявки с сайта', en: 'Website submissions' },
    admin_tab_history: { pl: 'Historia zapytań', ru: 'История запросов', en: 'Query history' },

    // Workers tab
    admin_eyebrow_workers: { pl: 'Pracownicy', ru: 'Сотрудники', en: 'Workers' },
    admin_workers_subtitle: {
      pl: 'Wybierz konkretnego pracownika, zeby zobaczyc jego zapytania, leady, foldery i notatki.',
      ru: 'Выберите конкретного сотрудника, чтобы увидеть его запросы, лиды, папки и заметки.',
      en: 'Pick a specific worker to see their queries, leads, folders, and notes.'
    },
    admin_workers_search_placeholder: { pl: 'Szukaj worker ID...', ru: 'Поиск по worker ID...', en: 'Search worker ID...' },
    admin_aria_select_all_workers: { pl: 'Zaznacz wszystkich workerów', ru: 'Выбрать всех сотрудников', en: 'Select all workers' },
    admin_aria_select_worker: { pl: 'Zaznacz workera', ru: 'Выбрать сотрудника', en: 'Select worker' },
    admin_th_worker: { pl: 'Pracownik', ru: 'Сотрудник', en: 'Worker' },
    admin_th_leads: { pl: 'Leady', ru: 'Лиды', en: 'Leads' },
    admin_th_queries: { pl: 'Zapytania', ru: 'Запросы', en: 'Queries' },
    admin_th_meetings: { pl: 'Spotkania', ru: 'Встречи', en: 'Meetings' },
    admin_th_last_active: { pl: 'Ostatnia aktywnosc', ru: 'Последняя активность', en: 'Last active' },
    admin_th_actions: { pl: 'Akcje', ru: 'Действия', en: 'Actions' },
    admin_btn_open_profile: { pl: 'Otwórz profil', ru: 'Открыть профиль', en: 'Open profile' },
    admin_btn_delete: { pl: 'Usuń', ru: 'Удалить', en: 'Delete' },
    admin_bulk_none_selected: { pl: 'Nic nie zaznaczono', ru: 'Ничего не выбрано', en: 'Nothing selected' },
    admin_bulk_selected_template: { pl: 'Zaznaczono: {n} z {total}', ru: 'Выбрано: {n} из {total}', en: 'Selected: {n} of {total}' },
    admin_bulk_selected_bare_template: { pl: 'Zaznaczono: {n}', ru: 'Выбрано: {n}', en: 'Selected: {n}' },
    admin_btn_activate: { pl: 'Aktywuj', ru: 'Активировать', en: 'Activate' },
    admin_btn_deactivate: { pl: 'Dezaktywuj', ru: 'Деактивировать', en: 'Deactivate' },
    admin_btn_return_worker_leads: { pl: 'Wróć leady do puli', ru: 'Вернуть лиды в пул', en: 'Return leads to pool' },
    admin_btn_delete_selected_accounts: { pl: 'Usuń zaznaczone konta', ru: 'Удалить выбранные аккаунты', en: 'Delete selected accounts' },
    admin_workers_empty: { pl: 'Brak workerów dla tego filtra.', ru: 'Нет сотрудников для этого фильтра.', en: 'No workers match this filter.' },
    admin_status_active: { pl: 'aktywny', ru: 'активен', en: 'active' },
    admin_status_inactive: { pl: 'nieaktywny', ru: 'неактивен', en: 'inactive' },
    admin_label_opened: { pl: 'otwarte', ru: 'открыто', en: 'opened' },
    admin_label_dup_short: { pl: 'dubl', ru: 'дубл', en: 'dup' },

    // Worker detail panel
    admin_worker_profile_eyebrow: { pl: 'Profil pracownika', ru: 'Профиль сотрудника', en: 'Worker profile' },
    admin_select_worker_placeholder: { pl: 'Wybierz pracownika', ru: 'Выберите сотрудника', en: 'Select a worker' },
    admin_select_worker_hint: {
      pl: 'Po wyborze zobaczysz jego zapytania, statusy i historię.',
      ru: 'После выбора вы увидите его запросы, статусы и историю.',
      en: 'Once selected, you will see their queries, statuses, and history.'
    },
    admin_worker_account_link: { pl: 'Konto workera', ru: 'Аккаунт сотрудника', en: 'Worker account' },
    admin_btn_change_password: { pl: 'Zmień hasło', ru: 'Изменить пароль', en: 'Change password' },
    admin_btn_daily_lead_limit: { pl: 'Limit leadów', ru: 'Лимит лидов', en: 'Lead limit' },
    admin_btn_clear_history: { pl: 'Wyczyść historię', ru: 'Очистить историю', en: 'Clear history' },
    admin_btn_delete_worker: { pl: 'Usuń workera', ru: 'Удалить сотрудника', en: 'Delete worker' },
    admin_stat_open: { pl: 'Otwarte', ru: 'Открытые', en: 'Opened' },
    admin_stat_ai: { pl: 'AI', ru: 'AI', en: 'AI' },
    admin_stat_statuses: { pl: 'Statusy', ru: 'Статусы', en: 'Statuses' },
    admin_stat_conversion: { pl: 'Konwersja', ru: 'Конверсия', en: 'Conversion' },
    admin_worker_runs_heading: { pl: 'Zapytania parsera tego pracownika', ru: 'Запросы парсера этого сотрудника', en: "This worker's parser queries" },
    admin_worker_runs_count_template: { pl: '{n} zapytań', ru: '{n} запросов', en: '{n} queries' },
    admin_worker_runs_hint: {
      pl: 'Kliknij "Otwórz", żeby zobaczyć konkretne firmy znalezione w tym zapytaniu - ich status, komentarze i folder.',
      ru: 'Нажмите «Открыть», чтобы увидеть конкретные компании, найденные в этом запросе — их статус, комментарии и папку.',
      en: 'Click "Open" to see the specific companies found in this query - their status, comments, and folder.'
    },
    admin_worker_no_runs: {
      pl: 'Ten worker nie ma zapisanych zapytań parsera.',
      ru: 'У этого сотрудника нет сохранённых запросов парсера.',
      en: 'This worker has no saved parser queries.'
    },
    admin_worker_folders_heading: { pl: 'Foldery i notatki pracownika', ru: 'Папки и заметки сотрудника', en: 'Worker folders and notes' },
    admin_worker_saved_count_template: { pl: '{n} zapisanych · {m} folderów', ru: '{n} сохранено · {m} папок', en: '{n} saved · {m} folders' },
    admin_worker_no_folders: {
      pl: 'Worker nie utworzył jeszcze żadnego folderu.',
      ru: 'Сотрудник ещё не создал ни одной папки.',
      en: 'This worker has not created any folders yet.'
    },
    admin_worker_no_saved: {
      pl: 'Worker nie zapisał jeszcze żadnej firmy.',
      ru: 'Сотрудник ещё не сохранил ни одной компании.',
      en: 'This worker has not saved any companies yet.'
    },
    admin_no_folder: { pl: 'bez folderu', ru: 'без папки', en: 'no folder' },
    admin_label_crm_status_colon: { pl: 'status CRM:', ru: 'статус CRM:', en: 'CRM status:' },
    admin_worker_weak_spots_heading: {
      pl: 'Słabe strony (wyniki testów poniżej 70%)',
      ru: 'Слабые места (результаты тестов ниже 70%)',
      en: 'Weak spots (test scores below 70%)'
    },
    admin_worker_no_weak_spots: {
      pl: 'Brak wykrytych słabych stron — albo pracownik jeszcze nie robił testów.',
      ru: 'Слабые места не обнаружены — либо сотрудник ещё не проходил тесты.',
      en: 'No weak spots detected - or the worker has not taken any tests yet.'
    },
    admin_worker_ai_training_heading: { pl: 'Historia treningów AI', ru: 'История AI-тренировок', en: 'AI training history' },
    admin_worker_no_ai_training: {
      pl: 'Ten pracownik nie trenował jeszcze rozmów z AI.',
      ru: 'Этот сотрудник ещё не тренировал разговоры с AI.',
      en: 'This worker has not trained AI calls yet.'
    },
    admin_academy_progress_all_heading: { pl: 'Progres akademii - wszyscy', ru: 'Прогресс академии — все', en: 'Academy progress - everyone' },
    admin_academy_no_progress: { pl: 'Brak zapisanych postępów akademii.', ru: 'Нет сохранённого прогресса академии.', en: 'No academy progress recorded.' },
    admin_loading_profile: { pl: 'Ładowanie profilu...', ru: 'Загрузка профиля...', en: 'Loading profile...' },
    admin_label_last_colon: { pl: 'ostatnio:', ru: 'последний раз:', en: 'last:' },
    admin_label_stage_colon: { pl: 'Etap ścieżki:', ru: 'Этап пути:', en: 'Path stage:' },
    admin_label_completed_count_suffix: { pl: 'przerobionych', ru: 'пройдено', en: 'completed' },
    admin_label_modules_colon: { pl: 'Moduły:', ru: 'Модули:', en: 'Modules:' },
    admin_label_scripts_examples_colon: { pl: 'Skrypty i przykłady:', ru: 'Скрипты и примеры:', en: 'Scripts and examples:' },
    admin_label_opened_count_suffix: { pl: 'otwartych', ru: 'открыто', en: 'opened' },
    admin_label_avg_test_score_colon: { pl: 'Średni wynik testów:', ru: 'Средний результат тестов:', en: 'Average test score:' },
    admin_label_avg_score_colon: { pl: 'średni wynik:', ru: 'средний результат:', en: 'avg. score:' },
    admin_stage_services: { pl: 'Usługi', ru: 'Услуги', en: 'Services' },
    admin_stage_training: { pl: 'Szkolenie', ru: 'Обучение', en: 'Training' },
    admin_stage_scripts: { pl: 'Skrypty', ru: 'Скрипты', en: 'Scripts' },
    admin_stage_ai_trainer: { pl: 'Trener AI', ru: 'AI-тренер', en: 'AI trainer' },
    admin_stage_completed: { pl: 'Ukończono', ru: 'Завершено', en: 'Completed' },

    // Leads tab
    admin_leads_subtitle: {
      pl: '"Wróć do puli" zwalnia przypisanie do workera. Firma, jej kontakty, komentarze, status CRM i foldery nigdy nie są usuwane.',
      ru: '«Вернуть в пул» снимает привязку к сотруднику. Компания, её контакты, комментарии, статус CRM и папки никогда не удаляются.',
      en: '"Return to pool" releases the worker assignment. The company, its contacts, comments, CRM status, and folders are never deleted.'
    },
    admin_leads_search_placeholder: { pl: 'Szukaj firmy, telefonu, miasta...', ru: 'Поиск компании, телефона, города...', en: 'Search company, phone, city...' },
    admin_status_all: { pl: 'Wszystkie statusy', ru: 'Все статусы', en: 'All statuses' },
    admin_pool_all: { pl: 'Pool: wszystkie', ru: 'Пул: все', en: 'Pool: all' },
    admin_placeholder_worker_id: { pl: 'Worker ID', ru: 'Worker ID', en: 'Worker ID' },
    admin_placeholder_city: { pl: 'Miasto', ru: 'Город', en: 'City' },
    admin_placeholder_category: { pl: 'Kategoria / nisza', ru: 'Категория / ниша', en: 'Category / niche' },
    admin_placeholder_country: { pl: 'Kraj', ru: 'Страна', en: 'Country' },
    admin_btn_clear_filters: { pl: 'Wyczyść filtry', ru: 'Очистить фильтры', en: 'Clear filters' },
    admin_select_all_on_page: { pl: 'zaznacz wszystko na tej stronie', ru: 'выбрать всё на этой странице', en: 'select all on this page' },
    admin_select_all_matching_template: { pl: 'Zaznacz wszystkie pasujące ({n})', ru: 'Выбрать все подходящие ({n})', en: 'Select all matching ({n})' },
    admin_btn_return_selected_to_pool: { pl: 'Wróć zaznaczone do puli', ru: 'Вернуть выбранное в пул', en: 'Return selected to pool' },
    admin_th_company: { pl: 'Firma', ru: 'Компания', en: 'Company' },
    admin_th_status: { pl: 'Status', ru: 'Статус', en: 'Status' },
    admin_th_contact: { pl: 'Kontakt', ru: 'Контакт', en: 'Contact' },
    admin_th_source: { pl: 'Zrodlo', ru: 'Источник', en: 'Source' },
    admin_th_notes: { pl: 'Notatki', ru: 'Заметки', en: 'Notes' },
    admin_leads_empty: { pl: 'Brak leadów dla tego filtra.', ru: 'Нет лидов для этого фильтра.', en: 'No leads match this filter.' },
    admin_pagination_prev: { pl: '← Poprzednia', ru: '← Предыдущая', en: '← Previous' },
    admin_pagination_next: { pl: 'Następna →', ru: 'Следующая →', en: 'Next →' },
    admin_pagination_page_template: { pl: 'Strona {page} / {count}', ru: 'Страница {page} / {count}', en: 'Page {page} / {count}' },
    admin_link_source: { pl: 'źródło', ru: 'источник', en: 'source' },
    admin_btn_open_lead: { pl: 'Otwórz lead', ru: 'Открыть лид', en: 'Open lead' },
    admin_inbound_chip: { pl: 'Zgłoszenie ze strony', ru: 'Заявка с сайта', en: 'Website submission' },
    admin_no_name: { pl: 'Bez nazwy', ru: 'Без названия', en: 'Unnamed' },

    // Lead modal
    admin_lead_card_eyebrow: { pl: 'Karta leada', ru: 'Карточка лида', en: 'Lead card' },
    admin_lead_data_heading: { pl: 'Dane', ru: 'Данные', en: 'Data' },
    admin_label_status: { pl: 'Status:', ru: 'Статус:', en: 'Status:' },
    admin_label_pool: { pl: 'Pool:', ru: 'Пул:', en: 'Pool:' },
    admin_label_worker: { pl: 'Worker:', ru: 'Воркер:', en: 'Worker:' },
    admin_label_phone: { pl: 'Telefon:', ru: 'Телефон:', en: 'Phone:' },
    admin_label_email: { pl: 'Email:', ru: 'Email:', en: 'Email:' },
    admin_label_site_source: { pl: 'Strona/źródło:', ru: 'Сайт/источник:', en: 'Site/source:' },
    admin_label_type: { pl: 'Typ:', ru: 'Тип:', en: 'Type:' },
    admin_value_inbound_submission: { pl: 'Zgłoszenie z formularza strony', ru: 'Заявка с формы сайта', en: 'Website form submission' },
    admin_label_services: { pl: 'Usługi:', ru: 'Услуги:', en: 'Services:' },
    admin_label_goal: { pl: 'Cel:', ru: 'Цель:', en: 'Goal:' },
    admin_label_budget: { pl: 'Budżet:', ru: 'Бюджет:', en: 'Budget:' },
    admin_label_has_website: { pl: 'Ma stronę:', ru: 'Есть сайт:', en: 'Has website:' },
    admin_label_message: { pl: 'Wiadomość:', ru: 'Сообщение:', en: 'Message:' },
    admin_lead_category_ai_heading: { pl: 'Kategoria / AI', ru: 'Категория / AI', en: 'Category / AI' },
    admin_label_actual_type: { pl: 'Rzeczywisty typ:', ru: 'Фактический тип:', en: 'Actual type:' },
    admin_label_category_match: { pl: 'Dopasowanie kategorii:', ru: 'Совпадение категории:', en: 'Category match:' },
    admin_label_should_call: { pl: 'Zadzwonić:', ru: 'Стоит звонить:', en: 'Should call:' },
    admin_value_no: { pl: 'Nie', ru: 'Нет', en: 'No' },
    admin_value_yes_check: { pl: 'Tak / sprawdzić', ru: 'Да / проверить', en: 'Yes / check' },
    admin_label_ai_score: { pl: 'Wynik AI:', ru: 'Оценка AI:', en: 'AI score:' },
    admin_label_opening: { pl: 'Otwarcie:', ru: 'Открытие разговора:', en: 'Opening:' },
    // AI usage/cost badges (run list, run detail, lead row/modal, Academy overview).
    admin_label_ai_usage_colon: { pl: 'Koszt AI:', ru: 'Расход AI:', en: 'AI cost:' },
    admin_ai_cost_label: { pl: 'Koszt AI:', ru: 'Расход AI:', en: 'AI cost:' },
    admin_value_no_ai_usage: { pl: 'brak zapytań AI', ru: 'нет обращений к AI', en: 'no AI usage' },
    admin_lead_history_heading: { pl: 'Historia', ru: 'История', en: 'History' },
    admin_no_status_history: { pl: 'Brak historii statusów.', ru: 'Нет истории статусов.', en: 'No status history.' },
    admin_lead_management_heading: { pl: 'Zarządzanie', ru: 'Управление', en: 'Management' },

    // Inbox tab
    admin_inbox_eyebrow: { pl: 'Poczta', ru: 'Почта', en: 'Mail' },
    admin_inbox_subtitle: {
      pl: 'Wszystkie wypełnione formularze "Bezpłatny rozbiór" z auraglobal. Najnowsze na górze. "Otwórz kartę" pokazuje pełne dane leada i pozwala zmienić status.',
      ru: 'Все заполненные формы «Бесплатный разбор» с auraglobal. Новые сверху. «Открыть карту» показывает полные данные лида и позволяет изменить статус.',
      en: 'All submitted "Free breakdown" forms from auraglobal. Newest first. "Open card" shows full lead data and lets you change the status.'
    },
    admin_btn_mark_all_read: { pl: 'Oznacz wszystkie jako przeczytane', ru: 'Отметить все как прочитанные', en: 'Mark all as read' },
    admin_btn_mark_read: { pl: 'Oznacz jako przeczytane', ru: 'Отметить как прочитанное', en: 'Mark as read' },
    admin_btn_open_card: { pl: 'Otwórz kartę', ru: 'Открыть карту', en: 'Open card' },
    admin_inbox_empty: { pl: 'Brak zgłoszeń ze strony jeszcze.', ru: 'Пока нет заявок с сайта.', en: 'No website submissions yet.' },

    // History tab
    admin_history_title: { pl: 'Historia parsera', ru: 'История парсера', en: 'Parser history' },
    admin_history_subtitle: {
      pl: 'Zadne leady, komentarze, statusy ani foldery nie sa tu nigdy usuwane. "Wroc do puli" oddaje zapytanie do ponownego przetworzenia i archiwizuje wpis historii - nic nie znika na stale.',
      ru: 'Лиды, комментарии, статусы и папки здесь никогда не удаляются. «Вернуть в пул» отдаёт запрос на повторную обработку и архивирует запись истории — ничего не исчезает навсегда.',
      en: 'Leads, comments, statuses, and folders are never deleted here. "Return to pool" sends the query back for reprocessing and archives the history entry - nothing disappears permanently.'
    },
    admin_history_tab_active: { pl: 'Aktywne', ru: 'Активные', en: 'Active' },
    admin_history_tab_completed: { pl: 'Zakończone', ru: 'Завершённые', en: 'Completed' },
    admin_history_tab_returned: { pl: 'Zwrócone do puli', ru: 'Возвращённые в пул', en: 'Returned to pool' },
    admin_history_tab_archived: { pl: 'Archiwum', ru: 'Архив', en: 'Archive' },
    admin_history_filters_toggle: { pl: 'Filtry i akcje zbiorcze', ru: 'Фильтры и массовые действия', en: 'Filters and bulk actions' },
    admin_history_status_all: { pl: 'Status: wszystkie', ru: 'Статус: все', en: 'Status: all' },
    admin_date_from: { pl: 'Data od', ru: 'Дата от', en: 'Date from' },
    admin_date_to: { pl: 'Data do', ru: 'Дата до', en: 'Date to' },
    admin_btn_filter: { pl: 'Filtruj', ru: 'Фильтровать', en: 'Filter' },
    admin_btn_show_matching_queries: { pl: 'Pokaż pasujące zapytania', ru: 'Показать подходящие запросы', en: 'Show matching queries' },
    admin_btn_return_selected_queries: { pl: 'Wróć zaznaczone zapytania do puli', ru: 'Вернуть выбранные запросы в пул', en: 'Return selected queries to pool' },
    admin_history_loading: { pl: 'Ładowanie historii...', ru: 'Загрузка истории...', en: 'Loading history...' },
    admin_history_empty: { pl: 'Brak zapytań dla tego filtra/zakładki.', ru: 'Нет запросов для этого фильтра/вкладки.', en: 'No queries for this filter/tab.' },
    admin_history_list_empty: { pl: 'Brak historii parsera dla tego filtra/zakładki.', ru: 'Нет истории парсера для этого фильтра/вкладки.', en: 'No parser history for this filter/tab.' },
    admin_archive_empty: { pl: 'Archiwum jest puste.', ru: 'Архив пуст.', en: 'The archive is empty.' },
    admin_run_detail_placeholder: {
      pl: 'Otwórz zapytanie, żeby zobaczyć konkretne leady z tej historii.',
      ru: 'Откройте запрос, чтобы увидеть конкретные лиды из этой истории.',
      en: 'Open a query to see the specific leads from this history entry.'
    },
    admin_run_no_active_leads: { pl: 'Brak aktywnych leadów w tym zapytaniu.', ru: 'В этом запросе нет активных лидов.', en: 'No active leads in this query.' },
    admin_run_search_queries_label: { pl: 'Zapytania wyszukiwania:', ru: 'Поисковые запросы:', en: 'Search queries:' },
    admin_btn_restore_from_archive: { pl: 'Przywróć z archiwum', ru: 'Восстановить из архива', en: 'Restore from archive' },
    admin_badge_returned_to_pool: { pl: 'Zwrócone do puli', ru: 'Возвращено в пул', en: 'Returned to pool' },
    admin_badge_archived: { pl: 'Zarchiwizowane', ru: 'В архиве', en: 'Archived' },
    admin_run_default_title: { pl: 'Zapytanie', ru: 'Запрос', en: 'Query' },
    admin_run_found_label: { pl: 'Znaleziono', ru: 'Найдено', en: 'Found' },
    admin_run_new_label: { pl: 'nowe', ru: 'новые', en: 'new' },
    admin_run_duplicates_label: { pl: 'duble', ru: 'дубли', en: 'duplicates' },
    admin_run_wrong_category_label: { pl: 'zła kategoria', ru: 'не та категория', en: 'wrong category' },
    admin_run_worker_colon: { pl: 'worker:', ru: 'воркер:', en: 'worker:' },
    admin_run_radius_label: { pl: 'promień', ru: 'радиус', en: 'radius' },
    admin_lead_category_score_label: { pl: 'kategoria', ru: 'категория', en: 'category' },
    // Per-run status breakdown shown in the worker profile's run list (item 1
    // of the batch-fixes round) - lets an admin see at a glance whether a
    // query still needs attention without opening it.
    admin_run_status_summary_template: {
      pl: 'nieobsłużone: {notProcessed} · obsłużone: {processed} · z komentarzami: {comments}',
      ru: 'не обработано: {notProcessed} · обработано: {processed} · есть комментарии: {comments}',
      en: 'not processed: {notProcessed} · processed: {processed} · with comments: {comments}'
    },
    admin_run_status_duplicates_only: { pl: 'Tylko duplikaty / brak nowych', ru: 'Только дубли / новых нет', en: 'Duplicates only / no new' },
    admin_run_status_cancelled: { pl: 'Anulowano', ru: 'Отменено', en: 'Cancelled' },
    admin_run_status_completed: { pl: 'Zakończone', ru: 'Завершено', en: 'Completed' },
    admin_run_status_exhausted: { pl: 'Wyczerpane', ru: 'Исчерпано', en: 'Exhausted' },
    admin_run_status_failed: { pl: 'Błąd', ru: 'Ошибка', en: 'Failed' },
    admin_run_status_running: { pl: 'W trakcie', ru: 'В процессе', en: 'Running' },
    admin_run_status_discovering: { pl: 'W trakcie', ru: 'В процессе', en: 'Running' },
    admin_run_status_timeout: { pl: 'Przekroczono czas', ru: 'Превышено время ожидания', en: 'Timed out' },
    admin_run_company_count_template: { pl: ' ({n} firm)', ru: ' ({n} компаний)', en: ' ({n} companies)' },
    admin_preview_matching_queries: { pl: 'Pasujące zapytania:', ru: 'Подходящие запросы:', en: 'Matching queries:' },
    admin_preview_unique_companies: { pl: 'Unikalnych firm:', ru: 'Уникальных компаний:', en: 'Unique companies:' },
    admin_preview_new: { pl: 'Nowych:', ru: 'Новых:', en: 'New:' },
    admin_preview_duplicates: { pl: 'Dubli:', ru: 'Дублей:', en: 'Duplicates:' },
    admin_preview_workers: { pl: 'Workerów:', ru: 'Сотрудников:', en: 'Workers:' },
    admin_preview_confirm_template: { pl: 'Wróć do puli ({n})', ru: 'Вернуть в пул ({n})', en: 'Return to pool ({n})' },

    // Academy tab
    admin_academy_eyebrow: { pl: 'Akademia sprzedaży', ru: 'Академия продаж', en: 'Sales academy' },
    admin_academy_progress_title: {
      pl: 'Postęp i słabe strony — wszyscy pracownicy',
      ru: 'Прогресс и слабые места — все сотрудники',
      en: 'Progress and weak spots - all workers'
    },
    admin_academy_progress_subtitle: {
      pl: 'Pełny obraz tego, co każdy pracownik już umie, a gdzie ma realne braki: wyniki testów per moduł/usługa, wyniki treningów AI i skuteczność domykania spotkań w symulacjach.',
      ru: 'Полная картина того, что каждый сотрудник уже умеет, а где есть реальные пробелы: результаты тестов по модулям/услугам, результаты AI-тренировок и эффективность закрытия встреч в симуляциях.',
      en: 'A full picture of what every worker already knows and where the real gaps are: test scores per module/service, AI training scores, and meeting-closing performance in simulations.'
    },
    admin_th_employee: { pl: 'Pracownik', ru: 'Сотрудник', en: 'Worker' },
    admin_th_stage: { pl: 'Etap ścieżki', ru: 'Этап пути', en: 'Path stage' },
    admin_th_services: { pl: 'Usługi', ru: 'Услуги', en: 'Services' },
    admin_th_modules: { pl: 'Moduły', ru: 'Модули', en: 'Modules' },
    admin_th_scripts: { pl: 'Skrypty', ru: 'Скрипты', en: 'Scripts' },
    admin_th_avg_test_score: { pl: 'Śr. wynik testów', ru: 'Ср. результат тестов', en: 'Avg. test score' },
    admin_th_weak_spots: { pl: 'Słabe strony', ru: 'Слабые места', en: 'Weak spots' },
    admin_th_ai_trainings: { pl: 'Treningi AI', ru: 'AI-тренировки', en: 'AI trainings' },
    admin_th_avg_ai_score: { pl: 'Śr. wynik AI', ru: 'Ср. результат AI', en: 'Avg. AI score' },
    admin_th_sim_meeting: { pl: 'Spotkanie w symulacji', ru: 'Встреча в симуляции', en: 'Simulated meeting' },
    admin_th_ai_usage: { pl: 'Zużycie AI', ru: 'Расход AI', en: 'AI usage' },
    admin_th_last_activity: { pl: 'Ostatnia aktywność', ru: 'Последняя активность', en: 'Last activity' },
    admin_weak_spots_count_template: { pl: '{n} obszarów', ru: '{n} областей', en: '{n} areas' },
    admin_weak_spots_none: { pl: 'brak', ru: 'нет', en: 'none' },
    admin_academy_ai_usage_template: { pl: '{count}x / ${cost}', ru: '{count} раз / ${cost}', en: '{count}x / ${cost}' },
    admin_no_workers: { pl: 'Brak workerów.', ru: 'Нет сотрудников.', en: 'No workers.' },
    admin_ai_costs_eyebrow: { pl: 'Koszty AI', ru: 'Расходы на AI', en: 'AI costs' },
    admin_ai_costs_title: { pl: 'Zużycie i koszty AI-treningu', ru: 'Использование и стоимость AI-тренировок', en: 'AI training usage & costs' },
    admin_ai_costs_subtitle: {
      pl: 'Szacunkowe koszty (nie rozliczeniowe) wywołań AI: trening rozmów, ocena treningu i ocena otwartych odpowiedzi w testach.',
      ru: 'Приблизительная стоимость (не для расчётов) обращений к AI: тренировка разговоров, оценка тренировки и оценка открытых ответов в тестах.',
      en: 'Estimated (non-billing) cost of AI calls: call training, training evaluation, and grading open test answers.'
    },
    admin_period_today: { pl: 'Dziś', ru: 'Сегодня', en: 'Today' },
    admin_period_7d: { pl: '7 dni', ru: '7 дней', en: '7 days' },
    admin_period_30d: { pl: '30 dni', ru: '30 дней', en: '30 days' },
    admin_period_all: { pl: 'Cały okres', ru: 'Всё время', en: 'All time' },
    admin_by_worker_heading: { pl: 'Wg pracownika', ru: 'По сотруднику', en: 'By worker' },
    admin_by_feature_heading: { pl: 'Wg funkcji', ru: 'По функции', en: 'By feature' },
    admin_th_tokens: { pl: 'Tokeny', ru: 'Токены', en: 'Tokens' },
    admin_th_cost_est: { pl: 'Koszt (szac.)', ru: 'Стоимость (оценка)', en: 'Cost (est.)' },
    admin_th_feature: { pl: 'Funkcja', ru: 'Функция', en: 'Feature' },

    // AI usage "By feature" table - raw backend feature codes (recordAiUsage()
    // callers in server.js) mapped to human labels. Same fallback pattern as
    // admin_audit_action_* below (auditActionLabel()): anything not listed here
    // falls back to the raw code, so this list doesn't need to be exhaustive.
    admin_ai_feature_ai_training: { pl: 'Trening rozmów AI', ru: 'AI-тренировка разговоров', en: 'AI call training' },
    admin_ai_feature_academy_grading: { pl: 'Ocena odpowiedzi (Akademia)', ru: 'Оценка ответов (Академия)', en: 'Answer grading (Academy)' },
    admin_ai_feature_lead_analysis: { pl: 'AI-analiza leada', ru: 'AI-анализ лида', en: 'Lead AI analysis' },
    // Worker weak-spots panel (quizKeyLabel()/academyModuleLabel() in
    // public/admin/app.js) - module names and the "question"/"case" words
    // used to be hardcoded Polish, ignoring the language toggle.
    admin_academy_module_scripts: { pl: 'Script Trainer', ru: 'Тренажёр скриптов', en: 'Script Trainer' },
    admin_academy_module_objections: { pl: 'Obiekcje', ru: 'Возражения', en: 'Objections' },
    admin_academy_module_statuses: { pl: 'Statusy', ru: 'Статусы', en: 'Statuses' },
    admin_academy_module_qualification: { pl: 'Kwalifikacja leadów', ru: 'Квалификация лидов', en: 'Lead qualification' },
    admin_academy_module_final: { pl: 'Final Test', ru: 'Финальный тест', en: 'Final Test' },
    admin_quiz_question_word: { pl: 'pytanie', ru: 'вопрос', en: 'question' },
    admin_quiz_case_word: { pl: 'przypadek', ru: 'случай', en: 'case' },
    admin_quiz_match_service_label: { pl: 'Dopasuj usługę', ru: 'Подбор услуги', en: 'Match the service' },
    // Admin lead modal's category-match display (categoryMatchLabel()) -
    // mirrors Parser's public/app.js categoryMatchLabel ternary in the
    // Overview tab, so the same raw match/partial/mismatch code isn't shown
    // verbatim in Admin.
    admin_category_match_match: { pl: 'Pasuje', ru: 'Подходит', en: 'Matches' },
    admin_category_match_partial: { pl: 'Sprawdzić ręcznie', ru: 'Проверить вручную', en: 'Needs manual check' },
    admin_category_match_mismatch: { pl: 'Nie pasuje', ru: 'Не подходит', en: 'Does not match' },
    admin_stat_ai_requests: { pl: 'Zapytania AI', ru: 'Запросы к AI', en: 'AI requests' },
    admin_stat_estimated_cost: { pl: 'Szacowany koszt', ru: 'Ориентировочная стоимость', en: 'Estimated cost' },
    admin_no_data_period: { pl: 'Brak danych w tym okresie.', ru: 'Нет данных за этот период.', en: 'No data for this period.' },
    admin_value_unknown: { pl: 'nieznane', ru: 'неизвестно', en: 'unknown' },

    // AI training transcript modal
    admin_ai_training_transcript_heading: { pl: 'Trening AI — transkrypt', ru: 'AI-тренировка — транскрипт', en: 'AI training - transcript' },
    admin_loading_generic: { pl: 'Ładowanie...', ru: 'Загрузка...', en: 'Loading...' },
    admin_label_client_type: { pl: 'Typ klienta:', ru: 'Тип клиента:', en: 'Client type:' },
    admin_label_score: { pl: 'Wynik:', ru: 'Результат:', en: 'Score:' },
    admin_meeting_booked_yes: { pl: '✅ spotkanie umówione', ru: '✅ встреча назначена', en: '✅ meeting booked' },
    admin_meeting_booked_no: { pl: '❌ spotkanie nieumówione', ru: '❌ встреча не назначена', en: '❌ meeting not booked' },
    admin_meeting_short_yes: { pl: '✅ spotkanie', ru: '✅ встреча', en: '✅ meeting' },
    admin_meeting_short_no: { pl: '❌ brak spotkania', ru: '❌ без встречи', en: '❌ no meeting' },
    admin_role_seller: { pl: 'Sprzedawca', ru: 'Продавец', en: 'Seller' },
    admin_role_client: { pl: 'Klient', ru: 'Клиент', en: 'Client' },
    admin_feedback_good_heading: { pl: 'Co poszło dobrze', ru: 'Что прошло хорошо', en: 'What went well' },
    admin_feedback_bad_heading: { pl: 'Co wymaga poprawy', ru: 'Что нужно улучшить', en: 'What needs improvement' },
    admin_feedback_improve_heading: { pl: 'Jak poprawić następnym razem', ru: 'Как улучшить в следующий раз', en: 'How to improve next time' },
    admin_error_fetch_transcript: { pl: 'Nie udało się pobrać transkryptu.', ru: 'Не удалось загрузить транскрипт.', en: 'Failed to load the transcript.' },

    // Auth screens (admin login / access denied) - language uses stored/browser
    // detection since no in-app toggle is reachable before login, same
    // convention as the Academy auth screen above.
    admin_auth_eyebrow: { pl: 'Aura Admin', ru: 'Aura Admin', en: 'Aura Admin' },
    admin_login_title: { pl: 'Logowanie administratora', ru: 'Вход администратора', en: 'Admin login' },
    admin_login_hint: {
      pl: 'Panel admina wymaga osobnego dostepu. Worker nie ma dostepu do danych globalnych.',
      ru: 'Админ-панель требует отдельного доступа. У сотрудника нет доступа к глобальным данным.',
      en: 'The admin panel requires separate access. Workers do not have access to global data.'
    },
    admin_field_login: { pl: 'Login', ru: 'Логин', en: 'Login' },
    admin_field_password: { pl: 'Hasło', ru: 'Пароль', en: 'Password' },
    admin_access_denied_title: { pl: 'Brak dostepu', ru: 'Нет доступа', en: 'Access denied' },
    admin_access_denied_hint: {
      pl: 'To konto nie ma uprawnien administratora. Worker nie ma dostepu do panelu admina.',
      ru: 'У этой учётной записи нет прав администратора. Сотрудник не имеет доступа к админ-панели.',
      en: 'This account does not have administrator permissions. Workers do not have access to the admin panel.'
    },
    admin_access_denied_feedback: {
      pl: 'Zaloguj sie jako administrator albo wroc do swojej aplikacji.',
      ru: 'Войдите как администратор или вернитесь в своё приложение.',
      en: 'Log in as an administrator or go back to your app.'
    },

    // Create-worker dialog
    admin_field_display_name: { pl: 'Nazwa wyświetlana', ru: 'Отображаемое имя', en: 'Display name' },
    admin_field_language: { pl: 'Język', ru: 'Язык', en: 'Language' },
    admin_field_active: { pl: 'aktywny', ru: 'активен', en: 'active' },
    admin_field_daily_lead_limit: { pl: 'Dzienny limit leadów', ru: 'Дневной лимит лидов', en: 'Daily lead limit' },
    admin_btn_create_account: { pl: 'Stwórz konto', ru: 'Создать аккаунт', en: 'Create account' },

    // CRM status labels (crmStatusAdminLabel)
    admin_crm_nowy: { pl: 'Nowy', ru: 'Новый', en: 'New' },
    admin_crm_do_kontaktu: { pl: 'Do kontaktu', ru: 'К контакту', en: 'To contact' },
    admin_crm_proba_kontaktu: { pl: 'Próba kontaktu', ru: 'Попытка контакта', en: 'Contact attempt' },
    admin_crm_brak_odpowiedzi: { pl: 'Brak odpowiedzi', ru: 'Нет ответа', en: 'No answer' },
    admin_crm_oddzwonic: { pl: 'Oddzwonić', ru: 'Перезвонить', en: 'Call back' },
    admin_crm_zainteresowany: { pl: 'Zainteresowany', ru: 'Заинтересован', en: 'Interested' },
    admin_crm_oferta_wyslana: { pl: 'Oferta wysłana', ru: 'Оферта отправлена', en: 'Offer sent' },
    admin_crm_umowione_spotkanie: { pl: 'Umówione spotkanie', ru: 'Назначена встреча', en: 'Meeting booked' },
    admin_crm_klient: { pl: 'Klient', ru: 'Клиент', en: 'Client' },
    admin_crm_odrzucony: { pl: 'Odrzucony', ru: 'Отклонён', en: 'Rejected' },

    // Audit panel
    admin_audit_subtitle: {
      pl: 'Akcje administratora: pracownicy, pula leadów, reset/usunięcie zapytań, aktualizacje statusów.',
      ru: 'Действия администратора: сотрудники, пул лидов, сброс/удаление запросов, обновления статусов.',
      en: 'Admin actions: workers, lead pool, query reset/delete, status updates.'
    },
    admin_audit_empty: { pl: 'Audit log jest pusty.', ru: 'Журнал действий пуст.', en: 'The audit log is empty.' },

    // Audit action codes (raw backend action strings shown in the audit log -
    // renderAudit() in admin/app.js falls back to the raw code for anything
    // not listed here, so this list doesn't need to be exhaustive).
    admin_audit_action_delete_worker: { pl: 'Usunięcie workera', ru: 'Удаление воркера', en: 'Worker deleted' },
    admin_audit_action_create_worker: { pl: 'Utworzenie workera', ru: 'Создание воркера', en: 'Worker created' },
    admin_audit_action_update_worker: { pl: 'Aktualizacja workera', ru: 'Обновление воркера', en: 'Worker updated' },
    admin_audit_action_reset_lead_to_pool: { pl: 'Zwrot leada do puli', ru: 'Возврат лида в пул', en: 'Lead returned to pool' },
    admin_audit_action_update_lead_status: { pl: 'Zmiana statusu leada', ru: 'Изменение статуса лида', en: 'Lead status changed' },
    admin_audit_action_reset_selected_leads_to_pool: {
      pl: 'Zwrot zaznaczonych leadów do puli',
      ru: 'Возврат выбранных лидов в пул',
      en: 'Selected leads returned to pool'
    },
    admin_audit_action_workers_bulk_delete: { pl: 'Masowe usunięcie workerów', ru: 'Массовое удаление воркеров', en: 'Workers bulk deleted' },
    admin_audit_action_restore_history: { pl: 'Przywrócenie z historii', ru: 'Восстановление из истории', en: 'Restored from history' },
    admin_audit_action_return_query_to_pool: { pl: 'Zwrot zapytania do puli', ru: 'Возврат запроса в пул', en: 'Query returned to pool' },
    admin_audit_action_return_lead_to_pool: { pl: 'Zwrot leada do puli', ru: 'Возврат лида в пул', en: 'Lead returned to pool' },
    admin_audit_action_update_crm_status: { pl: 'Zmiana statusu CRM', ru: 'Изменение статуса CRM', en: 'CRM status changed' },
    admin_audit_action_reset_query_to_pool: { pl: 'Reset zapytania do puli', ru: 'Сброс запроса в пул', en: 'Query reset to pool' },
    admin_audit_action_duplicates_only: { pl: 'Tylko duplikaty / brak nowych', ru: 'Только дубли / новых нет', en: 'Duplicates only / no new' },
    admin_audit_action_delete_lead_permanently: { pl: 'Trwałe usunięcie leada', ru: 'Полное удаление лида', en: 'Lead permanently deleted' },

    // Stats grid (renderStats)
    admin_stat_active_in_period: { pl: 'Aktywni w okresie', ru: 'Активные за период', en: 'Active in period' },
    admin_stat_total_leads: { pl: 'Leady w bazie', ru: 'Лиды в базе', en: 'Leads in the database' },
    admin_stat_leads_found: { pl: 'Leady znalezione', ru: 'Найдено лидов', en: 'Leads found' },
    admin_stat_ai_analyses: { pl: 'AI analizy', ru: 'AI-анализы', en: 'AI analyses' },
    admin_stat_returned_to_pool: { pl: 'Wróciły do puli', ru: 'Вернулись в пул', en: 'Returned to pool' },
    admin_stat_deleted: { pl: 'Usunięte', ru: 'Удалённые', en: 'Deleted' },

    // Toasts / confirm / prompt dialogs (dynamic template parts use {placeholders})
    admin_toast_returned_to_pool_count_template: { pl: 'Wrócono do puli: {n}', ru: 'Возвращено в пул: {n}', en: 'Returned to pool: {n}' },
    admin_toast_status_saved: { pl: 'Status zapisany', ru: 'Статус сохранён', en: 'Status saved' },
    admin_toast_worker_updated: { pl: 'Worker zaktualizowany', ru: 'Сотрудник обновлён', en: 'Worker updated' },
    admin_toast_worker_leads_returned: { pl: 'Leady workera wróciły do puli', ru: 'Лиды сотрудника возвращены в пул', en: 'Worker leads returned to pool' },
    admin_toast_worker_history_cleared: { pl: 'Historia workera wyczyszczona', ru: 'История сотрудника очищена', en: 'Worker history cleared' },
    admin_toast_worker_deleted: { pl: 'Worker usunięty', ru: 'Сотрудник удалён', en: 'Worker deleted' },
    admin_toast_password_changed: { pl: 'Hasło zmienione', ru: 'Пароль изменён', en: 'Password changed' },
    admin_toast_daily_lead_limit_updated: { pl: 'Limit leadów zaktualizowany', ru: 'Лимит лидов обновлён', en: 'Daily lead limit updated' },
    admin_toast_already_returned: { pl: 'To zapytanie już było w puli.', ru: 'Этот запрос уже был в пуле.', en: 'This query was already in the pool.' },
    admin_toast_query_returned_template: {
      pl: 'Zapytanie wróciło do puli i zostało zarchiwizowane. Firm zwróconych: {n}, już w puli: {m}.',
      ru: 'Запрос вернулся в пул и был заархивирован. Возвращено компаний: {n}, уже в пуле: {m}.',
      en: 'The query was returned to the pool and archived. Companies returned: {n}, already in pool: {m}.'
    },
    admin_toast_run_restored: { pl: 'Wpis przywrócony z archiwum do historii.', ru: 'Запись восстановлена из архива в историю.', en: 'Entry restored from the archive to history.' },
    admin_toast_bulk_action_template: { pl: 'Wykonano "{action}" dla {n} workerów', ru: 'Выполнено «{action}» для {n} сотрудников', en: 'Performed "{action}" for {n} workers' },
    admin_toast_inbox_marked_read_template: { pl: 'Oznaczono jako przeczytane: {n}', ru: 'Отмечено как прочитанное: {n}', en: 'Marked as read: {n}' },
    admin_toast_history_returned_template: {
      pl: 'Wrócono do puli: {n} zapytań, {m} unikalnych firm. {k} firm już było w puli. Komentarze, statusy i foldery zachowane.',
      ru: 'Возвращено в пул: {n} запросов, {m} уникальных компаний. {k} компаний уже было в пуле. Комментарии, статусы и папки сохранены.',
      en: 'Returned to pool: {n} queries, {m} unique companies. {k} companies were already in the pool. Comments, statuses, and folders preserved.'
    },
    admin_toast_history_preview_returned_template: {
      pl: 'Wrócono do puli: {n} zapytań i {m} unikalnych firm. Karty firm, komentarze i statusy zachowane.',
      ru: 'Возвращено в пул: {n} запросов и {m} уникальных компаний. Карточки компаний, комментарии и статусы сохранены.',
      en: 'Returned to pool: {n} queries and {m} unique companies. Company cards, comments, and statuses preserved.'
    },
    admin_toast_selected_all_matching_template: { pl: 'Zaznaczono wszystkie pasujące: {n}', ru: 'Выбраны все подходящие: {n}', en: 'Selected all matching: {n}' },
    admin_toast_admin_logged_in: { pl: 'Admin zalogowany', ru: 'Администратор вошёл', en: 'Admin logged in' },
    admin_confirm_delete_workers_template: {
      pl: 'Usunąć {n} workerów? Konta i sesje zostaną skasowane, leady wrócą do puli. Wpisz DELETE.',
      ru: 'Удалить {n} сотрудников? Аккаунты и сессии будут удалены, лиды вернутся в пул. Введите DELETE.',
      en: 'Delete {n} workers? Accounts and sessions will be deleted, leads will return to the pool. Type DELETE.'
    },
    admin_confirm_reset_workers_leads_template: { pl: 'Wrócić leady {n} workerów do puli?', ru: 'Вернуть лиды {n} сотрудников в пул?', en: 'Return the leads of {n} workers to the pool?' },
    admin_prompt_new_password_template: { pl: 'Nowe hasło dla {workerId}', ru: 'Новый пароль для {workerId}', en: 'New password for {workerId}' },
    admin_prompt_daily_lead_limit_template: {
      pl: 'Dzienny limit leadów dla {workerId} (0 = bez limitu)',
      ru: 'Дневной лимит лидов для {workerId} (0 = без лимита)',
      en: 'Daily lead limit for {workerId} (0 = unlimited)'
    },
    admin_confirm_reset_worker_leads_template: {
      pl: 'Wrócić wszystkie leady workera {workerId} do puli?',
      ru: 'Вернуть все лиды сотрудника {workerId} в пул?',
      en: 'Return all leads of worker {workerId} to the pool?'
    },
    admin_prompt_clear_history_template: {
      pl: 'Wyczyścić historię workera {workerId}? Wpisz DELETE.',
      ru: 'Очистить историю сотрудника {workerId}? Введите DELETE.',
      en: 'Clear the history of worker {workerId}? Type DELETE.'
    },
    admin_prompt_delete_worker_template: {
      pl: 'Usunąć workera {workerId}? Konto, sesje, trening AI i historia parsera zostaną skasowane, a aktywne leady wrócą do puli. Wpisz DELETE.',
      ru: 'Удалить сотрудника {workerId}? Аккаунт, сессии, AI-тренировки и история парсера будут удалены, активные лиды вернутся в пул. Введите DELETE.',
      en: 'Delete worker {workerId}? The account, sessions, AI training, and parser history will be deleted, and active leads will return to the pool. Type DELETE.'
    },
    admin_confirm_delete_run_template: {
      pl: 'Wrócić zapytanie{count} do puli i zarchiwizować wpis historii? Firmy, komentarze, statusy i foldery zostają nietknięte.',
      ru: 'Вернуть запрос{count} в пул и заархивировать запись истории? Компании, комментарии, статусы и папки останутся нетронутыми.',
      en: 'Return the query{count} to the pool and archive the history entry? Companies, comments, statuses, and folders remain untouched.'
    },
    admin_confirm_return_selected_runs_template: {
      pl: 'Wrócić do puli {n} zaznaczonych zapytań? Leady, komentarze, statusy i foldery zostają nietknięte.',
      ru: 'Вернуть в пул {n} выбранных запросов? Лиды, комментарии, статусы и папки останутся нетронутыми.',
      en: 'Return {n} selected queries to the pool? Leads, comments, statuses, and folders remain untouched.'
    },
    admin_confirm_return_preview_template: {
      pl: 'Wrócić do puli {n} zapytań i ich unikalne firmy? Komentarze, statusy i foldery zostają nietknięte.',
      ru: 'Вернуть в пул {n} запросов и их уникальные компании? Комментарии, статусы и папки останутся нетронутыми.',
      en: 'Return {n} queries and their unique companies to the pool? Comments, statuses, and folders remain untouched.'
    },
    admin_warn_select_workers: { pl: 'Zaznacz workerów.', ru: 'Выберите сотрудников.', en: 'Select workers.' },
    admin_warn_select_history_entries: { pl: 'Zaznacz wpisy historii.', ru: 'Выберите записи истории.', en: 'Select history entries.' },
    admin_warn_set_filter_first: { pl: 'Ustaw najpierw przynajmniej jeden filtr.', ru: 'Сначала задайте хотя бы один фильтр.', en: 'Set at least one filter first.' },
    admin_warn_nothing_selected_return: { pl: 'Nic nie zostało wybrane do zwrotu.', ru: 'Ничего не выбрано для возврата.', en: 'Nothing was selected to return.' },
    admin_warn_preview_build_failed: { pl: 'Nie udało się zbudować podglądu.', ru: 'Не удалось построить предпросмотр.', en: 'Failed to build the preview.' },
    admin_error_worker_open_failed: { pl: 'Nie udało się otworzyć profilu workera.', ru: 'Не удалось открыть профиль сотрудника.', en: 'Failed to open the worker profile.' },

    // ---------------------------------------------------------------------
    // Academy QA round 3 fixes: UI chrome found hardcoded to Polish when
    // drilling one level deeper (opened service cards, expanded script/
    // example cards, non-default tabs). Deep authored content (dialogue,
    // scenario client lines) stays untouched - only structural chrome below.
    // ---------------------------------------------------------------------

    // Service detail view (renderServiceDetail) - numbered section headings
    academy_service_detail_back: { pl: '← Wszystkie usługi', ru: '← Все услуги', en: '← All services' },
    academy_service_detail_mark_completed: { pl: 'Oznacz jako przerobione', ru: 'Отметить как пройденное', en: 'Mark as completed' },
    academy_service_h1: { pl: '1. Co to jest?', ru: '1. Что это?', en: '1. What is it?' },
    academy_service_h2: { pl: '2. Jak robimy to dla klienta?', ru: '2. Как мы это делаем для клиента?', en: '2. How do we do it for the client?' },
    academy_service_h3: { pl: '3. Dla kogo to jest?', ru: '3. Для кого это?', en: '3. Who is it for?' },
    academy_service_h4: { pl: '4. Jaki problem klienta rozwiązuje?', ru: '4. Какую проблему клиента решает?', en: '4. What client problem does it solve?' },
    academy_service_h5: { pl: '5. Dlaczego klientowi jest to potrzebne?', ru: '5. Почему это нужно клиенту?', en: '5. Why does the client need it?' },
    academy_service_h6: { pl: '6. Jak to pomaga zdobywać więcej zapytań/sprzedaży?', ru: '6. Как это помогает получать больше заявок/продаж?', en: '6. How does it help win more inquiries/sales?' },
    academy_service_h7: {
      pl: '7. Jak rozpoznać przed telefonem, że klient tego potrzebuje?',
      ru: '7. Как понять перед звонком, что клиенту это нужно?',
      en: '7. How to spot before the call that the client needs it?'
    },
    academy_service_h8: { pl: '8. Na co patrzeć u klienta?', ru: '8. На что обращать внимание у клиента?', en: '8. What to check about the client?' },
    academy_service_h9: { pl: '9. Jak wytłumaczyć prostymi słowami?', ru: '9. Как объяснить простыми словами?', en: '9. How to explain it in simple words?' },
    academy_service_h10: { pl: '10. Co konkretnie proponować?', ru: '10. Что конкретно предлагать?', en: '10. What exactly to propose?' },
    academy_service_h11_12: {
      pl: '11-12. Ile to kosztuje i od czego zależy cena?',
      ru: '11-12. Сколько это стоит и от чего зависит цена?',
      en: '11-12. How much does it cost and what does the price depend on?'
    },
    academy_service_h13: { pl: '13. Typowe pakiety', ru: '13. Типичные пакеты', en: '13. Typical packages' },
    academy_service_h14: { pl: '14. Częste pytania klienta', ru: '14. Частые вопросы клиента', en: '14. Common client questions' },
    academy_service_h15_16: {
      pl: '15-16. Obiekcje i jak na nie odpowiedzieć',
      ru: '15-16. Возражения и как на них отвечать',
      en: '15-16. Objections and how to answer them'
    },
    academy_service_h17: { pl: '17. Przykład krótkiej rozmowy', ru: '17. Пример короткого разговора', en: '17. Example of a short call' },
    academy_service_h18: { pl: '18. Kiedy NIE proponować tej usługi?', ru: '18. Когда НЕ предлагать эту услугу?', en: '18. When NOT to offer this service?' },
    academy_service_h19: { pl: '19. Z czym połączyć tę usługę', ru: '19. С чем сочетать эту услугу', en: '19. What to combine this service with' },

    // Service detail "what to check" checklist labels (section 8)
    academy_check_website: { pl: 'Strona internetowa', ru: 'Веб-сайт', en: 'Website' },
    academy_check_google_business: { pl: 'Google Business Profile', ru: 'Профиль Google Business', en: 'Google Business Profile' },
    academy_check_ads: { pl: 'Reklamy', ru: 'Реклама', en: 'Ads' },
    academy_check_social_media: { pl: 'Social media', ru: 'Соцсети', en: 'Social media' },
    academy_check_lead_forms: { pl: 'Formularze zgłoszeniowe', ru: 'Формы заявок', en: 'Lead forms' },
    academy_check_site_speed: { pl: 'Szybkość strony', ru: 'Скорость сайта', en: 'Site speed' },
    academy_check_automation: { pl: 'Brak automatyzacji', ru: 'Отсутствие автоматизации', en: 'No automation' },

    // Scripts & examples expanded card field labels (renderScriptCard/renderExampleCard)
    academy_script_label_situation: { pl: 'Sytuacja:', ru: 'Ситуация:', en: 'Situation:' },
    academy_script_label_goal: { pl: 'Cel:', ru: 'Цель:', en: 'Goal:' },
    academy_script_label_ready_phrase: { pl: 'Gotowa fraza:', ru: 'Готовая фраза:', en: 'Ready phrase:' },
    academy_script_label_bad_example: { pl: 'Zły przykład:', ru: 'Плохой пример:', en: 'Bad example:' },
    academy_script_label_good_example: { pl: 'Dobry przykład:', ru: 'Хороший пример:', en: 'Good example:' },
    academy_script_label_logic: { pl: 'Logika:', ru: 'Логика:', en: 'Logic:' },
    academy_script_label_what_not_to_say: { pl: 'Czego nie mówić:', ru: 'Чего не говорить:', en: 'What not to say:' },
    academy_script_label_how_to_transition: { pl: 'Jak przejść dalej:', ru: 'Как двигаться дальше:', en: 'How to move forward:' },
    academy_example_label_what_good: { pl: 'Co zrobił dobrze:', ru: 'Что сделал хорошо:', en: 'What he did well:' },
    academy_example_label_what_bad: { pl: 'Co zrobił źle:', ru: 'Что сделал плохо:', en: 'What he did wrong:' },
    academy_example_label_how_better: { pl: 'Jak mogło być lepiej:', ru: 'Как могло быть лучше:', en: 'How it could be better:' },
    academy_example_label_outcome: { pl: 'Wynik rozmowy:', ru: 'Результат разговора:', en: 'Call outcome:' },
    academy_example_label_status: { pl: 'Status do ustawienia w parserze:', ru: 'Статус для установки в парсере:', en: 'Status to set in the parser:' },
    btn_next_example: { pl: 'Następny przykład', ru: 'Следующий пример', en: 'Next example' },

    // Training -> Services module (renderServices)
    academy_services_h2: { pl: 'Akademia usług', ru: 'Академия услуг', en: 'Services Academy' },
    academy_services_module_intro: {
      pl: 'Wybierz usługę i przejdź ją krok po kroku. Caller musi rozumieć, po co dana usługa istnieje i kiedy naprawdę pasuje do klienta.',
      ru: 'Выбери услугу и пройди её шаг за шагом. Звонящий должен понимать, зачем эта услуга существует и когда она реально подходит клиенту.',
      en: 'Pick a service and go through it step by step. A caller must understand why the service exists and when it truly fits the client.'
    },
    academy_btn_next_step: { pl: 'Następny krok', ru: 'Следующий шаг', en: 'Next step' },
    academy_btn_finish_service: { pl: 'Zakończ usługę', ru: 'Завершить услугу', en: 'Finish service' },
    academy_btn_back: { pl: 'Wstecz', ru: 'Назад', en: 'Back' },
    academy_step_word: { pl: 'krok', ru: 'шаг', en: 'step' },
    academy_quiz_heading: { pl: 'Quiz', ru: 'Тест', en: 'Quiz' },
    academy_service_opener_heading: { pl: 'Jak otworzyć rozmowę', ru: 'Как начать разговор', en: 'How to open the conversation' },
    academy_service_objections_heading: {
      pl: 'Obiekcje klienta i jak na nie odpowiedzieć',
      ru: 'Возражения клиента и как на них отвечать',
      en: 'Client objections and how to answer them'
    },
    academy_service_crosssell_heading: { pl: 'Z czym połączyć tę usługę', ru: 'С чем сочетать эту услугу', en: 'What to combine this service with' },
    academy_label_client: { pl: 'Klient:', ru: 'Клиент:', en: 'Client:' },
    academy_label_you: { pl: 'Ty:', ru: 'Ты:', en: 'You:' },

    // AI training feedback subheadings (renderAiTrainingFeedback)
    academy_ai_feedback_good_heading: { pl: 'Co poszło dobrze', ru: 'Что прошло хорошо', en: 'What went well' },
    academy_ai_feedback_bad_heading: { pl: 'Co wymaga poprawy', ru: 'Что нужно улучшить', en: 'What needs improvement' },
    academy_ai_feedback_improve_heading: { pl: 'Jak poprawić następnym razem', ru: 'Как улучшить в следующий раз', en: 'How to improve next time' },

    // Generic, user-friendly AI Training error fallbacks (startAiTraining/
    // sendAiTrainingMessage/finishAiTraining). Deliberately do NOT surface the
    // raw upstream error (e.g. an OpenAI API error string) to the trainee —
    // that gets console.error'd instead. See round-5 QA finding 2.
    academy_ai_training_error_start: {
      pl: 'Nie udało się uruchomić treningu. Spróbuj ponownie później.',
      ru: 'Не удалось запустить тренировку. Попробуйте ещё раз позже.',
      en: 'Could not start the training. Please try again later.'
    },
    academy_ai_training_error_message: {
      pl: 'Nie udało się wysłać wiadomości. Spróbuj ponownie.',
      ru: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
      en: 'Could not send the message. Please try again.'
    },
    academy_ai_training_error_finish: {
      pl: 'Nie udało się zakończyć treningu. Spróbuj ponownie później.',
      ru: 'Не удалось завершить тренировку. Попробуйте ещё раз позже.',
      en: 'Could not finish the training. Please try again later.'
    },

    // AI training history card (renderAiTrainingHistoryItem)
    academy_ai_history_score_template: { pl: 'Wynik: {n}/100', ru: 'Результат: {n}/100', en: 'Result: {n}/100' },

    // Scenario modules (Scripts/Objections/Statuses) UI chrome (renderScenario)
    academy_scenario_client_pill: { pl: 'Klient mówi', ru: 'Клиент говорит', en: 'Client says' },
    academy_scenario_instruction: {
      pl: 'Wybierz najlepszą odpowiedź. Po każdej decyzji zobaczysz, dlaczego działa albo nie działa.',
      ru: 'Выбери лучший ответ. После каждого решения ты увидишь, почему он работает или не работает.',
      en: 'Pick the best response. After each choice, you will see why it works or does not.'
    },

    // Verdict words glued onto bilingual feedback sentences (scenario choices,
    // qualification leads, service/final-exam quizzes). Keep these short.
    academy_feedback_correct: { pl: 'Dobrze.', ru: 'Правильно.', en: 'Correct.' },
    academy_feedback_incorrect: { pl: 'Nie.', ru: 'Неправильно.', en: 'Incorrect.' },
    academy_feedback_partial: { pl: 'Nie do końca.', ru: 'Не совсем.', en: 'Not quite.' },

    // "Sytuacja" case-question pill, shared by the service quiz and the final exam
    academy_pill_situation: { pl: 'Sytuacja', ru: 'Ситуация', en: 'Situation' },

    // Qualification module (renderQualification)
    academy_qualification_h2: { pl: 'Dobry lead, słaby lead czy dopasowanie usługi?', ru: 'Хороший лид, слабый лид или подбор услуги?', en: 'Good lead, weak lead, or service match?' },
    academy_qualification_intro: {
      pl: 'Nie każdy znaleziony rekord jest wart telefonu — i nie każda potrzeba wymaga tej samej usługi. Dobry caller umie odsiać chaos i trafnie dobrać rozwiązanie.',
      ru: 'Не каждая найденная запись стоит звонка — и не каждая потребность требует одной и той же услуги. Хороший звонящий умеет отсеивать хаос и точно подбирать решение.',
      en: 'Not every record found is worth a call - and not every need requires the same service. A good caller filters out the noise and picks the right solution.'
    },
    academy_qualification_tab_leads: { pl: 'Dobry / słaby lead', ru: 'Хороший / слабый лид', en: 'Good / weak lead' },
    academy_qualification_tab_match: { pl: 'Dopasuj usługę', ru: 'Подбери услугу', en: 'Match a service' },
    academy_qualification_btn_good: { pl: 'Dobry lead', ru: 'Хороший лид', en: 'Good lead' },
    academy_qualification_btn_weak: { pl: 'Słaby lead', ru: 'Слабый лид', en: 'Weak lead' },
    academy_qualification_btn_skip: { pl: 'Nie dzwonić', ru: 'Не звонить', en: 'Don’t call' },

    // Numbers (calculator) module (renderCalculator)
    academy_calculator_h2: { pl: 'Efekt dużych liczb', ru: 'Эффект больших чисел', en: 'The big numbers effect' },
    academy_calculator_intro: {
      pl: 'Wynik callera nie bierze się z jednego idealnego telefonu. Bierze się z regularnej liczby prób, dobrej kwalifikacji i poprawnego statusowania.',
      ru: 'Результат звонящего не берётся из одного идеального звонка. Он складывается из регулярного числа попыток, хорошей квалификации и правильной расстановки статусов.',
      en: 'A caller’s result does not come from one perfect call. It comes from a steady number of attempts, good qualification, and correct status-setting.'
    },
    academy_calc_label_calls_per_day: { pl: 'Telefony dziennie', ru: 'Звонков в день', en: 'Calls per day' },
    academy_calc_label_answer_rate: { pl: 'Odbieralność %', ru: 'Процент дозвона %', en: 'Answer rate %' },
    academy_calc_label_interest_rate: { pl: 'Zainteresowanie %', ru: 'Процент заинтересованности %', en: 'Interest rate %' },
    academy_calc_label_meeting_rate: { pl: 'Spotkanie z zainteresowanych %', ru: 'Встречи от заинтересованных %', en: 'Meeting rate from interested %' },

    // Workday module (renderWorkday)
    academy_workday_h2: { pl: 'Dzień pracy callera', ru: 'Рабочий день звонящего', en: 'A caller’s workday' },
    academy_workday_intro: {
      pl: 'Dobry dzień pracy to rytm: lead, szybka ocena, telefon, status, notatka, następny lead.',
      ru: 'Хороший рабочий день — это ритм: лид, быстрая оценка, звонок, статус, заметка, следующий лид.',
      en: 'A good workday is a rhythm: lead, quick assessment, call, status, note, next lead.'
    },

    // Open-question chrome, shared by service quizzes and the final exam (renderOpenQuestion)
    academy_open_question_pill: { pl: 'Otwarte pytanie', ru: 'Открытый вопрос', en: 'Open question' },
    academy_open_answer_placeholder: { pl: 'Napisz swoją odpowiedź...', ru: 'Напиши свой ответ...', en: 'Write your answer...' },
    academy_open_check_ai: { pl: 'Sprawdź z AI', ru: 'Проверить с AI', en: 'Check with AI' },
    academy_open_checking: { pl: 'Sprawdzanie AI...', ru: 'Проверка AI...', en: 'Checking with AI...' },
    academy_open_strengths_label: { pl: 'Mocne strony:', ru: 'Сильные стороны:', en: 'Strengths:' },
    academy_open_improvements_label: { pl: 'Do poprawy:', ru: 'Нужно улучшить:', en: 'To improve:' },
    // Shown when the AI grading call itself fails (network/quota/server
    // error) - previously this reverted the "Sprawdź z AI" button to idle
    // with zero feedback in either language. See round-6 QA finding 4.
    academy_open_grade_error: {
      pl: 'Nie udało się sprawdzić odpowiedzi. Spróbuj ponownie.',
      ru: 'Не удалось проверить ответ. Попробуйте ещё раз.',
      en: 'Could not check the answer. Please try again.'
    },
    academy_final_submit_error: {
      pl: 'Nie udało się sprawdzić testu. Spróbuj ponownie.',
      ru: 'Не удалось проверить тест. Попробуйте ещё раз.',
      en: 'Could not check the test. Please try again.'
    },

    // Admin > "AI Search" tab - settings form + jobs monitoring table for the
    // admin-configurable AI company search pipeline. All new keys are
    // prefixed admin_ai_search_/admin_btn_ to avoid any collision with the
    // worker-side AI search UI keys added concurrently in this same file.
    admin_tab_ai_search: { pl: 'AI Search', ru: 'AI-поиск', en: 'AI Search' },
    admin_ai_search_eyebrow: { pl: 'AI Search', ru: 'AI-поиск', en: 'AI Search' },
    admin_ai_search_settings_title: { pl: 'Ustawienia wyszukiwania AI', ru: 'Настройки AI-поиска', en: 'AI search settings' },
    admin_ai_search_settings_subtitle: {
      pl: "Modele, tryb wnioskowania, limity równoległości, budżetu i czasu dla pipeline'u wyszukiwania firm przez AI.",
      ru: 'Модели, режим рассуждений, лимиты параллельности, бюджета и времени для конвейера AI-поиска компаний.',
      en: 'Models, reasoning effort, and the parallelism/budget/timeout limits for the AI company search pipeline.'
    },
    admin_ai_search_model_search_label: { pl: 'Model wyszukiwania', ru: 'Модель поиска', en: 'Search model' },
    admin_ai_search_model_enrich_label: { pl: 'Model wzbogacania', ru: 'Модель обогащения', en: 'Enrich model' },
    admin_ai_search_web_search_label: { pl: 'Wyszukiwanie w internecie włączone', ru: 'Веб-поиск включён', en: 'Web search enabled' },
    admin_ai_search_reasoning_effort_label: { pl: 'Poziom wnioskowania', ru: 'Уровень рассуждений', en: 'Reasoning effort' },
    admin_ai_search_reasoning_low: { pl: 'Niski', ru: 'Низкий', en: 'Low' },
    admin_ai_search_reasoning_medium: { pl: 'Średni', ru: 'Средний', en: 'Medium' },
    admin_ai_search_reasoning_high: { pl: 'Wysoki', ru: 'Высокий', en: 'High' },
    admin_ai_search_max_parallel_label: { pl: 'Maks. równoległych zapytań (1-10)', ru: 'Макс. параллельных запросов (1-10)', en: 'Max parallel requests (1-10)' },
    admin_ai_search_max_companies_label: { pl: 'Maks. firm na zapytanie (1-100)', ru: 'Макс. компаний на запрос (1-100)', en: 'Max companies per request (1-100)' },
    admin_ai_search_daily_budget_label: { pl: 'Dzienny limit budżetu (USD)', ru: 'Дневной лимит бюджета (USD)', en: 'Daily budget limit (USD)' },
    admin_ai_search_daily_budget_hint: { pl: '0 = bez limitu', ru: '0 = без лимита', en: '0 = unlimited' },
    admin_ai_search_timeout_label: { pl: 'Limit czasu żądania, s (10-300)', ru: 'Таймаут запроса, с (10-300)', en: 'Request timeout, s (10-300)' },
    admin_btn_save_ai_search_settings: { pl: 'Zapisz ustawienia', ru: 'Сохранить настройки', en: 'Save settings' },
    admin_toast_ai_search_settings_saved: { pl: 'Ustawienia AI Search zapisane', ru: 'Настройки AI-поиска сохранены', en: 'AI Search settings saved' },

    admin_ai_search_jobs_eyebrow: { pl: 'Monitoring', ru: 'Мониторинг', en: 'Monitoring' },
    admin_ai_search_jobs_title: { pl: 'Zadania wyszukiwania AI', ru: 'Задачи AI-поиска', en: 'AI search jobs' },
    admin_ai_search_jobs_subtitle: {
      pl: 'Ostatnie zadania wyszukiwania/wzbogacania firm przez AI, uruchamiane przez pracowników.',
      ru: 'Последние задачи AI-поиска/обогащения компаний, запущенные сотрудниками.',
      en: 'Recent AI company search/enrichment jobs launched by workers.'
    },
    admin_btn_refresh_jobs: { pl: 'Odśwież', ru: 'Обновить', en: 'Refresh' },
    admin_btn_cancel_job: { pl: 'Anuluj', ru: 'Отменить', en: 'Cancel' },
    admin_th_created_at: { pl: 'Utworzono', ru: 'Создано', en: 'Created' },
    admin_th_creator_worker: { pl: 'Worker', ru: 'Сотрудник', en: 'Worker' },
    admin_th_mode: { pl: 'Tryb', ru: 'Режим', en: 'Mode' },
    admin_th_job_stage: { pl: 'Etap', ru: 'Этап', en: 'Stage' },
    admin_th_progress: { pl: 'Postęp', ru: 'Прогресс', en: 'Progress' },
    admin_ai_search_jobs_empty: { pl: 'Brak zadań AI Search.', ru: 'Нет задач AI-поиска.', en: 'No AI Search jobs yet.' },
    admin_toast_ai_search_job_cancelled: { pl: 'Zadanie anulowane', ru: 'Задача отменена', en: 'Job cancelled' },
    admin_ai_search_progress_template: {
      pl: '{saved}/{found} zapisanych, {rejected} odrzuconych',
      ru: '{saved}/{found} сохранено, {rejected} отклонено',
      en: '{saved}/{found} saved, {rejected} rejected'
    },

    admin_ai_search_mode_ai_search: { pl: 'Wyszukiwanie AI', ru: 'AI-поиск', en: 'AI search' },
    admin_ai_search_mode_combined: { pl: 'Połączone', ru: 'Комбинированный', en: 'Combined' },
    admin_ai_search_mode_ai_enrich: { pl: 'Wzbogacanie AI', ru: 'AI-обогащение', en: 'AI enrich' },

    admin_ai_search_stage_queued: { pl: 'W kolejce', ru: 'В очереди', en: 'Queued' },
    admin_ai_search_stage_planning: { pl: 'Planowanie', ru: 'Планирование', en: 'Planning' },
    admin_ai_search_stage_searching: { pl: 'Wyszukiwanie', ru: 'Поиск', en: 'Searching' },
    admin_ai_search_stage_validating: { pl: 'Walidacja', ru: 'Проверка', en: 'Validating' },
    admin_ai_search_stage_enriching: { pl: 'Wzbogacanie', ru: 'Обогащение', en: 'Enriching' },
    admin_ai_search_stage_scoring: { pl: 'Ocenianie', ru: 'Оценка', en: 'Scoring' },
    admin_ai_search_stage_saving: { pl: 'Zapisywanie', ru: 'Сохранение', en: 'Saving' },
    admin_ai_search_stage_completed: { pl: 'Zakończone', ru: 'Завершено', en: 'Completed' },
    admin_ai_search_stage_partial: { pl: 'Częściowe', ru: 'Частично', en: 'Partial' },
    admin_ai_search_stage_failed: { pl: 'Błąd', ru: 'Ошибка', en: 'Failed' },
    admin_ai_search_stage_cancelled: { pl: 'Anulowane', ru: 'Отменено', en: 'Cancelled' },
    admin_ai_search_stage_paused: { pl: 'Wstrzymane', ru: 'Приостановлено', en: 'Paused' },

    // Parser discover panel - AI company search mode selector (public/app.js
    // runDiscovery()/runAiCompanySearch() branch on #discoverMode). Not loaded
    // by Academy/Admin (see admin_ai_search_* above, added concurrently) -
    // used only by the parser (index.html + app.js).
    discover_mode_step_title: { pl: '0. Tryb wyszukiwania', ru: '0. Режим поиска', en: '0. Search mode' },
    discover_mode_field_label: { pl: 'Tryb wyszukiwania', ru: 'Режим поиска', en: 'Search mode' },
    discover_mode_standard: { pl: 'Standardowe', ru: 'Стандартный', en: 'Standard' },
    discover_mode_ai_search: { pl: 'ChatGPT', ru: 'ChatGPT', en: 'ChatGPT' },
    discover_mode_combined: { pl: 'Kombinowany', ru: 'Комбинированный', en: 'Combined' },
    discover_mode_ai_enrich: { pl: 'Wzbogacenie AI', ru: 'Обогащение AI', en: 'AI enrichment' },

    // AI search curated-criteria block (#aiSearchOptions), shown for ai_search/combined
    ai_search_section_title: { pl: 'Kryteria wyszukiwania AI', ru: 'Критерии AI-поиска', en: 'AI search criteria' },
    ai_field_client_type: { pl: 'Typ klienta', ru: 'Тип клиента', en: 'Client type' },
    ai_client_type_any: { pl: 'Dowolny', ru: 'Любой', en: 'Any' },
    ai_client_type_b2b: { pl: 'B2B', ru: 'B2B', en: 'B2B' },
    ai_client_type_b2c: { pl: 'B2C', ru: 'B2C', en: 'B2C' },
    ai_client_type_both: { pl: 'B2B + B2C', ru: 'B2B + B2C', en: 'B2B + B2C' },
    ai_field_company_size: { pl: 'Wielkość firmy', ru: 'Размер компании', en: 'Company size' },
    ai_company_size_any: { pl: 'Dowolna / nieznana', ru: 'Любой / неизвестно', en: 'Any / unknown' },
    ai_field_min_years: { pl: 'Min. lat na rynku', ru: 'Мин. лет на рынке', en: 'Min. years in business' },
    ai_field_website_presence: { pl: 'Obecność strony', ru: 'Наличие сайта', en: 'Website presence' },
    ai_website_presence_any: { pl: 'Dowolna', ru: 'Любая', en: 'Any' },
    ai_website_presence_has: { pl: 'Ma stronę', ru: 'Есть сайт', en: 'Has website' },
    ai_website_presence_no: { pl: 'Brak strony', ru: 'Нет сайта', en: 'No website' },
    ai_field_quality_flags: { pl: 'Problemy ze stroną', ru: 'Проблемы сайта', en: 'Website quality flags' },
    ai_flag_weak_outdated: { pl: 'Słaba / przestarzała', ru: 'Слабый / устаревший', en: 'Weak / outdated' },
    ai_flag_no_mobile: { pl: 'Brak wersji mobilnej', ru: 'Нет мобильной версии', en: 'No mobile version' },
    ai_flag_no_cta: { pl: 'Brak wyraźnego CTA', ru: 'Нет явного CTA', en: 'No clear CTA' },
    ai_flag_no_contact_info: { pl: 'Trudno znaleźć kontakt', ru: 'Сложно найти контакты', en: 'Hard to find contact info' },
    ai_field_extra_keywords: { pl: 'Dodatkowe słowa kluczowe', ru: 'Доп. ключевые слова', en: 'Extra keywords' },
    ai_field_exclude_keywords: { pl: 'Wykluczające słowa kluczowe', ru: 'Исключающие ключевые слова', en: 'Exclude keywords' },
    ai_field_min_reviews: { pl: 'Min. opinii Google', ru: 'Мин. отзывов Google', en: 'Min. Google reviews' },
    ai_field_min_rating: { pl: 'Min. ocena (0-5)', ru: 'Мин. рейтинг (0-5)', en: 'Min. rating (0-5)' },
    ai_field_count: { pl: 'Liczba firm (1-100)', ru: 'Кол-во компаний (1-100)', en: 'Company count (1-100)' },

    // ai_enrich mode note (#aiEnrichNote) - explains that this mode enriches
    // the currently visible/filtered leads instead of running a new search
    ai_enrich_note: {
      pl: 'Ten tryb nie uruchamia nowego wyszukiwania: wzbogaca AI-profilem firmy, które są teraz widoczne w tabeli wyników (po zastosowaniu filtrów) i mają już zapisane ID.',
      ru: 'Этот режим не запускает новый поиск: он обогащает AI-профилем компании, которые сейчас видны в таблице результатов (с учётом фильтров) и уже имеют сохранённый ID.',
      en: 'This mode does not run a new search: it enriches with an AI profile the companies currently visible in the results table (after filters) that already have a saved ID.'
    },
    ai_enrich_count_prefix: { pl: 'Do wzbogacenia:', ru: 'К обогащению:', en: 'To enrich:' },
    ai_enrich_count_suffix: { pl: 'firm', ru: 'компаний', en: 'companies' },
    ai_enrich_none_eligible: {
      pl: 'Brak widocznych firm z zapisanym ID. Otwórz historię lub wyszukiwanie standardowe, a potem wróć do tego trybu.',
      ru: 'Нет видимых компаний с сохранённым ID. Откройте историю или обычный поиск, затем вернитесь в этот режим.',
      en: 'No visible companies with a saved ID. Open history or a standard search, then come back to this mode.'
    },

    // AI search job status polling (waitForAiSearchCompletion) - job.stage labels
    ai_stage_queued: { pl: 'W kolejce', ru: 'В очереди', en: 'Queued' },
    ai_stage_planning: { pl: 'Planowanie zapytań', ru: 'Планирование запросов', en: 'Planning' },
    ai_stage_searching: { pl: 'Wyszukiwanie', ru: 'Поиск', en: 'Searching' },
    ai_stage_validating: { pl: 'Weryfikacja', ru: 'Проверка', en: 'Validating' },
    ai_stage_enriching: { pl: 'Wzbogacanie', ru: 'Обогащение', en: 'Enriching' },
    ai_stage_scoring: { pl: 'Ocena', ru: 'Скоринг', en: 'Scoring' },
    ai_stage_saving: { pl: 'Zapisywanie', ru: 'Сохранение', en: 'Saving' },
    ai_stage_completed: { pl: 'Zakończono', ru: 'Завершено', en: 'Completed' },
    ai_stage_partial: { pl: 'Zakończono częściowo', ru: 'Завершено частично', en: 'Partially completed' },
    ai_stage_failed: { pl: 'Błąd', ru: 'Ошибка', en: 'Failed' },
    ai_stage_cancelled: { pl: 'Anulowano', ru: 'Отменено', en: 'Cancelled' },
    ai_stage_paused: { pl: 'Wstrzymano', ru: 'Приостановлено', en: 'Paused' },

    // AI search job progress counters (job.progress.*)
    ai_progress_planned_queries: { pl: 'Zaplanowane zapytania', ru: 'Запланировано запросов', en: 'Planned queries' },
    ai_progress_queries_run: { pl: 'Wykonane zapytania', ru: 'Выполнено запросов', en: 'Queries run' },
    ai_progress_candidates_found: { pl: 'Znalezione kandydatury', ru: 'Найдено кандидатов', en: 'Candidates found' },
    ai_progress_candidates_confirmed: { pl: 'Potwierdzone', ru: 'Подтверждено', en: 'Confirmed' },
    ai_progress_duplicates_skipped: { pl: 'Pominięte duplikaty', ru: 'Пропущено дублей', en: 'Duplicates skipped' },
    ai_progress_rejected: { pl: 'Odrzucone', ru: 'Отклонено', en: 'Rejected' },
    ai_progress_enriched: { pl: 'Wzbogacone', ru: 'Обогащено', en: 'Enriched' },
    ai_progress_saved: { pl: 'Zapisane', ru: 'Сохранено', en: 'Saved' },

    ai_search_cancel: { pl: 'Anuluj wyszukiwanie', ru: 'Отменить поиск', en: 'Cancel search' },
    ai_search_cancelling: { pl: 'Anulowanie...', ru: 'Отмена...', en: 'Cancelling...' },
    ai_search_errors_label: { pl: 'Błędy:', ru: 'Ошибки:', en: 'Errors:' },

    // AI company profile summary card in the lead detail "AI" tab
    // (renderAiCompanyProfileBlock) - shown only when
    // result.aiCompanyProfile?.status === 'COMPLETED'
    ai_profile_title: { pl: 'AI-profil firmy', ru: 'AI-профиль компании', en: 'AI company profile' },
    ai_profile_top_services: { pl: 'Usługi (top 5)', ru: 'Услуги (топ 5)', en: 'Top services' },
    ai_profile_opening: { pl: 'Sugerowane otwarcie rozmowy', ru: 'Предлагаемое начало разговора', en: 'Suggested opening' },
    ai_profile_offer: { pl: 'Proponowana oferta', ru: 'Предлагаемое предложение', en: 'Proposed offer' },
    ai_profile_verification: { pl: 'Status weryfikacji', ru: 'Статус верификации', en: 'Verification status' },

    // Parser discover panel - thematic "top ~10" category preset optgroups
    // (public/app.js categoryGroups/populateCategoryPreset(), top-categories
    // feature). Mirrors app.js's own copy.ru/copy.pl groupXxx keys (read via
    // tr()) so the same group names exist in the shared {pl,ru,en} dictionary
    // for cross-app consistency; not currently wired into the Parser UI itself.
    discover_group_construction: { pl: 'Budownictwo i deweloperka', ru: 'Строительство и девелопмент', en: 'Construction & development' },
    discover_group_facades: { pl: 'Fasady i architektura', ru: 'Фасады и архитектура', en: 'Facades & architecture' },
    discover_group_engineering: { pl: 'Inżynieria i instalacje', ru: 'Инженерия и инженерные системы', en: 'Engineering & building systems' },
    discover_group_manufacturing: { pl: 'Produkcja dla budownictwa', ru: 'Производство для строительства', en: 'Manufacturing for construction' },
    discover_group_heavy_equipment: { pl: 'Ciężki sprzęt', ru: 'Спецтехника', en: 'Heavy equipment' },
    discover_group_commercial_realestate: { pl: 'Nieruchomości komercyjne', ru: 'Коммерческая недвижимость', en: 'Commercial real estate' },
    discover_group_medicine: { pl: 'Medycyna', ru: 'Медицина', en: 'Medicine' },
    discover_group_legal_finance: { pl: 'Prawo i finanse', ru: 'Право и финансы', en: 'Legal & finance' },
    discover_group_logistics: { pl: 'Logistyka i transport', ru: 'Логистика и транспорт', en: 'Logistics & transport' },
    discover_group_premium_automotive: { pl: 'Motoryzacja premium', ru: 'Премиальный автобизнес', en: 'Premium automotive' }
  };

  function normalizeLang(lang) {
    const raw = String(lang || '').trim().toLowerCase().replace(/_/g, '-');
    const base = raw.split('-')[0];
    if (SUPPORTED.includes(base)) return base;
    if (['uk', 'be', 'kk'].includes(base)) return 'ru';
    return '';
  }

  function readUrlLanguage(locationLike) {
    const location = locationLike || global.location;
    if (!location) return '';
    try {
      const params = new URLSearchParams(location.search || '');
      const fromQuery = normalizeLang(params.get('lang'));
      if (fromQuery) return fromQuery;
    } catch {}

    const segments = String(location.pathname || '')
      .split('/')
      .map((segment) => segment.trim().toLowerCase())
      .filter(Boolean);

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const normalized = normalizeLang(segment);
      if (normalized) return normalized;
      if (segment === 'site') {
        const nested = normalizeLang(segments[index + 1]);
        if (nested) return nested;
      }
    }
    return '';
  }

  function readStoredLanguage() {
    try {
      return (
        normalizeLang(localStorage.getItem(STORAGE_KEY)) ||
        normalizeLang(localStorage.getItem(PARSER_STORAGE_KEY)) ||
        ''
      );
    } catch {
      return '';
    }
  }

  function readBrowserLanguage() {
    const candidates = [];
    try {
      if (Array.isArray(global.navigator?.languages)) candidates.push(...global.navigator.languages);
      if (global.navigator?.language) candidates.push(global.navigator.language);
    } catch {}

    for (const candidate of candidates) {
      const normalized = normalizeLang(candidate);
      if (normalized) return normalized;
    }
    return '';
  }

  function detectInitialLanguage() {
    return readUrlLanguage() || readStoredLanguage() || readBrowserLanguage() || FALLBACK;
  }

  function applyDocumentLanguage(lang) {
    const next = normalizeLang(lang) || FALLBACK;
    if (global.document?.documentElement) global.document.documentElement.lang = next;
    return next;
  }

  function getLanguage() {
    return (
      normalizeLang(global.document?.documentElement?.lang) ||
      readStoredLanguage() ||
      FALLBACK
    );
  }

  function applyInitialLanguage() {
    return applyDocumentLanguage(detectInitialLanguage());
  }

  function setLanguage(lang, options = {}) {
    const next = normalizeLang(lang) || FALLBACK;
    const persist = options.persist !== false;
    try {
      if (persist) {
        localStorage.setItem(STORAGE_KEY, next);
        localStorage.setItem(PARSER_STORAGE_KEY, next === 'en' ? 'ru' : next);
      }
    } catch {}
    applyDocumentLanguage(next);
    global.document?.dispatchEvent(new CustomEvent('aura-language-changed', { detail: { language: next } }));
    return next;
  }

  function tr(key, lang) {
    const entry = dict[key];
    if (!entry) return key;
    const activeLang = lang || getLanguage();
    return entry[activeLang] || entry[FALLBACK] || entry.ru || key;
  }

  global.AuraI18n = {
    tr,
    dict,
    getLanguage,
    setLanguage,
    normalizeLang,
    readUrlLanguage,
    readStoredLanguage,
    readBrowserLanguage,
    detectInitialLanguage,
    applyDocumentLanguage,
    applyInitialLanguage,
    supportedLanguages: SUPPORTED.slice()
  };
})(window);
