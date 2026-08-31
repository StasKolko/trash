import type { GlobalRole } from "./role";

// ─── Admin Permissions ────────────────────────────────────────────────────────

export const ADMIN_PERMISSIONS = [
  "admin.joke.read",
  "admin.joke.create",
  "admin.joke.update",
  "admin.joke.delete",
  "admin.joke.approve",

  "admin.language.read",
  "admin.language.create",
  "admin.language.delete",

  "admin.tag.read",
  "admin.tag.create",
  "admin.tag.delete",

  "admin.tts.manage",

  "admin.storage.browse",
  "admin.storage.delete",

  "admin.fingerprint.read",
  "admin.fingerprint.manage",

  "admin.sv-credential.read",
  "admin.sv-credential.manage",

  "admin.user.read",
  "admin.user.ban",
  "admin.user.unban",
  "admin.user.set-role",
  "admin.user.set-permissions",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

// ─── Org Permissions (future use) ─────────────────────────────────────────────

export const ORG_PERMISSIONS = [
  "org.project.create",
  "org.project.update",
  "org.project.delete",

  "org.social.connect",
  "org.social.disconnect",
  "org.social.post",

  "org.content.generate",
  "org.content.approve",
  "org.content.publish",

  "org.member.invite",
  "org.member.remove",
  "org.member.set-permissions",
] as const;

export type OrgPermission = (typeof ORG_PERMISSIONS)[number];

// ─── Default Permissions per Role ─────────────────────────────────────────────

export const DEFAULT_ROLE_ADMIN_PERMISSIONS: Record<
  GlobalRole,
  readonly AdminPermission[]
> = {
  user: [],

  moderator: [
    "admin.joke.read",
    "admin.joke.create",
    "admin.joke.update",
    "admin.joke.approve",
    "admin.language.read",
    "admin.language.create",
    "admin.tag.read",
    "admin.tag.create",
  ],

  admin: [
    "admin.joke.read",
    "admin.joke.create",
    "admin.joke.update",
    "admin.joke.delete",
    "admin.joke.approve",
    "admin.language.read",
    "admin.language.create",
    "admin.language.delete",
    "admin.tag.read",
    "admin.tag.create",
    "admin.tag.delete",
    "admin.tts.manage",
    "admin.storage.browse",
    "admin.storage.delete",
    "admin.fingerprint.read",
    "admin.fingerprint.manage",
    "admin.sv-credential.read",
    "admin.sv-credential.manage",
    "admin.user.read",
    "admin.user.ban",
    "admin.user.unban",
  ],

  owner: ADMIN_PERMISSIONS,
};

// ─── Permission Helpers ───────────────────────────────────────────────────────

export function hasAdminPermission(
  permissions: readonly AdminPermission[],
  required: AdminPermission,
): boolean {
  return permissions.includes(required);
}

export function hasAnyAdminPermission(
  permissions: readonly AdminPermission[],
  required: readonly AdminPermission[],
): boolean {
  return required.some((p) => permissions.includes(p));
}

export function hasAllAdminPermissions(
  permissions: readonly AdminPermission[],
  required: readonly AdminPermission[],
): boolean {
  return required.every((p) => permissions.includes(p));
}

// ─── Dev-time Validation ──────────────────────────────────────────────────────

export function assertAdminPermission(
  permission: string,
): asserts permission is AdminPermission {
  if (!permission.startsWith("admin.")) {
    throw new Error(
      `Expected admin permission (admin.*), got "${permission}".`,
    );
  }
}

export function assertOrgPermission(
  permission: string,
): asserts permission is OrgPermission {
  if (!permission.startsWith("org.")) {
    throw new Error(`Expected org permission (org.*), got "${permission}".`);
  }
}

export function validatePermissionForRole(
  targetRole: GlobalRole,
  permission: string,
): void {
  if (targetRole === "user" && permission.startsWith("admin.")) {
    throw new Error(
      `Cannot assign admin permission "${permission}" to role "user".`,
    );
  }
}