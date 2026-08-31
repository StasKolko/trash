export type CatalogProductListItem = {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;

  // Цена в базовой валюте (в центах)
  priceCents: number | null;
  originalPriceCents: number | null;
  discountPercent: number | null;

  // Пока без реальных медиа: используем статический placeholder
  imageUrl: string | null;

  // Для будущих расширений (например, рейтинг)
  rating: number | null;
  reviewsCount: number | null;
};

export type CatalogProductListParams = {
  categoryId?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

export type CatalogProductListResult = {
  items: CatalogProductListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
