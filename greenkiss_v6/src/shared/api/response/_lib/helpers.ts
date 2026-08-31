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
