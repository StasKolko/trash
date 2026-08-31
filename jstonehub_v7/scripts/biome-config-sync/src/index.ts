import { join } from "node:path";
import { findProjectRoot } from "@scripts/util/path";

import { biomeConfigSync } from "./main";

const rootDir = findProjectRoot();

biomeConfigSync({
  rootPackageJsonPath: join(rootDir, "package.json"),
  biomeJsonPath: join(rootDir, "biome.json"),
  configPackageDir: join(rootDir, "configs/biomejs"),
  cacheFilePath: join(rootDir, "scripts/biome-config-sync/src/cache.ts"),
});
