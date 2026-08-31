import { Type } from "typebox";
import { Compile } from "typebox/compile";

const CSRF_TOKEN_MIN = 1;
const CSRF_TOKEN_MAX = 512;
const SESSION_ID_MIN = 1;
const SESSION_ID_MAX = 512;

const createSecretVoicerCredentialSchema = Type.Object({
  fingerprintId: Type.String({ minLength: 1 }),
  csrfToken: Type.String({
    minLength: CSRF_TOKEN_MIN,
    maxLength: CSRF_TOKEN_MAX,
  }),
  sessionId: Type.String({
    minLength: SESSION_ID_MIN,
    maxLength: SESSION_ID_MAX,
  }),
});

const updateSecretVoicerCredentialSchema = Type.Partial(
  Type.Object({
    csrfToken: Type.String({
      minLength: CSRF_TOKEN_MIN,
      maxLength: CSRF_TOKEN_MAX,
    }),
    sessionId: Type.String({
      minLength: SESSION_ID_MIN,
      maxLength: SESSION_ID_MAX,
    }),
    isActive: Type.Boolean(),
  }),
);

export const createSecretVoicerCredentialValidator = Compile(
  createSecretVoicerCredentialSchema,
);

export const updateSecretVoicerCredentialValidator = Compile(
  updateSecretVoicerCredentialSchema,
);
