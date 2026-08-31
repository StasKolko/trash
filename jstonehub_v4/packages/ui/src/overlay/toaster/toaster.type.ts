import type { SemanticVariant } from "../../_model/type";

type ToastPhase =
  | "entering"
  | "visible"
  | "exiting-right"
  | "settling"
  | "evicting";

type InternalToast = {
  id: number;
  variant: SemanticVariant;
  title: string;
  phase: ToastPhase;
  elapsed: number;
  paused: boolean;
};

export type { InternalToast, ToastPhase };
