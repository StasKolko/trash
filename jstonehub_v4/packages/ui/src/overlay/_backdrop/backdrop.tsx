import { BACKDROP_ROOT_STYLE } from "./_backdrop.style";

export function Backdrop(props: {
  "data-testid"?: string;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <div
      data-testid={props["data-testid"]}
      aria-hidden="true"
      class={BACKDROP_ROOT_STYLE}
      style={{ opacity: props.visible ? 1 : 0 }}
      onClick={props.onClose}
    />
  );
}
