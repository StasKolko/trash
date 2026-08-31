import type { PingJobData, PingJobResult } from "@packages/contract/queue";

const startTime = Date.now();

function processPing(data: PingJobData): PingJobResult {
  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `🏓 Ping received: "${data.message}" (sent at ${data.timestamp})`,
  );

  return {
    echo: data.message,
    processedAt: Date.now(),
    workerUptime: Date.now() - startTime,
  };
}

export { processPing };
