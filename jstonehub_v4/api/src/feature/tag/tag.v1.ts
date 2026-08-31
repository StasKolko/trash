import { TAG_LIMITS } from "@packages/contract/tag";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { tagRepository } from "./tag.repository";

export const tagV1 = new Elysia({ prefix: "/v1/tags" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", () => tagRepository.getAll())
  .post("/", async ({ body, set }) => {
    const { slug, name } = body as { slug?: string; name?: string };

    if (
      !slug
      || slug.length < TAG_LIMITS.slug.min
      || slug.length > TAG_LIMITS.slug.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid slug" };
    }

    if (
      !name
      || name.length < TAG_LIMITS.name.min
      || name.length > TAG_LIMITS.name.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid name" };
    }

    const existing = await tagRepository.getBySlug(slug);
    if (existing) {
      set.status = HTTP_STATUS.CONFLICT;
      return { error: "Tag slug already exists" };
    }

    const tag = await tagRepository.create({ slug, name });
    set.status = HTTP_STATUS.CREATED;
    return tag;
  })
  .patch("/:id", async ({ params, body, set }) => {
    const result = await tagRepository.update(
      params.id,
      body as Partial<{ slug: string; name: string }>,
    );
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Tag not found" };
    }
    return result;
  })
  .delete("/:id", async ({ params, set }) => {
    const deleted = await tagRepository.delete(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Tag not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });
