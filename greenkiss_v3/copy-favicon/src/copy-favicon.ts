import path from "path";
import fs from "fs";
import { existsSync, statSync } from "node:fs";
import * as errors from "./errors";

import { scanDirectory, ScanResult } from "./scan-directory";

export function copyFavicon({
  sourceDir,
  outputDir,
  logLevel,
  ignoreDirs,
  allowedExtensions,
}: {
  sourceDir: string;
  outputDir: string;
  logLevel: "standard" | "verbose";
  ignoreDirs: string[];
  allowedExtensions: string[];
}): string {
  validateDirectories({ sourceDir, outputDir });

  const scanResult: ScanResult = {
    faviconPaths: [],
    dirCount: 0,
    fileCount: 0,
    scannedDirs: [],
  };

  scanDirectory(sourceDir, ignoreDirs, scanResult);

  const faviconPath = getSingleFaviconPath(scanResult.faviconPaths, sourceDir);

  validateFaviconExtension(faviconPath, allowedExtensions);

  const fileName = path.basename(faviconPath);
  const destinationPath = path.join(outputDir, fileName);

  safeCopyFile(faviconPath, destinationPath);

  logFaviconCopyReport({
    scanResult,
    destinationPath,
    isVerbose: logLevel === "verbose",
  });

  return destinationPath;
}

function safeCopyFile(src: string, dest: string): void {
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    const code = errors.getErrnoCode(err);
    if (code === "EACCES" || code === "EPERM") {
      throw new errors.FilePermissionError(src, dest, "copy", err);
    }
    throw new errors.FileCopyIOError(src, dest, err);
  }
}

function getSingleFaviconPath(faviconPaths: string[], sourceDir: string) {
  if (faviconPaths.length === 0) {
    throw new errors.NoFaviconFoundError(sourceDir);
  }

  if (faviconPaths.length > 1) {
    throw new errors.MultipleFaviconsFoundError(faviconPaths);
  }

  return faviconPaths[0];
}

function validateDirectories({
  sourceDir,
  outputDir,
}: {
  sourceDir: string;
  outputDir: string;
}): void {
  // Source
  if (!existsSync(sourceDir)) {
    throw new errors.DirectoryNotFoundError(sourceDir, "source");
  }
  if (!statSync(sourceDir).isDirectory()) {
    throw new errors.PathNotDirectoryError(sourceDir, "source");
  }

  // Output
  if (!existsSync(outputDir)) {
    throw new errors.DirectoryNotFoundError(outputDir, "output");
  }
  if (!statSync(outputDir).isDirectory()) {
    throw new errors.PathNotDirectoryError(outputDir, "output");
  }
}

function validateFaviconExtension(
  filePath: string,
  allowedExtensions: string[],
): void {
  const normalizedAllowed = allowedExtensions.map((ext) =>
    ext.toLowerCase().replace(/^\./, ""),
  );
  const extension = path.extname(filePath).toLowerCase().replace(/^\./, "");

  if (!normalizedAllowed.includes(extension)) {
    throw new errors.UnsupportedFaviconExtensionError(
      extension,
      normalizedAllowed,
      filePath,
    );
  }
}

function logFaviconCopyReport({
  scanResult,
  destinationPath,
  isVerbose,
}: {
  scanResult: ScanResult;
  destinationPath: string;
  isVerbose: boolean;
}) {
  console.log("\n================================");
  console.log("✅ Favicon successfully copied!");
  console.log("================================");

  console.log("\n📊 Scan statistics:");
  console.log(`  • Directories scanned: ${scanResult.dirCount}`);
  console.log(`  • Files scanned: ${scanResult.fileCount}`);

  if (isVerbose) {
    console.log("\n📁 List of scanned directories:");
    scanResult.scannedDirs.forEach((dir, index) => {
      console.log(`  ${index + 1}. ${dir}`);
    });
  }

  console.log(`\n📍 File copied to: ${destinationPath}`);
  console.log("\n================================\n");
}
