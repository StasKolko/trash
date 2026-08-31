import { THEME_OPPOSITE } from "./constant";

function generateThemeScript(
  defaultTheme: string,
  storageKey: string,
  indent: string,
): string {
  const oppositeTheme = THEME_OPPOSITE[defaultTheme];

  if (!oppositeTheme) {
    throw new Error(
      `Unknown theme value: "${defaultTheme}". Expected "dark" or "light"`,
    );
  }

  const lines = [
    `${indent}(() => {`,
    `${indent}  try {`,
    `${indent}    const theme =`,
    `${indent}      localStorage.getItem("${storageKey}") === "${oppositeTheme}" ? "${oppositeTheme}" : "${defaultTheme}";`,
    `${indent}    localStorage.setItem("${storageKey}", theme);`,
    `${indent}    document.documentElement.classList.add(theme);`,
    `${indent}    document.documentElement.style.colorScheme = theme;`,
    `${indent}  } catch {`,
    `${indent}    document.documentElement.classList.add("${defaultTheme}");`,
    `${indent}    document.documentElement.style.colorScheme = "${defaultTheme}";`,
    `${indent}  }`,
    `${indent}})();`,
  ];

  return lines.join("\n");
}

export { generateThemeScript };
