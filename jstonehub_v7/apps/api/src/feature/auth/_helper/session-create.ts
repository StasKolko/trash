import { authRepository } from "#api/service/auth/auth.repository";
import { generateAccessToken } from "#api/service/auth/auth-token";
import { securityService } from "#api/service/security/security.service";

import { generateRefreshToken, hashToken } from "./auth-hash";
import { loadPermissionStrings } from "./permission";

async function createNewSession(params: {
  userId: string;
  email: string;
  isBanned: boolean;
  permissions: string[];
  userAgent: string;
  ipAddress: string;
  eventType: "login_success" | "refresh_rotated";
}) {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  const { sessionId, removedOldestId } =
    await authRepository.session.create.one({
      userId: params.userId,
      tokenHash,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });

  const accessToken = await generateAccessToken({
    sub: params.userId,
    email: params.email,
    isBanned: params.isBanned,
    permissions: params.permissions,
  });

  await securityService.recordEvent({
    userId: params.userId,
    sessionId,
    eventType: params.eventType,
    severity: "info",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: null,
  });

  if (removedOldestId) {
    await securityService.recordEvent({
      userId: params.userId,
      sessionId: null,
      eventType: "session_limit_exceeded",
      severity: "info",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { removedSessionId: removedOldestId },
    });
  }

  return { accessToken, refreshToken, sessionId };
}

async function createSessionForUser(params: {
  userId: string;
  email: string;
  isBanned: boolean;
  userAgent: string;
  ipAddress: string;
}) {
  const permissions = await loadPermissionStrings(params.userId);

  return createNewSession({
    userId: params.userId,
    email: params.email,
    isBanned: params.isBanned,
    permissions,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
    eventType: "login_success",
  });
}

export { createNewSession, createSessionForUser };
