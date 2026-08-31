import { Elysia } from "elysia";

import { requestIdPlugin } from "#api/shared/plugin/request-id.plugin";

const api = new Elysia()
  .use(requestIdPlugin)

export { api };