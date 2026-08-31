export type PaginationOrder = (typeof PAGINATION_ORDERS)[number];

export const PAGINATION_ORDERS = ["asc", "desc"] as const;
export const PAGINATION_ORDER_DEFAULT = "asc" as const;

export const PAGINATION_QUERY = {
  min: 0,
  max: 200,
} as const;

export const PAGINATION_FILTER_ALL = "all" as const;

export const PAGINATION_CURSOR_LIMIT_DEFAULT = 50;
