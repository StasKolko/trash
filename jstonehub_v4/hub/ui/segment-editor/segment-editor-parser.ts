import type { Segment } from "@packages/contract/segment";

import { createSegment } from "./segment-editor";

function parseSegmentsFromJson(input: string): Segment[] {
  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }

  const normalized = normalizeJsToJson(trimmed);

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new Error(
      'Invalid format. Expected array: [{"name": "role", "text": "content"}]',
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Input must be an array");
  }

  const segments: Segment[] = [];

  for (const item of parsed) {
    if (item === null || typeof item !== "object") {
      continue;
    }

    const obj = item as Record<string, unknown>;
    const role = String(obj.name ?? obj.role ?? "").trim();
    const text = String(obj.text ?? "").trim();

    if (!(role && text)) {
      continue;
    }

    segments.push(createSegment(role, text));
  }

  if (segments.length === 0) {
    throw new Error(
      'No valid segments found. Each item needs "name" (or "role") and "text".',
    );
  }

  return segments;
}

function normalizeJsToJson(input: string): string {
  let result = input;

  result = result.replace(/,\s*([}\]])/g, "$1");

  result = result.replace(/'((?:[^'\\]|\\.)*)'/g, (_, content: string) => {
    const escaped = content
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\\'/g, "'");
    return `"${escaped}"`;
  });

  result = result.replace(
    /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    '$1"$2":',
  );

  return result;
}

function extractUniqueRoles(segments: Segment[]): string[] {
  const seen = new Set<string>();
  const roles: string[] = [];

  for (const seg of segments) {
    const normalized = seg.role.trim().toLowerCase();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      roles.push(seg.role.trim());
    }
  }

  return roles;
}

export { extractUniqueRoles, parseSegmentsFromJson };
