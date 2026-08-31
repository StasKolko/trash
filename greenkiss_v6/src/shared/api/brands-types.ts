// src/shared/api/brands-types.ts
import { z } from "zod";
import { brandStatusEnum } from "@/shared/api/db/schemas/brand";

export const createBrandInputSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(255, "Название слишком длинное"),
  imageAssetId: z.string().optional().nullable(),
  status: z.enum(brandStatusEnum.enumValues).default("active"),
  isTest: z.boolean().optional().default(false),
});

export const updateBrandInputSchema = createBrandInputSchema.extend({
  id: z.string().min(1, "ID обязателен"),
});

export type CreateBrandInput = z.infer<typeof createBrandInputSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandInputSchema>;

export type BrandStatus = (typeof brandStatusEnum.enumValues)[number];

export type BrandListItem = {
  id: string;
  name: string;
  imageAssetId: string | null;
  status: BrandStatus;
  isTest: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
