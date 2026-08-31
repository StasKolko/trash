export type ApiResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string; details?: unknown };

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function fail(
  error: string,
  code?: string,
  details?: unknown,
): ApiResponse<never> {
  return { success: false, error, code, details };
}
