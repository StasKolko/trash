export const APPS_DIR_NAME = "apps";
export const INDEX_HTML_FILENAME = "index.html";

export const DEFAULT_THEME_IDENTIFIER = "DEFAULT_THEME";
export const THEME_STORAGE_KEY_IDENTIFIER = "THEME_STORAGE_KEY";

export const SCRIPT_MARKER = "localStorage.getItem(";
export const SCRIPT_OPEN_TAG = "<script>";
export const SCRIPT_CLOSE_TAG = "</script>";
export const HEAD_OPEN_TAG = "<head";
export const TITLE_CLOSE_TAG = "</title>";

export const CACHED_THEME_REGEX = /CACHED_DEFAULT_THEME\s*=\s*"([^"]*)"/;
export const CACHED_KEY_REGEX = /CACHED_STORAGE_KEY\s*=\s*"([^"]*)"/;

export const THEME_OPPOSITE: Record<string, string> = {
  dark: "light",
  light: "dark",
};
