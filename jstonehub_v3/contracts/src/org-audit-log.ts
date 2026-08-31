export type OrgAuditAction = (typeof ORG_AUDIT_ACTIONS)[number];
export type OrgAuditVisibilityLevel =
  (typeof ORG_AUDIT_VISIBILITY_LEVELS)[number];

export const ORG_AUDIT_ACTIONS = [
  "org_settings_updated",
  "org_ownership_transferred",

  "member_invited",
  "member_removed",
  "member_permissions_updated",
  "member_access_granted",
  "member_access_revoked",

  "project_created",
  "project_deleted",
  "project_settings_updated",

  "account_created",
  "account_deleted",
  "account_settings_updated",
  "account_credentials_updated",

  "content_type_config_updated",
  "blueprint_assigned",
  "blueprint_unassigned",

  "tokens_spent",
] as const;

export const ORG_AUDIT_VISIBILITY_LEVELS = [
  "owner",
  "project",
  "account",
] as const;

export const ORG_AUDIT_ACTION_VISIBILITY: Record<
  OrgAuditAction,
  OrgAuditVisibilityLevel
> = {
  org_settings_updated: "owner",
  org_ownership_transferred: "owner",

  member_invited: "project",
  member_removed: "project",
  member_permissions_updated: "project",
  member_access_granted: "project",
  member_access_revoked: "project",

  project_created: "owner",
  project_deleted: "owner",
  project_settings_updated: "project",

  account_created: "project",
  account_deleted: "project",
  account_settings_updated: "account",
  account_credentials_updated: "project",

  content_type_config_updated: "account",
  blueprint_assigned: "account",
  blueprint_unassigned: "account",

  tokens_spent: "project",
};
