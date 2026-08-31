import type { Plugin, ViteUserConfig } from "vitest/config";

import solid from "vite-plugin-solid";
import { defineConfig, mergeConfig } from "vitest/config";

const baseTestConfig: ViteUserConfig["test"] = {
  globals: true,
  passWithNoTests: true,
  coverage: {
    provider: "v8",
    enabled: false,
    reportsDirectory: "./coverage",
    include: ["src/**/*.{ts,tsx}"],
    thresholds: {
      autoUpdate: false,
      perFile: false,
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    exclude: [
      // FILES
      "**/*.test.{ts,tsx}",
      "**/*.d.ts",
      "**/type.ts",
      "**/*.type.ts",
      "**/index.ts",

      // Entry points
      "src/app/**",
      "**/env.ts",

      // FRONTEND
      "src/routeTree.gen.ts",
      "**/query-client.ts",

      // API client (used only as type import at runtime)
      "**/api/client.ts",

      // Database
      "**/*.table.ts",
      "**/db/instance.ts",
      "**/db/migrate.ts",
      "**/db/schema.ts",
    ],
  },
};

export function createHappyDomConfig(overrides?: ViteUserConfig) {
  const base = defineConfig({
    test: {
      ...baseTestConfig,
      environment: "happy-dom",
    },
  });

  if (!overrides) {
    return base;
  }

  return mergeConfig(base, defineConfig(overrides));
}
export function createFrontendConfig(overrides?: ViteUserConfig) {
  const base = defineConfig({
    plugins: [
      solid({
        hot: false,
      }) as Plugin,
    ],
    test: {
      ...baseTestConfig,
      environment: "happy-dom",
    },
  });

  if (!overrides) {
    return base;
  }

  return mergeConfig(base, defineConfig(overrides));
}

export function createBackendConfig(overrides?: ViteUserConfig) {
  const base = defineConfig({
    test: {
      ...baseTestConfig,
      environment: "node",
    },
  });

  if (!overrides) {
    return base;
  }

  return mergeConfig(base, defineConfig(overrides));
}
