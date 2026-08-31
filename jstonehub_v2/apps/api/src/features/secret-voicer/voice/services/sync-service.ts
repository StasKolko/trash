import { and, eq } from "drizzle-orm";
import { browserFingerprintTable } from "#api/features/browser-fingerprint";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "../../credential/table";
import {
  createSecretVoicerVoiceSyncEvents,
  createSecretVoicerVoices,
  deleteOldSecretVoicerVoiceSyncEvents,
  getSecretVoicerVoicesByExternalVoiceIds,
  getSecretVoicerVoicesNotInExternalIds,
  updateSecretVoicerVoiceExternalFields,
  upsertSecretVoicerVoiceSyncState,
} from "../data/repository";
import type {
  ExternalVoice,
  ExternalVoicesResponse,
  NewSecretVoicerVoiceSyncEvent,
} from "../data/types";
import {
  EXTERNAL_VOICES_API_URL,
  USE_MOCK_DATA_ON_ERROR,
  VOICE_SYNC_LOG_RETENTION_DAYS,
} from "../lib/constants";
import {
  extractNewValuesFromExternal,
  extractOldValues,
  getChangedExternalFields,
  mapExternalVoiceToDb,
} from "../lib/helpers";
import { MOCK_VOICES } from "../lib/mock-data";
import { voiceSyncState } from "./sync-state";

const REDIRECT_STATUS_MIN = 300;
const REDIRECT_STATUS_MAX = 400;

type SyncStats = {
  totalVoices: number;
  added: number;
  removed: number;
  updated: number;
  unchanged: number;
};

type SyncResult = {
  success: boolean;
  stats: SyncStats;
  error?: string;
  hasCriticalChanges: boolean;
  usedMockData?: boolean;
};

type VoiceUpdate = {
  id: string;
  data: ReturnType<typeof mapExternalVoiceToDb>;
};

type AuthHeaders = {
  cookie: string;
  "x-csrftoken": string;
  "user-agent": string;
  "sec-ch-ua": string;
  "sec-ch-ua-mobile": string;
  "sec-ch-ua-platform": string;
};

async function getActiveCredentialWithFingerprint(): Promise<AuthHeaders | null> {
  const result = await db
    .select({
      csrfToken: secretVoicerCredentialTable.csrfToken,
      sessionId: secretVoicerCredentialTable.sessionId,
      userAgent: browserFingerprintTable.userAgent,
      secChUa: browserFingerprintTable.secChUa,
      secChUaMobile: browserFingerprintTable.secChUaMobile,
      secChUaPlatform: browserFingerprintTable.secChUaPlatform,
    })
    .from(secretVoicerCredentialTable)
    .innerJoin(
      browserFingerprintTable,
      eq(secretVoicerCredentialTable.fingerprintId, browserFingerprintTable.id),
    )
    .where(
      and(
        eq(secretVoicerCredentialTable.isActive, true),
        eq(browserFingerprintTable.isActive, true),
      ),
    )
    .limit(1);

  const cred = result[0];

  if (!cred) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] No active credentials found");
    return null;
  }

  const csrf = cred.csrfToken.trim();
  const session = cred.sessionId.trim();

  return {
    cookie: `csrftoken=${csrf}; sessionid=${session}`,
    "x-csrftoken": csrf,
    "user-agent": cred.userAgent,
    "sec-ch-ua": cred.secChUa,
    "sec-ch-ua-mobile": cred.secChUaMobile,
    "sec-ch-ua-platform": cred.secChUaPlatform,
  };
}

async function fetchExternalVoices(): Promise<{
  voices: ExternalVoice[];
  isMock: boolean;
}> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`📡 [VoiceSync] Fetching from: ${EXTERNAL_VOICES_API_URL}`);

  const authHeaders = await getActiveCredentialWithFingerprint();

  if (!authHeaders) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] No credentials available");
    if (USE_MOCK_DATA_ON_ERROR) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔧 [VoiceSync] Using mock data (${MOCK_VOICES.length} voices)`,
      );
      return { voices: MOCK_VOICES, isMock: true };
    }
    throw new Error(
      "No active credentials configured. Please add credentials first.",
    );
  }

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      origin: "https://secret-voicer.ru",
      referer: "https://secret-voicer.ru/app/",
      ...authHeaders,
    };

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("🔐 [VoiceSync] Using authenticated request");

    const response = await fetch(EXTERNAL_VOICES_API_URL, {
      method: "GET",
      headers,
      redirect: "manual",
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📡 [VoiceSync] Response status: ${response.status}`);

    if (
      response.status >= REDIRECT_STATUS_MIN
      && response.status < REDIRECT_STATUS_MAX
    ) {
      throw new Error(
        `Auth failed (redirect ${response.status}). Session may be expired. Update credentials.`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
        throw new Error(
          "Auth failed - received login page. Session expired. Update credentials.",
        );
      }
      throw new Error(`External API error: ${response.status}`);
    }

    const data = (await response.json()) as ExternalVoicesResponse;
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `📡 [VoiceSync] Received ${data.grouped_voices?.length ?? 0} groups`,
    );

    const voices = data.grouped_voices.flatMap((group) => group.voices);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📡 [VoiceSync] Total voices extracted: ${voices.length}`);

    return { voices, isMock: false };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] External API failed:", error);

    if (USE_MOCK_DATA_ON_ERROR) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔧 [VoiceSync] Using mock data (${MOCK_VOICES.length} voices)`,
      );
      return { voices: MOCK_VOICES, isMock: true };
    }

    throw error;
  }
}

async function processRemovedVoices(
  externalVoiceIds: string[],
  syncEvents: NewSecretVoicerVoiceSyncEvent[],
  stats: SyncStats,
): Promise<boolean> {
  const removedVoices =
    await getSecretVoicerVoicesNotInExternalIds(externalVoiceIds);

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `🔍 [VoiceSync] Checking for removed voices. Found: ${removedVoices.length}`,
  );

  if (removedVoices.length === 0) {
    return false;
  }

  stats.removed = removedVoices.length;

  for (const voice of removedVoices) {
    syncEvents.push({
      eventType: "VOICE_REMOVED",
      isCritical: true,
      voiceId: voice.id,
      externalVoiceId: voice.externalVoiceId,
      voiceName: voice.externalName,
      oldValues: { externalVoiceId: voice.externalVoiceId },
    });
  }

  const removedNames = removedVoices.map((v) => v.externalName).join(", ");
  await voiceSyncState.block(
    `${removedVoices.length} voice(s) removed from external API: ${removedNames}`,
  );

  return true;
}

async function processExternalVoices(
  externalVoices: ExternalVoice[],
  syncEvents: NewSecretVoicerVoiceSyncEvent[],
  stats: SyncStats,
): Promise<void> {
  const externalVoiceIds = externalVoices.map((v) => v.voice_id);
  const existingVoices =
    await getSecretVoicerVoicesByExternalVoiceIds(externalVoiceIds);

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`🔍 [VoiceSync] Existing voices in DB: ${existingVoices.length}`);

  const existingMap = new Map(
    existingVoices.map((v) => [v.externalVoiceId, v]),
  );

  const voicesToInsert: ReturnType<typeof mapExternalVoiceToDb>[] = [];
  const voicesToUpdate: VoiceUpdate[] = [];

  for (const extVoice of externalVoices) {
    const existing = existingMap.get(extVoice.voice_id);

    if (existing) {
      const changedFields = getChangedExternalFields(existing, extVoice);

      if (changedFields.length > 0) {
        const updateData = mapExternalVoiceToDb(extVoice);
        voicesToUpdate.push({ id: existing.id, data: updateData });
        stats.updated++;

        syncEvents.push({
          eventType: "VOICE_UPDATED",
          isCritical: false,
          voiceId: existing.id,
          externalVoiceId: extVoice.voice_id,
          voiceName: extVoice.name,
          changedFields,
          oldValues: extractOldValues(existing, changedFields),
          newValues: extractNewValuesFromExternal(extVoice, changedFields),
        });
      } else {
        stats.unchanged++;
      }
    } else {
      voicesToInsert.push(mapExternalVoiceToDb(extVoice));
      stats.added++;

      syncEvents.push({
        eventType: "VOICE_ADDED",
        isCritical: false,
        externalVoiceId: extVoice.voice_id,
        voiceName: extVoice.name,
        newValues: { name: extVoice.name, gender: extVoice.gender },
      });
    }
  }

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `📊 [VoiceSync] To insert: ${voicesToInsert.length}, To update: ${voicesToUpdate.length}`,
  );

  if (voicesToInsert.length > 0) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `➕ [VoiceSync] Inserting ${voicesToInsert.length} new voices...`,
    );
    const inserted = await createSecretVoicerVoices(voicesToInsert);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`✅ [VoiceSync] Inserted ${inserted.length} voices`);
  }

  if (voicesToUpdate.length > 0) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🔄 [VoiceSync] Updating ${voicesToUpdate.length} voices...`);
    await Promise.all(
      voicesToUpdate.map(({ id, data }) =>
        updateSecretVoicerVoiceExternalFields(id, data),
      ),
    );
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("✅ [VoiceSync] Updated voices");
  }
}

function cleanupOldEvents(): Promise<number> {
  const retentionDate = new Date();
  retentionDate.setDate(
    retentionDate.getDate() - VOICE_SYNC_LOG_RETENTION_DAYS,
  );
  return deleteOldSecretVoicerVoiceSyncEvents(retentionDate);
}

export async function syncVoicesFromExternalApi(): Promise<SyncResult> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log("🚀 [VoiceSync] Starting sync...");

  const stats: SyncStats = {
    totalVoices: 0,
    added: 0,
    removed: 0,
    updated: 0,
    unchanged: 0,
  };

  let hasCriticalChanges = false;
  let usedMockData = false;

  try {
    const { voices: externalVoices, isMock } = await fetchExternalVoices();
    usedMockData = isMock;
    stats.totalVoices = externalVoices.length;

    if (externalVoices.length === 0) {
      throw new Error("External API returned 0 voices - possible API error");
    }

    const externalVoiceIds = externalVoices.map((v) => v.voice_id);
    const syncEvents: NewSecretVoicerVoiceSyncEvent[] = [];

    if (!usedMockData) {
      hasCriticalChanges = await processRemovedVoices(
        externalVoiceIds,
        syncEvents,
        stats,
      );
    }

    await processExternalVoices(externalVoices, syncEvents, stats);

    if (syncEvents.length > 0) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `📝 [VoiceSync] Creating ${syncEvents.length} sync events...`,
      );
      await createSecretVoicerVoiceSyncEvents(syncEvents);
    }

    const deletedOld = await cleanupOldEvents();
    if (deletedOld > 0) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(`🗑️ [VoiceSync] Cleaned up ${deletedOld} old events`);
    }

    await upsertSecretVoicerVoiceSyncState({
      lastSyncAt: new Date(),
      lastSyncSuccess: true,
      lastSyncError: usedMockData
        ? "Used mock data (external API unavailable)"
        : null,
      lastSyncStats: stats,
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      "✅ [VoiceSync] Completed! Stats:",
      stats,
      usedMockData ? "(mock data)" : "",
    );

    return { success: true, stats, hasCriticalChanges, usedMockData };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("❌ [VoiceSync] Failed:", errorMsg);

    await upsertSecretVoicerVoiceSyncState({
      lastSyncAt: new Date(),
      lastSyncSuccess: false,
      lastSyncError: errorMsg,
    });

    return {
      success: false,
      stats,
      error: errorMsg,
      hasCriticalChanges,
    };
  }
}
