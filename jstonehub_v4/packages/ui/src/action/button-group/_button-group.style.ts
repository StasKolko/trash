const BUTTON_GROUP_BASE = "inline-flex [&>*:focus-visible]:z-1";

const BUTTON_GROUP_HORIZONTAL_CHILDREN = [
  "[&>*:not(:first-child):not(:last-child)]:rounded-none",
  "[&>*:first-child]:rounded-r-none",
  "[&>*:last-child]:rounded-l-none",
  "[&>*:not(:first-child)]:-ml-px",
].join(" ");

const BUTTON_GROUP_VERTICAL_CHILDREN = [
  "[&>*:not(:first-child):not(:last-child)]:rounded-none",
  "[&>*:first-child]:rounded-b-none",
  "[&>*:last-child]:rounded-t-none",
  "[&>*:not(:first-child)]:-mt-px",
].join(" ");

export {
  BUTTON_GROUP_BASE,
  BUTTON_GROUP_HORIZONTAL_CHILDREN,
  BUTTON_GROUP_VERTICAL_CHILDREN,
};
