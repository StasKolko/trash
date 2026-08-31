import type { Context } from "elysia";

import { env } from "#api/shared/config/env";

const _MS_IN_SECOND = 1000;

type CookieJar = Context["cookie"];

const COOKIE_BASE = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN,
};

function setAuthCookies(
  cookie: CookieJar,
  accessToken: string,
  refreshTokenId: string,
): void {
  cookie.access_token?.set({
    value: accessToken,
    ...COOKIE_BASE,
    path: "/",
    maxAge: env.ACCESS_TOKEN_EXPIRES_IN,
  });

  cookie.refresh_token?.set({
    value: refreshTokenId,
    ...COOKIE_BASE,
    path: "/v1/auth",
    maxAge: env.REFRESH_TOKEN_EXPIRES_IN,
  });
}

function clearAuthCookies(cookie: CookieJar): void {
  cookie.access_token?.set({
    value: "",
    ...COOKIE_BASE,
    path: "/",
    maxAge: 0,
  });

  cookie.refresh_token?.set({
    value: "",
    ...COOKIE_BASE,
    path: "/v1/auth",
    maxAge: 0,
  });
}

export { clearAuthCookies, setAuthCookies };