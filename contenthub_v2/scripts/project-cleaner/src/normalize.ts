import type { CleanerConfig, CleanTargets, NormalizedConfig } from "./type";

import {
  InvalidDirNameError,
  InvalidExtensionError,
  InvalidFileNameError,
} from "./error";

const PATH_SEPARATOR_REGEX = /[/\\]/;

function normalizeConfig(config: CleanerConfig): NormalizedConfig {
  return {
    ignore: normalizeTargets(config.ignore),
    remove: normalizeTargets(config.remove),
  };
}

function normalizeTargets(targets: CleanTargets): NormalizedConfig["ignore"] {
  return {
    dirs: new Set(targets.dirs.map(validateDirName)),
    files: new Set(targets.files.map(validateFileName)),
    extensions: new Set(targets.extensions.map(validateExtension)),
  };
}

function validateDirName(value: string): string {
  assertNotEmpty(value, throwDir);
  assertNoSeparators(value, throwDir);
  return value;
}

function validateFileName(value: string): string {
  assertNotEmpty(value, throwFile);
  assertNoSeparators(value, throwFile);

  if (
    value.startsWith(".")
    && !value.includes(".", 1)
    && (value === "." || value === "..")
  ) {
    throwFile(value, "reserved name");
  }

  return value;
}

function validateExtension(value: string): string {
  assertNotEmpty(value, throwExt);

  if (!value.startsWith(".")) {
    throwExt(value, "must start with a dot, e.g. '.png'");
  }

  if (value.length < 2) {
    throwExt(value, "extension is empty after the dot");
  }

  if (PATH_SEPARATOR_REGEX.test(value)) {
    throwExt(value, "must not contain path separators");
  }

  if (value.includes(".", 1)) {
    throwExt(value, "must contain exactly one leading dot");
  }

  return value;
}

function assertNotEmpty(
  value: string,
  fail: (v: string, reason: string) => never,
): void {
  if (value.trim().length === 0) {
    fail(value, "must not be empty");
  }
}

function assertNoSeparators(
  value: string,
  fail: (v: string, reason: string) => never,
): void {
  if (PATH_SEPARATOR_REGEX.test(value)) {
    fail(value, "must not contain path separators ('/' or '\\')");
  }
}

function throwDir(value: string, reason: string): never {
  throw new InvalidDirNameError({ value, reason });
}

function throwFile(value: string, reason: string): never {
  throw new InvalidFileNameError({ value, reason });
}

function throwExt(value: string, reason: string): never {
  throw new InvalidExtensionError({ value, reason });
}

export { normalizeConfig };
