type ResourceAction = (typeof RESOURCE_ACTION)[number];
type ProjectPermission = `project:${string}:${ResourceAction | "all"}`;
type AccountPermission = `account:${string}:${ResourceAction | "all"}`;

const RESOURCE_ACTION = ["manage", "view"] as const;

export type { AccountPermission, ProjectPermission, ResourceAction };
export { RESOURCE_ACTION };
