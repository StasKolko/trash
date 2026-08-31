import type {
  HasActiveChild,
  SidebarGroupItem,
  SidebarItem,
} from "./content-shell.type";

import { assertNever } from "@packages/util/assert";
import { For, Show } from "solid-js";

import { Separator } from "../../_primitive/separator/separator";
import { useBreakpoint } from "../breakpoint/breakpoint.provider";
import {
  SIDEBAR_CONTENT_NAV_STYLE,
  SIDEBAR_CONTENT_ROOT_STYLE,
  SIDEBAR_SEPARATOR_STYLE,
} from "./_sidebar.style";
import { SidebarGroup } from "./_sidebar-group";
import { SidebarLink } from "./_sidebar-link";
import { useSidebar } from "./sidebar.provider";

export function SidebarContent(props: {
  "data-testid"?: string;
  sidebarItems: SidebarItem[];
  hasActiveChild: HasActiveChild;
}) {
  const sb = useSidebar();
  const bp = useBreakpoint();

  sb.initGroupStore(props.sidebarItems, props.hasActiveChild);

  function handleGroupClick(group: SidebarGroupItem) {
    const store = sb.groupStore();
    if (!store) {
      return;
    }

    if (!(sb.expanded() || bp.isMobile())) {
      sb.expand();
      store.expandGroup(group.label);
      return;
    }

    store.toggleGroup(group.label);
  }

  return (
    <Show when={sb.groupStore()}>
      {(store) => (
        <div
          data-testid={props["data-testid"]}
          class={SIDEBAR_CONTENT_ROOT_STYLE}
        >
          <nav class={SIDEBAR_CONTENT_NAV_STYLE}>
            <For each={props.sidebarItems}>
              {(item) => {
                switch (item.type) {
                  case "separator":
                    return <Separator class={SIDEBAR_SEPARATOR_STYLE} />;
                  case "link":
                    return <SidebarLink item={item} />;
                  case "group":
                    return (
                      <SidebarGroup
                        item={item}
                        isOpen={() => store().isGroupOpen(item.label)}
                        onToggle={() => handleGroupClick(item)}
                        hasActiveChild={props.hasActiveChild}
                      />
                    );
                  default:
                    return assertNever(item);
                }
              }}
            </For>
          </nav>
        </div>
      )}
    </Show>
  );
}
