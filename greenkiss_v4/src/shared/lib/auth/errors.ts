export class AuthError extends Error {
  code: "AUTH_REQUIRED" | "FORBIDDEN";
  httpStatus: number;

  constructor(params: {
    code: "AUTH_REQUIRED" | "FORBIDDEN";
    httpStatus: number;
    message?: string;
  }) {
    super(params.message ?? params.code);
    this.code = params.code;
    this.httpStatus = params.httpStatus;
  }
}

export function getAuthErrorMessage(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;

  const clean = String(raw).trim();

  if (!clean) return null;

  // next-auth передаёт строго такие коды
  if (clean in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[clean as AuthErrorCode];
  }

  // Вдруг придёт что‑то своё — отдаём дефолтный текст
  return AUTH_ERROR_MESSAGES.Default;
}

export type AuthErrorCode =
  | "Configuration"
  | "AccessDenied"
  | "Verification"
  | "Default";

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  Configuration:
    "Произошла ошибка конфигурации сервера авторизации. Попробуйте позже или обратитесь к поддержке.",
  AccessDenied:
    "Доступ запрещён. У вас нет прав для просмотра этой страницы или выполнения этого действия.",
  Verification:
    "Ссылка для входа недействительна или уже была использована. Запросите новую ссылку и попробуйте ещё раз.",
  Default: "Произошла ошибка при входе. Попробуйте ещё раз немного позже.",
};
