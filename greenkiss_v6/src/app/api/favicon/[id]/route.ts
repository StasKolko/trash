import { NextResponse } from "next/server";
import {
  deleteFaviconAndFiles,
  getFaviconById,
} from "@/features/favicon/server";
import { fail, ok } from "@/shared/api/response";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const row = await getFaviconById(id);
  if (!row) return NextResponse.json(fail("Not found"), { status: 404 });
  return NextResponse.json(ok(row));
}

export async function DELETE(_: Request, ctx: Ctx) {
  await requireAdminOrManager();
  const { id } = await ctx.params;
  const row = await getFaviconById(id);
  if (!row) return NextResponse.json(fail("Not found"), { status: 404 });
  await deleteFaviconAndFiles(id);
  return NextResponse.json(ok({}));
}
