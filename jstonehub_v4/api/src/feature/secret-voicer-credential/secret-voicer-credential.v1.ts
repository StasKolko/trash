import { Elysia } from "elysia";

import { browserFingerprintRepository } from "#api/feature/browser-fingerprint/browser-fingerprint.repository";
import { invalidateConfigCache } from "#api/feature/secret-voicer/secret-voicer-config.service";
import { HTTP_STATUS } from "#api/shared/config/http-status";

import { secretVoicerCredentialRepository } from "./secret-voicer-credential.repository";
import {
  createSecretVoicerCredentialValidator,
  updateSecretVoicerCredentialValidator,
} from "./secret-voicer-credential.schema";

export const secretVoicerCredentialV1 = new Elysia({
  prefix: "/v1/secret-voicer-credentials",
})
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", () => secretVoicerCredentialRepository.getAll())
  .get("/:id", async ({ params, set }) => {
    const credential = await secretVoicerCredentialRepository.getById(
      params.id,
    );
    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }
    return credential;
  })
  .post("/", async ({ body, set }) => {
    if (!createSecretVoicerCredentialValidator.Check(body)) {
      const errors = [...createSecretVoicerCredentialValidator.Errors(body)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const typedBody = body as {
      fingerprintId: string;
      csrfToken: string;
      sessionId: string;
    };

    const fingerprint = await browserFingerprintRepository.getById(
      typedBody.fingerprintId,
    );
    if (!fingerprint) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Fingerprint not found" };
    }

    const credential = await secretVoicerCredentialRepository.create(typedBody);
    invalidateConfigCache();
    set.status = HTTP_STATUS.CREATED;
    return credential;
  })
  .patch("/:id", async ({ params, body, set }) => {
    if (!updateSecretVoicerCredentialValidator.Check(body)) {
      const errors = [...updateSecretVoicerCredentialValidator.Errors(body)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const credential = await secretVoicerCredentialRepository.update(
      params.id,
      body as Partial<{
        csrfToken: string;
        sessionId: string;
        isActive: boolean;
      }>,
    );

    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }

    invalidateConfigCache();
    return credential;
  })
  // Сброс ошибки и повторная активация credential
  .post("/:id/clear-error", async ({ params, set }) => {
    const credential = await secretVoicerCredentialRepository.clearError(
      params.id,
    );
    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }
    invalidateConfigCache();
    return credential;
  })
  .delete("/:id", async ({ params, set }) => {
    const credential = await secretVoicerCredentialRepository.delete(params.id);
    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }
    invalidateConfigCache();
    set.status = HTTP_STATUS.NO_CONTENT;
  });
