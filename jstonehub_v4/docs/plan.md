# ЗАДАЧИ ДЛЯ РАЗРАБОТКИ — ЭТАП 1: «Анекдоты на YouTube»

**Цель:** Владелец платформы может создать несколько YouTube-каналов, подключить к ним блюпринты анекдотов (short и long) и генерировать контент автоматически или с поэтапной проверкой.

**Результат:** Рабочий конвейер: анекдот из базы → озвучка → обработка аудио → транскрипция → наложение фона и презентатора → готовое видео → скачивание.

---

## СТАТУС ЭТАПОВ

```
✅ Этап 1.1  Инфраструктура (PostgreSQL, MinIO, Redis, BullMQ)
⚠️ Этап 1.2  Базовые таблицы (частично — auth намеренно отложен)
✅ Этап 1.3  Аудио-процессинг (Hub /tool/audio-processing)
⚠️ Этап 1.4  TTS / Secret Voice (бэкенд работает, UI требует переработки)
❌ Этап 1.5  Транскрипция (Whisper/faster-whisper)
⚠️ Этап 1.6  База анекдотов (базовый CRUD есть, workflow неполный)
❌ Этап 1.7  Медиа-библиотека (бэкграунды, презентаторы)
❌ Этап 1.8  Видео-монтаж (FFmpeg)
❌ Этап 1.9  Блюпринты и автоматическая генерация
❌ Этап 1.10 Финальная сборка и тестирование
```

---

## ЭТАП 1.1 — ИНФРАСТРУКТУРА ✅

Реализовано:
- PostgreSQL — основная БД
- MinIO — один бакет `jstonehub`, presigned URLs, cleanup cron
- Redis + BullMQ — очереди: `ping`, `tts`, `audio-processing`, `transcription`, `video-compose`, `media-download`
- Browser Fingerprints — механизм авторизации для Secret Voicer (хранит UA, screen, timezone и т.д.)

---

## ЭТАП 1.2 — БАЗОВЫЕ ТАБЛИЦЫ И AUTH ⚠️

**Реализовано (таблицы существуют):**
- `browser_fingerprints` — браузерные отпечатки
- `secret_voicer_credentials` — CSRF token + session ID + fingerprint
- `tts_projects`, `tts_segments` — TTS проекты и сегменты
- `languages` — языки платформы
- `tags` — теги контента
- `jokes`, `joke_translations`, `joke_audios`, `joke_tags` — анекдоты
- `content_usages` — отслеживание использования контента
- `joke_tts_pipelines` — пайплайны озвучки анекдотов

**НЕ реализовано (намеренно отложено):**
- Auth (Better Auth) — `users`, `sessions`, `accounts`, `verifications`
- Организации — `organizations`, `org_members`, `org_member_permissions`
- Проекты/каналы — `projects`, `social_accounts`, `content_slots`
- Блюпринты — `blueprints`, `org_blueprints`
- Энергетическая система — `energy_transactions`, `subscription_plans`
- Медиа — `media_collections`, `media_items`

**Примечание:** Auth намеренно отложен. Платформа сейчас используется одним оператором без авторизации. Auth будет добавлен отдельным этапом после стабилизации основного контент-пайплайна.

---

## ЭТАП 1.3 — АУДИО-ПРОЦЕССИНГ ✅

**Реализовано:**
- Hub: `/tool/audio-processing`
  - Drag-and-drop загрузка файлов (до 50 файлов, до 100MB каждый)
  - Настройки: silence removal, normalization, high-pass filter, limiter, fade, gaps, concatenation
  - История заданий с polling, AudioPlayer для результатов, download
  - Countdown timer до истечения TTL
- Worker FFmpeg pipeline:
  - Declick (adeclick — убирает TTS-артефакты)
  - Silence removal (silencedetect + voiced segments splicing с crossfade)
  - Loudness normalization (двухпроходный loudnorm)
  - Limiter (alimiter)
  - Concatenation (acrossfade между файлами + silence gaps)
- API: presigned upload URLs, job queue, job status, job delete
- MinIO: временные файлы с TTL 3 дня, автоочистка каждый час

---

## ЭТАП 1.4 — TTS (SECRET VOICE) ⚠️

**Реализовано:**
- Бэкенд:
  - `SecretVoicerExternalAdapter` — createTask, checkTaskStatus, buildAudioDownload
  - `SecretVoicerConfigService` — загрузка credentials из БД, кэш 1 час
  - `SecretVoicerPreviewService` — кэширование превью голосов в MinIO
  - TTS Projects API — CRUD, retry segments, delete
  - Webhook endpoint для колбэков воркера
- Worker:
  - TTS processor — polling Secret Voicer до завершения → download → MinIO upload
  - Download helper с retry (3 попытки, exponential backoff)
- Admin:
  - Browser Fingerprints CRUD (создание, просмотр, редактирование, удаление)
  - Secret Voicer Credentials CRUD (привязка fingerprint к csrf+session)
- Hub (базовая версия, требует переработки):
  - `/tool/tts` — список TTS проектов
  - `/tool/tts/create` — создание проекта

**Требует переработки — Hub TTS UI:**

### 1.4.1 — Страница создания TTS (`/tool/tts/create`)

**Дизайн:**

```
┌─────────────────────────────────────────────────┐
│  Название                                        │
│  [input: "e.g. Funny joke #42"]                 │
│                                                  │
│  [Switch: AI-разбивка на роли] ← disabled, future│
│                                                  │
│  Вставьте сегменты (JSON/JS-массив):             │
│  [textarea с placeholder]                        │
│  [Parse]                                         │
│                                                  │
│  ─── Story Editor ───────────────────────────── │
│  #1  [narrator ▾]  "Приходит мужик к врачу."   │
│                    [duplicate] [delete]          │
│  #2  [man ▾]       "Доктор, помогите!"          │
│                    [duplicate] [delete]          │
│  [+ Add Segment]                                │
│                                                  │
│  [textarea: вставить ещё →  добавит в конец]    │
│                                                  │
│  ─── Voice Assignment ───────────────────────── │
│  narrator   [Select voice...]                    │
│  man        [Select voice...]                    │
│                                                  │
│  ─── Audio Settings ─────────────────────────── │
│  [Switch: Concatenate]   ON                     │
│  [Switch: Normalization] ON                     │
│                                                  │
│  [Start Synthesis]                               │
└─────────────────────────────────────────────────┘
```

**Детали Story Editor:**
- Парсинг принимает JSON (`[{"name":"narrator","text":"..."}]`) и JS-объекты (`[{name:"narrator",text:"..."}]`)
- Role selector: при клике → Popover со списком существующих ролей + кнопка "New role" (inline input в popover)
- Роли уникальны по `trim().toLowerCase()` — `Max`, `max`, `MAX` = одна роль
- Отображается роль в том виде, в котором она первый раз встретилась
- Кнопка duplicate — создаёт копию сегмента ниже, независимую
- Второй textarea внизу Story Editor — парсит и аппендит в конец списка

**Детали Voice Assignment:**
- Секция появляется как только есть хотя бы один сегмент с заданной ролью
- Каждая уникальная роль = одна строка с кнопкой выбора голоса
- При выборе голоса → VoicePickerDialog
- Один voiceId не может быть у двух ролей (уже выбранные задизейблены в пикере)
- Если голос уже выбран у другой роли и пользователь хочет его взять — предупреждение

**Детали VoicePickerDialog:**
- Список всех голосов из `/v1/secret-voicer/voices`
- Фильтр по полу (All / Male / Female)
- Сортировка (Popular / A-Z)
- Поиск по имени, акценту, описанию
- Pagination: load more по 20
- Для каждого голоса: аватар, имя, пол badge, locale, accent, описание, кол-во использований
- Кнопка Preview: `GET /v1/secret-voicer/voices/preview?voiceId=...&url=...` → воспроизвести
- Кнопка Select: выбирает голос и закрывает диалог
- Уже выбранные другими ролями голоса — задизейблены

**Кнопка Start Synthesis:**
- Active когда: название заполнено + все роли имеют voiceId + есть хотя бы 1 сегмент
- POST /v1/tts-projects → перенаправление на /tool/tts

### 1.4.2 — Страница TTS Jobs (`/tool/tts`)

**Дизайн карточки проекта:**

```
┌─────────────────────────────────────────────────┐
│  "Funny joke #42"    [Processing ●]  [Delete]   │
│  ████████████░░░░░░  3 / 5 segments             │
│                                                  │
│  #1  narrator  "Приходит мужик..."  ✅ [▶][↓]  │
│  #2  man       "Доктор, помогите!"  ✅ [▶][↓]  │
│  #3  narrator  "Садитесь, больной" ⏳ synth...  │
│  #4  man       "Спасибо, доктор!"  ⏳ queued   │
│  #5  narrator  "Следующий!"        ⏳ queued   │
│                                                  │
│  (когда все готово:)                            │
│  [Confirm & Finalize]  ← основное действие      │
└─────────────────────────────────────────────────┘
```

**Логика Confirm & Finalize:**
1. Все сегменты в статусе `completed`
2. Если `concatenate = true`:
   - Все outputKey сегментов отправляются в audio-processing queue
   - Показывается прогресс-бар обработки
   - После завершения: финальный AudioPlayer + Download кнопка
   - **Все промежуточные сегментные файлы удаляются из MinIO**
3. Если `concatenate = false`:
   - Показывается список индивидуальных файлов с AudioPlayer + Download
   - Кнопка "Download All" (скачать все как zip или по одному)
   - Кнопка "Finalize anyway" → запустить concatenation постфактум
4. После финализации карточка переходит в статус `finalized`

**Polling:**
- Пока есть проекты со статусом `processing` — refetch каждые 5 сек
- Когда все `completed`/`finalized`/`failed` — polling останавливается

**Retry сегментов:**
- Для failed сегментов — кнопка retry
- POST /v1/tts-projects/:id/segments/:index/retry

---

## ЭТАП 1.5 — ТРАНСКРИПЦИЯ ❌

**Принцип:**
- Транскрипция — **всегда отдельный независимый шаг**
- НЕ встраивается в audio-processing
- НЕ запускается автоматически при озвучке
- Запускается только:
  1. Вручную через Hub `/tool/transcription`
  2. Как часть joke approval workflow (после финализации озвучки)
  3. В будущих модулях автоконтента (blueprints)

**Движок:** `faster-whisper` (Python subprocess)
- В 4x быстрее оригинального Whisper
- Меньше потребление RAM
- Поддерживает 90+ языков

**Гарантированно поддерживаемые языки:**
`ru`, `en`, `de`, `es`, `fr`, `it`, `pt`, `pl`, `uk`, `ja`, `zh`, `ko`, `tr`, `ar`, `nl`, `sv`, `fi`, `nb`, `da`, `cs`, `sk`, `ro`, `hu`, `hr`, `bg`, `sr`, `el`, `he`, `vi`, `th`, `id`, `ms`

### Таблица `transcription_jobs`
```
id               string, PK, cuid2
status           enum: "queued", "processing", "completed", "failed"
inputFileKey     string, not null (путь в MinIO)
outputFileKey    string, nullable (путь к JSON-результату в MinIO)
language         string, nullable (null = autodetect)
detectedLanguage string, nullable (определённый язык)
durationMs       integer, nullable
errorMessage     string, nullable
createdAt        timestamp, default now()
completedAt      timestamp, nullable
```

### TranscriptionResult (JSON в MinIO)
```json
{
  "language": "ru",
  "segments": [
    {"start": 0.0, "end": 1.5, "text": "Приходит мужик к врачу."},
    {"start": 1.8, "end": 3.2, "text": "Доктор, помогите!"}
  ],
  "plainText": "Приходит мужик к врачу. Доктор, помогите!",
  "durationMs": 3200
}
```

### API
```
POST /v1/transcription
  Body: { fileKey: string, language?: string }
  Response: { jobId: string, status: "queued" }

GET /v1/transcription/:jobId
  Response: { jobId, status, language?, detectedLanguage?, result?, error? }
```

### Worker (`transcription` queue)
1. Получить задачу из BullMQ
2. Скачать аудио из MinIO во временный файл
3. Запустить `faster-whisper` subprocess:
   ```
   faster-whisper <input.mp3> --language <lang|auto> --output_format json --output_dir <tmpdir>
   ```
4. Распарсить JSON-результат
5. Загрузить результат в MinIO (`tmp/transcription/<jobId>/result.json`)
6. Обновить запись в БД: status=completed, outputFileKey, detectedLanguage, durationMs
7. Удалить временный файл

### Hub `/tool/transcription`
```
┌─────────────────────────────────────────────────┐
│  Транскрипция                                   │
│                                                  │
│  [Drop audio / click to upload]                 │
│                                                  │
│  Язык: [Auto ▾]  или выбрать из списка          │
│                                                  │
│  [Transcribe]                                   │
│                                                  │
│  ─── Результат ──────────────────────────────── │
│  Определён язык: Русский                        │
│  Длительность: 3.2 сек                         │
│                                                  │
│  0:00 - 0:01.5  Приходит мужик к врачу.        │
│  0:01.8 - 0:03.2  Доктор, помогите!            │
│                                                  │
│  [↓ SRT]  [↓ VTT]  [↓ JSON]                    │
└─────────────────────────────────────────────────┘
```

---

## ЭТАП 1.6 — БАЗА АНЕКДОТОВ ⚠️

### Что реализовано
- Admin CRUD: список анекдотов, создание (вставка JSON сегментов), редактирование статуса/тегов/рейтинга, добавление переводов, удаление
- Проверка уникальности по SHA-256 хэшу
- JokeTTS panel в detail dialog (запуск озвучки для конкретного перевода)
- Базовые таблицы: jokes, joke_translations, joke_audios, joke_tags

### Что требует добавления

#### Новые таблицы

**`joke_settings` (singleton):**
```
id                    string, PK, cuid2
dailyLimitPerLanguage integer, not null, default 5
createdAt             timestamp, default now()
updatedAt             timestamp, default now()
```

**`joke_language_settings`:**
```
id              string, PK, cuid2
languageCode    string, unique, FK → languages.code
isActive        boolean, not null, default true
voiceConfig     jsonb, not null, default '{}' — {"narrator": "voice_id", "man": "voice_id"}
createdAt       timestamp, default now()
updatedAt       timestamp, default now()
```

**Расширение `joke_translations`:**
```
Добавить поля:
isNotApplicable      boolean, not null, default false
notApplicableReason  string, nullable ("context_mismatch" | "no_translation" | "other")
```

#### Joke Settings страница (Admin `/content/joke/settings`)

```
┌─────────────────────────────────────────────────┐
│  Joke Settings                                  │
│                                                  │
│  Daily limit per language: [5]                  │
│                                                  │
│  ─── Languages ───────────────────────────────  │
│  ru  Русский      [Active ✓]  [Configure voices]│
│  en  English      [Active ✓]  [Configure voices]│
│  de  Deutsch      [Active ✗]  [Configure voices]│
│  [+ Add language]                               │
│                                                  │
│  ─── Stats ────────────────────────────────────  │
│  ru  Approved: 42  →  Запас: 8.4 дней          │
│  en  Approved: 38  →  Запас: 7.6 дней          │
│  de  Approved: 0   →  Долг: 0 дней             │
└─────────────────────────────────────────────────┘
```

**Логика подсчёта запаса/долга:**
```
totalApproved(lang) = COUNT(joke_translations WHERE languageCode=lang AND status='approved' AND isNotApplicable=false)
daysAhead(lang) = totalApproved(lang) / dailyLimitPerLanguage

Если daysAhead > 0 → "Запас: X.X дней" (зелёный)
Если daysAhead < 0 → "Долг: X.X дней" (красный)  ← не может быть отрицательным, просто 0
Если daysAhead = 0 → "В норме" (жёлтый)
```

**Configure voices dialog** (для каждого языка):
- Список ролей из всех существующих сегментов этого языка
- Для каждой роли — выбор дефолтного голоса (VoicePickerDialog)
- Сохраняется в `joke_language_settings.voiceConfig`

#### Workflow создания анекдота (новый Admin)

**Шаг 1: Ввод текста оригинала**

```
┌─────────────────────────────────────────────────┐
│  Новый анекдот                                  │
│                                                  │
│  Язык оригинала: [ru ▾]                         │
│                                                  │
│  [Switch: AI-разбивка] ← disabled, future       │
│                                                  │
│  Вставьте сегменты:                             │
│  [textarea]                                     │
│  [Parse]                                        │
│                                                  │
│  ─── Story ──────────────────────────────────── │
│  #1 [narrator] "Приходит мужик к врачу."       │
│  #2 [man]      "Доктор, помогите!"             │
│  [+ Add]                                       │
│                                                  │
│  Humor Rating: [7]  [Switch: 18+ / Explicit]   │
│                                                  │
│  Tags: [dark-humor ×] [medicine ×] [+ Add tag] │
│                                                  │
│  [Check Uniqueness & Proceed →]                 │
└─────────────────────────────────────────────────┘
```

После `Check Uniqueness`:
- `POST /v1/jokes/check-uniqueness` → `{ unique: boolean, conflictJokeId?: string }`
- Если не уникальный → ошибка с ссылкой на конфликтующий анекдот
- Если уникальный → появляется секция **Voice Assignment**
  - Роли из сегментов
  - Дефолтные голоса из `joke_language_settings.voiceConfig` для выбранного языка
  - Можно изменить каждый голос
- Кнопка **Start Voiceover** → создаёт TTS pipeline для оригинального языка

После старта — перенаправление на **Pending Jokes** (`/content/joke/pending`)

**Шаг 2: Pending Jokes страница**

Показывает анекдоты где НЕ все шаги завершены:
- `status = 'draft'` ИЛИ
- Нет озвучки хотя бы для одного активного языка ИЛИ
- Нет переводов для активных языков (кроме помеченных not_applicable)

Для каждого анекдота карточка:
```
┌─────────────────────────────────────────────────┐
│  "Приходит мужик к врачу..."  [ru]  draft       │
│                                                  │
│  Прогресс:                                      │
│  ru  ✅ озвучка готова                          │
│  en  ❌ нет перевода                            │
│  de  ⚠️  нет перевода (не применимо?)           │
│                                                  │
│  [▶ Прослушать ru]                             │
│  [Proceed: Add Translations →]                  │
└─────────────────────────────────────────────────┘
```

**Шаг 3: Добавление переводов**

Формат вставки:
```json
[
  {
    "name": "narrator",
    "ru": "Приходит мужик к врачу.",
    "en": "A man comes to the doctor.",
    "de": "Ein Mann kommt zum Arzt."
  },
  {
    "name": "man",
    "ru": "Доктор, помогите!",
    "en": "Doctor, please help!",
    "de": "Doktor, bitte helfen Sie!"
  }
]
```

Валидация:
- `name` поле присутствует (или `role`)
- Для каждого активного языка из `joke_language_settings` — есть поле с кодом языка ИЛИ язык будет помечен как not_applicable
- Оригинальный язык: текст должен совпадать с сохранённым (нормализованный хэш) → если нет, предупреждение
- Каждый язык проверяется на уникальность (SHA-256 хэш по всем сегментам языка)

После валидации:
- Показывается превью по каждому языку
- Кнопка **Mark as not applicable** для отдельных языков
- Кнопка **Save Translations & Start Voiceover**

**Шаг 4: Озвучка всех языков**

- Для каждого активного языка с переводом:
  - Берёт voice config из `joke_language_settings.voiceConfig[languageCode]`
  - Запускает отдельный TTS pipeline
- Прогресс: `X из Y языков озвучено`
- Карточка каждого языка:
  - Список сегментов с AudioPlayer когда готово
  - Для failed — retry
  - Для completed — можно точечно изменить voice ID роли + "Regenerate for this role"
  - Если поменял voice ID роли — все сегменты этой роли в этом языке показывают бейдж "Needs regeneration"

**Шаг 5: Финализация**

Кнопка **Approve & Save** (активна когда все языки озвучены или помечены not_applicable):
1. Статус joke → `approved`
2. `joke_language_settings` каунт пересчитывается (или инкрементируется кэш)
3. Все промежуточные TTS файлы для этого анекдота удаляются из MinIO
4. Сохраняются финальные `joke_audios` записи

#### Страница просмотра анекдота (dialog при клике в списке)

```
┌─────────────────────────────────────────────────┐
│  Joke Details  [approved ✓]  [18+ ⚠️]          │
│                                                  │
│  Tags: [dark-humor] [medicine]   Rating: 7/10   │
│                                                  │
│  ─── [ru] ─────────────────────────────────────  │
│  narrator: "Приходит мужик к врачу."            │
│  man:      "Доктор, помогите!"                  │
│  narrator: "Садитесь, больной."                 │
│  [▶ AudioPlayer]  [↓ Download ru]              │
│                                                  │
│  ─── [en] ─────────────────────────────────────  │
│  narrator: "A man comes to the doctor."         │
│  man:      "Doctor, please help!"              │
│  [▶ AudioPlayer]  [↓ Download en]              │
│                                                  │
│  [↓ Download All Languages]                     │
│                                                  │
│  [Edit]  [Delete]                               │
└─────────────────────────────────────────────────┘
```

#### Explicit / 18+ предупреждение

Если `hasExplicitContent = true`:
- Красный banner в detail view: "⚠️ Возможно необходимо запикивать часть аудио"
- Красный бейдж `18+` в списке анекдотов
- Это предупреждение для оператора — пикирование самого аудио в текущей версии не автоматизировано

---

## ОБЩИЕ КОМПОНЕНТЫ (реализованы, переиспользуются)

### `SegmentEditor` (`apps/hub/src/shared/ui/segment-editor/`)
Статус: ✅ реализован

Компоненты:
- `SegmentEditor` — список сегментов с добавлением/удалением/дублированием
- `RoleSelector` — Popover с существующими ролями + создание новой
- `parseSegmentsFromJson` — парсинг JSON/JS-массива
- `extractUniqueRoles` — уникальные роли из сегментов

Используется в:
- Hub: TTS Create page
- Admin: Joke Create (нужно перенести из hub/shared в packages/ui или дублировать)

**Решение по shared компонентам для Admin:**
SegmentEditor сейчас в `apps/hub/src/shared/ui/`. Admin тоже его использует.
Варианты:
1. Переместить в `packages/ui` (рекомендуется если используется в обоих приложениях)
2. Дублировать (не рекомендуется)

→ **Решение: переместить SegmentEditor и VoicePickerDialog в `packages/ui`**

### `VoicePickerDialog` (`apps/hub/src/shared/ui/voice-picker/`)
Статус: ✅ реализован

Компоненты:
- `VoicePickerDialog` — список голосов с фильтрами, превью, выбором
- `useVoicePreview` — управление воспроизведением превью

### `AudioPlayer` (`apps/hub/src/shared/ui/audio-player.tsx`)
Статус: ✅ реализован
- Play/pause, timeline scrubbing, форматирование времени
- Поддержка string src и async factory
- Actions slot

---

## ОЧЕРЁДНОСТЬ РЕАЛИЗАЦИИ (следующие задачи)

### Приоритет 1 — Hub TTS UI переработка
**Задача:** Переработать TTS Create page и TTS Jobs page согласно новому дизайну (см. 1.4.1 и 1.4.2)

Критерий готовности:
- Можно вставить JSON-массив, создать историю, назначить голоса, запустить озвучку
- Видно прогресс каждого сегмента
- Кнопка Confirm & Finalize запускает concatenation через audio-processing
- Финальный файл можно прослушать и скачать
- Промежуточные файлы удаляются после финализации

### Приоритет 2 — Hub Transcription Tool
**Задача:** Реализовать транскрипцию через faster-whisper

Критерий готовности:
- Воркер `transcription` queue принимает задачи, запускает faster-whisper subprocess, сохраняет результат в MinIO
- API endpoints: POST /v1/transcription, GET /v1/transcription/:jobId
- Hub `/tool/transcription`: загрузить аудио → выбрать язык → получить результат с таймкодами → скачать .srt/.vtt/.json
- Добавить `/tool/transcription` в sidebar Hub

### Приоритет 3 — Joke Settings + Languages
**Задача:** Создать инфраструктуру для многоязычных анекдотов

Критерий готовности:
- Таблицы `joke_settings`, `joke_language_settings` созданы, миграции применены
- Расширение `joke_translations` полями `isNotApplicable`, `notApplicableReason`
- Admin страница `/content/joke/settings`:
  - Изменение dailyLimitPerLanguage
  - Список активных языков с переключением
  - Configure voices dialog для каждого языка
  - Stats: запас/долг по каждому языку

### Приоритет 4 — Joke Create Workflow
**Задача:** Полный workflow создания анекдота

Критерий готовности:
- Новый Joke Create: SegmentEditor + uniqueness check + voice assignment + TTS start
- Pending Jokes страница с прогрессом по языкам
- Вставка переводов в JSON-формате с валидацией
- Многоязычная озвучка с polling
- Точечный retry/regenerate для роли в конкретном языке
- Финализация: approve + cleanup промежуточных файлов

### Приоритет 5 — Joke Detail View
**Задача:** Удобный просмотр готового анекдота

Критерий готовности:
- Dialog с текстом по ролям, вкладки по языкам
- AudioPlayer для каждого языка
- Download по языку и Download All
- 18+ предупреждение
- Теги, humor rating

### Приоритет 6 — SegmentEditor в packages/ui
**Задача:** Переместить SegmentEditor и VoicePickerDialog из `apps/hub/src/shared/ui/` в `packages/ui`

Критерий готовности:
- `packages/ui` экспортирует SegmentEditor, RoleSelector, VoicePickerDialog, useVoicePreview
- Hub и Admin импортируют из `@packages/ui`
- Нет дублирования кода

---

## СТРУКТУРА ПРОЕКТА (АКТУАЛЬНАЯ)

```
apps/
  hub/                  SolidJS — инструменты для оператора
    feature/
      audio-processing/ ✅ /tool/audio-processing
      tts/              ⚠️ /tool/tts, /tool/tts/create
    shared/
      ui/
        audio-player    ✅
        segment-editor  ✅ (переехать в packages/ui)
        voice-picker    ✅ (переехать в packages/ui)

  admin/                SolidJS — управление платформой
    feature/
      browser-fingerprint        ✅
      secret-voicer-credential   ✅
      storage                    ✅
      language                   ✅
      tag                        ✅
      joke                       ⚠️ (нужен новый workflow)

  api/                  Elysia.js на Bun
    feature/
      audio-processing  ✅
      browser-fingerprint ✅
      joke              ✅ (нужны новые endpoints)
      joke-tts          ✅
      language          ✅
      secret-voicer     ✅
      secret-voicer-credential ✅
      storage           ✅
      tag               ✅
      tts-project       ✅
      transcription     ❌ (нужно создать)

  worker/               Bun + BullMQ
    feature/
      audio-processing  ✅
      tts               ✅
      transcription     ❌ (нужно создать)
      ping              ✅

packages/
  contract/             Типы, константы, схемы валидации
  util/                 id, timing, css, dom, guard
  ui/                   UI-компоненты SolidJS
    action/             ✅ Button, IconButton, LoadingButton
    data-display/       ✅ Badge, Logo
    feedback/           ✅ Alert, Progress
    form/               ✅ все field-компоненты
    layout/             ✅ AppLayout, ContentShell, Navigation
    overlay/            ✅ Dialog, Popover, Sheet, toast, Tooltip
    theme/              ✅ ModeToggle
    typography/         ✅ H1-H6, P
    segment-editor/     ❌ (переехать из hub)
    voice-picker/       ❌ (переехать из hub)
```

---

## ХРАНЕНИЕ ФАЙЛОВ В MINIO (АКТУАЛЬНАЯ СХЕМА)

```
jstonehub/
  tmp/
    audio-processing/
      {jobId}/
        input/          ← загруженные пользователем файлы (TTL 3 дня)
        output/         ← обработанные файлы (TTL 3 дня)
    tts/
      {projectId}/
        seg_0000.mp3    ← сегменты TTS (временные, удаляются после финализации)
        seg_0001.mp3
    tts-final/
      {projectId}/
        output.mp3      ← финальный склеенный файл (TTL 3 дня)
    transcription/
      {jobId}/
        result.json     ← результат транскрипции (TTL 3 дня)
  cache/
    voice-preview/
      {voiceId}/
        preview.mp3     ← кэш превью голоса (постоянно)
  content/
    joke/
      {jokeId}/
        audio/
          {pipelineId}.mp3  ← финальная озвучка анекдота (постоянно)
```

---

## КОНВЕНЦИИ КОДА

```
Язык:               TypeScript (strict)
Рантайм:            Bun
Фреймворк API:      Elysia.js
Фреймворк Frontend: SolidJS + TanStack Router + TanStack Query
ORM:                Drizzle (camelCase в коде, snake_case в БД)
ID:                 cuid2
Даты:               timestamp with timezone
Стили:              Tailwind CSS + кастомные CSS-переменные (oklch)
Валидация API:      TypeBox
Валидация Frontend: Valibot
Очереди:            BullMQ + Redis
Файлы:              MinIO (один бакет jstonehub)
```

---

## ИНСТРУКЦИЯ ДЛЯ ИИ-РАЗРАБОТЧИКА

## Контекст

Тебе предоставляются:
1. **Архитектурный документ** (`main.md`) — полное описание всех сущностей, связей, бизнес-правил
2. **План разработки** (`curr.md`) — текущий статус, задачи, дизайн страниц
3. **Текущий код проекта** — актуальное состояние репозитория

## Порядок работы

1. **Проанализируй** текущий код и определи точное состояние задачи
2. **Определи следующую конкретную задачу** — самую приоритетную невыполненную из секции «Очерёдность реализации»
3. **Сформулируй задачу и ожидаемый результат** — кратко, чётко, с критериями готовности
4. **Дождись подтверждения** — пользователь ответит «ок»
5. **Реализуй задачу** — пиши код, следуя конвенциям
6. **Проверь** — нет ошибок типизации, код соответствует конвенциям
7. **Напиши референс** — краткое описание реализованного

## Формат референса

```
## [Название модуля]

Статус: ✅ Реализовано
Этап: 1.X

### Что сделано
- Краткое описание

### Публичное API
- `POST /v1/...` — описание
- `GET /v1/...` — описание

### Файлы
- `apps/api/src/feature/xxx/` — бэкенд
- `apps/hub/src/feature/xxx/` — фронтенд
- `apps/worker/src/feature/xxx/` — воркер

### Зависимости
- Использует: [другие модули]
- Используется в: [другие модули]
```

## Принципы

- **Не переусложняй.** Простое решение лучше «правильного», но сложного
- **Не выходи за рамки текущей задачи**
- **Следуй конвенциям** из секции выше и из `docs/architecture/convention/`
- **Переиспользуй существующие компоненты** — AudioPlayer, SegmentEditor, VoicePickerDialog
- **Спрашивай, если неясно**
```

---

**`docs/plan/main.md`** (добавления/изменения к существующему документу):

```markdown
# ПОЛНАЯ АРХИТЕКТУРА ПЛАТФОРМЫ — ИТОГОВЫЙ ДОКУМЕНТ

[Существующий контент остаётся без изменений. Ниже — дополнения.]

---

## ДОПОЛНЕНИЯ И УТОЧНЕНИЯ К АРХИТЕКТУРЕ

### Joke Settings (новая таблица — singleton)
```
joke_settings
id                    string, PK, cuid2
dailyLimitPerLanguage integer, not null, default 5
createdAt             timestamp, default now()
updatedAt             timestamp, default now()
```

Логика подсчёта запаса/долга:
- `totalApproved(lang)` = COUNT joke_translations WHERE languageCode=lang AND status='approved' AND isNotApplicable=false
- `daysAhead(lang)` = totalApproved(lang) / dailyLimitPerLanguage
- Пересчитывается на лету при каждом запросе (деление, без итерации)
- При изменении dailyLimitPerLanguage — мгновенный пересчёт для всех языков

### Joke Language Settings (новая таблица)
```
joke_language_settings
id              string, PK, cuid2
languageCode    string, unique, not null, FK → languages.code
isActive        boolean, not null, default true
voiceConfig     jsonb, not null, default '{}' — {"role": "voice_id"}
createdAt       timestamp, default now()
updatedAt       timestamp, default now()
```

Используется для:
- Определения, для каких языков нужны переводы/озвучка
- Хранения дефолтных voice ID для каждой роли на каждом языке
- Подсчёта статистики запаса/долга анекдотов

### Расширение joke_translations
```
Добавить поля к существующей таблице:
isNotApplicable      boolean, not null, default false
notApplicableReason  string, nullable
  — допустимые значения: "context_mismatch", "no_translation", "other"
```

### Transcription Jobs (новая таблица)
```
transcription_jobs
id               string, PK, cuid2
status           enum: "queued", "processing", "completed", "failed"
inputFileKey     string, not null
outputFileKey    string, nullable
language         string, nullable (null = autodetect)
detectedLanguage string, nullable
durationMs       integer, nullable
errorMessage     string, nullable
createdAt        timestamp, default now()
completedAt      timestamp, nullable
```

Enum `transcription_status`: "queued", "processing", "completed", "failed"

### TTS Projects — финализация (уточнение)

После завершения всех сегментов:
1. Пользователь нажимает Confirm & Finalize
2. Если concatenate=true:
   - outputKey всех completed сегментов → audio-processing queue
   - Результат сохраняется в `tmp/tts-final/{projectId}/output.mp3`
   - Все сегментные файлы `tmp/tts/{projectId}/` удаляются
3. Если concatenate=false:
   - Пользователь скачивает файлы по отдельности
   - После явного подтверждения скачивания — файлы удаляются
4. Финальные файлы имеют TTL = 3 дня (как audio-processing)

### Storage Prefixes (полная актуальная схема)
```typescript
STORAGE_PREFIXES = {
  audioProcessingInput:   (jobId) => `tmp/audio-processing/${jobId}/input/`,
  audioProcessingOutput:  (jobId) => `tmp/audio-processing/${jobId}/output/`,
  audioProcessingJob:     (jobId) => `tmp/audio-processing/${jobId}/`,
  ttsOutput:              (projectId) => `tmp/tts/${projectId}/`,
  ttsFinal:               (projectId) => `tmp/tts-final/${projectId}/`,
  voicePreview:           (voiceId) => `cache/voice-preview/${voiceId}/`,
  jokeAudio:              (jokeId) => `content/joke/${jokeId}/audio/`,
  transcriptionResult:    (jobId) => `tmp/transcription/${jobId}/`,
}
```

### Транскрипция — принцип работы

**Транскрипция всегда отдельный шаг.** Не встраивается в audio-processing. Не запускается автоматически при озвучке.

Запускается только в:
1. Ручном режиме через Hub `/tool/transcription`
2. Joke approval workflow — после финализации озвучки всех языков
3. Blueprint pipeline — как отдельный шаг в цепочке генерации контента

Результат транскрипции (TranscriptionResult) хранится как JSON в MinIO и при необходимости прикрепляется к `joke_audios.transcription` (поле уже существует в схеме).

### Поддерживаемые языки faster-whisper

Гарантированно хорошее качество:
`ru`, `en`, `de`, `es`, `fr`, `it`, `pt`, `pl`, `uk`, `ja`, `zh`, `ko`, `tr`, `ar`

Поддерживается (качество варьируется):
`nl`, `sv`, `fi`, `nb`, `da`, `cs`, `sk`, `ro`, `hu`, `hr`, `bg`, `sr`, `el`, `he`, `vi`, `th`, `id`, `ms` и ещё 70+ языков

### Каскадное удаление — уточнения

| Удаляем | Каскад |
|---------|--------|
| Joke (approved) | → joke_translations (cascade) → joke_audios (cascade) → joke_tags (cascade). Файлы в MinIO — фоновая очистка. |
| JokeTtsPipeline | → связанные tts_project удаляются отдельно. joke_audio НЕ удаляется при удалении pipeline после финализации. |
| TtsProject | → tts_segments (cascade). Файлы в MinIO: tmp/tts/{projectId}/ и tmp/tts-final/{projectId}/ — удаляются явно в сервисе. |
| TranscriptionJob | Файл tmp/transcription/{jobId}/ — удаляется явно. |

### Бизнес-правила — уточнения

**Уникальность анекдотов:**
- SHA-256 от нормализованного текста всех сегментов языка
- Нормализация: lowercase → удалить пунктуацию → trim → collapse whitespace → join segments через " "
- Проверяется:
  1. При создании анекдота (оригинальный язык) — до запуска озвучки
  2. При добавлении переводов — для каждого языка отдельно
- Если дубликат найден → `409 Conflict` с `conflictJokeId`

**Voice Assignment для анекдотов:**
- Каждый язык имеет свой независимый voice config
- voice config хранится в `joke_language_settings.voiceConfig` как дефолт
- При создании озвучки дефолты подставляются, но можно переопределить
- После финализации озвучки voice config НЕ сохраняется в joke_audios отдельно — он уже зафиксирован в самом аудиофайле
- `joke_audios.voiceConfig` — сохраняется для справки (какие голоса использовались)

**Joke статусы:**
- `draft` — создан, не все шаги завершены
- `review` — все переводы и озвучка готовы, ожидает проверки
- `approved` — проверен, учитывается в подсчёте запаса

**Explicit content:**
- `hasExplicitContent = true` → красное предупреждение в UI
- Смысл: оператор должен знать, что при публикации возможно нужно запикивать маты/слова
- Автоматическое пикирование аудио — не реализуется в текущем этапе
```

```markdown
**Joke статусы:**
- `draft` — создан, не все шаги завершены
- `review` — все переводы и озвучка готовы, ожидает проверки
- `approved` — проверен, учитывается в подсчёте запаса

**Explicit content:**
- `hasExplicitContent = true` → красное предупреждение в UI
- Смысл: оператор должен знать, что при публикации возможно нужно запикивать маты/слова
- Автоматическое пикирование аудио — не реализуется в текущем этапе

---

## 3. ПОЛНАЯ КАРТА СВЯЗЕЙ (обновлённая)

```
languages
  └──▶ joke_language_settings (languageCode)
  └──▶ joke_translations (languageCode)

joke_settings (singleton)

jokes
  ├──▶ joke_translations (jokeId, cascade)
  │         ├──▶ joke_audios (jokeTranslationId, cascade)
  │         └──▶ joke_tts_pipelines (jokeTranslationId, cascade)
  └──▶ joke_tags (jokeId, cascade)
             └──▶ tags (tagId)

browser_fingerprints
  └──▶ secret_voicer_credentials (fingerprintId, cascade)

tts_projects
  └──▶ tts_segments (projectId, cascade)

transcription_jobs (независимая таблица)

content_usages (независимая таблица, используется блюпринтами)
```

---

## 4. ENUMS (полный список актуальных)

```sql
-- Существующие
browser_platform:         Win32, Linux x86_64, MacIntel, Linux armv81
browser_vendor:           Google Inc., Apple Computer Inc., ""
tts_project_status:       pending, processing, completed, partial, failed
tts_segment_status:       pending, queued, processing, completed, failed
joke_status:              draft, review, approved
joke_translation_status:  draft, approved
joke_tts_pipeline_status: pending, creating_tasks, synthesizing, processing_audio, saving, completed, failed

-- Новые (добавить)
transcription_status:     queued, processing, completed, failed
```

---

## 5. ХРАНИЛИЩЕ ФАЙЛОВ (полная актуальная схема)

Бакет: `jstonehub` (один бакет для всего)

```
jstonehub/
  tmp/                          ← временные файлы, TTL 3 дня
    audio-processing/
      {jobId}/
        input/                  ← загруженные пользователем файлы
        output/                 ← обработанные файлы
    tts/
      {projectId}/
        seg_0000.mp3            ← сегменты TTS (удаляются после финализации)
        seg_0001.mp3
        ...
    tts-final/
      {projectId}/
        output.mp3              ← финальный склеенный файл
    transcription/
      {jobId}/
        result.json             ← JSON с таймкодами

  cache/                        ← кэш, без TTL
    voice-preview/
      {voiceId}/
        preview.mp3             ← превью голоса (загружается один раз)

  content/                      ← постоянное хранение
    joke/
      {jokeId}/
        audio/
          {pipelineId}.mp3      ← финальная озвучка анекдота
```

Storage prefixes в коде (`packages/contract/src/storage.ts`):
```typescript
export const STORAGE_PREFIXES = {
  audioProcessingInput:  (jobId: string) => `tmp/audio-processing/${jobId}/input/`,
  audioProcessingOutput: (jobId: string) => `tmp/audio-processing/${jobId}/output/`,
  audioProcessingJob:    (jobId: string) => `tmp/audio-processing/${jobId}/`,
  ttsOutput:             (projectId: string) => `tmp/tts/${projectId}/`,
  ttsFinal:              (projectId: string) => `tmp/tts-final/${projectId}/`,
  voicePreview:          (voiceId: string) => `cache/voice-preview/${voiceId}/`,
  jokeAudio:             (jokeId: string) => `content/joke/${jokeId}/audio/`,
  transcriptionResult:   (jobId: string) => `tmp/transcription/${jobId}/`,
} as const;
```

---

## 6. ОЧЕРЕДИ (полный актуальный список)

```
ping              — тестовая очередь
tts               — синтез речи через Secret Voicer
audio-processing  — обработка аудио через FFmpeg
transcription     — транскрипция через faster-whisper
video-compose     — монтаж видео (будущий этап)
media-download    — скачивание медиа через yt-dlp (будущий этап)
```

Каждая очередь имеет соответствующий воркер в `apps/worker/src/feature/`.

---

## 7. API ROUTES (полный актуальный список)

### Реализованные
```
GET    /live                                           — healthcheck

GET    /v1/fingerprints                               — список fingerprints
GET    /v1/fingerprints/:id                           — fingerprint по ID
POST   /v1/fingerprints                               — создать
PATCH  /v1/fingerprints/:id                          — обновить
DELETE /v1/fingerprints/:id                          — удалить

GET    /v1/secret-voicer-credentials                  — список credentials
GET    /v1/secret-voicer-credentials/:id              — по ID
POST   /v1/secret-voicer-credentials                  — создать
PATCH  /v1/secret-voicer-credentials/:id             — обновить
DELETE /v1/secret-voicer-credentials/:id             — удалить

GET    /v1/secret-voicer/voices                       — список голосов
GET    /v1/secret-voicer/voices/preview               — превью голоса (?voiceId&url)
POST   /v1/secret-voicer/tasks/synthesize             — создать задачу синтеза
GET    /v1/secret-voicer/tasks/:taskId/status         — статус задачи

GET    /v1/tts-projects                               — список проектов
GET    /v1/tts-projects/:id                           — проект по ID
POST   /v1/tts-projects                               — создать проект
POST   /v1/tts-projects/:id/segments/:idx/retry       — повторить сегмент
DELETE /v1/tts-projects/:id                          — удалить проект

POST   /internal/tts/segment-completed                — webhook воркера
POST   /internal/tts/segment-failed                   — webhook воркера

GET    /v1/languages                                  — список языков
POST   /v1/languages                                  — создать
PATCH  /v1/languages/:id                             — обновить
DELETE /v1/languages/:id                             — удалить

GET    /v1/tags                                       — список тегов
POST   /v1/tags                                       — создать
PATCH  /v1/tags/:id                                  — обновить
DELETE /v1/tags/:id                                  — удалить

GET    /v1/jokes                                      — список анекдотов
GET    /v1/jokes/:id                                  — анекдот по ID
POST   /v1/jokes                                      — создать
PATCH  /v1/jokes/:id                                 — обновить
POST   /v1/jokes/:id/translations                     — добавить перевод
DELETE /v1/jokes/:id                                 — удалить

GET    /v1/joke-tts                                   — список pipeline
GET    /v1/joke-tts/:id                               — pipeline по ID
POST   /v1/joke-tts                                   — запустить pipeline
GET    /v1/joke-tts/by-translation/:translationId     — pipeline для перевода
DELETE /v1/joke-tts/:id                              — удалить pipeline

POST   /v1/audio-processing/upload-urls               — presigned URLs для загрузки
POST   /v1/audio-processing/process                   — запустить обработку
GET    /v1/audio-processing/jobs                      — список заданий
GET    /v1/audio-processing/jobs/:jobId               — задание по ID
DELETE /v1/audio-processing/jobs/:jobId              — удалить задание
GET    /v1/audio-processing/defaults                  — дефолтные настройки

GET    /v1/storage/objects                            — список объектов MinIO
DELETE /v1/storage/objects                            — удалить объекты

POST   /v1/queue/ping                                 — тестовый ping в очередь
```

### Нужно добавить
```
POST   /v1/jokes/check-uniqueness                     — проверка уникальности до сохранения
POST   /v1/tts-projects/:id/finalize                  — финализация (concat + cleanup)

GET    /v1/joke-settings                              — получить настройки анекдотов
PATCH  /v1/joke-settings                             — обновить настройки

GET    /v1/joke-language-settings                     — список языков для анекдотов
POST   /v1/joke-language-settings                     — добавить язык
PATCH  /v1/joke-language-settings/:languageCode      — обновить (isActive, voiceConfig)
DELETE /v1/joke-language-settings/:languageCode      — удалить язык

POST   /v1/transcription                              — создать задачу транскрипции
GET    /v1/transcription/:jobId                       — статус + результат
```

---

## 8. FRONTEND ROUTES (полный актуальный список)

### Hub (`apps/hub`)
```
Реализованные:
  /                           — Home
  /login                      — Login (заглушка)
  /tool/audio-processing      — Audio Processing tool ✅
  /tool/tts                   — TTS Jobs ⚠️ (требует переработки)
  /tool/tts/create            — TTS Create ⚠️ (требует переработки)

Нужно добавить:
  /tool/transcription         — Transcription tool ❌
```

### Admin (`apps/admin`)
```
Реализованные:
  /                                               — Home
  /login                                          — Login (заглушка)
  /infrastructure/browser-fingerprint            — Fingerprints CRUD ✅
  /infrastructure/secret-voicer-credential       — Credentials CRUD ✅
  /storage                                        — Storage browser ✅
  /content/language                               — Languages CRUD ✅
  /content/tag                                    — Tags CRUD ✅
  /content/joke                                   — Jokes list ⚠️

Нужно добавить:
  /content/joke/settings                          — Joke Settings ❌
  /content/joke/pending                           — Pending Jokes ❌
  /content/joke/new                               — New Joke (новый workflow) ❌
```

---

## 9. SHARED UI КОМПОНЕНТЫ (актуальный статус)

### Реализованы в `packages/ui`
```
action/      Button, IconButton, LoadingButton
data-display/ Badge, Logo
feedback/    Alert, Progress
form/        TextInputField, TextareaField, NumberInputField, SelectField,
             SwitchField, CheckboxField, RadioGroupField, SearchInput,
             Select, MultiSelect, SearchableSelect, SearchableMultiSelect
layout/      AppLayout, ContentShell, Navigation, SidebarDesktopToggle,
             SidebarMobileTrigger
overlay/     Dialog, Popover, Sheet, toast, Tooltip
theme/       ModeToggle
typography/  H1-H6, P
provider/    UiProvider
```

### Реализованы в `apps/hub/src/shared/ui` (нужно перенести в `packages/ui`)
```
audio-player/     AudioPlayer, AudioPlayerProps
segment-editor/   SegmentEditor, RoleSelector, parseSegmentsFromJson,
                  extractUniqueRoles, createSegment, normalizeRole
voice-picker/     VoicePickerDialog, useVoicePreview
```

### Нужно добавить в `packages/ui`
```
audio-player      (переехать из hub)
segment-editor    (переехать из hub)
voice-picker      (переехать из hub)
```

---

## 10. КЛЮЧЕВЫЕ БИЗНЕС-ПРАВИЛА (полные)

### Уникальность анекдотов
1. Нормализация текста сегментов языка: `toLowerCase() → удалить пунктуацию → trim() → collapse whitespace → join(" ")`
2. SHA-256 хэш от нормализованного текста
3. Проверка в `joke_translations.uniquenessHash`
4. Проверяется дважды:
   - При создании анекдота (оригинальный язык) — до озвучки
   - При добавлении переводов — для каждого нового языка

### TTS Финализация
1. Все сегменты completed → пользователь нажимает Confirm & Finalize
2. concatenate=true → audio-processing queue → финальный файл в `tmp/tts-final/`
3. Промежуточные сегменты в `tmp/tts/` → удаляются после финализации
4. Финальный файл TTL = 3 дня

### Joke Audio Lifecycle
1. TTS pipeline создаёт временные файлы в `tmp/tts/{projectId}/`
2. JokeTTS service копирует готовый файл в `content/joke/{jokeId}/audio/`
3. Временные TTS файлы удаляются
4. `content/joke/` файлы хранятся постоянно (это контент, не временный файл)

### Joke Approval
1. draft → все переводы добавлены + все озвучки готовы → review
2. review → оператор проверил → approved
3. При approve: `joke_language_settings` счётчики пересчитываются

### Запас/долг анекдотов
```
totalApproved(lang) = COUNT(joke_translations
  WHERE languageCode = lang
  AND status = 'approved'
  AND isNotApplicable = false)

daysAhead(lang) = totalApproved(lang) / joke_settings.dailyLimitPerLanguage

Отображение:
  > 0  → "Запас: {N} дн." (зелёный)
  = 0  → "В норме" (жёлтый)
  нет approved → "Долгов нет, анекдотов нет" (серый)
```

### Voice Assignment правила
- Один voiceId не может быть назначен двум ролям в одном проекте/языке
- Дефолтные голоса для анекдотов хранятся в `joke_language_settings.voiceConfig`
- После финализации озвучки голоса фиксируются в `joke_audios.voiceConfig` (справочно)
- Переозвучка конкретной роли в конкретном языке не затрагивает другие языки

### Транскрипция
- Всегда отдельный шаг, никогда не автоматическая
- Результат: JSON с массивом `{start, end, text}` + `plainText` + `language` + `durationMs`
- Сохраняется в MinIO как JSON, путь записывается в `transcription_jobs.outputFileKey`
- При использовании в joke workflow: результат прикрепляется к `joke_audios.transcription`

### Explicit Content
- `hasExplicitContent = true` → только предупреждение в UI
- Пикирование аудио — не автоматизировано в текущей версии
- Оператор сам решает нужно ли пикировать при публикации

---

## 11. КАСКАДНОЕ УДАЛЕНИЕ (обновлённое)

| Удаляем | Каскад |
|---------|--------|
| Joke | → joke_translations (cascade) → joke_audios (cascade), joke_tts_pipelines (cascade), joke_tags (cascade). Файлы в MinIO `content/joke/{id}/` — фоновая очистка |
| JokeTranslation | → joke_audios (cascade), joke_tts_pipelines (cascade) |
| JokeTtsPipeline | Удаляется запись. joke_audio НЕ удаляется если pipeline уже завершён |
| TtsProject | → tts_segments (cascade). Файлы `tmp/tts/{id}/` и `tmp/tts-final/{id}/` — удаляются явно в сервисе |
| TranscriptionJob | Файл `tmp/transcription/{id}/` — удаляется явно |
| Language | Запрещено если есть joke_translations или joke_language_settings с этим кодом |
| Tag | → joke_tags (cascade) |
| BrowserFingerprint | → secret_voicer_credentials (cascade) |
```