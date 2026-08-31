import { is } from "./guard";

function safeJsonParse(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);

    if (is.object(parsed) || is.array(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

function safeJsonStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export { safeJsonParse, safeJsonStringify };
