import { writeFile } from "node:fs/promises";
import { Status, Cache, CacheFile } from "../_types";

type CacheWithStatusOnly = {
  [name: string]: CacheWithStatusOnly | Status;
};

export async function test({
  cacheFile,
  newCache,
}: {
  cacheFile: string;
  newCache: Cache;
}) {
  const cache = mapCacheToStatusOnly(newCache);

  const fileContent = `export const cache = ${JSON.stringify(cache, null, 2)};`;

  await writeFile(cacheFile, fileContent, "utf8");
}

function mapCacheToStatusOnly(cache: Cache): CacheWithStatusOnly {
  const result: CacheWithStatusOnly = {};

  for (const key in cache) {
    const value = cache[key];

    // Если у value есть поле status (и это строка нужного типа) — считаем, что это CacheFile
    if (
      value &&
      typeof value === "object" &&
      "status" in value &&
      typeof (value as CacheFile).status === "string"
    ) {
      result[key] = (value as CacheFile).status;
    } else {
      // Иначе предполагаем, что это вложенный Cache и идём рекурсивно
      result[key] = mapCacheToStatusOnly(value as Cache);
    }
  }

  return result;
}