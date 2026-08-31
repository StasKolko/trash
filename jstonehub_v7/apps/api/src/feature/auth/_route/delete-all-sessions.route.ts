import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { withAuth } from "#api/service/auth/with-auth";
import { securityService } from "#api/service/security/security.service";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { AUTH_PATHS } from "../_model/auth.constant";

const deleteAllSessionsRoute = new Elysia()
  .use(withAuth)
  .delete(
    AUTH_PATHS.delete.sessions,
    async ({ user, cookie, request, server }) => {
      const count = await authRepository.session.delete.allByUserId(user.id);

      await securityService.recordEvent({
        userId: user.id,
        sessionId: null,
        eventType: "all_sessions_revoked",
        severity: "info",
        ipAddress: extractIpAddress({ request, server }) ?? "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
        metadata: { revokedCount: count },
      });

      authCookie.clearAuth(cookie);

      return { status: "ok" };
    },
  );

export { deleteAllSessionsRoute };
