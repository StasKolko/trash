import { readFile, writeFile } from "node:fs/promises";

import {
  HEAD_OPEN_TAG,
  SCRIPT_CLOSE_TAG,
  SCRIPT_MARKER,
  SCRIPT_OPEN_TAG,
  TITLE_CLOSE_TAG,
} from "./constant";
import { generateThemeScript } from "./generate";

type InjectContext = {
  content: string;
  script: string;
  indent: string;
  filePath: string;
};

async function injectThemeScript(
  filePath: string,
  defaultTheme: string,
  storageKey: string,
): Promise<void> {
  const content = await readFile(filePath, "utf-8");
  const indent = detectIndent(content, filePath);
  const innerIndent = indent + indent;
  const script = generateThemeScript(defaultTheme, storageKey, innerIndent);
  const updated = injectOrReplace({ content, script, indent, filePath });
  await writeFile(filePath, updated, "utf-8");
}

function detectIndent(content: string, filePath: string): string {
  const headIndex = content.indexOf(HEAD_OPEN_TAG);

  if (headIndex === -1) {
    throw new Error(`<head> tag not found in: ${filePath}`);
  }

  const lineStart = content.lastIndexOf("\n", headIndex);
  const indent = content.slice(lineStart + 1, headIndex);

  return indent;
}

function injectOrReplace(ctx: InjectContext): string {
  const markerIndex = ctx.content.indexOf(SCRIPT_MARKER);

  if (markerIndex !== -1) {
    return replaceExistingScript(ctx, markerIndex);
  }

  return insertAfterTitle(ctx);
}

function replaceExistingScript(
  ctx: InjectContext,
  markerIndex: number,
): string {
  const openTagIndex = ctx.content.lastIndexOf(SCRIPT_OPEN_TAG, markerIndex);
  const closeTagIndex = ctx.content.indexOf(SCRIPT_CLOSE_TAG, markerIndex);

  const before = ctx.content.slice(0, openTagIndex + SCRIPT_OPEN_TAG.length);
  const after = ctx.content.slice(closeTagIndex);

  return `${before}\n${ctx.script}\n${ctx.indent}${after}`;
}

function insertAfterTitle(ctx: InjectContext): string {
  const titleCloseIndex = ctx.content.indexOf(TITLE_CLOSE_TAG);

  if (titleCloseIndex === -1) {
    throw new Error(
      `Neither theme script marker nor ${TITLE_CLOSE_TAG} found in: ${ctx.filePath}`,
    );
  }

  const insertPosition = titleCloseIndex + TITLE_CLOSE_TAG.length;
  const before = ctx.content.slice(0, insertPosition);
  const after = ctx.content.slice(insertPosition);

  const scriptBlock = `\n${ctx.indent}${SCRIPT_OPEN_TAG}\n${ctx.script}\n${ctx.indent}${SCRIPT_CLOSE_TAG}`;

  return `${before}${scriptBlock}${after}`;
}

export { injectThemeScript };
