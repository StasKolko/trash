import { Value } from "typebox/value";

import { createQueryParamsSchema } from "../typebox";

describe("createQueryParamsSchema", () => {
  describe("mode: all", () => {
    it("creates empty object schema", () => {
      const schema = createQueryParamsSchema({ mode: "all" });

      expect(Value.Check(schema, {})).toBe(true);
    });
  });

  describe("mode: cursor", () => {
    const sorts = ["createdAt", "name"] as const;

    it("accepts empty object with defaults", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, {})).toBe(true);
    });

    it("accepts valid query", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { query: "search term" })).toBe(true);
    });

    it("rejects query exceeding max length", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { query: "x".repeat(201) })).toBe(false);
    });

    it("accepts valid sort", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { sort: "name" })).toBe(true);
    });

    it("rejects invalid sort", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { sort: "invalid" })).toBe(false);
    });

    it("accepts valid order", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { order: "desc" })).toBe(true);
    });

    it("rejects invalid order", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { order: "invalid" })).toBe(false);
    });

    it("accepts cursor string", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { cursor: "abc123" })).toBe(true);
    });

    it("accepts valid limit", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { limit: 10 })).toBe(true);
    });

    it("rejects limit exceeding max", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        limitDefault: 20,
        limitMax: 20,
      });

      expect(Value.Check(schema, { limit: 21 })).toBe(false);
    });

    it("rejects limit of 0", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { limit: 0 })).toBe(false);
    });

    it("uses custom limitDefault and limitMax", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        limitDefault: 10,
        limitMax: 100,
      });

      expect(Value.Check(schema, { limit: 100 })).toBe(true);
      expect(Value.Check(schema, { limit: 101 })).toBe(false);
    });

    it("accepts filter with 'all' value", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: "all" })).toBe(true);
    });

    it("accepts filter with array of valid values", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: ["active"] })).toBe(true);
      expect(Value.Check(schema, { status: ["active", "inactive"] })).toBe(
        true,
      );
    });

    it("rejects filter with invalid value", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: ["unknown"] })).toBe(false);
    });

    it("rejects filter with empty array", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: [] })).toBe(false);
    });

    it("works without filters", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { sort: "createdAt", order: "asc" })).toBe(
        true,
      );
    });
  });
});
