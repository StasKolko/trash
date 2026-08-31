import { Menu } from "lucide-solid";

import { IconButton } from "../../action/button/button";
import { ICON_SIZE } from "../../action/icon/icon.constant";
import { useSidebar } from "./sidebar.provider";

export function SidebarMobileTrigger(props: {
  "data-testid"?: string;
  "aria-label": string;
}) {
  const sb = useSidebar();

  return (
    <IconButton
      data-testid={props["data-testid"]}
      variant="ghost"
      aria-label={props["aria-label"]}
      onClick={sb.onMobileOpen}
    >
      <Menu size={ICON_SIZE.md} />
    </IconButton>
  );
}
