import type {
  BuildOptions,
  BuildResult,
  BundlerConfig,
  NormalizedTarget,
} from "./type";

import { readFile, stat } from "node:fs/promises";
import clipboardy from "clipboardy";
import { glob } from "tinyglobby";

import { BYTES_PER_KB } from "./constant";
import { normalizeConfig } from "./normalize";
import { cleanOutputDir, formatFileBlock, writeOutput } from "./output";
import { validateConfig, validateOptions } from "./validate";

async function buildBundle(options: BuildOptions) {
  await validateOptions(options);

  const config = await loadConfig(options.configPath);

  validateConfig(config);

  const normalized = normalizeConfig(config);

  if (normalized.cleanOutputDir) {
    await cleanOutputDir(options.outputDir);
  }

  const results = await processTargets(normalized, options);

  await printResults(results);

  return results;
}

async function loadConfig(configPath: string) {
  const configModule = await import(configPath);
  const config: BundlerConfig = configModule.config;

  if (!config) {
    throw new Error(`Config not found. Export 'config' from: ${configPath}`);
  }

  return config;
}

function processTargets(
  normalized: ReturnType<typeof normalizeConfig>,
  options: BuildOptions,
) {
  return Promise.all(
    normalized.targets.map((target) =>
      buildTarget({
        target,
        projectRoot: options.projectRoot,
        outputDir: options.outputDir,
        maxFileSize: normalized.maxFileSize,
      }),
    ),
  );
}

async function buildTarget(params: {
  target: NormalizedTarget;
  projectRoot: string;
  outputDir: string;
  maxFileSize: number;
}) {
  const { target, projectRoot, outputDir, maxFileSize } = params;

  const startTime = performance.now();

  const filePaths = await collectFilePaths(target, projectRoot);
  const blocks = await processFiles(filePaths, maxFileSize);

  const content = blocks.join("\n\n");
  const outputPath = await writeOutput({
    outputDir,
    name: target.name,
    content,
  });

  const elapsedMs = calcElapsedMs(startTime);

  return {
    name: target.name,
    fileCount: filePaths.length,
    charCount: content.length,
    elapsedMs,
    outputPath,
    content,
  };
}

async function printResults(results: BuildResult[]) {
  if (results.length === 1) {
    const singleResult = results[0] as BuildResult;
    await clipboardy.write(singleResult.content);
    console.log(formatResultLog(singleResult, true));
  } else {
    for (const result of results) {
      console.log(formatResultLog(result, false));
    }
  }
}

function collectFilePaths(target: NormalizedTarget, projectRoot: string) {
  return glob(target.includes, {
    cwd: projectRoot,
    absolute: true,
    onlyFiles: true,
    dot: true,
    expandDirectories: true,
    ignore: target.excludes,
  });
}

function processFiles(filePaths: string[], maxFileSize: number) {
  return Promise.all(
    filePaths.map(async (filePath) => {
      const content = await readFileChecked(filePath, maxFileSize);
      return formatFileBlock({ filePath, content });
    }),
  );
}

async function readFileChecked(absolutePath: string, maxFileSize: number) {
  const stats = await stat(absolutePath);

  if (stats.size > maxFileSize) {
    throw new Error(
      `File exceeds max size limit (${Math.round(maxFileSize / BYTES_PER_KB)}KB): ${absolutePath} (${Math.round(stats.size / BYTES_PER_KB)}KB)`,
    );
  }

  return readFile(absolutePath, "utf-8");
}

function formatResultLog(result: BuildResult, copied: boolean) {
  const files = formatNumber(result.fileCount);
  const chars = formatNumber(result.charCount);
  const stats = `${files} files, ${chars} chars, ${result.elapsedMs}ms`;

  if (copied) {
    return `✓ ${result.name} → clipboard (${stats})`;
  }

  return `✓ ${result.name} (${stats})`;
}

function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function calcElapsedMs(startTime: number) {
  return Math.round(performance.now() - startTime);
}

export { buildBundle };
