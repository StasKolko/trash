src\shared\api\response\index.ts

```
export {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "./_lib/builders";
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