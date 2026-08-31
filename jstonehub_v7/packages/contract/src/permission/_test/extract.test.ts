import {
  extractEntityId,
  extractScope,
  isAccountPermission,
  isAdminPermission,
  isOrgPermission,
  isProjectPermission,
} from "../extract";

describe("extractScope", () => {
  it("extracts admin scope", () => {
    expect(extractScope("admin:user:read")).toBe("admin");
  });

  it("extracts admin scope from admin:all", () => {
    expect(extractScope("admin:all")).toBe("admin");
  });

  it("extracts org scope", () => {
    expect(extractScope("org:abc123:manage")).toBe("org");
  });

  it("extracts project scope", () => {
    expect(extractScope("project:xyz789:view")).toBe("project");
  });

  it("extracts account scope", () => {
    expect(extractScope("account:def456:manage")).toBe("account");
  });

  it("returns null for unknown scope", () => {
    expect(extractScope("unknown:something:read")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractScope("")).toBeNull();
  });

  it("returns null for string without colon", () => {
    expect(extractScope("nocolon")).toBeNull();
  });
});

describe("extractEntityId", () => {
  it("returns null for admin permissions", () => {
    expect(extractEntityId("admin:user:read")).toBeNull();
  });

  it("returns null for admin:all", () => {
    expect(extractEntityId("admin:all")).toBeNull();
  });

  it("extracts org id", () => {
    expect(extractEntityId("org:abc123:manage")).toBe("abc123");
  });

  it("extracts project id", () => {
    expect(extractEntityId("project:xyz789:view")).toBe("xyz789");
  });

  it("extracts account id", () => {
    expect(extractEntityId("account:def456:manage")).toBe("def456");
  });

  it("returns null for string without second colon", () => {
    expect(extractEntityId("org:nocolon")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractEntityId("")).toBeNull();
  });

  it("returns null when entity id is empty", () => {
    expect(extractEntityId("org::manage")).toBeNull();
  });
});

describe("isAdminPermission", () => {
  it("returns true for admin:user:read", () => {
    expect(isAdminPermission("admin:user:read")).toBe(true);
  });

  it("returns true for admin:all", () => {
    expect(isAdminPermission("admin:all")).toBe(true);
  });

  it("returns false for org permission", () => {
    expect(isAdminPermission("org:abc:manage")).toBe(false);
  });
});

describe("isOrgPermission", () => {
  it("returns true for org permission", () => {
    expect(isOrgPermission("org:abc123:fund")).toBe(true);
  });

  it("returns false for admin permission", () => {
    expect(isOrgPermission("admin:user:read")).toBe(false);
  });
});

describe("isProjectPermission", () => {
  it("returns true for project permission", () => {
    expect(isProjectPermission("project:xyz:manage")).toBe(true);
  });

  it("returns false for org permission", () => {
    expect(isProjectPermission("org:abc:manage")).toBe(false);
  });
});

describe("isAccountPermission", () => {
  it("returns true for account permission", () => {
    expect(isAccountPermission("account:def:view")).toBe(true);
  });

  it("returns false for project permission", () => {
    expect(isAccountPermission("project:xyz:view")).toBe(false);
  });
});
