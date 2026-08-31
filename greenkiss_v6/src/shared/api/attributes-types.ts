import { z } from "zod";
import { attributeTypeEnum } from "@/shared/api/db/schemas/catalog";

export const createAttributeInputSchema = z.object({
  code: z
    .string()
    .min(1, "Код обязателен")
    .max(64, "Код слишком длинный")
    .regex(
      /^[a-z0-9_]+$/,
      "Код может содержать только латиницу, цифры и подчёркивания",
    ),
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(255, "Название слишком длинное"),
  type: z.enum(attributeTypeEnum.enumValues).default("string"),
  isVariational: z.boolean().default(false),
  hasImages: z.boolean().default(false),
  unit: z.string().max(32).optional().nullable(),
});

export const updateAttributeInputSchema = createAttributeInputSchema.extend({
  id: z.string().min(1, "ID обязателен"),
});

export type CreateAttributeInput = z.infer<typeof createAttributeInputSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeInputSchema>;

export type AttributeListItem = {
  id: string;
  code: string;
  name: string;
  type: (typeof attributeTypeEnum.enumValues)[number];
  isVariational: boolean;
  hasImages: boolean;
  unit: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
