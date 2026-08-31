import type { RecordEventInput } from "./security.type";

import { securityRepository } from "./security.repository";

const securityService = {
  async recordEvent(input: RecordEventInput) {
    try {
      await securityRepository.insert(input);
    } catch {
      // Security logging must never break user-facing operations
    }
  },

  async listForUser(params: {
    userId: string;
    limit: number;
    cursor?: string;
    severity?: "info" | "warning" | "critical";
  }) {
    const decodedCursor = _decodeCursor(params.cursor);

    const rows = await securityRepository.findByUserId({
      userId: params.userId,
      limit: params.limit,
      beforeCreatedAt: decodedCursor,
      severity: params.severity,
    });

    const hasMore = rows.length > params.limit;
    const items = hasMore ? rows.slice(0, params.limit) : rows;

    const lastItem = items.at(-1);
    const nextCursor =
      hasMore && lastItem ? _encodeCursor(lastItem.createdAt) : null;

    return {
      items,
      nextCursor,
    };
  },
} as const;

function _encodeCursor(createdAt: Date) {
  return btoa(createdAt.toISOString());
}

function _decodeCursor(cursor: string | undefined) {
  if (!cursor) {
    return;
  }

  try {
    const decoded = atob(cursor);
    const date = new Date(decoded);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    return date;
  } catch {
    return;
  }
}

export { securityService };
