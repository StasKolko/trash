import type { Segment } from "@packages/contract/segment";

import { SEGMENT_TEXT_MAX_LENGTH } from "@packages/contract/segment";
import { Button, IconButton } from "@packages/ui/action";
import { TextareaField } from "@packages/ui/form";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-solid";
import { createSignal, createUniqueId, For, Show } from "solid-js";

import { RoleSelector } from "./segment-editor-role-selector";

type SegmentEditorProps = {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  disabled?: boolean;
};

function createSegment(role: string, text: string): Segment {
  return { id: createUniqueId(), role, text };
}

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

function SegmentEditor(props: SegmentEditorProps) {
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = createSignal<number | null>(null);

  const allRoles = () => {
    const roles = new Set<string>();
    for (const seg of props.segments) {
      if (seg.role.trim()) {
        roles.add(normalizeRole(seg.role));
      }
    }
    return [...roles];
  };

  function handleAdd() {
    props.onSegmentsChange([...props.segments, createSegment("", "")]);
  }

  function handleRemove(index: number) {
    props.onSegmentsChange(props.segments.filter((_, i) => i !== index));
  }

  function handleDuplicate(index: number) {
    const source = props.segments[index];
    if (!source) {
      return;
    }
    const updated = [...props.segments];
    updated.splice(index + 1, 0, createSegment(source.role, source.text));
    props.onSegmentsChange(updated);
  }

  function handleRoleChange(index: number, role: string) {
    props.onSegmentsChange(
      props.segments.map((seg, i) => (i === index ? { ...seg, role } : seg)),
    );
  }

  function handleTextChange(index: number, text: string) {
    props.onSegmentsChange(
      props.segments.map((seg, i) => (i === index ? { ...seg, text } : seg)),
    );
  }

  // Drag-and-drop handlers
  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    const from = dragIndex();
    if (from === null || from === index) {
      resetDrag();
      return;
    }

    const updated = [...props.segments];
    const [removed] = updated.splice(from, 1);
    if (removed) {
      updated.splice(index, 0, removed);
    }
    props.onSegmentsChange(updated);
    resetDrag();
  }

  function resetDrag() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div class="space-y-2">
      <For each={props.segments}>
        {(segment, index) => (
          <SegmentCard
            segment={segment}
            index={index()}
            allRoles={allRoles()}
            disabled={props.disabled ?? false}
            isDragging={dragIndex() === index()}
            isDragOver={dragOverIndex() === index()}
            onRoleChange={(role) => handleRoleChange(index(), role)}
            onTextChange={(text) => handleTextChange(index(), text)}
            onRemove={() => handleRemove(index())}
            onDuplicate={() => handleDuplicate(index())}
            canRemove={props.segments.length > 1}
            onDragStart={() => handleDragStart(index())}
            onDragOver={(e) => handleDragOver(e, index())}
            onDrop={() => handleDrop(index())}
            onDragEnd={resetDrag}
          />
        )}
      </For>

      <Show when={!props.disabled}>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus size={14} />
          Add Segment
        </Button>
      </Show>
    </div>
  );
}

function SegmentCard(props: {
  segment: Segment;
  index: number;
  allRoles: string[];
  disabled: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onRoleChange: (role: string) => void;
  onTextChange: (text: string) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  canRemove: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const otherRoles = () =>
    props.allRoles.filter((r) => r !== normalizeRole(props.segment.role));

  const cardClass = () => {
    const base = "rounded-lg border p-4 space-y-3 bg-card transition-all";
    if (props.isDragging) {
      return `${base} opacity-40 border-primary`;
    }
    if (props.isDragOver) {
      return `${base} border-primary border-2 bg-primary/5`;
    }
    return `${base} border-border`;
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: FALSE_POSITIVE
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: FALSE_POSITIVE
    <div
      class={cardClass()}
      draggable={!props.disabled}
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      onDragEnd={props.onDragEnd}
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-subtle">
          <Show when={!props.disabled}>
            <GripVertical
              size={14}
              class="cursor-grab active:cursor-grabbing"
            />
          </Show>
          <span class="text-xs font-mono">#{props.index + 1}</span>
        </div>

        <div class="flex-1">
          <RoleSelector
            value={props.segment.role}
            existingRoles={otherRoles()}
            onChange={props.onRoleChange}
            disabled={props.disabled}
          />
        </div>

        <Show when={!props.disabled}>
          <div class="flex items-center gap-1">
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Duplicate segment"
              onClick={props.onDuplicate}
            >
              <Copy size={14} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Remove segment"
              disabled={!props.canRemove}
              onClick={props.onRemove}
            >
              <Trash2 size={14} />
            </IconButton>
          </div>
        </Show>
      </div>

      <TextareaField
        label=""
        value={props.segment.text}
        onValueChange={props.onTextChange}
        disabled={props.disabled}
        readonly={false}
        required={false}
        name={`segment-text-${props.segment.id}`}
        maxLength={SEGMENT_TEXT_MAX_LENGTH}
        minLength={0}
        placeholder="Enter text for this segment..."
        counterLabel={(current, max) => `${current}/${max}`}
      />
    </div>
  );
}

export type { SegmentEditorProps };
export { createSegment, normalizeRole, SegmentEditor };
