import { minLength, object, pipe, safeParse, string } from "valibot";

const schema = object({
  API_URL: pipe(string(), minLength(1)),
  ADMIN_URL: pipe(string(), minLength(1)),

  SUPPORT_EMAIL: pipe(string(), minLength(1)),
});

function parseEnv() {
  const raw = import.meta.env;

  const result = safeParse(schema, {
    API_URL: raw.VITE_API_URL,
    ADMIN_URL: raw.VITE_ADMIN_URL,

    SUPPORT_EMAIL: raw.VITE_SUPPORT_EMAIL,
  });

  if (!result.success) {
    const message = result.issues
      .map((issue) => {
        const path = issue.path?.map((p) => p.key).join(".") || "root";
        return `  • ${path}: ${issue.message}`;
      })
      .join("\n");
    throw new Error(`❌ Hub: Invalid environment variables:\n${message}`);
  }

  return result.output;
}

const env = parseEnv();

export { env };
