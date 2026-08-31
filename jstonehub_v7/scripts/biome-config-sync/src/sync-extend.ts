import type { ConfigEntry } from "./type";

import { readFile, writeFile } from "node:fs/promises";

import { BIOME_CONFIG_PACKAGE_NAME } from "./constant";

async function syncExtends(
  biomeJsonPath: string,
  entries: ConfigEntry[],
): Promise<void> {
  const content = await readFile(biomeJsonPath, "utf8");
  const parsed = JSON.parse(content);

  parsed.extends = buildExtendsList(entries);

  await writeFile(
    biomeJsonPath,
    `${JSON.stringify(parsed, null, 2)}\n`,
    "utf8",
  );
}

function buildExtendsList(entries: ConfigEntry[]): string[] {
  return entries.map((entry) => `${BIOME_CONFIG_PACKAGE_NAME}/${entry.name}`);
}

export { syncExtends };
