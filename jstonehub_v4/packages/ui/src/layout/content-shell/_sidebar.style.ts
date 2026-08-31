import { FOCUS_RING } from "../../_model/style";

export const DESKTOP_SIDEBAR_ROOT_STYLE = [
  "shrink-0 h-full",
  "overflow-y-auto overflow-x-hidden",
  "border-r border-border",
  "bg-sheet",
  "transition-[width] duration-long ease-out",
].join(" ");

export const SIDEBAR_CONTENT_ROOT_STYLE = "h-full flex flex-col";

export const SIDEBAR_CONTENT_NAV_STYLE = [
  "flex flex-col flex-1 gap-[2px] p-[8px]",
  "overflow-y-auto overflow-x-hidden",
].join(" ");

export const SIDEBAR_SEPARATOR_STYLE = "my-[8px]";

export const SIDEBAR_LINK_ROOT_STYLE = [
  "w-full flex items-center gap-[12px] px-[12px] py-[8px] rounded-md",
  "text-[14px] text-subtle cursor-pointer",
  "hover:bg-secondary hover:text-foreground",
  "data-[status=active]:bg-active data-[status=active]:text-active-foreground data-[status=active]:font-medium",
  "data-[status=active]:hover:bg-active data-[status=active]:hover:text-active-foreground",
  "transition-[color,background-color,padding,gap,justify-content] duration-normal ease-out",
  FOCUS_RING,
].join(" ");

export const SIDEBAR_LINK_COLLAPSED_STYLE = "justify-center px-0 gap-0";

export const SIDEBAR_ICON_STYLE = "shrink-0 w-[20px] h-[20px]";

export const SIDEBAR_LABEL_STYLE = [
  "truncate whitespace-nowrap",
  "transition-[opacity,max-width] duration-normal ease-out",
].join(" ");

export const SIDEBAR_LABEL_VISIBLE_STYLE = "opacity-100 max-w-[200px]";

export const SIDEBAR_LABEL_HIDDEN_STYLE = "opacity-0 max-w-0 overflow-hidden";

export const SIDEBAR_GROUP_BUTTON_STYLE = [
  "w-full flex items-center gap-[12px] px-[12px] py-[8px] rounded-md",
  "text-[14px] text-subtle cursor-pointer",
  "transition-[color,background-color,padding,gap,justify-content] duration-normal ease-out",
  "hover:bg-secondary hover:text-foreground",
  FOCUS_RING,
].join(" ");

export const SIDEBAR_GROUP_COLLAPSED_STYLE = "justify-center px-0 gap-0";

// Collapsed sidebar: active group gets bg + right accent bar
export const SIDEBAR_GROUP_COLLAPSED_ACTIVE_STYLE = [
  "bg-active text-active-foreground",
  "border-r-[2px] border-r-active-foreground",
].join(" ");

// Expanded/mobile: active group with children closed
export const SIDEBAR_GROUP_EXPANDED_ACTIVE_STYLE =
  "bg-active text-active-foreground font-medium";

export const SIDEBAR_GROUP_DOT_STYLE = [
  "absolute bottom-[2px] left-1/2 -translate-x-1/2",
  "w-[4px] h-[4px] rounded-full bg-subtle",
].join(" ");

export const SIDEBAR_GROUP_DOT_ACTIVE_STYLE = "bg-active-foreground";

export const SIDEBAR_CHEVRON_STYLE =
  "w-[16px] h-[16px] shrink-0 transition-[transform,opacity,max-width] duration-normal ease-out";

export const SIDEBAR_CHEVRON_OPEN_STYLE = "rotate-180";

export const SIDEBAR_CHILDREN_ROOT_STYLE = [
  "ml-[20px] pl-[12px]",
  "border-l border-border",
  "grid",
  "transition-[grid-template-rows,opacity,margin-top] duration-normal ease-out",
].join(" ");

export const SIDEBAR_CHILDREN_OPEN_STYLE =
  "mt-[4px] grid-rows-[1fr] opacity-100";

export const SIDEBAR_CHILDREN_CLOSED_STYLE = "grid-rows-[0fr] opacity-0 mt-0";

export const SIDEBAR_CHILDREN_INNER_STYLE =
  "overflow-hidden flex flex-col gap-[4px] -m-[4px] p-[4px]";

export const SIDEBAR_CHILD_LINK_STYLE = [
  "flex items-center gap-[10px] px-[12px] py-[6px] rounded-md",
  "text-[13px] text-subtle cursor-pointer",
  "hover:bg-secondary hover:text-foreground",
  "data-[status=active]:bg-active data-[status=active]:text-active-foreground data-[status=active]:font-medium",
  "data-[status=active]:hover:bg-active data-[status=active]:hover:text-active-foreground",
  "transition-colors duration-normal",
  FOCUS_RING,
].join(" ");

export const SIDEBAR_CHILD_ICON_STYLE = "shrink-0 w-[16px] h-[16px]";
