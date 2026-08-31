import { MS_IN_SECOND } from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";

type SilenceSegment = { start: number; end: number };
type VoicedSegment = { start: number; end: number };

type DetectSilenceParams = {
  inputPath: string;
  thresholdDb: number;
  minDurationMs: number;
  highPassHz: number | null;
};

const VOICED_SEGMENT_MIN_SEC = 0.01;
const SILENCE_START_REGEX = /silence_start:\s*([\d.]+)/g;
const SILENCE_END_REGEX = /silence_end:\s*([\d.]+)/g;

async function detectSilence(
  params: DetectSilenceParams,
): Promise<SilenceSegment[]> {
  const minDurationSec = params.minDurationMs / MS_IN_SECOND;

  const filters: string[] = [];
  if (params.highPassHz !== null) {
    filters.push(`highpass=f=${params.highPassHz}`);
  }
  filters.push(
    `silencedetect=noise=${params.thresholdDb}dB:d=${minDurationSec}`,
  );

  const stderr = await runFfmpeg([
    "-i",
    params.inputPath,
    "-af",
    filters.join(","),
    "-f",
    "null",
    "-",
  ]);

  return parseSilenceDetectOutput(stderr);
}

function parseSilenceDetectOutput(stderr: string): SilenceSegment[] {
  const starts = collectMatches(SILENCE_START_REGEX, stderr);
  const ends = collectMatches(SILENCE_END_REGEX, stderr);

  const segments: SilenceSegment[] = [];
  const count = Math.min(starts.length, ends.length);

  for (let i = 0; i < count; i++) {
    const start = starts[i];
    const end = ends[i];
    if (start !== undefined && end !== undefined) {
      segments.push({ start, end });
    }
  }

  if (starts.length > ends.length) {
    const lastStart = starts.at(-1);
    if (lastStart !== undefined) {
      segments.push({ start: lastStart, end: Number.POSITIVE_INFINITY });
    }
  }

  return segments;
}

function collectMatches(regex: RegExp, text: string): number[] {
  const results: number[] = [];
  regex.lastIndex = 0;

  let match = regex.exec(text);
  while (match !== null) {
    const value = match[1];
    if (value !== undefined) {
      results.push(Number.parseFloat(value));
    }
    match = regex.exec(text);
  }

  return results;
}

function getVoicedSegments(
  silenceSegments: SilenceSegment[],
  totalDuration: number,
): VoicedSegment[] {
  if (silenceSegments.length === 0) {
    return [{ start: 0, end: totalDuration }];
  }

  const voiced: VoicedSegment[] = [];
  let cursor = 0;

  for (const silence of silenceSegments) {
    if (silence.start > cursor) {
      voiced.push({ start: cursor, end: silence.start });
    }
    cursor = silence.end;
  }

  if (cursor < totalDuration) {
    voiced.push({ start: cursor, end: totalDuration });
  }

  return voiced.filter((s) => s.end - s.start > VOICED_SEGMENT_MIN_SEC);
}

export type { DetectSilenceParams, SilenceSegment, VoicedSegment };
export { detectSilence, getVoicedSegments };
