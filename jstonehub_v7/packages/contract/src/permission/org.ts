type OrgAction = (typeof ORG_ACTION)[number];
type OrgPermission = `org:${string}:${OrgAction}`;

const ORG_ACTION = [
  "all",
  "manage",
  "fund",
  "view_logs",
  "project:create",
  "project:delete",
] as const;

export type { OrgAction, OrgPermission };
export { ORG_ACTION };
