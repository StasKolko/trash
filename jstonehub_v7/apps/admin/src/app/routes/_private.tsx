import { createFileRoute, Link, Outlet } from "@tanstack/solid-router";

import { adminAuthGuard } from "#admin/shared/auth/auth-guard";
import { logout } from "#admin/shared/auth/logout";
import { useAuthContext } from "#admin/shared/auth/use-auth-context";
import { usePermission } from "#admin/shared/auth/use-permission";

const Route = createFileRoute("/_private")({
  beforeLoad: adminAuthGuard,
  component: AdminPrivateLayout,
});

function AdminPrivateLayout() {
  const { authContext } = useAuthContext();
  const { can } = usePermission();

  return (
    <div class="flex min-h-screen bg-gray-950 text-white">
      <aside class="w-56 border-r border-gray-800 bg-gray-900">
        <div class="p-4">
          <h1 class="text-lg font-bold">JStone Admin</h1>
        </div>

        <nav class="space-y-1 px-2">
          <NavLink href="/dashboard" label="Dashboard" />

          {can("admin:user:read") && <NavLink href="/users" label="Users" />}

          <NavLink href="/settings/profile" label="Settings" />
        </nav>

        <div class="absolute bottom-0 left-0 w-56 border-t border-gray-800 p-4">
          <div class="mb-2 text-sm text-gray-400">
            {authContext()?.user.name}
          </div>
          <button
            type="button"
            onClick={logout}
            class="w-full rounded bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </aside>

      <main class="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink(props: { href: string; label: string }) {
  return (
    <Link
      to={props.href}
      class="block rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
      activeProps={{
        class:
          "block rounded-lg px-3 py-2 text-sm !bg-gray-800 !text-white transition",
      }}
    >
      {props.label}
    </Link>
  );
}

export { Route };
