import type { Cookie } from "elysia";

import { is } from "@packages/util/guard";

import { env } from "#api/shared/config/env";

type CookieJar = Record<string, Cookie<unknown>>;

const _IS_PRODUCTION = env.NODE_ENV === "production";

const _ACCESS_TOKEN = "access_token";
const _REFRESH_TOKEN = "refresh_token";
const _OAUTH_STATE = "oauth_state";

const _OAUTH_STATE_MAX_AGE = 600;

const _BASE_OPTIONS = {
  httpOnly: true,
  secure: _IS_PRODUCTION,
  sameSite: "lax" as const,
  path: "/",
  domain: env.COOKIE_DOMAIN,
};

const authCookie = {
  name: {
    accessToken: _ACCESS_TOKEN,
    refreshToken: _REFRESH_TOKEN,
    oauthState: _OAUTH_STATE,
  },

  setAccessToken(cookie: CookieJar, token: string) {
    cookie[_ACCESS_TOKEN]?.set({
      ..._BASE_OPTIONS,
      value: token,
      maxAge: env.ACCESS_TOKEN_EXPIRES_IN,
    });
  },

  setRefreshToken(cookie: CookieJar, token: string) {
    cookie[_REFRESH_TOKEN]?.set({
      ..._BASE_OPTIONS,
      value: token,
      maxAge: env.REFRESH_TOKEN_EXPIRES_IN,
    });
  },

  setOauthState(cookie: CookieJar, value: string) {
    cookie[_OAUTH_STATE]?.set({
      ..._BASE_OPTIONS,
      value,
      maxAge: _OAUTH_STATE_MAX_AGE,
    });
  },

  getAccessToken(cookie: CookieJar) {
    return _readCookieValue(cookie, _ACCESS_TOKEN);
  },

  getRefreshToken(cookie: CookieJar) {
    return _readCookieValue(cookie, _REFRESH_TOKEN);
  },

  getOauthState(cookie: CookieJar) {
    return cookie[_OAUTH_STATE]?.value ?? null;
  },

  clearAuth(cookie: CookieJar) {
    _clearCookie(cookie, _ACCESS_TOKEN);
    _clearCookie(cookie, _REFRESH_TOKEN);
  },

  clearOauthState(cookie: CookieJar) {
    _clearCookie(cookie, _OAUTH_STATE);
  },
};

function _readCookieValue(cookie: CookieJar, name: string) {
  const val = cookie[name]?.value;

  if (is.string(val) && val.length > 0) {
    return val;
  }

  return null;
}

function _clearCookie(cookie: CookieJar, name: string) {
  cookie[name]?.set({
    ..._BASE_OPTIONS,
    value: "",
    maxAge: 0,
  });
}

export type { CookieJar };
export { authCookie };
