import { fireEvent, render, screen } from "@solidjs/testing-library";

import { COPY_FEEDBACK_DURATION } from "./_copy-button.constant";
import { COPY_ERROR_COLOR, COPY_SUCCESS_COLOR } from "./_copy-button.style";
import * as clipboardUtil from "./_copy-button.util";
import { CopyButton } from "./copy-button";

const TEST_ID = "copy-btn";

function renderCopyButton(
  overrides: Partial<{
    content: string | (() => string);
    disabled: boolean;
    onCopied: () => void;
    onError: () => void;
    onClick: (e: MouseEvent) => void;
  }> = {},
) {
  return render(() => (
    <CopyButton
      data-testid={TEST_ID}
      aria-label="Copy"
      content={overrides.content ?? "text"}
      disabled={overrides.disabled}
      onCopied={overrides.onCopied}
      onError={overrides.onError}
      onClick={overrides.onClick}
    />
  ));
}

describe("[CopyButton]", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should show success styles and call onCopied when clipboard succeeds", async () => {
    vi.spyOn(clipboardUtil, "copyToClipboard").mockResolvedValue(true);
    const onCopied = vi.fn();

    renderCopyButton({ onCopied });

    const btn = screen.getByTestId(TEST_ID);
    await fireEvent.click(btn);

    expect(onCopied).toHaveBeenCalledOnce();

    for (const token of COPY_SUCCESS_COLOR.split(" ").filter(Boolean)) {
      expect(btn.className).toContain(token);
    }
  });

  it("should show error styles and call onError when clipboard fails", async () => {
    vi.spyOn(clipboardUtil, "copyToClipboard").mockResolvedValue(false);
    const onError = vi.fn();

    renderCopyButton({ onError });

    const btn = screen.getByTestId(TEST_ID);
    await fireEvent.click(btn);

    expect(onError).toHaveBeenCalledOnce();

    for (const token of COPY_ERROR_COLOR.split(" ").filter(Boolean)) {
      expect(btn.className).toContain(token);
    }
  });

  it("should reset to idle after COPY_FEEDBACK_DURATION", async () => {
    vi.spyOn(clipboardUtil, "copyToClipboard").mockResolvedValue(true);

    renderCopyButton();

    const btn = screen.getByTestId(TEST_ID);
    await fireEvent.click(btn);

    for (const token of COPY_SUCCESS_COLOR.split(" ").filter(Boolean)) {
      expect(btn.className).toContain(token);
    }

    vi.advanceTimersByTime(COPY_FEEDBACK_DURATION);

    for (const token of COPY_SUCCESS_COLOR.split(" ").filter(Boolean)) {
      expect(btn.className).not.toContain(token);
    }
  });

  it("should reset timer on rapid clicks", async () => {
    vi.spyOn(clipboardUtil, "copyToClipboard").mockResolvedValue(true);

    renderCopyButton();

    const btn = screen.getByTestId(TEST_ID);

    await fireEvent.click(btn);
    vi.advanceTimersByTime(COPY_FEEDBACK_DURATION - 100);

    for (const token of COPY_SUCCESS_COLOR.split(" ").filter(Boolean)) {
      expect(btn.className).toContain(token);
    }

    await fireEvent.click(btn);
    vi.advanceTimersByTime(COPY_FEEDBACK_DURATION - 100);

    for (const token of COPY_SUCCESS_COLOR.split(" ").filter(Boolean)) {
      expect(btn.className).toContain(token);
    }

    vi.advanceTimersByTime(100);

    for (const token of COPY_SUCCESS_COLOR.split(" ").filter(Boolean)) {
      expect(btn.className).not.toContain(token);
    }
  });

  it("should resolve content from function", async () => {
    const spy = vi
      .spyOn(clipboardUtil, "copyToClipboard")
      .mockResolvedValue(true);

    renderCopyButton({ content: () => "dynamic-text" });

    await fireEvent.click(screen.getByTestId(TEST_ID));

    expect(spy).toHaveBeenCalledWith("dynamic-text");
  });

  it("should resolve content from string", async () => {
    const spy = vi
      .spyOn(clipboardUtil, "copyToClipboard")
      .mockResolvedValue(true);

    renderCopyButton({ content: "static-text" });

    await fireEvent.click(screen.getByTestId(TEST_ID));

    expect(spy).toHaveBeenCalledWith("static-text");
  });

  it("should call onClick before clipboard operation", async () => {
    const order: string[] = [];

    vi.spyOn(clipboardUtil, "copyToClipboard").mockImplementation(async () => {
      order.push("clipboard");
      return true;
    });

    const onClick = vi.fn(() => order.push("onClick"));

    renderCopyButton({ onClick });

    await fireEvent.click(screen.getByTestId(TEST_ID));

    expect(onClick).toHaveBeenCalledOnce();
    expect(order).toEqual(["onClick", "clipboard"]);
  });
});
