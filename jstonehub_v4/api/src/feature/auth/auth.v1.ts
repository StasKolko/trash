import { generateCodeVerifier, generateState } from "arctic";
import { Elysia } from "elysia";

import { env } from "#api/shared/config/env";
import { HTTP_STATUS } from "#api/shared/config/http-status";

import { clearAuthCookies, setAuthCookies } from "./auth.cookie";
import { authPlugin, requireAuth } from "./auth.middleware";
import { fetchGoogleUserInfo, google } from "./auth.oauth";
import { authService } from "./auth.service";

const OAUTH_STATE_COOKIE_MAX_AGE = 600; // 10 min
const OAUTH_STATE_SEPARATOR = "|";

export const authV1 = new Elysia({ prefix: "/v1/auth" })
  .use(authPlugin)
  .onError(({ error, set }) => {
    // biome-ignore lint/suspicious/noConsole: Auth error logging
    console.error("❌ [auth] Route error:", error);
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })

  // ─── Google OAuth Start ─────────────────────────────────────────────────────
  .get("/google", async ({ query, cookie, set }) => {
    const origin = (query.origin as string) || env.HUB_URL;
    const redirect = (query.redirect as string) || "/";

    const state = `${generateState()}${OAUTH_STATE_SEPARATOR}${origin}${OAUTH_STATE_SEPARATOR}${redirect}`;
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);

    cookie.oauth_state?.set({
      value: state,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/v1/auth",
      maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
    });

    cookie.oauth_code_verifier?.set({
      value: codeVerifier,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/v1/auth",
      maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
    });

    set.redirect = url.toString();
  })

  // ─── Google OAuth Callback ──────────────────────────────────────────────────
  .get("/google/callback", async ({ query, cookie, set }) => {
    const code = query.code as string | undefined;
    const stateParam = query.state as string | undefined;
    const storedState = cookie.oauth_state?.value;
    const codeVerifier = cookie.oauth_code_verifier?.value;

    // Clean up OAuth cookies
    cookie.oauth_state?.set({ value: "", path: "/v1/auth", maxAge: 0 });
    cookie.oauth_code_verifier?.set({
      value: "",
      path: "/v1/auth",
      maxAge: 0,
    });

    if (!(code && stateParam && storedState && codeVerifier)) {
      set.redirect = `${env.HUB_URL}/login?error=UNAUTHORIZED`;
      return;
    }

    if (stateParam !== storedState) {
      set.redirect = `${env.HUB_URL}/login?error=UNAUTHORIZED`;
      return;
    }

    const [, origin, redirect] = stateParam.split(OAUTH_STATE_SEPARATOR);
    const targetOrigin = origin || env.HUB_URL;
    const targetRedirect = redirect || "/";

    try {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      const googleUser = await fetchGoogleUserInfo(tokens.accessToken());

      const user = await authService.findOrCreateUserFromOAuth({
        provider: "google",
        providerAccountId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
      });

      if (user.isBanned) {
        set.redirect = `${targetOrigin}/login?error=BANNED`;
        return;
      }

      const authTokens = await authService.createAuthTokens(user);
      setAuthCookies(cookie, authTokens.accessToken, authTokens.refreshTokenId);

      set.redirect = `${targetOrigin}${targetRedirect}`;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: OAuth error logging
      console.error("❌ [auth] Google callback error:", error);
      set.redirect = `${targetOrigin}/login?error=UNKNOWN`;
    }
  })

  // ─── Session ────────────────────────────────────────────────────────────────
  .get("/session", async ({ authUser }) => {
    if (!authUser) {
      return { user: null };
    }

    const session = await authService.getSessionData(authUser.sub);
    if (!session) {
      return { user: null };
    }

    return session;
  })

  // ─── Refresh ────────────────────────────────────────────────────────────────
  .post("/refresh", async ({ cookie, set }) => {
    const refreshTokenId = cookie.refresh_token?.value;
    if (!refreshTokenId) {
      clearAuthCookies(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED", message: "No refresh token" };
    }

    const result = await authService.refreshAuthTokens(refreshTokenId);
    if (!result) {
      clearAuthCookies(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "SESSION_EXPIRED", message: "Session expired" };
    }

    setAuthCookies(cookie, result.accessToken, result.refreshTokenId);
    return { success: true };
  })

  // ─── Logout ─────────────────────────────────────────────────────────────────
  .post("/logout", async ({ cookie }) => {
    const refreshTokenId = cookie.refresh_token?.value;
    if (refreshTokenId) {
      await authService.logout(refreshTokenId);
    }

    clearAuthCookies(cookie);
    return { success: true };
  })

  // ─── Logout All ─────────────────────────────────────────────────────────────
  .use(requireAuth())
  .post("/logout-all", async ({ authUser, cookie }) => {
    if (!authUser) {
      return { success: false };
    }

    const count = await authService.logoutAll(authUser.sub);
    clearAuthCookies(cookie);
    return { success: true, sessionsRevoked: count };
  });
