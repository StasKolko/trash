Мне нужен код который будет делать следующее:

1) Пройдет по всем файлам и папкам проекта, исключая игнор расширения, а также игнор файлы и папки из конфига.

2) Удалит из кеша игнор папки и файлы указанные в конфиге, а также игнор расширения. Такие могли появится в кеше если вначале были разрешенны, но потом были заигноренны.

3) Удалит из кеша и конфига несуществующие файлы и папки в проекте. Такие могли появится, если был файл или папка, но их удалили.

4) Если у файла поменялся хеш, то его нужно пометить как error. Так происходит если я внес правки в какой-то файл и пока я его не одобрю в конфиге, он будет error.

5) Если в конфиге файл указан как ok и у него не изменился хеш с прошлого раза, то он становится ok в кеше.

6) Папки ок из конфига работают только тогда, когда все файлы внутри такой папки в кеше не меняли свой хеш. То есть правки в файлы не вносились, но я поставим им ок, значит согласовал. В таком случае все файлы внутри такой папки у кеша станут ok.

7) Сделать колапс полей в новом конфиге. Это когда все файлы внутри папки имеет статус ok и в такой папке нет игнор файлов или папок, то вместо вложенного объекта мы делаем значение ok.

8) В конце работы программы нужно записать новый кеш файл.

9) В конце работы программы нужно записать нвоый конфиг, но все поля которого должны правильно отсортированны, как это делается в vs code:

- Сначала папки в алфовитном порядке
- Затем файлы в алфавитном порядке

И для каждой папки, если она является объектом таким же образом отсортирвоать поля.

10) Выводим в консоль:

- количество найденных файлов. 
- количсетво error фалов
- количество ok файлов

- Колапс папки и файлы с сортировкой как в vs code. error от ok должны выделяться цветами. Игнор выводим, но оставляем без цвета (внутренности игнор папок вообще не трогаем).

Вот мой код, но он не работает как я хочу:

scripts\code-map\config.ts

```
// GENERATED FILE. DO NOT EDIT.
// Total files: 37151
// OK files: 0
// ERROR files: 37151
// Refactoring progress: 0.00%

import type { Config } from "./_types";

export const config: Config = {};

```

scripts\code-map\index.ts

```
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codeMap } from "./_core/code-map";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

void codeMap({
  paths: {
    rootDir: resolve(__dirname, "../../"),
    cacheFile: resolve(__dirname, "./_cache/index.ts"),
    configFile: resolve(__dirname, "./config.ts"),
  },
  ignoredExtensions: ["svg", "png", "webp", "jpg", "jpeg", "yml"],
});

```

scripts\code-map\_cache\index.ts

```

```

scripts\code-map\_core\build-collapsed-config-and-error-tree.ts

```
import type {
  Config,
  ConfigStatus,
  Cache,
  CacheFile,
  ErrorTreeNode,
  Stats,
} from "../_types";
import { isCacheFile } from "../_utils/cache";

/**
 * Результат построения нового конфига и дерева ошибок.
 */
export type BuildResult = {
  /** Новый, отсортированный и сколлапсированный конфиг. */
  nextConfig: Config;
  /** Дерево ошибок (и не-помеченных ok), схлопывающее чисто-ошибочные папки в "error". */
  errorTree: ErrorTreeNode;
  /** Статистика по файлам. */
  stats: Stats;
};

/**
 * Главная функция:
 * - из текущего cache+config делает:
 *   - nextConfig (с коллапсом ok и сортировкой);
 *   - errorTree;
 *   - stats.
 */
export function buildCollapsedConfigAndErrorTree(
  cache: Cache,
  config: Config,
): BuildResult {
  const stats: Stats = {
    totalFiles: 0,
    okFiles: 0,
    errorFiles: 0,
  };

  const { nextConfig, errorTree } = walk("", cache, config, stats);

  return {
    nextConfig: nextConfig as Config,
    errorTree: sortErrorTree(errorTree),
    stats,
  };
}

/**
 * Рекурсивный обход дерева cache+config.
 * Возвращает:
 * - новый config для этого узла;
 * - errorTree для этого узла.
 */
function walk(
  name: string,
  cacheNode: Cache | CacheFile,
  configNode: Config | ConfigStatus | undefined,
  stats: Stats,
): { nextConfig: Config | ConfigStatus; errorTree: ErrorTreeNode } {
  // Лист — файл.
  if (isCacheFile(cacheNode)) {
    stats.totalFiles += 1;
    if (cacheNode.status === "ok") stats.okFiles += 1;
    else stats.errorFiles += 1;

    if (typeof configNode === "string") {
      // В конфиге есть явный статус файла ("ok" или "ignore").
      return {
        nextConfig: configNode,
        errorTree: cacheNode.status === "ok" ? "ok" : "error",
      };
    }

    // Если для файла нет явного статуса в конфиге —
    // не добавляем его в nextConfig, но учитываем в errorTree.
    return {
      nextConfig: {},
      errorTree: cacheNode.status === "ok" ? "ok" : "error",
    };
  }

  // Папка.
  const childrenNames = new Set<string>([
    ...Object.keys(cacheNode),
    ...(configNode && typeof configNode === "object"
      ? Object.keys(configNode)
      : []),
  ]);

  const nextConfigObj: Config = {};
  const errorTreeObj: { [name: string]: ErrorTreeNode } = {};

  for (const childName of childrenNames) {
    const cacheChild = (cacheNode as any)[childName];
    const configChild =
      typeof configNode === "object" ? (configNode as any)[childName] : undefined;

    if (!cacheChild) {
      // В кэше нет — видимо, ключ уже не существует на диске.
      // cleanupConfigAndCache должен был это удалить, но на всякий случай пропускаем.
      continue;
    }

    const { nextConfig, errorTree } = walk(
      childName,
      cacheChild,
      configChild,
      stats,
    );

    // Обработка nextConfig:
    if (typeof nextConfig === "string") {
      // nextConfig === ConfigStatus ("ok" | "ignore")
      nextConfigObj[childName] = nextConfig as ConfigStatus;
    } else if (Object.keys(nextConfig).length > 0) {
      // nextConfig === Config (объект)
      nextConfigObj[childName] = nextConfig as Config;
    }

    // Обработка errorTree:
    errorTreeObj[childName] = errorTree;
  }

  // Попытка схлопнуть папку в "ok" или "error".
  const collapsedErrorTree = collapseErrorNode(errorTreeObj);

  // Для nextConfig: если в configNode у этой папки напрямую указано "ok"/"ignore" — сохраняем это.
  // Иначе — оставляем объект со сколлапсированными детьми.
  if (typeof configNode === "string") {
    // Папка помечена "ok" или "ignore" целиком.
    return {
      nextConfig: configNode,
      errorTree: collapsedErrorTree,
    };
  }

  return {
    nextConfig: nextConfigObj,
    errorTree: collapsedErrorTree,
  };
}

/**
 * Схлопывает errorTree:
 * - если все дети "ok" => "ok";
 * - если все дети "error" => "error";
 * - если смешано, оставляем объект.
 */
function collapseErrorNode(node: ErrorTreeNode): ErrorTreeNode {
  if (node === "ok" || node === "error" || node === "ignore") return node;

  const keys = Object.keys(node);
  if (keys.length === 0) return "ok"; // Пустая папка считается ok.

  let allOk = true;
  let allError = true;

  const collapsedChildren: { [name: string]: ErrorTreeNode } = {};

  for (const key of keys) {
    const child = collapseErrorNode(node[key]);
    collapsedChildren[key] = child;

    if (child !== "ok") allOk = false;
    if (child !== "error") allError = false;
  }

  if (allOk) return "ok";
  if (allError) return "error";

  return collapsedChildren;
}

/**
 * Сортировка errorTree по vs-code-стилю:
 * - сначала папки (объекты), потом файлы ("ok"/"error"), в каждой группе:
 *   - сперва имена с точкой (".*"), потом остальные, в алфавитном порядке.
 */
function sortErrorTree(node: ErrorTreeNode): ErrorTreeNode {
  if (node === "ok" || node === "error" || node === "ignore") return node;

  const entries = Object.entries(node);

  const folderNames: string[] = [];
  const fileNames: string[] = [];

  for (const [name, value] of entries) {
    const isFolder = typeof value === "object";
    if (isFolder) folderNames.push(name);
    else fileNames.push(name);
  }

  const sortNames = (names: string[]) => {
    const dot: string[] = [];
    const normal: string[] = [];
    for (const n of names) {
      if (n.startsWith(".")) dot.push(n);
      else normal.push(n);
    }
    dot.sort((a, b) => a.localeCompare(b));
    normal.sort((a, b) => a.localeCompare(b));
    return [...dot, ...normal];
  };

  const sortedFolders = sortNames(folderNames);
  const sortedFiles = sortNames(fileNames);

  const result: { [name: string]: ErrorTreeNode } = {};

  for (const name of sortedFolders) {
    result[name] = sortErrorTree(node[name]);
  }

  for (const name of sortedFiles) {
    result[name] = sortErrorTree(node[name]);
  }

  return result;
}

/**
 * Хелперы для превращения nextConfig в строку TS-объекта.
 * (Используем при генерации config.ts в code-map.ts)
 */
export function stringifyConfigObject(
  config: Config | ConfigStatus,
  indent = 0,
): string {
  const pad = "  ".repeat(indent);

  if (typeof config === "string") {
    return JSON.stringify(config);
  }

  const keys = Object.keys(config);
  if (keys.length === 0) return "{}";

  // Сортировка ключей: сначала имена с точкой, потом остальные, по алфавиту.
  const dot: string[] = [];
  const normal: string[] = [];
  for (const key of keys) {
    if (key.startsWith(".")) dot.push(key);
    else normal.push(key);
  }
  dot.sort((a, b) => a.localeCompare(b));
  normal.sort((a, b) => a.localeCompare(b));
  const sortedKeys = [...dot, ...normal];

  const parts: string[] = [];
  for (const key of sortedKeys) {
    const value = (config as Config)[key];
    const valueStr = stringifyConfigObject(
      value as Config | ConfigStatus,
      indent + 1,
    );
    parts.push(`${"  ".repeat(indent + 1)}${JSON.stringify(key)}: ${valueStr}`);
  }

  return `{\n${parts.join(",\n")}\n${pad}}`;
}

/**
 * Строковое представление errorTree.
 * Можно использовать для логов/вывода.
 */
export function stringifyErrorTree(
  node: ErrorTreeNode,
  indent = 0,
): string {
  const pad = "  ".repeat(indent);

  if (node === "ok" || node === "error" || node === "ignore") {
    return `${pad}${node}`;
  }

  const keys = Object.keys(node);
  if (keys.length === 0) return `${pad}{}`;

  const lines: string[] = [];
  for (const key of keys) {
    const val = node[key];
    if (val === "ok" || val === "error" || val === "ignore") {
      lines.push(`${pad}${key}: ${val}`);
    } else {
      lines.push(`${pad}${key}/`);
      lines.push(stringifyErrorTree(val, indent + 1));
    }
  }

  return lines.join("\n");
}

```

scripts\code-map\_core\code-map.ts

```
import { config as initialConfig } from "../config";
import { cache as initialCache } from "../_cache";
import { initializeConfigAndCache } from "./initialize-config-and-cache";
import { syncCacheWithConfig } from "./sync-cache-with-config";

import { normalizeExtension } from "../_utils/extension";
import { saveCacheFile, saveConfigFile } from "../_utils/save-file";

import {
  buildCollapsedConfigAndErrorTree,
  stringifyConfigObject,
  stringifyErrorTree,
} from "./build-collapsed-config-and-error-tree";

import type { Config, Cache } from "../_types";

export async function codeMap({
  paths: { rootDir, cacheFile, configFile },
  ignoredExtensions,
}: {
  paths: {
    rootDir: string;
    cacheFile: string;
    configFile: string;
  };
  ignoredExtensions: string[];
}) {
  const ignoredExtensionSet = new Set(ignoredExtensions.map(normalizeExtension));

  // Клонируем, чтобы не мутировать импорт напрямую (на всякий случай).
  const config: Config = JSON.parse(JSON.stringify(initialConfig));
  const cache: Cache = JSON.parse(JSON.stringify(initialCache));

  await initializeConfigAndCache({
    config,
    cache,
    absPath: rootDir,
    ignoredExtensionSet,
  });

  syncCacheWithConfig(cache, config);

  const { nextConfig, errorTree, stats } =
    buildCollapsedConfigAndErrorTree(cache, config);

  // Сохранить кэш.
  await saveCacheFile(cacheFile, cache);

  // Посчитать процент рефакторинга.
  const { totalFiles, okFiles, errorFiles } = stats;
  const percent = totalFiles > 0 ? ((okFiles / totalFiles) * 100).toFixed(2) : "0.00";

  // Собрать содержимое нового config.ts.
  const configObjectString = stringifyConfigObject(nextConfig, 0);

  const headerComment =
    `// GENERATED FILE. DO NOT EDIT.\n` +
    `// Total files: ${totalFiles}\n` +
    `// OK files: ${okFiles}\n` +
    `// ERROR files: ${errorFiles}\n` +
    `// Refactoring progress: ${percent}%\n\n`;

  const tsContent =
    headerComment +
    `import type { Config } from "./_types";\n\n` +
    `export const config: Config = ${configObjectString};\n`;

  await saveConfigFile(configFile, tsContent);

  // Для вывода в консоль можно печатать дерево ошибок:
  // (Здесь просто лог. Можешь убрать/адаптировать.)
  console.log("Refactoring stats:");
  console.log(`  Total:  ${totalFiles}`);
  console.log(`  OK:     ${okFiles}`);
  console.log(`  ERROR:  ${errorFiles}`);
  console.log(`  Done:   ${percent}%`);
  console.log("\nError tree:\n");
  console.log(stringifyErrorTree(errorTree));
}

```

scripts\code-map\_core\initialize-config-and-cache.ts

```
import type { Config, Cache, EntryInfo } from "../_types";

import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { getFileExtension, normalizeExtension } from "../_utils/extension";
import { getFileHash } from "../_utils/get-file-hash";

/**
 * Главная функция инициализации:
 * - читает директорию;
 * - чистит config/cache от несуществующих имён;
 * - применяет ignore из config (не спускается внутрь);
 * - обновляет кэш по файлам;
 * - рекурсивно обходит подпапки.
 */
export async function initializeConfigAndCache({
  config,
  cache,
  absPath,
  ignoredExtensionSet,
}: {
  config: Config;
  cache: Cache;
  absPath: string;
  ignoredExtensionSet: Set<string>;
}): Promise<void> {
  const { dirs, files } = await listDirOnce(absPath, ignoredExtensionSet);
  cleanupConfigAndCache({ dirs, files, config, cache });
  applyIgnoreFromConfig({ cache, config, dirs, files });
  await updateFileCache({ cache, files });

  // Рекурсивно в подпапки.
  for (const { name, path } of dirs) {
    if (!(name in cache)) cache[name] = {};
    if ("hash" in (cache as any)[name]) (cache as any)[name] = {};
    if (typeof config[name] !== "object") config[name] = {};

    await initializeConfigAndCache({
      config: config[name] as Config,
      cache: cache[name] as Cache,
      absPath: path,
      ignoredExtensionSet,
    });
  }
}

/**
 * Однократное чтение директории с фильтрацией по расширениям.
 */
async function listDirOnce(
  absPath: string,
  ignoredExtensionSet: Set<string>,
): Promise<{
  dirs: EntryInfo[];
  files: EntryInfo[];
}> {
  const entries = await readdir(absPath, { withFileTypes: true });

  const dirs: EntryInfo[] = [];
  const files: EntryInfo[] = [];

  for (const entry of entries) {
    const fullPath = join(absPath, entry.name);

    if (entry.isDirectory()) {
      dirs.push({ name: entry.name, path: fullPath });
    } else if (entry.isFile()) {
      const ext = normalizeExtension(getFileExtension(entry.name));
      if (!ignoredExtensionSet.has(ext)) {
        files.push({ name: entry.name, path: fullPath });
      }
    }
  }

  return { dirs, files };
}

/**
 * Удаляет из config и cache ключи, которых уже нет на диске.
 */
function cleanupConfigAndCache({
  dirs,
  files,
  config,
  cache,
}: {
  dirs: EntryInfo[];
  files: EntryInfo[];
  config: Config;
  cache: Cache;
}) {
  const allowedNames = new Set([
    ...dirs.map((d) => d.name),
    ...files.map((f) => f.name),
  ]);

  for (const key in config) {
    if (!allowedNames.has(key)) {
      delete config[key];
    }
  }

  for (const key in cache) {
    if (!allowedNames.has(key)) {
      delete cache[key];
    }
  }
}

/**
 * Применяет ignore из config:
 * - убирает такие имена из обхода dirs/files;
 * - удаляет соответствующие ветки из cache.
 */
function applyIgnoreFromConfig({
  dirs,
  files,
  config,
  cache,
}: {
  dirs: EntryInfo[];
  files: EntryInfo[];
  config: Config;
  cache: Cache;
}) {
  const ignoredNames = new Set<string>();

  for (const key in config) {
    const v = config[key];
    if (typeof v === "string" && v === "ignore") {
      ignoredNames.add(key);
    }
  }

  let keptDirs = dirs.filter((entry) => !ignoredNames.has(entry.name));
  dirs.length = 0;
  dirs.push(...keptDirs);

  let keptFiles = files.filter((entry) => !ignoredNames.has(entry.name));
  files.length = 0;
  files.push(...keptFiles);

  for (const key in cache) {
    if (ignoredNames.has(key)) {
      delete cache[key];
    }
  }
}

/**
 * Обновляет кэш по файлам:
 * - для новых файлов создаёт запись со status: "error";
 * - для существующих обновляет newHash;
 * - если hash !== newHash, статус становится "error".
 */
async function updateFileCache({
  files,
  cache,
}: {
  files: EntryInfo[];
  cache: Cache;
}) {
  for (const { name, path } of files) {
    const fileHash = await getFileHash(path);

    if (!(name in cache)) {
      cache[name] = {
        status: "error",
        hash: fileHash,
        newHash: fileHash,
      };
    } else {
      const fileEntry = cache[name] as any;
      if (!("status" in fileEntry)) {
        // На всякий случай, если был когда-то объект.
        cache[name] = {
          status: "error",
          hash: fileHash,
          newHash: fileHash,
        };
      }
    }

    const cacheFile = cache[name] as any;
    cacheFile.newHash = fileHash;
    if (cacheFile.newHash !== cacheFile.hash) {
      cacheFile.status = "error";
    }
  }
}

```

scripts\code-map\_core\sync-cache-with-config.ts

```
import { Config, Cache, CacheFile } from "../_types";
import { isCacheFile } from "../_utils/cache";

/**
 * Синхронизирует кэш с конфигом:
 * - учитывает "ok" / "ignore" / вложенные объекты;
 * - при "ok" для папки проверяет, что во всех файлах hash === newHash;
 *   - если да, то выставляет status: "ok" и hash = newHash;
 *   - если нет, просто syncAllHashes (но статусы "error" сохраняются).
 */
export function syncCacheWithConfig(cache: Cache, config: Config): void {
  for (const key in config) {
    const configValue = config[key];
    const cacheValue = cache[key];

    // Если записи в кэше нет — значит, либо файл в ignore, либо новый файл,
    // о котором initializeConfigAndCache ещё не записал; но в нормальном
    // потоке сюда попадает уже синхронизированный кэш.
    if (cacheValue === undefined) continue;

    if (isCacheFile(cacheValue)) {
      // Это файл.
      if (typeof configValue === "string" && configValue === "ok") {
        if (cacheValue.hash === cacheValue.newHash) {
          cacheValue.status = "ok";
        } else {
          cacheValue.status = "error";
        }
      }
      // В любом случае, обновить hash на newHash.
      cacheValue.hash = cacheValue.newHash;
      continue;
    }

    // Папка или объект.
    if (typeof configValue === "string") {
      // "ok" или "ignore" для папки.
      if (configValue === "ok") {
        const allFilesOk = checkAllHashesEqual(cacheValue);

        if (allFilesOk) {
          updateCacheFilesToOk(cacheValue);
        } else {
          syncAllHashes(cacheValue);
        }
      } else {
        // "ignore": просто убедимся, что hash = newHash, статус не трогаем.
        syncAllHashes(cacheValue);
      }
    } else {
      // Вложенный объект конфига.
      syncCacheWithConfig(cacheValue, configValue);
    }
  }
}

/**
 * Проверяет, что во всех файлах cache.hash === cache.newHash.
 */
function checkAllHashesEqual(cache: Cache | CacheFile): boolean {
  if (isCacheFile(cache)) {
    return cache.hash === cache.newHash;
  }

  for (const key in cache) {
    if (!checkAllHashesEqual(cache[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Рекурсивно проставляет status: "ok" и hash = newHash во всех файлах.
 */
function updateCacheFilesToOk(cache: Cache | CacheFile): void {
  if (isCacheFile(cache)) {
    cache.status = "ok";
    cache.hash = cache.newHash;
    return;
  }

  for (const key in cache) {
    updateCacheFilesToOk(cache[key]);
  }
}

/**
 * Рекурсивно обновляет hash = newHash во всех файлах (без смены статуса).
 */
function syncAllHashes(cache: Cache | CacheFile): void {
  if (isCacheFile(cache)) {
    cache.hash = cache.newHash;
    return;
  }

  for (const key in cache) {
    syncAllHashes(cache[key]);
  }
}

```

scripts\code-map\_types\index.ts

```
export type EntryInfo = {
  name: string;
  path: string;
};

export type ConfigStatus = "ok" | "ignore";

export type Config = {
  [name: string]: Config | ConfigStatus;
};

export type CacheFileStatus = "ok" | "error";

export type CacheFile = {
  status: CacheFileStatus;
  hash: string;
  newHash: string;
};

export type Cache = {
  [name: string]: Cache | CacheFile;
};

/** Для подсчёта статистики */
export type Stats = {
  totalFiles: number;
  okFiles: number;
  errorFiles: number;
};

/** Узел дерева для финального "ошибочного" отображения */
export type ErrorTreeNode =
  | "ok"
  | "ignore"
  | "error"
  | { [name: string]: ErrorTreeNode };

```

scripts\code-map\_utils\cache.ts

```
import type { CacheFile, Cache } from "../_types";

export function isCacheFile(value: Cache | CacheFile | undefined): value is CacheFile {
  return !!value && (value as CacheFile).status !== undefined;
}

```

scripts\code-map\_utils\extension.ts

```
export function normalizeExtension(ext: string): string {
  return ext.replace(/^\./, "").toLowerCase().trim();
}

export function getFileExtension(filename: string): string {
  for (let i = filename.length - 1; i >= 0; i--) {
    const char = filename[i];

    if (char === ".") {
      if (i === 0) return "";
      return filename.slice(i);
    }
    if (char === "/" || char === "\\") return "";
  }

  return "";
}

```

scripts\code-map\_utils\get-file-hash.ts

```
import { createHash } from "crypto";
import { createReadStream } from "fs";
import path from "path";

export function getFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!path.isAbsolute(filePath)) {
      return reject(new Error("File path must be absolute"));
    }

    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("error", (err) => reject(err));

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      const digest = hash.digest("hex");
      resolve(digest);
    });
  });
}

```

scripts\code-map\_utils\save-file.ts

```
import fs from "node:fs/promises";
import path from "node:path";

import type { Cache } from "../_types";

/**
 * Кэш всегда полностью переписываем.
 */
export async function saveCacheFile(
  absolutePath: string,
  cache: Cache,
): Promise<void> {
  const fileContent =
    `import type { Cache } from "../_types";\n\n` +
    `export const cache: Cache = ${JSON.stringify(cache, null, 2)};\n`;

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, fileContent, "utf8");
}

/**
 * Конфиг пишем текстом (уже подготовленным, со строками/комментариями).
 */
export async function saveConfigFile(
  absolutePath: string,
  configTsContent: string,
): Promise<void> {
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, configTsContent, "utf8");
}

```

- Напиши полный код всех файлов что нужно исправить. Те файлы что отличные не трогай и не переписывай. Также напиши файлы которые нужно удалить, если такие есть.