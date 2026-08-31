import { twMerge } from "tailwind-merge";

import { is } from "./guard";

type ClassArguments =
  | ClassPrimitive
  | ClassArguments[]
  | Record<string, ClassPrimitive>;
type ClassPrimitive = number | string | boolean | null | undefined;

function cn(...inputs: ClassArguments[]) {
  return twMerge(classNames(...inputs));
}

function classNames(...args: ClassArguments[]) {
  let classes = "";

  for (const arg of args) {
    if (is.string(arg)) {
      classes = appendClass(classes, arg);
    } else if (is.array(arg)) {
      classes = appendClass(classes, classNames(...arg));
    } else if (is.object(arg)) {
      for (const [key, value] of Object.entries(arg)) {
        if (value) {
          classes = appendClass(classes, key);
        }
      }
    }
  }

  return classes;
}

function appendClass(classes: string, newClass: string) {
  if (is.falsy(classes)) {
    return newClass;
  }
  if (is.falsy(newClass)) {
    return classes;
  }
  return `${classes} ${newClass}`;
}

export { cn };
