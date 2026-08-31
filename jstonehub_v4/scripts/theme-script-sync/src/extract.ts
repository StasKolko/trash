import type { ThemeValues } from "./type";

import { readFile } from "node:fs/promises";

import {
  DEFAULT_THEME_IDENTIFIER,
  THEME_STORAGE_KEY_IDENTIFIER,
} from "./constant";

async function extractThemeValues(filePath: string): Promise<ThemeValues> {
  const content = await readFile(filePath, "utf-8");

  const defaultTheme = extractQuotedValue(
    content,
    DEFAULT_THEME_IDENTIFIER,
    filePath,
  );

  const storageKey = extractQuotedValue(
    content,
    THEME_STORAGE_KEY_IDENTIFIER,
    filePath,
  );

  return { defaultTheme, storageKey };
}

function extractQuotedValue(
  content: string,
  identifier: string,
  filePath: string,
): string {
  const index = content.indexOf(identifier);

  if (index === -1) {
    throw new Error(`Identifier "${identifier}" not found in: ${filePath}`);
  }

  const afterIdentifier = index + identifier.length;
  const openQuote = content.indexOf('"', afterIdentifier);

  if (openQuote === -1) {
    throw new Error(
      `Opening quote not found for "${identifier}" in: ${filePath}`,
    );
  }

  const closeQuote = content.indexOf('"', openQuote + 1);

  if (closeQuote === -1) {
    throw new Error(
      `Closing quote not found for "${identifier}" in: ${filePath}`,
    );
  }

  const value = content.slice(openQuote + 1, closeQuote);

  if (value.length === 0) {
    throw new Error(`Empty value for "${identifier}" in: ${filePath}`);
  }

  return value;
}

export { extractThemeValues };
