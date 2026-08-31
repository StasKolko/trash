export const PROGRESS_ITEMS = [
  {
    name: "Инициализация проекта",
    completed: true,
    tasks: [
      { name: "Создание package.json", completed: true },
      { name: "Установка базовых зависимостей", completed: true },
      { name: "Создание структуры папок", completed: true },
    ],
  },
  {
    name: "Добавление Turborepo",
    completed: true,
    tasks: [
      { name: "Установка turborepo", completed: true },
      { name: "Настройка turbo.json", completed: true },
      { name: "Конфигурация кеша", completed: true },
      { name: "Настройка pipeline задач", completed: true },
    ],
  },
  {
    name: "Добавление Prettier",
    completed: true,
    tasks: [
      { name: "Установка prettier", completed: true },
      { name: "Создание .prettierrc", completed: true },
      { name: "Создание .prettierignore", completed: true },
      {
        name: "Добавление turbo и bun скриптов форматирования",
        completed: true,
      },
    ],
  },
  {
    name: "Инициализация Git",
    completed: true,
    tasks: [
      { name: "git init", completed: true },
      { name: "Настройка .gitignore", completed: true },
      { name: "Настройка .gitattributes", completed: true },
      { name: "Первый коммит", completed: true },
    ],
  },
  {
    name: "Создание context-builder",
    completed: true,
    tasks: [
      { name: "Разработка скрипта генерации контекста", completed: true },
      {
        name: "Настройка исключений файлов, папок и расширений",
        completed: true,
      },
      { name: "Добавление bun скрипта", completed: true },
    ],
  },
  {
    name: "Создание project-cleaner",
    completed: true,
    tasks: [
      { name: "Скрипт очистки node_modules", completed: true },
      { name: "Скрипт очистки кеша", completed: true },
      { name: "Скрипт очистки dist папок", completed: true },
      { name: "Добавление bun команды", completed: true },
    ],
  },
  {
    name: "Внедрение TypeScript",
    completed: true,
    tasks: [
      { name: "Установка typescript", completed: true },
      { name: "Создание base.json", completed: true },
      { name: "Конфиг для backend", completed: true },
      { name: "Конфиг для frontend", completed: true },
      { name: "Настройка путей и алиасов", completed: true },
    ],
  },
  {
    name: "Внедрение ESLint",
    completed: true,
    tasks: [
      { name: "Установка eslint и плагинов", completed: true },
      { name: "Базовый конфиг", completed: true },
      { name: "Конфиг для backend", completed: true },
      { name: "Конфиг для frontend", completed: true },
      { name: "Интеграция с TypeScript", completed: true },
    ],
  },
  {
    name: "Установка Husky",
    completed: true,
    tasks: [
      { name: "Установка husky", completed: true },
      { name: "Настройка pre-commit хука", completed: true },
      { name: "Добавление проверки типов", completed: true },
      { name: "Добавление линтинга", completed: true },
      { name: "Добавление форматирования", completed: true },
    ],
  },
  {
    name: "Создание backend на Elysia",
    completed: true,
    tasks: [
      { name: "Инициализация workspace backend", completed: true },
      { name: "Установка Elysia", completed: true },
      { name: "Настройка SSR для первой загрузки", completed: true },
      { name: "Настройка SPA роутинга", completed: true },
      { name: "Создание API структуры", completed: true },
    ],
  },
  {
    name: "Создание frontend на SolidJS",
    completed: true,
    tasks: [
      { name: "Инициализация workspace frontend", completed: true },
      { name: "Установка SolidJS", completed: true },
      { name: "Настройка solid-router", completed: true },
      { name: "Настройка solid-meta", completed: true },
      { name: "Конфигурация Vite", completed: true },
      { name: "Установка и настройка Tailwind CSS", completed: true },
    ],
  },
].reverse();
