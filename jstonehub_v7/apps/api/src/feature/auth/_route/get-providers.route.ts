import type { ProviderInfo } from "../_model/auth.type";

import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { db } from "#api/shared/db/instance";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";

import { AUTH_PATHS } from "../_model/auth.constant";

const getProvidersRoute = new Elysia()
  .use(withAuth)
  .get(AUTH_PATHS.get.providers, async ({ user }) => {
    const providers = await _listProviders(user.id);

    return { providers };
  });

async function _listProviders(userId: string): Promise<ProviderInfo[]> {
  const accounts = await db
    .select()
    .from(authAccountTable)
    .where(eq(authAccountTable.userId, userId));

  return accounts.map((account) => ({
    id: account.id,
    provider: account.provider,
    createdAt: account.createdAt,
  }));
}

export { getProvidersRoute };
