import { cn } from "@packages/utils/css";
import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Heading, Text } from "../../typography";
import type { TypographyLevel } from "../../typography/types";
import {
  baseClasses,
  contentClasses,
  footerClasses,
  headerClasses,
  levelGap,
  levelInnerGap,
  levelPadding,
} from "./card.styles";

const DEFAULT_LEVEL: TypographyLevel = 3;

export function Card(props: {
  class?: string;
  level?: TypographyLevel;
  titleId?: string;
  descriptionId?: string;
  title: JSX.Element;
  description: JSX.Element;
  content?: JSX.Element;
  footer?: JSX.Element;
}) {
  const level = () => props.level ?? DEFAULT_LEVEL;

  return (
    <div
      data-testid="Card"
      class={cn(
        baseClasses,
        levelPadding[level()],
        levelGap[level()],
        props.class,
      )}
    >
      <header
        data-testid="CardHeader"
        class={cn(headerClasses, levelInnerGap[level()])}
      >
        <Heading id={props.titleId} level={level()}>
          {props.title}
        </Heading>
        <Text id={props.descriptionId} level={level()}>
          {props.description}
        </Text>
      </header>

      <Show when={props.content}>
        <div
          data-testid="CardContent"
          class={cn(contentClasses, levelInnerGap[level()])}
        >
          {props.content}
        </div>
      </Show>

      <Show when={props.footer}>
        <footer
          data-testid="CardFooter"
          class={cn(footerClasses, levelInnerGap[level()])}
        >
          {props.footer}
        </footer>
      </Show>
    </div>
  );
}
