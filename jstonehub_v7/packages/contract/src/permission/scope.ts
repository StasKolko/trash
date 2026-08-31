type PermissionScope = (typeof PERMISSION_SCOPE)[number];

const PERMISSION_SCOPE = ["admin", "org", "project", "account"] as const;

export type { PermissionScope };
export { PERMISSION_SCOPE };
