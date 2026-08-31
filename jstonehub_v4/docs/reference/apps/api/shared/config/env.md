# API Environment Variables

**Validated at runtime with Typebox.**

```typescript
import { env } from "#api/shared/config/env";
```

| Variable | Required | Type | Constraints |
|----------|----------|------|-------------|
| `NODE_ENV` | Yes | `"development" \| "production" \| "test"` | — |
| `PORT` | Yes | number | 1–65535 |
| `WORKER_URL` | Yes | string | minLength: 1 |
| `HUB_URL` | Yes | string | minLength: 1 |
| `ADMIN_URL` | Yes | string | minLength: 1 |
| `CORS_ORIGINS` | Yes | string[] | comma-separated list |
| `DATABASE_URL` | Yes | string | minLength: 1 |
| `REDIS_URL` | Yes | string | minLength: 1 |
| `MINIO_ENDPOINT` | Yes | string | minLength: 1 |
| `MINIO_PORT` | Yes | number | 1–65535 |
| `MINIO_ACCESS_KEY` | Yes | string | minLength: 1 |
| `MINIO_SECRET_KEY` | Yes | string | minLength: 1 |
| `MINIO_USE_SSL` | Yes | boolean | `"true"`, `"false"`, `"1"`, `"0"` |
| `MINIO_BUCKET` | Yes | string | minLength: 1 |
| `INTERNAL_SECRET` | Yes | string | minLength: 1 |
| `BETTER_AUTH_URL` | Yes | string | minLength: 1 |
| `BETTER_AUTH_SECRET` | Yes | string | minLength: 32 |
| `GOOGLE_CLIENT_ID` | Yes | string | minLength: 1 |
| `GOOGLE_CLIENT_SECRET` | Yes | string | minLength: 1 |
| `COOKIE_DOMAIN` | Yes | string | minLength: 1 |
| `ACCESS_TOKEN_EXPIRES_IN` | Yes | number | minimum: 1 |
| `REFRESH_TOKEN_EXPIRES_IN` | Yes | number | minimum: 1 |
| `OWNER_EMAIL` | Yes | string | minLength: 1 |