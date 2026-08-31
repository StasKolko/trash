import type { TtsProjectWithSegments } from "./tts-project.type";

import { STORAGE_PREFIXES } from "@packages/contract/storage";
import { createId } from "@packages/util/id";

import { secretVoicerExternalAdapter } from "#api/feature/secret-voicer/secret-voicer-external.adapter";
import { buildTtsCredentials } from "#api/feature/secret-voicer/secret-voicer-preview.service";
import { addJob } from "#api/shared/queue/producer";
import { storage } from "#api/shared/storage/storage";

import { ttsProjectRepository } from "./tts-project.repository";

type CreateProjectInput = {
  name: string;
  segments: {
    role: string;
    text: string;
    voiceId: string;
  }[];
  audioProcessing: {
    enabled: boolean;
    concatenate: boolean;
    config?: Record<string, unknown>;
  };
};

type ProjectResponse = {
  projectId: string;
  status: string;
  segmentCount: number;
};

type OutputFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type MergeParams = {
  betweenMs: number;
  startMs: number;
  endMs: number;
};

type MergeResult = {
  audioProcessingJobId: string;
  status: string;
};

const TTS_RATE_DEFAULT = 1.0;
const SEGMENT_INDEX_PAD_LENGTH = 4;
const DOWNLOAD_EXPIRY_SECONDS = 86_400;

function buildSegmentOutputKey(
  projectId: string,
  segmentIndex: number,
): string {
  return `${STORAGE_PREFIXES.ttsOutput(projectId)}seg_${String(segmentIndex).padStart(SEGMENT_INDEX_PAD_LENGTH, "0")}.mp3`;
}

async function createProject(
  input: CreateProjectInput,
): Promise<ProjectResponse> {
  const project = await ttsProjectRepository.create({
    name: input.name,
    audioProcessingEnabled: input.audioProcessing.enabled,
    audioProcessingConcatenate: input.audioProcessing.concatenate,
    audioProcessingConfig: input.audioProcessing.config ?? {},
  });

  const segmentRows = input.segments.map((seg, index) => ({
    projectId: project.id,
    index,
    role: seg.role,
    text: seg.text,
    voiceId: seg.voiceId,
  }));

  await ttsProjectRepository.createSegments(segmentRows);

  setImmediate(() => {
    startProjectSynthesis(project.id).catch((err) => {
      // biome-ignore lint/suspicious/noConsole: Background task error logging
      console.error(
        `Failed to start synthesis for project ${project.id}:`,
        err,
      );
    });
  });

  return {
    projectId: project.id,
    status: "processing",
    segmentCount: input.segments.length,
  };
}

async function startProjectSynthesis(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");

  const credentials = await buildTtsCredentials();

  const pendingSegments = project.segments.filter(
    (s) => s.status === "pending",
  );

  await Promise.allSettled(
    pendingSegments.map((segment) =>
      synthesizeSegment(projectId, segment, credentials),
    ),
  );

  await recalculateProjectStatus(projectId);
}

async function synthesizeSegment(
  projectId: string,
  segment: { id: string; voiceId: string; text: string; index: number },
  credentials: Awaited<ReturnType<typeof buildTtsCredentials>>,
): Promise<void> {
  try {
    const result = await secretVoicerExternalAdapter.createTask({
      voiceId: segment.voiceId,
      text: segment.text,
      rate: TTS_RATE_DEFAULT,
    });

    const jobId = createId();
    const outputKey = buildSegmentOutputKey(projectId, segment.index);

    const bullJobId = await addJob({
      queue: "tts",
      name: `tts-${projectId}-seg-${segment.index}`,
      data: {
        jobId,
        taskId: result.taskId,
        voiceId: segment.voiceId,
        text: segment.text,
        rate: TTS_RATE_DEFAULT,
        outputKey,
        credentials,
      },
    });

    await ttsProjectRepository.updateSegmentStatus(segment.id, {
      status: "queued",
      bullJobId,
      externalTaskId: result.taskId,
      outputKey,
      errorMessage: null,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    await ttsProjectRepository.updateSegmentStatus(segment.id, {
      status: "failed",
      errorMessage: errorMsg,
    });
  }
}

async function handleSegmentCompleted(
  projectId: string,
  outputKey: string,
): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  const segment = project.segments.find((s) => s.outputKey === outputKey);
  if (!segment) {
    return;
  }

  await ttsProjectRepository.updateSegmentStatus(segment.id, {
    status: "completed",
    errorMessage: null,
  });

  await recalculateProjectStatus(projectId);
}

async function handleSegmentFailed(
  projectId: string,
  outputKey: string,
  error: string,
): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  const segment = project.segments.find((s) => s.outputKey === outputKey);
  if (!segment) {
    return;
  }

  await ttsProjectRepository.updateSegmentStatus(segment.id, {
    status: "failed",
    errorMessage: error,
  });

  await recalculateProjectStatus(projectId);
}

async function retrySegment(
  projectId: string,
  segmentIndex: number,
): Promise<void> {
  const segment = await ttsProjectRepository.getSegmentByProjectAndIndex(
    projectId,
    segmentIndex,
  );

  if (!segment) {
    throw new Error(
      `Segment ${segmentIndex} not found in project ${projectId}`,
    );
  }

  if (!["failed", "pending"].includes(segment.status)) {
    throw new Error("Only failed or pending segments can be retried");
  }

  if (segment.outputKey) {
    try {
      await storage.deleteObject(segment.outputKey);
    } catch {
      // файл мог уже не существовать
    }
  }

  await ttsProjectRepository.updateSegmentStatus(segment.id, {
    status: "pending",
    errorMessage: null,
  });

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");

  const credentials = await buildTtsCredentials();
  await synthesizeSegment(projectId, segment, credentials);
  await recalculateProjectStatus(projectId);
}

async function retryAllFailed(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const failedSegments = project.segments.filter((s) => s.status === "failed");
  if (failedSegments.length === 0) {
    return;
  }

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");

  await Promise.all(
    failedSegments
      .filter((s) => s.outputKey)
      .map((s) =>
        storage.deleteObject(s.outputKey as string).catch(() => {
          // ignore missing files
        }),
      ),
  );

  await Promise.all(
    failedSegments.map((segment) =>
      ttsProjectRepository.updateSegmentStatus(segment.id, {
        status: "pending",
        errorMessage: null,
      }),
    ),
  );

  const credentials = await buildTtsCredentials();

  await Promise.allSettled(
    failedSegments.map((segment) =>
      synthesizeSegment(projectId, segment, credentials),
    ),
  );

  await recalculateProjectStatus(projectId);
}

async function synthesizeAllPending(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const pendingSegments = project.segments.filter(
    (s) => s.status === "pending",
  );
  if (pendingSegments.length === 0) {
    return;
  }

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");
  const credentials = await buildTtsCredentials();

  await Promise.allSettled(
    pendingSegments.map((segment) =>
      synthesizeSegment(projectId, segment, credentials),
    ),
  );

  await recalculateProjectStatus(projectId);
}

async function updateSegment(
  projectId: string,
  segmentIndex: number,
  data: { text?: string; role?: string; voiceId?: string },
): Promise<void> {
  const segment = await ttsProjectRepository.getSegmentByProjectAndIndex(
    projectId,
    segmentIndex,
  );
  if (!segment) {
    throw new Error("Segment not found");
  }

  if (
    segment.outputKey
    && (data.text !== undefined || data.voiceId !== undefined)
  ) {
    try {
      await storage.deleteObject(segment.outputKey);
    } catch {
      // ignore
    }
  }

  await ttsProjectRepository.updateSegmentFields(segment.id, {
    ...data,
    status: "pending",
    outputKey: null,
    bullJobId: null,
    externalTaskId: null,
    errorMessage: null,
  });

  await recalculateProjectStatus(projectId);
}

async function addSegment(
  projectId: string,
  data: { role: string; text: string; voiceId: string; afterIndex?: number },
): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const insertAt =
    data.afterIndex === undefined
      ? project.segments.length
      : data.afterIndex + 1;

  const segmentsToShift = project.segments.filter((s) => s.index >= insertAt);

  for (const seg of segmentsToShift) {
    // biome-ignore lint/performance/noAwaitInLoops: sequential is intentional
    await ttsProjectRepository.updateSegmentIndex(seg.id, seg.index + 1);
  }

  await ttsProjectRepository.createSegments([
    {
      projectId,
      index: insertAt,
      role: data.role,
      text: data.text,
      voiceId: data.voiceId,
    },
  ]);

  await recalculateProjectStatus(projectId);
}

async function deleteSegment(
  projectId: string,
  segmentIndex: number,
): Promise<void> {
  const segment = await ttsProjectRepository.getSegmentByProjectAndIndex(
    projectId,
    segmentIndex,
  );
  if (!segment) {
    throw new Error("Segment not found");
  }

  if (segment.outputKey) {
    try {
      await storage.deleteObject(segment.outputKey);
    } catch {
      // ignore
    }
  }

  await ttsProjectRepository.deleteSegment(segment.id);

  const project = await ttsProjectRepository.getById(projectId);
  if (project) {
    const remaining = project.segments
      .filter((s) => s.id !== segment.id)
      .sort((a, b) => a.index - b.index);

    for (let i = 0; i < remaining.length; i++) {
      const seg = remaining[i];
      if (seg && seg.index !== i) {
        // biome-ignore lint/performance/noAwaitInLoops: sequential is intentional
        await ttsProjectRepository.updateSegmentIndex(seg.id, i);
      }
    }
  }

  await recalculateProjectStatus(projectId);
}

async function recalculateProjectStatus(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  const { segments } = project;
  if (segments.length === 0) {
    await ttsProjectRepository.updateProjectStatus(projectId, "pending");
    return;
  }

  let pending = 0;
  let queued = 0;
  let processing = 0;
  let completed = 0;
  let failed = 0;

  for (const seg of segments) {
    switch (seg.status) {
      case "pending":
        pending++;
        break;
      case "queued":
        queued++;
        break;
      case "processing":
        processing++;
        break;
      case "completed":
        completed++;
        break;
      case "failed":
        failed++;
        break;
      default:
        break;
    }
  }

  const total = segments.length;
  const active = pending + queued + processing;

  if (active > 0) {
    await ttsProjectRepository.updateProjectStatus(projectId, "processing");
  } else if (failed === total) {
    await ttsProjectRepository.updateProjectStatus(projectId, "failed");
  } else if (failed > 0) {
    await ttsProjectRepository.updateProjectStatus(projectId, "partial");
  } else if (completed === total) {
    await ttsProjectRepository.updateProjectStatus(
      projectId,
      "completed",
      new Date(),
    );
  }
}

function buildMergeConfig(params: MergeParams) {
  return {
    silenceRemoval: {
      enabled: false,
      thresholdDb: -30,
      minDurationMs: 200,
      keepGapMs: 30,
    },
    normalization: {
      enabled: true,
      targetLufs: -16,
      truePeakDb: -1.5,
    },
    highPassFilter: {
      enabled: false,
      frequencyHz: 80,
    },
    limiter: {
      enabled: true,
      limitDb: -1.0,
    },
    fade: { inMs: 0, outMs: 0 },
    gaps: {
      innerMs: 0,
      betweenMs: params.betweenMs,
      startMs: params.startMs,
      endMs: params.endMs,
    },
    concatenation: { enabled: true },
    output: {
      format: "mp3" as const,
      bitrate: "192k",
      sampleRate: 44_100,
    },
  };
}

async function mergeSegments(
  projectId: string,
  params: MergeParams,
): Promise<MergeResult> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const completedSegments = project.segments
    .filter((s) => s.status === "completed" && s.outputKey)
    .sort((a, b) => a.index - b.index);

  if (completedSegments.length === 0) {
    throw new Error("No completed segments to merge");
  }

  const inputKeys = completedSegments.map((s) => s.outputKey as string);
  const jobId = createId();
  const outputPrefix = `${STORAGE_PREFIXES.ttsOutput(projectId)}merged/`;

  await addJob({
    queue: "audio-processing",
    name: `merge-tts-${projectId}`,
    data: {
      jobId,
      config: buildMergeConfig(params),
      inputKeys,
      outputPrefix,
      outputName: project.name,
      isConcatenated: true,
    },
  });

  await ttsProjectRepository.updateProjectAudioJobId(projectId, jobId);

  return { audioProcessingJobId: jobId, status: "queued" };
}

async function deleteMergedAudio(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.audioProcessingJobId) {
    throw new Error("No merged audio to delete");
  }

  // Delete merged files from storage
  const mergedPrefix = `${STORAGE_PREFIXES.ttsOutput(projectId)}merged/`;
  try {
    await storage.deletePrefix(mergedPrefix);
  } catch {
    // Non-critical — files may already be gone
  }

  // Clear the audioProcessingJobId so the Merge button reappears
  await ttsProjectRepository.updateProjectAudioJobId(projectId, null);
}

async function deleteProject(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const prefix = STORAGE_PREFIXES.ttsOutput(projectId);
  try {
    await storage.deletePrefix(prefix);
  } catch {
    // Non-critical
  }

  await ttsProjectRepository.deleteProject(projectId);
}

async function buildOutputFiles(
  project: TtsProjectWithSegments,
): Promise<OutputFileEntry[]> {
  const completedSegments = project.segments.filter(
    (seg) => seg.status === "completed" && seg.outputKey,
  );

  const results = await Promise.all(
    completedSegments.map(async (seg) => {
      const outputKey = seg.outputKey;
      if (!outputKey) {
        return null;
      }

      try {
        const downloadUrl = await storage.getPresignedDownloadUrl(
          outputKey,
          DOWNLOAD_EXPIRY_SECONDS,
        );
        const padded = String(seg.index).padStart(
          SEGMENT_INDEX_PAD_LENGTH,
          "0",
        );
        return {
          fileName: `seg_${padded}_${seg.role}.mp3`,
          sizeBytes: 0,
          durationMs: 0,
          downloadUrl,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is OutputFileEntry => r !== null);
}

async function getProjectResponse(
  project: TtsProjectWithSegments,
): Promise<Record<string, unknown>> {
  const outputFiles = await buildOutputFiles(project);

  return {
    jobId: project.id,
    bullJobId: "",
    name: project.name,
    status: project.status,
    segments: project.segments.map((seg) => ({
      index: seg.index,
      role: seg.role,
      text: seg.text,
      voiceId: seg.voiceId,
      status: seg.status,
      bullJobId: seg.bullJobId,
      outputKey: seg.outputKey,
      error: seg.errorMessage,
    })),
    audioProcessingJobId: project.audioProcessingJobId,
    createdAt: project.createdAt.toISOString(),
    completedAt: project.completedAt?.toISOString() ?? null,
    outputFiles,
    error: null,
  };
}

const ttsProjectService = {
  createProject,
  startProjectSynthesis,
  handleSegmentCompleted,
  handleSegmentFailed,
  retrySegment,
  retryAllFailed,
  synthesizeAllPending,
  updateSegment,
  addSegment,
  deleteSegment,
  recalculateProjectStatus,
  mergeSegments,
  deleteMergedAudio,
  deleteProject,
  getProjectResponse,
};

export { ttsProjectService };
