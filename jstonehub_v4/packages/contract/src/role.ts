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
