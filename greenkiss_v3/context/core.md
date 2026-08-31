.prettierrc

```
{ "plugins": ["prettier-plugin-tailwindcss"] }

```

apps\backend\package.json

```
{
  "name": "@apps/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/server.ts",
    "build": "bun build src/server.ts --target=bun --format=esm --outfile ../../dist/server.mjs",
    "format": "prettier . --write",
    "lint": "eslint . --fix",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@elysiajs/static": "^1.4.6",
    "elysia": "^1.1.0"
  },
  "devDependencies": {
    "@configs/eslint": "workspace:*",
    "@configs/typescript": "workspace:*",
    "@types/bun": "^1.3.2"
  }
}

```

apps\backend\src\api\healthz-handler.ts

```
export const getHealthzHandler = () => ({ ok: true });

```

apps\backend\src\api\message-handler.ts

```
export const getWelcomeMessage = () => ({
  message: process.env.VITE_MESSAGE ?? "С любовью, от backend Green Kiss 💚",
});

```

apps\backend\src\routes\ssr-route\index.ts

```
import type { Context } from "elysia";
import {
  collectCss,
  collectJs,
  loadManifest,
  resolveEntryKey,
} from "./manifest";
import { loadRenderer } from "./renderer";
import { renderHtml } from "./render-html";

export interface SsrHandlerOptions {
  clientDir: string;
  ssrDir: string;
}

export function createSsrHandler({
  clientDir,
  ssrDir,
}: {
  clientDir: string;
  ssrDir: string;
}) {
  return async function ssrHandler({ request, set }: Context) {
    const accept = request.headers.get("accept") || "";
    if (!accept.includes("text/html")) {
      set.status = 404;
      return "Not found";
    }

    try {
      const manifest = await loadManifest(clientDir);
      const { render } = await loadRenderer(ssrDir);

      const entryKey = resolveEntryKey(manifest);
      const manifestEntry = manifest[entryKey];
      if (!manifestEntry)
        throw new Error(`Manifest missing entry: ${entryKey}`);

      const cssFiles = collectCss(manifest, entryKey);
      const preloadJs = collectJs(manifest, entryKey);

      const url = new URL(request.url);
      const { body, hydration } = await render(url.toString());

      const html = renderHtml({
        body,
        hydration,
        entryJs: manifestEntry.file, // обычно "assets/xxx.js"
        cssFiles, // обычно ["assets/xxx.css"]
        preloadJs,
      });

      set.headers["content-type"] = "text/html; charset=utf-8";
      return html;
    } catch (e) {
      set.status = 500;
      return `SSR error: ${(e as Error).message}`;
    }
  };
}

```

apps\backend\src\routes\ssr-route\manifest.ts

```
import path from "node:path";
import { exists } from "@/shared/lib/fs-utils";

type ViteManifest = Record<
  string,
  {
    file: string;
    src?: string;
    isEntry?: boolean;
    css?: string[];
    imports?: string[];
    assets?: string[];
    dynamicImports?: string[];
  }
>;

export async function loadManifest(clientDir: string): Promise<ViteManifest> {
  const candidates = [
    path.join(clientDir, ".vite", "manifest.json"),
    path.join(clientDir, "manifest.json"),
  ];
  for (const p of candidates) {
    if (await exists(p)) {
      const text = await Bun.file(p).text();
      return JSON.parse(text) as ViteManifest;
    }
  }
  throw new Error("Vite manifest.json not found in dist/client");
}

export function resolveEntryKey(manifest: ViteManifest): string {
  const entry = Object.entries(manifest).find(
    ([, v]) => v.isEntry && v.file && v.file.endsWith(".js"),
  );
  if (!entry) throw new Error("No JS entry in Vite manifest");
  return entry[0];
}

export function collectCss(manifest: ViteManifest, key: string): string[] {
  const visited = new Set<string>();
  const cssSet = new Set<string>();

  const walk = (k: string) => {
    if (visited.has(k)) return;
    visited.add(k);
    const e = manifest[k];
    if (!e) return;
    if (e.css) for (const c of e.css) cssSet.add(c);
    if (e.imports) for (const i of e.imports) walk(i);
  };

  walk(key);

  // Перестраховка: добавим standalone css-ассеты, если они есть
  for (const e of Object.values(manifest)) {
    if (e.file?.endsWith(".css")) cssSet.add(e.file);
  }

  return [...cssSet];
}

export function collectJs(manifest: ViteManifest, key: string): string[] {
  const visited = new Set<string>();
  const files = new Set<string>();
  const walk = (k: string) => {
    if (visited.has(k)) return;
    visited.add(k);
    const e = manifest[k];
    if (!e) return;
    if (e.file) files.add(e.file);
    if (e.imports) for (const i of e.imports) walk(i);
    // ВАЖНО: dynamicImports не трогаем — пусть грузятся по запросу
  };
  walk(key);

  return [...files];
}

```

apps\backend\src\routes\ssr-route\render-html.ts

```
export function renderHtml({
  body,
  hydration,
  entryJs,
  cssFiles,
  preloadJs,
}: {
  body: string;
  hydration: string;
  entryJs: string;
  cssFiles: string[];
  preloadJs: string[];
}): string {
  const cssLinks = cssFiles
    .map((href) => `<link rel="stylesheet" href="/${href}" />`)
    .join("");

  const jsPreloads = preloadJs
    .map((href) => `<link rel="modulepreload" crossorigin href="/${href}" />`)
    .join("");

  const v = "v=1";

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link rel="icon" type="image/png" href="/favicon.png?${v}" />
    <link rel="apple-touch-icon" href="/favicon.png?${v}" />

    ${cssLinks}
    ${jsPreloads}
    ${hydration}
  </head>
  <body>
    <div id="app">${body}</div>
    <script type="module" src="/${entryJs}"></script>
  </body>
</html>`;
}

```

apps\backend\src\routes\ssr-route\renderer.ts

```
import path from "node:path";
import { exists } from "@/shared/lib/fs-utils";

export type SSRModule = {
  render: (url: string) => Promise<{ body: string; hydration: string }>;
};

let rendererCache: SSRModule | null = null;

export async function loadRenderer(ssrDir: string): Promise<SSRModule> {
  if (rendererCache) return rendererCache;

  const jsPath = path.join(ssrDir, "entry-server.js");
  const mjsPath = path.join(ssrDir, "entry-server.mjs");

  if (await exists(jsPath)) {
    rendererCache = (await import(jsPath)) as SSRModule;
    return rendererCache;
  }
  if (await exists(mjsPath)) {
    rendererCache = (await import(mjsPath)) as SSRModule;
    return rendererCache;
  }
  throw new Error("SSR entry not found in ssrDir (entry-server.js/mjs)");
}

```

apps\backend\src\routes\ssr-route\types.ts

```

```

apps\backend\src\server.ts

```
import { Elysia } from "elysia";
import staticPlugin from "@elysiajs/static";
import { createSsrHandler } from "./routes/ssr-route";
import { getWelcomeMessage } from "./api/message-handler";
import { getHealthzHandler } from "./api/healthz-handler";
import { initProjectPaths } from "./shared/lib/init-project-paths";

const paths = initProjectPaths(import.meta.url);

const app = new Elysia()
  .get("/api/message", getWelcomeMessage)
  .get("/healthz", getHealthzHandler)
  .use(
    staticPlugin({
      assets: paths.assets,
      prefix: "/assets",
    }),
  )
  .use(
    staticPlugin({
      assets: paths.public,
      prefix: "/", // явно укажем корень
    }),
  )
  .get("*", createSsrHandler({ clientDir: paths.client, ssrDir: paths.ssr }));

app.listen(4000);
console.log("🦊 Elysia is running at http://localhost:4000");

```

apps\backend\src\shared\lib\fs-utils.ts

```
import { access } from "node:fs/promises";
import { accessSync } from "node:fs";

export async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

export function existsSync(p: string) {
  try {
    accessSync(p);
    return true;
  } catch {
    return false;
  }
}

```

apps\backend\src\shared\lib\init-project-paths.ts

```
import fs from "node:fs";
import path from "node:path";

export function initProjectPaths(metaUrl: string) {
  const __filename = Bun.fileURLToPath(metaUrl);
  const __dirname = path.dirname(__filename);

  const paths = {
    client: path.join(__dirname, "client"),
    ssr: path.join(__dirname, "ssr"),
    public: path.join(__dirname, "public"),
    assets: path.join(__dirname, "client", "assets"),
  };

  if (
    process.env.NODE_ENV === "development" ||
    Bun.env.NODE_ENV === "development"
  ) {
    validateDirectories(paths);
  }

  return paths;
}

function validateDirectories(paths: Record<string, string>) {
  const requiredDirs = ["client", "ssr", "public", "assets"];

  for (const dirName of requiredDirs) {
    const dirPath = paths[dirName];
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Required directory not found: ${dirPath}`);
    }

    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${dirPath}`);
    }
  }
}

```

apps\backend\src\shared\lib\path-utils.ts

```
import path from "node:path";
import { fileURLToPath } from "node:url";

export function getAppDirectories(metaUrl: string) {
  const __filename = fileURLToPath(metaUrl);
  const here = path.dirname(__filename);

  // Если запускаемся из src (dev: apps/backend/src) — dist на три уровня выше.
  // Если запускаемся из dist (prod: dist) — берем текущую папку.
  const looksLikeSrc = here.endsWith(`${path.sep}src`);
  const distRoot = looksLikeSrc ? path.resolve(here, "../../../dist") : here;

  const clientDir = path.join(distRoot, "client");
  const ssrDir = path.join(distRoot, "ssr");
  const publicDir = path.join(distRoot, "public");
  const assetsDir = path.join(clientDir, "assets");

  return {
    clientDir,
    ssrDir,
    publicDir,
    assetsDir,
    distRoot,
  };
}

```

apps\frontend\.env.development

```
VITE_MESSAGE="С любовью, от команды Green Kiss 💚"
```

apps\frontend\index.html

```
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />
    <title>Green Kiss</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/entry-client.tsx"></script>
  </body>
</html>

```

apps\frontend\package.json

```
{
  "name": "@apps/frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build && vite build --ssr src/entry-server.tsx --outDir ../../dist/ssr",
    "test": "vitest",
    "coverage": "vitest run --coverage",
    "lint": "eslint . --fix",
    "format": "prettier . --write",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@solidjs/meta": "^0.29.4",
    "@solidjs/router": "^0.15.4",
    "solid-js": "^1.9.10",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@configs/eslint": "workspace:*",
    "@configs/typescript": "workspace:*",
    "@rollup/plugin-virtual": "^3.0.2",
    "@tailwindcss/vite": "^4.1.16",
    "@types/bun": "^1.3.2",
    "@vitest/coverage-istanbul": "^4.0.7",
    "tailwindcss": "^4.1.16",
    "vite": "^7.1.12",
    "vite-plugin-solid": "^2.11.10",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^4.0.7"
  }
}

```

apps\frontend\src\app\layout.tsx

```
import { ParentProps, createSignal, onMount } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { PROGRESS_ITEMS } from "@/shared/config/progress-config";

export function Layout(props: ParentProps) {
  const [progress, setProgress] = createSignal(0);
  const [displayProgress, setDisplayProgress] = createSignal(0);

  // Общее количество задач (фиксированное значение)
  const TOTAL_TASKS = 400;

  // Подсчет выполненных задач
  const completedTasks = PROGRESS_ITEMS.reduce((total, item) => {
    const completedInCategory = item.tasks.filter(
      (task) => task.completed,
    ).length;
    return total + completedInCategory;
  }, 0);

  // Расчет процента выполнения
  const targetProgress = Math.round((completedTasks / TOTAL_TASKS) * 100);

  const location = useLocation();

  onMount(() => {
    // Анимация прогресса при загрузке
    let current = 0;
    const interval = setInterval(() => {
      if (current <= targetProgress) {
        setDisplayProgress(current);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    // Анимация полосы прогресса
    setTimeout(() => {
      setProgress(targetProgress);
    }, 100);
  });

  return (
    <div class="flex min-h-screen flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      <div class="flex flex-1 items-center justify-center p-4">
        <div class="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
          {/* Заголовок */}
          <div class="mb-8 text-center">
            <h1 class="mb-2 text-4xl font-bold md:text-5xl">
              Интернет-магазин{" "}
              <span class="mt-2 block text-green-600">GREEN KISS</span>
            </h1>
          </div>

          {/* Информация об открытии */}
          <div class="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6">
            <div class="text-center">
              <p class="mb-2 text-gray-700">🎉 Открытие</p>
              <p class="text-2xl font-semibold text-gray-900">
                15.11.2025 в 22:00
              </p>
              <p class="mt-1 text-gray-600">по Ноябрьску</p>
            </div>
          </div>

          {/* Прогресс-бар */}
          <div class="mb-8">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">
                Готовность сайта
              </span>
              <span class="text-sm font-bold text-green-600">
                {displayProgress()}%
              </span>
            </div>
            <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                class="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress()}%` }}
              />
            </div>
            <div class="mt-2 text-center text-xs text-gray-500">
              Выполнено {completedTasks} из {TOTAL_TASKS} задач
            </div>
          </div>

          {/* Навигация */}
          <nav class="mb-6 flex justify-center gap-4">
            <A
              href="/"
              class="rounded-lg px-4 py-2 font-medium transition-colors"
              classList={{
                "bg-green-600 text-white": location.pathname === "/",
                "bg-gray-100 text-gray-700 hover:bg-gray-200":
                  location.pathname !== "/",
              }}
            >
              Главная
            </A>
            <A
              href="/progress"
              class="rounded-lg px-4 py-2 font-medium transition-colors"
              classList={{
                "bg-green-600 text-white": location.pathname === "/progress",
                "bg-gray-100 text-gray-700 hover:bg-gray-200":
                  location.pathname !== "/progress",
              }}
            >
              Прогресс
            </A>
            <A
              href="/about"
              class="rounded-lg px-4 py-2 font-medium transition-colors"
              classList={{
                "bg-green-600 text-white": location.pathname === "/about",
                "bg-gray-100 text-gray-700 hover:bg-gray-200":
                  location.pathname !== "/about",
              }}
            >
              О нас
            </A>
          </nav>

          {/* Контент страницы */}
          <div class="border-t pt-6">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

```

apps\frontend\src\app\router.tsx

```
import { Router, Route } from "@solidjs/router";
import { lazy, Component, Suspense } from "solid-js";
import { Layout } from "./layout";
import { MetaProvider } from "@solidjs/meta";

type ComponentModule = { default: Component };

const lazyWithLog = (loader: () => Promise<ComponentModule>) =>
  lazy(async () => {
    console.time("route-chunk");
    const mod = await loader();
    console.timeEnd("route-chunk");
    return mod;
  });

const HomePage = lazyWithLog(() => import("../pages/home-page"));
const ProgressPage = lazyWithLog(() => import("../pages/progress-page"));
const AboutPage = lazyWithLog(() => import("../pages/about-page"));

const AppRouter: Component<{ url?: string }> = (props) => {
  return (
    <MetaProvider>
      <Suspense fallback={<div class="text-gray-400">Загрузка...</div>}>
        <Router url={props.url} root={Layout}>
          <Route path="/" component={HomePage} />
          <Route path="/progress" component={ProgressPage} />
          <Route path="/about" component={AboutPage} />
        </Router>
      </Suspense>
    </MetaProvider>
  );
};

export default AppRouter;

```

apps\frontend\src\app\styles\index.css

```
@import "tailwindcss";

```

apps\frontend\src\entry-client.tsx

```
import { hydrate } from "solid-js/web";
import AppRouter from "./app/router";
import "./app/styles/index.css";

hydrate(() => <AppRouter />, document.getElementById("app")!);

```

apps\frontend\src\entry-server.tsx

```
import { renderToStringAsync, generateHydrationScript } from "solid-js/web";
import AppRouter from "./app/router";

export async function render(url: string) {
  const body = await renderToStringAsync(() => <AppRouter url={url} />);
  const hydration = generateHydrationScript();
  return { body, hydration };
}

```

apps\frontend\src\pages\about-page.tsx

```
import { Title } from "@solidjs/meta";

export default function AboutPage() {
  return (
    <div class="space-y-4">
      <Title>О нас</Title>
      <h2 class="mb-4 text-2xl font-bold text-gray-800">О нас</h2>

      <div class="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6">
        <h3 class="mb-3 text-lg font-semibold text-green-700">
          🚚 Бесплатная доставка по Ноябрьску
        </h3>
        <p class="leading-relaxed text-gray-700">
          Мы рады предложить вам уникальную услугу —{" "}
          <span class="font-semibold">бесплатная доставка с примеркой</span> по
          всему городу Ноябрьск!
        </p>
        <ul class="mt-3 space-y-2 text-gray-600">
          <li class="flex items-start">
            <span class="mr-2 text-green-500">✓</span>
            Примерка перед покупкой
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-green-500">✓</span>
            Доставка в удобное для вас время
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-green-500">✓</span>
            Оплата при получении
          </li>
        </ul>
      </div>

      <div class="pt-4 text-center">
        <p class="text-sm text-gray-600">
          GREEN KISS — ваш выбор качественной одежды и аксессуаров
        </p>
      </div>
    </div>
  );
}

```

apps\frontend\src\pages\home-page.tsx

```
import { Title } from "@solidjs/meta";
import { createResource } from "solid-js";

async function fetchMessage() {
  try {
    const res = await fetch("/api/message");
    const data = await res.json();
    return data.message;
  } catch {
    return import.meta.env?.VITE_MESSAGE ?? "💚";
  }
}

export default function HomePage() {
  const [message] = createResource(fetchMessage);

  return (
    <div class="text-center">
      <Title>Добро пожаловать</Title>
      <p class="text-lg text-gray-700">{message() ?? "Загрузка..."}</p>
    </div>
  );
}

```

apps\frontend\src\pages\progress-page.tsx

```
import { PROGRESS_ITEMS } from "@/shared/config/progress-config";
import { Title } from "@solidjs/meta";
import { createSignal, Index, Show } from "solid-js";

export default function ProgressPage() {
  const [expandedItems, setExpandedItems] = createSignal<Set<number>>(
    new Set(),
  );

  const toggleExpanded = (index: number) => {
    const current = new Set(expandedItems());
    if (current.has(index)) {
      current.delete(index);
    } else {
      current.add(index);
    }
    setExpandedItems(current);
  };

  const isExpanded = (index: number) => expandedItems().has(index);

  return (
    <div>
      <Title>Прогресс разработки</Title>
      <h2 class="mb-4 text-2xl font-bold text-gray-800">Прогресс разработки</h2>
      <div class="custom-scrollbar max-h-96 overflow-y-auto">
        <div class="space-y-2 pr-2">
          <Index each={PROGRESS_ITEMS}>
            {(item, index) => (
              <div class="rounded-lg bg-gray-50 transition-all duration-200">
                {/* Родительская задача */}
                <div
                  class="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100"
                  onClick={() => item().tasks && toggleExpanded(index)}
                >
                  {/* Иконка статуса */}
                  <div class="shrink-0">
                    <Show
                      when={item().completed}
                      fallback={
                        <svg
                          class="h-5 w-5 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      }
                    >
                      <svg
                        class="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </Show>
                  </div>

                  {/* Стрелка раскрытия */}
                  <Show when={item().tasks}>
                    <div class="shrink-0">
                      <svg
                        class={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                          isExpanded(index) ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Show>

                  {/* Название задачи */}
                  <span
                    class={`flex-1 text-sm font-medium ${
                      item().completed ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {item().name}
                  </span>

                  {/* Прогресс подзадач */}
                  <Show when={item().tasks}>
                    <span class="text-xs font-medium text-gray-500">
                      {item().tasks?.filter((t) => t.completed).length}/
                      {item().tasks?.length}
                    </span>
                  </Show>
                </div>

                {/* Подзадачи */}
                <Show when={item().tasks && isExpanded(index)}>
                  <div class="rounded-b-lg border-t border-gray-200 bg-white">
                    <div class="space-y-1 py-2 pr-3 pl-8">
                      <Index each={item().tasks}>
                        {(subTask) => (
                          <div class="flex items-center gap-3 rounded px-3 py-1.5 transition-colors hover:bg-gray-50">
                            {/* Иконка статуса подзадачи */}
                            <div class="shrink-0">
                              <Show
                                when={subTask().completed}
                                fallback={
                                  <svg
                                    class="h-4 w-4 text-orange-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                }
                              >
                                <svg
                                  class="h-4 w-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </Show>
                            </div>

                            {/* Название подзадачи */}
                            <span
                              class={`text-xs ${
                                subTask().completed
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {subTask().name}
                            </span>
                          </div>
                        )}
                      </Index>
                    </div>
                  </div>
                </Show>
              </div>
            )}
          </Index>
        </div>
      </div>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #10b981;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #059669;
          }
        `}
      </style>
    </div>
  );
}

```

apps\frontend\src\shared\config\progress-config.ts

```
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

```

apps\frontend\src\shared\env.d.ts

```
interface ImportMetaEnv {
  readonly VITE_MESSAGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

```

apps\frontend\vite.config.ts

```
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import viteTsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig(() => ({
  base: "/",
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/favicon.png": "http://localhost:4000",
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../../dist/client"),
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src/entry-client.tsx"),
    },
    target: "esnext",
    emptyOutDir: true,
    minify: true,
    copyPublicDir: false,
    ssrManifest: true
  },
  ssr: {
    // Критично: включаем в SSR-бандл solid и его экосистему,
    // чтобы Bun не искал их в node_modules при импорте dist/ssr/*.js
    noExternal: ["solid-js", "@solidjs/router", "@solidjs/meta"],
  },
  plugins: [
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    solidPlugin({ ssr: true }),
  ],
}));

```

apps\frontend\vitest.config.ts

```
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "istanbul",
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
        autoUpdate: true,
      },
      include: ["src/**/*"],
    },
  },
});

```

apps\frontend\vitest.d.ts

```
/// <reference types="vitest/globals" />

```

package.json

```
{
  "name": "greenkiss",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "bun@1.3.2",
  "workspaces": [
    "apps/*",
    "packages/*",
    "configs/*",
    "scripts/*"
  ],
  "scripts": {
    "format:root": "prettier . --write",
    "dev": "turbo run dev --parallel --filter=\"@apps/*\"",
    "start": "bun run build && bun ./dist/server.mjs",
    "build": "turbo run build && bun run copy:favicon",
    "build:context": "bun scripts/context-builder/src/index.ts",
    "copy:favicon": "cross-env SOURCE=./apps/frontend OUTPUT=./dist/public EXTENSIONS=png bun scripts/copy-favicon/src/index.ts",
    "clean:project": "bun scripts/project-cleaner/src/index.ts",
    "format": "turbo run format",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "check": "turbo run format && turbo run lint && turbo run typecheck",
    "prepare": "husky"
  },
  "devDependencies": {
    "@types/bun": "^1.3.2",
    "cross-env": "^10.1.0",
    "eslint": "^9.39.1",
    "husky": "^9.1.7",
    "prettier": "^3.6.2",
    "prettier-plugin-tailwindcss": "^0.7.1",
    "turbo": "^2.6.1",
    "typescript": "^5.9.3"
  }
}

```

scripts\copy-favicon\package.json

```
{
  "name": "@scripts/copy-favicon",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "format": "prettier . --write",
    "lint": "eslint . --fix",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@configs/typescript": "workspace:*",
    "@configs/eslint": "workspace:*"
  }
}

```

scripts\copy-favicon\src\copy-favicon.ts

```
import path from "path";
import fs from "fs";
import { existsSync, statSync } from "node:fs";
import * as errors from "./errors";

import { scanDirectory, ScanResult } from "./scan-directory";

export function copyFavicon({
  sourceDir,
  outputDir,
  logLevel,
  ignoreDirs,
  allowedExtensions,
}: {
  sourceDir: string;
  outputDir: string;
  logLevel: "standard" | "verbose";
  ignoreDirs: string[];
  allowedExtensions: string[];
}): string {
  validateDirectories({ sourceDir, outputDir });

  const scanResult: ScanResult = {
    faviconPaths: [],
    dirCount: 0,
    fileCount: 0,
    scannedDirs: [],
  };

  scanDirectory(sourceDir, ignoreDirs, scanResult);

  const faviconPath = getSingleFaviconPath(scanResult.faviconPaths, sourceDir);

  validateFaviconExtension(faviconPath, allowedExtensions);

  const fileName = path.basename(faviconPath);
  const destinationPath = path.join(outputDir, fileName);

  safeCopyFile(faviconPath, destinationPath);

  logFaviconCopyReport({
    scanResult,
    destinationPath,
    isVerbose: logLevel === "verbose",
  });

  return destinationPath;
}

function safeCopyFile(src: string, dest: string): void {
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    const code = errors.getErrnoCode(err);
    if (code === "EACCES" || code === "EPERM") {
      throw new errors.FilePermissionError(src, dest, "copy", err);
    }
    throw new errors.FileCopyIOError(src, dest, err);
  }
}

function getSingleFaviconPath(faviconPaths: string[], sourceDir: string) {
  if (faviconPaths.length === 0) {
    throw new errors.NoFaviconFoundError(sourceDir);
  }

  if (faviconPaths.length > 1) {
    throw new errors.MultipleFaviconsFoundError(faviconPaths);
  }

  return faviconPaths[0];
}

function validateDirectories({
  sourceDir,
  outputDir,
}: {
  sourceDir: string;
  outputDir: string;
}): void {
  // Source
  if (!existsSync(sourceDir)) {
    throw new errors.DirectoryNotFoundError(sourceDir, "source");
  }
  if (!statSync(sourceDir).isDirectory()) {
    throw new errors.PathNotDirectoryError(sourceDir, "source");
  }

  // Output
  if (!existsSync(outputDir)) {
    throw new errors.DirectoryNotFoundError(outputDir, "output");
  }
  if (!statSync(outputDir).isDirectory()) {
    throw new errors.PathNotDirectoryError(outputDir, "output");
  }
}

function validateFaviconExtension(
  filePath: string,
  allowedExtensions: string[],
): void {
  const normalizedAllowed = allowedExtensions.map((ext) =>
    ext.toLowerCase().replace(/^\./, ""),
  );
  const extension = path.extname(filePath).toLowerCase().replace(/^\./, "");

  if (!normalizedAllowed.includes(extension)) {
    throw new errors.UnsupportedFaviconExtensionError(
      extension,
      normalizedAllowed,
      filePath,
    );
  }
}

function logFaviconCopyReport({
  scanResult,
  destinationPath,
  isVerbose,
}: {
  scanResult: ScanResult;
  destinationPath: string;
  isVerbose: boolean;
}) {
  console.log("\n================================");
  console.log("✅ Favicon successfully copied!");
  console.log("================================");

  console.log("\n📊 Scan statistics:");
  console.log(`  • Directories scanned: ${scanResult.dirCount}`);
  console.log(`  • Files scanned: ${scanResult.fileCount}`);

  if (isVerbose) {
    console.log("\n📁 List of scanned directories:");
    scanResult.scannedDirs.forEach((dir, index) => {
      console.log(`  ${index + 1}. ${dir}`);
    });
  }

  console.log(`\n📍 File copied to: ${destinationPath}`);
  console.log("\n================================\n");
}

```

scripts\copy-favicon\src\errors.ts

```
export class CopyFaviconError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly hint?: string;
  readonly script = "copy-favicon";
  override cause?: unknown;

  constructor(
    message: string,
    options: {
      code?: string;
      cause?: unknown;
      details?: Record<string, unknown>;
      hint?: string;
    } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "CopyFaviconError";
    this.code = options.code ?? "COPY_FAVICON_ERROR";
    this.details = options.details;
    this.hint = options.hint;
    this.cause = options.cause;

    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

/**
 * Safe helpers to introspect NodeJS errno errors without using any.
 */
export function getErrnoCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const maybe = err as { code?: unknown };
  return typeof maybe.code === "string" ? maybe.code : undefined;
}

export function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  if (typeof err !== "object" || err === null) return false;
  const e = err as Partial<NodeJS.ErrnoException>;
  return typeof e.message === "string";
}

/**
 * Generic, reusable errors (more composable than very specific classes)
 */

export class DirectoryNotFoundError extends CopyFaviconError {
  constructor(
    path: string,
    kind: "source" | "output" | "scan" | "dest",
    cause?: unknown,
  ) {
    super(`Directory not found: ${path}`, {
      code: "COPY_FAVICON_DIR_NOT_FOUND",
      cause,
      details: { path, kind },
      hint: "Ensure the directory exists and the path is correct.",
    });
  }
}

export class PathNotDirectoryError extends CopyFaviconError {
  constructor(
    path: string,
    kind: "source" | "output" | "scan",
    cause?: unknown,
  ) {
    super(`Path is not a directory: ${path}`, {
      code: "COPY_FAVICON_NOT_A_DIRECTORY",
      cause,
      details: { path, kind },
      hint: "Provide a valid directory path.",
    });
  }
}

export class DirectoryPermissionError extends CopyFaviconError {
  constructor(path: string, op: "read" | "traverse", cause?: unknown) {
    super(`Permission denied while accessing directory: ${path}`, {
      code: "COPY_FAVICON_DIR_PERMISSION_DENIED",
      cause,
      details: { path, op },
      hint: "Check filesystem permissions or run with sufficient privileges.",
    });
  }
}

export class DirectoryReadError extends CopyFaviconError {
  constructor(path: string, cause?: unknown) {
    super(`Failed to read directory: ${path}`, {
      code: "COPY_FAVICON_DIR_READ_ERROR",
      cause,
      details: { path },
      hint: "Re-run with verbose logging to inspect the cause.",
    });
  }
}

export class FilePermissionError extends CopyFaviconError {
  constructor(
    src: string,
    dest: string,
    op: "copy" | "read" | "write",
    cause?: unknown,
  ) {
    super(`Permission denied while performing '${op}'`, {
      code: "COPY_FAVICON_FILE_PERMISSION_DENIED",
      cause,
      details: { src, dest, op },
      hint: "Check file and directory permissions.",
    });
  }
}

export class FileCopyIOError extends CopyFaviconError {
  constructor(src: string, dest: string, cause?: unknown) {
    super(`Failed to copy file from ${src} to ${dest}`, {
      code: "COPY_FAVICON_COPY_ERROR",
      cause,
      details: { src, dest },
      hint: "Inspect the underlying error and retry.",
    });
  }
}

export class NoFaviconFoundError extends CopyFaviconError {
  constructor(rootDir: string) {
    super(`No favicon files found in: ${rootDir}`, {
      code: "COPY_FAVICON_NOT_FOUND",
      details: { rootDir },
      hint: "Add a favicon file (e.g., favicon.ico, favicon.png) or adjust ignoreDirs.",
    });
  }
}

export class MultipleFaviconsFoundError extends CopyFaviconError {
  constructor(paths: string[]) {
    super("Multiple favicon files found. Ambiguous selection.", {
      code: "COPY_FAVICON_MULTIPLE_FOUND",
      details: { candidates: paths },
      hint: "Keep only a single favicon file or refine your search (ignoreDirs).",
    });
  }
}

export class UnsupportedFaviconExtensionError extends CopyFaviconError {
  constructor(ext: string, allowed: string[], filePath: string) {
    super(`Unsupported favicon extension: .${ext}`, {
      code: "COPY_FAVICON_UNSUPPORTED_EXTENSION",
      details: { extension: ext, allowedExtensions: allowed, filePath },
      hint: `Use one of the allowed extensions: ${allowed.join(", ")}`,
    });
  }
}

```

scripts\copy-favicon\src\index.ts

```
import { dirname, resolve } from "node:path";
import { copyFavicon } from "./copy-favicon";
import { CopyFaviconError } from "./errors";

const { SOURCE, OUTPUT, EXTENSIONS } = process.env;

if (!SOURCE || !OUTPUT || !EXTENSIONS) {
  console.error(
    "❌ Missing required environment variables: SOURCE, OUTPUT, EXTENSIONS",
  );
  process.exit(1);
}

const __filename = Bun.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "../../../");

const sourceDir = resolve(rootDir, SOURCE);
const outputDir = resolve(rootDir, OUTPUT);
const allowedExtensions = EXTENSIONS.split(",").map((ext) =>
  ext.replace(/^\./, "").trim(),
);

try {
  copyFavicon({
    outputDir,
    sourceDir,
    logLevel: "standard",
    allowedExtensions,
    ignoreDirs: ["node_modules", ".turbo", "dist"],
  });
} catch (err) {
  if (err instanceof CopyFaviconError) {
    console.error(`❌ ${err.toString()}`);
    if (err.hint) {
      console.error(`💡 Hint: ${err.hint}`);
    }
    if (err.details) {
      console.error("ℹ️ Details:", err.details);
    }
  } else {
    console.error("❌ Unexpected error:", err);
  }
  process.exitCode = 1;
}

```

scripts\copy-favicon\src\scan-directory.ts

```
import { readdirSync } from "fs";
import { join, parse } from "path";
import {
  CopyFaviconError,
  DirectoryNotFoundError,
  DirectoryPermissionError,
  DirectoryReadError,
  PathNotDirectoryError,
  getErrnoCode,
} from "./errors";

export type ScanResult = {
  faviconPaths: string[];
  dirCount: number;
  fileCount: number;
  scannedDirs: string[];
};

export function scanDirectory(
  dirPath: string,
  ignoreDirs: string[],
  result: ScanResult,
): void {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (ignoreDirs.includes(entry.name)) continue;

        result.dirCount++;
        result.scannedDirs.push(fullPath);

        scanDirectory(fullPath, ignoreDirs, result);
      } else if (entry.isFile()) {
        result.fileCount++;

        const fileNameWithoutExt = parse(entry.name).name.toLowerCase();
        if (fileNameWithoutExt === "favicon") {
          result.faviconPaths.push(fullPath);
        }
      }
    }
  } catch (error) {
    if (error instanceof CopyFaviconError) {
      throw error;
    }

    const code = getErrnoCode(error);

    switch (code) {
      case "ENOENT":
        throw new DirectoryNotFoundError(dirPath, "scan", error);
      case "EACCES":
      case "EPERM":
        throw new DirectoryPermissionError(dirPath, "read", error);
      case "ENOTDIR":
        throw new PathNotDirectoryError(dirPath, "scan", error);
      default:
        throw new DirectoryReadError(dirPath, error);
    }
  }
}

```

turbo.json

```
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    },
    "start": {
      "dependsOn": ["^build"],
      "inputs": ["dist/**"]
    },
    "format": {
      "dependsOn": ["^format"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}

```