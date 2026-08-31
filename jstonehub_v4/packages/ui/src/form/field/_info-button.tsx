import type { JSX } from "solid-js";

import { Info } from "lucide-solid";

import { IconButton } from "../../action/button/button";
import { Tooltip } from "../../overlay/tooltip/tooltip";
import { INFO_BUTTON_ICON_SIZE, INFO_BUTTON_STYLE } from "./_info-button.style";

export function InfoButton(props: { content: JSX.Element }) {
  return (
    <Tooltip
      label={props.content}
      side="top"
      trigger={(triggerProps) => (
        <IconButton
          variant="ghost"
          size="sm"
          class={INFO_BUTTON_STYLE}
          aria-label="More information"
          // v8 ignore start
          ref={triggerProps.ref}
          // v8 ignore end
          onMouseEnter={triggerProps.onMouseEnter}
          onMouseLeave={triggerProps.onMouseLeave}
          onFocus={triggerProps.onFocus}
          onBlur={triggerProps.onBlur}
        >
          <Info aria-hidden="true" size={INFO_BUTTON_ICON_SIZE} />
        </IconButton>
      )}
    />
  );
}
