## api

```ts
import { client } from "#hub/shared/api/client";

type Client = ReturnType<typeof treaty<ApiApp>>;
```

## config

```ts
import { env } from "#hub/shared/config/env";

type Env = {
  ADMIN_URL: string;
  MODE: "development" | "production" | "test";
};
```