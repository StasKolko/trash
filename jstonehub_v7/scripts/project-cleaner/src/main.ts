import type { CleanConfig, CleanStats } from "./type";

import { normalizeConfig } from "./matcher";
import { walkDirectory } from "./walker";

async function cleanProject(config: CleanConfig): Promise<CleanStats> {
  const startTime = performance.now();

  const normalizedConfig = normalizeConfig(config);
  const stats = createEmptyStats();

  printHeader(
    normalizedConfig.rootDir,
    config.includes,
    normalizedConfig.dryRun,
  );

  await walkDirectory(normalizedConfig, stats);

  const elapsedMs = calcElapsedMs(startTime);

  printStats(stats, normalizedConfig.dryRun, elapsedMs);

  return stats;
}

function createEmptyStats(): CleanStats {
  return {
    deleted: [],
    skipped: [],
    errors: [],
  };
}

function calcElapsedMs(startTime: number): number {
  return Math.round(performance.now() - startTime);
}

function printHeader(
  rootDir: string,
  includes: string[],
  dryRun: boolean,
): void {
  console.log(`📁 Root: ${rootDir}`);
  console.log(`🎯 Patterns: ${includes.join(", ")}`);

  if (dryRun) {
    console.log("🔍 Dry run mode - no files will be deleted");
  }
}

function printStats(
  stats: CleanStats,
  dryRun: boolean,
  elapsedMs: number,
): void {
  const action = dryRun ? "Would delete" : "Deleted";

  console.log("\n📊 Results:");
  console.log(`  ${action}: ${stats.deleted.length} items`);

  for (const item of stats.deleted) {
    console.log(`    ✓ ${item}`);
  }

  printSkipped(stats);
  printErrors(stats);

  console.log(`\n✨ Done in ${elapsedMs}ms`);
}

function printSkipped(stats: CleanStats): void {
  if (stats.skipped.length === 0) {
    return;
  }

  console.log(`  ⏭️  Skipped: ${stats.skipped.length} directories`);
  for (const item of stats.skipped) {
    console.log(`    ○ ${item}`);
  }
}

function printErrors(stats: CleanStats): void {
  if (stats.errors.length === 0) {
    return;
  }

  console.log(`\n⚠️  Errors: ${stats.errors.length}`);
  for (const { path, error } of stats.errors) {
    console.log(`    ✗ ${path}: ${error}`);
  }
}

export { cleanProject };
