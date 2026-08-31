import type { Readable } from "node:stream";

import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

import { env } from "#worker/shared/config/env";

import { minioClient } from "./client";

const bucket = env.MINIO_BUCKET;

async function downloadToFile(key: string, destPath: string): Promise<void> {
  const stream: Readable = await minioClient.getObject(bucket, key);
  const writeStream = createWriteStream(destPath);
  await pipeline(stream, writeStream);
}

async function uploadFromFile(key: string, filePath: string): Promise<void> {
  await minioClient.fPutObject(bucket, key, filePath);
}

async function uploadBuffer(key: string, buffer: Buffer): Promise<void> {
  await minioClient.putObject(bucket, key, buffer, buffer.length);
}

async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await minioClient.removeObjects(bucket, keys);
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucket, key);
    return true;
  } catch {
    return false;
  }
}

export const workerStorage = {
  downloadToFile,
  uploadFromFile,
  uploadBuffer,
  deleteObjects,
  objectExists,
};