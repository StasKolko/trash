import { HTTP_STATUS } from "@packages/contract/http-status";
import { Elysia, t } from "elysia";

import { authCookie } from "#api/service/auth/auth-cookie";

import { consumeExchangeCode } from "../_helper/auth-exchange";
import { AUTH_PATHS } from "../_model/auth.constant";

const postExchangeRoute = new Elysia().post(
  AUTH_PATHS.post.exchange,
  ({ body, cookie, set }) => {
    const result = consumeExchangeCode(body.code);

    if (result.kind === "not_found") {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "INVALID_CODE" };
    }

    if (result.kind === "expired") {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "CODE_EXPIRED" };
    }

    authCookie.setAccessToken(cookie, result.accessToken);
    authCookie.setRefreshToken(cookie, result.refreshToken);

    return { status: "ok" };
  },
  {
    body: t.Object({
      code: t.String({ minLength: 1 }),
    }),
  },
);

export { postExchangeRoute };
