import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import {
  MS_IN_SECOND,
  SEGMENT_OVERLAP_SEC,
  SPLICE_CROSSFADE_SEC,
} from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";
import { getFileDurationSec } from "./_fs";
import { detectSilence, getVoicedSegments } from "./_silence-detect";

type Segment = { start: number; end: number };

type SpliceParams = {
  inputPath: string;
  outputPath: string;
  segments: Segment[];
  innerGapSec: number;
  sampleRate: number;
  totalDuration: number;
};

async function removeSilence(
  inputPath: string,
  outputPath: string,
  config: AudioProcessingConfig,
): Promise<string> {
  if (!config.silenceRemoval.enabled) {
    return inputPath;
  }

  const { thresholdDb, minDurationMs, keepGapMs } = config.silenceRemoval;
  const highPassHz = config.highPassFilter.enabled
    ? config.highPassFilter.frequencyHz
    : null;

  const totalDuration = await getFileDurationSec(inputPath);
  if (totalDuration <= 0) {
    return inputPath;
  }

  const silenceSegments = await detectSilence({
    inputPath,
    thresholdDb,
    minDurationMs,
    highPassHz,
  });

  if (silenceSegments.length === 0) {
    return inputPath;
  }

  const voicedSegments = getVoicedSegments(silenceSegments, totalDuration);

  if (voicedSegments.length === 0) {
    return inputPath;
  }

  if (voicedSegments.length === 1) {
    const segment = voicedSegments[0];
    if (segment) {
      await trimSingleSegment(inputPath, outputPath, segment);
      return outputPath;
    }
    return inputPath;
  }

  await spliceSegments({
    inputPath,
    outputPath,
    segments: voicedSegments,
    innerGapSec: keepGapMs / MS_IN_SECOND,
    sampleRate: config.output.sampleRate,
    totalDuration,
  });
  return outputPath;
}

async function trimSingleSegment(
  inputPath: string,
  outputPath: string,
  segment: Segment,
): Promise<void> {
  await runFfmpeg([
    "-i",
    inputPath,
    "-ss",
    String(segment.start),
    "-to",
    String(segment.end),
    "-c:a",
    "pcm_s16le",
    "-y",
    outputPath,
  ]);
}

async function spliceSegments(params: SpliceParams): Promise<void> {
  const {
    inputPath,
    outputPath,
    segments,
    innerGapSec,
    sampleRate,
    totalDuration,
  } = params;

  // Extend each segment by overlap amount on both sides (clamped to file bounds).
  // The overlap regions contain real audio from the original file,
  // giving acrossfade actual waveform data to blend instead of hard cuts.
  const extended = segments.map((seg) => ({
    start: Math.max(0, seg.start - SEGMENT_OVERLAP_SEC),
    end: Math.min(totalDuration, seg.end + SEGMENT_OVERLAP_SEC),
  }));

  const filterParts = buildTrimFilters(extended);
  const crossfadeFilters =
    innerGapSec <= 0
      ? buildDirectCrossfades(extended.length)
      : buildGappedCrossfades(extended.length, innerGapSec, sampleRate);
  filterParts.push(...crossfadeFilters);

  await runFfmpeg([
    "-i",
    inputPath,
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    "[out]",
    "-c:a",
    "pcm_s16le",
    "-y",
    outputPath,
  ]);
}

function buildTrimFilters(extended: Segment[]): string[] {
  return extended.map(
    (seg, i) =>
      `[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[seg${i}]`,
  );
}

function buildDirectCrossfades(count: number): string[] {
  const filters: string[] = [];
  const cf = SPLICE_CROSSFADE_SEC;
  let currentLabel = "seg0";

  for (let i = 1; i < count; i++) {
    const outLabel = i === count - 1 ? "out" : `tmp${i}`;
    filters.push(
      `[${currentLabel}][seg${i}]acrossfade=d=${cf}:c1=tri:c2=tri[${outLabel}]`,
    );
    currentLabel = outLabel;
  }

  return filters;
}

function buildGappedCrossfades(
  count: number,
  innerGapSec: number,
  sampleRate: number,
): string[] {
  const filters: string[] = [];
  const cf = SPLICE_CROSSFADE_SEC;
  const totalGap = innerGapSec + cf * 2;
  let currentLabel = "seg0";

  for (let i = 1; i < count; i++) {
    const outLabel = i === count - 1 ? "out" : `tmp${i}`;
    filters.push(
      `aevalsrc=0:d=${totalGap}:s=${sampleRate}:c=stereo[gap${i}]`,
      `[${currentLabel}][gap${i}]acrossfade=d=${cf}:c1=tri:c2=tri[bg${i}]`,
      `[bg${i}][seg${i}]acrossfade=d=${cf}:c1=tri:c2=tri[${outLabel}]`,
    );
    currentLabel = outLabel;
  }

  return filters;
}

export { removeSilence };
