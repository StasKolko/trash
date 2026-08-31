import type {
  BrowserFingerprintSort,
  BrowserFingerprintStatus,
} from "@packages/contract/browser-fingerprint";
import type { PaginationOrder } from "@packages/contract/pagination";

import type { GetBrowserFingerprintsParams } from "./browser-fingerprint.type";

import { PAGINATION_FILTER_ALL } from "@packages/contract/pagination";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { browserFingerprintRepository } from "./browser-fingerprint.repository";
import {
  createBrowserFingerprintValidator,
  getBrowserFingerprintsQueryValidator,
  updateBrowserFingerprintValidator,
} from "./browser-fingerprint.schema";

export const browserFingerprintV1 = new Elysia({ prefix: "/v1/fingerprints" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", ({ query, set }) => {
    if (!getBrowserFingerprintsQueryValidator.Check(query)) {
      const errors = [...getBrowserFingerprintsQueryValidator.Errors(query)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const params: GetBrowserFingerprintsParams = {
      query: query.query ?? "",
      sort: (query.sort ?? "createdAt") as BrowserFingerprintSort,
      order: (query.order ?? "asc") as PaginationOrder,
      status:
        (query.status as "all" | BrowserFingerprintStatus[])
        ?? PAGINATION_FILTER_ALL,
    };

    return browserFingerprintRepository.getAll(params);
  })
  .get("/:id", async ({ params, set }) => {
    const fingerprint = await browserFingerprintRepository.getById(params.id);

    if (!fingerprint) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Fingerprint not found" };
    }

    return fingerprint;
  })
  .post("/", async ({ body, set }) => {
    if (!createBrowserFingerprintValidator.Check(body)) {
      const errors = [...createBrowserFingerprintValidator.Errors(body)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const fingerprint = await browserFingerprintRepository.create(body);
    set.status = HTTP_STATUS.CREATED;
    return fingerprint;
  })
  .patch("/:id", async ({ params, body, set }) => {
    if (!updateBrowserFingerprintValidator.Check(body)) {
      const errors = [...updateBrowserFingerprintValidator.Errors(body)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const fingerprint = await browserFingerprintRepository.update(
      params.id,
      body,
    );

    if (!fingerprint) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Fingerprint not found" };
    }

    return fingerprint;
  })
  .delete("/:id", async ({ params, set }) => {
    const fingerprint = await browserFingerprintRepository.delete(params.id);

    if (!fingerprint) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Fingerprint not found" };
    }

    set.status = HTTP_STATUS.NO_CONTENT;
  });
