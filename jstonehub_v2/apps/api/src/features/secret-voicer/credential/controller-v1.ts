import { Elysia, InternalServerError, NotFoundError, t } from "elysia";
import { spread } from "#api/shared/api/typebox-helpers";
import { HTTP_STATUS } from "#api/shared/config/http-status";
import {
  createSecretVoicerCredential,
  deleteSecretVoicerCredential,
  getAllSecretVoicerCredentials,
  getSecretVoicerCredentialById,
  updateSecretVoicerCredential,
} from "./repository";
import { secretVoicerCredentialTable } from "./table";
import type {
  NewSecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "./types";

const SecretVoicerCredentialDto = t.Object(
  spread(secretVoicerCredentialTable, "select"),
);
const CreateSecretVoicerCredentialDto = t.Object({
  name: t.String({ minLength: 3, maxLength: 100 }),
  fingerprintId: t.String({ minLength: 1 }),
  csrfToken: t.String({ minLength: 10 }),
  sessionId: t.String({ minLength: 10 }),
  isActive: t.Optional(t.Boolean({ default: true })),
});
const UpdateSecretVoicerCredentialDto = t.Partial(
  CreateSecretVoicerCredentialDto,
);

export const secretVoicerCredentialControllerV1 = new Elysia({
  prefix: "/credentials",
})
  .get("/", async () => getAllSecretVoicerCredentials(), {
    response: t.Array(SecretVoicerCredentialDto),
  })

  .get(
    "/:id",
    async ({ params: { id } }) => {
      const result = await getSecretVoicerCredentialById(id);
      if (!result) {
        throw new NotFoundError("Credential not found");
      }
      return result;
    },
    {
      response: SecretVoicerCredentialDto,
    },
  )

  .post(
    "/",
    async ({ body, set }) => {
      const result = await createSecretVoicerCredential(
        body as NewSecretVoicerCredential,
      );
      if (!result) {
        throw new InternalServerError("Failed to create credential");
      }
      set.status = HTTP_STATUS.CREATED;
      return result;
    },
    {
      body: CreateSecretVoicerCredentialDto,
      response: SecretVoicerCredentialDto,
    },
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const result = await updateSecretVoicerCredential(
        id,
        body as UpdateSecretVoicerCredential,
      );
      if (!result) {
        throw new NotFoundError("Credential not found");
      }
      return result;
    },
    {
      body: UpdateSecretVoicerCredentialDto,
      response: SecretVoicerCredentialDto,
    },
  )

  .delete(
    "/:id",
    async ({ params: { id } }) => {
      const result = await deleteSecretVoicerCredential(id);
      if (!result) {
        throw new NotFoundError("Credential not found");
      }
      return { success: true, id };
    },
    {
      response: t.Object({
        success: t.Boolean(),
        id: t.String(),
      }),
    },
  );
