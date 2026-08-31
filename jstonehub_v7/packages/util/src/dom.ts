import { is } from "./guard";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getElementByIdOrThrow(id: string) {
  const element = document.getElementById(id);

  if (is.null(element)) {
    throw new Error(`DOM element with id "${id}" was not found`);
  }

  return element;
}

function focusFirstElement(container: HTMLElement | null | undefined) {
  const focusable = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

  if (is.nullish(focusable)) {
    return false;
  }

  focusable.focus();
  return true;
}

export { focusFirstElement, getElementByIdOrThrow };
