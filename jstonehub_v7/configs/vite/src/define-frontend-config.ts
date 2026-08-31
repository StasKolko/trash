import type {
  ConfigEnv,
  Plugin,
  PluginOption,
  ResolvedConfig,
  UserConfig,
} from "vite";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { createFilter, defineConfig, normalizePath } from "vite";
import solidPlugin from "vite-plugin-solid";

type FrontendConfig = {
  port: number;
  routesDir: string;
  aliases?: Record<string, string>;
};

function defineFrontendConfig(config: FrontendConfig) {
  return defineConfig((env: ConfigEnv) => createViteConfig(config, env));
}

function createViteConfig(config: FrontendConfig, env: ConfigEnv): UserConfig {
  const { port, aliases } = config;
  const { mode } = env;

  return {
    plugins: createPlugins(config, mode),
    resolve: {
      alias: aliases ?? {},
    },
    server: {
      port,
      host: "0.0.0.0",
      strictPort: true,
    },
    preview: {
      port,
      host: "0.0.0.0",
      strictPort: true,
    },
    optimizeDeps: {
      exclude: ["react", "react-dom", "react/jsx-dev-runtime"],
    },
  };
}

function createPlugins(config: FrontendConfig, mode: string): PluginOption[] {
  const isProduction = mode === "production";
  return [
    vitePluginRemoveTestIds(),
    !isProduction && devtools(),
    tanstackRouter({
      target: "solid",
      autoCodeSplitting: true,
      routesDirectory: config.routesDir,
    }),
    solidPlugin(),
    tailwindcss(),
  ].filter(Boolean);
}

// ============================================================================
// vite-plugin-remove-test-ids
// ============================================================================

const INCLUDE_PATTERN = /\.[tj]sx$/;

const EXCLUDE_PATTERNS = [
  "**/.husky/**",
  "**/.qodo/**",
  "**/.turbo/**",
  "**/.tanstack/**",
  "**/.vscode/**",
  "**/_test/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/drizzle/**",
  "**/coverage/**",
  "**/docs/**",
  "**/context/**",
  "**/prompts/**",
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
];

const JSX_TESTID_PATTERNS: RegExp[] = [
  /\s+data-testid=["'][^"']*["']/g,
  /\s+data-testid=\{(?:[^{}]|\{[^{}]*\})*\}/g,
];

function removeTestIds(code: string): string {
  let result = code;
  for (const pattern of JSX_TESTID_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result;
}

function vitePluginRemoveTestIds(): Plugin {
  let filter: (id: string) => boolean;
  let isProduction = false;

  return {
    name: "vite-plugin-remove-test-ids",
    apply: "build",
    enforce: "pre",

    configResolved(config: ResolvedConfig) {
      isProduction = config.mode === "production";
      filter = createFilter(INCLUDE_PATTERN, EXCLUDE_PATTERNS);
    },

    transform(code: string, id: string) {
      if (!isProduction) {
        return null;
      }

      const normalizedId = normalizePath(id);

      if (!filter(normalizedId)) {
        return null;
      }

      if (!code.includes("data-testid")) {
        return null;
      }

      const transformedCode = removeTestIds(code);

      if (transformedCode === code) {
        return null;
      }

      return {
        code: transformedCode,
        map: null,
      };
    },
  };
}

export { defineFrontendConfig };
