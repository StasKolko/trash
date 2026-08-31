import type { AdminEntity, AdminEntityAction } from "./admin";
import type { OrgAction } from "./org";
import type { ResourceAction } from "./resource";

function formatAdminPermission<E extends AdminEntity>(params: {
  entity: E;
  action: AdminEntityAction<E>;
}) {
  return `admin:${params.entity}:${params.action}` as const;
}

function formatOrgPermission(params: { orgId: string; action: OrgAction }) {
  return `org:${params.orgId}:${params.action}` as const;
}

function formatProjectPermission(params: {
  projectId: string;
  action: ResourceAction | "all";
}) {
  return `project:${params.projectId}:${params.action}` as const;
}

function formatAccountPermission(params: {
  accountId: string;
  action: ResourceAction | "all";
}) {
  return `account:${params.accountId}:${params.action}` as const;
}

export {
  formatAccountPermission,
  formatAdminPermission,
  formatOrgPermission,
  formatProjectPermission,
};
