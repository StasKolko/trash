"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { categories } from "@/shared/api/db/schemas/categories";
import {
  createErrorResponse,
  createSuccessResponse,
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "@/shared/api/response";
import { AuthError } from "@/shared/lib/auth/errors";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type DeleteCategoryByIdResponse = { id: string; deletedCount: number };
type DeleteAllCategoriesResponse = { deletedCount: number };
type DeleteAllTestCategoriesResponse = { deletedCount: number };

export async function deleteCategoryById(id: string) {
  try {
    await requireAdminOrManager();

    const trimmedId = id.trim();

    if (!trimmedId) {
      return createErrorResponse({
        error: {
          code: "VALIDATION",
          httpStatus: 400,
          userMessage: "Некорректные данные для удаления категории",
          devMessage: "id is missing/empty",
          fields: [
            {
              field: "id",
              message: "Идентификатор категории обязателен",
            },
          ],
        },
      });
    }

    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.id, trimmedId))
      .limit(1);

    if (!existing.length) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${trimmedId} not found`,
        },
      });
    }

    const result = await db.execute(
      sql<{
        id: string;
      }>`
        WITH RECURSIVE subtree AS (
          SELECT id
          FROM categories
          WHERE id = ${trimmedId}
          UNION ALL
          SELECT c.id
          FROM categories c
          JOIN subtree s ON c.parent_id = s.id
        )
        DELETE FROM categories
        WHERE id IN (SELECT id FROM subtree)
        RETURNING id;
      `,
    );

    const rows =
      "rows" in result && Array.isArray(result.rows)
        ? (result.rows as { id: string }[])
        : [];

    const deletedCount = rows.length;

    return createSuccessResponse<DeleteCategoryByIdResponse>({
      data: { id: trimmedId, deletedCount },
      message: "Категория и вложенные категории успешно удалены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось удалить категорию",
      devPrefix: "deleteCategoryById",
    });
  }
}

export async function deleteAllCategories() {
  try {
    await requireAdminOrManager();

    const deleted = await db
      .delete(categories)
      .returning({ id: categories.id });

    return createSuccessResponse<DeleteAllCategoriesResponse>({
      data: { deletedCount: deleted.length },
      message: "Все категории успешно удалены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось удалить все категории",
      devPrefix: "deleteAllCategories",
    });
  }
}

export async function deleteAllTestCategories() {
  try {
    await requireAdminOrManager();

    const deleted = await db
      .delete(categories)
      .where(eq(categories.isTest, true))
      .returning({ id: categories.id });

    return createSuccessResponse<DeleteAllTestCategoriesResponse>({
      data: { deletedCount: deleted.length },
      message: "Все тестовые категории успешно удалены",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось удалить тестовые категории",
      devPrefix: "deleteAllTestCategories",
    });
  }
}
