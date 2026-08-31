import { S3Client } from "bun";

import { env } from "#api/shared/config/env";

const MS_PER_SECOND = 1000;
const PRESIGNED_URL_EXPIRY_SECONDS = 604_800;
const PRESIGNED_URL_EXPIRY_MS = PRESIGNED_URL_EXPIRY_SECONDS * MS_PER_SECOND;

const s3 = new S3Client({
  endpoint: `http${env.MINIO_USE_SSL ? "s" : ""}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
  accessKeyId: env.MINIO_ACCESS_KEY,
  secretAccessKey: env.MINIO_SECRET_KEY,
  bucket: env.MINIO_BUCKET,
});

function getPresignedUrl(key: string) {
  const file = s3.file(key);
  return file.presign({
    expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    method: "GET",
  });
}

function getUrlExpiry(): Date {
  return new Date(Date.now() + PRESIGNED_URL_EXPIRY_MS);
}

export const minioService = {
  getPresignedUrl,
  getUrlExpiry,
};
