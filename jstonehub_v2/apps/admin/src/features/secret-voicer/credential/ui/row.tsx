import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Popover } from "@packages/ui/popover";
import { Tooltip } from "@packages/ui/tooltip";
import { Typography } from "@packages/ui/typography";
import { cn } from "@packages/utils/css";
import {
  Archive,
  CheckCircle2,
  Edit,
  Eye,
  Key,
  MoreHorizontal,
  Trash2,
} from "lucide-solid";
import { createSignal, type JSX } from "solid-js";
import { maskSecretVoicerCredentialToken } from "../lib/helpers";
import type { SecretVoicerCredential } from "../model/types";

function SecretVoicerCredentialRow(props: {
  credential: SecretVoicerCredential;
  fingerprintName: string;
  onView: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [anchorRef, setAnchorRef] = createSignal<HTMLButtonElement>();

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <tr class="hover:bg-muted/50 transition-colors group">
      <td class="p-4">
        <div class="flex items-center gap-2">
          <Key class="w-4 h-4 text-muted-foreground" />
          <Typography level={4} class="font-medium">
            {props.credential.name}
          </Typography>
        </div>
      </td>

      <td class="p-4">
        <Typography level={4} color="muted">
          {props.fingerprintName}
        </Typography>
      </td>

      <td class="p-4 hidden md:table-cell">
        <code class="px-2 py-1 bg-muted rounded text-xs text-muted-foreground font-mono border border-border">
          {maskSecretVoicerCredentialToken(props.credential.sessionId)}
        </code>
      </td>

      <td class="p-4">
        {props.credential.isActive ? (
          <Badge variant="success">
            <CheckCircle2 class="w-3 h-3" />
            Активен
          </Badge>
        ) : (
          <Badge variant="muted">
            <Archive class="w-3 h-3" />
            Неактивен
          </Badge>
        )}
      </td>

      <td class="p-4 text-right">
        <Tooltip label="Действия">
          {(triggerProps) => (
            <Button
              ref={(el) => {
                triggerProps.ref(el);
                setAnchorRef(el);
              }}
              onMouseEnter={triggerProps.onMouseEnter}
              onMouseLeave={triggerProps.onMouseLeave}
              onFocus={triggerProps.onFocus}
              onBlur={triggerProps.onBlur}
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(!isOpen())}
            >
              <MoreHorizontal class="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            </Button>
          )}
        </Tooltip>

        <Popover
          open={isOpen()}
          onChange={setIsOpen}
          anchor={anchorRef()}
          placement="bottom-end"
          content={
            <div class="p-1 min-w-[160px]">
              <DropdownItem onClick={() => handleAction(props.onView)}>
                <Eye class="w-4 h-4" />
                Просмотр
              </DropdownItem>
              <DropdownItem onClick={() => handleAction(props.onUpdate)}>
                <Edit class="w-4 h-4" />
                Редактировать
              </DropdownItem>
              <DropdownItem onClick={() => handleAction(props.onToggleStatus)}>
                {props.credential.isActive ? (
                  <>
                    <Archive class="w-4 h-4" />
                    Деактивировать
                  </>
                ) : (
                  <>
                    <CheckCircle2 class="w-4 h-4" />
                    Активировать
                  </>
                )}
              </DropdownItem>
              <div class="h-px bg-border my-1" />
              <DropdownItem
                variant="danger"
                onClick={() => handleAction(props.onDelete)}
              >
                <Trash2 class="w-4 h-4" />
                Удалить
              </DropdownItem>
            </div>
          }
        />
      </td>
    </tr>
  );
}

function DropdownItem(props: {
  onClick: () => void;
  variant?: "default" | "danger";
  children: JSX.Element;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
        props.variant === "danger"
          ? "text-error-foreground hover:bg-error/10"
          : "text-foreground hover:bg-muted",
      )}
    >
      {props.children}
    </button>
  );
}

export { SecretVoicerCredentialRow };
