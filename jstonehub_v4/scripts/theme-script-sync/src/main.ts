import type { SyncOptions } from "./type";

import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import {
  APPS_DIR_NAME,
  CACHED_KEY_REGEX,
  CACHED_THEME_REGEX,
  INDEX_HTML_FILENAME,
} from "./constant";
import { extractThemeValues } from "./extract";
import { injectThemeScript } from "./inject";
import { writeCacheFile } from "./write-cache";

async function syncThemeScript(options: SyncOptions): Promise<void> {
  const themeValues = await extractThemeValues(options.themeConstantPath);
  const cached = await readCachedValues(options.cacheFilePath);

  if (
    cached.defaultTheme === themeValues.defaultTheme
    && cached.storageKey === themeValues.storageKey
  ) {
    console.log("[theme-script-sync] Theme values are up to date");
    return;
  }

  const appsDir = join(options.rootDir, APPS_DIR_NAME);
  const appDirs = await scanAppsDirectory(appsDir);
  const indexPaths = await findIndexHtmlPaths(appsDir, appDirs);

  await Promise.all(
    indexPaths.map((indexPath) =>
      injectThemeScript(
        indexPath,
        themeValues.defaultTheme,
        themeValues.storageKey,
      ),
    ),
  );

  await writeCacheFile(
    options.cacheFilePath,
    themeValues.defaultTheme,
    themeValues.storageKey,
  );

  console.log(
    `[theme-script-sync] Synced (defaultTheme: "${themeValues.defaultTheme}", storageKey: "${themeValues.storageKey}")`,
  );
}

async function readCachedValues(
  cacheFilePath: string,
): Promise<{ defaultTheme: string; storageKey: string }> {
  const content = await readFile(cacheFilePath, "utf-8");

  const themeMatch = content.match(CACHED_THEME_REGEX);
  const keyMatch = content.match(CACHED_KEY_REGEX);

  return {
    defaultTheme: themeMatch?.[1] ?? "",
    storageKey: keyMatch?.[1] ?? "",
  };
}

async function scanAppsDirectory(appsDir: string): Promise<string[]> {
  const entries = await readdir(appsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

async function findIndexHtmlPaths(
  appsDir: string,
  appDirs: string[],
): Promise<string[]> {
  const results = await Promise.all(
    appDirs.map(async (appDir) => {
      const indexPath = join(appsDir, appDir, INDEX_HTML_FILENAME);
      const exists = await fileExists(indexPath);
      return exists ? indexPath : null;
    }),
  );

  return results.filter((path): path is string => path !== null);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export { syncThemeScript };
