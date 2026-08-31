import { registerWorker } from "#worker/shared/queue/registry";

import { processAudio } from "./audio-processing.processor";

function registerAudioProcessingWorker(): void {
  registerWorker("audio-processing", processAudio);
}

export { registerAudioProcessingWorker };
