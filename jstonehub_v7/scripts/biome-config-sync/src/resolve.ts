import type { ConfigEntry } from "./type";

import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { normalizePath } from "@scripts/util/path";

import { CONFIG_FILE_EXTENSIONS } from "./constant";

async function resolveConfigEntries(srcDir: string): Promise<ConfigEntry[]> {
  const files = await collectFiles(srcDir);
  const entries = mapToEntries(files, srcDir);
  entries.sort(compareByName);
  return entries;
}

function mapToEntries(files: string[], srcDir: string): ConfigEntry[] {
  return files.map((absolutePath) => {
    const rel = normalizePath(relative(srcDir, absolutePath));
    const name = stripExtension(rel);
    return { name, relativePath: rel };
  });
}

function compareByName(a: ConfigEntry, b: ConfigEntry): number {
  return a.name.localeCompare(b.name);
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir);

  const resolved = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        return collectFiles(fullPath);
      }

      return isConfigFile(entry) ? [fullPath] : [];
    }),
  );

  return resolved.flat();
}

function isConfigFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return CONFIG_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function stripExtension(filePath: string): string {
  for (const ext of CONFIG_FILE_EXTENSIONS) {
    if (filePath.endsWith(ext)) {
      return filePath.slice(0, -ext.length);
    }
  }
  /* v8 ignore next -- unreachable: only called after isConfigFile filter */
  return filePath;
}

export { resolveConfigEntries };
