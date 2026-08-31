import { NextResponse } from "next/server";
import { listFavicons } from "@/features/favicon/server";
import { ok } from "@/shared/api/response";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

export async function GET() {
  await requireAdminOrManager();
  const items = await listFavicons();
  return NextResponse.json(ok(items));
}
