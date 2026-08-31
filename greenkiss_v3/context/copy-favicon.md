scripts\copy-favicon\.prettierignore

```
# Dependencies
node_modules

# Cache
.turbo
```

scripts\copy-favicon\eslint.config.js

```
import { backend } from "@configs/eslint/backend";

export default backend;

```

scripts\copy-favicon\package.json

```
{
  "name": "@scripts/copy-favicon",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "format": "prettier . --write",
    "lint": "eslint . --fix",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@configs/typescript": "workspace:*",
    "@configs/eslint": "workspace:*"
  }
}

```

scripts\copy-favicon\src\copy-favicon.ts

```
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
}

```

scripts\copy-favicon\src\errors.ts

```
export class CopyFaviconError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly hint?: string;
  readonly script = "copy-favicon";
  override cause?: unknown;

  constructor(
    message: string,
    options: {
      code?: string;
      cause?: unknown;
      details?: Record<string, unknown>;
      hint?: string;
    } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "CopyFaviconError";
    this.code = options.code ?? "COPY_FAVICON_ERROR";
    this.details = options.details;
    this.hint = options.hint;
    this.cause = options.cause;

    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

/**
 * Safe helpers to introspect NodeJS errno errors without using any.
 */
export function getErrnoCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const maybe = err as { code?: unknown };
  return typeof maybe.code === "string" ? maybe.code : undefined;
}

export function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  if (typeof err !== "object" || err === null) return false;
  const e = err as Partial<NodeJS.ErrnoException>;
  return typeof e.message === "string";
}

/**
 * Generic, reusable errors (more composable than very specific classes)
 */

export class DirectoryNotFoundError extends CopyFaviconError {
  constructor(
    path: string,
    kind: "source" | "output" | "scan" | "dest",
    cause?: unknown,
  ) {
    super(`Directory not found: ${path}`, {
      code: "COPY_FAVICON_DIR_NOT_FOUND",
      cause,
      details: { path, kind },
      hint: "Ensure the directory exists and the path is correct.",
    });
  }
}

export class PathNotDirectoryError extends CopyFaviconError {
  constructor(
    path: string,
    kind: "source" | "output" | "scan",
    cause?: unknown,
  ) {
    super(`Path is not a directory: ${path}`, {
      code: "COPY_FAVICON_NOT_A_DIRECTORY",
      cause,
      details: { path, kind },
      hint: "Provide a valid directory path.",
    });
  }
}

export class DirectoryPermissionError extends CopyFaviconError {
  constructor(path: string, op: "read" | "traverse", cause?: unknown) {
    super(`Permission denied while accessing directory: ${path}`, {
      code: "COPY_FAVICON_DIR_PERMISSION_DENIED",
      cause,
      details: { path, op },
      hint: "Check filesystem permissions or run with sufficient privileges.",
    });
  }
}

export class DirectoryReadError extends CopyFaviconError {
  constructor(path: string, cause?: unknown) {
    super(`Failed to read directory: ${path}`, {
      code: "COPY_FAVICON_DIR_READ_ERROR",
      cause,
      details: { path },
      hint: "Re-run with verbose logging to inspect the cause.",
    });
  }
}

export class FilePermissionError extends CopyFaviconError {
  constructor(
    src: string,
    dest: string,
    op: "copy" | "read" | "write",
    cause?: unknown,
  ) {
    super(`Permission denied while performing '${op}'`, {
      code: "COPY_FAVICON_FILE_PERMISSION_DENIED",
      cause,
      details: { src, dest, op },
      hint: "Check file and directory permissions.",
    });
  }
}

export class FileCopyIOError extends CopyFaviconError {
  constructor(src: string, dest: string, cause?: unknown) {
    super(`Failed to copy file from ${src} to ${dest}`, {
      code: "COPY_FAVICON_COPY_ERROR",
      cause,
      details: { src, dest },
      hint: "Inspect the underlying error and retry.",
    });
  }
}

export class NoFaviconFoundError extends CopyFaviconError {
  constructor(rootDir: string) {
    super(`No favicon files found in: ${rootDir}`, {
      code: "COPY_FAVICON_NOT_FOUND",
      details: { rootDir },
      hint: "Add a favicon file (e.g., favicon.ico, favicon.png) or adjust ignoreDirs.",
    });
  }
}

export class MultipleFaviconsFoundError extends CopyFaviconError {
  constructor(paths: string[]) {
    super("Multiple favicon files found. Ambiguous selection.", {
      code: "COPY_FAVICON_MULTIPLE_FOUND",
      details: { candidates: paths },
      hint: "Keep only a single favicon file or refine your search (ignoreDirs).",
    });
  }
}

export class UnsupportedFaviconExtensionError extends CopyFaviconError {
  constructor(ext: string, allowed: string[], filePath: string) {
    super(`Unsupported favicon extension: .${ext}`, {
      code: "COPY_FAVICON_UNSUPPORTED_EXTENSION",
      details: { extension: ext, allowedExtensions: allowed, filePath },
      hint: `Use one of the allowed extensions: ${allowed.join(", ")}`,
    });
  }
}

```

scripts\copy-favicon\src\index.ts

```
import { dirname, resolve } from "node:path";
import { copyFavicon } from "./copy-favicon";
import { CopyFaviconError } from "./errors";

const { SOURCE, OUTPUT, EXTENSIONS } = process.env;

if (!SOURCE || !OUTPUT || !EXTENSIONS) {
  console.error("❌ Missing required environment variables: SOURCE, OUTPUT, EXTENSIONS");
  process.exit(1);
}

const __filename = Bun.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "../../../");

const sourceDir = resolve(rootDir, SOURCE);
const outputDir = resolve(rootDir, OUTPUT);
const allowedExtensions = EXTENSIONS.split(",").map(ext => ext.trim());

try {
  copyFavicon({
    outputDir,
    sourceDir,
    logLevel: "standard",
    allowedExtensions,
    ignoreDirs: ["node_modules", ".turbo", "dist"],
  });
} catch (err) {
  if (err instanceof CopyFaviconError) {
    console.error(`❌ ${err.toString()}`);
    if (err.hint) {
      console.error(`💡 Hint: ${err.hint}`);
    }
    if (err.details) {
      console.error("ℹ️ Details:", err.details);
    }
  } else {
    console.error("❌ Unexpected error:", err);
  }
  process.exitCode = 1;
}

```

scripts\copy-favicon\src\scan-directory.ts

```
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

```

scripts\copy-favicon\tsconfig.json

```
{
  "extends": "@configs/typescript/backend",
  "include": ["src/**/*"]
}

```