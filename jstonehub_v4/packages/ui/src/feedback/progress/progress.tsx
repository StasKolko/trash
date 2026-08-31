import { Badge } from "../../data-display/badge/badge";
import {
  PROGRESS_BADGE_STYLE,
  PROGRESS_INDICATOR_STYLE,
  PROGRESS_INDICATOR_VARIANT_STYLE,
  PROGRESS_ROOT_STYLE,
  PROGRESS_TRACK_STYLE,
  PROGRESS_TRACK_VARIANT_STYLE,
} from "./_progress.style";
import {
  calculatePercentage,
  formatNumber,
  resolveVariant,
} from "./_progress.util";

type ProgressProps = {
  max: number;
  formatLabel: (processed: number, max: number) => string;
  success?: number;
  warning?: number;
  error?: number;
};

function Progress(props: ProgressProps) {
  const success = () => props.success ?? 0;
  const warning = () => props.warning ?? 0;
  const error = () => props.error ?? 0;
  const processed = () => success() + warning() + error();
  const variant = () =>
    resolveVariant({
      processed: processed(),
      max: props.max,
      error: error(),
      warning: warning(),
    });

  return (
    <div data-testid="Progress" class={PROGRESS_ROOT_STYLE}>
      <div
        data-testid="ProgressTrack"
        role="progressbar"
        aria-valuenow={processed()}
        aria-valuemin={0}
        aria-valuemax={props.max}
        aria-valuetext={props.formatLabel(processed(), props.max)}
        class={`${PROGRESS_TRACK_STYLE} ${PROGRESS_TRACK_VARIANT_STYLE[variant()]}`}
      >
        <div
          data-testid="ProgressIndicator"
          class={`${PROGRESS_INDICATOR_STYLE} ${PROGRESS_INDICATOR_VARIANT_STYLE[variant()]}`}
          style={{
            width: `${calculatePercentage(processed(), props.max)}%`,
          }}
        />
      </div>

      <Badge
        aria-label={props.formatLabel(processed(), props.max)}
        class={PROGRESS_BADGE_STYLE}
        variant={variant()}
        size="sm"
      >
        {`${formatNumber(processed())}/${formatNumber(props.max)}`}
      </Badge>
    </div>
  );
}

export type { ProgressProps };
export { Progress };
