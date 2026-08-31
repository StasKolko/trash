import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";

import { client } from "#admin/shared/api/client";
import { useAuthContext } from "#admin/shared/auth/use-auth-context";
import { usePermission } from "#admin/shared/auth/use-permission";

const Route = createFileRoute("/_private/users/$userId")({
  component: UserDetailPage,
});

const AVATAR_SIZE = 64;

const ADMIN_PERMISSION_OPTIONS = [
  { value: "admin:access:read", label: "Access admin panel" },
  { value: "admin:user:read", label: "View users" },
  { value: "admin:user:manage", label: "Manage user permissions" },
  { value: "admin:user:ban", label: "Ban/unban users" },
  { value: "admin:user:grant_energy", label: "Grant energy" },
  { value: "admin:user:grant_subscription", label: "Grant subscriptions" },
  { value: "admin:joke:read", label: "View jokes" },
  { value: "admin:joke:create", label: "Create jokes" },
  { value: "admin:joke:update", label: "Update jokes" },
  { value: "admin:joke:delete", label: "Delete jokes" },
  { value: "admin:joke:all", label: "All joke operations" },
  { value: "admin:language:read", label: "View languages" },
  { value: "admin:language:manage", label: "Manage languages" },
  { value: "admin:pricing:read", label: "View pricing" },
  { value: "admin:pricing:manage", label: "Manage pricing" },
  { value: "admin:feedback:read", label: "View feedback" },
  { value: "admin:feedback:manage", label: "Manage feedback" },
  { value: "admin:audit:read", label: "View audit log" },
] as const;

type UserDetail = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isBanned: boolean;
  energyBalance: string;
  loginStreak: number;
  createdAt: Date;
  updatedAt: Date;
  permissions: string[];
  activeSessionCount: number;
};

function UserDetailPage() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { authContext } = useAuthContext();
  const { can } = usePermission();

  const [user, { refetch }] = createResource(
    () => params().userId,
    fetchUserDetail,
  );

  const [activeTab, setActiveTab] = createSignal("info");

  const isSelf = createMemo(() => authContext()?.user.id === params().userId);

  return (
    <div class="space-y-6">
      <button
        type="button"
        onClick={() => navigate({ to: "/users" })}
        class="text-sm text-gray-400 transition hover:text-white"
      >
        ← Back to users
      </button>

      <Show when={user()} fallback={<p class="text-gray-400">Loading...</p>}>
        {(detail) => (
          <>
            <UserHeader user={detail()} />

            <div class="flex gap-2 border-b border-gray-800">
              <TabButton
                label="Info"
                active={activeTab() === "info"}
                onClick={() => setActiveTab("info")}
              />
              {can("admin:user:ban") && (
                <TabButton
                  label="Ban"
                  active={activeTab() === "ban"}
                  onClick={() => setActiveTab("ban")}
                />
              )}
              {can("admin:user:manage") && (
                <TabButton
                  label="Permissions"
                  active={activeTab() === "permissions"}
                  onClick={() => setActiveTab("permissions")}
                />
              )}
            </div>

            <Show when={activeTab() === "info"}>
              <InfoTab user={detail()} />
            </Show>

            <Show when={activeTab() === "ban" && can("admin:user:ban")}>
              <BanTab user={detail()} isSelf={isSelf()} onBanChange={refetch} />
            </Show>

            <Show
              when={activeTab() === "permissions" && can("admin:user:manage")}
            >
              <PermissionsTab
                user={detail()}
                isSelf={isSelf()}
                onUpdate={refetch}
              />
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}

function UserHeader(props: { user: UserDetail }) {
  return (
    <div class="flex items-center gap-4">
      <Show
        when={props.user.avatarUrl}
        fallback={
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-xl font-bold">
            {props.user.name.charAt(0)}
          </div>
        }
      >
        {(url) => (
          <img
            src={url()}
            alt=""
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            class="h-16 w-16 rounded-full"
          />
        )}
      </Show>
      <div>
        <h1 class="text-2xl font-bold">{props.user.name}</h1>
        <p class="text-gray-400">{props.user.email}</p>
        {props.user.isBanned && (
          <span class="mt-1 inline-block rounded bg-red-900 px-2 py-0.5 text-xs text-red-300">
            Banned
          </span>
        )}
      </div>
    </div>
  );
}

function TabButton(props: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class={`border-b-2 px-4 py-2 text-sm transition ${
        props.active
          ? "border-blue-500 text-white"
          : "border-transparent text-gray-400 hover:text-white"
      }`}
    >
      {props.label}
    </button>
  );
}

function InfoTab(props: { user: UserDetail }) {
  return (
    <div class="grid gap-4 sm:grid-cols-2">
      <InfoCard label="Energy Balance" value={props.user.energyBalance} />
      <InfoCard label="Login Streak" value={`${props.user.loginStreak} days`} />
      <InfoCard
        label="Active Sessions"
        value={`${props.user.activeSessionCount}`}
      />
      <InfoCard
        label="Created"
        value={new Date(props.user.createdAt).toLocaleString()}
      />
      <InfoCard
        label="Updated"
        value={new Date(props.user.updatedAt).toLocaleString()}
      />
      <InfoCard
        label="Permissions"
        value={`${props.user.permissions.length} assigned`}
      />
    </div>
  );
}

function InfoCard(props: { label: string; value: string }) {
  return (
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p class="text-xs text-gray-500">{props.label}</p>
      <p class="mt-1 text-lg font-medium">{props.value}</p>
    </div>
  );
}

function BanTab(props: {
  user: UserDetail;
  isSelf: boolean;
  onBanChange: () => void;
}) {
  const [reason, setReason] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function handleBanToggle() {
    if (!reason().trim()) {
      setError("Reason is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await client.admin
        .users({ userId: props.user.id })
        .ban.patch({
          isBanned: !props.user.isBanned,
          reason: reason(),
        });

      if (data && "error" in data) {
        setError(String(data.error));
        return;
      }

      setReason("");
      props.onBanChange();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="max-w-lg space-y-4">
      <Show when={props.isSelf}>
        <div class="rounded-lg border border-yellow-800 bg-yellow-950 p-3 text-sm text-yellow-300">
          You cannot ban yourself.
        </div>
      </Show>

      <Show when={!props.isSelf}>
        <div class="space-y-4">
          <BanStatusCard user={props.user} />

          <Show when={error()}>
            {(msg) => (
              <div class="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
                {msg()}
              </div>
            )}
          </Show>

          <textarea
            placeholder="Reason (required)..."
            value={reason()}
            onInput={(e) => setReason(e.currentTarget.value)}
            class="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            rows={3}
          />

          <button
            type="button"
            onClick={handleBanToggle}
            disabled={loading() || !reason().trim()}
            class={`rounded px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
              props.user.isBanned
                ? "bg-green-700 text-white hover:bg-green-600"
                : "bg-red-700 text-white hover:bg-red-600"
            }`}
          >
            {banButtonLabel(loading(), props.user.isBanned)}
          </button>
        </div>
      </Show>
    </div>
  );
}

function BanStatusCard(props: { user: UserDetail }) {
  return (
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p class="text-sm text-gray-400">
        Current status:{" "}
        <span class={props.user.isBanned ? "text-red-400" : "text-green-400"}>
          {props.user.isBanned ? "Banned" : "Active"}
        </span>
      </p>

      <Show when={props.user.isBanned}>
        <p class="mt-2 text-xs text-gray-500">
          Unbanning will restore access but not permissions. Permissions must be
          re-granted separately.
        </p>
      </Show>

      <Show when={!props.user.isBanned}>
        <p class="mt-2 text-xs text-gray-500">
          Banning will delete all admin permissions and terminate all active
          sessions.
        </p>
      </Show>
    </div>
  );
}

function banButtonLabel(isLoading: boolean, isBanned: boolean) {
  if (isLoading) {
    return "Processing...";
  }

  if (isBanned) {
    return "Unban User";
  }

  return "Ban User";
}

function PermissionsTab(props: {
  user: UserDetail;
  isSelf: boolean;
  onUpdate: () => void;
}) {
  const [permissions, setPermissions] = createSignal<string[]>(
    props.user.permissions,
  );
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);

  createEffect(() => {
    setPermissions(props.user.permissions);
  });

  function togglePermission(perm: string) {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
    setSuccess(false);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data } = await client.admin
        .permissions({ userId: props.user.id })
        .put({
          permissions: permissions(),
        });

      if (data && "error" in data) {
        setError(String(data.error));
        return;
      }

      setSuccess(true);
      props.onUpdate();
    } finally {
      setLoading(false);
    }
  }

  const hasChanges = createMemo(() =>
    hasPermissionChanges(props.user.permissions, permissions()),
  );

  return (
    <div class="max-w-lg space-y-4">
      <Show when={props.isSelf}>
        <div class="rounded-lg border border-yellow-800 bg-yellow-950 p-3 text-sm text-yellow-300">
          You cannot modify your own permissions.
        </div>
      </Show>

      <Show when={!props.isSelf}>
        <Show when={error()}>
          {(msg) => (
            <div class="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
              {msg()}
            </div>
          )}
        </Show>

        <Show when={success()}>
          <div class="rounded-lg border border-green-800 bg-green-950 p-3 text-sm text-green-300">
            Permissions updated successfully.
          </div>
        </Show>

        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-400">Admin Permissions</h3>

          <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <For each={ADMIN_PERMISSION_OPTIONS}>
              {(option) => (
                <label class="flex cursor-pointer items-center gap-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={permissions().includes(option.value)}
                    onChange={() => togglePermission(option.value)}
                    class="h-4 w-4 rounded border-gray-600 bg-gray-800"
                  />
                  <div>
                    <p class="text-sm">{option.label}</p>
                    <p class="text-xs text-gray-500">{option.value}</p>
                  </div>
                </label>
              )}
            </For>
          </div>
        </div>

        <Show when={hasChanges()}>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading()}
            class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading() ? "Saving..." : "Save Permissions"}
          </button>
        </Show>
      </Show>
    </div>
  );
}

function hasPermissionChanges(current: string[], next: string[]) {
  const currentSet = new Set(current);
  const nextSet = new Set(next);

  if (currentSet.size !== nextSet.size) {
    return true;
  }

  for (const p of currentSet) {
    if (!nextSet.has(p)) {
      return true;
    }
  }

  return false;
}

async function fetchUserDetail(userId: string): Promise<UserDetail | null> {
  const { data } = await client.admin.users({ userId }).get();

  if (!data || "error" in data) {
    return null;
  }

  return data as UserDetail;
}

export { Route };
