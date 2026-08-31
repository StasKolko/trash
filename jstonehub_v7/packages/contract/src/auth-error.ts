type AuthError = (typeof AUTH_ERROR)[number];

const AUTH_ERROR = [
  "UNAUTHORIZED",
  "SESSION_EXPIRED",
  "BANNED",
  "INSUFFICIENT_PERMISSION",
  "UNKNOWN",
] as const;

export type { AuthError };
export { AUTH_ERROR };
