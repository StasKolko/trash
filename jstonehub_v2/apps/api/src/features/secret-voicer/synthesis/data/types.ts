import type { synthesisProjectTable, synthesisTaskTable } from "./table";

// === Database Types ===

export type SynthesisProject = typeof synthesisProjectTable.$inferSelect;
export type NewSynthesisProject = typeof synthesisProjectTable.$inferInsert;
export type UpdateSynthesisProject = Partial<
  Omit<NewSynthesisProject, "id" | "createdAt">
>;

export type SynthesisTask = typeof synthesisTaskTable.$inferSelect;
export type NewSynthesisTask = typeof synthesisTaskTable.$inferInsert;
export type UpdateSynthesisTask = Partial<
  Omit<NewSynthesisTask, "id" | "projectId" | "createdAt">
>;

// === API Input Types ===

export type CreateProjectTaskInput = {
  text: string;
  voiceId: string;
  rate?: number;
};

export type CreateProjectInput = {
  name: string;
  tasks: CreateProjectTaskInput[];
};

// === Status Types ===

export type ProjectStatus = SynthesisProject["status"];
export type TaskStatus = SynthesisTask["status"];

// === Response Types ===

export type ProjectWithTasks = SynthesisProject & {
  tasks: SynthesisTask[];
};

export type ProjectStatusResponse = {
  id: string;
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  progress: number; // 0-100
};
