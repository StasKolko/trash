"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/shared/api/db";
import { type Category, categories } from "@/shared/api/db/schemas/categories";
import {
  createErrorResponse,
  createSuccessResponse,
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "@/shared/api/response";
import { AuthError } from "@/shared/lib/auth/errors";
import { requireAdminOrManager } from "@/shared/lib/auth/server";

type UpdateCategoryInput = {
  id: string;
  name?: string;
  parentId?: string | null;
};

type UpdateCategoryResponse = Category;

export async function updateCategory(input: UpdateCategoryInput) {
  const { id } = input;

  if (!id || !id.trim()) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Некорректные данные для обновления категории",
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

  const hasNameUpdate = typeof input.name === "string";
  const hasParentUpdate = Object.hasOwn(input, "parentId");

  if (!hasNameUpdate && !hasParentUpdate) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Не указаны изменения для категории",
        devMessage: "Neither name nor parentId provided for update",
      },
    });
  }

  let trimmedName: string | undefined;
  if (hasNameUpdate && input.name !== undefined) {
    trimmedName = input.name.trim();
    if (!trimmedName) {
      return createErrorResponse({
        error: {
          code: "VALIDATION",
          httpStatus: 400,
          userMessage: "Некорректные данные для обновления категории",
          devMessage: "name is missing/empty",
          fields: [
            {
              field: "name",
              message: "Название категории обязательно",
            },
          ],
        },
      });
    }
  }

  try {
    await requireAdminOrManager();

    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id.trim()))
      .limit(1);

    if (!existing) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${id} not found`,
        },
      });
    }

    let nextParentId: string | null | undefined;

    if (hasParentUpdate) {
      if (
        input.parentId === null ||
        input.parentId === undefined ||
        input.parentId === ""
      ) {
        nextParentId = null;
      } else {
        const newParentId = input.parentId.trim();

        if (newParentId === existing.id) {
          return createErrorResponse({
            error: {
              code: "VALIDATION",
              httpStatus: 400,
              userMessage:
                "Категорию нельзя сделать дочерней самой себе. Выберите другую родительскую категорию.",
              devMessage: `Attempt to set parentId=${newParentId} equal to id=${existing.id}`,
              fields: [
                {
                  field: "parentId",
                  message: "Нельзя выбрать эту же категорию как родительскую",
                },
              ],
            },
          });
        }

        const [parent] = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, newParentId))
          .limit(1);

        if (!parent) {
          return createErrorResponse({
            error: {
              code: "VALIDATION",
              httpStatus: 400,
              userMessage: "Указанная родительская категория не найдена",
              devMessage: `Parent category with id=${newParentId} not found`,
              fields: [
                {
                  field: "parentId",
                  message: "Родительская категория не найдена",
                },
              ],
            },
          });
        }

        const result = await db.execute(
          sql<{
            id: string;
          }>`
            WITH RECURSIVE subtree AS (
              SELECT id, parent_id
              FROM categories
              WHERE id = ${existing.id}
              UNION ALL
              SELECT c.id, c.parent_id
              FROM categories c
              JOIN subtree s ON c.parent_id = s.id
            )
            SELECT id FROM subtree WHERE id = ${newParentId} LIMIT 1;
          `,
        );

        const rows =
          "rows" in result && Array.isArray(result.rows)
            ? (result.rows as { id: string }[])
            : [];

        if (rows.length > 0) {
          return createErrorResponse({
            error: {
              code: "CONFLICT",
              httpStatus: 409,
              userMessage:
                "Нельзя сделать дочернюю категорию родительской. Выберите другую родительскую категорию.",
              devMessage: `Attempt to set parentId=${newParentId} which is a descendant of id=${existing.id}`,
              fields: [
                {
                  field: "parentId",
                  message:
                    "Нельзя выбрать потомка этой категории как родительскую категорию",
                },
              ],
            },
          });
        }

        nextParentId = newParentId;
      }
    }

    const updateData: Partial<typeof categories.$inferInsert> = {};

    if (trimmedName !== undefined) {
      updateData.name = trimmedName;
      updateData.searchName = trimmedName.toLowerCase();
    }

    if (hasParentUpdate) {
      updateData.parentId = nextParentId ?? null;
    }

    const [updated]: Category[] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, existing.id))
      .returning();

    if (!updated) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${id} not found after update`,
        },
      });
    }

    return createSuccessResponse<UpdateCategoryResponse>({
      data: updated,
      message: "Категория успешно обновлена",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось обновить категорию",
      devPrefix: "updateCategory",
    });
  }
}
