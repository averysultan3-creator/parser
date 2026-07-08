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

    // poolState stable-ID labels (spec explicitly asks for this pattern)
    pool_available: { pl: 'Dostępny', ru: 'Доступен', en: 'Available' },
    pool_reserved: { pl: 'Zarezerwowany', ru: 'Зарезервирован', en: 'Reserved' },
    pool_processed: { pl: 'Przetworzony', ru: 'Обработан', en: 'Processed' },
    pool_reset: { pl: 'Przywrócony do puli', ru: 'Возвращён в пул', en: 'Returned to pool' },
    pool_deleted: { pl: 'Usunięty', ru: 'Удалён', en: 'Deleted' }
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
