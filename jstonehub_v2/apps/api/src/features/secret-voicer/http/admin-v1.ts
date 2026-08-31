import { Elysia } from "elysia";
import { secretVoicerCredentialControllerV1 } from "../credential/controller-v1";
import { synthesisControllerV1 } from "../synthesis";
import { secretVoicerVoiceAdminControllerV1 } from "../voice";

export const secretVoicerAdminControllerV1 = new Elysia({
  prefix: "/v1/admin/secret-voicer",
})
  .use(secretVoicerCredentialControllerV1)
  .use(secretVoicerVoiceAdminControllerV1)
  .use(synthesisControllerV1);
