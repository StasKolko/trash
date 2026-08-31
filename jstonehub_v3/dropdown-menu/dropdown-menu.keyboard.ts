import type {
  DropdownMenuItem,
  FocusableMenuItem,
} from "./dropdown-menu.types";
import { flattenFocusableItems, isItemDisabled } from "./dropdown-menu.utils";

type KeyboardConfig = {
  items: DropdownMenuItem[];
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  focusItem: (index: number) => void;
  selectItem: (item: FocusableMenuItem) => void;
  close: () => void;
  openSubMenu?: () => void;
  closeSubMenu?: () => void;
};

export function createMenuKeyboardHandler(config: KeyboardConfig) {
  const {
    items,
    focusedIndex,
    setFocusedIndex,
    focusItem,
    selectItem,
    close,
    openSubMenu,
    closeSubMenu,
  } = config;

  const focusableItems = flattenFocusableItems(items);

  function getNextIndex(current: number): number {
    if (focusableItems.length === 0) {
      return -1;
    }

    let next = (current + 1) % focusableItems.length;
    const startIndex = next;

    while (isItemDisabled(focusableItems[next])) {
      next = (next + 1) % focusableItems.length;
      if (next === startIndex) {
        return current;
      }
    }
    return next;
  }

  function getPrevIndex(current: number): number {
    if (focusableItems.length === 0) {
      return -1;
    }

    let prev = (current - 1 + focusableItems.length) % focusableItems.length;
    const startIndex = prev;

    while (isItemDisabled(focusableItems[prev])) {
      prev = (prev - 1 + focusableItems.length) % focusableItems.length;
      if (prev === startIndex) {
        return current;
      }
    }
    return prev;
  }

  return {
    handleArrowDown: () => {
      const nextIndex = getNextIndex(focusedIndex);
      if (nextIndex !== -1) {
        setFocusedIndex(nextIndex);
        focusItem(nextIndex);
      }
    },

    handleArrowUp: () => {
      const prevIndex = getPrevIndex(focusedIndex);
      if (prevIndex !== -1) {
        setFocusedIndex(prevIndex);
        focusItem(prevIndex);
      }
    },

    handleArrowRight: () => {
      const item = focusableItems[focusedIndex];
      if (item?.type === "submenu" && openSubMenu) {
        openSubMenu();
      }
    },

    handleArrowLeft: () => {
      if (closeSubMenu) {
        closeSubMenu();
      }
    },

    handleEnter: () => {
      const item = focusableItems[focusedIndex];
      if (item && !isItemDisabled(item)) {
        selectItem(item);
      }
    },

    handleEscape: () => close(),

    handleHome: () => {
      const firstEnabled = focusableItems.findIndex(
        (item) => !isItemDisabled(item),
      );
      if (firstEnabled >= 0) {
        setFocusedIndex(firstEnabled);
        focusItem(firstEnabled);
      }
    },

    handleEnd: () => {
      for (let i = focusableItems.length - 1; i >= 0; i--) {
        if (!isItemDisabled(focusableItems[i])) {
          setFocusedIndex(i);
          focusItem(i);
          break;
        }
      }
    },

    handleTypeahead: (char: string) => {
      const lowerChar = char.toLowerCase();
      const startIndex = focusedIndex + 1;

      for (let i = 0; i < focusableItems.length; i++) {
        const idx = (startIndex + i) % focusableItems.length;
        const item = focusableItems[idx];

        if (isItemDisabled(item)) {
          continue;
        }

        if (!("label" in item)) {
          continue;
        }

        const label = item.label;
        if (
          typeof label === "string"
          && label.toLowerCase().startsWith(lowerChar)
        ) {
          setFocusedIndex(idx);
          focusItem(idx);
          break;
        }
      }
    },
  };
}

export function handleMenuKeyDown(
  e: KeyboardEvent,
  handler: ReturnType<typeof createMenuKeyboardHandler>,
) {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      handler.handleArrowDown();
      break;
    case "ArrowUp":
      e.preventDefault();
      handler.handleArrowUp();
      break;
    case "ArrowRight":
      e.preventDefault();
      handler.handleArrowRight();
      break;
    case "ArrowLeft":
      e.preventDefault();
      handler.handleArrowLeft();
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      handler.handleEnter();
      break;
    case "Escape":
      e.preventDefault();
      handler.handleEscape();
      break;
    case "Home":
      e.preventDefault();
      handler.handleHome();
      break;
    case "End":
      e.preventDefault();
      handler.handleEnd();
      break;
    default:
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        handler.handleTypeahead(e.key);
      }
  }
}
