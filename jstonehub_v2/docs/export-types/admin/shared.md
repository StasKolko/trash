## api

```ts
import { getApiErrorMessage, createApiError } from "#admin/shared/api/errors";

function getApiErrorMessage(error: unknown): string;
function createApiError(error: unknown): Error;
```

```ts
import { client } from "#admin/shared/api/client";

type Client = ReturnType<typeof treaty<ApiApp>>;
```

## config

```ts
import { env } from "#admin/shared/config/env";

type Env = {
  HUB_URL: string;
  MODE: "development" | "production" | "test";
};
```

## ui

```tsx
import { PageHeader } from "#admin/shared/ui/page-header";

type PageHeader = ParentProps<{
  title: string;
  description?: string;
  class?: string;
}>;
```

```tsx
import { SectionLayout } from "#admin/shared/ui/section-layout";

type SectionLayout = ParentProps<{
  title: string;
  description?: string;
  navItems: {
    to: string;
    label: string;
    icon?: JSX.Element;
  }[];
}>;
```