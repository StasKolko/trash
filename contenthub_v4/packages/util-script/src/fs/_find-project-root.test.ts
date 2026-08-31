import { accessSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { AppError } from "@packages/util-shared/error";

import {
  findProjectRoot,
  PROJECT_ROOT_MARKER,
  ProjectRootNotFoundError,
} from "./_find-project-root";

vi.mock("node:fs", () => ({ accessSync: vi.fn() }));

const accessSyncMock = vi.mocked(accessSync);

const START_DIR = dirname(fileURLToPath(import.meta.url));

describe("findProjectRoot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the start dir when the marker lives right there", () => {
    markerAt(START_DIR);

    expect(findProjectRoot()).toBe(START_DIR);
  });

  it("walks up until it finds the marker in an ancestor dir", () => {
    const ancestor = dirname(dirname(START_DIR));
    markerAt(ancestor);

    expect(findProjectRoot()).toBe(ancestor);
  });

  it("throws ProjectRootNotFoundError when reaching the filesystem boundary", () => {
    markerAt(null);

    expect(() => findProjectRoot()).toThrow(ProjectRootNotFoundError);
  });

  it("exposes the start dir and marker in the error context", () => {
    markerAt(null);

    const error = captureError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.kind).toBe("project_root_not_found");
    expect(error.context).toEqual({
      startDir: START_DIR,
      marker: PROJECT_ROOT_MARKER,
    });
  });
});

function markerAt(markerDir: string | null) {
  const markerPath =
    markerDir === null ? null : join(markerDir, PROJECT_ROOT_MARKER);

  accessSyncMock.mockImplementation((path) => {
    if (path === markerPath) {
      return;
    }
    throw new Error("ENOENT");
  });
}

function captureError(): AppError {
  try {
    findProjectRoot();
  } catch (error) {
    return error as AppError;
  }

  throw new Error("Expected findProjectRoot to throw");
}
