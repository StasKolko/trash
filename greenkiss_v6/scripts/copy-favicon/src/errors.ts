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
