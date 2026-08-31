import { Google } from "arctic";

import { env } from "#api/shared/config/env";

const GOOGLE_CALLBACK_PATH = "/v1/auth/google/callback";

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `http://localhost:${env.PORT}${GOOGLE_CALLBACK_PATH}`,
);

export type GoogleUserInfo = {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
};

export async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Google userinfo failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };

  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture ?? null,
  };
}