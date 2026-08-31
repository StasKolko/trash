import path from "node:path";
import { exists } from "@/shared/lib/fs-utils";

type ViteManifest = Record<
  string,
  {
    file: string;
    src?: string;
    isEntry?: boolean;
    css?: string[];
    imports?: string[];
    assets?: string[];
    dynamicImports?: string[];
  }
>;

export async function loadManifest(clientDir: string): Promise<ViteManifest> {
  const candidates = [
    path.join(clientDir, ".vite", "manifest.json"),
    path.join(clientDir, "manifest.json"),
  ];
  for (const p of candidates) {
    if (await exists(p)) {
      const text = await Bun.file(p).text();
      return JSON.parse(text) as ViteManifest;
    }
  }
  throw new Error("Vite manifest.json not found in dist/client");
}

export function resolveEntryKey(manifest: ViteManifest): string {
  const entry = Object.entries(manifest).find(
    ([, v]) => v.isEntry && v.file && v.file.endsWith(".js"),
  );
  if (!entry) throw new Error("No JS entry in Vite manifest");
  return entry[0];
}

export function collectCss(manifest: ViteManifest, key: string): string[] {
  const visited = new Set<string>();
  const cssSet = new Set<string>();

  const walk = (k: string) => {
    if (visited.has(k)) return;
    visited.add(k);
    const e = manifest[k];
    if (!e) return;
    if (e.css) for (const c of e.css) cssSet.add(c);
    if (e.imports) for (const i of e.imports) walk(i);
  };

  walk(key);

  // Перестраховка: добавим standalone css-ассеты, если они есть
  for (const e of Object.values(manifest)) {
    if (e.file?.endsWith(".css")) cssSet.add(e.file);
  }

  return [...cssSet];
}

export function collectJs(manifest: ViteManifest, key: string): string[] {
  const visited = new Set<string>();
  const files = new Set<string>();
  const walk = (k: string) => {
    if (visited.has(k)) return;
    visited.add(k);
    const e = manifest[k];
    if (!e) return;
    if (e.file) files.add(e.file);
    if (e.imports) for (const i of e.imports) walk(i);
    // ВАЖНО: dynamicImports не трогаем — пусть грузятся по запросу
  };
  walk(key);

  return [...files];
}
