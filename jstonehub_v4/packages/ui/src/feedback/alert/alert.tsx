import type { JSX } from "solid-js";

import type { SemanticVariant } from "../../_model/type";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-solid";
import { Show } from "solid-js";

import { Button } from "../../action/button/button";
import { H4 } from "../../typography/heading/heading";
import { P } from "../../typography/text/text";
import {
  ALERT_CLOSE_BUTTON_STYLE,
  ALERT_CLOSE_ICON_STYLE,
  ALERT_CONTENT_STYLE,
  ALERT_ICON_STYLE,
  ALERT_ROOT_STYLE,
  ALERT_VARIANT_STYLE,
} from "./_alert.style";

type AlertCloseProps =
  | { onClose: () => void; closeAriaLabel: string }
  | { onClose?: never; closeAriaLabel?: never };

type AlertProps = AlertCloseProps & {
  variant: SemanticVariant;
  title: JSX.Element;
  description: JSX.Element;
};

const VARIANT_ICONS: Record<SemanticVariant, () => JSX.Element> = {
  success: () => <CheckCircle2 aria-hidden="true" />,
  error: () => <AlertCircle aria-hidden="true" />,
  warning: () => <AlertTriangle aria-hidden="true" />,
  info: () => <Info aria-hidden="true" />,
};

function Alert(props: AlertProps) {
  return (
    <div
      data-testid="Alert"
      role="alert"
      class={`${ALERT_ROOT_STYLE} ${ALERT_VARIANT_STYLE[props.variant]}`}
    >
      <div data-testid="AlertIcon" class={ALERT_ICON_STYLE}>
        {VARIANT_ICONS[props.variant]()}
      </div>

      <div class={ALERT_CONTENT_STYLE}>
        <H4 variant={props.variant}>{props.title}</H4>
        <P level={4} variant={props.variant}>
          {props.description}
        </P>
      </div>

      <Show when={props.onClose}>
        <Button
          variant="ghost"
          size="sm"
          aria-label={props.closeAriaLabel as string}
          disabled={false}
          class={ALERT_CLOSE_BUTTON_STYLE}
          onClick={props.onClose}
        >
          <X aria-hidden="true" class={ALERT_CLOSE_ICON_STYLE} />
        </Button>
      </Show>
    </div>
  );
}

export type { AlertProps };
export { Alert };
