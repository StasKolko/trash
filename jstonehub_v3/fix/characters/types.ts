import type { secretVoicerCharacterTable } from "./table";

export type SecretVoicerCharacter =
  typeof secretVoicerCharacterTable.$inferSelect;

export type NewSecretVoicerCharacter =
  typeof secretVoicerCharacterTable.$inferInsert;

export type UpdateSecretVoicerCharacter = {
  voiceId?: string;
};
