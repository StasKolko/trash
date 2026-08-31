import type { BuildOptions, BundlerConfig } from "./type";

import { access, stat } from "node:fs/promises";

function validateConfig(config: BundlerConfig) {
  assertTargetsArray(config.targets);
  assertTargetsNotEmpty(config.targets);

  const activeTargets = config.targets.filter((t) => t.isActive);

  assertHasActiveTargets(activeTargets);
  assertUniqueNames(activeTargets);
  assertTargetsHaveIncludes(activeTargets, config.includes);
}

function assertTargetsArray(targets: unknown) {
  if (!Array.isArray(targets)) {
    throw new Error("Config must have a 'targets' array");
  }
}

function assertTargetsNotEmpty(targets: unknown[]) {
  if (targets.length === 0) {
    throw new Error("Config 'targets' array is empty");
  }
}

function assertHasActiveTargets(activeTargets: unknown[]) {
  if (activeTargets.length === 0) {
    throw new Error(
      "No active targets found. Set isActive: true on at least one target",
    );
  }
}

function assertUniqueNames(activeTargets: { name: string }[]) {
  const names = new Set<string>();

  for (const target of activeTargets) {
    if (!target.name || typeof target.name !== "string") {
      throw new Error("Each target must have a 'name' string property");
    }

    if (names.has(target.name)) {
      throw new Error(`Duplicate target name: ${target.name}`);
    }

    names.add(target.name);
  }
}

function assertTargetsHaveIncludes(
  activeTargets: { name: string; includes?: string[] }[],
  globalIncludes?: string[],
) {
  for (const target of activeTargets) {
    if (!(target.includes || globalIncludes)) {
      throw new Error(
        `Target '${target.name}' has no includes and no global includes defined`,
      );
    }
  }
}

async function validateOptions(options: BuildOptions) {
  await assertPathExists({
    absolutePath: options.configPath,
    errorMessage: `Config file not found: ${options.configPath}`,
  });

  await assertPathExists({
    absolutePath: options.outputDir,
    errorMessage: `Output directory not found: ${options.outputDir}. Please create it manually.`,
  });

  await assertIsDirectory({
    absolutePath: options.outputDir,
    errorMessage: `Output path is not a directory: ${options.outputDir}`,
  });
}

async function assertPathExists(params: {
  absolutePath: string;
  errorMessage: string;
}) {
  try {
    await access(params.absolutePath);
  } catch {
    throw new Error(params.errorMessage);
  }
}

async function assertIsDirectory(params: {
  absolutePath: string;
  errorMessage: string;
}) {
  const stats = await stat(params.absolutePath);
  if (!stats.isDirectory()) {
    throw new Error(params.errorMessage);
  }
}

export { validateConfig, validateOptions };
