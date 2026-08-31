import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Cache } from "../_types";

export const writeCacheToFile = async (rootDir: string, cache: Cache): Promise<void> => {
  const cacheFilePath = resolve(rootDir, "scripts/code-map/_cache/index.ts");
  const fileContent = buildCacheFileContent(cache);
  await writeFile(cacheFilePath, fileContent, { encoding: "utf8" });
};

const buildCacheFileContent = (cache: Cache): string => {
  return `import { Cache } from "../_types";

export const cache: Cache = ${JSON.stringify(cache, null, 2)}
`;
};
