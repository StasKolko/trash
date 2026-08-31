import { HTTP_STATUS } from "@packages/contract/http-status";
import { and, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { db } from "#api/shared/db/instance";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";

import { AUTH_PATHS } from "../_model/auth.constant";

const deleteProviderRoute = new Elysia().use(withAuth).delete(
  AUTH_PATHS.delete.providerById,
  async ({ params, user, set }) => {
    const isLastProvider = await _hasOnlyOneProvider(user.id);

    if (isLastProvider) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Cannot unlink last provider" };
    }

    await _deleteAuthAccount({ id: params.accountId, userId: user.id });

    return { status: "ok" };
  },
  {
    params: t.Object({
      accountId: t.String({ minLength: 1 }),
    }),
  },
);

async function _hasOnlyOneProvider(userId: string) {
  const minProviderCount = 1;

  const count = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(authAccountTable)
    .where(eq(authAccountTable.userId, userId))
    .then((rows) => rows[0]?.count ?? 0);

  return count <= minProviderCount;
}

function _deleteAuthAccount(params: { id: string; userId: string }) {
  return db
    .delete(authAccountTable)
    .where(
      and(
        eq(authAccountTable.id, params.id),
        eq(authAccountTable.userId, params.userId),
      ),
    );
}

export { deleteProviderRoute };
