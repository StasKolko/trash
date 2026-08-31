import { Type as t } from "@sinclair/typebox";
import { Elysia } from "elysia";
import { getPublicSecretVoicerVoices } from "../data/repository";

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const PublicVoiceDto = t.Object({
  id: t.String(),
  externalVoiceId: t.String(),
  name: t.String(),
  gender: t.String(),
  locale: Nullable(t.String()),
  accent: Nullable(t.String()),
  ageGroup: Nullable(t.String()),
  isMultilingual: t.Boolean(),
  styleTags: t.Array(t.String()),
  useCases: t.Array(t.String()),
  previewUrl: Nullable(t.String()),
  // Custom fields
  emotionSupport: t.String(),
  testedLanguages: t.Array(t.String()),
  rating: t.Number(),
});

export const secretVoicerVoicePublicControllerV1 = new Elysia({
  prefix: "/voices",
}).get(
  "/",
  async () => {
    const voices = await getPublicSecretVoicerVoices();

    return voices.map((v) => ({
      id: v.id,
      externalVoiceId: v.externalVoiceId,
      name: v.externalName,
      gender: v.externalGender,
      locale: v.externalLocale,
      accent: v.externalAccent,
      ageGroup: v.externalAgeGroup,
      isMultilingual: v.externalIsMultilingual ?? false,
      styleTags: v.externalStyleTags ?? [],
      useCases: v.externalUseCases ?? [],
      previewUrl: v.externalPreviewUrl,
      emotionSupport: v.emotionSupport,
      testedLanguages: v.testedLanguages ?? [],
      rating: v.rating,
    }));
  },
  {
    response: t.Array(PublicVoiceDto),
  },
);
