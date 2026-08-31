import { NextResponse } from "next/server";
import {
  getOrCreateDefaultSettings,
  updateSettingsMaxSizesAndQuality,
  VARIANTS,
} from "@/features/favicon/server";
import { fail, ok } from "@/shared/api/response";
import { getSession, requireAdminOrManager } from "@/shared/lib/auth/server";

export async function GET() {
  const s = await getOrCreateDefaultSettings();
  return NextResponse.json(
    ok({
      id: s.id,
      maxSizes: s.maxSizes,
      quality: Number(s.quality),
      originalMinSize: Number(s.originalMinSize),
      originalMaxSize: Number(s.originalMaxSize),
      createdBy: s.createdBy,
      updatedBy: s.updatedBy,
      createdAt: s.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: s.updatedAt?.toISOString?.() || new Date().toISOString(),
    }),
  );
}

export async function PATCH(req: Request) {
  await requireAdminOrManager();

  const body = (await req.json().catch(() => null)) as {
    maxSizes?: Record<string, { maxBytes: number }>;
    quality?: number;
    originalMinSize?: number;
    originalMaxSize?: number;
  } | null;

  if (!body) return NextResponse.json(fail("Invalid JSON"), { status: 400 });

  const {
    maxSizes,
    quality = 85,
    originalMinSize = 512,
    originalMaxSize = 1024,
  } = body;

  if (!maxSizes) {
    return NextResponse.json(fail("maxSizes required"), { status: 400 });
  }
  for (const [k, v] of Object.entries(maxSizes)) {
    if (!(k in VARIANTS)) {
      return NextResponse.json(fail(`Unknown variant: ${k}`), { status: 400 });
    }
    if (!v || typeof v.maxBytes !== "number" || v.maxBytes < 256) {
      return NextResponse.json(fail(`Invalid maxBytes for ${k}`), {
        status: 400,
      });
    }
  }
  if (typeof quality !== "number" || quality < 1 || quality > 95) {
    return NextResponse.json(fail("quality must be 1..95"), { status: 400 });
  }
  if (
    typeof originalMinSize !== "number" ||
    typeof originalMaxSize !== "number" ||
    originalMinSize < 64 ||
    originalMaxSize < originalMinSize
  ) {
    return NextResponse.json(fail("Invalid originalMinSize/originalMaxSize"), {
      status: 400,
    });
  }

  const session = await getSession();
  const updatedBy =
    session?.user?.email ||
    session?.user?.name ||
    session?.user?.id ||
    "unknown";

  const s = await updateSettingsMaxSizesAndQuality(
    maxSizes,
    quality,
    originalMinSize,
    originalMaxSize,
    updatedBy,
  );

  return NextResponse.json(
    ok({
      id: s.id,
      maxSizes: s.maxSizes,
      quality: Number(s.quality),
      originalMinSize: Number(s.originalMinSize),
      originalMaxSize: Number(s.originalMaxSize),
      createdBy: s.createdBy,
      updatedBy: s.updatedBy,
      createdAt: s.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: s.updatedAt?.toISOString?.() || new Date().toISOString(),
    }),
  );
}
