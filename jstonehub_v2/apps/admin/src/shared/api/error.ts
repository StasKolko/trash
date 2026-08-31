export function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unknown error";
  }

  // Eden validation/server error: { status, value: { message?, summary? } }
  if ("value" in error && error.value && typeof error.value === "object") {
    const value = error.value as Record<string, unknown>;

    if (typeof value.message === "string" && value.message) {
      return value.message;
    }
    if (typeof value.summary === "string" && value.summary) {
      return value.summary;
    }
  }

  // Standard Error object fallback
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Request failed";
}

export function createApiError(error: unknown): Error {
  return new Error(getApiErrorMessage(error));
}
