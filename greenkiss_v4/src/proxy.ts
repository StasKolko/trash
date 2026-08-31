import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/shared/config/env";

const ADMIN_PREFIX = "/admin";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: env.AUTH_SECRET,
  });

  const url = req.nextUrl.clone();
  const callbackUrl = `${pathname}${search || ""}`;

  if (!token) {
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", callbackUrl);
    url.searchParams.set("error", "AccessDenied");
    return NextResponse.redirect(url);
  }

  const role = token?.role;
  if (role !== "ADMIN" && role !== "MANAGER") {
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", callbackUrl);
    url.searchParams.set("error", "AccessDenied");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
