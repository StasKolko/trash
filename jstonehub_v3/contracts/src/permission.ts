export type AccessLevel = (typeof ACCESS_LEVELS)[number];
export type ProjectPermissionKey = (typeof PROJECT_PERMISSION_KEYS)[number];
export type ProjectPermissions = Record<ProjectPermissionKey, boolean>;
export type AccountPermissionKey = (typeof ACCOUNT_PERMISSION_KEYS)[number];
export type AccountPermissions = Record<AccountPermissionKey, boolean>;

export const ACCESS_LEVELS = ["owner", "project", "account"] as const;
export const PROJECT_PERMISSION_KEYS = [
  "can_edit_settings",
  "can_manage_accounts",
  "can_manage_members",
  "can_spend_tokens",
] as const;
export const ACCOUNT_PERMISSION_KEYS = [
  "can_edit_settings",
  "can_manage_content",
  "can_spend_tokens",
] as const;

export const PROJECT_PERMISSIONS_DEFAULT: ProjectPermissions = {
  can_edit_settings: true,
  can_manage_accounts: true,
  can_manage_members: false,
  can_spend_tokens: true,
};
export const ACCOUNT_PERMISSIONS_DEFAULT: AccountPermissions = {
  can_edit_settings: true,
  can_manage_content: true,
  can_spend_tokens: true,
};
