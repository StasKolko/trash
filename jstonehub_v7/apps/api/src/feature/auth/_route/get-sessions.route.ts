import type { SessionInfo } from "../_model/auth.type";

import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { withAuth } from "#api/service/auth/with-auth";
import { parseUserAgent } from "#api/shared/helper/user-agent";

import { hashToken } from "../_helper/auth-hash";
import { AUTH_PATHS } from "../_model/auth.constant";

const getSessionsRoute = new Elysia()
  .use(withAuth)
  .get(AUTH_PATHS.get.sessions, async ({ user, cookie }) => {
    const sessions = await _listSessions({
      userId: user.id,
      currentRefreshToken: authCookie.getRefreshToken(cookie),
    });

    return { sessions };
  });

async function _listSessions(params: {
  userId: string;
  currentRefreshToken: string | null;
}): Promise<SessionInfo[]> {
  const sessions =
    await authRepository.session.findActive.allByUserIdSuspiciousFirst(
      params.userId,
    );

  const currentHash = params.currentRefreshToken
    ? hashToken(params.currentRefreshToken)
    : null;

  return sessions.map((session) => {
    const device = parseUserAgent(session.userAgent);

    return {
      id: session.id,
      deviceType: device.deviceType,
      os: device.os,
      browser: device.browser,
      ipAddress: session.ipAddress,
      isSuspicious: session.isSuspicious,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      isCurrent: session.token === currentHash,
    };
  });
}

export { getSessionsRoute };
