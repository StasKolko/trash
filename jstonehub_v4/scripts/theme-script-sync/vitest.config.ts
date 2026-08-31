import { createBackendConfig } from "@configs/vitest";

export default createBackendConfig({
  test: {
    coverage: {
      exclude: ["src/cache.ts"],
    },
  },
});
