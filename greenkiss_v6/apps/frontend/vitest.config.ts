import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "istanbul",
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
        autoUpdate: true,
      },
      include: ["src/**/*"],
    },
  },
});
