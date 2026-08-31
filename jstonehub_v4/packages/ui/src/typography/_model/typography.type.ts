import type { JSX } from "solid-js";

import type { SemanticVariant } from "../../_model/type";

type TypographyProps = {
  "data-testid"?: string;
  id?: string;
  variant?: TypographyVariant;
  class?: string;
  children: JSX.Element;
};

type TextProps = TypographyProps & {
  level: TypographyLevel;
};

type TypographyLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TypographyVariant = "foreground" | SemanticVariant;

export type { TextProps, TypographyLevel, TypographyProps, TypographyVariant };
