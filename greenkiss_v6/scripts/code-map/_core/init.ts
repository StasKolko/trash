import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Cache, Config, Status } from "../_types";

import {
  isCache,
  isCacheFile,
  isConfig,
  isIgnoredEntry,
  isString,
} from "../_utils";
import { shouldIgnoreExtension } from "../_utils/extension";
import { hashFile } from "../_utils/hash-file";
import { incrementFiles } from "../_utils/print";

export async function init({
  absPath,
  config,
  cache,
  defaultStatus,
}: {
  absPath: string;
  config: Config;
  cache: Cache;
  defaultStatus?: Status;
}) {
  const entries = await readdir(absPath, { withFileTypes: true });

  const newConfig: Config = {};
  const newCache: Cache = {};

  for (const entry of entries) {
    const entryName = entry.name;
    const configEntry = config[entryName];
    const cacheEntry = cache[entryName];
    const fullPath = join(absPath, entryName);

    if (isIgnoredEntry(configEntry)) {
      newConfig[entryName] = "ignore";
      continue;
    }

    if (entry.isFile()) {
      if (shouldIgnoreExtension(entryName)) continue;

      const fileHash = await hashFile(fullPath);
      let newStatus: Status = "error";

      const hashesEqual =
        isCacheFile(cacheEntry) && cacheEntry.hash === fileHash;

      if (hashesEqual) {
        if (isString(configEntry)) {
          newStatus = configEntry;
        } else if (defaultStatus) {
          newStatus = defaultStatus;
        } else if (cacheEntry.status) {
          newStatus = cacheEntry.status;
        }
      }

      incrementFiles(newStatus === "ok" ? "ok" : "error");

      newCache[entryName] = {
        hash: fileHash,
        status: newStatus,
      };
    } else if (entry.isDirectory()) {
      let childConfig: Config;
      let childDefaultStatus: Status | undefined = defaultStatus;

      if (isConfig(configEntry)) {
        childConfig = configEntry;
      } else if (isString(configEntry)) {
        childConfig = {};
        childDefaultStatus = configEntry;
      } else {
        childConfig = {};
      }

      const childCache = cacheEntry && isCache(cacheEntry) ? cacheEntry : {};

      const { newConfig: childNewConfig, newCache: childNewCache } = await init(
        {
          absPath: fullPath,
          config: childConfig,
          cache: childCache,
          defaultStatus: childDefaultStatus,
        },
      );

      if (Object.keys(childNewConfig).length > 0) {
        newConfig[entryName] = childNewConfig;
      }
      if (Object.keys(childNewCache).length > 0) {
        newCache[entryName] = childNewCache;
      }
    }
  }

  return { newConfig, newCache };
}
