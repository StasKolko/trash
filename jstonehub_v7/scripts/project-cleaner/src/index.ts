import { findProjectRoot } from "@scripts/util/path";

import { cleanProject } from "./main";

cleanProject({
  rootDir: findProjectRoot(),
  includes: [
    "**/node_modules",
    "**/dist",
    "**/build",
    "**/coverage",
    "**/.turbo",
    "**/.tanstack",
    "**/bun.lock",
  ],
});
