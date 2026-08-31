import type { SidebarLinkItem } from "./content-shell.type";

import { cn } from "@packages/util/css";

import { Tooltip } from "../../overlay/tooltip/tooltip";
import { useBreakpoint } from "../breakpoint/breakpoint.provider";
import { SIDEBAR_ICON_SIZE_DEFAULT } from "./_sidebar.constant";
import {
  SIDEBAR_ICON_STYLE,
  SIDEBAR_LABEL_HIDDEN_STYLE,
  SIDEBAR_LABEL_STYLE,
  SIDEBAR_LABEL_VISIBLE_STYLE,
  SIDEBAR_LINK_COLLAPSED_STYLE,
  SIDEBAR_LINK_ROOT_STYLE,
} from "./_sidebar.style";
import { useSidebar } from "./sidebar.provider";

export function SidebarLink(props: { item: SidebarLinkItem }) {
  const sb = useSidebar();
  const bp = useBreakpoint();

  const isVisuallyExpanded = () => sb.expanded() || bp.isMobile();
  const tooltipDisabled = () => isVisuallyExpanded();

  return (
    <Tooltip
      label={props.item.label}
      side="right"
      disabled={tooltipDisabled()}
      trigger={(triggerProps) =>
        props.item.render({
          class: cn(
            SIDEBAR_LINK_ROOT_STYLE,
            !isVisuallyExpanded() && SIDEBAR_LINK_COLLAPSED_STYLE,
          ),
          ref: triggerProps.ref,
          onMouseEnter: triggerProps.onMouseEnter,
          onMouseLeave: triggerProps.onMouseLeave,
          onFocus: triggerProps.onFocus,
          onBlur: triggerProps.onBlur,
          children: (
            <>
              <span class={SIDEBAR_ICON_STYLE}>
                {props.item.icon({ size: SIDEBAR_ICON_SIZE_DEFAULT })}
              </span>
              <span
                class={cn(
                  SIDEBAR_LABEL_STYLE,
                  isVisuallyExpanded()
                    ? SIDEBAR_LABEL_VISIBLE_STYLE
                    : SIDEBAR_LABEL_HIDDEN_STYLE,
                )}
              >
                {props.item.label}
              </span>
            </>
          ),
        })
      }
    />
  );
}
