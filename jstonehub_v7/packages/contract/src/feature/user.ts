type UserSort = (typeof USER_SORTS)[number];

const USER_SORTS = [
  "createdAt",
  "name",
  "email",
  "energyBalance",
  "loginStreak",
] as const;

const USER_SORT_DEFAULT: UserSort = "createdAt";

const USER_FILTERS = {
  isBanned: { values: ["true", "false"] as const },
} as const;

export { USER_FILTERS, USER_SORT_DEFAULT, USER_SORTS };
