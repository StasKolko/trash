import { config as initialConfig } from "../config";
import { cache as initialCache } from "../_cache";
import { initializeConfigAndCache } from "./initialize-config-and-cache";
import { syncCacheWithConfig } from "./sync-cache-with-config";

import { normalizeExtension } from "../_utils/extension";
import { saveCacheFile, saveConfigFile } from "../_utils/save-file";

import {
  buildCollapsedConfigAndErrorTree,
  stringifyConfigObject,
  stringifyErrorTree,
} from "./build-collapsed-config-and-error-tree";

import type { Config, Cache } from "../_types";

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
  const ignoredExtensionSet = new Set(ignoredExtensions.map(normalizeExtension));

  // Клонируем, чтобы не мутировать импорт напрямую.
  const config: Config = JSON.parse(JSON.stringify(initialConfig));
  const cache: Cache = JSON.parse(JSON.stringify(initialCache));

  // 1–4: обойти проект, учесть ignore/расширения, обновить кэш.
  await initializeConfigAndCache({
    config,
    cache,
    absPath: rootDir,
    ignoredExtensionSet,
  });

  // 5–6: применить ok/ignore из конфига к кэшу.
  syncCacheWithConfig(cache, config);

  // 7,9,10: собрать новый конфиг, errorTree, статистику.
  const { nextConfig, errorTree, stats } =
    buildCollapsedConfigAndErrorTree(cache, config);

  // 8) Сохранить кэш.
  await saveCacheFile(cacheFile, cache);

  // Посчитать процент рефакторинга.
  const { totalFiles, okFiles, errorFiles } = stats;
  const percent =
    totalFiles > 0 ? ((okFiles / totalFiles) * 100).toFixed(2) : "0.00";

  // 9) Собрать содержимое нового config.ts.
  const configObjectString = stringifyConfigObject(nextConfig, 0);

  const headerComment =
    `// GENERATED FILE. DO NOT EDIT.\n` +
    `// Total files: ${totalFiles}\n` +
    `// OK files: ${okFiles}\n` +
    `// ERROR files: ${errorFiles}\n` +
    `// Refactoring progress: ${percent}%\n\n`;

  const tsContent =
    headerComment +
    `import type { Config } from "./_types";\n\n` +
    `export const config: Config = ${configObjectString};\n`;

  await saveConfigFile(configFile, tsContent);

  // 10) Вывод в консоль: статистика + дерево (с цветами внутри stringifyErrorTree).
  console.log("Refactoring stats:");
  console.log(`  Total files: ${totalFiles}`);
  console.log(`  OK files:    ${okFiles}`);
  console.log(`  ERROR files: ${errorFiles}`);
  console.log(`  Progress:    ${percent}%`);
  console.log("\nTree (ok/error/ignore):\n");
  console.log(stringifyErrorTree(errorTree));
}
