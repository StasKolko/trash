import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Typography } from "@packages/ui/typography";
import { Trash2 } from "lucide-solid";
import { createSignal } from "solid-js";
import type { SecretVoicerCredential } from "../model/types";

export function DeleteSecretVoicerCredentialDialog(props: {
  open: boolean;
  credential: SecretVoicerCredential;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = createSignal(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await props.onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      onChange={(open) => !open && props.onClose()}
      title="Удалить учётные данные?"
      description="Это действие необратимо"
      footer={
        <>
          <Button
            variant="outline"
            onClick={props.onClose}
            disabled={isDeleting()}
          >
            Отмена
          </Button>
          <Button
            variant="error"
            onClick={handleConfirm}
            disabled={isDeleting()}
          >
            <Trash2 class="w-4 h-4" />
            {isDeleting() ? "Удаление..." : "Удалить"}
          </Button>
        </>
      }
    >
      <Typography color="muted">
        Вы уверены, что хотите удалить{" "}
        <span class="font-medium text-foreground">{props.credential.name}</span>
        ? Связанные с ними проекты синтеза перестанут работать.
      </Typography>
    </Dialog>
  );
}
