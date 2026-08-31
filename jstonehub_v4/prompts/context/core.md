D:/1_Projects/jstonehub/apps/admin/.env.development

```
VITE_API_URL=http://localhost:4000
VITE_HUB_URL=http://localhost:3000

VITE_SUPPORT_EMAIL=b2bstas@gmail.com
```

D:/1_Projects/jstonehub/apps/api/.env.development

```
# ═══════════════════════════════════════════════════════════════════
# BASE
# ═══════════════════════════════════════════════════════════════════
NODE_ENV=development

# ═══════════════════════════════════════════════════════════════════
# SERVICES
# ═══════════════════════════════════════════════════════════════════
PORT=4000
WORKER_URL=http://localhost:4001
HUB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
CORS_ORIGINS=http://192.168.0.116:3000,http://192.168.0.116:3001

# ═══════════════════════════════════════════════════════════════════
# DATABASE & STORAGE
# ═══════════════════════════════════════════════════════════════════
DATABASE_URL=postgresql://user:password@localhost:5433/jstonehub
REDIS_URL=redis://localhost:6379

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET=jstonehub

# ═══════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════
JWT_SECRET=dev-jwt-secret-change-in-production
INTERNAL_SECRET=dev-internal-secret-change-in-production
GOOGLE_CALLBACL=/api/auth/callback/google
GOOGLE_CLIENT_ID=262481646500-rj6pahkald0ufkv3oec17jr2tj4obdg9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

COOKIE_DOMAIN=localhost
ACCESS_TOKEN_EXPIRES_IN=900
REFRESH_TOKEN_EXPIRES_IN=1209600

OWNER_EMAIL=b2bstas@gmail.com
```

D:/1_Projects/jstonehub/apps/api/drizzle.config.ts

```
import process from "node:process";
import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/*.table.ts",
  out: "./drizzle",
  dbCredentials: { url: DATABASE_URL },
  verbose: true,
  strict: true,
});

```

D:/1_Projects/jstonehub/apps/hub/.env.development

```
VITE_API_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:3001

VITE_SUPPORT_EMAIL=b2bstas@gmail.com
```

D:/1_Projects/jstonehub/apps/worker/.env.development

```
# ═══════════════════════════════════════════════════════════════════
# BASE
# ═══════════════════════════════════════════════════════════════════
NODE_ENV=development

# ═══════════════════════════════════════════════════════════════════
# REDIS
# ═══════════════════════════════════════════════════════════════════
REDIS_URL=redis://localhost:6379

# ═══════════════════════════════════════════════════════════════════
# STORAGE
# ═══════════════════════════════════════════════════════════════════
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET=jstonehub

# ═══════════════════════════════════════════════════════════════════
# CONCURRENCY
# ═══════════════════════════════════════════════════════════════════
WORKER_CONCURRENCY=5

# ═══════════════════════════════════════════════════════════════════
# API CALLBACK
# ═══════════════════════════════════════════════════════════════════
API_URL=http://localhost:4000
INTERNAL_SECRET=dev-internal-secret-change-in-production
```

D:/1_Projects/jstonehub/packages/contract/src/audio-processing.ts

```
// packages/contract/src/audio-processing.ts

export type AudioOutputFormat = (typeof AUDIO_OUTPUT_FORMATS)[number];

export type SilenceRemovalConfig = {
  enabled: boolean;
  thresholdDb: number;
  minDurationMs: number;
  keepGapMs: number;
};

export type NormalizationConfig = {
  enabled: boolean;
  targetLufs: number;
  truePeakDb: number;
};

export type HighPassFilterConfig = {
  enabled: boolean;
  frequencyHz: number;
};

export type LimiterConfig = {
  enabled: boolean;
  limitDb: number;
};

export type FadeConfig = {
  inMs: number;
  outMs: number;
};

export type GapsConfig = {
  innerMs: number;
  betweenMs: number;
  startMs: number;
  endMs: number;
};

export type ConcatenationConfig = {
  enabled: boolean;
};

export type OutputConfig = {
  format: AudioOutputFormat;
  bitrate: string;
  sampleRate: number;
};

export type AudioProcessingConfig = {
  silenceRemoval: SilenceRemovalConfig;
  normalization: NormalizationConfig;
  highPassFilter: HighPassFilterConfig;
  limiter: LimiterConfig;
  fade: FadeConfig;
  gaps: GapsConfig;
  concatenation: ConcatenationConfig;
  output: OutputConfig;
};

export const AUDIO_OUTPUT_FORMATS = ["mp3", "wav", "ogg"] as const;

export const AUDIO_PROCESSING_LIMITS = {
  silenceRemoval: {
    thresholdDb: { min: -60, max: -10 },
    minDurationMs: { min: 50, max: 2000 },
    keepGapMs: { min: 0, max: 1000 },
  },
  normalization: {
    targetLufs: { min: -30, max: -5 },
    truePeakDb: { min: -6, max: 0 },
  },
  highPassFilter: {
    frequencyHz: { min: 20, max: 500 },
  },
  limiter: {
    limitDb: { min: -6, max: 0 },
  },
  fade: {
    inMs: { min: 0, max: 5000 },
    outMs: { min: 0, max: 5000 },
  },
  gaps: {
    innerMs: { min: 0, max: 2000 },
    betweenMs: { min: 0, max: 5000 },
    startMs: { min: 0, max: 5000 },
    endMs: { min: 0, max: 5000 },
  },
  output: {
    sampleRate: { min: 8000, max: 96_000 },
  },
} as const;

export const AUDIO_OUTPUT_BITRATES = [
  "64k",
  "96k",
  "128k",
  "192k",
  "256k",
  "320k",
] as const;

export const AUDIO_PROCESSING_DEFAULTS: AudioProcessingConfig = {
  silenceRemoval: {
    enabled: true,
    thresholdDb: -30,
    minDurationMs: 200,
    keepGapMs: 30,
  },
  normalization: {
    enabled: true,
    targetLufs: -16,
    truePeakDb: -1.5,
  },
  highPassFilter: {
    enabled: true,
    frequencyHz: 80,
  },
  limiter: {
    enabled: true,
    limitDb: -1.0,
  },
  fade: {
    inMs: 0,
    outMs: 0,
  },
  gaps: {
    innerMs: 0,
    betweenMs: 50,
    startMs: 0,
    endMs: 0,
  },
  concatenation: {
    enabled: true,
  },
  output: {
    format: "mp3",
    bitrate: "192k",
    sampleRate: 44_100,
  },
};

export const AUDIO_PROCESSING_UPLOAD_LIMITS = {
  maxFiles: 50,
  maxFileSizeBytes: 100 * 1024 * 1024,
  presignedUrlExpirySeconds: 3600,
  downloadUrlExpirySeconds: 86_400,
} as const;

export const AUDIO_PROCESSING_TTL_MS = 3 * 24 * 60 * 60 * 1000;
export const AUDIO_PROCESSING_CLEANUP_CRON = "0 * * * *";

export const AUDIO_PROCESSING_NAME_LIMITS = {
  min: 1,
  max: 100,
} as const;

```

D:/1_Projects/jstonehub/packages/contract/src/auth-error.ts

```
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export const AUTH_ERROR_CODES = [
  "UNKNOWN",
  "UNAUTHORIZED",
  "SESSION_EXPIRED",
  "BANNED",
  "INSUFFICIENT_ROLE",
] as const;

export const AUTH_ERROR_HTTP_STATUS: Record<AuthErrorCode, number> = {
  UNKNOWN: 500,
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 401,
  BANNED: 403,
  INSUFFICIENT_ROLE: 403,
} as const;

export const AUTH_ERROR_MESSAGE: Record<AuthErrorCode, string> = {
  UNKNOWN: "An unexpected error occurred. Please try again.",
  UNAUTHORIZED: "You need to sign in to continue.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  BANNED: "Your account has been suspended.",
  INSUFFICIENT_ROLE:
    "You don't have the required permissions to access this application.",
} as const;

```

D:/1_Projects/jstonehub/packages/contract/src/auth.ts

```
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export const AUTH_ERROR_CODES = [
  "UNKNOWN",
  "UNAUTHORIZED",
  "SESSION_EXPIRED",
  "BANNED",
  "INSUFFICIENT_ROLE",
] as const;

export const AUTH_ERROR_HTTP_STATUS: Record<AuthErrorCode, number> = {
  UNKNOWN: 500,
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 401,
  BANNED: 403,
  INSUFFICIENT_ROLE: 403,
};

export const AUTH_ERROR_MESSAGE: Record<AuthErrorCode, string> = {
  UNKNOWN: "An unexpected error occurred. Please try again.",
  UNAUTHORIZED: "You need to sign in to continue.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  BANNED: "Your account has been suspended.",
  INSUFFICIENT_ROLE:
    "You don't have the required permissions to access this application.",
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  globalRole: string;
  isBanned: boolean;
  bannedReason: string | null;
};

export type SessionResponse =
  | { user: SessionUser & { permissions: string[] } }
  | { user: null };
```

D:/1_Projects/jstonehub/packages/contract/src/format.ts

```
const BYTES_IN_KB = 1024;
const BYTES_IN_MB = BYTES_IN_KB * BYTES_IN_KB;

export function formatFileSize(bytes: number): string {
  if (bytes < BYTES_IN_KB) {
    return `${bytes} B`;
  }
  if (bytes < BYTES_IN_MB) {
    return `${(bytes / BYTES_IN_KB).toFixed(1)} KB`;
  }
  return `${(bytes / BYTES_IN_MB).toFixed(1)} MB`;
}

export { BYTES_IN_KB, BYTES_IN_MB };

```

D:/1_Projects/jstonehub/packages/contract/src/joke-tts.ts

```
export type JokeTtsPipelineStatus =
  | "pending"
  | "creating_tasks"
  | "synthesizing"
  | "processing_audio"
  | "saving"
  | "completed"
  | "failed";

export const JOKE_TTS_PIPELINE_STATUSES: JokeTtsPipelineStatus[] = [
  "pending",
  "creating_tasks",
  "synthesizing",
  "processing_audio",
  "saving",
  "completed",
  "failed",
];

```

D:/1_Projects/jstonehub/packages/contract/src/joke.ts

```
export type JokeStatus = (typeof JOKE_STATUSES)[number];
export type JokeTranslationStatus = (typeof JOKE_TRANSLATION_STATUSES)[number];

export const JOKE_STATUSES = ["draft", "review", "approved"] as const;
export const JOKE_TRANSLATION_STATUSES = ["draft", "approved"] as const;

export const JOKE_HUMOR_RATING = {
  min: 0,
  max: 10,
} as const;

export const JOKE_SORTS = ["createdAt", "humorRating"] as const;
export type JokeSort = (typeof JOKE_SORTS)[number];

```

D:/1_Projects/jstonehub/packages/contract/src/language.ts

```
export type LanguageSort = (typeof LANGUAGE_SORTS)[number];

export const LANGUAGE_SORTS = ["createdAt", "name", "code"] as const;

export const LANGUAGE_LIMITS = {
  code: { min: 2, max: 10 },
  name: { min: 1, max: 100 },
} as const;

```

D:/1_Projects/jstonehub/packages/contract/src/permission.ts

```
import type { GlobalRole } from "./role";

// ─── Admin Permissions ────────────────────────────────────────────────────────

export const ADMIN_PERMISSIONS = [
  "admin.joke.read",
  "admin.joke.create",
  "admin.joke.update",
  "admin.joke.delete",
  "admin.joke.approve",

  "admin.language.read",
  "admin.language.create",
  "admin.language.delete",

  "admin.tag.read",
  "admin.tag.create",
  "admin.tag.delete",

  "admin.tts.manage",

  "admin.storage.browse",
  "admin.storage.delete",

  "admin.fingerprint.read",
  "admin.fingerprint.manage",

  "admin.sv-credential.read",
  "admin.sv-credential.manage",

  "admin.user.read",
  "admin.user.ban",
  "admin.user.unban",
  "admin.user.set-role",
  "admin.user.set-permissions",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

// ─── Org Permissions (future use) ─────────────────────────────────────────────

export const ORG_PERMISSIONS = [
  "org.project.create",
  "org.project.update",
  "org.project.delete",

  "org.social.connect",
  "org.social.disconnect",
  "org.social.post",

  "org.content.generate",
  "org.content.approve",
  "org.content.publish",

  "org.member.invite",
  "org.member.remove",
  "org.member.set-permissions",
] as const;

export type OrgPermission = (typeof ORG_PERMISSIONS)[number];

// ─── Default Permissions per Role ─────────────────────────────────────────────

export const DEFAULT_ROLE_ADMIN_PERMISSIONS: Record<
  GlobalRole,
  readonly AdminPermission[]
> = {
  user: [],

  moderator: [
    "admin.joke.read",
    "admin.joke.create",
    "admin.joke.update",
    "admin.joke.approve",
    "admin.language.read",
    "admin.language.create",
    "admin.tag.read",
    "admin.tag.create",
  ],

  admin: [
    "admin.joke.read",
    "admin.joke.create",
    "admin.joke.update",
    "admin.joke.delete",
    "admin.joke.approve",
    "admin.language.read",
    "admin.language.create",
    "admin.language.delete",
    "admin.tag.read",
    "admin.tag.create",
    "admin.tag.delete",
    "admin.tts.manage",
    "admin.storage.browse",
    "admin.storage.delete",
    "admin.fingerprint.read",
    "admin.fingerprint.manage",
    "admin.sv-credential.read",
    "admin.sv-credential.manage",
    "admin.user.read",
    "admin.user.ban",
    "admin.user.unban",
  ],

  owner: ADMIN_PERMISSIONS,
};

// ─── Permission Helpers ───────────────────────────────────────────────────────

export function hasAdminPermission(
  permissions: readonly AdminPermission[],
  required: AdminPermission,
): boolean {
  return permissions.includes(required);
}

export function hasAnyAdminPermission(
  permissions: readonly AdminPermission[],
  required: readonly AdminPermission[],
): boolean {
  return required.some((p) => permissions.includes(p));
}

export function hasAllAdminPermissions(
  permissions: readonly AdminPermission[],
  required: readonly AdminPermission[],
): boolean {
  return required.every((p) => permissions.includes(p));
}

// ─── Dev-time Validation ──────────────────────────────────────────────────────

export function assertAdminPermission(
  permission: string,
): asserts permission is AdminPermission {
  if (!permission.startsWith("admin.")) {
    throw new Error(
      `Expected admin permission (admin.*), got "${permission}".`,
    );
  }
}

export function assertOrgPermission(
  permission: string,
): asserts permission is OrgPermission {
  if (!permission.startsWith("org.")) {
    throw new Error(`Expected org permission (org.*), got "${permission}".`);
  }
}

export function validatePermissionForRole(
  targetRole: GlobalRole,
  permission: string,
): void {
  if (targetRole === "user" && permission.startsWith("admin.")) {
    throw new Error(
      `Cannot assign admin permission "${permission}" to role "user".`,
    );
  }
}
```

D:/1_Projects/jstonehub/packages/contract/src/role.ts

```
export type GlobalRole = (typeof GLOBAL_ROLES)[number];
export type AdminRole = (typeof ADMIN_ROLES)[number];
export type OrgRole = (typeof ORG_ROLES)[number];

export const ADMIN_ROLES = ["moderator", "admin", "owner"] as const;
export const GLOBAL_ROLES = ["user", ...ADMIN_ROLES] as const;
export const ORG_ROLES = ["org_owner", "org_member"] as const;
export const GLOBAL_ROLE_HIERARCHY: Record<GlobalRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  owner: 3,
} as const;

```

D:/1_Projects/jstonehub/packages/contract/src/secret-voicer.ts

```
export type VoiceGender = (typeof VOICE_GENDERS)[number];
export type SecretVoicerVoicesResponse = {
  voices: SecretVoicerVoice[];
};
export type SecretVoicerVoice = {
  voiceId: string;
  name: string;
  gender: VoiceGender;
  locale: string | null;
  isMultilingual: boolean;
  previewUrl: string | null;
  previewUrlEmotional: string | null;
  usageCount: number;
  avatarUrl: string | null;
  description: string | null;
  accent: string | null;
  ageGroup: string | null;
  voiceStyleTags: string[];
  useCases: string[];
};

export const VOICE_GENDERS = ["MALE", "FEMALE"] as const;
export const SECRET_VOICER_CACHE_TTL_MS = 3_600_000;
export const SECRET_VOICER_BASE_URL = "https://secret-voicer.ru";
export const SECRET_VOICER_API_URL = `${SECRET_VOICER_BASE_URL}/api`;

```

D:/1_Projects/jstonehub/packages/contract/src/segment.ts

```
export type Segment = {
  id: string;
  role: string;
  text: string;
};

export type RoleVoiceMapping = {
  role: string;
  voiceId: string | null;
};

export const SEGMENT_ROLE_MAX_LENGTH = 50;
export const SEGMENT_TEXT_MAX_LENGTH = 5000;

```

D:/1_Projects/jstonehub/packages/contract/src/storage.ts

```
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export const STORAGE_BUCKETS = ["jstonehub"] as const;

export const STORAGE_PREFIXES = {
  audioProcessingInput: (jobId: string) =>
    `tmp/audio-processing/${jobId}/input/`,
  audioProcessingOutput: (jobId: string) =>
    `tmp/audio-processing/${jobId}/output/`,
  audioProcessingJob: (jobId: string) => `tmp/audio-processing/${jobId}/`,
  ttsOutput: (projectId: string) => `tmp/tts/${projectId}/`,
  voicePreview: (voiceId: string) => `cache/voice-preview/${voiceId}/`,
  jokeAudio: (jokeId: string) => `content/joke/${jokeId}/audio/`,
} as const;

```

D:/1_Projects/jstonehub/packages/contract/src/subscription.ts

```
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const SUBSCRIPTION_TIERS = [
  "common",
  "rare",
  "epic",
  "legendary",
] as const;

```

D:/1_Projects/jstonehub/packages/contract/src/tag.ts

```
export type TagSort = (typeof TAG_SORTS)[number];

export const TAG_SORTS = ["createdAt", "name", "slug"] as const;

export const TAG_LIMITS = {
  slug: { min: 1, max: 100 },
  name: { min: 1, max: 100 },
} as const;

```

D:/1_Projects/jstonehub/packages/contract/src/timing.ts

```
export const DEBOUNCE_SEARCH_DEFAULT = 400;

```

D:/1_Projects/jstonehub/apps/admin/src/app/main.tsx

```
import { getElementByIdOrThrow } from "@packages/util/dom";
import { QueryClientProvider } from "@tanstack/solid-query";
import { createRouter, RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";

import { routeTree } from "#admin/routeTree.gen";
import { queryClient } from "#admin/shared/api/query-client";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
});

declare module "@tanstack/solid-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: @tanstack/solid-router
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

render(() => <App />, getElementByIdOrThrow("app"));

```

D:/1_Projects/jstonehub/apps/admin/src/app/_root.layout.tsx

```
import { Devtools } from "@packages/devtool";
import { UiProvider } from "@packages/ui/provider";
import { HeadContent, Outlet, Scripts } from "@tanstack/solid-router";

export function RootLayout() {
  return (
    <UiProvider>
      <HeadContent />
      <Outlet />
      <Devtools />
      <Scripts />
    </UiProvider>
  );
}

```

D:/1_Projects/jstonehub/apps/admin/src/app/_router.tsx

```
import { QueryClientProvider } from "@tanstack/solid-query";
import { createRouter, RouterProvider } from "@tanstack/solid-router";

import { routeTree } from "#admin/routeTree.gen";
import { queryClient } from "#admin/shared/api/query-client";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    // biome-ignore lint/style/noNonNullAssertion: @tanstack/solid-router
    queryClient: undefined!,
  },
});

declare module "@tanstack/solid-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: @tanstack/solid-router
  interface Register {
    router: typeof router;
  }
}

export function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ queryClient }} />
    </QueryClientProvider>
  );
}

```

D:/1_Projects/jstonehub/apps/admin/src/app/_style.css

```
@import "@packages/style";

:root {
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  --background: oklch(0.13 0.012 270);
  --foreground: oklch(0.94 0.008 270);

  --subtle: oklch(0.6 0.01 270);
  --border: oklch(0.28 0.012 270);

  --card: oklch(0.205 0.015 260);
  --sheet: oklch(0.17 0.014 265);
  --dialog: oklch(0.19 0.014 265);
  --tooltip: oklch(0.24 0.015 270);

  --control: oklch(0.18 0.01 270);
  --control-border: oklch(0.32 0.015 270);

  --scrollbar-track: oklch(0.18 0.01 270);
  --scrollbar-thumb: oklch(0.32 0.012 270);
  --scrollbar-thumb-hover: oklch(0.45 0.01 270);

  --primary: oklch(0.68 0.19 280);
  --primary-foreground: oklch(0.13 0.012 280);

  --secondary: oklch(0.24 0.012 270);
  --secondary-foreground: oklch(0.9 0.008 270);

  --destructive: oklch(0.58 0.2 25);
  --destructive-foreground: oklch(0.98 0.01 25);

  --active: oklch(0.24 0.04 160);
  --active-foreground: oklch(0.74 0.14 160);

  --selection: oklch(0.68 0.19 280 / 0.4);
  --selection-foreground: oklch(0.94 0.008 270);

  --success: oklch(0.22 0.045 150);
  --success-foreground: oklch(0.74 0.13 150);
  --success-border: oklch(0.46 0.09 150);

  --error: oklch(0.22 0.045 25);
  --error-foreground: oklch(0.72 0.14 25);
  --error-border: oklch(0.46 0.095 25);

  --warning: oklch(0.24 0.055 75);
  --warning-foreground: oklch(0.8 0.12 75);
  --warning-border: oklch(0.5 0.085 75);

  --info: oklch(0.22 0.04 235);
  --info-foreground: oklch(0.72 0.12 235);
  --info-border: oklch(0.46 0.08 235);

  --ring: oklch(0.68 0.19 280 / 0.45);
  --ring-error: oklch(0.72 0.14 25 / 0.45);
  --backdrop: oklch(0 0 0 / 0.75);

  --logo-from: oklch(0.3 0.03 250);
  --logo-via: oklch(0.4 0.08 220);
  --logo-to: oklch(0.55 0.14 190);
  --logo-accent: oklch(0.55 0.14 190);
}

.light {
  --background: oklch(0.985 0.006 270);
  --foreground: oklch(0.16 0.02 270);

  --subtle: oklch(0.46 0.012 270);
  --border: oklch(0.88 0.012 270);

  --card: oklch(0.985 0.002 260);
  --sheet: oklch(0.98 0.004 265);
  --dialog: oklch(0.99 0.003 265);
  --tooltip: oklch(0.2 0.015 270);

  --control: oklch(0.97 0.005 270);
  --control-border: oklch(0.82 0.01 270);

  --scrollbar-track: oklch(0.94 0.006 270);
  --scrollbar-thumb: oklch(0.82 0.01 270);
  --scrollbar-thumb-hover: oklch(0.65 0.01 270);

  --primary: oklch(0.52 0.22 280);
  --primary-foreground: oklch(0.98 0.005 280);

  --secondary: oklch(0.935 0.015 270);
  --secondary-foreground: oklch(0.24 0.02 270);

  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.98 0.01 25);

  --active: oklch(0.92 0.045 160);
  --active-foreground: oklch(0.38 0.14 160);

  --selection: oklch(0.52 0.22 280 / 0.3);
  --selection-foreground: oklch(0.16 0.02 270);

  --success: oklch(0.94 0.045 150);
  --success-foreground: oklch(0.4 0.13 150);
  --success-border: oklch(0.65 0.09 150);

  --error: oklch(0.94 0.045 25);
  --error-foreground: oklch(0.5 0.16 25);
  --error-border: oklch(0.7 0.11 25);

  --warning: oklch(0.94 0.065 75);
  --warning-foreground: oklch(0.45 0.13 75);
  --warning-border: oklch(0.68 0.09 75);

  --info: oklch(0.94 0.04 235);
  --info-foreground: oklch(0.45 0.13 235);
  --info-border: oklch(0.68 0.08 235);

  --ring: oklch(0.52 0.22 280 / 0.35);
  --ring-error: oklch(0.5 0.16 25 / 0.35);
  --backdrop: oklch(0.16 0.02 270 / 0.6);

  --logo-from: oklch(0.3 0.03 250);
  --logo-via: oklch(0.4 0.08 220);
  --logo-to: oklch(0.55 0.14 190);
  --logo-accent: oklch(0.55 0.14 190);
}

```

D:/1_Projects/jstonehub/apps/api/src/app/api.ts

```
import { Elysia } from "elysia";

import { audioProcessingV1 } from "#api/feature/audio-processing/audio-processing.v1";
import { authV1 } from "#api/feature/auth/auth.v1";
import { userV1 } from "#api/feature/auth/user.v1";
import { browserFingerprintV1 } from "#api/feature/browser-fingerprint/browser-fingerprint.v1";
import { jokeV1 } from "#api/feature/joke/joke.v1";
import { jokeTtsV1 } from "#api/feature/joke-tts/joke-tts.v1";
import { languageV1 } from "#api/feature/language/language.v1";
import { secretVoicerTaskV1 } from "#api/feature/secret-voicer/secret-voicer-task.v1";
import { secretVoicerVoiceV1 } from "#api/feature/secret-voicer/secret-voicer-voice.v1";
import { secretVoicerCredentialV1 } from "#api/feature/secret-voicer-credential/secret-voicer-credential.v1";
import { storageV1 } from "#api/feature/storage/storage.v1";
import { tagV1 } from "#api/feature/tag/tag.v1";
import { ttsProjectV1 } from "#api/feature/tts-project/tts-project.v1";
import { ttsProjectWebhookV1 } from "#api/feature/tts-project/tts-project-webhook.v1";
import { queueV1 } from "#api/shared/queue/queue.v1";
import { storageCleanupCron } from "#api/shared/storage/storage-cleanup.cron";
import { corsPlugin } from "#api/shared/web/cors";
import { healthcheckV1 } from "#api/shared/web/healthcheck.v1";

export const apiApp = new Elysia()
  .use(corsPlugin)
  .use(storageCleanupCron)
  .use(healthcheckV1)
  .use(authV1)          
  .use(userV1)          
  .use(queueV1)
  .use(browserFingerprintV1)
  .use(secretVoicerCredentialV1)
  .use(secretVoicerVoiceV1)
  .use(secretVoicerTaskV1)
  .use(ttsProjectV1)
  .use(ttsProjectWebhookV1)
  .use(languageV1)
  .use(tagV1)
  .use(jokeV1)
  .use(jokeTtsV1)
  .use(audioProcessingV1)
  .use(storageV1);

```

D:/1_Projects/jstonehub/apps/api/src/app/api.type.ts

```
import type { apiApp } from "./api";

export type ApiApp = typeof apiApp;

```

D:/1_Projects/jstonehub/apps/api/src/app/main.ts

```
import { startServer } from "#api/shared/web/server";

import { apiApp } from "./api";

startServer(apiApp);

```

D:/1_Projects/jstonehub/apps/hub/src/app/main.tsx

```
import { getElementByIdOrThrow } from "@packages/util/dom";
import { QueryClientProvider } from "@tanstack/solid-query";
import { createRouter, RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";

import { routeTree } from "#hub/routeTree.gen";
import { queryClient } from "#hub/shared/api/query-client";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
});

declare module "@tanstack/solid-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: @tanstack/solid-router
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

render(() => <App />, getElementByIdOrThrow("app"));

```

D:/1_Projects/jstonehub/apps/hub/src/app/_root.layout.tsx

```
import { Devtools } from "@packages/devtool";
import { UiProvider } from "@packages/ui/provider";
import { HeadContent, Outlet, Scripts } from "@tanstack/solid-router";

export function RootLayout() {
  return (
    <UiProvider>
      <HeadContent />
      <Outlet />
      <Devtools />
      <Scripts />
    </UiProvider>
  );
}

```

D:/1_Projects/jstonehub/apps/hub/src/app/_style.css

```
@import "@packages/style";

:root {
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --background: oklch(0.13 0.012 270);
  --foreground: oklch(0.94 0.008 270);

  --subtle: oklch(0.6 0.01 270);
  --border: oklch(0.28 0.012 270);

  --card: oklch(0.205 0.015 260);
  --sheet: oklch(0.17 0.014 265);
  --dialog: oklch(0.19 0.014 265);
  --tooltip: oklch(0.24 0.015 270);

  --control: oklch(0.18 0.01 270);
  --control-border: oklch(0.32 0.015 270);

  --scrollbar-track: oklch(0.18 0.01 270);
  --scrollbar-thumb: oklch(0.32 0.012 270);
  --scrollbar-thumb-hover: oklch(0.45 0.01 270);

  --primary: oklch(0.68 0.19 280);
  --primary-foreground: oklch(0.13 0.012 280);

  --secondary: oklch(0.24 0.012 270);
  --secondary-foreground: oklch(0.9 0.008 270);

  --destructive: oklch(0.58 0.2 25);
  --destructive-foreground: oklch(0.98 0.01 25);

  --active: oklch(0.28 0.04 260);
  --active-foreground: oklch(0.76 0.15 260);

  --selection: oklch(0.68 0.19 280 / 0.4);
  --selection-foreground: oklch(0.94 0.008 270);

  --success: oklch(0.22 0.045 150);
  --success-foreground: oklch(0.74 0.13 150);
  --success-border: oklch(0.46 0.09 150);

  --error: oklch(0.22 0.045 25);
  --error-foreground: oklch(0.72 0.14 25);
  --error-border: oklch(0.46 0.095 25);

  --warning: oklch(0.24 0.055 75);
  --warning-foreground: oklch(0.8 0.12 75);
  --warning-border: oklch(0.5 0.085 75);

  --info: oklch(0.22 0.04 235);
  --info-foreground: oklch(0.72 0.12 235);
  --info-border: oklch(0.46 0.08 235);

  --ring: oklch(0.68 0.19 280 / 0.45);
  --ring-error: oklch(0.72 0.14 25 / 0.45);
  --backdrop: oklch(0 0 0 / 0.75);

  --logo-from: oklch(0.55 0.22 280);
  --logo-via: oklch(0.58 0.2 265);
  --logo-to: oklch(0.58 0.18 255);
  --logo-accent: oklch(0.58 0.18 255);
}

.light {
  --background: oklch(0.985 0.006 270);
  --foreground: oklch(0.16 0.02 270);

  --subtle: oklch(0.46 0.012 270);
  --border: oklch(0.88 0.012 270);

  --card: oklch(0.985 0.002 260);
  --sheet: oklch(0.98 0.004 265);
  --dialog: oklch(0.99 0.003 265);
  --tooltip: oklch(0.2 0.015 270);

  --control: oklch(0.97 0.005 270);
  --control-border: oklch(0.82 0.01 270);

  --scrollbar-track: oklch(0.94 0.006 270);
  --scrollbar-thumb: oklch(0.82 0.01 270);
  --scrollbar-thumb-hover: oklch(0.65 0.01 270);

  --primary: oklch(0.52 0.22 280);
  --primary-foreground: oklch(0.98 0.005 280);

  --secondary: oklch(0.935 0.015 270);
  --secondary-foreground: oklch(0.24 0.02 270);

  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.98 0.01 25);

  --active: oklch(0.92 0.04 260);
  --active-foreground: oklch(0.46 0.17 260);

  --selection: oklch(0.52 0.22 280 / 0.3);
  --selection-foreground: oklch(0.16 0.02 270);

  --success: oklch(0.94 0.045 150);
  --success-foreground: oklch(0.4 0.13 150);
  --success-border: oklch(0.65 0.09 150);

  --error: oklch(0.94 0.045 25);
  --error-foreground: oklch(0.5 0.16 25);
  --error-border: oklch(0.7 0.11 25);

  --warning: oklch(0.94 0.065 75);
  --warning-foreground: oklch(0.45 0.13 75);
  --warning-border: oklch(0.68 0.09 75);

  --info: oklch(0.94 0.04 235);
  --info-foreground: oklch(0.45 0.13 235);
  --info-border: oklch(0.68 0.08 235);

  --ring: oklch(0.52 0.22 280 / 0.35);
  --ring-error: oklch(0.5 0.16 25 / 0.35);
  --backdrop: oklch(0.16 0.02 270 / 0.6);

  --logo-from: oklch(0.55 0.22 280);
  --logo-via: oklch(0.58 0.2 265);
  --logo-to: oklch(0.58 0.18 255);
  --logo-accent: oklch(0.58 0.18 255);
}

```

D:/1_Projects/jstonehub/apps/worker/src/app/main.ts

```
import process from "node:process";

import { registerAudioProcessingWorker } from "#worker/feature/audio-processing/audio-processing.worker";
import { registerPingWorker } from "#worker/feature/ping/ping.worker";
import { registerTtsWorker } from "#worker/feature/tts/tts.worker";
import { env } from "#worker/shared/config/env";
import { closeRedisConnection } from "#worker/shared/queue/connection";
import {
  closeAllWorkers,
  getRegisteredWorkerCount,
} from "#worker/shared/queue/registry";

function registerAllWorkers(): void {
  registerPingWorker();
  registerAudioProcessingWorker();
  registerTtsWorker();
}

function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    // biome-ignore lint/suspicious/noConsole: Shutdown logging required
    console.log(`\n⏳ Worker: Received ${signal}, shutting down...`);

    try {
      await closeAllWorkers();
      await closeRedisConnection();

      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.log("✅ Worker: Shutdown complete");
      process.exit(0);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.error("❌ Worker: Shutdown error:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

function main(): void {
  // biome-ignore lint/suspicious/noConsole: Startup logging required
  console.log(
    `🚀 Worker starting (${env.NODE_ENV}, concurrency: ${env.WORKER_CONCURRENCY})`,
  );

  registerAllWorkers();
  setupGracefulShutdown();

  const count = getRegisteredWorkerCount();
  // biome-ignore lint/suspicious/noConsole: Startup logging required
  console.log(`✅ Worker ready: ${count} queue(s) registered`);
}

main();

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/constant.ts

```
export type PaginationOrder = (typeof PAGINATION_ORDERS)[number];

export const PAGINATION_ORDERS = ["asc", "desc"] as const;
export const PAGINATION_ORDER_DEFAULT = "asc" as const;

export const PAGINATION_QUERY = {
  min: 0,
  max: 200,
} as const;

export const PAGINATION_FILTER_ALL = "all" as const;

export const PAGINATION_CURSOR_LIMIT_DEFAULT = 50;

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/index.ts

```
export type { PaginationOrder } from "./constant";

export {
  PAGINATION_CURSOR_LIMIT_DEFAULT,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDER_DEFAULT,
  PAGINATION_ORDERS,
  PAGINATION_QUERY,
} from "./constant";
export { createQueryParamsSchema } from "./typebox";
export { createValidateSearch } from "./valibot";

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/typebox.ts

```
import { Type } from "typebox";

import {
  PAGINATION_CURSOR_LIMIT_DEFAULT,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY,
} from "./constant";

type FilterConfig<Values extends readonly string[]> = {
  values: Values;
};

type QueryParamsConfigAll<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "all";
  sorts: Sorts;
  filters?: Filters;
};

type QueryParamsConfigCursor<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "cursor";
  sorts: Sorts;
  filters?: Filters;
  limitDefault?: number;
  limitMax?: number;
};

type QueryParamsConfig<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> =
  | QueryParamsConfigAll<Sorts, Filters>
  | QueryParamsConfigCursor<Sorts, Filters>;

function createQueryParamsSchema<
  const Sorts extends readonly string[],
  const Filters extends Record<string, FilterConfig<readonly string[]>>,
>(config: QueryParamsConfig<Sorts, Filters>) {
  const filterSchemas: Record<string, unknown> = {};

  if (config.filters) {
    for (const [key, filter] of Object.entries(config.filters)) {
      filterSchemas[key] = Type.Optional(
        Type.Union([
          Type.Literal(PAGINATION_FILTER_ALL),
          Type.Array(
            Type.Union(filter.values.map((val) => Type.Literal(val))),
            {
              minItems: 1,
            },
          ),
        ]),
      );
    }
  }

  const base = {
    query: Type.Optional(Type.String({ maxLength: PAGINATION_QUERY.max })),
    sort: Type.Optional(Type.Union(config.sorts.map((s) => Type.Literal(s)))),
    order: Type.Optional(
      Type.Union(PAGINATION_ORDERS.map((o) => Type.Literal(o))),
    ),
    ...filterSchemas,
  };

  if (config.mode === "all") {
    return Type.Object(base);
  }

  const limitDefault = config.limitDefault ?? PAGINATION_CURSOR_LIMIT_DEFAULT;
  const limitMax = config.limitMax ?? limitDefault;

  return Type.Object({
    ...base,
    cursor: Type.Optional(Type.String()),
    limit: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: limitMax,
        default: limitDefault,
      }),
    ),
  });
}

export { createQueryParamsSchema };

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/valibot.ts

```
import type { GenericSchema } from "valibot";

import {
  array,
  fallback,
  integer,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  union,
} from "valibot";

import {
  PAGINATION_CURSOR_LIMIT_DEFAULT,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDER_DEFAULT,
  PAGINATION_ORDERS,
  PAGINATION_QUERY,
} from "./constant";

type FilterConfig<Values extends readonly string[]> = {
  values: Values;
  default?: typeof PAGINATION_FILTER_ALL | Values[number][];
};

type ValidateSearchConfigAll<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "all";
  sorts: Sorts;
  sortDefault: Sorts[number];
  orderDefault?: (typeof PAGINATION_ORDERS)[number];
  queryDefault?: string;
  filters?: Filters;
};

type ValidateSearchConfigCursor<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  mode: "cursor";
  sorts: Sorts;
  sortDefault: Sorts[number];
  orderDefault?: (typeof PAGINATION_ORDERS)[number];
  queryDefault?: string;
  filters?: Filters;
  limitDefault?: number;
  limitMax?: number;
};

type ValidateSearchConfig<
  Sorts extends readonly string[],
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> =
  | ValidateSearchConfigAll<Sorts, Filters>
  | ValidateSearchConfigCursor<Sorts, Filters>;

type FilterOutput<F extends FilterConfig<readonly string[]>> =
  | typeof PAGINATION_FILTER_ALL
  | F["values"][number][];

type BaseOutput<Sorts extends readonly string[]> = {
  query: string;
  sort: Sorts[number];
  order: (typeof PAGINATION_ORDERS)[number];
};

type CursorOutput<Sorts extends readonly string[]> = BaseOutput<Sorts> & {
  cursor: string | undefined;
  limit: number;
};

type FiltersOutput<
  Filters extends Record<string, FilterConfig<readonly string[]>>,
> = {
  [K in keyof Filters]: FilterOutput<Filters[K]>;
};

type ValidateSearchOutput<
  Config extends ValidateSearchConfig<
    readonly string[],
    Record<string, FilterConfig<readonly string[]>>
  >,
> =
  Config extends ValidateSearchConfigCursor<infer S, infer F>
    ? CursorOutput<S> & FiltersOutput<F>
    : Config extends ValidateSearchConfigAll<infer S, infer F>
      ? BaseOutput<S> & FiltersOutput<F>
      : never;

function createValidateSearch<
  const Sorts extends readonly string[],
  const Filters extends Record<string, FilterConfig<readonly string[]>>,
  const Config extends ValidateSearchConfig<Sorts, Filters>,
>(config: Config): GenericSchema<unknown, ValidateSearchOutput<Config>> {
  const filterSchemas: Record<string, ReturnType<typeof fallback>> = {};

  if (config.filters) {
    for (const [key, filter] of Object.entries(config.filters)) {
      const defaultValue = filter.default ?? PAGINATION_FILTER_ALL;
      filterSchemas[key] = fallback(
        union([
          literal(PAGINATION_FILTER_ALL),
          pipe(
            array(picklist(filter.values as unknown as readonly string[])),
            minLength(1),
          ),
        ]),
        defaultValue,
      );
    }
  }

  const base = {
    query: fallback(
      pipe(string(), maxLength(PAGINATION_QUERY.max)),
      config.queryDefault ?? "",
    ),
    sort: fallback(
      picklist(config.sorts as unknown as readonly string[]),
      config.sortDefault,
    ),
    order: fallback(
      picklist(PAGINATION_ORDERS),
      config.orderDefault ?? PAGINATION_ORDER_DEFAULT,
    ),
    ...filterSchemas,
  };

  if (config.mode === "all") {
    return object(base) as unknown as GenericSchema<
      unknown,
      ValidateSearchOutput<Config>
    >;
  }

  const limitDefault =
    (config as ValidateSearchConfigCursor<Sorts, Filters>).limitDefault
    ?? PAGINATION_CURSOR_LIMIT_DEFAULT;
  const limitMax =
    (config as ValidateSearchConfigCursor<Sorts, Filters>).limitMax
    ?? limitDefault;

  return object({
    ...base,
    cursor: fallback(optional(string()), undefined),
    limit: fallback(
      pipe(number(), integer(), minValue(1), maxValue(limitMax)),
      limitDefault,
    ),
  }) as unknown as GenericSchema<unknown, ValidateSearchOutput<Config>>;
}

export { createValidateSearch };

```

D:/1_Projects/jstonehub/packages/contract/src/queue/index.ts

```
export type {
  AudioProcessingJobData,
  AudioProcessingJobResult,
  PingJobData,
  PingJobResult,
  QueueJobDataMap,
  QueueJobResultMap,
  QueueName,
  TtsCredentials,
  TtsJobData,
  TtsJobResult,
} from "./queue.type";

export { QUEUE_NAMES } from "./queue.constant";

```

D:/1_Projects/jstonehub/packages/contract/src/queue/queue.constant.ts

```
export const QUEUE_NAMES = [
  "ping",
  "tts",
  "audio-processing",
  "transcription",
  "video-compose",
  "media-download",
] as const;

```

D:/1_Projects/jstonehub/packages/contract/src/queue/queue.type.ts

```
import type { AudioProcessingConfig } from "../audio-processing";
import type { QUEUE_NAMES } from "./queue.constant";

export type QueueName = (typeof QUEUE_NAMES)[number];

export type PingJobData = {
  message: string;
  timestamp: number;
};

export type PingJobResult = {
  echo: string;
  processedAt: number;
  workerUptime: number;
};

export type AudioProcessingJobData = {
  jobId: string;
  config: AudioProcessingConfig;
  inputKeys: string[];
  outputPrefix: string;
  outputName: string;
  isConcatenated: boolean;
};

export type AudioProcessingOutputFile = {
  key: string;
  fileName: string;
  sizeBytes: number;
  durationMs: number;
};

export type AudioProcessingJobResult = {
  outputKeys: string[];
  outputFiles: AudioProcessingOutputFile[];
  processedCount: number;
  totalDurationMs: number;
  processedAt: number;
};

export type TtsJobData = {
  jobId: string;
  taskId: number;
  voiceId: string;
  text: string;
  rate: number;
  outputKey: string;
  credentials: TtsCredentials;
};

export type TtsCredentials = {
  csrfToken: string;
  sessionId: string;
  userAgent: string;
  acceptLanguage: string;
};

export type TtsJobResult = {
  outputKey: string;
  sizeBytes: number;
  durationMs: number;
  processedAt: number;
};

export type QueueJobDataMap = {
  ping: PingJobData;
  tts: TtsJobData;
  "audio-processing": AudioProcessingJobData;
  transcription: Record<string, unknown>;
  "video-compose": Record<string, unknown>;
  "media-download": Record<string, unknown>;
};

export type QueueJobResultMap = {
  ping: PingJobResult;
  tts: TtsJobResult;
  "audio-processing": AudioProcessingJobResult;
  transcription: Record<string, unknown>;
  "video-compose": Record<string, unknown>;
  "media-download": Record<string, unknown>;
};

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { AuthLayout } from "#admin/feature/auth/_auth.layout";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_public.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { PublicLayout } from "#admin/feature/auth/_public.layout";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/__root.tsx

```
import type { QueryClient } from "@tanstack/solid-query";

import { createRootRouteWithContext } from "@tanstack/solid-router";

import { RootLayout } from "../_root.layout";
import style from "../_style.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    links: [{ rel: "stylesheet", href: style }],
  }),
  component: RootLayout,
});

```

D:/1_Projects/jstonehub/apps/admin/src/feature/auth/_auth.layout.tsx

```
import type { SidebarGroupItem } from "@packages/ui/layout";

import { Logo } from "@packages/ui/data-display";
import {
  AppLayout,
  ContentShell,
  Navigation,
  SidebarDesktopToggle,
  SidebarMobileTrigger,
} from "@packages/ui/layout";
import { ModeToggle } from "@packages/ui/theme";
import { Link, Outlet, useLocation } from "@tanstack/solid-router";
import { ArrowLeftRight } from "lucide-solid";

import { env } from "#admin/shared/config/env";

import { GROUP_CHILD_ROUTES, SIDEBAR_ITEMS } from "./_sidebar-item";

function AuthLayout() {
  const location = useLocation();

  const hasActiveChild = (group: SidebarGroupItem) => {
    const routes = GROUP_CHILD_ROUTES[group.label];
    if (!routes) {
      return false;
    }
    return routes.some((route) => location().pathname.startsWith(route));
  };

  return (
    <AppLayout>
      <Navigation desktop={<DesktopNav />} mobile={<MobileNav />} />
      <ContentShell
        logo={
          <Logo appName="admin">
            {(logoProps) => <Link to="/" {...logoProps} />}
          </Logo>
        }
        sidebarItems={SIDEBAR_ITEMS}
        main={<Outlet />}
        closeLabel="Close sidebar"
        hasActiveChild={hasActiveChild}
      />
    </AppLayout>
  );
}

function AppSwitchLink() {
  return (
    <a
      href={env.HUB_URL}
      class="flex items-center gap-[6px] text-[13px] text-subtle hover:text-foreground transition-colors duration-normal px-[8px] py-[4px] rounded-sm"
      title="Switch to Hub"
    >
      <ArrowLeftRight size={14} />
      <span>Hub</span>
    </a>
  );
}

function DesktopNav() {
  return (
    <>
      <div class="flex items-center gap-[12px]">
        <Logo appName="admin">
          {(logoProps) => <Link to="/" {...logoProps} />}
        </Logo>
        <SidebarDesktopToggle aria-label="Toggle sidebar" />
      </div>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

function MobileNav() {
  return (
    <>
      <SidebarMobileTrigger aria-label="Open menu" />
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

export { AuthLayout };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/auth/_public.layout.tsx

```
import { Logo } from "@packages/ui/data-display";
import { AppLayout, Navigation } from "@packages/ui/layout";
import { ModeToggle } from "@packages/ui/theme";
import { Link, Outlet } from "@tanstack/solid-router";
import { ArrowLeftRight } from "lucide-solid";

import { env } from "#admin/shared/config/env";

function PublicLayout() {
  return (
    <AppLayout>
      <Navigation desktop={<DesktopNav />} mobile={<MobileNav />} />
      <Outlet />
    </AppLayout>
  );
}

function AppSwitchLink() {
  return (
    <a
      href={env.HUB_URL}
      class="flex items-center gap-[6px] text-[13px] text-subtle hover:text-foreground transition-colors duration-normal px-[8px] py-[4px] rounded-sm"
      title="Switch to Hub"
    >
      <ArrowLeftRight size={14} />
      <span>Hub</span>
    </a>
  );
}

function DesktopNav() {
  return (
    <>
      <Logo appName="admin">
        {(logoProps) => <Link to="/" {...logoProps} />}
      </Logo>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

function MobileNav() {
  return (
    <>
      <Logo appName="admin">
        {(logoProps) => <Link to="/" {...logoProps} />}
      </Logo>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

export { PublicLayout };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/auth/_sidebar-item.tsx

```
import type { SidebarItem } from "@packages/ui/layout";

import { Link } from "@tanstack/solid-router";
import {
  Database,
  Fingerprint,
  Globe,
  Home,
  KeyRound,
  Laugh,
  Server,
  Tag,
} from "lucide-solid";

const GROUP_CHILD_ROUTES: Record<string, string[]> = {
  Infrastructure: [
    "/infrastructure/browser-fingerprint",
    "/infrastructure/secret-voicer-credential",
    "/storage",
  ],
  Content: ["/content/joke", "/content/language", "/content/tag"],
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    type: "link",
    icon: (props) => <Home size={props.size} />,
    label: "Home",
    render: (renderProps) => (
      <Link
        to="/"
        class={renderProps.class}
        ref={renderProps.ref}
        onMouseEnter={renderProps.onMouseEnter}
        onMouseLeave={renderProps.onMouseLeave}
        onFocus={renderProps.onFocus}
        onBlur={renderProps.onBlur}
        activeOptions={{ exact: true }}
      >
        {renderProps.children}
      </Link>
    ),
  },
  { type: "separator" },
  {
    type: "group",
    icon: (props) => <Server size={props.size} />,
    label: "Infrastructure",
    defaultOpen: true,
    children: [
      {
        icon: (props) => <Fingerprint size={props.size} />,
        label: "Fingerprints",
        render: (renderProps) => (
          <Link
            to="/infrastructure/browser-fingerprint"
            search={{}}
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <KeyRound size={props.size} />,
        label: "Secret Voicer",
        render: (renderProps) => (
          <Link
            to="/infrastructure/secret-voicer-credential"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <Database size={props.size} />,
        label: "Storage",
        render: (renderProps) => (
          <Link
            to="/storage"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
    ],
  },
  {
    type: "group",
    icon: (props) => <Laugh size={props.size} />,
    label: "Content",
    defaultOpen: true,
    children: [
      {
        icon: (props) => <Laugh size={props.size} />,
        label: "Jokes",
        render: (renderProps) => (
          <Link
            to="/content/joke"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <Globe size={props.size} />,
        label: "Languages",
        render: (renderProps) => (
          <Link
            to="/content/language"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <Tag size={props.size} />,
        label: "Tags",
        render: (renderProps) => (
          <Link
            to="/content/tag"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
    ],
  },
];

export { GROUP_CHILD_ROUTES, SIDEBAR_ITEMS };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/home/home.page.tsx

```
import { H3 } from "@packages/ui/typography";

export function HomePage() {
  return (
    <div class="p-2">
      <H3>Welcome Home!</H3>
    </div>
  );
}

```

D:/1_Projects/jstonehub/apps/admin/src/feature/joke/joke-create.dialog.tsx

```
import { Button, LoadingButton } from "@packages/ui/action";
import {
  NumberInputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H3 } from "@packages/ui/typography";
import { createSignal, For, Show } from "solid-js";

import { createLanguagesQuery } from "#admin/feature/language/language.query";
import { createTagsQuery } from "#admin/feature/tag/tag.query";

import { createJokeCreateMutation } from "./joke.query";

type JokeCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

function useJokeCreateForm(onClose: () => void) {
  const [languageCode, setLanguageCode] = createSignal("");
  const [segmentsJson, setSegmentsJson] = createSignal("");
  const [hasExplicit, setHasExplicit] = createSignal(false);
  const [humorRating, setHumorRating] = createSignal<number | undefined>(
    undefined,
  );
  const [selectedTagIds, setSelectedTagIds] = createSignal<string[]>([]);
  const [parseError, setParseError] = createSignal("");

  const createMut = createJokeCreateMutation();

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }

  function parseSegments(): { role: string; text: string }[] | null {
    try {
      const parsed = JSON.parse(segmentsJson().trim());
      if (!Array.isArray(parsed)) {
        setParseError("Must be a JSON array");
        return null;
      }
      for (const item of parsed) {
        if (!(item.name || item.role)) {
          setParseError("Each item must have 'name' or 'role'");
          return null;
        }
        if (!item.text) {
          setParseError("Each item must have 'text'");
          return null;
        }
      }
      setParseError("");
      return parsed.map((item: Record<string, string>) => ({
        role: (item.name ?? item.role).trim(),
        text: item.text.trim(),
      }));
    } catch {
      setParseError("Invalid JSON");
      return null;
    }
  }

  function handleSubmit() {
    const segments = parseSegments();
    if (!segments) {
      return;
    }
    if (!languageCode()) {
      return;
    }

    createMut.mutate(
      {
        originalLanguageCode: languageCode(),
        segments,
        hasExplicitContent: hasExplicit(),
        humorRating: humorRating(),
        tagIds: selectedTagIds().length > 0 ? selectedTagIds() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Joke created");
          handleClose();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  function handleClose() {
    setLanguageCode("");
    setSegmentsJson("");
    setHasExplicit(false);
    setHumorRating(undefined);
    setSelectedTagIds([]);
    setParseError("");
    onClose();
  }

  const canSubmit = () =>
    languageCode().length > 0 && segmentsJson().trim().length > 0;

  return {
    languageCode,
    setLanguageCode,
    segmentsJson,
    setSegmentsJson,
    hasExplicit,
    setHasExplicit,
    humorRating,
    setHumorRating,
    selectedTagIds,
    toggleTag,
    parseError,
    createMut,
    handleSubmit,
    handleClose,
    canSubmit,
  };
}

function JokeCreateDialog(props: JokeCreateDialogProps) {
  const form = useJokeCreateForm(props.onClose);
  const languagesQuery = createLanguagesQuery();
  const tagsQuery = createTagsQuery();

  const languageOptions = () =>
    (languagesQuery.data ?? []).map((l) => ({
      value: l.code,
      label: `${l.code} — ${l.name}`,
    }));

  const tags = () => tagsQuery.data ?? [];

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={form.handleClose}
      title="Add Joke"
      description="Paste joke segments in JSON format."
      content={() => (
        <JokeCreateFormContent
          form={form}
          languageOptions={languageOptions()}
          tags={tags()}
        />
      )}
      footer={() => (
        <div class="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={form.handleClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={form.createMut.isPending}
            disabled={!form.canSubmit()}
            onClick={form.handleSubmit}
          >
            Create
          </LoadingButton>
        </div>
      )}
    />
  );
}

function JokeCreateFormContent(props: {
  form: ReturnType<typeof useJokeCreateForm>;
  languageOptions: { value: string; label: string }[];
  tags: { id: string; name: string }[];
}) {
  const { form } = props;

  return (
    <div class="space-y-4">
      <SelectField
        label="Language"
        value={form.languageCode()}
        onValueChange={(v) => form.setLanguageCode(v ?? "")}
        options={props.languageOptions}
        required={true}
        placeholder="Select language..."
      />

      <TextareaField
        label="Segments (JSON)"
        value={form.segmentsJson()}
        onValueChange={form.setSegmentsJson}
        required={false}
        disabled={false}
        readonly={false}
        name="joke-segments-json"
        maxLength={50_000}
        minLength={0}
        placeholder='[{"name": "narrator", "text": "A man walks into a bar..."}, {"name": "man", "text": "Ouch!"}]'
        counterLabel={(c, m) => `${c}/${m}`}
      />

      <Show when={form.parseError()}>
        <div class="text-xs text-error-foreground">{form.parseError()}</div>
      </Show>

      <NumberInputField
        label="Humor Rating (0-10)"
        value={form.humorRating() ?? 0}
        onValueChange={(v) =>
          form.setHumorRating(
            v === undefined || v === null ? undefined : Number(v),
          )
        }
      />

      <SwitchField
        label="Has explicit content"
        checked={form.hasExplicit()}
        onCheckedChange={(v) => form.setHasExplicit(v as boolean)}
      />

      <Show when={props.tags.length > 0}>
        <div class="space-y-2">
          <H3>Tags</H3>
          <div class="flex flex-wrap gap-2">
            <For each={props.tags}>
              {(tag) => {
                const isSelected = () => form.selectedTagIds().includes(tag.id);
                return (
                  <Button
                    variant={isSelected() ? "primary" : "outline"}
                    size="sm"
                    onClick={() => form.toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Button>
                );
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

export { JokeCreateDialog };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/joke/joke-detail.dialog.tsx

```
import type { JokeResponse, JokeTranslationResponse } from "./joke.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import {
  NumberInputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H3, P } from "@packages/ui/typography";
import { Pencil, Plus, Save } from "lucide-solid";
import { createEffect, createSignal, For, Show } from "solid-js";

import { createLanguagesQuery } from "#admin/feature/language/language.query";
import { createTagsQuery } from "#admin/feature/tag/tag.query";

import {
  createAddTranslationMutation,
  createJokeUpdateMutation,
} from "./joke.query";

type JokeDetailDialogProps = {
  joke: JokeResponse | null;
  onClose: () => void;
  onDeleted: () => void;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
];

const STATUS_VARIANT_MAP: Record<string, "info" | "warning" | "success"> = {
  draft: "info",
  review: "warning",
  approved: "success",
};

function useJokeDetailForm(joke: () => JokeResponse | null) {
  const [editing, setEditing] = createSignal(false);
  const [status, setStatus] = createSignal("");
  const [hasExplicit, setHasExplicit] = createSignal(false);
  const [humorRating, setHumorRating] = createSignal<number | undefined>(
    undefined,
  );
  const [selectedTagIds, setSelectedTagIds] = createSignal<string[]>([]);
  const [addTranslationOpen, setAddTranslationOpen] = createSignal(false);

  const updateMut = createJokeUpdateMutation();

  createEffect(() => {
    const j = joke();
    if (j) {
      setStatus(j.status);
      setHasExplicit(j.hasExplicitContent);
      setHumorRating(j.humorRating === null ? undefined : j.humorRating);
      setSelectedTagIds([...j.tagIds]);
      setEditing(false);
      setAddTranslationOpen(false);
    }
  });

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }

  function handleSave() {
    const j = joke();
    if (!j) {
      return;
    }

    updateMut.mutate(
      {
        id: j.id,
        data: {
          status: status(),
          hasExplicitContent: hasExplicit(),
          humorRating: humorRating(),
          tagIds: selectedTagIds(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Joke updated");
          setEditing(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  return {
    editing,
    setEditing,
    status,
    setStatus,
    hasExplicit,
    setHasExplicit,
    humorRating,
    setHumorRating,
    selectedTagIds,
    toggleTag,
    addTranslationOpen,
    setAddTranslationOpen,
    updateMut,
    handleSave,
  };
}

function JokeDetailDialog(props: JokeDetailDialogProps) {
  const tagsQuery = createTagsQuery();
  const tags = () => tagsQuery.data ?? [];
  const form = useJokeDetailForm(() => props.joke);

  function handleClose() {
    form.setEditing(false);
    form.setAddTranslationOpen(false);
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.joke !== null}
      onClose={handleClose}
      title={<JokeDetailTitle joke={props.joke} />}
      description={`ID: ${props.joke?.id ?? ""}`}
      content={() => (
        <JokeDetailContent joke={props.joke} form={form} tags={tags()} />
      )}
      footer={(close) => (
        <div class="flex justify-end">
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
        </div>
      )}
    />
  );
}

function JokeDetailTitle(props: { joke: JokeResponse | null }) {
  return (
    <div class="flex items-center gap-3">
      <span>Joke Details</span>
      <Show when={props.joke}>
        {(joke) => (
          <Badge
            variant={STATUS_VARIANT_MAP[joke().status] ?? "info"}
            size="sm"
            aria-label={joke().status}
          >
            {joke().status}
          </Badge>
        )}
      </Show>
    </div>
  );
}

function JokeDetailContent(props: {
  joke: JokeResponse | null;
  form: ReturnType<typeof useJokeDetailForm>;
  tags: { id: string; name: string }[];
}) {
  const { form } = props;

  return (
    <div class="space-y-6">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <H3>Properties</H3>
          <Show when={!form.editing()}>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Edit"
              onClick={() => form.setEditing(true)}
            >
              <Pencil size={14} />
            </IconButton>
          </Show>
        </div>

        <Show
          when={form.editing()}
          fallback={<ReadOnlyMeta joke={props.joke} tags={props.tags} />}
        >
          <EditMeta
            status={form.status()}
            onStatusChange={form.setStatus}
            humorRating={form.humorRating()}
            onHumorRatingChange={form.setHumorRating}
            hasExplicit={form.hasExplicit()}
            onHasExplicitChange={form.setHasExplicit}
            tags={props.tags}
            selectedTagIds={form.selectedTagIds()}
            onToggleTag={form.toggleTag}
            saving={form.updateMut.isPending}
            onSave={form.handleSave}
            onCancel={() => form.setEditing(false)}
          />
        </Show>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <H3>Translations ({props.joke?.translations.length ?? 0})</H3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => form.setAddTranslationOpen(true)}
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        <Show when={props.joke}>
          {(joke) => (
            <div class="space-y-3">
              <For each={joke().translations}>
                {(translation) => <TranslationCard translation={translation} />}
              </For>
            </div>
          )}
        </Show>
      </div>

      <Show when={form.addTranslationOpen() && props.joke}>
        <AddTranslationSection
          jokeId={props.joke?.id ?? ""}
          existingLanguages={
            props.joke?.translations.map((t) => t.languageCode) ?? []
          }
          onDone={() => form.setAddTranslationOpen(false)}
        />
      </Show>
    </div>
  );
}

function ReadOnlyMeta(props: {
  joke: JokeResponse | null;
  tags: { id: string; name: string }[];
}) {
  const joke = () => props.joke;
  if (!joke()) {
    return null;
  }

  const tagNames = () => {
    const ids = new Set(joke()?.tagIds);
    return props.tags.filter((t) => ids.has(t.id)).map((t) => t.name);
  };

  return (
    <div class="space-y-2 text-sm">
      <div class="flex gap-8">
        <div>
          <span class="text-subtle">Language:</span>{" "}
          <span class="font-mono">{joke()?.originalLanguageCode}</span>
        </div>
        <div>
          <span class="text-subtle">Rating:</span>{" "}
          <span>
            {joke()?.humorRating === null ? "—" : `${joke()?.humorRating}/10`}
          </span>
        </div>
        <div>
          <span class="text-subtle">Explicit:</span>{" "}
          <span>{joke()?.hasExplicitContent ? "Yes" : "No"}</span>
        </div>
      </div>
      <Show when={tagNames().length > 0}>
        <div class="flex items-center gap-2">
          <span class="text-subtle">Tags:</span>
          <div class="flex gap-1 flex-wrap">
            <For each={tagNames()}>
              {(name) => (
                <Badge variant="info" size="sm" aria-label={name}>
                  {name}
                </Badge>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

function EditMeta(props: {
  status: string;
  onStatusChange: (v: string) => void;
  humorRating: number | undefined;
  onHumorRatingChange: (v: number | undefined) => void;
  hasExplicit: boolean;
  onHasExplicitChange: (v: boolean) => void;
  tags: { id: string; name: string }[];
  selectedTagIds: string[];
  onToggleTag: (id: string) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div class="space-y-3">
      <SelectField
        label="Status"
        value={props.status}
        onValueChange={(v) => props.onStatusChange(v ?? "")}
        options={STATUS_OPTIONS}
      />
      <NumberInputField
        label="Humor Rating (0-10)"
        value={props.humorRating ?? 0}
        onValueChange={(v) =>
          props.onHumorRatingChange(
            v === undefined || v === null ? undefined : Number(v),
          )
        }
      />
      <SwitchField
        label="Has explicit content"
        checked={props.hasExplicit}
        onCheckedChange={(v) => props.onHasExplicitChange(v as boolean)}
      />
      <Show when={props.tags.length > 0}>
        <div class="space-y-2">
          <P level={2} class="font-medium">
            Tags
          </P>
          <div class="flex flex-wrap gap-2">
            <For each={props.tags}>
              {(tag) => (
                <Button
                  variant={
                    props.selectedTagIds.includes(tag.id)
                      ? "primary"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => props.onToggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              )}
            </For>
          </div>
        </div>
      </Show>
      <div class="flex gap-2 pt-2">
        <LoadingButton
          variant="primary"
          size="sm"
          loading={props.saving}
          onClick={props.onSave}
        >
          <Save size={14} />
          Save
        </LoadingButton>
        <Button variant="ghost" size="sm" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TranslationCard(props: { translation: JokeTranslationResponse }) {
  const t = props.translation;
  const [expanded, setExpanded] = createSignal(false);

  return (
    <div class="rounded-lg border border-border p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="info" size="sm" aria-label={t.languageCode}>
            {t.languageCode}
          </Badge>
          <Badge
            variant={t.status === "approved" ? "success" : "warning"}
            size="sm"
            aria-label={t.status}
          >
            {t.status}
          </Badge>
          <span class="text-xs text-subtle">
            {t.segments.length} segment(s)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded() ? "Collapse" : "Expand"}
        </Button>
      </div>

      <Show when={!expanded()}>
        <P level={3} class="text-subtle line-clamp-2">
          {t.plainText}
        </P>
      </Show>

      <Show when={expanded()}>
        <div class="space-y-1 pl-2 border-l-2 border-border">
          <For each={t.segments}>
            {(seg) => (
              <div class="text-sm">
                <span class="font-medium text-primary">{seg.role}:</span>{" "}
                <span class="text-foreground">{seg.text}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

function AddTranslationSection(props: {
  jokeId: string;
  existingLanguages: string[];
  onDone: () => void;
}) {
  const [languageCode, setLanguageCode] = createSignal("");
  const [segmentsJson, setSegmentsJson] = createSignal("");
  const [parseError, setParseError] = createSignal("");

  const languagesQuery = createLanguagesQuery();
  const addMut = createAddTranslationMutation();

  const availableLanguages = () =>
    (languagesQuery.data ?? [])
      .filter((l) => !props.existingLanguages.includes(l.code))
      .map((l) => ({ value: l.code, label: `${l.code} — ${l.name}` }));

  function handleAdd() {
    setParseError("");

    let segments: { role: string; text: string }[];
    try {
      const parsed = JSON.parse(segmentsJson().trim());
      if (!Array.isArray(parsed)) {
        setParseError("Must be a JSON array");
        return;
      }
      segments = parsed.map((item: Record<string, string>) => ({
        role: (item.name ?? item.role ?? "").trim(),
        text: (item.text ?? "").trim(),
      }));
      if (segments.some((s) => !(s.role && s.text))) {
        setParseError("Each segment must have role/name and text");
        return;
      }
    } catch {
      setParseError("Invalid JSON");
      return;
    }

    if (!languageCode()) {
      return;
    }

    addMut.mutate(
      {
        jokeId: props.jokeId,
        data: { languageCode: languageCode(), segments },
      },
      {
        onSuccess: () => {
          toast.success("Translation added");
          props.onDone();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  return (
    <div class="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
      <H3>Add Translation</H3>

      <Show
        when={availableLanguages().length > 0}
        fallback={
          <P level={2} class="text-subtle">
            All available languages already have translations.
          </P>
        }
      >
        <SelectField
          label="Language"
          value={languageCode()}
          onValueChange={(v) => setLanguageCode(v ?? "")}
          options={availableLanguages()}
          required={true}
          placeholder="Select language..."
        />

        <TextareaField
          label="Segments (JSON)"
          value={segmentsJson()}
          onValueChange={setSegmentsJson}
          required={false}
          disabled={false}
          readonly={false}
          name="translation-segments-json"
          maxLength={50_000}
          minLength={0}
          placeholder='[{"name": "narrator", "text": "..."}, {"name": "man", "text": "..."}]'
          counterLabel={(c, m) => `${c}/${m}`}
        />

        <Show when={parseError()}>
          <div class="text-xs text-error-foreground">{parseError()}</div>
        </Show>

        <div class="flex gap-2">
          <LoadingButton
            variant="primary"
            size="sm"
            loading={addMut.isPending}
            disabled={!(languageCode() && segmentsJson().trim())}
            onClick={handleAdd}
          >
            Add Translation
          </LoadingButton>
          <Button variant="ghost" size="sm" onClick={props.onDone}>
            Cancel
          </Button>
        </div>
      </Show>
    </div>
  );
}

export { JokeDetailDialog };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/joke/joke-tts-panel.tsx

```
import type { JokeResponse, JokeTranslationResponse } from "./joke.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SelectField } from "@packages/ui/form";
import { toast } from "@packages/ui/overlay";
import { H3, P } from "@packages/ui/typography";
import { Download, Loader2, Mic, Play, RefreshCw, Square } from "lucide-solid";
import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { jokeTtsApi } from "./joke-tts.api";

type JokeTtsPanelProps = {
  joke: JokeResponse;
  translation: JokeTranslationResponse;
  voices: { voiceId: string; name: string; gender?: string }[];
};

type PipelineEntry = {
  id: string;
  status: string;
  voiceConfig: Record<string, string>;
  ttsProjectId: string | null;
  jokeAudioId: string | null;
  audioDownloadUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
};

type StartPipelineContext = {
  translationId: string;
  voiceConfig: Record<string, string>;
  engine: PanelEngine;
  sig: PanelSignals;
};

type PlayAudioContext = {
  pipelineId: string;
  url: string;
  engine: PanelEngine;
  sig: PanelSignals;
};

const PIPELINE_POLL_INTERVAL = 5000;
const VOICE_ID_PREVIEW_LENGTH = 8;

const ACTIVE_STATUSES = new Set([
  "pending",
  "creating_tasks",
  "synthesizing",
  "processing_audio",
  "saving",
]);

const STATUS_VARIANT_MAP: Record<
  string,
  "info" | "warning" | "success" | "error"
> = {
  pending: "info",
  creating_tasks: "info",
  synthesizing: "warning",
  processing_audio: "warning",
  saving: "warning",
  completed: "success",
  failed: "error",
};

type PanelSignals = {
  pipelines: () => PipelineEntry[];
  setPipelines: (
    v: PipelineEntry[] | ((prev: PipelineEntry[]) => PipelineEntry[]),
  ) => void;
  loading: () => boolean;
  setLoading: (v: boolean) => void;
  starting: () => boolean;
  setStarting: (v: boolean) => void;
  showConfig: () => boolean;
  setShowConfig: (v: boolean | ((prev: boolean) => boolean)) => void;
  voiceConfig: () => Record<string, string>;
  setVoiceConfig: (
    v:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  playingPipelineId: () => string | null;
  setPlayingPipelineId: (v: string | null) => void;
};

type PanelEngine = {
  pollTimer: ReturnType<typeof setInterval> | null;
  audioElement: HTMLAudioElement | null;
};

function createPanelSignals(): PanelSignals {
  const [pipelines, setPipelines] = createSignal<PipelineEntry[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [starting, setStarting] = createSignal(false);
  const [showConfig, setShowConfig] = createSignal(false);
  const [voiceConfig, setVoiceConfig] = createSignal<Record<string, string>>(
    {},
  );
  const [playingPipelineId, setPlayingPipelineId] = createSignal<string | null>(
    null,
  );
  return {
    pipelines,
    setPipelines,
    loading,
    setLoading,
    starting,
    setStarting,
    showConfig,
    setShowConfig,
    voiceConfig,
    setVoiceConfig,
    playingPipelineId,
    setPlayingPipelineId,
  };
}

function startPolling(engine: PanelEngine, loadFn: () => void) {
  if (engine.pollTimer) {
    return;
  }
  engine.pollTimer = setInterval(loadFn, PIPELINE_POLL_INTERVAL);
}

function stopPolling(engine: PanelEngine) {
  if (engine.pollTimer) {
    clearInterval(engine.pollTimer);
    engine.pollTimer = null;
  }
}

function stopAudio(engine: PanelEngine, sig: PanelSignals) {
  if (engine.audioElement) {
    engine.audioElement.pause();
    engine.audioElement.src = "";
    engine.audioElement = null;
  }
  sig.setPlayingPipelineId(null);
}

async function loadPipelines(
  translationId: string,
  engine: PanelEngine,
  sig: PanelSignals,
) {
  try {
    sig.setLoading(true);
    const result = await jokeTtsApi.getByTranslation(translationId);
    sig.setPipelines(result);
    if (result.some((p) => ACTIVE_STATUSES.has(p.status))) {
      startPolling(engine, () => loadPipelines(translationId, engine, sig));
    } else {
      stopPolling(engine);
    }
  } catch {
    // silently fail on poll
  } finally {
    sig.setLoading(false);
  }
}

async function handleStartPipeline(ctx: StartPipelineContext) {
  const { translationId, voiceConfig, engine, sig } = ctx;
  sig.setStarting(true);
  try {
    await jokeTtsApi.start({
      jokeTranslationId: translationId,
      voiceConfig,
      isPlatformDefault: false,
    });
    toast.success("TTS pipeline started");
    sig.setShowConfig(false);
    await loadPipelines(translationId, engine, sig);
    startPolling(engine, () => loadPipelines(translationId, engine, sig));
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to start pipeline",
    );
  } finally {
    sig.setStarting(false);
  }
}

function playAudioUrl(ctx: PlayAudioContext) {
  const { pipelineId, url, engine, sig } = ctx;
  engine.audioElement = new Audio(url);
  sig.setPlayingPipelineId(pipelineId);
  engine.audioElement.addEventListener("ended", () => {
    sig.setPlayingPipelineId(null);
  });
  engine.audioElement.addEventListener("error", () => {
    sig.setPlayingPipelineId(null);
    toast.error("Audio playback error");
  });
  engine.audioElement.play().catch(() => {
    sig.setPlayingPipelineId(null);
  });
}

async function handlePlayAudio(
  pipeline: PipelineEntry,
  engine: PanelEngine,
  sig: PanelSignals,
) {
  if (sig.playingPipelineId() === pipeline.id) {
    stopAudio(engine, sig);
    return;
  }
  stopAudio(engine, sig);
  if (!pipeline.audioDownloadUrl) {
    try {
      const details = await jokeTtsApi.getById(pipeline.id);
      if (!details.audioDownloadUrl) {
        toast.error("Audio not available");
        return;
      }
      playAudioUrl({
        pipelineId: pipeline.id,
        url: details.audioDownloadUrl,
        engine,
        sig,
      });
    } catch {
      toast.error("Failed to load audio");
    }
    return;
  }
  playAudioUrl({
    pipelineId: pipeline.id,
    url: pipeline.audioDownloadUrl,
    engine,
    sig,
  });
}

function handleDownload(pipeline: PipelineEntry) {
  if (!pipeline.audioDownloadUrl) {
    jokeTtsApi
      .getById(pipeline.id)
      .then((details) => {
        if (details.audioDownloadUrl) {
          triggerDownload(details.audioDownloadUrl, pipeline.id);
        }
      })
      .catch(() => toast.error("Failed to get download URL"));
    return;
  }
  triggerDownload(pipeline.audioDownloadUrl, pipeline.id);
}

function triggerDownload(url: string, pipelineId: string) {
  fetch(url)
    .then((r) => r.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `joke-tts-${pipelineId.slice(0, VOICE_ID_PREVIEW_LENGTH)}.mp3`;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    });
}

function JokeTtsPanel(props: JokeTtsPanelProps) {
  const sig = createPanelSignals();
  const engine: PanelEngine = { pollTimer: null, audioElement: null };

  const uniqueRoles = createMemo(() => {
    const roles = new Set<string>();
    for (const seg of props.translation.segments) {
      if (seg.role.trim()) {
        roles.add(seg.role.trim());
      }
    }
    return [...roles];
  });

  const voiceOptions = createMemo(() =>
    props.voices.map((v) => ({
      value: v.voiceId,
      label: v.gender ? `${v.name} (${v.gender})` : v.name,
    })),
  );

  const allRolesMapped = createMemo(() => {
    const config = sig.voiceConfig();
    return uniqueRoles().every((role) => {
      const vid = config[role];
      return vid && vid.length > 0;
    });
  });

  const doLoad = () => loadPipelines(props.translation.id, engine, sig);

  onMount(() => {
    doLoad();
  });
  onCleanup(() => {
    stopPolling(engine);
    stopAudio(engine, sig);
  });

  return (
    <div class="space-y-3">
      <PanelHeader
        showConfig={sig.showConfig()}
        onToggleConfig={() => sig.setShowConfig((p) => !p)}
        onRefresh={doLoad}
      />

      <Show when={sig.showConfig()}>
        <VoiceConfigPanel
          roles={uniqueRoles()}
          voiceConfig={sig.voiceConfig()}
          voiceOptions={voiceOptions()}
          onSetVoice={(role, voiceId) =>
            sig.setVoiceConfig((prev) => ({ ...prev, [role]: voiceId }))
          }
          allMapped={allRolesMapped()}
          starting={sig.starting()}
          onStart={() => {
            if (!allRolesMapped()) {
              toast.error("All roles must have a voice assigned");
              return;
            }
            handleStartPipeline({
              translationId: props.translation.id,
              voiceConfig: sig.voiceConfig(),
              engine,
              sig,
            });
          }}
          onCancel={() => sig.setShowConfig(false)}
        />
      </Show>

      <Show when={sig.loading() && sig.pipelines().length === 0}>
        <div class="text-subtle text-sm text-center py-4">Loading...</div>
      </Show>

      <Show when={sig.pipelines().length === 0 && !sig.loading()}>
        <P level={3} class="text-subtle text-center py-4">
          No TTS audio generated yet.
        </P>
      </Show>

      <div class="space-y-2">
        <For each={sig.pipelines()}>
          {(pipeline) => (
            <PipelineCard
              pipeline={pipeline}
              voices={props.voices}
              playing={sig.playingPipelineId() === pipeline.id}
              onPlay={() => handlePlayAudio(pipeline, engine, sig)}
              onDownload={() => handleDownload(pipeline)}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function PanelHeader(props: {
  showConfig: boolean;
  onToggleConfig: () => void;
  onRefresh: () => void;
}) {
  return (
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Mic size={16} />
        <H3>TTS Audio</H3>
      </div>
      <div class="flex items-center gap-2">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Refresh"
          onClick={props.onRefresh}
        >
          <RefreshCw size={14} />
        </IconButton>
        <Button variant="outline" size="sm" onClick={props.onToggleConfig}>
          <Mic size={14} />
          {props.showConfig ? "Cancel" : "New TTS"}
        </Button>
      </div>
    </div>
  );
}

function VoiceConfigPanel(props: {
  roles: string[];
  voiceConfig: Record<string, string>;
  voiceOptions: { value: string; label: string }[];
  onSetVoice: (role: string, voiceId: string) => void;
  allMapped: boolean;
  starting: boolean;
  onStart: () => void;
  onCancel: () => void;
}) {
  return (
    <div class="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
      <P level={2} class="font-medium">
        Assign voices to roles
      </P>
      <div class="space-y-2">
        <For each={props.roles}>
          {(role) => (
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium min-w-[100px] truncate">
                {role}
              </span>
              <div class="flex-1">
                <SelectField
                  label=""
                  value={props.voiceConfig[role] ?? ""}
                  onValueChange={(v) => props.onSetVoice(role, v ?? "")}
                  options={props.voiceOptions}
                  placeholder="Select voice..."
                />
              </div>
            </div>
          )}
        </For>
      </div>
      <div class="flex gap-2 pt-2">
        <LoadingButton
          variant="primary"
          size="sm"
          loading={props.starting}
          disabled={!props.allMapped}
          onClick={props.onStart}
        >
          Start TTS Pipeline
        </LoadingButton>
        <Button variant="ghost" size="sm" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function PipelineCard(props: {
  pipeline: PipelineEntry;
  voices: { voiceId: string; name: string }[];
  playing: boolean;
  onPlay: () => void;
  onDownload: () => void;
}) {
  const p = props.pipeline;
  const isActive = () => ACTIVE_STATUSES.has(p.status);
  const isCompleted = () => p.status === "completed";
  const isFailed = () => p.status === "failed";

  const voiceMap = createMemo(() => {
    const map = new Map<string, string>();
    for (const v of props.voices) {
      map.set(v.voiceId, v.name);
    }
    return map;
  });

  const voiceDisplay = createMemo(() =>
    Object.entries(p.voiceConfig)
      .map(([role, voiceId]) => {
        const name =
          voiceMap().get(voiceId) ?? voiceId.slice(0, VOICE_ID_PREVIEW_LENGTH);
        return `${role}: ${name}`;
      })
      .join(", "),
  );

  const createdDate = () => {
    try {
      return new Date(p.createdAt).toLocaleString();
    } catch {
      return p.createdAt;
    }
  };

  return (
    <div class="rounded-lg border border-border p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Show when={isActive()}>
            <Loader2 size={14} class="animate-spin text-info-foreground" />
          </Show>
          <Badge
            variant={STATUS_VARIANT_MAP[p.status] ?? "info"}
            size="sm"
            aria-label={p.status}
          >
            {p.status}
          </Badge>
          <span class="text-xs text-subtle">{createdDate()}</span>
        </div>
        <div class="flex items-center gap-1">
          <Show when={isCompleted()}>
            <IconButton
              variant="outline"
              size="sm"
              aria-label={props.playing ? "Stop" : "Play"}
              onClick={props.onPlay}
            >
              <Show when={props.playing} fallback={<Play size={14} />}>
                <Square size={14} />
              </Show>
            </IconButton>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Download"
              onClick={props.onDownload}
            >
              <Download size={14} />
            </IconButton>
          </Show>
        </div>
      </div>
      <P level={3} class="text-subtle text-xs">
        {voiceDisplay()}
      </P>
      <Show when={isFailed() && p.errorMessage}>
        <div class="text-xs text-error-foreground mt-1">{p.errorMessage}</div>
      </Show>
    </div>
  );
}

export type { JokeTtsPanelProps };
export { JokeTtsPanel };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/joke/joke-tts.api.ts

```
const API_URL = import.meta.env.VITE_API_URL ?? "";
const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      // default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

type PipelineEntry = {
  id: string;
  status: string;
  voiceConfig: Record<string, string>;
  ttsProjectId: string | null;
  jokeAudioId: string | null;
  audioDownloadUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
};

type PipelineDetails = PipelineEntry & {
  ttsProject: unknown;
};

type StartPipelineParams = {
  jokeTranslationId: string;
  voiceConfig: Record<string, string>;
  isPlatformDefault?: boolean;
};

type StartPipelineResult = {
  pipelineId: string;
  status: string;
  ttsProjectId: string | null;
};

const jokeTtsApi = {
  getAll(): Promise<PipelineEntry[]> {
    return apiFetch("/v1/joke-tts");
  },

  getById(id: string): Promise<PipelineDetails> {
    return apiFetch(`/v1/joke-tts/${id}`);
  },

  getByTranslation(translationId: string): Promise<PipelineEntry[]> {
    return apiFetch(`/v1/joke-tts/by-translation/${translationId}`);
  },

  start(params: StartPipelineParams): Promise<StartPipelineResult> {
    return apiFetch("/v1/joke-tts", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/v1/joke-tts/${id}`, { method: "DELETE" });
  },
};

export type {
  PipelineDetails,
  PipelineEntry,
  StartPipelineParams,
  StartPipelineResult,
};
export { jokeTtsApi };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/joke/joke.api.ts

```
type JokeTranslationResponse = {
  id: string;
  jokeId: string;
  languageCode: string;
  segments: { role: string; text: string }[];
  plainText: string;
  uniquenessHash: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type JokeAudioResponse = {
  id: string;
  jokeTranslationId: string;
  isPlatformDefault: boolean;
  voiceConfig: Record<string, string>;
  fileKey: string;
  durationMs: number;
  createdAt: string;
};

type JokeResponse = {
  id: string;
  originalLanguageCode: string;
  status: string;
  hasExplicitContent: boolean;
  humorRating: number | null;
  createdAt: string;
  updatedAt: string;
  translations: JokeTranslationResponse[];
  tagIds: string[];
  audios: JokeAudioResponse[];
};

type CreateJokeParams = {
  originalLanguageCode: string;
  segments: { role: string; text: string }[];
  hasExplicitContent: boolean;
  humorRating?: number;
  tagIds?: string[];
};

type UpdateJokeParams = {
  status?: string;
  hasExplicitContent?: boolean;
  humorRating?: number;
  tagIds?: string[];
};

type AddTranslationParams = {
  languageCode: string;
  segments: { role: string; text: string }[];
};

type GetJokesFilters = {
  query?: string;
  languageCode?: string;
  tagIds?: string[];
  status?: string;
  hasExplicitContent?: boolean;
  limit?: number;
  offset?: number;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";
const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      // use default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

function buildJokeQueryString(filters: GetJokesFilters): string {
  const params = new URLSearchParams();
  if (filters.query) {
    params.set("query", filters.query);
  }
  if (filters.languageCode) {
    params.set("languageCode", filters.languageCode);
  }
  if (filters.tagIds && filters.tagIds.length > 0) {
    params.set("tagIds", filters.tagIds.join(","));
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.hasExplicitContent !== undefined) {
    params.set("hasExplicitContent", String(filters.hasExplicitContent));
  }
  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }
  if (filters.offset !== undefined) {
    params.set("offset", String(filters.offset));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const jokeApi = {
  getAll(filters: GetJokesFilters = {}): Promise<JokeResponse[]> {
    return apiFetch(`/v1/jokes${buildJokeQueryString(filters)}`);
  },

  getById(id: string): Promise<JokeResponse> {
    return apiFetch(`/v1/jokes/${id}`);
  },

  create(data: CreateJokeParams): Promise<JokeResponse> {
    return apiFetch("/v1/jokes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: UpdateJokeParams): Promise<JokeResponse> {
    return apiFetch(`/v1/jokes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  addTranslation(
    jokeId: string,
    data: AddTranslationParams,
  ): Promise<JokeTranslationResponse> {
    return apiFetch(`/v1/jokes/${jokeId}/translations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/v1/jokes/${id}`, { method: "DELETE" });
  },
};

export type {
  AddTranslationParams,
  CreateJokeParams,
  GetJokesFilters,
  JokeAudioResponse,
  JokeResponse,
  JokeTranslationResponse,
  UpdateJokeParams,
};
export { jokeApi };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/joke/joke.page.tsx

```
import type { GetJokesFilters, JokeResponse } from "./joke.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SearchInput, SelectField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Eye, Plus, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { createJokeDeleteMutation, createJokesQuery } from "./joke.query";
import { JokeCreateDialog } from "./joke-create.dialog";
import { JokeDetailDialog } from "./joke-detail.dialog";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
];

const STATUS_VARIANT_MAP: Record<string, "info" | "warning" | "success"> = {
  draft: "info",
  review: "warning",
  approved: "success",
};

const PREVIEW_MAX_LENGTH = 80;

function JokePage() {
  const [search, setSearch] = createSignal("");
  const [statusFilter, setStatusFilter] = createSignal("");
  const [createOpen, setCreateOpen] = createSignal(false);
  const [selectedJoke, setSelectedJoke] = createSignal<JokeResponse | null>(
    null,
  );
  const [deleteId, setDeleteId] = createSignal<string | null>(null);

  const deleteMut = createJokeDeleteMutation();

  const filters = (): GetJokesFilters => ({
    query: search() || undefined,
    status: statusFilter() || undefined,
  });

  const query = createJokesQuery(filters);
  const jokes = () => query.data ?? [];

  function handleDelete() {
    const id = deleteId();
    if (!id) {
      return;
    }
    deleteMut.mutate(id, {
      onSuccess: () => {
        toast.success("Joke deleted");
        setDeleteId(null);
        setSelectedJoke(null);
      },
      onError: () => toast.error("Failed to delete"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Jokes</H1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Add Joke
        </Button>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex-1">
          <SearchInput
            value={search()}
            onValueChange={setSearch}
            clearLabel="Clear"
            placeholder="Search jokes..."
          />
        </div>
        <div class="w-[160px]">
          <SelectField
            label=""
            value={statusFilter()}
            onValueChange={(v) => setStatusFilter(v ?? "")}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
          />
        </div>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show when={query.data}>
        <div class="border border-border rounded-md overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-secondary/50">
                <th class="text-left p-3 font-medium">Preview</th>
                <th class="text-left p-3 font-medium">Language</th>
                <th class="text-left p-3 font-medium">Status</th>
                <th class="text-left p-3 font-medium">Rating</th>
                <th class="text-left p-3 font-medium">Translations</th>
                <th class="text-right p-3 font-medium w-[80px]" />
              </tr>
            </thead>
            <tbody>
              <For each={jokes()}>
                {(joke) => (
                  <JokeRow
                    joke={joke}
                    onView={() => setSelectedJoke(joke)}
                    onDelete={() => setDeleteId(joke.id)}
                  />
                )}
              </For>
            </tbody>
          </table>
          <Show when={jokes().length === 0}>
            <div class="p-8 text-center text-subtle text-sm">
              No jokes found
            </div>
          </Show>
        </div>
      </Show>

      <JokeCreateDialog
        open={createOpen()}
        onClose={() => setCreateOpen(false)}
      />
      <JokeDetailDialog
        joke={selectedJoke()}
        onClose={() => setSelectedJoke(null)}
        onDeleted={() => {
          setSelectedJoke(null);
        }}
      />

      <Dialog
        alert={true}
        open={deleteId() !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Joke"
        description="This will delete the joke, all translations, and audio. Cannot be undone."
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={deleteMut.isPending}
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </div>
        )}
      />
    </div>
  );
}

function JokeRow(props: {
  joke: JokeResponse;
  onView: () => void;
  onDelete: () => void;
}) {
  const j = props.joke;
  const primaryTranslation = () =>
    j.translations.find((t) => t.languageCode === j.originalLanguageCode)
    ?? j.translations[0];

  const previewText = () => {
    const t = primaryTranslation();
    if (!t) {
      return "—";
    }
    const text = t.plainText;
    return text.length > PREVIEW_MAX_LENGTH
      ? `${text.slice(0, PREVIEW_MAX_LENGTH)}...`
      : text;
  };

  return (
    <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
      <td class="p-3 max-w-[300px]">
        <Button
          variant="ghost"
          size="sm"
          class="text-left text-sm text-foreground hover:text-primary cursor-pointer truncate block w-full p-0 h-auto justify-start"
          onClick={props.onView}
        >
          {previewText()}
        </Button>
      </td>
      <td class="p-3 font-mono text-xs">{j.originalLanguageCode}</td>
      <td class="p-3">
        <Badge
          variant={STATUS_VARIANT_MAP[j.status] ?? "info"}
          size="sm"
          aria-label={j.status}
        >
          {j.status}
        </Badge>
      </td>
      <td class="p-3">
        <Show when={j.humorRating !== null} fallback="—">
          <span class="font-mono">{j.humorRating}/10</span>
        </Show>
      </td>
      <td class="p-3">{j.translations.length}</td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="View joke"
            onClick={props.onView}
          >
            <Eye size={14} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Delete joke"
            onClick={props.onDelete}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}

export { JokePage };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/joke/joke.query.ts

```
import type {
  AddTranslationParams,
  CreateJokeParams,
  GetJokesFilters,
  UpdateJokeParams,
} from "./joke.api";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { jokeApi } from "./joke.api";

const QUERY_KEY = "jokes";

function createJokesQuery(filters: () => GetJokesFilters) {
  return createQuery(() => ({
    queryKey: [QUERY_KEY, filters()],
    queryFn: () => jokeApi.getAll(filters()),
  }));
}

function createJokeQuery(id: () => string | null) {
  return createQuery(() => ({
    queryKey: [QUERY_KEY, id()],
    queryFn: () => {
      const jokeId = id();
      if (!jokeId) {
        return null;
      }
      return jokeApi.getById(jokeId);
    },
    enabled: id() !== null,
  }));
}

function createJokeCreateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: CreateJokeParams) => jokeApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createJokeUpdateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({ id, data }: { id: string; data: UpdateJokeParams }) =>
      jokeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createJokeDeleteMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => jokeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createAddTranslationMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      jokeId,
      data,
    }: {
      jokeId: string;
      data: AddTranslationParams;
    }) => jokeApi.addTranslation(jokeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createAddTranslationMutation,
  createJokeCreateMutation,
  createJokeDeleteMutation,
  createJokeQuery,
  createJokesQuery,
  createJokeUpdateMutation,
};

```

D:/1_Projects/jstonehub/apps/admin/src/feature/language/language.api.ts

```
type LanguageResponse = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      /* use default */
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

const languageApi = {
  getAll: (): Promise<LanguageResponse[]> => apiFetch("/v1/languages"),
  create: (data: { code: string; name: string }): Promise<LanguageResponse> =>
    apiFetch("/v1/languages", { method: "POST", body: JSON.stringify(data) }),
  update: (
    id: string,
    data: Partial<{ name: string; isActive: boolean }>,
  ): Promise<LanguageResponse> =>
    apiFetch(`/v1/languages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    apiFetch(`/v1/languages/${id}`, { method: "DELETE" }),
};

export type { LanguageResponse };
export { languageApi };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/language/language.page.tsx

```
import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { TextInputField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Plus, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import {
  createLanguageCreateMutation,
  createLanguageDeleteMutation,
  createLanguagesQuery,
} from "./language.query";

function LanguagePage() {
  const query = createLanguagesQuery();
  const createMut = createLanguageCreateMutation();
  const deleteMut = createLanguageDeleteMutation();

  const [createOpen, setCreateOpen] = createSignal(false);
  const [code, setCode] = createSignal("");
  const [name, setName] = createSignal("");
  const [deleteId, setDeleteId] = createSignal<string | null>(null);

  function handleCreate() {
    createMut.mutate(
      { code: code().trim(), name: name().trim() },
      {
        onSuccess: () => {
          toast.success("Language created");
          setCreateOpen(false);
          setCode("");
          setName("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  function handleDelete() {
    const id = deleteId();
    if (!id) {
      return;
    }
    deleteMut.mutate(id, {
      onSuccess: () => {
        toast.success("Language deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Languages</H1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Add Language
        </Button>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show when={query.data}>
        {(languages) => (
          <div class="border border-border rounded-md overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-secondary/50">
                  <th class="text-left p-3 font-medium">Code</th>
                  <th class="text-left p-3 font-medium">Name</th>
                  <th class="text-right p-3 font-medium w-[60px]" />
                </tr>
              </thead>
              <tbody>
                <For each={languages()}>
                  {(lang) => (
                    <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30">
                      <td class="p-3 font-mono">{lang.code}</td>
                      <td class="p-3">{lang.name}</td>
                      <td class="p-3 text-right">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Delete"
                          onClick={() => setDeleteId(lang.id)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
            <Show when={languages().length === 0}>
              <div class="p-8 text-center text-subtle text-sm">
                No languages
              </div>
            </Show>
          </div>
        )}
      </Show>

      <Dialog
        alert={false}
        open={createOpen()}
        onClose={() => setCreateOpen(false)}
        title="Add Language"
        description="Enter language code and display name."
        content={() => (
          <div class="space-y-4">
            <TextInputField
              type="text"
              label="Code"
              value={code()}
              onValueChange={setCode}
              required={true}
              placeholder="e.g. ru"
            />
            <TextInputField
              type="text"
              label="Name"
              value={name()}
              onValueChange={setName}
              required={true}
              placeholder="e.g. Русский"
            />
          </div>
        )}
        footer={() => (
          <div class="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={createMut.isPending}
              disabled={!(code().trim() && name().trim())}
              onClick={handleCreate}
            >
              Create
            </LoadingButton>
          </div>
        )}
      />

      <Dialog
        alert={true}
        open={deleteId() !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Language"
        description="Are you sure? This may affect existing translations."
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={deleteMut.isPending}
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </div>
        )}
      />
    </div>
  );
}

export { LanguagePage };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/language/language.query.ts

```
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { languageApi } from "./language.api";

const QUERY_KEY = "languages";

function createLanguagesQuery() {
  return createQuery(() => ({
    queryKey: [QUERY_KEY],
    queryFn: () => languageApi.getAll(),
  }));
}

function createLanguageCreateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: { code: string; name: string }) =>
      languageApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createLanguageDeleteMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => languageApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createLanguageCreateMutation,
  createLanguageDeleteMutation,
  createLanguagesQuery,
};

```

D:/1_Projects/jstonehub/apps/admin/src/feature/secret-voicer-credential/secret-voicer-credential-create.dialog.tsx

```
import type { FingerprintOption } from "./secret-voicer-credential.api";

import { Button, LoadingButton } from "@packages/ui/action";
import { SelectField, TextInputField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { P } from "@packages/ui/typography";
import { Link } from "@tanstack/solid-router";
import { createMemo, createSignal, Show } from "solid-js";

import {
  createAvailableFingerprintsQuery,
  createSecretVoicerCredentialCreateMutation,
} from "./secret-voicer-credential.query";

type SecretVoicerCredentialCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CSRF_TOKEN_REGEX = /csrftoken=([^;]+)/;
const SESSION_ID_REGEX = /sessionid=([^;]+)/;

function parseCookieString(
  value: string,
): { csrfToken: string; sessionId: string } | null {
  const csrfMatch = value.match(CSRF_TOKEN_REGEX);
  const sessionMatch = value.match(SESSION_ID_REGEX);

  if (csrfMatch && sessionMatch) {
    return {
      csrfToken: csrfMatch[1]?.trim() ?? "",
      sessionId: sessionMatch[1]?.trim() ?? "",
    };
  }
  return null;
}

function SecretVoicerCredentialCreateDialog(
  props: SecretVoicerCredentialCreateDialogProps,
) {
  const [fingerprintId, setFingerprintId] = createSignal("");
  const [csrfToken, setCsrfToken] = createSignal("");
  const [sessionId, setSessionId] = createSignal("");

  const fingerprintsQuery = createAvailableFingerprintsQuery();
  const createMutation = createSecretVoicerCredentialCreateMutation();

  const fingerprints = () => fingerprintsQuery.data ?? [];
  const hasFingerprints = () => fingerprints().length > 0;

  const fingerprintOptions = createMemo(() =>
    fingerprints().map((fp: FingerprintOption) => ({
      value: fp.id,
      label: fp.label,
    })),
  );

  const canSubmit = () =>
    fingerprintId().length > 0
    && csrfToken().trim().length > 0
    && sessionId().trim().length > 0;

  function handleCsrfTokenChange(value: string) {
    const parsed = parseCookieString(value);
    if (parsed) {
      setCsrfToken(parsed.csrfToken);
      setSessionId(parsed.sessionId);
    } else {
      setCsrfToken(value);
    }
  }

  function handleSubmit() {
    if (!canSubmit()) {
      return;
    }

    createMutation.mutate(
      {
        fingerprintId: fingerprintId(),
        csrfToken: csrfToken().trim(),
        sessionId: sessionId().trim(),
      },
      {
        onSuccess: () => {
          toast.success("Credential created");
          handleClose();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to create credential",
          );
        },
      },
    );
  }

  function handleClose() {
    setFingerprintId("");
    setCsrfToken("");
    setSessionId("");
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={handleClose}
      title="Add Secret Voicer Credential"
      description="Link a browser fingerprint with Secret Voicer session data."
      content={() => (
        <div class="space-y-4">
          <Show
            when={hasFingerprints()}
            fallback={<NoFingerprintsMessage onClose={handleClose} />}
          >
            <SelectField
              label="Browser Fingerprint"
              value={fingerprintId()}
              onValueChange={(v) => setFingerprintId(v ?? "")}
              options={fingerprintOptions()}
              required={true}
              placeholder="Select fingerprint..."
            />

            <TextInputField
              type="text"
              label="CSRF Token"
              info="Можно вставить всю строку cookie: csrftoken=xxx; sessionid=yyy — поля заполнятся автоматически"
              value={csrfToken()}
              onValueChange={handleCsrfTokenChange}
              required={true}
              placeholder="csrftoken value или полная строка cookie"
            />

            <TextInputField
              type="text"
              label="Session ID"
              value={sessionId()}
              onValueChange={setSessionId}
              required={true}
              placeholder="sessionid value"
            />
          </Show>
        </div>
      )}
      footer={() => (
        <Show when={hasFingerprints()}>
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={createMutation.isPending}
              disabled={!canSubmit()}
              onClick={handleSubmit}
            >
              Create
            </LoadingButton>
          </div>
        </Show>
      )}
    />
  );
}

function NoFingerprintsMessage(props: { onClose: () => void }) {
  return (
    <div class="space-y-4 text-center py-4">
      <P level={2}>
        No browser fingerprints found. Create a fingerprint first.
      </P>
      <Link
        to="/infrastructure/browser-fingerprint"
        search={{}}
        class="inline-block"
        onClick={props.onClose}
      >
        <Button variant="primary" size="sm">
          Go to Fingerprints
        </Button>
      </Link>
    </div>
  );
}

export { SecretVoicerCredentialCreateDialog };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/secret-voicer-credential/secret-voicer-credential-detail.dialog.tsx

```
import type { SecretVoicerCredentialResponse } from "./secret-voicer-credential.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SwitchField, TextInputField } from "@packages/ui/form";
import { Dialog } from "@packages/ui/overlay";
import { P } from "@packages/ui/typography";
import { Pencil, RefreshCw, Trash2 } from "lucide-solid";
import { createEffect, createMemo, createSignal, Show } from "solid-js";

type SecretVoicerCredentialDetailDialogProps = {
  credential: SecretVoicerCredentialResponse | null;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onClearError: (id: string) => void;
  updating: boolean;
  deleting: boolean;
  clearingError: boolean;
};

const MASKED_TOKEN_VISIBLE_CHARS = 8;
const MASKED_DOTS_MAX = 20;
const CSRF_TOKEN_REGEX = /csrftoken=([^;]+)/;
const SESSION_ID_REGEX = /sessionid=([^;]+)/;

function maskToken(token: string): string {
  if (token.length <= MASKED_TOKEN_VISIBLE_CHARS) {
    return token;
  }
  const visible = token.slice(0, MASKED_TOKEN_VISIBLE_CHARS);
  const dots = Math.min(
    token.length - MASKED_TOKEN_VISIBLE_CHARS,
    MASKED_DOTS_MAX,
  );
  return `${visible}${"•".repeat(dots)}`;
}

function parseCookieString(
  value: string,
): { csrfToken: string; sessionId: string } | null {
  const csrfMatch = value.match(CSRF_TOKEN_REGEX);
  const sessionMatch = value.match(SESSION_ID_REGEX);

  if (csrfMatch && sessionMatch) {
    return {
      csrfToken: csrfMatch[1]?.trim() ?? "",
      sessionId: sessionMatch[1]?.trim() ?? "",
    };
  }
  return null;
}

function resolveBadgeVariant(
  hasError: boolean,
  isActive: boolean,
): "error" | "success" | "warning" {
  if (hasError) {
    return "error";
  }
  if (isActive) {
    return "success";
  }
  return "warning";
}

function resolveBadgeLabel(hasError: boolean, isActive: boolean): string {
  if (hasError) {
    return "Error";
  }
  if (isActive) {
    return "Active";
  }
  return "Inactive";
}

function useCredentialForm(props: SecretVoicerCredentialDetailDialogProps) {
  const [editing, setEditing] = createSignal(false);
  const [csrfToken, setCsrfToken] = createSignal("");
  const [sessionId, setSessionId] = createSignal("");
  const [isActive, setIsActive] = createSignal(true);
  const [confirmDelete, setConfirmDelete] = createSignal(false);

  createEffect(() => {
    const cred = props.credential;
    if (cred) {
      setCsrfToken(cred.csrfToken);
      setSessionId(cred.sessionId);
      setIsActive(cred.isActive);
      setEditing(false);
      setConfirmDelete(false);
    }
  });

  const changedFields = createMemo(() => {
    const cred = props.credential;
    if (!cred) {
      return {};
    }
    const changes: Record<string, unknown> = {};
    if (csrfToken() !== cred.csrfToken) {
      changes.csrfToken = csrfToken();
    }
    if (sessionId() !== cred.sessionId) {
      changes.sessionId = sessionId();
    }
    if (isActive() !== cred.isActive) {
      changes.isActive = isActive();
    }
    return changes;
  });

  const hasChanges = createMemo(() => Object.keys(changedFields()).length > 0);

  function handleCsrfTokenChange(value: string) {
    const parsed = parseCookieString(value);
    if (parsed) {
      setCsrfToken(parsed.csrfToken);
      setSessionId(parsed.sessionId);
    } else {
      setCsrfToken(value);
    }
  }

  function handleSave() {
    const cred = props.credential;
    if (!(cred && hasChanges())) {
      return;
    }
    props.onUpdate(cred.id, changedFields());
  }

  function handleDelete() {
    const cred = props.credential;
    if (!cred) {
      return;
    }
    props.onDelete(cred.id);
  }

  function handleCancelEdit() {
    const cred = props.credential;
    if (!cred) {
      return;
    }
    setCsrfToken(cred.csrfToken);
    setSessionId(cred.sessionId);
    setIsActive(cred.isActive);
    setEditing(false);
  }

  function handleClose() {
    setEditing(false);
    setConfirmDelete(false);
    props.onClose();
  }

  return {
    editing,
    setEditing,
    csrfToken,
    setCsrfToken,
    sessionId,
    setSessionId,
    isActive,
    setIsActive,
    confirmDelete,
    setConfirmDelete,
    hasChanges,
    handleCsrfTokenChange,
    handleSave,
    handleDelete,
    handleCancelEdit,
    handleClose,
  };
}

function SecretVoicerCredentialDetailDialog(
  props: SecretVoicerCredentialDetailDialogProps,
) {
  const form = useCredentialForm(props);

  const hasError = () =>
    props.credential?.lastError !== null
    && props.credential?.lastError !== undefined;

  return (
    <Dialog
      alert={false}
      open={props.credential !== null}
      onClose={form.handleClose}
      title={<DetailTitle credential={props.credential} />}
      description={props.credential?.fingerprintLabel ?? ""}
      content={() => (
        <div class="space-y-4">
          {/* Action buttons */}
          <Show when={!form.editing()}>
            <div class="flex gap-2 justify-end">
              <IconButton
                variant="outline"
                size="sm"
                aria-label="Edit credential"
                onClick={() => form.setEditing(true)}
              >
                <Pencil size={14} />
              </IconButton>
              <IconButton
                variant="destructive"
                size="sm"
                aria-label="Delete credential"
                onClick={() => form.setConfirmDelete(true)}
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          </Show>

          {/* Error banner */}
          <Show when={hasError() && props.credential?.lastError}>
            {(err) => (
              <div class="rounded-md border border-error-border bg-error/10 p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <P level={2} variant="error" class="font-medium">
                    ⚠️ Credential Error
                  </P>
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    loading={props.clearingError}
                    onClick={() =>
                      props.credential
                      && props.onClearError(props.credential.id)
                    }
                  >
                    <RefreshCw size={14} />
                    Reactivate
                  </LoadingButton>
                </div>

                <div class="space-y-2">
                  <ErrorRow label="Action" value={err().action} />
                  <ErrorRow
                    label="HTTP Status"
                    value={
                      err().statusCode === null ? "—" : String(err().statusCode)
                    }
                  />
                  <ErrorRow label="Message" value={err().message} />
                  <ErrorRow
                    label="Occurred At"
                    value={new Date(err().occurredAt).toLocaleString()}
                  />
                  <Show when={err().responseBody}>
                    <div class="space-y-1">
                      <div class="text-xs font-medium text-subtle">
                        Response Body (preview)
                      </div>
                      <pre class="text-xs text-error-foreground bg-error/20 rounded p-2 overflow-auto max-h-[120px] whitespace-pre-wrap break-all font-mono">
                        {err().responseBody}
                      </pre>
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </Show>

          {/* Delete confirmation */}
          <Show when={form.confirmDelete()}>
            <div class="p-4 rounded-md bg-error/20 border border-error-border space-y-3">
              <P level={2} variant="error">
                Are you sure you want to delete this credential?
              </P>
              <div class="flex gap-2">
                <LoadingButton
                  variant="destructive"
                  size="sm"
                  loading={props.deleting}
                  onClick={form.handleDelete}
                >
                  Delete
                </LoadingButton>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Show>

          {/* Fields */}
          <ReadOnlyField
            label="Fingerprint"
            value={props.credential?.fingerprintLabel ?? "—"}
          />

          <Show
            when={form.editing()}
            fallback={
              <>
                <ReadOnlyField
                  label="CSRF Token"
                  value={maskToken(props.credential?.csrfToken ?? "")}
                />
                <ReadOnlyField
                  label="Session ID"
                  value={maskToken(props.credential?.sessionId ?? "")}
                />
                <ReadOnlyField
                  label="Status"
                  value={props.credential?.isActive ? "Active" : "Inactive"}
                />
              </>
            }
          >
            <TextInputField
              type="text"
              label="CSRF Token"
              info="Можно вставить всю строку cookie: csrftoken=xxx; sessionid=yyy — поля заполнятся автоматически"
              value={form.csrfToken()}
              onValueChange={form.handleCsrfTokenChange}
              required={true}
            />
            <TextInputField
              type="text"
              label="Session ID"
              value={form.sessionId()}
              onValueChange={form.setSessionId}
              required={true}
            />
            <SwitchField
              label="Active"
              checked={form.isActive()}
              onCheckedChange={(v) => form.setIsActive(v as boolean)}
            />
          </Show>
        </div>
      )}
      footer={(close) => (
        <Show
          when={form.editing()}
          fallback={
            <div class="flex justify-end">
              <Button variant="ghost" size="sm" onClick={close}>
                Close
              </Button>
            </div>
          }
        >
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={form.handleCancelEdit}>
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={props.updating}
              disabled={!form.hasChanges()}
              onClick={form.handleSave}
            >
              Save Changes
            </LoadingButton>
          </div>
        </Show>
      )}
    />
  );
}

function DetailTitle(props: {
  credential: SecretVoicerCredentialResponse | null;
}) {
  const hasError = () =>
    props.credential?.lastError !== null
    && props.credential?.lastError !== undefined;

  return (
    <div class="flex items-center gap-3">
      <span>Credential Details</span>
      <Show when={props.credential}>
        {(cred) => (
          <Badge
            variant={resolveBadgeVariant(hasError(), cred().isActive)}
            size="sm"
            aria-label={resolveBadgeLabel(hasError(), cred().isActive)}
          >
            {resolveBadgeLabel(hasError(), cred().isActive)}
          </Badge>
        )}
      </Show>
    </div>
  );
}

function ErrorRow(props: { label: string; value: string }) {
  return (
    <div class="flex gap-3 text-sm">
      <span class="text-subtle shrink-0 w-[100px]">{props.label}:</span>
      <span class="text-error-foreground break-all">{props.value}</span>
    </div>
  );
}

function ReadOnlyField(props: { label: string; value: string }) {
  return (
    <div class="space-y-1">
      <div class="text-xs font-medium text-subtle">{props.label}</div>
      <div class="text-sm text-foreground break-all">{props.value}</div>
    </div>
  );
}

export { SecretVoicerCredentialDetailDialog };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/secret-voicer-credential/secret-voicer-credential.api.ts

```
type CredentialError = {
  action: string;
  statusCode: number | null;
  message: string;
  responseBody: string | null;
  occurredAt: string;
};

type SecretVoicerCredentialResponse = {
  id: string;
  fingerprintId: string;
  csrfToken: string;
  sessionId: string;
  isActive: boolean;
  lastError: CredentialError | null;
  lastErrorAt: string | null;
  createdAt: string;
  updatedAt: string;
  fingerprintLabel: string;
};

type CreateSecretVoicerCredentialParams = {
  fingerprintId: string;
  csrfToken: string;
  sessionId: string;
};

type UpdateSecretVoicerCredentialParams = Partial<{
  csrfToken: string;
  sessionId: string;
  isActive: boolean;
}>;

type FingerprintOption = {
  id: string;
  label: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";
const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      // use default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

const secretVoicerCredentialApi = {
  getAll(): Promise<SecretVoicerCredentialResponse[]> {
    return apiFetch("/v1/secret-voicer-credentials");
  },

  getById(id: string): Promise<SecretVoicerCredentialResponse> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}`);
  },

  create(
    data: CreateSecretVoicerCredentialParams,
  ): Promise<SecretVoicerCredentialResponse> {
    return apiFetch("/v1/secret-voicer-credentials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: UpdateSecretVoicerCredentialParams,
  ): Promise<SecretVoicerCredentialResponse> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  clearError(id: string): Promise<SecretVoicerCredentialResponse> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}/clear-error`, {
      method: "POST",
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}`, {
      method: "DELETE",
    });
  },

  async getAvailableFingerprints(): Promise<FingerprintOption[]> {
    const fingerprints =
      await apiFetch<{ id: string; label: string; isActive: boolean }[]>(
        "/v1/fingerprints",
      );
    return fingerprints.map((fp) => ({ id: fp.id, label: fp.label }));
  },
};

export type {
  CreateSecretVoicerCredentialParams,
  CredentialError,
  FingerprintOption,
  SecretVoicerCredentialResponse,
  UpdateSecretVoicerCredentialParams,
};
export { secretVoicerCredentialApi };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/secret-voicer-credential/secret-voicer-credential.page.tsx

```
import type { SecretVoicerCredentialResponse } from "./secret-voicer-credential.api";

import { Button } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { toast } from "@packages/ui/overlay";
import { H1, P } from "@packages/ui/typography";
import { Plus } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import {
  createSecretVoicerCredentialClearErrorMutation,
  createSecretVoicerCredentialDeleteMutation,
  createSecretVoicerCredentialsQuery,
  createSecretVoicerCredentialUpdateMutation,
} from "./secret-voicer-credential.query";
import { SecretVoicerCredentialCreateDialog } from "./secret-voicer-credential-create.dialog";
import { SecretVoicerCredentialDetailDialog } from "./secret-voicer-credential-detail.dialog";

const MASKED_TOKEN_VISIBLE_CHARS = 8;
const MASKED_DOTS_COUNT = 8;
const ERROR_MESSAGE_PREVIEW_LENGTH = 40;

function maskTokenShort(token: string): string {
  if (token.length <= MASKED_TOKEN_VISIBLE_CHARS) {
    return token;
  }
  return `${token.slice(0, MASKED_TOKEN_VISIBLE_CHARS)}${"•".repeat(MASKED_DOTS_COUNT)}`;
}

function SecretVoicerCredentialPage() {
  const [selectedCredential, setSelectedCredential] =
    createSignal<SecretVoicerCredentialResponse | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = createSignal(false);

  const query = createSecretVoicerCredentialsQuery();
  const updateMutation = createSecretVoicerCredentialUpdateMutation();
  const deleteMutation = createSecretVoicerCredentialDeleteMutation();
  const clearErrorMutation = createSecretVoicerCredentialClearErrorMutation();

  function handleUpdate(id: string, data: Record<string, unknown>) {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Credential updated");
          setSelectedCredential(null);
        },
        onError: () => toast.error("Failed to update credential"),
      },
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Credential deleted");
        setSelectedCredential(null);
      },
      onError: () => toast.error("Failed to delete credential"),
    });
  }

  function handleClearError(id: string) {
    clearErrorMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Credential reactivated");
        setSelectedCredential(null);
      },
      onError: () => toast.error("Failed to reactivate credential"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Secret Voicer Credentials</H1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus size={16} />
          Add Credential
        </Button>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>
      <Show when={query.isError}>
        <div class="text-error-foreground text-sm">
          Failed to load credentials
        </div>
      </Show>

      <Show when={query.data}>
        {(credentials) => (
          <CredentialTable
            credentials={credentials()}
            onSelect={setSelectedCredential}
          />
        )}
      </Show>

      <SecretVoicerCredentialCreateDialog
        open={createDialogOpen()}
        onClose={() => setCreateDialogOpen(false)}
      />
      <SecretVoicerCredentialDetailDialog
        credential={selectedCredential()}
        onClose={() => setSelectedCredential(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClearError={handleClearError}
        updating={updateMutation.isPending}
        deleting={deleteMutation.isPending}
        clearingError={clearErrorMutation.isPending}
      />
    </div>
  );
}

function CredentialTable(props: {
  credentials: SecretVoicerCredentialResponse[];
  onSelect: (cred: SecretVoicerCredentialResponse) => void;
}) {
  return (
    <div class="border border-border rounded-md overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-secondary/50">
            <th class="text-left p-3 font-medium">Fingerprint</th>
            <th class="text-left p-3 font-medium">CSRF Token</th>
            <th class="text-left p-3 font-medium">Session ID</th>
            <th class="text-left p-3 font-medium">Status</th>
            <th class="text-left p-3 font-medium">Last Error</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.credentials}>
            {(cred) => (
              <CredentialRow credential={cred} onSelect={props.onSelect} />
            )}
          </For>
        </tbody>
      </table>
      <Show when={props.credentials.length === 0}>
        <div class="p-8 text-center text-subtle text-sm">
          No credentials found. Add one to get started.
        </div>
      </Show>
    </div>
  );
}

function CredentialRow(props: {
  credential: SecretVoicerCredentialResponse;
  onSelect: (cred: SecretVoicerCredentialResponse) => void;
}) {
  const cred = props.credential;
  const hasError = () =>
    cred.lastError !== null && cred.lastError !== undefined;

  const buttonClass = () =>
    hasError()
      ? "text-left font-medium p-0 h-auto text-error-foreground"
      : "text-left font-medium p-0 h-auto text-primary";

  return (
    <tr
      class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
      style={hasError() ? { "background-color": "var(--error)" } : {}}
    >
      <td class="p-3">
        <Button
          variant="ghost"
          size="sm"
          class={buttonClass()}
          onClick={() => props.onSelect(cred)}
        >
          {cred.fingerprintLabel}
        </Button>
      </td>
      <td class="p-3 text-subtle font-mono text-xs">
        {maskTokenShort(cred.csrfToken)}
      </td>
      <td class="p-3 text-subtle font-mono text-xs">
        {maskTokenShort(cred.sessionId)}
      </td>
      <td class="p-3">
        <Badge
          variant={cred.isActive ? "success" : "error"}
          size="sm"
          aria-label={cred.isActive ? "Active" : "Inactive"}
        >
          {cred.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td class="p-3">
        <Show when={cred.lastError}>
          {(err) => (
            <P level={3} variant="error" class="truncate max-w-[200px]">
              {err().action}:{" "}
              {err().message.slice(0, ERROR_MESSAGE_PREVIEW_LENGTH)}…
            </P>
          )}
        </Show>
      </td>
    </tr>
  );
}

export { SecretVoicerCredentialPage };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/secret-voicer-credential/secret-voicer-credential.query.ts

```
import type { CreateQueryResult } from "@tanstack/solid-query";

import type {
  CreateSecretVoicerCredentialParams,
  FingerprintOption,
  SecretVoicerCredentialResponse,
  UpdateSecretVoicerCredentialParams,
} from "./secret-voicer-credential.api";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { secretVoicerCredentialApi } from "./secret-voicer-credential.api";

const QUERY_KEY = "secret-voicer-credentials";
const FINGERPRINTS_KEY = "available-fingerprints";

function createSecretVoicerCredentialsQuery(): CreateQueryResult<
  SecretVoicerCredentialResponse[]
> {
  return createQuery(() => ({
    queryKey: [QUERY_KEY],
    queryFn: () => secretVoicerCredentialApi.getAll(),
  }));
}

function createAvailableFingerprintsQuery(): CreateQueryResult<
  FingerprintOption[]
> {
  return createQuery(() => ({
    queryKey: [FINGERPRINTS_KEY],
    queryFn: () => secretVoicerCredentialApi.getAvailableFingerprints(),
  }));
}

function createSecretVoicerCredentialCreateMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: CreateSecretVoicerCredentialParams) =>
      secretVoicerCredentialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createSecretVoicerCredentialUpdateMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSecretVoicerCredentialParams;
    }) => secretVoicerCredentialApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createSecretVoicerCredentialClearErrorMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => secretVoicerCredentialApi.clearError(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createSecretVoicerCredentialDeleteMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => secretVoicerCredentialApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createAvailableFingerprintsQuery,
  createSecretVoicerCredentialClearErrorMutation,
  createSecretVoicerCredentialCreateMutation,
  createSecretVoicerCredentialDeleteMutation,
  createSecretVoicerCredentialsQuery,
  createSecretVoicerCredentialUpdateMutation,
};

```

D:/1_Projects/jstonehub/apps/admin/src/feature/storage/storage.api.ts

```
type StorageObject = {
  key: string;
  size: number;
  lastModified: string;
  isPrefix: boolean;
};

type StorageDirectory = {
  name: string;
  prefix: string;
};

type StorageFile = {
  key: string;
  size: number;
  lastModified: string;
};

type StorageListResponse = {
  directories: StorageDirectory[];
  files: StorageFile[];
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      // use default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

function parseStorageObjects(objects: StorageObject[]): StorageListResponse {
  const directories: StorageDirectory[] = [];
  const files: StorageFile[] = [];

  for (const obj of objects) {
    if (obj.isPrefix) {
      const name = obj.key.replace(/\/$/, "").split("/").pop() ?? obj.key;
      directories.push({ name, prefix: obj.key });
    } else {
      files.push({
        key: obj.key,
        size: obj.size,
        lastModified: obj.lastModified,
      });
    }
  }

  return { directories, files };
}

const storageApi = {
  async listObjects(prefix: string): Promise<StorageListResponse> {
    const params = new URLSearchParams();
    if (prefix) {
      params.set("prefix", prefix);
    }
    const query = params.toString();
    const objects = await apiFetch<StorageObject[]>(
      `/v1/storage/objects${query ? `?${query}` : ""}`,
    );
    return parseStorageObjects(objects);
  },

  deleteByKeys(keys: string[]): Promise<void> {
    return apiFetch("/v1/storage/objects", {
      method: "DELETE",
      body: JSON.stringify({ keys }),
    });
  },

  deleteByPrefix(prefix: string): Promise<void> {
    return apiFetch("/v1/storage/objects", {
      method: "DELETE",
      body: JSON.stringify({ prefix }),
    });
  },
};

export type { StorageDirectory, StorageFile, StorageListResponse, StorageObject };
export { storageApi };
```

D:/1_Projects/jstonehub/apps/admin/src/feature/storage/storage.page.tsx

```
import type { StorageDirectory, StorageFile } from "./storage.api";

import { formatFileSize } from "@packages/contract/format";
import { Button, LoadingButton } from "@packages/ui/action";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { ArrowUp, Folder, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { formatDate } from "./_format";
import {
  createStorageDeleteKeysMutation,
  createStorageDeletePrefixMutation,
  createStorageObjectsQuery,
} from "./storage.query";

function StoragePage() {
  const [prefix, setPrefix] = createSignal("");
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    new Set<string>(),
  );
  const [selectedPrefixes, setSelectedPrefixes] = createSignal<Set<string>>(
    new Set<string>(),
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);

  const query = createStorageObjectsQuery(prefix);
  const deleteKeysMutation = createStorageDeleteKeysMutation();
  const deletePrefixMutation = createStorageDeletePrefixMutation();

  function navigateToPrefix(newPrefix: string) {
    setPrefix(newPrefix);
    setSelectedKeys(new Set<string>());
    setSelectedPrefixes(new Set<string>());
  }

  function navigateUp() {
    const current = prefix();
    if (!current) return;
    const withoutTrailing = current.replace(/\/$/, "");
    const lastSlash = withoutTrailing.lastIndexOf("/");
    navigateToPrefix(
      lastSlash === -1 ? "" : `${withoutTrailing.slice(0, lastSlash + 1)}`,
    );
  }

  function toggleFileKey(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set<string>(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleDirPrefix(dirPrefix: string) {
    setSelectedPrefixes((prev) => {
      const next = new Set<string>(prev);
      if (next.has(dirPrefix)) next.delete(dirPrefix);
      else next.add(dirPrefix);
      return next;
    });
  }

  const selectionCount = () => selectedKeys().size + selectedPrefixes().size;

  async function handleDelete() {
    try {
      const keyArr = [...selectedKeys()];
      const prefixArr = [...selectedPrefixes()];

      const promises: Promise<void>[] = [];
      if (keyArr.length > 0) {
        promises.push(
          new Promise((resolve, reject) =>
            deleteKeysMutation.mutate(keyArr, {
              onSuccess: () => resolve(),
              onError: reject,
            }),
          ),
        );
      }
      for (const p of prefixArr) {
        promises.push(
          new Promise((resolve, reject) =>
            deletePrefixMutation.mutate(p, {
              onSuccess: () => resolve(),
              onError: reject,
            }),
          ),
        );
      }

      await Promise.all(promises);
      toast.success("Deleted successfully");
      setSelectedKeys(new Set<string>());
      setSelectedPrefixes(new Set<string>());
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div class="p-6 space-y-6">
      <H1>Storage</H1>

      <PathBar
        prefix={prefix()}
        canGoUp={prefix() !== ""}
        onGoUp={navigateUp}
      />

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading…</div>
      </Show>

      <Show when={query.isError}>
        <div class="text-error-foreground text-sm">Failed to load objects</div>
      </Show>

      <Show when={query.data}>
        {(data) => (
          <ObjectTable
            directories={data().directories}
            files={data().files}
            selectedKeys={selectedKeys()}
            selectedPrefixes={selectedPrefixes()}
            onNavigate={navigateToPrefix}
            onToggleFile={toggleFileKey}
            onToggleDir={toggleDirPrefix}
          />
        )}
      </Show>

      <SelectionBar
        count={selectionCount()}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      <Dialog
        alert={true}
        open={deleteDialogOpen()}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm deletion"
        description={`Delete ${selectionCount()} selected item(s)? This cannot be undone.`}
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={
                deleteKeysMutation.isPending || deletePrefixMutation.isPending
              }
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </div>
        )}
      />
    </div>
  );
}

function PathBar(props: {
  prefix: string;
  canGoUp: boolean;
  onGoUp: () => void;
}) {
  const segments = () => {
    if (!props.prefix) return ["(root)"];
    return props.prefix.split("/").filter(Boolean);
  };

  return (
    <div class="flex items-center gap-2 text-sm">
      <span class="text-subtle">Path:</span>
      <For each={segments()}>
        {(seg, i) => (
          <>
            <Show when={i() > 0}>
              <span class="text-subtle">/</span>
            </Show>
            <span class="font-medium">{seg}</span>
          </>
        )}
      </For>
      <Show when={props.canGoUp}>
        <Button variant="ghost" size="sm" onClick={props.onGoUp}>
          <ArrowUp size={14} />
        </Button>
      </Show>
    </div>
  );
}

function ObjectTable(props: {
  directories: StorageDirectory[];
  files: StorageFile[];
  selectedKeys: Set<string>;
  selectedPrefixes: Set<string>;
  onNavigate: (prefix: string) => void;
  onToggleFile: (key: string) => void;
  onToggleDir: (prefix: string) => void;
}) {
  const isEmpty = () =>
    props.directories.length === 0 && props.files.length === 0;

  return (
    <div class="border border-border rounded-md overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-secondary/50">
            <th class="w-10 p-3" />
            <th class="text-left p-3 font-medium">Name</th>
            <th class="text-left p-3 font-medium">Size</th>
            <th class="text-left p-3 font-medium">Modified</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.directories}>
            {(dir) => (
              <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                <td class="p-3 text-center">
                  {/* biome-ignore lint/correctness/noRestrictedElements: native checkbox for table selection */}
                  <input
                    type="checkbox"
                    checked={props.selectedPrefixes.has(dir.prefix)}
                    onChange={() => props.onToggleDir(dir.prefix)}
                  />
                </td>
                <td class="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="p-0 h-auto gap-2 font-medium"
                    onClick={() => props.onNavigate(dir.prefix)}
                  >
                    <Folder size={14} />
                    {dir.name}
                  </Button>
                </td>
                <td class="p-3 text-subtle">—</td>
                <td class="p-3 text-subtle">—</td>
              </tr>
            )}
          </For>
          <For each={props.files}>
            {(file) => (
              <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                <td class="p-3 text-center">
                  {/* biome-ignore lint/correctness/noRestrictedElements: native checkbox for table selection */}
                  <input
                    type="checkbox"
                    checked={props.selectedKeys.has(file.key)}
                    onChange={() => props.onToggleFile(file.key)}
                  />
                </td>
                <td class="p-3 font-medium truncate max-w-xs">
                  {file.key.split("/").pop()}
                </td>
                <td class="p-3 text-subtle">{formatFileSize(file.size)}</td>
                <td class="p-3 text-subtle">
                  {formatDate(file.lastModified)}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <Show when={isEmpty()}>
        <div class="p-8 text-center text-subtle text-sm">No objects found</div>
      </Show>
    </div>
  );
}

function SelectionBar(props: { count: number; onDelete: () => void }) {
  return (
    <Show when={props.count > 0}>
      <div class="flex items-center gap-4">
        <span class="text-sm text-subtle">Selected: {props.count}</span>
        <Button variant="destructive" size="sm" onClick={props.onDelete}>
          <Trash2 size={14} />
          Delete selected
        </Button>
      </div>
    </Show>
  );
}

export { StoragePage };
```

D:/1_Projects/jstonehub/apps/admin/src/feature/storage/storage.query.ts

```
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import type { Accessor } from "solid-js";

import { storageApi } from "./storage.api";

const QUERY_KEY = "storage-objects";

function createStorageObjectsQuery(prefix: Accessor<string>) {
  return createQuery(() => ({
    queryKey: [QUERY_KEY, prefix()],
    queryFn: () => storageApi.listObjects(prefix()),
  }));
}

function createStorageDeleteKeysMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (keys: string[]) => storageApi.deleteByKeys(keys),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createStorageDeletePrefixMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (prefix: string) => storageApi.deleteByPrefix(prefix),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createStorageDeleteKeysMutation,
  createStorageDeletePrefixMutation,
  createStorageObjectsQuery,
};
```

D:/1_Projects/jstonehub/apps/admin/src/feature/storage/_format.ts

```
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}
```

D:/1_Projects/jstonehub/apps/admin/src/feature/tag/tag.api.ts

```
type TagResponse = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      /* default */
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

const tagApi = {
  getAll: (): Promise<TagResponse[]> => apiFetch("/v1/tags"),
  create: (data: { slug: string; name: string }): Promise<TagResponse> =>
    apiFetch("/v1/tags", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    apiFetch(`/v1/tags/${id}`, { method: "DELETE" }),
};

export type { TagResponse };
export { tagApi };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/tag/tag.page.tsx

```
import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { TextInputField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Plus, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import {
  createTagCreateMutation,
  createTagDeleteMutation,
  createTagsQuery,
} from "./tag.query";

function TagPage() {
  const query = createTagsQuery();
  const createMut = createTagCreateMutation();
  const deleteMut = createTagDeleteMutation();

  const [createOpen, setCreateOpen] = createSignal(false);
  const [slug, setSlug] = createSignal("");
  const [name, setName] = createSignal("");
  const [deleteId, setDeleteId] = createSignal<string | null>(null);

  function handleCreate() {
    createMut.mutate(
      { slug: slug().trim(), name: name().trim() },
      {
        onSuccess: () => {
          toast.success("Tag created");
          setCreateOpen(false);
          setSlug("");
          setName("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  function handleDelete() {
    const id = deleteId();
    if (!id) {
      return;
    }
    deleteMut.mutate(id, {
      onSuccess: () => {
        toast.success("Tag deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Tags</H1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Add Tag
        </Button>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show when={query.data}>
        {(tags) => (
          <div class="border border-border rounded-md overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-secondary/50">
                  <th class="text-left p-3 font-medium">Slug</th>
                  <th class="text-left p-3 font-medium">Name</th>
                  <th class="text-right p-3 font-medium w-[60px]" />
                </tr>
              </thead>
              <tbody>
                <For each={tags()}>
                  {(tag) => (
                    <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30">
                      <td class="p-3 font-mono">{tag.slug}</td>
                      <td class="p-3">{tag.name}</td>
                      <td class="p-3 text-right">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Delete"
                          onClick={() => setDeleteId(tag.id)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
            <Show when={tags().length === 0}>
              <div class="p-8 text-center text-subtle text-sm">No tags</div>
            </Show>
          </div>
        )}
      </Show>

      <Dialog
        alert={false}
        open={createOpen()}
        onClose={() => setCreateOpen(false)}
        title="Add Tag"
        description="Enter tag slug and display name."
        content={() => (
          <div class="space-y-4">
            <TextInputField
              type="text"
              label="Slug"
              value={slug()}
              onValueChange={setSlug}
              required={true}
              placeholder="e.g. dark-humor"
            />
            <TextInputField
              type="text"
              label="Name"
              value={name()}
              onValueChange={setName}
              required={true}
              placeholder="e.g. Dark Humor"
            />
          </div>
        )}
        footer={() => (
          <div class="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={createMut.isPending}
              disabled={!(slug().trim() && name().trim())}
              onClick={handleCreate}
            >
              Create
            </LoadingButton>
          </div>
        )}
      />

      <Dialog
        alert={true}
        open={deleteId() !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Tag"
        description="Are you sure? This will remove the tag from all jokes."
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={deleteMut.isPending}
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </div>
        )}
      />
    </div>
  );
}

export { TagPage };

```

D:/1_Projects/jstonehub/apps/admin/src/feature/tag/tag.query.ts

```
import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { tagApi } from "./tag.api";

const QUERY_KEY = "tags";

function createTagsQuery() {
  return createQuery(() => ({
    queryKey: [QUERY_KEY],
    queryFn: () => tagApi.getAll(),
  }));
}

function createTagCreateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: { slug: string; name: string }) => tagApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createTagDeleteMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => tagApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export { createTagCreateMutation, createTagDeleteMutation, createTagsQuery };

```

D:/1_Projects/jstonehub/apps/admin/src/shared/api/client.ts

```
import type { ApiApp } from "#api/app/api.type";

import { treaty } from "@elysiajs/eden";

import { env } from "../config/env";

export const client = treaty<ApiApp>(env.API_URL);

```

D:/1_Projects/jstonehub/apps/admin/src/shared/api/query-client.ts

```
import { QueryClient } from "@tanstack/solid-query";

export const queryClient = new QueryClient();

```

D:/1_Projects/jstonehub/apps/admin/src/shared/auth/guard.ts

```
import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";
import type { QueryClient } from "@tanstack/solid-query";

import type { SessionData } from "./session";

import { hasAdminPermission } from "@packages/contract/permission";
import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";
import { redirect } from "@tanstack/solid-router";

import { fetchSessionWithRefresh, SESSION_QUERY_KEY } from "./session";

type GuardOptions = {
  minRole?: GlobalRole;
  permission?: AdminPermission;
};

export async function ensureSession(
  queryClient: QueryClient,
): Promise<SessionData> {
  return queryClient.ensureQueryData({
    queryKey: [...SESSION_QUERY_KEY],
    queryFn: fetchSessionWithRefresh,
    staleTime: 5 * 60 * 1000,
  });
}

export function guardAuth(
  session: SessionData,
  locationHref: string,
  options: GuardOptions = {},
): void {
  if (!session.user) {
    throw redirect({
      to: "/login",
      search: { redirect: locationHref, error: "UNAUTHORIZED" },
    });
  }

  if (session.user.isBanned) {
    throw redirect({
      to: "/login",
      search: { error: "BANNED" },
    });
  }

  // Admin app requires at least moderator
  const minRole = options.minRole ?? "moderator";
  if (
    GLOBAL_ROLE_HIERARCHY[session.user.globalRole as GlobalRole]
    < GLOBAL_ROLE_HIERARCHY[minRole]
  ) {
    throw redirect({
      to: "/login",
      search: { error: "INSUFFICIENT_ROLE" },
    });
  }

  if (
    options.permission
    && !hasAdminPermission(session.user.permissions, options.permission)
  ) {
    throw redirect({
      to: "/login",
      search: { error: "INSUFFICIENT_ROLE" },
    });
  }
}
```

D:/1_Projects/jstonehub/apps/admin/src/shared/auth/session.ts

```
import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import {
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { env } from "#admin/shared/config/env";

export const SESSION_QUERY_KEY = ["session"] as const;

const SESSION_STALE_TIME = 5 * 60 * 1000;
const SESSION_GC_TIME = 10 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  globalRole: GlobalRole;
  isBanned: boolean;
  bannedReason: string | null;
  permissions: AdminPermission[];
};

export type SessionData =
  | { user: SessionUser }
  | { user: null };

async function fetchSession(): Promise<SessionData> {
  const response = await fetch(`${env.API_URL}/v1/auth/session`, {
    credentials: "include",
  });

  if (!response.ok) {
    return { user: null };
  }

  return response.json();
}

async function refreshToken(): Promise<boolean> {
  const response = await fetch(`${env.API_URL}/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function fetchSessionWithRefresh(): Promise<SessionData> {
  const session = await fetchSession();

  if (session.user) {
    return session;
  }

  // Access token expired — try refresh
  const refreshed = await refreshToken();
  if (!refreshed) {
    return { user: null };
  }

  return fetchSession();
}

export function createSessionQuery() {
  return createQuery(() => ({
    queryKey: [...SESSION_QUERY_KEY],
    queryFn: fetchSessionWithRefresh,
    staleTime: SESSION_STALE_TIME,
    gcTime: SESSION_GC_TIME,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  }));
}

export function useLogout() {
  const queryClient = useQueryClient();

  return async () => {
    try {
      await fetch(`${env.API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore — we clear everything regardless
    }

    queryClient.clear();
    window.location.href = "/login";
  };
}
```

D:/1_Projects/jstonehub/apps/admin/src/shared/config/env.ts

```
import { minLength, object, pipe, safeParse, string } from "valibot";

const schema = object({
  API_URL: pipe(string(), minLength(1)),
  HUB_URL: pipe(string(), minLength(1)),

  SUPPORT_EMAIL: pipe(string(), minLength(1)),
});

function parseEnv() {
  const raw = import.meta.env;

  const result = safeParse(schema, {
    API_URL: raw.VITE_API_URL,
    HUB_URL: raw.VITE_HUB_URL,

    SUPPORT_EMAIL: raw.VITE_SUPPORT_EMAIL,
  });

  if (!result.success) {
    const message = result.issues
      .map((issue) => {
        const path = issue.path?.map((p) => p.key).join(".") || "root";
        return `  • ${path}: ${issue.message}`;
      })
      .join("\n");
    throw new Error(`❌ Hub: Invalid environment variables:\n${message}`);
  }

  return result.output;
}

export const env = parseEnv();

```

D:/1_Projects/jstonehub/apps/api/src/feature/audio-processing/audio-processing.schema.ts

```
import {
  AUDIO_OUTPUT_BITRATES,
  AUDIO_OUTPUT_FORMATS,
  AUDIO_PROCESSING_LIMITS,
} from "@packages/contract/audio-processing";
import { Type } from "typebox";
import { Compile } from "typebox/compile";

const L = AUDIO_PROCESSING_LIMITS;

const audioProcessingConfigSchema = Type.Object({
  silenceRemoval: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      thresholdDb: Type.Optional(
        Type.Number({
          minimum: L.silenceRemoval.thresholdDb.min,
          maximum: L.silenceRemoval.thresholdDb.max,
        }),
      ),
      minDurationMs: Type.Optional(
        Type.Integer({
          minimum: L.silenceRemoval.minDurationMs.min,
          maximum: L.silenceRemoval.minDurationMs.max,
        }),
      ),
      keepGapMs: Type.Optional(
        Type.Integer({
          minimum: L.silenceRemoval.keepGapMs.min,
          maximum: L.silenceRemoval.keepGapMs.max,
        }),
      ),
    }),
  ),
  normalization: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      targetLufs: Type.Optional(
        Type.Number({
          minimum: L.normalization.targetLufs.min,
          maximum: L.normalization.targetLufs.max,
        }),
      ),
      truePeakDb: Type.Optional(
        Type.Number({
          minimum: L.normalization.truePeakDb.min,
          maximum: L.normalization.truePeakDb.max,
        }),
      ),
    }),
  ),
  highPassFilter: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      frequencyHz: Type.Optional(
        Type.Integer({
          minimum: L.highPassFilter.frequencyHz.min,
          maximum: L.highPassFilter.frequencyHz.max,
        }),
      ),
    }),
  ),
  limiter: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
      limitDb: Type.Optional(
        Type.Number({
          minimum: L.limiter.limitDb.min,
          maximum: L.limiter.limitDb.max,
        }),
      ),
    }),
  ),
  fade: Type.Optional(
    Type.Object({
      inMs: Type.Optional(
        Type.Integer({
          minimum: L.fade.inMs.min,
          maximum: L.fade.inMs.max,
        }),
      ),
      outMs: Type.Optional(
        Type.Integer({
          minimum: L.fade.outMs.min,
          maximum: L.fade.outMs.max,
        }),
      ),
    }),
  ),
  gaps: Type.Optional(
    Type.Object({
      innerMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.innerMs.min,
          maximum: L.gaps.innerMs.max,
        }),
      ),
      betweenMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.betweenMs.min,
          maximum: L.gaps.betweenMs.max,
        }),
      ),
      startMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.startMs.min,
          maximum: L.gaps.startMs.max,
        }),
      ),
      endMs: Type.Optional(
        Type.Integer({
          minimum: L.gaps.endMs.min,
          maximum: L.gaps.endMs.max,
        }),
      ),
    }),
  ),
  concatenation: Type.Optional(
    Type.Object({
      enabled: Type.Optional(Type.Boolean()),
    }),
  ),
  output: Type.Optional(
    Type.Object({
      format: Type.Optional(
        Type.Union(AUDIO_OUTPUT_FORMATS.map((f) => Type.Literal(f))),
      ),
      bitrate: Type.Optional(
        Type.Union(AUDIO_OUTPUT_BITRATES.map((b) => Type.Literal(b))),
      ),
      sampleRate: Type.Optional(
        Type.Integer({
          minimum: L.output.sampleRate.min,
          maximum: L.output.sampleRate.max,
        }),
      ),
    }),
  ),
});

export const audioProcessingConfigValidator = Compile(
  audioProcessingConfigSchema,
);

```

D:/1_Projects/jstonehub/apps/api/src/feature/audio-processing/audio-processing.v1.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";
import type {
  AudioProcessingJobData,
  AudioProcessingJobResult,
} from "@packages/contract/queue";

import {
  AUDIO_PROCESSING_DEFAULTS,
  AUDIO_PROCESSING_NAME_LIMITS,
  AUDIO_PROCESSING_TTL_MS,
  AUDIO_PROCESSING_UPLOAD_LIMITS,
} from "@packages/contract/audio-processing";
import { STORAGE_PREFIXES } from "@packages/contract/storage";
import { createId } from "@packages/util/id";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";
import { addJob, getQueue } from "#api/shared/queue/producer";
import { storage } from "#api/shared/storage/storage";

import { audioProcessingConfigValidator } from "./audio-processing.schema";

const FILE_INDEX_PAD_LENGTH = 4;
const FILE_NAME_MAX_LENGTH = 200;
const JOB_FETCH_LIMIT = 200;
const JOB_LIST_STATES = [
  "completed",
  "failed",
  "active",
  "waiting",
  "delayed",
] as const;

type ProcessBody = {
  jobId?: string;
  config?: Record<string, unknown>;
  name?: string;
};

type JobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type JobListEntry = {
  jobId: string;
  status: string;
  name: string;
  isConcatenated: boolean;
  fileCount: number;
  createdAt: string;
  expiresAt: string;
  files?: JobFileEntry[];
  error?: string;
};

function buildFileEntries(
  result: AudioProcessingJobResult,
): Promise<JobFileEntry[]> {
  return Promise.all(
    (result.outputFiles ?? []).map(async (fileInfo) => {
      const url = await storage.getPresignedDownloadUrl(
        fileInfo.key,
        AUDIO_PROCESSING_UPLOAD_LIMITS.downloadUrlExpirySeconds,
      );
      return {
        fileName: fileInfo.fileName,
        sizeBytes: fileInfo.sizeBytes,
        durationMs: fileInfo.durationMs,
        downloadUrl: url,
      };
    }),
  );
}

async function findJobByCustomId(jobId: string) {
  const queue = getQueue("audio-processing");
  const jobs = await queue.getJobs([...JOB_LIST_STATES], 0, JOB_FETCH_LIMIT);
  return (
    jobs.find(
      (j) => (j.data as AudioProcessingJobData | undefined)?.jobId === jobId,
    ) ?? null
  );
}

async function buildJobListEntries(): Promise<JobListEntry[]> {
  const queue = getQueue("audio-processing");
  const jobs = await queue.getJobs([...JOB_LIST_STATES], 0, JOB_FETCH_LIMIT);

  const entries = await Promise.all(
    jobs.map(async (job): Promise<JobListEntry | null> => {
      const data = job.data as AudioProcessingJobData | undefined;
      if (!data?.jobId) {
        return null;
      }

      const state = await job.getState();
      const createdAt = new Date(job.timestamp).toISOString();
      const expiresAt = new Date(
        job.timestamp + AUDIO_PROCESSING_TTL_MS,
      ).toISOString();

      const entry: JobListEntry = {
        jobId: data.jobId,
        status: state,
        name: data.outputName ?? "Untitled",
        isConcatenated: data.isConcatenated ?? false,
        fileCount: data.inputKeys?.length ?? 0,
        createdAt,
        expiresAt,
      };

      if (state === "completed" && job.returnvalue) {
        const result = job.returnvalue as AudioProcessingJobResult;
        entry.files = await buildFileEntries(result);
      }

      if (state === "failed") {
        entry.error = job.failedReason ?? "Unknown error";
      }

      return entry;
    }),
  );

  return entries
    .filter((e): e is JobListEntry => e !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

const audioProcessingV1 = new Elysia({
  prefix: "/v1/audio-processing",
})
  .onError(({ error, set }) => {
    // biome-ignore lint/suspicious/noConsole: Error logging required for debugging
    console.error("❌ [audio-processing] Route error:", error);
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .post("/upload-urls", async ({ body, set }) => {
    const { fileNames } = body as { fileNames?: string[] };

    if (
      !Array.isArray(fileNames)
      || fileNames.length === 0
      || fileNames.length > AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `Provide 1–${AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles} file names`,
      };
    }

    const jobId = createId();
    const prefix = STORAGE_PREFIXES.audioProcessingInput(jobId);

    const uploads = await Promise.all(
      fileNames.map(async (fileName, index) => {
        const paddedIndex = String(index).padStart(FILE_INDEX_PAD_LENGTH, "0");
        const key = `${prefix}${paddedIndex}_${sanitizeFileName(fileName)}`;
        const url = await storage.getPresignedUploadUrl(
          key,
          AUDIO_PROCESSING_UPLOAD_LIMITS.presignedUrlExpirySeconds,
        );
        return { fileName, key, uploadUrl: url };
      }),
    );

    return { jobId, uploads };
  })
  .post("/process", async ({ body, set }) => {
    const { jobId, config: rawConfig, name } = body as ProcessBody;

    if (!jobId || typeof jobId !== "string") {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "jobId is required" };
    }

    if (
      !name
      || typeof name !== "string"
      || name.length < AUDIO_PROCESSING_NAME_LIMITS.min
      || name.length > AUDIO_PROCESSING_NAME_LIMITS.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `name is required (${AUDIO_PROCESSING_NAME_LIMITS.min}–${AUDIO_PROCESSING_NAME_LIMITS.max} characters)`,
      };
    }

    const configInput = rawConfig ?? {};
    if (
      Object.keys(configInput).length > 0
      && !audioProcessingConfigValidator.Check(configInput)
    ) {
      const errors = [...audioProcessingConfigValidator.Errors(configInput)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const config = mergeWithDefaults(configInput);
    const prefix = STORAGE_PREFIXES.audioProcessingInput(jobId);
    const inputObjects = await storage.listObjects(prefix);

    if (inputObjects.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No input files found. Upload files first." };
    }

    const inputKeys = inputObjects.map((o) => o.key).sort();
    const outputPrefix = STORAGE_PREFIXES.audioProcessingOutput(jobId);
    const isConcatenated = config.concatenation.enabled;

    const bullJobId = await addJob({
      queue: "audio-processing",
      name: "process-audio",
      data: {
        jobId,
        config,
        inputKeys,
        outputPrefix,
        outputName: name,
        isConcatenated,
      },
    });

    set.status = HTTP_STATUS.CREATED;
    return {
      jobId,
      bullJobId,
      queue: "audio-processing",
      status: "queued",
      inputFileCount: inputKeys.length,
    };
  })
  .get("/jobs", () => buildJobListEntries())
  .get("/jobs/:jobId", async ({ params, set }) => {
    const job = await findJobByCustomId(params.jobId);

    if (!job) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Job not found" };
    }

    const state = await job.getState();
    const data = job.data as AudioProcessingJobData;
    const createdAt = new Date(job.timestamp).toISOString();
    const expiresAt = new Date(
      job.timestamp + AUDIO_PROCESSING_TTL_MS,
    ).toISOString();

    const entry: JobListEntry = {
      jobId: params.jobId,
      status: state,
      name: data.outputName ?? "Untitled",
      isConcatenated: data.isConcatenated ?? false,
      fileCount: data.inputKeys?.length ?? 0,
      createdAt,
      expiresAt,
    };

    if (state === "completed" && job.returnvalue) {
      const result = job.returnvalue as AudioProcessingJobResult;
      entry.files = await buildFileEntries(result);
    }

    if (state === "failed") {
      entry.error = job.failedReason ?? "Unknown error";
    }

    return entry;
  })
  .delete("/jobs/:jobId", async ({ params, set }) => {
    const prefix = STORAGE_PREFIXES.audioProcessingJob(params.jobId);
    await storage.deletePrefix(prefix);

    const job = await findJobByCustomId(params.jobId);
    if (job) {
      try {
        await job.remove();
      } catch {
        // job may already be removed
      }
    }

    set.status = HTTP_STATUS.NO_CONTENT;
  })
  .get("/defaults", () => AUDIO_PROCESSING_DEFAULTS);

function mergeWithDefaults(
  partial: Record<string, unknown>,
): AudioProcessingConfig {
  const d = AUDIO_PROCESSING_DEFAULTS;
  const p = partial as Partial<{
    [K in keyof AudioProcessingConfig]: Partial<AudioProcessingConfig[K]>;
  }>;

  return {
    silenceRemoval: { ...d.silenceRemoval, ...p.silenceRemoval },
    normalization: { ...d.normalization, ...p.normalization },
    highPassFilter: { ...d.highPassFilter, ...p.highPassFilter },
    limiter: { ...d.limiter, ...p.limiter },
    fade: { ...d.fade, ...p.fade },
    gaps: { ...d.gaps, ...p.gaps },
    concatenation: { ...d.concatenation, ...p.concatenation },
    output: { ...d.output, ...p.output },
  };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, FILE_NAME_MAX_LENGTH);
}

export { audioProcessingV1 };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.cookie.ts

```
import type { Context } from "elysia";

import { env } from "#api/shared/config/env";

const _MS_IN_SECOND = 1000;

type CookieJar = Context["cookie"];

const COOKIE_BASE = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN,
};

function setAuthCookies(
  cookie: CookieJar,
  accessToken: string,
  refreshTokenId: string,
): void {
  cookie.access_token?.set({
    value: accessToken,
    ...COOKIE_BASE,
    path: "/",
    maxAge: env.ACCESS_TOKEN_EXPIRES_IN,
  });

  cookie.refresh_token?.set({
    value: refreshTokenId,
    ...COOKIE_BASE,
    path: "/v1/auth",
    maxAge: env.REFRESH_TOKEN_EXPIRES_IN,
  });
}

function clearAuthCookies(cookie: CookieJar): void {
  cookie.access_token?.set({
    value: "",
    ...COOKIE_BASE,
    path: "/",
    maxAge: 0,
  });

  cookie.refresh_token?.set({
    value: "",
    ...COOKIE_BASE,
    path: "/v1/auth",
    maxAge: 0,
  });
}

export { clearAuthCookies, setAuthCookies };
```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.jwt.ts

```
import type { GlobalRole } from "@packages/contract/role";

import { is } from "@packages/util/guard";
import { jwtVerify, SignJWT } from "jose";

import { env } from "#api/shared/config/env";

type JwtPayload = {
  sub: string;
  email: string;
  role: GlobalRole;
};

const JWT_ALGORITHM = "HS256";

let encodedSecret: Uint8Array | null = null;

function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_EXPIRES_IN}s`)
    .sign(getSecret());
}

async function verifyAccessToken(
  token: string,
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub ?? "",
      email: (payload.email as string) ?? "",
      role: (payload.role as GlobalRole) ?? "user",
    };
  } catch {
    return null;
  }
}

function getSecret(): Uint8Array {
  if (is.null(encodedSecret)) {
    encodedSecret = new TextEncoder().encode(env.JWT_SECRET);
  }
  return encodedSecret;
}

export type { JwtPayload };
export { signAccessToken, verifyAccessToken };
```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.middleware.ts

```
import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import type { JwtPayload } from "./auth.jwt";

import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { verifyAccessToken } from "./auth.jwt";
import { resolveAdminPermissions } from "./auth.permission";
import { authRepository } from "./auth.repository";

type AuthUser = JwtPayload & {
  permissions: AdminPermission[];
};

// ─── Derive: Parse JWT from cookie ────────────────────────────────────────────

const authPlugin = new Elysia({ name: "auth" }).derive(
  async ({ cookie }): Promise<{ authUser: AuthUser | null }> => {
    const token = cookie.access_token?.value;
    if (!token) {
      return { authUser: null };
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return { authUser: null };
    }

    // Owner fast-path: skip DB
    if (payload.role === "owner") {
      const { ADMIN_PERMISSIONS } = await import(
        "@packages/contract/permission"
      );
      return {
        authUser: {
          ...payload,
          permissions: [...ADMIN_PERMISSIONS],
        },
      };
    }

    const customPermissions = await authRepository.getUserAdminPermissions(
      payload.sub,
    );
    const permissions = resolveAdminPermissions(
      payload.role,
      customPermissions,
    );

    return { authUser: { ...payload, permissions } };
  },
);

// ─── Guards ───────────────────────────────────────────────────────────────────

function requireAuth() {
  return new Elysia({ name: "require-auth" }).onBeforeHandle(
    ({ authUser, set }) => {
      if (!authUser) {
        set.status = HTTP_STATUS.UNAUTHORIZED;
        return { error: "UNAUTHORIZED", message: "Authentication required" };
      }
    },
  );
}

function requireRole(minRole: GlobalRole) {
  return new Elysia({ name: `require-role-${minRole}` }).onBeforeHandle(
    ({ authUser, set }) => {
      if (!authUser) {
        set.status = HTTP_STATUS.UNAUTHORIZED;
        return { error: "UNAUTHORIZED", message: "Authentication required" };
      }

      if (
        GLOBAL_ROLE_HIERARCHY[authUser.role]
        < GLOBAL_ROLE_HIERARCHY[minRole]
      ) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return {
          error: "INSUFFICIENT_ROLE",
          message: `Requires ${minRole} role or higher`,
        };
      }
    },
  );
}

function requirePermission(permission: AdminPermission) {
  return new Elysia({
    name: `require-permission-${permission}`,
  }).onBeforeHandle(({ authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED", message: "Authentication required" };
    }

    if (!authUser.permissions.includes(permission)) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: "INSUFFICIENT_ROLE",
        message: `Missing permission: ${permission}`,
      };
    }
  });
}

export type { AuthUser };
export { authPlugin, requireAuth, requirePermission, requireRole };
```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.oauth.ts

```
import { Google } from "arctic";

import { env } from "#api/shared/config/env";

const GOOGLE_CALLBACK_PATH = "/v1/auth/google/callback";

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `http://localhost:${env.PORT}${GOOGLE_CALLBACK_PATH}`,
);

export type GoogleUserInfo = {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
};

export async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Google userinfo failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };

  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture ?? null,
  };
}
```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.permission.ts

```
import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import {
  ADMIN_PERMISSIONS,
  DEFAULT_ROLE_ADMIN_PERMISSIONS,
} from "@packages/contract/permission";
import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";

export function resolveAdminPermissions(
  globalRole: GlobalRole,
  customPermissions: AdminPermission[],
): AdminPermission[] {
  if (globalRole === "owner") {
    return [...ADMIN_PERMISSIONS];
  }

  const defaults = DEFAULT_ROLE_ADMIN_PERMISSIONS[globalRole];
  const merged = new Set<AdminPermission>([...defaults, ...customPermissions]);
  return [...merged];
}

export function canManageUser(
  actorRole: GlobalRole,
  targetRole: GlobalRole,
): boolean {
  return GLOBAL_ROLE_HIERARCHY[actorRole] > GLOBAL_ROLE_HIERARCHY[targetRole];
}

export function canGrantPermission(
  actorPermissions: AdminPermission[],
  permission: AdminPermission,
): boolean {
  return actorPermissions.includes(permission);
}
```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.repository.ts

```
import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";
import type { InferSelectModel } from "drizzle-orm";

import { is } from "@packages/util/guard";
import { and, eq, lt } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import {
  oauthAccountsTable,
  sessionsTable,
  userAdminPermissionsTable,
  usersTable,
} from "./auth.table";

type User = InferSelectModel<typeof usersTable>;
type Session = InferSelectModel<typeof sessionsTable>;
type UserAdminPermission = InferSelectModel<typeof userAdminPermissionsTable>;

const authRepo = {
  async getUserByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return row ?? null;
  },

  async getUserById(id: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return row ?? null;
  },

  getAllUsers(): Promise<User[]> {
    return db.select().from(usersTable).orderBy(usersTable.createdAt);
  },

  async createUser(data: {
    email: string;
    name: string;
    avatarUrl: string | null;
    globalRole: GlobalRole;
  }): Promise<User> {
    const [row] = await db.insert(usersTable).values(data).returning();
    if (is.undefined(row)) {
      throw new Error("Failed to create user");
    }
    return row;
  },

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      avatarUrl: string | null;
      globalRole: GlobalRole;
      isBanned: boolean;
      bannedAt: Date | null;
      bannedReason: string | null;
    }>,
  ): Promise<User | null> {
    const [row] = await db
      .update(usersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return row ?? null;
  },

  async getOauthAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<{
    provider: string;
    providerAccountId: string;
    userId: string;
  } | null> {
    const [row] = await db
      .select()
      .from(oauthAccountsTable)
      .where(
        and(
          eq(oauthAccountsTable.provider, provider),
          eq(oauthAccountsTable.providerAccountId, providerAccountId),
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async createOauthAccount(data: {
    provider: string;
    providerAccountId: string;
    userId: string;
  }): Promise<void> {
    await db.insert(oauthAccountsTable).values(data);
  },

  async createSession(data: {
    userId: string;
    expiresAt: Date;
  }): Promise<Session> {
    const [row] = await db.insert(sessionsTable).values(data).returning();
    if (is.undefined(row)) {
      throw new Error("Failed to create session");
    }
    return row;
  },

  async getSessionById(id: string): Promise<Session | null> {
    const [row] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .limit(1);
    return row ?? null;
  },

  async deleteSession(id: string): Promise<boolean> {
    const rows = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .returning({ id: sessionsTable.id });
    return rows.length > 0;
  },

  async deleteAllUserSessions(userId: string): Promise<number> {
    const rows = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, userId))
      .returning({ id: sessionsTable.id });
    return rows.length;
  },

  async deleteExpiredSessions(): Promise<number> {
    const rows = await db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expiresAt, new Date()))
      .returning({ id: sessionsTable.id });
    return rows.length;
  },

  // ─── Admin Permissions ──────────────────────────────────────────────────────

  async getUserAdminPermissions(userId: string): Promise<AdminPermission[]> {
    const rows = await db
      .select({ permission: userAdminPermissionsTable.permission })
      .from(userAdminPermissionsTable)
      .where(eq(userAdminPermissionsTable.userId, userId));
    return rows.map((r) => r.permission as AdminPermission);
  },

  async setUserAdminPermissions(
    userId: string,
    permissions: AdminPermission[],
    grantedBy: string,
  ): Promise<void> {
    await db
      .delete(userAdminPermissionsTable)
      .where(eq(userAdminPermissionsTable.userId, userId));

    if (permissions.length > 0) {
      await db.insert(userAdminPermissionsTable).values(
        permissions.map((permission) => ({
          userId,
          permission,
          grantedBy,
        })),
      );
    }
  },

  async deleteUserAdminPermissions(userId: string): Promise<void> {
    await db
      .delete(userAdminPermissionsTable)
      .where(eq(userAdminPermissionsTable.userId, userId));
  },
};

export type { UserAdminPermission };
export { authRepo };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.service.ts

```
import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import type { User } from "./auth.repository";

import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";

import { env } from "#api/shared/config/env";

import { signAccessToken } from "./auth.jwt";
import { resolveAdminPermissions } from "./auth.permission";
import { authRepository } from "./auth.repository";

type AuthTokens = {
  accessToken: string;
  refreshTokenId: string;
};

type SessionData = {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    globalRole: GlobalRole;
    isBanned: boolean;
    bannedReason: string | null;
    permissions: AdminPermission[];
  };
};

type BanUserParams = {
  actorRole: GlobalRole;
  targetUserId: string;
  reason: string;
};

type UnbanUserParams = {
  actorRole: GlobalRole;
  targetUserId: string;
};

type SetRoleParams = {
  actorRole: GlobalRole;
  targetUserId: string;
  newRole: GlobalRole;
};

type SetPermissionsParams = {
  actorId: string;
  actorRole: GlobalRole;
  actorPermissions: AdminPermission[];
  targetUserId: string;
  permissions: AdminPermission[];
};

const MS_IN_SECOND = 1000;

// ─── OAuth User Resolution ───────────────────────────────────────────────────

async function findOrCreateUserFromOAuth(params: {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}): Promise<User> {
  const existingOauth = await authRepository.findOauthAccount(
    params.provider,
    params.providerAccountId,
  );

  if (existingOauth) {
    const user = await authRepository.findUserById(existingOauth.userId);
    if (!user) {
      throw new Error("OAuth account references missing user");
    }

    await authRepository.updateUser(user.id, {
      name: params.name,
      avatarUrl: params.avatarUrl,
    });

    return { ...user, name: params.name, avatarUrl: params.avatarUrl };
  }

  const existingUser = await authRepository.findUserByEmail(params.email);

  if (existingUser) {
    await authRepository.createOauthAccount({
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      userId: existingUser.id,
    });
    return existingUser;
  }

  const isOwner =
    params.email.toLowerCase() === env.OWNER_EMAIL.toLowerCase();
  const globalRole: GlobalRole = isOwner ? "owner" : "user";

  const user = await authRepository.createUser({
    email: params.email,
    name: params.name,
    avatarUrl: params.avatarUrl,
    globalRole,
  });

  await authRepository.createOauthAccount({
    provider: params.provider,
    providerAccountId: params.providerAccountId,
    userId: user.id,
  });

  return user;
}

// ─── Token Management ─────────────────────────────────────────────────────────

async function createAuthTokens(user: User): Promise<AuthTokens> {
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.globalRole as GlobalRole,
  });

  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * MS_IN_SECOND,
  );

  const session = await authRepository.createSession({
    userId: user.id,
    expiresAt,
  });

  return { accessToken, refreshTokenId: session.id };
}

async function refreshAuthTokens(
  refreshTokenId: string,
): Promise<AuthTokens | null> {
  const session = await authRepository.findSessionById(refreshTokenId);
  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await authRepository.deleteSession(session.id);
    return null;
  }

  const user = await authRepository.findUserById(session.userId);
  if (!user) {
    await authRepository.deleteSession(session.id);
    return null;
  }

  if (user.isBanned) {
    await authRepository.deleteAllUserSessions(user.id);
    return null;
  }

  // Rotate: delete old session, create new
  await authRepository.deleteSession(session.id);

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.globalRole as GlobalRole,
  });

  const newExpiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * MS_IN_SECOND,
  );

  const newSession = await authRepository.createSession({
    userId: user.id,
    expiresAt: newExpiresAt,
  });

  return { accessToken, refreshTokenId: newSession.id };
}

async function logout(refreshTokenId: string): Promise<void> {
  await authRepository.deleteSession(refreshTokenId);
}

async function logoutAll(userId: string): Promise<number> {
  return authRepository.deleteAllUserSessions(userId);
}

// ─── Session Data ─────────────────────────────────────────────────────────────

async function getSessionData(userId: string): Promise<SessionData | null> {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    return null;
  }

  const customPermissions =
    await authRepository.getUserAdminPermissions(userId);

  const permissions = resolveAdminPermissions(
    user.globalRole as GlobalRole,
    customPermissions,
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      globalRole: user.globalRole as GlobalRole,
      isBanned: user.isBanned,
      bannedReason: user.bannedReason,
      permissions,
    },
  };
}

// ─── User Management ──────────────────────────────────────────────────────────

async function banUser(params: BanUserParams): Promise<User> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  const targetRole = target.globalRole as GlobalRole;
  if (GLOBAL_ROLE_HIERARCHY[params.actorRole] <= GLOBAL_ROLE_HIERARCHY[targetRole]) {
    throw new Error("Cannot ban user with equal or higher role");
  }

  // Ban: set flag, downgrade to user, clear custom permissions, kill sessions
  await authRepository.updateUser(target.id, {
    isBanned: true,
    bannedAt: new Date(),
    bannedReason: params.reason,
    globalRole: "user",
  });

  await authRepository.deleteUserAdminPermissions(target.id);
  await authRepository.deleteAllUserSessions(target.id);

  const updated = await authRepository.findUserById(target.id);
  if (!updated) {
    throw new Error("User not found after ban");
  }
  return updated;
}

async function unbanUser(params: UnbanUserParams): Promise<User> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  if (!target.isBanned) {
    throw new Error("User is not banned");
  }

  await authRepository.updateUser(target.id, {
    isBanned: false,
    bannedAt: null,
    bannedReason: null,
  });

  const updated = await authRepository.findUserById(target.id);
  if (!updated) {
    throw new Error("User not found after unban");
  }
  return updated;
}

async function setUserRole(params: SetRoleParams): Promise<User> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  const targetRole = target.globalRole as GlobalRole;
  if (GLOBAL_ROLE_HIERARCHY[params.actorRole] <= GLOBAL_ROLE_HIERARCHY[targetRole]) {
    throw new Error("Cannot change role of user with equal or higher role");
  }

  if (GLOBAL_ROLE_HIERARCHY[params.actorRole] <= GLOBAL_ROLE_HIERARCHY[params.newRole]) {
    throw new Error("Cannot assign role equal to or higher than your own");
  }

  if (params.newRole === "owner") {
    throw new Error("Cannot assign owner role");
  }

  // Reset custom permissions when role changes
  await authRepository.deleteUserAdminPermissions(target.id);

  await authRepository.updateUser(target.id, {
    globalRole: params.newRole,
  });

  // Kill sessions so new role takes effect immediately on next refresh
  await authRepository.deleteAllUserSessions(target.id);

  const updated = await authRepository.findUserById(target.id);
  if (!updated) {
    throw new Error("User not found after role change");
  }
  return updated;
}

async function setUserPermissions(
  params: SetPermissionsParams,
): Promise<AdminPermission[]> {
  const target = await authRepository.findUserById(params.targetUserId);
  if (!target) {
    throw new Error("User not found");
  }

  const targetRole = target.globalRole as GlobalRole;

  if (targetRole === "user") {
    throw new Error("Cannot assign admin permissions to user role");
  }

  if (
    GLOBAL_ROLE_HIERARCHY[params.actorRole]
    <= GLOBAL_ROLE_HIERARCHY[targetRole]
  ) {
    throw new Error(
      "Cannot set permissions for user with equal or higher role",
    );
  }

  // Validate: actor can only grant permissions they themselves have
  for (const permission of params.permissions) {
    if (!params.actorPermissions.includes(permission)) {
      throw new Error(
        `Cannot grant permission "${permission}" — you don't have it`,
      );
    }
  }

  await authRepository.setUserAdminPermissions(
    target.id,
    params.permissions,
    params.actorId,
  );

  // Kill sessions so new permissions take effect on next refresh
  await authRepository.deleteAllUserSessions(target.id);

  return authRepository.getUserAdminPermissions(target.id);
}

// ─── Export ───────────────────────────────────────────────────────────────────

const authService = {
  findOrCreateUserFromOAuth,
  createAuthTokens,
  refreshAuthTokens,
  logout,
  logoutAll,
  getSessionData,
  banUser,
  unbanUser,
  setUserRole,
  setUserPermissions,
};

export type { AuthTokens, SessionData };
export { authService };
```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.table.ts

```
import { GLOBAL_ROLES } from "@packages/contract/role";
import { createId } from "@packages/util/id";
import { boolean, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

const globalRoleEnum = pgEnum("global_role", GLOBAL_ROLES);

const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  globalRole: globalRoleEnum("global_role").notNull().default("user"),
  isBanned: boolean("is_banned").notNull().default(false),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
  bannedReason: text("banned_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

const oauthAccountsTable = pgTable(
  "oauth_accounts",
  {
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    userId: text("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    unique("unique_oauth_provider_account").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

const sessionsTable = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

const userAdminPermissionsTable = pgTable(
  "user_admin_permissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    permission: text("permission").notNull(),
    grantedBy: text("granted_by").references(() => usersTable.id),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("unique_user_admin_permission").on(table.userId, table.permission),
  ],
);

export {
  globalRoleEnum,
  oauthAccountsTable,
  sessionsTable,
  userAdminPermissionsTable,
  usersTable,
}
```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.v1.ts

```
import { generateCodeVerifier, generateState } from "arctic";
import { Elysia } from "elysia";

import { env } from "#api/shared/config/env";
import { HTTP_STATUS } from "#api/shared/config/http-status";

import { clearAuthCookies, setAuthCookies } from "./auth.cookie";
import { authPlugin, requireAuth } from "./auth.middleware";
import { fetchGoogleUserInfo, google } from "./auth.oauth";
import { authService } from "./auth.service";

const OAUTH_STATE_COOKIE_MAX_AGE = 600; // 10 min
const OAUTH_STATE_SEPARATOR = "|";

export const authV1 = new Elysia({ prefix: "/v1/auth" })
  .use(authPlugin)
  .onError(({ error, set }) => {
    // biome-ignore lint/suspicious/noConsole: Auth error logging
    console.error("❌ [auth] Route error:", error);
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })

  // ─── Google OAuth Start ─────────────────────────────────────────────────────
  .get("/google", async ({ query, cookie, set }) => {
    const origin = (query.origin as string) || env.HUB_URL;
    const redirect = (query.redirect as string) || "/";

    const state = `${generateState()}${OAUTH_STATE_SEPARATOR}${origin}${OAUTH_STATE_SEPARATOR}${redirect}`;
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);

    cookie.oauth_state?.set({
      value: state,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/v1/auth",
      maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
    });

    cookie.oauth_code_verifier?.set({
      value: codeVerifier,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/v1/auth",
      maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
    });

    set.redirect = url.toString();
  })

  // ─── Google OAuth Callback ──────────────────────────────────────────────────
  .get("/google/callback", async ({ query, cookie, set }) => {
    const code = query.code as string | undefined;
    const stateParam = query.state as string | undefined;
    const storedState = cookie.oauth_state?.value;
    const codeVerifier = cookie.oauth_code_verifier?.value;

    // Clean up OAuth cookies
    cookie.oauth_state?.set({ value: "", path: "/v1/auth", maxAge: 0 });
    cookie.oauth_code_verifier?.set({
      value: "",
      path: "/v1/auth",
      maxAge: 0,
    });

    if (!(code && stateParam && storedState && codeVerifier)) {
      set.redirect = `${env.HUB_URL}/login?error=UNAUTHORIZED`;
      return;
    }

    if (stateParam !== storedState) {
      set.redirect = `${env.HUB_URL}/login?error=UNAUTHORIZED`;
      return;
    }

    const [, origin, redirect] = stateParam.split(OAUTH_STATE_SEPARATOR);
    const targetOrigin = origin || env.HUB_URL;
    const targetRedirect = redirect || "/";

    try {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier);
      const googleUser = await fetchGoogleUserInfo(tokens.accessToken());

      const user = await authService.findOrCreateUserFromOAuth({
        provider: "google",
        providerAccountId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
      });

      if (user.isBanned) {
        set.redirect = `${targetOrigin}/login?error=BANNED`;
        return;
      }

      const authTokens = await authService.createAuthTokens(user);
      setAuthCookies(cookie, authTokens.accessToken, authTokens.refreshTokenId);

      set.redirect = `${targetOrigin}${targetRedirect}`;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: OAuth error logging
      console.error("❌ [auth] Google callback error:", error);
      set.redirect = `${targetOrigin}/login?error=UNKNOWN`;
    }
  })

  // ─── Session ────────────────────────────────────────────────────────────────
  .get("/session", async ({ authUser }) => {
    if (!authUser) {
      return { user: null };
    }

    const session = await authService.getSessionData(authUser.sub);
    if (!session) {
      return { user: null };
    }

    return session;
  })

  // ─── Refresh ────────────────────────────────────────────────────────────────
  .post("/refresh", async ({ cookie, set }) => {
    const refreshTokenId = cookie.refresh_token?.value;
    if (!refreshTokenId) {
      clearAuthCookies(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED", message: "No refresh token" };
    }

    const result = await authService.refreshAuthTokens(refreshTokenId);
    if (!result) {
      clearAuthCookies(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "SESSION_EXPIRED", message: "Session expired" };
    }

    setAuthCookies(cookie, result.accessToken, result.refreshTokenId);
    return { success: true };
  })

  // ─── Logout ─────────────────────────────────────────────────────────────────
  .post("/logout", async ({ cookie }) => {
    const refreshTokenId = cookie.refresh_token?.value;
    if (refreshTokenId) {
      await authService.logout(refreshTokenId);
    }

    clearAuthCookies(cookie);
    return { success: true };
  })

  // ─── Logout All ─────────────────────────────────────────────────────────────
  .use(requireAuth())
  .post("/logout-all", async ({ authUser, cookie }) => {
    if (!authUser) {
      return { success: false };
    }

    const count = await authService.logoutAll(authUser.sub);
    clearAuthCookies(cookie);
    return { success: true, sessionsRevoked: count };
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/user.v1.ts

```
import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import { ADMIN_PERMISSIONS } from "@packages/contract/permission";
import { GLOBAL_ROLES } from "@packages/contract/role";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { authPlugin, requirePermission } from "./auth.middleware";
import { authRepository } from "./auth.repository";
import { authService } from "./auth.service";

const validAdminPermissions = new Set<string>(ADMIN_PERMISSIONS);
const validGlobalRoles = new Set<string>(GLOBAL_ROLES);

export const userV1 = new Elysia({ prefix: "/v1/users" })
  .use(authPlugin)
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })

  // ─── List Users ─────────────────────────────────────────────────────────────
  .use(requirePermission("admin.user.read"))
  .get("/", () => authRepository.getAllUsers())

  // ─── Get User ───────────────────────────────────────────────────────────────
  .get("/:id", async ({ params, set }) => {
    const user = await authRepository.findUserById(params.id);
    if (!user) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "User not found" };
    }

    const permissions = await authRepository.getUserAdminPermissions(user.id);
    return { ...user, permissions };
  })

  // ─── Set Role ───────────────────────────────────────────────────────────────
  .patch("/:id/role", async ({ params, body, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const { role } = body as { role?: string };
    if (!(role && validGlobalRoles.has(role))) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid role" };
    }

    try {
      const user = await authService.setUserRole({
        actorRole: authUser.role,
        targetUserId: params.id,
        newRole: role as GlobalRole,
      });
      return user;
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: error instanceof Error ? error.message : "Failed to set role",
      };
    }
  })

  // ─── Ban User ───────────────────────────────────────────────────────────────
  .post("/:id/ban", async ({ params, body, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const { reason } = body as { reason?: string };

    try {
      const user = await authService.banUser({
        actorRole: authUser.role,
        targetUserId: params.id,
        reason: reason ?? "No reason provided",
      });
      return user;
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: error instanceof Error ? error.message : "Failed to ban user",
      };
    }
  })

  // ─── Unban User ─────────────────────────────────────────────────────────────
  .post("/:id/unban", async ({ params, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    try {
      const user = await authService.unbanUser({
        actorRole: authUser.role,
        targetUserId: params.id,
      });
      return user;
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: error instanceof Error ? error.message : "Failed to unban user",
      };
    }
  })

  // ─── Get User Permissions ───────────────────────────────────────────────────
  .get("/:id/permissions", async ({ params, set }) => {
    const user = await authRepository.findUserById(params.id);
    if (!user) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "User not found" };
    }

    const permissions = await authRepository.getUserAdminPermissions(user.id);
    return { userId: user.id, permissions };
  })

  // ─── Set User Permissions ──────────────────────────────────────────────────
  .put("/:id/permissions", async ({ params, body, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const { permissions } = body as { permissions?: string[] };

    if (!Array.isArray(permissions)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "permissions must be an array" };
    }

    for (const p of permissions) {
      if (!validAdminPermissions.has(p)) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: `Invalid permission: ${p}` };
      }
    }

    try {
      const result = await authService.setUserPermissions({
        actorId: authUser.sub,
        actorRole: authUser.role,
        actorPermissions: authUser.permissions,
        targetUserId: params.id,
        permissions: permissions as AdminPermission[],
      });
      return { userId: params.id, permissions: result };
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error:
          error instanceof Error ? error.message : "Failed to set permissions",
      };
    }
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke/joke-uniqueness.util.ts

```
import { createHash } from "node:crypto";

/**
 * Normalizes text for uniqueness comparison:
 * - lowercase
 * - remove punctuation
 * - collapse whitespace
 * - trim
 */
function normalizeTextForHash(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function computeUniquenessHash(segments: { text: string }[]): string {
  const combined = segments.map((s) => normalizeTextForHash(s.text)).join(" ");
  return createHash("sha256").update(combined).digest("hex");
}

export { computeUniquenessHash, normalizeTextForHash };

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke/joke.repository.ts

```
import type { InferSelectModel } from "drizzle-orm";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import {
  jokeAudiosTable,
  jokesTable,
  jokeTagsTable,
  jokeTranslationsTable,
} from "./joke.table";

type Joke = InferSelectModel<typeof jokesTable>;
type JokeTranslation = InferSelectModel<typeof jokeTranslationsTable>;
type JokeAudio = InferSelectModel<typeof jokeAudiosTable>;
type JokeStatus = "draft" | "review" | "approved";

type JokeWithDetails = Joke & {
  translations: JokeTranslation[];
  tagIds: string[];
  audios: JokeAudio[];
};

type GetJokesParams = {
  query?: string;
  languageCode?: string;
  tagIds?: string[];
  status?: string;
  hasExplicitContent?: boolean;
  limit?: number;
  offset?: number;
};

type JokeRelations = {
  translations: JokeTranslation[];
  tags: { jokeId: string; tagId: string }[];
  audios: JokeAudio[];
};

const DEFAULT_LIMIT = 50;

async function fetchJokesWithRelations(
  params: GetJokesParams,
): Promise<JokeWithDetails[]> {
  const limit = params.limit ?? DEFAULT_LIMIT;
  const offset = params.offset ?? 0;

  const jokes = await db
    .select()
    .from(jokesTable)
    .orderBy(desc(jokesTable.createdAt))
    .limit(limit)
    .offset(offset);

  if (jokes.length === 0) {
    return [];
  }

  const jokeIds = jokes.map((j) => j.id);
  const relations = await fetchRelations(jokeIds);

  return assembleJokeDetails(jokes, relations);
}

async function fetchRelations(jokeIds: string[]): Promise<JokeRelations> {
  const [translations, tags] = await Promise.all([
    db
      .select()
      .from(jokeTranslationsTable)
      .where(inArray(jokeTranslationsTable.jokeId, jokeIds)),
    db
      .select()
      .from(jokeTagsTable)
      .where(inArray(jokeTagsTable.jokeId, jokeIds)),
  ]);

  const translationIds = translations.map((t) => t.id);
  const audios =
    translationIds.length > 0
      ? await db
          .select()
          .from(jokeAudiosTable)
          .where(inArray(jokeAudiosTable.jokeTranslationId, translationIds))
      : [];

  return { translations, tags, audios };
}

function assembleJokeDetails(
  jokes: Joke[],
  relations: JokeRelations,
): JokeWithDetails[] {
  const translationsByJoke = groupBy(relations.translations, "jokeId");
  const tagsByJoke = groupBy(relations.tags, "jokeId");
  const audiosByTranslation = groupBy(relations.audios, "jokeTranslationId");

  return jokes.map((joke) => {
    const jokeTranslations = translationsByJoke.get(joke.id) ?? [];
    const jokeTags = tagsByJoke.get(joke.id) ?? [];
    const jokeAudios = jokeTranslations.flatMap(
      (t) => audiosByTranslation.get(t.id) ?? [],
    );

    return {
      ...joke,
      translations: jokeTranslations,
      tagIds: jokeTags.map((t) => t.tagId),
      audios: jokeAudios,
    };
  });
}

function applyInMemoryFilters(
  results: JokeWithDetails[],
  params: GetJokesParams,
): JokeWithDetails[] {
  let filtered = results;

  if (params.status) {
    filtered = filtered.filter((j) => j.status === params.status);
  }
  if (params.hasExplicitContent !== undefined) {
    filtered = filtered.filter(
      (j) => j.hasExplicitContent === params.hasExplicitContent,
    );
  }
  if (params.tagIds && params.tagIds.length > 0) {
    const filterTags = new Set(params.tagIds);
    filtered = filtered.filter((j) => j.tagIds.some((t) => filterTags.has(t)));
  }
  if (params.query && params.languageCode) {
    const q = params.query.toLowerCase();
    const lang = params.languageCode;
    filtered = filtered.filter((j) =>
      j.translations.some(
        (t) => t.languageCode === lang && t.plainText.toLowerCase().includes(q),
      ),
    );
  }

  return filtered;
}

const jokeRepository = {
  async getAll(params: GetJokesParams): Promise<JokeWithDetails[]> {
    const results = await fetchJokesWithRelations(params);
    return applyInMemoryFilters(results, params);
  },

  async getById(id: string): Promise<JokeWithDetails | null> {
    const [joke] = await db
      .select()
      .from(jokesTable)
      .where(eq(jokesTable.id, id))
      .limit(1);

    if (!joke) {
      return null;
    }

    const [translations, tags] = await Promise.all([
      db
        .select()
        .from(jokeTranslationsTable)
        .where(eq(jokeTranslationsTable.jokeId, id)),
      db.select().from(jokeTagsTable).where(eq(jokeTagsTable.jokeId, id)),
    ]);

    const translationIds = translations.map((t) => t.id);
    const audios =
      translationIds.length > 0
        ? await db
            .select()
            .from(jokeAudiosTable)
            .where(inArray(jokeAudiosTable.jokeTranslationId, translationIds))
        : [];

    return {
      ...joke,
      translations,
      tagIds: tags.map((t) => t.tagId),
      audios,
    };
  },

  async create(data: {
    originalLanguageCode: string;
    hasExplicitContent: boolean;
    humorRating: number | null;
  }): Promise<Joke> {
    const [row] = await db.insert(jokesTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create joke");
    }
    return row;
  },

  async updateJoke(
    id: string,
    data: Partial<{
      status: JokeStatus;
      hasExplicitContent: boolean;
      humorRating: number | null;
    }>,
  ): Promise<Joke | null> {
    const [row] = await db
      .update(jokesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jokesTable.id, id))
      .returning();
    return row ?? null;
  },

  async createTranslation(data: {
    jokeId: string;
    languageCode: string;
    segments: { role: string; text: string }[];
    plainText: string;
    uniquenessHash: string;
  }): Promise<JokeTranslation> {
    const [row] = await db
      .insert(jokeTranslationsTable)
      .values(data)
      .returning();
    if (!row) {
      throw new Error("Failed to create translation");
    }
    return row;
  },

  async findTranslationByHash(hash: string): Promise<JokeTranslation | null> {
    const [row] = await db
      .select()
      .from(jokeTranslationsTable)
      .where(eq(jokeTranslationsTable.uniquenessHash, hash))
      .limit(1);
    return row ?? null;
  },

  async setTags(jokeId: string, tagIds: string[]): Promise<void> {
    await db.delete(jokeTagsTable).where(eq(jokeTagsTable.jokeId, jokeId));

    if (tagIds.length > 0) {
      await db
        .insert(jokeTagsTable)
        .values(tagIds.map((tagId) => ({ jokeId, tagId })));
    }
  },

  async createAudio(data: {
    jokeTranslationId: string;
    isPlatformDefault: boolean;
    voiceConfig: Record<string, string>;
    fileKey: string;
    durationMs: number;
  }): Promise<JokeAudio> {
    const [row] = await db.insert(jokeAudiosTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create joke audio");
    }
    return row;
  },

  async deleteJoke(id: string): Promise<boolean> {
    const rows = await db
      .delete(jokesTable)
      .where(eq(jokesTable.id, id))
      .returning({ id: jokesTable.id });
    return rows.length > 0;
  },
};

function groupBy<T>(items: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = String(item[key]);
    const list = map.get(k) ?? [];
    list.push(item);
    map.set(k, list);
  }
  return map;
}

export type {
  GetJokesParams,
  Joke,
  JokeAudio,
  JokeStatus,
  JokeTranslation,
  JokeWithDetails,
};
export { jokeRepository };

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke/joke.table.ts

```
import { createId } from "@packages/util/id";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { languagesTable } from "#api/feature/language/language.table";
import { tagsTable } from "#api/feature/tag/tag.table";

export const jokeStatusEnum = pgEnum("joke_status", [
  "draft",
  "review",
  "approved",
]);

export const jokeTranslationStatusEnum = pgEnum("joke_translation_status", [
  "draft",
  "approved",
]);

export const jokesTable = pgTable("jokes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  originalLanguageCode: text("original_language_code")
    .references(() => languagesTable.code)
    .notNull(),
  status: jokeStatusEnum("status").notNull().default("draft"),
  hasExplicitContent: boolean("has_explicit_content").notNull().default(false),
  humorRating: integer("humor_rating"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jokeTranslationsTable = pgTable(
  "joke_translations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    jokeId: text("joke_id")
      .references(() => jokesTable.id, { onDelete: "cascade" })
      .notNull(),
    languageCode: text("language_code")
      .references(() => languagesTable.code)
      .notNull(),
    segments: jsonb("segments")
      .notNull()
      .$type<{ role: string; text: string }[]>(),
    plainText: text("plain_text").notNull(),
    uniquenessHash: text("uniqueness_hash").notNull(),
    status: jokeTranslationStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("unique_joke_language").on(table.jokeId, table.languageCode),
  ],
);

export const jokeAudiosTable = pgTable("joke_audios", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  jokeTranslationId: text("joke_translation_id")
    .references(() => jokeTranslationsTable.id, { onDelete: "cascade" })
    .notNull(),
  isPlatformDefault: boolean("is_platform_default").notNull().default(false),
  voiceConfig: jsonb("voice_config").notNull().$type<Record<string, string>>(),
  fileKey: text("file_key").notNull(),
  durationMs: integer("duration_ms").notNull(),
  transcription: jsonb("transcription").$type<
    { start: number; end: number; text: string }[] | null
  >(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jokeTagsTable = pgTable(
  "joke_tags",
  {
    jokeId: text("joke_id")
      .references(() => jokesTable.id, { onDelete: "cascade" })
      .notNull(),
    tagId: text("tag_id")
      .references(() => tagsTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [unique("unique_joke_tag").on(table.jokeId, table.tagId)],
);

export const contentUsagesTable = pgTable(
  "content_usages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    channelIdentifier: text("channel_identifier").notNull(),
    contentId: text("content_id").notNull(),
    contentType: text("content_type").notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("unique_channel_content").on(
      table.channelIdentifier,
      table.contentId,
      table.contentType,
    ),
  ],
);

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke/joke.v1.ts

```
import type { JokeStatus } from "@packages/contract/joke";

import { JOKE_HUMOR_RATING, JOKE_STATUSES } from "@packages/contract/joke";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { jokeRepository } from "./joke.repository";
import { computeUniquenessHash } from "./joke-uniqueness.util";

function parseHasExplicitContent(
  value: string | undefined,
): boolean | undefined {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return;
}

function isValidJokeStatus(value: string): value is JokeStatus {
  return (JOKE_STATUSES as readonly string[]).includes(value);
}

function clampHumorRating(humorRating: number | undefined): number | null {
  if (humorRating === undefined) {
    return null;
  }
  return Math.max(
    JOKE_HUMOR_RATING.min,
    Math.min(JOKE_HUMOR_RATING.max, humorRating),
  );
}

export const jokeV1 = new Elysia({ prefix: "/v1/jokes" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", ({ query }) => {
    const params = {
      query: (query.query as string) || undefined,
      languageCode: (query.languageCode as string) || undefined,
      tagIds: query.tagIds
        ? String(query.tagIds).split(",").filter(Boolean)
        : undefined,
      status: (query.status as string) || undefined,
      hasExplicitContent: parseHasExplicitContent(
        query.hasExplicitContent as string | undefined,
      ),
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    };

    return jokeRepository.getAll(params);
  })
  .get("/:id", async ({ params, set }) => {
    const joke = await jokeRepository.getById(params.id);
    if (!joke) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }
    return joke;
  })
  .post("/", async ({ body, set }) => {
    const {
      originalLanguageCode,
      segments,
      hasExplicitContent,
      humorRating,
      tagIds,
    } = body as {
      originalLanguageCode?: string;
      segments?: { role: string; text: string }[];
      hasExplicitContent?: boolean;
      humorRating?: number;
      tagIds?: string[];
    };

    if (!originalLanguageCode) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "originalLanguageCode is required" };
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "segments array is required" };
    }

    for (const seg of segments) {
      if (!(seg.role?.trim() && seg.text?.trim())) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: "Each segment must have role and text" };
      }
    }

    const validRating = clampHumorRating(humorRating);

    const hash = computeUniquenessHash(segments);
    const existing = await jokeRepository.findTranslationByHash(hash);
    if (existing) {
      set.status = HTTP_STATUS.CONFLICT;
      return {
        error: "Duplicate joke detected",
        existingJokeId: existing.jokeId,
      };
    }

    const joke = await jokeRepository.create({
      originalLanguageCode,
      hasExplicitContent: hasExplicitContent ?? false,
      humorRating: validRating,
    });

    const plainText = segments.map((s) => s.text.trim()).join(" ");
    await jokeRepository.createTranslation({
      jokeId: joke.id,
      languageCode: originalLanguageCode,
      segments: segments.map((s) => ({
        role: s.role.trim(),
        text: s.text.trim(),
      })),
      plainText,
      uniquenessHash: hash,
    });

    if (tagIds && tagIds.length > 0) {
      await jokeRepository.setTags(joke.id, tagIds);
    }

    const result = await jokeRepository.getById(joke.id);
    set.status = HTTP_STATUS.CREATED;
    return result;
  })
  .patch("/:id", async ({ params, body, set }) => {
    const { status, hasExplicitContent, humorRating, tagIds } = body as {
      status?: string;
      hasExplicitContent?: boolean;
      humorRating?: number;
      tagIds?: string[];
    };

    const updateData: Partial<{
      status: "draft" | "review" | "approved";
      hasExplicitContent: boolean;
      humorRating: number | null;
    }> = {};

    if (status !== undefined) {
      if (!isValidJokeStatus(status)) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: "Invalid status" };
      }
      updateData.status = status;
    }

    if (hasExplicitContent !== undefined) {
      updateData.hasExplicitContent = hasExplicitContent;
    }

    if (humorRating !== undefined) {
      updateData.humorRating = Math.max(
        JOKE_HUMOR_RATING.min,
        Math.min(JOKE_HUMOR_RATING.max, humorRating),
      );
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await jokeRepository.updateJoke(params.id, updateData);
      if (!updated) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "Joke not found" };
      }
    }

    if (tagIds !== undefined) {
      await jokeRepository.setTags(params.id, tagIds);
    }

    const result = await jokeRepository.getById(params.id);
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }

    return result;
  })
  .post("/:id/translations", async ({ params, body, set }) => {
    const { languageCode, segments } = body as {
      languageCode?: string;
      segments?: { role: string; text: string }[];
    };

    if (!languageCode) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "languageCode is required" };
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "segments array is required" };
    }

    for (const seg of segments) {
      if (!(seg.role?.trim() && seg.text?.trim())) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: "Each segment must have role and text" };
      }
    }

    const joke = await jokeRepository.getById(params.id);
    if (!joke) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }

    const existingTranslation = joke.translations.find(
      (t) => t.languageCode === languageCode,
    );
    if (existingTranslation) {
      set.status = HTTP_STATUS.CONFLICT;
      return {
        error: `Translation for language "${languageCode}" already exists`,
      };
    }

    const hash = computeUniquenessHash(segments);
    const duplicate = await jokeRepository.findTranslationByHash(hash);
    if (duplicate) {
      set.status = HTTP_STATUS.CONFLICT;
      return {
        error: "Duplicate translation detected",
        existingJokeId: duplicate.jokeId,
        existingLanguageCode: duplicate.languageCode,
      };
    }

    const plainText = segments.map((s) => s.text.trim()).join(" ");
    const translation = await jokeRepository.createTranslation({
      jokeId: params.id,
      languageCode,
      segments: segments.map((s) => ({
        role: s.role.trim(),
        text: s.text.trim(),
      })),
      plainText,
      uniquenessHash: hash,
    });

    set.status = HTTP_STATUS.CREATED;
    return translation;
  })
  .delete("/:id", async ({ params, set }) => {
    const deleted = await jokeRepository.deleteJoke(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Joke not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke-tts/joke-tts.repository.ts

```
import type { JokeTtsPipelineStatus } from "@packages/contract/joke-tts";

import type { JokeTtsPipeline } from "./joke-tts.type";

import { desc, eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { jokeTtsPipelinesTable } from "./joke-tts.table";

const jokeTtsRepository = {
  getAll(): Promise<JokeTtsPipeline[]> {
    return db
      .select()
      .from(jokeTtsPipelinesTable)
      .orderBy(desc(jokeTtsPipelinesTable.createdAt));
  },

  async getById(id: string): Promise<JokeTtsPipeline | null> {
    const [row] = await db
      .select()
      .from(jokeTtsPipelinesTable)
      .where(eq(jokeTtsPipelinesTable.id, id))
      .limit(1);
    return row ?? null;
  },

  getByTranslationId(translationId: string): Promise<JokeTtsPipeline[]> {
    return db
      .select()
      .from(jokeTtsPipelinesTable)
      .where(eq(jokeTtsPipelinesTable.jokeTranslationId, translationId))
      .orderBy(desc(jokeTtsPipelinesTable.createdAt));
  },

  async create(data: {
    jokeTranslationId: string;
    voiceConfig: Record<string, string>;
  }): Promise<JokeTtsPipeline> {
    const [row] = await db
      .insert(jokeTtsPipelinesTable)
      .values({
        jokeTranslationId: data.jokeTranslationId,
        voiceConfig: data.voiceConfig,
        status: "pending",
      })
      .returning();
    if (!row) {
      throw new Error("Failed to create joke TTS pipeline");
    }
    return row;
  },

  async updateStatus(
    id: string,
    status: JokeTtsPipelineStatus,
    extra?: Partial<{
      ttsProjectId: string;
      jokeAudioId: string;
      errorMessage: string | null;
      completedAt: Date;
    }>,
  ): Promise<JokeTtsPipeline | null> {
    const [row] = await db
      .update(jokeTtsPipelinesTable)
      .set({
        status,
        updatedAt: new Date(),
        ...extra,
      })
      .where(eq(jokeTtsPipelinesTable.id, id))
      .returning();
    return row ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(jokeTtsPipelinesTable)
      .where(eq(jokeTtsPipelinesTable.id, id))
      .returning({ id: jokeTtsPipelinesTable.id });
    return rows.length > 0;
  },
};

export { jokeTtsRepository };

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke-tts/joke-tts.service.ts

```
import type { JokeTtsPipeline } from "./joke-tts.type";

import { STORAGE_PREFIXES } from "@packages/contract/storage";

import { jokeRepository } from "#api/feature/joke/joke.repository";
import { ttsProjectService } from "#api/feature/tts-project/tts-project.service";
import { storage } from "#api/shared/storage/storage";

import { jokeTtsRepository } from "./joke-tts.repository";

type StartPipelineParams = {
  jokeTranslationId: string;
  voiceConfig: Record<string, string>;
  isPlatformDefault?: boolean;
};

type StartPipelineResult = {
  pipelineId: string;
  status: string;
  ttsProjectId: string | null;
};

type PipelineWithDetails = JokeTtsPipeline & {
  audioDownloadUrl: string | null;
  ttsProject: unknown;
};

const DOWNLOAD_EXPIRY_SECONDS = 86_400;

async function startPipeline(
  params: StartPipelineParams,
): Promise<StartPipelineResult> {
  const pipeline = await jokeTtsRepository.create({
    jokeTranslationId: params.jokeTranslationId,
    voiceConfig: params.voiceConfig,
  });

  setImmediate(() => {
    executePipeline(pipeline.id, params).catch((err) => {
      // biome-ignore lint/suspicious/noConsole: background task error logging
      console.error(`[joke-tts] Pipeline ${pipeline.id} failed:`, err);
    });
  });

  return {
    pipelineId: pipeline.id,
    status: pipeline.status,
    ttsProjectId: null,
  };
}

async function executePipeline(
  pipelineId: string,
  params: StartPipelineParams,
): Promise<void> {
  try {
    await jokeTtsRepository.updateStatus(pipelineId, "creating_tasks");

    const translation = await findTranslationOrThrow(params.jokeTranslationId);
    const segments = buildTtsSegments(translation.segments, params.voiceConfig);

    const projectResult = await ttsProjectService.createProject({
      name: `joke-tts-${pipelineId}`,
      segments,
      audioProcessing: {
        enabled: true,
        concatenate: true,
        config: {},
      },
    });

    await jokeTtsRepository.updateStatus(pipelineId, "synthesizing", {
      ttsProjectId: projectResult.projectId,
    });

    await waitForProjectCompletion(projectResult.projectId, pipelineId);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    await jokeTtsRepository.updateStatus(pipelineId, "failed", {
      errorMessage: errorMsg,
    });
  }
}

async function findTranslationOrThrow(
  translationId: string,
): Promise<{ segments: { role: string; text: string }[] }> {
  const jokes = await jokeRepository.getAll({});
  for (const joke of jokes) {
    const translation = joke.translations.find((t) => t.id === translationId);
    if (translation) {
      return translation;
    }
  }
  throw new Error(`Translation ${translationId} not found`);
}

function buildTtsSegments(
  segments: { role: string; text: string }[],
  voiceConfig: Record<string, string>,
): { role: string; text: string; voiceId: string }[] {
  return segments.map((seg) => {
    const voiceId = voiceConfig[seg.role];
    if (!voiceId) {
      throw new Error(`No voice configured for role "${seg.role}"`);
    }
    return { role: seg.role, text: seg.text, voiceId };
  });
}

async function pollProjectStatus(
  projectId: string,
  ttsProjectRepository: {
    getById: (id: string) => Promise<{
      status: string;
      segments: { outputKey: string | null; status: string }[];
    } | null>;
  },
  pollIntervalMs: number,
): Promise<{
  status: string;
  segments: { outputKey: string | null; status: string }[];
}> {
  await sleep(pollIntervalMs);
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error(`TTS project ${projectId} not found`);
  }
  return project;
}

async function waitForProjectCompletion(
  projectId: string,
  pipelineId: string,
): Promise<void> {
  const { ttsProjectRepository } = await import(
    "#api/feature/tts-project/tts-project.repository"
  );

  const maxAttempts = 120;
  const pollIntervalMs = 5000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // biome-ignore lint/performance/noAwaitInLoops: sequential polling — each iteration must wait before checking status
    const project = await pollProjectStatus(
      projectId,
      ttsProjectRepository,
      pollIntervalMs,
    );

    if (project.status === "completed") {
      await handleProjectCompleted(pipelineId, project);
      return;
    }

    if (project.status === "failed") {
      throw new Error("TTS synthesis failed");
    }

    if (project.status === "partial") {
      throw new Error("TTS synthesis partially failed");
    }
  }

  throw new Error("TTS synthesis timed out");
}

async function handleProjectCompleted(
  pipelineId: string,
  project: {
    id?: string;
    segments: { outputKey: string | null; status: string }[];
  },
): Promise<void> {
  await jokeTtsRepository.updateStatus(pipelineId, "processing_audio");

  const completedKeys = project.segments
    .filter((s) => s.status === "completed" && s.outputKey)
    .map((s) => s.outputKey as string);

  if (completedKeys.length === 0) {
    throw new Error("No completed audio segments found");
  }

  await jokeTtsRepository.updateStatus(pipelineId, "saving");

  const pipeline = await jokeTtsRepository.getById(pipelineId);
  if (!pipeline) {
    throw new Error(`Pipeline ${pipelineId} not found`);
  }

  const jokeAudioFileKey = `${STORAGE_PREFIXES.jokeAudio(pipeline.jokeTranslationId)}${pipelineId}.mp3`;
  const sourceKey = completedKeys[0] as string;
  await storage.copyObject(sourceKey, jokeAudioFileKey);

  const stat = await storage.statObject(jokeAudioFileKey);
  const durationMs = estimateDurationFromSize(stat.size);

  const jokeAudio = await jokeRepository.createAudio({
    jokeTranslationId: pipeline.jokeTranslationId,
    isPlatformDefault: false,
    voiceConfig: pipeline.voiceConfig,
    fileKey: jokeAudioFileKey,
    durationMs,
  });

  await jokeTtsRepository.updateStatus(pipelineId, "completed", {
    jokeAudioId: jokeAudio.id,
    completedAt: new Date(),
    errorMessage: null,
  });
}

async function findAudioDownloadUrl(
  jokeAudioId: string,
): Promise<string | null> {
  const jokes = await jokeRepository.getAll({});
  const allAudios = jokes.flatMap((joke) => joke.audios);
  const audio = allAudios.find((a) => a.id === jokeAudioId);

  if (!audio) {
    return null;
  }

  try {
    return await storage.getPresignedDownloadUrl(
      audio.fileKey,
      DOWNLOAD_EXPIRY_SECONDS,
    );
  } catch {
    return null;
  }
}

async function getPipelineWithDetails(
  id: string,
): Promise<PipelineWithDetails | null> {
  const pipeline = await jokeTtsRepository.getById(id);
  if (!pipeline) {
    return null;
  }

  const audioDownloadUrl = pipeline.jokeAudioId
    ? await findAudioDownloadUrl(pipeline.jokeAudioId)
    : null;

  let ttsProject: unknown = null;
  if (pipeline.ttsProjectId) {
    const { ttsProjectRepository } = await import(
      "#api/feature/tts-project/tts-project.repository"
    );
    ttsProject = await ttsProjectRepository.getById(pipeline.ttsProjectId);
  }

  return {
    ...pipeline,
    audioDownloadUrl,
    ttsProject,
  };
}

const MP3_BITRATE_KBPS = 128;
const BITS_PER_BYTE = 8;
const MS_IN_SECOND = 1000;

function estimateDurationFromSize(sizeBytes: number): number {
  const bits = sizeBytes * BITS_PER_BYTE;
  const seconds = bits / (MP3_BITRATE_KBPS * MS_IN_SECOND);
  return Math.round(seconds * MS_IN_SECOND);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const jokeTtsService = {
  startPipeline,
  getPipelineWithDetails,
};

export { jokeTtsService };

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke-tts/joke-tts.table.ts

```
import { createId } from "@packages/util/id";
import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { jokeTranslationsTable } from "#api/feature/joke/joke.table";

export const jokeTtsPipelineStatusEnum = pgEnum("joke_tts_pipeline_status", [
  "pending",
  "creating_tasks",
  "synthesizing",
  "processing_audio",
  "saving",
  "completed",
  "failed",
]);

export const jokeTtsPipelinesTable = pgTable("joke_tts_pipelines", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  jokeTranslationId: text("joke_translation_id")
    .references(() => jokeTranslationsTable.id, { onDelete: "cascade" })
    .notNull(),
  status: jokeTtsPipelineStatusEnum("status").notNull().default("pending"),
  voiceConfig: jsonb("voice_config").notNull().$type<Record<string, string>>(),
  ttsProjectId: text("tts_project_id"),
  jokeAudioId: text("joke_audio_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke-tts/joke-tts.type.ts

```
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { jokeTtsPipelinesTable } from "./joke-tts.table";

export type JokeTtsPipeline = InferSelectModel<typeof jokeTtsPipelinesTable>;
export type JokeTtsPipelineInsert = InferInsertModel<
  typeof jokeTtsPipelinesTable
>;

```

D:/1_Projects/jstonehub/apps/api/src/feature/joke-tts/joke-tts.v1.ts

```
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { jokeTtsRepository } from "./joke-tts.repository";
import { jokeTtsService } from "./joke-tts.service";

export const jokeTtsV1 = new Elysia({ prefix: "/v1/joke-tts" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", async () => jokeTtsRepository.getAll())
  .get("/:id", async ({ params, set }) => {
    const result = await jokeTtsService.getPipelineWithDetails(params.id);
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Pipeline not found" };
    }
    return result;
  })
  .post("/", async ({ body, set }) => {
    const { jokeTranslationId, voiceConfig, isPlatformDefault } = body as {
      jokeTranslationId?: string;
      voiceConfig?: Record<string, string>;
      isPlatformDefault?: boolean;
    };

    if (!jokeTranslationId || typeof jokeTranslationId !== "string") {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "jokeTranslationId is required" };
    }

    if (
      !voiceConfig
      || typeof voiceConfig !== "object"
      || Object.keys(voiceConfig).length === 0
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "voiceConfig is required (role → voiceId mapping)" };
    }

    try {
      const result = await jokeTtsService.startPipeline({
        jokeTranslationId,
        voiceConfig,
        isPlatformDefault,
      });

      set.status = HTTP_STATUS.CREATED;
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to start pipeline",
      };
    }
  })
  .get("/by-translation/:translationId", async ({ params }) =>
    jokeTtsRepository.getByTranslationId(params.translationId),
  )
  .delete("/:id", async ({ params, set }) => {
    const deleted = await jokeTtsRepository.delete(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Pipeline not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/language/language.repository.ts

```
import type { InferSelectModel } from "drizzle-orm";

import { asc, eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { languagesTable } from "./language.table";

type Language = InferSelectModel<typeof languagesTable>;

const languageRepository = {
  getAll(): Promise<Language[]> {
    return db.select().from(languagesTable).orderBy(asc(languagesTable.name));
  },

  async getByCode(code: string): Promise<Language | null> {
    const [row] = await db
      .select()
      .from(languagesTable)
      .where(eq(languagesTable.code, code))
      .limit(1);
    return row ?? null;
  },

  async create(data: { code: string; name: string }): Promise<Language> {
    const [row] = await db.insert(languagesTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create language");
    }
    return row;
  },

  async update(
    id: string,
    data: Partial<{ name: string; isActive: boolean }>,
  ): Promise<Language | null> {
    const [row] = await db
      .update(languagesTable)
      .set(data)
      .where(eq(languagesTable.id, id))
      .returning();
    return row ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(languagesTable)
      .where(eq(languagesTable.id, id))
      .returning({ id: languagesTable.id });
    return rows.length > 0;
  },
};

export type { Language };
export { languageRepository };

```

D:/1_Projects/jstonehub/apps/api/src/feature/language/language.table.ts

```
import { createId } from "@packages/util/id";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const languagesTable = pgTable("languages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

```

D:/1_Projects/jstonehub/apps/api/src/feature/language/language.v1.ts

```
import { LANGUAGE_LIMITS } from "@packages/contract/language";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { languageRepository } from "./language.repository";

export const languageV1 = new Elysia({ prefix: "/v1/languages" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", () => languageRepository.getAll())
  .post("/", async ({ body, set }) => {
    const { code, name } = body as { code?: string; name?: string };

    if (
      !code
      || code.length < LANGUAGE_LIMITS.code.min
      || code.length > LANGUAGE_LIMITS.code.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid code" };
    }

    if (
      !name
      || name.length < LANGUAGE_LIMITS.name.min
      || name.length > LANGUAGE_LIMITS.name.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid name" };
    }

    const existing = await languageRepository.getByCode(code);
    if (existing) {
      set.status = HTTP_STATUS.CONFLICT;
      return { error: "Language code already exists" };
    }

    const language = await languageRepository.create({ code, name });
    set.status = HTTP_STATUS.CREATED;
    return language;
  })
  .patch("/:id", async ({ params, body, set }) => {
    const result = await languageRepository.update(
      params.id,
      body as Partial<{ name: string; isActive: boolean }>,
    );
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Language not found" };
    }
    return result;
  })
  .delete("/:id", async ({ params, set }) => {
    const deleted = await languageRepository.delete(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Language not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer/secret-voicer-config.service.ts

```
import type { CredentialError } from "#api/feature/secret-voicer-credential/secret-voicer-credential.type";

import { SECRET_VOICER_CACHE_TTL_MS } from "@packages/contract/secret-voicer";
import { and, eq } from "drizzle-orm";

import { browserFingerprintsTable } from "#api/feature/browser-fingerprint/browser-fingerprint.table";
import { secretVoicerCredentialRepository } from "#api/feature/secret-voicer-credential/secret-voicer-credential.repository";
import { secretVoicerCredentialsTable } from "#api/feature/secret-voicer-credential/secret-voicer-credential.table";
import { db } from "#api/shared/db/instance";

type SecretVoicerConfig = {
  credentialId: string;
  csrfToken: string;
  sessionId: string;
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
};

type CachedCredential = {
  config: SecretVoicerConfig;
  cachedAt: number;
};

type AllCredentialsCache = {
  list: SecretVoicerConfig[];
  cachedAt: number;
};

const LIST_CACHE_TTL_MS = 30_000;

let roundRobinIndex = 0;
const credentialCache = new Map<string, CachedCredential>();
let allCredentialsCache: AllCredentialsCache | null = null;

function isExpired(
  cachedAt: number,
  ttl = SECRET_VOICER_CACHE_TTL_MS,
): boolean {
  return Date.now() - cachedAt > ttl;
}

async function loadAllActiveConfigsWithFingerprint(): Promise<
  SecretVoicerConfig[]
> {
  if (
    allCredentialsCache
    && !isExpired(allCredentialsCache.cachedAt, LIST_CACHE_TTL_MS)
  ) {
    return allCredentialsCache.list;
  }

  const rows = await db
    .select({
      id: secretVoicerCredentialsTable.id,
      csrfToken: secretVoicerCredentialsTable.csrfToken,
      sessionId: secretVoicerCredentialsTable.sessionId,
      userAgent: browserFingerprintsTable.userAgent,
      platform: browserFingerprintsTable.platform,
      language: browserFingerprintsTable.language,
      languages: browserFingerprintsTable.languages,
    })
    .from(secretVoicerCredentialsTable)
    .innerJoin(
      browserFingerprintsTable,
      eq(
        secretVoicerCredentialsTable.fingerprintId,
        browserFingerprintsTable.id,
      ),
    )
    .where(
      and(
        eq(secretVoicerCredentialsTable.isActive, true),
        eq(browserFingerprintsTable.isActive, true),
      ),
    )
    .orderBy(secretVoicerCredentialsTable.createdAt);

  if (rows.length === 0) {
    throw new Error("No active Secret Voicer credentials found");
  }

  const configs: SecretVoicerConfig[] = rows.map((row) => ({
    credentialId: row.id,
    csrfToken: row.csrfToken.trim(),
    sessionId: row.sessionId.trim(),
    userAgent: row.userAgent,
    platform: row.platform,
    language: row.language,
    languages: row.languages,
  }));

  allCredentialsCache = { list: configs, cachedAt: Date.now() };
  return configs;
}

async function resolveConfig(): Promise<SecretVoicerConfig> {
  const configs = await loadAllActiveConfigsWithFingerprint();

  if (roundRobinIndex >= configs.length) {
    roundRobinIndex = 0;
  }

  const config = configs[roundRobinIndex];
  if (!config) {
    throw new Error("No active Secret Voicer credentials found");
  }

  roundRobinIndex = (roundRobinIndex + 1) % configs.length;
  return config;
}

async function resolveConfigById(
  credentialId: string,
): Promise<SecretVoicerConfig> {
  const cached = credentialCache.get(credentialId);
  if (cached && !isExpired(cached.cachedAt)) {
    return cached.config;
  }

  const rows = await db
    .select({
      id: secretVoicerCredentialsTable.id,
      csrfToken: secretVoicerCredentialsTable.csrfToken,
      sessionId: secretVoicerCredentialsTable.sessionId,
      userAgent: browserFingerprintsTable.userAgent,
      platform: browserFingerprintsTable.platform,
      language: browserFingerprintsTable.language,
      languages: browserFingerprintsTable.languages,
    })
    .from(secretVoicerCredentialsTable)
    .innerJoin(
      browserFingerprintsTable,
      eq(
        secretVoicerCredentialsTable.fingerprintId,
        browserFingerprintsTable.id,
      ),
    )
    .where(
      and(
        eq(secretVoicerCredentialsTable.id, credentialId),
        eq(secretVoicerCredentialsTable.isActive, true),
        eq(browserFingerprintsTable.isActive, true),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error(`Credential ${credentialId} not found or inactive`);
  }

  const config: SecretVoicerConfig = {
    credentialId: row.id,
    csrfToken: row.csrfToken.trim(),
    sessionId: row.sessionId.trim(),
    userAgent: row.userAgent,
    platform: row.platform,
    language: row.language,
    languages: row.languages,
  };

  credentialCache.set(credentialId, { config, cachedAt: Date.now() });
  return config;
}

async function markCredentialError(
  credentialId: string,
  error: CredentialError,
): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: Auth error logging required
  console.warn(
    `⚠️ [secret-voicer] Credential ${credentialId} marked as error: ${error.action} — ${error.message}`,
  );

  await secretVoicerCredentialRepository.markAsError(credentialId, error);
  invalidateConfigCache();
}

function invalidateConfigCache(): void {
  allCredentialsCache = null;
  credentialCache.clear();
  roundRobinIndex = 0;
}

export type { SecretVoicerConfig };
export {
  invalidateConfigCache,
  markCredentialError,
  resolveConfig,
  resolveConfigById,
};

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer/secret-voicer-external.adapter.ts

```
import type { SecretVoicerConfig } from "./secret-voicer-config.service";

import {
  SECRET_VOICER_API_URL,
  SECRET_VOICER_BASE_URL,
} from "@packages/contract/secret-voicer";

import {
  markCredentialError,
  resolveConfig,
  resolveConfigById,
} from "./secret-voicer-config.service";

type CreateTaskInput = {
  voiceId: string;
  text: string;
  rate: number;
};

type CreateTaskResult = {
  taskId: number;
  isReused: boolean;
  credentialId: string;
};

type TaskStatusResult = {
  statusCode: string;
  audioUrl: string | null;
  error: string | null;
};

type AudioDownloadPayload = {
  url: string;
  headers: Record<string, string>;
};

type GroupedVoicesResponse = {
  grouped_voices: {
    category: string;
    voices: unknown[];
  }[];
};

type FetchVoicesResult = {
  voices: unknown[];
  credentialId: string;
};

const REDIRECT_MIN = 300;
const REDIRECT_MAX = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const BODY_PREVIEW_LENGTH = 500;

function isAuthError(status: number, body: string): boolean {
  if (status === HTTP_NOT_FOUND) {
    return false;
  }
  if (status >= REDIRECT_MIN && status < REDIRECT_MAX) {
    return true;
  }
  if (status === HTTP_UNAUTHORIZED || status === HTTP_FORBIDDEN) {
    return true;
  }
  if (body.trimStart().startsWith("<")) {
    return true;
  }
  return false;
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
  const config = await resolveConfig();

  const response = await fetch(`${SECRET_VOICER_API_URL}/synthesize/`, {
    method: "POST",
    headers: buildApiHeaders(config),
    body: JSON.stringify({
      voice_id: input.voiceId,
      text: input.text,
      rate: input.rate,
    }),
  });

  const body = await safeReadBody(response);

  if (isAuthError(response.status, body)) {
    await markCredentialError(config.credentialId, {
      action: "createTask",
      statusCode: response.status,
      message: `Auth error on createTask: HTTP ${response.status}`,
      responseBody: body.slice(0, BODY_PREVIEW_LENGTH),
      occurredAt: new Date().toISOString(),
    });
    throw new Error(
      `Secret Voicer createTask auth error (${response.status}): credential ${config.credentialId} deactivated`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Secret Voicer createTask failed: HTTP ${response.status} — ${body.slice(0, BODY_PREVIEW_LENGTH)}`,
    );
  }

  const data = JSON.parse(body) as {
    task_id: number;
    is_reused: boolean;
  };

  return {
    taskId: data.task_id,
    isReused: data.is_reused,
    credentialId: config.credentialId,
  };
}

async function checkTaskStatus(
  taskId: number,
  credentialId?: string,
): Promise<TaskStatusResult> {
  const config = credentialId
    ? await resolveConfigById(credentialId)
    : await resolveConfig();

  const response = await fetch(`${SECRET_VOICER_API_URL}/task/${taskId}/`, {
    method: "GET",
    headers: buildApiHeaders(config),
    redirect: "manual",
  });

  const body = await safeReadBody(response);

  if (isAuthError(response.status, body)) {
    await markCredentialError(config.credentialId, {
      action: "checkTaskStatus",
      statusCode: response.status,
      message: `Auth error on checkTaskStatus: HTTP ${response.status}`,
      responseBody: body.slice(0, BODY_PREVIEW_LENGTH),
      occurredAt: new Date().toISOString(),
    });
    throw new Error(
      `Secret Voicer checkTaskStatus auth error (${response.status}): credential ${config.credentialId} deactivated`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Secret Voicer checkTaskStatus failed: HTTP ${response.status}`,
    );
  }

  const data = JSON.parse(body) as {
    status_code: string;
    audio_url: string | null;
    error: string | null;
  };

  return {
    statusCode: data.status_code,
    audioUrl: data.audio_url,
    error: data.error,
  };
}

async function buildAudioDownload(
  audioPath: string,
  credentialId?: string,
): Promise<AudioDownloadPayload> {
  const config = credentialId
    ? await resolveConfigById(credentialId)
    : await resolveConfig();

  const fullUrl = audioPath.startsWith("http")
    ? audioPath
    : `${SECRET_VOICER_BASE_URL}${audioPath}`;

  return {
    url: fullUrl,
    headers: {
      accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
      cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
      referer: `${SECRET_VOICER_BASE_URL}/app/`,
      "user-agent": config.userAgent,
    },
  };
}

async function fetchVoices(): Promise<FetchVoicesResult> {
  const config = await resolveConfig();

  const response = await fetch(`${SECRET_VOICER_API_URL}/voices/`, {
    headers: buildApiHeaders(config),
  });

  const body = await safeReadBody(response);

  if (isAuthError(response.status, body)) {
    await markCredentialError(config.credentialId, {
      action: "fetchVoices",
      statusCode: response.status,
      message: `Auth error on fetchVoices: HTTP ${response.status}`,
      responseBody: body.slice(0, BODY_PREVIEW_LENGTH),
      occurredAt: new Date().toISOString(),
    });
    throw new Error(
      `Secret Voicer fetchVoices auth error (${response.status}): credential ${config.credentialId} deactivated`,
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: HTTP ${response.status}`);
  }

  const data = JSON.parse(body) as GroupedVoicesResponse;

  const voices = data.grouped_voices.flatMap((group) => group.voices);

  return { voices, credentialId: config.credentialId };
}

function buildApiHeaders(config: SecretVoicerConfig): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": config.language,
    "content-type": "application/json",
    cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
    origin: SECRET_VOICER_BASE_URL,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": config.userAgent,
    "x-csrftoken": config.csrfToken,
  };
}

const secretVoicerExternalAdapter = {
  createTask,
  checkTaskStatus,
  buildAudioDownload,
  fetchVoices,
};

export { secretVoicerExternalAdapter };

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer/secret-voicer-preview.service.ts

```
import { STORAGE_PREFIXES } from "@packages/contract/storage";

import { storage } from "#api/shared/storage/storage";

import {
  markCredentialError,
  resolveConfig,
} from "./secret-voicer-config.service";

const PREVIEW_DOWNLOAD_EXPIRY_SECONDS = 86_400;
const ACCEPT_LANGUAGE_QUALITY_MIN = 0.1;
const ACCEPT_LANGUAGE_QUALITY_STEP = 0.1;
const BODY_PREVIEW_LENGTH = 500;
const REDIRECT_MIN = 300;
const REDIRECT_MAX = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;

type PreviewResult = {
  downloadUrl: string;
  cached: boolean;
};

async function getOrCachePreview(
  voiceId: string,
  previewUrl: string,
): Promise<PreviewResult> {
  const key = `${STORAGE_PREFIXES.voicePreview(voiceId)}preview.mp3`;
  const exists = await storage.objectExists(key);

  if (exists) {
    const downloadUrl = await storage.getPresignedDownloadUrl(
      key,
      PREVIEW_DOWNLOAD_EXPIRY_SECONDS,
    );
    return { downloadUrl, cached: true };
  }

  const config = await resolveConfig();
  const fullUrl = previewUrl.startsWith("http")
    ? previewUrl
    : `https://secret-voicer.ru${previewUrl}`;

  const response = await fetch(fullUrl, {
    headers: {
      accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
      cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
      referer: "https://secret-voicer.ru/app/",
      "user-agent": config.userAgent,
    },
  });

  if (!response.ok || response.status >= REDIRECT_MIN) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      bodyText = "";
    }

    const isAuthErr =
      (response.status >= REDIRECT_MIN && response.status < REDIRECT_MAX)
      || response.status === HTTP_UNAUTHORIZED
      || response.status === HTTP_FORBIDDEN
      || bodyText.trimStart().startsWith("<");

    if (isAuthErr) {
      await markCredentialError(config.credentialId, {
        action: "downloadVoicePreview",
        statusCode: response.status,
        message: `Auth error on downloadVoicePreview: HTTP ${response.status}`,
        responseBody: bodyText.slice(0, BODY_PREVIEW_LENGTH),
        occurredAt: new Date().toISOString(),
      });
    }

    throw new Error(`Failed to download preview: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await storage.uploadBuffer(key, buffer);

  const downloadUrl = await storage.getPresignedDownloadUrl(
    key,
    PREVIEW_DOWNLOAD_EXPIRY_SECONDS,
  );

  return { downloadUrl, cached: false };
}

async function buildTtsCredentials() {
  const config = await resolveConfig();

  const acceptLanguage =
    config.languages.length > 0
      ? config.languages
          .map((lang, i) => {
            if (i === 0) {
              return lang;
            }
            const q = Math.max(
              ACCEPT_LANGUAGE_QUALITY_MIN,
              1 - i * ACCEPT_LANGUAGE_QUALITY_STEP,
            ).toFixed(1);
            return `${lang};q=${q}`;
          })
          .join(",")
      : config.language;

  return {
    credentialId: config.credentialId,
    csrfToken: config.csrfToken,
    sessionId: config.sessionId,
    userAgent: config.userAgent,
    acceptLanguage,
  };
}

export { buildTtsCredentials, getOrCachePreview };

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer/secret-voicer-task.v1.ts

```
import { STORAGE_PREFIXES } from "@packages/contract/storage";
import { createId } from "@packages/util/id";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";
import { addJob } from "#api/shared/queue/producer";

import { secretVoicerExternalAdapter } from "./secret-voicer-external.adapter";
import { buildTtsCredentials } from "./secret-voicer-preview.service";

const TTS_RATE_MIN = 0.5;
const TTS_RATE_MAX = 2.0;
const TTS_RATE_DEFAULT = 1.0;
const TTS_TEXT_MAX_LENGTH = 5000;

export const secretVoicerTaskV1 = new Elysia({
  prefix: "/v1/secret-voicer/tasks",
})
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .post("/synthesize", async ({ body, set }) => {
    const { voiceId, text, rate } = body as {
      voiceId?: string;
      text?: string;
      rate?: number;
    };

    if (!voiceId || typeof voiceId !== "string") {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "voiceId is required" };
    }

    if (!text || typeof text !== "string" || text.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "text is required" };
    }

    if (text.length > TTS_TEXT_MAX_LENGTH) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `text must be ${TTS_TEXT_MAX_LENGTH} characters or less`,
      };
    }

    const effectiveRate =
      typeof rate === "number"
        ? Math.min(TTS_RATE_MAX, Math.max(TTS_RATE_MIN, rate))
        : TTS_RATE_DEFAULT;

    try {
      const result = await secretVoicerExternalAdapter.createTask({
        voiceId,
        text,
        rate: effectiveRate,
      });

      const jobId = createId();
      const outputKey = `${STORAGE_PREFIXES.ttsOutput(jobId)}output.mp3`;

      const credentials = await buildTtsCredentials();

      const bullJobId = await addJob({
        queue: "tts",
        name: "tts-synthesize",
        data: {
          jobId,
          taskId: result.taskId,
          voiceId,
          text,
          rate: effectiveRate,
          outputKey,
          credentials,
        },
      });

      set.status = HTTP_STATUS.CREATED;
      return {
        jobId,
        bullJobId,
        taskId: result.taskId,
        isReused: result.isReused,
        queue: "tts",
        status: "queued",
      };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to create synthesis task",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/:taskId/status", async ({ params, set }) => {
    const taskId = Number(params.taskId);

    if (Number.isNaN(taskId)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid taskId" };
    }

    try {
      const status = await secretVoicerExternalAdapter.checkTaskStatus(taskId);
      return status;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to check task status",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer/secret-voicer-voice.v1.ts

```
import type {
  SecretVoicerVoice,
  SecretVoicerVoicesResponse,
} from "@packages/contract/secret-voicer";

import { SECRET_VOICER_CACHE_TTL_MS } from "@packages/contract/secret-voicer";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { secretVoicerExternalAdapter } from "./secret-voicer-external.adapter";
import { getOrCachePreview } from "./secret-voicer-preview.service";

let voicesCache: { data: SecretVoicerVoicesResponse; cachedAt: number } | null =
  null;

type RawVoice = {
  voice_id: string;
  name: string;
  gender: string;
  locale: string | null;
  is_multilingual: boolean;
  preview_url: string | null;
  preview_url_emotional: string | null;
  usage_count: number;
  avatar_url: string | null;
  description: string | null;
  accent: string | null;
  age_group: string | null;
  voice_style_tags: string[];
  use_cases: string[];
};

function mapRawVoice(v: RawVoice): SecretVoicerVoice {
  return {
    voiceId: v.voice_id,
    name: v.name,
    gender: v.gender as "MALE" | "FEMALE",
    locale: v.locale,
    isMultilingual: v.is_multilingual,
    previewUrl: v.preview_url,
    previewUrlEmotional: v.preview_url_emotional,
    usageCount: v.usage_count,
    avatarUrl: v.avatar_url || null,
    description: v.description || null,
    accent: v.accent || null,
    ageGroup: v.age_group || null,
    voiceStyleTags: v.voice_style_tags,
    useCases: v.use_cases,
  };
}

async function fetchVoices(): Promise<SecretVoicerVoicesResponse> {
  if (
    voicesCache
    && Date.now() - voicesCache.cachedAt < SECRET_VOICER_CACHE_TTL_MS
  ) {
    return voicesCache.data;
  }

  const result = await secretVoicerExternalAdapter.fetchVoices();

  const data: SecretVoicerVoicesResponse = {
    voices: (result.voices as RawVoice[]).map(mapRawVoice),
  };

  voicesCache = { data, cachedAt: Date.now() };
  return data;
}

const secretVoicerVoiceV1 = new Elysia({
  prefix: "/v1/secret-voicer/voices",
})
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", async ({ set }) => {
    try {
      return await fetchVoices();
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to fetch voices",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/preview", async ({ query, set }) => {
    const voiceId = query.voiceId as string | undefined;
    const url = query.url as string | undefined;

    if (!(voiceId && url)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "voiceId and url are required" };
    }

    try {
      const result = await getOrCachePreview(voiceId, url);
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to get preview",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

export { secretVoicerVoiceV1 };

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer-credential/secret-voicer-credential.repository.ts

```
import type {
  CredentialError,
  SecretVoicerCredential,
  SecretVoicerCredentialWithFingerprint,
} from "./secret-voicer-credential.type";

import { eq } from "drizzle-orm";

import { browserFingerprintsTable } from "#api/feature/browser-fingerprint/browser-fingerprint.table";
import { db } from "#api/shared/db/instance";

import { secretVoicerCredentialsTable } from "./secret-voicer-credential.table";

const SELECT_WITH_FINGERPRINT = {
  id: secretVoicerCredentialsTable.id,
  fingerprintId: secretVoicerCredentialsTable.fingerprintId,
  csrfToken: secretVoicerCredentialsTable.csrfToken,
  sessionId: secretVoicerCredentialsTable.sessionId,
  isActive: secretVoicerCredentialsTable.isActive,
  lastError: secretVoicerCredentialsTable.lastError,
  lastErrorAt: secretVoicerCredentialsTable.lastErrorAt,
  createdAt: secretVoicerCredentialsTable.createdAt,
  updatedAt: secretVoicerCredentialsTable.updatedAt,
  fingerprintLabel: browserFingerprintsTable.label,
};

const secretVoicerCredentialRepository = {
  getAll(): Promise<SecretVoicerCredentialWithFingerprint[]> {
    return db
      .select(SELECT_WITH_FINGERPRINT)
      .from(secretVoicerCredentialsTable)
      .innerJoin(
        browserFingerprintsTable,
        eq(
          secretVoicerCredentialsTable.fingerprintId,
          browserFingerprintsTable.id,
        ),
      )
      .orderBy(secretVoicerCredentialsTable.createdAt);
  },

  getAllActive(): Promise<SecretVoicerCredentialWithFingerprint[]> {
    return db
      .select(SELECT_WITH_FINGERPRINT)
      .from(secretVoicerCredentialsTable)
      .innerJoin(
        browserFingerprintsTable,
        eq(
          secretVoicerCredentialsTable.fingerprintId,
          browserFingerprintsTable.id,
        ),
      )
      .where(eq(secretVoicerCredentialsTable.isActive, true))
      .orderBy(secretVoicerCredentialsTable.createdAt);
  },

  async getById(
    id: string,
  ): Promise<SecretVoicerCredentialWithFingerprint | null> {
    const rows = await db
      .select(SELECT_WITH_FINGERPRINT)
      .from(secretVoicerCredentialsTable)
      .innerJoin(
        browserFingerprintsTable,
        eq(
          secretVoicerCredentialsTable.fingerprintId,
          browserFingerprintsTable.id,
        ),
      )
      .where(eq(secretVoicerCredentialsTable.id, id))
      .limit(1);

    return rows[0] ?? null;
  },

  async create(data: {
    fingerprintId: string;
    csrfToken: string;
    sessionId: string;
  }): Promise<SecretVoicerCredential> {
    const rows = await db
      .insert(secretVoicerCredentialsTable)
      .values(data)
      .returning();

    const created = rows[0];
    if (!created) {
      throw new Error("Failed to create secret voicer credential");
    }
    return created;
  },

  async update(
    id: string,
    data: Partial<{
      csrfToken: string;
      sessionId: string;
      isActive: boolean;
    }>,
  ): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .update(secretVoicerCredentialsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },

  async markAsError(
    id: string,
    error: CredentialError,
  ): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .update(secretVoicerCredentialsTable)
      .set({
        isActive: false,
        lastError: error,
        lastErrorAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },

  async clearError(id: string): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .update(secretVoicerCredentialsTable)
      .set({
        isActive: true,
        lastError: null,
        lastErrorAt: null,
        updatedAt: new Date(),
      })
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },

  async delete(id: string): Promise<SecretVoicerCredential | null> {
    const rows = await db
      .delete(secretVoicerCredentialsTable)
      .where(eq(secretVoicerCredentialsTable.id, id))
      .returning();

    return rows[0] ?? null;
  },
};

export { secretVoicerCredentialRepository };

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer-credential/secret-voicer-credential.schema.ts

```
import { Type } from "typebox";
import { Compile } from "typebox/compile";

const CSRF_TOKEN_MIN = 1;
const CSRF_TOKEN_MAX = 512;
const SESSION_ID_MIN = 1;
const SESSION_ID_MAX = 512;

const createSecretVoicerCredentialSchema = Type.Object({
  fingerprintId: Type.String({ minLength: 1 }),
  csrfToken: Type.String({
    minLength: CSRF_TOKEN_MIN,
    maxLength: CSRF_TOKEN_MAX,
  }),
  sessionId: Type.String({
    minLength: SESSION_ID_MIN,
    maxLength: SESSION_ID_MAX,
  }),
});

const updateSecretVoicerCredentialSchema = Type.Partial(
  Type.Object({
    csrfToken: Type.String({
      minLength: CSRF_TOKEN_MIN,
      maxLength: CSRF_TOKEN_MAX,
    }),
    sessionId: Type.String({
      minLength: SESSION_ID_MIN,
      maxLength: SESSION_ID_MAX,
    }),
    isActive: Type.Boolean(),
  }),
);

export const createSecretVoicerCredentialValidator = Compile(
  createSecretVoicerCredentialSchema,
);

export const updateSecretVoicerCredentialValidator = Compile(
  updateSecretVoicerCredentialSchema,
);

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer-credential/secret-voicer-credential.table.ts

```
import { createId } from "@packages/util/id";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { browserFingerprintsTable } from "#api/feature/browser-fingerprint/browser-fingerprint.table";

export const secretVoicerCredentialsTable = pgTable(
  "secret_voicer_credentials",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    fingerprintId: text("fingerprint_id")
      .references(() => browserFingerprintsTable.id, { onDelete: "cascade" })
      .notNull(),
    csrfToken: text("csrf_token").notNull(),
    sessionId: text("session_id").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastError: jsonb("last_error").$type<{
      action: string;
      statusCode: number | null;
      message: string;
      responseBody: string | null;
      occurredAt: string;
    } | null>(),
    lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer-credential/secret-voicer-credential.type.ts

```
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { secretVoicerCredentialsTable } from "./secret-voicer-credential.table";

export type SecretVoicerCredential = InferSelectModel<
  typeof secretVoicerCredentialsTable
>;

export type SecretVoicerCredentialInsert = InferInsertModel<
  typeof secretVoicerCredentialsTable
>;

export type SecretVoicerCredentialWithFingerprint = SecretVoicerCredential & {
  fingerprintLabel: string;
};

export type CredentialError = {
  action: string;
  statusCode: number | null;
  message: string;
  responseBody: string | null;
  occurredAt: string;
};

```

D:/1_Projects/jstonehub/apps/api/src/feature/secret-voicer-credential/secret-voicer-credential.v1.ts

```
import { Elysia } from "elysia";

import { browserFingerprintRepository } from "#api/feature/browser-fingerprint/browser-fingerprint.repository";
import { invalidateConfigCache } from "#api/feature/secret-voicer/secret-voicer-config.service";
import { HTTP_STATUS } from "#api/shared/config/http-status";

import { secretVoicerCredentialRepository } from "./secret-voicer-credential.repository";
import {
  createSecretVoicerCredentialValidator,
  updateSecretVoicerCredentialValidator,
} from "./secret-voicer-credential.schema";

export const secretVoicerCredentialV1 = new Elysia({
  prefix: "/v1/secret-voicer-credentials",
})
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", () => secretVoicerCredentialRepository.getAll())
  .get("/:id", async ({ params, set }) => {
    const credential = await secretVoicerCredentialRepository.getById(
      params.id,
    );
    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }
    return credential;
  })
  .post("/", async ({ body, set }) => {
    if (!createSecretVoicerCredentialValidator.Check(body)) {
      const errors = [...createSecretVoicerCredentialValidator.Errors(body)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const typedBody = body as {
      fingerprintId: string;
      csrfToken: string;
      sessionId: string;
    };

    const fingerprint = await browserFingerprintRepository.getById(
      typedBody.fingerprintId,
    );
    if (!fingerprint) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Fingerprint not found" };
    }

    const credential = await secretVoicerCredentialRepository.create(typedBody);
    invalidateConfigCache();
    set.status = HTTP_STATUS.CREATED;
    return credential;
  })
  .patch("/:id", async ({ params, body, set }) => {
    if (!updateSecretVoicerCredentialValidator.Check(body)) {
      const errors = [...updateSecretVoicerCredentialValidator.Errors(body)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const credential = await secretVoicerCredentialRepository.update(
      params.id,
      body as Partial<{
        csrfToken: string;
        sessionId: string;
        isActive: boolean;
      }>,
    );

    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }

    invalidateConfigCache();
    return credential;
  })
  // Сброс ошибки и повторная активация credential
  .post("/:id/clear-error", async ({ params, set }) => {
    const credential = await secretVoicerCredentialRepository.clearError(
      params.id,
    );
    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }
    invalidateConfigCache();
    return credential;
  })
  .delete("/:id", async ({ params, set }) => {
    const credential = await secretVoicerCredentialRepository.delete(params.id);
    if (!credential) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Credential not found" };
    }
    invalidateConfigCache();
    set.status = HTTP_STATUS.NO_CONTENT;
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/storage/storage.v1.ts

```
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";
import { storage } from "#api/shared/storage/storage";

const storageV1 = new Elysia({ prefix: "/v1/storage" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/objects", async ({ query }) => {
    const prefix = (query.prefix as string) ?? "";
    const objects = await storage.listObjects(prefix);

    const prefixSet = new Set<string>();
    const result: { key: string; size: number; lastModified: string; isPrefix: boolean }[] = [];

    for (const obj of objects) {
      const relativePath = obj.key.slice(prefix.length);
      const slashIndex = relativePath.indexOf("/");

      if (slashIndex >= 0) {
        const dirPrefix = `${prefix}${relativePath.slice(0, slashIndex + 1)}`;
        if (!prefixSet.has(dirPrefix)) {
          prefixSet.add(dirPrefix);
          result.push({
            key: dirPrefix,
            size: 0,
            lastModified: obj.lastModified.toISOString(),
            isPrefix: true,
          });
        }
      } else {
        result.push({
          key: obj.key,
          size: obj.size,
          lastModified: obj.lastModified.toISOString(),
          isPrefix: false,
        });
      }
    }

    return result;
  })
  .delete("/objects", async ({ body, set }) => {
    const { keys, prefix } = body as { keys?: string[]; prefix?: string };

    if (prefix && typeof prefix === "string") {
      await storage.deletePrefix(prefix);
      set.status = HTTP_STATUS.NO_CONTENT;
      return;
    }

    if (Array.isArray(keys) && keys.length > 0) {
      await storage.deleteObjects(keys);
      set.status = HTTP_STATUS.NO_CONTENT;
      return;
    }

    set.status = HTTP_STATUS.BAD_REQUEST;
    return { error: "Provide either 'keys' array or 'prefix' string" };
  });

export { storageV1 };
```

D:/1_Projects/jstonehub/apps/api/src/feature/tag/tag.repository.ts

```
import type { InferSelectModel } from "drizzle-orm";

import { asc, eq } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { tagsTable } from "./tag.table";

type Tag = InferSelectModel<typeof tagsTable>;

const tagRepository = {
  getAll(): Promise<Tag[]> {
    return db.select().from(tagsTable).orderBy(asc(tagsTable.name));
  },

  async getBySlug(slug: string): Promise<Tag | null> {
    const [row] = await db
      .select()
      .from(tagsTable)
      .where(eq(tagsTable.slug, slug))
      .limit(1);
    return row ?? null;
  },

  async create(data: { slug: string; name: string }): Promise<Tag> {
    const [row] = await db.insert(tagsTable).values(data).returning();
    if (!row) {
      throw new Error("Failed to create tag");
    }
    return row;
  },

  async update(
    id: string,
    data: Partial<{ slug: string; name: string }>,
  ): Promise<Tag | null> {
    const [row] = await db
      .update(tagsTable)
      .set(data)
      .where(eq(tagsTable.id, id))
      .returning();
    return row ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(tagsTable)
      .where(eq(tagsTable.id, id))
      .returning({ id: tagsTable.id });
    return rows.length > 0;
  },
};

export type { Tag };
export { tagRepository };

```

D:/1_Projects/jstonehub/apps/api/src/feature/tag/tag.table.ts

```
import { createId } from "@packages/util/id";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const tagsTable = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

```

D:/1_Projects/jstonehub/apps/api/src/feature/tag/tag.v1.ts

```
import { TAG_LIMITS } from "@packages/contract/tag";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { tagRepository } from "./tag.repository";

export const tagV1 = new Elysia({ prefix: "/v1/tags" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", () => tagRepository.getAll())
  .post("/", async ({ body, set }) => {
    const { slug, name } = body as { slug?: string; name?: string };

    if (
      !slug
      || slug.length < TAG_LIMITS.slug.min
      || slug.length > TAG_LIMITS.slug.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid slug" };
    }

    if (
      !name
      || name.length < TAG_LIMITS.name.min
      || name.length > TAG_LIMITS.name.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid name" };
    }

    const existing = await tagRepository.getBySlug(slug);
    if (existing) {
      set.status = HTTP_STATUS.CONFLICT;
      return { error: "Tag slug already exists" };
    }

    const tag = await tagRepository.create({ slug, name });
    set.status = HTTP_STATUS.CREATED;
    return tag;
  })
  .patch("/:id", async ({ params, body, set }) => {
    const result = await tagRepository.update(
      params.id,
      body as Partial<{ slug: string; name: string }>,
    );
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Tag not found" };
    }
    return result;
  })
  .delete("/:id", async ({ params, set }) => {
    const deleted = await tagRepository.delete(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Tag not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/tts-project/tts-project-webhook.v1.ts

```
import { Elysia } from "elysia";

import { env } from "#api/shared/config/env";
import { HTTP_STATUS } from "#api/shared/config/http-status";

import {
  handleTtsJobCompleted,
  handleTtsJobFailed,
} from "./tts-project.callback";

export const ttsProjectWebhookV1 = new Elysia({
  prefix: "/internal/tts",
})
  .onBeforeHandle(({ headers, set }) => {
    const secret = headers["x-internal-secret"];
    if (secret !== env.INTERNAL_SECRET) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "Unauthorized" };
    }
  })
  .post("/segment-completed", async ({ body }) => {
    const { outputKey } = body as { outputKey?: string };

    if (!outputKey) {
      return { error: "outputKey is required" };
    }

    await handleTtsJobCompleted(outputKey);
    return { success: true };
  })
  .post("/segment-failed", async ({ body }) => {
    const { outputKey, error } = body as {
      outputKey?: string;
      error?: string;
    };

    if (!outputKey) {
      return { error: "outputKey is required" };
    }

    await handleTtsJobFailed(outputKey, error ?? "Unknown error");
    return { success: true };
  });

```

D:/1_Projects/jstonehub/apps/api/src/feature/tts-project/tts-project.callback.ts

```
import { ttsProjectService } from "./tts-project.service";

const TTS_OUTPUT_KEY_REGEX = /^tmp\/tts\/([^/]+)\//;

async function handleTtsJobCompleted(outputKey: string): Promise<void> {
  const projectId = extractProjectIdFromKey(outputKey);
  if (!projectId) {
    return;
  }

  await ttsProjectService.handleSegmentCompleted(projectId, outputKey);
}

async function handleTtsJobFailed(
  outputKey: string,
  error: string,
): Promise<void> {
  const projectId = extractProjectIdFromKey(outputKey);
  if (!projectId) {
    return;
  }

  await ttsProjectService.handleSegmentFailed(projectId, outputKey, error);
}

function extractProjectIdFromKey(key: string): string | null {
  const match = key.match(TTS_OUTPUT_KEY_REGEX);
  return match?.[1] ?? null;
}

export { handleTtsJobCompleted, handleTtsJobFailed };

```

D:/1_Projects/jstonehub/apps/api/src/feature/tts-project/tts-project.repository.ts

```
import type {
  TtsProject,
  TtsProjectStatus,
  TtsProjectWithSegments,
  TtsSegment,
  TtsSegmentStatus,
} from "./tts-project.type";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import { ttsProjectsTable, ttsSegmentsTable } from "./tts-project.table";

const ttsProjectRepository = {
  async getAll(): Promise<TtsProjectWithSegments[]> {
    const projects = await db
      .select()
      .from(ttsProjectsTable)
      .orderBy(desc(ttsProjectsTable.createdAt));

    if (projects.length === 0) {
      return [];
    }

    const projectIds = projects.map((p) => p.id);
    const allSegments = await db
      .select()
      .from(ttsSegmentsTable)
      .where(inArray(ttsSegmentsTable.projectId, projectIds))
      .orderBy(ttsSegmentsTable.index);

    const segmentsByProject = new Map<string, TtsSegment[]>();
    for (const seg of allSegments) {
      const list = segmentsByProject.get(seg.projectId) ?? [];
      list.push(seg);
      segmentsByProject.set(seg.projectId, list);
    }

    return projects.map((p) => ({
      ...p,
      segments: segmentsByProject.get(p.id) ?? [],
    }));
  },

  async getById(id: string): Promise<TtsProjectWithSegments | null> {
    const [project] = await db
      .select()
      .from(ttsProjectsTable)
      .where(eq(ttsProjectsTable.id, id))
      .limit(1);

    if (!project) {
      return null;
    }

    const segments = await db
      .select()
      .from(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.projectId, id))
      .orderBy(ttsSegmentsTable.index);

    return { ...project, segments };
  },

  async create(data: {
    name: string;
    audioProcessingEnabled: boolean;
    audioProcessingConcatenate: boolean;
    audioProcessingConfig: Record<string, unknown>;
  }): Promise<TtsProject> {
    const [row] = await db
      .insert(ttsProjectsTable)
      .values({
        name: data.name,
        audioProcessingEnabled: data.audioProcessingEnabled ? 1 : 0,
        audioProcessingConcatenate: data.audioProcessingConcatenate ? 1 : 0,
        audioProcessingConfig: data.audioProcessingConfig,
        status: "pending",
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create TTS project");
    }
    return row;
  },

  createSegments(
    segments: {
      projectId: string;
      index: number;
      role: string;
      text: string;
      voiceId: string;
    }[],
  ): Promise<TtsSegment[]> {
    if (segments.length === 0) {
      return Promise.resolve([]);
    }
    return db.insert(ttsSegmentsTable).values(segments).returning();
  },

  async updateProjectStatus(
    id: string,
    status: TtsProjectStatus,
    completedAt?: Date,
  ): Promise<TtsProject | null> {
    const [row] = await db
      .update(ttsProjectsTable)
      .set({ status, completedAt: completedAt ?? null, updatedAt: new Date() })
      .where(eq(ttsProjectsTable.id, id))
      .returning();

    return row ?? null;
  },

  async updateSegmentStatus(
    segmentId: string,
    data: {
      status: TtsSegmentStatus;
      bullJobId?: string;
      externalTaskId?: number;
      outputKey?: string;
      errorMessage?: string | null;
    },
  ): Promise<TtsSegment | null> {
    const [row] = await db
      .update(ttsSegmentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ttsSegmentsTable.id, segmentId))
      .returning();

    return row ?? null;
  },

  async updateSegmentFields(
    segmentId: string,
    data: {
      text?: string;
      role?: string;
      voiceId?: string;
      status?: TtsSegmentStatus;
      outputKey?: string | null;
      bullJobId?: string | null;
      externalTaskId?: number | null;
      errorMessage?: string | null;
    },
  ): Promise<TtsSegment | null> {
    const [row] = await db
      .update(ttsSegmentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ttsSegmentsTable.id, segmentId))
      .returning();

    return row ?? null;
  },

  async updateSegmentIndex(segmentId: string, index: number): Promise<void> {
    await db
      .update(ttsSegmentsTable)
      .set({ index, updatedAt: new Date() })
      .where(eq(ttsSegmentsTable.id, segmentId));
  },

  async deleteSegment(segmentId: string): Promise<boolean> {
    const rows = await db
      .delete(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.id, segmentId))
      .returning({ id: ttsSegmentsTable.id });
    return rows.length > 0;
  },

  async updateProjectAudioJobId(
    projectId: string,
    audioProcessingJobId: string | null,
  ): Promise<void> {
    await db
      .update(ttsProjectsTable)
      .set({ audioProcessingJobId, updatedAt: new Date() })
      .where(eq(ttsProjectsTable.id, projectId));
  },

  async getSegmentById(id: string): Promise<TtsSegment | null> {
    const [row] = await db
      .select()
      .from(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.id, id))
      .limit(1);

    return row ?? null;
  },

  async getSegmentByProjectAndIndex(
    projectId: string,
    index: number,
  ): Promise<TtsSegment | null> {
    const all = await db
      .select()
      .from(ttsSegmentsTable)
      .where(eq(ttsSegmentsTable.projectId, projectId));

    return all.find((s) => s.index === index) ?? null;
  },

  async deleteProject(id: string): Promise<boolean> {
    const rows = await db
      .delete(ttsProjectsTable)
      .where(eq(ttsProjectsTable.id, id))
      .returning({ id: ttsProjectsTable.id });

    return rows.length > 0;
  },
};

export { ttsProjectRepository };

```

D:/1_Projects/jstonehub/apps/api/src/feature/tts-project/tts-project.service.ts

```
import type { TtsProjectWithSegments } from "./tts-project.type";

import { STORAGE_PREFIXES } from "@packages/contract/storage";
import { createId } from "@packages/util/id";

import { secretVoicerExternalAdapter } from "#api/feature/secret-voicer/secret-voicer-external.adapter";
import { buildTtsCredentials } from "#api/feature/secret-voicer/secret-voicer-preview.service";
import { addJob } from "#api/shared/queue/producer";
import { storage } from "#api/shared/storage/storage";

import { ttsProjectRepository } from "./tts-project.repository";

type CreateProjectInput = {
  name: string;
  segments: {
    role: string;
    text: string;
    voiceId: string;
  }[];
  audioProcessing: {
    enabled: boolean;
    concatenate: boolean;
    config?: Record<string, unknown>;
  };
};

type ProjectResponse = {
  projectId: string;
  status: string;
  segmentCount: number;
};

type OutputFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type MergeParams = {
  betweenMs: number;
  startMs: number;
  endMs: number;
};

type MergeResult = {
  audioProcessingJobId: string;
  status: string;
};

const TTS_RATE_DEFAULT = 1.0;
const SEGMENT_INDEX_PAD_LENGTH = 4;
const DOWNLOAD_EXPIRY_SECONDS = 86_400;

function buildSegmentOutputKey(
  projectId: string,
  segmentIndex: number,
): string {
  return `${STORAGE_PREFIXES.ttsOutput(projectId)}seg_${String(segmentIndex).padStart(SEGMENT_INDEX_PAD_LENGTH, "0")}.mp3`;
}

async function createProject(
  input: CreateProjectInput,
): Promise<ProjectResponse> {
  const project = await ttsProjectRepository.create({
    name: input.name,
    audioProcessingEnabled: input.audioProcessing.enabled,
    audioProcessingConcatenate: input.audioProcessing.concatenate,
    audioProcessingConfig: input.audioProcessing.config ?? {},
  });

  const segmentRows = input.segments.map((seg, index) => ({
    projectId: project.id,
    index,
    role: seg.role,
    text: seg.text,
    voiceId: seg.voiceId,
  }));

  await ttsProjectRepository.createSegments(segmentRows);

  setImmediate(() => {
    startProjectSynthesis(project.id).catch((err) => {
      // biome-ignore lint/suspicious/noConsole: Background task error logging
      console.error(
        `Failed to start synthesis for project ${project.id}:`,
        err,
      );
    });
  });

  return {
    projectId: project.id,
    status: "processing",
    segmentCount: input.segments.length,
  };
}

async function startProjectSynthesis(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");

  const credentials = await buildTtsCredentials();

  const pendingSegments = project.segments.filter(
    (s) => s.status === "pending",
  );

  await Promise.allSettled(
    pendingSegments.map((segment) =>
      synthesizeSegment(projectId, segment, credentials),
    ),
  );

  await recalculateProjectStatus(projectId);
}

async function synthesizeSegment(
  projectId: string,
  segment: { id: string; voiceId: string; text: string; index: number },
  credentials: Awaited<ReturnType<typeof buildTtsCredentials>>,
): Promise<void> {
  try {
    const result = await secretVoicerExternalAdapter.createTask({
      voiceId: segment.voiceId,
      text: segment.text,
      rate: TTS_RATE_DEFAULT,
    });

    const jobId = createId();
    const outputKey = buildSegmentOutputKey(projectId, segment.index);

    const bullJobId = await addJob({
      queue: "tts",
      name: `tts-${projectId}-seg-${segment.index}`,
      data: {
        jobId,
        taskId: result.taskId,
        voiceId: segment.voiceId,
        text: segment.text,
        rate: TTS_RATE_DEFAULT,
        outputKey,
        credentials,
      },
    });

    await ttsProjectRepository.updateSegmentStatus(segment.id, {
      status: "queued",
      bullJobId,
      externalTaskId: result.taskId,
      outputKey,
      errorMessage: null,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    await ttsProjectRepository.updateSegmentStatus(segment.id, {
      status: "failed",
      errorMessage: errorMsg,
    });
  }
}

async function handleSegmentCompleted(
  projectId: string,
  outputKey: string,
): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  const segment = project.segments.find((s) => s.outputKey === outputKey);
  if (!segment) {
    return;
  }

  await ttsProjectRepository.updateSegmentStatus(segment.id, {
    status: "completed",
    errorMessage: null,
  });

  await recalculateProjectStatus(projectId);
}

async function handleSegmentFailed(
  projectId: string,
  outputKey: string,
  error: string,
): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  const segment = project.segments.find((s) => s.outputKey === outputKey);
  if (!segment) {
    return;
  }

  await ttsProjectRepository.updateSegmentStatus(segment.id, {
    status: "failed",
    errorMessage: error,
  });

  await recalculateProjectStatus(projectId);
}

async function retrySegment(
  projectId: string,
  segmentIndex: number,
): Promise<void> {
  const segment = await ttsProjectRepository.getSegmentByProjectAndIndex(
    projectId,
    segmentIndex,
  );

  if (!segment) {
    throw new Error(
      `Segment ${segmentIndex} not found in project ${projectId}`,
    );
  }

  if (!["failed", "pending"].includes(segment.status)) {
    throw new Error("Only failed or pending segments can be retried");
  }

  if (segment.outputKey) {
    try {
      await storage.deleteObject(segment.outputKey);
    } catch {
      // файл мог уже не существовать
    }
  }

  await ttsProjectRepository.updateSegmentStatus(segment.id, {
    status: "pending",
    errorMessage: null,
  });

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");

  const credentials = await buildTtsCredentials();
  await synthesizeSegment(projectId, segment, credentials);
  await recalculateProjectStatus(projectId);
}

async function retryAllFailed(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const failedSegments = project.segments.filter((s) => s.status === "failed");
  if (failedSegments.length === 0) {
    return;
  }

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");

  await Promise.all(
    failedSegments
      .filter((s) => s.outputKey)
      .map((s) =>
        storage.deleteObject(s.outputKey as string).catch(() => {
          // ignore missing files
        }),
      ),
  );

  await Promise.all(
    failedSegments.map((segment) =>
      ttsProjectRepository.updateSegmentStatus(segment.id, {
        status: "pending",
        errorMessage: null,
      }),
    ),
  );

  const credentials = await buildTtsCredentials();

  await Promise.allSettled(
    failedSegments.map((segment) =>
      synthesizeSegment(projectId, segment, credentials),
    ),
  );

  await recalculateProjectStatus(projectId);
}

async function synthesizeAllPending(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const pendingSegments = project.segments.filter(
    (s) => s.status === "pending",
  );
  if (pendingSegments.length === 0) {
    return;
  }

  await ttsProjectRepository.updateProjectStatus(projectId, "processing");
  const credentials = await buildTtsCredentials();

  await Promise.allSettled(
    pendingSegments.map((segment) =>
      synthesizeSegment(projectId, segment, credentials),
    ),
  );

  await recalculateProjectStatus(projectId);
}

async function updateSegment(
  projectId: string,
  segmentIndex: number,
  data: { text?: string; role?: string; voiceId?: string },
): Promise<void> {
  const segment = await ttsProjectRepository.getSegmentByProjectAndIndex(
    projectId,
    segmentIndex,
  );
  if (!segment) {
    throw new Error("Segment not found");
  }

  if (
    segment.outputKey
    && (data.text !== undefined || data.voiceId !== undefined)
  ) {
    try {
      await storage.deleteObject(segment.outputKey);
    } catch {
      // ignore
    }
  }

  await ttsProjectRepository.updateSegmentFields(segment.id, {
    ...data,
    status: "pending",
    outputKey: null,
    bullJobId: null,
    externalTaskId: null,
    errorMessage: null,
  });

  await recalculateProjectStatus(projectId);
}

async function addSegment(
  projectId: string,
  data: { role: string; text: string; voiceId: string; afterIndex?: number },
): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const insertAt =
    data.afterIndex === undefined
      ? project.segments.length
      : data.afterIndex + 1;

  const segmentsToShift = project.segments.filter((s) => s.index >= insertAt);

  for (const seg of segmentsToShift) {
    // biome-ignore lint/performance/noAwaitInLoops: sequential is intentional
    await ttsProjectRepository.updateSegmentIndex(seg.id, seg.index + 1);
  }

  await ttsProjectRepository.createSegments([
    {
      projectId,
      index: insertAt,
      role: data.role,
      text: data.text,
      voiceId: data.voiceId,
    },
  ]);

  await recalculateProjectStatus(projectId);
}

async function deleteSegment(
  projectId: string,
  segmentIndex: number,
): Promise<void> {
  const segment = await ttsProjectRepository.getSegmentByProjectAndIndex(
    projectId,
    segmentIndex,
  );
  if (!segment) {
    throw new Error("Segment not found");
  }

  if (segment.outputKey) {
    try {
      await storage.deleteObject(segment.outputKey);
    } catch {
      // ignore
    }
  }

  await ttsProjectRepository.deleteSegment(segment.id);

  const project = await ttsProjectRepository.getById(projectId);
  if (project) {
    const remaining = project.segments
      .filter((s) => s.id !== segment.id)
      .sort((a, b) => a.index - b.index);

    for (let i = 0; i < remaining.length; i++) {
      const seg = remaining[i];
      if (seg && seg.index !== i) {
        // biome-ignore lint/performance/noAwaitInLoops: sequential is intentional
        await ttsProjectRepository.updateSegmentIndex(seg.id, i);
      }
    }
  }

  await recalculateProjectStatus(projectId);
}

async function recalculateProjectStatus(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    return;
  }

  const { segments } = project;
  if (segments.length === 0) {
    await ttsProjectRepository.updateProjectStatus(projectId, "pending");
    return;
  }

  let pending = 0;
  let queued = 0;
  let processing = 0;
  let completed = 0;
  let failed = 0;

  for (const seg of segments) {
    switch (seg.status) {
      case "pending":
        pending++;
        break;
      case "queued":
        queued++;
        break;
      case "processing":
        processing++;
        break;
      case "completed":
        completed++;
        break;
      case "failed":
        failed++;
        break;
      default:
        break;
    }
  }

  const total = segments.length;
  const active = pending + queued + processing;

  if (active > 0) {
    await ttsProjectRepository.updateProjectStatus(projectId, "processing");
  } else if (failed === total) {
    await ttsProjectRepository.updateProjectStatus(projectId, "failed");
  } else if (failed > 0) {
    await ttsProjectRepository.updateProjectStatus(projectId, "partial");
  } else if (completed === total) {
    await ttsProjectRepository.updateProjectStatus(
      projectId,
      "completed",
      new Date(),
    );
  }
}

function buildMergeConfig(params: MergeParams) {
  return {
    silenceRemoval: {
      enabled: false,
      thresholdDb: -30,
      minDurationMs: 200,
      keepGapMs: 30,
    },
    normalization: {
      enabled: true,
      targetLufs: -16,
      truePeakDb: -1.5,
    },
    highPassFilter: {
      enabled: false,
      frequencyHz: 80,
    },
    limiter: {
      enabled: true,
      limitDb: -1.0,
    },
    fade: { inMs: 0, outMs: 0 },
    gaps: {
      innerMs: 0,
      betweenMs: params.betweenMs,
      startMs: params.startMs,
      endMs: params.endMs,
    },
    concatenation: { enabled: true },
    output: {
      format: "mp3" as const,
      bitrate: "192k",
      sampleRate: 44_100,
    },
  };
}

async function mergeSegments(
  projectId: string,
  params: MergeParams,
): Promise<MergeResult> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const completedSegments = project.segments
    .filter((s) => s.status === "completed" && s.outputKey)
    .sort((a, b) => a.index - b.index);

  if (completedSegments.length === 0) {
    throw new Error("No completed segments to merge");
  }

  const inputKeys = completedSegments.map((s) => s.outputKey as string);
  const jobId = createId();
  const outputPrefix = `${STORAGE_PREFIXES.ttsOutput(projectId)}merged/`;

  await addJob({
    queue: "audio-processing",
    name: `merge-tts-${projectId}`,
    data: {
      jobId,
      config: buildMergeConfig(params),
      inputKeys,
      outputPrefix,
      outputName: project.name,
      isConcatenated: true,
    },
  });

  await ttsProjectRepository.updateProjectAudioJobId(projectId, jobId);

  return { audioProcessingJobId: jobId, status: "queued" };
}

async function deleteMergedAudio(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (!project.audioProcessingJobId) {
    throw new Error("No merged audio to delete");
  }

  // Delete merged files from storage
  const mergedPrefix = `${STORAGE_PREFIXES.ttsOutput(projectId)}merged/`;
  try {
    await storage.deletePrefix(mergedPrefix);
  } catch {
    // Non-critical — files may already be gone
  }

  // Clear the audioProcessingJobId so the Merge button reappears
  await ttsProjectRepository.updateProjectAudioJobId(projectId, null);
}

async function deleteProject(projectId: string): Promise<void> {
  const project = await ttsProjectRepository.getById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const prefix = STORAGE_PREFIXES.ttsOutput(projectId);
  try {
    await storage.deletePrefix(prefix);
  } catch {
    // Non-critical
  }

  await ttsProjectRepository.deleteProject(projectId);
}

async function buildOutputFiles(
  project: TtsProjectWithSegments,
): Promise<OutputFileEntry[]> {
  const completedSegments = project.segments.filter(
    (seg) => seg.status === "completed" && seg.outputKey,
  );

  const results = await Promise.all(
    completedSegments.map(async (seg) => {
      const outputKey = seg.outputKey;
      if (!outputKey) {
        return null;
      }

      try {
        const downloadUrl = await storage.getPresignedDownloadUrl(
          outputKey,
          DOWNLOAD_EXPIRY_SECONDS,
        );
        const padded = String(seg.index).padStart(
          SEGMENT_INDEX_PAD_LENGTH,
          "0",
        );
        return {
          fileName: `seg_${padded}_${seg.role}.mp3`,
          sizeBytes: 0,
          durationMs: 0,
          downloadUrl,
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is OutputFileEntry => r !== null);
}

async function getProjectResponse(
  project: TtsProjectWithSegments,
): Promise<Record<string, unknown>> {
  const outputFiles = await buildOutputFiles(project);

  return {
    jobId: project.id,
    bullJobId: "",
    name: project.name,
    status: project.status,
    segments: project.segments.map((seg) => ({
      index: seg.index,
      role: seg.role,
      text: seg.text,
      voiceId: seg.voiceId,
      status: seg.status,
      bullJobId: seg.bullJobId,
      outputKey: seg.outputKey,
      error: seg.errorMessage,
    })),
    audioProcessingJobId: project.audioProcessingJobId,
    createdAt: project.createdAt.toISOString(),
    completedAt: project.completedAt?.toISOString() ?? null,
    outputFiles,
    error: null,
  };
}

const ttsProjectService = {
  createProject,
  startProjectSynthesis,
  handleSegmentCompleted,
  handleSegmentFailed,
  retrySegment,
  retryAllFailed,
  synthesizeAllPending,
  updateSegment,
  addSegment,
  deleteSegment,
  recalculateProjectStatus,
  mergeSegments,
  deleteMergedAudio,
  deleteProject,
  getProjectResponse,
};

export { ttsProjectService };

```

D:/1_Projects/jstonehub/apps/api/src/feature/tts-project/tts-project.table.ts

```
import { createId } from "@packages/util/id";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const ttsProjectStatusEnum = pgEnum("tts_project_status", [
  "pending",
  "processing",
  "completed",
  "partial",
  "failed",
]);

export const ttsSegmentStatusEnum = pgEnum("tts_segment_status", [
  "pending",
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const ttsProjectsTable = pgTable("tts_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  status: ttsProjectStatusEnum("status").notNull().default("pending"),
  audioProcessingEnabled: integer("audio_processing_enabled")
    .notNull()
    .default(1),
  audioProcessingConcatenate: integer("audio_processing_concatenate")
    .notNull()
    .default(1),
  audioProcessingConfig: jsonb("audio_processing_config").default({}),
  audioProcessingJobId: text("audio_processing_job_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const ttsSegmentsTable = pgTable("tts_segments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  projectId: text("project_id")
    .references(() => ttsProjectsTable.id, { onDelete: "cascade" })
    .notNull(),
  index: integer("index").notNull(),
  role: text("role").notNull(),
  text: text("text").notNull(),
  voiceId: text("voice_id").notNull(),
  status: ttsSegmentStatusEnum("status").notNull().default("pending"),
  externalTaskId: integer("external_task_id"),
  bullJobId: text("bull_job_id"),
  outputKey: text("output_key"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

```

D:/1_Projects/jstonehub/apps/api/src/feature/tts-project/tts-project.type.ts

```
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { ttsProjectsTable, ttsSegmentsTable } from "./tts-project.table";

export type TtsProject = InferSelectModel<typeof ttsProjectsTable>;
export type TtsProjectInsert = InferInsertModel<typeof ttsProjectsTable>;

export type TtsSegment = InferSelectModel<typeof ttsSegmentsTable>;
export type TtsSegmentInsert = InferInsertModel<typeof ttsSegmentsTable>;

export type TtsProjectStatus =
  | "pending"
  | "processing"
  | "completed"
  | "partial"
  | "failed";

export type TtsSegmentStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type TtsProjectWithSegments = TtsProject & {
  segments: TtsSegment[];
};

```

D:/1_Projects/jstonehub/apps/api/src/feature/tts-project/tts-project.v1.ts

```
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { ttsProjectRepository } from "./tts-project.repository";
import { ttsProjectService } from "./tts-project.service";

const MERGE_DEFAULT_BETWEEN_MS = 50;

export const ttsProjectV1 = new Elysia({ prefix: "/v1/tts-projects" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", async () => {
    const projects = await ttsProjectRepository.getAll();
    const responses = await Promise.all(
      projects.map((p) => ttsProjectService.getProjectResponse(p)),
    );
    return responses;
  })
  .get("/:id", async ({ params, set }) => {
    const project = await ttsProjectRepository.getById(params.id);
    if (!project) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Project not found" };
    }
    return ttsProjectService.getProjectResponse(project);
  })
  .post("/", async ({ body, set }) => {
    const { name, segments, audioProcessing } = body as {
      name?: string;
      segments?: { role: string; text: string; voiceId: string }[];
      audioProcessing?: {
        enabled?: boolean;
        concatenate?: boolean;
        config?: Record<string, unknown>;
      };
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "name is required" };
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "segments array is required and must not be empty" };
    }

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!(seg?.role && seg.text && seg.voiceId)) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: `Segment ${i}: role, text, and voiceId are required` };
      }
    }

    try {
      const result = await ttsProjectService.createProject({
        name: name.trim(),
        segments: segments.map((s) => ({
          role: s.role.trim(),
          text: s.text.trim(),
          voiceId: s.voiceId,
        })),
        audioProcessing: {
          enabled: audioProcessing?.enabled ?? true,
          concatenate: audioProcessing?.concatenate ?? true,
          config: audioProcessing?.config ?? {},
        },
      });

      set.status = HTTP_STATUS.CREATED;
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/:id/segments/:segmentIndex/retry", async ({ params, set }) => {
    const segmentIndex = Number(params.segmentIndex);
    if (Number.isNaN(segmentIndex)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid segment index" };
    }

    try {
      await ttsProjectService.retrySegment(params.id, segmentIndex);
      return { success: true };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to retry segment",
      };
    }
  })
  .post("/:id/retry-all-failed", async ({ params, set }) => {
    try {
      await ttsProjectService.retryAllFailed(params.id);
      return { success: true };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to retry",
      };
    }
  })
  .post("/:id/synthesize-pending", async ({ params, set }) => {
    try {
      await ttsProjectService.synthesizeAllPending(params.id);
      return { success: true };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to synthesize",
      };
    }
  })
  .post("/:id/merge", async ({ params, body, set }) => {
    const { betweenMs, startMs, endMs } = body as {
      betweenMs?: number;
      startMs?: number;
      endMs?: number;
    };

    try {
      const result = await ttsProjectService.mergeSegments(params.id, {
        betweenMs: betweenMs ?? MERGE_DEFAULT_BETWEEN_MS,
        startMs: startMs ?? 0,
        endMs: endMs ?? 0,
      });
      set.status = HTTP_STATUS.CREATED;
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to merge",
      };
    }
  })
  .delete("/:id/merge", async ({ params, set }) => {
    try {
      await ttsProjectService.deleteMergedAudio(params.id);
      set.status = HTTP_STATUS.NO_CONTENT;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete merged audio",
      };
    }
  })
  .patch("/:id/segments/:segmentIndex", async ({ params, body, set }) => {
    const segmentIndex = Number(params.segmentIndex);
    if (Number.isNaN(segmentIndex)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid segment index" };
    }

    const { text, role, voiceId } = body as {
      text?: string;
      role?: string;
      voiceId?: string;
    };

    try {
      await ttsProjectService.updateSegment(params.id, segmentIndex, {
        text,
        role,
        voiceId,
      });
      const project = await ttsProjectRepository.getById(params.id);
      if (!project) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "Project not found" };
      }
      return ttsProjectService.getProjectResponse(project);
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to update segment",
      };
    }
  })
  .post("/:id/segments", async ({ params, body, set }) => {
    const { role, text, voiceId, afterIndex } = body as {
      role?: string;
      text?: string;
      voiceId?: string;
      afterIndex?: number;
    };

    if (!(role && text && voiceId)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "role, text, voiceId are required" };
    }

    try {
      await ttsProjectService.addSegment(params.id, {
        role,
        text,
        voiceId,
        afterIndex,
      });
      const project = await ttsProjectRepository.getById(params.id);
      if (!project) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "Project not found" };
      }
      return ttsProjectService.getProjectResponse(project);
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to add segment",
      };
    }
  })
  .delete("/:id/segments/:segmentIndex", async ({ params, set }) => {
    const segmentIndex = Number(params.segmentIndex);
    if (Number.isNaN(segmentIndex)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid segment index" };
    }

    try {
      await ttsProjectService.deleteSegment(params.id, segmentIndex);
      set.status = HTTP_STATUS.NO_CONTENT;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to delete segment",
      };
    }
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      await ttsProjectService.deleteProject(params.id);
      set.status = HTTP_STATUS.NO_CONTENT;
    } catch (error) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return {
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      };
    }
  });

```

D:/1_Projects/jstonehub/apps/api/src/shared/config/env.ts

```
import process from "node:process";
import { Type } from "typebox";
import { Value } from "typebox/value";

const leadingSlash = /^\//;

const EnvSchema = Type.Object({
  // ═══════════════════════════════════════════════════════════════
  // BASE
  // ═══════════════════════════════════════════════════════════════
  NODE_ENV: Type.Union([
    Type.Literal("development"),
    Type.Literal("production"),
    Type.Literal("test"),
  ]),

  // ═══════════════════════════════════════════════════════════════
  // SERVICES
  // ═══════════════════════════════════════════════════════════════
  PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  WORKER_URL: Type.String({ minLength: 1 }),
  HUB_URL: Type.String({ minLength: 1 }),
  ADMIN_URL: Type.String({ minLength: 1 }),
  CORS_ORIGINS: Type.Array(Type.String({ minLength: 1 })),

  // ═══════════════════════════════════════════════════════════════
  // DATABASE & STORAGE
  // ═══════════════════════════════════════════════════════════════
  DATABASE_URL: Type.String({ minLength: 1 }),
  REDIS_URL: Type.String({ minLength: 1 }),
  MINIO_ENDPOINT: Type.String({ minLength: 1 }),
  MINIO_PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  MINIO_ACCESS_KEY: Type.String({ minLength: 1 }),
  MINIO_SECRET_KEY: Type.String({ minLength: 1 }),
  MINIO_USE_SSL: Type.Boolean(),
  MINIO_BUCKET: Type.String({ minLength: 1 }),

  // ═══════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════
  JWT_SECRET: Type.String({ minLength: 1 }),
  INTERNAL_SECRET: Type.String({ minLength: 1 }),
  GOOGLE_CLIENT_ID: Type.String({ minLength: 1 }),
  GOOGLE_CLIENT_SECRET: Type.String({ minLength: 1 }),

  COOKIE_DOMAIN: Type.String({ minLength: 1 }),
  ACCESS_TOKEN_EXPIRES_IN: Type.Number({ minimum: 1 }),
  REFRESH_TOKEN_EXPIRES_IN: Type.Number({ minimum: 1 }),

  OWNER_EMAIL: Type.String({ minLength: 1 }),
});

function parseEnv() {
  const raw = process.env;

  const parsed = {
    // BASE
    NODE_ENV: raw.NODE_ENV,

    // SERVICES
    PORT: Number(raw.PORT),
    WORKER_URL: raw.WORKER_URL,
    HUB_URL: raw.HUB_URL,
    ADMIN_URL: raw.ADMIN_URL,
    CORS_ORIGINS: parseStringList(raw.CORS_ORIGINS),

    // DATABASE & STORAGE
    DATABASE_URL: raw.DATABASE_URL,
    REDIS_URL: raw.REDIS_URL,
    MINIO_ENDPOINT: raw.MINIO_ENDPOINT,
    MINIO_PORT: Number(raw.MINIO_PORT),
    MINIO_ACCESS_KEY: raw.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: raw.MINIO_SECRET_KEY,
    MINIO_USE_SSL: parseBoolean(raw.MINIO_USE_SSL),
    MINIO_BUCKET: raw.MINIO_BUCKET,

    // AUTH
    JWT_SECRET: raw.JWT_SECRET,
    INTERNAL_SECRET: raw.INTERNAL_SECRET,
    GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET,

    COOKIE_DOMAIN: raw.COOKIE_DOMAIN,
    ACCESS_TOKEN_EXPIRES_IN: Number(raw.ACCESS_TOKEN_EXPIRES_IN),
    REFRESH_TOKEN_EXPIRES_IN: Number(raw.REFRESH_TOKEN_EXPIRES_IN),

    OWNER_EMAIL: raw.OWNER_EMAIL,
  };

  if (!Value.Check(EnvSchema, parsed)) {
    const errors = Value.Errors(EnvSchema, parsed);

    const errorsWithValues = [...errors].map((error) => ({
      ...error,
      value: Value.Pointer.Get(parsed, error.instancePath),
    }));

    const message = errorsWithValues
      .map((e) => {
        const envName = e.instancePath.replace(leadingSlash, "") || "root";
        const received = JSON.stringify(e.value);
        return `  • ${envName}: ${e.message} (received: ${received})`;
      })
      .join("\n");

    throw new Error(`❌ API: Invalid environment variables:\n${message}`);
  }

  return parsed;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
  return;
}

function parseStringList(value: string | undefined, separator = ","): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export const env = parseEnv();

```

D:/1_Projects/jstonehub/apps/api/src/shared/config/http-status.ts

```
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/instance.ts

```
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import { env } from "#api/shared/config/env";

import { schema } from "./schema";

const client = new SQL(env.DATABASE_URL);
export const db = drizzle({ client, schema });

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/migrate.ts

```
import process from "node:process";
import { migrate } from "drizzle-orm/bun-sql/migrator";

import { db } from "./instance";

// biome-ignore lint/suspicious/noConsole: Migration logging required
console.log("⏳ Running migrations...");

try {
  await migrate(db, { migrationsFolder: "drizzle" });
  // biome-ignore lint/suspicious/noConsole: Migration logging required
  console.log("✅ Migrations completed successfully");
  process.exit(0);
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: Migration logging required
  console.error("❌ Migration failed:", error);
  process.exit(1);
}

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema.ts

```
import {
  globalRoleEnum,
  oauthAccountsTable,
  sessionsTable,
  userAdminPermissionsTable,
  usersTable,
} from "#api/feature/auth/auth.table";
import {
  browserFingerprintsTable,
  browserPlatformEnum,
  browserVendorEnum,
} from "#api/feature/browser-fingerprint/browser-fingerprint.table";
import {
  contentUsagesTable,
  jokeAudiosTable,
  jokeStatusEnum,
  jokesTable,
  jokeTagsTable,
  jokeTranslationStatusEnum,
  jokeTranslationsTable,
} from "#api/feature/joke/joke.table";
import {
  jokeTtsPipelineStatusEnum,
  jokeTtsPipelinesTable,
} from "#api/feature/joke-tts/joke-tts.table";
import { languagesTable } from "#api/feature/language/language.table";
import { secretVoicerCredentialsTable } from "#api/feature/secret-voicer-credential/secret-voicer-credential.table";
import { tagsTable } from "#api/feature/tag/tag.table";
import {
  ttsProjectStatusEnum,
  ttsProjectsTable,
  ttsSegmentStatusEnum,
  ttsSegmentsTable,
} from "#api/feature/tts-project/tts-project.table";

const user = {
  globalRoleEnum,
  oauthAccountsTable,
  sessionsTable,
  userAdminPermissionsTable,
  usersTable,
}

const schema = {
  ...user,
  // Browser
  browserFingerprintsTable,
  browserPlatformEnum,
  browserVendorEnum,
  // Secret Voicer
  secretVoicerCredentialsTable,
  // TTS
  ttsProjectsTable,
  ttsProjectStatusEnum,
  ttsSegmentsTable,
  ttsSegmentStatusEnum,
  // Content
  languagesTable,
  tagsTable,
  jokesTable,
  jokeStatusEnum,
  jokeTranslationsTable,
  jokeTranslationStatusEnum,
  jokeAudiosTable,
  jokeTagsTable,
  contentUsagesTable,
  jokeTtsPipelinesTable,
  jokeTtsPipelineStatusEnum,
};

export {
  schema
}
```

D:/1_Projects/jstonehub/apps/api/src/shared/queue/connection.ts

```
import IoRedis from "ioredis";

import { env } from "#api/shared/config/env";

let connection: IoRedis | null = null;

function getRedisConnection(): IoRedis {
  if (!connection) {
    connection = new IoRedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}

function getRedisConnectionOptions() {
  return { url: env.REDIS_URL, maxRetriesPerRequest: null as null };
}

async function closeRedisConnection(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}

export { closeRedisConnection, getRedisConnection, getRedisConnectionOptions };

```

D:/1_Projects/jstonehub/apps/api/src/shared/queue/producer.ts

```
import type {
  QueueJobDataMap,
  QueueJobResultMap,
  QueueName,
} from "@packages/contract/queue";
import type { JobsOptions, Queue as QueueType } from "bullmq";

import { QUEUE_NAMES } from "@packages/contract/queue";
import { Queue } from "bullmq";

import { getRedisConnectionOptions } from "./connection";

type QueueRegistry = {
  [K in QueueName]: Queue<QueueJobDataMap[K], QueueJobResultMap[K]>;
};

type AddJobParams<T extends QueueName> = {
  queue: T;
  name: string;
  data: QueueJobDataMap[T];
  options?: JobsOptions;
};

let registry: QueueRegistry | null = null;

function getRegistry(): QueueRegistry {
  if (!registry) {
    const connection = getRedisConnectionOptions();

    registry = Object.fromEntries(
      QUEUE_NAMES.map((name) => [name, new Queue(name, { connection })]),
    ) as QueueRegistry;
  }
  return registry;
}

function getQueue<T extends QueueName>(
  name: T,
): Queue<QueueJobDataMap[T], QueueJobResultMap[T]> {
  return getRegistry()[name];
}

async function addJob<T extends QueueName>(
  params: AddJobParams<T>,
): Promise<string> {
  const queue = getRegistry()[params.queue] as QueueType;
  const job = await queue.add(params.name, params.data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
    ...params.options,
  });

  if (!job.id) {
    throw new Error(`Failed to create job in queue "${params.queue}"`);
  }

  return job.id;
}

async function closeAllQueues(): Promise<void> {
  if (!registry) {
    return;
  }

  const queues = Object.values(registry) as QueueType[];
  await Promise.all(queues.map((q) => q.close()));
  registry = null;
}

export type { AddJobParams };
export { addJob, closeAllQueues, getQueue };

```

D:/1_Projects/jstonehub/apps/api/src/shared/queue/queue.v1.ts

```
import type { PingJobData } from "@packages/contract/queue";

import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { addJob } from "./producer";

export const queueV1 = new Elysia({ prefix: "/v1/queue" }).post(
  "/ping",
  async ({ set }) => {
    const data: PingJobData = {
      message: "ping from API",
      timestamp: Date.now(),
    };

    const jobId = await addJob({
      queue: "ping",
      name: "ping-test",
      data,
    });

    set.status = HTTP_STATUS.CREATED;
    return { jobId, queue: "ping", status: "queued" };
  },
);

```

D:/1_Projects/jstonehub/apps/api/src/shared/storage/client.ts

```
import { Client } from "minio";

import { env } from "#api/shared/config/env";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});
```

D:/1_Projects/jstonehub/apps/api/src/shared/storage/storage-cleanup.cron.ts

```
import {
  AUDIO_PROCESSING_CLEANUP_CRON,
  AUDIO_PROCESSING_TTL_MS,
} from "@packages/contract/audio-processing";
import { cron } from "@elysiajs/cron";
import { Elysia } from "elysia";

import { storage } from "./storage";

const AUDIO_PROCESSING_PREFIX = "tmp/audio-processing/";

export const storageCleanupCron = new Elysia().use(
  cron({
    name: "storage-cleanup",
    pattern: AUDIO_PROCESSING_CLEANUP_CRON,
    async run() {
      // biome-ignore lint/suspicious/noConsole: Cron logging required
      console.log("🧹 [storage-cleanup] Starting cleanup...");

      try {
        const objects = await storage.listObjects(AUDIO_PROCESSING_PREFIX);
        const now = Date.now();
        let deletedCount = 0;

        const expiredKeys: string[] = [];

        for (const obj of objects) {
          const age = now - obj.lastModified.getTime();
          if (age > AUDIO_PROCESSING_TTL_MS) {
            expiredKeys.push(obj.key);
          }
        }

        if (expiredKeys.length > 0) {
          await storage.deleteObjects(expiredKeys);
          deletedCount = expiredKeys.length;
        }

        // biome-ignore lint/suspicious/noConsole: Cron logging required
        console.log(
          `🧹 [storage-cleanup] Done: ${deletedCount} expired object(s) deleted out of ${objects.length} total`,
        );
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Cron logging required
        console.error("❌ [storage-cleanup] Error:", error);
      }
    },
  }),
);
```

D:/1_Projects/jstonehub/apps/api/src/shared/storage/storage.ts

```
import type { BucketItemStat } from "minio";

import { CopyConditions } from "minio";

import { env } from "#api/shared/config/env";

import { minioClient } from "./client";

type StorageObject = {
  key: string;
  size: number;
  lastModified: Date;
};

const bucket = env.MINIO_BUCKET;
const PRESIGNED_UPLOAD_EXPIRY_DEFAULT = 3600;
const PRESIGNED_DOWNLOAD_EXPIRY_DEFAULT = 86_400;

async function getPresignedUploadUrl(
  key: string,
  expirySeconds = PRESIGNED_UPLOAD_EXPIRY_DEFAULT,
): Promise<string> {
  return minioClient.presignedPutObject(bucket, key, expirySeconds);
}

async function getPresignedDownloadUrl(
  key: string,
  expirySeconds = PRESIGNED_DOWNLOAD_EXPIRY_DEFAULT,
): Promise<string> {
  return minioClient.presignedGetObject(bucket, key, expirySeconds);
}

async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await minioClient.removeObjects(bucket, keys);
}

async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(bucket, key);
}

async function deletePrefix(prefix: string): Promise<void> {
  const keys: string[] = [];
  const stream = minioClient.listObjectsV2(bucket, prefix, true);

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (obj) => {
      if (obj.name) keys.push(obj.name);
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  if (keys.length > 0) {
    await minioClient.removeObjects(bucket, keys);
  }
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucket, key);
    return true;
  } catch {
    return false;
  }
}

async function uploadBuffer(key: string, buffer: Buffer): Promise<void> {
  await minioClient.putObject(bucket, key, buffer, buffer.length);
}

async function copyObject(
  sourceKey: string,
  destKey: string,
): Promise<void> {
  const conditions = new CopyConditions();
  await minioClient.copyObject(
    bucket,
    destKey,
    `/${bucket}/${sourceKey}`,
    conditions,
  );
}

async function statObject(key: string): Promise<BucketItemStat> {
  return minioClient.statObject(bucket, key);
}

async function listObjects(prefix: string): Promise<StorageObject[]> {
  const objects: StorageObject[] = [];
  const stream = minioClient.listObjectsV2(bucket, prefix, true);

  await new Promise<void>((resolve, reject) => {
    stream.on("data", (obj) => {
      if (obj.name) {
        objects.push({
          key: obj.name,
          size: obj.size ?? 0,
          lastModified: obj.lastModified ?? new Date(),
        });
      }
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });

  return objects;
}

async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }
}

export type { StorageObject };
export const storage = {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteObjects,
  deleteObject,
  deletePrefix,
  objectExists,
  uploadBuffer,
  copyObject,
  statObject,
  listObjects,
  ensureBucket,
};
```

D:/1_Projects/jstonehub/apps/api/src/shared/web/cors.ts

```
import cors from "@elysiajs/cors";

import { env } from "#api/shared/config/env";

// TODO: Implement logging of rejected CORS requests for security audit
// TODO: Add metrics/monitoring for CORS rejections to detect potential attacks
// TODO: Consider implementing rate limiting for repeated CORS violations from same origin
// TODO: Validate origin format before comparison to prevent bypass attempts

const TRAILING_SLASH_REGEX = /\/$/;
const allowedOrigins = buildAllowedOrigins();

const corsPlugin: ReturnType<typeof cors> = cors({
  origin: (request) => {
    const origin = request.headers.get("origin");

    if (!origin) {
      return true;
    }

    return allowedOrigins.includes(origin);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  maxAge: 86_400,
});

function buildAllowedOrigins(): string[] {
  const origins = [env.HUB_URL, env.ADMIN_URL, ...env.CORS_ORIGINS];
  return origins.map(normalizeOrigin);
}

function normalizeOrigin(url: string): string {
  return url.replace(TRAILING_SLASH_REGEX, "");
}

export { corsPlugin };

```

D:/1_Projects/jstonehub/apps/api/src/shared/web/healthcheck.v1.ts

```
import { Elysia } from "elysia";

/**
 * TODO: Production-ready healthcheck enhancements
 * 1. Add database connectivity check with timeout
 * 2. Add Redis connection verification
 * 3. Add MinIO/S3 bucket accessibility check
 * 4. Implement /ready endpoint for dependency readiness
 * 5. Add application version (git commit hash)
 * 6. Add system metrics (memory usage, CPU, active connections)
 * 7. Implement structured logging for healthcheck failures
 * 8. Add configurable timeout values via environment variables
 * 9. Implement graceful shutdown signal handling
 * 10. Add detailed error messages for debugging (only in non-production)
 */

export const healthcheckV1 = new Elysia().get("/live", () => ({
  status: "ok",
}));

```

D:/1_Projects/jstonehub/apps/api/src/shared/web/server.ts

```
import type { AnyElysia } from "elysia";

import process from "node:process";

import { env } from "#api/shared/config/env";
import { closeRedisConnection } from "#api/shared/queue/connection";
import { closeAllQueues } from "#api/shared/queue/producer";
import { storage } from "#api/shared/storage/storage";

async function startServer(app: AnyElysia) {
  await storage.ensureBucket();

  app.listen({
    port: env.PORT,
    hostname: "0.0.0.0",
  });

  setupGracefulShutdown(app);
}

function setupGracefulShutdown(app: AnyElysia) {
  const shutdown = async (signal: string) => {
    // biome-ignore lint/suspicious/noConsole: Shutdown logging required
    console.log(`\n⏳ API: Received ${signal}, shutting down...`);

    try {
      await closeAllQueues();
      await closeRedisConnection();
      await app.stop();

      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.log("✅ API: Shutdown complete");
      process.exit(0);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.error("❌ API: Shutdown error:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

export { startServer };

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_auth.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { AuthLayout } from "#hub/feature/auth/_auth.layout";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_public.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { PublicLayout } from "#hub/feature/auth/_public.layout";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/__root.tsx

```
import type { QueryClient } from "@tanstack/solid-query";

import { createRootRouteWithContext } from "@tanstack/solid-router";

import { RootLayout } from "../_root.layout";
import style from "../_style.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    links: [{ rel: "stylesheet", href: style }],
  }),
  component: RootLayout,
});

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/audio-processing.api.ts

```
type UploadUrlEntry = {
  fileName: string;
  key: string;
  uploadUrl: string;
};

type UploadUrlsResponse = {
  jobId: string;
  uploads: UploadUrlEntry[];
};

type ProcessResponse = {
  jobId: string;
  bullJobId: string;
  queue: string;
  status: string;
  inputFileCount: number;
};

type JobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type JobListEntry = {
  jobId: string;
  status: string;
  name: string;
  isConcatenated: boolean;
  fileCount: number;
  createdAt: string;
  expiresAt: string;
  files?: JobFileEntry[];
  error?: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

const HTTP_NO_CONTENT = 204;
const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 300;
const PERCENT_MULTIPLIER = 100;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      // use default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

function uploadFileViaXhr(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * PERCENT_MULTIPLIER));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= HTTP_OK_MIN && xhr.status < HTTP_OK_MAX) {
        resolve();
      } else {
        reject(new Error(`Upload failed: HTTP ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.send(file);
  });
}

const audioProcessingApi = {
  getUploadUrls(fileNames: string[]): Promise<UploadUrlsResponse> {
    return apiFetch("/v1/audio-processing/upload-urls", {
      method: "POST",
      body: JSON.stringify({ fileNames }),
    });
  },

  uploadFileToPresignedUrl(
    url: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    return uploadFileViaXhr(url, file, onProgress);
  },

  startProcessing(
    jobId: string,
    name: string,
    config?: Record<string, unknown>,
  ): Promise<ProcessResponse> {
    return apiFetch("/v1/audio-processing/process", {
      method: "POST",
      body: JSON.stringify({ jobId, name, config }),
    });
  },

  getJobs(): Promise<JobListEntry[]> {
    return apiFetch("/v1/audio-processing/jobs");
  },

  getJobStatus(jobId: string): Promise<JobListEntry> {
    return apiFetch(`/v1/audio-processing/jobs/${jobId}`);
  },

  deleteJob(jobId: string): Promise<void> {
    return apiFetch(`/v1/audio-processing/jobs/${jobId}`, {
      method: "DELETE",
    });
  },
};

export type {
  JobFileEntry,
  JobListEntry,
  ProcessResponse,
  UploadUrlEntry,
  UploadUrlsResponse,
};
export { audioProcessingApi };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/audio-processing.page.tsx

```
import { Button, LoadingButton } from "@packages/ui/action";
import { Alert } from "@packages/ui/feedback";
import { H1 } from "@packages/ui/typography";
import { RotateCcw } from "lucide-solid";
import { Show } from "solid-js";

import { AudioProcessingConfigPanel } from "./_audio-processing-config";
import { FileDropZone } from "./_file-drop-zone";
import { FileList } from "./_file-list";
import { JobHistory } from "./_job-history";
import { useAudioProcessing } from "./_use-audio-processing";

function AudioProcessingPage() {
  const state = useAudioProcessing();

  const showReset = () => state.phase() !== "idle" || state.files().length > 0;

  return (
    <div class="p-6 space-y-6 max-w-2xl">
      <PageHeader showReset={showReset()} onReset={state.handleReset} />

      <FileDropZone
        onFilesSelected={state.handleFilesSelected}
        disabled={state.isLocked()}
      />

      <Show when={state.files().length > 0}>
        <FileList
          files={state.files()}
          onRemove={state.handleRemoveFile}
          removable={!state.isLocked()}
        />
      </Show>

      <AudioProcessingConfigPanel
        config={state.config()}
        onConfigChange={state.setConfig}
      />

      <ProcessButton
        phase={state.phase()}
        canProcess={state.canProcess()}
        onClick={state.handleUploadAndProcess}
      />

      <Show when={state.phase() === "uploading"}>
        <div class="text-sm text-subtle">Uploading files…</div>
      </Show>

      <Show when={state.phase() === "processing"}>
        <div class="text-sm text-subtle">
          Processing started. Your job will appear below.
        </div>
      </Show>

      <Show when={state.phase() === "error"}>
        <Alert
          variant="error"
          title="Error"
          description={state.errorMessage()}
          onClose={() => state.setPhase("idle")}
          closeAriaLabel="Dismiss error"
        />
      </Show>

      <JobHistory refreshTrigger={state.refreshTrigger()} />
    </div>
  );
}

function PageHeader(props: { showReset: boolean; onReset: () => void }) {
  return (
    <div class="flex items-center justify-between">
      <H1>Audio Processing</H1>
      <Show when={props.showReset}>
        <Button variant="ghost" size="sm" onClick={props.onReset}>
          <RotateCcw size={14} />
          Reset
        </Button>
      </Show>
    </div>
  );
}

function ProcessButton(props: {
  phase: string;
  canProcess: boolean;
  onClick: () => void;
}) {
  return (
    <Show when={props.phase === "idle" || props.phase === "ready"}>
      <LoadingButton
        variant="primary"
        size="md"
        loading={false}
        disabled={!props.canProcess}
        onClick={props.onClick}
      >
        Process
      </LoadingButton>
    </Show>
  );
}

export { AudioProcessingPage };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_audio-processing-config.tsx

```
import {
  AUDIO_PROCESSING_DEFAULTS,
  AUDIO_PROCESSING_LIMITS,
  AUDIO_PROCESSING_NAME_LIMITS,
} from "@packages/contract/audio-processing";
import {
  NumberInputField,
  SwitchField,
  TextInputField,
} from "@packages/ui/form";
import { Show } from "solid-js";

type AudioProcessingUserConfig = {
  concatenationEnabled: boolean;
  normalizationEnabled: boolean;
  keepGapMs: number;
  thresholdDb: number;
  minDurationMs: number;
  betweenMs: number;
  startMs: number;
  endMs: number;
  outputName: string;
};

type AudioProcessingConfigPanelProps = {
  config: AudioProcessingUserConfig;
  onConfigChange: (config: AudioProcessingUserConfig) => void;
  showNameField?: boolean;
};

const L = AUDIO_PROCESSING_LIMITS;

function createDefaultUserConfig(): AudioProcessingUserConfig {
  const d = AUDIO_PROCESSING_DEFAULTS;
  return {
    concatenationEnabled: d.concatenation.enabled,
    normalizationEnabled: d.normalization.enabled,
    keepGapMs: d.silenceRemoval.keepGapMs,
    thresholdDb: d.silenceRemoval.thresholdDb,
    minDurationMs: d.silenceRemoval.minDurationMs,
    betweenMs: d.gaps.betweenMs,
    startMs: d.gaps.startMs,
    endMs: d.gaps.endMs,
    outputName: "",
  };
}

function buildApiConfig(
  userConfig: AudioProcessingUserConfig,
): Record<string, unknown> {
  return {
    concatenation: { enabled: userConfig.concatenationEnabled },
    normalization: { enabled: userConfig.normalizationEnabled },
    silenceRemoval: {
      keepGapMs: userConfig.keepGapMs,
      thresholdDb: userConfig.thresholdDb,
      minDurationMs: userConfig.minDurationMs,
    },
    gaps: {
      betweenMs: userConfig.concatenationEnabled ? userConfig.betweenMs : 0,
      startMs: userConfig.concatenationEnabled ? userConfig.startMs : 0,
      endMs: userConfig.concatenationEnabled ? userConfig.endMs : 0,
    },
  };
}

function AudioProcessingConfigPanel(props: AudioProcessingConfigPanelProps) {
  const showName = () => props.showNameField ?? true;

  function update(partial: Partial<AudioProcessingUserConfig>) {
    props.onConfigChange({ ...props.config, ...partial });
  }

  return (
    <div class="space-y-4">
      <Show when={showName()}>
        <TextInputField
          type="text"
          label={props.config.concatenationEnabled ? "Name" : "Prefix"}
          value={props.config.outputName}
          onValueChange={(v) => update({ outputName: v })}
          required={true}
          placeholder={
            props.config.concatenationEnabled
              ? "e.g. funny-joke-01"
              : "e.g. joke-parts"
          }
          maxLength={AUDIO_PROCESSING_NAME_LIMITS.max}
        />
      </Show>

      <SwitchField
        label="Concatenate into one file"
        checked={props.config.concatenationEnabled}
        onCheckedChange={(v) => update({ concatenationEnabled: v as boolean })}
      />

      <SwitchField
        label="Loudness normalization"
        checked={props.config.normalizationEnabled}
        onCheckedChange={(v) => update({ normalizationEnabled: v as boolean })}
      />

      <NumberInputField
        label="Inner gap (ms)"
        info="Silence kept between voiced segments within a file"
        value={props.config.keepGapMs}
        onValueChange={(v) =>
          update({
            keepGapMs: clampInt(v as number, L.silenceRemoval.keepGapMs),
          })
        }
      />

      <NumberInputField
        label="Silence threshold (dB)"
        value={props.config.thresholdDb}
        onValueChange={(v) =>
          update({
            thresholdDb: clampNum(v as number, L.silenceRemoval.thresholdDb),
          })
        }
      />

      <NumberInputField
        label="Min silence duration (ms)"
        value={props.config.minDurationMs}
        onValueChange={(v) =>
          update({
            minDurationMs: clampInt(
              v as number,
              L.silenceRemoval.minDurationMs,
            ),
          })
        }
      />

      <NumberInputField
        label="Gap between files (ms)"
        info="Only when concatenation is on"
        value={props.config.betweenMs}
        onValueChange={(v) =>
          update({ betweenMs: clampInt(v as number, L.gaps.betweenMs) })
        }
        disabled={!props.config.concatenationEnabled}
      />

      <NumberInputField
        label="Start padding (ms)"
        value={props.config.startMs}
        onValueChange={(v) =>
          update({ startMs: clampInt(v as number, L.gaps.startMs) })
        }
        disabled={!props.config.concatenationEnabled}
      />

      <NumberInputField
        label="End padding (ms)"
        value={props.config.endMs}
        onValueChange={(v) =>
          update({ endMs: clampInt(v as number, L.gaps.endMs) })
        }
        disabled={!props.config.concatenationEnabled}
      />
    </div>
  );
}

function clampInt(value: number, range: { min: number; max: number }): number {
  if (Number.isNaN(value)) {
    return range.min;
  }
  return Math.round(Math.min(Math.max(value, range.min), range.max));
}

function clampNum(value: number, range: { min: number; max: number }): number {
  if (Number.isNaN(value)) {
    return range.min;
  }
  return Math.min(Math.max(value, range.min), range.max);
}

export type { AudioProcessingUserConfig };
export { AudioProcessingConfigPanel, buildApiConfig, createDefaultUserConfig };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_countdown-timer.tsx

```
import { createSignal, onCleanup, onMount } from "solid-js";

type CountdownTimerProps = {
  expiresAt: string;
};

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;
const TICK_INTERVAL_MS = 1000;

function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) {
    return "Expired";
  }

  const days = Math.floor(remainingMs / MS_IN_DAY);
  const hours = Math.floor((remainingMs % MS_IN_DAY) / MS_IN_HOUR);
  const minutes = Math.floor((remainingMs % MS_IN_HOUR) / MS_IN_MINUTE);
  const seconds = Math.floor((remainingMs % MS_IN_MINUTE) / MS_IN_SECOND);

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

function CountdownTimer(props: CountdownTimerProps) {
  const [text, setText] = createSignal("");

  let timer: ReturnType<typeof setInterval> | null = null;

  function tick() {
    const remaining = new Date(props.expiresAt).getTime() - Date.now();
    setText(formatCountdown(remaining));

    if (remaining <= 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  onMount(() => {
    tick();
    timer = setInterval(tick, TICK_INTERVAL_MS);
  });

  onCleanup(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  return (
    <span class="text-xs text-subtle tabular-nums font-mono">{text()}</span>
  );
}

export { CountdownTimer };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_file-drop-zone.tsx

```
import type { JSX } from "solid-js";

import { AUDIO_PROCESSING_UPLOAD_LIMITS } from "@packages/contract/audio-processing";
import { BYTES_IN_MB } from "@packages/contract/format";
import { createSignal } from "solid-js";

type FileDropZoneProps = {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
};

const ACCEPTED_EXTENSIONS = ".mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.opus";

const MAX_FILE_SIZE_MB = Math.round(
  AUDIO_PROCESSING_UPLOAD_LIMITS.maxFileSizeBytes / BYTES_IN_MB,
);

const LABEL_STYLE = [
  "block w-full border-2 border-dashed rounded-lg p-8 text-center",
  "transition-colors duration-150 cursor-pointer",
].join(" ");

const LABEL_ACTIVE_STYLE = "border-primary bg-primary/5";
const LABEL_IDLE_STYLE = "border-border hover:border-primary/50";
const LABEL_DISABLED_STYLE = "border-border opacity-50 cursor-not-allowed";

function FileDropZone(props: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = createSignal(false);

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      processFiles([...target.files]);
      target.value = "";
    }
  }

  function processFiles(files: File[]) {
    const valid = files.filter(
      (f) => f.size <= AUDIO_PROCESSING_UPLOAD_LIMITS.maxFileSizeBytes,
    );
    const limited = valid.slice(0, AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles);
    if (limited.length > 0) {
      props.onFilesSelected(limited);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (props.disabled) {
      return;
    }

    const files = e.dataTransfer?.files;
    if (files) {
      processFiles([...files]);
    }
  }

  const labelClass = (): string => {
    if (props.disabled) {
      return `${LABEL_STYLE} ${LABEL_DISABLED_STYLE}`;
    }
    if (isDragOver()) {
      return `${LABEL_STYLE} ${LABEL_ACTIVE_STYLE}`;
    }
    return `${LABEL_STYLE} ${LABEL_IDLE_STYLE}`;
  };

  return (
    <DropZoneWrapper
      class={labelClass()}
      onDragActive={() => {
        if (!props.disabled) {
          setIsDragOver(true);
        }
      }}
      onDragInactive={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* biome-ignore lint/correctness/noRestrictedElements: hidden file input requires native element */}
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple={true}
        class="hidden"
        disabled={props.disabled}
        onChange={handleInputChange}
      />
      <div class="text-foreground font-medium mb-1">
        Drop audio files here or click to browse
      </div>
      <div class="text-subtle text-sm">
        MP3, WAV, OGG, FLAC, M4A, AAC, WMA, OPUS — max{" "}
        {AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles} files, {MAX_FILE_SIZE_MB}
        MB each
      </div>
    </DropZoneWrapper>
  );
}

function DropZoneWrapper(props: {
  class: string;
  onDragActive: () => void;
  onDragInactive: () => void;
  onDrop: (e: DragEvent) => void;
  children: JSX.Element;
}) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: label with hidden input is inherently interactive; drag handlers are needed for drop zone
    // biome-ignore lint/correctness/noRestrictedElements: label with hidden input is inherently interactive; drag handlers are needed for drop zone
    // biome-ignore lint/a11y/noLabelWithoutControl: label with hidden input is inherently interactive; drag handlers are needed for drop zone
    <label
      class={props.class}
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        props.onDragActive();
      }}
      onDragLeave={() => props.onDragInactive()}
      onDrop={props.onDrop}
    >
      {props.children}
    </label>
  );
}

export { FileDropZone };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_file-list.tsx

```
import { IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { Progress } from "@packages/ui/feedback";
import { X } from "lucide-solid";
import { createSignal, For, onCleanup, Show } from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";

type FileEntry = {
  file: File;
  uploadProgress: number;
  status: "pending" | "uploading" | "uploaded" | "error";
  errorMessage?: string;
};

type FileListProps = {
  files: FileEntry[];
  onRemove: (index: number) => void;
  removable: boolean;
};

function FileList(props: FileListProps) {
  return (
    <div class="space-y-2">
      <For each={props.files}>
        {(entry, index) => (
          <FileRow
            entry={entry}
            onRemove={() => props.onRemove(index())}
            removable={props.removable}
          />
        )}
      </For>
    </div>
  );
}

function FileRow(props: {
  entry: FileEntry;
  onRemove: () => void;
  removable: boolean;
}) {
  const { entry } = props;
  const [objectUrl, setObjectUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = objectUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  function getSrc(): string {
    let url = objectUrl();
    if (!url) {
      url = URL.createObjectURL(entry.file);
      setObjectUrl(url);
    }
    return url;
  }

  return (
    <div class="space-y-1">
      <AudioPlayer
        name={entry.file.name}
        src={getSrc()}
        size={entry.file.size}
        actions={() => (
          <div class="flex items-center gap-1">
            <Show when={entry.status === "uploaded"}>
              <Badge variant="success" size="sm" aria-label="Uploaded">
                ✓
              </Badge>
            </Show>
            <Show when={entry.status === "error"}>
              <Badge variant="error" size="sm" aria-label="Upload error">
                ✗
              </Badge>
            </Show>
            <Show
              when={
                props.removable
                || entry.status === "uploaded"
                || entry.status === "error"
              }
            >
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Remove ${entry.file.name}`}
                onClick={props.onRemove}
              >
                <X size={14} />
              </IconButton>
            </Show>
          </div>
        )}
      />
      <Show when={entry.status === "uploading"}>
        <div class="px-3">
          <Progress
            max={100}
            success={entry.uploadProgress}
            formatLabel={(done) => `${done}%`}
          />
        </div>
      </Show>
      <Show when={entry.errorMessage}>
        <div class="text-xs text-error-foreground px-3">
          {entry.errorMessage}
        </div>
      </Show>
    </div>
  );
}

export type { FileEntry };
export { FileList };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_job-card.tsx

```
import type { JobListEntry } from "./audio-processing.api";

import { IconButton } from "@packages/ui/action";
import { Download, Loader2, Trash2 } from "lucide-solid";
import { createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";

import { CountdownTimer } from "./_countdown-timer";

type JobCardProps = {
  job: JobListEntry;
  onDelete: (jobId: string) => void;
  deleting: boolean;
};

const PROCESSING_STATUSES = new Set(["active", "waiting", "delayed"]);

function JobCard(props: JobCardProps) {
  return (
    <Switch>
      <Match when={PROCESSING_STATUSES.has(props.job.status)}>
        <ProcessingCard job={props.job} />
      </Match>
      <Match when={props.job.status === "completed"}>
        <CompletedCard
          job={props.job}
          onDelete={props.onDelete}
          deleting={props.deleting}
        />
      </Match>
      <Match when={props.job.status === "failed"}>
        <FailedCard
          job={props.job}
          onDelete={props.onDelete}
          deleting={props.deleting}
        />
      </Match>
    </Switch>
  );
}

function ProcessingCard(props: { job: JobListEntry }) {
  const modeLabel = () =>
    props.job.isConcatenated ? "Concatenated" : "Individual";
  const fileLabel = () =>
    props.job.fileCount > 1 ? `${props.job.fileCount} files` : "1 file";

  return (
    <div class="rounded-lg border border-info-border bg-info/10 p-4 space-y-1 animate-pulse">
      <div class="flex items-center gap-2">
        <Loader2 size={16} class="text-info-foreground animate-spin" />
        <span class="text-sm font-medium text-foreground">
          {props.job.name}
        </span>
        <Show when={!props.job.isConcatenated}>
          <span class="text-xs text-subtle">({fileLabel()})</span>
        </Show>
      </div>
      <div class="text-xs text-subtle">{modeLabel()} • Processing...</div>
    </div>
  );
}

function CompletedCard(props: {
  job: JobListEntry;
  onDelete: (jobId: string) => void;
  deleting: boolean;
}) {
  const files = () => props.job.files ?? [];
  const hasMultipleFiles = () => files().length > 1;

  function handleDownloadAll() {
    for (const file of files()) {
      downloadFile(file.downloadUrl, file.fileName);
    }
  }

  return (
    <div class="rounded-lg border border-success-border bg-success/10 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-foreground">
            {props.job.name}
          </span>
          <Show when={hasMultipleFiles()}>
            <span class="text-xs text-subtle">({files().length} files)</span>
          </Show>
        </div>
        <div class="flex items-center gap-2">
          <CountdownTimer expiresAt={props.job.expiresAt} />
          <Show when={hasMultipleFiles()}>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Download all files"
              onClick={handleDownloadAll}
            >
              <Download size={14} />
            </IconButton>
          </Show>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Delete ${props.job.name}`}
            disabled={props.deleting}
            onClick={() => props.onDelete(props.job.jobId)}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
      <div class="space-y-2">
        <For each={files()}>
          {(file) => (
            <CompletedFileRow
              fileName={file.fileName}
              sizeBytes={file.sizeBytes}
              downloadUrl={file.downloadUrl}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function CompletedFileRow(props: {
  fileName: string;
  sizeBytes: number;
  downloadUrl: string;
}) {
  const [cachedBlobUrl, setCachedBlobUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = cachedBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  async function getOrFetchBlobUrl(): Promise<string> {
    const existing = cachedBlobUrl();
    if (existing) {
      return existing;
    }
    const response = await fetch(props.downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(url);
    return url;
  }

  return (
    <AudioPlayer
      name={props.fileName}
      src={getOrFetchBlobUrl}
      size={props.sizeBytes}
      actions={(audioState) => (
        <IconButton
          variant="outline"
          size="sm"
          aria-label={`Download ${props.fileName}`}
          onClick={() =>
            handleFileDownload(
              audioState.blobUrl,
              props.downloadUrl,
              props.fileName,
            )
          }
        >
          <Download size={14} />
        </IconButton>
      )}
    />
  );
}

function FailedCard(props: {
  job: JobListEntry;
  onDelete: (jobId: string) => void;
  deleting: boolean;
}) {
  return (
    <div class="rounded-lg border border-error-border bg-error/10 p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-foreground">
          {props.job.name}
        </span>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Delete ${props.job.name}`}
          disabled={props.deleting}
          onClick={() => props.onDelete(props.job.jobId)}
        >
          <Trash2 size={14} />
        </IconButton>
      </div>
      <div class="text-xs text-error-foreground mt-1">
        {props.job.error ?? "Processing failed"}
      </div>
    </div>
  );
}

function handleFileDownload(
  blobUrl: string | null,
  downloadUrl: string,
  fileName: string,
) {
  if (blobUrl) {
    triggerDownload(blobUrl, fileName);
  } else {
    fetch(downloadUrl)
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
      });
  }
}

function downloadFile(url: string, fileName: string) {
  fetch(url)
    .then((r) => r.blob())
    .then((b) => {
      const blobUrl = URL.createObjectURL(b);
      triggerDownload(blobUrl, fileName);
      URL.revokeObjectURL(blobUrl);
    });
}

function triggerDownload(blobUrl: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export { JobCard };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_job-history.tsx

```
import type { JobListEntry } from "./audio-processing.api";

import { H3 } from "@packages/ui/typography";
import {
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { JobCard } from "./_job-card";
import { audioProcessingApi } from "./audio-processing.api";

type JobHistoryProps = {
  refreshTrigger: number;
};

const POLL_INTERVAL_MS = 5000;
const PROCESSING_STATUSES = new Set(["active", "waiting", "delayed"]);

function JobHistory(props: JobHistoryProps) {
  const [jobs, setJobs] = createSignal<JobListEntry[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  async function loadJobs() {
    try {
      const result = await audioProcessingApi.getJobs();
      setJobs(result);
    } catch {
      // biome-ignore lint/suspicious/noConsole: non-critical polling error
      console.warn("Failed to load job history");
    } finally {
      setLoading(false);
    }
  }

  function hasActiveJobs(): boolean {
    return jobs().some((j) => PROCESSING_STATUSES.has(j.status));
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
      if (hasActiveJobs()) {
        loadJobs();
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  async function handleDelete(jobId: string) {
    setDeletingId(jobId);
    try {
      await audioProcessingApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    } catch {
      // biome-ignore lint/suspicious/noConsole: non-critical delete error
      console.warn("Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  }

  onMount(() => {
    loadJobs();
    startPolling();
  });

  onCleanup(() => {
    stopPolling();
  });

  createEffect(
    on(
      () => props.refreshTrigger,
      () => {
        loadJobs();
      },
      { defer: true },
    ),
  );

  return (
    <div class="space-y-4">
      <H3>Recent Jobs</H3>
      <Show when={loading()}>
        <div class="text-sm text-subtle">Loading...</div>
      </Show>
      <Show when={!loading() && jobs().length === 0}>
        <div class="text-sm text-subtle">No jobs yet</div>
      </Show>
      <For each={jobs()}>
        {(job) => (
          <JobCard
            job={job}
            onDelete={handleDelete}
            deleting={deletingId() === job.jobId}
          />
        )}
      </For>
    </div>
  );
}

export { JobHistory };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_use-audio-processing.ts

```
import type { AudioProcessingUserConfig } from "./_audio-processing-config";

import { createSignal } from "solid-js";

import {
  buildApiConfig,
  createDefaultUserConfig,
} from "./_audio-processing-config";
import { useFileUpload } from "./_use-file-upload";
import { audioProcessingApi } from "./audio-processing.api";

type PagePhase = "idle" | "uploading" | "processing" | "completed" | "error";

function useAudioProcessing() {
  const [phase, setPhase] = createSignal<PagePhase>("idle");
  const [config, setConfig] = createSignal<AudioProcessingUserConfig>(
    createDefaultUserConfig(),
  );
  const [errorMessage, setErrorMessage] = createSignal("");
  const [refreshTrigger, setRefreshTrigger] = createSignal(0);

  const upload = useFileUpload();

  const isLocked = () => phase() === "uploading" || phase() === "processing";

  const canProcess = () =>
    upload.files().length > 0
    && config().outputName.trim().length > 0
    && !isLocked();

  function triggerRefresh() {
    setRefreshTrigger((prev) => prev + 1);
  }

  return {
    phase,
    files: upload.files,
    config,
    setConfig,
    errorMessage,
    isLocked,
    canProcess,
    setPhase,
    refreshTrigger,
    handleFilesSelected: upload.addFiles,
    handleRemoveFile: upload.removeFile,
    handleUploadAndProcess: () =>
      handleUploadAndProcess({
        upload,
        config: config(),
        setPhase,
        setErrorMessage,
        triggerRefresh,
      }),
    handleReset: () =>
      handleReset({
        upload,
        setPhase,
        setConfig,
        setErrorMessage,
      }),
  };
}

type UploadAndProcessDeps = {
  upload: ReturnType<typeof useFileUpload>;
  config: AudioProcessingUserConfig;
  setPhase: (phase: PagePhase) => void;
  setErrorMessage: (msg: string) => void;
  triggerRefresh: () => void;
};

async function handleUploadAndProcess(deps: UploadAndProcessDeps) {
  const currentFiles = deps.upload.files();
  if (currentFiles.length === 0) {
    return;
  }

  deps.setPhase("uploading");
  deps.setErrorMessage("");

  try {
    const fileNames = currentFiles.map((f) => f.file.name);
    const { jobId, uploads } =
      await audioProcessingApi.getUploadUrls(fileNames);

    await deps.upload.uploadAll(uploads);

    if (!deps.upload.allUploaded()) {
      deps.setPhase("error");
      deps.setErrorMessage("Some files failed to upload");
      return;
    }

    deps.setPhase("processing");
    const apiConfig = buildApiConfig(deps.config);
    await audioProcessingApi.startProcessing(
      jobId,
      deps.config.outputName.trim(),
      apiConfig,
    );

    deps.setPhase("idle");
    deps.upload.resetFiles();
    deps.triggerRefresh();
  } catch (err) {
    deps.setPhase("error");
    deps.setErrorMessage(
      err instanceof Error ? err.message : "An unexpected error occurred",
    );
  }
}

type ResetDeps = {
  upload: ReturnType<typeof useFileUpload>;
  setPhase: (phase: PagePhase) => void;
  setConfig: (config: AudioProcessingUserConfig) => void;
  setErrorMessage: (msg: string) => void;
};

function handleReset(deps: ResetDeps) {
  deps.setPhase("idle");
  deps.upload.resetFiles();
  deps.setConfig(createDefaultUserConfig());
  deps.setErrorMessage("");
}

export { useAudioProcessing };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/audio-processing/_use-file-upload.ts

```
import type { FileEntry } from "./_file-list";

import { createSignal } from "solid-js";

import { audioProcessingApi } from "./audio-processing.api";

function useFileUpload() {
  const [files, setFiles] = createSignal<FileEntry[]>([]);

  function addFiles(newFiles: File[]) {
    const entries: FileEntry[] = newFiles.map((f) => ({
      file: f,
      uploadProgress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFileAt(index: number, partial: Partial<FileEntry>) {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...partial } : f)),
    );
  }

  function resetFiles() {
    setFiles([]);
  }

  function allUploaded(): boolean {
    return files().every((f) => f.status === "uploaded");
  }

  async function uploadAll(
    uploads: { fileName: string; key: string; uploadUrl: string }[],
  ): Promise<void> {
    const currentFiles = files();
    const promises = currentFiles.map(async (entry, index) => {
      const upload = uploads[index];
      if (!upload) {
        return;
      }

      updateFileAt(index, { status: "uploading" });

      try {
        await audioProcessingApi.uploadFileToPresignedUrl(
          upload.uploadUrl,
          entry.file,
          (percent) => updateFileAt(index, { uploadProgress: percent }),
        );
        updateFileAt(index, { status: "uploaded", uploadProgress: 100 });
      } catch (err) {
        updateFileAt(index, {
          status: "error",
          errorMessage: err instanceof Error ? err.message : "Upload failed",
        });
      }
    });

    await Promise.all(promises);
  }

  return { files, addFiles, removeFile, resetFiles, allUploaded, uploadAll };
}

export { useFileUpload };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/auth/_auth.layout.tsx

```
import type { SidebarGroupItem } from "@packages/ui/layout";

import { Logo } from "@packages/ui/data-display";
import {
  AppLayout,
  ContentShell,
  Navigation,
  SidebarDesktopToggle,
  SidebarMobileTrigger,
} from "@packages/ui/layout";
import { ModeToggle } from "@packages/ui/theme";
import { Link, Outlet, useLocation } from "@tanstack/solid-router";
import { ArrowLeftRight } from "lucide-solid";

import { env } from "#hub/shared/config/env";

import { GROUP_CHILD_ROUTES, SIDEBAR_ITEMS } from "./_sidebar-item";

function AuthLayout() {
  const location = useLocation();

  const hasActiveChild = (group: SidebarGroupItem) => {
    const routes = GROUP_CHILD_ROUTES[group.label];
    if (!routes) {
      return false;
    }
    return routes.some((route) => location().pathname.startsWith(route));
  };

  return (
    <AppLayout>
      <Navigation desktop={<DesktopNav />} mobile={<MobileNav />} />
      <ContentShell
        logo={
          <Logo appName="hub">
            {(logoProps) => <Link to="/" {...logoProps} />}
          </Logo>
        }
        sidebarItems={SIDEBAR_ITEMS}
        main={<Outlet />}
        closeLabel="Close sidebar"
        hasActiveChild={hasActiveChild}
      />
    </AppLayout>
  );
}

function AppSwitchLink() {
  return (
    <a
      href={env.ADMIN_URL}
      class="flex items-center gap-[6px] text-[13px] text-subtle hover:text-foreground transition-colors duration-normal px-[8px] py-[4px] rounded-sm"
      title="Switch to Admin"
    >
      <ArrowLeftRight size={14} />
      <span>Admin</span>
    </a>
  );
}

function DesktopNav() {
  return (
    <>
      <div class="flex items-center gap-[12px]">
        <Logo appName="hub">
          {(logoProps) => <Link to="/" {...logoProps} />}
        </Logo>
        <SidebarDesktopToggle aria-label="Toggle sidebar" />
      </div>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

function MobileNav() {
  return (
    <>
      <SidebarMobileTrigger aria-label="Open menu" />
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

export { AuthLayout };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/auth/_public.layout.tsx

```
import { Logo } from "@packages/ui/data-display";
import { AppLayout, Navigation } from "@packages/ui/layout";
import { ModeToggle } from "@packages/ui/theme";
import { Link, Outlet } from "@tanstack/solid-router";
import { ArrowLeftRight } from "lucide-solid";

import { env } from "#hub/shared/config/env";

function PublicLayout() {
  return (
    <AppLayout>
      <Navigation desktop={<DesktopNav />} mobile={<MobileNav />} />
      <Outlet />
    </AppLayout>
  );
}

function AppSwitchLink() {
  return (
    <a
      href={env.ADMIN_URL}
      class="flex items-center gap-[6px] text-[13px] text-subtle hover:text-foreground transition-colors duration-normal px-[8px] py-[4px] rounded-sm"
      title="Switch to Admin"
    >
      <ArrowLeftRight size={14} />
      <span>Admin</span>
    </a>
  );
}

function DesktopNav() {
  return (
    <>
      <Logo appName="hub">{(logoProps) => <Link to="/" {...logoProps} />}</Logo>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

function MobileNav() {
  return (
    <>
      <Logo appName="hub">{(logoProps) => <Link to="/" {...logoProps} />}</Logo>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

export { PublicLayout };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/auth/_sidebar-item.tsx

```
import type { SidebarItem } from "@packages/ui/layout";

import { Link } from "@tanstack/solid-router";
import { AudioLines, Home, Mic, Wrench } from "lucide-solid";

const GROUP_CHILD_ROUTES: Record<string, string[]> = {
  Tools: ["/tool/audio-processing", "/tool/tts"],
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    type: "link",
    icon: (props) => <Home size={props.size} />,
    label: "Home",
    render: (renderProps) => (
      <Link
        to="/"
        class={renderProps.class}
        ref={renderProps.ref}
        onMouseEnter={renderProps.onMouseEnter}
        onMouseLeave={renderProps.onMouseLeave}
        onFocus={renderProps.onFocus}
        onBlur={renderProps.onBlur}
        activeOptions={{ exact: true }}
      >
        {renderProps.children}
      </Link>
    ),
  },
  { type: "separator" },
  {
    type: "group",
    icon: (props) => <Wrench size={props.size} />,
    label: "Tools",
    defaultOpen: true,
    children: [
      {
        icon: (props) => <AudioLines size={props.size} />,
        label: "Audio Processing",
        render: (renderProps) => (
          <Link
            to="/tool/audio-processing"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
      {
        icon: (props) => <Mic size={props.size} />,
        label: "Text to Speech",
        render: (renderProps) => (
          <Link
            to="/tool/tts"
            class={renderProps.class}
            ref={renderProps.ref}
            onMouseEnter={renderProps.onMouseEnter}
            onMouseLeave={renderProps.onMouseLeave}
            onFocus={renderProps.onFocus}
            onBlur={renderProps.onBlur}
          >
            {renderProps.children}
          </Link>
        ),
      },
    ],
  },
];

export { GROUP_CHILD_ROUTES, SIDEBAR_ITEMS };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/home/home.page.tsx

```
import { H1 } from "@packages/ui/typography";

export function HomePage() {
  return (
    <div class="p-2">
      <H1>Welcome Home!</H1>
    </div>
  );
}

```

D:/1_Projects/jstonehub/apps/hub/src/shared/api/client.ts

```
import type { ApiApp } from "#api/app/api.type";

import { treaty } from "@elysiajs/eden";

import { env } from "../config/env";

export const client = treaty<ApiApp>(env.API_URL);

```

D:/1_Projects/jstonehub/apps/hub/src/shared/api/query-client.ts

```
import { QueryClient } from "@tanstack/solid-query";

export const queryClient = new QueryClient();

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/tts-create.page.tsx

```
import { Button, LoadingButton } from "@packages/ui/action";
import { Alert } from "@packages/ui/feedback";
import { TextareaField, TextInputField } from "@packages/ui/form";
import { toast } from "@packages/ui/overlay";
import { H1, H3 } from "@packages/ui/typography";
import { useNavigate } from "@tanstack/solid-router";
import { Show } from "solid-js";

import {
  RoleVoiceMappingPanel,
  SegmentEditor,
} from "#hub/shared/ui/segment-editor";

import { TtsAudioSection } from "./_tts-audio-section";
import { useTtsCreateState } from "./_use-tts-create";
import { clearDraft } from "./_use-tts-draft";
import { ttsApi } from "./tts.api";
import { createTtsProjectMutation, createVoicesQuery } from "./tts.query";

function TtsCreatePage() {
  const navigate = useNavigate({ from: "/tool/tts/create" });
  const state = useTtsCreateState();
  const voicesQuery = createVoicesQuery();
  const createMutation = createTtsProjectMutation();

  const voices = () => voicesQuery.data ?? [];

  const previewApi = {
    getPreviewUrl: async (voiceId: string, url: string): Promise<string> => {
      const result = await ttsApi.getPreviewUrl(voiceId, url);
      return result.downloadUrl;
    },
  };

  function handleSubmit() {
    if (!state.canSubmit()) {
      return;
    }

    const payload = state.buildSubmitPayload();
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("TTS project created");
        clearDraft();
        navigate({ to: "/tool/tts" });
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to create project",
        );
      },
    });
  }

  return (
    <div class="p-6 space-y-6 max-w-2xl">
      {/* Header with submit button */}
      <div class="flex items-center justify-between">
        <H1>New TTS Project</H1>
        <Show when={state.segments().length > 0}>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={createMutation.isPending}
            disabled={!state.canSubmit()}
            onClick={handleSubmit}
          >
            Start Synthesis
          </LoadingButton>
        </Show>
      </div>

      {/* 1. Name */}
      <TextInputField
        type="text"
        label="Project Name"
        value={state.name()}
        onValueChange={state.setName}
        required={true}
        placeholder="e.g. Funny joke #42"
        maxLength={100}
      />

      {/* 2. Audio settings */}
      <TtsAudioSection
        processingEnabled={state.processingEnabled()}
        onProcessingEnabledChange={state.setProcessingEnabled}
        detailConfig={state.detailConfig()}
        onDetailConfigChange={state.setDetailConfig}
      />

      {/* 3. Voice assignment */}
      <Show when={state.mappings().length > 0}>
        <RoleVoiceMappingPanel
          mappings={state.mappings()}
          onMappingsChange={state.setMappings}
          voices={voices()}
          voicesLoading={voicesQuery.isLoading}
          previewApi={previewApi}
        />
      </Show>

      {/* 4. Parse input */}
      <div class="space-y-3">
        <H3>Paste Segments (JSON or JS)</H3>
        <TextareaField
          label=""
          value={state.rawInput()}
          onValueChange={state.setRawInput}
          disabled={false}
          readonly={false}
          required={false}
          name="tts-raw-input"
          maxLength={100_000}
          minLength={0}
          placeholder={INPUT_PLACEHOLDER}
          counterLabel={(current, max) => `${current}/${max}`}
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={state.rawInput().trim().length === 0}
          onClick={state.handleParseInput}
        >
          Parse & Add
        </Button>
        <Show when={state.parseError()}>
          <Alert
            variant="error"
            title="Parse Error"
            description={state.parseError()}
          />
        </Show>
      </div>

      {/* 5. Segment editor */}
      <Show when={state.segments().length > 0}>
        <div class="space-y-3">
          <H3>Segments ({state.segments().length})</H3>
          <SegmentEditor
            segments={state.segments()}
            onSegmentsChange={state.handleSegmentsChange}
          />
        </div>
      </Show>
    </div>
  );
}

const INPUT_PLACEHOLDER = `// JSON:
[{"name": "narrator", "text": "A man walks into a bar."},
 {"name": "man", "text": "Give me a beer!"}]

// JS (also works):
[{name: 'narrator', text: 'A man walks into a bar.'},
 {name: 'man', text: "Give me a beer!"}]`;

export { TtsCreatePage };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/tts-jobs.page.tsx

```
import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";

import type { TtsJobEntry } from "./_tts-jobs-types";
import type { MergeConfig } from "./_tts-merge-dialog";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Link } from "@tanstack/solid-router";
import { Plus, RefreshCw } from "lucide-solid";
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";

import { PROCESSING_STATUSES } from "./_tts-jobs-types";
import { TtsMergeDialog } from "./_tts-merge-dialog";
import { ProjectEditCard } from "./_tts-project-edit-card";
import { ProjectViewCard } from "./_tts-project-view-card";
import { ttsApi } from "./tts.api";
import {
  createDeleteProjectMutation,
  createMergeSegmentsMutation,
  createTtsProjectsQuery,
  createVoicesQuery,
} from "./tts.query";

const POLL_INTERVAL_MS = 4000;

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: REFACTOR
function TtsJobsPage() {
  const projectsQuery = createTtsProjectsQuery();
  const voicesQuery = createVoicesQuery();
  const deleteMutation = createDeleteProjectMutation();
  const mergeMutation = createMergeSegmentsMutation();

  const [deleteDialogId, setDeleteDialogId] = createSignal<string | null>(null);
  const [mergeDialogProjectId, setMergeDialogProjectId] = createSignal<
    string | null
  >(null);
  const [forcePolling, setForcePolling] = createSignal(false);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function hasActiveProjects(): boolean {
    return (projectsQuery.data ?? []).some(
      (p) =>
        PROCESSING_STATUSES.has(p.status)
        || (p.segments ?? []).some((s) => PROCESSING_STATUSES.has(s.status)),
    );
  }

  function shouldPoll(): boolean {
    return hasActiveProjects() || forcePolling();
  }

  function startPolling() {
    if (pollTimer) {
      return;
    }
    pollTimer = setInterval(() => {
      if (shouldPoll()) {
        projectsQuery.refetch();
      } else {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    setForcePolling(false);
  }

  function ensurePolling() {
    setForcePolling(true);
    startPolling();
    // biome-ignore lint/style/noMagicNumbers: REFACTOR
    setTimeout(() => setForcePolling(false), POLL_INTERVAL_MS * 5);
  }

  createEffect(() => {
    if (hasActiveProjects()) {
      startPolling();
    }
  });

  onCleanup(() => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  });

  function handleDelete(projectId: string) {
    deleteMutation.mutate(projectId, {
      onSuccess: () => {
        toast.success("Project deleted");
        setDeleteDialogId(null);
      },
      onError: () => toast.error("Failed to delete project"),
    });
  }

  function handleRefresh() {
    projectsQuery.refetch();
    ensurePolling();
  }

  function handleMergeConfirm(config: MergeConfig) {
    const projectId = mergeDialogProjectId();
    if (!projectId) {
      return;
    }

    mergeMutation.mutate(
      { projectId, params: config },
      {
        onSuccess: () => {
          toast.success("Merge started");
          setMergeDialogProjectId(null);
          handleRefresh();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to start merge",
          );
        },
      },
    );
  }

  const mergeProject = () => {
    const id = mergeDialogProjectId();
    if (!id) {
      return null;
    }
    return (projectsQuery.data ?? []).find((p) => p.jobId === id) ?? null;
  };

  const mergeSegmentCount = () => {
    const project = mergeProject();
    if (!project) {
      return 0;
    }
    return (project.segments ?? []).filter((s) => s.status === "completed")
      .length;
  };

  const previewApi = {
    getPreviewUrl: async (voiceId: string, url: string): Promise<string> => {
      const result = await ttsApi.getPreviewUrl(voiceId, url);
      return result.downloadUrl;
    },
  };

  return (
    <div class="p-6 space-y-6 max-w-3xl">
      <div class="flex items-center justify-between">
        <H1>TTS Projects</H1>
        <div class="flex items-center gap-2">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Refresh"
            onClick={() => projectsQuery.refetch()}
          >
            <RefreshCw size={16} />
          </IconButton>
          <Link to="/tool/tts/create">
            <Button variant="primary" size="sm">
              <Plus size={16} />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <Show when={projectsQuery.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show
        when={
          !projectsQuery.isLoading && (projectsQuery.data ?? []).length === 0
        }
      >
        <div class="text-subtle text-sm text-center py-8">
          No TTS projects yet.
        </div>
      </Show>

      <div class="space-y-4">
        <For each={projectsQuery.data ?? []}>
          {(project) => (
            <ProjectCard
              project={project}
              voices={voicesQuery.data ?? []}
              voicesLoading={voicesQuery.isLoading}
              previewApi={previewApi}
              onDelete={() => setDeleteDialogId(project.jobId)}
              onRefresh={handleRefresh}
              onOpenMerge={() => setMergeDialogProjectId(project.jobId)}
            />
          )}
        </For>
      </div>

      <Dialog
        alert={true}
        open={deleteDialogId() !== null}
        onClose={() => setDeleteDialogId(null)}
        title="Delete Project"
        description="This will delete all audio files and cannot be undone."
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={() => {
                const id = deleteDialogId();
                if (id) {
                  handleDelete(id);
                }
              }}
            >
              Delete
            </LoadingButton>
          </div>
        )}
      />

      <TtsMergeDialog
        open={mergeDialogProjectId() !== null}
        onClose={() => setMergeDialogProjectId(null)}
        onConfirm={handleMergeConfirm}
        loading={mergeMutation.isPending}
        segmentCount={mergeSegmentCount()}
      />
    </div>
  );
}

type ProjectCardProps = {
  project: TtsJobEntry;
  voices: SecretVoicerVoice[];
  voicesLoading: boolean;
  previewApi: {
    getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
  };
  onDelete: () => void;
  onRefresh: () => void;
  onOpenMerge: () => void;
};

function ProjectCard(props: ProjectCardProps) {
  const [editing, setEditing] = createSignal(false);

  return (
    <Show
      when={editing()}
      fallback={
        <ProjectViewCard
          project={props.project}
          onEdit={() => setEditing(true)}
          onDelete={props.onDelete}
          onRefresh={props.onRefresh}
          onOpenMerge={props.onOpenMerge}
        />
      }
    >
      <ProjectEditCard
        project={props.project}
        voices={props.voices}
        voicesLoading={props.voicesLoading}
        previewApi={props.previewApi}
        onClose={() => setEditing(false)}
        onRefresh={props.onRefresh}
      />
    </Show>
  );
}

export { TtsJobsPage };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/tts.api.ts

```
import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      // use default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

type VoicesResponse = {
  voices: SecretVoicerVoice[];
};

type TtsJobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type TtsJobSegmentEntry = {
  index: number;
  role: string;
  text: string;
  voiceId: string;
  status: string;
  bullJobId: string | null;
  outputKey: string | null;
  error: string | null;
};

type TtsJobEntry = {
  jobId: string;
  bullJobId: string;
  name: string;
  status: string;
  segments: TtsJobSegmentEntry[];
  audioProcessingJobId: string | null;
  createdAt: string;
  completedAt: string | null;
  outputFiles: TtsJobFileEntry[];
  error: string | null;
};

type CreateTtsProjectParams = {
  name: string;
  segments: { role: string; text: string; voiceId: string }[];
  audioProcessing: {
    enabled: boolean;
    concatenate: boolean;
    config?: Record<string, unknown>;
  };
};

type CreateTtsProjectResponse = {
  projectId: string;
  status: string;
  segmentCount: number;
};

type PreviewResponse = {
  downloadUrl: string;
  cached: boolean;
};

type MergeSegmentsParams = {
  betweenMs: number;
  startMs: number;
  endMs: number;
};

type MergeSegmentsResponse = {
  audioProcessingJobId: string;
  status: string;
};

const ttsApi = {
  getVoices(): Promise<VoicesResponse> {
    return apiFetch("/v1/secret-voicer/voices");
  },

  getPreviewUrl(voiceId: string, url: string): Promise<PreviewResponse> {
    const params = new URLSearchParams({ voiceId, url });
    return apiFetch(`/v1/secret-voicer/voices/preview?${params}`);
  },

  createProject(
    params: CreateTtsProjectParams,
  ): Promise<CreateTtsProjectResponse> {
    return apiFetch("/v1/tts-projects", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  getProjects(): Promise<TtsJobEntry[]> {
    return apiFetch("/v1/tts-projects");
  },

  getProject(projectId: string): Promise<TtsJobEntry> {
    return apiFetch(`/v1/tts-projects/${projectId}`);
  },

  retrySegment(projectId: string, segmentIndex: number): Promise<void> {
    return apiFetch(
      `/v1/tts-projects/${projectId}/segments/${segmentIndex}/retry`,
      { method: "POST" },
    );
  },

  retryAllFailed(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/retry-all-failed`, {
      method: "POST",
    });
  },

  synthesizeAllPending(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/synthesize-pending`, {
      method: "POST",
    });
  },

  updateSegment(
    projectId: string,
    segmentIndex: number,
    data: { text?: string; role?: string; voiceId?: string },
  ): Promise<TtsJobEntry> {
    return apiFetch(`/v1/tts-projects/${projectId}/segments/${segmentIndex}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  addSegment(
    projectId: string,
    data: { role: string; text: string; voiceId: string; afterIndex?: number },
  ): Promise<TtsJobEntry> {
    return apiFetch(`/v1/tts-projects/${projectId}/segments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteSegment(projectId: string, segmentIndex: number): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/segments/${segmentIndex}`, {
      method: "DELETE",
    });
  },

  deleteProject(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}`, { method: "DELETE" });
  },

  mergeSegments(
    projectId: string,
    params: MergeSegmentsParams,
  ): Promise<MergeSegmentsResponse> {
    return apiFetch(`/v1/tts-projects/${projectId}/merge`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  },
  deleteMergedAudio(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/merge`, {
      method: "DELETE",
    });
  },
};

export type {
  CreateTtsProjectParams,
  CreateTtsProjectResponse,
  MergeSegmentsParams,
  MergeSegmentsResponse,
  PreviewResponse,
  TtsJobEntry,
  TtsJobFileEntry,
  TtsJobSegmentEntry,
  VoicesResponse,
};
export { ttsApi };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/tts.query.ts

```
import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";
import type { CreateQueryResult } from "@tanstack/solid-query";

import type {
  CreateTtsProjectParams,
  MergeSegmentsParams,
  TtsJobEntry,
} from "./tts.api";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { ttsApi } from "./tts.api";

const VOICES_KEY = "tts-voices";
const PROJECTS_KEY = "tts-projects";

function createVoicesQuery(): CreateQueryResult<SecretVoicerVoice[]> {
  return createQuery(() => ({
    queryKey: [VOICES_KEY],
    queryFn: async () => {
      const response = await ttsApi.getVoices();
      return response.voices;
    },
    staleTime: 3_600_000,
  }));
}

function createTtsProjectsQuery(): CreateQueryResult<TtsJobEntry[]> {
  return createQuery(() => ({
    queryKey: [PROJECTS_KEY],
    queryFn: () => ttsApi.getProjects(),
  }));
}

function createTtsProjectMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: CreateTtsProjectParams) => ttsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createRetrySegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      segmentIndex,
    }: {
      projectId: string;
      segmentIndex: number;
    }) => ttsApi.retrySegment(projectId, segmentIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createRetryAllFailedMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (projectId: string) => ttsApi.retryAllFailed(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createSynthesizeAllPendingMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (projectId: string) => ttsApi.synthesizeAllPending(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createUpdateSegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      segmentIndex,
      data,
    }: {
      projectId: string;
      segmentIndex: number;
      data: { text?: string; role?: string; voiceId?: string };
    }) => ttsApi.updateSegment(projectId, segmentIndex, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createDeleteSegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      segmentIndex,
    }: {
      projectId: string;
      segmentIndex: number;
    }) => ttsApi.deleteSegment(projectId, segmentIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createAddSegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      ...data
    }: {
      projectId: string;
      role: string;
      text: string;
      voiceId: string;
      afterIndex?: number;
    }) => ttsApi.addSegment(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (projectId: string) => ttsApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createMergeSegmentsMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      params,
    }: {
      projectId: string;
      params: MergeSegmentsParams;
    }) => ttsApi.mergeSegments(projectId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

export {
  createAddSegmentMutation,
  createDeleteProjectMutation,
  createDeleteSegmentMutation,
  createMergeSegmentsMutation,
  createRetryAllFailedMutation,
  createRetrySegmentMutation,
  createSynthesizeAllPendingMutation,
  createTtsProjectMutation,
  createTtsProjectsQuery,
  createUpdateSegmentMutation,
  createVoicesQuery,
};

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-audio-config.tsx

```
import { SwitchField } from "@packages/ui/form";
import { H3 } from "@packages/ui/typography";

type TtsAudioSettings = {
  enabled: boolean;
  concatenate: boolean;
  config: Record<string, unknown>;
};

type TtsAudioConfigProps = {
  settings: TtsAudioSettings;
  onSettingsChange: (settings: TtsAudioSettings) => void;
};

function TtsAudioConfig(props: TtsAudioConfigProps) {
  function update(partial: Partial<TtsAudioSettings>) {
    props.onSettingsChange({ ...props.settings, ...partial });
  }

  return (
    <div class="space-y-3">
      <H3>Audio Processing</H3>

      <SwitchField
        label="Process audio after synthesis"
        info="Remove silence, normalize loudness"
        checked={props.settings.enabled}
        onCheckedChange={(v) => update({ enabled: v as boolean })}
      />

      <SwitchField
        label="Concatenate into one file"
        info="Merge all segments into a single audio file"
        checked={props.settings.concatenate}
        onCheckedChange={(v) => update({ concatenate: v as boolean })}
        disabled={!props.settings.enabled}
      />
    </div>
  );
}

export type { TtsAudioSettings };
export { TtsAudioConfig };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-audio-section.tsx

```
import type { AudioProcessingUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

import { Button } from "@packages/ui/action";
import { SwitchField } from "@packages/ui/form";
import { Settings2 } from "lucide-solid";
import { createSignal, Show } from "solid-js";

import { TtsAudioSettingsDialog } from "./_tts-audio-settings-dialog";

type TtsAudioSectionProps = {
  processingEnabled: boolean;
  onProcessingEnabledChange: (v: boolean) => void;
  detailConfig: AudioProcessingUserConfig;
  onDetailConfigChange: (config: AudioProcessingUserConfig) => void;
};

function TtsAudioSection(props: TtsAudioSectionProps) {
  const [detailOpen, setDetailOpen] = createSignal(false);

  return (
    <div class="rounded-lg border border-border p-4 space-y-3 bg-card">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Audio Processing</span>
        <Show when={props.processingEnabled}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailOpen(true)}
          >
            <Settings2 size={14} />
            Details
          </Button>
        </Show>
      </div>

      <SwitchField
        label="Process audio after synthesis"
        info="Remove silence, normalize loudness, concatenate segments"
        checked={props.processingEnabled}
        onCheckedChange={(v) => props.onProcessingEnabledChange(v as boolean)}
      />

      <TtsAudioSettingsDialog
        open={detailOpen()}
        onClose={() => setDetailOpen(false)}
        config={props.detailConfig}
        onConfigChange={props.onDetailConfigChange}
      />
    </div>
  );
}

export type { TtsAudioSectionProps };
export { TtsAudioSection };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-audio-settings-dialog.tsx

```
import type { AudioProcessingUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

import { Button } from "@packages/ui/action";
import { Dialog } from "@packages/ui/overlay";
import { createEffect, createSignal } from "solid-js";

import { AudioProcessingConfigPanel } from "#hub/feature/audio-processing/_audio-processing-config";

type TtsAudioSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  config: AudioProcessingUserConfig;
  onConfigChange: (config: AudioProcessingUserConfig) => void;
};

function TtsAudioSettingsDialog(props: TtsAudioSettingsDialogProps) {
  const [local, setLocal] = createSignal<AudioProcessingUserConfig>(
    props.config,
  );

  // Sync local state when dialog opens
  createEffect(() => {
    if (props.open) {
      setLocal(props.config);
    }
  });

  function handleSave() {
    props.onConfigChange(local());
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={props.onClose}
      title="Audio Processing Settings"
      description="Configure silence removal, normalization, gaps and output format."
      content={() => (
        <AudioProcessingConfigPanel
          config={local()}
          onConfigChange={setLocal}
          showNameField={false}
        />
      )}
      footer={() => (
        <div class="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Apply
          </Button>
        </div>
      )}
    />
  );
}

export { TtsAudioSettingsDialog };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-jobs-helpers.ts

```
import type { RoleVoiceMapping } from "@packages/contract/segment";

import type { TtsJobSegmentEntry } from "./_tts-jobs-types";

const DOWNLOAD_STAGGER_MS = 300;

function buildMappingsFromSegments(
  segments: TtsJobSegmentEntry[],
): RoleVoiceMapping[] {
  const seen = new Map<string, string>();
  for (const seg of segments) {
    const key = seg.role.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, seg.voiceId);
    }
  }
  return [...seen.entries()].map(([, voiceId], i) => ({
    role:
      segments.find((s) => s.role.toLowerCase() === [...seen.keys()][i])?.role
      ?? "",
    voiceId,
  }));
}

function getUniqueRoles(segments: { role: string }[]): string[] {
  const seen = new Set<string>();
  const roles: string[] = [];
  for (const seg of segments) {
    const key = seg.role.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      roles.push(seg.role.trim());
    }
  }
  return roles;
}

function handleFileDownload(
  blobUrl: string | null,
  downloadUrl: string,
  fileName: string,
): void {
  if (blobUrl) {
    triggerDownload(blobUrl, fileName);
  } else {
    fetch(downloadUrl)
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
      });
  }
}

function downloadFile(url: string, fileName: string): void {
  fetch(url)
    .then((r) => r.blob())
    .then((b) => {
      const blobUrl = URL.createObjectURL(b);
      triggerDownload(blobUrl, fileName);
      URL.revokeObjectURL(blobUrl);
    });
}

async function downloadAllFiles(
  files: { downloadUrl: string; fileName: string }[],
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) {
      continue;
    }
    downloadFile(file.downloadUrl, file.fileName);
    if (i < files.length - 1) {
      // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER
      await sleep(DOWNLOAD_STAGGER_MS);
    }
  }
}

function triggerDownload(blobUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export {
  buildMappingsFromSegments,
  downloadAllFiles,
  downloadFile,
  getUniqueRoles,
  handleFileDownload,
};

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-jobs-types.ts

```
export type TtsJobSegmentEntry = {
  index: number;
  role: string;
  text: string;
  voiceId: string;
  status: string;
  bullJobId: string | null;
  outputKey: string | null;
  error: string | null;
};

export type TtsJobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

export type TtsJobEntry = {
  jobId: string;
  bullJobId: string;
  name: string;
  status: string;
  segments: TtsJobSegmentEntry[];
  audioProcessingJobId: string | null;
  createdAt: string;
  completedAt: string | null;
  outputFiles: TtsJobFileEntry[];
  error: string | null;
};

export const PROCESSING_STATUSES = new Set(["queued", "processing", "pending"]);
export const DONE_STATUSES = new Set(["completed"]);
export const FAILED_STATUSES = new Set(["failed", "error"]);
export const SEGMENT_INDEX_PAD_LENGTH = 4;

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-merge-dialog.tsx

```
import { AUDIO_PROCESSING_LIMITS } from "@packages/contract/audio-processing";
import { Button, LoadingButton } from "@packages/ui/action";
import { NumberInputField } from "@packages/ui/form";
import { Dialog } from "@packages/ui/overlay";
import { createSignal } from "solid-js";

type MergeConfig = {
  betweenMs: number;
  startMs: number;
  endMs: number;
};

type TtsMergeDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: MergeConfig) => void;
  loading: boolean;
  segmentCount: number;
};

const L = AUDIO_PROCESSING_LIMITS.gaps;

const DEFAULT_BETWEEN_MS = 50;

function TtsMergeDialog(props: TtsMergeDialogProps) {
  const [betweenMs, setBetweenMs] = createSignal(DEFAULT_BETWEEN_MS);
  const [startMs, setStartMs] = createSignal(0);
  const [endMs, setEndMs] = createSignal(0);

  function handleConfirm() {
    props.onConfirm({
      betweenMs: betweenMs(),
      startMs: startMs(),
      endMs: endMs(),
    });
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={props.onClose}
      title="Merge into one file"
      description={`Concatenate ${props.segmentCount} segment(s) into a single audio file.`}
      content={() => (
        <div class="space-y-4">
          <NumberInputField
            label="Gap between segments (ms)"
            info="Silence inserted between each segment"
            value={betweenMs()}
            onValueChange={(v) =>
              setBetweenMs(clampInt(v as number, L.betweenMs))
            }
          />
          <NumberInputField
            label="Start padding (ms)"
            info="Silence at the beginning of the merged file"
            value={startMs()}
            onValueChange={(v) => setStartMs(clampInt(v as number, L.startMs))}
          />
          <NumberInputField
            label="End padding (ms)"
            info="Silence at the end of the merged file"
            value={endMs()}
            onValueChange={(v) => setEndMs(clampInt(v as number, L.endMs))}
          />
        </div>
      )}
      footer={() => (
        <div class="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={props.loading}
            onClick={handleConfirm}
          >
            Merge
          </LoadingButton>
        </div>
      )}
    />
  );
}

function clampInt(value: number, range: { min: number; max: number }): number {
  if (Number.isNaN(value)) {
    return range.min;
  }
  return Math.round(Math.min(Math.max(value, range.min), range.max));
}

export type { MergeConfig };
export { TtsMergeDialog };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-merged-audio-section.tsx

```
import type {
  JobFileEntry,
  JobListEntry,
} from "#hub/feature/audio-processing/audio-processing.api";

import { IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { toast } from "@packages/ui/overlay";
import { H3 } from "@packages/ui/typography";
import { Download, Loader2, Trash2 } from "lucide-solid";
import {
  createEffect,
  createSignal,
  For,
  Match,
  on,
  onCleanup,
  Switch,
} from "solid-js";

import { audioProcessingApi } from "#hub/feature/audio-processing/audio-processing.api";
import { AudioPlayer } from "#hub/shared/ui/audio-player";

import { ttsApi } from "./tts.api";

type MergedAudioSectionProps = {
  projectId: string;
  audioProcessingJobId: string | null;
  onDeleted: () => void;
};

type MergedState =
  | { phase: "idle" }
  | { phase: "polling"; jobId: string }
  | { phase: "completed"; jobId: string; files: JobFileEntry[] }
  | { phase: "failed"; jobId: string; error: string };

const POLL_INTERVAL_MS = 4000;
const ACTIVE_STATUSES = new Set(["active", "waiting", "delayed"]);

function MergedAudioSection(props: MergedAudioSectionProps) {
  const [state, setState] = createSignal<MergedState>({ phase: "idle" });
  const [deleting, setDeleting] = createSignal(false);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  onCleanup(() => stopPolling());

  createEffect(
    on(
      () => props.audioProcessingJobId,
      (jobId) => {
        stopPolling();

        if (!jobId) {
          setState({ phase: "idle" });
          return;
        }

        setState({ phase: "polling", jobId });
        loadJobStatus(jobId);
        pollTimer = setInterval(() => loadJobStatus(jobId), POLL_INTERVAL_MS);
      },
    ),
  );

  async function loadJobStatus(jobId: string) {
    try {
      const job = await audioProcessingApi.getJobStatus(jobId);
      applyJobState(jobId, job);
    } catch {
      // Job not found (404) or other error — stop polling, go idle
      stopPolling();
      setState({ phase: "idle" });
    }
  }

  function applyJobState(jobId: string, job: JobListEntry) {
    if (job.status === "completed" && job.files && job.files.length > 0) {
      stopPolling();
      setState({ phase: "completed", jobId, files: job.files });
      return;
    }

    if (job.status === "failed") {
      stopPolling();
      setState({
        phase: "failed",
        jobId,
        error: job.error ?? "Merge failed",
      });
      return;
    }

    if (!ACTIVE_STATUSES.has(job.status)) {
      stopPolling();
      setState({ phase: "idle" });
    }
  }

  async function handleDelete() {
    const current = state();
    if (current.phase !== "completed" && current.phase !== "failed") {
      return;
    }

    setDeleting(true);
    try {
      // Delete merged files from storage via dedicated endpoint
      await ttsApi.deleteMergedAudio(props.projectId);

      // Also try to remove the audio-processing job entry
      try {
        await audioProcessingApi.deleteJob(current.jobId);
      } catch {
        // non-critical — job may already be gone
      }

      toast.success("Merged audio deleted");
      setState({ phase: "idle" });
      props.onDeleted();
    } catch {
      toast.error("Failed to delete merged audio");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Switch>
      <Match when={state().phase === "idle"}>{null}</Match>

      <Match when={state().phase === "polling"}>
        <PollingSection />
      </Match>

      <Match when={state().phase === "completed"}>
        <CompletedSection
          files={(state() as { files: JobFileEntry[] }).files}
          deleting={deleting()}
          onDelete={handleDelete}
        />
      </Match>

      <Match when={state().phase === "failed"}>
        <FailedSection
          error={(state() as { error: string }).error}
          deleting={deleting()}
          onDelete={handleDelete}
        />
      </Match>
    </Switch>
  );
}

function PollingSection() {
  return (
    <div class="rounded-lg border border-info-border bg-info/10 p-4 space-y-2">
      <div class="flex items-center gap-2">
        <Loader2 size={16} class="text-info-foreground animate-spin" />
        <H3>Merging segments…</H3>
      </div>
      <div class="text-xs text-subtle">
        This may take a moment. The result will appear here automatically.
      </div>
    </div>
  );
}

function CompletedSection(props: {
  files: JobFileEntry[];
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div class="rounded-lg border border-success-border bg-success/10 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="success" size="sm" aria-label="Merged">
            Merged
          </Badge>
          <H3>Full Audio</H3>
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Delete merged audio"
          disabled={props.deleting}
          onClick={props.onDelete}
        >
          <Trash2 size={14} />
        </IconButton>
      </div>

      <div class="space-y-2">
        <For each={props.files}>{(file) => <MergedFileRow file={file} />}</For>
      </div>
    </div>
  );
}

function MergedFileRow(props: { file: JobFileEntry }) {
  const [cachedBlobUrl, setCachedBlobUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = cachedBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  async function getOrFetchBlobUrl(): Promise<string> {
    const existing = cachedBlobUrl();
    if (existing) {
      return existing;
    }
    const response = await fetch(props.file.downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(url);
    return url;
  }

  function handleDownload() {
    const blobUrl = cachedBlobUrl();
    if (blobUrl) {
      triggerDownload(blobUrl, props.file.fileName);
    } else {
      fetch(props.file.downloadUrl)
        .then((r) => r.blob())
        .then((b) => {
          const url = URL.createObjectURL(b);
          triggerDownload(url, props.file.fileName);
          URL.revokeObjectURL(url);
        });
    }
  }

  return (
    <AudioPlayer
      name={props.file.fileName}
      src={getOrFetchBlobUrl}
      size={props.file.sizeBytes}
      actions={(audioState) => (
        <IconButton
          variant="outline"
          size="sm"
          aria-label={`Download ${props.file.fileName}`}
          onClick={() => {
            if (audioState.blobUrl) {
              triggerDownload(audioState.blobUrl, props.file.fileName);
            } else {
              handleDownload();
            }
          }}
        >
          <Download size={14} />
        </IconButton>
      )}
    />
  );
}

function FailedSection(props: {
  error: string;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div class="rounded-lg border border-error-border bg-error/10 p-4 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="error" size="sm" aria-label="Failed">
            Failed
          </Badge>
          <H3>Merge Failed</H3>
        </div>
        <LoadingButton
          variant="ghost"
          size="sm"
          loading={props.deleting}
          onClick={props.onDelete}
        >
          <Trash2 size={14} />
          Clear
        </LoadingButton>
      </div>
      <div class="text-xs text-error-foreground">{props.error}</div>
    </div>
  );
}

function triggerDownload(blobUrl: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export { MergedAudioSection };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-project-edit-card.tsx

```
import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";
import type { RoleVoiceMapping } from "@packages/contract/segment";

import type { TtsJobEntry, TtsJobSegmentEntry } from "./_tts-jobs-types";

import { Button, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { TextareaField } from "@packages/ui/form";
import { toast } from "@packages/ui/overlay";
import { H3 } from "@packages/ui/typography";
import { Plus, RefreshCw, X } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";

import { RoleVoiceMappingPanel } from "#hub/shared/ui/segment-editor";
import { parseSegmentsFromJson } from "#hub/shared/ui/segment-editor/segment-editor-parser";

import { buildMappingsFromSegments, getUniqueRoles } from "./_tts-jobs-helpers";
import { FAILED_STATUSES } from "./_tts-jobs-types";
import { EditSegmentRow } from "./_tts-segment-edit-row";
import {
  createAddSegmentMutation,
  createDeleteSegmentMutation,
  createRetryAllFailedMutation,
  createRetrySegmentMutation,
  createSynthesizeAllPendingMutation,
  createUpdateSegmentMutation,
} from "./tts.query";

type LocalSegment = TtsJobSegmentEntry & {
  outputKey: string | null;
};

type ProjectEditCardProps = {
  project: TtsJobEntry;
  voices: SecretVoicerVoice[];
  voicesLoading: boolean;
  previewApi: {
    getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
  };
  onClose: () => void;
  onRefresh: () => void;
};

type EditCardState = {
  project: () => TtsJobEntry;
  localSegments: () => LocalSegment[];
  setLocalSegments: (
    v: LocalSegment[] | ((prev: LocalSegment[]) => LocalSegment[]),
  ) => void;
  mappings: () => RoleVoiceMapping[];
  setMappings: (
    v: RoleVoiceMapping[] | ((prev: RoleVoiceMapping[]) => RoleVoiceMapping[]),
  ) => void;
  syncMappings: (segs: LocalSegment[]) => void;
};

function createEditCardState(props: ProjectEditCardProps): EditCardState {
  const project = () => props.project;

  const [localSegments, setLocalSegments] = createSignal<LocalSegment[]>(
    project().segments.map((s) => ({ ...s })),
  );

  const [mappings, setMappings] = createSignal<RoleVoiceMapping[]>(
    buildMappingsFromSegments(project().segments),
  );

  function syncMappings(segs: LocalSegment[]) {
    const roles = getUniqueRoles(segs);
    const current = mappings();
    setMappings(
      roles.map((role) => {
        const existing = current.find(
          (m) => m.role.toLowerCase() === role.toLowerCase(),
        );
        const fromSeg = segs.find(
          (s) => s.role.toLowerCase() === role.toLowerCase(),
        );
        return {
          role,
          voiceId: existing?.voiceId ?? fromSeg?.voiceId ?? null,
        };
      }),
    );
  }

  return {
    project,
    localSegments,
    setLocalSegments,
    mappings,
    setMappings,
    syncMappings,
  };
}

function handleMappingsChange(
  state: EditCardState,
  newMappings: RoleVoiceMapping[],
) {
  const changed = newMappings.filter((nm) => {
    const old = state
      .mappings()
      .find((m) => m.role.toLowerCase() === nm.role.toLowerCase());
    return old?.voiceId !== nm.voiceId;
  });

  state.setMappings(newMappings);

  if (changed.length === 0) {
    return;
  }

  state.setLocalSegments((prev) =>
    prev.map((seg) => {
      const changedRole = changed.find(
        (c) => c.role.toLowerCase() === seg.role.toLowerCase(),
      );
      if (!changedRole) {
        return seg;
      }
      return {
        ...seg,
        voiceId: changedRole.voiceId ?? seg.voiceId,
        status: "pending",
        outputKey: null,
        error: null,
      };
    }),
  );
}

function handleRoleChange(
  state: EditCardState,
  index: number,
  newRole: string,
) {
  const voiceId =
    state.mappings().find((m) => m.role.toLowerCase() === newRole.toLowerCase())
      ?.voiceId ?? null;

  const updated = state.localSegments().map((seg, i) => {
    if (i !== index) {
      return seg;
    }
    const original = state.project().segments[i];
    if (original && original.role === newRole && original.outputKey) {
      return {
        ...seg,
        role: newRole,
        voiceId: original.voiceId,
        status: original.status,
        outputKey: original.outputKey,
      };
    }
    return {
      ...seg,
      role: newRole,
      voiceId: voiceId ?? seg.voiceId,
      status: "pending",
      outputKey: null,
      error: null,
    };
  });

  state.setLocalSegments(updated);
  state.syncMappings(updated);
}

function handleTextChange(state: EditCardState, index: number, text: string) {
  state.setLocalSegments((prev) =>
    prev.map((seg, i) => {
      if (i !== index) {
        return seg;
      }
      const original = state.project().segments[i];
      if (original && original.text === text && original.outputKey) {
        return {
          ...seg,
          text,
          status: original.status,
          outputKey: original.outputKey,
        };
      }
      return {
        ...seg,
        text,
        status: "pending",
        outputKey: null,
        error: null,
      };
    }),
  );
}

function handleDuplicate(state: EditCardState, index: number) {
  const seg = state.localSegments()[index];
  if (!seg) {
    return;
  }
  const newSeg: LocalSegment = {
    ...seg,
    index: index + 1,
    status: "pending",
    outputKey: null,
    bullJobId: null,
    error: null,
  };
  state.setLocalSegments((prev) => {
    const updated = [...prev];
    for (let i = index + 1; i < updated.length; i++) {
      const s = updated[i];
      if (s) {
        updated[i] = { ...s, index: s.index + 1 };
      }
    }
    updated.splice(index + 1, 0, newSeg);
    return updated;
  });
}

function handleAddSegment(state: EditCardState) {
  const lastIndex = state.localSegments().length;
  const lastRole = state.localSegments().at(-1)?.role ?? "";
  const voiceId =
    state
      .mappings()
      .find((m) => m.role.toLowerCase() === lastRole.toLowerCase())?.voiceId
    ?? null;
  state.setLocalSegments((prev) => [
    ...prev,
    {
      index: lastIndex,
      role: lastRole,
      text: "",
      voiceId: voiceId ?? "",
      status: "pending",
      bullJobId: null,
      outputKey: null,
      error: null,
    },
  ]);
}

async function saveAndSynthesizePending(
  state: EditCardState,
  mutations: {
    addSegMutation: ReturnType<typeof createAddSegmentMutation>;
    updateSegMutation: ReturnType<typeof createUpdateSegmentMutation>;
    synthPendingMutation: ReturnType<typeof createSynthesizeAllPendingMutation>;
  },
  onDone: () => void,
) {
  const segs = state.localSegments();
  const pendingSegs = segs.filter(
    (s) => s.status === "pending" && s.text.trim(),
  );

  if (pendingSegs.length === 0) {
    toast.info("No pending segments to synthesize");
    return;
  }

  for (const seg of segs) {
    const original = state
      .project()
      .segments.find((s) => s.index === seg.index);
    const newVoiceId =
      state
        .mappings()
        .find((m) => m.role.toLowerCase() === seg.role.toLowerCase())?.voiceId
      ?? seg.voiceId;

    if (!original) {
      // biome-ignore lint/performance/noAwaitInLoops: sequential segment saving is intentional — each segment must be persisted before the next to maintain correct ordering
      await new Promise<void>((resolve, reject) => {
        mutations.addSegMutation.mutate(
          {
            projectId: state.project().jobId,
            role: seg.role,
            text: seg.text,
            voiceId: newVoiceId,
            afterIndex: seg.index - 1,
          },
          { onSuccess: () => resolve(), onError: reject },
        );
      });
    } else if (
      original.text !== seg.text
      || original.role !== seg.role
      || original.voiceId !== newVoiceId
    ) {
      await new Promise<void>((resolve, reject) => {
        mutations.updateSegMutation.mutate(
          {
            projectId: state.project().jobId,
            segmentIndex: seg.index,
            data: { text: seg.text, role: seg.role, voiceId: newVoiceId },
          },
          { onSuccess: () => resolve(), onError: reject },
        );
      });
    }
  }

  mutations.synthPendingMutation.mutate(state.project().jobId, {
    onSuccess: () => {
      toast.success("Synthesis started for pending segments");
      onDone();
    },
    onError: () => toast.error("Failed to start synthesis"),
  });
}

// ─── Parse & Append Section ───────────────────────────────────────────────────

function ParseAppendSection(props: { state: EditCardState }) {
  const [parseInput, setParseInput] = createSignal("");
  const [parseError, setParseError] = createSignal("");

  function handleParseAndAppend() {
    setParseError("");
    try {
      const parsed = parseSegmentsFromJson(parseInput());
      if (parsed.length === 0) {
        setParseError("No segments found");
        return;
      }
      const startIndex = props.state.localSegments().length;
      const newSegs: LocalSegment[] = parsed.map((seg, i) => {
        const voiceId =
          props.state
            .mappings()
            .find((m) => m.role.toLowerCase() === seg.role.toLowerCase())
            ?.voiceId ?? null;
        return {
          index: startIndex + i,
          role: seg.role,
          text: seg.text,
          voiceId: voiceId ?? "",
          status: "pending",
          bullJobId: null,
          outputKey: null,
          error: null,
        };
      });
      const updated = [...props.state.localSegments(), ...newSegs];
      props.state.setLocalSegments(updated);
      props.state.syncMappings(updated);
      setParseInput("");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Parse error");
    }
  }

  return (
    <div class="space-y-2 pt-2 border-t border-border">
      <H3>Append from JSON</H3>
      <TextareaField
        label=""
        value={parseInput()}
        onValueChange={setParseInput}
        disabled={false}
        readonly={false}
        required={false}
        name="edit-parse-input"
        maxLength={100_000}
        minLength={0}
        placeholder='[{"name": "narrator", "text": "..."}]'
        counterLabel={(c, m) => `${c}/${m}`}
      />
      <Show when={parseError()}>
        <div class="text-xs text-error-foreground">{parseError()}</div>
      </Show>
      <Button
        variant="secondary"
        size="sm"
        disabled={parseInput().trim().length === 0}
        onClick={handleParseAndAppend}
      >
        Parse & Append
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ProjectEditCard(props: ProjectEditCardProps) {
  const state = createEditCardState(props);

  const updateSegMutation = createUpdateSegmentMutation();
  const deleteSegMutation = createDeleteSegmentMutation();
  const addSegMutation = createAddSegmentMutation();
  const retrySegMutation = createRetrySegmentMutation();
  const synthPendingMutation = createSynthesizeAllPendingMutation();
  const retryAllMutation = createRetryAllFailedMutation();

  function handleDeleteSegment(index: number) {
    const seg = state.localSegments()[index];
    if (!seg) {
      return;
    }

    const original = state
      .project()
      .segments.find((s) => s.index === seg.index);
    if (original) {
      deleteSegMutation.mutate(
        { projectId: state.project().jobId, segmentIndex: seg.index },
        {
          onSuccess: () => {
            state.setLocalSegments((prev) =>
              prev
                .filter((_, i) => i !== index)
                .map((s, i) => ({ ...s, index: i })),
            );
            props.onRefresh();
          },
          onError: () => toast.error("Failed to delete segment"),
        },
      );
    } else {
      state.setLocalSegments((prev) =>
        prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i })),
      );
    }
  }

  function handleRetryAllFailed() {
    retryAllMutation.mutate(state.project().jobId, {
      onSuccess: () => {
        toast.success("Retrying all failed segments");
        props.onRefresh();
      },
      onError: () => toast.error("Failed to retry"),
    });
  }

  function handleRetrySegment(index: number) {
    retrySegMutation.mutate(
      { projectId: state.project().jobId, segmentIndex: index },
      {
        onSuccess: () => {
          toast.success("Retry started");
          props.onRefresh();
        },
        onError: () => toast.error("Failed to retry"),
      },
    );
  }

  const hasPendingSegs = createMemo(() =>
    state.localSegments().some((s) => s.status === "pending" && s.text.trim()),
  );

  const hasFailedSegs = createMemo(() =>
    state.localSegments().some((s) => FAILED_STATUSES.has(s.status)),
  );

  const isSaving = createMemo(
    () =>
      updateSegMutation.isPending
      || addSegMutation.isPending
      || deleteSegMutation.isPending
      || synthPendingMutation.isPending,
  );

  return (
    <div class="rounded-lg border border-primary/40 p-4 space-y-4 bg-card">
      <EditCardHeader
        name={state.project().name}
        hasFailedSegs={hasFailedSegs()}
        hasPendingSegs={hasPendingSegs()}
        pendingCount={
          state.localSegments().filter((s) => s.status === "pending").length
        }
        retryAllPending={retryAllMutation.isPending}
        isSaving={isSaving()}
        onRetryAllFailed={handleRetryAllFailed}
        onSaveAndSynthesize={() =>
          saveAndSynthesizePending(
            state,
            { addSegMutation, updateSegMutation, synthPendingMutation },
            () => {
              props.onRefresh();
              props.onClose();
            },
          )
        }
        onClose={props.onClose}
      />

      <Show when={state.mappings().length > 0}>
        <RoleVoiceMappingPanel
          mappings={state.mappings()}
          onMappingsChange={(m) => handleMappingsChange(state, m)}
          voices={props.voices}
          voicesLoading={props.voicesLoading}
          previewApi={props.previewApi}
        />
      </Show>

      <div class="space-y-2">
        <H3>Segments ({state.localSegments().length})</H3>
        <For each={state.localSegments()}>
          {(seg, i) => (
            <EditSegmentRow
              seg={seg}
              index={i()}
              allRoles={getUniqueRoles(state.localSegments())}
              outputFiles={state.project().outputFiles}
              onRoleChange={(role) => handleRoleChange(state, i(), role)}
              onTextChange={(text) => handleTextChange(state, i(), text)}
              onDuplicate={() => handleDuplicate(state, i())}
              onDelete={() => handleDeleteSegment(i())}
              onRetry={() => handleRetrySegment(seg.index)}
              retrying={retrySegMutation.isPending}
              canDelete={state.localSegments().length > 1}
            />
          )}
        </For>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddSegment(state)}
        >
          <Plus size={14} />
          Add Segment
        </Button>
      </div>

      <ParseAppendSection state={state} />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function EditCardHeader(props: {
  name: string;
  hasFailedSegs: boolean;
  hasPendingSegs: boolean;
  pendingCount: number;
  retryAllPending: boolean;
  isSaving: boolean;
  onRetryAllFailed: () => void;
  onSaveAndSynthesize: () => void;
  onClose: () => void;
}) {
  return (
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">{props.name}</span>
        <Badge variant="info" size="sm" aria-label="Editing">
          Editing
        </Badge>
      </div>
      <div class="flex items-center gap-2">
        <Show when={props.hasFailedSegs}>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={props.retryAllPending}
            onClick={props.onRetryAllFailed}
          >
            <RefreshCw size={14} />
            Retry all failed
          </LoadingButton>
        </Show>
        <Show when={props.hasPendingSegs}>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={props.isSaving}
            onClick={props.onSaveAndSynthesize}
          >
            Synthesize pending ({props.pendingCount})
          </LoadingButton>
        </Show>
        <Button variant="ghost" size="sm" onClick={props.onClose}>
          <X size={14} />
          Close
        </Button>
      </div>
    </div>
  );
}

export { ProjectEditCard };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-project-view-card.tsx

```
import type { TtsJobEntry } from "./_tts-jobs-types";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { Progress } from "@packages/ui/feedback";
import { toast } from "@packages/ui/overlay";
import {
  Download,
  Loader2,
  Merge,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { downloadAllFiles } from "./_tts-jobs-helpers";
import {
  DONE_STATUSES,
  FAILED_STATUSES,
  PROCESSING_STATUSES,
} from "./_tts-jobs-types";
import { MergedAudioSection } from "./_tts-merged-audio-section";
import { SegmentViewRow } from "./_tts-segment-view-row";
import {
  createRetryAllFailedMutation,
  createRetrySegmentMutation,
  createSynthesizeAllPendingMutation,
} from "./tts.query";

const RETRY_REFRESH_DELAY_MS = 1500;
const RETRY_REFRESH_SECOND_DELAY_MS = 4000;

function useProjectStats(project: () => TtsJobEntry) {
  const segments = () => project().segments ?? [];

  const completedCount = () =>
    segments().filter((s) => DONE_STATUSES.has(s.status)).length;
  const failedCount = () =>
    segments().filter((s) => FAILED_STATUSES.has(s.status)).length;
  const pendingCount = () =>
    segments().filter((s) => s.status === "pending").length;
  const totalCount = () => segments().length;

  const isProcessing = () =>
    PROCESSING_STATUSES.has(project().status)
    || segments().some((s) => PROCESSING_STATUSES.has(s.status));

  const allCompleted = () =>
    completedCount() === totalCount()
    && totalCount() > 0
    && failedCount() === 0;

  const statusVariant = (): "success" | "error" | "warning" | "info" => {
    if (failedCount() > 0 && completedCount() > 0) {
      return "warning";
    }
    if (FAILED_STATUSES.has(project().status)) {
      return "error";
    }
    if (allCompleted()) {
      return "success";
    }
    return "info";
  };

  const statusLabel = () => {
    if (allCompleted()) {
      return "Completed";
    }
    if (isProcessing()) {
      return "Processing";
    }
    if (FAILED_STATUSES.has(project().status)) {
      return "Failed";
    }
    if (failedCount() > 0) {
      return "Partial";
    }
    return project().status;
  };

  return {
    segments,
    completedCount,
    failedCount,
    pendingCount,
    totalCount,
    isProcessing,
    allCompleted,
    statusVariant,
    statusLabel,
  };
}

function ViewCardHeader(props: {
  project: TtsJobEntry;
  stats: ReturnType<typeof useProjectStats>;
  hasMergedAudio: boolean;
  retryAllPending: boolean;
  synthPending: boolean;
  onRetryAll: () => void;
  onSynthPending: () => void;
  onDownloadSegments: () => void;
  onOpenMerge: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { stats } = props;
  const showMergeButton = () =>
    stats.allCompleted() && stats.totalCount() > 1 && !props.hasMergedAudio;

  return (
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Show when={stats.isProcessing()}>
          <Loader2 size={16} class="text-info-foreground animate-spin" />
        </Show>
        <span class="text-sm font-medium">{props.project.name}</span>
        <Badge
          variant={stats.statusVariant()}
          size="sm"
          aria-label={stats.statusLabel()}
        >
          {stats.statusLabel()}
        </Badge>
      </div>

      <div class="flex items-center gap-1">
        <Show when={stats.allCompleted() && stats.totalCount() > 1}>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onDownloadSegments}
          >
            <Download size={14} />
            Segments
          </Button>
        </Show>
        <Show when={stats.allCompleted() && stats.totalCount() === 1}>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onDownloadSegments}
          >
            <Download size={14} />
            Download
          </Button>
        </Show>
        <Show when={showMergeButton()}>
          <Button variant="primary" size="sm" onClick={props.onOpenMerge}>
            <Merge size={14} />
            Merge
          </Button>
        </Show>
        <Show when={stats.failedCount() > 0}>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={props.retryAllPending}
            onClick={props.onRetryAll}
          >
            <RefreshCw size={14} />
            Retry failed ({stats.failedCount()})
          </LoadingButton>
        </Show>
        <Show when={stats.pendingCount() > 0 && !stats.isProcessing()}>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={props.synthPending}
            onClick={props.onSynthPending}
          >
            <RefreshCw size={14} />
            Synth pending ({stats.pendingCount()})
          </LoadingButton>
        </Show>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Edit project"
          onClick={props.onEdit}
        >
          <Pencil size={14} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Delete project"
          onClick={props.onDelete}
        >
          <Trash2 size={14} />
        </IconButton>
      </div>
    </div>
  );
}

function delayedRefresh(onRefresh: () => void) {
  setTimeout(() => onRefresh(), RETRY_REFRESH_DELAY_MS);
  setTimeout(() => onRefresh(), RETRY_REFRESH_SECOND_DELAY_MS);
}

function ProjectViewCard(props: {
  project: TtsJobEntry;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onOpenMerge: () => void;
}) {
  const project = () => props.project;
  const stats = useProjectStats(project);

  const retryAllMutation = createRetryAllFailedMutation();
  const synthPendingMutation = createSynthesizeAllPendingMutation();
  const retrySegMutation = createRetrySegmentMutation();

  const [mergedDeleted, setMergedDeleted] = createSignal(false);

  const activeAudioJobId = () => {
    if (mergedDeleted()) {
      return null;
    }
    return project().audioProcessingJobId;
  };

  const hasMergedAudio = () => activeAudioJobId() !== null;

  function handleRetryAll() {
    retryAllMutation.mutate(project().jobId, {
      onSuccess: () => {
        toast.success("Retrying all failed");
        props.onRefresh();
        delayedRefresh(props.onRefresh);
      },
      onError: () => toast.error("Failed to retry"),
    });
  }

  function handleSynthPending() {
    synthPendingMutation.mutate(project().jobId, {
      onSuccess: () => {
        toast.success("Synthesizing pending segments");
        props.onRefresh();
        delayedRefresh(props.onRefresh);
      },
      onError: () => toast.error("Failed to synthesize"),
    });
  }

  function handleRetrySegment(index: number) {
    retrySegMutation.mutate(
      { projectId: project().jobId, segmentIndex: index },
      {
        onSuccess: () => {
          toast.success("Retry started");
          props.onRefresh();
          delayedRefresh(props.onRefresh);
        },
        onError: () => toast.error("Failed to retry segment"),
      },
    );
  }

  function handleDownloadSegments() {
    const files = project().outputFiles.map((f) => ({
      downloadUrl: f.downloadUrl,
      fileName: f.fileName,
    }));
    downloadAllFiles(files).catch(() => {
      toast.error("Failed to download files");
    });
  }

  function handleMergedDeleted() {
    setMergedDeleted(true);
    props.onRefresh();
  }

  return (
    <div class="rounded-lg border border-border p-4 space-y-4 bg-card">
      <ViewCardHeader
        project={project()}
        stats={stats}
        hasMergedAudio={hasMergedAudio()}
        retryAllPending={retryAllMutation.isPending}
        synthPending={synthPendingMutation.isPending}
        onRetryAll={handleRetryAll}
        onSynthPending={handleSynthPending}
        onDownloadSegments={handleDownloadSegments}
        onOpenMerge={props.onOpenMerge}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
      />

      <MergedAudioSection
        projectId={project().jobId}
        audioProcessingJobId={activeAudioJobId()}
        onDeleted={handleMergedDeleted}
      />

      <Show when={stats.totalCount() > 0}>
        <Progress
          max={stats.totalCount()}
          success={stats.completedCount()}
          error={stats.failedCount()}
          formatLabel={(processed, max) => `${processed} / ${max} segments`}
        />
      </Show>

      <div class="space-y-2">
        <For each={stats.segments()}>
          {(segment) => (
            <SegmentViewRow
              segment={segment}
              outputFiles={project().outputFiles}
              onRetry={() => handleRetrySegment(segment.index)}
              retrying={retrySegMutation.isPending}
            />
          )}
        </For>
      </div>
    </div>
  );
}

export { ProjectViewCard };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-segment-edit-row.tsx

```
import type { TtsJobFileEntry, TtsJobSegmentEntry } from "./_tts-jobs-types";

import { IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { TextareaField } from "@packages/ui/form";
import { Copy, Download, Loader2, RefreshCw, Trash2 } from "lucide-solid";
import {
  createMemo,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";
import { RoleSelector } from "#hub/shared/ui/segment-editor/segment-editor-role-selector";

import { handleFileDownload } from "./_tts-jobs-helpers";
import {
  DONE_STATUSES,
  FAILED_STATUSES,
  PROCESSING_STATUSES,
  SEGMENT_INDEX_PAD_LENGTH,
} from "./_tts-jobs-types";

type EditSegmentRowProps = {
  seg: TtsJobSegmentEntry;
  index: number;
  allRoles: string[];
  outputFiles: TtsJobFileEntry[];
  onRoleChange: (role: string) => void;
  onTextChange: (text: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRetry: () => void;
  retrying: boolean;
  canDelete: boolean;
};

function EditSegmentRow(props: EditSegmentRowProps) {
  const seg = () => props.seg;
  const isSegDone = () => DONE_STATUSES.has(seg().status);
  const isSegFailed = () => FAILED_STATUSES.has(seg().status);
  const isSegProcessing = () => PROCESSING_STATUSES.has(seg().status);
  const isSegPending = () => seg().status === "pending";

  const [cachedBlobUrl, setCachedBlobUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = cachedBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  const segmentFile = createMemo(() => {
    if (!isSegDone()) {
      return null;
    }
    const padded = String(seg().index).padStart(SEGMENT_INDEX_PAD_LENGTH, "0");
    return (
      props.outputFiles.find(
        (f) =>
          f.fileName.includes(`seg_${padded}`)
          || f.fileName.includes(`seg_${seg().index}`),
      ) ?? null
    );
  });

  async function getOrFetchBlobUrl(downloadUrl: string): Promise<string> {
    const existing = cachedBlobUrl();
    if (existing) {
      return existing;
    }
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(url);
    return url;
  }

  const borderClass = () => {
    if (isSegDone()) {
      return "border-success-border/50";
    }
    if (isSegFailed()) {
      return "border-error-border/50";
    }
    if (isSegPending()) {
      return "border-warning-border/50";
    }
    if (isSegProcessing()) {
      return "border-info-border/50";
    }
    return "border-border/50";
  };

  return (
    <div class={`rounded-md border p-3 space-y-2 ${borderClass()}`}>
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-subtle w-[24px] shrink-0">
          #{props.index + 1}
        </span>

        <RoleSelector
          value={seg().role}
          existingRoles={props.allRoles.filter(
            (r) => r.toLowerCase() !== seg().role.toLowerCase(),
          )}
          onChange={props.onRoleChange}
          disabled={false}
        />

        <div class="flex-1" />

        <Switch>
          <Match when={isSegProcessing()}>
            <Loader2 size={14} class="text-info-foreground animate-spin" />
          </Match>
          <Match when={isSegDone()}>
            <Badge variant="success" size="sm" aria-label="Done">
              ✓
            </Badge>
          </Match>
          <Match when={isSegFailed()}>
            <Badge variant="error" size="sm" aria-label="Failed">
              ✗
            </Badge>
          </Match>
          <Match when={isSegPending()}>
            <Badge variant="warning" size="sm" aria-label="Pending">
              pending
            </Badge>
          </Match>
        </Switch>

        <div class="flex items-center gap-1">
          <Show when={isSegFailed()}>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Retry"
              disabled={props.retrying}
              onClick={props.onRetry}
            >
              <RefreshCw size={12} />
            </IconButton>
          </Show>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Duplicate segment"
            onClick={props.onDuplicate}
          >
            <Copy size={14} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Delete segment"
            disabled={!props.canDelete}
            onClick={props.onDelete}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>

      <TextareaField
        label=""
        value={seg().text}
        onValueChange={props.onTextChange}
        disabled={false}
        readonly={false}
        required={false}
        name={`edit-seg-${seg().index}`}
        maxLength={5000}
        minLength={0}
        placeholder="Segment text..."
        counterLabel={(c, m) => `${c}/${m}`}
      />

      <Show when={isSegDone() && segmentFile()}>
        {(file) => (
          <AudioPlayer
            name={file().fileName}
            src={() => getOrFetchBlobUrl(file().downloadUrl)}
            size={file().sizeBytes}
            actions={(audioState) => (
              <IconButton
                variant="outline"
                size="sm"
                aria-label={`Download ${file().fileName}`}
                onClick={() =>
                  handleFileDownload(
                    audioState.blobUrl,
                    file().downloadUrl,
                    file().fileName,
                  )
                }
              >
                <Download size={14} />
              </IconButton>
            )}
          />
        )}
      </Show>

      <Show when={isSegFailed() && seg().error}>
        <div class="text-xs text-error-foreground">{seg().error}</div>
      </Show>
    </div>
  );
}

export { EditSegmentRow };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_tts-segment-view-row.tsx

```
import type { TtsJobFileEntry, TtsJobSegmentEntry } from "./_tts-jobs-types";

import { IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { Download, Loader2, RefreshCw } from "lucide-solid";
import {
  createMemo,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";

import { handleFileDownload } from "./_tts-jobs-helpers";
import {
  DONE_STATUSES,
  FAILED_STATUSES,
  PROCESSING_STATUSES,
  SEGMENT_INDEX_PAD_LENGTH,
} from "./_tts-jobs-types";

type SegmentViewRowProps = {
  segment: TtsJobSegmentEntry;
  outputFiles: TtsJobFileEntry[];
  onRetry: () => void;
  retrying: boolean;
};

function SegmentViewRow(props: SegmentViewRowProps) {
  const seg = () => props.segment;
  const isSegDone = () => DONE_STATUSES.has(seg().status);
  const isSegFailed = () => FAILED_STATUSES.has(seg().status);
  const isSegProcessing = () => PROCESSING_STATUSES.has(seg().status);

  const [cachedBlobUrl, setCachedBlobUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = cachedBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  const segmentFile = createMemo(() => {
    if (!isSegDone()) {
      return null;
    }
    const padded = String(seg().index).padStart(SEGMENT_INDEX_PAD_LENGTH, "0");
    return (
      props.outputFiles.find(
        (f) =>
          f.fileName.includes(`seg_${padded}`)
          || f.fileName.includes(`seg_${seg().index}`),
      ) ?? null
    );
  });

  async function getOrFetchBlobUrl(downloadUrl: string): Promise<string> {
    const existing = cachedBlobUrl();
    if (existing) {
      return existing;
    }
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(url);
    return url;
  }

  return (
    <div class="rounded-md border border-border/50 p-3 space-y-2">
      <div class="flex items-center gap-3 text-sm">
        <span class="text-xs font-mono text-subtle w-[24px] shrink-0">
          #{seg().index + 1}
        </span>
        <Badge variant="info" size="sm" aria-label={seg().role}>
          {seg().role}
        </Badge>
        <span class="flex-1 truncate text-subtle">{seg().text}</span>
        <Switch>
          <Match when={isSegProcessing()}>
            <Loader2
              size={14}
              class="text-info-foreground animate-spin shrink-0"
            />
          </Match>
          <Match when={isSegDone()}>
            <Badge variant="success" size="sm" aria-label="Completed">
              ✓
            </Badge>
          </Match>
          <Match when={isSegFailed()}>
            <div class="flex items-center gap-1 shrink-0">
              <Badge variant="error" size="sm" aria-label="Failed">
                ✗
              </Badge>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Retry segment"
                disabled={props.retrying}
                onClick={props.onRetry}
              >
                <RefreshCw size={12} />
              </IconButton>
            </div>
          </Match>
          <Match when={seg().status === "pending"}>
            <Badge variant="warning" size="sm" aria-label="Pending">
              pending
            </Badge>
          </Match>
        </Switch>
      </div>

      <Show when={isSegDone() && segmentFile()}>
        {(file) => (
          <div class="pl-[36px]">
            <AudioPlayer
              name={file().fileName}
              src={() => getOrFetchBlobUrl(file().downloadUrl)}
              size={file().sizeBytes}
              actions={(audioState) => (
                <IconButton
                  variant="outline"
                  size="sm"
                  aria-label={`Download ${file().fileName}`}
                  onClick={() =>
                    handleFileDownload(
                      audioState.blobUrl,
                      file().downloadUrl,
                      file().fileName,
                    )
                  }
                >
                  <Download size={14} />
                </IconButton>
              )}
            />
          </div>
        )}
      </Show>

      <Show when={isSegFailed() && seg().error}>
        <div class="text-xs text-error-foreground pl-[36px]">{seg().error}</div>
      </Show>
    </div>
  );
}

export { SegmentViewRow };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_use-tts-audio.ts

```
import type { AudioProcessingUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

import { createSignal } from "solid-js";

import { createDefaultUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

function useTtsAudio() {
  const [processingEnabled, setProcessingEnabled] = createSignal(true);
  const [detailConfig, setDetailConfig] =
    createSignal<AudioProcessingUserConfig>(createDefaultUserConfig());

  function buildAudioProcessingPayload() {
    const cfg = detailConfig();
    if (!processingEnabled()) {
      return { enabled: false, concatenate: false, config: {} };
    }
    return {
      enabled: true,
      concatenate: cfg.concatenationEnabled,
      config: {
        concatenation: { enabled: cfg.concatenationEnabled },
        normalization: { enabled: cfg.normalizationEnabled },
        silenceRemoval: {
          keepGapMs: cfg.keepGapMs,
          thresholdDb: cfg.thresholdDb,
          minDurationMs: cfg.minDurationMs,
        },
        gaps: {
          betweenMs: cfg.concatenationEnabled ? cfg.betweenMs : 0,
          startMs: cfg.concatenationEnabled ? cfg.startMs : 0,
          endMs: cfg.concatenationEnabled ? cfg.endMs : 0,
        },
      },
    };
  }

  return {
    processingEnabled,
    setProcessingEnabled,
    detailConfig,
    setDetailConfig,
    buildAudioProcessingPayload,
  };
}

export { useTtsAudio };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_use-tts-create.ts

```
import type { RoleVoiceMapping } from "@packages/contract/segment";

import { createMemo, createSignal } from "solid-js";

import { useTtsAudio } from "./_use-tts-audio";
import { loadDraft } from "./_use-tts-draft";
import { useTtsSegments } from "./_use-tts-segments";

function useTtsCreateState() {
  const draft = loadDraft();
  const [name, setName] = createSignal(draft?.name ?? "");

  const segments = useTtsSegments(() => name());
  const audio = useTtsAudio();

  const allMapped = createMemo(
    () =>
      segments.mappings().length > 0
      && segments.mappings().every((m: RoleVoiceMapping) => m.voiceId !== null),
  );

  const canSubmit = createMemo(
    () =>
      name().trim().length > 0 && segments.segments().length > 0 && allMapped(),
  );

  function buildSubmitPayload() {
    const voiceMap = new Map(
      segments
        .mappings()
        .filter((m: RoleVoiceMapping) => m.voiceId)
        .map((m: RoleVoiceMapping) => [
          m.role.toLowerCase(),
          m.voiceId as string,
        ]),
    );

    return {
      name: name().trim(),
      segments: segments.segments().map((seg) => ({
        role: seg.role.trim(),
        text: seg.text.trim(),
        voiceId: voiceMap.get(seg.role.trim().toLowerCase()) ?? "",
      })),
      audioProcessing: audio.buildAudioProcessingPayload(),
    };
  }

  return {
    name,
    setName,
    ...segments,
    ...audio,
    allMapped,
    canSubmit,
    buildSubmitPayload,
  };
}

export { useTtsCreateState };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_use-tts-draft.ts

```
import type { RoleVoiceMapping, Segment } from "@packages/contract/segment";

const DRAFT_KEY = "tts-create-draft";

type TtsCreateDraft = {
  name: string;
  rawInput: string;
  segments: Segment[];
  mappings: RoleVoiceMapping[];
};

function saveDraft(draft: TtsCreateDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

function loadDraft(): TtsCreateDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as TtsCreateDraft;
  } catch {
    return null;
  }
}

function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export type { TtsCreateDraft };
export { clearDraft, loadDraft, saveDraft };

```

D:/1_Projects/jstonehub/apps/hub/src/feature/tts/_use-tts-segments.ts

```
import type { RoleVoiceMapping, Segment } from "@packages/contract/segment";

import { createEffect, createSignal } from "solid-js";

import {
  extractUniqueRoles,
  parseSegmentsFromJson,
} from "#hub/shared/ui/segment-editor";

import { loadDraft, saveDraft } from "./_use-tts-draft";

function useTtsSegments(nameAccessor: () => string) {
  const draft = loadDraft();

  const [segments, setSegments] = createSignal<Segment[]>(
    draft?.segments ?? [],
  );
  const [mappings, setMappings] = createSignal<RoleVoiceMapping[]>(
    draft?.mappings ?? [],
  );
  const [rawInput, setRawInput] = createSignal(draft?.rawInput ?? "");
  const [parseError, setParseError] = createSignal("");

  // Auto-save draft on any change
  createEffect(() => {
    saveDraft({
      name: nameAccessor(),
      rawInput: rawInput(),
      segments: segments(),
      mappings: mappings(),
    });
  });

  function syncMappings(segs: Segment[]) {
    const roles = extractUniqueRoles(segs);
    const current = mappings();
    setMappings(
      roles.map((role) => {
        const existing = current.find(
          (m) => m.role.toLowerCase() === role.toLowerCase(),
        );
        return { role, voiceId: existing?.voiceId ?? null };
      }),
    );
  }

  function handleSegmentsChange(segs: Segment[]) {
    setSegments(segs);
    syncMappings(segs);
  }

  function handleParseInput() {
    setParseError("");
    try {
      const parsed = parseSegmentsFromJson(rawInput());
      if (parsed.length === 0) {
        setParseError("No segments found.");
        return;
      }
      handleSegmentsChange(parsed);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse");
    }
  }

  return {
    segments,
    mappings,
    setMappings,
    rawInput,
    setRawInput,
    parseError,
    handleSegmentsChange,
    handleParseInput,
  };
}

export { useTtsSegments };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/config/env.ts

```
import { minLength, object, pipe, safeParse, string } from "valibot";

const schema = object({
  API_URL: pipe(string(), minLength(1)),
  ADMIN_URL: pipe(string(), minLength(1)),

  SUPPORT_EMAIL: pipe(string(), minLength(1)),
});

function parseEnv() {
  const raw = import.meta.env;

  const result = safeParse(schema, {
    API_URL: raw.VITE_API_URL,
    ADMIN_URL: raw.VITE_ADMIN_URL,

    SUPPORT_EMAIL: raw.VITE_SUPPORT_EMAIL,
  });

  if (!result.success) {
    const message = result.issues
      .map((issue) => {
        const path = issue.path?.map((p) => p.key).join(".") || "root";
        return `  • ${path}: ${issue.message}`;
      })
      .join("\n");
    throw new Error(`❌ Hub: Invalid environment variables:\n${message}`);
  }

  return result.output;
}

export const env = parseEnv();

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/audio-player.tsx

```
import type { AudioEngine, AudioPlayerProps, Signals } from "./_audio-engine";

import { formatFileSize } from "@packages/contract/format";
import { IconButton } from "@packages/ui/action";
import { Pause, Play } from "lucide-solid";
import { createSignal, onCleanup, Show } from "solid-js";

import { preloadMetadata, togglePlay } from "./_audio-engine";
import {
  formatTime,
  keyDown,
  pointerDown,
  pointerMove,
  pointerUp,
} from "./_audio-timeline";

const PERCENT = 100;
const THUMB_SIZE = 12;
const HALF_THUMB = THUMB_SIZE / 2;

function AudioPlayer(props: AudioPlayerProps) {
  const [playing, setPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [dragging, setDragging] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [blobUrl, setBlobUrl] = createSignal<string | null>(null);

  const sig: Signals = {
    playing,
    setPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    dragging,
    setDragging,
    loading,
    setLoading,
    blobUrl,
    setBlobUrl,
  };

  const engine: AudioEngine = {
    audio: null,
    animFrame: 0,
    wasPlayingBeforeDrag: false,
    resolvedSrc: null,
    blobUrl: null,
    trackRef: undefined,
    startTimeTracking() {
      const tick = () => {
        if (engine.audio && playing() && !dragging()) {
          setCurrentTime(engine.audio.currentTime);
        }
        if (playing()) {
          engine.animFrame = requestAnimationFrame(tick);
        }
      };
      engine.animFrame = requestAnimationFrame(tick);
    },
  };

  onCleanup(() => {
    cancelAnimationFrame(engine.animFrame);
    engine.audio?.pause();
    const url = blobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  preloadMetadata(props, engine, sig);

  const progress = () => {
    const d = duration();
    return d > 0 ? (currentTime() / d) * PERCENT : 0;
  };

  const fileExt = () => {
    if (props.format) {
      return props.format;
    }
    const dot = props.name.lastIndexOf(".");
    return dot >= 0 ? props.name.slice(dot + 1).toUpperCase() : "";
  };

  return (
    <div class="flex items-center gap-3 p-3 rounded-md bg-secondary/30">
      <PlayButton
        playing={playing()}
        loading={loading()}
        name={props.name}
        onClick={() => togglePlay(props, engine, sig)}
      />

      <div class="flex-1 min-w-0 space-y-1">
        <FileInfo name={props.name} ext={fileExt()} size={props.size} />
        <Timeline
          currentTime={currentTime()}
          duration={duration()}
          progress={progress()}
          trackRef={(el) => {
            engine.trackRef = el;
          }}
          onPointerDown={(e) => pointerDown(e, engine, sig)}
          onPointerMove={(e) => pointerMove(e, engine, sig)}
          onPointerUp={(e) => pointerUp(e, engine, sig)}
          onKeyDown={(e) => keyDown(e, engine, sig)}
        />
      </div>

      <Show when={props.actions}>
        {(actionsFn) => actionsFn()({ blobUrl: blobUrl() })}
      </Show>
    </div>
  );
}

function PlayButton(props: {
  playing: boolean;
  loading: boolean;
  name: string;
  onClick: () => void;
}) {
  return (
    <IconButton
      variant="ghost"
      size="sm"
      aria-label={props.playing ? `Pause ${props.name}` : `Play ${props.name}`}
      disabled={props.loading}
      onClick={props.onClick}
    >
      <Show when={props.playing} fallback={<Play size={14} />}>
        <Pause size={14} />
      </Show>
    </IconButton>
  );
}

function FileInfo(props: {
  name: string;
  ext: string;
  size: number | undefined;
}) {
  return (
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-sm font-medium truncate min-w-0">{props.name}</span>
      <Show when={props.ext}>
        <span class="text-[11px] text-subtle uppercase shrink-0">
          {props.ext}
        </span>
      </Show>
      <Show when={props.size !== undefined && props.size > 0}>
        <span class="text-[11px] text-subtle shrink-0">
          {formatFileSize(props.size ?? 0)}
        </span>
      </Show>
    </div>
  );
}

function Timeline(props: {
  currentTime: number;
  duration: number;
  progress: number;
  trackRef: (el: HTMLDivElement) => void;
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  return (
    <div class="flex items-center gap-2">
      <span class="text-[11px] text-subtle tabular-nums w-[72px] shrink-0">
        {formatTime(props.currentTime)} / {formatTime(props.duration)}
      </span>
      <div
        ref={props.trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Audio timeline"
        aria-valuemin={0}
        aria-valuemax={Math.round(props.duration)}
        aria-valuenow={Math.round(props.currentTime)}
        class="relative flex-1 h-[20px] flex items-center cursor-pointer select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        onPointerDown={props.onPointerDown}
        onPointerMove={props.onPointerMove}
        onPointerUp={props.onPointerUp}
        onKeyDown={props.onKeyDown}
      >
        <div class="absolute left-0 right-0 h-[4px] rounded-full bg-border" />
        <div
          class="absolute left-0 h-[4px] rounded-full bg-primary"
          style={{ width: `${props.progress}%` }}
        />
        <div
          class="absolute rounded-full bg-primary shadow-sm"
          style={{
            width: `${THUMB_SIZE}px`,
            height: `${THUMB_SIZE}px`,
            left: `calc(${props.progress}% - ${HALF_THUMB}px)`,
          }}
        />
      </div>
    </div>
  );
}

export type { AudioPlayerProps } from "./_audio-engine";

export { AudioPlayer };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/_audio-engine.ts

```
type AudioEngine = {
  audio: HTMLAudioElement | null;
  animFrame: number;
  wasPlayingBeforeDrag: boolean;
  resolvedSrc: string | null;
  blobUrl: string | null;
  trackRef: HTMLDivElement | undefined;
  startTimeTracking: () => void;
};

type Signals = {
  playing: () => boolean;
  setPlaying: (v: boolean) => void;
  currentTime: () => number;
  setCurrentTime: (t: number) => void;
  duration: () => number;
  setDuration: (d: number) => void;
  dragging: () => boolean;
  setDragging: (v: boolean) => void;
  loading: () => boolean;
  setLoading: (v: boolean) => void;
  blobUrl: () => string | null;
  setBlobUrl: (s: string | null) => void;
};

type AudioPlayerProps = {
  name: string;
  src: string | (() => Promise<string>);
  size?: number;
  format?: string;
  actions?: (audioState: {
    blobUrl: string | null;
  }) => import("solid-js").JSX.Element;
};

function preloadMetadata(
  props: AudioPlayerProps,
  engine: AudioEngine,
  sig: Signals,
) {
  const src = props.src;
  if (typeof src !== "string") {
    return;
  }

  engine.resolvedSrc = src;
  if (src.startsWith("blob:")) {
    engine.blobUrl = src;
    sig.setBlobUrl(src);
  }

  const preloader = new Audio();
  preloader.preload = "metadata";
  preloader.src = src;
  preloader.addEventListener("loadedmetadata", () => {
    sig.setDuration(preloader.duration);
  });
}

async function togglePlay(
  props: AudioPlayerProps,
  engine: AudioEngine,
  sig: Signals,
) {
  if (sig.playing()) {
    engine.audio?.pause();
    sig.setPlaying(false);
    cancelAnimationFrame(engine.animFrame);
    return;
  }

  sig.setLoading(true);
  try {
    const el = await ensureAudio(props, engine, sig);
    el.play();
    sig.setPlaying(true);
    engine.startTimeTracking();
  } finally {
    sig.setLoading(false);
  }
}

async function ensureAudio(
  props: AudioPlayerProps,
  engine: AudioEngine,
  sig: Signals,
): Promise<HTMLAudioElement> {
  if (engine.audio && engine.resolvedSrc) {
    return engine.audio;
  }

  const src = props.src;
  const url = typeof src === "string" ? src : await src();

  engine.resolvedSrc = url;
  if (url.startsWith("blob:")) {
    engine.blobUrl = url;
    sig.setBlobUrl(url);
  }

  if (engine.audio) {
    engine.audio.src = url;
  } else {
    engine.audio = new Audio(url);
    engine.audio.addEventListener("loadedmetadata", () => {
      sig.setDuration(engine.audio?.duration ?? 0);
    });
    engine.audio.addEventListener("ended", () => {
      sig.setPlaying(false);
      cancelAnimationFrame(engine.animFrame);
    });
  }

  await waitForCanPlay(engine.audio, sig);
  return engine.audio;
}

function waitForCanPlay(audio: HTMLAudioElement, sig: Signals): Promise<void> {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      sig.setDuration(audio.duration);
      resolve();
      return;
    }
    const onCanPlay = () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      sig.setDuration(audio.duration);
      resolve();
    };
    const onError = () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      reject(new Error("Failed to load audio"));
    };
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);
  });
}

export type { AudioEngine, AudioPlayerProps, Signals };
export { preloadMetadata, togglePlay };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/_audio-timeline.ts

```
import type { AudioEngine, Signals } from "./_audio-engine";

const ARROW_SEEK_SEC = 5;

function getProgress(
  clientX: number,
  trackRef: HTMLDivElement | undefined,
): number {
  if (!trackRef) {
    return 0;
  }
  const rect = trackRef.getBoundingClientRect();
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

function pointerDown(e: PointerEvent, engine: AudioEngine, sig: Signals) {
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  engine.wasPlayingBeforeDrag = sig.playing();

  if (engine.wasPlayingBeforeDrag && engine.audio) {
    engine.audio.pause();
    cancelAnimationFrame(engine.animFrame);
  }

  sig.setDragging(true);
  sig.setCurrentTime(getProgress(e.clientX, engine.trackRef) * sig.duration());
}

function pointerMove(e: PointerEvent, engine: AudioEngine, sig: Signals) {
  if (!sig.dragging()) {
    return;
  }
  sig.setCurrentTime(getProgress(e.clientX, engine.trackRef) * sig.duration());
}

function pointerUp(e: PointerEvent, engine: AudioEngine, sig: Signals) {
  (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  sig.setDragging(false);

  if (engine.audio) {
    engine.audio.currentTime = sig.currentTime();
    if (engine.wasPlayingBeforeDrag) {
      engine.audio.play();
      sig.setPlaying(true);
      engine.startTimeTracking();
    }
  }
}

function keyDown(e: KeyboardEvent, engine: AudioEngine, sig: Signals) {
  if (!engine.audio) {
    return;
  }
  const d = sig.duration();
  if (d <= 0) {
    return;
  }

  if (e.key === "ArrowRight") {
    e.preventDefault();
    const next = Math.min(d, engine.audio.currentTime + ARROW_SEEK_SEC);
    engine.audio.currentTime = next;
    sig.setCurrentTime(next);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    const next = Math.max(0, engine.audio.currentTime - ARROW_SEEK_SEC);
    engine.audio.currentTime = next;
    sig.setCurrentTime(next);
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export { formatTime, keyDown, pointerDown, pointerMove, pointerUp };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/audio-processing.processor.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";
import type {
  AudioProcessingJobData,
  AudioProcessingJobResult,
} from "@packages/contract/queue";

import { mkdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, parse } from "node:path";
import { AUDIO_PROCESSING_NAME_LIMITS } from "@packages/contract/audio-processing";
import { createId } from "@packages/util/id";

import { workerStorage } from "#worker/shared/storage/storage";

import { processConcatenated } from "./_concatenation";
import { getFileDurationMs, getInputFiles } from "./_fs";
import { processFile } from "./_single-file";

type ProcessAllFilesParams = {
  files: string[];
  inputDir: string;
  outputDir: string;
  config: AudioProcessingConfig;
};

type UploadContext = {
  processedFiles: string[];
  outputPrefix: string;
  outputName: string;
  isConcatenated: boolean;
  inputFiles: string[];
  config: AudioProcessingConfig;
};

type OutputFileInfo = {
  key: string;
  fileName: string;
  sizeBytes: number;
  durationMs: number;
};

const INDEX_PREFIX_REGEX = /^\d+_/;

async function processAudio(
  data: AudioProcessingJobData,
): Promise<AudioProcessingJobResult> {
  const workDir = join(
    tmpdir(),
    `audio-processing-${data.jobId}-${createId()}`,
  );
  const inputDir = join(workDir, "input");
  const outputDir = join(workDir, "output");

  mkdirSync(inputDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });

  try {
    const result = await processInWorkDir(data, inputDir, outputDir);
    return result;
  } finally {
    cleanupWorkDir(workDir);
  }
}

async function processInWorkDir(
  data: AudioProcessingJobData,
  inputDir: string,
  outputDir: string,
): Promise<AudioProcessingJobResult> {
  const { config, inputKeys, outputPrefix, outputName, isConcatenated } = data;

  await downloadInputFiles(inputKeys, inputDir);

  const inputFiles = getInputFiles(inputDir);
  if (inputFiles.length === 0) {
    throw new Error("No audio files found after download");
  }

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🎵 Processing ${inputFiles.length} audio file(s)`);

  const processedFiles = isConcatenated
    ? [
        await processConcatenated({
          files: inputFiles,
          inputDir,
          outputDir,
          config,
        }),
      ]
    : await processAllFiles({ files: inputFiles, inputDir, outputDir, config });

  const ctx: UploadContext = {
    processedFiles,
    outputPrefix,
    outputName,
    isConcatenated,
    inputFiles,
    config,
  };
  const outputInfos = await uploadAllOutputFiles(ctx);

  const totalDurationMs = outputInfos.reduce((sum, f) => sum + f.durationMs, 0);

  await workerStorage.deleteObjects(inputKeys);

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `✅ Audio processing complete: ${outputInfos.length} output file(s)`,
  );

  return {
    outputKeys: outputInfos.map((f) => f.key),
    outputFiles: outputInfos,
    processedCount: inputFiles.length,
    totalDurationMs,
    processedAt: Date.now(),
  };
}

function cleanupWorkDir(workDir: string): void {
  try {
    rmSync(workDir, { recursive: true, force: true });
  } catch {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.warn(`⚠️ Failed to clean up work dir: ${workDir}`);
  }
}

async function downloadInputFiles(
  keys: string[],
  inputDir: string,
): Promise<void> {
  await Promise.all(
    keys.map(async (key) => {
      const fileName = key.split("/").pop() ?? key;
      const destPath = join(inputDir, fileName);
      await workerStorage.downloadToFile(key, destPath);
    }),
  );
}

function processAllFiles(params: ProcessAllFilesParams): Promise<string[]> {
  const { files, inputDir, outputDir, config } = params;

  return Promise.all(
    files.map((fileName) => {
      const inputPath = join(inputDir, fileName);
      const { name } = parse(fileName);
      const outputPath = join(outputDir, `${name}.${config.output.format}`);

      return processFile({ inputPath, outputPath, config }).then(
        () => outputPath,
      );
    }),
  );
}

function uploadAllOutputFiles(ctx: UploadContext): Promise<OutputFileInfo[]> {
  return Promise.all(
    ctx.processedFiles.map((filePath, index) =>
      uploadSingleOutput(filePath, index, ctx),
    ),
  );
}

async function uploadSingleOutput(
  filePath: string,
  index: number,
  ctx: UploadContext,
): Promise<OutputFileInfo> {
  const outputName = buildOutputFileName(index, ctx);
  const key = `${ctx.outputPrefix}${outputName}`;
  const sizeBytes = statSync(filePath).size;
  const durationMs = await getFileDurationMs(filePath);

  await workerStorage.uploadFromFile(key, filePath);

  return { key, fileName: outputName, sizeBytes, durationMs };
}

function buildOutputFileName(index: number, ctx: UploadContext): string {
  const ext = ctx.config.output.format;
  const safeName = sanitizeOutputName(ctx.outputName);

  if (ctx.isConcatenated) {
    return `${safeName}.${ext}`;
  }

  const originalName = extractOriginalName(
    ctx.inputFiles[index] ?? `file_${index}`,
  );
  return `${safeName}_${originalName}.${ext}`;
}

function extractOriginalName(inputFileName: string): string {
  const base = basename(inputFileName);
  const { name } = parse(base);
  const cleaned = name.replace(INDEX_PREFIX_REGEX, "");
  return cleaned || name;
}

function sanitizeOutputName(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, AUDIO_PROCESSING_NAME_LIMITS.max) || "output"
  );
}

export { processAudio };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/audio-processing.worker.ts

```
import { registerWorker } from "#worker/shared/queue/registry";

import { processAudio } from "./audio-processing.processor";

function registerAudioProcessingWorker(): void {
  registerWorker("audio-processing", processAudio);
}

export { registerAudioProcessingWorker };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_concatenation.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { MS_IN_SECOND, PART_INDEX_PAD_LENGTH } from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";
import { removeTempDir } from "./_fs";
import { processFile } from "./_single-file";

type ConcatenateParams = {
  files: string[];
  inputDir: string;
  outputDir: string;
  config: AudioProcessingConfig;
};

type BuildAllPartsParams = {
  files: string[];
  inputDir: string;
  tempDir: string;
  config: AudioProcessingConfig;
};

type ConcatInputsResult = {
  inputs: string[];
  filters: string[];
};

async function processConcatenated(params: ConcatenateParams): Promise<string> {
  const { files, inputDir, outputDir, config } = params;

  const tempDir = join(outputDir, "_temp");
  mkdirSync(tempDir, { recursive: true });

  try {
    const partConfig = buildPartConfig(config);
    const parts = await buildAllParts({
      files,
      inputDir,
      tempDir,
      config: partConfig,
    });

    const outputPath = join(outputDir, `concatenated.${config.output.format}`);
    await concatAndFinalize(parts, outputPath, config);

    return outputPath;
  } finally {
    removeTempDir(tempDir);
  }
}

function buildPartConfig(config: AudioProcessingConfig): AudioProcessingConfig {
  return {
    ...config,
    fade: { inMs: 0, outMs: 0 },
    gaps: { innerMs: config.gaps.innerMs, betweenMs: 0, startMs: 0, endMs: 0 },
    concatenation: { enabled: false },
  };
}

function buildAllParts(params: BuildAllPartsParams): Promise<string[]> {
  const { files, inputDir, tempDir, config } = params;

  return Promise.all(
    files.map((file, index) => {
      const inputPath = join(inputDir, file);
      const padded = String(index).padStart(PART_INDEX_PAD_LENGTH, "0");
      const outputPath = join(tempDir, `part_${padded}.wav`);

      return processFile({ inputPath, outputPath, config }).then(
        () => outputPath,
      );
    }),
  );
}

async function concatAndFinalize(
  files: string[],
  outputPath: string,
  config: AudioProcessingConfig,
): Promise<void> {
  if (files.length === 0) {
    return;
  }

  const firstFile = files[0];
  if (files.length === 1 && firstFile) {
    await encodeSingleFile(firstFile, outputPath, config);
    return;
  }

  const args: string[] = [];
  const filterParts: string[] = [];
  const sampleRate = config.output.sampleRate;

  for (const file of files) {
    args.push("-i", file);
  }

  for (let i = 0; i < files.length; i++) {
    filterParts.push(
      `[${i}:a]aformat=sample_fmts=fltp:sample_rates=${sampleRate}:channel_layouts=stereo[a${i}]`,
    );
  }

  const concatInputs = buildConcatInputs({
    fileCount: files.length,
    betweenMs: config.gaps.betweenMs,
    sampleRate,
  });

  filterParts.push(...concatInputs.filters);

  const postFilters = buildPostFilters(config);
  const concatExpr = `${concatInputs.inputs.join("")}concat=n=${concatInputs.inputs.length}:v=0:a=1`;

  if (postFilters.length > 0) {
    filterParts.push(`${concatExpr}[merged]`);
    filterParts.push(`[merged]${postFilters.join(",")}[final]`);
    args.push("-filter_complex", filterParts.join(";"), "-map", "[final]");
  } else {
    filterParts.push(`${concatExpr}[merged]`);
    args.push("-filter_complex", filterParts.join(";"), "-map", "[merged]");
  }

  args.push("-ar", String(sampleRate));
  addCodecArgs(args, config);
  args.push("-y", outputPath);

  await runFfmpeg(args);
}

function buildPostFilters(config: AudioProcessingConfig): string[] {
  const filters: string[] = [];

  if (config.gaps.startMs > 0) {
    filters.push(`adelay=${config.gaps.startMs}|${config.gaps.startMs}`);
  }
  if (config.gaps.endMs > 0) {
    filters.push(`apad=pad_dur=${config.gaps.endMs / MS_IN_SECOND}`);
  }
  if (config.fade.inMs > 0) {
    filters.push(`afade=t=in:d=${config.fade.inMs / MS_IN_SECOND}`);
  }
  if (config.fade.outMs > 0) {
    const sec = config.fade.outMs / MS_IN_SECOND;
    filters.push(`areverse,afade=t=in:d=${sec},areverse`);
  }

  return filters;
}

async function encodeSingleFile(
  inputPath: string,
  outputPath: string,
  config: AudioProcessingConfig,
): Promise<void> {
  const filters = buildPostFilters(config);
  const args = ["-i", inputPath];

  if (filters.length > 0) {
    args.push("-af", filters.join(","));
  }

  args.push("-ar", String(config.output.sampleRate));
  addCodecArgs(args, config);
  args.push("-y", outputPath);

  await runFfmpeg(args);
}

type BuildConcatInputsParams = {
  fileCount: number;
  betweenMs: number;
  sampleRate: number;
};

function buildConcatInputs(
  params: BuildConcatInputsParams,
): ConcatInputsResult {
  const { fileCount, betweenMs, sampleRate } = params;
  const inputs: string[] = [];
  const filters: string[] = [];

  for (let i = 0; i < fileCount; i++) {
    if (i > 0 && betweenMs > 0) {
      const label = `silence${i}`;
      filters.push(
        `aevalsrc=0:d=${betweenMs / MS_IN_SECOND}:s=${sampleRate}:c=stereo[${label}]`,
      );
      inputs.push(`[${label}]`);
    }
    inputs.push(`[a${i}]`);
  }

  return { inputs, filters };
}

function addCodecArgs(args: string[], config: AudioProcessingConfig): void {
  const { format, bitrate } = config.output;
  if (format === "mp3") {
    args.push("-codec:a", "libmp3lame", "-b:a", bitrate);
  } else if (format === "ogg") {
    args.push("-codec:a", "libvorbis", "-b:a", bitrate);
  } else if (format === "wav") {
    args.push("-codec:a", "pcm_s16le");
  }
}

export { processConcatenated };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_constant.ts

```
const MS_IN_SECOND = 1000;
const PART_INDEX_PAD_LENGTH = 4;
const FFMPEG_TIMEOUT_MS = 300_000;

const DB_BASE = 10;
const DB_DIVISOR = 20;
const DB_PRECISION = 6;

const LIMITER_ATTACK = 5;
const LIMITER_RELEASE = 50;
const LOUDNORM_LRA = 11;

// Each voiced segment is extended by this amount on both sides
// before trimming, creating overlap for clean crossfade splicing.
const SEGMENT_OVERLAP_SEC = 0.004;

// Crossfade duration for splicing voiced segments.
// Equals 2x overlap so the extended edges fully overlap.
const SPLICE_CROSSFADE_SEC = 0.008;

const LOUDNORM_FALLBACK = {
  inputI: "-24.0",
  inputTp: "-2.0",
  inputLra: "7.0",
  inputThresh: "-34.0",
  targetOffset: "0.0",
} as const;

const SUPPORTED_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".m4a",
  ".aac",
  ".wma",
  ".opus",
]);

const LOUDNORM_JSON_REGEX = /\{[\s\S]*"input_i"[\s\S]*\}/;

export {
  DB_BASE,
  DB_DIVISOR,
  DB_PRECISION,
  FFMPEG_TIMEOUT_MS,
  LIMITER_ATTACK,
  LIMITER_RELEASE,
  LOUDNORM_FALLBACK,
  LOUDNORM_JSON_REGEX,
  LOUDNORM_LRA,
  MS_IN_SECOND,
  PART_INDEX_PAD_LENGTH,
  SEGMENT_OVERLAP_SEC,
  SPLICE_CROSSFADE_SEC,
  SUPPORTED_EXTENSIONS,
};

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_ffmpeg-args.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

type BuildOutputArgsParams = {
  inputPath: string;
  outputPath: string;
  filterChain: string;
  config: AudioProcessingConfig;
};

function buildOutputArgs(params: BuildOutputArgsParams): string[] {
  const { inputPath, outputPath, filterChain, config } = params;
  const args = ["-i", inputPath];

  if (filterChain) {
    args.push("-af", filterChain);
  }

  args.push("-ar", String(config.output.sampleRate));
  addCodecArgs(args, config);
  args.push("-y", outputPath);

  return args;
}

function addCodecArgs(args: string[], config: AudioProcessingConfig): void {
  const { format, bitrate } = config.output;
  if (format === "mp3") {
    args.push("-codec:a", "libmp3lame", "-b:a", bitrate);
  } else if (format === "ogg") {
    args.push("-codec:a", "libvorbis", "-b:a", bitrate);
  } else if (format === "wav") {
    args.push("-codec:a", "pcm_s16le");
  }
}

export type { BuildOutputArgsParams };
export { buildOutputArgs };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_ffmpeg-filter.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import type { LoudnessData } from "./_loudness";

import {
  DB_BASE,
  DB_DIVISOR,
  DB_PRECISION,
  LIMITER_ATTACK,
  LIMITER_RELEASE,
  LOUDNORM_LRA,
} from "./_constant";

function buildFilterChain(
  config: AudioProcessingConfig,
  loudnessData: LoudnessData | null,
): string {
  const filters: string[] = [];

  if (config.highPassFilter.enabled) {
    filters.push(`highpass=f=${config.highPassFilter.frequencyHz}`);
  }

  if (config.normalization.enabled) {
    if (loudnessData) {
      const { targetLufs, truePeakDb } = config.normalization;
      filters.push(
        [
          `loudnorm=I=${targetLufs}`,
          `TP=${truePeakDb}`,
          `LRA=${LOUDNORM_LRA}`,
          `measured_I=${loudnessData.inputI}`,
          `measured_TP=${loudnessData.inputTp}`,
          `measured_LRA=${loudnessData.inputLra}`,
          `measured_thresh=${loudnessData.inputThresh}`,
          `offset=${loudnessData.targetOffset}`,
          "linear=true",
          "print_format=summary",
        ].join(":"),
      );
    } else {
      const { targetLufs, truePeakDb } = config.normalization;
      filters.push(
        `loudnorm=I=${targetLufs}:TP=${truePeakDb}:LRA=${LOUDNORM_LRA}`,
      );
    }
  }

  if (config.limiter.enabled) {
    const amplitude = Number.parseFloat(
      (DB_BASE ** (config.limiter.limitDb / DB_DIVISOR)).toFixed(DB_PRECISION),
    );
    filters.push(
      `alimiter=limit=${amplitude}:attack=${LIMITER_ATTACK}:release=${LIMITER_RELEASE}:level=disabled`,
    );
  }

  return filters.join(",");
}

export { buildFilterChain };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_ffmpeg-runner.ts

```
import { spawn } from "node:child_process";

import { FFMPEG_TIMEOUT_MS } from "./_constant";

const FFMPEG_BINARY = "ffmpeg";
const FFPROBE_BINARY = "ffprobe";

function runFfmpeg(args: string[]): Promise<string> {
  return spawnProcess(FFMPEG_BINARY, args);
}

function runFfprobe(args: string[]): Promise<string> {
  return spawnProcess(FFPROBE_BINARY, args);
}

function spawnProcess(binary: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const stderrChunks: string[] = [];
    const stdoutChunks: string[] = [];

    const proc = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"] });

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
      reject(new Error(`${binary} timed out after ${FFMPEG_TIMEOUT_MS}ms`));
    }, FFMPEG_TIMEOUT_MS);

    proc.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk.toString());
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk.toString());
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);

      if (timedOut) {
        return;
      }

      const stderr = stderrChunks.join("");
      const stdout = stdoutChunks.join("");

      if (code !== 0) {
        reject(new Error(`${binary} exited with code ${code}: ${stderr}`));
        return;
      }

      resolve(stdout || stderr);
    });

    proc.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to spawn ${binary}: ${error.message}`));
    });
  });
}

export { runFfmpeg, runFfprobe };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_fs.ts

```
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { parse } from "node:path";

import { MS_IN_SECOND, SUPPORTED_EXTENSIONS } from "./_constant";
import { runFfprobe } from "./_ffmpeg-runner";

function validateDirectories(inputDir: string, outputDir: string): void {
  if (!existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }
  mkdirSync(outputDir, { recursive: true });
}

function getInputFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => {
      const ext = parse(file).ext.toLowerCase();
      return SUPPORTED_EXTENSIONS.has(ext);
    })
    .sort();
}

function removeTempDir(tempDir: string): void {
  if (!existsSync(tempDir)) {
    return;
  }
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

async function getFileDurationSec(filePath: string): Promise<number> {
  if (!existsSync(filePath)) {
    return 0;
  }

  try {
    const output = await runFfprobe([
      "-v",
      "quiet",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    const seconds = Number.parseFloat(output.trim());
    return Number.isNaN(seconds) ? 0 : seconds;
  } catch {
    return 0;
  }
}

async function getFileDurationMs(filePath: string): Promise<number> {
  const sec = await getFileDurationSec(filePath);
  return Math.round(sec * MS_IN_SECOND);
}

async function getTotalDurationMs(files: string[]): Promise<number> {
  const durations = await Promise.all(files.map(getFileDurationMs));
  let total = 0;
  for (const d of durations) {
    total += d;
  }
  return total;
}

export {
  getFileDurationMs,
  getFileDurationSec,
  getInputFiles,
  getTotalDurationMs,
  removeTempDir,
  validateDirectories,
};

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_loudness.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import { LOUDNORM_FALLBACK, LOUDNORM_JSON_REGEX } from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";

type LoudnessData = {
  inputI: string;
  inputTp: string;
  inputLra: string;
  inputThresh: string;
  targetOffset: string;
};

async function analyzeLoudness(
  inputPath: string,
  config: AudioProcessingConfig,
): Promise<LoudnessData> {
  const preFilters: string[] = [];
  if (config.highPassFilter.enabled) {
    preFilters.push(`highpass=f=${config.highPassFilter.frequencyHz}`);
  }

  const filterChain =
    preFilters.length > 0
      ? `${preFilters.join(",")},loudnorm=print_format=json`
      : "loudnorm=print_format=json";

  const stderr = await runFfmpeg([
    "-i",
    inputPath,
    "-af",
    filterChain,
    "-f",
    "null",
    "-",
  ]);
  return parseLoudnessOutput(stderr);
}

function parseLoudnessOutput(stderr: string): LoudnessData {
  const jsonMatch = stderr.match(LOUDNORM_JSON_REGEX);
  if (!jsonMatch) {
    throw new Error("Failed to parse loudnorm analysis output");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;
    return {
      inputI: parsed.input_i ?? LOUDNORM_FALLBACK.inputI,
      inputTp: parsed.input_tp ?? LOUDNORM_FALLBACK.inputTp,
      inputLra: parsed.input_lra ?? LOUDNORM_FALLBACK.inputLra,
      inputThresh: parsed.input_thresh ?? LOUDNORM_FALLBACK.inputThresh,
      targetOffset: parsed.target_offset ?? LOUDNORM_FALLBACK.targetOffset,
    };
  } catch {
    throw new Error("Failed to parse loudnorm JSON data");
  }
}

export type { LoudnessData };
export { analyzeLoudness };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_silence-detect.ts

```
import { MS_IN_SECOND } from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";

type SilenceSegment = { start: number; end: number };
type VoicedSegment = { start: number; end: number };

type DetectSilenceParams = {
  inputPath: string;
  thresholdDb: number;
  minDurationMs: number;
  highPassHz: number | null;
};

const VOICED_SEGMENT_MIN_SEC = 0.01;
const SILENCE_START_REGEX = /silence_start:\s*([\d.]+)/g;
const SILENCE_END_REGEX = /silence_end:\s*([\d.]+)/g;

async function detectSilence(
  params: DetectSilenceParams,
): Promise<SilenceSegment[]> {
  const minDurationSec = params.minDurationMs / MS_IN_SECOND;

  const filters: string[] = [];
  if (params.highPassHz !== null) {
    filters.push(`highpass=f=${params.highPassHz}`);
  }
  filters.push(
    `silencedetect=noise=${params.thresholdDb}dB:d=${minDurationSec}`,
  );

  const stderr = await runFfmpeg([
    "-i",
    params.inputPath,
    "-af",
    filters.join(","),
    "-f",
    "null",
    "-",
  ]);

  return parseSilenceDetectOutput(stderr);
}

function parseSilenceDetectOutput(stderr: string): SilenceSegment[] {
  const starts = collectMatches(SILENCE_START_REGEX, stderr);
  const ends = collectMatches(SILENCE_END_REGEX, stderr);

  const segments: SilenceSegment[] = [];
  const count = Math.min(starts.length, ends.length);

  for (let i = 0; i < count; i++) {
    const start = starts[i];
    const end = ends[i];
    if (start !== undefined && end !== undefined) {
      segments.push({ start, end });
    }
  }

  if (starts.length > ends.length) {
    const lastStart = starts.at(-1);
    if (lastStart !== undefined) {
      segments.push({ start: lastStart, end: Number.POSITIVE_INFINITY });
    }
  }

  return segments;
}

function collectMatches(regex: RegExp, text: string): number[] {
  const results: number[] = [];
  regex.lastIndex = 0;

  let match = regex.exec(text);
  while (match !== null) {
    const value = match[1];
    if (value !== undefined) {
      results.push(Number.parseFloat(value));
    }
    match = regex.exec(text);
  }

  return results;
}

function getVoicedSegments(
  silenceSegments: SilenceSegment[],
  totalDuration: number,
): VoicedSegment[] {
  if (silenceSegments.length === 0) {
    return [{ start: 0, end: totalDuration }];
  }

  const voiced: VoicedSegment[] = [];
  let cursor = 0;

  for (const silence of silenceSegments) {
    if (silence.start > cursor) {
      voiced.push({ start: cursor, end: silence.start });
    }
    cursor = silence.end;
  }

  if (cursor < totalDuration) {
    voiced.push({ start: cursor, end: totalDuration });
  }

  return voiced.filter((s) => s.end - s.start > VOICED_SEGMENT_MIN_SEC);
}

export type { DetectSilenceParams, SilenceSegment, VoicedSegment };
export { detectSilence, getVoicedSegments };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_silence-remove.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import {
  MS_IN_SECOND,
  SEGMENT_OVERLAP_SEC,
  SPLICE_CROSSFADE_SEC,
} from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";
import { getFileDurationSec } from "./_fs";
import { detectSilence, getVoicedSegments } from "./_silence-detect";

type Segment = { start: number; end: number };

type SpliceParams = {
  inputPath: string;
  outputPath: string;
  segments: Segment[];
  innerGapSec: number;
  sampleRate: number;
  totalDuration: number;
};

async function removeSilence(
  inputPath: string,
  outputPath: string,
  config: AudioProcessingConfig,
): Promise<string> {
  if (!config.silenceRemoval.enabled) {
    return inputPath;
  }

  const { thresholdDb, minDurationMs, keepGapMs } = config.silenceRemoval;
  const highPassHz = config.highPassFilter.enabled
    ? config.highPassFilter.frequencyHz
    : null;

  const totalDuration = await getFileDurationSec(inputPath);
  if (totalDuration <= 0) {
    return inputPath;
  }

  const silenceSegments = await detectSilence({
    inputPath,
    thresholdDb,
    minDurationMs,
    highPassHz,
  });

  if (silenceSegments.length === 0) {
    return inputPath;
  }

  const voicedSegments = getVoicedSegments(silenceSegments, totalDuration);

  if (voicedSegments.length === 0) {
    return inputPath;
  }

  if (voicedSegments.length === 1) {
    const segment = voicedSegments[0];
    if (segment) {
      await trimSingleSegment(inputPath, outputPath, segment);
      return outputPath;
    }
    return inputPath;
  }

  await spliceSegments({
    inputPath,
    outputPath,
    segments: voicedSegments,
    innerGapSec: keepGapMs / MS_IN_SECOND,
    sampleRate: config.output.sampleRate,
    totalDuration,
  });
  return outputPath;
}

async function trimSingleSegment(
  inputPath: string,
  outputPath: string,
  segment: Segment,
): Promise<void> {
  await runFfmpeg([
    "-i",
    inputPath,
    "-ss",
    String(segment.start),
    "-to",
    String(segment.end),
    "-c:a",
    "pcm_s16le",
    "-y",
    outputPath,
  ]);
}

async function spliceSegments(params: SpliceParams): Promise<void> {
  const {
    inputPath,
    outputPath,
    segments,
    innerGapSec,
    sampleRate,
    totalDuration,
  } = params;

  // Extend each segment by overlap amount on both sides (clamped to file bounds).
  // The overlap regions contain real audio from the original file,
  // giving acrossfade actual waveform data to blend instead of hard cuts.
  const extended = segments.map((seg) => ({
    start: Math.max(0, seg.start - SEGMENT_OVERLAP_SEC),
    end: Math.min(totalDuration, seg.end + SEGMENT_OVERLAP_SEC),
  }));

  const filterParts = buildTrimFilters(extended);
  const crossfadeFilters =
    innerGapSec <= 0
      ? buildDirectCrossfades(extended.length)
      : buildGappedCrossfades(extended.length, innerGapSec, sampleRate);
  filterParts.push(...crossfadeFilters);

  await runFfmpeg([
    "-i",
    inputPath,
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    "[out]",
    "-c:a",
    "pcm_s16le",
    "-y",
    outputPath,
  ]);
}

function buildTrimFilters(extended: Segment[]): string[] {
  return extended.map(
    (seg, i) =>
      `[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[seg${i}]`,
  );
}

function buildDirectCrossfades(count: number): string[] {
  const filters: string[] = [];
  const cf = SPLICE_CROSSFADE_SEC;
  let currentLabel = "seg0";

  for (let i = 1; i < count; i++) {
    const outLabel = i === count - 1 ? "out" : `tmp${i}`;
    filters.push(
      `[${currentLabel}][seg${i}]acrossfade=d=${cf}:c1=tri:c2=tri[${outLabel}]`,
    );
    currentLabel = outLabel;
  }

  return filters;
}

function buildGappedCrossfades(
  count: number,
  innerGapSec: number,
  sampleRate: number,
): string[] {
  const filters: string[] = [];
  const cf = SPLICE_CROSSFADE_SEC;
  const totalGap = innerGapSec + cf * 2;
  let currentLabel = "seg0";

  for (let i = 1; i < count; i++) {
    const outLabel = i === count - 1 ? "out" : `tmp${i}`;
    filters.push(
      `aevalsrc=0:d=${totalGap}:s=${sampleRate}:c=stereo[gap${i}]`,
      `[${currentLabel}][gap${i}]acrossfade=d=${cf}:c1=tri:c2=tri[bg${i}]`,
      `[bg${i}][seg${i}]acrossfade=d=${cf}:c1=tri:c2=tri[${outLabel}]`,
    );
    currentLabel = outLabel;
  }

  return filters;
}

export { removeSilence };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/audio-processing/_single-file.ts

```
import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import { existsSync, unlinkSync } from "node:fs";
import { dirname, join, parse } from "node:path";

import { buildOutputArgs } from "./_ffmpeg-args";
import { buildFilterChain } from "./_ffmpeg-filter";
import { runFfmpeg } from "./_ffmpeg-runner";
import { analyzeLoudness } from "./_loudness";
import { removeSilence } from "./_silence-remove";

type ProcessFileParams = {
  inputPath: string;
  outputPath: string;
  config: AudioProcessingConfig;
};

async function processFile(params: ProcessFileParams): Promise<void> {
  const { inputPath, outputPath, config } = params;
  const tempPaths: string[] = [];

  try {
    // Step 1: Remove TTS click artifacts
    const declickedPath = buildTempPath(outputPath, "_declicked.wav");
    await declick(inputPath, declickedPath);
    tempPaths.push(declickedPath);

    // Step 2: Remove silence
    const silenceRemovedPath = buildTempPath(outputPath, "_no_silence.wav");
    const afterSilence = await removeSilence(
      declickedPath,
      silenceRemovedPath,
      config,
    );
    if (afterSilence !== declickedPath) {
      tempPaths.push(silenceRemovedPath);
    }

    // Step 3: Normalize + limiter + highpass
    if (config.normalization.enabled) {
      const loudnessData = await analyzeLoudness(afterSilence, config);
      const filterChain = buildFilterChain(config, loudnessData);
      const args = buildOutputArgs({
        inputPath: afterSilence,
        outputPath,
        filterChain,
        config,
      });
      await runFfmpeg(args);
    } else {
      const filterChain = buildFilterChain(config, null);
      const args = buildOutputArgs({
        inputPath: afterSilence,
        outputPath,
        filterChain,
        config,
      });
      await runFfmpeg(args);
    }
  } finally {
    for (const tempPath of tempPaths) {
      if (existsSync(tempPath)) {
        try {
          unlinkSync(tempPath);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

// adeclick detects and interpolates over short impulsive artifacts
// typical of TTS engines (1-10ms high-frequency spikes at segment
// boundaries). Window 55 samples ≈ 1.25ms at 44.1kHz — catches
// TTS clicks without affecting speech.
async function declick(inputPath: string, outputPath: string): Promise<void> {
  await runFfmpeg([
    "-i",
    inputPath,
    "-af",
    "adeclick=window=55:overlap=75:arorder=8:threshold=2",
    "-c:a",
    "pcm_s16le",
    "-y",
    outputPath,
  ]);
}

function buildTempPath(outputPath: string, suffix: string): string {
  const dir = dirname(outputPath);
  const { name } = parse(outputPath);
  return join(dir, `${name}${suffix}`);
}

export type { ProcessFileParams };
export { processFile };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/ping/ping.processor.ts

```
import type { PingJobData, PingJobResult } from "@packages/contract/queue";

const startTime = Date.now();

function processPing(data: PingJobData): PingJobResult {
  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `🏓 Ping received: "${data.message}" (sent at ${data.timestamp})`,
  );

  return {
    echo: data.message,
    processedAt: Date.now(),
    workerUptime: Date.now() - startTime,
  };
}

export { processPing };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/ping/ping.worker.ts

```
import { registerWorker } from "#worker/shared/queue/registry";

import { processPing } from "./ping.processor";

export function registerPingWorker(): void {
  registerWorker("ping", processPing);
}

```

D:/1_Projects/jstonehub/apps/worker/src/feature/tts/tts.processor.ts

```
import type { TtsJobData, TtsJobResult } from "@packages/contract/queue";

import { SECRET_VOICER_BASE_URL } from "@packages/contract/secret-voicer";

import { env } from "#worker/shared/config/env";
import { workerStorage } from "#worker/shared/storage/storage";

import { downloadToBuffer } from "./_download";

const POLL_INITIAL_DELAY_MS = 5000;
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 300_000;
const API_URL = `${SECRET_VOICER_BASE_URL}/api`;

const REDIRECT_MIN = 300;
const REDIRECT_MAX = 400;

const MP3_BITRATE_KBPS = 128;
const BITS_PER_BYTE = 8;
const MS_IN_SECOND = 1000;

const FETCH_TIMEOUT_MS = 15_000;

type ExternalTaskStatus = {
  status_code: "LOCAL_PROCESSING" | "COMPLETED" | "FAILED";
  audio_url: string | null;
  error: string | null;
};

async function processTts(data: TtsJobData): Promise<TtsJobResult> {
  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🎤 [tts] Starting TTS job ${data.jobId}, taskId=${data.taskId}`);

  try {
    const audioUrl = await pollUntilComplete(data);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.log(`🎤 [tts] Task ${data.taskId} completed, downloading audio`);

    const fullUrl = audioUrl.startsWith("http")
      ? audioUrl
      : `${SECRET_VOICER_BASE_URL}${audioUrl}`;

    const headers = buildAudioHeaders(data.credentials);
    const buffer = await downloadToBuffer(fullUrl, headers);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.log(
      `🎤 [tts] Downloaded ${buffer.length} bytes, uploading to MinIO`,
    );

    await workerStorage.uploadBuffer(data.outputKey, buffer);

    const durationMs = getAudioDurationMs(buffer);

    await safeNotifyCompleted(data.outputKey);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.log(`✅ [tts] Job ${data.jobId} complete → ${data.outputKey}`);

    return {
      outputKey: data.outputKey,
      sizeBytes: buffer.length,
      durationMs,
      processedAt: Date.now(),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(
      `❌ [tts] Job ${data.jobId} (taskId=${data.taskId}) error: ${errorMsg}`,
    );

    await safeNotifyFailed(data.outputKey, errorMsg);

    throw error;
  }
}

async function safeNotifyCompleted(outputKey: string): Promise<void> {
  try {
    const response = await fetch(
      `${env.API_URL}/internal/tts/segment-completed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": env.INTERNAL_SECRET,
        },
        body: JSON.stringify({ outputKey }),
      },
    );
    if (!response.ok) {
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.warn(
        `⚠️ [tts] segment-completed notify failed: HTTP ${response.status}`,
      );
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(
      "⚠️ [tts] Failed to notify segment-completed (non-fatal):",
      error instanceof Error ? error.message : error,
    );
  }
}

async function safeNotifyFailed(
  outputKey: string,
  errorMsg: string,
): Promise<void> {
  try {
    const response = await fetch(`${env.API_URL}/internal/tts/segment-failed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SECRET,
      },
      body: JSON.stringify({ outputKey, error: errorMsg }),
    });
    if (!response.ok) {
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.warn(
        `⚠️ [tts] segment-failed notify failed: HTTP ${response.status}`,
      );
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(
      "⚠️ [tts] Failed to notify segment-failed (non-fatal):",
      error instanceof Error ? error.message : error,
    );
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: REFACTOR
async function pollUntilComplete(data: TtsJobData): Promise<string> {
  const headers = buildApiHeaders(data.credentials);
  const startTime = Date.now();
  const statusUrl = `${API_URL}/task/${data.taskId}/`;

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🎤 [tts] Polling task status at: ${statusUrl}`);

  // Wait before first poll — give secret-voicer.ru time to process
  // and avoid hammering the server with 5 concurrent requests immediately
  // biome-ignore lint/style/noMagicNumbers: REFACTOR
  const jitter = Math.floor(Math.random() * 2000);
  await sleep(POLL_INITIAL_DELAY_MS + jitter);

  let consecutiveNetworkErrors = 0;
  const MaxConsecutiveNetworkErrors = 30;

  while (Date.now() - startTime < POLL_TIMEOUT_MS) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: sequential polling required
      const status = await fetchTaskStatus(data.taskId, headers);
      consecutiveNetworkErrors = 0;

      if (status.status_code === "COMPLETED" && status.audio_url) {
        return status.audio_url;
      }

      if (status.status_code === "FAILED") {
        throw new Error(
          `TTS task ${data.taskId} failed: ${status.error ?? "Unknown error"}`,
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isNetworkError =
        msg.includes("Unable to connect")
        || msg.includes("ECONNREFUSED")
        || msg.includes("ENOTFOUND")
        || msg.includes("ETIMEDOUT")
        || msg.includes("ECONNRESET")
        || msg.includes("fetch failed")
        || msg.includes("aborted");

      if (isNetworkError) {
        consecutiveNetworkErrors++;

        if (consecutiveNetworkErrors >= MaxConsecutiveNetworkErrors) {
          throw new Error(
            `TTS task ${data.taskId}: ${MaxConsecutiveNetworkErrors} consecutive network errors. Giving up. Last error: ${msg}`,
          );
        }

        // biome-ignore lint/suspicious/noConsole: Worker logging required
        console.warn(
          `⚠️ [tts] Network error polling task ${data.taskId} (${consecutiveNetworkErrors}/${MaxConsecutiveNetworkErrors}): ${msg}`,
        );
      } else {
        throw error;
      }
    }

    // Add jitter to prevent all workers polling at the exact same moment
    const pollJitter = Math.floor(Math.random() * MS_IN_SECOND);
    await sleep(POLL_INTERVAL_MS + pollJitter);
  }

  throw new Error(
    `TTS task ${data.taskId} timed out after ${POLL_TIMEOUT_MS}ms`,
  );
}

async function fetchTaskStatus(
  taskId: number,
  headers: Record<string, string>,
): Promise<ExternalTaskStatus> {
  const response = await fetchWithTimeout(
    `${API_URL}/task/${taskId}/`,
    {
      method: "GET",
      headers,
      redirect: "manual",
    },
    FETCH_TIMEOUT_MS,
  );

  const text = await response.text();
  checkResponse(response, text);

  if (!response.ok) {
    throw new Error(`Task status check failed (${response.status})`);
  }

  return JSON.parse(text) as ExternalTaskStatus;
}

function buildApiHeaders(
  creds: TtsJobData["credentials"],
): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": creds.acceptLanguage,
    "content-type": "application/json",
    cookie: `csrftoken=${creds.csrfToken}; sessionid=${creds.sessionId}`,
    origin: SECRET_VOICER_BASE_URL,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": creds.userAgent,
    "x-csrftoken": creds.csrfToken,
  };
}

function buildAudioHeaders(
  creds: TtsJobData["credentials"],
): Record<string, string> {
  return {
    accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
    "accept-language": creds.acceptLanguage,
    cookie: `csrftoken=${creds.csrfToken}; sessionid=${creds.sessionId}`,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": creds.userAgent,
  };
}

function checkResponse(response: Response, text: string): void {
  if (response.status >= REDIRECT_MIN && response.status < REDIRECT_MAX) {
    throw new Error(`Auth redirect (${response.status}). Session expired.`);
  }
  if (text.trimStart().startsWith("<")) {
    throw new Error(`Auth failed — HTML response (${response.status}).`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getAudioDurationMs(buffer: Buffer): number {
  const bits = buffer.length * BITS_PER_BYTE;
  const seconds = bits / (MP3_BITRATE_KBPS * MS_IN_SECOND);
  return Math.round(seconds * MS_IN_SECOND);
}

export { processTts };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/tts/tts.worker.ts

```
import { registerWorker } from "#worker/shared/queue/registry";

import { processTts } from "./tts.processor";

const TTS_CONCURRENCY = 2;

function registerTtsWorker(): void {
  registerWorker("tts", processTts, { concurrency: TTS_CONCURRENCY });
}

export { registerTtsWorker };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/tts/voice-preview.processor.ts

```
import type {
  VoicePreviewJobData,
  VoicePreviewJobResult,
} from "./_voice-preview.type";

import { SECRET_VOICER_BASE_URL } from "@packages/contract/secret-voicer";

import { workerStorage } from "#worker/shared/storage/storage";

import { downloadToBuffer } from "./_download";

async function processVoicePreview(
  data: VoicePreviewJobData,
): Promise<VoicePreviewJobResult> {
  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🔊 [voice-preview] Caching preview for voice ${data.voiceId}`);

  const fullUrl = data.previewUrl.startsWith("http")
    ? data.previewUrl
    : `${SECRET_VOICER_BASE_URL}${data.previewUrl}`;

  const headers = buildHeaders(data.credentials);
  const buffer = await downloadToBuffer(fullUrl, headers);

  await workerStorage.uploadBuffer(data.outputKey, buffer);

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `✅ [voice-preview] Cached ${buffer.length} bytes → ${data.outputKey}`,
  );

  return {
    outputKey: data.outputKey,
    sizeBytes: buffer.length,
    processedAt: Date.now(),
  };
}

function buildHeaders(
  creds: VoicePreviewJobData["credentials"],
): Record<string, string> {
  return {
    accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
    "accept-language": creds.acceptLanguage,
    cookie: `csrftoken=${creds.csrfToken}; sessionid=${creds.sessionId}`,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": creds.userAgent,
  };
}

export { processVoicePreview };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/tts/_download.ts

```
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 300;

async function downloadToBuffer(
  url: string,
  headers: Record<string, string>,
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: sequential retries are intentional — each attempt must complete before deciding to retry
      const response = await fetch(url, { headers });

      if (response.status < HTTP_OK_MIN || response.status >= HTTP_OK_MAX) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.warn(
        `⚠️ [download] Attempt ${attempt}/${MAX_RETRIES} failed: ${lastError.message}`,
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error("Download failed after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { downloadToBuffer };

```

D:/1_Projects/jstonehub/apps/worker/src/feature/tts/_voice-preview.type.ts

```
import type { TtsCredentials } from "@packages/contract/queue";

export type VoicePreviewJobData = {
  voiceId: string;
  previewUrl: string;
  outputKey: string;
  credentials: TtsCredentials;
};

export type VoicePreviewJobResult = {
  outputKey: string;
  sizeBytes: number;
  processedAt: number;
};

```

D:/1_Projects/jstonehub/apps/worker/src/shared/config/env.ts

```
import process from "node:process";
import { Type } from "typebox";
import { Value } from "typebox/value";

const leadingSlash = /^\//;

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal("development"),
    Type.Literal("production"),
    Type.Literal("test"),
  ]),
  REDIS_URL: Type.String({ minLength: 1 }),
  MINIO_ENDPOINT: Type.String({ minLength: 1 }),
  MINIO_PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  MINIO_ACCESS_KEY: Type.String({ minLength: 1 }),
  MINIO_SECRET_KEY: Type.String({ minLength: 1 }),
  MINIO_USE_SSL: Type.Boolean(),
  MINIO_BUCKET: Type.String({ minLength: 1 }),
  WORKER_CONCURRENCY: Type.Number({ minimum: 1, maximum: 50 }),
  API_URL: Type.String({ minLength: 1 }),
  INTERNAL_SECRET: Type.String({ minLength: 1 }),
});

function parseEnv() {
  const raw = process.env;

  const parsed = {
    NODE_ENV: raw.NODE_ENV,
    REDIS_URL: raw.REDIS_URL,
    MINIO_ENDPOINT: raw.MINIO_ENDPOINT,
    MINIO_PORT: Number(raw.MINIO_PORT),
    MINIO_ACCESS_KEY: raw.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: raw.MINIO_SECRET_KEY,
    MINIO_USE_SSL: parseBoolean(raw.MINIO_USE_SSL),
    MINIO_BUCKET: raw.MINIO_BUCKET,
    WORKER_CONCURRENCY: Number(raw.WORKER_CONCURRENCY ?? "5"),
    API_URL: raw.API_URL,
    INTERNAL_SECRET: raw.INTERNAL_SECRET,
  };

  if (!Value.Check(EnvSchema, parsed)) {
    const errors = Value.Errors(EnvSchema, parsed);

    const errorsWithValues = [...errors].map((error) => ({
      ...error,
      value: Value.Pointer.Get(parsed, error.instancePath),
    }));

    const message = errorsWithValues
      .map((e) => {
        const envName = e.instancePath.replace(leadingSlash, "") || "root";
        const received = JSON.stringify(e.value);
        return `  • ${envName}: ${e.message} (received: ${received})`;
      })
      .join("\n");

    throw new Error(`❌ Worker: Invalid environment variables:\n${message}`);
  }

  return parsed;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
  return;
}

export const env = parseEnv();

```

D:/1_Projects/jstonehub/apps/worker/src/shared/queue/connection.ts

```
import IoRedis from "ioredis";

import { env } from "#worker/shared/config/env";

let connection: IoRedis | null = null;

function getRedisConnection(): IoRedis {
  if (!connection) {
    connection = new IoRedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}

function getRedisConnectionOptions() {
  return { url: env.REDIS_URL, maxRetriesPerRequest: null as null };
}

async function closeRedisConnection(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}

export { closeRedisConnection, getRedisConnection, getRedisConnectionOptions };

```

D:/1_Projects/jstonehub/apps/worker/src/shared/queue/registry.ts

```
import type {
  QueueJobDataMap,
  QueueJobResultMap,
  QueueName,
} from "@packages/contract/queue";

import { Worker } from "bullmq";

import { env } from "#worker/shared/config/env";

import { getRedisConnectionOptions } from "./connection";

type JobProcessor<T extends QueueName> = (
  data: QueueJobDataMap[T],
) => QueueJobResultMap[T] | Promise<QueueJobResultMap[T]>;

type RegisteredWorker = {
  name: QueueName;
  worker: Worker;
};

type RegisterWorkerOptions = {
  concurrency?: number;
};

const workers: RegisteredWorker[] = [];

function registerWorker<T extends QueueName>(
  queueName: T,
  processor: JobProcessor<T>,
  options?: RegisterWorkerOptions,
): void {
  const connection = getRedisConnectionOptions();
  const concurrency = options?.concurrency ?? env.WORKER_CONCURRENCY;

  const worker = new Worker<QueueJobDataMap[T], QueueJobResultMap[T]>(
    queueName,
    async (job) => {
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.log(`📦 [${queueName}] Processing job ${job.id}: ${job.name}`);

      const result = await processor(job.data);

      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.log(`✅ [${queueName}] Completed job ${job.id}`);

      return result;
    },
    {
      connection,
      concurrency,
    },
  );

  worker.on("failed", (job, error) => {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(`❌ [${queueName}] Job ${job?.id} failed:`, error.message);
  });

  worker.on("error", (error) => {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(`❌ [${queueName}] Worker error:`, error.message);
  });

  workers.push({ name: queueName, worker });

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `🔧 [${queueName}] Worker registered (concurrency: ${concurrency})`,
  );
}

async function closeAllWorkers(): Promise<void> {
  await Promise.all(
    workers.map(async ({ name, worker }) => {
      await worker.close();
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.log(`🛑 [${name}] Worker closed`);
    }),
  );
  workers.length = 0;
}

function getRegisteredWorkerCount(): number {
  return workers.length;
}

export type { JobProcessor, RegisterWorkerOptions };
export { closeAllWorkers, getRegisteredWorkerCount, registerWorker };

```

D:/1_Projects/jstonehub/apps/worker/src/shared/storage/client.ts

```
import { Client } from "minio";

import { env } from "#worker/shared/config/env";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});
```

D:/1_Projects/jstonehub/apps/worker/src/shared/storage/storage.ts

```
import type { Readable } from "node:stream";

import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

import { env } from "#worker/shared/config/env";

import { minioClient } from "./client";

const bucket = env.MINIO_BUCKET;

async function downloadToFile(key: string, destPath: string): Promise<void> {
  const stream: Readable = await minioClient.getObject(bucket, key);
  const writeStream = createWriteStream(destPath);
  await pipeline(stream, writeStream);
}

async function uploadFromFile(key: string, filePath: string): Promise<void> {
  await minioClient.fPutObject(bucket, key, filePath);
}

async function uploadBuffer(key: string, buffer: Buffer): Promise<void> {
  await minioClient.putObject(bucket, key, buffer, buffer.length);
}

async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await minioClient.removeObjects(bucket, keys);
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucket, key);
    return true;
  } catch {
    return false;
  }
}

export const workerStorage = {
  downloadToFile,
  uploadFromFile,
  uploadBuffer,
  deleteObjects,
  objectExists,
};
```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth/index.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { HomePage } from "#admin/feature/home/home.page";

export const Route = createFileRoute("/_auth/")({
  component: HomePage,
});

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth/storage.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { StoragePage } from "#admin/feature/storage/storage.page";

const Route = createFileRoute("/_auth/storage")({
  component: StoragePage,
});

export { Route };

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_public/login.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

const Route = createFileRoute("/_public/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_public/login"!</div>;
}

export { Route };

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_public/test.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

const Route = createFileRoute("/_public/test")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/test"!</div>;
}

export { Route };

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_auth/index.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { HomePage } from "#hub/feature/home/home.page";

export const Route = createFileRoute("/_auth/")({
  component: HomePage,
});

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_public/login.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

const Route = createFileRoute("/_public/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_public/login"!</div>;
}

export { Route };

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_public/test.tsx

```
import type { JSX } from "solid-js";

import { Button, icon } from "@packages/ui/action";
import { EmptyState } from "@packages/ui/data-display";
import { H1, H2, H3, H4, H5, H6, P } from "@packages/ui/typography";
import { createFileRoute } from "@tanstack/solid-router";
import {
  FileX,
  Inbox,
  PackageOpen,
  SearchX,
  ShieldX,
  WifiOff,
} from "lucide-solid";
import { For } from "solid-js";

const Route = createFileRoute("/_public/test")({
  component: TestPage,
});

function Section(props: { title: string; children: JSX.Element }) {
  return (
    <div class="flex flex-col gap-[16px]">
      <H2>{props.title}</H2>
      {props.children}
    </div>
  );
}

function _Row(props: { label?: string; children: JSX.Element }) {
  return (
    <div class="flex flex-col gap-[6px]">
      {pr_Row.label && <H6 class="text-subtle">{props.label}</H6>}
      <div class="flex flex-wrap items-center gap-[8px]">{props.children}</div>
    </div>
  );
}

function Card(props: { children: JSX.Element }) {
  return (
    <div class="border border-border rounded-xl bg-card p-[16px]">
      {props.children}
    </div>
  );
}

function TestPage() {
  return (
    <div class="flex flex-col gap-[48px] p-[32px] max-w-[1200px] mx-auto">
      <H1>Typography & EmptyState Audit</H1>

      {/* ── Typography: Headings ── */}
      <Section title="Headings — All Levels">
        <div class="flex flex-col gap-[8px]">
          <H1>H1 — Page title (24px bold)</H1>
          <H2>H2 — Section title (20px bold)</H2>
          <H3>H3 — Subsection (16px semibold)</H3>
          <H4>H4 — Card heading (15px semibold)</H4>
          <H5>H5 — Label-like (14px medium)</H5>
          <H6>H6 — Caption (13px medium)</H6>
        </div>
      </Section>

      {/* ── Typography: Heading Variants ── */}
      <Section title="Headings — Variants">
        <div class="flex flex-col gap-[8px]">
          <For
            each={
              ["foreground", "success", "error", "warning", "info"] as const
            }
          >
            {(variant) => <H4 variant={variant}>H4 variant="{variant}"</H4>}
          </For>
        </div>
      </Section>

      {/* ── Typography: Text Levels ── */}
      <Section title="Text (P) — All Levels">
        <div class="flex flex-col gap-[4px]">
          <P level={1}>P level=1 — Large body (20px)</P>
          <P level={2}>P level=2 — Body (18px)</P>
          <P level={3}>P level=3 — Default (14px)</P>
          <P level={4}>P level=4 — Small (13px)</P>
          <P level={5}>P level=5 — Caption (12px)</P>
          <P level={6}>P level=6 — Micro (11px)</P>
        </div>
      </Section>

      {/* ── Typography: Text Variants ── */}
      <Section title="Text (P) — Variants">
        <div class="flex flex-col gap-[4px]">
          <For
            each={
              ["foreground", "success", "error", "warning", "info"] as const
            }
          >
            {(variant) => (
              <P level={3} variant={variant}>
                P level=3 variant="{variant}"
              </P>
            )}
          </For>
        </div>
      </Section>

      {/* ── Typography: Heading + Text Pairs ── */}
      <Section title="Heading + Text Pairs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          <Card>
            <H3>Card Title</H3>
            <P level={3}>
              This is body text that accompanies the card title, providing
              additional context.
            </P>
          </Card>
          <Card>
            <H4 variant="success">Success State</H4>
            <P level={4} variant="success">
              Operation completed successfully.
            </P>
          </Card>
          <Card>
            <H4 variant="error">Error State</H4>
            <P level={4} variant="error">
              Something went wrong. Please try again.
            </P>
          </Card>
          <Card>
            <H5>Small Section</H5>
            <P level={5}>
              Compact content with small heading and caption text.
            </P>
          </Card>
        </div>
      </Section>

      {/* ── EmptyState: Basic ── */}
      <Section title="EmptyState — Title Only">
        <Card>
          <EmptyState title="No items yet" />
        </Card>
      </Section>

      {/* ── EmptyState: With Text ── */}
      <Section title="EmptyState — Title + Text">
        <Card>
          <EmptyState
            title="No results found"
            text="Try adjusting your search or filters to find what you're looking for"
          />
        </Card>
      </Section>

      {/* ── EmptyState: With Icon ── */}
      <Section title="EmptyState — Icon + Title + Text">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          <Card>
            <EmptyState
              icon={<Inbox />}
              title="Inbox is empty"
              text="You're all caught up!"
            />
          </Card>
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="No matches"
              text="No items match your current filters"
            />
          </Card>
          <Card>
            <EmptyState
              icon={<PackageOpen />}
              title="No packages"
              text="Create your first package to get started"
            />
          </Card>
          <Card>
            <EmptyState
              icon={<FileX />}
              title="File not found"
              text="The requested file doesn't exist or has been removed"
            />
          </Card>
        </div>
      </Section>

      {/* ── EmptyState: With Action ── */}
      <Section title="EmptyState — With Action Button">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          <Card>
            <EmptyState
              icon={<Inbox />}
              title="No projects"
              text="Get started by creating your first project"
              action={
                <Button variant="primary" size="sm">
                  {icon({ name: "add", size: "sm" })} Create project
                </Button>
              }
            />
          </Card>
          <Card>
            <EmptyState
              icon={<SearchX />}
              title="No results"
              text="Try different search terms"
              action={
                <Button variant="secondary" size="sm">
                  Clear search
                </Button>
              }
            />
          </Card>
          <Card>
            <EmptyState
              icon={<WifiOff />}
              title="Connection lost"
              text="Check your internet connection and try again"
              action={
                <Button variant="outline" size="sm">
                  {icon({ name: "refresh", size: "sm" })} Retry
                </Button>
              }
            />
          </Card>
          <Card>
            <EmptyState
              icon={<ShieldX />}
              title="Access denied"
              text="You don't have permission to view this resource"
              action={
                <Button variant="ghost" size="sm">
                  Go back
                </Button>
              }
            />
          </Card>
        </div>
      </Section>

      {/* ── EmptyState: Using icon() helper ── */}
      <Section title="EmptyState — Using icon() helper">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
          <Card>
            <EmptyState
              icon={icon({ name: "search" })}
              title="No results"
              text="Nothing matched your query"
            />
          </Card>
          <Card>
            <EmptyState
              icon={icon({ name: "user" })}
              title="No users"
              text="Invite team members to collaborate"
              action={
                <Button variant="primary" size="sm">
                  Invite
                </Button>
              }
            />
          </Card>
          <Card>
            <EmptyState
              icon={icon({ name: "settings" })}
              title="Not configured"
              text="Set up your preferences to get started"
            />
          </Card>
        </div>
      </Section>

      {/* ── EmptyState: Full width (no card) ── */}
      <Section title="EmptyState — Full Width (no card wrapper)">
        <div class="border border-dashed border-border rounded-xl min-h-[300px] flex">
          <EmptyState
            icon={<Inbox />}
            title="This fills the container"
            text="EmptyState uses flex-1 to center within any parent"
            action={
              <Button variant="secondary" size="lg">
                Action
              </Button>
            }
          />
        </div>
      </Section>
    </div>
  );
}

export { Route };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/segment-editor/index.ts

```
export type { SegmentEditorProps } from "./segment-editor";
export type { RoleVoiceMappingPanelProps } from "./segment-editor-voice-mapping";

export { createSegment, normalizeRole, SegmentEditor } from "./segment-editor";
export {
  extractUniqueRoles,
  parseSegmentsFromJson,
} from "./segment-editor-parser";
export { RoleVoiceMappingPanel } from "./segment-editor-voice-mapping";

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/segment-editor/segment-editor-parser.ts

```
import type { Segment } from "@packages/contract/segment";

import { createSegment } from "./segment-editor";

function parseSegmentsFromJson(input: string): Segment[] {
  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }

  const normalized = normalizeJsToJson(trimmed);

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new Error(
      'Invalid format. Expected array: [{"name": "role", "text": "content"}]',
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Input must be an array");
  }

  const segments: Segment[] = [];

  for (const item of parsed) {
    if (item === null || typeof item !== "object") {
      continue;
    }

    const obj = item as Record<string, unknown>;
    const role = String(obj.name ?? obj.role ?? "").trim();
    const text = String(obj.text ?? "").trim();

    if (!(role && text)) {
      continue;
    }

    segments.push(createSegment(role, text));
  }

  if (segments.length === 0) {
    throw new Error(
      'No valid segments found. Each item needs "name" (or "role") and "text".',
    );
  }

  return segments;
}

function normalizeJsToJson(input: string): string {
  let result = input;

  result = result.replace(/,\s*([}\]])/g, "$1");

  result = result.replace(/'((?:[^'\\]|\\.)*)'/g, (_, content: string) => {
    const escaped = content
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\\'/g, "'");
    return `"${escaped}"`;
  });

  result = result.replace(
    /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    '$1"$2":',
  );

  return result;
}

function extractUniqueRoles(segments: Segment[]): string[] {
  const seen = new Set<string>();
  const roles: string[] = [];

  for (const seg of segments) {
    const normalized = seg.role.trim().toLowerCase();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      roles.push(seg.role.trim());
    }
  }

  return roles;
}

export { extractUniqueRoles, parseSegmentsFromJson };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/segment-editor/segment-editor-role-selector.tsx

```
import { SEGMENT_ROLE_MAX_LENGTH } from "@packages/contract/segment";
import { Button } from "@packages/ui/action";
import { Popover } from "@packages/ui/overlay";
import { ChevronDown, Plus } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

type RoleSelectorProps = {
  value: string;
  existingRoles: string[];
  onChange: (role: string) => void;
  disabled: boolean;
};

function RoleSelector(props: RoleSelectorProps) {
  const [open, setOpen] = createSignal(false);
  const [customInput, setCustomInput] = createSignal("");
  const [showCustomInput, setShowCustomInput] = createSignal(false);

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let triggerRef!: HTMLButtonElement;

  const displayValue = () => props.value || "Select role...";
  const hasValue = () => props.value.trim().length > 0;

  function handleSelectRole(role: string) {
    props.onChange(role);
    setOpen(false);
    setShowCustomInput(false);
    setCustomInput("");
  }

  function handleCreateCustom() {
    const value = customInput().trim();
    if (value.length > 0 && value.length <= SEGMENT_ROLE_MAX_LENGTH) {
      props.onChange(value);
      setOpen(false);
      setShowCustomInput(false);
      setCustomInput("");
    }
  }

  function handleCustomKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateCustom();
    }
    if (e.key === "Escape") {
      setShowCustomInput(false);
      setCustomInput("");
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant={hasValue() ? "secondary" : "outline"}
        size="sm"
        class="min-w-[120px] justify-between gap-2"
        disabled={props.disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span class={hasValue() ? "font-medium" : "text-subtle"}>
          {displayValue()}
        </span>
        <ChevronDown size={12} />
      </Button>

      <Popover
        open={open()}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        side="bottom"
      >
        <div class="py-1 min-w-[180px]">
          <Show when={props.existingRoles.length > 0}>
            <div class="px-3 py-1.5 text-xs font-medium text-subtle uppercase">
              Existing Roles
            </div>
            <For each={props.existingRoles}>
              {(role) => (
                <Button
                  variant="ghost"
                  size="sm"
                  class="w-full justify-start px-3 py-2 h-auto text-sm"
                  onClick={() => handleSelectRole(role)}
                >
                  {role}
                </Button>
              )}
            </For>
            <div class="my-1 border-t border-border" />
          </Show>

          <Show
            when={showCustomInput()}
            fallback={
              <Button
                variant="ghost"
                size="sm"
                class="w-full justify-start px-3 py-2 h-auto text-sm gap-2"
                onClick={() => setShowCustomInput(true)}
              >
                <Plus size={12} />
                New role
              </Button>
            }
          >
            <div class="px-3 py-2 space-y-2">
              {/* biome-ignore lint/correctness/noRestrictedElements: native input inside popover */}
              <input
                type="text"
                class="w-full h-[32px] px-[10px] bg-control rounded-md border border-control-border text-[13px] text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="Role name..."
                value={customInput()}
                maxLength={SEGMENT_ROLE_MAX_LENGTH}
                onInput={(e) => setCustomInput(e.currentTarget.value)}
                onKeyDown={handleCustomKeyDown}
                autofocus={true}
              />
              <div class="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  class="flex-1"
                  disabled={customInput().trim().length === 0}
                  onClick={handleCreateCustom}
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInput("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Show>
        </div>
      </Popover>
    </>
  );
}

export { RoleSelector };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/segment-editor/segment-editor-voice-mapping.tsx

```
import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";
import type { RoleVoiceMapping } from "@packages/contract/segment";

import { Button, IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { P } from "@packages/ui/typography";
import { Mic, X } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { VoicePickerDialog } from "../voice-picker/voice-picker.dialog";
import { useVoicePreview } from "../voice-picker/voice-picker-preview";

type RoleVoiceMappingPanelProps = {
  mappings: RoleVoiceMapping[];
  onMappingsChange: (mappings: RoleVoiceMapping[]) => void;
  voices: SecretVoicerVoice[];
  voicesLoading: boolean;
  disabled?: boolean;
  previewApi: {
    getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
  };
};

const VOICE_AVATAR_SMALL_SIZE = 20;

function RoleVoiceMappingPanel(props: RoleVoiceMappingPanelProps) {
  const [pickerOpen, setPickerOpen] = createSignal(false);
  const [activeRole, setActiveRole] = createSignal<string | null>(null);
  const preview = useVoicePreview(props.previewApi);

  const assignedVoiceIds = () => {
    const ids: string[] = [];
    for (const m of props.mappings) {
      if (m.voiceId) {
        ids.push(m.voiceId);
      }
    }
    return ids;
  };

  const activeMapping = () => {
    const role = activeRole();
    return role ? props.mappings.find((m) => m.role === role) : null;
  };

  const disabledVoiceIds = () => {
    const role = activeRole();
    return assignedVoiceIds().filter((id) => {
      const mapping = props.mappings.find((m) => m.voiceId === id);
      return mapping && mapping.role !== role;
    });
  };

  const allMapped = () =>
    props.mappings.length > 0
    && props.mappings.every((m) => m.voiceId !== null);

  function getVoiceByid(voiceId: string | null): SecretVoicerVoice | null {
    if (!voiceId) {
      return null;
    }
    return props.voices.find((v) => v.voiceId === voiceId) ?? null;
  }

  function handleOpenPicker(role: string) {
    setActiveRole(role);
    setPickerOpen(true);
  }

  function handleSelectVoice(voiceId: string) {
    const role = activeRole();
    if (!role) {
      return;
    }

    const updated = props.mappings.map((m) =>
      m.role === role ? { ...m, voiceId } : m,
    );
    props.onMappingsChange(updated);
    setPickerOpen(false);
    setActiveRole(null);
  }

  function handleClearVoice(role: string) {
    const updated = props.mappings.map((m) =>
      m.role === role ? { ...m, voiceId: null } : m,
    );
    props.onMappingsChange(updated);
  }

  function handleClosePicker() {
    setPickerOpen(false);
    setActiveRole(null);
    preview.stopPlayback();
  }

  return (
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <P level={2} class="font-medium">
          Voice Assignment
        </P>
        <Show when={allMapped()}>
          <Badge variant="success" size="sm" aria-label="All roles mapped">
            All assigned
          </Badge>
        </Show>
      </div>

      <Show when={props.mappings.length === 0}>
        <div class="text-sm text-subtle py-4 text-center">
          Add segments with roles to assign voices.
        </div>
      </Show>

      <div class="space-y-2">
        <For each={props.mappings}>
          {(mapping) => {
            const voice = () => getVoiceByid(mapping.voiceId);

            return (
              <RoleMappingRow
                role={mapping.role}
                voice={voice()}
                disabled={props.disabled ?? false}
                onPickVoice={() => handleOpenPicker(mapping.role)}
                onClearVoice={() => handleClearVoice(mapping.role)}
              />
            );
          }}
        </For>
      </div>

      <VoicePickerDialog
        open={pickerOpen()}
        onClose={handleClosePicker}
        onSelect={handleSelectVoice}
        voices={props.voices}
        loading={props.voicesLoading}
        selectedVoiceId={activeMapping()?.voiceId ?? null}
        disabledVoiceIds={disabledVoiceIds()}
        onPreviewPlay={preview.togglePreview}
        playingVoiceId={preview.playingVoiceId()}
      />
    </div>
  );
}

function RoleMappingRow(props: {
  role: string;
  voice: SecretVoicerVoice | null;
  disabled: boolean;
  onPickVoice: () => void;
  onClearVoice: () => void;
}) {
  return (
    <div class="flex items-center gap-3 rounded-lg border border-border p-3 bg-card">
      <div class="flex items-center gap-2 min-w-[100px]">
        <Mic size={14} class="text-subtle shrink-0" />
        <span class="text-sm font-medium truncate">{props.role}</span>
      </div>

      <div class="flex-1 min-w-0">
        <Show
          when={props.voice}
          fallback={
            <Button
              variant="outline"
              size="sm"
              disabled={props.disabled}
              onClick={props.onPickVoice}
            >
              Select voice...
            </Button>
          }
        >
          {(voice) => (
            <div class="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                class="gap-2"
                disabled={props.disabled}
                onClick={props.onPickVoice}
              >
                <VoiceAvatarSmall
                  avatarUrl={voice().avatarUrl}
                  name={voice().name}
                />
                <span class="truncate max-w-[150px]">{voice().name}</span>
                <Badge
                  variant={voice().gender === "MALE" ? "info" : "warning"}
                  size="sm"
                  aria-label={voice().gender}
                >
                  {voice().gender === "MALE" ? "M" : "F"}
                </Badge>
              </Button>

              <Show when={!props.disabled}>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={`Clear voice for ${props.role}`}
                  onClick={props.onClearVoice}
                >
                  <X size={14} />
                </IconButton>
              </Show>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}

function VoiceAvatarSmall(props: { avatarUrl: string | null; name: string }) {
  return (
    <Show
      when={props.avatarUrl}
      fallback={
        <div class="w-[20px] h-[20px] rounded-full bg-secondary shrink-0" />
      }
    >
      {(url) => (
        <img
          src={url()}
          alt={props.name}
          width={VOICE_AVATAR_SMALL_SIZE}
          height={VOICE_AVATAR_SMALL_SIZE}
          class="w-[20px] h-[20px] rounded-full object-cover shrink-0"
        />
      )}
    </Show>
  );
}

export type { RoleVoiceMappingPanelProps };
export { RoleVoiceMappingPanel };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/segment-editor/segment-editor.tsx

```
import type { Segment } from "@packages/contract/segment";

import { SEGMENT_TEXT_MAX_LENGTH } from "@packages/contract/segment";
import { Button, IconButton } from "@packages/ui/action";
import { TextareaField } from "@packages/ui/form";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-solid";
import { createSignal, createUniqueId, For, Show } from "solid-js";

import { RoleSelector } from "./segment-editor-role-selector";

type SegmentEditorProps = {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  disabled?: boolean;
};

function createSegment(role: string, text: string): Segment {
  return { id: createUniqueId(), role, text };
}

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

function SegmentEditor(props: SegmentEditorProps) {
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = createSignal<number | null>(null);

  const allRoles = () => {
    const roles = new Set<string>();
    for (const seg of props.segments) {
      if (seg.role.trim()) {
        roles.add(normalizeRole(seg.role));
      }
    }
    return [...roles];
  };

  function handleAdd() {
    props.onSegmentsChange([...props.segments, createSegment("", "")]);
  }

  function handleRemove(index: number) {
    props.onSegmentsChange(props.segments.filter((_, i) => i !== index));
  }

  function handleDuplicate(index: number) {
    const source = props.segments[index];
    if (!source) {
      return;
    }
    const updated = [...props.segments];
    updated.splice(index + 1, 0, createSegment(source.role, source.text));
    props.onSegmentsChange(updated);
  }

  function handleRoleChange(index: number, role: string) {
    props.onSegmentsChange(
      props.segments.map((seg, i) => (i === index ? { ...seg, role } : seg)),
    );
  }

  function handleTextChange(index: number, text: string) {
    props.onSegmentsChange(
      props.segments.map((seg, i) => (i === index ? { ...seg, text } : seg)),
    );
  }

  // Drag-and-drop handlers
  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    const from = dragIndex();
    if (from === null || from === index) {
      resetDrag();
      return;
    }

    const updated = [...props.segments];
    const [removed] = updated.splice(from, 1);
    if (removed) {
      updated.splice(index, 0, removed);
    }
    props.onSegmentsChange(updated);
    resetDrag();
  }

  function resetDrag() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div class="space-y-2">
      <For each={props.segments}>
        {(segment, index) => (
          <SegmentCard
            segment={segment}
            index={index()}
            allRoles={allRoles()}
            disabled={props.disabled ?? false}
            isDragging={dragIndex() === index()}
            isDragOver={dragOverIndex() === index()}
            onRoleChange={(role) => handleRoleChange(index(), role)}
            onTextChange={(text) => handleTextChange(index(), text)}
            onRemove={() => handleRemove(index())}
            onDuplicate={() => handleDuplicate(index())}
            canRemove={props.segments.length > 1}
            onDragStart={() => handleDragStart(index())}
            onDragOver={(e) => handleDragOver(e, index())}
            onDrop={() => handleDrop(index())}
            onDragEnd={resetDrag}
          />
        )}
      </For>

      <Show when={!props.disabled}>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus size={14} />
          Add Segment
        </Button>
      </Show>
    </div>
  );
}

function SegmentCard(props: {
  segment: Segment;
  index: number;
  allRoles: string[];
  disabled: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onRoleChange: (role: string) => void;
  onTextChange: (text: string) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  canRemove: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const otherRoles = () =>
    props.allRoles.filter((r) => r !== normalizeRole(props.segment.role));

  const cardClass = () => {
    const base = "rounded-lg border p-4 space-y-3 bg-card transition-all";
    if (props.isDragging) {
      return `${base} opacity-40 border-primary`;
    }
    if (props.isDragOver) {
      return `${base} border-primary border-2 bg-primary/5`;
    }
    return `${base} border-border`;
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: FALSE_POSITIVE
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: FALSE_POSITIVE
    <div
      class={cardClass()}
      draggable={!props.disabled}
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      onDragEnd={props.onDragEnd}
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-subtle">
          <Show when={!props.disabled}>
            <GripVertical
              size={14}
              class="cursor-grab active:cursor-grabbing"
            />
          </Show>
          <span class="text-xs font-mono">#{props.index + 1}</span>
        </div>

        <div class="flex-1">
          <RoleSelector
            value={props.segment.role}
            existingRoles={otherRoles()}
            onChange={props.onRoleChange}
            disabled={props.disabled}
          />
        </div>

        <Show when={!props.disabled}>
          <div class="flex items-center gap-1">
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Duplicate segment"
              onClick={props.onDuplicate}
            >
              <Copy size={14} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Remove segment"
              disabled={!props.canRemove}
              onClick={props.onRemove}
            >
              <Trash2 size={14} />
            </IconButton>
          </div>
        </Show>
      </div>

      <TextareaField
        label=""
        value={props.segment.text}
        onValueChange={props.onTextChange}
        disabled={props.disabled}
        readonly={false}
        required={false}
        name={`segment-text-${props.segment.id}`}
        maxLength={SEGMENT_TEXT_MAX_LENGTH}
        minLength={0}
        placeholder="Enter text for this segment..."
        counterLabel={(current, max) => `${current}/${max}`}
      />
    </div>
  );
}

export type { SegmentEditorProps };
export { createSegment, normalizeRole, SegmentEditor };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/voice-picker/index.ts

```
export type { VoicePickerDialogProps } from "./voice-picker.dialog";

export { VoicePickerDialog } from "./voice-picker.dialog";
export { useVoicePreview } from "./voice-picker-preview";

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/voice-picker/voice-picker-preview.ts

```
import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";

import { createSignal, onCleanup } from "solid-js";

type PreviewApi = {
  getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
};

function useVoicePreview(api: PreviewApi) {
  const [playingVoiceId, setPlayingVoiceId] = createSignal<string | null>(null);
  let audioElement: HTMLAudioElement | null = null;

  onCleanup(() => {
    stopPlayback();
  });

  function stopPlayback() {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
      audioElement = null;
    }
    setPlayingVoiceId(null);
  }

  async function togglePreview(voice: SecretVoicerVoice) {
    if (playingVoiceId() === voice.voiceId) {
      stopPlayback();
      return;
    }

    stopPlayback();

    if (!voice.previewUrl) {
      return;
    }

    try {
      const downloadUrl = await api.getPreviewUrl(
        voice.voiceId,
        voice.previewUrl,
      );

      audioElement = new Audio(downloadUrl);
      setPlayingVoiceId(voice.voiceId);

      audioElement.addEventListener("ended", () => {
        setPlayingVoiceId(null);
      });

      audioElement.addEventListener("error", () => {
        setPlayingVoiceId(null);
      });

      await audioElement.play();
    } catch {
      setPlayingVoiceId(null);
    }
  }

  return {
    playingVoiceId,
    togglePreview,
    stopPlayback,
  };
}

export { useVoicePreview };

```

D:/1_Projects/jstonehub/apps/hub/src/shared/ui/voice-picker/voice-picker.dialog.tsx

```
import type {
  SecretVoicerVoice,
  VoiceGender,
} from "@packages/contract/secret-voicer";

import { VOICE_GENDERS } from "@packages/contract/secret-voicer";
import { Button, IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SearchInput } from "@packages/ui/form";
import { Dialog } from "@packages/ui/overlay";
import { Check, Play, Square, User } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";

type VoicePickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (voiceId: string) => void;
  voices: SecretVoicerVoice[];
  loading: boolean;
  selectedVoiceId: string | null;
  disabledVoiceIds?: string[];
  onPreviewPlay?: (voice: SecretVoicerVoice) => void;
  playingVoiceId?: string | null;
};

type SortMode = "popularity" | "name";

const PAGE_SIZE = 20;
const VOICE_AVATAR_SIZE = 40;
const THOUSAND = 1000;
const MILLION = 1_000_000;

function VoicePickerDialog(props: VoicePickerDialogProps) {
  const [search, setSearch] = createSignal("");
  const [genderFilter, setGenderFilter] = createSignal<VoiceGender | null>(
    null,
  );
  const [sortMode, setSortMode] = createSignal<SortMode>("popularity");
  const [displayCount, setDisplayCount] = createSignal(PAGE_SIZE);

  const disabledSet = createMemo(() => new Set(props.disabledVoiceIds ?? []));

  const filteredVoices = createMemo(() => {
    let voices = [...props.voices];

    const query = search().toLowerCase().trim();
    if (query) {
      voices = voices.filter(
        (v) =>
          v.name.toLowerCase().includes(query)
          || (v.description?.toLowerCase().includes(query) ?? false)
          || (v.accent?.toLowerCase().includes(query) ?? false),
      );
    }

    const gender = genderFilter();
    if (gender) {
      voices = voices.filter((v) => v.gender === gender);
    }

    if (sortMode() === "popularity") {
      voices.sort((a, b) => b.usageCount - a.usageCount);
    } else {
      voices.sort((a, b) => a.name.localeCompare(b.name));
    }

    return voices;
  });

  const visibleVoices = createMemo(() =>
    filteredVoices().slice(0, displayCount()),
  );

  const hasMore = createMemo(() => displayCount() < filteredVoices().length);

  function handleLoadMore() {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  }

  function handleSelect(voiceId: string) {
    if (disabledSet().has(voiceId)) {
      return;
    }
    props.onSelect(voiceId);
  }

  function handleClose() {
    setSearch("");
    setGenderFilter(null);
    setDisplayCount(PAGE_SIZE);
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={handleClose}
      title="Select Voice"
      description={`${filteredVoices().length} voice(s) available`}
      content={() => (
        <div class="space-y-4">
          <FilterBar
            search={search()}
            onSearchChange={setSearch}
            genderFilter={genderFilter()}
            onGenderFilterChange={setGenderFilter}
            sortMode={sortMode()}
            onSortModeChange={setSortMode}
          />

          <Show when={props.loading}>
            <div class="text-subtle text-sm text-center py-8">
              Loading voices...
            </div>
          </Show>

          <Show when={!props.loading && filteredVoices().length === 0}>
            <div class="text-subtle text-sm text-center py-8">
              No voices match your filters
            </div>
          </Show>

          <Show when={!props.loading && filteredVoices().length > 0}>
            {/* Увеличить высоту списка */}
            <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <For each={visibleVoices()}>
                {(voice) => (
                  <VoiceCard
                    voice={voice}
                    selected={voice.voiceId === props.selectedVoiceId}
                    disabled={disabledSet().has(voice.voiceId)}
                    playing={voice.voiceId === props.playingVoiceId}
                    onSelect={() => handleSelect(voice.voiceId)}
                    onPreviewPlay={() => props.onPreviewPlay?.(voice)}
                  />
                )}
              </For>
              <Show when={hasMore()}>
                <div class="text-center pt-2">
                  <Button variant="ghost" size="sm" onClick={handleLoadMore}>
                    Load more ({filteredVoices().length - displayCount()}{" "}
                    remaining)
                  </Button>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      )}
      footer={(close) => (
        <div class="flex justify-end">
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
        </div>
      )}
    />
  );
}

function FilterBar(props: {
  search: string;
  onSearchChange: (value: string) => void;
  genderFilter: VoiceGender | null;
  onGenderFilterChange: (gender: VoiceGender | null) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}) {
  return (
    <div class="space-y-3">
      <SearchInput
        value={props.search}
        onValueChange={props.onSearchChange}
        clearLabel="Clear search"
        placeholder="Search by name, accent..."
      />

      <div class="flex items-center gap-2 flex-wrap">
        <GenderFilterButtons
          value={props.genderFilter}
          onChange={props.onGenderFilterChange}
        />
        <div class="ml-auto flex items-center gap-1">
          <SortButton
            label="Popular"
            active={props.sortMode === "popularity"}
            onClick={() => props.onSortModeChange("popularity")}
          />
          <SortButton
            label="A-Z"
            active={props.sortMode === "name"}
            onClick={() => props.onSortModeChange("name")}
          />
        </div>
      </div>
    </div>
  );
}

function GenderFilterButtons(props: {
  value: VoiceGender | null;
  onChange: (gender: VoiceGender | null) => void;
}) {
  return (
    <div class="flex items-center gap-1">
      <Button
        variant={props.value === null ? "primary" : "ghost"}
        size="sm"
        onClick={() => props.onChange(null)}
      >
        All
      </Button>
      <For each={[...VOICE_GENDERS]}>
        {(gender) => (
          <Button
            variant={props.value === gender ? "primary" : "ghost"}
            size="sm"
            onClick={() =>
              props.onChange(props.value === gender ? null : gender)
            }
          >
            {gender === "MALE" ? "Male" : "Female"}
          </Button>
        )}
      </For>
    </div>
  );
}

function SortButton(props: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={props.active ? "secondary" : "ghost"}
      size="sm"
      onClick={props.onClick}
    >
      {props.label}
    </Button>
  );
}

function VoiceCard(props: {
  voice: SecretVoicerVoice;
  selected: boolean;
  disabled: boolean;
  playing: boolean;
  onSelect: () => void;
  onPreviewPlay: () => void;
}) {
  const v = props.voice;

  const cardClass = () => {
    const base =
      "w-full text-left rounded-lg border p-3 transition-colors cursor-pointer";
    if (props.selected) {
      return `${base} border-primary bg-primary/10`;
    }
    if (props.disabled) {
      return `${base} border-border opacity-50 cursor-not-allowed`;
    }
    return `${base} border-border hover:border-primary/50 hover:bg-secondary/30`;
  };

  return (
    // biome-ignore lint/correctness/noRestrictedElements: FALSE_POSITIVE
    <button
      type="button"
      class={cardClass()}
      disabled={props.disabled}
      onClick={props.onSelect}
    >
      <div class="flex items-start gap-3 w-full">
        <VoiceAvatar avatarUrl={v.avatarUrl} name={v.name} />

        <div class="flex-1 min-w-0 text-left space-y-1">
          {/* Первая строка: имя + гендер + галка */}
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold leading-tight">{v.name}</span>
            <Badge
              variant={v.gender === "MALE" ? "info" : "warning"}
              size="sm"
              aria-label={v.gender}
            >
              {v.gender === "MALE" ? "M" : "F"}
            </Badge>
            <Show when={props.selected}>
              <Check size={14} class="text-primary shrink-0" />
            </Show>
          </div>

          {/* Вторая строка: locale + accent + usage */}
          <div class="flex items-center gap-2 text-xs text-subtle flex-wrap">
            <Show when={v.locale}>
              <span class="font-mono">{v.locale}</span>
            </Show>
            <Show when={v.accent}>
              <span>• {v.accent}</span>
            </Show>
            <span>• {formatUsageCount(v.usageCount)} uses</span>
          </div>

          {/* Описание */}
          <Show when={v.description}>
            {/* biome-ignore lint/correctness/noRestrictedElements: FALSE_POSITIVE */}
            <p class="text-xs text-subtle line-clamp-2 leading-relaxed">
              {v.description}
            </p>
          </Show>

          {/* Теги */}
          <Show when={v.voiceStyleTags.length > 0}>
            <div class="flex gap-1 flex-wrap mt-1">
              {/* biome-ignore lint/style/noMagicNumbers: FALSE_POSITIVE */}
              <For each={v.voiceStyleTags.slice(0, 3)}>
                {(tag) => (
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-subtle">
                    {tag}
                  </span>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Preview button */}
        <Show when={v.previewUrl}>
          <IconButton
            variant="outline"
            size="sm"
            aria-label={
              props.playing
                ? `Stop ${v.name} preview`
                : `Play ${v.name} preview`
            }
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              props.onPreviewPlay();
            }}
          >
            <Show when={props.playing} fallback={<Play size={14} />}>
              <Square size={14} />
            </Show>
          </IconButton>
        </Show>
      </div>
    </button>
  );
}

function VoiceAvatar(props: { avatarUrl: string | null; name: string }) {
  return (
    <Show
      when={props.avatarUrl}
      fallback={
        <div class="w-[40px] h-[40px] rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User size={18} class="text-subtle" />
        </div>
      }
    >
      {(url) => (
        <img
          src={url()}
          alt={props.name}
          width={VOICE_AVATAR_SIZE}
          height={VOICE_AVATAR_SIZE}
          class="w-[40px] h-[40px] rounded-full object-cover shrink-0"
        />
      )}
    </Show>
  );
}

function formatUsageCount(count: number): string {
  if (count >= MILLION) {
    return `${(count / MILLION).toFixed(1)}M`;
  }
  if (count >= THOUSAND) {
    return `${(count / THOUSAND).toFixed(1)}K`;
  }
  return String(count);
}

export type { VoicePickerDialogProps };
export { VoicePickerDialog };

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth/content/joke.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { JokePage } from "#admin/feature/joke/joke.page";

const Route = createFileRoute("/_auth/content/joke")({ component: JokePage });

export { Route };

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth/content/language.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { LanguagePage } from "#admin/feature/language/language.page";

const Route = createFileRoute("/_auth/content/language")({
  component: LanguagePage,
});

export { Route };

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth/content/tag.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { TagPage } from "#admin/feature/tag/tag.page";

const Route = createFileRoute("/_auth/content/tag")({ component: TagPage });

export { Route };

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth/infrastructure/browser-fingerprint.tsx

```
import {
  BROWSER_FINGERPRINT_SORTS,
  BROWSER_FINGERPRINT_STATUSES,
} from "@packages/contract/browser-fingerprint";
import { createValidateSearch } from "@packages/contract/pagination";
import { createFileRoute } from "@tanstack/solid-router";

import { BrowserFingerprintPage } from "#admin/feature/browser-fingerprint/browser-fingerprint.page";

const validateSearch = createValidateSearch({
  mode: "all",
  sorts: BROWSER_FINGERPRINT_SORTS,
  sortDefault: "createdAt",
  orderDefault: "desc",
  filters: {
    status: { values: BROWSER_FINGERPRINT_STATUSES },
  },
});

const Route = createFileRoute("/_auth/infrastructure/browser-fingerprint")({
  validateSearch,
  component: BrowserFingerprintPage,
});

export { Route };

```

D:/1_Projects/jstonehub/apps/admin/src/app/routes/_auth/infrastructure/secret-voicer-credential.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { SecretVoicerCredentialPage } from "#admin/feature/secret-voicer-credential/secret-voicer-credential.page";

const Route = createFileRoute("/_auth/infrastructure/secret-voicer-credential")(
  {
    component: SecretVoicerCredentialPage,
  },
);

export { Route };

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_auth/tool/audio-processing.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { AudioProcessingPage } from "#hub/feature/audio-processing/audio-processing.page";

const Route = createFileRoute("/_auth/tool/audio-processing")({
  component: AudioProcessingPage,
});

export { Route };

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_auth/tool/tts/create.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { TtsCreatePage } from "#hub/feature/tts/tts-create.page";

const Route = createFileRoute("/_auth/tool/tts/create")({
  component: TtsCreatePage,
});

export { Route };

```

D:/1_Projects/jstonehub/apps/hub/src/app/routes/_auth/tool/tts/index.tsx

```
import { createFileRoute } from "@tanstack/solid-router";

import { TtsJobsPage } from "#hub/feature/tts/tts-jobs.page";

const Route = createFileRoute("/_auth/tool/tts/")({
  component: TtsJobsPage,
});

export { Route };

```