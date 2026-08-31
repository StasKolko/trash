import { spawn } from "node:child_process";

import { FFMPEG_TIMEOUT_MS } from "./_constant";

const FFMPEG_BINARY = "ffmpeg";
const FFPROBE_BINARY = "ffprobe";

function runFfmpeg(args: string[]): Promise<string> {
  return spawnProcess(FFMPEG_BINARY, args);
}

function runFfprobe(args: string[]): Promise<string> {
  return spawnProcess(FFPROBE_BINARY, args);
}

function spawnProcess(binary: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const stderrChunks: string[] = [];
    const stdoutChunks: string[] = [];

    const proc = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"] });

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
      reject(new Error(`${binary} timed out after ${FFMPEG_TIMEOUT_MS}ms`));
    }, FFMPEG_TIMEOUT_MS);

    proc.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk.toString());
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk.toString());
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);

      if (timedOut) {
        return;
      }

      const stderr = stderrChunks.join("");
      const stdout = stdoutChunks.join("");

      if (code !== 0) {
        reject(new Error(`${binary} exited with code ${code}: ${stderr}`));
        return;
      }

      resolve(stdout || stderr);
    });

    proc.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to spawn ${binary}: ${error.message}`));
    });
  });
}

export { runFfmpeg, runFfprobe };
