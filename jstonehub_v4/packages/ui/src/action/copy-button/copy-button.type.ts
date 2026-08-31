import type { IconButtonProps } from "../button/button.type";

type CopyButtonStatus = "idle" | "success" | "error";

type CopyButtonProps = Omit<IconButtonProps, "children"> & {
  content: string | (() => string);
  onCopied?: () => void;
  onError?: () => void;
};

export type { CopyButtonProps, CopyButtonStatus };
