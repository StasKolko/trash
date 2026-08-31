import process from "node:process";
import { Type } from "typebox";
import { Value } from "typebox/value";

const leadingSlash = /^\//;

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal("development"),
    Type.Literal("production"),
    Type.Literal("test"),
  ]),
  REDIS_URL: Type.String({ minLength: 1 }),
  MINIO_ENDPOINT: Type.String({ minLength: 1 }),
  MINIO_PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  MINIO_ACCESS_KEY: Type.String({ minLength: 1 }),
  MINIO_SECRET_KEY: Type.String({ minLength: 1 }),
  MINIO_USE_SSL: Type.Boolean(),
  MINIO_BUCKET: Type.String({ minLength: 1 }),
  WORKER_CONCURRENCY: Type.Number({ minimum: 1, maximum: 50 }),
  API_URL: Type.String({ minLength: 1 }),
  INTERNAL_SECRET: Type.String({ minLength: 1 }),
});

function parseEnv() {
  const raw = process.env;

  const parsed = {
    NODE_ENV: raw.NODE_ENV,
    REDIS_URL: raw.REDIS_URL,
    MINIO_ENDPOINT: raw.MINIO_ENDPOINT,
    MINIO_PORT: Number(raw.MINIO_PORT),
    MINIO_ACCESS_KEY: raw.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: raw.MINIO_SECRET_KEY,
    MINIO_USE_SSL: parseBoolean(raw.MINIO_USE_SSL),
    MINIO_BUCKET: raw.MINIO_BUCKET,
    WORKER_CONCURRENCY: Number(raw.WORKER_CONCURRENCY ?? "5"),
    API_URL: raw.API_URL,
    INTERNAL_SECRET: raw.INTERNAL_SECRET,
  };

  if (!Value.Check(EnvSchema, parsed)) {
    const errors = Value.Errors(EnvSchema, parsed);

    const errorsWithValues = [...errors].map((error) => ({
      ...error,
      value: Value.Pointer.Get(parsed, error.instancePath),
    }));

    const message = errorsWithValues
      .map((e) => {
        const envName = e.instancePath.replace(leadingSlash, "") || "root";
        const received = JSON.stringify(e.value);
        return `  • ${envName}: ${e.message} (received: ${received})`;
      })
      .join("\n");

    throw new Error(`❌ Worker: Invalid environment variables:\n${message}`);
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

export const env = parseEnv();
