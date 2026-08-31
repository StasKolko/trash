export type Voice = {
  voiceId: string;
  name: string;
  gender: "MALE" | "FEMALE";
  locale: string | null;
  isMultilingual: boolean;
  previewUrl: string | null;
  previewUrlEmotional: string | null;
  usageCount: number;
  avatarUrl: string | null;
  description: string | null;
  accent: string | null;
  ageGroup: string | null;
  voiceStyleTags: string[];
  useCases: string[];
};

export type VoicesResponse = {
  voices: Voice[];
  audioHeaders: Record<string, string>;
};
