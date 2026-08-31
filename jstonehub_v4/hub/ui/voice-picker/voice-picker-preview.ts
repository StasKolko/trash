import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";

import { createSignal, onCleanup } from "solid-js";

type PreviewApi = {
  getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
};

function useVoicePreview(api: PreviewApi) {
  const [playingVoiceId, setPlayingVoiceId] = createSignal<string | null>(null);
  let audioElement: HTMLAudioElement | null = null;

  onCleanup(() => {
    stopPlayback();
  });

  function stopPlayback() {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
      audioElement = null;
    }
    setPlayingVoiceId(null);
  }

  async function togglePreview(voice: SecretVoicerVoice) {
    if (playingVoiceId() === voice.voiceId) {
      stopPlayback();
      return;
    }

    stopPlayback();

    if (!voice.previewUrl) {
      return;
    }

    try {
      const downloadUrl = await api.getPreviewUrl(
        voice.voiceId,
        voice.previewUrl,
      );

      audioElement = new Audio(downloadUrl);
      setPlayingVoiceId(voice.voiceId);

      audioElement.addEventListener("ended", () => {
        setPlayingVoiceId(null);
      });

      audioElement.addEventListener("error", () => {
        setPlayingVoiceId(null);
      });

      await audioElement.play();
    } catch {
      setPlayingVoiceId(null);
    }
  }

  return {
    playingVoiceId,
    togglePreview,
    stopPlayback,
  };
}

export { useVoicePreview };
