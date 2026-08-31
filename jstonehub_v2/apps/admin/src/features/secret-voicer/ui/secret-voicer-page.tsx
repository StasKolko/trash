import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";

export function SecretVoicerPage() {
  return (
    <Container class="py-8">
      <Typography type="title" level={1}>
        Secret Voicer Management
      </Typography>
      <Typography color="muted" class="mt-2">
        Управление голосовыми профилями и настройками синтеза
      </Typography>
    </Container>
  );
}
