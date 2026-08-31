import type { SyncBiomeConfigInput } from "./_type";

import { join } from "node:path";

import { getConfig } from "./_config";

const PACKAGE_JSON = "package.json";
const BIOME_JSON = "biome.json";

async function readSources({
  rootDir,
  configsWorkspace,
}: SyncBiomeConfigInput) {
  const biomePath = join(rootDir, BIOME_JSON);
  const rootPackagePath = join(rootDir, PACKAGE_JSON);
  const configsPackagePath = join(rootDir, configsWorkspace.dir, PACKAGE_JSON);

  const [rootPackage, configsPackage, biome] = await Promise.all([
    Bun.file(biomePath).text(),
    Bun.file(rootPackagePath).text(),
    Bun.file(configsPackagePath).text(),
  ]);

  return { rootPackage, configsPackage, biome };
}

function _getRootPackagePath() {
  const { rootDir } = getConfig();
  return join(rootDir, PACKAGE_JSON);
}

export { readSources };
