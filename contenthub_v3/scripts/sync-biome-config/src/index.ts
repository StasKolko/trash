import process from "node:process";

import { findProjectRoot } from "@packages/util-backend/fs";

import { syncBiomeConfig } from "./_sync-biome-config";

const FORCE_FLAG = "--force";
const force = process.argv.includes(FORCE_FLAG);
const rootDir = findProjectRoot();

await syncBiomeConfig({
  force,
  rootDir,
  biomePackageName: "@biomejs/biome",
  configsWorkspace: {
    dir: "configs/biomejs",
    srcDir: "src",
    dependencyValue: "workspace:*",
  },
  json: {
    lineEnding: "lf",
    indentStyle: "space",
    indentWidth: 2,
  },
});
