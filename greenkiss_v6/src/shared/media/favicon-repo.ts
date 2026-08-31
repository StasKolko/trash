import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { favicons, siteSettings } from "@/shared/api/db/schemas/site";
import { s3PublicUrl, s3PutObject } from "@/shared/cloud/s3";
import { createId } from "@/shared/lib/id";

function keys(id: string) {
  // единое место генерации ключей для бакета
  const base = `branding/favicon/${id}`;
  return {
    original: `${base}/original`,
    png: `${base}/favicon.png`,
    ico: `${base}/favicon.ico`,
  };
}

export async function getSettings() {
  const res = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  if (res.length === 0) {
    // инициализируем с дефолтами
    await db.insert(siteSettings).values({ id: 1 }).onConflictDoNothing();
    return { faviconMaxBytes: 4096, activeFaviconId: null as string | null };
  }
  const row = res[0];
  return {
    faviconMaxBytes: row.faviconMaxBytes,
    activeFaviconId: row.activeFaviconId,
  };
}

export async function updateMaxBytes(maxBytes: number) {
  await db
    .insert(siteSettings)
    .values({ id: 1, faviconMaxBytes: maxBytes })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { faviconMaxBytes: maxBytes },
    });
}

export type FaviconRow = typeof favicons.$inferSelect;

export async function listFavicons(): Promise<FaviconRow[]> {
  return db
    .select()
    .from(favicons)
    .where(eq(favicons.isDeleted, false))
    .orderBy(favicons.createdAt);
}

export async function setActiveFavicon(id: string) {
  // просто в settings
  await db
    .insert(siteSettings)
    .values({ id: 1, activeFaviconId: id })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { activeFaviconId: id },
    });
}

export async function getActiveFavicon() {
  const settings = await getSettings();
  if (!settings.activeFaviconId) return null;
  const rows = await db
    .select()
    .from(favicons)
    .where(eq(favicons.id, settings.activeFaviconId));
  return rows[0] || null;
}

export function asCdnUrls(row: FaviconRow) {
  return {
    png: s3PublicUrl(row.pngKey),
    ico: row.icoKey ? s3PublicUrl(row.icoKey) : null,
  };
}

export async function softDeleteFavicon(id: string) {
  // Мягкое удаление. Физически из S3 можно тоже удалять (по кнопке), но оставим soft.
  await db.update(favicons).set({ isDeleted: true }).where(eq(favicons.id, id));
}

export async function uploadFaviconVariant(params: {
  inputBuffer: Buffer;
  inputMime: string;
  pngBuffer: Buffer;
  icoBuffer?: Buffer;
  pngBytes: number;
  sizePx: number;
}): Promise<FaviconRow> {
  const id = createId();
  const k = keys(id);

  // оригинал — без расширения, но с корректным content-type
  await s3PutObject(k.original, params.inputBuffer, params.inputMime);
  await s3PutObject(k.png, params.pngBuffer, "image/png");
  if (params.icoBuffer) {
    await s3PutObject(k.ico, params.icoBuffer, "image/x-icon");
  }

  const [inserted] = await db
    .insert(favicons)
    .values({
      id,
      originalKey: k.original,
      originalMime: params.inputMime,
      pngKey: k.png,
      pngBytes: params.pngBytes,
      sizePx: params.sizePx,
      icoKey: params.icoBuffer ? k.ico : null,
    })
    .returning();

  return inserted;
}
