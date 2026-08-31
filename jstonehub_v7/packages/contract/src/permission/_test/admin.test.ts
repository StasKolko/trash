import {
  ADMIN_ENTITIES,
  ADMIN_ENTITY_REGISTRY,
  isValidAdminPermission,
} from "../admin";

describe("isValidAdminPermission", () => {
  it("accepts admin:all", () => {
    expect(isValidAdminPermission("admin:all")).toBe(true);
  });

  it("accepts admin:user:read", () => {
    expect(isValidAdminPermission("admin:user:read")).toBe(true);
  });

  it("accepts admin:user:ban", () => {
    expect(isValidAdminPermission("admin:user:ban")).toBe(true);
  });

  it("accepts admin:joke:all", () => {
    expect(isValidAdminPermission("admin:joke:all")).toBe(true);
  });

  it("accepts admin:access:read", () => {
    expect(isValidAdminPermission("admin:access:read")).toBe(true);
  });

  it("rejects unknown entity", () => {
    expect(isValidAdminPermission("admin:unknown:read")).toBe(false);
  });

  it("rejects unknown action for known entity", () => {
    expect(isValidAdminPermission("admin:joke:fly")).toBe(false);
  });

  it("rejects non-admin prefix", () => {
    expect(isValidAdminPermission("org:abc:manage")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAdminPermission("")).toBe(false);
  });

  it("accepts all entity+action combinations from registry", () => {
    for (const entity of ADMIN_ENTITIES) {
      const actions = ADMIN_ENTITY_REGISTRY[entity];
      for (const action of actions) {
        expect(isValidAdminPermission(`admin:${entity}:${action}`)).toBe(true);
      }
    }
  });
});

describe("ADMIN_ENTITIES", () => {
  it("contains expected entities", () => {
    expect(ADMIN_ENTITIES).toContain("access");
    expect(ADMIN_ENTITIES).toContain("user");
    expect(ADMIN_ENTITIES).toContain("joke");
    expect(ADMIN_ENTITIES).toContain("language");
    expect(ADMIN_ENTITIES).toContain("pricing");
    expect(ADMIN_ENTITIES).toContain("feedback");
    expect(ADMIN_ENTITIES).toContain("audit");
  });

  it("has user-specific actions", () => {
    const userActions = ADMIN_ENTITY_REGISTRY.user;
    expect(userActions).toContain("ban");
    expect(userActions).toContain("grant_energy");
    expect(userActions).toContain("grant_subscription");
  });
});
