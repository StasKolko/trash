import {
  flatten,
  object,
  picklist,
  pipe,
  safeParse,
  string,
  url,
} from "valibot";

const EnvSchema = object({
  ADMIN_URL: pipe(
    string("VITE_ADMIN_URL is required"),
    url("VITE_ADMIN_URL must be a valid URL"),
  ),
  MODE: picklist(
    ["development", "production", "test"],
    "MODE must be development, production, or test",
  ),
});

const rawEnv = {
  ADMIN_URL: import.meta.env.VITE_ADMIN_URL,
  MODE: import.meta.env.MODE,
};

const parsed = safeParse(EnvSchema, rawEnv);

if (!parsed.success) {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.error(
    "❌ Invalid environment variables:",
    flatten(parsed.issues).nested,
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.output;
