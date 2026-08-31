import { env } from "#api/shared/config/env";

import { apiApp } from "./_api";

apiApp.listen({
  port: env.PORT,
  hostname: "0.0.0.0",
});
