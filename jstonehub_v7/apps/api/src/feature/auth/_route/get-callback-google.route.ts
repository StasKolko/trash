import type { AuthError } from "@packages/contract/auth-error";

import type { OauthCallbackResult } from "../_model/auth.type";

import { is } from "@packages/util/guard";
import { safeJsonParse } from "@packages/util/json";
import { Elysia, t } from "elysia";
import { jwtVerify } from "jose";

import { authCookie } from "#api/service/auth/auth-cookie";
import { env, JWT_SECRET_BYTES } from "#api/shared/config/env";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { createExchangeCode } from "../_helper/auth-exchange";
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
} from "../_helper/auth-google";
import { handleOauthCallback } from "../_helper/oauth-callback";
import { AUTH_PATHS, DEFAULT_ERROR_PATH } from "../_model/auth.constant";

type _GoogleError =
  | "access_denied"
  | "invalid_request"
  | "unauthorized_client"
  | "unsupported_response_type"
  | "invalid_scope"
  | "server_error"
  | "temporarily_unavailable";

const getCallbackGoogleRoute = new Elysia().get(
  AUTH_PATHS.get.callbackGoogle,
  async ({ query, cookie, request, server, redirect }) => {
    if (query.error) {
      const authError = _mapGoogleError(query.error as _GoogleError);
      return redirect(_buildFallbackError(authError));
    }

    const cookieData = _extractAndClearOauthState(cookie);

    if (is.null(cookieData) || !query.code) {
      return redirect(_buildFallbackError("UNKNOWN"));
    }

    const stateData = await _verifyStateJwt(query.state);

    if (is.null(stateData) || !stateData.redirect) {
      return redirect(_buildFallbackError("SESSION_EXPIRED"));
    }

    const errorRedirectUrl =
      stateData.errorRedirect || _buildFallbackError("UNKNOWN");

    const tokens = await exchangeGoogleCode({
      code: query.code,
      codeVerifier: cookieData.codeVerifier,
    });

    if (is.null(tokens)) {
      return redirect(_appendError(errorRedirectUrl, "UNKNOWN"));
    }

    const userInfo = await fetchGoogleUserInfo(tokens.accessToken);

    if (is.null(userInfo)) {
      return redirect(_appendError(errorRedirectUrl, "UNKNOWN"));
    }

    const oauthResult = await handleOauthCallback({
      provider: "google",
      userInfo,
      redirect: stateData.redirect,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      ipAddress: extractIpAddress({ request, server }) ?? "unknown",
    });

    const redirectUrl = _buildCallbackRedirectUrl({
      result: oauthResult,
      redirect: stateData.redirect,
      errorRedirectUrl,
    });

    return redirect(redirectUrl);
  },
  {
    query: t.Object({
      code: t.Optional(t.String()),
      state: t.Optional(t.String()),
      error: t.Optional(t.String()),
    }),
  },
);

function _mapGoogleError(googleError: _GoogleError): AuthError {
  if (googleError === "access_denied") {
    return "UNAUTHORIZED";
  }

  return "UNKNOWN";
}

async function _verifyStateJwt(token: string | undefined) {
  if (is.undefined(token)) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);
    return {
      redirect: payload.redirect as string,
      errorRedirect: (payload.errorRedirect as string) || null,
    };
  } catch {
    return null;
  }
}

function _parseStateCookie(raw: unknown) {
  const data = is.string(raw) ? safeJsonParse(raw) : raw;

  if (is.object(data)) {
    const { state, codeVerifier } = data;

    if (is.string(state) && is.string(codeVerifier)) {
      return { state, codeVerifier };
    }
  }

  return null;
}

function _extractAndClearOauthState(
  cookie: Parameters<typeof authCookie.getOauthState>[0],
) {
  const raw = authCookie.getOauthState(cookie);
  authCookie.clearOauthState(cookie);
  return _parseStateCookie(raw);
}

function _buildCallbackRedirectUrl(params: {
  result: OauthCallbackResult;
  redirect: string;
  errorRedirectUrl: string;
}) {
  if (params.result.kind === "banned") {
    return _appendError(params.errorRedirectUrl, "BANNED");
  }

  if (params.result.kind === "link_conflict") {
    return _appendError(params.errorRedirectUrl, "UNKNOWN");
  }

  const exchangeCode = createExchangeCode({
    accessToken: params.result.accessToken,
    refreshToken: params.result.refreshToken,
  });

  const successUrl = _isAllowedRedirectUrl(params.redirect)
    ? params.redirect
    : "/";

  const separator = successUrl.includes("?") ? "&" : "?";

  return `${successUrl}${separator}auth_code=${exchangeCode}`;
}

function _buildFallbackError(error: AuthError) {
  return `${DEFAULT_ERROR_PATH}?error=${error}`;
}

function _appendError(baseUrl: string, error: string) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}error=${error}`;
}

function _isAllowedRedirectUrl(url: string) {
  return env.CORS_ORIGINS.some((origin) => url.startsWith(origin));
}

export { getCallbackGoogleRoute };
