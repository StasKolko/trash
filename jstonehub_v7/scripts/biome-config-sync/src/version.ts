import { readFile } from "node:fs/promises";

import { BIOME_PACKAGE_NAME, BIOME_VERSION_REGEX } from "./constant";

async function extractBiomeVersion(rootPackageJsonPath: string) {
  const content = await readFile(rootPackageJsonPath, "utf8");

  const packageNameIndex = findPackageNameIndex({
    content,
    filePath: rootPackageJsonPath,
  });
  const colonIndex = findColonAfterPackageName({
    content,
    packageNameIndex,
    filePath: rootPackageJsonPath,
  });
  const versionSegment = extractVersionSegment(content, colonIndex);

  return parseVersion({
    segment: versionSegment,
    filePath: rootPackageJsonPath,
  });
}

function findPackageNameIndex(params: { content: string; filePath: string }) {
  const { content, filePath } = params;
  const index = content.indexOf(`"${BIOME_PACKAGE_NAME}"`);

  if (index === -1) {
    throw new Error(`"${BIOME_PACKAGE_NAME}" not found in: ${filePath}`);
  }

  return index;
}

function findColonAfterPackageName(params: {
  content: string;
  packageNameIndex: number;
  filePath: string;
}) {
  const { content, packageNameIndex, filePath } = params;
  const index = content.indexOf(":", packageNameIndex);

  if (index === -1) {
    throw new Error(
      `Missing ":" after "${BIOME_PACKAGE_NAME}" in: ${filePath}`,
    );
  }

  return index;
}

function extractVersionSegment(content: string, colonIndex: number) {
  const lineEnd = content.indexOf("\n", colonIndex);
  const searchEnd = lineEnd === -1 ? content.length : lineEnd;
  return content.slice(colonIndex + 1, searchEnd);
}

function parseVersion(params: { segment: string; filePath: string }) {
  const { segment, filePath } = params;
  const match = segment.match(BIOME_VERSION_REGEX);

  if (!match) {
    throw new Error(
      `Failed to extract version for "${BIOME_PACKAGE_NAME}" in: ${filePath}`,
    );
  }

  return match[0];
}

export { extractBiomeVersion };
