# API Web Healthcheck

**Basic liveness probe endpoint.**

```typescript
import { healthcheckV1 } from "#api/shared/web/healthcheck.v1";
```

| Endpoint | Method | Response |
|----------|--------|----------|
| `/live` | GET | `{ status: "ok" }` |

**Note:** Current implementation is minimal. Production should add database, Redis, and MinIO connectivity checks, plus `/ready` endpoint for dependency readiness.