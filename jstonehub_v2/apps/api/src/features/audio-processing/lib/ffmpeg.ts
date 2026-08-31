import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import type { ProcessingSettings } from "../data/types";

type FfmpegResult = {
  outputPath: string;
  duration: number;
  size: number;
};

const DEFAULT_AUDIO_BITRATE = 192_000;
const DURATION_REGEX = /Duration: (\d{2}):(\d{2}):(\d{2})/;
const TIME_PROGRESS_REGEX = /time=(\d{2}):(\d{2}):(\d{2})/;
const NUMERIC_EXTRACT_REGEX = /\d+/;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const PERCENT_MULTIPLIER = 100;
const MAX_PROGRESS_BEFORE_COMPLETE = 99;

function parseTimeToSeconds(
  match: RegExpMatchArray,
  startIndex: number,
): number {
  const hours = Number.parseInt(match[startIndex] ?? "0", 10);
  const minutes = Number.parseInt(match[startIndex + 1] ?? "0", 10);
  const seconds = Number.parseInt(match[startIndex + 2] ?? "0", 10);
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

function generateSilence(outputPath: string, duration: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-f",
      "lavfi",
      "-i",
      "anullsrc=r=44100:cl=mono",
      "-t",
      String(duration),
      "-y",
      outputPath,
    ]);

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("Failed to generate silence"));
      }
    });
    proc.on("error", reject);
  });
}

export function checkFfmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"]);
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

export function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    proc.stdout.on("data", (data) => {
      output += data;
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(Number.parseFloat(output.trim()) || 0);
      } else {
        reject(new Error("Failed to get audio duration"));
      }
    });
    proc.on("error", reject);
  });
}

export function getAudioBitrate(filePath: string): Promise<number> {
  return new Promise((resolve, _) => {
    const proc = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=bit_rate",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    proc.stdout.on("data", (data) => {
      output += data;
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(Number.parseInt(output.trim(), 10) || DEFAULT_AUDIO_BITRATE);
      } else {
        resolve(DEFAULT_AUDIO_BITRATE);
      }
    });
    proc.on("error", () => resolve(DEFAULT_AUDIO_BITRATE));
  });
}

export function removeSilence(
  inputPath: string,
  outputPath: string,
  settings: ProcessingSettings,
): Promise<void> {
  const silenceFilter = [
    "silenceremove=",
    "start_periods=1:",
    "start_duration=0:",
    `start_threshold=${settings.silenceThreshold}dB:`,
    "stop_periods=-1:",
    `stop_duration=${settings.minSilenceDuration}:`,
    `stop_threshold=${settings.silenceThreshold}dB`,
  ].join("");

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-i",
      inputPath,
      "-af",
      silenceFilter,
      "-y",
      outputPath,
    ]);

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg silence removal failed with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

export async function concatenateAudioFiles(
  inputFiles: string[],
  outputPath: string,
  settings: ProcessingSettings,
  onProgress?: (progress: number) => void,
): Promise<FfmpegResult> {
  const listPath = `${outputPath}.txt`;
  const silencePath = `${outputPath}.silence.wav`;

  await generateSilence(
    silencePath,
    Math.max(
      settings.pauseBetweenFiles,
      settings.pauseAtStart,
      settings.pauseAtEnd,
    ),
  );

  const listContent: string[] = [];

  if (settings.pauseAtStart > 0) {
    listContent.push(`file '${silencePath}'`);
    listContent.push("inpoint 0");
    listContent.push(`outpoint ${settings.pauseAtStart}`);
  }

  for (let i = 0; i < inputFiles.length; i++) {
    listContent.push(`file '${inputFiles[i]}'`);

    if (i < inputFiles.length - 1 && settings.pauseBetweenFiles > 0) {
      listContent.push(`file '${silencePath}'`);
      listContent.push("inpoint 0");
      listContent.push(`outpoint ${settings.pauseBetweenFiles}`);
    }
  }

  if (settings.pauseAtEnd > 0) {
    listContent.push(`file '${silencePath}'`);
    listContent.push("inpoint 0");
    listContent.push(`outpoint ${settings.pauseAtEnd}`);
  }

  await fs.writeFile(listPath, listContent.join("\n"));

  const outputFormat = settings.outputFormat;
  const codecArgs =
    outputFormat === "mp3"
      ? ["-c:a", "libmp3lame", "-q:a", "2"]
      : ["-c:a", "pcm_s16le"];

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      ...codecArgs,
      "-y",
      outputPath,
    ]);

    let totalDuration = 0;
    let currentTime = 0;

    proc.stderr.on("data", (data: Buffer) => {
      const output = data.toString();

      const durationMatch = output.match(DURATION_REGEX);
      if (durationMatch) {
        totalDuration = parseTimeToSeconds(durationMatch, 1);
      }

      const timeMatch = output.match(TIME_PROGRESS_REGEX);
      if (timeMatch && totalDuration > 0) {
        currentTime = parseTimeToSeconds(timeMatch, 1);
        const progress = Math.round(
          (currentTime / totalDuration) * PERCENT_MULTIPLIER,
        );
        onProgress?.(Math.min(progress, MAX_PROGRESS_BEFORE_COMPLETE));
      }
    });

    proc.on("close", async (code) => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: REFACTOR_LATER <WAITING_FOR_LOGGER> intentional ignore on temp file cleanup
      await fs.unlink(listPath).catch(() => {});
      // biome-ignore lint/suspicious/noEmptyBlockStatements: REFACTOR_LATER <WAITING_FOR_LOGGER> intentional ignore on temp file cleanup
      await fs.unlink(silencePath).catch(() => {});

      if (code === 0) {
        const stats = await fs.stat(outputPath);
        const duration = await getAudioDuration(outputPath);
        resolve({
          outputPath,
          duration,
          size: stats.size,
        });
      } else {
        reject(new Error(`FFmpeg concat failed with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

export function sortFilesNaturally(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const aNum = Number.parseInt(
      path.basename(a).match(NUMERIC_EXTRACT_REGEX)?.[0] ?? "0",
      10,
    );
    const bNum = Number.parseInt(
      path.basename(b).match(NUMERIC_EXTRACT_REGEX)?.[0] ?? "0",
      10,
    );
    return aNum - bNum;
  });
}
