import type { SemanticVariant } from "../../_model/type";

import { is } from "@packages/util/guard";
import { createSignal, onCleanup, onMount } from "solid-js";

import { Badge } from "../../data-display/badge/badge";
import {
  TEXTAREA_CHAR_LIMIT_ERROR_THRESHOLD,
  TEXTAREA_CHAR_LIMIT_WARNING_THRESHOLD,
  TEXTAREA_COUNTER_STYLE,
  TEXTAREA_HEIGHT_MAX_DEFAULT,
  TEXTAREA_HEIGHT_MIN,
  TEXTAREA_RESIZE_STYLE,
  TEXTAREA_ROOT_STYLE,
  TEXTAREA_WRAPPER_STYLE,
} from "./_textarea.style";

type TextareaProps = {
  "data-testid"?: string;
  "aria-describedby"?: string;
  id: string;
  name: string;
  disabled: boolean;
  required: boolean;
  readonly: boolean;

  placeholder: string;
  minLength: number;
  maxLength: number;
  maxHeight?: number;

  invalid: boolean;

  counterLabel: (current: number, max: number) => string;

  value: string;
  onValueChange: (value: string) => void;
};

function Textarea(props: TextareaProps) {
  const [manualHeight, setManualHeight] = createSignal<number | null>(null);

  const resizeState = createResizeState(TEXTAREA_HEIGHT_MIN);
  const resizeListeners = createResizeListeners(handleResizeMove, () =>
    resizeListeners.remove(),
  );

  const charCount = () => props.value.length;
  const maxHeight = () => props.maxHeight ?? TEXTAREA_HEIGHT_MAX_DEFAULT;

  // biome-ignore lint/suspicious/noUnassignedVariables: ref assignment
  let textareaRef!: HTMLTextAreaElement;

  function handleInput(e: InputEvent & { currentTarget: HTMLTextAreaElement }) {
    const textarea = e.currentTarget;
    props.onValueChange(textarea.value);

    if (is.null(manualHeight())) {
      adjustHeight(textarea, maxHeight);
    }
  }

  function handleResizeStart(e: PointerEvent) {
    e.preventDefault();

    resizeState.capture(e.clientY, textareaRef.offsetHeight);
    resizeListeners.add();
  }

  function handleResizeMove(e: PointerEvent) {
    const newHeight = resizeState.calculateNewHeight(e.clientY, maxHeight());
    setManualHeight(newHeight);
    textareaRef.style.height = `${newHeight}px`;
  }

  onMount(() => {
    if (props.value) {
      adjustHeight(textareaRef, maxHeight);
    }
  });

  onCleanup(resizeListeners.remove);

  return (
    <div data-testid={props["data-testid"]} class={TEXTAREA_WRAPPER_STYLE}>
      <textarea
        class={TEXTAREA_ROOT_STYLE}
        style={{ "max-height": `${maxHeight()}px` }}
        // v8 ignore start
        ref={textareaRef}
        // v8 ignore end
        id={props.id}
        name={props.name}
        disabled={props.disabled}
        required={props.required}
        aria-readonly={props.readonly || undefined}
        placeholder={props.placeholder}
        minlength={props.minLength}
        maxlength={props.maxLength}
        aria-invalid={props.invalid || undefined}
        aria-describedby={props["aria-describedby"]}
        value={props.value}
        onInput={handleInput}
      />

      <Badge
        class={TEXTAREA_COUNTER_STYLE}
        aria-label={props.counterLabel(charCount(), props.maxLength)}
        variant={resolveCounterVariant(
          charCount(),
          props.minLength,
          props.maxLength,
        )}
        size="sm"
      >
        {charCount()}/{props.maxLength}
      </Badge>

      <span
        class={TEXTAREA_RESIZE_STYLE}
        onPointerDown={handleResizeStart}
        aria-hidden="true"
      />
    </div>
  );
}

function adjustHeight(
  textarea: HTMLTextAreaElement,
  getMaxHeight: () => number,
) {
  textarea.style.height = "auto";
  const newHeight = Math.min(textarea.scrollHeight, getMaxHeight());
  textarea.style.height = `${newHeight}px`;
}

function createResizeState(minHeight: number) {
  let startY = 0;
  let startHeight = 0;

  return {
    capture(clientY: number, currentHeight: number) {
      startY = clientY;
      startHeight = currentHeight;
    },
    calculateNewHeight(clientY: number, maxHeight: number) {
      const deltaY = clientY - startY;
      return Math.max(minHeight, Math.min(startHeight + deltaY, maxHeight));
    },
  };
}

function createResizeListeners(
  onMove: (e: PointerEvent) => void,
  onEnd: () => void,
) {
  const isBrowser = typeof document !== "undefined";

  return {
    add() {
      if (isBrowser) {
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onEnd);
      }
    },
    remove() {
      if (isBrowser) {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onEnd);
      }
    },
  };
}

function resolveCounterVariant(
  count: number,
  minLength: number,
  maxLength: number,
): SemanticVariant {
  const ratio = count / maxLength;

  if (count < minLength || ratio >= TEXTAREA_CHAR_LIMIT_ERROR_THRESHOLD) {
    return "error";
  }

  if (ratio >= TEXTAREA_CHAR_LIMIT_WARNING_THRESHOLD) {
    return "warning";
  }

  return "info";
}

export type { TextareaProps };
export { Textarea };
