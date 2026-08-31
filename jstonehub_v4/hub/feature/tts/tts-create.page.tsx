import { Button, LoadingButton } from "@packages/ui/action";
import { Alert } from "@packages/ui/feedback";
import { TextareaField, TextInputField } from "@packages/ui/form";
import { toast } from "@packages/ui/overlay";
import { H1, H3 } from "@packages/ui/typography";
import { useNavigate } from "@tanstack/solid-router";
import { Show } from "solid-js";

import {
  RoleVoiceMappingPanel,
  SegmentEditor,
} from "#hub/shared/ui/segment-editor";

import { TtsAudioSection } from "./_tts-audio-section";
import { useTtsCreateState } from "./_use-tts-create";
import { clearDraft } from "./_use-tts-draft";
import { ttsApi } from "./tts.api";
import { createTtsProjectMutation, createVoicesQuery } from "./tts.query";

function TtsCreatePage() {
  const navigate = useNavigate({ from: "/tool/tts/create" });
  const state = useTtsCreateState();
  const voicesQuery = createVoicesQuery();
  const createMutation = createTtsProjectMutation();

  const voices = () => voicesQuery.data ?? [];

  const previewApi = {
    getPreviewUrl: async (voiceId: string, url: string): Promise<string> => {
      const result = await ttsApi.getPreviewUrl(voiceId, url);
      return result.downloadUrl;
    },
  };

  function handleSubmit() {
    if (!state.canSubmit()) {
      return;
    }

    const payload = state.buildSubmitPayload();
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("TTS project created");
        clearDraft();
        navigate({ to: "/tool/tts" });
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to create project",
        );
      },
    });
  }

  return (
    <div class="p-6 space-y-6 max-w-2xl">
      {/* Header with submit button */}
      <div class="flex items-center justify-between">
        <H1>New TTS Project</H1>
        <Show when={state.segments().length > 0}>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={createMutation.isPending}
            disabled={!state.canSubmit()}
            onClick={handleSubmit}
          >
            Start Synthesis
          </LoadingButton>
        </Show>
      </div>

      {/* 1. Name */}
      <TextInputField
        type="text"
        label="Project Name"
        value={state.name()}
        onValueChange={state.setName}
        required={true}
        placeholder="e.g. Funny joke #42"
        maxLength={100}
      />

      {/* 2. Audio settings */}
      <TtsAudioSection
        processingEnabled={state.processingEnabled()}
        onProcessingEnabledChange={state.setProcessingEnabled}
        detailConfig={state.detailConfig()}
        onDetailConfigChange={state.setDetailConfig}
      />

      {/* 3. Voice assignment */}
      <Show when={state.mappings().length > 0}>
        <RoleVoiceMappingPanel
          mappings={state.mappings()}
          onMappingsChange={state.setMappings}
          voices={voices()}
          voicesLoading={voicesQuery.isLoading}
          previewApi={previewApi}
        />
      </Show>

      {/* 4. Parse input */}
      <div class="space-y-3">
        <H3>Paste Segments (JSON or JS)</H3>
        <TextareaField
          label=""
          value={state.rawInput()}
          onValueChange={state.setRawInput}
          disabled={false}
          readonly={false}
          required={false}
          name="tts-raw-input"
          maxLength={100_000}
          minLength={0}
          placeholder={INPUT_PLACEHOLDER}
          counterLabel={(current, max) => `${current}/${max}`}
        />
        <Button
          variant="secondary"
          size="sm"
          disabled={state.rawInput().trim().length === 0}
          onClick={state.handleParseInput}
        >
          Parse & Add
        </Button>
        <Show when={state.parseError()}>
          <Alert
            variant="error"
            title="Parse Error"
            description={state.parseError()}
          />
        </Show>
      </div>

      {/* 5. Segment editor */}
      <Show when={state.segments().length > 0}>
        <div class="space-y-3">
          <H3>Segments ({state.segments().length})</H3>
          <SegmentEditor
            segments={state.segments()}
            onSegmentsChange={state.handleSegmentsChange}
          />
        </div>
      </Show>
    </div>
  );
}

const INPUT_PLACEHOLDER = `// JSON:
[{"name": "narrator", "text": "A man walks into a bar."},
 {"name": "man", "text": "Give me a beer!"}]

// JS (also works):
[{name: 'narrator', text: 'A man walks into a bar.'},
 {name: 'man', text: "Give me a beer!"}]`;

export { TtsCreatePage };
