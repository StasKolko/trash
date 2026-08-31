export type { SegmentEditorProps } from "./segment-editor";
export type { RoleVoiceMappingPanelProps } from "./segment-editor-voice-mapping";

export { createSegment, normalizeRole, SegmentEditor } from "./segment-editor";
export {
  extractUniqueRoles,
  parseSegmentsFromJson,
} from "./segment-editor-parser";
export { RoleVoiceMappingPanel } from "./segment-editor-voice-mapping";
