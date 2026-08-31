import type { Theme } from "./_theme.type";

export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "theme";
export const THEME_OPPOSITE: Record<Theme, Theme> = {
  dark: "light",
  light: "dark",
} as const;
