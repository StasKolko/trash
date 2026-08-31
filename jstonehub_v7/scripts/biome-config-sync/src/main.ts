import type { SyncOptions } from "./type";

import { join } from "node:path";
import { env } from "node:process";

import { BIOME_VERSION } from "./cache";
import { resolveConfigEntries } from "./resolve";
import { syncExports } from "./sync-export";
import { syncExtends } from "./sync-extend";
import { syncSchema } from "./sync-schema";
import { extractBiomeVersion } from "./version";
import { writeCacheFile } from "./write-cache";

async function biomeConfigSync(options: SyncOptions) {
  const startTime = performance.now();

  if (isProduction()) {
    console.log("[biome-config-sync] Skipped in production");
    return;
  }

  const version = await extractBiomeVersion(options.rootPackageJsonPath);

  if (isUpToDate(version)) {
    logUpToDate({ version, startTime });
    return;
  }

  const entries = await resolveAndValidateEntries(options.configPackageDir);

  await syncAllConfigs({ options, entries, version });
  await writeCacheFile({ filePath: options.cacheFilePath, version });

  logUpdated({ version, entryCount: entries.length, startTime });
}

function isProduction() {
  return env.NODE_ENV === "production";
}

function isUpToDate(version: string) {
  return version === BIOME_VERSION;
}

async function resolveAndValidateEntries(configPackageDir: string) {
  const configSrcDir = join(configPackageDir, "src");
  const entries = await resolveConfigEntries(configSrcDir);

  if (entries.length === 0) {
    throw new Error(`No config files found in: ${configSrcDir}`);
  }

  return entries;
}

async function syncAllConfigs(params: {
  options: SyncOptions;
  entries: Awaited<ReturnType<typeof resolveConfigEntries>>;
  version: string;
}) {
  const { options, entries, version } = params;
  const configSrcDir = join(options.configPackageDir, "src");
  const configPackageJsonPath = join(options.configPackageDir, "package.json");

  await syncSchema({
    biomeJsonPath: options.biomeJsonPath,
    configSrcDir,
    entries,
    version,
  });
  await syncExports(configPackageJsonPath, entries);
  await syncExtends(options.biomeJsonPath, entries);
}

function logUpToDate(params: { version: string; startTime: number }) {
  const elapsedMs = calcElapsedMs(params.startTime);
  console.log(
    `[biome-config-sync] Version ${params.version} is up to date (${elapsedMs}ms)`,
  );
}

function logUpdated(params: {
  version: string;
  entryCount: number;
  startTime: number;
}) {
  const elapsedMs = calcElapsedMs(params.startTime);
  console.log(
    `[biome-config-sync] Updated ${BIOME_VERSION} → ${params.version} (${params.entryCount} configs, ${elapsedMs}ms)`,
  );
}

function calcElapsedMs(startTime: number) {
  return Math.round(performance.now() - startTime);
}

export { biomeConfigSync };
