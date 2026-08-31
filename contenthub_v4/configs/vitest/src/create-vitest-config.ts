import type { ViteUserConfig } from "vitest/config";

import solid from "vite-plugin-solid";
import { defineConfig, mergeConfig } from "vitest/config";

type TestEnvironment = "node" | "edge-runtime" | "happy-dom" | "jsdom";

type CreateConfigOptions = {
  environment: TestEnvironment;
  plugins?: ViteUserConfig["plugins"];
};

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
      perFile: true,
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    exclude: [
      "**/*.test.{ts,tsx}",
      "**/*.d.ts",
      "**/_type.ts",
      "**/type.ts",
      "**/*.type.ts",
      "**/index.ts",
    ],
  },
};

const createEdgeConfig = (overrides?: ViteUserConfig) =>
  createConfig({ environment: "edge-runtime" }, overrides);

const createBackendConfig = (overrides?: ViteUserConfig) =>
  createConfig({ environment: "node" }, overrides);

const createHappyDomConfig = (overrides?: ViteUserConfig) =>
  createConfig({ environment: "happy-dom" }, overrides);

const createFrontendConfig = (overrides?: ViteUserConfig) =>
  createConfig(
    { environment: "happy-dom", plugins: [solid({ hot: false })] },
    overrides,
  );

function createConfig(
  { environment, plugins = [] }: CreateConfigOptions,
  overrides?: ViteUserConfig,
) {
  const base = defineConfig({
    plugins,
    test: {
      ...baseTestConfig,
      environment,
    },
  });

  return withOverrides(base, overrides);
}

function withOverrides(base: ViteUserConfig, overrides?: ViteUserConfig) {
  if (!overrides) {
    return base;
  }
  return mergeConfig(base, defineConfig(overrides));
}

export {
  createBackendConfig,
  createEdgeConfig,
  createFrontendConfig,
  createHappyDomConfig,
};
