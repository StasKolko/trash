import {
  getSecretVoicerVoiceSyncState,
  setSecretVoicerVoiceSyncBlocked,
} from "../data/repository";

export const voiceSyncState = {
  async isBlocked(): Promise<boolean> {
    const state = await getSecretVoicerVoiceSyncState();
    return state?.isBlocked ?? false;
  },

  async getBlockReason(): Promise<string | null> {
    const state = await getSecretVoicerVoiceSyncState();
    if (!state?.isBlocked) {
      return null;
    }
    return state.blockReason;
  },

  async block(reason: string): Promise<void> {
    await setSecretVoicerVoiceSyncBlocked(true, reason);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`🚨 [VoiceSync] BLOCKED: ${reason}`);
  },

  async unblock(): Promise<void> {
    await setSecretVoicerVoiceSyncBlocked(false);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("✅ [VoiceSync] Unblocked");
  },

  getState() {
    return getSecretVoicerVoiceSyncState();
  },
};
