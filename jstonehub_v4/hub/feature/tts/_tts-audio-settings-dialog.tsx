import type { AudioProcessingUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

import { Button } from "@packages/ui/action";
import { Dialog } from "@packages/ui/overlay";
import { createEffect, createSignal } from "solid-js";

import { AudioProcessingConfigPanel } from "#hub/feature/audio-processing/_audio-processing-config";

type TtsAudioSettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  config: AudioProcessingUserConfig;
  onConfigChange: (config: AudioProcessingUserConfig) => void;
};

function TtsAudioSettingsDialog(props: TtsAudioSettingsDialogProps) {
  const [local, setLocal] = createSignal<AudioProcessingUserConfig>(
    props.config,
  );

  // Sync local state when dialog opens
  createEffect(() => {
    if (props.open) {
      setLocal(props.config);
    }
  });

  function handleSave() {
    props.onConfigChange(local());
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={props.onClose}
      title="Audio Processing Settings"
      description="Configure silence removal, normalization, gaps and output format."
      content={() => (
        <AudioProcessingConfigPanel
          config={local()}
          onConfigChange={setLocal}
          showNameField={false}
        />
      )}
      footer={() => (
        <div class="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Apply
          </Button>
        </div>
      )}
    />
  );
}

export { TtsAudioSettingsDialog };
