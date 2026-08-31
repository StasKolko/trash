import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";
import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { env } from "#hub/shared/config/env";

type Feature = {
  icon: string;
  title: string;
  description: string;
  to: string;
};

const FEATURES: Feature[] = [
  {
    icon: "🎙️",
    title: "Voiceover",
    description: "Генерация озвучки с использованием AI голосов",
    to: "/voiceover",
  },
  {
    icon: "😄",
    title: "Анекдоты",
    description: "Коллекция контента для озвучивания",
    to: "/jokes",
  },
  {
    icon: "📚",
    title: "Документация",
    description: "Руководство по использованию платформы",
    to: "/docs",
  },
];

function HomePage() {
  return (
    <div class="flex-1 flex flex-col justify-center">
      <Container>
        <div class="max-w-3xl mx-auto text-center space-y-10">
          <HeroSection />
          <ActionsSection />
          <FeaturesSection />
        </div>
      </Container>
    </div>
  );
}

function HeroSection() {
  return (
    <div class="space-y-4">
      <Typography type="title" level={1} class="text-5xl md:text-6xl">
        JStone <span class="text-primary">Hub</span>
      </Typography>
      <Typography level={1} color="muted" class="max-w-xl mx-auto">
        Единая платформа для создания голосового контента. Генерируйте озвучку,
        управляйте проектами и автоматизируйте процессы.
      </Typography>
    </div>
  );
}

function ActionsSection() {
  return (
    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <Button size="btn-lg">
        {(classes) => (
          <Link class={classes} to="/voiceover">
            Начать работу
          </Link>
        )}
      </Button>
      <Button variant="outline" size="btn-lg">
        {(classes) => (
          <a class={classes} href={env.ADMIN_URL}>
            Admin Panel
          </a>
        )}
      </Button>
    </div>
  );
}

function FeaturesSection() {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
      <For each={FEATURES}>
        {(feature) => <FeatureCard feature={feature} />}
      </For>
    </div>
  );
}
function FeatureCard(props: { feature: Feature }) {
  return (
    <Link to={props.feature.to} class="block text-left">
      <Card
        interactive={true}
        padding="md"
        title={
          <>
            <span class="mr-2">{props.feature.icon}</span>
            {props.feature.title}
          </>
        }
        description={props.feature.description}
      />
    </Link>
  );
}

export { HomePage };
