import type { BucketItemStat } from "minio";

import { CopyConditions } from "minio";

import { env } from "#api/shared/config/env";

import { minioClient } from "./client";

type StorageObject = {
  key: string;
  size: number;
  lastModified: Date;
};

const bucket = env.MINIO_BUCKET;
const PRESIGNED_UPLOAD_EXPIRY_DEFAULT = 3600;
const PRESIGNED_DOWNLOAD_EXPIRY_DEFAULT = 86_400;

async function getPresignedUploadUrl(
  key: string,
  expirySeconds = PRESIGNED_UPLOAD_EXPIRY_DEFAULT,
): Promise<string> {
  return minioClient.presignedPutObject(bucket, key, expirySeconds);
}

async function getPresignedDownloadUrl(
  key: string,
  expirySeconds = PRESIGNED_DOWNLOAD_EXPIRY_DEFAULT,
): Promise<string> {
  return minioClient.presignedGetObject(bucket, key, expirySeconds);
}

async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await minioClient.removeObjects(bucket, keys);
}

async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(bucket, key);
}

async function deletePrefix(prefix: string): Promise<void> {
  const keys: string[] = [];
  const stream = minioClient.listObjectsV2(bucket, prefix, true);

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (obj) => {
      if (obj.name) keys.push(obj.name);
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  if (keys.length > 0) {
    await minioClient.removeObjects(bucket, keys);
  }
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucket, key);
    return true;
  } catch {
    return false;
  }
}

async function uploadBuffer(key: string, buffer: Buffer): Promise<void> {
  await minioClient.putObject(bucket, key, buffer, buffer.length);
}

async function copyObject(
  sourceKey: string,
  destKey: string,
): Promise<void> {
  const conditions = new CopyConditions();
  await minioClient.copyObject(
    bucket,
    destKey,
    `/${bucket}/${sourceKey}`,
    conditions,
  );
}

async function statObject(key: string): Promise<BucketItemStat> {
  return minioClient.statObject(bucket, key);
}

async function listObjects(prefix: string): Promise<StorageObject[]> {
  const objects: StorageObject[] = [];
  const stream = minioClient.listObjectsV2(bucket, prefix, true);

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (obj) => {
      if (obj.name) {
        objects.push({
          key: obj.name,
          size: obj.size ?? 0,
          lastModified: obj.lastModified ?? new Date(),
        });
      }
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  return objects;
}

async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }
}

export type { StorageObject };
export const storage = {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteObjects,
  deleteObject,
  deletePrefix,
  objectExists,
  uploadBuffer,
  copyObject,
  statObject,
  listObjects,
  ensureBucket,
};