import { createFileRoute, Link, Outlet } from "@tanstack/solid-router";
import { For } from "solid-js";

const Route = createFileRoute("/_private/settings")({
  component: SettingsLayout,
});

const SETTINGS_LINKS = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/sessions", label: "Sessions" },
  { href: "/settings/providers", label: "Providers" },
] as const;

function SettingsLayout() {
  return (
    <div class="py-6">
      <h1 class="mb-6 text-2xl font-bold">Settings</h1>

      <div class="flex gap-8">
        <nav class="w-48 space-y-1">
          <For each={SETTINGS_LINKS}>
            {(link) => (
              <Link
                to={link.href}
                class="block rounded-lg px-3 py-2 text-sm transition hover:bg-gray-900 hover:text-white"
                activeProps={{
                  style: {
                    "background-color": "#1f2937",
                    color: "#ffffff",
                  },
                }}
                inactiveProps={{
                  style: {
                    color: "#9ca3af",
                  },
                }}
              >
                {link.label}
              </Link>
            )}
          </For>
        </nav>

        <div class="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export { Route };
