import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: postgresUrl("DATABASE_URL"),
    AUTH_SECRET: requiredString("AUTH_SECRET"),
    AUTH_TRUST_HOST: z.coerce.boolean(),
    AUTH_URL: requiredString("AUTH_URL"),
    NEXTAUTH_URL: requiredString("NEXTAUTH_URL"),

    AUTH_YANDEX_ID: requiredString("AUTH_YANDEX_ID"),
    AUTH_YANDEX_SECRET: requiredString("AUTH_YANDEX_SECRET"),

    ADMIN_EMAILS: emailList("ADMIN_EMAILS"),
    MANAGER_EMAILS: emailList("MANAGER_EMAILS"),

    S3_ENDPOINT: z.url("S3_ENDPOINT must be a valid URL"),
    S3_BUCKET: requiredString("S3_BUCKET"),
    S3_ACCESS_KEY: requiredString("S3_ACCESS_KEY"),
    S3_SECRET_KEY: requiredString("S3_SECRET_KEY"),
    S3_REGION: requiredString("S3_REGION"),
    S3_FORCE_PATH_STYLE: z.coerce.boolean(),
    CDN_BASE_URL: z.url("CDN_BASE_URL must be a valid URL"),
  },
  client: {
    NEXT_PUBLIC_ICON: requiredString("NEXT_PUBLIC_ICON"),
    NEXT_PUBLIC_CDN_BASE_URL: requiredString("NEXT_PUBLIC_CDN_BASE_URL"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ICON: process.env.NEXT_PUBLIC_ICON,
    NEXT_PUBLIC_CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_URL: process.env.AUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_YANDEX_ID: process.env.AUTH_YANDEX_ID,
    AUTH_YANDEX_SECRET: process.env.AUTH_YANDEX_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    MANAGER_EMAILS: process.env.MANAGER_EMAILS,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_REGION: process.env.S3_REGION,
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
    CDN_BASE_URL: process.env.CDN_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

function emailList(key: string) {
  return z
    .string()
    .min(1, `${key} is required`)
    .transform((raw) =>
      raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.email(`Invalid email in ${key}`))
        .min(1, `${key} cannot be empty`),
    );
}

function postgresUrl(key: string) {
  return z
    .string()
    .trim()
    .regex(/^postgres(ql)?:\/\//, `Invalid Postgres URL for ${key}`);
}
function requiredString(key: string) {
  return z.string().min(1, `${key} is required`);
}
