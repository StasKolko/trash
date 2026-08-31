import { access } from "node:fs/promises";
import { accessSync } from "node:fs";

export async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

export function existsSync(p: string) {
  try {
    accessSync(p);
    return true;
  } catch {
    return false;
  }
}
