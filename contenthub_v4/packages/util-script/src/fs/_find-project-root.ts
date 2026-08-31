import { accessSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { AppError } from "@packages/util-shared/error";

const PROJECT_ROOT_MARKER = "bun.lock";

function findProjectRoot() {
  const currentFilePath = fileURLToPath(import.meta.url);
  const startDir = dirname(currentFilePath);

  function resolveRoot(current: string) {
    if (hasMarker(current)) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current) {
      throw new ProjectRootNotFoundError(startDir);
    }

    return resolveRoot(parent);
  }

  return resolveRoot(startDir);
}

function hasMarker(dir: string) {
  try {
    const markerPath = join(dir, PROJECT_ROOT_MARKER);
    accessSync(markerPath);

    return true;
  } catch {
    return false;
  }
}

class ProjectRootNotFoundError extends AppError {
  public constructor(startDir: string) {
    super({
      kind: "project_root_not_found",
      message: "Project root not found: reached filesystem boundary",
      context: {
        startDir,
        marker: PROJECT_ROOT_MARKER,
      },
    });
  }
}

export { findProjectRoot, PROJECT_ROOT_MARKER, ProjectRootNotFoundError };
