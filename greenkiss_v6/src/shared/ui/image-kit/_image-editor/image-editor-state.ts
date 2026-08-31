import type {
  AspectRatio,
  OutputFormat,
  ProcessedImage,
  SizePx,
} from '../_lib/types';

export type EditorItemVersionKind = 'original' | 'compressed';

export type EditorItemVersion = {
  kind: EditorItemVersionKind;
  image: ProcessedImage;
};

export type EditorItem = {
  id: string;
  current: EditorItemVersion;
  previous?: EditorItemVersion;
  // validation flags
  aspectOk: boolean;
  sizeOk: boolean;
  bytesOk: boolean;
};

export type EditorState = {
  items: EditorItem[];
  requiredAspect: AspectRatio;
  requiredSize: SizePx;
  requiredFormat: OutputFormat;
  maxBytes: number;
  minBytes: number;
};

export function hasAspectMismatch(state: EditorState): boolean {
  return state.items.some((it) => !it.aspectOk);
}

export function hasSizeMismatch(state: EditorState): boolean {
  return state.items.some((it) => !it.sizeOk);
}

export function hasBytesViolation(state: EditorState): boolean {
  return state.items.some((it) => !it.bytesOk);
}

export function canSubmit(state: EditorState): boolean {
  return (
    state.items.length > 0 &&
    !hasAspectMismatch(state) &&
    !hasSizeMismatch(state) &&
    !hasBytesViolation(state)
  );
}
