import { Button } from "@packages/ui/button";
import { Logo } from "@packages/ui/logo";
import { Popover } from "@packages/ui/popover";
import { ResponsiveNavigation } from "@packages/ui/responsive-navigation";
import { Link } from "@tanstack/solid-router";
import { Menu, Mic, Music, Volume2 } from "lucide-solid";
import { createSignal, For } from "solid-js";
import { env } from "#hub/shared/config/env";

export function RootResponsiveNavigation() {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  // biome-ignore lint/suspicious/noUnassignedVariables: FALSE_POSITIVE <SOLIDJS_REACTIVITY>
  let menuButtonRef: HTMLButtonElement | undefined;

  const navLinks = [
    { to: "/voiceover", label: "Озвучка", icon: Mic },
    { to: "/audio-processing", label: "Обработка аудио", icon: Volume2 },
    { to: "/jokes", label: "Анекдоты", icon: Music },
  ];

  const menuContent = (
    <div class="flex flex-col gap-1 min-w-[200px] p-2">
      <For each={navLinks}>
        {(link) => (
          <Button
            variant="ghost"
            class="justify-start"
            onClick={() => setIsMenuOpen(false)}
          >
            {(classes) => (
              <Link class={classes} to={link.to}>
                <link.icon class="w-4 h-4" />
                {link.label}
              </Link>
            )}
          </Button>
        )}
      </For>
    </div>
  );

  return (
    <ResponsiveNavigation>
      <div class="flex items-center gap-6">
        <Link to="/">
          <Logo appName="hub" />
        </Link>

        <nav class="hidden md:flex items-center gap-1">
          <For each={navLinks}>
            {(link) => (
              <Button variant="ghost" size="btn-sm">
                {(classes) => (
                  <Link
                    class={classes}
                    to={link.to}
                    activeProps={{ class: "bg-accent/15 text-accent" }}
                  >
                    <link.icon class="w-4 h-4" />
                    {link.label}
                  </Link>
                )}
              </Button>
            )}
          </For>
        </nav>

        <div class="md:hidden">
          <Button
            ref={menuButtonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen())}
            variant="ghost"
            size="icon-sm"
          >
            <Menu class="w-5 h-5" />
          </Button>

          <Popover
            open={isMenuOpen()}
            onOpenChange={setIsMenuOpen}
            anchor={menuButtonRef}
            content={menuContent}
            placement="bottom-end"
          />
        </div>
      </div>

      <Button variant="secondary" size="btn-sm">
        {(classes) => (
          <a class={classes} href={env.ADMIN_URL}>
            to Admin
          </a>
        )}
      </Button>
    </ResponsiveNavigation>
  );
}
