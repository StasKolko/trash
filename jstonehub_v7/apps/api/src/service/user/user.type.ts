import type { InferSelectModel } from "drizzle-orm";

import type { userTable } from "../../shared/db/schema/user.table";

type UserRow = InferSelectModel<typeof userTable>;

type AuthUser = Pick<UserRow, "id" | "email" | "isBanned"> & {
  permissions: string[];
};

type AuthContextUser = Pick<
  UserRow,
  "id" | "email" | "name" | "avatarUrl" | "isBanned"
>;

type UserListItem = Pick<
  UserRow,
  | "id"
  | "email"
  | "name"
  | "avatarUrl"
  | "isBanned"
  | "energyBalance"
  | "loginStreak"
  | "createdAt"
>;

type UserDetail = UserRow & {
  permissions: string[];
  activeSessionCount: number;
};

type CreateUserInput = Pick<UserRow, "email" | "name" | "avatarUrl">;

type UpdateUserProfileInput = Pick<UserRow, "name" | "avatarUrl">;

type BanUserInput = {
  isBanned: boolean;
  reason: string;
};

export type {
  AuthContextUser,
  AuthUser,
  BanUserInput,
  CreateUserInput,
  UpdateUserProfileInput,
  UserDetail,
  UserListItem,
  UserRow,
};
