import { safeJsonParse, safeJsonStringify } from "../json";

describe("[json]", () => {
  describe("[safeJsonParse]", () => {
    it("should parse valid JSON object", () => {
      const result = safeJsonParse('{"a":1,"b":"hello"}');

      expect(result).toEqual({ a: 1, b: "hello" });
    });

    it("should parse valid JSON array", () => {
      const result = safeJsonParse('[1,"two",null]');

      expect(result).toEqual([1, "two", null]);
    });

    it("should parse empty object", () => {
      const result = safeJsonParse("{}");

      expect(result).toEqual({});
    });

    it("should parse empty array", () => {
      const result = safeJsonParse("[]");

      expect(result).toEqual([]);
    });

    it("should return null for JSON string primitive", () => {
      const result = safeJsonParse('"hello"');

      expect(result).toBeNull();
    });

    it("should return null for JSON number primitive", () => {
      const result = safeJsonParse("42");

      expect(result).toBeNull();
    });

    it("should return null for JSON boolean primitive", () => {
      const result = safeJsonParse("true");

      expect(result).toBeNull();
    });

    it("should return null for JSON null literal", () => {
      const result = safeJsonParse("null");

      expect(result).toBeNull();
    });

    it("should return null for invalid JSON", () => {
      const result = safeJsonParse("{invalid}");

      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = safeJsonParse("");

      expect(result).toBeNull();
    });
  });

  describe("[safeJsonStringify]", () => {
    it("should stringify object", () => {
      const result = safeJsonStringify({ a: 1, b: "hello" });

      expect(result).toBe('{"a":1,"b":"hello"}');
    });

    it("should stringify array", () => {
      const result = safeJsonStringify([1, "two", null]);

      expect(result).toBe('[1,"two",null]');
    });

    it("should stringify primitive values", () => {
      expect(safeJsonStringify("hello")).toBe('"hello"');
      expect(safeJsonStringify(42)).toBe("42");
      expect(safeJsonStringify(true)).toBe("true");
      expect(safeJsonStringify(null)).toBe("null");
    });

    it("should return null for circular references", () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const result = safeJsonStringify(circular);

      expect(result).toBeNull();
    });

    it("should return null for BigInt", () => {
      const result = safeJsonStringify(BigInt(42));

      expect(result).toBeNull();
    });
  });
});
