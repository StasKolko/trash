import { fireEvent, render, screen } from "@solidjs/testing-library";

import {
  DEFAULT_THEME,
  THEME_OPPOSITE,
  THEME_STORAGE_KEY,
} from "./_theme.constant";
import { ThemeProvider, useTheme } from "./theme.provider";

describe("[ThemeProvider]", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.style.colorScheme = "";
  });

  it("should initialize with default theme, toggle, persist to localStorage, and apply to DOM", () => {
    render(() => (
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    ));

    const themeEl = screen.getByTestId("theme");
    const toggleBtn = screen.getByTestId("toggle");

    expect(themeEl).toHaveTextContent(DEFAULT_THEME);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(null);

    fireEvent.click(toggleBtn);

    const opposite = THEME_OPPOSITE[DEFAULT_THEME];
    expect(themeEl).toHaveTextContent(opposite);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(opposite);
    expect(document.documentElement.classList.contains(opposite)).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe(opposite);

    fireEvent.click(toggleBtn);

    expect(themeEl).toHaveTextContent(DEFAULT_THEME);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(DEFAULT_THEME);
    expect(document.documentElement.classList.contains(DEFAULT_THEME)).toBe(
      true,
    );
    expect(document.documentElement.style.colorScheme).toBe(DEFAULT_THEME);
  });

  it("should read persisted theme from localStorage on mount", () => {
    const opposite = THEME_OPPOSITE[DEFAULT_THEME];
    localStorage.setItem(THEME_STORAGE_KEY, opposite);

    render(() => (
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    ));

    expect(screen.getByTestId("theme")).toHaveTextContent(opposite);
  });

  it("should normalize invalid localStorage value to default theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "invalid");

    render(() => (
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    ));

    expect(screen.getByTestId("theme")).toHaveTextContent(DEFAULT_THEME);
  });

  it("should react to cross-tab storage events", () => {
    render(() => (
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    ));

    const opposite = THEME_OPPOSITE[DEFAULT_THEME];

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: THEME_STORAGE_KEY,
        newValue: opposite,
      }),
    );

    expect(screen.getByTestId("theme")).toHaveTextContent(opposite);
    expect(document.documentElement.classList.contains(opposite)).toBe(true);
  });

  it("should ignore storage events for other keys", () => {
    render(() => (
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    ));

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "other-key",
        newValue: "light",
      }),
    );

    expect(screen.getByTestId("theme")).toHaveTextContent(DEFAULT_THEME);
  });

  it("should fall back to default theme when localStorage is inaccessible", () => {
    const savedStorage = window.localStorage;

    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("access denied");
      },
      configurable: true,
    });

    render(() => (
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    ));

    expect(screen.getByTestId("theme")).toHaveTextContent(DEFAULT_THEME);

    Object.defineProperty(window, "localStorage", {
      value: savedStorage,
      writable: true,
      configurable: true,
    });
  });
});

function TestConsumer() {
  const { theme, toggle } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme()}</span>
      <button data-testid="toggle" onClick={toggle}>
        toggle
      </button>
    </div>
  );
}
