import type { JokeStatus } from "@packages/contract/joke";

import { JOKE_HUMOR_RATING, JOKE_STATUSES } from "@packages/contract/joke";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { jokeRepository } from "./joke.repository";
import { computeUniquenessHash } from "./joke-uniqueness.util";

function parseHasExplicitContent(
  value: string | undefined,
): boolean | undefined {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return;
}

function isValidJokeStatus(value: string): value is JokeStatus {
  return (JOKE_STATUSES as readonly string[]).includes(value);
}

function clampHumorRating(humorRating: number | undefined): number | null {
  if (humorRating === undefined) {
    return null;
  }
  return Math.max(
    JOKE_HUMOR_RATING.min,
    Math.min(JOKE_HUMOR_RATING.max, humorRating),
  );
}

export const jokeV1 = new Elysia({ prefix: "/v1/jokes" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", ({ query }) => {
    const params = {
      query: (query.query as string) || undefined,
      languageCode: (query.languageCode as string) || undefined,
      tagIds: query.tagIds
        ? String(query.tagIds).split(",").filter(Boolean)
        : undefined,
      status: (query.status as string) || undefined,
      hasExplicitContent: parseHasExplicitContent(
        query.hasExplicitContent as string | undefined,
      ),
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    };

    return jokeRepository.getAll(params);
  })
  .get("/:id", async ({ params, set }) => {
    const joke = await jokeRepository.getById(params.id);
    if (!joke) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }
    return joke;
  })
  .post("/", async ({ body, set }) => {
    const {
      originalLanguageCode,
      segments,
      hasExplicitContent,
      humorRating,
      tagIds,
    } = body as {
      originalLanguageCode?: string;
      segments?: { role: string; text: string }[];
      hasExplicitContent?: boolean;
      humorRating?: number;
      tagIds?: string[];
    };

    if (!originalLanguageCode) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "originalLanguageCode is required" };
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "segments array is required" };
    }

    for (const seg of segments) {
      if (!(seg.role?.trim() && seg.text?.trim())) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: "Each segment must have role and text" };
      }
    }

    const validRating = clampHumorRating(humorRating);

    const hash = computeUniquenessHash(segments);
    const existing = await jokeRepository.findTranslationByHash(hash);
    if (existing) {
      set.status = HTTP_STATUS.CONFLICT;
      return {
        error: "Duplicate joke detected",
        existingJokeId: existing.jokeId,
      };
    }

    const joke = await jokeRepository.create({
      originalLanguageCode,
      hasExplicitContent: hasExplicitContent ?? false,
      humorRating: validRating,
    });

    const plainText = segments.map((s) => s.text.trim()).join(" ");
    await jokeRepository.createTranslation({
      jokeId: joke.id,
      languageCode: originalLanguageCode,
      segments: segments.map((s) => ({
        role: s.role.trim(),
        text: s.text.trim(),
      })),
      plainText,
      uniquenessHash: hash,
    });

    if (tagIds && tagIds.length > 0) {
      await jokeRepository.setTags(joke.id, tagIds);
    }

    const result = await jokeRepository.getById(joke.id);
    set.status = HTTP_STATUS.CREATED;
    return result;
  })
  .patch("/:id", async ({ params, body, set }) => {
    const { status, hasExplicitContent, humorRating, tagIds } = body as {
      status?: string;
      hasExplicitContent?: boolean;
      humorRating?: number;
      tagIds?: string[];
    };

    const updateData: Partial<{
      status: "draft" | "review" | "approved";
      hasExplicitContent: boolean;
      humorRating: number | null;
    }> = {};

    if (status !== undefined) {
      if (!isValidJokeStatus(status)) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: "Invalid status" };
      }
      updateData.status = status;
    }

    if (hasExplicitContent !== undefined) {
      updateData.hasExplicitContent = hasExplicitContent;
    }

    if (humorRating !== undefined) {
      updateData.humorRating = Math.max(
        JOKE_HUMOR_RATING.min,
        Math.min(JOKE_HUMOR_RATING.max, humorRating),
      );
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await jokeRepository.updateJoke(params.id, updateData);
      if (!updated) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "Joke not found" };
      }
    }

    if (tagIds !== undefined) {
      await jokeRepository.setTags(params.id, tagIds);
    }

    const result = await jokeRepository.getById(params.id);
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }

    return result;
  })
  .post("/:id/translations", async ({ params, body, set }) => {
    const { languageCode, segments } = body as {
      languageCode?: string;
      segments?: { role: string; text: string }[];
    };

    if (!languageCode) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "languageCode is required" };
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "segments array is required" };
    }

    for (const seg of segments) {
      if (!(seg.role?.trim() && seg.text?.trim())) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: "Each segment must have role and text" };
      }
    }

    const joke = await jokeRepository.getById(params.id);
    if (!joke) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }

    const existingTranslation = joke.translations.find(
      (t) => t.languageCode === languageCode,
    );
    if (existingTranslation) {
      set.status = HTTP_STATUS.CONFLICT;
      return {
        error: `Translation for language "${languageCode}" already exists`,
      };
    }

    const hash = computeUniquenessHash(segments);
    const duplicate = await jokeRepository.findTranslationByHash(hash);
    if (duplicate) {
      set.status = HTTP_STATUS.CONFLICT;
      return {
        error: "Duplicate translation detected",
        existingJokeId: duplicate.jokeId,
        existingLanguageCode: duplicate.languageCode,
      };
    }

    const plainText = segments.map((s) => s.text.trim()).join(" ");
    const translation = await jokeRepository.createTranslation({
      jokeId: params.id,
      languageCode,
      segments: segments.map((s) => ({
        role: s.role.trim(),
        text: s.text.trim(),
      })),
      plainText,
      uniquenessHash: hash,
    });

    set.status = HTTP_STATUS.CREATED;
    return translation;
  })
  .delete("/:id", async ({ params, set }) => {
    const deleted = await jokeRepository.deleteJoke(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });
