type BundlerConfig = {
  cleanOutputDir?: boolean;
  maxFileSizeKb?: number;
  includes?: string[];
  excludes?: string[];
  targets: Target[];
};

type Target = {
  name: string;
  isActive: boolean;
  includes?: string[];
  excludes?: string[];
};

type NormalizedConfig = {
  cleanOutputDir: boolean;
  maxFileSize: number;
  targets: NormalizedTarget[];
};

type NormalizedTarget = {
  name: string;
  includes: string[];
  excludes: string[];
};

type BuildResult = {
  name: string;
  fileCount: number;
  charCount: number;
  elapsedMs: number;
  outputPath: string;
  content: string;
};

type BuildOptions = {
  projectRoot: string;
  outputDir: string;
  configPath: string;
};

export type {
  BuildOptions,
  BuildResult,
  BundlerConfig,
  NormalizedConfig,
  NormalizedTarget,
  Target,
};
