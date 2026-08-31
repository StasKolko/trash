const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 300;

async function downloadToBuffer(
  url: string,
  headers: Record<string, string>,
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: sequential retries are intentional — each attempt must complete before deciding to retry
      const response = await fetch(url, { headers });

      if (response.status < HTTP_OK_MIN || response.status >= HTTP_OK_MAX) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.warn(
        `⚠️ [download] Attempt ${attempt}/${MAX_RETRIES} failed: ${lastError.message}`,
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error("Download failed after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { downloadToBuffer };
