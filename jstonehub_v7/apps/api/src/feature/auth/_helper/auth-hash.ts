import { createHash, randomBytes } from "node:crypto";

const _REFRESH_TOKEN_BYTES = 64;
const _HASH_ALGORITHM = "sha256";
const _HASH_ENCODING = "hex" as const;

function hashToken(token: string) {
  return createHash(_HASH_ALGORITHM).update(token).digest(_HASH_ENCODING);
}

function generateRefreshToken() {
  return randomBytes(_REFRESH_TOKEN_BYTES).toString(_HASH_ENCODING);
}

export { generateRefreshToken, hashToken };
