import type { Config, Cache } from "../_types";

export const filterCacheByConfig = (config: Config, cache: Cache): Config => {
  const ignoreResult: Config = {};

  for (const key of Object.keys(config)) {
    const cfgValue = config[key];

    // Если этот ключ вообще есть в кеше:
    const hasInCache = Object.prototype.hasOwnProperty.call(cache, key);

    if (cfgValue === "ignore") {
      // Удаляем из кеша
      if (hasInCache) {
        delete (cache as any)[key];
      }
      // В результат добавляем как ignore
      ignoreResult[key] = "ignore";
    } else if (typeof cfgValue === "object" && cfgValue !== null) {
      // Вложенный объект конфига
      const cacheChild = (hasInCache && typeof (cache as any)[key] === "object")
        ? ((cache as any)[key] as Cache)
        : undefined;

      if (cacheChild) {
        const childIgnore = filterCacheByConfig(cfgValue as Config, cacheChild);

        // Если после фильтрации cacheChild стал пустым — удаляем ключ из кеша
        if (Object.keys(cacheChild).length === 0) {
          delete (cache as any)[key];
        }

        // Если во вложенном уровне были ignore — добавляем их в результат
        if (Object.keys(childIgnore).length > 0) {
          ignoreResult[key] = childIgnore;
        }
      } else {
        // В кеше этого ключа нет, но в конфиге объект:
        // В игнор-объект всё равно отражаем только реально ignore-ключи из вложенного объекта,
        // поэтому просто рекурсивно пробегаем без кеша.
        const childIgnore = filterCacheByConfig(cfgValue as Config, {} as Cache);
        if (Object.keys(childIgnore).length > 0) {
          ignoreResult[key] = childIgnore;
        }
      }
    }
    // 'ok' ничего не делает
  }

  return ignoreResult;
};
