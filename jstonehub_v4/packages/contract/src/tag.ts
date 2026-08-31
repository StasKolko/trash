export type TagSort = (typeof TAG_SORTS)[number];

export const TAG_SORTS = ["createdAt", "name", "slug"] as const;

export const TAG_LIMITS = {
  slug: { min: 1, max: 100 },
  name: { min: 1, max: 100 },
} as const;
