import { resolve } from "node:path";
import { findProjectRoot } from "@scripts/util/path";

import { buildBundle } from "./main";

const projectRoot = findProjectRoot();

buildBundle({
  projectRoot,
  outputDir: resolve(projectRoot, "prompts/context"),
  configPath: resolve(projectRoot, "prompt-bundler.config.ts"),
});
