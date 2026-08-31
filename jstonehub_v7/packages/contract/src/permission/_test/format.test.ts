import {
  formatAccountPermission,
  formatAdminPermission,
  formatOrgPermission,
  formatProjectPermission,
} from "../format";

describe("formatAdminPermission", () => {
  it("formats user:read", () => {
    expect(formatAdminPermission({ entity: "user", action: "read" })).toBe(
      "admin:user:read",
    );
  });

  it("formats joke:all", () => {
    expect(formatAdminPermission({ entity: "joke", action: "all" })).toBe(
      "admin:joke:all",
    );
  });

  it("formats access:manage", () => {
    expect(formatAdminPermission({ entity: "access", action: "manage" })).toBe(
      "admin:access:manage",
    );
  });

  it("formats user:ban", () => {
    expect(formatAdminPermission({ entity: "user", action: "ban" })).toBe(
      "admin:user:ban",
    );
  });
});

describe("formatOrgPermission", () => {
  it("formats org permission with id and action", () => {
    expect(formatOrgPermission({ orgId: "abc123", action: "manage" })).toBe(
      "org:abc123:manage",
    );
  });

  it("formats org permission with fund action", () => {
    expect(formatOrgPermission({ orgId: "xyz", action: "fund" })).toBe(
      "org:xyz:fund",
    );
  });
});

describe("formatProjectPermission", () => {
  it("formats project permission with manage", () => {
    expect(
      formatProjectPermission({ projectId: "proj1", action: "manage" }),
    ).toBe("project:proj1:manage");
  });

  it("formats project permission with all", () => {
    expect(formatProjectPermission({ projectId: "proj1", action: "all" })).toBe(
      "project:proj1:all",
    );
  });

  it("formats project permission with view", () => {
    expect(
      formatProjectPermission({ projectId: "proj1", action: "view" }),
    ).toBe("project:proj1:view");
  });
});

describe("formatAccountPermission", () => {
  it("formats account permission with view", () => {
    expect(formatAccountPermission({ accountId: "acc1", action: "view" })).toBe(
      "account:acc1:view",
    );
  });

  it("formats account permission with all", () => {
    expect(formatAccountPermission({ accountId: "acc1", action: "all" })).toBe(
      "account:acc1:all",
    );
  });

  it("formats account permission with manage", () => {
    expect(
      formatAccountPermission({ accountId: "acc1", action: "manage" }),
    ).toBe("account:acc1:manage");
  });
});
