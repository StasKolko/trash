import { createContract } from "./utils/create-contract";

export const secretVoicerContract = createContract({
  voiceGender: [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ] as const,

  voiceEmotionSupport: [
    { value: "none", label: "No emotions" },
    { value: "basic", label: "Basic emotions" },
    { value: "advanced", label: "Advanced emotions" },
  ] as const,

  voiceSyncEventType: [
    { value: "VOICE_ADDED", label: "Voice Added" },
    { value: "VOICE_REMOVED", label: "Voice Removed" },
    { value: "VOICE_UPDATED", label: "Voice Updated" },
  ] as const,

  supportedLanguage: [
    // === Major World Languages ===
    { value: "en", label: "English" },
    { value: "zh", label: "Chinese (Mandarin)" },
    { value: "es", label: "Spanish" },
    { value: "ar", label: "Arabic" },
    { value: "hi", label: "Hindi" },
    { value: "pt-BR", label: "Portuguese (Brazilian)" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },

    // === European Languages ===
    { value: "ru", label: "Russian" },
    { value: "de", label: "German" },
    { value: "fr", label: "French" },
    { value: "it", label: "Italian" },
    { value: "pl", label: "Polish" },
    { value: "uk", label: "Ukrainian" },
    { value: "nl", label: "Dutch" },
    { value: "ro", label: "Romanian" },
    { value: "el", label: "Greek" },
    { value: "cs", label: "Czech" },
    { value: "sv", label: "Swedish" },
    { value: "hu", label: "Hungarian" },
    { value: "bg", label: "Bulgarian" },
    { value: "da", label: "Danish" },
    { value: "fi", label: "Finnish" },
    { value: "sk", label: "Slovak" },
    { value: "no", label: "Norwegian" },
    { value: "hr", label: "Croatian" },
    { value: "sr", label: "Serbian" },
    { value: "sl", label: "Slovenian" },
    { value: "lt", label: "Lithuanian" },
    { value: "lv", label: "Latvian" },
    { value: "et", label: "Estonian" },
    { value: "ca", label: "Catalan" },
    { value: "tr", label: "Turkish" },
  ] as const,

  // === NEW: Synthesis Project Status ===
  synthesisProjectStatus: [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PARTIAL", label: "Partial" },
    { value: "FAILED", label: "Failed" },
    { value: "PAUSED", label: "Paused" },
    { value: "CANCELLED", label: "Cancelled" },
  ] as const,

  // === NEW: Synthesis Task Status ===
  synthesisTaskStatus: [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FAILED", label: "Failed" },
    { value: "CANCELLED", label: "Cancelled" },
  ] as const,
});
