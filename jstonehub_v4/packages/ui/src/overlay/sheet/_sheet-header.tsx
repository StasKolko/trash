import type { JSX } from "solid-js";

import { X } from "lucide-solid";

import { IconButton } from "../../action/button/button";
import { SHEET_HEADER_STYLE } from "./_sheet.style";

export function SheetHeader(props: {
  "data-testid"?: string;
  onClose: () => void;
  closeLabel: string;
  logo: JSX.Element;
}) {
  return (
    <header data-testid={props["data-testid"]} class={SHEET_HEADER_STYLE}>
      {props.logo}

      <IconButton
        variant="ghost"
        size="sm"
        class="text-subtle"
        aria-label={props.closeLabel}
        onClick={props.onClose}
      >
        <X aria-hidden="true" size={16} />
      </IconButton>
    </header>
  );
}
