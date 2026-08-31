import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, Show } from "solid-js";
import { fallback, literal, object, optional, string, union } from "valibot";

import { env } from "#hub/shared/config/env";

const ERROR_MESSAGES: Record<string, string> = {
  SESSION_EXPIRED: "Session expired. Please sign in again.",
  BANNED: "Your account has been banned.",
  INSUFFICIENT_PERMISSION: "You don't have permission to access this resource.",
  UNAUTHORIZED: "Authorization was denied. Please try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

const Route = createFileRoute("/_public/login")({
  component: LoginPage,
  validateSearch: object({
    error: fallback(
      optional(
        union([
          literal("SESSION_EXPIRED"),
          literal("BANNED"),
          literal("INSUFFICIENT_PERMISSION"),
          literal("UNAUTHORIZED"),
          literal("UNKNOWN"),
        ]),
      ),
      undefined,
    ),
    redirect: fallback(optional(string()), undefined),
  }),
});

function LoginPage() {
  const search = Route.useSearch();

  const errorMessage = createMemo(() => {
    const err = search().error;

    if (!err) {
      return null;
    }

    return ERROR_MESSAGES[err] ?? ERROR_MESSAGES.UNKNOWN;
  });

  const isBanned = createMemo(() => search().error === "BANNED");

  const googleUrl = createMemo(() => {
    const redirectPath = search().redirect || "/dashboard";
    const origin = window.location.origin;
    const fullRedirect = `${origin}${redirectPath}`;
    const errorRedirect = `${origin}/login`;
    return `${env.API_URL}/v1/auth/google?redirect=${encodeURIComponent(fullRedirect)}&errorRedirect=${encodeURIComponent(errorRedirect)}`;
  });

  return (
    <div class="flex min-h-screen items-center justify-center p-8">
      <div class="w-full max-w-sm space-y-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold">Sign In</h1>
          <p class="mt-2 text-gray-400">Welcome to JStone Hub</p>
        </div>

        <Show when={errorMessage()}>
          {(msg) => (
            <div class="rounded-lg border border-red-800 bg-red-950 p-4 text-sm text-red-300">
              {msg()}
            </div>
          )}
        </Show>

        <Show when={isBanned()}>
          <div class="text-center text-sm text-gray-400">
            Contact{" "}
            <a
              href={`mailto:${env.SUPPORT_EMAIL}`}
              class="text-blue-400 underline"
            >
              {env.SUPPORT_EMAIL}
            </a>{" "}
            for assistance.
          </div>
        </Show>

        <a
          href={googleUrl()}
          class="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-100"
        >
          <GoogleIcon />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg class="h-5 w-5" viewBox="0 0 24 24" role="img" aria-label="Google">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export { Route };
