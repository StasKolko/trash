# Milestone 02: Energy & Subscriptions

---

## Overview

Users have energy balances (bigint). Subscriptions provide daily
energy on login and purchase discounts. Pricing engine fully
configurable via admin panel. All mutations audit-logged.

**Duration:** ~5 hours
**Depends on:** MS-01 (auth, permissions, user table, audit log)

---

## Step-by-Step Execution Order

```
Step 1:  @packages/contract — energy types, subscription tiers
Step 2:  Database tables — subscription, energy_transaction, 
         tool_pricing, subscription_config, pricing_config
Step 3:  Energy service — balance operations, daily claim
Step 4:  Subscription service — purchase, stacking, expiry
Step 5:  Pricing service — tool cost calculation, coefficients
Step 6:  API endpoints — energy, subscriptions, pricing admin
Step 7:  Hub frontend — energy display, daily claim indicator
Step 8:  Admin frontend — pricing config, energy/subscription grants
Step 9:  Dev seed — users with various balances and subscriptions
Step 10: Tests
```

---

## Step 1: @packages/contract Updates

### Subscription tiers

```
packages/contract/src/subscription.ts

SUBSCRIPTION_TIER = ["common", "rare", "epic", "legendary"] as const
type SubscriptionTier = typeof SUBSCRIPTION_TIER[number]

PAID_SUBSCRIPTION_TIER = ["rare", "epic", "legendary"] as const
type PaidSubscriptionTier = typeof PAID_SUBSCRIPTION_TIER[number]

ENERGY_PER_DOLLAR = 1_000_000  (fixed, never changes)

Functions:
  isPaidTier(tier: SubscriptionTier): tier is PaidSubscriptionTier
  formatEnergy(amount: bigint): string
    — "1.2M", "350K", "5.7B" (abbreviated for display)
  formatEnergyFull(amount: bigint): string
    — "1,200,000" (full with separators, for tooltip)
```

### Energy transaction types

```
packages/contract/src/energy.ts

ENERGY_TRANSACTION_TYPE = [
  "daily_claim",
  "subscription_pack",
  "purchase_personal",
  "purchase_for_org",
  "transfer_to_org",
  "tool_usage",
  "blueprint_purchase",
  "admin_grant",
  "admin_revoke",
  "refund",
] as const

type EnergyTransactionType = typeof ENERGY_TRANSACTION_TYPE[number]
```

---

## Step 2: Database Tables

### subscription

```
subscription
├── id              : text (PK, cuid2)
├── user_id         : text (NOT NULL, FK → user ON DELETE CASCADE)
├── tier            : text (NOT NULL)  — "rare" | "epic" | "legendary"
├── starts_at       : timestamp with tz (NOT NULL)
├── expires_at      : timestamp with tz (NOT NULL)
├── is_active       : boolean (NOT NULL, default true)
├── daily_energy    : bigint (NOT NULL)    — energy per daily claim
├── pack_energy     : bigint (NOT NULL)    — energy granted on purchase
├── discount_percent: integer (NOT NULL)   — purchase discount %
├── source          : text (NOT NULL)      — "purchase" | "admin_grant"
├── created_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  INDEX(user_id, is_active, expires_at)   — "user's active subscriptions"
  INDEX(expires_at)                        — cleanup expired
```

Multiple active subscriptions possible (stacking on upgrade).
is_active set to false when expires_at < now (checked on read,
batch cleanup via cron).

### energy_transaction

```
energy_transaction
├── id              : text (PK, cuid2)
├── user_id         : text (nullable, FK → user ON DELETE SET NULL)
├── org_id          : text (nullable, FK → organization ON DELETE SET NULL)
├── type            : text (NOT NULL)  — EnergyTransactionType
├── amount          : bigint (NOT NULL) — positive = credit, negative = debit
├── balance_after   : bigint (NOT NULL) — balance snapshot after transaction
├── tool_id         : text (nullable)   — which tool was used
├── price_version   : integer (nullable) — tool price version at time of use
├── metadata        : jsonb (nullable)   — extra context
├── created_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  INDEX(user_id, created_at)             — user transaction history
  INDEX(org_id, created_at)              — org transaction history
  INDEX(type, created_at)                — filter by type
  INDEX(created_at)                      — chronological (for aggregation cron)
```

Note: energy_transaction is the **detailed log** with 3-month retention.
After 3 months, aggregated into monthly summaries, details deleted.

### energy_summary (aggregated)

```
energy_summary
├── id              : text (PK, cuid2)
├── user_id         : text (nullable, FK → user ON DELETE SET NULL)
├── org_id          : text (nullable, FK → organization ON DELETE SET NULL)
├── period          : text (NOT NULL)   — "2024-01" (year-month)
├── type            : text (NOT NULL)   — EnergyTransactionType
├── tool_id         : text (nullable)
├── total_amount    : bigint (NOT NULL)
├── transaction_count : integer (NOT NULL)
├── created_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(user_id, org_id, period, type, tool_id)  — one summary per combo
  INDEX(user_id, period)
  INDEX(org_id, period)
```

### tool_pricing

```
tool_pricing
├── id                  : text (PK, cuid2)
├── tool_key            : text (UNIQUE, NOT NULL)  — "audio:silence_removal"
├── display_name        : text (NOT NULL)
├── description         : text (nullable)
├── unit                : text (NOT NULL)          — "second", "image", "request"
├── real_cost_usd       : numeric(20,10) (NOT NULL) — actual cost per unit
├── individual_markup   : integer (NOT NULL, default 0)  — +/- % adjustment
├── energy_cost_per_unit: bigint (NOT NULL)        — computed, stored for speed
├── price_version       : integer (NOT NULL, default 1)
├── is_active           : boolean (NOT NULL, default true)
├── coefficients        : jsonb (nullable)         — [{name, formula, description}]
├── updated_at          : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(tool_key)                       — O(log n) lookup by key
```

`energy_cost_per_unit` is precomputed:
```
energy_cost_per_unit = ceil(
  real_cost_usd × (1 + (GLOBAL_MARKUP + individual_markup) / 100) 
  × ENERGY_PER_DOLLAR
)
```

Recomputed on: real_cost change, markup change, global markup change.
Price version incremented on every recomputation.

Coefficients stored as JSON array:
```json
[
  {
    "name": "bitrate",
    "description": "Audio bitrate multiplier",
    "formula": "value / 128 + 0.5",
    "unit": "kbps",
    "default": 128
  }
]
```

Formula evaluated server-side (simple math expressions only,
no eval — parsed with a safe expression parser).

### pricing_config

```
pricing_config
├── id                  : text (PK, cuid2)
├── key                 : text (UNIQUE, NOT NULL)
├── value               : text (NOT NULL)
├── updated_at          : timestamp with tz (NOT NULL, default now)

Rows:
  global_markup_percent     : "10"
  max_discount_percent      : "70"
  subscription_margin_percent: "10"
  daily_energy_percent      : "0.5"
  energy_reward_feedback    : "1000"
```

Key-value config table. Loaded into memory on API start,
refreshed on update. Avoids DB query per request.

### subscription_config

```
subscription_config
├── id                  : text (PK, cuid2)
├── tier                : text (UNIQUE, NOT NULL)  — "rare"/"epic"/"legendary"
├── display_name        : text (NOT NULL)
├── price_monthly_usd   : numeric(10,2) (NOT NULL)
├── price_yearly_usd    : numeric(10,2) (NOT NULL)
├── discount_percent    : integer (NOT NULL)       — personal purchase discount
├── blueprint_discount_percent : integer (NOT NULL)
├── daily_energy        : bigint (NOT NULL)        — energy per daily claim
├── pack_energy         : bigint (NOT NULL)        — energy granted on purchase
├── features            : jsonb (NOT NULL)         — list of premium features
├── sort_order          : integer (NOT NULL)       — display order
├── is_active           : boolean (NOT NULL, default true)
├── updated_at          : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(tier)
  INDEX(sort_order)
```

Validation rules (enforced in service layer):
- Higher sort_order tier MUST have higher discount_percent
- Higher sort_order tier MUST have higher daily_energy
- Higher sort_order tier MUST have higher pack_energy
- discount_percent + max org_volume_discount <= max_discount_percent

### org_volume_tier

```
org_volume_tier
├── id                  : text (PK, cuid2)
├── min_purchased_usd   : numeric(10,2) (NOT NULL) — threshold
├── discount_percent    : integer (NOT NULL)
├── sort_order          : integer (NOT NULL)
├── updated_at          : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(sort_order)
  INDEX(min_purchased_usd)
```

Example rows:
```
sort_order=0: min=$0,     discount=0%
sort_order=1: min=$100,   discount=5%
sort_order=2: min=$1000,  discount=10%
sort_order=3: min=$10000, discount=20%
```

Validation: higher tier MUST have higher discount. Sum of
max subscription discount + max org tier discount must not
exceed max_discount_percent from pricing_config.

---

## Step 3: Energy Service

### Balance Operations

```
Location: apps/api/src/feature/energy/energy.service.ts

Core principle: ALL balance mutations go through this service.
No direct UPDATE on user.energy_balance anywhere else.

Functions:

  creditEnergy(params: {
    userId: string
    amount: bigint          — positive
    type: EnergyTransactionType
    toolId?: string
    priceVersion?: number
    metadata?: Record<string, unknown>
  })
    1. UPDATE user SET energy_balance = energy_balance + amount
       WHERE id = userId
       RETURNING energy_balance
    2. INSERT energy_transaction (amount = +amount, balance_after)
    3. Return new balance

  debitEnergy(params: {
    userId: string
    amount: bigint          — positive (will be stored as negative)
    type: EnergyTransactionType
    toolId?: string
    priceVersion?: number
    metadata?: Record<string, unknown>
  })
    1. UPDATE user SET energy_balance = energy_balance - amount
       WHERE id = userId AND energy_balance >= amount
       RETURNING energy_balance
    2. If no rows updated → InsufficientEnergyError (402)
    3. INSERT energy_transaction (amount = -amount, balance_after)
    4. Return new balance

  Note: step 1 is atomic — PostgreSQL handles concurrent
  deductions correctly via row-level locking. No race condition.
  The WHERE energy_balance >= amount prevents negative balance.

  transferToOrg(params: {
    userId: string
    orgId: string
    amount: bigint
  })
    1. In a transaction:
       a. debitEnergy(userId, amount, "transfer_to_org")
       b. UPDATE organization SET energy_balance = energy_balance + amount
          WHERE id = orgId
          RETURNING energy_balance
       c. INSERT energy_transaction (org_id, amount = +amount, balance_after)
    2. Audit log: transfer recorded

  getBalance(userId: string): bigint
    — SELECT energy_balance FROM user WHERE id = userId

  getTransactionHistory(params: {
    userId?: string
    orgId?: string
    cursor pagination params
  })
    — Returns energy_transaction list (recent 3 months)
    — Falls back to energy_summary for older periods
```

### Daily Energy Claim

```
Location: apps/api/src/feature/energy/energy-claim.service.ts

Function:
  claimDailyEnergy(params: {
    userId: string
    timezone: string
    lastClaimAt: Date | null
    loginStreak: number
  }): { claimed: boolean, amount: bigint, newStreak: number }
  
  Logic:
    1. Get user's active subscriptions
       SELECT * FROM subscription
       WHERE user_id = :id AND is_active = true AND expires_at > now()
    
    2. If no active subscriptions → return { claimed: false, amount: 0 }
       (common tier = no daily energy)
    
    3. Calculate total daily energy (stacking):
       dailyTotal = sum of all active subscription.daily_energy
    
    4. Check if already claimed today (in user's timezone):
       a. Convert now() to user's timezone → currentDay
       b. Convert lastClaimAt to user's timezone → lastClaimDay
       c. If lastClaimDay === null → eligible (first ever claim)
       d. If currentDay > lastClaimDay → eligible
       e. If currentDay === lastClaimDay → already claimed today
    
    5. If not eligible → return { claimed: false, amount: 0 }
    
    6. Calculate streak:
       a. If lastClaimDay === yesterday (in user's timezone) → streak + 1
       b. Else → streak = 1
    
    7. Credit energy:
       creditEnergy(userId, dailyTotal, "daily_claim")
    
    8. Update user:
       UPDATE user SET
         last_energy_claim_at = now(),
         login_streak = newStreak
       WHERE id = userId
    
    9. Return { claimed: true, amount: dailyTotal, newStreak }
```

**Timezone handling:** uses IANA timezone strings (e.g. "America/New_York").
Conversion done in JavaScript using `Intl.DateTimeFormat` or a lightweight
library. PostgreSQL stores all timestamps in UTC. Comparison happens in
application code after timezone conversion.

**Why not in PostgreSQL?** Timezone conversion in SQL is possible
(`AT TIME ZONE`) but complex for "is this the same calendar day in
the user's timezone". Doing it in JS is clearer and testable.

---

## Step 4: Subscription Service

```
Location: apps/api/src/feature/subscription/subscription.service.ts

Functions:

  grantSubscription(params: {
    userId: string
    tier: PaidSubscriptionTier
    durationDays: number      — 30 for monthly, 365 for yearly
    source: "purchase" | "admin_grant"
    grantedBy?: string        — admin user_id (for admin_grant)
  })
    1. Load subscription_config for tier
    2. Create subscription record:
       starts_at = now()
       expires_at = now() + durationDays
       daily_energy = config.daily_energy
       pack_energy = config.pack_energy
       discount_percent = config.discount_percent
       is_active = true
    3. Credit pack energy:
       creditEnergy(userId, config.pack_energy, "subscription_pack")
    4. If source === "admin_grant":
       Create audit_log entry
    5. Return subscription

  getActiveSubscriptions(userId: string)
    SELECT * FROM subscription
    WHERE user_id = :id AND is_active = true AND expires_at > now()
    ORDER BY discount_percent DESC
    
    Note: ordered by discount so max discount is first (easy access).

  getEffectiveDiscount(userId: string): number
    — Returns max discount_percent across all active subscriptions
    — 0 if no active subscriptions (common tier)

  getEffectiveBlueprintDiscount(userId: string): number
    — Same logic for blueprint_discount_percent

  cleanupExpired()
    — Called by cron (daily)
    — UPDATE subscription SET is_active = false
      WHERE is_active = true AND expires_at < now()
    — No energy clawback — expired subscription just stops providing benefits
```

### Stacking logic

When a user upgrades (buys a higher tier while lower tier is active):

```
Before: [Rare: active, expires in 20 days]
Action: Buy Epic (30 days)
After:  [Rare: active, expires in 20 days]
        [Epic: active, expires in 30 days]

Daily energy = Rare.daily_energy + Epic.daily_energy
Discount = max(Rare.discount, Epic.discount) = Epic.discount
Pack energy = Epic.pack_energy (credited immediately)
```

After 20 days, Rare expires:
```
After:  [Rare: inactive]
        [Epic: active, expires in 10 days]

Daily energy = Epic.daily_energy
Discount = Epic.discount
```

Simple, no proration math. Both subscriptions are independent records.

---

## Step 5: Pricing Service

```
Location: apps/api/src/feature/pricing/pricing.service.ts

In-memory cache:
  pricingConfig: Map<string, string>       — from pricing_config table
  toolPricing: Map<string, ToolPricing>    — from tool_pricing table
  subscriptionConfigs: SubscriptionConfig[] — from subscription_config table
  orgVolumeTiers: OrgVolumeTier[]          — from org_volume_tier table

Cache refresh: on startup + on any admin mutation + 60s interval fallback.

Functions:

  calculateToolCost(params: {
    toolKey: string
    units: number            — e.g. seconds of audio
    coefficients?: Record<string, number>  — e.g. { bitrate: 256 }
  }): { energyCost: bigint, priceVersion: number }
  
    1. Get tool from cache by toolKey
    2. baseCost = tool.energy_cost_per_unit × units
    3. Apply coefficients:
       for each coefficient in tool.coefficients:
         if params.coefficients[coeff.name] exists:
           multiplier = evaluateFormula(coeff.formula, params.coefficients[coeff.name])
           baseCost = ceil(baseCost × multiplier)
    4. Return { energyCost: baseCost, priceVersion: tool.price_version }

  validatePriceVersion(toolKey: string, clientVersion: number): boolean
    — tool.price_version === clientVersion

  calculatePurchaseEnergy(params: {
    amountUsd: number
    discountPercent: number
  }): bigint
    — energy = ceil(amountUsd × ENERGY_PER_DOLLAR / (1 - discountPercent/100))
    — Note: discount makes energy cheaper → more energy per dollar

  calculateOrgDiscount(params: {
    ownerSubscriptionDiscount: number
    orgTotalPurchasedUsd: number
  }): number
    1. Find applicable org volume tier:
       highest tier where min_purchased_usd <= orgTotalPurchasedUsd
    2. orgVolumeDiscount = tier.discount_percent
    3. totalDiscount = ownerSubscriptionDiscount + orgVolumeDiscount
    4. cap at max_discount_percent
    5. Return totalDiscount

  evaluateFormula(formula: string, value: number): number
    — Safe math expression parser (NO eval)
    — Supports: +, -, ×, /, parentheses, "value" variable
    — Example: "value / 128 + 0.5" with value=256 → 2.5
    — Returns multiplier (minimum 0.1, maximum 100 — sanity bounds)

  recomputeToolEnergyCost(toolKey: string)
    — Called when admin changes real_cost, markup, or global markup
    — Recalculates energy_cost_per_unit
    — Increments price_version
    — Updates tool_pricing row
    — Refreshes in-memory cache

  updatePricingConfig(key: string, value: string)
    — Updates pricing_config row
    — If key === "global_markup_percent" → recompute ALL tool costs
    — Refreshes in-memory cache
    — Audit logged
```

### Formula Parser Safety

No `eval()`. A simple recursive descent parser that supports:
- Numbers (integer and decimal)
- Variable `value` (substituted with actual parameter)
- Operators: `+`, `-`, `*`, `/`
- Parentheses
- Built-in functions: `min()`, `max()`, `ceil()`, `floor()`

Maximum formula length: 200 characters.
Parsed and validated when admin saves the formula.
Execution is O(n) where n = formula length. Effectively O(1).

---

## Step 6: API Endpoints

### Energy Endpoints

```
GET /api/energy/balance
  Auth: required
  Response: { balance: string (bigint as string) }

GET /api/energy/transactions
  Auth: required
  Pagination: cursor mode
  Filters: type (EnergyTransactionType)
  Sort: created_at (desc default)
  Response: CursorPageResponse<EnergyTransaction>

POST /api/energy/purchase
  Auth: required
  Body: {
    amountUsd: number,
    target: "personal" | { orgId: string }
  }
  Logic:
    1. If target === "personal":
       discount = getEffectiveDiscount(userId)
       energy = calculatePurchaseEnergy(amountUsd, discount)
       creditEnergy(userId, energy, "purchase_personal")
    2. If target === { orgId }:
       a. Check permission org:{orgId}:fund
       b. Get org owner subscription discount
       c. Get org total purchased USD
       d. Calculate org discount (capped)
       e. energy = calculatePurchaseEnergy(amountUsd, orgDiscount)
       f. Credit to org balance
       g. Record energy_transaction with org_id
    3. Return { energyReceived, newBalance }
  
  Note: For MVP without payment integration, this endpoint is
  called by admin grant. With Stripe (MS-09), called after webhook.

POST /api/energy/transfer
  Auth: required
  Body: { orgId: string, amount: string (bigint as string) }
  Permission: org:{orgId}:fund
  Logic:
    1. transferToOrg(userId, orgId, amount)
    2. Return { newPersonalBalance, newOrgBalance }

GET /api/energy/pricing
  Auth: required (any authenticated user)
  Response: {
    tools: [{ toolKey, displayName, unit, energyCostPerUnit,
              priceVersion, coefficients }],
    subscriptions: [{ tier, displayName, priceMonthly, priceYearly,
                      discountPercent, dailyEnergy, packEnergy }]
  }
  
  Note: public pricing info. No real_cost_usd or markup exposed.
```

### Subscription Endpoints

```
GET /api/subscription/active
  Auth: required
  Response: [{
    id, tier, startsAt, expiresAt, dailyEnergy,
    discountPercent, blueprintDiscountPercent
  }]

GET /api/subscription/config
  Auth: required
  Response: [{ tier, displayName, priceMonthly, priceYearly,
               discountPercent, dailyEnergy, packEnergy, features }]
```

### Admin Pricing Endpoints

```
GET /api/admin/pricing/config
  Permission: admin:pricing:manage
  Response: { globalMarkup, maxDiscount, subscriptionMargin,
              dailyEnergyPercent, tools, subscriptions, orgVolumeTiers }

PUT /api/admin/pricing/config
  Permission: admin:pricing:manage
  Body: { key: string, value: string }
  Validation: key must exist in pricing_config
  Side effects: if global_markup → recompute all tool costs

GET /api/admin/pricing/tools
  Permission: admin:pricing:manage
  Response: [{ ...tool_pricing fields including real_cost_usd }]

PUT /api/admin/pricing/tools/:toolKey
  Permission: admin:pricing:manage
  Body: { realCostUsd, individualMarkup, coefficients, displayName, unit }
  Side effects: recompute energy_cost_per_unit, increment price_version

GET /api/admin/pricing/subscriptions
  Permission: admin:pricing:manage
  Response: [{ ...subscription_config fields }]

PUT /api/admin/pricing/subscriptions/:tier
  Permission: admin:pricing:manage
  Body: { priceMonthlyUsd, priceYearlyUsd, discountPercent,
          dailyEnergy, packEnergy, features }
  Validation:
    - Higher tier must have higher discount
    - discount + max org tier <= max_discount_percent

GET /api/admin/pricing/org-tiers
  Permission: admin:pricing:manage
  Response: [{ ...org_volume_tier fields }]

PUT /api/admin/pricing/org-tiers
  Permission: admin:pricing:manage
  Body: [{ minPurchasedUsd, discountPercent }]
  Validation:
    - Higher threshold must have higher discount
    - max org tier + max subscription discount <= max_discount_percent

POST /api/admin/users/:id/grant-energy
  Permission: admin:user:grant_energy
  Body: { amount: string (bigint), reason: string }
  Logic:
    1. creditEnergy(targetUserId, amount, "admin_grant")
    2. audit_log: actor, target, "grant_energy", reason, { amount }
    3. Return 200

POST /api/admin/users/:id/grant-subscription
  Permission: admin:user:grant_subscription
  Body: { tier: PaidSubscriptionTier, durationDays: number, reason: string }
  Logic:
    1. grantSubscription(targetUserId, tier, durationDays, "admin_grant")
    2. audit_log: actor, target, "grant_subscription", reason, { tier, days }
    3. Return 200

POST /api/admin/users/:id/revoke-subscription
  Permission: admin:user:grant_subscription
  Body: { subscriptionId: string, reason: string }
  Logic:
    1. UPDATE subscription SET is_active = false WHERE id = :id
    2. No energy clawback (already granted energy stays)
    3. audit_log entry
    4. Return 200
```

---

## Step 7: Hub Frontend

### Energy Display (Header Component)

```
Location: @packages/ui/src/data-display/energy-badge.tsx

Shows abbreviated balance: "5.2M ⚡"
Hover tooltip: "5,200,000 energy"
Click: navigates to /settings/energy (transaction history)

Data source: authContext.energyBalance (from auth context query)
Updated on: auth context refresh (every 15min or after mutation)
```

### Daily Claim Indicator

```
Integrated into GET /api/auth/context response:
  dailyClaim: {
    claimed: boolean       — already claimed today?
    amount: bigint         — how much will be / was claimed
    streak: number         — consecutive days
  }

If claimed === false and amount > 0:
  Show animated indicator in header: "Claim 50K ⚡ daily energy!"
  Click → POST /api/energy/claim-daily → refresh auth context
  
If claimed === true:
  Show streak badge: "🔥 7 day streak"
  
If amount === 0 (common tier):
  Show nothing (or subtle "Upgrade for daily energy" link)
```

### Energy Claim Endpoint

```
POST /api/energy/claim-daily
  Auth: required
  Logic:
    1. Call claimDailyEnergy service
    2. Return { claimed, amount, newStreak, newBalance }
  
  Note: this is separate from auth/context to make the claim
  explicit. auth/context returns claim STATUS but does not
  automatically claim. User must click to claim. This creates
  engagement (daily login habit).
```

Wait — you said "in the moment of login". Let me reconsider.

**Decision change:** claim happens automatically on auth/context
if eligible. No separate endpoint. Reason: simpler, user doesn't
need to "click" anything. Daily login is already the trigger.

Revised: GET /api/auth/context includes claim logic:
```
  1. Load user + subscriptions + permissions
  2. Check daily claim eligibility
  3. If eligible → credit energy, update streak
  4. Return full context including claim result
```

The header simply shows "✅ +50K claimed today" or streak info.
No explicit claim action needed.

---

## Step 8: Admin Frontend

### Pricing Config Page

```
Route: /admin/pricing
Permission: admin:pricing:manage

Sections:

1. Global Settings
   - Base rate display: "1 USD = 1,000,000 energy" (read-only)
   - Global markup: number input (%)
   - Max discount: number input (%)
   - Subscription margin: number input (%)
   - Save button (per section)

2. Tool Pricing Table
   - Columns: name, unit, real cost (USD), individual markup (%),
     final energy cost, price version, active
   - Edit inline or via modal
   - Real-time preview: changing markup shows new energy cost
   - Coefficients editor (JSON-like form)
   - Validation: red border + error on save if invalid

3. Subscription Tiers Table
   - Columns: tier, monthly USD, yearly USD, discount %,
     daily energy, pack energy, blueprint discount %
   - Edit via modal
   - Validation: higher tier must have strictly higher values
   - Live preview: "User buys Rare monthly ($X) → gets Y energy pack,
     Z daily, W% discount on purchases"

4. Organization Volume Tiers
   - Editable list: threshold (USD) → discount (%)
   - Add/remove tiers
   - Validation: ascending thresholds, ascending discounts
   - Cross-validation: max org discount + max sub discount ≤ max total

5. Pricing Simulator (bottom of page)
   - Input: tool, units, coefficients, subscription tier, org tier
   - Output: energy cost, USD equivalent, effective discount
   - Helps admin verify pricing before saving
```

### Energy Grant (on User Detail page)

```
Route: /admin/user/:userId (section within user detail)
Permission: admin:user:grant_energy

UI:
  - Amount input (number, converted to bigint)
  - Quick buttons: 100K, 1M, 10M, 100M
  - Reason input (required, min 10 chars)
  - Preview: "Grant 1,000,000 energy to John Doe"
  - Confirm dialog
  - After success: optimistic update of user balance display
```

### Subscription Grant (on User Detail page)

```
Permission: admin:user:grant_subscription

UI:
  - Tier selector (rare / epic / legendary)
  - Duration: 30 days (monthly) / 365 days (yearly) / custom
  - Reason input (required)
  - Preview: "Grant Epic subscription (30 days) to John Doe.
    Pack energy: 5M, daily energy: 50K, discount: 30%"
  - Confirm dialog
```

---

## Step 9: Dev Seed

```
POST /api/dev/seed/energy
Body: { count: number }

Creates test users with various energy states:
  - User with 0 energy (common, just registered)
  - User with 1M energy (small balance)
  - User with 100M energy (active user)
  - User with 10B energy (whale)
  - User with Rare subscription (active)
  - User with Epic subscription (active)
  - User with Legendary subscription (active)
  - User with expired subscription
  - User with stacked subscriptions (Rare + Epic)
  - User with energy transaction history (50 random transactions)

Also seeds:
  - pricing_config defaults
  - subscription_config for all 3 paid tiers
  - org_volume_tier defaults (4 tiers)
  - tool_pricing for audio tools (placeholder, real values in MS-05)

DELETE /api/dev/seed/energy
  Removes all __test__ energy data
```

---

## Step 10: Tests

### Unit Tests

```
packages/contract/src/_test/subscription.test.ts
  - isPaidTier: common → false, rare → true
  - formatEnergy: 1200000 → "1.2M"
  - formatEnergy: 350000 → "350K"
  - formatEnergy: 5700000000 → "5.7B"
  - formatEnergyFull: 1200000 → "1,200,000"

apps/api/src/feature/pricing/_test/pricing.service.test.ts
  - calculateToolCost: basic (no coefficients)
  - calculateToolCost: with bitrate coefficient
  - calculateToolCost: ceil rounding (never fractional)
  - calculatePurchaseEnergy: 0% discount
  - calculatePurchaseEnergy: 50% discount → double energy
  - calculateOrgDiscount: owner discount + volume tier
  - calculateOrgDiscount: capped at max
  - evaluateFormula: simple expression
  - evaluateFormula: with value substitution
  - evaluateFormula: malicious input → error (no eval)
  - evaluateFormula: bounds check (0.1 min, 100 max)

apps/api/src/feature/energy/_test/energy-claim.service.test.ts
  - Claim: first ever → success
  - Claim: already claimed today → no duplicate
  - Claim: new day in user timezone → success
  - Claim: timezone edge case (UTC midnight vs user midnight)
  - Claim: no active subscription → 0 energy
  - Claim: stacked subscriptions → sum of daily energy
  - Streak: consecutive days → increment
  - Streak: gap → reset to 1
```

### Integration Tests

```
apps/api/src/feature/energy/_test/energy.integration.test.ts
  - Credit: balance increases, transaction recorded
  - Debit: balance decreases, transaction recorded
  - Debit: insufficient balance → 402, balance unchanged
  - Concurrent debit: two requests, only one succeeds if balance insufficient
  - Transfer to org: personal decreases, org increases, both logged
  - Transfer to org: without permission → 403
  - Purchase personal: correct energy with discount
  - Purchase for org: correct energy with org discount

apps/api/src/feature/subscription/_test/subscription.integration.test.ts
  - Grant subscription: record created, pack energy credited
  - Grant subscription: stacking (two active, both returned)
  - Effective discount: max of active subscriptions
  - Expiry cleanup: expired → is_active false
  - Revoke: is_active false, no energy clawback

apps/api/src/feature/pricing/_test/pricing.integration.test.ts
  - Update tool: price_version incremented, energy_cost recomputed
  - Update global markup: all tools recomputed
  - Price version mismatch: 409 returned
  - Subscription config validation: lower tier higher discount → error
  - Org tier validation: exceeds max discount → error
```

---

## API Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | /api/energy/balance | authenticated | Get balance |
| GET | /api/energy/transactions | authenticated | Transaction history |
| POST | /api/energy/purchase | authenticated | Buy energy |
| POST | /api/energy/transfer | org:{id}:fund | Transfer to org |
| GET | /api/energy/pricing | authenticated | Public pricing |
| GET | /api/subscription/active | authenticated | Active subs |
| GET | /api/subscription/config | authenticated | Sub tier info |
| GET | /api/admin/pricing/config | admin:pricing:manage | Full config |
| PUT | /api/admin/pricing/config | admin:pricing:manage | Update config |
| GET | /api/admin/pricing/tools | admin:pricing:manage | Tool list |
| PUT | /api/admin/pricing/tools/:key | admin:pricing:manage | Update tool |
| GET | /api/admin/pricing/subscriptions | admin:pricing:manage | Sub configs |
| PUT | /api/admin/pricing/subscriptions/:tier | admin:pricing:manage | Update sub |
| GET | /api/admin/pricing/org-tiers | admin:pricing:manage | Org tiers |
| PUT | /api/admin/pricing/org-tiers | admin:pricing:manage | Update tiers |
| POST | /api/admin/users/:id/grant-energy | admin:user:grant_energy | Grant energy |
| POST | /api/admin/users/:id/grant-subscription | admin:user:grant_subscription | Grant sub |
| POST | /api/admin/users/:id/revoke-subscription | admin:user:grant_subscription | Revoke sub |
| POST | /api/dev/seed/energy | dev only | Seed energy data |
| DELETE | /api/dev/seed/energy | dev only | Clear energy data |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Two concurrent energy deductions, total > balance | PostgreSQL row lock: first succeeds, second fails with 402 (WHERE balance >= amount) |
| Admin changes tool price while user is generating | Client sends price_version, server returns 409 with new pricing |
| User in timezone UTC+14 claims, then travels to UTC-12 | Claim is per calendar day in stored timezone. Timezone change takes effect next day |
| Subscription expires mid-generation | Generation uses energy already deducted. Subscription expiry doesn't affect in-progress work |
| Admin revokes subscription | is_active = false. Already granted pack energy stays. Daily claim stops immediately |
| Global markup changed to 0% | All tools recomputed. energy_cost_per_unit = ceil(real_cost × 1.0 × ENERGY_PER_DOLLAR). Minimum 1 energy per unit |
| User buys 0.001 USD of energy | Minimum purchase enforced in API (e.g. $1 minimum). Prevents dust amounts |
| Coefficient formula returns 0 or negative | Bounds: minimum multiplier 0.1, maximum 100. Clamped |
| energy_transaction table grows very large | 3-month retention. Cron aggregates into energy_summary, deletes old transactions |