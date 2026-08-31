import { createFileRoute } from "@tanstack/solid-router";

const Route = createFileRoute("/_private/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Admin Dashboard</h1>
      <p class="text-gray-400">
        Welcome to the admin panel. Use the sidebar to navigate.
      </p>
    </div>
  );
}

export { Route };
