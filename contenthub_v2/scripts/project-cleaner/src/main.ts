import type { CleanerConfig, CleanStats } from "./type";

import { access } from "node:fs/promises";

import { ConfigNotFoundError } from "./error";
import { normalizeConfig } from "./normalize";
import { printReport } from "./report";
import { walkAndClean } from "./walker";

async function cleanProject(params: {
  rootDir: string;
  configPath: string;
}): Promise<CleanStats> {
  const { rootDir, configPath } = params;
  const startTime = performance.now();

  await assertConfigExists(configPath);

  const config = await loadConfig(configPath);
  const normalized = normalizeConfig(config);

  const stats: CleanStats = { deleted: [], errors: [] };

  await walkAndClean({ dir: rootDir, config: normalized, stats });

  const elapsedMs = Math.round(performance.now() - startTime);
  printReport({ rootDir, stats, elapsedMs });

  return stats;
}

async function assertConfigExists(configPath: string): Promise<void> {
  try {
    await access(configPath);
  } catch {
    throw new ConfigNotFoundError({ configPath });
  }
}

async function loadConfig(configPath: string): Promise<CleanerConfig> {
  const module = await import(configPath);
  return module.config as CleanerConfig;
}

export { cleanProject };
