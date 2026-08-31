import { writeFile } from "node:fs/promises";

async function writeCacheFile(
  filePath: string,
  defaultTheme: string,
  storageKey: string,
): Promise<void> {
  const content = [
    `export const CACHED_DEFAULT_THEME = "${defaultTheme}";`,
    `export const CACHED_STORAGE_KEY = "${storageKey}";`,
    "",
  ].join("\n");

  await writeFile(filePath, content, "utf-8");
}

export { writeCacheFile };
