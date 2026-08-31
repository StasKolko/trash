import type { SidebarGroupItem, SidebarItem } from "./content-shell.type";

import { createSignal } from "solid-js";

export function createSidebarGroupStore(options: {
  items: SidebarItem[];
  hasActiveChild: (item: SidebarGroupItem) => boolean;
}) {
  const initial: Record<string, boolean> = {};

  for (const item of options.items) {
    if (item.type !== "group") {
      continue;
    }

    initial[item.label] = Boolean(
      item.defaultOpen || options.hasActiveChild(item),
    );
  }

  const [state, setState] = createSignal<Record<string, boolean>>(initial);

  function toggleGroup(label: string) {
    setState((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  function expandGroup(label: string) {
    setState((prev) => ({
      ...prev,
      [label]: true,
    }));
  }

  function isGroupOpen(label: string): boolean {
    return state()[label] ?? false;
  }

  return { isGroupOpen, toggleGroup, expandGroup };
}
