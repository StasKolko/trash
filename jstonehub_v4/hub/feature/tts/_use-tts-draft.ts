import type { RoleVoiceMapping, Segment } from "@packages/contract/segment";

const DRAFT_KEY = "tts-create-draft";

type TtsCreateDraft = {
  name: string;
  rawInput: string;
  segments: Segment[];
  mappings: RoleVoiceMapping[];
};

function saveDraft(draft: TtsCreateDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

function loadDraft(): TtsCreateDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as TtsCreateDraft;
  } catch {
    return null;
  }
}

function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export type { TtsCreateDraft };
export { clearDraft, loadDraft, saveDraft };
