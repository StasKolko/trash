export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type GlobalNotification = (typeof GLOBAL_NOTIFICATIONS)[number];
export type OrgNotification = (typeof ORG_NOTIFICATIONS)[number];

// === Global notifications (platform level) ===

export const SUBSCRIPTION_NOTIFICATIONS = [
  "subscription_expires_soon",
  "subscription_expired",
  "subscription_renewed",
  "subscription_cancelled",
] as const;

export const GLOBAL_NOTIFICATIONS = [...SUBSCRIPTION_NOTIFICATIONS] as const;

// === Org notifications (organization level) ===

export const INVITE_NOTIFICATIONS = [
  "invite_received",
  "invite_accepted",
  "invite_declined",
  "invite_expired",
  "invite_cancelled",
] as const;

export const ORGANIZATION_NOTIFICATIONS = [
  "org_ownership_offer",
  "org_ownership_transferred",
  "org_ownership_received",
  "org_member_joined",
  "org_member_left",
  "org_member_removed",
] as const;

export const TASK_NOTIFICATIONS = ["task_completed", "task_failed"] as const;

export const CONTENT_NOTIFICATIONS = [
  "content_pending_review",
  "content_approved",
  "content_rejected",
] as const;

export const ENERGY_NOTIFICATIONS = [
  "energy_low",
  "energy_depleted",
  "energy_recharged",
] as const;

export const ORG_NOTIFICATIONS = [
  ...INVITE_NOTIFICATIONS,
  ...ORGANIZATION_NOTIFICATIONS,
  ...TASK_NOTIFICATIONS,
  ...CONTENT_NOTIFICATIONS,
  ...ENERGY_NOTIFICATIONS,
] as const;

// === Combined ===

export const NOTIFICATION_TYPES = [
  ...GLOBAL_NOTIFICATIONS,
  ...ORG_NOTIFICATIONS,
] as const;
