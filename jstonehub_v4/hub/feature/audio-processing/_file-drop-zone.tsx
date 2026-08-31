import type { JSX } from "solid-js";

import { AUDIO_PROCESSING_UPLOAD_LIMITS } from "@packages/contract/audio-processing";
import { BYTES_IN_MB } from "@packages/contract/format";
import { createSignal } from "solid-js";

type FileDropZoneProps = {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
};

const ACCEPTED_EXTENSIONS = ".mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.opus";

const MAX_FILE_SIZE_MB = Math.round(
  AUDIO_PROCESSING_UPLOAD_LIMITS.maxFileSizeBytes / BYTES_IN_MB,
);

const LABEL_STYLE = [
  "block w-full border-2 border-dashed rounded-lg p-8 text-center",
  "transition-colors duration-150 cursor-pointer",
].join(" ");

const LABEL_ACTIVE_STYLE = "border-primary bg-primary/5";
const LABEL_IDLE_STYLE = "border-border hover:border-primary/50";
const LABEL_DISABLED_STYLE = "border-border opacity-50 cursor-not-allowed";

function FileDropZone(props: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = createSignal(false);

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      processFiles([...target.files]);
      target.value = "";
    }
  }

  function processFiles(files: File[]) {
    const valid = files.filter(
      (f) => f.size <= AUDIO_PROCESSING_UPLOAD_LIMITS.maxFileSizeBytes,
    );
    const limited = valid.slice(0, AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles);
    if (limited.length > 0) {
      props.onFilesSelected(limited);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (props.disabled) {
      return;
    }

    const files = e.dataTransfer?.files;
    if (files) {
      processFiles([...files]);
    }
  }

  const labelClass = (): string => {
    if (props.disabled) {
      return `${LABEL_STYLE} ${LABEL_DISABLED_STYLE}`;
    }
    if (isDragOver()) {
      return `${LABEL_STYLE} ${LABEL_ACTIVE_STYLE}`;
    }
    return `${LABEL_STYLE} ${LABEL_IDLE_STYLE}`;
  };

  return (
    <DropZoneWrapper
      class={labelClass()}
      onDragActive={() => {
        if (!props.disabled) {
          setIsDragOver(true);
        }
      }}
      onDragInactive={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* biome-ignore lint/correctness/noRestrictedElements: hidden file input requires native element */}
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple={true}
        class="hidden"
        disabled={props.disabled}
        onChange={handleInputChange}
      />
      <div class="text-foreground font-medium mb-1">
        Drop audio files here or click to browse
      </div>
      <div class="text-subtle text-sm">
        MP3, WAV, OGG, FLAC, M4A, AAC, WMA, OPUS — max{" "}
        {AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles} files, {MAX_FILE_SIZE_MB}
        MB each
      </div>
    </DropZoneWrapper>
  );
}

function DropZoneWrapper(props: {
  class: string;
  onDragActive: () => void;
  onDragInactive: () => void;
  onDrop: (e: DragEvent) => void;
  children: JSX.Element;
}) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: label with hidden input is inherently interactive; drag handlers are needed for drop zone
    // biome-ignore lint/correctness/noRestrictedElements: label with hidden input is inherently interactive; drag handlers are needed for drop zone
    // biome-ignore lint/a11y/noLabelWithoutControl: label with hidden input is inherently interactive; drag handlers are needed for drop zone
    <label
      class={props.class}
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        props.onDragActive();
      }}
      onDragLeave={() => props.onDragInactive()}
      onDrop={props.onDrop}
    >
      {props.children}
    </label>
  );
}

export { FileDropZone };
