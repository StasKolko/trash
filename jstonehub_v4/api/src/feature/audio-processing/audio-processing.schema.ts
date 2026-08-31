import {
  AUDIO_OUTPUT_BITRATES,
  AUDIO_OUTPUT_FORMATS,
  AUDIO_PROCESSING_LIMITS,
} from "@packages/contract/audio-processing";
import { Type } from "typebox";
import { Compile } from "typebox/compile";

const L = AUDIO_PROCESSING_LIMITS;

const audioProcessingConfigSchema = Type.Object({
  silenceRemoval: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      thresholdDb: Type.Optional(
        Type.Number({
          minimum: L.silenceRemoval.thresholdDb.min,
          maximum: L.silenceRemoval.thresholdDb.max,
        }),
      ),
      minDurationMs: Type.Optional(
        Type.Integer({
          minimum: L.silenceRemoval.minDurationMs.min,
          maximum: L.silenceRemoval.minDurationMs.max,
        }),
      ),
      keepGapMs: Type.Optional(
        Type.Integer({
          minimum: L.silenceRemoval.keepGapMs.min,
          maximum: L.silenceRemoval.keepGapMs.max,
        }),
      ),
    }),
  ),
  normalization: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      targetLufs: Type.Optional(
        Type.Number({
          minimum: L.normalization.targetLufs.min,
          maximum: L.normalization.targetLufs.max,
        }),
      ),
      truePeakDb: Type.Optional(
        Type.Number({
          minimum: L.normalization.truePeakDb.min,
          maximum: L.normalization.truePeakDb.max,
        }),
      ),
    }),
  ),
  highPassFilter: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      frequencyHz: Type.Optional(
        Type.Integer({
          minimum: L.highPassFilter.frequencyHz.min,
          maximum: L.highPassFilter.frequencyHz.max,
        }),
      ),
    }),
  ),
  limiter: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      limitDb: Type.Optional(
        Type.Number({
          minimum: L.limiter.limitDb.min,
          maximum: L.limiter.limitDb.max,
        }),
      ),
    }),
  ),
  fade: Type.Optional(
    Type.Object({
      inMs: Type.Optional(
        Type.Integer({
          minimum: L.fade.inMs.min,
          maximum: L.fade.inMs.max,
        }),
      ),
      outMs: Type.Optional(
        Type.Integer({
          minimum: L.fade.outMs.min,
          maximum: L.fade.outMs.max,
        }),
      ),
    }),
  ),
  gaps: Type.Optional(
    Type.Object({
      innerMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.innerMs.min,
          maximum: L.gaps.innerMs.max,
        }),
      ),
      betweenMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.betweenMs.min,
          maximum: L.gaps.betweenMs.max,
        }),
      ),
      startMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.startMs.min,
          maximum: L.gaps.startMs.max,
        }),
      ),
      endMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.endMs.min,
          maximum: L.gaps.endMs.max,
        }),
      ),
    }),
  ),
  concatenation: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
    }),
  ),
  output: Type.Optional(
    Type.Object({
      format: Type.Optional(
        Type.Union(AUDIO_OUTPUT_FORMATS.map((f) => Type.Literal(f))),
      ),
      bitrate: Type.Optional(
        Type.Union(AUDIO_OUTPUT_BITRATES.map((b) => Type.Literal(b))),
      ),
      sampleRate: Type.Optional(
        Type.Integer({
          minimum: L.output.sampleRate.min,
          maximum: L.output.sampleRate.max,
        }),
      ),
    }),
  ),
});

export const audioProcessingConfigValidator = Compile(
  audioProcessingConfigSchema,
);
