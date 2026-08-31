import { Google } from "arctic";

import { env } from "#api/shared/config/env";

import { AUTH_PATHS } from "../_model/auth.constant";

const GOOGLE_CALLBACK_URL = `${env.API_URL}${AUTH_PATHS.prefix}${
  AUTH_PATHS.get.callbackGoogle
}`;
const GOOGLE_SCOPES = ["openid", "email", "profile"];
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
);

function createGoogleAuthUrl(params: { state: string; codeVerifier: string }) {
  return google.createAuthorizationURL(
    params.state,
    params.codeVerifier,
    GOOGLE_SCOPES,
  );
}

async function exchangeGoogleCode(params: {
  code: string;
  codeVerifier: string;
}) {
  try {
    const tokens = await google.validateAuthorizationCode(
      params.code,
      params.codeVerifier,
    );
    return { accessToken: tokens.accessToken() };
  } catch {
    return null;
  }
}

async function fetchGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    return {
      providerAccountId: data.sub,
      email: data.email,
      name: data.name,
      avatarUrl: data.picture ?? null,
    };
  } catch {
    return null;
  }
}

export { createGoogleAuthUrl, exchangeGoogleCode, fetchGoogleUserInfo };
