import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { parse } from "node:path";

import { MS_IN_SECOND, SUPPORTED_EXTENSIONS } from "./_constant";
import { runFfprobe } from "./_ffmpeg-runner";

function validateDirectories(inputDir: string, outputDir: string): void {
  if (!existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }
  mkdirSync(outputDir, { recursive: true });
}

function getInputFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => {
      const ext = parse(file).ext.toLowerCase();
      return SUPPORTED_EXTENSIONS.has(ext);
    })
    .sort();
}

function removeTempDir(tempDir: string): void {
  if (!existsSync(tempDir)) {
    return;
  }
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

async function getFileDurationSec(filePath: string): Promise<number> {
  if (!existsSync(filePath)) {
    return 0;
  }

  try {
    const output = await runFfprobe([
      "-v",
      "quiet",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    const seconds = Number.parseFloat(output.trim());
    return Number.isNaN(seconds) ? 0 : seconds;
  } catch {
    return 0;
  }
}

async function getFileDurationMs(filePath: string): Promise<number> {
  const sec = await getFileDurationSec(filePath);
  return Math.round(sec * MS_IN_SECOND);
}

async function getTotalDurationMs(files: string[]): Promise<number> {
  const durations = await Promise.all(files.map(getFileDurationMs));
  let total = 0;
  for (const d of durations) {
    total += d;
  }
  return total;
}

export {
  getFileDurationMs,
  getFileDurationSec,
  getInputFiles,
  getTotalDurationMs,
  removeTempDir,
  validateDirectories,
};
