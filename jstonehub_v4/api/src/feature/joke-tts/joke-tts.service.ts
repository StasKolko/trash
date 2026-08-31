import type { JokeTtsPipeline } from "./joke-tts.type";

import { STORAGE_PREFIXES } from "@packages/contract/storage";

import { jokeRepository } from "#api/feature/joke/joke.repository";
import { ttsProjectService } from "#api/feature/tts-project/tts-project.service";
import { storage } from "#api/shared/storage/storage";

import { jokeTtsRepository } from "./joke-tts.repository";

type StartPipelineParams = {
  jokeTranslationId: string;
  voiceConfig: Record<string, string>;
  isPlatformDefault?: boolean;
};

type StartPipelineResult = {
  pipelineId: string;
  status: string;
  ttsProjectId: string | null;
};

type PipelineWithDetails = JokeTtsPipeline & {
  audioDownloadUrl: string | null;
  ttsProject: unknown;
};

const DOWNLOAD_EXPIRY_SECONDS = 86_400;

async function startPipeline(
  params: StartPipelineParams,
): Promise<StartPipelineResult> {
  const pipeline = await jokeTtsRepository.create({
    jokeTranslationId: params.jokeTranslationId,
    voiceConfig: params.voiceConfig,
  });

  setImmediate(() => {
    executePipeline(pipeline.id, params).catch((err) => {
      // biome-ignore lint/suspicious/noConsole: background task error logging
      console.error(`[joke-tts] Pipeline ${pipeline.id} failed:`, err);
    });
  });

  return {
    pipelineId: pipeline.id,
    status: pipeline.status,
    ttsProjectId: null,
  };
}

async function executePipeline(
  pipelineId: string,
  params: StartPipelineParams,
): Promise<void> {
  try {
    await jokeTtsRepository.updateStatus(pipelineId, "creating_tasks");

    const translation = await findTranslationOrThrow(params.jokeTranslationId);
    const segments = buildTtsSegments(translation.segments, params.voiceConfig);

    const projectResult = await ttsProjectService.createProject({
      name: `joke-tts-${pipelineId}`,
      segments,
      audioProcessing: {
        enabled: true,
        concatenate: true,
        config: {},
      },
    });

    await jokeTtsRepository.updateStatus(pipelineId, "synthesizing", {
      ttsProjectId: projectResult.projectId,
    });

    await waitForProjectCompletion(projectResult.projectId, pipelineId);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    await jokeTtsRepository.updateStatus(pipelineId, "failed", {
      errorMessage: errorMsg,
    });
  }
}

async function findTranslationOrThrow(
  translationId: string,
): Promise<{ segments: { role: string; text: string }[] }> {
  const jokes = await jokeRepository.getAll({});
  for (const joke of jokes) {
    const translation = joke.translations.find((t) => t.id === translationId);
    if (translation) {
      return translation;
    }
  }
  throw new Error(`Translation ${translationId} not found`);
}

function buildTtsSegments(
  segments: { role: string; text: string }[],
  voiceConfig: Record<string, string>,
): { role: string; text: string; voiceId: string }[] {
  return segments.map((seg) => {
    const voiceId = voiceConfig[seg.role];
    if (!voiceId) {
      throw new Error(`No voice configured for role "${seg.role}"`);
    }
    return { role: seg.role, text: seg.text, voiceId };
  });
}

async function pollProjectStatus(
  projectId: string,
  ttsProjectRepository: {
    getById: (id: string) => Promise<{
      status: string;
      segments: { outputKey: string | null; status: string }[];
    } | null>;
  },
  pollIntervalMs: number,
): Promise<{
  status: string;
  segments: { outputKey: string | null; status: string }[];
}> {
  await sleep(pollIntervalMs);
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error(`TTS project ${projectId} not found`);
  }
  return project;
}

async function waitForProjectCompletion(
  projectId: string,
  pipelineId: string,
): Promise<void> {
  const { ttsProjectRepository } = await import(
    "#api/feature/tts-project/tts-project.repository"
  );

  const maxAttempts = 120;
  const pollIntervalMs = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // biome-ignore lint/performance/noAwaitInLoops: sequential polling — each iteration must wait before checking status
    const project = await pollProjectStatus(
      projectId,
      ttsProjectRepository,
      pollIntervalMs,
    );

    if (project.status === "completed") {
      await handleProjectCompleted(pipelineId, project);
      return;
    }

    if (project.status === "failed") {
      throw new Error("TTS synthesis failed");
    }

    if (project.status === "partial") {
      throw new Error("TTS synthesis partially failed");
    }
  }

  throw new Error("TTS synthesis timed out");
}

async function handleProjectCompleted(
  pipelineId: string,
  project: {
    id?: string;
    segments: { outputKey: string | null; status: string }[];
  },
): Promise<void> {
  await jokeTtsRepository.updateStatus(pipelineId, "processing_audio");

  const completedKeys = project.segments
    .filter((s) => s.status === "completed" && s.outputKey)
    .map((s) => s.outputKey as string);

  if (completedKeys.length === 0) {
    throw new Error("No completed audio segments found");
  }

  await jokeTtsRepository.updateStatus(pipelineId, "saving");

  const pipeline = await jokeTtsRepository.getById(pipelineId);
  if (!pipeline) {
    throw new Error(`Pipeline ${pipelineId} not found`);
  }

  const jokeAudioFileKey = `${STORAGE_PREFIXES.jokeAudio(pipeline.jokeTranslationId)}${pipelineId}.mp3`;
  const sourceKey = completedKeys[0] as string;
  await storage.copyObject(sourceKey, jokeAudioFileKey);

  const stat = await storage.statObject(jokeAudioFileKey);
  const durationMs = estimateDurationFromSize(stat.size);

  const jokeAudio = await jokeRepository.createAudio({
    jokeTranslationId: pipeline.jokeTranslationId,
    isPlatformDefault: false,
    voiceConfig: pipeline.voiceConfig,
    fileKey: jokeAudioFileKey,
    durationMs,
  });

  await jokeTtsRepository.updateStatus(pipelineId, "completed", {
    jokeAudioId: jokeAudio.id,
    completedAt: new Date(),
    errorMessage: null,
  });
}

async function findAudioDownloadUrl(
  jokeAudioId: string,
): Promise<string | null> {
  const jokes = await jokeRepository.getAll({});
  const allAudios = jokes.flatMap((joke) => joke.audios);
  const audio = allAudios.find((a) => a.id === jokeAudioId);

  if (!audio) {
    return null;
  }

  try {
    return await storage.getPresignedDownloadUrl(
      audio.fileKey,
      DOWNLOAD_EXPIRY_SECONDS,
    );
  } catch {
    return null;
  }
}

async function getPipelineWithDetails(
  id: string,
): Promise<PipelineWithDetails | null> {
  const pipeline = await jokeTtsRepository.getById(id);
  if (!pipeline) {
    return null;
  }

  const audioDownloadUrl = pipeline.jokeAudioId
    ? await findAudioDownloadUrl(pipeline.jokeAudioId)
    : null;

  let ttsProject: unknown = null;
  if (pipeline.ttsProjectId) {
    const { ttsProjectRepository } = await import(
      "#api/feature/tts-project/tts-project.repository"
    );
    ttsProject = await ttsProjectRepository.getById(pipeline.ttsProjectId);
  }

  return {
    ...pipeline,
    audioDownloadUrl,
    ttsProject,
  };
}

const MP3_BITRATE_KBPS = 128;
const BITS_PER_BYTE = 8;
const MS_IN_SECOND = 1000;

function estimateDurationFromSize(sizeBytes: number): number {
  const bits = sizeBytes * BITS_PER_BYTE;
  const seconds = bits / (MP3_BITRATE_KBPS * MS_IN_SECOND);
  return Math.round(seconds * MS_IN_SECOND);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const jokeTtsService = {
  startPipeline,
  getPipelineWithDetails,
};

export { jokeTtsService };
