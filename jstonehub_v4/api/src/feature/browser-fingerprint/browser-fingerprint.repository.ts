import type { SQL } from "drizzle-orm";

import type {
  BrowserFingerprint,
  BrowserFingerprintInsert,
  GetBrowserFingerprintsParams,
} from "./browser-fingerprint.type";

import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { browserFingerprintsTable } from "./browser-fingerprint.table";

type OrderDirection = typeof asc | typeof desc;

const SORT_COLUMN_MAP = {
  createdAt: browserFingerprintsTable.createdAt,
  label: browserFingerprintsTable.label,
} as const;

function buildConditions(params: GetBrowserFingerprintsParams): SQL[] {
  const conditions: SQL[] = [];

  if (params.query) {
    conditions.push(ilike(browserFingerprintsTable.label, `%${params.query}%`));
  }

  if (params.status !== "all") {
    const isActiveValues = params.status.map((s) => s === "active");
    conditions.push(inArray(browserFingerprintsTable.isActive, isActiveValues));
  }

  return conditions;
}

function buildOrderBy(
  sort: GetBrowserFingerprintsParams["sort"],
  order: GetBrowserFingerprintsParams["order"],
) {
  const column = SORT_COLUMN_MAP[sort];
  const direction: OrderDirection = order === "desc" ? desc : asc;
  return direction(column);
}

const browserFingerprintRepository = {
  getAll(params: GetBrowserFingerprintsParams): Promise<BrowserFingerprint[]> {
    const conditions = buildConditions(params);
    const orderBy = buildOrderBy(params.sort, params.order);

    return db
      .select()
      .from(browserFingerprintsTable)
      .where(and(...conditions))
      .orderBy(orderBy);
  },

  async getById(id: string): Promise<BrowserFingerprint | null> {
    const rows = await db
      .select()
      .from(browserFingerprintsTable)
      .where(eq(browserFingerprintsTable.id, id))
      .limit(1);

    return rows[0] ?? null;
  },

  async create(
    data: Omit<BrowserFingerprintInsert, "id" | "createdAt" | "updatedAt">,
  ): Promise<BrowserFingerprint> {
    const rows = await db
      .insert(browserFingerprintsTable)
      .values(data)
      .returning();

    const created = rows[0];
    if (!created) {
      throw new Error("Failed to create browser fingerprint");
    }
    return created;
  },

  async update(
    id: string,
    data: Partial<
      Omit<BrowserFingerprintInsert, "id" | "createdAt" | "updatedAt">
    >,
  ): Promise<BrowserFingerprint | null> {
    const rows = await db
      .update(browserFingerprintsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(browserFingerprintsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },

  async delete(id: string): Promise<BrowserFingerprint | null> {
    const rows = await db
      .delete(browserFingerprintsTable)
      .where(eq(browserFingerprintsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },
};

export { browserFingerprintRepository };
