import type { JSX } from "solid-js";

type SidebarLinkRenderProps = {
  class: string;
  ref?: (el: HTMLElement) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  children: JSX.Element;
};

type BaseSidebarItem = {
  icon: (props: { size: number }) => JSX.Element;
  label: string;
};

type SidebarLinkItem = BaseSidebarItem & {
  type: "link";
  render: (props: SidebarLinkRenderProps) => JSX.Element;
};

type SidebarChildItem = BaseSidebarItem & {
  render: (props: SidebarLinkRenderProps) => JSX.Element;
};

type SidebarGroupItem = BaseSidebarItem & {
  type: "group";
  defaultOpen?: boolean;
  children: SidebarChildItem[];
};

type SidebarSeparatorItem = {
  type: "separator";
};

type SidebarItem = SidebarLinkItem | SidebarGroupItem | SidebarSeparatorItem;

type HasActiveChild = (item: SidebarGroupItem) => boolean;

export type {
  HasActiveChild,
  SidebarChildItem,
  SidebarGroupItem,
  SidebarItem,
  SidebarLinkItem,
  SidebarLinkRenderProps,
  SidebarSeparatorItem,
};
