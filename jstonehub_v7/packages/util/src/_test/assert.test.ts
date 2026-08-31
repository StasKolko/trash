import { assertNever, devFrontendAssert } from "../assert";

const MESSAGE = "Test message";
const CUSTOM_MESSAGE = "Custom error message";

describe("[asserts]", () => {
  describe("[assertNever]", () => {
    it("should throw with default message when no custom message provided", () => {
      const value = "unexpected" as never;

      expect(() => assertNever(value)).toThrow("Unexpected value: unexpected");
    });

    it("should throw with custom message when provided", () => {
      const value = "unexpected" as never;

      expect(() => assertNever(value, CUSTOM_MESSAGE)).toThrow(CUSTOM_MESSAGE);
    });
  });

  describe("[devFrontendAssert]", () => {
    const originalEnv = import.meta.env.DEV;

    afterEach(() => {
      vi.stubEnv("DEV", originalEnv);
    });

    it("should throw when DEV is true and condition is true", () => {
      vi.stubEnv("DEV", true);

      expect(() => devFrontendAssert(true, MESSAGE)).toThrow(`${MESSAGE}`);
    });

    it("should not throw when DEV is true but condition is false", () => {
      vi.stubEnv("DEV", true);

      expect(() => devFrontendAssert(false, MESSAGE)).not.toThrow();
    });

    it("should not throw when DEV is false regardless of condition", () => {
      vi.stubEnv("DEV", false);

      expect(() => devFrontendAssert(true, MESSAGE)).not.toThrow();
      expect(() => devFrontendAssert(false, MESSAGE)).not.toThrow();
    });
  });
});
