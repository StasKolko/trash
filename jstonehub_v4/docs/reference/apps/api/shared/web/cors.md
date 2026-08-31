# API CORS Configuration

**Configured with Elysia CORS plugin.**

```typescript
import { corsPlugin } from "#api/shared/middleware/cors";
```

| Setting | Value |
|---------|-------|
| **Allowed Origins** | `HUB_URL`, `ADMIN_URL`, `CORS_ORIGINS` (trailing slashes removed) |
| **Credentials** | Enabled |
| **Allowed Headers** | `Content-Type`, `Authorization` |
| **Allowed Methods** | `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS` |
| **Max Age** | 86,400 seconds (24 hours) |
| **Requests without Origin** | Allowed |