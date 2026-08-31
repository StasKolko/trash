import type { ConfigFile } from "./_collect-config-files";

import { posix } from "node:path";

const EXTENSION_REGEX = /\.[^.]+$/;

function buildExports({
  configFiles,
  srcDir,
}: {
  configFiles: ConfigFile[];
  srcDir: string;
}): Record<string, string> {
  const entries = configFiles.map((file) => {
    const exportKey = toExportKey(file.relativePath);
    const exportValue = toExportValue({
      srcDir,
      relativePath: file.relativePath,
    });
    return [exportKey, exportValue] as const;
  });

  return Object.fromEntries(entries);
}

function toExportKey(relativePath: string): string {
  const withoutExtension = relativePath.replace(EXTENSION_REGEX, "");
  return `./${withoutExtension}`;
}

function toExportValue({
  srcDir,
  relativePath,
}: {
  srcDir: string;
  relativePath: string;
}): string {
  return `./${posix.join(srcDir, relativePath)}`;
}

export { buildExports };
