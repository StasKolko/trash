import type { GlobalRole } from "@packages/contract/role";

import { is } from "@packages/util/guard";
import { jwtVerify, SignJWT } from "jose";

import { env } from "#api/shared/config/env";

type JwtPayload = {
  sub: string;
  email: string;
  role: GlobalRole;
};

const JWT_ALGORITHM = "HS256";

let encodedSecret: Uint8Array | null = null;

function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_EXPIRES_IN}s`)
    .sign(getSecret());
}

async function verifyAccessToken(
  token: string,
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub ?? "",
      email: (payload.email as string) ?? "",
      role: (payload.role as GlobalRole) ?? "user",
    };
  } catch {
    return null;
  }
}

function getSecret(): Uint8Array {
  if (is.null(encodedSecret)) {
    encodedSecret = new TextEncoder().encode(env.JWT_SECRET);
  }
  return encodedSecret;
}

export type { JwtPayload };
export { signAccessToken, verifyAccessToken };