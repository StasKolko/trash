import type { Accessor, JSX } from "solid-js";

import type { SidebarGroupItem, SidebarItem } from "./content-shell.type";

import { is } from "@packages/util/guard";
import { createContext, createEffect, createSignal, on } from "solid-js";

import { getStrictContext } from "../../_util/context";
import { useBreakpoint } from "../breakpoint/breakpoint.provider";
import { createSidebarGroupStore } from "./_sidebar-group-store";

type SidebarGroupStore = ReturnType<typeof createSidebarGroupStore>;

const SidebarContext = createContext<{
  mobileOpen: Accessor<boolean>;
  expanded: Accessor<boolean>;
  onMobileOpen: () => void;
  onMobileClose: () => void;
  toggleExpanded: () => void;
  expand: () => void;
  groupStore: Accessor<SidebarGroupStore | undefined>;
  initGroupStore: (
    items: SidebarItem[],
    hasActiveChild: (item: SidebarGroupItem) => boolean,
  ) => void;
}>();

export function useSidebar() {
  return getStrictContext(SidebarContext, "useSidebar");
}

export function SidebarProvider(props: { children: JSX.Element }) {
  const bp = useBreakpoint();
  const [mobileOpen, setMobileOpen] = createSignal(false);
  const [expanded, setExpanded] = createSignal(bp.isDesktop());
  const [groupStore, setGroupStore] = createSignal<
    SidebarGroupStore | undefined
  >(undefined);

  createEffect(
    on(bp.isDesktop, (isDesktop, prevIsDesktop) => {
      if (is.undefined(prevIsDesktop)) {
        return;
      }

      if (isDesktop && !prevIsDesktop && !expanded()) {
        setExpanded(true);
      }

      if (!isDesktop && prevIsDesktop && expanded()) {
        setExpanded(false);
      }
    }),
  );

  createEffect(
    on(bp.isMobile, (isMobile, prevIsMobile) => {
      if (!isMobile && prevIsMobile && mobileOpen()) {
        setMobileOpen(false);
      }
    }),
  );

  function initGroupStore(
    items: SidebarItem[],
    hasActiveChild: (item: SidebarGroupItem) => boolean,
  ) {
    if (!groupStore()) {
      setGroupStore(createSidebarGroupStore({ items, hasActiveChild }));
    }
  }

  const value = {
    mobileOpen,
    expanded,
    onMobileOpen: () => setMobileOpen(true),
    onMobileClose: () => setMobileOpen(false),
    toggleExpanded: () => setExpanded((prev) => !prev),
    expand: () => setExpanded(true),
    groupStore,
    initGroupStore,
  };

  return (
    <SidebarContext.Provider value={value}>
      {props.children}
    </SidebarContext.Provider>
  );
}
