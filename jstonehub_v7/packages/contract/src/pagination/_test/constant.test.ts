import {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  DEFAULT_PAGINATION_ORDER,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "../constant";

describe("pagination constants", () => {
  it("has expected orders", () => {
    expect(PAGINATION_ORDERS).toEqual(["asc", "desc"]);
  });

  it("has default order as asc", () => {
    expect(DEFAULT_PAGINATION_ORDER).toBe("asc");
  });

  it("has query max length", () => {
    expect(PAGINATION_QUERY_MAX_LENGTH).toBe(200);
  });

  it("has filter all value", () => {
    expect(PAGINATION_FILTER_ALL).toBe("all");
  });

  it("has default cursor limit", () => {
    expect(DEFAULT_PAGINATION_CURSOR_LIMIT).toBe(50);
  });
});
