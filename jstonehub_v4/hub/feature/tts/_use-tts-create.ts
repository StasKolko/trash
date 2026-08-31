import type { RoleVoiceMapping } from "@packages/contract/segment";

import { createMemo, createSignal } from "solid-js";

import { useTtsAudio } from "./_use-tts-audio";
import { loadDraft } from "./_use-tts-draft";
import { useTtsSegments } from "./_use-tts-segments";

function useTtsCreateState() {
  const draft = loadDraft();
  const [name, setName] = createSignal(draft?.name ?? "");

  const segments = useTtsSegments(() => name());
  const audio = useTtsAudio();

  const allMapped = createMemo(
    () =>
      segments.mappings().length > 0
      && segments.mappings().every((m: RoleVoiceMapping) => m.voiceId !== null),
  );

  const canSubmit = createMemo(
    () =>
      name().trim().length > 0 && segments.segments().length > 0 && allMapped(),
  );

  function buildSubmitPayload() {
    const voiceMap = new Map(
      segments
        .mappings()
        .filter((m: RoleVoiceMapping) => m.voiceId)
        .map((m: RoleVoiceMapping) => [
          m.role.toLowerCase(),
          m.voiceId as string,
        ]),
    );

    return {
      name: name().trim(),
      segments: segments.segments().map((seg) => ({
        role: seg.role.trim(),
        text: seg.text.trim(),
        voiceId: voiceMap.get(seg.role.trim().toLowerCase()) ?? "",
      })),
      audioProcessing: audio.buildAudioProcessingPayload(),
    };
  }

  return {
    name,
    setName,
    ...segments,
    ...audio,
    allMapped,
    canSubmit,
    buildSubmitPayload,
  };
}

export { useTtsCreateState };
