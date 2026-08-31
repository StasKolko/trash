import { Button } from "@packages/ui/button";
import { cn } from "@packages/utils/css";
import { Link, useLocation } from "@tanstack/solid-router";
import { For, type JSX, type ParentProps } from "solid-js";

type NavItem = {
  to: string;
  label: string;
  icon?: JSX.Element;
};

function SectionLayout(
  props: ParentProps<{
    title: string;
    description?: string;
    navItems: NavItem[];
  }>,
) {
  return (
    <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Sidebar */}
      <aside class="lg:w-56 shrink-0">
        <div class="sticky top-20">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-foreground">{props.title}</h2>
            {props.description && (
              <p class="text-sm text-muted-foreground mt-1">
                {props.description}
              </p>
            )}
          </div>
          <nav class="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <For each={props.navItems}>
              {(item) => <SectionNavItem item={item} />}
            </For>
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main class="flex-1 min-w-0">{props.children}</main>
    </div>
  );
}

function SectionNavItem(props: { item: NavItem }) {
  const location = useLocation();

  // Проверяем точное совпадение или начало пути
  const isActive = () => {
    const current = location().pathname;
    return current === props.item.to || current.startsWith(`${props.item.to}/`);
  };

  return (
    <Button
      variant="ghost"
      size="btn-sm"
      class={cn(
        "justify-start whitespace-nowrap gap-2",
        isActive() && "bg-accent/15 text-accent",
      )}
    >
      {(classes) => (
        <Link class={classes} to={props.item.to}>
          {props.item.icon}
          {props.item.label}
        </Link>
      )}
    </Button>
  );
}

export type { NavItem };
export { SectionLayout };
