import type { ConfigEntry } from "./type";

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  BIOME_SCHEMA_URL_PREFIX,
  BIOME_SCHEMA_URL_SUFFIX,
  SCHEMA_PROPERTY_NAME,
} from "./constant";

type SyncSchemaParams = {
  biomeJsonPath: string;
  configSrcDir: string;
  entries: ConfigEntry[];
  version: string;
};

async function syncSchema(params: SyncSchemaParams) {
  const { biomeJsonPath, configSrcDir, entries, version } = params;
  const schemaUrl = buildSchemaUrl(version);

  await replaceSchemaValue({ absolutePath: biomeJsonPath, schemaUrl });

  await Promise.all(
    entries.map((entry) => {
      const filePath = join(configSrcDir, entry.relativePath);
      return replaceSchemaValue({ absolutePath: filePath, schemaUrl });
    }),
  );
}

function buildSchemaUrl(version: string) {
  return `${BIOME_SCHEMA_URL_PREFIX}${version}${BIOME_SCHEMA_URL_SUFFIX}`;
}

async function replaceSchemaValue(params: {
  absolutePath: string;
  schemaUrl: string;
}) {
  const { absolutePath, schemaUrl } = params;
  const content = await readFile(absolutePath, "utf8");

  const propertyIndex = findPropertyIndex(content, absolutePath);
  const colonIndex = findColonIndex({
    content,
    propertyIndex,
    absolutePath,
  });
  const { openQuote, closeQuote } = findQuotedValue(content, colonIndex);

  assertValidQuotes({ openQuote, closeQuote, absolutePath });

  const updated =
    content.slice(0, openQuote + 1) + schemaUrl + content.slice(closeQuote);

  await writeFile(absolutePath, updated, "utf8");
}

function findPropertyIndex(content: string, absolutePath: string) {
  const propertyPattern = `"${SCHEMA_PROPERTY_NAME}"`;
  const index = content.indexOf(propertyPattern);

  if (index === -1) {
    throw new Error(
      `Property "${SCHEMA_PROPERTY_NAME}" not found in: ${absolutePath}`,
    );
  }

  return index;
}

function findColonIndex(params: {
  content: string;
  propertyIndex: number;
  absolutePath: string;
}) {
  const { content, propertyIndex, absolutePath } = params;
  const propertyPattern = `"${SCHEMA_PROPERTY_NAME}"`;
  const index = content.indexOf(":", propertyIndex + propertyPattern.length);

  if (index === -1) {
    throw new Error(
      `Missing ":" after "${SCHEMA_PROPERTY_NAME}" in: ${absolutePath}`,
    );
  }

  return index;
}

function assertValidQuotes(params: {
  openQuote: number;
  closeQuote: number;
  absolutePath: string;
}) {
  const { openQuote, closeQuote, absolutePath } = params;

  if (openQuote === -1 || closeQuote === -1) {
    throw new Error(
      `Cannot parse string value for "${SCHEMA_PROPERTY_NAME}" in: ${absolutePath}`,
    );
  }
}

function findQuotedValue(content: string, afterIndex: number) {
  let openQuote = -1;
  let closeQuote = -1;

  for (let i = afterIndex + 1; i < content.length; i++) {
    const char = content[i];

    if (char === '"') {
      if (openQuote !== -1) {
        closeQuote = i;
        break;
      }
      openQuote = i;
    } else if (char === "\n") {
      break;
    }
  }

  return { openQuote, closeQuote };
}

export { syncSchema };
