import type { Config, Cache, EntryInfo } from "../_types";

import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { getFileExtension, normalizeExtension } from "../_utils/extension";
import { getFileHash } from "../_utils/get-file-hash";

/**
 * Главная функция инициализации:
 * - читает директорию;
 * - чистит config/cache от несуществующих имён;
 * - применяет ignore из config (не спускается внутрь игнор-папок);
 * - обновляет кэш по файлам;
 * - рекурсивно обходит подпапки.
 */
export async function initializeNewConfigAndNewCache({
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

  // 3) Удалить из кеша и конфига несуществующие файлы/папки.
  cleanupConfigAndCache({ dirs, files, config, cache });

  // 1,2) Применить ignore из конфига:
  // - убрать игнор из обхода;
  // - выбросить из cache.
  applyIgnoreFromConfig({ cache, config, dirs, files });

  // 2,4) Обновить кэш по файлам (новые/изменённые -> error).
  await updateFileCache({ cache, files });

  // Рекурсивно в подпапки (только не-игнор).
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
 * 1) пропускаем файлы с игнор-расширениями.
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
 * 3) Удаляет из config и cache ключи, которых уже нет на диске.
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
 * 1,2) Применяет ignore из config:
 * - убирает такие имена из обхода dirs/files;
 * - удаляет соответствующие ветки из cache;
 * - внутрь игнор-папок вообще не заходим.
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

  const keptDirs = dirs.filter((entry) => !ignoredNames.has(entry.name));
  dirs.length = 0;
  dirs.push(...keptDirs);

  const keptFiles = files.filter((entry) => !ignoredNames.has(entry.name));
  files.length = 0;
  files.push(...keptFiles);

  for (const key in cache) {
    if (ignoredNames.has(key)) {
      delete cache[key];
    }
  }
}

/**
 * 2,4) Обновляет кэш по файлам:
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
      // Новый файл — ещё не подтверждён => error.
      cache[name] = {
        status: "error",
        hash: fileHash,
        newHash: fileHash,
      };
    } else {
      const fileEntry = cache[name] as any;
      if (!("status" in fileEntry)) {
        // На всякий случай, если на этом месте раньше была папка.
        cache[name] = {
          status: "error",
          hash: fileHash,
          newHash: fileHash,
        };
      }
    }

    const cacheFile = cache[name] as any;
    cacheFile.newHash = fileHash;

    // 4) Если хеш поменялся — статус error.
    if (cacheFile.newHash !== cacheFile.hash) {
      cacheFile.status = "error";
    }
  }
}
