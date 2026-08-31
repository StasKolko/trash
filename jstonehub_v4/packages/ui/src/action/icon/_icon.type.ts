import type { SemanticVariant } from "../../_model/type";

type ActionIconName =
  | "close"
  | "check"
  | "copy"
  | "edit"
  | "delete"
  | "save"
  | "add"
  | "remove"
  | "search"
  | "filter"
  | "sort"
  | "refresh";

type NavigationIconName =
  | "chevronDown"
  | "chevronUp"
  | "chevronLeft"
  | "chevronRight"
  | "home"
  | "externalLink";

type UserIconName = "user" | "settings" | "logout";

type MediaIconName = "eye" | "eyeOff" | "download" | "upload";

type MathIconName = "plus" | "minus";

type MenuIconName = "moreHorizontal" | "moreVertical";

type IconName =
  | SemanticVariant
  | ActionIconName
  | NavigationIconName
  | UserIconName
  | MediaIconName
  | MathIconName
  | MenuIconName;

export type { IconName };
