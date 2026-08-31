import { readdirSync } from "node:fs";

export function readDirSorted(absPath: string) {
  const items = readdirSync(absPath, { withFileTypes: true });

  const directories = [];
  const files = [];

  for (const item of items) {
    if (item.isDirectory()) {
      directories.push(item.name);
    } else {
      files.push(item.name);
    }
  }

  directories.sort((a, b) => a.localeCompare(b));
  files.sort((a, b) => a.localeCompare(b));

  return { directories, files };
}
