import { Config, Cache, CacheFile } from "../_types";
import { isCacheFile } from "../_utils/cache";

/**
 * Синхронизирует кэш с конфигом:
 *
 * 5) Если в конфиге файл указан как "ok" и у него не изменился хеш с прошлого раза,
 *    то он становится "ok" в кэше и hash фиксируется на текущем newHash.
 *
 * 6) Папки "ok" из конфига:
 *    - работают только тогда, когда все файлы внутри такой папки в кэше
 *      не меняли свой хеш (hash === newHash);
 *    - если это так, все файлы внутри папки получают status: "ok" и hash = newHash;
 *    - если нет — статусы "error" сохраняются, hash НЕ затирается.
 */
export function syncCacheWithConfig(cache: Cache, config: Config): void {
  for (const key in config) {
    const configValue = config[key];
    const cacheValue = cache[key];

    // Если записи в кэше нет — либо ignore, либо сущность уже удалена; пропускаем.
    if (cacheValue === undefined) continue;

    // ---------------- ФАЙЛ ----------------
    if (isCacheFile(cacheValue)) {
      // Файл может иметь явный статус только "ok" или "ignore" в конфиге.
      if (typeof configValue === "string" && configValue === "ok") {
        // 5) Файл помечен как ok в конфиге.
        if (cacheValue.hash === cacheValue.newHash) {
          // Хеш не изменился — пользователь подтвердил этот снимок.
          cacheValue.status = "ok";
          cacheValue.hash = cacheValue.newHash;
        } else {
          // Хеш изменился — файл остаётся error,
          // hash не трогаем, чтобы продолжать детектить изменения.
          cacheValue.status = "error";
        }
      }
      // Если в конфиге для файла нет "ok" — ничего не меняем:
      // статус и hash остаются такими, какими их выставил initializeConfigAndCache.
      continue;
    }

    // ---------------- ПАПКА / ОБЪЕКТ ----------------
    if (typeof configValue === "string") {
      // Это пометка папки как "ok" или "ignore".
      if (configValue === "ok") {
        // 6) Папка "ok" — проверяем, что все файлы внутри не меняли хеш.
        const allFilesHashesEqual = checkAllHashesEqual(cacheValue);

        if (allFilesHashesEqual) {
          // Все hash === newHash — считаем всё дерево подтверждённым.
          updateCacheFilesToOk(cacheValue);
        } else {
          // Внутри есть изменения — ничего не синхронизируем,
          // чтобы изменения продолжали отображаться как error.
        }
      } else {
        // "ignore" для папки: до этой точки initializeConfigAndCache уже
        // выбросил соответствующие ветки из cache, так что здесь обычно
        // делать нечего. Оставляем как есть.
      }

      continue;
    }

    // Вложенный объект конфига (частичное перечисление детей).
    // Рекурсивно применяем правила к поддереву.
    syncCacheWithConfig(cacheValue, configValue);
  }
}

/**
 * Проверяет, что во всех файлах cache.hash === cache.newHash.
 * Работает рекурсивно по дереву.
 */
function checkAllHashesEqual(cache: Cache | CacheFile): boolean {
  if (isCacheFile(cache)) {
    return cache.hash === cache.newHash;
  }

  for (const key in cache) {
    if (!checkAllHashesEqual(cache[key] as Cache | CacheFile)) {
      return false;
    }
  }
  return true;
}

/**
 * Рекурсивно проставляет status: "ok" и hash = newHash во всех файлах.
 * Используется для подтверждения целой "ok"-папки (правило 6).
 */
function updateCacheFilesToOk(cache: Cache | CacheFile): void {
  if (isCacheFile(cache)) {
    cache.status = "ok";
    cache.hash = cache.newHash;
    return;
  }

  for (const key in cache) {
    updateCacheFilesToOk(cache[key] as Cache | CacheFile);
  }
}
