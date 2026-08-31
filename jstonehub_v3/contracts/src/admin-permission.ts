export const ADMIN_USER_PERMISSIONS = [
  "users.view",
  "users.manage",
  "users.export",
  "users.grant",
] as const;

export const ADMIN_SYSTEM_LOG_PERMISSIONS = [
  "system_logs.view",
  "system_logs.delete",
  "system_logs.grant",
] as const;

export const ADMIN_AUDIT_LOG_PERMISSIONS = [
  "admin_audit_logs.view",
  "admin_audit_logs.delete",
  "admin_audit_logs.grant",
] as const;

export const ADMIN_PERMISSIONS = [
  ...ADMIN_USER_PERMISSIONS,
  ...ADMIN_SYSTEM_LOG_PERMISSIONS,
  ...ADMIN_AUDIT_LOG_PERMISSIONS,
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ADMIN_PERMISSIONS_DEFAULT: AdminPermission[] = [
  "users.view",
  "system_logs.view",
  "admin_audit_logs.view",
];

export const MODERATOR_PERMISSIONS_DEFAULT: AdminPermission[] = [];
