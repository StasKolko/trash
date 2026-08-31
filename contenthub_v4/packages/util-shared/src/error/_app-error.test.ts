import type { AppErrorParams } from "./_app-error";

import { AppError } from "./_app-error";

const KIND = "some_kind";
const MESSAGE = "boom";

describe("AppError", () => {
  it("is an instance of Error and AppError", () => {
    const error = createError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it("assigns message, kind and context", () => {
    const context = { foo: "bar" };
    const error = createError({ context });

    expect(error.message).toBe(MESSAGE);
    expect(error.kind).toBe(KIND);
    expect(error.context).toBe(context);
  });

  it("propagates cause to the native Error", () => {
    const cause = new Error("root");
    const error = createError({ cause });

    expect(error.cause).toBe(cause);
  });

  it("leaves context and cause undefined when not provided", () => {
    const error = createError();

    expect(error.context).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it("uses the base class name when instantiated directly", () => {
    expect(createError().name).toBe("AppError");
  });

  it("derives name from the subclass constructor", () => {
    class CustomError extends AppError {
      public constructor() {
        super({ kind: "custom_kind", message: "custom boom" });
      }
    }

    expect(new CustomError().name).toBe("CustomError");
  });
});

function createError(overrides?: Partial<AppErrorParams>) {
  return new AppError({ kind: KIND, message: MESSAGE, ...overrides });
}
