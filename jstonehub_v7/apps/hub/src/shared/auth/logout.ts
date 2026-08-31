import { client } from "#hub/shared/api/client";
import { queryClient } from "#hub/shared/api/query-client";

async function logout() {
  try {
    await client.v1.auth.logout.post();
  } catch {
    // Ignore errors during logout
  }

  queryClient.clear();
  window.location.href = "/login";
}

export { logout };
