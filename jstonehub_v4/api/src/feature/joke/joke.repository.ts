import type { InferSelectModel } from "drizzle-orm";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import {
  jokeAudiosTable,
  jokesTable,
  jokeTagsTable,
  jokeTranslationsTable,
} from "./joke.table";

type Joke = InferSelectModel<typeof jokesTable>;
type JokeTranslation = InferSelectModel<typeof jokeTranslationsTable>;
type JokeAudio = InferSelectModel<typeof jokeAudiosTable>;
type JokeStatus = "draft" | "review" | "approved";

type JokeWithDetails = Joke & {
  translations: JokeTranslation[];
  tagIds: string[];
  audios: JokeAudio[];
};

type GetJokesParams = {
  query?: string;
  languageCode?: string;
  tagIds?: string[];
  status?: string;
  hasExplicitContent?: boolean;
  limit?: number;
  offset?: number;
};

type JokeRelations = {
  translations: JokeTranslation[];
  tags: { jokeId: string; tagId: string }[];
  audios: JokeAudio[];
};

const DEFAULT_LIMIT = 50;

async function fetchJokesWithRelations(
  params: GetJokesParams,
): Promise<JokeWithDetails[]> {
  const limit = params.limit ?? DEFAULT_LIMIT;
  const offset = params.offset ?? 0;

  const jokes = await db
    .select()
    .from(jokesTable)
    .orderBy(desc(jokesTable.createdAt))
    .limit(limit)
    .offset(offset);

  if (jokes.length === 0) {
    return [];
  }

  const jokeIds = jokes.map((j) => j.id);
  const relations = await fetchRelations(jokeIds);

  return assembleJokeDetails(jokes, relations);
}

async function fetchRelations(jokeIds: string[]): Promise<JokeRelations> {
  const [translations, tags] = await Promise.all([
    db
      .select()
      .from(jokeTranslationsTable)
      .where(inArray(jokeTranslationsTable.jokeId, jokeIds)),
    db
      .select()
      .from(jokeTagsTable)
      .where(inArray(jokeTagsTable.jokeId, jokeIds)),
  ]);

  const translationIds = translations.map((t) => t.id);
  const audios =
    translationIds.length > 0
      ? await db
          .select()
          .from(jokeAudiosTable)
          .where(inArray(jokeAudiosTable.jokeTranslationId, translationIds))
      : [];

  return { translations, tags, audios };
}

function assembleJokeDetails(
  jokes: Joke[],
  relations: JokeRelations,
): JokeWithDetails[] {
  const translationsByJoke = groupBy(relations.translations, "jokeId");
  const tagsByJoke = groupBy(relations.tags, "jokeId");
  const audiosByTranslation = groupBy(relations.audios, "jokeTranslationId");

  return jokes.map((joke) => {
    const jokeTranslations = translationsByJoke.get(joke.id) ?? [];
    const jokeTags = tagsByJoke.get(joke.id) ?? [];
    const jokeAudios = jokeTranslations.flatMap(
      (t) => audiosByTranslation.get(t.id) ?? [],
    );

    return {
      ...joke,
      translations: jokeTranslations,
      tagIds: jokeTags.map((t) => t.tagId),
      audios: jokeAudios,
    };
  });
}

function applyInMemoryFilters(
  results: JokeWithDetails[],
  params: GetJokesParams,
): JokeWithDetails[] {
  let filtered = results;

  if (params.status) {
    filtered = filtered.filter((j) => j.status === params.status);
  }
  if (params.hasExplicitContent !== undefined) {
    filtered = filtered.filter(
      (j) => j.hasExplicitContent === params.hasExplicitContent,
    );
  }
  if (params.tagIds && params.tagIds.length > 0) {
    const filterTags = new Set(params.tagIds);
    filtered = filtered.filter((j) => j.tagIds.some((t) => filterTags.has(t)));
  }
  if (params.query && params.languageCode) {
    const q = params.query.toLowerCase();
    const lang = params.languageCode;
    filtered = filtered.filter((j) =>
      j.translations.some(
        (t) => t.languageCode === lang && t.plainText.toLowerCase().includes(q),
      ),
    );
  }

  return filtered;
}

const jokeRepository = {
  async getAll(params: GetJokesParams): Promise<JokeWithDetails[]> {
    const results = await fetchJokesWithRelations(params);
    return applyInMemoryFilters(results, params);
  },

  async getById(id: string): Promise<JokeWithDetails | null> {
    const [joke] = await db
      .select()
      .from(jokesTable)
      .where(eq(jokesTable.id, id))
      .limit(1);

    if (!joke) {
      return null;
    }

    const [translations, tags] = await Promise.all([
      db
        .select()
        .from(jokeTranslationsTable)
        .where(eq(jokeTranslationsTable.jokeId, id)),
      db.select().from(jokeTagsTable).where(eq(jokeTagsTable.jokeId, id)),
    ]);

    const translationIds = translations.map((t) => t.id);
    const audios =
      translationIds.length > 0
        ? await db
            .select()
            .from(jokeAudiosTable)
            .where(inArray(jokeAudiosTable.jokeTranslationId, translationIds))
        : [];

    return {
      ...joke,
      translations,
      tagIds: tags.map((t) => t.tagId),
      audios,
    };
  },

  async create(data: {
    originalLanguageCode: string;
    hasExplicitContent: boolean;
    humorRating: number | null;
  }): Promise<Joke> {
    const [row] = await db.insert(jokesTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create joke");
    }
    return row;
  },

  async updateJoke(
    id: string,
    data: Partial<{
      status: JokeStatus;
      hasExplicitContent: boolean;
      humorRating: number | null;
    }>,
  ): Promise<Joke | null> {
    const [row] = await db
      .update(jokesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jokesTable.id, id))
      .returning();
    return row ?? null;
  },

  async createTranslation(data: {
    jokeId: string;
    languageCode: string;
    segments: { role: string; text: string }[];
    plainText: string;
    uniquenessHash: string;
  }): Promise<JokeTranslation> {
    const [row] = await db
      .insert(jokeTranslationsTable)
      .values(data)
      .returning();
    if (!row) {
      throw new Error("Failed to create translation");
    }
    return row;
  },

  async findTranslationByHash(hash: string): Promise<JokeTranslation | null> {
    const [row] = await db
      .select()
      .from(jokeTranslationsTable)
      .where(eq(jokeTranslationsTable.uniquenessHash, hash))
      .limit(1);
    return row ?? null;
  },

  async setTags(jokeId: string, tagIds: string[]): Promise<void> {
    await db.delete(jokeTagsTable).where(eq(jokeTagsTable.jokeId, jokeId));

    if (tagIds.length > 0) {
      await db
        .insert(jokeTagsTable)
        .values(tagIds.map((tagId) => ({ jokeId, tagId })));
    }
  },

  async createAudio(data: {
    jokeTranslationId: string;
    isPlatformDefault: boolean;
    voiceConfig: Record<string, string>;
    fileKey: string;
    durationMs: number;
  }): Promise<JokeAudio> {
    const [row] = await db.insert(jokeAudiosTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create joke audio");
    }
    return row;
  },

  async deleteJoke(id: string): Promise<boolean> {
    const rows = await db
      .delete(jokesTable)
      .where(eq(jokesTable.id, id))
      .returning({ id: jokesTable.id });
    return rows.length > 0;
  },
};

function groupBy<T>(items: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = String(item[key]);
    const list = map.get(k) ?? [];
    list.push(item);
    map.set(k, list);
  }
  return map;
}

export type {
  GetJokesParams,
  Joke,
  JokeAudio,
  JokeStatus,
  JokeTranslation,
  JokeWithDetails,
};
export { jokeRepository };
