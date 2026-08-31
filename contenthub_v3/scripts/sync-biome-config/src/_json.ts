import { AppError } from "@packages/util-shared/error";

const QUOTE = '"';
const BACKSLASH = "\\";

const BRACKETS = {
  "[": "]",
  "{": "}",
} as const;

type OpenBracket = keyof typeof BRACKETS;

type BracketState = {
  depth: number;
  insideString: boolean;
  endIndex: number;
};

function findPropertyValueBounds({
  content,
  property,
}: {
  content: string;
  property: string;
}) {
  const propertyEndIndex = findPropertyEndIndex({ content, property });
  const valueStartIndex = findValueStartIndex({
    content,
    startIndex: propertyEndIndex,
    property,
  });

  const valueChar = content[valueStartIndex];

  if (valueChar === QUOTE) {
    return readStringBounds({ content, startIndex: valueStartIndex, property });
  }

  if (isOpenBracket(valueChar)) {
    return readBracketBounds({
      content,
      startIndex: valueStartIndex,
      open: valueChar,
      property,
    });
  }

  throw new PropertyValueNotFoundError(property);
}

function findPropertyEndIndex({
  content,
  property,
}: {
  content: string;
  property: string;
}) {
  const marker = `"${property}":`;
  const startIndex = content.indexOf(marker);

  if (startIndex === -1) {
    throw new PropertyNotFoundError(property);
  }

  return startIndex + marker.length;
}

function findValueStartIndex({
  content,
  startIndex,
  property,
}: {
  content: string;
  startIndex: number;
  property: string;
}) {
  let i = startIndex;

  while (i < content.length) {
    if (!isWhitespace(content[i])) {
      return i;
    }

    i += 1;
  }

  throw new PropertyValueNotFoundError(property);
}

function readStringBounds({
  content,
  startIndex,
  property,
}: {
  content: string;
  startIndex: number;
  property: string;
}) {
  let i = startIndex + 1;

  while (i < content.length) {
    const char = content[i];

    if (char === BACKSLASH) {
      i += 2;
    } else if (char === QUOTE) {
      return { startIndex, endIndex: i + 1 };
    } else {
      i += 1;
    }
  }

  throw new PropertyValueNotFoundError(property);
}

function readBracketBounds({
  content,
  startIndex,
  open,
  property,
}: {
  content: string;
  startIndex: number;
  open: OpenBracket;
  property: string;
}) {
  const close = BRACKETS[open];

  let state: BracketState = { depth: 0, insideString: false, endIndex: -1 };
  let i = startIndex;

  while (i < content.length && state.endIndex === -1) {
    state = advanceBracketState({
      state,
      char: content[i],
      index: i,
      open,
      close,
    });
    i = nextIndex({
      char: content[i],
      insideString: state.insideString,
      index: i,
    });
  }

  if (state.endIndex === -1) {
    throw new PropertyValueNotFoundError(property);
  }

  return { startIndex, endIndex: state.endIndex };
}

function advanceBracketState({
  state,
  char,
  index,
  open,
  close,
}: {
  state: BracketState;
  char: string | undefined;
  index: number;
  open: OpenBracket;
  close: string;
}) {
  if (state.insideString) {
    return advanceInsideString({ state, char });
  }

  return advanceOutsideString({ state, char, index, open, close });
}

function advanceInsideString({
  state,
  char,
}: {
  state: BracketState;
  char: string | undefined;
}) {
  if (char === BACKSLASH) {
    return state;
  }

  if (char === QUOTE) {
    return { ...state, insideString: false };
  }

  return state;
}

function advanceOutsideString({
  state,
  char,
  index,
  open,
  close,
}: {
  state: BracketState;
  char: string | undefined;
  index: number;
  open: OpenBracket;
  close: string;
}) {
  if (char === QUOTE) {
    return { ...state, insideString: true };
  }

  if (char === open) {
    return { ...state, depth: state.depth + 1 };
  }

  if (char === close) {
    const depth = state.depth - 1;
    return {
      ...state,
      depth,
      endIndex: depth === 0 ? index + 1 : state.endIndex,
    };
  }

  return state;
}

function nextIndex({
  char,
  insideString,
  index,
}: {
  char: string | undefined;
  insideString: boolean;
  index: number;
}) {
  if (insideString && char === BACKSLASH) {
    return index + 2;
  }

  return index + 1;
}

function isOpenBracket(char: string | undefined): char is OpenBracket {
  return char === "[" || char === "{";
}

function isWhitespace(char: string | undefined) {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
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
