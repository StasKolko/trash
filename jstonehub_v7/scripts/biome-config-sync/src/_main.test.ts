import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

import { BIOME_VERSION } from "./cache";
import { biomeConfigSync } from "./main";

const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

const UPDATED_VERSION = "9.9.9";

describe("biomeConfigSync", () => {
  const dirs: string[] = [];
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
    consoleSpy.mockClear();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("skips in production", async () => {
    process.env.NODE_ENV = "production";
    const fixture = createFixture(dirs);

    await biomeConfigSync(fixture.options);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Skipped in production"),
    );
  });

  it("skips when version is up to date", async () => {
    const fixture = createFixture(dirs, { biomeVersion: BIOME_VERSION });

    await biomeConfigSync(fixture.options);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("is up to date"),
    );
  });

  it("updates schema in biome.json", async () => {
    const fixture = createFixture(dirs);

    await biomeConfigSync(fixture.options);

    const biomeJson = readJsonFile(fixture.options.biomeJsonPath);
    expect(biomeJson.$schema).toBe(
      `https://biomejs.dev/schemas/${UPDATED_VERSION}/schema.json`,
    );
  });

  it("updates schema in config files", async () => {
    const fixture = createFixture(dirs);

    await biomeConfigSync(fixture.options);

    const configPath = join(fixture.options.configPackageDir, "src/base.json");
    const configJson = readJsonFile(configPath);
    expect(configJson.$schema).toBe(
      `https://biomejs.dev/schemas/${UPDATED_VERSION}/schema.json`,
    );
  });

  it("updates exports in config package.json", async () => {
    const fixture = createFixture(dirs);

    await biomeConfigSync(fixture.options);

    const packageJson = readJsonFile(
      join(fixture.options.configPackageDir, "package.json"),
    );
    expect(packageJson.exports).toEqual({
      "./base": "./src/base.json",
    });
  });

  it("updates extends in biome.json", async () => {
    const fixture = createFixture(dirs);

    await biomeConfigSync(fixture.options);

    const biomeJson = readJsonFile(fixture.options.biomeJsonPath);
    expect(biomeJson.extends).toEqual(["@configs/biomejs/base"]);
  });

  it("writes cache file with new version", async () => {
    const fixture = createFixture(dirs);

    await biomeConfigSync(fixture.options);

    const cacheContent = readFileSync(fixture.options.cacheFilePath, "utf8");
    expect(cacheContent).toBe(
      `const BIOME_VERSION = "${UPDATED_VERSION}";\n\nexport { BIOME_VERSION };\n`,
    );
  });

  it("logs update summary", async () => {
    const fixture = createFixture(dirs);

    await biomeConfigSync(fixture.options);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Updated ${BIOME_VERSION} → ${UPDATED_VERSION}`),
    );
  });

  it("handles multiple config files", async () => {
    const fixture = createFixture(dirs, {
      configFiles: ["base.json", "lint.jsonc"],
    });

    await biomeConfigSync(fixture.options);

    const packageJson = readJsonFile(
      join(fixture.options.configPackageDir, "package.json"),
    );
    expect(packageJson.exports).toEqual({
      "./base": "./src/base.json",
      "./lint": "./src/lint.jsonc",
    });

    const biomeJson = readJsonFile(fixture.options.biomeJsonPath);
    expect(biomeJson.extends).toEqual([
      "@configs/biomejs/base",
      "@configs/biomejs/lint",
    ]);
  });

  it("handles nested config files", async () => {
    const fixture = createFixture(dirs, {
      configFiles: ["shared/formatter.json"],
    });

    await biomeConfigSync(fixture.options);

    const packageJson = readJsonFile(
      join(fixture.options.configPackageDir, "package.json"),
    );
    expect(packageJson.exports).toEqual({
      "./shared/formatter": "./src/shared/formatter.json",
    });
  });

  it("sorts config entries alphabetically", async () => {
    const fixture = createFixture(dirs, {
      configFiles: ["lint.json", "base.json", "format.json"],
    });

    await biomeConfigSync(fixture.options);

    const biomeJson = readJsonFile(fixture.options.biomeJsonPath);
    expect(biomeJson.extends).toEqual([
      "@configs/biomejs/base",
      "@configs/biomejs/format",
      "@configs/biomejs/lint",
    ]);
  });

  it("ignores non-config files in src directory", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      join(fixture.options.configPackageDir, "src/readme.md"),
      "# Docs",
    );

    await biomeConfigSync(fixture.options);

    const packageJson = readJsonFile(
      join(fixture.options.configPackageDir, "package.json"),
    );
    const exports = packageJson.exports as Record<string, string>;
    expect(Object.keys(exports)).toEqual(["./base"]);
  });

  it("preserves other fields in biome.json", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      fixture.options.biomeJsonPath,
      JSON.stringify(
        {
          $schema: "https://biomejs.dev/schemas/1.0.0/schema.json",
          extends: [],
          linter: { enabled: true },
        },
        null,
        2,
      ),
    );

    await biomeConfigSync(fixture.options);

    const biomeJson = readJsonFile(fixture.options.biomeJsonPath);
    expect(biomeJson.linter).toEqual({ enabled: true });
  });

  it("preserves other fields in config package.json", async () => {
    const fixture = createFixture(dirs);
    const configPkgPath = join(
      fixture.options.configPackageDir,
      "package.json",
    );
    writeFileSync(
      configPkgPath,
      JSON.stringify({ name: "@configs/biomejs", version: "1.0.0" }),
    );

    await biomeConfigSync(fixture.options);

    const packageJson = readJsonFile(configPkgPath);
    expect(packageJson.name).toBe("@configs/biomejs");
    expect(packageJson.version).toBe("1.0.0");
  });

  it("preserves formatting in schema replacement", async () => {
    const fixture = createFixture(dirs);
    const configPath = join(fixture.options.configPackageDir, "src/base.json");
    writeFileSync(
      configPath,
      '{\n  "$schema": "https://biomejs.dev/schemas/1.0.0/schema.json",\n  "linter": {}\n}\n',
    );

    await biomeConfigSync(fixture.options);

    const content = readFileSync(configPath, "utf8");
    expect(content).toContain(
      `"$schema": "https://biomejs.dev/schemas/${UPDATED_VERSION}/schema.json"`,
    );
    expect(content).toContain('"linter": {}');
  });

  it("extracts version when package.json has no trailing newline", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      fixture.options.rootPackageJsonPath,
      '"@biomejs/biome": "9.9.9"',
    );

    await biomeConfigSync(fixture.options);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Updated ${BIOME_VERSION} → ${UPDATED_VERSION}`),
    );
  });

  it("throws when no config files found", async () => {
    const fixture = createFixture(dirs, { configFiles: [] });

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      "No config files found in",
    );
  });

  it("throws when biome package not found in root package.json", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      fixture.options.rootPackageJsonPath,
      JSON.stringify({ devDependencies: {} }),
    );

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      "@biomejs/biome",
    );
  });

  it("throws when biome version cannot be extracted", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      fixture.options.rootPackageJsonPath,
      JSON.stringify({
        devDependencies: { "@biomejs/biome": "invalid" },
      }),
    );

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      "Failed to extract version",
    );
  });

  it("throws when colon missing after biome package name", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      fixture.options.rootPackageJsonPath,
      '"@biomejs/biome" no-colon-here',
    );

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      'Missing ":" after "@biomejs/biome"',
    );
  });

  it("throws when config file missing $schema property", async () => {
    const fixture = createFixture(dirs);
    const configPath = join(fixture.options.configPackageDir, "src/base.json");
    writeFileSync(configPath, JSON.stringify({ linter: {} }));

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      '"$schema" not found',
    );
  });

  it("throws when biome.json missing $schema property", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      fixture.options.biomeJsonPath,
      JSON.stringify({ extends: [] }),
    );

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      '"$schema" not found',
    );
  });

  it("throws when colon missing after $schema property", async () => {
    const fixture = createFixture(dirs);
    const configPath = join(fixture.options.configPackageDir, "src/base.json");
    writeFileSync(configPath, '"$schema" = "value"');

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      'Missing ":" after "$schema"',
    );
  });

  it("throws when $schema value is not a quoted string", async () => {
    const fixture = createFixture(dirs);
    const configPath = join(fixture.options.configPackageDir, "src/base.json");
    writeFileSync(configPath, '"$schema": 12345\n');

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      'Cannot parse string value for "$schema"',
    );
  });

  it("throws when $schema value has newline before closing quote", async () => {
    const fixture = createFixture(dirs);
    writeFileSync(
      fixture.options.biomeJsonPath,
      '{"$schema": "broken\nvalue", "extends": []}',
    );

    await expect(biomeConfigSync(fixture.options)).rejects.toThrow(
      'Cannot parse string value for "$schema"',
    );
  });
});

type FixtureOptions = {
  biomeVersion?: string;
  configFiles?: string[];
};

type Fixture = {
  options: {
    rootPackageJsonPath: string;
    biomeJsonPath: string;
    configPackageDir: string;
    cacheFilePath: string;
  };
};

function createFixture(dirs: string[], options: FixtureOptions = {}): Fixture {
  const { biomeVersion = UPDATED_VERSION, configFiles = ["base.json"] } =
    options;

  const root = join(
    tmpdir(),
    `biome-sync-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(root, { recursive: true });
  dirs.push(root);

  const rootPackageJsonPath = join(root, "package.json");
  writeFileSync(
    rootPackageJsonPath,
    JSON.stringify(
      { devDependencies: { "@biomejs/biome": biomeVersion } },
      null,
      2,
    ),
  );

  const biomeJsonPath = join(root, "biome.json");
  writeFileSync(
    biomeJsonPath,
    JSON.stringify(
      {
        $schema: "https://biomejs.dev/schemas/1.0.0/schema.json",
        extends: [],
      },
      null,
      2,
    ),
  );

  const configPackageDir = join(root, "configs/biomejs");
  const configSrcDir = join(configPackageDir, "src");
  mkdirSync(configSrcDir, { recursive: true });

  writeFileSync(
    join(configPackageDir, "package.json"),
    JSON.stringify({ name: "@configs/biomejs" }),
  );

  for (const file of configFiles) {
    const filePath = join(configSrcDir, file);
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(
      filePath,
      JSON.stringify(
        { $schema: "https://biomejs.dev/schemas/1.0.0/schema.json" },
        null,
        2,
      ),
    );
  }

  const cacheFilePath = join(root, "cache.ts");
  writeFileSync(
    cacheFilePath,
    `const BIOME_VERSION = "${BIOME_VERSION}";\n\nexport { BIOME_VERSION };\n`,
  );

  return {
    options: {
      rootPackageJsonPath,
      biomeJsonPath,
      configPackageDir,
      cacheFilePath,
    },
  };
}

function readJsonFile(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, "utf8"));
}
