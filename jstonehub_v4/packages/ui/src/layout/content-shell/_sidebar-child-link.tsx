import type { SidebarChildItem } from "./content-shell.type";

import { SIDEBAR_CHILD_ICON_SIZE_DEFAULT } from "./_sidebar.constant";
import {
  SIDEBAR_CHILD_ICON_STYLE,
  SIDEBAR_CHILD_LINK_STYLE,
} from "./_sidebar.style";

export function SidebarChildLink(props: { item: SidebarChildItem }) {
  return props.item.render({
    class: SIDEBAR_CHILD_LINK_STYLE,
    children: (
      <>
        <span class={SIDEBAR_CHILD_ICON_STYLE}>
          {props.item.icon({ size: SIDEBAR_CHILD_ICON_SIZE_DEFAULT })}
        </span>
        <span class="truncate">{props.item.label}</span>
      </>
    ),
  });
}
