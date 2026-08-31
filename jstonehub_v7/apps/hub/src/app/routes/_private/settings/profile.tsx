import { createFileRoute } from "@tanstack/solid-router";
import { Show } from "solid-js";

import { useAuthContext } from "#hub/shared/auth/use-auth-context";

const AVATAR_SIZE = 64;

const Route = createFileRoute("/_private/settings/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { authContext } = useAuthContext();
  const user = () => authContext()?.user;

  return (
    <div class="space-y-6">
      <h2 class="text-lg font-semibold">Profile</h2>

      <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div class="flex items-center gap-4">
          <Show
            when={user()?.avatarUrl}
            fallback={
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-xl font-bold">
                {user()?.name?.charAt(0) ?? "?"}
              </div>
            }
          >
            {(url) => (
              <img
                src={url()}
                alt={user()?.name ?? "Avatar"}
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                class="h-16 w-16 rounded-full"
              />
            )}
          </Show>

          <div>
            <p class="text-lg font-medium">{user()?.name}</p>
            <p class="text-sm text-gray-400">{user()?.email}</p>
          </div>
        </div>

        <p class="mt-4 text-xs text-gray-500">
          Profile information is managed through your Google account.
        </p>
      </div>
    </div>
  );
}

export { Route };
