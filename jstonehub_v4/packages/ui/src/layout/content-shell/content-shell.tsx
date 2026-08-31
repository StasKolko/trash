import type { JSX } from "solid-js";

import type { HasActiveChild, SidebarItem } from "./content-shell.type";

import { Show } from "solid-js";

import { Sheet } from "../../overlay/sheet/sheet";
import { useBreakpoint } from "../breakpoint/breakpoint.provider";
import {
  CONTENT_SHELL_MAIN_STYLE,
  CONTENT_SHELL_ROOT_STYLE,
} from "./_content-shell.style";
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "./_sidebar.constant";
import { DESKTOP_SIDEBAR_ROOT_STYLE } from "./_sidebar.style";
import { SidebarContent } from "./_sidebar-content";
import { useSidebar } from "./sidebar.provider";

export function ContentShell(props: {
  "data-testid"?: string;
  "data-main-testid"?: string;
  "data-mobile-testid"?: string;
  "data-desktop-testid"?: string;
  "data-content-testid"?: string;
  logo: JSX.Element;
  sidebarItems: SidebarItem[];
  main: JSX.Element;
  closeLabel: string;
  hasActiveChild: HasActiveChild;
}) {
  const bp = useBreakpoint();
  const sb = useSidebar();

  const sidebarWidth = () =>
    sb.expanded() ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <>
      <div data-testid={props["data-testid"]} class={CONTENT_SHELL_ROOT_STYLE}>
        <Show when={bp.isTabletOrLarger()}>
          <aside
            data-testid={props["data-desktop-testid"]}
            class={DESKTOP_SIDEBAR_ROOT_STYLE}
            style={{ width: `${sidebarWidth()}px` }}
          >
            <SidebarContent
              data-testid={props["data-content-testid"]}
              sidebarItems={props.sidebarItems}
              hasActiveChild={props.hasActiveChild}
            />
          </aside>
        </Show>

        <main
          data-testid={props["data-main-testid"]}
          class={CONTENT_SHELL_MAIN_STYLE}
        >
          {props.main}
        </main>
      </div>

      <Sheet
        data-testid={props["data-mobile-testid"]}
        open={sb.mobileOpen()}
        onClose={sb.onMobileClose}
        closeLabel={props.closeLabel}
        logo={props.logo}
        content={
          <SidebarContent
            data-testid={props["data-content-testid"]}
            sidebarItems={props.sidebarItems}
            hasActiveChild={props.hasActiveChild}
          />
        }
      />
    </>
  );
}
