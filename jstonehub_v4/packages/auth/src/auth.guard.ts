import type { GlobalRole } from "@packages/contract/role";

import type { AuthSession, AuthUser } from "./auth.type";

import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";
import { is } from "@packages/util/guard";

type AuthData = { user: AuthUser; session: AuthSession };

export const authGuard = {
  isAuthenticated(data: AuthData | null): data is AuthData {
    return is.not.null(data);
  },

  isSessionExpired(expiresAt: Date): boolean {
    return new Date(expiresAt).getTime() <= Date.now();
  },

  isBanned(user: AuthUser): boolean {
    return is.not.null(user.bannedAt);
  },

  hasMinimumRole(userRole: GlobalRole, minimumRole: GlobalRole): boolean {
    return (
      GLOBAL_ROLE_HIERARCHY[userRole] >= GLOBAL_ROLE_HIERARCHY[minimumRole]
    );
  },
};
