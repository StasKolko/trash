export type JokeTtsPipelineStatus =
  | "pending"
  | "creating_tasks"
  | "synthesizing"
  | "processing_audio"
  | "saving"
  | "completed"
  | "failed";

export const JOKE_TTS_PIPELINE_STATUSES: JokeTtsPipelineStatus[] = [
  "pending",
  "creating_tasks",
  "synthesizing",
  "processing_audio",
  "saving",
  "completed",
  "failed",
];
