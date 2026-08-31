import type {
  SynthesisProject,
  SynthesisTask,
} from "#api/features/secret-voicer/synthesis/types";

export type {
  ProjectStatus,
  SynthesisProject,
  SynthesisTask,
  TaskStatus,
} from "#api/features/secret-voicer/synthesis/types";

export type CreateProjectInput = {
  name: string;
  tasks: {
    text: string;
    voiceId: string;
    rate?: number;
  }[];
};

export type VoiceoverDialogType = "create" | "details" | null;

export type VoiceoverState = {
  projects: SynthesisProject[];
  isLoading: boolean;
  error: string | null;
  activeDialog: VoiceoverDialogType;
  selectedProjectId: string | null;
};

export type ProjectWithTasks = SynthesisProject & {
  tasks: SynthesisTask[];
};

export type TaskPreview = {
  index: number;
  text: string;
  voiceId: string;
  voiceName: string | null;
  rate: number;
  isValid: boolean;
  error?: string;
};

export type ProjectPreview = {
  name: string;
  tasks: TaskPreview[];
  isValid: boolean;
  errors: string[];
};

export type PublicVoice = {
  id: string;
  externalVoiceId: string;
  name: string;
  gender: string;
};
