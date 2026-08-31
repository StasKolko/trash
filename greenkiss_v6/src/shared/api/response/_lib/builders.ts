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
