import { Target } from "../scripts/context-builder/src/types";

export const targets: Target[] = [
  {
    name: "core",
    isActive: true,
    includes: ['./'],
    ignoreFiles: [".prettierignore", "tsconfig.json", ".gitattributes", "eslint.config.js", ".dockerignore", ".gitignore"],
    ignoreFolders: ["configs", "project-cleaner", ".github"],
  }
]