import type { BundlerConfig } from "./scripts/prompt-bundler/src/type";

export const config: BundlerConfig = {
  cleanOutputDir: true,
  maxFileSizeKb: 100,

  includes: [],
  excludes: ["**/context"],

  targets: [
    {
      name: "core",
      isActive: true,
      includes: [
        "apps/api",
        "packages/contract",
        "docs",
        "prompts/elysia",
      ],
      excludes: [
        "docs/roadmap/milestone-02-energy.md",
        "docs/roadmap/milestone-03-organizations.md",
        "docs/roadmap/milestone-04-admin.md",
        "docs/roadmap/milestone-05-audio.md"
      ],
    },
    {
      name: "test",
      isActive: false,
      includes: ["scripts"],
      excludes: [],
    },
  ],
};
