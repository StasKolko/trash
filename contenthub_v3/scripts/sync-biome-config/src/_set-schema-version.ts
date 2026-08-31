import { findPropertyValueBounds } from "./_json";

const SCHEMA_PROPERTY = "$schema";

function setSchemaVersion({
  content,
  version,
}: {
  content: string;
  version: string;
}): string {
  const { startIndex, endIndex } = findPropertyValueBounds({
    content,
    property: SCHEMA_PROPERTY,
  });

  const schemaValue = buildSchemaValue(version);
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex);

  return `${before}"${schemaValue}"${after}`;
}

function buildSchemaValue(version: string): string {
  return `https://biomejs.dev/schemas/${version}/schema.json`;
}

export { setSchemaVersion };
