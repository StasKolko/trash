import { HTTP_STATUS } from "@packages/contract/http-status";
import { is } from "@packages/util/guard";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { db } from "#api/shared/db/instance";
import { userTable } from "#api/shared/db/schema/user.table";

import { loadPermissionStrings } from "../_helper/permission";
import { AUTH_PATHS } from "../_model/auth.constant";

const getContextRoute = new Elysia()
  .use(withAuth)
  .get(AUTH_PATHS.get.context, async ({ user, status }) => {
    const foundUser = await _findUserById(user.id);

    if (is.undefined(foundUser) || is.null(foundUser)) {
      return status(HTTP_STATUS.UNAUTHORIZED, { error: "UNAUTHORIZED" });
    }

    const permissions = await loadPermissionStrings(foundUser.id);

    return {
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatarUrl: foundUser.avatarUrl,
        isBanned: foundUser.isBanned,
      },
      permissions,
      energyBalance: foundUser.energyBalance.toString(),
      loginStreak: foundUser.loginStreak,
    };
  });

function _findUserById(userId: string) {
  return db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);
}

export { getContextRoute };
