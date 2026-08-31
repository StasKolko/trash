import { AUTH_ERROR_CODES } from "@packages/contract/auth-error";
import { fallback, object, optional, picklist, string } from "valibot";

export const authValidateSearch = object({
  redirect: optional(string()),
  error: optional(fallback(picklist([...AUTH_ERROR_CODES]), "UNKNOWN")),
});
