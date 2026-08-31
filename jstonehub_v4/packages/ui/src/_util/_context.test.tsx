import { render } from "@solidjs/testing-library";
import { createContext } from "solid-js";

import { getStrictContext } from "./context";

describe("[getStrictContext]", () => {
  it.each([
    { hook: "useTheme" },
    { hook: "useBreakpoint" },
    { hook: "useSidebar" },
  ])("should throw when context is undefined: $hook", ({ hook }) => {
    const TestContext = createContext<string>();

    const errors: Error[] = [];

    function Consumer() {
      try {
        getStrictContext(TestContext, hook);
      } catch (e) {
        errors.push(e as Error);
      }
      return null;
    }

    render(() => <Consumer />);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(`[${hook}] requires <UiProvider>.`);
  });

  it("should return context value when provided", () => {
    const TestContext = createContext<string>();
    let result: string | undefined;

    function Consumer() {
      result = getStrictContext(TestContext, "useTest");
      return null;
    }

    render(() => (
      <TestContext.Provider value="hello">
        <Consumer />
      </TestContext.Provider>
    ));

    expect(result).toBe("hello");
  });
});
