# Warsaw Site Parser

Локальный parser для поиска активных локальных компаний Варшавы, у которых нет полноценного собственного сайта или сайт явно слабый.

Главная логика:

```text
активная компания -> проверка наличия сайта -> статус сайта -> оценка бизнеса -> lead score -> оффер сайта
```

Инструмент не строится вокруг массового Google Maps scraping. Входом должен быть список компаний из CEIDG, REGON, KRS, отраслевого каталога, сервиса записи, соцсетей или ручного исследования.

## Текущая архитектура

- Массовый парсинг, фильтрация, проверка сайта и первичный score работают без ChatGPT.
- Поиск компаний по категории работает только через не-AI источники: CSV, CEIDG API или официальный Google Places API.
- OpenAI используется только точечно в карточке выбранной компании, во вкладке `AI-анализ`, после нажатия кнопки AI-анализа.
- ChatGPT не ищет компанию заново в интернете: в модель отправляется только подготовленный пакет фактов из карточки.
- Результат AI сохраняется в карточке со статусом `NOT_REQUESTED`, `PROCESSING`, `COMPLETED` или `FAILED`.

## Что делает

- принимает CSV компаний, даже если `website_url` пустой;
- проверяет поле сайта, корпоративный домен из e-mail и ссылки из профилей;
- не использует OpenAI web search в массовой проверке; сайт ищется по указанному URL, корпоративному e-mail и профилям из входных данных;
- подтверждает домен по совпадениям: NIP, REGON, телефон, название, адрес, ниша;
- присваивает `website_status`;
- если сайта нет, оценивает сам бизнес: активность, масштаб, репутацию, потенциал сайта, контакт;
- формирует `lead_score`, категорию, проблему, оффер и первое сообщение;
- экспортирует результат в CSV или JSON.

## Статусы сайта

- `NO_WEBSITE_CONFIRMED` - собственный сайт не найден после проверки.
- `SOCIAL_ONLY` - есть только Instagram, Facebook или TikTok.
- `DIRECTORY_ONLY` - есть только каталоги или сервисы записи.
- `MARKETPLACE_ONLY` - есть только Allegro, OLX, Booksy и подобные платформы.
- `BROKEN_WEBSITE` - домен есть, но сайт не открывается.
- `FREE_SUBDOMAIN` - есть страница на бесплатном поддомене.
- `ONE_PAGE_PLACEHOLDER` - есть страница только с названием и телефоном.
- `WEBSITE_FOUND` - найден официальный сайт.
- `UNCERTAIN` - нужна ручная проверка.

Приоритетные лиды: `NO_WEBSITE_CONFIRMED`, `SOCIAL_ONLY`, `DIRECTORY_ONLY`, `BROKEN_WEBSITE`, `FREE_SUBDOMAIN`.

## Запуск

```powershell
cd C:\Users\user\Documents\Codex\2026-06-26\new-chat\outputs\warsaw-site-parser
npm install
Copy-Item .env.example .env
notepad .env
npm run dev
```

Открыть:

```text
http://localhost:4317
```

Сервер сейчас уже запущен на этом URL, если эта сессия не была остановлена.

## `.env`

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
OPENAI_SEARCH_MODEL=gpt-5.5
PORT=4317
RESPECT_ROBOTS_TXT=true
MAX_ITEMS_PER_RUN=40
MAX_DISCOVERY_ITEMS=150

CEIDG_API_TOKEN=
CEIDG_API_ENDPOINT=https://dane.biznes.gov.pl/api/ceidg/v3/firmy
REGON_API_KEY=
GOOGLE_PLACES_API_KEY=
```

Без `OPENAI_API_KEY` массовый парсер все равно работает. С ключом доступна только точечная кнопка AI в карточке компании:

- подробный AI-анализ во вкладке `AI-анализ`;
- персональный аргумент;
- рекомендуемая структура сайта;
- оффер по созданию или редизайну сайта.

Для поиска компаний без ChatGPT укажите `GOOGLE_PLACES_API_KEY` или `CEIDG_API_TOKEN`. Без этих ключей используйте CSV-импорт.

## CSV формат

Минимум:

```csv
company,niche,district,phone,email,website_url,source_profile,review_count,last_activity
Klima Expert,Klimatyzacja,Mokotow,+48500999888,kontakt@klimaexpert.pl,,https://facebook.com/demo,32,2026-05-28
```

Полезные поля:

```text
company
legal_name
niche
city
district
address
phone
email
nip
regon
krs
pkd
status
registration_date
website_url
source_profile
instagram
facebook
tiktok
review_count
rating
last_activity
services
portfolio_available
physical_location
team_size
multiple_locations
high_ticket
paid_platform
notes
```

## Как пользоваться

1. Выбрать нишу: например `Klimatyzacja`, `Auto detailing / PDR`, `Wykończenia wnętrz`.
2. Получить список активных компаний через CSV, CEIDG API или Google Places API.
3. Запустить массовую проверку. На этом шаге ChatGPT не используется.
4. Открыть интересный лид и перейти во вкладку `Сайт`.
5. Посмотреть факты проверки сайта и обычный score.
6. Только если лид интересный, нажать `Провести подробный AI-анализ`.
7. Экспортировать A/A+ лиды в CSV и вручную проверить записи с `requires_manual_review=true`.

## Фильтры в списке лидов

После проверки компаний таблицу можно сузить без повторного парсинга:

- текстовый поиск по компании, нише, району, источнику и проблеме;
- статус сайта: нет своего сайта, сайт найден, слабый сайт, нужна проверка;
- размер компании: маленькая, средняя, большая;
- lead category: A/A+, B, C, D;
- минимальный score.

Экспорт CSV/JSON выгружает текущий отфильтрованный список.

## Live registry integrations

В коде есть backend endpoint для CEIDG:

```text
GET /api/registry/ceidg/search?miasto=Warszawa&pkd=...
```

Он требует `CEIDG_API_TOKEN`. На практике параметры CEIDG могут отличаться по версии API, поэтому надежнее сначала выгрузить CSV из официального источника и затем прогнать через parser.

KRS lookup:

```text
GET /api/registry/krs/{krs}
```

REGON требует ключ BIR/GUS и SOAP-интеграцию. В текущей версии `REGON_API_KEY` только фиксируется в конфиге; для массового REGON search лучше подключить отдельный BIR-клиент после получения production key.

## Ограничения

- Инструмент не делает массовый scraping Google Maps.
- `NO_WEBSITE_CONFIRMED` надежнее при богатом исходном CSV, CEIDG/Google Places данных и ручной проверке спорных карточек.
- Соцсети и каталоги используются как сигналы, а не как юридический источник.
- Результаты с `UNCERTAIN` и A+ лиды нужно проверять вручную перед контактом.
