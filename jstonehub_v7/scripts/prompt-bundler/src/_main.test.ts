import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import clipboardy from "clipboardy";

import { buildBundle } from "./main";

vi.mock("clipboardy", () => ({
  default: {
    write: vi.fn(),
  },
}));

const clipboardWrite = vi.mocked(clipboardy.write);
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("buildBundle", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
    consoleSpy.mockClear();
    clipboardWrite.mockClear();
  });

  it("bundles files from a single target", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/hello.ts", "const x = 1;");
    writeConfig(configPath, {
      targets: [{ name: "test-bundle", isActive: true, includes: ["src/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(results).toHaveLength(1);
    expect(result.name).toBe("test-bundle");
    expect(result.fileCount).toBe(1);
    expect(result.content).toContain("const x = 1;");
  });

  it("writes output file to outputDir", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/a.ts", "export default 1;");
    writeConfig(configPath, {
      targets: [{ name: "out-test", isActive: true, includes: ["src/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    const outputContent = readFileSync(result.outputPath, "utf-8");
    expect(outputContent).toContain("export default 1;");
  });

  it("wraps non-md files in code blocks", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/code.ts", "const y = 2;");
    writeConfig(configPath, {
      targets: [{ name: "code-wrap", isActive: true, includes: ["src/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.content).toContain("```");
    expect(result.content).toContain("const y = 2;");
  });

  it("does not wrap .md files in code blocks", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "docs/readme.md", "# Hello");
    writeConfig(configPath, {
      targets: [{ name: "md-test", isActive: true, includes: ["docs/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.content).toContain("# Hello");
    expect(result.content).not.toContain("```");
  });

  it("copies to clipboard for single target", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/a.ts", "clip");
    writeConfig(configPath, {
      targets: [{ name: "clip-test", isActive: true, includes: ["src/**"] }],
    });

    await buildBundle({ projectRoot, outputDir, configPath });

    expect(clipboardWrite).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("clipboard"),
    );
  });

  it("does not copy to clipboard for multiple targets", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/a.ts", "a");
    writeSourceFile(projectRoot, "lib/b.ts", "b");
    writeConfig(configPath, {
      targets: [
        { name: "target-a", isActive: true, includes: ["src/**"] },
        { name: "target-b", isActive: true, includes: ["lib/**"] },
      ],
    });

    await buildBundle({ projectRoot, outputDir, configPath });

    expect(clipboardWrite).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });

  it("skips inactive targets", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/a.ts", "active");
    writeSourceFile(projectRoot, "skip/b.ts", "inactive");
    writeConfig(configPath, {
      targets: [
        { name: "active", isActive: true, includes: ["src/**"] },
        { name: "inactive", isActive: false, includes: ["skip/**"] },
      ],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(results).toHaveLength(1);
    expect(result.name).toBe("active");
  });

  it("merges global includes with target includes", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "shared/s.ts", "shared");
    writeSourceFile(projectRoot, "feature/f.ts", "feature");
    writeConfig(configPath, {
      includes: ["shared/**"],
      targets: [{ name: "merged", isActive: true, includes: ["feature/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.fileCount).toBe(2);
    expect(result.content).toContain("shared");
    expect(result.content).toContain("feature");
  });

  it("excludes files matching global excludes", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/keep.ts", "keep");
    writeSourceFile(projectRoot, "src/drop.gen.ts", "drop");
    writeConfig(configPath, {
      excludes: ["**/*.gen.ts"],
      targets: [{ name: "exclude-test", isActive: true, includes: ["src/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.fileCount).toBe(1);
    expect(result.content).toContain("keep");
    expect(result.content).not.toContain("drop");
  });

  it("excludes files matching target-level excludes", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/keep.ts", "keep");
    writeSourceFile(projectRoot, "src/secret.ts", "secret");
    writeConfig(configPath, {
      targets: [
        {
          name: "target-exclude",
          isActive: true,
          includes: ["src/**"],
          excludes: ["**/secret.ts"],
        },
      ],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.fileCount).toBe(1);
    expect(result.content).not.toContain("secret");
  });

  it("applies builtin excludes", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/real.ts", "real");
    writeSourceFile(projectRoot, "src/node_modules/dep.js", "dep");
    writeSourceFile(projectRoot, "src/logo.png", "binary");
    writeConfig(configPath, {
      targets: [{ name: "builtin-test", isActive: true, includes: ["src/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.fileCount).toBe(1);
    expect(result.content).toContain("real");
  });

  it("cleans output directory by default", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeFileSync(join(outputDir, "old-file.md"), "stale");
    writeSourceFile(projectRoot, "src/a.ts", "new");
    writeConfig(configPath, {
      targets: [{ name: "clean-test", isActive: true, includes: ["src/**"] }],
    });

    await buildBundle({ projectRoot, outputDir, configPath });

    const entries = readdirSync(outputDir);
    expect(entries).toEqual(["clean-test.md"]);
  });

  it("preserves output directory when cleanOutputDir is false", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeFileSync(join(outputDir, "existing.md"), "keep");
    writeSourceFile(projectRoot, "src/a.ts", "new");
    writeConfig(configPath, {
      cleanOutputDir: false,
      targets: [{ name: "no-clean", isActive: true, includes: ["src/**"] }],
    });

    await buildBundle({ projectRoot, outputDir, configPath });

    const entries = readdirSync(outputDir).sort();
    expect(entries).toContain("existing.md");
    expect(entries).toContain("no-clean.md");
  });

  it("includes shared files in all targets that reference them", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "shared/common.ts", "common-content");
    writeSourceFile(projectRoot, "src/a.ts", "a-only");
    writeSourceFile(projectRoot, "lib/b.ts", "b-only");
    writeConfig(configPath, {
      includes: ["shared/**"],
      targets: [
        { name: "target-a", isActive: true, includes: ["src/**"] },
        { name: "target-b", isActive: true, includes: ["lib/**"] },
      ],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });

    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result.content).toContain("common-content");
    }
  });

  it("handles target with only global includes", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/g.ts", "global-only");
    writeConfig(configPath, {
      includes: ["src/**"],
      targets: [{ name: "global-only", isActive: true }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.fileCount).toBe(1);
    expect(result.content).toContain("global-only");
  });

  it("returns correct charCount matching content length", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/a.ts", "hello");
    writeConfig(configPath, {
      targets: [{ name: "chars", isActive: true, includes: ["src/**"] }],
    });

    const results = await buildBundle({ projectRoot, outputDir, configPath });
    const result = firstResult(results);

    expect(result.charCount).toBe(result.content.length);
  });

  it("throws when file exceeds maxFileSizeKb", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeSourceFile(projectRoot, "src/big.ts", "x".repeat(2048));
    writeConfig(configPath, {
      maxFileSizeKb: 1,
      targets: [{ name: "size-test", isActive: true, includes: ["src/**"] }],
    });

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("exceeds max size limit");
  });

  it("throws when config has no exports", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeFileSync(configPath, "const x = 1;");

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("Config not found");
  });

  it("throws when targets array is empty", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeConfig(configPath, { targets: [] });

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("empty");
  });

  it("throws when no active targets", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeConfig(configPath, {
      targets: [{ name: "off", isActive: false, includes: ["src/**"] }],
    });

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("No active targets");
  });

  it("throws on duplicate target names", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeConfig(configPath, {
      targets: [
        { name: "dupe", isActive: true, includes: ["src/**"] },
        { name: "dupe", isActive: true, includes: ["lib/**"] },
      ],
    });

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("Duplicate target name");
  });

  it("throws when target has no includes and no global includes", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeConfig(configPath, {
      targets: [{ name: "no-inc", isActive: true }],
    });

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("no includes");
  });

  it("throws when targets is not an array", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeFileSync(
      configPath,
      'export const config = { targets: "not-an-array" };',
    );

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("Config must have a 'targets' array");
  });

  it("throws when target has no name", async () => {
    const { projectRoot, outputDir, configPath } = createFixture(dirs);
    writeFileSync(
      configPath,
      "export const config = { targets: [{ isActive: true, includes: ['src/**'] }] };",
    );

    await expect(
      buildBundle({ projectRoot, outputDir, configPath }),
    ).rejects.toThrow("Each target must have a 'name' string property");
  });

  it("throws when config file does not exist", async () => {
    const { projectRoot, outputDir } = createFixture(dirs);

    await expect(
      buildBundle({
        projectRoot,
        outputDir,
        configPath: join(projectRoot, "missing.ts"),
      }),
    ).rejects.toThrow("Config file not found");
  });

  it("throws when output directory does not exist", async () => {
    const { projectRoot, configPath } = createFixture(dirs);
    writeConfig(configPath, {
      targets: [{ name: "t", isActive: true, includes: ["**"] }],
    });

    await expect(
      buildBundle({
        projectRoot,
        outputDir: join(projectRoot, "nonexistent"),
        configPath,
      }),
    ).rejects.toThrow("Output directory not found");
  });

  it("throws when output path is a file, not directory", async () => {
    const { projectRoot, configPath } = createFixture(dirs);
    const fakePath = join(projectRoot, "not-a-dir");
    writeFileSync(fakePath, "");
    writeConfig(configPath, {
      targets: [{ name: "t", isActive: true, includes: ["**"] }],
    });

    await expect(
      buildBundle({
        projectRoot,
        outputDir: fakePath,
        configPath,
      }),
    ).rejects.toThrow("not a directory");
  });
});

// --- Helpers ---

type Fixture = {
  projectRoot: string;
  outputDir: string;
  configPath: string;
};

function createFixture(dirs: string[]): Fixture {
  const projectRoot = join(
    tmpdir(),
    `bundler-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(projectRoot, { recursive: true });
  const outputDir = join(projectRoot, "output");
  const configPath = join(projectRoot, "config.ts");
  mkdirSync(outputDir, { recursive: true });
  dirs.push(projectRoot);
  return { projectRoot, outputDir, configPath };
}

function writeConfig(configPath: string, config: object): void {
  writeFileSync(configPath, `export const config = ${JSON.stringify(config)};`);
}

function writeSourceFile(
  projectRoot: string,
  relativePath: string,
  content: string,
): void {
  const fullPath = join(projectRoot, relativePath);
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, content);
}

function firstResult(results: Awaited<ReturnType<typeof buildBundle>>) {
  const result = results[0];
  if (!result) {
    throw new Error("Expected at least one result");
  }
  return result;
}
