import type { JsonFormat } from "./_type";

function createNewline({ lineEnding }: JsonFormat): string {
  return lineEnding === "crlf" ? "\r\n" : "\n";
}

function createIndentUnit({ indentStyle, indentWidth }: JsonFormat): string {
  const char = indentStyle === "tab" ? "\t" : " ";
  return char.repeat(indentWidth);
}

function createIndent(format: JsonFormat, depth: number): string {
  return createIndentUnit(format).repeat(depth);
}

export { createIndent, createIndentUnit, createNewline };
