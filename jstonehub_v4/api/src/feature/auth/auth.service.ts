import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import type { User } from "./auth.repository";

import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";

import { env } from "#api/shared/config/env";

import { signAccessToken } from "./auth.jwt";
import { resolveAdminPermissions } from "./auth.permission";
import { authRepository } from "./auth.repository";

type AuthTokens = {
  accessToken: string;
  refreshTokenId: string;
};

type SessionData = {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    globalRole: GlobalRole;
    isBanned: boolean;
    bannedReason: string | null;
    permissions: AdminPermission[];
  };
};

type BanUserParams = {
  actorRole: GlobalRole;
  targetUserId: string;
  reason: string;
};

type UnbanUserParams = {
  actorRole: GlobalRole;
  targetUserId: string;
};

type SetRoleParams = {
  actorRole: GlobalRole;
  targetUserId: string;
  newRole: GlobalRole;
};

type SetPermissionsParams = {
  actorId: string;
  actorRole: GlobalRole;
  actorPermissions: AdminPermission[];
  targetUserId: string;
  permissions: AdminPermission[];
};

const MS_IN_SECOND = 1000;

// ─── OAuth User Resolution ───────────────────────────────────────────────────

async function findOrCreateUserFromOAuth(params: {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}): Promise<User> {
  const existingOauth = await authRepository.findOauthAccount(
    params.provider,
    params.providerAccountId,
  );

  if (existingOauth) {
    const user = await authRepository.findUserById(existingOauth.userId);
    if (!user) {
      throw new Error("OAuth account references missing user");
    }

    await authRepository.updateUser(user.id, {
      name: params.name,
      avatarUrl: params.avatarUrl,
    });

    return { ...user, name: params.name, avatarUrl: params.avatarUrl };
  }

  const existingUser = await authRepository.findUserByEmail(params.email);

  if (existingUser) {
    await authRepository.createOauthAccount({
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      userId: existingUser.id,
    });
    return existingUser;
  }

  const isOwner =
    params.email.toLowerCase() === env.OWNER_EMAIL.toLowerCase();
  const globalRole: GlobalRole = isOwner ? "owner" : "user";

  const user = await authRepository.createUser({
    email: params.email,
    name: params.name,
    avatarUrl: params.avatarUrl,
    globalRole,
  });

  await authRepository.createOauthAccount({
    provider: params.provider,
    providerAccountId: params.providerAccountId,
    userId: user.id,
  });

  return user;
}

// ─── Token Management ─────────────────────────────────────────────────────────

async function createAuthTokens(user: User): Promise<AuthTokens> {
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.globalRole as GlobalRole,
  });

  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * MS_IN_SECOND,
  );

  const session = await authRepository.createSession({
    userId: user.id,
    expiresAt,
  });

  return { accessToken, refreshTokenId: session.id };
}

async function refreshAuthTokens(
  refreshTokenId: string,
): Promise<AuthTokens | null> {
  const session = await authRepository.findSessionById(refreshTokenId);
  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await authRepository.deleteSession(session.id);
    return null;
  }

  const user = await authRepository.findUserById(session.userId);
  if (!user) {
    await authRepository.deleteSession(session.id);
    return null;
  }

  if (user.isBanned) {
    await authRepository.deleteAllUserSessions(user.id);
    return null;
  }

  // Rotate: delete old session, create new
  await authRepository.deleteSession(session.id);

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.globalRole as GlobalRole,
  });

  const newExpiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * MS_IN_SECOND,
  );

  const newSession = await authRepository.createSession({
    userId: user.id,
    expiresAt: newExpiresAt,
  });

  return { accessToken, refreshTokenId: newSession.id };
}

async function logout(refreshTokenId: string): Promise<void> {
  await authRepository.deleteSession(refreshTokenId);
}

async function logoutAll(userId: string): Promise<number> {
  return authRepository.deleteAllUserSessions(userId);
}

// ─── Session Data ─────────────────────────────────────────────────────────────

async function getSessionData(userId: string): Promise<SessionData | null> {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    return null;
  }

  const customPermissions =
    await authRepository.getUserAdminPermissions(userId);

  const permissions = resolveAdminPermissions(
    user.globalRole as GlobalRole,
    customPermissions,
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      globalRole: user.globalRole as GlobalRole,
      isBanned: user.isBanned,
      bannedReason: user.bannedReason,
      permissions,
    },
  };
}

// ─── User Management ──────────────────────────────────────────────────────────

async function banUser(params: BanUserParams): Promise<User> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  const targetRole = target.globalRole as GlobalRole;
  if (GLOBAL_ROLE_HIERARCHY[params.actorRole] <= GLOBAL_ROLE_HIERARCHY[targetRole]) {
    throw new Error("Cannot ban user with equal or higher role");
  }

  // Ban: set flag, downgrade to user, clear custom permissions, kill sessions
  await authRepository.updateUser(target.id, {
    isBanned: true,
    bannedAt: new Date(),
    bannedReason: params.reason,
    globalRole: "user",
  });

  await authRepository.deleteUserAdminPermissions(target.id);
  await authRepository.deleteAllUserSessions(target.id);

  const updated = await authRepository.findUserById(target.id);
  if (!updated) {
    throw new Error("User not found after ban");
  }
  return updated;
}

async function unbanUser(params: UnbanUserParams): Promise<User> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  if (!target.isBanned) {
    throw new Error("User is not banned");
  }

  await authRepository.updateUser(target.id, {
    isBanned: false,
    bannedAt: null,
    bannedReason: null,
  });

  const updated = await authRepository.findUserById(target.id);
  if (!updated) {
    throw new Error("User not found after unban");
  }
  return updated;
}

async function setUserRole(params: SetRoleParams): Promise<User> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  const targetRole = target.globalRole as GlobalRole;
  if (GLOBAL_ROLE_HIERARCHY[params.actorRole] <= GLOBAL_ROLE_HIERARCHY[targetRole]) {
    throw new Error("Cannot change role of user with equal or higher role");
  }

  if (GLOBAL_ROLE_HIERARCHY[params.actorRole] <= GLOBAL_ROLE_HIERARCHY[params.newRole]) {
    throw new Error("Cannot assign role equal to or higher than your own");
  }

  if (params.newRole === "owner") {
    throw new Error("Cannot assign owner role");
  }

  // Reset custom permissions when role changes
  await authRepository.deleteUserAdminPermissions(target.id);

  await authRepository.updateUser(target.id, {
    globalRole: params.newRole,
  });

  // Kill sessions so new role takes effect immediately on next refresh
  await authRepository.deleteAllUserSessions(target.id);

  const updated = await authRepository.findUserById(target.id);
  if (!updated) {
    throw new Error("User not found after role change");
  }
  return updated;
}

async function setUserPermissions(
  params: SetPermissionsParams,
): Promise<AdminPermission[]> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  const targetRole = target.globalRole as GlobalRole;

  if (targetRole === "user") {
    throw new Error("Cannot assign admin permissions to user role");
  }

  if (
    GLOBAL_ROLE_HIERARCHY[params.actorRole]
    <= GLOBAL_ROLE_HIERARCHY[targetRole]
  ) {
    throw new Error(
      "Cannot set permissions for user with equal or higher role",
    );
  }

  // Validate: actor can only grant permissions they themselves have
  for (const permission of params.permissions) {
    if (!params.actorPermissions.includes(permission)) {
      throw new Error(
        `Cannot grant permission "${permission}" — you don't have it`,
      );
    }
  }

  await authRepository.setUserAdminPermissions(
    target.id,
    params.permissions,
    params.actorId,
  );

  // Kill sessions so new permissions take effect on next refresh
  await authRepository.deleteAllUserSessions(target.id);

  return authRepository.getUserAdminPermissions(target.id);
}

// ─── Export ───────────────────────────────────────────────────────────────────

const authService = {
  findOrCreateUserFromOAuth,
  createAuthTokens,
  refreshAuthTokens,
  logout,
  logoutAll,
  getSessionData,
  banUser,
  unbanUser,
  setUserRole,
  setUserPermissions,
};

export type { AuthTokens, SessionData };
export { authService };