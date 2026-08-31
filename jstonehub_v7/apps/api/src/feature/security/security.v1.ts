import { Elysia } from "elysia";

import { getEventsRoute } from "./_route/get-events.route";

const securityV1 = new Elysia({ prefix: "/v1/security" }).use(getEventsRoute);

export { securityV1 };
