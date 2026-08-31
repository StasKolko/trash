export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const SUBSCRIPTION_TIERS = [
  "common",
  "rare",
  "epic",
  "legendary",
] as const;
