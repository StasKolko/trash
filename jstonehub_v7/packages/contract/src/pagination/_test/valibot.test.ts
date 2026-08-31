import { parse } from "valibot";

import { createValidateSearch } from "../valibot";

describe("createValidateSearch", () => {
  describe("mode: all", () => {
    const validate = createValidateSearch({
      mode: "all",
      sorts: ["createdAt", "name"],
      sortDefault: "createdAt",
    });

    it("returns defaults for empty input", () => {
      const result = parse(validate, {});

      expect(result.query).toBe("");
      expect(result.sort).toBe("createdAt");
      expect(result.order).toBe("asc");
    });

    it("accepts valid sort and order", () => {
      const result = parse(validate, { sort: "name", order: "desc" });

      expect(result.sort).toBe("name");
      expect(result.order).toBe("desc");
    });

    it("falls back to default on invalid sort", () => {
      const result = parse(validate, { sort: "invalid" });

      expect(result.sort).toBe("createdAt");
    });

    it("falls back to default on invalid order", () => {
      const result = parse(validate, { order: "invalid" });

      expect(result.order).toBe("asc");
    });

    it("truncates query exceeding max length via fallback", () => {
      const result = parse(validate, { query: "x".repeat(201) });

      expect(result.query).toBe("");
    });

    it("uses custom orderDefault", () => {
      const customValidate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        orderDefault: "desc",
      });

      const result = parse(customValidate, {});

      expect(result.order).toBe("desc");
    });

    it("uses custom queryDefault", () => {
      const customValidate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        queryDefault: "default search",
      });

      const result = parse(customValidate, {});

      expect(result.query).toBe("default search");
    });
  });

  describe("mode: cursor", () => {
    const validate = createValidateSearch({
      mode: "cursor",
      sorts: ["createdAt", "name"],
      sortDefault: "createdAt",
    });

    it("returns defaults for empty input", () => {
      const result = parse(validate, {});

      expect(result.query).toBe("");
      expect(result.sort).toBe("createdAt");
      expect(result.order).toBe("asc");
      expect(result.cursor).toBeUndefined();
      expect(result.limit).toBe(50);
    });

    it("accepts cursor value", () => {
      const result = parse(validate, { cursor: "abc123" });

      expect(result.cursor).toBe("abc123");
    });

    it("accepts valid limit", () => {
      const result = parse(validate, { limit: 10 });

      expect(result.limit).toBe(10);
    });

    it("falls back to default on invalid limit", () => {
      const result = parse(validate, { limit: "not-a-number" });

      expect(result.limit).toBe(50);
    });

    it("falls back on limit exceeding max", () => {
      const result = parse(validate, { limit: 999 });

      expect(result.limit).toBe(50);
    });

    it("falls back on limit of 0", () => {
      const result = parse(validate, { limit: 0 });

      expect(result.limit).toBe(50);
    });

    it("falls back on non-integer limit", () => {
      const result = parse(validate, { limit: 10.5 });

      expect(result.limit).toBe(50);
    });

    it("uses custom limitDefault and limitMax", () => {
      const customValidate = createValidateSearch({
        mode: "cursor",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        limitDefault: 25,
        limitMax: 100,
      });

      const result = parse(customValidate, {});

      expect(result.limit).toBe(25);

      const withLimit = parse(customValidate, { limit: 100 });

      expect(withLimit.limit).toBe(100);

      const overLimit = parse(customValidate, { limit: 101 });

      expect(overLimit.limit).toBe(25);
    });
  });

  describe("filters", () => {
    it("returns default filter value of 'all'", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, {});

      expect(result.status).toBe("all");
    });

    it("accepts 'all' filter value", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: "all" });

      expect(result.status).toBe("all");
    });

    it("accepts array of valid filter values", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: ["active"] });

      expect(result.status).toEqual(["active"]);
    });

    it("falls back on invalid filter value", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: ["unknown"] });

      expect(result.status).toBe("all");
    });

    it("falls back on empty filter array", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: [] });

      expect(result.status).toBe("all");
    });

    it("uses custom default filter value", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: {
            values: ["active", "inactive"],
            default: ["active"],
          },
        },
      });

      const result = parse(validate, {});

      expect(result.status).toEqual(["active"]);
    });

    it("works with cursor mode and filters", () => {
      const validate = createValidateSearch({
        mode: "cursor",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          isBanned: { values: ["true", "false"] },
        },
      });

      const result = parse(validate, { isBanned: ["true"] });

      expect(result.isBanned).toEqual(["true"]);
      expect(result.cursor).toBeUndefined();
      expect(result.limit).toBe(50);
    });
  });
});
