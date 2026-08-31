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
