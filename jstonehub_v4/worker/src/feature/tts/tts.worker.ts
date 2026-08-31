import { registerWorker } from "#worker/shared/queue/registry";

import { processTts } from "./tts.processor";

const TTS_CONCURRENCY = 2;

function registerTtsWorker(): void {
  registerWorker("tts", processTts, { concurrency: TTS_CONCURRENCY });
}

export { registerTtsWorker };
