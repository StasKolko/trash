import type { JsonFormat } from "./_type";

import { findPropertyValueBounds } from "./_json";
import { createIndent, createNewline } from "./_json-format";

const EXPORTS_PROPERTY = "exports";

function setPackageExports({
  content,
  exports,
  format,
}: {
  content: string;
  exports: Record<string, string>;
  format: JsonFormat;
}): string {
  const { startIndex, endIndex } = findPropertyValueBounds({
    content,
    property: EXPORTS_PROPERTY,
  });

  const serialized = serializeExports({ exports, format });
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex);

  return `${before}${serialized}${after}`;
}

function serializeExports({
  exports,
  format,
}: {
  exports: Record<string, string>;
  format: JsonFormat;
}): string {
  const keys = Object.keys(exports);

  if (keys.length === 0) {
    return "{}";
  }

  const newline = createNewline(format);
  const entryIndent = createIndent(format, 2);
  const closingIndent = createIndent(format, 1);

  const lines = keys.map((key) => {
    const value = exports[key];
    return `${entryIndent}"${key}": "${value}"`;
  });

  return `{${newline}${lines.join(`,${newline}`)}${newline}${closingIndent}}`;
}

export { setPackageExports };
