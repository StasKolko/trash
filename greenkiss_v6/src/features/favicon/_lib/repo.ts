// src/features/favicon/_lib/repo.ts
import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/shared/api/db";
import {
  type FaviconSizeJson,
  favicon,
  faviconSettings,
} from "@/shared/api/db/schemas/favicon";
import { s3DeletePrefix, s3PublicUrl, s3PutObject } from "@/shared/lib/s3";
import type { GeneratedVariant, VariantSpec } from "../_types";
import { VARIANTS } from "./config";
import { logFavicon } from "./logger";

function getMaxBytes(spec: VariantSpec): number {
  return spec.kind === "fixed" ? spec.maxBytes : spec.maxBytes;
}

export async function getOrCreateDefaultSettings() {
  const [row] = await db
    .select()
    .from(faviconSettings)
    .where(eq(faviconSettings.id, "default"));

  if (row) return row;

  const maxSizes = Object.fromEntries(
    Object.entries(VARIANTS).map(([k, v]) => [k, { maxBytes: getMaxBytes(v) }]),
  );

  await db
    .insert(faviconSettings)
    .values({
      id: "default",
      maxSizes,
      quality: 85,
      originalMinSize: 512,
      originalMaxSize: 1024,
      createdBy: "system",
      updatedBy: "system",
    })
    .onConflictDoNothing();

  const [created] = await db
    .select()
    .from(faviconSettings)
    .where(eq(faviconSettings.id, "default"));

  if (!created) {
    throw new Error("Failed to initialize favicon settings");
  }
  return created;
}

export async function updateSettingsMaxSizesAndQuality(
  maxSizes: Record<string, { maxBytes: number }>,
  quality: number,
  originalMinSize: number,
  originalMaxSize: number,
  updatedBy?: string,
) {
  await db
    .insert(faviconSettings)
    .values({
      id: "default",
      maxSizes,
      quality,
      originalMinSize,
      originalMaxSize,
      updatedBy,
    })
    .onConflictDoUpdate({
      target: faviconSettings.id,
      set: { maxSizes, quality, originalMinSize, originalMaxSize, updatedBy },
    });

  const [row] = await db
    .select()
    .from(faviconSettings)
    .where(eq(faviconSettings.id, "default"));

  if (!row) throw new Error("Failed to update settings");
  return row;
}

export async function uploadToS3Batch(id: string, gens: GeneratedVariant[]) {
  const folder = s3FolderFor(id);
  for (const v of gens) {
    await s3PutObject(`${folder}/${v.filename}`, v.buffer, v.contentType);
  }
  const manifest = generateManifestFor(id, gens);
  await s3PutObject(
    `${folder}/site.webmanifest`,
    Buffer.from(JSON.stringify(manifest)),
    "application/manifest+json",
    "public, max-age=300",
  );
}

export function generateManifestFor(id: string, gens: GeneratedVariant[]) {
  const folder = s3FolderFor(id);
  const icons = gens
    .filter(
      (g) => g.key === "android-chrome-192" || g.key === "android-chrome-512",
    )
    .map((g) => ({
      src: s3PublicUrl(`${folder}/${g.filename}`),
      sizes: `${g.width}x${g.height}`,
      type: g.contentType,
      purpose: "any maskable",
    }));
  return {
    name: "Green Kiss",
    short_name: "GK",
    icons,
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
  };
}

export async function createFaviconRecord(
  name: string,
  uploadedBy: string,
  id: string,
  gens: GeneratedVariant[],
  originalDims: { width: number; height: number },
) {
  const folder = s3FolderFor(id);
  const sizes: Record<string, FaviconSizeJson> = {};

  for (const g of gens) {
    sizes[g.key] = {
      url: s3PublicUrl(`${folder}/${g.filename}`),
      key: `${folder}/${g.filename}`,
      width: g.width,
      height: g.height,
      bytes: g.bytes,
      contentType: g.contentType,
    };
  }

  const originalUrl =
    sizes.original?.url || s3PublicUrl(`${folder}/original.png`);

  await db.insert(favicon).values({
    id,
    name,
    originalUrl,
    sizes,
    uploadedBy,
    originalWidth: originalDims.width,
    originalHeight: originalDims.height,
    isActive: false,
  });

  const [row] = await db.select().from(favicon).where(eq(favicon.id, id));
  if (!row) throw new Error("Failed to insert favicon row");
  return row;
}

export async function setActiveFavicon(id: string) {
  // Снимаем активность со всех и ставим на выбранный
  await db
    .update(favicon)
    .set({ isActive: false })
    .where(eq(favicon.isActive, true));
  await db.update(favicon).set({ isActive: true }).where(eq(favicon.id, id));
}

export async function getActiveFavicon() {
  const rows = await db
    .select()
    .from(favicon)
    .where(eq(favicon.isActive, true))
    .orderBy(desc(favicon.updatedAt))
    .limit(1);
  return rows[0] || null;
}

export async function getFaviconById(id: string) {
  const [row] = await db.select().from(favicon).where(eq(favicon.id, id));
  return row || null;
}

export async function listFavicons() {
  const rows = await db.select().from(favicon).orderBy(desc(favicon.createdAt));
  return rows;
}

export async function deleteFaviconAndFiles(id: string) {
  const folder = s3FolderFor(id);
  await s3DeletePrefix(`${folder}/`);
  await db.delete(favicon).where(eq(favicon.id, id));
  logFavicon("deleted", { id });
}

export function s3FolderFor(id: string) {
  return `branding/favicons/${id}`;
}
