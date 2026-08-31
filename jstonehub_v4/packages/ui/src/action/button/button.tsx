import type {
  ButtonProps,
  ButtonType,
  IconButtonProps,
  LoadingButtonProps,
} from "./button.type";

import { Show, splitProps } from "solid-js";

import { DEFAULT_COMPONENT_SIZE } from "../../_model/constant";
import { Loader } from "../../_primitive/loader/loader";
import { BUTTON_LOADER_SIZE } from "./_button.style";
import { resolveButtonClasses } from "./button.util";

const DEFAULT_TYPE: ButtonType = "button";

function LoadingButton(props: LoadingButtonProps) {
  const [local, rest] = splitProps(props, [
    "data-loader-testid",
    "type",
    "variant",
    "size",
    "class",
    "disabled",
    "loading",
    "children",
  ]);

  const type = () => local.type ?? DEFAULT_TYPE;
  const size = () => local.size ?? DEFAULT_COMPONENT_SIZE;
  const isDisabled = () => local.disabled || local.loading;
  const classes = () =>
    resolveButtonClasses({
      variant: local.variant,
      size: local.size,
      class: local.class,
      disabled: isDisabled(),
    });

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <button
      type={type()}
      disabled={isDisabled()}
      aria-busy={local.loading}
      class={classes()}
      {...rest}
    >
      <Show when={local.loading}>
        <Loader
          data-testid={local["data-loader-testid"]}
          size={BUTTON_LOADER_SIZE[size()]}
        />
      </Show>
      {local.children}
    </button>
  );
}

function IconButton(props: IconButtonProps) {
  const [local, rest] = splitProps(props, [
    "type",
    "variant",
    "size",
    "class",
    "disabled",
  ]);

  const type = () => local.type ?? DEFAULT_TYPE;
  const classes = () =>
    resolveButtonClasses({
      icon: true,
      variant: local.variant,
      size: local.size,
      class: local.class,
      disabled: local.disabled,
    });

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <button
      type={type()}
      disabled={local.disabled}
      class={classes()}
      {...rest}
    />
  );
}

function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    "type",
    "variant",
    "size",
    "class",
    "disabled",
  ]);

  const type = () => local.type ?? DEFAULT_TYPE;
  const classes = () =>
    resolveButtonClasses({
      variant: local.variant,
      size: local.size,
      class: local.class,
      disabled: local.disabled,
    });

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <button
      type={type()}
      disabled={local.disabled}
      class={classes()}
      {...rest}
    />
  );
}

export { Button, DEFAULT_TYPE, IconButton, LoadingButton };
