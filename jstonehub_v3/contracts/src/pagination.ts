export type SortOrder = (typeof SORT_ORDERS)[number];

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const SORT_ORDERS = ["asc", "desc"] as const;
export const PAGINATION_PAGE_DEFAULT = 1;
export const PAGINATION_LIMIT_DEFAULT = 20;
export const PAGINATION_LIMIT_MAX = 100;
