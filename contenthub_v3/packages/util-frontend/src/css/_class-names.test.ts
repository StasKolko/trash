import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { cn } from "./_class-names";

vi.mock("clsx", () => ({ clsx: vi.fn() }));
vi.mock("tailwind-merge", () => ({ twMerge: vi.fn() }));

const clsxMock = vi.mocked(clsx);
const twMergeMock = vi.mocked(twMerge);

const CLSX_RESULT = "clsx-result";

describe("cn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clsxMock.mockReturnValue(CLSX_RESULT);
  });

  it("passes inputs to clsx and forwards its result to twMerge", () => {
    cn("a", "b", { c: true });

    expect(clsxMock).toHaveBeenCalledExactlyOnceWith(["a", "b", { c: true }]);
    expect(twMergeMock).toHaveBeenCalledExactlyOnceWith(CLSX_RESULT);
  });
});
