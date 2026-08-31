import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";
import type { RoleVoiceMapping } from "@packages/contract/segment";

import type { TtsJobEntry, TtsJobSegmentEntry } from "./_tts-jobs-types";

import { Button, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { TextareaField } from "@packages/ui/form";
import { toast } from "@packages/ui/overlay";
import { H3 } from "@packages/ui/typography";
import { Plus, RefreshCw, X } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";

import { RoleVoiceMappingPanel } from "#hub/shared/ui/segment-editor";
import { parseSegmentsFromJson } from "#hub/shared/ui/segment-editor/segment-editor-parser";

import { buildMappingsFromSegments, getUniqueRoles } from "./_tts-jobs-helpers";
import { FAILED_STATUSES } from "./_tts-jobs-types";
import { EditSegmentRow } from "./_tts-segment-edit-row";
import {
  createAddSegmentMutation,
  createDeleteSegmentMutation,
  createRetryAllFailedMutation,
  createRetrySegmentMutation,
  createSynthesizeAllPendingMutation,
  createUpdateSegmentMutation,
} from "./tts.query";

type LocalSegment = TtsJobSegmentEntry & {
  outputKey: string | null;
};

type ProjectEditCardProps = {
  project: TtsJobEntry;
  voices: SecretVoicerVoice[];
  voicesLoading: boolean;
  previewApi: {
    getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
  };
  onClose: () => void;
  onRefresh: () => void;
};

type EditCardState = {
  project: () => TtsJobEntry;
  localSegments: () => LocalSegment[];
  setLocalSegments: (
    v: LocalSegment[] | ((prev: LocalSegment[]) => LocalSegment[]),
  ) => void;
  mappings: () => RoleVoiceMapping[];
  setMappings: (
    v: RoleVoiceMapping[] | ((prev: RoleVoiceMapping[]) => RoleVoiceMapping[]),
  ) => void;
  syncMappings: (segs: LocalSegment[]) => void;
};

function createEditCardState(props: ProjectEditCardProps): EditCardState {
  const project = () => props.project;

  const [localSegments, setLocalSegments] = createSignal<LocalSegment[]>(
    project().segments.map((s) => ({ ...s })),
  );

  const [mappings, setMappings] = createSignal<RoleVoiceMapping[]>(
    buildMappingsFromSegments(project().segments),
  );

  function syncMappings(segs: LocalSegment[]) {
    const roles = getUniqueRoles(segs);
    const current = mappings();
    setMappings(
      roles.map((role) => {
        const existing = current.find(
          (m) => m.role.toLowerCase() === role.toLowerCase(),
        );
        const fromSeg = segs.find(
          (s) => s.role.toLowerCase() === role.toLowerCase(),
        );
        return {
          role,
          voiceId: existing?.voiceId ?? fromSeg?.voiceId ?? null,
        };
      }),
    );
  }

  return {
    project,
    localSegments,
    setLocalSegments,
    mappings,
    setMappings,
    syncMappings,
  };
}

function handleMappingsChange(
  state: EditCardState,
  newMappings: RoleVoiceMapping[],
) {
  const changed = newMappings.filter((nm) => {
    const old = state
      .mappings()
      .find((m) => m.role.toLowerCase() === nm.role.toLowerCase());
    return old?.voiceId !== nm.voiceId;
  });

  state.setMappings(newMappings);

  if (changed.length === 0) {
    return;
  }

  state.setLocalSegments((prev) =>
    prev.map((seg) => {
      const changedRole = changed.find(
        (c) => c.role.toLowerCase() === seg.role.toLowerCase(),
      );
      if (!changedRole) {
        return seg;
      }
      return {
        ...seg,
        voiceId: changedRole.voiceId ?? seg.voiceId,
        status: "pending",
        outputKey: null,
        error: null,
      };
    }),
  );
}

function handleRoleChange(
  state: EditCardState,
  index: number,
  newRole: string,
) {
  const voiceId =
    state.mappings().find((m) => m.role.toLowerCase() === newRole.toLowerCase())
      ?.voiceId ?? null;

  const updated = state.localSegments().map((seg, i) => {
    if (i !== index) {
      return seg;
    }
    const original = state.project().segments[i];
    if (original && original.role === newRole && original.outputKey) {
      return {
        ...seg,
        role: newRole,
        voiceId: original.voiceId,
        status: original.status,
        outputKey: original.outputKey,
      };
    }
    return {
      ...seg,
      role: newRole,
      voiceId: voiceId ?? seg.voiceId,
      status: "pending",
      outputKey: null,
      error: null,
    };
  });

  state.setLocalSegments(updated);
  state.syncMappings(updated);
}

function handleTextChange(state: EditCardState, index: number, text: string) {
  state.setLocalSegments((prev) =>
    prev.map((seg, i) => {
      if (i !== index) {
        return seg;
      }
      const original = state.project().segments[i];
      if (original && original.text === text && original.outputKey) {
        return {
          ...seg,
          text,
          status: original.status,
          outputKey: original.outputKey,
        };
      }
      return {
        ...seg,
        text,
        status: "pending",
        outputKey: null,
        error: null,
      };
    }),
  );
}

function handleDuplicate(state: EditCardState, index: number) {
  const seg = state.localSegments()[index];
  if (!seg) {
    return;
  }
  const newSeg: LocalSegment = {
    ...seg,
    index: index + 1,
    status: "pending",
    outputKey: null,
    bullJobId: null,
    error: null,
  };
  state.setLocalSegments((prev) => {
    const updated = [...prev];
    for (let i = index + 1; i < updated.length; i++) {
      const s = updated[i];
      if (s) {
        updated[i] = { ...s, index: s.index + 1 };
      }
    }
    updated.splice(index + 1, 0, newSeg);
    return updated;
  });
}

function handleAddSegment(state: EditCardState) {
  const lastIndex = state.localSegments().length;
  const lastRole = state.localSegments().at(-1)?.role ?? "";
  const voiceId =
    state
      .mappings()
      .find((m) => m.role.toLowerCase() === lastRole.toLowerCase())?.voiceId
    ?? null;
  state.setLocalSegments((prev) => [
    ...prev,
    {
      index: lastIndex,
      role: lastRole,
      text: "",
      voiceId: voiceId ?? "",
      status: "pending",
      bullJobId: null,
      outputKey: null,
      error: null,
    },
  ]);
}

async function saveAndSynthesizePending(
  state: EditCardState,
  mutations: {
    addSegMutation: ReturnType<typeof createAddSegmentMutation>;
    updateSegMutation: ReturnType<typeof createUpdateSegmentMutation>;
    synthPendingMutation: ReturnType<typeof createSynthesizeAllPendingMutation>;
  },
  onDone: () => void,
) {
  const segs = state.localSegments();
  const pendingSegs = segs.filter(
    (s) => s.status === "pending" && s.text.trim(),
  );

  if (pendingSegs.length === 0) {
    toast.info("No pending segments to synthesize");
    return;
  }

  for (const seg of segs) {
    const original = state
      .project()
      .segments.find((s) => s.index === seg.index);
    const newVoiceId =
      state
        .mappings()
        .find((m) => m.role.toLowerCase() === seg.role.toLowerCase())?.voiceId
      ?? seg.voiceId;

    if (!original) {
      // biome-ignore lint/performance/noAwaitInLoops: sequential segment saving is intentional — each segment must be persisted before the next to maintain correct ordering
      await new Promise<void>((resolve, reject) => {
        mutations.addSegMutation.mutate(
          {
            projectId: state.project().jobId,
            role: seg.role,
            text: seg.text,
            voiceId: newVoiceId,
            afterIndex: seg.index - 1,
          },
          { onSuccess: () => resolve(), onError: reject },
        );
      });
    } else if (
      original.text !== seg.text
      || original.role !== seg.role
      || original.voiceId !== newVoiceId
    ) {
      await new Promise<void>((resolve, reject) => {
        mutations.updateSegMutation.mutate(
          {
            projectId: state.project().jobId,
            segmentIndex: seg.index,
            data: { text: seg.text, role: seg.role, voiceId: newVoiceId },
          },
          { onSuccess: () => resolve(), onError: reject },
        );
      });
    }
  }

  mutations.synthPendingMutation.mutate(state.project().jobId, {
    onSuccess: () => {
      toast.success("Synthesis started for pending segments");
      onDone();
    },
    onError: () => toast.error("Failed to start synthesis"),
  });
}

// ─── Parse & Append Section ───────────────────────────────────────────────────

function ParseAppendSection(props: { state: EditCardState }) {
  const [parseInput, setParseInput] = createSignal("");
  const [parseError, setParseError] = createSignal("");

  function handleParseAndAppend() {
    setParseError("");
    try {
      const parsed = parseSegmentsFromJson(parseInput());
      if (parsed.length === 0) {
        setParseError("No segments found");
        return;
      }
      const startIndex = props.state.localSegments().length;
      const newSegs: LocalSegment[] = parsed.map((seg, i) => {
        const voiceId =
          props.state
            .mappings()
            .find((m) => m.role.toLowerCase() === seg.role.toLowerCase())
            ?.voiceId ?? null;
        return {
          index: startIndex + i,
          role: seg.role,
          text: seg.text,
          voiceId: voiceId ?? "",
          status: "pending",
          bullJobId: null,
          outputKey: null,
          error: null,
        };
      });
      const updated = [...props.state.localSegments(), ...newSegs];
      props.state.setLocalSegments(updated);
      props.state.syncMappings(updated);
      setParseInput("");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Parse error");
    }
  }

  return (
    <div class="space-y-2 pt-2 border-t border-border">
      <H3>Append from JSON</H3>
      <TextareaField
        label=""
        value={parseInput()}
        onValueChange={setParseInput}
        disabled={false}
        readonly={false}
        required={false}
        name="edit-parse-input"
        maxLength={100_000}
        minLength={0}
        placeholder='[{"name": "narrator", "text": "..."}]'
        counterLabel={(c, m) => `${c}/${m}`}
      />
      <Show when={parseError()}>
        <div class="text-xs text-error-foreground">{parseError()}</div>
      </Show>
      <Button
        variant="secondary"
        size="sm"
        disabled={parseInput().trim().length === 0}
        onClick={handleParseAndAppend}
      >
        Parse & Append
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ProjectEditCard(props: ProjectEditCardProps) {
  const state = createEditCardState(props);

  const updateSegMutation = createUpdateSegmentMutation();
  const deleteSegMutation = createDeleteSegmentMutation();
  const addSegMutation = createAddSegmentMutation();
  const retrySegMutation = createRetrySegmentMutation();
  const synthPendingMutation = createSynthesizeAllPendingMutation();
  const retryAllMutation = createRetryAllFailedMutation();

  function handleDeleteSegment(index: number) {
    const seg = state.localSegments()[index];
    if (!seg) {
      return;
    }

    const original = state
      .project()
      .segments.find((s) => s.index === seg.index);
    if (original) {
      deleteSegMutation.mutate(
        { projectId: state.project().jobId, segmentIndex: seg.index },
        {
          onSuccess: () => {
            state.setLocalSegments((prev) =>
              prev
                .filter((_, i) => i !== index)
                .map((s, i) => ({ ...s, index: i })),
            );
            props.onRefresh();
          },
          onError: () => toast.error("Failed to delete segment"),
        },
      );
    } else {
      state.setLocalSegments((prev) =>
        prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i })),
      );
    }
  }

  function handleRetryAllFailed() {
    retryAllMutation.mutate(state.project().jobId, {
      onSuccess: () => {
        toast.success("Retrying all failed segments");
        props.onRefresh();
      },
      onError: () => toast.error("Failed to retry"),
    });
  }

  function handleRetrySegment(index: number) {
    retrySegMutation.mutate(
      { projectId: state.project().jobId, segmentIndex: index },
      {
        onSuccess: () => {
          toast.success("Retry started");
          props.onRefresh();
        },
        onError: () => toast.error("Failed to retry"),
      },
    );
  }

  const hasPendingSegs = createMemo(() =>
    state.localSegments().some((s) => s.status === "pending" && s.text.trim()),
  );

  const hasFailedSegs = createMemo(() =>
    state.localSegments().some((s) => FAILED_STATUSES.has(s.status)),
  );

  const isSaving = createMemo(
    () =>
      updateSegMutation.isPending
      || addSegMutation.isPending
      || deleteSegMutation.isPending
      || synthPendingMutation.isPending,
  );

  return (
    <div class="rounded-lg border border-primary/40 p-4 space-y-4 bg-card">
      <EditCardHeader
        name={state.project().name}
        hasFailedSegs={hasFailedSegs()}
        hasPendingSegs={hasPendingSegs()}
        pendingCount={
          state.localSegments().filter((s) => s.status === "pending").length
        }
        retryAllPending={retryAllMutation.isPending}
        isSaving={isSaving()}
        onRetryAllFailed={handleRetryAllFailed}
        onSaveAndSynthesize={() =>
          saveAndSynthesizePending(
            state,
            { addSegMutation, updateSegMutation, synthPendingMutation },
            () => {
              props.onRefresh();
              props.onClose();
            },
          )
        }
        onClose={props.onClose}
      />

      <Show when={state.mappings().length > 0}>
        <RoleVoiceMappingPanel
          mappings={state.mappings()}
          onMappingsChange={(m) => handleMappingsChange(state, m)}
          voices={props.voices}
          voicesLoading={props.voicesLoading}
          previewApi={props.previewApi}
        />
      </Show>

      <div class="space-y-2">
        <H3>Segments ({state.localSegments().length})</H3>
        <For each={state.localSegments()}>
          {(seg, i) => (
            <EditSegmentRow
              seg={seg}
              index={i()}
              allRoles={getUniqueRoles(state.localSegments())}
              outputFiles={state.project().outputFiles}
              onRoleChange={(role) => handleRoleChange(state, i(), role)}
              onTextChange={(text) => handleTextChange(state, i(), text)}
              onDuplicate={() => handleDuplicate(state, i())}
              onDelete={() => handleDeleteSegment(i())}
              onRetry={() => handleRetrySegment(seg.index)}
              retrying={retrySegMutation.isPending}
              canDelete={state.localSegments().length > 1}
            />
          )}
        </For>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAddSegment(state)}
        >
          <Plus size={14} />
          Add Segment
        </Button>
      </div>

      <ParseAppendSection state={state} />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function EditCardHeader(props: {
  name: string;
  hasFailedSegs: boolean;
  hasPendingSegs: boolean;
  pendingCount: number;
  retryAllPending: boolean;
  isSaving: boolean;
  onRetryAllFailed: () => void;
  onSaveAndSynthesize: () => void;
  onClose: () => void;
}) {
  return (
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">{props.name}</span>
        <Badge variant="info" size="sm" aria-label="Editing">
          Editing
        </Badge>
      </div>
      <div class="flex items-center gap-2">
        <Show when={props.hasFailedSegs}>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={props.retryAllPending}
            onClick={props.onRetryAllFailed}
          >
            <RefreshCw size={14} />
            Retry all failed
          </LoadingButton>
        </Show>
        <Show when={props.hasPendingSegs}>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={props.isSaving}
            onClick={props.onSaveAndSynthesize}
          >
            Synthesize pending ({props.pendingCount})
          </LoadingButton>
        </Show>
        <Button variant="ghost" size="sm" onClick={props.onClose}>
          <X size={14} />
          Close
        </Button>
      </div>
    </div>
  );
}

export { ProjectEditCard };
