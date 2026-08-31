import { readdirSync } from "fs";
import { join, parse } from "path";
import {
  CopyFaviconError,
  DirectoryNotFoundError,
  DirectoryPermissionError,
  DirectoryReadError,
  PathNotDirectoryError,
  getErrnoCode,
} from "./errors";

export type ScanResult = {
  faviconPaths: string[];
  dirCount: number;
  fileCount: number;
  scannedDirs: string[];
};

export function scanDirectory(
  dirPath: string,
  ignoreDirs: string[],
  result: ScanResult,
): void {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (ignoreDirs.includes(entry.name)) continue;

        result.dirCount++;
        result.scannedDirs.push(fullPath);

        scanDirectory(fullPath, ignoreDirs, result);
      } else if (entry.isFile()) {
        result.fileCount++;

        const fileNameWithoutExt = parse(entry.name).name.toLowerCase();
        if (fileNameWithoutExt === "favicon") {
          result.faviconPaths.push(fullPath);
        }
      }
    }
  } catch (error) {
    if (error instanceof CopyFaviconError) {
      throw error;
    }

    const code = getErrnoCode(error);

    switch (code) {
      case "ENOENT":
        throw new DirectoryNotFoundError(dirPath, "scan", error);
      case "EACCES":
      case "EPERM":
        throw new DirectoryPermissionError(dirPath, "read", error);
      case "ENOTDIR":
        throw new PathNotDirectoryError(dirPath, "scan", error);
      default:
        throw new DirectoryReadError(dirPath, error);
    }
  }
}
