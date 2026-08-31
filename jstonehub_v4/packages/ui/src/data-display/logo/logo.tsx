import type { JSX } from "solid-js";

import {
  LOGO_BRAND,
  LOGO_ICON_CONTAINER,
  LOGO_LABEL,
  LOGO_LETTER,
  LOGO_ROOT,
  LOGO_SHINE,
  LOGO_TEXT_WRAPPER,
} from "./_logo.style";

const LOGO_BRAND_TEXT = "JStone";
const LOGO_LETTER_TEXT = "J";

function Logo(props: {
  "data-testid"?: string;
  appName: "admin" | "hub";
  children: (props: {
    "data-testid"?: string;
    class: string;
    children: JSX.Element;
  }) => JSX.Element;
}) {
  return props.children({
    "data-testid": props["data-testid"],
    class: LOGO_ROOT,
    children: (
      <>
        <span class={LOGO_ICON_CONTAINER}>
          <span class={LOGO_SHINE} />
          <span class={LOGO_LETTER}>{LOGO_LETTER_TEXT}</span>
        </span>

        <span class={LOGO_TEXT_WRAPPER}>
          <span class={LOGO_BRAND}>{LOGO_BRAND_TEXT}</span>
          <span class={LOGO_LABEL}>{props.appName}</span>
        </span>
      </>
    ),
  });
}

export { LOGO_BRAND_TEXT, LOGO_LETTER_TEXT, Logo };
