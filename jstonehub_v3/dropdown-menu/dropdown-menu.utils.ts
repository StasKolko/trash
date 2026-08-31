import type {
  DropdownMenuItem,
  FocusableMenuItem,
} from "./dropdown-menu.types";

export function flattenFocusableItems(
  items: DropdownMenuItem[],
): FocusableMenuItem[] {
  const result: FocusableMenuItem[] = [];

  for (const item of items) {
    if (item.type === "separator") {
      continue;
    }

    if (item.type === "group") {
      for (const groupItem of item.items) {
        result.push(groupItem);
      }
      continue;
    }

    if (item.type === "radiogroup") {
      for (const radioItem of item.items) {
        result.push(radioItem);
      }
      continue;
    }

    result.push(item);
  }

  return result;
}

export function isItemDisabled(item: FocusableMenuItem): boolean {
  return "disabled" in item && item.disabled === true;
}
