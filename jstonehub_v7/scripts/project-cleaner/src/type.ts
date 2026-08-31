type CleanConfig = {
  rootDir: string;
  includes: string[];
  excludes?: string[];
  dryRun?: boolean;
};

type NormalizedConfig = {
  rootDir: string;
  includeMatcher: (relativePath: string) => boolean;
  excludeMatcher: (relativePath: string) => boolean;
  dryRun: boolean;
};

type CleanStats = {
  deleted: string[];
  skipped: string[];
  errors: { path: string; error: string }[];
};

export type { CleanConfig, CleanStats, NormalizedConfig };
