import type { GoogleUserInfo, OauthCallbackResult } from "../_model/auth.type";

import { createAuditLog } from "#api/service/audit/audit.repository";
import { insertPermission } from "#api/service/permission/permission.repository";
import { env } from "#api/shared/config/env";

import { AUTH_LINK_REQUEST_TTL_MS } from "../_model/auth.type";
import { authRepository } from "../auth.repository";
import { createSessionForUser } from "./session-create";

async function handleOauthCallback(params: {
  provider: string;
  userInfo: GoogleUserInfo;
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  const existingAccount = await authRepository.findAuthAccount({
    provider: params.provider,
    providerAccountId: params.userInfo.providerAccountId,
  });

  if (existingAccount) {
    return handleExistingAccount({
      userId: existingAccount.userId,
      userInfo: params.userInfo,
      redirect: params.redirect,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });
  }

  const existingUser = await authRepository.findUserByEmail(
    params.userInfo.email,
  );

  if (existingUser) {
    return handleEmailConflict({
      existingUser,
      provider: params.provider,
      userInfo: params.userInfo,
      redirect: params.redirect,
    });
  }

  return handleNewUser({
    provider: params.provider,
    userInfo: params.userInfo,
    redirect: params.redirect,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

async function handleExistingAccount(params: {
  userId: string;
  userInfo: GoogleUserInfo;
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  await authRepository.updateUserProfile({
    userId: params.userId,
    name: params.userInfo.name,
    avatarUrl: params.userInfo.avatarUrl,
  });

  const user = await authRepository.findUserById(params.userId);

  if (!user) {
    return { kind: "banned", redirect: params.redirect };
  }

  return finalizeLogin({
    user,
    redirect: params.redirect,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

async function handleEmailConflict(params: {
  existingUser: { id: string };
  provider: string;
  userInfo: GoogleUserInfo;
  redirect: string;
}): Promise<OauthCallbackResult> {
  const expiresAt = new Date(Date.now() + AUTH_LINK_REQUEST_TTL_MS);

  await authRepository.createAuthLinkRequest({
    targetUserId: params.existingUser.id,
    provider: params.provider,
    providerAccountId: params.userInfo.providerAccountId,
    expiresAt,
  });

  return {
    kind: "link_conflict",
    email: params.userInfo.email,
    redirect: params.redirect,
  };
}

async function handleNewUser(params: {
  provider: string;
  userInfo: GoogleUserInfo;
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  const user = await authRepository.createUser({
    email: params.userInfo.email,
    name: params.userInfo.name,
    avatarUrl: params.userInfo.avatarUrl,
  });

  if (!user) {
    return { kind: "banned", redirect: params.redirect };
  }

  await authRepository.createAuthAccount({
    userId: user.id,
    provider: params.provider,
    providerAccountId: params.userInfo.providerAccountId,
  });

  if (isOwnerEmail(user.email)) {
    await insertPermission({
      userId: user.id,
      permission: "admin:all",
      grantedBy: null,
    });
  }

  await createAuditLog({
    actorId: user.id,
    targetId: user.id,
    targetType: "user",
    action: "user_created",
    reason: null,
    metadata: { provider: params.provider },
  });

  return finalizeLogin({
    user,
    redirect: params.redirect,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

async function finalizeLogin(params: {
  user: { id: string; email: string; isBanned: boolean };
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  if (params.user.isBanned) {
    return { kind: "banned", redirect: params.redirect };
  }

  const { accessToken, refreshToken } = await createSessionForUser({
    userId: params.user.id,
    email: params.user.email,
    isBanned: params.user.isBanned,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });

  return {
    kind: "success",
    userId: params.user.id,
    redirect: params.redirect,
    accessToken,
    refreshToken,
  };
}

function isOwnerEmail(email: string) {
  return email.toLowerCase() === env.OWNER_EMAIL.toLowerCase();
}

export { handleOauthCallback };
