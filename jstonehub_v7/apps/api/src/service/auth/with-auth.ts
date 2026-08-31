import { HTTP_STATUS } from "@packages/contract/http-status";
import { is } from "@packages/util/guard";
import { Elysia } from "elysia";

import { verifyAccessToken } from "./auth-token";

const withAuth = new Elysia({ name: "with-auth" }).resolve(
  { as: "scoped" },
  async ({ cookie, status }) => {
    const token = readAccessToken(cookie);

    if (is.null(token)) {
      return status(HTTP_STATUS.UNAUTHORIZED, { error: "UNAUTHORIZED" });
    }

    const payload = await verifyAccessToken(token);

    if (is.null(payload)) {
      return status(HTTP_STATUS.UNAUTHORIZED, { error: "UNAUTHORIZED" });
    }

    if (payload.isBanned) {
      return status(HTTP_STATUS.FORBIDDEN, { error: "BANNED" });
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        isBanned: payload.isBanned,
        permissions: payload.permissions,
      },
    };
  },
);

function readAccessToken(cookie: Record<string, { value: unknown }>) {
  const val = cookie.access_token?.value;

  if (is.string(val) && val.length > 0) {
    return val;
  }

  return null;
}

export { withAuth };
