import { type TSchema, Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import {
  deleteAllSecretVoicerVoiceSyncEvents,
  deleteSecretVoicerVoiceSyncEvent,
  getAllSecretVoicerVoiceSyncEvents,
  getAllSecretVoicerVoices,
  getSecretVoicerVoiceById,
  updateSecretVoicerVoice,
} from "../data/repository";
import { VOICE_RATING_MAX, VOICE_RATING_MIN } from "../lib/constants";
import { syncVoicesFromExternalApi } from "../services/sync-service";
import { voiceSyncState } from "../services/sync-state";

const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()]);

const VoiceDto = t.Object({
  id: t.String(),
  externalId: t.Number(),
  externalVoiceId: t.String(),
  externalName: t.String(),
  externalDescription: Nullable(t.String()),
  externalGender: t.String(),
  externalLocale: Nullable(t.String()),
  externalPreviewUrl: Nullable(t.String()),
  externalPreviewUrlEmotional: Nullable(t.String()),
  externalAvatarUrl: Nullable(t.String()),
  externalAccent: Nullable(t.String()),
  externalAgeGroup: Nullable(t.String()),
  externalIsMultilingual: Nullable(t.Boolean()),
  externalStyleTags: Nullable(t.Array(t.String())),
  externalUseCases: Nullable(t.Array(t.String())),
  emotionSupport: t.String(),
  testedLanguages: Nullable(t.Array(t.String())),
  rating: t.Number(),
  notes: Nullable(t.String()),
  isHidden: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

const UpdateVoiceDto = t.Object({
  emotionSupport: t.Optional(t.String()),
  testedLanguages: t.Optional(t.Array(t.String())),
  rating: t.Optional(
    t.Number({ minimum: VOICE_RATING_MIN, maximum: VOICE_RATING_MAX }),
  ),
  notes: t.Optional(Nullable(t.String())),
  isHidden: t.Optional(t.Boolean()),
});

const SyncEventDto = t.Object({
  id: t.String(),
  eventType: t.String(),
  isCritical: t.Boolean(),
  voiceId: Nullable(t.String()),
  externalVoiceId: Nullable(t.String()),
  voiceName: Nullable(t.String()),
  changedFields: Nullable(t.Array(t.String())),
  oldValues: Nullable(t.Record(t.String(), t.Unknown())),
  newValues: Nullable(t.Record(t.String(), t.Unknown())),
  createdAt: t.Date(),
});

const SyncStateDto = t.Object({
  isBlocked: t.Boolean(),
  blockReason: Nullable(t.String()),
  blockedAt: Nullable(t.Date()),
  lastSyncAt: Nullable(t.Date()),
  lastSyncSuccess: Nullable(t.Boolean()),
  lastSyncError: Nullable(t.String()),
  lastSyncStats: Nullable(
    t.Object({
      totalVoices: t.Number(),
      added: t.Number(),
      removed: t.Number(),
      updated: t.Number(),
      unchanged: t.Number(),
    }),
  ),
});

export const secretVoicerVoiceAdminControllerV1 = new Elysia({
  prefix: "/voices",
})
  .get("/", () => getAllSecretVoicerVoices(), {
    response: t.Array(VoiceDto),
  })

  .get(
    "/:id",
    async ({ params: { id } }) => {
      const voice = await getSecretVoicerVoiceById(id);
      if (!voice) {
        throw new NotFoundError("Voice not found");
      }
      return voice;
    },
    { response: VoiceDto },
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const voice = await updateSecretVoicerVoice(id, body);
      if (!voice) {
        throw new NotFoundError("Voice not found");
      }
      return voice;
    },
    {
      body: UpdateVoiceDto,
      response: VoiceDto,
    },
  )

  .get("/sync-events", () => getAllSecretVoicerVoiceSyncEvents(), {
    response: t.Array(SyncEventDto),
  })

  .delete(
    "/sync-events/:id",
    async ({ params: { id } }) => {
      const event = await deleteSecretVoicerVoiceSyncEvent(id);
      if (!event) {
        throw new NotFoundError("Sync event not found");
      }
      return { success: true, id };
    },
    {
      response: t.Object({ success: t.Boolean(), id: t.String() }),
    },
  )

  .delete(
    "/sync-events",
    async () => {
      const count = await deleteAllSecretVoicerVoiceSyncEvents();
      return { success: true, deletedCount: count };
    },
    {
      response: t.Object({ success: t.Boolean(), deletedCount: t.Number() }),
    },
  )

  .get(
    "/sync-state",
    async () => {
      const state = await voiceSyncState.getState();
      return (
        state ?? {
          isBlocked: false,
          blockReason: null,
          blockedAt: null,
          lastSyncAt: null,
          lastSyncSuccess: null,
          lastSyncError: null,
          lastSyncStats: null,
        }
      );
    },
    {
      response: SyncStateDto,
    },
  )

  .post(
    "/sync-state/unblock",
    async () => {
      await voiceSyncState.unblock();
      return { success: true };
    },
    {
      response: t.Object({ success: t.Boolean() }),
    },
  )

  // === Manual Sync Trigger ===
  .post("/sync", () => syncVoicesFromExternalApi(), {
    response: t.Object({
      success: t.Boolean(),
      stats: t.Object({
        totalVoices: t.Number(),
        added: t.Number(),
        removed: t.Number(),
        updated: t.Number(),
        unchanged: t.Number(),
      }),
      error: t.Optional(t.String()),
      hasCriticalChanges: t.Boolean(),
    }),
  });
