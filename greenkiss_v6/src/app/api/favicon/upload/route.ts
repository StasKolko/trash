import { NextResponse } from "next/server";
import {
  isPng,
  validateImageDimensions,
} from "@/features/favicon/_lib/validate";
import {
  createFaviconRecord,
  generateFaviconSizes,
  getOrCreateDefaultSettings,
  setActiveFavicon,
  uploadToS3Batch,
} from "@/features/favicon/server";
import type { FaviconSizeJson } from "@/shared/api/db/schemas/favicon";
import { fail, ok } from "@/shared/api/response";
import { getSession, requireAdminOrManager } from "@/shared/lib/auth/server";
import { createId } from "@/shared/lib/id";

export async function POST(req: Request) {
  await requireAdminOrManager();

  const body = (await req.json().catch(() => null)) as {
    name?: string;
    imageBase64?: string;
    activate?: boolean;
  } | null;

  if (!body?.imageBase64) {
    return NextResponse.json(fail("imageBase64 is required"), { status: 400 });
  }

  const name = body.name?.trim() || "favicon.png";
  const b64 = body.imageBase64.replace(/^data:image\/png;base64,/, "");
  let buf: Buffer;
  try {
    buf = Buffer.from(b64, "base64");
  } catch {
    return NextResponse.json(fail("Invalid base64"), { status: 400 });
  }

  if (!(await isPng(buf))) {
    return NextResponse.json(fail("Only PNG is allowed"), { status: 415 });
  }

  try {
    // server-side валидация ограничения 512x512 и квадрата
    const dims = await validateImageDimensions(buf);

    const settings = await getOrCreateDefaultSettings();
    const id = createId();

    const gens = await generateFaviconSizes(
      id,
      buf,
      Number(settings.quality) || 85,
    );
    await uploadToS3Batch(id, gens);

    const session = await getSession();
    const uploadedBy =
      session?.user?.email ||
      session?.user?.name ||
      session?.user?.id ||
      "unknown";

    const rec = await createFaviconRecord(name, uploadedBy, id, gens, {
      width: dims.width,
      height: dims.height,
    });

    if (body.activate) {
      await setActiveFavicon(rec.id);
    }

    const sizesMap = rec.sizes as Record<string, FaviconSizeJson>;
    const responseSizes = Object.fromEntries(
      Object.entries(sizesMap).map(([k, v]) => [
        k,
        { url: v.url, width: v.width, height: v.height, bytes: v.bytes },
      ]),
    );

    return NextResponse.json(
      ok({
        id: rec.id,
        name: rec.name,
        sizes: responseSizes,
      }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid image";
    return NextResponse.json(fail(msg), { status: 400 });
  }
}
