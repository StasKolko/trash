import { client } from "./client";
import { queryClient } from "./query-client";

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  try {
    const { data, error } = await client.v1.auth.refresh.post();

    if (error || !data) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function handleUnauthorized(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshTokens();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function clearAuthAndRedirect(path: string, error?: string) {
  queryClient.clear();
  const url = error ? `${path}?error=${error}` : path;
  window.location.href = url;
}

export { clearAuthAndRedirect, handleUnauthorized };
