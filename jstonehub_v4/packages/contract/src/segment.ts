export type Segment = {
  id: string;
  role: string;
  text: string;
};

export type RoleVoiceMapping = {
  role: string;
  voiceId: string | null;
};

export const SEGMENT_ROLE_MAX_LENGTH = 50;
export const SEGMENT_TEXT_MAX_LENGTH = 5000;
