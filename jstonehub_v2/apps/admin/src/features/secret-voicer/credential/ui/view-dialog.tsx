import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Tooltip } from "@packages/ui/tooltip";
import { Typography } from "@packages/ui/typography";
import { Archive, CheckCircle2, Copy, Edit } from "lucide-solid";
import {
  formatSecretVoicerCredentialDate,
  maskSecretVoicerCredentialToken,
} from "../lib/helpers";
import type { SecretVoicerCredential } from "../model/types";

export function ViewSecretVoicerCredentialDialog(props: {
  open: boolean;
  credential: SecretVoicerCredential;
  fingerprintName: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const credential = () => props.credential;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={credential().name}
      description="Детали учётных данных Secret Voicer"
      class="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={props.onClose}>
            Закрыть
          </Button>
          <Button onClick={props.onUpdate}>
            <Edit class="w-4 h-4" />
            Редактировать
          </Button>
        </>
      }
    >
      <div class="space-y-6">
        {/* Status & Date */}
        <div class="flex items-center gap-3">
          {credential().isActive ? (
            <Badge variant="success" size="lg">
              <CheckCircle2 class="w-4 h-4" />
              Активен
            </Badge>
          ) : (
            <Badge variant="muted" size="lg">
              <Archive class="w-4 h-4" />
              Неактивен
            </Badge>
          )}
          <Typography level={5} color="muted">
            Создан: {formatSecretVoicerCredentialDate(credential().createdAt)}
          </Typography>
        </div>

        {/* Fingerprint */}
        <div class="space-y-1">
          <Typography level={5} color="muted">
            Browser Fingerprint
          </Typography>
          <Typography level={4} class="font-medium">
            {props.fingerprintName}
          </Typography>
        </div>

        {/* CSRF Token */}
        <div class="space-y-2">
          <Typography level={5} color="muted">
            CSRF Token
          </Typography>
          <div class="relative">
            <code class="block p-3 bg-muted rounded-lg text-xs font-mono text-muted-foreground break-all border border-border">
              {maskSecretVoicerCredentialToken(credential().csrfToken)}
            </code>
            <Tooltip label="Копировать полный токен">
              {(triggerProps) => (
                <Button
                  ref={triggerProps.ref}
                  onMouseEnter={triggerProps.onMouseEnter}
                  onMouseLeave={triggerProps.onMouseLeave}
                  onFocus={triggerProps.onFocus}
                  onBlur={triggerProps.onBlur}
                  variant="ghost"
                  size="icon-sm"
                  class="absolute top-2 right-2"
                  onClick={() => handleCopy(credential().csrfToken)}
                >
                  <Copy class="w-4 h-4" />
                </Button>
              )}
            </Tooltip>
          </div>
        </div>

        {/* Session ID */}
        <div class="space-y-2">
          <Typography level={5} color="muted">
            Session ID
          </Typography>
          <div class="relative">
            <code class="block p-3 bg-muted rounded-lg text-xs font-mono text-muted-foreground break-all border border-border">
              {maskSecretVoicerCredentialToken(credential().sessionId)}
            </code>
            <Tooltip label="Копировать полный Session ID">
              {(triggerProps) => (
                <Button
                  ref={triggerProps.ref}
                  onMouseEnter={triggerProps.onMouseEnter}
                  onMouseLeave={triggerProps.onMouseLeave}
                  onFocus={triggerProps.onFocus}
                  onBlur={triggerProps.onBlur}
                  variant="ghost"
                  size="icon-sm"
                  class="absolute top-2 right-2"
                  onClick={() => handleCopy(credential().sessionId)}
                >
                  <Copy class="w-4 h-4" />
                </Button>
              )}
            </Tooltip>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
