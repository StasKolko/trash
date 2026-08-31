import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { securityService } from "#api/service/security/security.service";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { hashToken } from "../_helper/auth-hash";
import { AUTH_PATHS } from "../_model/auth.constant";

const postLogoutRoute = new Elysia().post(
  AUTH_PATHS.post.logout,
  async ({ cookie, request, server }) => {
    const refreshTokenRaw = authCookie.getRefreshToken(cookie);

    if (refreshTokenRaw) {
      const tokenHash = hashToken(refreshTokenRaw);
      const session =
        await authRepository.session.findActive.byTokenHash(tokenHash);

      if (session) {
        await authRepository.session.delete.byId(session.id);

        await securityService.recordEvent({
          userId: session.userId,
          sessionId: session.id,
          eventType: "logout",
          severity: "info",
          ipAddress: extractIpAddress({ request, server }) ?? "unknown",
          userAgent: request.headers.get("user-agent") ?? "unknown",
          metadata: null,
        });
      }
    }

    authCookie.clearAuth(cookie);

    return { status: "ok" };
  },
);

export { postLogoutRoute };
