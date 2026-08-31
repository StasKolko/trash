export const DIALOG_BACKDROP_STYLE = [
  "fixed inset-0 z-dialog",
  "bg-backdrop backdrop-blur-[2px]",
  "transition-opacity duration-200",
].join(" ");

export const DIALOG_ROOT_STYLE = [
  "fixed z-dialog",
  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  "w-[min(90vw,640px)] max-h-[85dvh]",
  "bg-dialog rounded-xl",
  "border border-border",
  "opacity-0 scale-95",
  "transition-[opacity,transform] duration-200",
  "data-[state=open]:opacity-100 data-[state=open]:scale-100",
].join(" ");

export const DIALOG_WRAPPER_STYLE =
  "flex flex-col gap-[12px] p-[12px] max-h-[85dvh]";
export const DIALOG_HEADER_STYLE = "flex flex-col gap-[8px] px-[8px]";
export const DIALOG_CONTENT_STYLE =
  "flex flex-col flex-1 min-h-0 gap-[12px] px-[8px] scrollbar-styled overflow-y-auto";
export const DIALOG_FOOTER_STYLE =
  "flex items-center justify-end gap-[12px] px-[8px]";
