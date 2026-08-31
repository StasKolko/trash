# Product Vision

## What is JStoneHub

JStoneHub is a content production platform where users leverage AI tools
to create, process, and manage social media content at scale. The platform
serves both individual creators and organized teams through a unified
energy-based economy.

---

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                    │
│                                                                    │
│  ┌─────────────┐  ┌──────────────┐                                │
│  │  Hub (3000)  │  │ Admin (3001) │  SolidJS + TanStack            │
│  │  User-facing │  │ Staff-facing │  Router / Query / Table / Form │
│  └──────┬───────┘  └──────┬───────┘                                │
│         │                 │                                        │
│         │  HTTP + httpOnly cookies                                 │
│         ▼                 ▼                                        │
│  ┌─────────────────────────────────────┐                          │
│  │           API (4000)                │  Elysia + Bun             │
│  │                                     │                          │
│  │  Auth, Permissions, Users,          │                          │
│  │  Energy, Subscriptions, Orgs,       │                          │
│  │  Projects, Social Accounts,         │                          │
│  │  Content DBs, Blueprints,           │                          │
│  │  AI Provider orchestration,         │                          │
│  │  Feedback, Audit, Pricing           │                          │
│  └──────┬──────────────┬──────────────┘                          │
│         │              │                                          │
│         │  BullMQ      │  SQL / Redis / S3                        │
│         ▼              ▼                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │   Worker   │ │ PostgreSQL │ │   Redis    │ │   MinIO    │    │
│  │   (4001)   │ │            │ │            │ │   (S3)     │    │
│  │            │ │ Source of  │ │ Queues,    │ │ Files,     │    │
│  │ Audio,     │ │ truth for  │ │ cache,     │ │ audio,     │    │
│  │ Video,     │ │ all data   │ │ rate       │ │ video,     │    │
│  │ AI tasks,  │ │            │ │ limiting   │ │ images     │    │
│  │ Browser    │ │            │ │            │ │            │    │
│  │ automation │ │            │ │            │ │            │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Core Domain Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│                                                                   │
│  Identity: email, name, avatar (from OAuth)                       │
│  Auth: OAuth accounts (Google, future: others)                    │
│  Sessions: multiple devices, managed                              │
│  Permissions: admin:*, org:*, project:*, account:*                │
│  Economy: energy balance, subscription, purchase history          │
│  Timezone: for daily energy claim                                 │
│                                                                   │
│  ┌─────────────────────────────┐                                 │
│  │       SUBSCRIPTION          │                                 │
│  │  common (free) / rare /     │                                 │
│  │  epic / legendary           │                                 │
│  │                             │                                 │
│  │  Provides:                  │                                 │
│  │  - Discount on energy       │                                 │
│  │  - Daily energy (on login)  │                                 │
│  │  - Energy pack (on purchase)│                                 │
│  │  - Blueprint discounts      │                                 │
│  │  - Premium features         │                                 │
│  │                             │                                 │
│  │  Stacking: multiple active  │                                 │
│  │  subscriptions stack        │                                 │
│  │  bonuses, discount = max    │                                 │
│  └─────────────────────────────┘                                 │
│                                                                   │
│  Can: buy energy (personal), transfer to org (irreversible),      │
│       buy directly for org (with org:fund permission),            │
│       use tools, buy blueprints, create one organization          │
└────────────────────┬────────────────────────────────────────────┘
                     │ creates / owns (max one)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION                                │
│                                                                   │
│  No subscription. Energy balance only.                            │
│  Funded by: member transfers + direct purchases.                  │
│  Volume discount: based on total purchased amount.                │
│                                                                   │
│  Members: users with org-scoped permissions                       │
│  Owner: creator (owner_id FK, immutable, cannot leave)            │
│                                                                   │
│  ┌──────────────┐                                                │
│  │   PROJECT     │  Budget allocated from org balance             │
│  │              │  (hard limit — reserved, not advisory)          │
│  │  ┌──────────────────┐                                         │
│  │  │ SOCIAL ACCOUNT   │  Budget from project (optional)         │
│  │  │                  │  Platform: YouTube, Instagram, etc.     │
│  │  │  ┌──────────────────┐                                      │
│  │  │  │ CONTENT TYPE     │  e.g. "Vertical video + dynamic bg"  │
│  │  │  │                  │  Energy limit, publish schedule       │
│  │  │  └──────────────────┘                                      │
│  │  └──────────────────┘                                         │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Energy Economy

### Pricing Flow

```
┌──────────────────────────────────────────────────────────┐
│                   ADMIN: PRICING CONFIG                    │
│                                                            │
│  1. Base rate: $1 = 1,000,000 energy (fixed)               │
│                                                            │
│  2. Per tool: real cost (USD) + global markup (%)           │
│     + individual adjustment (+/- %)                        │
│     + optional coefficients (bitrate, resolution, etc.)    │
│     → final energy cost per unit (ceil to integer)         │
│                                                            │
│  3. Subscriptions: price, discount %, daily %, pack %      │
│     Validation: higher tier must have higher discount      │
│                                                            │
│  4. Org volume tiers: total purchased → bonus discount %   │
│     Validation: sum of owner subscription + org tier       │
│     must not exceed MAX_DISCOUNT_PERCENT                   │
│                                                            │
│  5. Blueprint prices: energy amount (one-time purchase)    │
│                                                            │
│  Every change increments price_version per tool.           │
│  Client sends price_version with requests.                 │
│  Mismatch → 409 Conflict with new pricing.                 │
└──────────────────────────────────────────────────────────┘
```

### Purchase Paths

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  PATH 1: Buy for yourself                                     │
│    discount = your subscription discount                      │
│    energy = usd × ENERGY_PER_DOLLAR / (1 - discount/100)     │
│    → goes to personal balance                                 │
│                                                               │
│  PATH 2: Transfer personal → organization                     │
│    amount chosen by user                                      │
│    irreversible                                               │
│    logged in audit                                            │
│                                                               │
│  PATH 3: Buy directly for organization                        │
│    requires permission org:{id}:fund                          │
│    discount = owner_sub_discount + org_volume_discount        │
│    capped at MAX_DISCOUNT_PERCENT                             │
│    energy = usd × ENERGY_PER_DOLLAR / (1 - discount/100)     │
│    → goes directly to org balance                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Permission System

No roles. Only permissions. One table, one mechanism.

```
┌──────────────────────────────────────────────────────────────┐
│                    PERMISSION FORMAT                           │
│                                                                │
│  scope:entity:action                                           │
│                                                                │
│  ADMIN SCOPE (platform-wide):                                  │
│    admin:all                  — platform owner (bypasses all)  │
│    admin:access               — can enter admin panel          │
│    admin:user:read            — view user list                 │
│    admin:user:ban             — ban/unban users                │
│    admin:user:grant_energy    — credit energy to users         │
│    admin:joke:all             — all joke actions               │
│    admin:joke:read            — view jokes                     │
│    admin:pricing:manage       — manage pricing config          │
│    ...                                                         │
│                                                                │
│  ORG SCOPE (per organization):                                 │
│    org:{org_id}:all           — org owner (auto-assigned)      │
│    org:{org_id}:fund          — fund org balance               │
│    org:{org_id}:manage        — edit org settings              │
│    org:{org_id}:view_logs     — view energy logs               │
│    org:{org_id}:project:create                                 │
│    org:{org_id}:project:delete                                 │
│                                                                │
│  RESOURCE SCOPE (per project / account):                       │
│    project:{project_id}:manage                                 │
│    project:{project_id}:view                                   │
│    account:{account_id}:manage                                 │
│    account:{account_id}:view                                   │
│                                                                │
│  RESOLUTION ORDER:                                             │
│    Check specific → check :all for entity → check scope :all   │
│    Example: checking admin:joke:read                           │
│      1. Has "admin:joke:read"? → yes → allow                  │
│      2. Has "admin:joke:all"?  → yes → allow                  │
│      3. Has "admin:all"?       → yes → allow                  │
│      4. None found → deny                                      │
│                                                                │
│  ON RESOURCE DELETE:                                           │
│    DELETE FROM permission                                      │
│    WHERE permission LIKE 'project:{id}:%'                      │
│    (cleanup in service layer, single indexed query)            │
│                                                                │
│  ON USER BAN:                                                  │
│    DELETE FROM permission WHERE user_id = :id                  │
│    AND permission LIKE 'admin:%'                               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## User Journeys

### Journey 1: Individual Creator

```
Sign up (Google OAuth)
  → Land on Hub dashboard (common tier, 0 energy)
  → Buy energy ($10 → 10M energy) or subscription
  → Use audio processing tools
  → Use TTS generation
  → Use image generation
  → Results stored in MinIO, downloadable
```

### Journey 2: Team Content Production

```
Creator sets up organization
  → Creates projects ("English Jokes", "Spanish Stories")
  → Adds social accounts per project (YouTube, Instagram)
  → Defines content types per account
  → Invites team members with specific permissions
  → Allocates energy budgets (org → project → account)
  → Team members produce content using blueprints
  → Track energy spend per tool / account / project
```

### Journey 3: Blueprint Usage (Vertical Jokes)

```
User buys "Vertical Jokes — Dynamic Background" blueprint
  → Selects joke from joke database (or random)
  → Selects background category (funny fail, cute animals, etc.)
  → Configures: speaker, logo, subscriber count, languages
  → Clicks "Generate"
  → Worker pipeline:
     1. Fetch joke text + translations
     2. Generate TTS audio (multi-voice)
     3. Fetch dynamic background video
     4. Render text overlay animation
     5. Render speaker overlay (position, size randomized)
     6. Add laugh track (optional)
     7. Compose final video
     8. Upload to MinIO
  → User downloads or queues for publishing
```

### Journey 4: Admin Operations

```
Admin with admin:access + specific permissions
  → View/search/filter users
  → Ban/unban users (with reason, audit logged)
  → Credit energy to users (with reason, audit logged)
  → Grant/revoke subscriptions
  → Manage permissions for other staff
  → Configure pricing (tools, subscriptions, discounts)
  → Moderate content (jokes, feedback)
  → View audit logs
```

---

## Revenue Model

```
┌──────────────────────────────────────────────────────────┐
│                    REVENUE STREAMS                         │
│                                                            │
│  1. SUBSCRIPTIONS (recurring)                              │
│     Monthly (30 days) or yearly (365 days, 1-2 mo free)   │
│     Tiers: rare, epic, legendary                           │
│     Margin: SUBSCRIPTION_MARGIN_PERCENT on energy value    │
│                                                            │
│  2. ENERGY SALES (transactional)                           │
│     Personal purchases: markup on base rate                │
│     Organization purchases: volume-discounted but still    │
│     above cost due to GLOBAL_MARKUP_PERCENT on tools       │
│                                                            │
│  3. BLUEPRINTS (one-time)                                  │
│     Energy-priced modules for content generation           │
│     User pays once, permanent access                       │
│                                                            │
│  4. TOOL USAGE (per-use)                                   │
│     Every tool action costs energy                         │
│     Markup over real infrastructure cost                   │
│     Coefficients for heavy operations                      │
│                                                            │
│  5. FUTURE:                                                │
│     - Telegram subscription channel                        │
│     - Merchandise store                                    │
│     - Blog monetization                                    │
│                                                            │
│  COST STRUCTURE:                                           │
│     - Server compute (audio/video processing)              │
│     - AI API costs (TTS, image gen, LLM)                   │
│     - Storage (MinIO / S3)                                 │
│     - Infrastructure (DB, Redis, networking)               │
│     All tracked per-tool, configurable in admin panel      │
└──────────────────────────────────────────────────────────┘
```

---

## Technical Principles

| Principle | Implementation |
|---|---|
| Source of truth | PostgreSQL for all data, Redis for queues/cache only |
| Auth | OAuth only (Google first), JWT access + refresh in httpOnly cookies |
| Authorization | Pure permissions, no roles. One table, hierarchical resolution |
| Energy | bigint, integer arithmetic only, ceil() on calculations |
| Processing | API orchestrates, Worker executes. BullMQ queues |
| File storage | MinIO (S3-compatible). Presigned URLs for upload/download |
| Caching | 4 levels: in-memory → Redis → S3 → PostgreSQL |
| Lists | Standardized via contract factories. mode: all / cursor |
| Frontend | SolidJS, TanStack Router/Query. URL search params as source of truth |
| Testing | Unit + integration (Vitest), E2E (Playwright) |
| Dev experience | Dev seed cards, `__test__` prefix, excluded from prod bundle |
| Performance | O(1) preferred, O(log n) acceptable, O(n) justified only |
