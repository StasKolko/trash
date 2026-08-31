import { createFileRoute, Outlet } from "@tanstack/solid-router";

const Route = createFileRoute("/_private/users")({
  component: UsersLayout,
});

function UsersLayout() {
  return <Outlet />;
}

export { Route };
