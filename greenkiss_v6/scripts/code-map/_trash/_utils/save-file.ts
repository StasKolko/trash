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
