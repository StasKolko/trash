// import { Elysia } from "elysia";
// import { HTTP_STATUS } from "#api/shared/config/http-status";
// import { secretVoicerApi } from "../external-api";
// import type {
//   NewSecretVoicerCredential,
//   UpdateSecretVoicerCredential,
// } from "../types";
// import { secretVoicerCredentialRepository } from "./repository";
// import { idParamValidator, insertValidator, updateValidator } from "./schema";

// export const secretVoicerCredentialsV1 = new Elysia({
//   prefix: "/v1/secret-voicer/credentials",
// })
//   .get("/", () => secretVoicerCredentialRepository.getAll())
//   .post("/", async ({ body, status }) => {
//     if (!insertValidator.Check(body)) {
//       return status(HTTP_STATUS.BAD_REQUEST, {
//         error: "VALIDATION_ERROR",
//         message: "Invalid request body",
//         details: [...insertValidator.Errors(body)],
//       });
//     }

//     const result = await secretVoicerCredentialRepository.create(
//       body as NewSecretVoicerCredential,
//     );

//     secretVoicerApi.invalidateConfigCache();

//     return result;
//   })
//   .patch("/:id", async ({ params, body, status }) => {
//     if (!idParamValidator.Check(params)) {
//       return status(HTTP_STATUS.BAD_REQUEST, {
//         error: "VALIDATION_ERROR",
//         message: "Invalid ID parameter",
//       });
//     }

//     if (!updateValidator.Check(body)) {
//       return status(HTTP_STATUS.BAD_REQUEST, {
//         error: "VALIDATION_ERROR",
//         message: "Invalid update payload",
//       });
//     }

//     const credential = await secretVoicerCredentialRepository.update(
//       params.id,
//       body as UpdateSecretVoicerCredential,
//     );

//     if (!credential) {
//       return status(HTTP_STATUS.NOT_FOUND, {
//         error: "NOT_FOUND",
//         message: `Credential with id ${params.id} not found`,
//       });
//     }

//     secretVoicerApi.invalidateConfigCache();

//     return credential;
//   })
//   .delete("/:id", async ({ params, status }) => {
//     if (!idParamValidator.Check(params)) {
//       return status(HTTP_STATUS.BAD_REQUEST, {
//         error: "VALIDATION_ERROR",
//         message: "Invalid ID parameter",
//       });
//     }

//     const deleted = await secretVoicerCredentialRepository.delete(params.id);

//     if (!deleted) {
//       return status(HTTP_STATUS.NOT_FOUND, {
//         error: "NOT_FOUND",
//         message: `Credential with id ${params.id} not found`,
//       });
//     }

//     secretVoicerApi.invalidateConfigCache();

//     return { id: params.id };
//   });

export const FIX_THIS_FILE_LATER = 123;
