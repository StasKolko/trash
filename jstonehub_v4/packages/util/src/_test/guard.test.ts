import { is } from "../guard";

describe("[guard]", () => {
  it.each([
    { value: undefined, undef: true, nullish: true },
    { value: null, null_: true, nullish: true },
    { value: true, bool: true },
    { value: false, bool: true },
    { value: "hello", str: true },
    { value: "", str: true },
    { value: -1, num: true },
    { value: 0, num: true },
    { value: 42, num: true },
    { value: NaN },
    { value: [], arr: true },
    { value: [1, 2, ""], arr: true },
    { value: () => {}, fn: true },
    { value: {}, obj: true },
    { value: { a: 1 }, obj: true },
    { value: new Date(), obj: true },
    { value: new Error("test"), obj: true, err: true },
  ])("should return correct type checks for: $value", ({
    value,
    undef,
    null_,
    nullish,
    bool,
    str,
    num,
    fn,
    arr,
    obj,
    err,
  }) => {
    expect(is.undefined(value)).toBe(undef ?? false);
    expect(is.null(value)).toBe(null_ ?? false);
    expect(is.nullish(value)).toBe(nullish ?? false);
    expect(is.boolean(value)).toBe(bool ?? false);
    expect(is.string(value)).toBe(str ?? false);
    expect(is.number(value)).toBe(num ?? false);
    expect(is.function(value)).toBe(fn ?? false);
    expect(is.array(value)).toBe(arr ?? false);
    expect(is.object(value)).toBe(obj ?? false);
    expect(is.error(value)).toBe(err ?? false);
  });

  it("should return correct truthy/falsy checks", () => {
    expect(is.truthy(1)).toBe(true);
    expect(is.truthy("a")).toBe(true);
    expect(is.truthy(0)).toBe(false);
    expect(is.truthy("")).toBe(false);
    expect(is.truthy(null)).toBe(false);
    expect(is.truthy(undefined)).toBe(false);

    expect(is.falsy(0)).toBe(true);
    expect(is.falsy("")).toBe(true);
    expect(is.falsy(null)).toBe(true);
    expect(is.falsy(1)).toBe(false);
    expect(is.falsy("a")).toBe(false);
  });

  it("should negate correctly via is.not", () => {
    expect(is.not.string("hello")).toBe(false);
    expect(is.not.string(42)).toBe(true);
    expect(is.not.number(42)).toBe(false);
    expect(is.not.number("hello")).toBe(true);
    expect(is.not.null(null)).toBe(false);
    expect(is.not.null("value")).toBe(true);
    expect(is.not.undefined(undefined)).toBe(false);
    expect(is.not.undefined("value")).toBe(true);
    expect(is.not.nullish(null)).toBe(false);
    expect(is.not.nullish(0)).toBe(true);
    expect(is.not.array([])).toBe(false);
    expect(is.not.array("not array")).toBe(true);
    expect(is.not.object({})).toBe(false);
    expect(is.not.object("not object")).toBe(true);
    expect(is.not.boolean(true)).toBe(false);
    expect(is.not.boolean(1)).toBe(true);
    expect(is.not.function(() => {})).toBe(false);
    expect(is.not.function("not fn")).toBe(true);
    expect(is.not.error(new Error())).toBe(false);
    expect(is.not.error("not error")).toBe(true);
  });
});
