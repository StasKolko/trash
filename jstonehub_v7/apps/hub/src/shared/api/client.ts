import type { ApiApp } from "#api/app/api.type";

import { treaty } from "@elysiajs/eden";

import { env } from "../config/env";

const client = treaty<ApiApp>(env.API_URL, {
  fetch: {
    credentials: "include",
  },
});

export { client };
