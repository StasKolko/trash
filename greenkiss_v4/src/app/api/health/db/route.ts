import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/shared/api/db";

export async function GET() {
  const startedAt = Date.now();
  try {
    await db.execute(sql`select 1`);
    const ms = Date.now() - startedAt;
    return NextResponse.json(
      {
        status: "ok",
        db: "reachable",
        latency_ms: ms,
        timestamp: new Date().toISOString(),
        service: "greenkiss-web",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const ms = Date.now() - startedAt;
    return NextResponse.json(
      {
        status: "degraded",
        db: "unreachable",
        latency_ms: ms,
        error: err instanceof Error ? err.message : "unknown",
        timestamp: new Date().toISOString(),
        service: "greenkiss-web",
      },
      { status: 503 },
    );
  }
}
