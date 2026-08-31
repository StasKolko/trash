type AdminPermission = "admin:all" | AdminEntityPermission;
type AdminEntityPermission = {
  [E in AdminEntity]: `admin:${E}:${AdminEntityAction<E>}`;
}[AdminEntity];
type AdminEntity = keyof AdminEntityRegistry;
type AdminEntityAction<E extends AdminEntity> = AdminEntityRegistry[E][number];
type AdminEntityRegistry = typeof ADMIN_ENTITY_REGISTRY;

type AccessAction = (typeof ACCESS_ACTION)[number];
type AdminBaseAction = (typeof ADMIN_BASE_ACTION)[number];
type UserSpecificAction = (typeof USER_SPECIFIC_ACTION)[number];

const ADMIN_BASE_ACTION = [
  "create",
  "read",
  "update",
  "delete",
  "manage",
  "export",
  "all",
] as const;

const ACCESS_ACTION = ["read", "manage", "all"] as const;
const USER_SPECIFIC_ACTION = [
  "ban",
  "grant_energy",
  "grant_subscription",
] as const;

const ADMIN_ENTITY_REGISTRY = {
  access: ACCESS_ACTION,
  user: [...ADMIN_BASE_ACTION, ...USER_SPECIFIC_ACTION] as const,
  joke: ADMIN_BASE_ACTION,
  language: ADMIN_BASE_ACTION,
  pricing: ADMIN_BASE_ACTION,
  feedback: ADMIN_BASE_ACTION,
  audit: ADMIN_BASE_ACTION,
} as const;

const ADMIN_ENTITIES = Object.keys(ADMIN_ENTITY_REGISTRY) as AdminEntity[];
const VALID_ADMIN_PERMISSIONS = buildValidPermissions();

function isValidAdminPermission(value: string): value is AdminPermission {
  return VALID_ADMIN_PERMISSIONS.has(value);
}

function buildValidPermissions() {
  const set = new Set<string>();
  set.add("admin:all");

  for (const entity of ADMIN_ENTITIES) {
    const actions = ADMIN_ENTITY_REGISTRY[entity];
    for (const action of actions) {
      set.add(`admin:${entity}:${action}`);
    }
  }

  return set;
}

export type {
  AccessAction,
  AdminBaseAction,
  AdminEntity,
  AdminEntityAction,
  AdminEntityPermission,
  AdminEntityRegistry,
  AdminPermission,
  UserSpecificAction,
};
export {
  ACCESS_ACTION,
  ADMIN_BASE_ACTION,
  ADMIN_ENTITIES,
  ADMIN_ENTITY_REGISTRY,
  isValidAdminPermission,
  USER_SPECIFIC_ACTION,
};
