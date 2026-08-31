import process from "node:process";
import { Type } from "typebox";
import { Value } from "typebox/value";

const LEADING_SLASH_REGEX = /^\//;
const TRAILING_SLASH_REGEX = /\/$/;

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal("development"),
    Type.Literal("production"),
    Type.Literal("test"),
  ]),

  PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  API_URL: Type.String({ minLength: 1 }),
  CORS_ORIGINS: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),

  DATABASE_URL: Type.String({ minLength: 1 }),
  REDIS_URL: Type.String({ minLength: 1 }),
  MINIO_ENDPOINT: Type.String({ minLength: 1 }),
  MINIO_PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  MINIO_ACCESS_KEY: Type.String({ minLength: 1 }),
  MINIO_SECRET_KEY: Type.String({ minLength: 1 }),
  MINIO_USE_SSL: Type.Boolean(),
  MINIO_BUCKET: Type.String({ minLength: 1 }),

  JWT_SECRET: Type.String({ minLength: 1 }),
  JWT_ISSUER: Type.String({ minLength: 1 }),
  JWT_AUDIENCE: Type.String({ minLength: 1 }),
  INTERNAL_SECRET: Type.String({ minLength: 1 }),
  GOOGLE_CLIENT_ID: Type.String({ minLength: 1 }),
  GOOGLE_CLIENT_SECRET: Type.String({ minLength: 1 }),

  COOKIE_DOMAIN: Type.String({ minLength: 1 }),
  ACCESS_TOKEN_EXPIRES_IN: Type.Number({ minimum: 1 }),
  REFRESH_TOKEN_EXPIRES_IN: Type.Number({ minimum: 1 }),

  OWNER_EMAIL: Type.String({ minLength: 1 }),

  // When true, trust inbound x-request-id from clients (use behind trusted proxy only).
  // Defaults: dev=true (easier debugging), prod=false (prevents log poisoning, CWE-117).
  TRUST_INBOUND_REQUEST_ID: Type.Boolean(),
});

function parseEnv() {
  const raw = process.env;

  const parsed = {
    NODE_ENV: raw.NODE_ENV,

    PORT: Number(raw.PORT),
    API_URL: raw.API_URL,
    CORS_ORIGINS: parseAndNormalizeOrigins(raw.CORS_ORIGINS),

    DATABASE_URL: raw.DATABASE_URL,
    REDIS_URL: raw.REDIS_URL,
    MINIO_ENDPOINT: raw.MINIO_ENDPOINT,
    MINIO_PORT: Number(raw.MINIO_PORT),
    MINIO_ACCESS_KEY: raw.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: raw.MINIO_SECRET_KEY,
    MINIO_USE_SSL: parseBoolean(raw.MINIO_USE_SSL),
    MINIO_BUCKET: raw.MINIO_BUCKET,

    JWT_SECRET: raw.JWT_SECRET,
    JWT_ISSUER: raw.JWT_ISSUER,
    JWT_AUDIENCE: raw.JWT_AUDIENCE,
    INTERNAL_SECRET: raw.INTERNAL_SECRET,
    GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET,

    COOKIE_DOMAIN: raw.COOKIE_DOMAIN,
    ACCESS_TOKEN_EXPIRES_IN: Number(raw.ACCESS_TOKEN_EXPIRES_IN),
    REFRESH_TOKEN_EXPIRES_IN: Number(raw.REFRESH_TOKEN_EXPIRES_IN),

    OWNER_EMAIL: raw.OWNER_EMAIL,

    TRUST_INBOUND_REQUEST_ID: parseBooleanWithDefault(
      raw.TRUST_INBOUND_REQUEST_ID,
      raw.NODE_ENV !== "production",
    ),
  };

  if (!Value.Check(EnvSchema, parsed)) {
    const errors = Value.Errors(EnvSchema, parsed);

    const errorsWithValues = [...errors].map((error) => ({
      ...error,
      value: Value.Pointer.Get(parsed, error.instancePath),
    }));

    const message = errorsWithValues
      .map((e) => {
        const envName =
          e.instancePath.replace(LEADING_SLASH_REGEX, "") || "root";
        const received = JSON.stringify(e.value);
        return `  • ${envName}: ${e.message} (received: ${received})`;
      })
      .join("\n");

    throw new Error(`❌ API: Invalid environment variables:\n${message}`);
  }

  return parsed;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
  return;
}

function parseBooleanWithDefault(
  value: string | undefined,
  fallback: boolean,
): boolean {
  const parsed = parseBoolean(value);
  if (parsed === undefined) {
    return fallback;
  }
  return parsed;
}

function parseAndNormalizeOrigins(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map(normalizeOrigin);
}

function normalizeOrigin(url: string) {
  return url.replace(TRAILING_SLASH_REGEX, "");
}

const env = parseEnv();

const JWT_SECRET_BYTES = new TextEncoder().encode(env.JWT_SECRET);

export { env, JWT_SECRET_BYTES };