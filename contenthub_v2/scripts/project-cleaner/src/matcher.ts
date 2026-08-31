import type { Dirent } from "node:fs";

import type { NormalizedConfig } from "./type";

import { extname } from "node:path";

function isIgnored(entry: Dirent, config: NormalizedConfig): boolean {
  const { ignore } = config;

  if (entry.isDirectory()) {
    return ignore.dirs.has(entry.name);
  }

  return (
    ignore.files.has(entry.name) || ignore.extensions.has(extname(entry.name))
  );
}

function shouldRemove(entry: Dirent, config: NormalizedConfig): boolean {
  const { remove } = config;

  if (entry.isDirectory()) {
    return remove.dirs.has(entry.name);
  }

  return (
    remove.files.has(entry.name) || remove.extensions.has(extname(entry.name))
  );
}

export { isIgnored, shouldRemove };
