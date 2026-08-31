```ts
import {
  browserFingerprintTable,
  secChUaMobileEnum,
  secChUaPlatformEnum,
  browserFingerprintControllerV1,
} from "#api/features/browser-fingerprint";

type browserFingerprintTable = PgTable<{
  id: text;                    // primaryKey, default: createId()
  name: text;
  description: text | null;
  userAgent: text;
  secChUa: text;
  secChUaMobile: enum("?0" | "?1");
  secChUaPlatform: enum("Windows" | "macOS" | "Linux" | ...);
  acceptLanguage: text;        // default: "en-US,en;q=0.9"
  isActive: boolean;           // default: false
  createdAt: timestamp;        // default: now()
  updatedAt: timestamp;        // default: now(), onUpdate
}>;

type secChUaMobileEnum = PgEnum<[string, ...string[]]>;
type secChUaPlatformEnum = PgEnum<[string, ...string[]]>;

// Elysia controller, prefix: "/v1/admin/browser-fingerprints"
//
// GET    /                → BrowserFingerprint[]
// GET    /:id             → BrowserFingerprint
// POST   /                → BrowserFingerprint (201)
//          body: NewBrowserFingerprint
// PUT    /:id             → BrowserFingerprint
//          body: UpdateBrowserFingerprint
// DELETE /:id             → { success: boolean; id: string }

```

```ts
import type {
  BrowserFingerprint,
  NewBrowserFingerprint,
  UpdateBrowserFingerprint,
} from "#api/features/browser-fingerprint/types";

type BrowserFingerprint = {
  id: string;
  name: string;
  description: string | null;
  userAgent: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
  acceptLanguage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NewBrowserFingerprint = {
  id?: string;
  name: string;
  description?: string | null;
  userAgent: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
  acceptLanguage?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateBrowserFingerprint = Partial<
  Omit<NewBrowserFingerprint, "id" | "createdAt" | "updatedAt">
>;
```