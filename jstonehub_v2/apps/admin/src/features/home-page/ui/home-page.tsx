import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";
import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { env } from "#admin/shared/config/env";

type QuickLink = {
  to: string;
  label: string;
  description: string;
};

type SystemNotification = {
  status: "success" | "warning" | "error" | "info";
  message: string;
};

type StatCard = {
  title: string;
  value: string;
  description: string;
  badge: {
    label: string;
    variant: "success" | "info" | "warning" | "muted";
  };
};

const QUICK_LINKS: QuickLink[] = [
  {
    to: "/secret-voicer/credentials",
    label: "Credentials",
    description: "Управление API ключами",
  },
  {
    to: "/browser-fingerprints",
    label: "Fingerprints",
    description: "Браузерные профили",
  },
  {
    to: "/secret-voicer/voices",
    label: "Voices",
    description: "Голосовые модели",
  },
];

const NOTIFICATIONS: SystemNotification[] = [
  { status: "success", message: "API v1 работает стабильно" },
  { status: "info", message: "Доступно 3 новых голоса" },
  { status: "warning", message: "Требуется обновление credentials" },
];

const STATS: StatCard[] = [
  {
    title: "Fingerprints",
    value: "12",
    description: "Активных профилей",
    badge: { label: "Active", variant: "success" },
  },
  {
    title: "Credentials",
    value: "5",
    description: "API ключей",
    badge: { label: "Ready", variant: "info" },
  },
  {
    title: "Система",
    value: "OK",
    description: "Uptime 99.9%",
    badge: { label: "Healthy", variant: "success" },
  },
];

function HomePage() {
  return (
    <Container class="py-8 space-y-8">
      <HomePageHeader />
      <StatsSection />
      <div class="grid gap-6 lg:grid-cols-2">
        <QuickAccessCard />
        <NotificationsCard />
      </div>
    </Container>
  );
}

function HomePageHeader() {
  return (
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
      <div class="space-y-1">
        <Typography type="title" level={1}>
          Admin Dashboard
        </Typography>
        <Typography color="muted" level={2}>
          Панель управления JStoneHub
        </Typography>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="btn-sm">
          Настройки
        </Button>
        <Button variant="secondary" size="btn-sm">
          {(classes) => (
            <a class={classes} href={env.HUB_URL}>
              Перейти в Hub
            </a>
          )}
        </Button>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <For each={STATS}>{(stat) => <StatCardItem stat={stat} />}</For>
    </div>
  );
}

function StatCardItem(props: { stat: StatCard }) {
  return (
    <Card
      padding="md"
      title={
        <>
          <span class="mr-3">{props.stat.title}</span>
          <Badge variant={props.stat.badge.variant} size="sm">
            {props.stat.badge.label}
          </Badge>
        </>
      }
      description={props.stat.description}
    />
  );
}

function QuickAccessCard() {
  return (
    <Card
      title="Быстрый доступ"
      description="Часто используемые разделы"
      content={
        <div class="grid gap-2">
          <For each={QUICK_LINKS}>
            {(link) => (
              <Button
                variant="ghost"
                size="btn-sm"
                class="justify-start h-auto py-3"
              >
                {(classes) => (
                  <Link class={classes} to={link.to}>
                    <div class="text-left">
                      <Typography level={4} class="font-medium text-current">
                        {link.label}
                      </Typography>
                      <Typography level={5} color="muted" class="text-current">
                        {link.description}
                      </Typography>
                    </div>
                  </Link>
                )}
              </Button>
            )}
          </For>
        </div>
      }
    />
  );
}

function NotificationsCard() {
  return (
    <Card
      title="Уведомления"
      description="Статус системы"
      content={
        <div class="space-y-3">
          <For each={NOTIFICATIONS}>
            {(notification) => <NotificationItem notification={notification} />}
          </For>
        </div>
      }
      footer={
        <Typography level={5} color="muted">
          Обновлено только что
        </Typography>
      }
    />
  );
}

function NotificationItem(props: { notification: SystemNotification }) {
  const statusColors = {
    success: "bg-success-foreground",
    warning: "bg-warning-foreground",
    error: "bg-error-foreground",
    info: "bg-info-foreground",
  };

  return (
    <div class="flex items-center gap-3">
      <span
        class={`w-2 h-2 rounded-full ${statusColors[props.notification.status]}`}
      />
      <Typography level={4} color="muted">
        {props.notification.message}
      </Typography>
    </div>
  );
}

export { HomePage };
