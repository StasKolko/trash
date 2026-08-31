import "server-only";
import {
  type _Object,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "@/shared/config/env";

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});

export async function s3PutObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  cacheControl = "public, max-age=31536000, immutable",
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "public-read",
      CacheControl: cacheControl,
    }),
  );
}

export async function s3DeleteObject(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    }),
  );
}

export async function s3DeletePrefix(prefix: string): Promise<void> {
  const normalized = prefix.replace(/^\/+/, "");
  let continuationToken: string | undefined;

  do {
    const resp = await s3.send(
      new ListObjectsV2Command({
        Bucket: env.S3_BUCKET,
        Prefix: normalized,
        ContinuationToken: continuationToken,
      }),
    );

    const contents: _Object[] = resp.Contents ?? [];
    const keys: string[] = contents
      .map((c) => c.Key)
      .filter((k): k is string => typeof k === "string" && k.length > 0);

    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: env.S3_BUCKET,
          Delete: {
            Objects: keys.map((k) => ({ Key: k })),
            Quiet: true,
          },
        }),
      );
    }

    continuationToken = resp.IsTruncated
      ? resp.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

export function s3PublicUrl(key: string) {
  return `${env.CDN_BASE_URL.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}
