import { USER_FILTERS, USER_SORT_DEFAULT, USER_SORTS } from "../user";

describe("user contract", () => {
  it("has expected sorts", () => {
    expect(USER_SORTS).toEqual([
      "createdAt",
      "name",
      "email",
      "energyBalance",
      "loginStreak",
    ]);
  });

  it("has default sort as createdAt", () => {
    expect(USER_SORT_DEFAULT).toBe("createdAt");
  });

  it("has isBanned filter with true/false values", () => {
    expect(USER_FILTERS.isBanned.values).toEqual(["true", "false"]);
  });
});
