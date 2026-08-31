import { createFileRoute, Outlet } from "@tanstack/solid-router";

import { authGuard } from "#hub/shared/auth/auth-guard";
import { logout } from "#hub/shared/auth/logout";
import { useAuthContext } from "#hub/shared/auth/use-auth-context";

const Route = createFileRoute("/_private")({
  beforeLoad: authGuard,
  component: PrivateLayout,
});

function PrivateLayout() {
  const { authContext } = useAuthContext();

  return (
    <div class="min-h-screen bg-gray-950 text-white">
      <header class="border-b border-gray-800 bg-gray-900">
        <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <a href="/dashboard" class="text-lg font-bold">
            JStone Hub
          </a>

          <nav class="flex items-center gap-4">
            <a
              href="/dashboard"
              class="text-sm text-gray-300 transition hover:text-white"
            >
              Dashboard
            </a>
            <a
              href="/settings/profile"
              class="text-sm text-gray-300 transition hover:text-white"
            >
              Settings
            </a>

            <div class="flex items-center gap-3 border-l border-gray-700 pl-4">
              <span class="text-sm text-gray-400">
                {authContext()?.user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                class="rounded bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-7xl p-4">
        <Outlet />
      </main>
    </div>
  );
}

export { Route };
