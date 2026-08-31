"use server";

import { asc, ilike } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { type Category, categories } from "@/shared/api/db/schemas/categories";
import {
  createSuccessResponse,
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "@/shared/api/response";
import { AuthError } from "@/shared/lib/auth/errors";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type GetAllCategoriesResponse = Category[];
type GetAdminCategoriesResponse = Category[];

export async function getAllCategories() {
  try {
    const rows: Category[] = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));

    return createSuccessResponse<GetAllCategoriesResponse>({
      data: rows,
      message: "Категории успешно получены",
    });
  } catch (e) {
    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось получить категории",
      devPrefix: "getAllCategories",
    });
  }
}

export async function getAdminCategories(options?: { search?: string }) {
  const searchRaw = options?.search ?? "";
  const search = searchRaw.trim();

  try {
    await requireAdminOrManager();

    let rows: Category[];

    if (search) {
      const normalized = search.toLowerCase();

      rows = await db
        .select()
        .from(categories)
        .where(ilike(categories.searchName, `%${normalized}%`)) // ← без and()
        .orderBy(asc(categories.name));
    } else {
      rows = await db.select().from(categories).orderBy(asc(categories.name));
    }

    return createSuccessResponse<GetAdminCategoriesResponse>({
      data: rows,
      message: "Категории для админки успешно получены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось получить категории для админки",
      devPrefix: "getAdminCategories",
    });
  }
}
