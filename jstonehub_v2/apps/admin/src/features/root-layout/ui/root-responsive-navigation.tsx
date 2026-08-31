import { Button } from "@packages/ui/button";
import { Logo } from "@packages/ui/logo";
import { ResponsiveNavigation } from "@packages/ui/responsive-navigation";
import { Link } from "@tanstack/solid-router";
import { env } from "#admin/shared/config/env";

export function RootResponsiveNavigation() {
  return (
    <ResponsiveNavigation>
      <div class="flex items-center gap-6">
        <Link to="/">
          <Logo appName="admin" />
        </Link>

        <nav class="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="btn-sm">
            {(classes) => (
              <Link
                class={classes}
                to="/secret-voicer"
                activeProps={{ class: "bg-accent/15 text-accent" }}
              >
                Secret Voicer
              </Link>
            )}
          </Button>
          <Button variant="ghost" size="btn-sm">
            {(classes) => (
              <Link
                class={classes}
                to="/browser-fingerprints"
                activeProps={{ class: "bg-accent/15 text-accent" }}
              >
                Fingerprints
              </Link>
            )}
          </Button>
        </nav>
      </div>

      <Button variant="secondary" size="btn-sm">
        {(classes) => (
          <a class={classes} href={env.HUB_URL}>
            to Hub
          </a>
        )}
      </Button>
    </ResponsiveNavigation>
  );
}
