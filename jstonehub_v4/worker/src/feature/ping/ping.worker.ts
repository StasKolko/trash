import { registerWorker } from "#worker/shared/queue/registry";

import { processPing } from "./ping.processor";

export function registerPingWorker(): void {
  registerWorker("ping", processPing);
}
