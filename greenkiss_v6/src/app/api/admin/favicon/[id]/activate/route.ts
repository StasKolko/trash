import { NextResponse } from "next/server";
import { getFaviconById, setActiveFavicon } from "@/features/favicon/server";
import { fail, ok } from "@/shared/api/response";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_: Request, ctx: Ctx) {
  await requireAdminOrManager();
  const { id } = await ctx.params;
  const row = await getFaviconById(id);
  if (!row) return NextResponse.json(fail("Not found"), { status: 404 });
  await setActiveFavicon(id);
  return NextResponse.json(ok({ id }));
}
