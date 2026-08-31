import { createFrontendConfig } from "@configs/vitest";

export default createFrontendConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      exclude: ["src/provider.tsx"],
    },
  },
});
