import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";
import type { RoleVoiceMapping } from "@packages/contract/segment";

import { Button, IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { P } from "@packages/ui/typography";
import { Mic, X } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { VoicePickerDialog } from "../voice-picker/voice-picker.dialog";
import { useVoicePreview } from "../voice-picker/voice-picker-preview";

type RoleVoiceMappingPanelProps = {
  mappings: RoleVoiceMapping[];
  onMappingsChange: (mappings: RoleVoiceMapping[]) => void;
  voices: SecretVoicerVoice[];
  voicesLoading: boolean;
  disabled?: boolean;
  previewApi: {
    getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
  };
};

const VOICE_AVATAR_SMALL_SIZE = 20;

function RoleVoiceMappingPanel(props: RoleVoiceMappingPanelProps) {
  const [pickerOpen, setPickerOpen] = createSignal(false);
  const [activeRole, setActiveRole] = createSignal<string | null>(null);
  const preview = useVoicePreview(props.previewApi);

  const assignedVoiceIds = () => {
    const ids: string[] = [];
    for (const m of props.mappings) {
      if (m.voiceId) {
        ids.push(m.voiceId);
      }
    }
    return ids;
  };

  const activeMapping = () => {
    const role = activeRole();
    return role ? props.mappings.find((m) => m.role === role) : null;
  };

  const disabledVoiceIds = () => {
    const role = activeRole();
    return assignedVoiceIds().filter((id) => {
      const mapping = props.mappings.find((m) => m.voiceId === id);
      return mapping && mapping.role !== role;
    });
  };

  const allMapped = () =>
    props.mappings.length > 0
    && props.mappings.every((m) => m.voiceId !== null);

  function getVoiceByid(voiceId: string | null): SecretVoicerVoice | null {
    if (!voiceId) {
      return null;
    }
    return props.voices.find((v) => v.voiceId === voiceId) ?? null;
  }

  function handleOpenPicker(role: string) {
    setActiveRole(role);
    setPickerOpen(true);
  }

  function handleSelectVoice(voiceId: string) {
    const role = activeRole();
    if (!role) {
      return;
    }

    const updated = props.mappings.map((m) =>
      m.role === role ? { ...m, voiceId } : m,
    );
    props.onMappingsChange(updated);
    setPickerOpen(false);
    setActiveRole(null);
  }

  function handleClearVoice(role: string) {
    const updated = props.mappings.map((m) =>
      m.role === role ? { ...m, voiceId: null } : m,
    );
    props.onMappingsChange(updated);
  }

  function handleClosePicker() {
    setPickerOpen(false);
    setActiveRole(null);
    preview.stopPlayback();
  }

  return (
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <P level={2} class="font-medium">
          Voice Assignment
        </P>
        <Show when={allMapped()}>
          <Badge variant="success" size="sm" aria-label="All roles mapped">
            All assigned
          </Badge>
        </Show>
      </div>

      <Show when={props.mappings.length === 0}>
        <div class="text-sm text-subtle py-4 text-center">
          Add segments with roles to assign voices.
        </div>
      </Show>

      <div class="space-y-2">
        <For each={props.mappings}>
          {(mapping) => {
            const voice = () => getVoiceByid(mapping.voiceId);

            return (
              <RoleMappingRow
                role={mapping.role}
                voice={voice()}
                disabled={props.disabled ?? false}
                onPickVoice={() => handleOpenPicker(mapping.role)}
                onClearVoice={() => handleClearVoice(mapping.role)}
              />
            );
          }}
        </For>
      </div>

      <VoicePickerDialog
        open={pickerOpen()}
        onClose={handleClosePicker}
        onSelect={handleSelectVoice}
        voices={props.voices}
        loading={props.voicesLoading}
        selectedVoiceId={activeMapping()?.voiceId ?? null}
        disabledVoiceIds={disabledVoiceIds()}
        onPreviewPlay={preview.togglePreview}
        playingVoiceId={preview.playingVoiceId()}
      />
    </div>
  );
}

function RoleMappingRow(props: {
  role: string;
  voice: SecretVoicerVoice | null;
  disabled: boolean;
  onPickVoice: () => void;
  onClearVoice: () => void;
}) {
  return (
    <div class="flex items-center gap-3 rounded-lg border border-border p-3 bg-card">
      <div class="flex items-center gap-2 min-w-[100px]">
        <Mic size={14} class="text-subtle shrink-0" />
        <span class="text-sm font-medium truncate">{props.role}</span>
      </div>

      <div class="flex-1 min-w-0">
        <Show
          when={props.voice}
          fallback={
            <Button
              variant="outline"
              size="sm"
              disabled={props.disabled}
              onClick={props.onPickVoice}
            >
              Select voice...
            </Button>
          }
        >
          {(voice) => (
            <div class="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                class="gap-2"
                disabled={props.disabled}
                onClick={props.onPickVoice}
              >
                <VoiceAvatarSmall
                  avatarUrl={voice().avatarUrl}
                  name={voice().name}
                />
                <span class="truncate max-w-[150px]">{voice().name}</span>
                <Badge
                  variant={voice().gender === "MALE" ? "info" : "warning"}
                  size="sm"
                  aria-label={voice().gender}
                >
                  {voice().gender === "MALE" ? "M" : "F"}
                </Badge>
              </Button>

              <Show when={!props.disabled}>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={`Clear voice for ${props.role}`}
                  onClick={props.onClearVoice}
                >
                  <X size={14} />
                </IconButton>
              </Show>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}

function VoiceAvatarSmall(props: { avatarUrl: string | null; name: string }) {
  return (
    <Show
      when={props.avatarUrl}
      fallback={
        <div class="w-[20px] h-[20px] rounded-full bg-secondary shrink-0" />
      }
    >
      {(url) => (
        <img
          src={url()}
          alt={props.name}
          width={VOICE_AVATAR_SMALL_SIZE}
          height={VOICE_AVATAR_SMALL_SIZE}
          class="w-[20px] h-[20px] rounded-full object-cover shrink-0"
        />
      )}
    </Show>
  );
}

export type { RoleVoiceMappingPanelProps };
export { RoleVoiceMappingPanel };
