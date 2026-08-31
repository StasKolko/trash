import type { JSX } from "solid-js";

import type { Theme } from "./_theme.type";

import { createContext, createSignal, onCleanup, onMount } from "solid-js";

import { getStrictContext } from "../_util/context";
import {
  DEFAULT_THEME,
  THEME_OPPOSITE,
  THEME_STORAGE_KEY,
} from "./_theme.constant";

const ThemeContext = createContext<{
  theme: () => Theme;
  toggle: () => void;
}>();

function useTheme() {
  return getStrictContext(ThemeContext, "useTheme");
}

function ThemeProvider(props: { children: JSX.Element }) {
  const [theme, setTheme] = createSignal(getThemeFromStorage());

  const toggle = () => {
    const newTheme = THEME_OPPOSITE[theme()];
    setTheme(newTheme);
    applyTheme(newTheme);
    setThemeToStorage(newTheme);
  };

  onMount(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) {
        return;
      }
      const newTheme = normalizeTheme(e.newValue);
      setTheme(newTheme);
      applyTheme(newTheme);
    };

    window.addEventListener("storage", handleStorage);
    onCleanup(() => window.removeEventListener("storage", handleStorage));
  });

  const value = {
    theme,
    toggle,
  };

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}

function setThemeToStorage(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* empty */
  }
}

function getThemeFromStorage(): Theme {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(newTheme: Theme) {
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  html.classList.add(newTheme);
  html.style.colorScheme = newTheme;
}

function normalizeTheme(newTheme: unknown): Theme {
  return newTheme === THEME_OPPOSITE[DEFAULT_THEME]
    ? THEME_OPPOSITE[DEFAULT_THEME]
    : DEFAULT_THEME;
}

export { ThemeProvider, useTheme };
