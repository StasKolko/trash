import { copyToClipboard } from "./_copy-button.util";

describe("[copyToClipboard]", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return true when writeText succeeds", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();

    const result = await copyToClipboard("hello");

    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
  });

  it("should return false when writeText rejects", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );

    const result = await copyToClipboard("hello");

    expect(result).toBe(false);
  });
});
