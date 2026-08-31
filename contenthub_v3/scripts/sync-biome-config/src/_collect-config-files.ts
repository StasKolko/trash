// scripts/sync-biome-config/src/_collect-config-files.ts
import { readdirSync } from "node:fs";
import { join, posix, sep } from "node:path";

import { getConfig } from "./_config";

const ALLOWED_EXTENSIONS = [".json", ".jsonc"] as const;
const EXCLUDED_FILES = ["package.json"] as const;
const LEADING_SEPARATORS_REGEX = /^[\\/]+/;

type ConfigFile = {
  relativePath: string;
  absolutePath: string;
};

function collectConfigFiles(): ConfigFile[] {
  const { rootDir, configsWorkspace } = getConfig();
  const srcDir = join(rootDir, configsWorkspace.dir, configsWorkspace.srcDir);
  const results: ConfigFile[] = [];

  function walk(current: string): void {
    const entries = readdirSync(current, { withFileTypes: true });

    const directories = entries
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));

    const files = entries
      .filter((entry) => entry.isFile() && isConfigFile(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const directory of directories) {
      walk(join(current, directory.name));
    }

    for (const file of files) {
      const absolutePath = join(current, file.name);
      results.push({
        absolutePath,
        relativePath: toRelativePath({ absolutePath, srcDir }),
      });
    }
  }

  walk(srcDir);

  return results;
}

function isConfigFile(fileName: string): boolean {
  if (EXCLUDED_FILES.includes(fileName as (typeof EXCLUDED_FILES)[number])) {
    return false;
  }

  return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

function toRelativePath({
  absolutePath,
  srcDir,
}: {
  absolutePath: string;
  srcDir: string;
}): string {
  const relative = absolutePath
    .slice(srcDir.length)
    .replace(LEADING_SEPARATORS_REGEX, "");

  return relative.split(sep).join(posix.sep);
}

export type { ConfigFile };
export { collectConfigFiles };
