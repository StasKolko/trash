import { Elysia } from "elysia";
import { secretVoicerVoicePublicControllerV1 } from "../voice";

export const secretVoicerPublicControllerV1 = new Elysia({
  prefix: "/v1/public/secret-voicer",
}).use(secretVoicerVoicePublicControllerV1);
