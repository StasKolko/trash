import { Elysia } from "elysia";

import { corsPlugin } from "#api/shared/plugin/cors.plugin";

const api = new Elysia()
  .use(corsPlugin)

export { api };