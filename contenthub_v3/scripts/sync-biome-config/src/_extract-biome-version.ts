import { AppError } from "@packages/util-shared/error";
import { is } from "@packages/util-shared/guard";

import { getConfig } from "./_config";
import { findPropertyValueBounds } from "./_json";

function extractBiomeVersion() {
  const { biomePackageName, content: { rootPackage } } = getConfig();

  const { startIndex, endIndex } = findPropertyValueBounds({
    content: rootPackage,
    property: biomePackageName,
  });

  const rawValue = rootPackage.slice(startIndex + 1, endIndex - 1);

  const major = readNumberBounds( rawValue,  0 );
  const minor = readNumberBounds( rawValue,  major.end );
  const patch = readNumberBounds( rawValue,  minor.end );

  return [major, minor, patch]
    .map(({ start, end }) => rawValue.slice(start, end))
    .join(".");
}

function readNumberBounds(content: string, startIndex: number) {
  let start = -1;

  for (let i = startIndex; i < content.length; i++) {
    if (start === -1) {
      if (is.digit(content[i])) {
        start = i;
      }
    } else if (is.not.digit(content[i])) {
      return { start, end: i };
    }
  }

  if (start === -1) {
    throw new BiomeVersionParseError(startIndex);
  }

  return { start, end: content.length };
}

class BiomeVersionParseError extends AppError {
  public constructor(startIndex: number) {
    super({
      kind: "biome_version_parse_error",
      message: "Biome version could not be parsed: no digit found after index",
      context: { startIndex },
    });
  }
}

export { BiomeVersionParseError, extractBiomeVersion };