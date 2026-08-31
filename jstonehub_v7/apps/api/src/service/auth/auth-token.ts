import { jwtVerify, SignJWT } from "jose";

import { env, JWT_SECRET_BYTES } from "#api/shared/config/env";

type AccessTokenPayload = {
  sub: string;
  email: string;
  isBanned: boolean;
  permissions: string[];
};

function generateAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({
    email: payload.email,
    isBanned: payload.isBanned,
    permissions: payload.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_EXPIRES_IN}s`)
    .sign(JWT_SECRET_BYTES);
}

async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    return _toAccessTokenPayload(payload);
  } catch {
    return null;
  }
}

function _toAccessTokenPayload(
  payload: Record<string, unknown>,
): AccessTokenPayload {
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    isBanned: payload.isBanned as boolean,
    permissions: payload.permissions as string[],
  };
}

export { generateAccessToken, verifyAccessToken };
