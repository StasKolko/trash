import type { GlobalRole } from "@packages/contract/role";
import type { SubscriptionTier } from "@packages/contract/subscription";
import type { InferOutput } from "valibot";

import type { authValidateSearch } from "./auth.validate-search";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: GlobalRole;
  subscriptionTier: SubscriptionTier;
  energyBalance: number;
  bannedAt: Date | null;
  createdAt: Date;
};

export type AuthSession = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export type AuthValidateSearch = InferOutput<typeof authValidateSearch>;
