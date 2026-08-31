import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

type BuildOutputArgsParams = {
  inputPath: string;
  outputPath: string;
  filterChain: string;
  config: AudioProcessingConfig;
};

function buildOutputArgs(params: BuildOutputArgsParams): string[] {
  const { inputPath, outputPath, filterChain, config } = params;
  const args = ["-i", inputPath];

  if (filterChain) {
    args.push("-af", filterChain);
  }

  args.push("-ar", String(config.output.sampleRate));
  addCodecArgs(args, config);
  args.push("-y", outputPath);

  return args;
}

function addCodecArgs(args: string[], config: AudioProcessingConfig): void {
  const { format, bitrate } = config.output;
  if (format === "mp3") {
    args.push("-codec:a", "libmp3lame", "-b:a", bitrate);
  } else if (format === "ogg") {
    args.push("-codec:a", "libvorbis", "-b:a", bitrate);
  } else if (format === "wav") {
    args.push("-codec:a", "pcm_s16le");
  }
}

export type { BuildOutputArgsParams };
export { buildOutputArgs };
