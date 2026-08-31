import { createHash } from "node:crypto";

/**
 * Normalizes text for uniqueness comparison:
 * - lowercase
 * - remove punctuation
 * - collapse whitespace
 * - trim
 */
function normalizeTextForHash(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function computeUniquenessHash(segments: { text: string }[]): string {
  const combined = segments.map((s) => normalizeTextForHash(s.text)).join(" ");
  return createHash("sha256").update(combined).digest("hex");
}

export { computeUniquenessHash, normalizeTextForHash };
