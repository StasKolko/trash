import { AUDIO_PROCESSING_LIMITS } from "@packages/contract/audio-processing";
import { Button, LoadingButton } from "@packages/ui/action";
import { NumberInputField } from "@packages/ui/form";
import { Dialog } from "@packages/ui/overlay";
import { createSignal } from "solid-js";

type MergeConfig = {
  betweenMs: number;
  startMs: number;
  endMs: number;
};

type TtsMergeDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: MergeConfig) => void;
  loading: boolean;
  segmentCount: number;
};

const L = AUDIO_PROCESSING_LIMITS.gaps;

const DEFAULT_BETWEEN_MS = 50;

function TtsMergeDialog(props: TtsMergeDialogProps) {
  const [betweenMs, setBetweenMs] = createSignal(DEFAULT_BETWEEN_MS);
  const [startMs, setStartMs] = createSignal(0);
  const [endMs, setEndMs] = createSignal(0);

  function handleConfirm() {
    props.onConfirm({
      betweenMs: betweenMs(),
      startMs: startMs(),
      endMs: endMs(),
    });
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={props.onClose}
      title="Merge into one file"
      description={`Concatenate ${props.segmentCount} segment(s) into a single audio file.`}
      content={() => (
        <div class="space-y-4">
          <NumberInputField
            label="Gap between segments (ms)"
            info="Silence inserted between each segment"
            value={betweenMs()}
            onValueChange={(v) =>
              setBetweenMs(clampInt(v as number, L.betweenMs))
            }
          />
          <NumberInputField
            label="Start padding (ms)"
            info="Silence at the beginning of the merged file"
            value={startMs()}
            onValueChange={(v) => setStartMs(clampInt(v as number, L.startMs))}
          />
          <NumberInputField
            label="End padding (ms)"
            info="Silence at the end of the merged file"
            value={endMs()}
            onValueChange={(v) => setEndMs(clampInt(v as number, L.endMs))}
          />
        </div>
      )}
      footer={() => (
        <div class="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={props.loading}
            onClick={handleConfirm}
          >
            Merge
          </LoadingButton>
        </div>
      )}
    />
  );
}

function clampInt(value: number, range: { min: number; max: number }): number {
  if (Number.isNaN(value)) {
    return range.min;
  }
  return Math.round(Math.min(Math.max(value, range.min), range.max));
}

export type { MergeConfig };
export { TtsMergeDialog };
