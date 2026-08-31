import {
  mkdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { cleanProject } from "./main";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual };
});

const fsMock = await import("node:fs/promises");

describe("cleanProject", () => {
  const dirs: string[] = [];
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
    vi.restoreAllMocks();
  });

  it("deletes directories matching includes", async () => {
    const root = createFixture(dirs, [
      "node_modules/pkg/index.js",
      "src/app.ts",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain("node_modules");
    expect(dirExists(join(root, "node_modules"))).toBe(false);
    expect(dirExists(join(root, "src"))).toBe(true);
  });

  it("deletes multiple matching directories", async () => {
    const root = createFixture(dirs, [
      "node_modules/pkg/index.js",
      "dist/bundle.js",
      "src/app.ts",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules", "**/dist"],
    });

    expect(stats.deleted).toHaveLength(2);
    expect(dirExists(join(root, "node_modules"))).toBe(false);
    expect(dirExists(join(root, "dist"))).toBe(false);
    expect(dirExists(join(root, "src"))).toBe(true);
  });

  it("deletes nested matching directories", async () => {
    const root = createFixture(dirs, [
      "packages/a/node_modules/pkg/index.js",
      "packages/a/src/app.ts",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain("node_modules");
  });

  it("matches root-level directory with ** pattern", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(1);
  });

  it("matches with exact relative path pattern", async () => {
    const root = createFixture(dirs, [
      "packages/a/dist/bundle.js",
      "packages/b/dist/bundle.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["packages/a/dist"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain(join("packages", "a", "dist"));
    expect(dirExists(join(root, "packages/b/dist"))).toBe(true);
  });

  it("excludes directories matching excludes", async () => {
    const root = createFixture(dirs, [
      "packages/a/dist/bundle.js",
      "packages/b/dist/bundle.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/dist"],
      excludes: ["packages/b/**"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain(join("packages", "a", "dist"));
  });

  it("skips .git directory by default", async () => {
    const root = createFixture(dirs, [
      ".git/config",
      ".git/refs/heads/main",
      "node_modules/pkg/index.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.skipped.some((s) => s.includes(".git"))).toBe(true);
    expect(dirExists(join(root, ".git"))).toBe(true);
  });

  it("skips .svn directory by default", async () => {
    const root = createFixture(dirs, [
      ".svn/entries",
      "node_modules/pkg/index.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.skipped.some((s) => s.includes(".svn"))).toBe(true);
  });

  it("does not delete in dry run mode", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
      dryRun: true,
    });

    expect(stats.deleted).toHaveLength(1);
    expect(dirExists(join(root, "node_modules"))).toBe(true);
  });

  it("supports glob patterns in includes", async () => {
    const root = createFixture(dirs, [
      ".turbo/cache.json",
      ".tanstack/config.json",
      "src/app.ts",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/.t*"],
    });

    expect(stats.deleted).toHaveLength(2);
    expect(dirExists(join(root, ".turbo"))).toBe(false);
    expect(dirExists(join(root, ".tanstack"))).toBe(false);
  });

  it("does not descend into deleted directories", async () => {
    const root = createFixture(dirs, [
      "node_modules/pkg/node_modules/dep/index.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toBe(join(root, "node_modules"));
  });

  it("returns empty stats when nothing matches", async () => {
    const root = createFixture(dirs, ["src/app.ts"]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(0);
    expect(stats.errors).toHaveLength(0);
  });

  it("throws when includes is empty", async () => {
    const root = createFixture(dirs, ["src/app.ts"]);

    await expect(cleanProject({ rootDir: root, includes: [] })).rejects.toThrow(
      "must have at least one pattern",
    );
  });

  it("throws when root directory does not exist", async () => {
    await expect(
      cleanProject({
        rootDir: "/nonexistent/path",
        includes: ["**/node_modules"],
      }),
    ).rejects.toThrow("Root directory not found");
  });

  it("logs dry run message", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
      dryRun: true,
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Dry run"));
  });

  it("logs results summary", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Results"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Done"));
  });

  it("records error when readdir fails", async () => {
    const root = createFixture(dirs, ["src/app.ts"]);
    const srcDir = join(root, "src");

    const originalReaddir = fsMock.readdir;
    vi.spyOn(fsMock, "readdir").mockImplementation(async (path, options) => {
      if (String(path) === srcDir) {
        throw new Error("EACCES: permission denied");
      }
      return originalReaddir(path, options);
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.errors).toHaveLength(1);
    expect(stats.errors[0]?.path).toBe(srcDir);
    expect(stats.errors[0]?.error).toContain("Failed to read");
  });

  it("records readdir error with non-Error thrown value", async () => {
    const root = createFixture(dirs, ["src/app.ts"]);
    const srcDir = join(root, "src");

    const originalReaddir = fsMock.readdir;
    vi.spyOn(fsMock, "readdir").mockImplementation(async (path, options) => {
      if (String(path) === srcDir) {
        throw "string-error-readdir";
      }
      return originalReaddir(path, options);
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.errors).toHaveLength(1);
    expect(stats.errors[0]?.error).toContain("string-error-readdir");
  });

  it("records error when rm fails", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    const originalRm = fsMock.rm;
    vi.spyOn(fsMock, "rm").mockImplementation(async (path, options) => {
      if (String(path).includes("node_modules")) {
        throw new Error("EPERM: operation not permitted");
      }
      return originalRm(path, options);
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.errors).toHaveLength(1);
    expect(stats.errors[0]?.error).toContain("EPERM");
  });

  it("records rm error with non-Error thrown value", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    vi.spyOn(fsMock, "rm").mockImplementation(async (path) => {
      if (String(path).includes("node_modules")) {
        throw 42;
      }
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.errors).toHaveLength(1);
    expect(stats.errors[0]?.error).toBe("42");
  });

  it("retries on retryable errors", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    let callCount = 0;
    const originalRm = fsMock.rm;
    vi.spyOn(fsMock, "rm").mockImplementation(async (path, options) => {
      if (String(path).includes("node_modules")) {
        callCount+=1;
        if (callCount <= 2) {
          const error = new Error("EBUSY: resource busy");
          (error as NodeJS.ErrnoException).code = "EBUSY";
          throw error;
        }
      }
      return originalRm(path, options);
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(callCount).toBe(3);
    expect(stats.deleted).toHaveLength(1);
    expect(stats.errors).toHaveLength(0);
  });

  it("gives up after max retries on retryable errors", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    vi.spyOn(fsMock, "rm").mockImplementation(async (path) => {
      if (String(path).includes("node_modules")) {
        const error = new Error("EBUSY: resource busy");
        (error as NodeJS.ErrnoException).code = "EBUSY";
        throw error;
      }
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(0);
    expect(stats.errors).toHaveLength(1);
    expect(stats.errors[0]?.error).toContain("EBUSY");
  });

  it("logs errors in summary", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    vi.spyOn(fsMock, "rm").mockImplementation(async (path) => {
      if (String(path).includes("node_modules")) {
        throw new Error("EPERM: operation not permitted");
      }
    });

    await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Errors"));
  });

  it("only processes directories, ignores files at root", async () => {
    const root = createFixture(dirs, [
      "stray-file.txt",
      "node_modules/pkg/index.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain("node_modules");
  });

  it("handles deeply nested matching directories", async () => {
    const root = createFixture(dirs, [
      "a/b/c/d/dist/output.js",
      "a/b/c/d/src/app.ts",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/dist"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain("dist");
    expect(dirExists(join(root, "a/b/c/d/dist"))).toBe(false);
    expect(dirExists(join(root, "a/b/c/d/src"))).toBe(true);
  });

  it("excludes with glob pattern matching path segments", async () => {
    const root = createFixture(dirs, [
      "packages/keep-this/dist/bundle.js",
      "packages/delete-this/dist/bundle.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/dist"],
      excludes: ["**/keep-this/**"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain("delete-this");
    expect(dirExists(join(root, "packages/keep-this/dist"))).toBe(true);
  });

  it("matches single-level glob without **", async () => {
    const root = createFixture(dirs, [
      "dist/bundle.js",
      "packages/a/dist/bundle.js",
    ]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["dist"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toBe(join(root, "dist"));
    expect(dirExists(join(root, "packages/a/dist"))).toBe(true);
  });

  it("deletes files matching includes pattern", async () => {
    const root = createFixture(dirs, ["bun.lock", "src/app.ts"]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/bun.lock"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain("bun.lock");
    expect(fileExists(join(root, "bun.lock"))).toBe(false);
    expect(fileExists(join(root, "src/app.ts"))).toBe(true);
  });

  it("reports file deletion in dry run without removing", async () => {
    const root = createFixture(dirs, ["bun.lock"]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/bun.lock"],
      dryRun: true,
    });

    expect(stats.deleted).toHaveLength(1);
    expect(fileExists(join(root, "bun.lock"))).toBe(true);
  });

  it("records error when unlink fails for a file", async () => {
    const root = createFixture(dirs, ["bun.lock"]);

    vi.spyOn(fsMock, "unlink").mockImplementation(async (path) => {
      if (String(path).includes("bun.lock")) {
        throw new Error("EPERM: operation not permitted");
      }
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/bun.lock"],
    });

    expect(stats.errors).toHaveLength(1);
    expect(stats.errors[0]?.error).toContain("EPERM");
  });

  it("retries file unlink on retryable errors", async () => {
    const root = createFixture(dirs, ["bun.lock"]);

    let callCount = 0;
    const originalUnlink = fsMock.unlink;
    vi.spyOn(fsMock, "unlink").mockImplementation(async (path) => {
      if (String(path).includes("bun.lock")) {
        callCount+=1;
        if (callCount <= 2) {
          const error = new Error("EBUSY: resource busy");
          (error as NodeJS.ErrnoException).code = "EBUSY";
          throw error;
        }
      }
      return originalUnlink(path);
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/bun.lock"],
    });

    expect(callCount).toBe(3);
    expect(stats.deleted).toHaveLength(1);
    expect(stats.errors).toHaveLength(0);
  });

  it("gives up file unlink after max retries", async () => {
    const root = createFixture(dirs, ["bun.lock"]);

    vi.spyOn(fsMock, "unlink").mockImplementation(async (path) => {
      if (String(path).includes("bun.lock")) {
        const error = new Error("EBUSY: resource busy");
        (error as NodeJS.ErrnoException).code = "EBUSY";
        throw error;
      }
    });

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/bun.lock"],
    });

    expect(stats.deleted).toHaveLength(0);
    expect(stats.errors).toHaveLength(1);
    expect(stats.errors[0]?.error).toContain("EBUSY");
  });

  it("deletes symlinks matching includes pattern", async () => {
    const root = createFixture(dirs, ["real-file.txt"]);
    const symlinkPath = join(root, "link.txt");
    symlinkSync(join(root, "real-file.txt"), symlinkPath);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/link.txt"],
    });

    expect(stats.deleted).toHaveLength(1);
    expect(stats.deleted[0]).toContain("link.txt");
  });
});

// --- Helpers ---

function createFixture(dirs: string[], files: string[]): string {
  const root = join(
    tmpdir(),
    `cleaner-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(root, { recursive: true });
  dirs.push(root);

  for (const file of files) {
    const fullPath = join(root, file);
    mkdirSync(join(fullPath, ".."), { recursive: true });
    writeFileSync(fullPath, "");
  }

  return root;
}

function dirExists(dirPath: string): boolean {
  try {
    return statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function fileExists(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}
