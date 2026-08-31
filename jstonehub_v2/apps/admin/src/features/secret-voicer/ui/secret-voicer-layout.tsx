import { Container } from "@packages/ui/container";
import { Outlet } from "@tanstack/solid-router";
import { FileText, Key, Mic, Settings } from "lucide-solid";
import { type NavItem, SectionLayout } from "#admin/shared/ui/section-layout";

const NAV_ITEMS: NavItem[] = [
  {
    to: "/secret-voicer/credentials",
    label: "Credentials",
    icon: <Key class="w-4 h-4" />,
  },
  {
    to: "/secret-voicer/voices",
    label: "Voices",
    icon: <Mic class="w-4 h-4" />,
  },
  {
    to: "/secret-voicer/sync-logs",
    label: "Sync Logs",
    icon: <FileText class="w-4 h-4" />,
  },
  {
    to: "/secret-voicer/settings",
    label: "Settings",
    icon: <Settings class="w-4 h-4" />,
  },
];

export function SecretVoicerLayout() {
  return (
    <Container class="py-8">
      <SectionLayout
        title="Secret Voicer"
        description="Управление голосовым синтезом"
        navItems={NAV_ITEMS}
      >
        <Outlet />
      </SectionLayout>
    </Container>
  );
}
