import type { Dirent } from "node:fs";

import type { CleanStats, NormalizedConfig } from "./type";

import { readdir, rm, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { normalizePath } from "@scripts/util/path";

import {
  RETRY_COUNT_MAX,
  RETRY_DELAY_MS,
  RETRYABLE_ERROR_CODES,
} from "./constant";
import { shouldDelete, shouldSkip } from "./matcher";

type ProcessEntryParams = {
  entry: Dirent;
  relativeDirPath: string;
  config: NormalizedConfig;
  stats: CleanStats;
};

type RemoveParams = {
  targetPath: string;
  stats: CleanStats;
  dryRun: boolean;
};

async function walkDirectory(config: NormalizedConfig, stats: CleanStats) {
  await validateRootDir(config.rootDir);
  await walkAndClean("", config, stats);
}

async function validateRootDir(rootDir: string) {
  const rootStat = await stat(rootDir).catch(() => null);

  if (!rootStat?.isDirectory()) {
    throw new Error(`Root directory not found: ${rootDir}`);
  }
}

async function walkAndClean(
  relativeDirPath: string,
  config: NormalizedConfig,
  stats: CleanStats,
) {
  const absoluteDirPath = resolveAbsolutePath({
    rootDir: config.rootDir,
    relativeDirPath,
  });
  const entries = await readEntries(absoluteDirPath, stats);

  if (!entries) {
    return;
  }

  await Promise.all(
    entries.map((entry) =>
      processEntry({ entry, relativeDirPath, config, stats }),
    ),
  );
}

function resolveAbsolutePath(params: {
  rootDir: string;
  relativeDirPath: string;
}) {
  const { rootDir, relativeDirPath } = params;
  return relativeDirPath ? join(rootDir, relativeDirPath) : rootDir;
}

async function readEntries(absoluteDirPath: string, stats: CleanStats) {
  try {
    return await readdir(absoluteDirPath, { withFileTypes: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stats.errors.push({
      path: absoluteDirPath,
      error: `Failed to read: ${message}`,
    });
    return null;
  }
}

async function processEntry(params: ProcessEntryParams) {
  const { entry, relativeDirPath, config, stats } = params;
  const relativeEntryPath = buildRelativePath({
    dirPath: relativeDirPath,
    entryName: entry.name,
  });
  const absoluteEntryPath = join(config.rootDir, relativeEntryPath);

  if (entry.isFile() || entry.isSymbolicLink()) {
    if (shouldDelete(relativeEntryPath, config)) {
      await removeFileWithRetry({
        targetPath: absoluteEntryPath,
        stats,
        dryRun: config.dryRun,
      });
    }
    return;
  }

  if (shouldDelete(relativeEntryPath, config)) {
    await removeWithRetry({
      targetPath: absoluteEntryPath,
      stats,
      dryRun: config.dryRun,
    });
    return;
  }

  if (shouldSkip(relativeEntryPath, config)) {
    stats.skipped.push(absoluteEntryPath);
    return;
  }

  await walkAndClean(relativeEntryPath, config, stats);
}

function buildRelativePath(params: { dirPath: string; entryName: string }) {
  const { dirPath, entryName } = params;
  const raw = dirPath ? `${dirPath}/${entryName}` : entryName;
  return normalizePath(raw);
}

async function removeFileWithRetry(params: RemoveParams) {
  const { targetPath, stats, dryRun } = params;

  if (dryRun) {
    stats.deleted.push(targetPath);
    return;
  }

  const result = await tryRemoveFile(targetPath, 0);
  recordResult(result, targetPath, stats);
}

async function tryRemoveFile(
  targetPath: string,
  attempt: number,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    await unlink(targetPath);
    return { success: true };
  } catch (error) {
    if (isRetryableError(error) && attempt < RETRY_COUNT_MAX - 1) {
      await sleep(RETRY_DELAY_MS);
      return tryRemoveFile(targetPath, attempt + 1);
    }
    return { success: false, error };
  }
}

async function removeWithRetry(params: RemoveParams) {
  const { targetPath, stats, dryRun } = params;

  if (dryRun) {
    stats.deleted.push(targetPath);
    return;
  }

  const result = await tryRemove(targetPath, 0);
  recordResult(result, targetPath, stats);
}

async function tryRemove(
  targetPath: string,
  attempt: number,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    await rm(targetPath, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    if (isRetryableError(error) && attempt < RETRY_COUNT_MAX - 1) {
      await sleep(RETRY_DELAY_MS);
      return tryRemove(targetPath, attempt + 1);
    }
    return { success: false, error };
  }
}

function recordResult(
  result: { success: boolean; error?: unknown },
  targetPath: string,
  stats: CleanStats,
) {
  if (result.success) {
    stats.deleted.push(targetPath);
  } else {
    const message =
      result.error instanceof Error
        ? result.error.message
        : String(result.error);
    stats.errors.push({ path: targetPath, error: message });
  }
}

function isRetryableError(error: unknown) {
  return (
    error instanceof Error
    && "code" in error
    && typeof error.code === "string"
    && RETRYABLE_ERROR_CODES.has(error.code)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { walkDirectory };
