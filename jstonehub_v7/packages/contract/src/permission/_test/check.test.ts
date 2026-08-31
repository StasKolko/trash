import { hasPermission, parsePermission } from "../check";

describe("parsePermission", () => {
  it("parses admin:all", () => {
    expect(parsePermission("admin:all")).toEqual({
      scope: "admin",
      resourceId: null,
      entity: null,
      action: "all",
    });
  });

  it("parses admin:user:read", () => {
    expect(parsePermission("admin:user:read")).toEqual({
      scope: "admin",
      resourceId: null,
      entity: "user",
      action: "read",
    });
  });

  it("parses org:abc123:manage", () => {
    expect(parsePermission("org:abc123:manage")).toEqual({
      scope: "org",
      resourceId: "abc123",
      entity: null,
      action: "manage",
    });
  });

  it("parses project:xyz789:view", () => {
    expect(parsePermission("project:xyz789:view")).toEqual({
      scope: "project",
      resourceId: "xyz789",
      entity: null,
      action: "view",
    });
  });

  it("returns null for empty string", () => {
    expect(parsePermission("")).toBeNull();
  });

  it("returns null for string without colon", () => {
    expect(parsePermission("invalid")).toBeNull();
  });

  it("returns null for admin permission without action (admin:)", () => {
    expect(parsePermission("admin:")).toBeNull();
  });

  it("returns null for admin: with entity but no action (admin:user)", () => {
    expect(parsePermission("admin:user")).toBeNull();
  });

  it("returns null for admin: with entity and empty action (admin:user:)", () => {
    expect(parsePermission("admin:user:")).toBeNull();
  });

  it("returns null for admin: with empty entity (admin::read)", () => {
    expect(parsePermission("admin::read")).toBeNull();
  });

  it("returns null for scoped with no second colon (org:abc)", () => {
    expect(parsePermission("org:abc")).toBeNull();
  });

  it("returns null for scoped with empty scope (:abc:read)", () => {
    expect(parsePermission(":abc:read")).toBeNull();
  });

  it("returns null for scoped with empty resourceId (org::read)", () => {
    expect(parsePermission("org::read")).toBeNull();
  });

  it("returns null for scoped with empty action (org:abc:)", () => {
    expect(parsePermission("org:abc:")).toBeNull();
  });
});

describe("hasPermission", () => {
  it("returns false when required permission cannot be parsed", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "nocolon" as any)).toBe(false);
  });

  it("matches exact permission", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
  });

  it("returns false when permission not present", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "admin:user:ban")).toBe(false);
  });

  it("matches via entity wildcard (admin:user:all)", () => {
    const permissions = ["admin:user:all"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
    expect(hasPermission(permissions, "admin:user:ban")).toBe(true);
  });

  it("does not match entity wildcard for different entity", () => {
    const permissions = ["admin:user:all"];
    expect(hasPermission(permissions, "admin:joke:read")).toBe(false);
  });

  it("matches via scope wildcard (admin:all)", () => {
    const permissions = ["admin:all"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
    expect(hasPermission(permissions, "admin:joke:delete")).toBe(true);
    expect(hasPermission(permissions, "admin:pricing:manage")).toBe(true);
  });

  it("admin:all matches admin:all itself", () => {
    const permissions = ["admin:all"];
    expect(hasPermission(permissions, "admin:all")).toBe(true);
  });

  it("admin:all does not match org permissions", () => {
    const permissions = ["admin:all"];
    expect(hasPermission(permissions, "org:abc:manage")).toBe(false);
  });

  it("matches exact org permission", () => {
    const permissions = ["org:abc123:fund"];
    expect(hasPermission(permissions, "org:abc123:fund")).toBe(true);
  });

  it("does not match org permission for different org", () => {
    const permissions = ["org:abc123:fund"];
    expect(hasPermission(permissions, "org:xyz789:fund")).toBe(false);
  });

  it("matches via resource wildcard (org:id:all)", () => {
    const permissions = ["org:abc123:all"];
    expect(hasPermission(permissions, "org:abc123:fund")).toBe(true);
    expect(hasPermission(permissions, "org:abc123:manage")).toBe(true);
  });

  it("matches exact project permission", () => {
    const permissions = ["project:xyz:manage"];
    expect(hasPermission(permissions, "project:xyz:manage")).toBe(true);
  });

  it("matches project via resource wildcard", () => {
    const permissions = ["project:xyz:all"];
    expect(hasPermission(permissions, "project:xyz:view")).toBe(true);
    expect(hasPermission(permissions, "project:xyz:manage")).toBe(true);
  });

  it("matches exact account permission", () => {
    const permissions = ["account:def:view"];
    expect(hasPermission(permissions, "account:def:view")).toBe(true);
  });

  it("handles empty permissions array", () => {
    expect(hasPermission([], "admin:user:read")).toBe(false);
  });

  it("entity wildcard does not match :all request itself redundantly", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "admin:user:all")).toBe(false);
  });

  it("priority: exact match found first in array", () => {
    const permissions = ["admin:user:read", "admin:all"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
  });

  it("returns false for scoped :all when only specific permission exists", () => {
    const permissions = ["org:abc:fund"];
    expect(hasPermission(permissions, "org:abc:all")).toBe(false);
  });

  it("resource wildcard does not cross resource ids", () => {
    const permissions = ["org:abc:all"];
    expect(hasPermission(permissions, "org:xyz:fund")).toBe(false);
  });

  it("checks multiple permissions efficiently", () => {
    const permissions = [
      "admin:access:read",
      "admin:user:read",
      "admin:joke:all",
      "org:abc:fund",
    ];

    expect(hasPermission(permissions, "admin:access:read")).toBe(true);
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
    expect(hasPermission(permissions, "admin:joke:read")).toBe(true);
    expect(hasPermission(permissions, "admin:joke:delete")).toBe(true);
    expect(hasPermission(permissions, "org:abc:fund")).toBe(true);
    expect(hasPermission(permissions, "admin:user:ban")).toBe(false);
    expect(hasPermission(permissions, "org:abc:manage")).toBe(false);
  });
});
