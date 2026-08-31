import { accessSync, constants } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";

type FindProjectRootOptions = {
  startDir: string;
  markerFile: string;
};

const FIND_PROJECT_ROOT_OPTIONS_DEFAULT: FindProjectRootOptions = {
  startDir: cwd(),
  markerFile: "bun.lock",
};

function findProjectRoot(options: Partial<FindProjectRootOptions> = {}) {
  const { startDir, markerFile } = {
    ...FIND_PROJECT_ROOT_OPTIONS_DEFAULT,
    ...options,
  };

  let dir = path.resolve(startDir);

  while (true) {
    if (hasMarkerFile({ dir, markerFile })) {
      return dir;
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      break;
    }

    dir = parent;
  }

  throw new Error(
    `Project root not found. Start: "${startDir}". Marker file: "${markerFile}"`,
  );
}

function hasMarkerFile(params: { dir: string; markerFile: string }) {
  try {
    accessSync(path.join(params.dir, params.markerFile), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function normalizePath(filePath: string) {
  return filePath.replaceAll("\\", "/");
}

export { findProjectRoot, normalizePath };
