import type { CleanerConfig } from "./type";

export const config: CleanerConfig = {
  // Directories/files/extensions to NEVER touch (checked first).
  ignore: {
    dirs: [".git"],
    files: [],
    extensions: [],
  },

  // Directories/files/extensions to DELETE.
  remove: {
    dirs: ["node_modules", "dist", "build", "coverage", ".turbo", ".tanstack"],
    files: ["bun.lock"],
    extensions: [".log", ".tsbuildinfo"],
  },
};
