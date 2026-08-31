import { PanelLeftClose, PanelLeftOpen } from "lucide-solid";
import { Show } from "solid-js";

import { IconButton } from "../../action/button/button";
import { ICON_SIZE } from "../../action/icon/icon.constant";
import { useSidebar } from "./sidebar.provider";

export function SidebarDesktopToggle(props: {
  "data-testid"?: string;
  "aria-label": string;
}) {
  const sb = useSidebar();

  return (
    <IconButton
      data-testid={props["data-testid"]}
      variant="ghost"
      aria-label={props["aria-label"]}
      onClick={sb.toggleExpanded}
    >
      <Show
        when={sb.expanded()}
        fallback={<PanelLeftOpen size={ICON_SIZE.md} />}
      >
        <PanelLeftClose size={ICON_SIZE.md} />
      </Show>
    </IconButton>
  );
}
