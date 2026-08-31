import type { JokeTtsPipelineStatus } from "@packages/contract/joke-tts";

import type { JokeTtsPipeline } from "./joke-tts.type";

import { desc, eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { jokeTtsPipelinesTable } from "./joke-tts.table";

const jokeTtsRepository = {
  getAll(): Promise<JokeTtsPipeline[]> {
    return db
      .select()
      .from(jokeTtsPipelinesTable)
      .orderBy(desc(jokeTtsPipelinesTable.createdAt));
  },

  async getById(id: string): Promise<JokeTtsPipeline | null> {
    const [row] = await db
      .select()
      .from(jokeTtsPipelinesTable)
      .where(eq(jokeTtsPipelinesTable.id, id))
      .limit(1);
    return row ?? null;
  },

  getByTranslationId(translationId: string): Promise<JokeTtsPipeline[]> {
    return db
      .select()
      .from(jokeTtsPipelinesTable)
      .where(eq(jokeTtsPipelinesTable.jokeTranslationId, translationId))
      .orderBy(desc(jokeTtsPipelinesTable.createdAt));
  },

  async create(data: {
    jokeTranslationId: string;
    voiceConfig: Record<string, string>;
  }): Promise<JokeTtsPipeline> {
    const [row] = await db
      .insert(jokeTtsPipelinesTable)
      .values({
        jokeTranslationId: data.jokeTranslationId,
        voiceConfig: data.voiceConfig,
        status: "pending",
      })
      .returning();
    if (!row) {
      throw new Error("Failed to create joke TTS pipeline");
    }
    return row;
  },

  async updateStatus(
    id: string,
    status: JokeTtsPipelineStatus,
    extra?: Partial<{
      ttsProjectId: string;
      jokeAudioId: string;
      errorMessage: string | null;
      completedAt: Date;
    }>,
  ): Promise<JokeTtsPipeline | null> {
    const [row] = await db
      .update(jokeTtsPipelinesTable)
      .set({
        status,
        updatedAt: new Date(),
        ...extra,
      })
      .where(eq(jokeTtsPipelinesTable.id, id))
      .returning();
    return row ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(jokeTtsPipelinesTable)
      .where(eq(jokeTtsPipelinesTable.id, id))
      .returning({ id: jokeTtsPipelinesTable.id });
    return rows.length > 0;
  },
};

export { jokeTtsRepository };
