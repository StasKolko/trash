import type { RoleVoiceMapping, Segment } from "@packages/contract/segment";

import { createEffect, createSignal } from "solid-js";

import {
  extractUniqueRoles,
  parseSegmentsFromJson,
} from "#hub/shared/ui/segment-editor";

import { loadDraft, saveDraft } from "./_use-tts-draft";

function useTtsSegments(nameAccessor: () => string) {
  const draft = loadDraft();

  const [segments, setSegments] = createSignal<Segment[]>(
    draft?.segments ?? [],
  );
  const [mappings, setMappings] = createSignal<RoleVoiceMapping[]>(
    draft?.mappings ?? [],
  );
  const [rawInput, setRawInput] = createSignal(draft?.rawInput ?? "");
  const [parseError, setParseError] = createSignal("");

  // Auto-save draft on any change
  createEffect(() => {
    saveDraft({
      name: nameAccessor(),
      rawInput: rawInput(),
      segments: segments(),
      mappings: mappings(),
    });
  });

  function syncMappings(segs: Segment[]) {
    const roles = extractUniqueRoles(segs);
    const current = mappings();
    setMappings(
      roles.map((role) => {
        const existing = current.find(
          (m) => m.role.toLowerCase() === role.toLowerCase(),
        );
        return { role, voiceId: existing?.voiceId ?? null };
      }),
    );
  }

  function handleSegmentsChange(segs: Segment[]) {
    setSegments(segs);
    syncMappings(segs);
  }

  function handleParseInput() {
    setParseError("");
    try {
      const parsed = parseSegmentsFromJson(rawInput());
      if (parsed.length === 0) {
        setParseError("No segments found.");
        return;
      }
      handleSegmentsChange(parsed);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse");
    }
  }

  return {
    segments,
    mappings,
    setMappings,
    rawInput,
    setRawInput,
    parseError,
    handleSegmentsChange,
    handleParseInput,
  };
}

export { useTtsSegments };
