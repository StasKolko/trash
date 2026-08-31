# Milestones

Ordered list of development milestones. Each milestone builds on
previous ones. Total target: 3 intensive days with AI-assisted
development.

---

## Overview

```
Day 1 (8-10h):
  MS-01: Auth & Permissions .............. ~8h
  
Day 2 (8-10h):
  MS-02: Energy & Subscriptions .......... ~5h
  MS-03: Organizations (basic) ........... ~4h

Day 3 (8-10h):
  MS-04: Admin Panel ..................... ~4h
  MS-05: Audio Processing & Worker ....... ~5h

Post-Day 3 (ongoing):
  MS-06: AI Providers .................... ~6h
  MS-07: Content DB & Feedback ........... ~5h
  MS-08: Blueprints ...................... ~8h
  MS-09: Payments Integration ............ ~6h
```

---

## MS-01: Auth & Permissions

**Goal:** Users can sign in via Google OAuth. Sessions are managed
with JWT access + refresh tokens. Permissions system controls access
to admin panel and future features.

**Depends on:** Nothing (first milestone)

### Scope

| Included | NOT included |
|---|---|
| Google OAuth flow (PKCE) | Other OAuth providers |
| JWT access token (15min) in httpOnly cookie | |
| Refresh token (14 days) with rotation | |
| Session management (list, revoke, revoke all) | |
| Permission table + CRUD | Role-based access (no roles) |
| `admin:all` assignment via OWNER_EMAIL | |
| Auth middleware + permission guards | |
| Hub: login page, private layout, session | |
| Admin: login page, private layout, permission check | |
| Interceptor with refresh + mutex | |
| Logout with full cache clear | |
| Dev seed: test users with various permissions | |

### Completion Criteria

- [ ] User can sign in via Google OAuth on Hub
- [ ] User can sign in via Google OAuth on Admin (requires `admin:access`)
- [ ] Access token expires after 15min, refresh works transparently
- [ ] Refresh token rotation: old token invalidated on use
- [ ] Session list shows all active sessions with device info
- [ ] User can revoke individual sessions and all sessions
- [ ] Banned user gets 403 on all API requests
- [ ] Platform owner (OWNER_EMAIL) gets `admin:all` on first login
- [ ] Permission checks work: `admin:access`, `admin:user:read`, etc.
- [ ] Interceptor handles concurrent 401s with mutex
- [ ] Logout clears cookies + queryClient.clear()
- [ ] Dev seed creates test users with assorted permissions

### Testing Checklist

- [ ] OAuth flow: happy path (new user, existing user)
- [ ] OAuth flow: banned user redirected with error
- [ ] OAuth flow: admin login without `admin:access` → error
- [ ] Refresh: expired access token → transparent refresh → retry
- [ ] Refresh: expired refresh token → redirect to login
- [ ] Refresh: concurrent requests → single refresh call (mutex)
- [ ] Refresh: stolen token detection (rotation)
- [ ] Permission: `admin:all` bypasses all checks
- [ ] Permission: `admin:joke:all` bypasses `admin:joke:*` checks
- [ ] Permission: missing permission → 403
- [ ] Ban: cascades to delete admin permissions + all sessions
- [ ] Session: revoke specific session → that device gets 401
- [ ] Session: revoke all → all devices get 401

### Critical Warnings

1. **Refresh token stored as SHA-256 hash** — never store raw
2. **Refresh token cookie path = `/api/auth/refresh`** — not sent to other endpoints
3. **`queryClient.clear()` on logout** — prevents data leak between accounts
4. **Permission resolution order:** specific → `:all` for entity → scope `:all`
5. **OWNER_EMAIL check only on user creation** — not on every login

**Detailed breakdown:** [milestone-01-auth.md](./milestone-01-auth.md)

---

## MS-02: Energy & Subscriptions

**Goal:** Users have energy balances. Subscriptions provide daily
energy and purchase discounts. Pricing engine configurable via admin.

**Depends on:** MS-01 (auth, permissions, user table)

### Scope

| Included | NOT included |
|---|---|
| User energy balance (bigint) | Payment provider integration |
| Subscription tiers (common/rare/epic/legendary) | Auto-renewal |
| Subscription purchase (manual via admin for MVP) | |
| Daily energy claim on login (timezone-aware) | |
| Energy pack on subscription purchase | |
| Subscription stacking on upgrade | |
| Energy purchase (personal) with subscription discount | |
| Price versioning (409 on mismatch) | |
| Tool pricing config in admin | |
| Subscription config in admin | |
| Global markup + per-tool adjustment | |
| Coefficients (bitrate, resolution, etc.) | |
| Admin: grant energy to user (audit logged) | |
| Admin: grant/revoke subscription (audit logged) | |
| Audit log for all energy/subscription mutations | |
| Dev seed: users with various balances and subscriptions | |

### Completion Criteria

- [ ] User has energy balance displayed in Hub header (abbreviated)
- [ ] Hover on balance shows full number
- [ ] Admin can grant energy to user (reason required, audit logged)
- [ ] Admin can grant subscription to user (audit logged)
- [ ] Daily energy claimed on login, respects timezone, no duplicates
- [ ] Login streak tracked and displayed
- [ ] Subscription stacking works (two active subs, bonuses stack)
- [ ] Discount = max of active subscriptions
- [ ] Tool energy cost calculated: real_cost × markup × coefficient
- [ ] Price version sent with requests, 409 on mismatch
- [ ] Admin pricing page: tools, subscriptions, markups, discounts
- [ ] Validation: higher tier must have higher discount
- [ ] All energy mutations logged in audit (append-only)

### Testing Checklist

- [ ] Daily claim: first login of day → energy credited
- [ ] Daily claim: second login same day → no duplicate credit
- [ ] Daily claim: login after midnight in user's timezone → new credit
- [ ] Subscription: active sub → correct daily amount
- [ ] Subscription: common (free) → 0 daily energy
- [ ] Subscription: two active subs → bonuses stacked, discount = max
- [ ] Subscription: expired sub → no more daily energy
- [ ] Energy deduction: sufficient balance → success
- [ ] Energy deduction: insufficient balance → 402 Payment Required
- [ ] Price version: matching → success
- [ ] Price version: mismatch → 409 with new pricing
- [ ] Admin grant: energy credited, audit log created
- [ ] Admin grant: subscription assigned, audit log created
- [ ] Integer arithmetic: no floating point anywhere

### Critical Warnings

1. **All energy operations use bigint** — no floating point ever
2. **ceil() when converting USD to energy** — user always pays at least 1
3. **Price version prevents stale-price attacks** — client must send version
4. **Audit log is append-only** — no UPDATE, no DELETE
5. **Timezone stored per user** — daily claim uses user's timezone

**Detailed breakdown:** [milestone-02-energy.md](./milestone-02-energy.md)

---

## MS-03: Organizations

**Goal:** Users can create organizations, invite members with
granular permissions, allocate energy budgets to projects and
social accounts.

**Depends on:** MS-02 (energy balance, permission system)

### Scope

| Included | NOT included |
|---|---|
| Organization CRUD (one per user as owner) | Organization transfer |
| Org energy balance | Payment integration for org |
| Energy transfer: personal → org (irreversible) | |
| Direct purchase for org (with org:fund permission) | |
| Org volume discount tiers | |
| Projects within organization | |
| Social accounts within projects | |
| Content types within social accounts | |
| Budget allocation: org → project → account (hard) | |
| Org permissions: fund, manage, view_logs, etc. | |
| Resource permissions: project:manage, account:manage | |
| Social platform entity (YouTube, Instagram, etc.) | |
| Platform request system (users request new platforms) | |
| Energy spend tracking per tool/account/project | |
| Dev seed: orgs with projects, accounts, members | |

### Completion Criteria

- [ ] User can create one organization
- [ ] Owner gets `org:{id}:all` permission automatically
- [ ] Owner can invite members with specific permissions
- [ ] Member with `org:{id}:fund` can transfer personal energy
- [ ] Member with `org:{id}:fund` can buy energy directly for org
- [ ] Org discount = owner subscription discount + volume tier
- [ ] Discount capped at MAX_DISCOUNT_PERCENT
- [ ] Projects created with budget from org balance (reserved)
- [ ] Social accounts created with optional budget from project
- [ ] Content types defined per social account
- [ ] Resource permissions (project:manage, account:manage) work
- [ ] Deleting project → cleanup resource permissions
- [ ] Energy spend logged per tool, per account, per project
- [ ] Organization deletion: only owner, energy burns

### Testing Checklist

- [ ] Create org: user can create one, second attempt → 409
- [ ] Permissions: owner bypasses all org checks
- [ ] Permissions: member without fund → cannot transfer energy
- [ ] Transfer: personal → org, balance updated, irreversible
- [ ] Transfer: attempt to exceed personal balance → error
- [ ] Budget: allocate to project → reserved from org balance
- [ ] Budget: project spend exceeds budget → blocked (hard limit)
- [ ] Discount: correct calculation with owner sub + volume tier
- [ ] Discount: cap at MAX_DISCOUNT_PERCENT
- [ ] Delete project: all resource permissions cleaned up
- [ ] Delete org: all energy burns, members lose access

### Critical Warnings

1. **Energy transfer is irreversible** — no refunds from org
2. **Budget is hard-reserved** — cannot be spent elsewhere
3. **Permission cleanup on resource delete** — single indexed DELETE
4. **One org per user as owner** — DB constraint
5. **Owner cannot leave** — must delete org to exit

**Detailed breakdown:** [milestone-03-organizations.md](./milestone-03-organizations.md)

---

## MS-04: Admin Panel

**Goal:** Full admin interface for managing users, permissions,
pricing, audit logs, and platform configuration.

**Depends on:** MS-01 (auth), MS-02 (energy, subscriptions)

### Scope

| Included | NOT included |
|---|---|
| User list with search, filter, sort (cursor pagination) | |
| User detail: permissions, subscription, energy, sessions | |
| Ban/unban with reason (cascade: permissions, sessions) | |
| Grant/revoke energy with reason | |
| Grant/revoke subscription | |
| Permission management: view all, grant, revoke | |
| Pricing management: tools, subscriptions, discounts | |
| Audit log viewer (filterable, cursor pagination) | |
| Platform configuration (discount caps, tiers) | |
| Dev seed cards on all admin pages | |

### Completion Criteria

- [ ] User list: search by name/email (trigram), filter by ban status
- [ ] User detail: full info, edit permissions, view sessions
- [ ] Ban: sets is_banned, deletes admin permissions, deletes sessions
- [ ] Unban: clears is_banned, user starts with zero permissions
- [ ] Energy grant: amount + reason required, audit logged
- [ ] Subscription grant: tier + duration, audit logged
- [ ] Permission page: see who has what, bulk operations
- [ ] Pricing page: configure all tools, subscriptions, markups
- [ ] Audit log: filterable by actor, target, action, date range
- [ ] All admin actions require appropriate permissions

### Critical Warnings

1. **Cannot ban user with `admin:all`** — platform owner protection
2. **Cannot modify own permissions** — prevent self-lockout
3. **Audit log is read-only in UI** — no delete capability
4. **Pricing changes increment price_version** — immediate effect

**Detailed breakdown:** [milestone-04-admin.md](./milestone-04-admin.md)

---

## MS-05: Audio Processing & Worker Pipeline

**Goal:** Users can upload audio/video files, process them
(silence removal, noise reduction, merging), and download results.
Worker infrastructure established for all future heavy tasks.

**Depends on:** MS-02 (energy deduction), MS-01 (auth)

### Scope

| Included | NOT included |
|---|---|
| MinIO presigned upload/download URLs | Video rendering |
| Worker queue infrastructure (BullMQ) | AI-powered processing |
| Audio processing: silence removal | Image generation |
| Audio processing: noise reduction | TTS |
| Audio processing: spike removal | |
| Audio processing: merge multiple files | |
| Video: extract audio, process, reattach | |
| Configurable parameters per operation | |
| Energy cost calculation with coefficients | |
| Job progress tracking (SSE to client) | |
| Job result storage in MinIO | |
| Dev seed: sample audio files for testing | |

### Completion Criteria

- [ ] User uploads audio via presigned URL to MinIO
- [ ] API creates worker job, deducts energy
- [ ] Worker processes audio (FFmpeg)
- [ ] Result uploaded to MinIO, user notified
- [ ] User downloads result via presigned URL
- [ ] All processing parameters configurable
- [ ] Coefficients applied (duration, bitrate)
- [ ] Job progress visible in UI (SSE)
- [ ] Failed jobs: energy refunded, user notified
- [ ] Video: audio extracted, processed, reattached

### Critical Warnings

1. **Energy deducted before processing** — refund on failure
2. **Presigned URLs expire** — 15min for upload, 1h for download
3. **Worker must not block** — each job isolated
4. **FFmpeg is CPU-heavy** — limit concurrent jobs per worker

**Detailed breakdown:** [milestone-05-audio.md](./milestone-05-audio.md)

---

## MS-06: AI Providers

**Goal:** Integrate external AI services (TTS, image generation)
with rate limiting, account rotation, and fingerprint management
for browser-based providers.

**Depends on:** MS-05 (worker infrastructure)

### Scope

| Included | NOT included |
|---|---|
| AI provider entity (name, type, config) | Advanced browser emulation |
| Provider account management (multiple per provider) | |
| Rate limiting per account (req/min, req/day, req/month) | |
| Account rotation (round-robin, free-first) | |
| Basic fingerprint management | |
| TTS integration (first provider) | |
| Queue system for cheap energy (off-peak) | |
| Provider health monitoring | |

**Detailed breakdown:** [milestone-06-ai-providers.md](./milestone-06-ai-providers.md)

---

## MS-07: Content Database & Feedback

**Goal:** Joke database with translations, categories, tags.
Universal feedback system for reporting errors in any entity.

**Depends on:** MS-04 (admin panel), MS-06 (AI providers for TTS generation)

### Scope

| Included | NOT included |
|---|---|
| Joke entity: text, category, tags, rating, length | Other content DBs (stories, etc.) |
| Joke translations (per language) | User-submitted jokes |
| Joke audio generation (TTS per translation) | |
| Language entity (managed in admin) | |
| Category / tag system (per content type, not shared) | |
| Feedback system: report errors on any entity | |
| Feedback resolution: admin reviews, grants energy reward | |
| Admin: joke CRUD, moderation, bulk operations | |
| Admin: feedback queue, resolve/reject with reason | |
| Content permission checks (admin:joke:read, etc.) | |
| Dev seed: test jokes with translations, tags, feedback | |

### Completion Criteria

- [ ] Jokes created via admin with text, category, tags
- [ ] Translations added per language (multiple per joke)
- [ ] TTS audio generated per translation (via AI provider)
- [ ] Audio stored in MinIO, URL cached in DB
- [ ] Joke list in admin: search, filter by category/tag/language
- [ ] Feedback: user can report error on any joke (from Hub)
- [ ] Feedback includes entity type, entity ID, description
- [ ] Feedback visible to: assigned content moderator + global feedback viewers
- [ ] Admin resolves feedback: fix issue, optionally reward energy to reporter
- [ ] Admin rejects feedback: mark as invalid, optionally warn reporter
- [ ] All feedback actions audit logged
- [ ] Joke data accessible to blueprints (API endpoint)

### Testing Checklist

- [ ] Joke CRUD: create, update, delete with permissions
- [ ] Translation: add multiple languages, update, delete
- [ ] TTS generation: triggered on translation create/update
- [ ] TTS generation: energy deducted from admin budget (platform account)
- [ ] Feedback: user submits on joke → visible in admin
- [ ] Feedback: moderator resolves → energy reward to user
- [ ] Feedback: moderator rejects → no reward, optional warning
- [ ] Feedback: duplicate prevention (same user, same entity, open feedback)
- [ ] Search: trigram search on joke text works across languages
- [ ] Filter: by category, tag, language, has-audio, feedback-pending

### Critical Warnings

1. **TTS generation costs energy** — deducted from platform operational account
2. **Feedback is scoped to entity** — `entity_type` + `entity_id`, not free-form
3. **Energy reward for valid feedback** — amount configurable in admin
4. **Duplicate feedback prevention** — one open feedback per user per entity

**Detailed breakdown:** [milestone-07-content.md](./milestone-07-content.md)

---

## MS-08: Blueprints

**Goal:** First blueprint implemented: "Vertical Jokes — Dynamic
Background". Blueprint purchase system. Full video generation
pipeline.

**Depends on:** MS-05 (worker, audio), MS-06 (AI providers, TTS),
MS-07 (joke database)

### Scope

| Included | NOT included |
|---|---|
| Blueprint entity (name, description, price, config) | Blueprint marketplace UI |
| Blueprint purchase (energy, one-time, permanent) | User-created blueprints |
| Subscription discount on blueprint purchase | |
| First blueprint: "Vertical Jokes — Dynamic Background" | Other blueprint types |
| Pipeline steps: joke selection, TTS, background, overlay | |
| Speaker system: platform speakers + user-uploaded | |
| Speaker positioning (randomized within bounds) | |
| Text reveal animation (white background, top-down) | |
| Logo + subscriber count overlay | |
| Laugh track (configurable: on/off) | |
| Multi-language generation (batch, one click) | |
| Long joke splitting (multiple reveals) | |
| Video composition (FFmpeg) | |
| Result upload to MinIO | |
| Social account integration (logo, subscribers from API) | |
| Dev seed: test blueprints, speakers | |

### Completion Criteria

- [ ] Blueprint entity in DB, purchasable with energy
- [ ] Subscription discount applied to blueprint price
- [ ] User configures blueprint: joke, background, speaker, languages
- [ ] Worker executes full pipeline: TTS → background → overlay → compose
- [ ] Speaker: platform default + user-uploaded, random selection/position
- [ ] Text reveal: animated white background, supports long jokes
- [ ] Logo + subscriber count from social account (YouTube API)
- [ ] Laugh track toggleable
- [ ] Multi-language: one config → multiple videos generated
- [ ] Progress visible in UI (SSE per pipeline step)
- [ ] Result downloadable from MinIO
- [ ] Energy deducted per generated video (tool pricing × duration)

### Testing Checklist

- [ ] Purchase blueprint: energy deducted, permanent access
- [ ] Purchase blueprint: subscription discount applied correctly
- [ ] Purchase blueprint: already owned → error
- [ ] Generate: all pipeline steps execute in order
- [ ] Generate: TTS failure → partial refund, error reported
- [ ] Generate: multi-language → N videos, N × energy cost
- [ ] Speaker: random selection from available pool
- [ ] Speaker: position within configured bounds
- [ ] Long joke: auto-split into multiple reveals
- [ ] YouTube API: fetches logo + subscriber count
- [ ] YouTube API: failure → fallback to manual input

### Critical Warnings

1. **Pipeline is multi-step** — partial failure must refund proportionally
2. **Video rendering is CPU-intensive** — limit concurrent renders
3. **YouTube API has rate limits** — cache social account data, refresh daily
4. **Speaker files stored in MinIO** — presigned URLs for upload
5. **Multi-language multiplies cost** — user must confirm total before starting

**Detailed breakdown:** [milestone-08-blueprints.md](./milestone-08-blueprints.md)

---

## MS-09: Payments Integration

**Goal:** Connect payment providers (Stripe, possibly YooKassa)
for energy purchases and subscription payments. Replace admin
manual grants with real payment flow.

**Depends on:** MS-02 (energy, subscriptions), all previous milestones stable

### Scope

| Included | NOT included |
|---|---|
| Stripe integration (primary) | Auto-renewal (future) |
| Energy purchase flow (fixed packs + custom amount) | YooKassa (deferred) |
| Subscription purchase flow | |
| Organization energy purchase flow | |
| Webhook handling (payment confirmation) | |
| Payment history (user-facing) | |
| Refund handling (admin-initiated) | |
| Currency display (USD primary, conversion for display) | |
| Purchase validation (min/max amounts) | |
| Receipt generation | |
| Admin: payment history viewer | |

### Completion Criteria

- [ ] User can purchase energy via Stripe checkout
- [ ] Fixed packs displayed with prices and energy amounts
- [ ] Custom amount with live energy calculation (with discount)
- [ ] Subscription purchase via Stripe checkout
- [ ] Organization purchase via Stripe (requires org:fund permission)
- [ ] Webhook confirms payment → energy/subscription credited
- [ ] Failed payment → no credit, user notified
- [ ] Payment history visible to user (Hub settings)
- [ ] Admin can view all payments, initiate refunds
- [ ] Refund → energy deducted, audit logged
- [ ] All payment operations idempotent (webhook retry safe)

### Testing Checklist

- [ ] Stripe test mode: full purchase flow
- [ ] Webhook: successful payment → energy credited exactly once
- [ ] Webhook: duplicate delivery → idempotent, no double credit
- [ ] Webhook: failed payment → no credit
- [ ] Subscription: correct tier activated after payment
- [ ] Org purchase: discount calculated correctly
- [ ] Refund: energy deducted, balance cannot go negative (error if spent)
- [ ] Edge case: payment during price change → uses price at checkout time

### Critical Warnings

1. **Webhook idempotency** — store payment_intent_id, skip duplicates
2. **Price at checkout time** — lock price when checkout session created
3. **Refund with spent energy** — if balance < refund amount, partial refund or deny
4. **Stripe webhook signature verification** — mandatory, prevents spoofing
5. **No auto-renewal in MVP** — manual repurchase only

**Detailed breakdown:** [milestone-09-payments.md](./milestone-09-payments.md)

---

## Dependency Graph

```
MS-01: Auth & Permissions
  │
  ├──→ MS-02: Energy & Subscriptions
  │      │
  │      ├──→ MS-03: Organizations
  │      │
  │      ├──→ MS-04: Admin Panel
  │      │
  │      └──→ MS-05: Audio Processing & Worker
  │             │
  │             └──→ MS-06: AI Providers
  │                    │
  │                    └──→ MS-07: Content DB & Feedback
  │                           │
  │                           └──→ MS-08: Blueprints
  │
  └──→ MS-09: Payments (after all milestones stable)
```

---

## Cross-Cutting Concerns

These are NOT separate milestones. They are built incrementally
with each milestone:

| Concern | How it grows |
|---|---|
| **@packages/ui** | Components added as needed per milestone. Button in MS-01, energy display in MS-02, tables in MS-04, file upload in MS-05, video player in MS-08 |
| **@packages/contract** | Permission types in MS-01, energy/subscription types in MS-02, org types in MS-03, pricing types in MS-02, content types in MS-07 |
| **Audit log** | Schema in MS-01, energy actions in MS-02, org actions in MS-03, admin actions in MS-04, payment actions in MS-09 |
| **Dev seed** | Users in MS-01, balances/subs in MS-02, orgs in MS-03, jokes in MS-07, blueprints in MS-08 |
| **E2E tests (Playwright)** | Auth flow in MS-01, energy flow in MS-02, admin flow in MS-04. Added per milestone |
| **Error handling** | Auth errors in MS-01, payment errors in MS-02, permission errors in MS-03. Consistent pattern established in MS-01 |
