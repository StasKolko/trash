import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createBackendConfig } from "@configs/vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default createBackendConfig({
  resolve: {
    alias: {
      "#worker": resolve(__dirname, "./src"),
    },
  },
});
