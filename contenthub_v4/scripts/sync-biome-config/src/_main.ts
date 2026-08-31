import type { SyncBiomeConfigInput } from "./_type";

import { join } from "node:path";

import { getConfig, initConfig } from "./_config";

const PACKAGE_JSON = "package.json";

function syncBiomeConfig(input: SyncBiomeConfigInput) {
  initConfig(input);

  const _rootPackageContent = readRootPackageFile();
}

function readRootPackageFile() {
  const { rootDirPath } = getConfig();
  const rootPackagePath = join(rootDirPath, PACKAGE_JSON);
  return Bun.file(rootPackagePath).text();
}

export { syncBiomeConfig };
