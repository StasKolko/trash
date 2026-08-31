import type { FloatingPosition } from "../../model/overlays.types";
import type {
  DropdownMenuItem,
  DropdownMenuSubMenu,
  FocusableMenuItem,
} from "../dropdown-menu.types";

export type SubMenuProps = {
  item: DropdownMenuSubMenu;
  focused: boolean;
  parentClose: () => void;
};

export type SubMenuContentProps = {
  ref: (el: HTMLDivElement) => void;
  items: DropdownMenuItem[];
  visible: boolean;
  position: FloatingPosition | null;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  focusItem: (index: number) => void;
  onSelectItem: (item: FocusableMenuItem) => void;
  onClose: () => void;
  onParentClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};
