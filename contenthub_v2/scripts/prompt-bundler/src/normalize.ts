import type { BundlerConfig, NormalizedConfig, NormalizedTarget } from "./type";

import {
  BUILTIN_EXCLUDES,
  BYTES_PER_KB,
  MAX_FILE_SIZE_KB_DEFAULT,
} from "./constant";

function normalizeConfig(config: BundlerConfig): NormalizedConfig {
  const globalIncludes = config.includes ?? [];
  const globalExcludes = config.excludes ?? [];

  const targets = config.targets
    .filter((t) => t.isActive)
    .map((target) => normalizeTarget(target, globalIncludes, globalExcludes));

  return {
    cleanOutputDir: config.cleanOutputDir ?? true,
    maxFileSize:
      (config.maxFileSizeKb ?? MAX_FILE_SIZE_KB_DEFAULT) * BYTES_PER_KB,
    targets,
  };
}

function normalizeTarget(
  target: { name: string; includes?: string[]; excludes?: string[] },
  globalIncludes: string[],
  globalExcludes: string[],
): NormalizedTarget {
  return {
    name: target.name,
    includes: [...globalIncludes, ...(target.includes ?? [])],
    excludes: [
      ...BUILTIN_EXCLUDES,
      ...globalExcludes,
      ...(target.excludes ?? []),
    ],
  };
}

export { normalizeConfig };
