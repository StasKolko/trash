import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";
import type { InferSelectModel } from "drizzle-orm";

import type {
  oauthAccountsTable,
  sessionsTable,
  userAdminPermissionsTable,
  usersTable,
} from "./auth.table";

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
export type OauthAccount = InferSelectModel<typeof oauthAccountsTable>;
export type UserAdminPermission = InferSelectModel<
  typeof userAdminPermissionsTable
>;

export type CreateUserInput = {
  email: string;
  name: string;
  avatarUrl: string | null;
  globalRole: GlobalRole;
};

export type UpdateUserInput = Partial<{
  name: string;
  avatarUrl: string | null;
  globalRole: GlobalRole;
  isBanned: boolean;
  bannedAt: Date | null;
  bannedReason: string | null;
}>;

export type CreateOauthAccountInput = {
  provider: string;
  providerAccountId: string;
  userId: string;
};

export type CreateSessionInput = {
  userId: string;
  expiresAt: Date;
};

export type SetUserPermissionsInput = {
  userId: string;
  permissions: AdminPermission[];
  grantedBy: string;
};