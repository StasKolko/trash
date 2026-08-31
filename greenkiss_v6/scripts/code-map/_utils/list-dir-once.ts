import { readdir } from "node:fs/promises";
import { join } from "node:path";

import type { EntryInfo } from "../_types";
import { getFileExtension, normalizeExtension } from "./extension";

export async function listDirOnce(absPath: string, ignoredExtensionSet: Set<string>): Promise<{
  dirs: EntryInfo[];
  files: EntryInfo[];
}> {
  const entries = await readdir(absPath, { withFileTypes: true });

  const dirs: EntryInfo[] = [];
  const files: EntryInfo[] = [];

  for (const entry of entries) {
    const fullPath = join(absPath, entry.name);

    if (entry.isDirectory()) {
      dirs.push({ name: entry.name, path: fullPath });
    } else if (entry.isFile()) {
      const ext = normalizeExtension(getFileExtension(entry.name));

      if (!ignoredExtensionSet.has(ext)) {
        files.push({ name: entry.name, path: fullPath });
      }
    }
  }
  
  return { dirs, files };
}
