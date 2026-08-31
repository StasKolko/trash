import type { Config } from "./_types";

export const config: Config = {
  ".git": "ignore",
  ".github": "error",
  ".husky": "ignore",
  ".next": "ignore",
  ".qodo": "ignore",
  context: "error",
  node_modules: "ignore",
  scripts: "error",
  src: {
    app: {
      _styles: "ok",
      _types: "ok",
      "layout.tsx": "error",
      "page.tsx": "error",
    },
  },
  ".gitattributes": "ok",
  ".gitignore": "ok",
  "biome.json": "ok",
  "bun.lock": "ignore",
  "next-env.d.ts": "ok",
  "next.config.ts": "ok",
  "package.json": "ok",
  "postcss.config.mjs": "ok",
  "tsconfig.json": "ok",
  "tsconfig.tsbuildinfo": "ignore",
} as const;
