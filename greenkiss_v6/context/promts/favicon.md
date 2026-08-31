### Задача: Реализовать полнофункциональную систему управления favicon с автоматической генерацией размеров и хранением в S3

## 1. Архитектура и структура файлов

### Реорганизация кода:

1. **Создать feature-модуль `src/features/favicon/`** со следующей структурой:

```
src/features/favicon/
├── index.ts           # Реэкспорт клиентских компонентов и утилит
├── server.ts          # Реэкспорт серверных функций и API
├── _api/              # API endpoints
├── _ui/               # Весь ui
├── _lib/              # Бизнес-логика и утилиты
└── _types/            # TypeScript типы
```

Схему помести в src/shared/api/db/schemas/

2. **Миграция S3 функционала**: Перенести все S3-related код из `shared/cloud` в `shared/lib/s3.ts`

3. **Создать универсальный тип ответа API** в `shared/api/response.ts`:

```typescript
export type ApiResponse<T = void> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string; details?: unknown }
```

## 2. Техническая спецификация favicon

### Валидация и требования:
- **Формат**: Только PNG (валидация MIME-type и magic bytes на клиенте и сервере)
- **Максимальное разрешение**: 512x512px
- **Соотношение сторон**: 1:1 (квадрат)

### Автоматически генерируемые размеры:

```
'original' : { maxSize: 1024, minSize: 512, maxBytes: 32_768 }
'favicon-32': { size: 32, maxBytes: 1_024 }
'favicon-96': { size: 96, maxBytes: 3_072 }
'apple-touch-icon': { size: 180, maxBytes: 6_144 }
'android-chrome-192': { size: 192, maxBytes: 6_144 }
'android-chrome-512': { size: 512, maxBytes: 16_384 }
```

### Структура хранения в S3:
```
branding/
└── favicons/
    └── {faviconId}/
        ├── original.png
        ├── favicon-32x32.png
        ├── favicon-96x96.png
        ├── apple-touch-icon-180x180.png
        ├── android-chrome-192x192.png
        └── android-chrome-512x512.png
```

## 3. Функциональные требования

### UI компоненты для реализации:

1. **FaviconUploader**:
   - Drag & drop интерфейс
   - Предварительный просмотр
   - Клиентская валидация формата и размера
   - Интегрированный image cropper (react-easy-crop или аналог)

2. **FaviconCropper**:
   - Интерактивная обрезка до квадрата
   - Zoom контроль
   - Сетка-гайд для точного позиционирования

3. **FaviconPreview**:
   - Табы/галерея всех сгенерированных размеров
   - Отображение реального размера файла в байтах
   - Симуляция отображения в браузере/на устройстве

4. **FaviconSettings**:
   - Редактирование максимальных размеров файлов, всегда в байтах, но выводится красиво в мегабайтах, с отображением байтов, шаг 256 байт. Минимального разрешения и максимального разрешения оригинала (только для админов)
   - Настройки качества сжатия
   - Управление активным favicon

### API endpoints:

1. **POST `/api/favicon/upload`**:
   - Принимает base64 изображение после кропа
   - Валидирует на сервере
   - Генерирует все размеры используя Sharp
   - Оптимизирует каждый размер (pngquant/optipng)
   - Загружает в S3
   - Возвращает URLs всех вариантов

2. **GET `/api/favicon/[id]`**:
   - Получение метаданных favicon и всех URLs

3. **DELETE `/api/favicon/[id]`**:
   - Удаление всех файлов из S3
   - Проверка прав доступа

4. **PATCH `/api/favicon/settings`** (admin only):
   - Обновление максимальных размеров файлов
   - Обновление параметров сжатия

### Серверные функции (`server.ts`):

1. **generateFaviconSizes()**: Генерация всех размеров из исходного изображения
2. **optimizePng()**: Оптимизация PNG с учетом maxBytes
3. **uploadToS3()**: Batch загрузка всех размеров в S3
4. **generateManifest()**: Генерация site.webmanifest
5. **validateImageDimensions()**: Серверная валидация размеров

### База данных:
```
model Favicon {
  id          String   @id @default(cuid())
  name        String
  originalUrl String
  sizes       Json     // Объект с URLs всех размеров
  isActive    Boolean  @default(false)
  uploadedBy  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FaviconSettings {
  id         String @id @default("default")
  maxSizes   Json   // Объект с maxBytes для каждого размера
  quality    Int    @default(85)
  updatedBy  String
  updatedAt  DateTime @updatedAt
}
```

## 4. Дополнительные требования

- Реализовать optimistic updates при удалении
- Добавить progress bar для процесса генерации размеров
- Логирование всех операций с favicon
- Поддержка отмены загрузки
- Валидация прав доступа через middleware
- Генерация meta-тегов для приложения

## 5. Примечания по реализации

- Реализовать preview в различных контекстах (browser tab, bookmark, home screen)
- Интеграция с CDN (мое S3) для оптимальной доставки