import type { JSX } from "solid-js";

import { cn } from "@packages/util/css";

import { FORM_ROOT_STYLE } from "./_form.style";

type FormProps = {
  "data-testid"?: string;
  class?: string;
  onSubmit: () => void;
  children: JSX.Element;
};

function Form(props: FormProps) {
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    props.onSubmit();
  }

  return (
    <form
      data-testid={props["data-testid"]}
      class={cn(FORM_ROOT_STYLE, props.class)}
      noValidate={true}
      onSubmit={handleSubmit}
    >
      {props.children}
    </form>
  );
}

export type { FormProps };
export { Form };
