import { is } from "./guard";

export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function getElementByIdOrThrow(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (is.null(element)) {
    throw new Error(`DOM element with id "${id}" was not found`);
  }

  return element;
}

export function focusFirstElement(container: HTMLElement | null | undefined) {
  const focusable = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

  if (is.not.nullish(focusable)) {
    focusable.focus();
    return true;
  }

  return false;
}
