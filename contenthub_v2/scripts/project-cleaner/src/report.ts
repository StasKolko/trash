import type { CleanStats, DeletedEntry } from "./type";

import { extname, relative, sep } from "node:path";

function printReport(params: {
  rootDir: string;
  stats: CleanStats;
  elapsedMs: number;
}): void {
  const { rootDir, stats, elapsedMs } = params;

  printTree(rootDir, stats.deleted);
  printSummary(stats);
  printErrors(stats);

  console.log(`\nDone in ${elapsedMs}ms`);
}

function printTree(rootDir: string, deleted: DeletedEntry[]): void {
  console.log("Deleted:");

  if (deleted.length === 0) {
    console.log("  (nothing)");
    return;
  }

  const sorted = [...deleted].sort((a, b) => a.path.localeCompare(b.path));

  for (const entry of sorted) {
    const rel = relative(rootDir, entry.path);
    const depth = rel.split(sep).length - 1;
    const indent = "  ".repeat(depth + 1);
    const suffix = entry.kind === "dir" ? "/" : "";
    console.log(`${indent}${rel}${suffix}`);
  }
}

function printSummary(stats: CleanStats): void {
  const dirs = stats.deleted.filter((e) => e.kind === "dir").length;
  const files = stats.deleted.filter((e) => e.kind === "file").length;
  const extensions = new Set(
    stats.deleted
      .filter((e) => e.kind === "file")
      .map((e) => extname(e.path))
      .filter((ext) => ext.length > 0),
  ).size;

  console.log("\nSummary:");
  console.log(`  Directories deleted: ${dirs}`);
  console.log(`  Files deleted:       ${files}`);
  console.log(`  Unique extensions:   ${extensions}`);
  console.log(`  Failed:              ${stats.errors.length}`);
}

function printErrors(stats: CleanStats): void {
  if (stats.errors.length === 0) {
    return;
  }

  console.log("\nErrors:");
  for (const { path, message } of stats.errors) {
    console.log(`  ${path}: ${message}`);
  }
}

export { printReport };
