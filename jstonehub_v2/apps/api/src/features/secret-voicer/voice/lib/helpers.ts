import type {
  ExternalVoice,
  NewSecretVoicerVoice,
  SecretVoicerVoice,
} from "../data/types";
import { IGNORED_EXTERNAL_FIELDS } from "./constants";

// === Private Helpers ===

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a === null && b === null) {
    return true;
  }
  if (a === undefined && b === undefined) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  return String(a) === String(b);
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => String(val) === String(sortedB[i]));
}

function fieldToExternalName(field: string): string | null {
  const mapping: Record<string, string> = {
    externalId: "id",
    externalVoiceId: "voice_id",
    externalName: "name",
    externalDescription: "description",
    externalGender: "gender",
    externalLocale: "locale",
    externalPreviewUrl: "preview_url",
    externalPreviewUrlEmotional: "preview_url_emotional",
    externalAvatarUrl: "avatar_url",
    externalAccent: "accent",
    externalAgeGroup: "age_group",
    externalIsMultilingual: "is_multilingual",
    externalStyleTags: "voice_style_tags",
    externalUseCases: "use_cases",
  };
  return mapping[field] ?? null;
}

// === Public Exports ===

/**
 * Maps external API voice to our database format
 */
export function mapExternalVoiceToDb(
  voice: ExternalVoice,
): Omit<NewSecretVoicerVoice, "id"> {
  return {
    externalId: voice.id,
    externalVoiceId: voice.voice_id,
    externalName: voice.name,
    externalDescription: voice.description,
    externalGender: voice.gender,
    externalLocale: voice.locale,
    externalPreviewUrl: voice.preview_url,
    externalPreviewUrlEmotional: voice.preview_url_emotional,
    externalAvatarUrl: voice.avatar_url,
    externalAccent: voice.accent,
    externalAgeGroup: voice.age_group,
    externalIsMultilingual: voice.is_multilingual,
    externalStyleTags: voice.voice_style_tags ?? [],
    externalUseCases: voice.use_cases ?? [],
  };
}

/**
 * Compares external fields and returns changed field names
 */
export function getChangedExternalFields(
  existing: SecretVoicerVoice,
  incoming: ExternalVoice,
): string[] {
  const changes: string[] = [];

  const comparisons: [string, unknown, unknown][] = [
    ["externalId", existing.externalId, incoming.id],
    ["externalName", existing.externalName, incoming.name],
    ["externalDescription", existing.externalDescription, incoming.description],
    ["externalGender", existing.externalGender, incoming.gender],
    ["externalLocale", existing.externalLocale, incoming.locale],
    ["externalPreviewUrl", existing.externalPreviewUrl, incoming.preview_url],
    [
      "externalPreviewUrlEmotional",
      existing.externalPreviewUrlEmotional,
      incoming.preview_url_emotional,
    ],
    ["externalAvatarUrl", existing.externalAvatarUrl, incoming.avatar_url],
    ["externalAccent", existing.externalAccent, incoming.accent],
    ["externalAgeGroup", existing.externalAgeGroup, incoming.age_group],
    [
      "externalIsMultilingual",
      existing.externalIsMultilingual,
      incoming.is_multilingual,
    ],
  ];

  for (const [field, oldVal, newVal] of comparisons) {
    // Skip ignored fields
    const externalFieldName = fieldToExternalName(field);
    if (
      externalFieldName
      && IGNORED_EXTERNAL_FIELDS.includes(
        externalFieldName as (typeof IGNORED_EXTERNAL_FIELDS)[number],
      )
    ) {
      continue;
    }

    if (!isEqual(oldVal, newVal)) {
      changes.push(field);
    }
  }

  // Compare arrays
  if (
    !arraysEqual(
      existing.externalStyleTags ?? [],
      incoming.voice_style_tags ?? [],
    )
  ) {
    changes.push("externalStyleTags");
  }

  if (!arraysEqual(existing.externalUseCases ?? [], incoming.use_cases ?? [])) {
    changes.push("externalUseCases");
  }

  return changes;
}

/**
 * Extract old values for changed fields
 */
export function extractOldValues(
  voice: SecretVoicerVoice,
  fields: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = voice[field as keyof SecretVoicerVoice];
  }
  return result;
}

/**
 * Extract new values for changed fields from external voice
 */
export function extractNewValuesFromExternal(
  voice: ExternalVoice,
  fields: string[],
): Record<string, unknown> {
  const mapped = mapExternalVoiceToDb(voice);
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = mapped[field as keyof typeof mapped];
  }
  return result;
}
