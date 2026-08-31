import { Elysia, t } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { withAuth } from "#api/service/auth/with-auth";
import { securityService } from "#api/service/security/security.service";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { AUTH_PATHS } from "../_model/auth.constant";

const deleteSessionRoute = new Elysia().use(withAuth).delete(
  AUTH_PATHS.delete.sessionById,
  async ({ params, user, request, server }) => {
    const deleted = await authRepository.session.delete.byIdAndUserId({
      sessionId: params.sessionId,
      userId: user.id,
    });

    if (deleted) {
      await securityService.recordEvent({
        userId: user.id,
        sessionId: params.sessionId,
        eventType: "session_revoked",
        severity: "info",
        ipAddress: extractIpAddress({ request, server }) ?? "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
        metadata: null,
      });
    }

    return { status: "ok" };
  },
  {
    params: t.Object({
      sessionId: t.String({ minLength: 1 }),
    }),
  },
);

export { deleteSessionRoute };
