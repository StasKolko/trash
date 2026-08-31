import type { Context } from "elysia";
import {
  collectCss,
  collectJs,
  loadManifest,
  resolveEntryKey,
} from "./manifest";
import { loadRenderer } from "./renderer";
import { renderHtml } from "./render-html";

export interface SsrHandlerOptions {
  clientDir: string;
  ssrDir: string;
}

export function createSsrHandler({
  clientDir,
  ssrDir,
}: {
  clientDir: string;
  ssrDir: string;
}) {
  return async function ssrHandler({ request, set }: Context) {
    const accept = request.headers.get("accept") || "";
    if (!accept.includes("text/html")) {
      set.status = 404;
      return "Not found";
    }

    try {
      const manifest = await loadManifest(clientDir);
      const { render } = await loadRenderer(ssrDir);

      const entryKey = resolveEntryKey(manifest);
      const manifestEntry = manifest[entryKey];
      if (!manifestEntry)
        throw new Error(`Manifest missing entry: ${entryKey}`);

      const cssFiles = collectCss(manifest, entryKey);
      const preloadJs = collectJs(manifest, entryKey);

      const url = new URL(request.url);
      const { body, hydration } = await render(url.toString());

      const html = renderHtml({
        body,
        hydration,
        entryJs: manifestEntry.file, // обычно "assets/xxx.js"
        cssFiles, // обычно ["assets/xxx.css"]
        preloadJs,
      });

      set.headers["content-type"] = "text/html; charset=utf-8";
      return html;
    } catch (e) {
      set.status = 500;
      return `SSR error: ${(e as Error).message}`;
    }
  };
}
