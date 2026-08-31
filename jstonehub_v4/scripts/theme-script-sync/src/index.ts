import { join } from "node:path";
import { findProjectRoot } from "@scripts/util/path";

import { syncThemeScript } from "./main";

const rootDir = findProjectRoot();

syncThemeScript({
  rootDir,
  themeConstantPath: join(rootDir, "packages/ui/src/theme/_theme.constant.ts"),
  cacheFilePath: join(rootDir, "scripts/theme-script-sync/src/cache.ts"),
});
