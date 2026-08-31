export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminAuditEntityType = (typeof ADMIN_AUDIT_ENTITY_TYPES)[number];

export const ADMIN_AUDIT_ACTIONS = ["create", "update", "delete"] as const;
export const ADMIN_AUDIT_ENTITY_TYPES = [
  "user",
  "joke",
  "background_short",
  "language",
  "content_tag",
  "social_platform",
  "blueprint",
  "subscription_plan",
  "user_override",
  "complaint",
] as const;
