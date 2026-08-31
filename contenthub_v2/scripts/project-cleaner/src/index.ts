import { join } from "node:path";
import { findProjectRoot } from "@packages/util-backend/fs";

import { cleanProject } from "./main";

const rootDir = findProjectRoot();

cleanProject({
  rootDir,
  configPath: join(rootDir, "scripts/project-cleaner/src/cleaner.config.ts"),
});
