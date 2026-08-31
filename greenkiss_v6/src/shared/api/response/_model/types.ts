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
