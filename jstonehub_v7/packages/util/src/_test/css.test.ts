import { cn } from "../css";

vi.mock("tailwind-merge", () => ({
  twMerge: (input: string) => input,
}));

describe("[css]", () => {
  it("[cn] should merge classes correctly", () => {
    expect(cn(null, undefined, "", { foo: false, bar: 0 }, [])).toBe("");

    expect(
      cn("foo", "", ["bar", ""], { baz: true, skip: false }, null, undefined),
    ).toBe("foo bar baz");
  });
});
