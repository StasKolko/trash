import { ttsProjectService } from "./tts-project.service";

const TTS_OUTPUT_KEY_REGEX = /^tmp\/tts\/([^/]+)\//;

async function handleTtsJobCompleted(outputKey: string): Promise<void> {
  const projectId = extractProjectIdFromKey(outputKey);
  if (!projectId) {
    return;
  }

  await ttsProjectService.handleSegmentCompleted(projectId, outputKey);
}

async function handleTtsJobFailed(
  outputKey: string,
  error: string,
): Promise<void> {
  const projectId = extractProjectIdFromKey(outputKey);
  if (!projectId) {
    return;
  }

  await ttsProjectService.handleSegmentFailed(projectId, outputKey, error);
}

function extractProjectIdFromKey(key: string): string | null {
  const match = key.match(TTS_OUTPUT_KEY_REGEX);
  return match?.[1] ?? null;
}

export { handleTtsJobCompleted, handleTtsJobFailed };
