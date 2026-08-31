src\features\categories\index.ts

```

```

src\features\categories\server.ts

```
export { createCategory, createTestCategories } from "./_actions/create";
export {
  deleteAllCategories,
  deleteAllTestCategories,
  deleteCategoryById,
} from "./_actions/delete";
export { getAdminCategories, getAllCategories } from "./_actions/read";
export { updateCategoryName } from "./_actions/update";
export { AdminCategoriesPage } from "./_ui/page";

```

src\features\categories\_actions\create.ts

```
"use server";

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

export async function createCategory(name: string, isTest = false) {
  if (!name || !name.trim()) {
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

    const trimmedName = name.trim();

    const [created]: Category[] = await db
      .insert(categories)
      .values({
        name: trimmedName,
        searchName: trimmedName.toLowerCase(),
        isTest,
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
  // Валидация входа
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

```

src\features\categories\_actions\delete.ts

```
"use server";

import { eq } from "drizzle-orm";
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

type DeleteCategoryByIdResponse = { id: string };
type DeleteAllCategoriesResponse = { deletedCount: number };
type DeleteAllTestCategoriesResponse = { deletedCount: number };

export async function deleteCategoryById(id: string) {
  try {
    await requireAdminOrManager();

    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing.length) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${id} not found`,
        },
      });
    }

    await db.delete(categories).where(eq(categories.id, id));

    return createSuccessResponse<DeleteCategoryByIdResponse>({
      data: { id },
      message: `Категория с id ${id} успешно удалена`,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e);
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

    return mapInternalErrorToApiResponse(e);
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

    return mapInternalErrorToApiResponse(e);
  }
}

```

src\features\categories\_actions\read.ts

```
"use server";

import { and, ilike } from "drizzle-orm";
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
    const rows: Category[] = await db.select().from(categories);

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
        .where(and(ilike(categories.searchName, `%${normalized}%`)));
    } else {
      rows = await db.select().from(categories);
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

```

src\features\categories\_actions\update.ts

```
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

type UpdateCategoryNameResponse = Category;

export async function updateCategoryName(id: string, name: string) {
  if (!id || !name.trim()) {
    return createErrorResponse({
      error: {
        code: "VALIDATION",
        httpStatus: 400,
        userMessage: "Некорректные данные для обновления категории",
        devMessage: "id or name is missing/empty",
        fields: [
          !id
            ? { field: "id", message: "Идентификатор категории обязателен" }
            : undefined,
          !name || !name.trim()
            ? { field: "name", message: "Название категории обязательно" }
            : undefined,
        ].filter(Boolean) as { field: string; message: string }[],
      },
    });
  }

  try {
    await requireAdminOrManager();

    const [updated]: Category[] = await db
      .update(categories)
      .set({ name: name.trim() })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return createErrorResponse({
        error: {
          code: "NOT_FOUND",
          httpStatus: 404,
          userMessage: "Категория не найдена",
          devMessage: `Category with id=${id} not found`,
        },
      });
    }

    return createSuccessResponse<UpdateCategoryNameResponse>({
      data: updated,
      message: "Название категории успешно обновлено",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return mapAuthErrorToApiResponse(e);
    }

    return mapInternalErrorToApiResponse(e);
  }
}

```

src\features\categories\_ui\filters.tsx

```
import { Input } from "@/shared/ui/kit/input";

export const AdminCategoriesFilters = ({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="categories-search"
          className="text-sm font-medium text-muted-foreground"
        >
          Поиск категорий
        </label>
        <Input
          id="categories-search"
          type="search"
          placeholder="Введите название категории..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-80"
        />
      </div>

      {/* тут в дальнейшем можно добавить сортировку / доп. фильтры */}
    </div>
  );
};

```

src\features\categories\_ui\manager.tsx

```
"use client";

import { useCallback, useMemo, useState } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import type {
  ApiResponseError,
  ApiResponseSuccess,
} from "@/shared/api/response";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { debounce } from "@/shared/lib/timing";
import { getAdminCategories } from "../_actions/read";

import { AdminCategoriesFilters } from "./filters";
import { AdminCategoriesTable } from "./table";

type GetAdminCategoriesResponse = Category[];

type GetAdminCategoriesApiResponse =
  | ApiResponseSuccess<GetAdminCategoriesResponse>
  | ApiResponseError;

type AdminCategoriesManagerProps = {
  initialCategories: Category[];
};

export const AdminCategoriesManager = ({
  initialCategories,
}: AdminCategoriesManagerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";

  const [inputValue, setInputValue] = useState(urlSearch);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);

  const updateSearchParam = useCallback(
    (nextSearch: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = nextSearch.trim();

      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const fetchCategories = useCallback(async (currentSearch: string) => {
    setIsLoading(true);
    try {
      const trimmed = currentSearch.trim();
      const res: GetAdminCategoriesApiResponse = await getAdminCategories(
        trimmed ? { search: trimmed } : undefined,
      );

      if (res.status === "error") {
        console.error(res.error.devMessage ?? res.error.userMessage);
        return;
      }

      setCategories(res.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedUpdateSearchAndFetch = useMemo(
    () =>
      debounce((value: string) => {
        updateSearchParam(value);
        void fetchCategories(value);
      }, 500),
    [updateSearchParam, fetchCategories],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedUpdateSearchAndFetch(value);
    },
    [debouncedUpdateSearchAndFetch],
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminCategoriesFilters
        search={inputValue}
        onSearchChange={handleSearchChange}
      />

      {isLoading && (
        <div className="text-xs text-muted-foreground">
          Загрузка категорий...
        </div>
      )}

      <AdminCategoriesTable categories={categories} />
    </div>
  );
};

```

src\features\categories\_ui\page.tsx

```
import { getAdminCategories } from "../_actions/read";
import { AdminContainer } from "@/shared/ui/admin-kit";
import { OnlyDevCard } from "@/shared/ui/only-dev-card";
import { AdminCategoriesManager } from "./manager";
import { AdminTestCategories } from "./test-categories";

export const AdminCategoriesPage = async () => {
  const res = await getAdminCategories();

  const initialCategories = res.status === "success" ? res.data : [];

  return (
    <AdminContainer title="Категории">
      <OnlyDevCard title="Управление тестовыми категориями">
        <AdminTestCategories />
      </OnlyDevCard>

      <AdminCategoriesManager initialCategories={initialCategories} />
    </AdminContainer>
  );
};

```

src\features\categories\_ui\table.tsx

```
import type { Category } from "@/shared/api/db/schemas/categories";
import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/kit/badge";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";

export const AdminCategoriesTable = ({
  categories,
  className,
}: {
  categories: Category[];
  className?: string;
}) => {
  if (!categories.length) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Категории не найдены.
      </div>
    );
  }

  return (
    <ScrollArea className={cn("w-full", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">ID</th>
            <th className="px-3 py-2 font-medium">Название</th>
            <th className="px-3 py-2 font-medium">Тестовая</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b last:border-0">
              <td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">
                {category.id}
              </td>
              <td className="px-3 py-2 align-top">{category.name}</td>
              <td className="px-3 py-2 align-top">
                {category.isTest ? (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    test
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
};

```

src\features\categories\_ui\test-categories.tsx

```
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { createTestCategories } from "../_actions/create";
import { deleteAllTestCategories } from "../_actions/delete";

export const AdminTestCategories = () => {
  const [count, setCount] = useState<number>(10);
  const [loadingAction, setLoadingAction] = useState<"add" | "delete" | null>(null);
  const router = useRouter();

  const isLoading = loadingAction !== null;

  async function handleAdd() {
    setLoadingAction("add");
    try {
      const res = await createTestCategories(count);
      if (res.status === "error") {
        console.error(res.error.devMessage ?? res.error.userMessage);
        return;
      }

      // Вот тут обновляем серверный компонент
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDeleteAllTest() {
    setLoadingAction("delete");
    try {
      const res = await deleteAllTestCategories();
      if (res.status === "error") {
        console.error(res.error.devMessage ?? res.error.userMessage);
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="test-count">
          Количество тестовых категорий
        </label>
        <Input
          id="test-count"
          type="number"
          min={1}
          value={count}
          onChange={(e) => {
            const value = Number(e.target.value);
            setCount(value);
          }}
          className="w-32"
          disabled={isLoading}
        />
      </div>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={isLoading || count <= 0}
      >
        {isLoading && loadingAction === "add" ? "Добавление..." : "Добавить"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={handleDeleteAllTest}
        disabled={isLoading}
      >
        {isLoading && loadingAction === "delete"
          ? "Удаление..."
          : "Удалить все тестовые"}
      </Button>
    </div>
  );
};

```

src\shared\api\db\schemas\categories.ts

```
import type { InferSelectModel } from "drizzle-orm";
import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@/shared/lib/id";

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    searchName: text("search_name").notNull(),
    isTest: boolean("is_test").notNull().default(false),
  },
  (table) => [index("categories_search_name_idx").on(table.searchName)],
);

export type Category = InferSelectModel<typeof categories>;

```

src\shared\api\response\index.ts

```
export {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "./_lib/builders";

export {
  mapAuthErrorToApiResponse,
  mapInternalErrorToApiResponse,
} from "./_lib/helpers";

export type {
  ApiErrorCode,
  ApiErrorDetail,
  ApiErrorDetailField,
  ApiResponse,
  ApiResponseError,
  ApiResponseMeta,
  ApiResponseMetaPagination,
  ApiResponseStatus,
  ApiResponseSuccess,
} from "./_model/types";

```

src\shared\api\response\server.ts

```
export {
  createNextErrorResponse,
  createNextResponseFromApi,
  createNextSuccessResponse,
} from "./_lib/next-response";

```

src\shared\api\response\_lib\builders.ts

```
import type {
  ApiResponseError,
  ApiResponseMetaPagination,
  ApiResponseSuccess,
} from "../_model/types";

export const createSuccessResponse = <TData>(
  options: Omit<ApiResponseSuccess<TData>, "status">,
): ApiResponseSuccess<TData> => {
  return {
    ...options,
    status: "success",
  };
};

export const createErrorResponse = (
  options: Omit<ApiResponseError, "status">,
): ApiResponseError => {
  return {
    ...options,
    status: "error",
  };
};

export const createPaginatedResponse = <TData>(
  options: Omit<ApiResponseSuccess<TData>, "status" | "meta"> & {
    meta: { pagination: ApiResponseMetaPagination };
  },
): ApiResponseSuccess<TData> => {
  return {
    ...options,
    status: "success",
  };
};

```

src\shared\api\response\_lib\helpers.ts

```
import type { AuthError } from "@/shared/lib/auth/errors";
import type { ApiResponseError } from "../_model/types";
import { createErrorResponse } from "./builders";

export function mapAuthErrorToApiResponse(e: AuthError) {
  return createErrorResponse({
    error: {
      code: e.code,
      httpStatus: e.httpStatus,
      userMessage:
        e.code === "AUTH_REQUIRED"
          ? "Требуется авторизация"
          : "Недостаточно прав для выполнения операции",
      devMessage: e.message,
    },
  });
}

export function mapInternalErrorToApiResponse(
  e: unknown,
  options?: {
    userMessage?: string;
    devPrefix?: string;
  },
): ApiResponseError {
  const userMessage =
    options?.userMessage ?? "Произошла внутренняя ошибка сервера";

  const devMessageBase =
    e instanceof Error
      ? e.message
      : typeof e === "string"
        ? e
        : "Unknown error";

  const devMessage = options?.devPrefix
    ? `${options.devPrefix}: ${devMessageBase}`
    : devMessageBase;

  return createErrorResponse({
    error: {
      code: "INTERNAL",
      httpStatus: 500,
      userMessage,
      devMessage,
    },
  });
}

```

src\shared\api\response\_lib\next-response.ts

```
import { NextResponse } from "next/server";
import type {
  ApiResponse,
  ApiResponseError,
  ApiResponseMeta,
  ApiResponseSuccess,
} from "../_model/types";
import { createErrorResponse, createSuccessResponse } from "./builders";

export const createNextSuccessResponse = <TData>(
  options: {
    data: TData;
    message?: string;
    meta?: ApiResponseMeta;
  } & { httpStatus?: number },
): NextResponse<ApiResponseSuccess<TData>> => {
  const statusCode = options.httpStatus ?? 200;

  const body = createSuccessResponse<TData>({
    data: options.data,
    message: options.message,
    meta: options.meta,
  });

  return NextResponse.json<ApiResponseSuccess<TData>>(body, {
    status: statusCode,
  });
};

export const createNextErrorResponse = (
  options: Omit<ApiResponseError, "status">,
): NextResponse<ApiResponseError> => {
  const body = createErrorResponse(options);

  return NextResponse.json<ApiResponseError>(body, {
    status: body.error.httpStatus,
  });
};

export const createNextResponseFromApi = <TData>(
  response: ApiResponse<TData>,
): NextResponse<ApiResponse<TData>> => {
  const statusCode =
    response.status === "error" ? response.error.httpStatus : 200;

  return NextResponse.json<ApiResponse<TData>>(response, {
    status: statusCode,
  });
};

```

src\shared\api\response\_model\types.ts

```
export type ApiResponse<TData> = ApiResponseSuccess<TData> | ApiResponseError;

export type ApiResponseSuccess<TData> = {
  status: "success";
  data: TData;
  // optional user-facing message (RU), e.g. "Профиль обновлён"
  message?: string;
  meta?: ApiResponseMeta;
};

export type ApiResponseError = {
  status: "error";
  error: ApiErrorDetail;
  meta?: ApiResponseMeta;
};

export type ApiResponseMeta = {
  pagination?: ApiResponseMetaPagination;
  // extend here with other metadata if needed
};

export type ApiResponseMetaPagination = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type ApiErrorDetail = {
  code: ApiErrorCode;
  httpStatus: number;
  // userMessage is displayed to user (RU)
  userMessage: string;
  // devMessage is for logs / debugging (EN)
  devMessage?: string;
  // optional validation or domain-level field errors
  fields?: ApiErrorDetailField[];
};

export type ApiErrorCode =
  | "UNKNOWN"
  | "VALIDATION"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL"
  | "EXTERNAL_SERVICE";

export type ApiErrorDetailField = {
  field: string;
  message: string; // Russian, user-friendly
};

export type ApiResponseStatus = "success" | "error";

```

src\app\admin\categories\page.tsx

```
import { AdminCategoriesPage as AdminCategories } from "@/features/categories/server";

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}

```