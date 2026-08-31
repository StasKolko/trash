export type DownloadTaskPayload = {
  versionId: string;
  itemId: string;
  projectId: string;
  audioUrl: string;
};

export type WorkerCallbackPayload = {
  success: boolean;
  minioKey?: string;
  error?: string;
};
