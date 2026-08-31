import { AppError } from "@packages/util-shared/error";

function findPropertyValueBounds({
  content,
  property,
}: {
  content: string;
  property: string;
}) {
  const markerEnd = findPropertyMarkerEnd({ content, property });
  const startIndex = findValueStart({ content, markerEnd, property });
  const open = content[startIndex];

  let i = startIndex;

  if (isQuote(open)) {
    while (i < content.length) {
      i += 1;

      if (isQuote(content[i])) {
        return { startIndex, endIndex: i };
      }
      
      if (isBackslash(content[i])) {
        i += 1;
      }
    }
  }

  if (isOpenBracket(open)) {
    const close = getCloseBracket(open);
    let depth = 0;

    while (i < content.length) {
      if (isQuote(content[i])) {
        i += 1;

        while (i < content.length && !isQuote(content[i])) {
          if (isBackslash(content[i])) {
            i += 1;
          }
          i += 1;
        }
      }
      
      if (content[i] === open) {
        depth += 1;
      }

      if (content[i] === close) {
        depth -= 1;

        if (depth === 0) {
          return { startIndex, endIndex: i+1 };
        }
      }

      i += 1;
    }
  }

  throw new PropertyValueNotFoundError(property);
}

function findPropertyMarkerEnd({
  content,
  property,
}: {
  content: string;
  property: string;
}) {
  const marker = `"${property}":`;
  const index = content.indexOf(marker);

  if (index === -1) {
    throw new PropertyNotFoundError(property);
  }

  return index + marker.length;
}

function findValueStart({
  content,
  markerEnd,
  property,
}: {
  content: string;
  markerEnd: number;
  property: string;
}) {
  let i = markerEnd;

  while (i < content.length && isWhitespace(content[i])) {
    i += 1;
  }

  if (i === content.length) {
    throw new PropertyValueNotFoundError(property);
  }

  return i;
}

function isWhitespace(char: unknown) {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

function isOpenBracket(char: unknown) {
  return char === "[" || char === "{";
}

function isBackslash(char: unknown) {
  return char === "\\";
}

function isQuote(char: unknown) {
  return char === '"';
}

function getCloseBracket(open: string) {
  return open === "[" ? "]" : "}";
}

class PropertyNotFoundError extends AppError {
  public constructor(property: string) {
    super({
      kind: "property_not_found",
      message: "Property not found in JSON content",
      context: { property },
    });
  }
}

class PropertyValueNotFoundError extends AppError {
  public constructor(property: string) {
    super({
      kind: "property_value_not_found",
      message: "Property value not found: could not resolve value bounds",
      context: { property },
    });
  }
}

export {
  findPropertyValueBounds,
  PropertyNotFoundError,
  PropertyValueNotFoundError,
};
