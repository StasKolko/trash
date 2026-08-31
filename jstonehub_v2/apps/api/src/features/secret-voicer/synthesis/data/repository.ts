import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "#api/shared/db";
import { synthesisProjectTable, synthesisTaskTable } from "./table";
import type {
  NewSynthesisProject,
  NewSynthesisTask,
  ProjectStatus,
  SynthesisProject,
  SynthesisTask,
  TaskStatus,
  UpdateSynthesisProject,
  UpdateSynthesisTask,
} from "./types";

// === Projects ===

export async function createSynthesisProject(
  data: NewSynthesisProject,
): Promise<SynthesisProject> {
  const [result] = await db
    .insert(synthesisProjectTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create project");
  }
  return result;
}

export function getAllSynthesisProjects(): Promise<SynthesisProject[]> {
  return db
    .select()
    .from(synthesisProjectTable)
    .orderBy(sql`${synthesisProjectTable.createdAt} DESC`);
}

export function getSynthesisProjectById(
  id: string,
): Promise<SynthesisProject | undefined> {
  return db.query.synthesisProjectTable.findFirst({
    where: eq(synthesisProjectTable.id, id),
  });
}

export async function updateSynthesisProject(
  id: string,
  data: UpdateSynthesisProject,
): Promise<SynthesisProject | undefined> {
  const [result] = await db
    .update(synthesisProjectTable)
    .set(data)
    .where(eq(synthesisProjectTable.id, id))
    .returning();
  return result;
}

export async function deleteSynthesisProject(
  id: string,
): Promise<SynthesisProject | undefined> {
  const [result] = await db
    .delete(synthesisProjectTable)
    .where(eq(synthesisProjectTable.id, id))
    .returning();
  return result;
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<void> {
  const updates: UpdateSynthesisProject = { status };

  if (status === "PROCESSING") {
    updates.startedAt = new Date();
  } else if (
    status === "COMPLETED"
    || status === "FAILED"
    || status === "PARTIAL"
  ) {
    updates.completedAt = new Date();
  }

  await db
    .update(synthesisProjectTable)
    .set(updates)
    .where(eq(synthesisProjectTable.id, id));
}

export async function updateProjectStats(id: string): Promise<void> {
  const tasks = await db
    .select({ status: synthesisTaskTable.status })
    .from(synthesisTaskTable)
    .where(eq(synthesisTaskTable.projectId, id));

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const failed = tasks.filter((t) => t.status === "FAILED").length;

  let status: ProjectStatus;
  if (completed === total) {
    status = "COMPLETED";
  } else if (failed === total) {
    status = "FAILED";
  } else if (completed > 0 || failed > 0) {
    status = tasks.some((t) => t.status === "PROCESSING")
      ? "PROCESSING"
      : "PARTIAL";
  } else if (tasks.some((t) => t.status === "PROCESSING")) {
    status = "PROCESSING";
  } else {
    status = "PENDING";
  }

  await db
    .update(synthesisProjectTable)
    .set({
      totalTasks: total,
      completedTasks: completed,
      failedTasks: failed,
      status,
      completedAt:
        status === "COMPLETED" || status === "FAILED" || status === "PARTIAL"
          ? new Date()
          : null,
    })
    .where(eq(synthesisProjectTable.id, id));
}

// === Tasks ===

export function createSynthesisTasks(
  tasks: NewSynthesisTask[],
): Promise<SynthesisTask[]> {
  if (tasks.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(synthesisTaskTable).values(tasks).returning();
}

export function getSynthesisTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(eq(synthesisTaskTable.projectId, projectId))
    .orderBy(synthesisTaskTable.orderIndex);
}

export function getSynthesisTaskById(
  id: string,
): Promise<SynthesisTask | undefined> {
  return db.query.synthesisTaskTable.findFirst({
    where: eq(synthesisTaskTable.id, id),
  });
}

export async function updateSynthesisTask(
  id: string,
  data: UpdateSynthesisTask,
): Promise<SynthesisTask | undefined> {
  const [result] = await db
    .update(synthesisTaskTable)
    .set(data)
    .where(eq(synthesisTaskTable.id, id))
    .returning();
  return result;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  error?: string,
): Promise<void> {
  const updates: UpdateSynthesisTask = { status, error: error ?? null };

  if (status === "PROCESSING") {
    updates.startedAt = new Date();
  } else if (status === "COMPLETED" || status === "FAILED") {
    updates.completedAt = new Date();
  }

  await db
    .update(synthesisTaskTable)
    .set(updates)
    .where(eq(synthesisTaskTable.id, id));
}

export async function incrementTaskRetryCount(id: string): Promise<number> {
  const [result] = await db
    .update(synthesisTaskTable)
    .set({
      retryCount: sql`${synthesisTaskTable.retryCount} + 1`,
    })
    .where(eq(synthesisTaskTable.id, id))
    .returning({ retryCount: synthesisTaskTable.retryCount });
  return result?.retryCount ?? 0;
}

export function getFailedTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        eq(synthesisTaskTable.status, "FAILED"),
      ),
    );
}

export function getPendingTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        inArray(synthesisTaskTable.status, ["PENDING", "FAILED"]),
      ),
    );
}

export async function resetTasksForRetry(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) {
    return;
  }

  await db
    .update(synthesisTaskTable)
    .set({
      status: "PENDING",
      error: null,
      startedAt: null,
      completedAt: null,
    })
    .where(inArray(synthesisTaskTable.id, taskIds));
}

export async function resetAllProjectTasks(projectId: string): Promise<void> {
  await db
    .update(synthesisTaskTable)
    .set({
      status: "PENDING",
      error: null,
      retryCount: 0,
      externalTaskId: null,
      externalStatus: null,
      audioUrl: null,
      localFilePath: null,
      startedAt: null,
      completedAt: null,
    })
    .where(eq(synthesisTaskTable.projectId, projectId));
}

export async function cancelPendingTasks(projectId: string): Promise<void> {
  await db
    .update(synthesisTaskTable)
    .set({ status: "CANCELLED" })
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        inArray(synthesisTaskTable.status, ["PENDING"]),
      ),
    );
}
