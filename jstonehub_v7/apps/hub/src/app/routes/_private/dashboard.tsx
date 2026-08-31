import { createFileRoute } from "@tanstack/solid-router";

import { useAuthContext } from "#hub/shared/auth/use-auth-context";

const Route = createFileRoute("/_private/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { authContext } = useAuthContext();
  const ctx = () => authContext();

  return (
    <div class="space-y-6 py-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Energy Balance" value={ctx()?.energyBalance ?? "0"} />
        <StatCard
          label="Login Streak"
          value={`${ctx()?.loginStreak ?? 0} days`}
        />
        <StatCard
          label="Permissions"
          value={`${ctx()?.permissions.length ?? 0}`}
        />
      </div>
    </div>
  );
}

function StatCard(props: { label: string; value: string }) {
  return (
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p class="text-sm text-gray-400">{props.label}</p>
      <p class="mt-1 text-2xl font-bold">{props.value}</p>
    </div>
  );
}

export { Route };
