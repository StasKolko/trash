import { createBackendConfig } from "@configs/vitest";

export default createBackendConfig({
  test: {
    coverage: {
      exclude: ["src/_cache.ts"],
    },
  },
});
