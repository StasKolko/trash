import type {
  TtsProject,
  TtsProjectStatus,
  TtsProjectWithSegments,
  TtsSegment,
  TtsSegmentStatus,
} from "./tts-project.type";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { ttsProjectsTable, ttsSegmentsTable } from "./tts-project.table";

const ttsProjectRepository = {
  async getAll(): Promise<TtsProjectWithSegments[]> {
    const projects = await db
      .select()
      .from(ttsProjectsTable)
      .orderBy(desc(ttsProjectsTable.createdAt));

    if (projects.length === 0) {
      return [];
    }

    const projectIds = projects.map((p) => p.id);
    const allSegments = await db
      .select()
      .from(ttsSegmentsTable)
      .where(inArray(ttsSegmentsTable.projectId, projectIds))
      .orderBy(ttsSegmentsTable.index);

    const segmentsByProject = new Map<string, TtsSegment[]>();
    for (const seg of allSegments) {
      const list = segmentsByProject.get(seg.projectId) ?? [];
      list.push(seg);
      segmentsByProject.set(seg.projectId, list);
    }

    return projects.map((p) => ({
      ...p,
      segments: segmentsByProject.get(p.id) ?? [],
    }));
  },

  async getById(id: string): Promise<TtsProjectWithSegments | null> {
    const [project] = await db
      .select()
      .from(ttsProjectsTable)
      .where(eq(ttsProjectsTable.id, id))
      .limit(1);

    if (!project) {
      return null;
    }

    const segments = await db
      .select()
      .from(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.projectId, id))
      .orderBy(ttsSegmentsTable.index);

    return { ...project, segments };
  },

  async create(data: {
    name: string;
    audioProcessingEnabled: boolean;
    audioProcessingConcatenate: boolean;
    audioProcessingConfig: Record<string, unknown>;
  }): Promise<TtsProject> {
    const [row] = await db
      .insert(ttsProjectsTable)
      .values({
        name: data.name,
        audioProcessingEnabled: data.audioProcessingEnabled ? 1 : 0,
        audioProcessingConcatenate: data.audioProcessingConcatenate ? 1 : 0,
        audioProcessingConfig: data.audioProcessingConfig,
        status: "pending",
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create TTS project");
    }
    return row;
  },

  createSegments(
    segments: {
      projectId: string;
      index: number;
      role: string;
      text: string;
      voiceId: string;
    }[],
  ): Promise<TtsSegment[]> {
    if (segments.length === 0) {
      return Promise.resolve([]);
    }
    return db.insert(ttsSegmentsTable).values(segments).returning();
  },

  async updateProjectStatus(
    id: string,
    status: TtsProjectStatus,
    completedAt?: Date,
  ): Promise<TtsProject | null> {
    const [row] = await db
      .update(ttsProjectsTable)
      .set({ status, completedAt: completedAt ?? null, updatedAt: new Date() })
      .where(eq(ttsProjectsTable.id, id))
      .returning();

    return row ?? null;
  },

  async updateSegmentStatus(
    segmentId: string,
    data: {
      status: TtsSegmentStatus;
      bullJobId?: string;
      externalTaskId?: number;
      outputKey?: string;
      errorMessage?: string | null;
    },
  ): Promise<TtsSegment | null> {
    const [row] = await db
      .update(ttsSegmentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ttsSegmentsTable.id, segmentId))
      .returning();

    return row ?? null;
  },

  async updateSegmentFields(
    segmentId: string,
    data: {
      text?: string;
      role?: string;
      voiceId?: string;
      status?: TtsSegmentStatus;
      outputKey?: string | null;
      bullJobId?: string | null;
      externalTaskId?: number | null;
      errorMessage?: string | null;
    },
  ): Promise<TtsSegment | null> {
    const [row] = await db
      .update(ttsSegmentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ttsSegmentsTable.id, segmentId))
      .returning();

    return row ?? null;
  },

  async updateSegmentIndex(segmentId: string, index: number): Promise<void> {
    await db
      .update(ttsSegmentsTable)
      .set({ index, updatedAt: new Date() })
      .where(eq(ttsSegmentsTable.id, segmentId));
  },

  async deleteSegment(segmentId: string): Promise<boolean> {
    const rows = await db
      .delete(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.id, segmentId))
      .returning({ id: ttsSegmentsTable.id });
    return rows.length > 0;
  },

  async updateProjectAudioJobId(
    projectId: string,
    audioProcessingJobId: string | null,
  ): Promise<void> {
    await db
      .update(ttsProjectsTable)
      .set({ audioProcessingJobId, updatedAt: new Date() })
      .where(eq(ttsProjectsTable.id, projectId));
  },

  async getSegmentById(id: string): Promise<TtsSegment | null> {
    const [row] = await db
      .select()
      .from(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.id, id))
      .limit(1);

    return row ?? null;
  },

  async getSegmentByProjectAndIndex(
    projectId: string,
    index: number,
  ): Promise<TtsSegment | null> {
    const all = await db
      .select()
      .from(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.projectId, projectId));

    return all.find((s) => s.index === index) ?? null;
  },

  async deleteProject(id: string): Promise<boolean> {
    const rows = await db
      .delete(ttsProjectsTable)
      .where(eq(ttsProjectsTable.id, id))
      .returning({ id: ttsProjectsTable.id });

    return rows.length > 0;
  },
};

export { ttsProjectRepository };
