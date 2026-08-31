import { RESOURCE_ACTION } from "../resource";

describe("resource constants", () => {
  it("has expected actions", () => {
    expect(RESOURCE_ACTION).toEqual(["manage", "view"]);
  });
});
