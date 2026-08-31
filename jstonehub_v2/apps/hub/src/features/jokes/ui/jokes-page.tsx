import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";

export function JokesPage() {
  return (
    <Container class="py-8">
      <Typography type="title" level={1}>
        Анекдоты
      </Typography>
      <Typography color="muted" class="mt-2">
        Коллекция лучших анекдотов для озвучки
      </Typography>
    </Container>
  );
}
