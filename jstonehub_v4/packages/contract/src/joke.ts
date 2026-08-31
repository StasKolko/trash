export type JokeStatus = (typeof JOKE_STATUSES)[number];
export type JokeTranslationStatus = (typeof JOKE_TRANSLATION_STATUSES)[number];

export const JOKE_STATUSES = ["draft", "review", "approved"] as const;
export const JOKE_TRANSLATION_STATUSES = ["draft", "approved"] as const;

export const JOKE_HUMOR_RATING = {
  min: 0,
  max: 10,
} as const;

export const JOKE_SORTS = ["createdAt", "humorRating"] as const;
export type JokeSort = (typeof JOKE_SORTS)[number];
