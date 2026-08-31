import path from "node:path";
import { exists } from "@/shared/lib/fs-utils";

export type SSRModule = {
  render: (url: string) => Promise<{ body: string; hydration: string }>;
};

let rendererCache: SSRModule | null = null;

export async function loadRenderer(ssrDir: string): Promise<SSRModule> {
  if (rendererCache) return rendererCache;

  const jsPath = path.join(ssrDir, "entry-server.js");
  const mjsPath = path.join(ssrDir, "entry-server.mjs");

  if (await exists(jsPath)) {
    rendererCache = (await import(jsPath)) as SSRModule;
    return rendererCache;
  }
  if (await exists(mjsPath)) {
    rendererCache = (await import(mjsPath)) as SSRModule;
    return rendererCache;
  }
  throw new Error("SSR entry not found in ssrDir (entry-server.js/mjs)");
}
