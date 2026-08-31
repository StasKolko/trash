import { cache as baseCache } from "../_cache";
import { initIgnoredExtensionSet } from "../_utils/extension";
import { printStats } from "../_utils/print";
import { saveCacheFile, saveSortedConfig } from "../_utils/save-files";
import { config as baseConfig } from "../config";
import { init } from "./init";
import { mergeCacheIntoConfig } from "./merge";

export async function codeMap({
  paths: { rootDir, cacheFile, configFile },
  ignoredExtensions,
}: {
  paths: {
    rootDir: string;
    cacheFile: string;
    configFile: string;
  };
  ignoredExtensions: string[];
}) {
  initIgnoredExtensionSet(ignoredExtensions);

  const { newCache, newConfig } = await init({
    absPath: rootDir,
    config: baseConfig,
    cache: baseCache,
  });

  mergeCacheIntoConfig(newConfig, newCache);
  printStats();

  await saveCacheFile({ cacheFile, newCache });
  await saveSortedConfig({ configFile, newConfig, rootDir });
}
