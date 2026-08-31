import { treaty } from "@elysiajs/eden";
import type { ApiApp } from "#api/app/main";

const baseUrl =
  typeof window === "undefined"
    ? "http://localhost:3333"
    : new URL("/api", window.location.origin).toString();

export const client = treaty<ApiApp>(baseUrl);
