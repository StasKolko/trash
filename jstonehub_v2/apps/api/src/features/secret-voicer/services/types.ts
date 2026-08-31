export type VoiceRequestConfig = {
  csrfToken: string;
  sessionId: string;
  userAgent: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
};

export type SynthesizePayload = {
  voice_id: string;
  text: string;
  rate?: number; // 0.5 - 2.0, default 1
};

export type TaskStatusResponse = {
  status: string;
  status_code: "LOCAL_PROCESSING" | "COMPLETED" | "FAILED";
  audio_url: string | null;
  error: string | null;
  chunks_completed?: number;
  chunks_total?: number;
};

export type CreateTaskResponse = {
  task_id: number;
  status: string;
  is_reused: boolean;
};
