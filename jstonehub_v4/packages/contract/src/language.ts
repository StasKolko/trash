export type LanguageSort = (typeof LANGUAGE_SORTS)[number];

export const LANGUAGE_SORTS = ["createdAt", "name", "code"] as const;

export const LANGUAGE_LIMITS = {
  code: { min: 2, max: 10 },
  name: { min: 1, max: 100 },
} as const;
