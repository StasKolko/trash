import type { secretVoicerProjectTable } from "./table";

export type SecretVoicerProject = typeof secretVoicerProjectTable.$inferSelect;

export type NewSecretVoicerProject =
  typeof secretVoicerProjectTable.$inferInsert;

export type ProjectStatus =
  | "draft"
  | "processing"
  | "completed"
  | "partial"
  | "failed";

export type CreateProjectInput = {
  name: string;
  characters: {
    name: string;
    voiceId: string;
  }[];
  items: {
    characterName: string;
    text: string;
    orderIndex: number;
  }[];
};

export type ProjectStats = {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  comparing: number;
};

export type ProjectVersionInfo = {
  id: string;
  minioUrl: string | null;
  externalStatus: string;
  externalError: string | null;
};

export type ProjectWithDetails = SecretVoicerProject & {
  stats: ProjectStats;
  characters: {
    id: string;
    name: string;
    voiceId: string;
  }[];
  items: {
    id: string;
    orderIndex: number;
    characterId: string;
    characterName: string;
    text: string;
    status: string;
    currentVersion: ProjectVersionInfo | null;
    candidateVersion: ProjectVersionInfo | null;
  }[];
};

export type ProjectWithStats = {
  id: string;
  name: string;
  status: string;
  stats: ProjectStats;
  createdAt: Date;
  updatedAt: Date;
};
