import type { JsonFormat } from "./_type";

import { findPropertyValueBounds } from "./_json";
import { createIndent, createNewline } from "./_json-format";

const EXTENDS_PROPERTY = "extends";
const LEADING_DOT_SLASH_REGEX = /^\.\//;

function setBiomeExtends({
  content,
  workspaceName,
  exportKeys,
  format,
}: {
  content: string;
  workspaceName: string;
  exportKeys: string[];
  format: JsonFormat;
}): string {
  const { startIndex, endIndex } = findPropertyValueBounds({
    content,
    property: EXTENDS_PROPERTY,
  });

  const serialized = serializeExtends({ workspaceName, exportKeys, format });
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex);

  return `${before}${serialized}${after}`;
}

function serializeExtends({
  workspaceName,
  exportKeys,
  format,
}: {
  workspaceName: string;
  exportKeys: string[];
  format: JsonFormat;
}): string {
  if (exportKeys.length === 0) {
    return "[]";
  }

  const newline = createNewline(format);
  const entryIndent = createIndent(format, 1);
  const closingIndent = createIndent(format, 0);

  const lines = exportKeys.map((key) => {
    const specifier = toSpecifier({ workspaceName, exportKey: key });
    return `${entryIndent}"${specifier}"`;
  });

  return `[${newline}${lines.join(`,${newline}`)}${newline}${closingIndent}]`;
}

function toSpecifier({
  workspaceName,
  exportKey,
}: {
  workspaceName: string;
  exportKey: string;
}): string {
  const withoutDot = exportKey.replace(LEADING_DOT_SLASH_REGEX, "");
  return `${workspaceName}/${withoutDot}`;
}

export { setBiomeExtends };
