import type { HasActiveChild, SidebarGroupItem } from "./content-shell.type";

import { cn } from "@packages/util/css";
import { ChevronDown } from "lucide-solid";
import { createMemo, For } from "solid-js";

import { Tooltip } from "../../overlay/tooltip/tooltip";
import { useBreakpoint } from "../breakpoint/breakpoint.provider";
import { SIDEBAR_ICON_SIZE_DEFAULT } from "./_sidebar.constant";
import {
  SIDEBAR_CHEVRON_OPEN_STYLE,
  SIDEBAR_CHEVRON_STYLE,
  SIDEBAR_CHILDREN_CLOSED_STYLE,
  SIDEBAR_CHILDREN_INNER_STYLE,
  SIDEBAR_CHILDREN_OPEN_STYLE,
  SIDEBAR_CHILDREN_ROOT_STYLE,
  SIDEBAR_GROUP_BUTTON_STYLE,
  SIDEBAR_GROUP_COLLAPSED_ACTIVE_STYLE,
  SIDEBAR_GROUP_COLLAPSED_STYLE,
  SIDEBAR_GROUP_DOT_ACTIVE_STYLE,
  SIDEBAR_GROUP_DOT_STYLE,
  SIDEBAR_GROUP_EXPANDED_ACTIVE_STYLE,
  SIDEBAR_ICON_STYLE,
  SIDEBAR_LABEL_HIDDEN_STYLE,
  SIDEBAR_LABEL_STYLE,
  SIDEBAR_LABEL_VISIBLE_STYLE,
} from "./_sidebar.style";
import { SidebarChildLink } from "./_sidebar-child-link";
import { useSidebar } from "./sidebar.provider";

export function SidebarGroup(props: {
  item: SidebarGroupItem;
  isOpen: () => boolean;
  onToggle: () => void;
  hasActiveChild?: HasActiveChild;
}) {
  const sb = useSidebar();
  const bp = useBreakpoint();

  const hasActive = createMemo(
    () => props.hasActiveChild?.(props.item) ?? false,
  );

  const isVisuallyExpanded = () => sb.expanded() || bp.isMobile();
  const tooltipDisabled = () => isVisuallyExpanded();
  const isOpen = () => props.isOpen();
  const showChildren = () => isVisuallyExpanded() && isOpen();

  // Collapsed sidebar: active group
  const showCollapsedActive = () => !isVisuallyExpanded() && hasActive();

  // Expanded/mobile: active group with children hidden
  const showExpandedActive = () =>
    isVisuallyExpanded() && hasActive() && !isOpen();

  return (
    <div>
      <Tooltip
        label={props.item.label}
        side="right"
        disabled={tooltipDisabled()}
        trigger={(triggerProps) => (
          // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
          <button
            type="button"
            ref={triggerProps.ref}
            onMouseEnter={triggerProps.onMouseEnter}
            onMouseLeave={triggerProps.onMouseLeave}
            onFocus={triggerProps.onFocus}
            onBlur={triggerProps.onBlur}
            class={cn(
              SIDEBAR_GROUP_BUTTON_STYLE,
              !isVisuallyExpanded() && SIDEBAR_GROUP_COLLAPSED_STYLE,
              showCollapsedActive() && SIDEBAR_GROUP_COLLAPSED_ACTIVE_STYLE,
              showExpandedActive() && SIDEBAR_GROUP_EXPANDED_ACTIVE_STYLE,
            )}
            onClick={props.onToggle}
          >
            <span class={cn(SIDEBAR_ICON_STYLE, "relative")}>
              {props.item.icon({ size: SIDEBAR_ICON_SIZE_DEFAULT })}
              {!isVisuallyExpanded() && hasActive() && (
                <span
                  class={cn(
                    SIDEBAR_GROUP_DOT_STYLE,
                    SIDEBAR_GROUP_DOT_ACTIVE_STYLE,
                  )}
                />
              )}
              {!(isVisuallyExpanded() || hasActive()) && (
                <span class={SIDEBAR_GROUP_DOT_STYLE} />
              )}
            </span>
            <span
              class={cn(
                SIDEBAR_LABEL_STYLE,
                "flex-1 text-left",
                isVisuallyExpanded()
                  ? SIDEBAR_LABEL_VISIBLE_STYLE
                  : SIDEBAR_LABEL_HIDDEN_STYLE,
              )}
            >
              {props.item.label}
            </span>
            <ChevronDown
              class={cn(
                SIDEBAR_CHEVRON_STYLE,
                isVisuallyExpanded()
                  ? SIDEBAR_LABEL_VISIBLE_STYLE
                  : SIDEBAR_LABEL_HIDDEN_STYLE,
                showChildren() && SIDEBAR_CHEVRON_OPEN_STYLE,
              )}
            />
          </button>
        )}
      />

      <div
        class={cn(
          SIDEBAR_CHILDREN_ROOT_STYLE,
          showChildren()
            ? SIDEBAR_CHILDREN_OPEN_STYLE
            : SIDEBAR_CHILDREN_CLOSED_STYLE,
        )}
      >
        <div class={SIDEBAR_CHILDREN_INNER_STYLE}>
          <For each={props.item.children}>
            {(child) => <SidebarChildLink item={child} />}
          </For>
        </div>
      </div>
    </div>
  );
}
