import { generateCodeVerifier } from "arctic";
import { Elysia, t } from "elysia";
import { SignJWT } from "jose";

import { authCookie } from "#api/service/auth/auth-cookie";
import { env, JWT_SECRET_BYTES } from "#api/shared/config/env";

import { createGoogleAuthUrl } from "../_helper/auth-google";
import {
  ALLOWED_ORIGIN_PATTERN,
  AUTH_PATHS,
  DEFAULT_ERROR_PATH,
} from "../_model/auth.constant";

const _STATE_MAX_AGE_SECONDS = 600;

const getGoogleRoute = new Elysia().get(
  AUTH_PATHS.get.google,
  async ({ query, cookie, redirect }) => {
    const errorRedirect =
      query.errorRedirect || _buildDefaultErrorRedirect(query.redirect);

    const state = await _signStateJwt({
      redirect: query.redirect,
      errorRedirect,
    });
    const codeVerifier = generateCodeVerifier();
    const authUrl = createGoogleAuthUrl({ state, codeVerifier });

    authCookie.setOauthState(cookie, JSON.stringify({ state, codeVerifier }));

    return redirect(authUrl.toString());
  },
  {
    query: t.Object({
      redirect: t.String({
        minLength: 1,
        pattern: ALLOWED_ORIGIN_PATTERN,
        error: "redirect must start with an allowed origin",
      }),
      errorRedirect: t.Optional(
        t.String({
          minLength: 1,
          pattern: ALLOWED_ORIGIN_PATTERN,
          error: "errorRedirect must start with an allowed origin",
        }),
      ),
    }),
  },
);

function _signStateJwt(payload: { redirect: string; errorRedirect: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${_STATE_MAX_AGE_SECONDS}s`)
    .sign(JWT_SECRET_BYTES);
}

function _buildDefaultErrorRedirect(redirect: string) {
  try {
    const parsed = new URL(redirect);
    return `${parsed.origin}${DEFAULT_ERROR_PATH}`;
  } catch {
    return `${env.CORS_ORIGINS[0] ?? ""}${DEFAULT_ERROR_PATH}`;
  }
}

export { getGoogleRoute };
