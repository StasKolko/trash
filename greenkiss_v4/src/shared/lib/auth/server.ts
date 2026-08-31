import "server-only";

import { cache } from "react";
import { AuthError } from "./errors";
import { auth, handlers, signIn, signOut } from "./src/build-next-auth";

export const getSession = cache(auth);

export async function requireAdmin() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new AuthError({
      code: "AUTH_REQUIRED",
      httpStatus: 401,
      message: "Authentication is required",
    });
  }

  const role = session.user.role;

  if (role !== "ADMIN") {
    throw new AuthError({
      code: "FORBIDDEN",
      httpStatus: 403,
      message: "Access is allowed only for administrator",
    });
  }

  return session;
}

export async function requireAdminOrManager() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new AuthError({
      code: "AUTH_REQUIRED",
      httpStatus: 401,
      message: "Authentication is required",
    });
  }

  const role = session.user.role;

  if (role !== "ADMIN" && role !== "MANAGER") {
    throw new AuthError({
      code: "FORBIDDEN",
      httpStatus: 403,
      message: "Access is allowed only for administrator or manager",
    });
  }

  return session;
}

export { handlers, signIn, signOut };
