import { HTTP_STATUS } from "@packages/contract/http-status";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { checkFingerprint } from "#api/service/security/_helper/fingerprint.helper";
import { securityService } from "#api/service/security/security.service";
import { db } from "#api/shared/db/instance";
import { userTable } from "#api/shared/db/schema/user.table";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { hashToken } from "../_helper/auth-hash";
import { loadPermissionStrings } from "../_helper/permission";
import { createNewSession } from "../_helper/session-create";
import { AUTH_PATHS } from "../_model/auth.constant";

const postRefreshRoute = new Elysia().post(
  AUTH_PATHS.post.refresh,
  async ({ cookie, request, server, set }) => {
    const refreshTokenRaw = authCookie.getRefreshToken(cookie);

    if (!refreshTokenRaw) {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const result = await _refreshSession({
      refreshToken: refreshTokenRaw,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      ipAddress: extractIpAddress({ request, server }) ?? "unknown",
    });

    if (result.kind === "reuse_detected") {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "SESSION_EXPIRED" };
    }

    if (result.kind === "invalid") {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "SESSION_EXPIRED" };
    }

    if (result.kind === "banned") {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.FORBIDDEN;
      return { error: "BANNED" };
    }

    authCookie.setAccessToken(cookie, result.accessToken);
    authCookie.setRefreshToken(cookie, result.refreshToken);

    return { status: "ok" };
  },
);

type _RefreshResult =
  | { kind: "invalid" }
  | { kind: "banned" }
  | { kind: "reuse_detected" }
  | { kind: "success"; accessToken: string; refreshToken: string };

async function _refreshSession(params: {
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
}): Promise<_RefreshResult> {
  const tokenHash = hashToken(params.refreshToken);

  const reuseAttempt =
    await authRepository.session.detectReuse.byTokenHash(tokenHash);

  if (reuseAttempt) {
    await _handleReuseAttack({
      userId: reuseAttempt.userId,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });

    return { kind: "reuse_detected" };
  }

  const session =
    await authRepository.session.findActive.byTokenHash(tokenHash);

  if (!session) {
    return { kind: "invalid" };
  }

  const user = await _findUserById(session.userId);

  if (!user) {
    await authRepository.session.delete.byId(session.id);
    return { kind: "invalid" };
  }

  if (user.isBanned) {
    await authRepository.session.delete.allByUserId(user.id);
    return { kind: "banned" };
  }

  const fingerprintResult = checkFingerprint({
    createdUserAgent: session.createdUserAgent,
    createdIpAddress: session.createdIpAddress,
    currentUserAgent: params.userAgent,
    currentIpAddress: params.ipAddress,
  });

  await authRepository.session.update.markRevoked(session.id);

  if (fingerprintResult.isSuspicious) {
    await securityService.recordEvent({
      userId: user.id,
      sessionId: session.id,
      eventType: "suspicious_activity",
      severity: "warning",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reasons: fingerprintResult.reasons },
    });
  }

  const permissions = await loadPermissionStrings(user.id);

  const {
    accessToken,
    refreshToken,
    sessionId: newSessionId,
  } = await createNewSession({
    userId: user.id,
    email: user.email,
    isBanned: user.isBanned,
    permissions,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
    eventType: "refresh_rotated",
  });

  if (fingerprintResult.isSuspicious && newSessionId) {
    await authRepository.session.update.markSuspicious(newSessionId);
  }

  return { kind: "success", accessToken, refreshToken };
}

async function _handleReuseAttack(params: {
  userId: string;
  userAgent: string;
  ipAddress: string;
}) {
  await authRepository.session.delete.allByUserId(params.userId);

  await securityService.recordEvent({
    userId: params.userId,
    sessionId: null,
    eventType: "token_reuse_detected",
    severity: "critical",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: null,
  });
}

function _findUserById(userId: string) {
  return db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);
}

export { postRefreshRoute };
