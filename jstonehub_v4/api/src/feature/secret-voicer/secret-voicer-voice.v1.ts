import type {
  SecretVoicerVoice,
  SecretVoicerVoicesResponse,
} from "@packages/contract/secret-voicer";

import { SECRET_VOICER_CACHE_TTL_MS } from "@packages/contract/secret-voicer";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { secretVoicerExternalAdapter } from "./secret-voicer-external.adapter";
import { getOrCachePreview } from "./secret-voicer-preview.service";

let voicesCache: { data: SecretVoicerVoicesResponse; cachedAt: number } | null =
  null;

type RawVoice = {
  voice_id: string;
  name: string;
  gender: string;
  locale: string | null;
  is_multilingual: boolean;
  preview_url: string | null;
  preview_url_emotional: string | null;
  usage_count: number;
  avatar_url: string | null;
  description: string | null;
  accent: string | null;
  age_group: string | null;
  voice_style_tags: string[];
  use_cases: string[];
};

function mapRawVoice(v: RawVoice): SecretVoicerVoice {
  return {
    voiceId: v.voice_id,
    name: v.name,
    gender: v.gender as "MALE" | "FEMALE",
    locale: v.locale,
    isMultilingual: v.is_multilingual,
    previewUrl: v.preview_url,
    previewUrlEmotional: v.preview_url_emotional,
    usageCount: v.usage_count,
    avatarUrl: v.avatar_url || null,
    description: v.description || null,
    accent: v.accent || null,
    ageGroup: v.age_group || null,
    voiceStyleTags: v.voice_style_tags,
    useCases: v.use_cases,
  };
}

async function fetchVoices(): Promise<SecretVoicerVoicesResponse> {
  if (
    voicesCache
    && Date.now() - voicesCache.cachedAt < SECRET_VOICER_CACHE_TTL_MS
  ) {
    return voicesCache.data;
  }

  const result = await secretVoicerExternalAdapter.fetchVoices();

  const data: SecretVoicerVoicesResponse = {
    voices: (result.voices as RawVoice[]).map(mapRawVoice),
  };

  voicesCache = { data, cachedAt: Date.now() };
  return data;
}

const secretVoicerVoiceV1 = new Elysia({
  prefix: "/v1/secret-voicer/voices",
})
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", async ({ set }) => {
    try {
      return await fetchVoices();
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to fetch voices",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/preview", async ({ query, set }) => {
    const voiceId = query.voiceId as string | undefined;
    const url = query.url as string | undefined;

    if (!(voiceId && url)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "voiceId and url are required" };
    }

    try {
      const result = await getOrCachePreview(voiceId, url);
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to get preview",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

export { secretVoicerVoiceV1 };
