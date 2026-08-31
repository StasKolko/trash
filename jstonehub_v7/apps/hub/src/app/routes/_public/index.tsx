import { createFileRoute, Link } from "@tanstack/solid-router";

import { useAuthContext } from "#hub/shared/auth/use-auth-context";

const Route = createFileRoute("/_public/")({
  component: LandingPage,
});

function LandingPage() {
  const { authContext } = useAuthContext();

  return (
    <div class="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 class="text-5xl font-bold">JStone Hub</h1>
      <p class="max-w-md text-center text-lg text-gray-400">
        Content production platform powered by AI tools.
      </p>

      {authContext() ? (
        <Link
          to="/dashboard"
          class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link
          to="/login"
          class="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}

export { Route };
