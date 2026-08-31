import { Button, LoadingButton } from "@packages/ui/action";
import { Alert } from "@packages/ui/feedback";
import { H1 } from "@packages/ui/typography";
import { RotateCcw } from "lucide-solid";
import { Show } from "solid-js";

import { AudioProcessingConfigPanel } from "./_audio-processing-config";
import { FileDropZone } from "./_file-drop-zone";
import { FileList } from "./_file-list";
import { JobHistory } from "./_job-history";
import { useAudioProcessing } from "./_use-audio-processing";

function AudioProcessingPage() {
  const state = useAudioProcessing();

  const showReset = () => state.phase() !== "idle" || state.files().length > 0;

  return (
    <div class="p-6 space-y-6 max-w-2xl">
      <PageHeader showReset={showReset()} onReset={state.handleReset} />

      <FileDropZone
        onFilesSelected={state.handleFilesSelected}
        disabled={state.isLocked()}
      />

      <Show when={state.files().length > 0}>
        <FileList
          files={state.files()}
          onRemove={state.handleRemoveFile}
          removable={!state.isLocked()}
        />
      </Show>

      <AudioProcessingConfigPanel
        config={state.config()}
        onConfigChange={state.setConfig}
      />

      <ProcessButton
        phase={state.phase()}
        canProcess={state.canProcess()}
        onClick={state.handleUploadAndProcess}
      />

      <Show when={state.phase() === "uploading"}>
        <div class="text-sm text-subtle">Uploading files…</div>
      </Show>

      <Show when={state.phase() === "processing"}>
        <div class="text-sm text-subtle">
          Processing started. Your job will appear below.
        </div>
      </Show>

      <Show when={state.phase() === "error"}>
        <Alert
          variant="error"
          title="Error"
          description={state.errorMessage()}
          onClose={() => state.setPhase("idle")}
          closeAriaLabel="Dismiss error"
        />
      </Show>

      <JobHistory refreshTrigger={state.refreshTrigger()} />
    </div>
  );
}

function PageHeader(props: { showReset: boolean; onReset: () => void }) {
  return (
    <div class="flex items-center justify-between">
      <H1>Audio Processing</H1>
      <Show when={props.showReset}>
        <Button variant="ghost" size="sm" onClick={props.onReset}>
          <RotateCcw size={14} />
          Reset
        </Button>
      </Show>
    </div>
  );
}

function ProcessButton(props: {
  phase: string;
  canProcess: boolean;
  onClick: () => void;
}) {
  return (
    <Show when={props.phase === "idle" || props.phase === "ready"}>
      <LoadingButton
        variant="primary"
        size="md"
        loading={false}
        disabled={!props.canProcess}
        onClick={props.onClick}
      >
        Process
      </LoadingButton>
    </Show>
  );
}

export { AudioProcessingPage };
