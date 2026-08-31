import { boolean, minLength, object, partial, pipe, string } from "valibot";

const MIN_NAME_LENGTH = 3;
const MIN_TOKEN_LENGTH = 10;

const secretVoicerCredentialFields = {
  name: pipe(
    string(),
    minLength(MIN_NAME_LENGTH, "Name must be at least 3 characters"),
  ),
  fingerprintId: pipe(string(), minLength(1, "Fingerprint is required")),
  csrfToken: pipe(
    string(),
    minLength(MIN_TOKEN_LENGTH, "CSRF Token is too short"),
  ),
  sessionId: pipe(
    string(),
    minLength(MIN_TOKEN_LENGTH, "Session ID is too short"),
  ),
  isActive: boolean(),
};

export const createSecretVoicerCredentialSchema = object(
  secretVoicerCredentialFields,
);

export const updateSecretVoicerCredentialSchema = partial(
  object(secretVoicerCredentialFields),
);
