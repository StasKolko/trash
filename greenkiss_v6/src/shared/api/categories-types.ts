import { z } from "zod";
import { categoryStatusEnum } from "@/shared/api/db/schemas/catalog";

export const createCategoryInputSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  parentId: z.string().optional().nullable(),
  status: z.enum(categoryStatusEnum.enumValues).default("draft"),
  sortOrder: z.number().int().default(0),
  description: z.string().max(2000).optional().nullable(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().max(300).optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  fullPath: string;
  level: number;
  status: (typeof categoryStatusEnum.enumValues)[number];
  sortOrder: number;
  parentId: string | null;
  children: CategoryNode[];
};
