## api

```ts
import { spread } from "#api/shared/api/typebox-helpers";

type spread = <
  T extends TObject | Table,
  Mode extends "select" | "insert" | undefined,
>(schema: T, mode?: Mode) => TObject["properties"];

```

## config

```ts
import { env } from "#api/shared/config/env";

type Env = {
  DATABASE_URL: string;
  REDIS_URL: string;
  NODE_ENV: "development" | "production" | "test";
};
````

```ts
import type { HttpStatus } from "#api/shared/config/http-status";
import { HTTP_STATUS } from "#api/shared/config/http-status";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TEAPOT: 418,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;

type HttpStatus = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 418 | 500 | 501 | 503;
```

### db

```ts
import { db, type Database } from "#api/shared/db";

// Drizzle
type db = BunSQLDatabase<typeof dbSchema>;
```