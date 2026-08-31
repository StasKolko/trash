import type { SyncOptions } from "./type";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { afterEach, describe, expect, it, vi } from "vitest";

import { syncThemeScript } from "./main";

const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

const CONSTANTS_DARK = [
  'export const DEFAULT_THEME: Theme = "dark";',
  'export const THEME_STORAGE_KEY = "theme";',
].join("\n");

const CONSTANTS_LIGHT = [
  'export const DEFAULT_THEME: Theme = "light";',
  'export const THEME_STORAGE_KEY = "custom-key";',
].join("\n");

const INDEX_HTML_WITH_SCRIPT = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test App</title>
    <script>
    (() => {
      const themeStorageKey = "theme";
      const defaultTheme = "dark";
      try {
        const theme =
          localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark";
        localStorage.setItem(themeStorageKey, theme);
        document.documentElement.classList.add(theme);
        document.documentElement.style.colorScheme = theme;
      } catch {
        document.documentElement.classList.add(defaultTheme);
        document.documentElement.style.colorScheme = defaultTheme;
      }
    })();
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>`;

const INDEX_HTML_WITHOUT_SCRIPT = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>`;

const INDEX_HTML_NO_HEAD = `<!DOCTYPE html>
<html lang="en">
  <body>
    <div id="app"></div>
  </body>
</html>`;

const INDEX_HTML_NO_TITLE_NO_SCRIPT = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`;

describe("syncThemeScript", () => {
  const dirs: string[] = [];
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(async () => {
    await Promise.all(
      dirs.map((dir) => rm(dir, { recursive: true, force: true })),
    );
    dirs.length = 0;
    consoleSpy.mockClear();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("skips when cache matches constants", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_DARK,
      cachedValues: { theme: "dark", key: "theme" },
    });

    await syncThemeScript(options);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("up to date"),
    );

    const html = await readFile(
      join(options.rootDir, "apps/admin/index.html"),
      "utf-8",
    );
    expect(html).toBe(INDEX_HTML_WITH_SCRIPT);
  });

  it("updates index.html when default theme changes", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_LIGHT,
      cachedValues: { theme: "dark", key: "theme" },
    });

    await syncThemeScript(options);

    const html = await readFile(
      join(options.rootDir, "apps/admin/index.html"),
      "utf-8",
    );
    expect(html).toContain('=== "dark" ? "dark" : "light"');
  });

  it("updates index.html when storage key changes", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_DARK,
      cachedValues: { theme: "dark", key: "old-key" },
    });

    await syncThemeScript(options);

    const html = await readFile(
      join(options.rootDir, "apps/admin/index.html"),
      "utf-8",
    );
    expect(html).toContain('localStorage.getItem("theme")');
  });

  it("updates multiple frontend apps", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_LIGHT,
      cachedValues: { theme: "dark", key: "theme" },
      frontendApps: ["admin", "hub"],
    });

    await syncThemeScript(options);

    const cache = await readFile(options.cacheFilePath, "utf-8");
    expect(cache).toContain('CACHED_DEFAULT_THEME = "light"');
    expect(cache).toContain('CACHED_STORAGE_KEY = "custom-key"');

    const adminHtml = await readFile(
      join(options.rootDir, "apps/admin/index.html"),
      "utf-8",
    );
    const hubHtml = await readFile(
      join(options.rootDir, "apps/hub/index.html"),
      "utf-8",
    );
    expect(adminHtml).toContain('=== "dark" ? "dark" : "light"');
    expect(hubHtml).toContain('=== "dark" ? "dark" : "light"');
  });

  it("preserves non-theme parts of index.html", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_LIGHT,
      cachedValues: { theme: "dark", key: "theme" },
    });

    await syncThemeScript(options);

    const html = await readFile(
      join(options.rootDir, "apps/admin/index.html"),
      "utf-8",
    );
    expect(html).toContain('<div id="app"></div>');
    expect(html).toContain('<script type="module" src="/src/app/main.tsx">');
    expect(html).toContain("</html>");
  });

  it("logs sync summary", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_LIGHT,
      cachedValues: { theme: "dark", key: "theme" },
    });

    await syncThemeScript(options);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Synced"));
  });

  it("inserts script after title when no existing script", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_DARK,
      cachedValues: { theme: "dark", key: "old-key" },
      indexHtml: INDEX_HTML_WITHOUT_SCRIPT,
    });

    await syncThemeScript(options);

    const html = await readFile(
      join(options.rootDir, "apps/admin/index.html"),
      "utf-8",
    );
    expect(html).toContain("localStorage.getItem");
    expect(html).toContain("<script>");
    expect(html).toContain("</script>");
    expect(html).toContain("</title>");
  });

  it("syncs when cache file is empty", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_DARK,
      cachedValues: { theme: "dark", key: "theme" },
    });

    await writeFile(options.cacheFilePath, "", "utf-8");

    await syncThemeScript(options);

    const cache = await readFile(options.cacheFilePath, "utf-8");
    expect(cache).toContain('CACHED_DEFAULT_THEME = "dark"');
    expect(cache).toContain('CACHED_STORAGE_KEY = "theme"');
  });

  it("throws when DEFAULT_THEME identifier is missing", async () => {
    const options = await createFixture(dirs, {
      constantsContent: 'export const THEME_STORAGE_KEY = "theme";',
      cachedValues: { theme: "", key: "" },
    });

    await expect(syncThemeScript(options)).rejects.toThrow("DEFAULT_THEME");
  });

  it("throws when THEME_STORAGE_KEY identifier is missing", async () => {
    const options = await createFixture(dirs, {
      constantsContent: 'export const DEFAULT_THEME = "dark";',
      cachedValues: { theme: "", key: "" },
    });

    await expect(syncThemeScript(options)).rejects.toThrow("THEME_STORAGE_KEY");
  });

  it("throws when theme value is empty", async () => {
    const options = await createFixture(dirs, {
      constantsContent: [
        'export const DEFAULT_THEME = "";',
        'export const THEME_STORAGE_KEY = "theme";',
      ].join("\n"),
      cachedValues: { theme: "", key: "" },
    });

    await expect(syncThemeScript(options)).rejects.toThrow("Empty value");
  });

  it("throws when unknown theme value", async () => {
    const options = await createFixture(dirs, {
      constantsContent: [
        'export const DEFAULT_THEME = "blue";',
        'export const THEME_STORAGE_KEY = "theme";',
      ].join("\n"),
      cachedValues: { theme: "", key: "" },
    });

    await expect(syncThemeScript(options)).rejects.toThrow(
      'Unknown theme value: "blue"',
    );
  });

  it("throws when opening quote not found for identifier", async () => {
    const options = await createFixture(dirs, {
      constantsContent:
        "export const DEFAULT_THEME = dark;\nexport const THEME_STORAGE_KEY = theme;",
      cachedValues: { theme: "", key: "" },
    });

    await expect(syncThemeScript(options)).rejects.toThrow(
      "Opening quote not found",
    );
  });

  it("throws when closing quote not found for identifier", async () => {
    const options = await createFixture(dirs, {
      constantsContent: 'export const DEFAULT_THEME = "dark',
      cachedValues: { theme: "", key: "" },
    });

    await expect(syncThemeScript(options)).rejects.toThrow(
      "Closing quote not found",
    );
  });

  it("throws when index.html has no head tag", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_DARK,
      cachedValues: { theme: "dark", key: "old-key" },
      indexHtml: INDEX_HTML_NO_HEAD,
    });

    await expect(syncThemeScript(options)).rejects.toThrow(
      "<head> tag not found",
    );
  });

  it("throws when index.html has no title and no script marker", async () => {
    const options = await createFixture(dirs, {
      constantsContent: CONSTANTS_DARK,
      cachedValues: { theme: "dark", key: "old-key" },
      indexHtml: INDEX_HTML_NO_TITLE_NO_SCRIPT,
    });

    await expect(syncThemeScript(options)).rejects.toThrow(
      "Neither theme script marker nor </title>",
    );
  });
});

type FixtureParams = {
  constantsContent: string;
  cachedValues: { theme: string; key: string };
  frontendApps?: string[];
  indexHtml?: string;
};

async function createFixture(
  dirs: string[],
  params: FixtureParams,
): Promise<SyncOptions> {
  const {
    constantsContent,
    cachedValues,
    frontendApps = ["admin"],
    indexHtml = INDEX_HTML_WITH_SCRIPT,
  } = params;

  const root = join(
    tmpdir(),
    `theme-sync-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  dirs.push(root);

  const appsDir = join(root, "apps");
  const adminDir = join(appsDir, "admin");
  const apiDir = join(appsDir, "api");

  await mkdir(adminDir, { recursive: true });
  await mkdir(apiDir, { recursive: true });

  const allFrontend = new Set(frontendApps);

  if (allFrontend.has("hub")) {
    const hubDir = join(appsDir, "hub");
    await mkdir(hubDir, { recursive: true });
    await writeFile(join(hubDir, "index.html"), indexHtml, "utf-8");
  }

  if (allFrontend.has("admin")) {
    await writeFile(join(adminDir, "index.html"), indexHtml, "utf-8");
  }

  const constantsPath = join(root, "theme.constant.ts");
  await writeFile(constantsPath, constantsContent, "utf-8");

  const cachePath = join(root, "cache.ts");
  const cacheContent = [
    `export const CACHED_DEFAULT_THEME = "${cachedValues.theme}";`,
    `export const CACHED_STORAGE_KEY = "${cachedValues.key}";`,
    "",
  ].join("\n");
  await writeFile(cachePath, cacheContent, "utf-8");

  return {
    rootDir: root,
    themeConstantPath: constantsPath,
    cacheFilePath: cachePath,
  };
}
