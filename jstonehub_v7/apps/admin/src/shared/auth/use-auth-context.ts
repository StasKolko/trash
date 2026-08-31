import { createQuery } from "@tanstack/solid-query";

import { authContextQueryOptions } from "./auth-context.query";

function useAuthContext() {
  const query = createQuery(() => authContextQueryOptions);

  function authContext() {
    return query.data ?? null;
  }

  return { authContext, query };
}

export { useAuthContext };
