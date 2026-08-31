import type { ConfigEntry } from "./type";

import { readFile, writeFile } from "node:fs/promises";

async function syncExports(
  packageJsonPath: string,
  entries: ConfigEntry[],
): Promise<void> {
  const content = await readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(content);

  parsed.exports = buildExportsMap(entries);

  await writeFile(
    packageJsonPath,
    `${JSON.stringify(parsed, null, 2)}\n`,
    "utf8",
  );
}

function buildExportsMap(entries: ConfigEntry[]): Record<string, string> {
  const exports: Record<string, string> = {};

  for (const entry of entries) {
    exports[`./${entry.name}`] = `./src/${entry.relativePath}`;
  }

  return exports;
}

export { syncExports };
