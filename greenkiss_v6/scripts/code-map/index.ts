import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codeMap } from "./_core/code-map";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

codeMap({
  paths: {
    rootDir: resolve(__dirname, "../../"),
    cacheFile: resolve(__dirname, "./_cache/index.ts"),
    configFile: resolve(__dirname, "./config.ts"),
  },
  ignoredExtensions: ["svg", "png", "webp", "jpg", "jpeg"],
});
