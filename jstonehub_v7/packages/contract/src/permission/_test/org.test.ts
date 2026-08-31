import { ORG_ACTION } from "../org";

describe("org constants", () => {
  it("has expected actions", () => {
    expect(ORG_ACTION).toEqual([
      "all",
      "manage",
      "fund",
      "view_logs",
      "project:create",
      "project:delete",
    ]);
  });
});
