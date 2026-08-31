import type { CleanConfig, NormalizedConfig } from "./type";

import picomatch from "picomatch";

import { BUILTIN_EXCLUDES } from "./constant";

function normalizeConfig(config: CleanConfig): NormalizedConfig {
  validateIncludes(config.includes);

  const includeMatcher = picomatch(config.includes);
  const allExcludes = [...BUILTIN_EXCLUDES, ...(config.excludes ?? [])];
  const excludeMatcher = picomatch(allExcludes);

  return {
    rootDir: config.rootDir,
    includeMatcher,
    excludeMatcher,
    dryRun: config.dryRun ?? false,
  };
}

function validateIncludes(includes: string[]): void {
  if (!includes || includes.length === 0) {
    throw new Error("Config 'includes' must have at least one pattern");
  }
}

function shouldDelete(relativePath: string, config: NormalizedConfig): boolean {
  if (config.excludeMatcher(relativePath)) {
    return false;
  }

  return config.includeMatcher(relativePath);
}

function shouldSkip(relativePath: string, config: NormalizedConfig): boolean {
  return config.excludeMatcher(relativePath);
}

export { normalizeConfig, shouldDelete, shouldSkip };
