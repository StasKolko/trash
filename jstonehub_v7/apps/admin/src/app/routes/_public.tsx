import { createFileRoute, Outlet } from "@tanstack/solid-router";

const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div class="min-h-screen bg-gray-950 text-white">
      <Outlet />
    </div>
  );
}

export { Route };
