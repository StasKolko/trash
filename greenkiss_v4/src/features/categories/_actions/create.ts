"use server";

import { eq } from "drizzle-orm";
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

type CreateCategoryResponse = Category;
type CreateTestCategoriesResponse = Category[];

type CreateCategoryInput = {
  name: string;
  parentId?: string | null;
  isTest?: boolean;
};

export async function createCategory(input: CreateCategoryInput) {
  const rawName = input.name;

  if (!rawName || !rawName.trim()) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Некорректные данные для создания категории",
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

  try {
    await requireAdminOrManager();

    const trimmedName = rawName.trim();
    const isTest = input.isTest ?? false;

    let parentId: string | null = null;

    if (typeof input.parentId === "string") {
      const trimmedParentId = input.parentId.trim();

      if (trimmedParentId.length > 0) {
        const [parent] = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, trimmedParentId))
          .limit(1);

        if (!parent) {
          return createErrorResponse({
            error: {
              code: "VALIDATION",
              httpStatus: 400,
              userMessage: "Указанная родительская категория не найдена",
              devMessage: `Parent category with id=${trimmedParentId} not found`,
              fields: [
                {
                  field: "parentId",
                  message: "Родительская категория не найдена",
                },
              ],
            },
          });
        }

        parentId = parent.id;
      }
    }

    const [created]: Category[] = await db
      .insert(categories)
      .values({
        name: trimmedName,
        searchName: trimmedName.toLowerCase(),
        isTest,
        parentId,
      })
      .returning();

    return createSuccessResponse<CreateCategoryResponse>({
      data: created,
      message: "Категория успешно создана",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    console.error("createCategory error", e);

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось создать категорию",
      devPrefix: "createCategory",
    });
  }
}

export async function createTestCategories(count: number) {
  if (!Number.isFinite(count) || count <= 0) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Некорректное количество категорий",
        devMessage: `Invalid count: ${count}`,
        fields: [
          {
            field: "count",
            message: "Количество категорий должно быть положительным числом",
          },
        ],
      },
    });
  }

  try {
    await requireAdminOrManager();

    const values = Array.from({ length: count }, (_, i) => {
      const name = `Test category ${i + 1}`;
      return {
        name,
        searchName: name.trim().toLowerCase(),
        isTest: true,
      };
    });

    const created: Category[] = await db
      .insert(categories)
      .values(values)
      .returning();

    return createSuccessResponse<CreateTestCategoriesResponse>({
      data: created,
      message: "Тестовые категории успешно созданы",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    console.error("createTestCategories error", e);

    return mapInternalErrorToApiResponse(e, {
      userMessage: "Не удалось создать тестовые категории",
      devPrefix: "createTestCategories",
    });
  }
}
