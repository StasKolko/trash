// src/app/admin/brands/_actions/index.ts
"use server";

import { z } from "zod";
import {
  type BrandStatusFilter,
  createBrand,
  createTestBrands,
  deleteAllTestBrands,
  listBrands,
  listProductsByBrand,
  restoreBrand,
  softDeleteBrand,
  updateBrand,
} from "@/shared/api/brands";
import {
  type CreateBrandInput,
  createBrandInputSchema,
  type UpdateBrandInput,
  updateBrandInputSchema,
} from "@/shared/api/brands-types";
import type { ApiResponse } from "@/shared/api/response";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

export async function createBrandAction(
  raw: unknown,
): Promise<ApiResponse<{ id: string }>> {
  await requireAdminOrManager();

  try {
    const input = createBrandInputSchema.parse(raw) as CreateBrandInput;
    const created = await createBrand(input);
    return { success: true, data: { id: created.id } };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
        code: "VALIDATION_ERROR",
        details: e.flatten(),
      };
    }
    return {
      success: false,
      error: "INTERNAL_ERROR",
      code: "INTERNAL_ERROR",
      details: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function updateBrandAction(
  raw: unknown,
): Promise<ApiResponse<{ id: string }>> {
  await requireAdminOrManager();

  try {
    const input = updateBrandInputSchema.parse(raw) as UpdateBrandInput;
    const updated = await updateBrand(input);
    return { success: true, data: { id: updated.id } };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
        code: "VALIDATION_ERROR",
        details: e.flatten(),
      };
    }
    return {
      success: false,
      error: "INTERNAL_ERROR",
      code: "INTERNAL_ERROR",
      details: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function deleteBrandAction(
  id: string,
): Promise<ApiResponse<{ id: string }>> {
  await requireAdminOrManager();

  try {
    const deleted = await softDeleteBrand(id);
    if (!deleted) {
      return {
        success: false,
        error: "NOT_FOUND",
        code: "NOT_FOUND",
        details: `Brand ${id} not found or already deleted`,
      };
    }
    return { success: true, data: { id: deleted.id } };
  } catch (e) {
    return {
      success: false,
      error: "INTERNAL_ERROR",
      code: "INTERNAL_ERROR",
      details: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function restoreBrandAction(
  id: string,
): Promise<ApiResponse<{ id: string }>> {
  await requireAdminOrManager();

  try {
    const restored = await restoreBrand(id);
    if (!restored) {
      return {
        success: false,
        error: "NOT_FOUND",
        code: "NOT_FOUND",
        details: `Brand ${id} not found or not deleted`,
      };
    }
    return { success: true, data: { id: restored.id } };
  } catch (e) {
    return {
      success: false,
      error: "INTERNAL_ERROR",
      code: "INTERNAL_ERROR",
      details: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function listBrandsAction(params?: {
  search?: string;
  includeDeleted?: boolean;
  statusFilter?: BrandStatusFilter;
}): Promise<ApiResponse<{ items: Awaited<ReturnType<typeof listBrands>> }>> {
  await requireAdminOrManager();

  try {
    const items = await listBrands(params);
    return { success: true, data: { items } };
  } catch (e) {
    return {
      success: false,
      error: "INTERNAL_ERROR",
      code: "INTERNAL_ERROR",
      details: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function listBrandProductsAction(
  brandId: string,
): Promise<
  ApiResponse<{ items: Awaited<ReturnType<typeof listProductsByBrand>> }>
> {
  await requireAdminOrManager();

  try {
    const items = await listProductsByBrand(brandId);
    return { success: true, data: { items } };
  } catch (e) {
    return {
      success: false,
      error: "INTERNAL_ERROR",
      code: "INTERNAL_ERROR",
      details: e instanceof Error ? e.message : String(e),
    };
  }
}

// Тестовые бренды

export async function generateTestBrandsAction(count: number) {
  await requireAdminOrManager();
  await createTestBrands(count);
  return { success: true, data: {} } as ApiResponse<Record<string, never>>;
}

export async function deleteAllTestBrandsAction() {
  await requireAdminOrManager();
  await deleteAllTestBrands();
  return { success: true, data: {} } as ApiResponse<Record<string, never>>;
}
