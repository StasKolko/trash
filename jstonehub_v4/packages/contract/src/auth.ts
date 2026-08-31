export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export const AUTH_ERROR_CODES = [
  "UNKNOWN",
  "UNAUTHORIZED",
  "SESSION_EXPIRED",
  "BANNED",
  "INSUFFICIENT_ROLE",
] as const;

export const AUTH_ERROR_HTTP_STATUS: Record<AuthErrorCode, number> = {
  UNKNOWN: 500,
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 401,
  BANNED: 403,
  INSUFFICIENT_ROLE: 403,
};

export const AUTH_ERROR_MESSAGE: Record<AuthErrorCode, string> = {
  UNKNOWN: "An unexpected error occurred. Please try again.",
  UNAUTHORIZED: "You need to sign in to continue.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  BANNED: "Your account has been suspended.",
  INSUFFICIENT_ROLE:
    "You don't have the required permissions to access this application.",
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  globalRole: string;
  isBanned: boolean;
  bannedReason: string | null;
};

export type SessionResponse =
  | { user: SessionUser & { permissions: string[] } }
  | { user: null };