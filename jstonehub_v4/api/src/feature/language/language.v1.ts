import { LANGUAGE_LIMITS } from "@packages/contract/language";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { languageRepository } from "./language.repository";

export const languageV1 = new Elysia({ prefix: "/v1/languages" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", () => languageRepository.getAll())
  .post("/", async ({ body, set }) => {
    const { code, name } = body as { code?: string; name?: string };

    if (
      !code
      || code.length < LANGUAGE_LIMITS.code.min
      || code.length > LANGUAGE_LIMITS.code.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid code" };
    }

    if (
      !name
      || name.length < LANGUAGE_LIMITS.name.min
      || name.length > LANGUAGE_LIMITS.name.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid name" };
    }

    const existing = await languageRepository.getByCode(code);
    if (existing) {
      set.status = HTTP_STATUS.CONFLICT;
      return { error: "Language code already exists" };
    }

    const language = await languageRepository.create({ code, name });
    set.status = HTTP_STATUS.CREATED;
    return language;
  })
  .patch("/:id", async ({ params, body, set }) => {
    const result = await languageRepository.update(
      params.id,
      body as Partial<{ name: string; isActive: boolean }>,
    );
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Language not found" };
    }
    return result;
  })
  .delete("/:id", async ({ params, set }) => {
    const deleted = await languageRepository.delete(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Language not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });
