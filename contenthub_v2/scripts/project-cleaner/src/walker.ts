import type { CleanStats, NormalizedConfig } from "./type";

import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";

import { isIgnored, shouldRemove } from "./matcher";

async function walkAndClean(params: {
  dir: string;
  config: NormalizedConfig;
  stats: CleanStats;
}): Promise<void> {
  const { dir, config, stats } = params;

  const entries = await readdir(dir, { withFileTypes: true });

  await Promise.all(
    entries.map((entry) => {
      const fullPath = join(dir, entry.name);

      if (isIgnored(entry, config)) {
        return;
      }

      if (shouldRemove(entry, config)) {
        return remove({
          path: fullPath,
          kind: entry.isDirectory() ? "dir" : "file",
          stats,
        });
      }

      if (entry.isDirectory()) {
        return walkAndClean({ dir: fullPath, config, stats });
      }
    }),
  );
}

async function remove(params: {
  path: string;
  kind: "dir" | "file";
  stats: CleanStats;
}): Promise<void> {
  const { path, kind, stats } = params;

  try {
    await rm(path, { recursive: true, force: true });
    stats.deleted.push({ kind, path });
  } catch (error) {
    stats.errors.push({
      path,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export { walkAndClean };
