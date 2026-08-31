import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { findProjectRoot, normalizePath } from "../path";

describe("findProjectRoot", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  it("finds root when marker is in startDir", () => {
    const root = createTrackedDir(dirs);
    writeFileSync(join(root, "bun.lock"), "");

    const result = findProjectRoot({ startDir: root });

    expect(result).toBe(root);
  });

  it("finds root by traversing parent directories", () => {
    const root = createTrackedDir(dirs);
    const nested = join(root, "a", "b", "c");
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(root, "bun.lock"), "");

    const result = findProjectRoot({ startDir: nested });

    expect(result).toBe(root);
  });

  it("uses custom marker file", () => {
    const root = createTrackedDir(dirs);
    writeFileSync(join(root, "pnpm-lock.yaml"), "");

    const result = findProjectRoot({
      startDir: root,
      markerFile: "pnpm-lock.yaml",
    });

    expect(result).toBe(root);
  });

  it("throws when marker file not found", () => {
    const root = createTrackedDir(dirs);

    expect(() =>
      findProjectRoot({
        startDir: root,
        markerFile: "nonexistent.marker",
      }),
    ).toThrow("Project root not found");
  });

  it("throws with descriptive message including markerFile", () => {
    const root = createTrackedDir(dirs);

    expect(() =>
      findProjectRoot({
        startDir: root,
        markerFile: "missing.lock",
      }),
    ).toThrow("missing.lock");
  });
});

describe("normalizePath", () => {
  it("converts backslashes to forward slashes", () => {
    expect(normalizePath("packages\\a\\node_modules")).toBe(
      "packages/a/node_modules",
    );
  });

  it("keeps forward slashes unchanged", () => {
    expect(normalizePath("packages/a/node_modules")).toBe(
      "packages/a/node_modules",
    );
  });

  it("handles mixed slashes", () => {
    expect(normalizePath("packages\\a/node_modules\\dep")).toBe(
      "packages/a/node_modules/dep",
    );
  });

  it("handles empty string", () => {
    expect(normalizePath("")).toBe("");
  });

  it("handles single segment", () => {
    expect(normalizePath("node_modules")).toBe("node_modules");
  });
});

// --- Helpers ---

function createTrackedDir(dirs: string[]): string {
  const dir = join(
    tmpdir(),
    `path-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  dirs.push(dir);
  return dir;
}
