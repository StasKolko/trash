import { env } from "#api/shared/config/env";

const AUTH_PATHS = {
  prefix: "/v1/auth",
  get: {
    google: "/google",
    context: "/context",
    sessions: "/sessions",
    providers: "/providers",
    callbackGoogle: "/callback/google",
  },
  post: {
    logout: "/logout",
    refresh: "/refresh",
    exchange: "/exchange",
  },
  delete: {
    sessions: "/sessions",
    sessionById: "/sessions/:sessionId",
    providerById: "/providers/:accountId",
  },
} as const;

const DEFAULT_ERROR_PATH = "/login";

const ALLOWED_ORIGIN_PATTERN = _buildAllowedOriginPattern();

function _buildAllowedOriginPattern() {
  const escaped = env.CORS_ORIGINS.map(_escapeForRegex);
  return `^(${escaped.join("|")})`;
}

function _escapeForRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { ALLOWED_ORIGIN_PATTERN, AUTH_PATHS, DEFAULT_ERROR_PATH };
