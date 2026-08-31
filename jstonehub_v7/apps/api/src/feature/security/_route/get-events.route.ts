import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { securityService } from "#api/service/security/security.service";

const EVENTS_DEFAULT_LIMIT = 50;
const EVENTS_MAX_LIMIT = 100;

const getEventsRoute = new Elysia().use(withAuth).get(
  "/events",
  async ({ user, query }) => {
    const result = await securityService.listForUser({
      userId: user.id,
      limit: _parseLimit(query.limit),
      cursor: query.cursor,
      severity: _parseSeverity(query.severity),
    });

    return result;
  },
  {
    query: t.Object({
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String()),
      severity: t.Optional(t.String()),
    }),
  },
);

function _parseLimit(value: string | undefined) {
  if (!value) {
    return EVENTS_DEFAULT_LIMIT;
  }

  const num = Number(value);

  if (Number.isNaN(num) || num < 1) {
    return EVENTS_DEFAULT_LIMIT;
  }

  if (num > EVENTS_MAX_LIMIT) {
    return EVENTS_MAX_LIMIT;
  }

  return Math.floor(num);
}

function _parseSeverity(value: string | undefined) {
  if (value === "info" || value === "warning" || value === "critical") {
    return value;
  }

  return;
}

export { getEventsRoute };
