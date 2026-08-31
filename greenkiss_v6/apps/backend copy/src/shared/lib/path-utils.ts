import path from "node:path";
import { fileURLToPath } from "node:url";

export function getAppDirectories(metaUrl: string) {
  const __filename = fileURLToPath(metaUrl);
  const here = path.dirname(__filename);

  // Если запускаемся из src (dev: apps/backend/src) — dist на три уровня выше.
  // Если запускаемся из dist (prod: dist) — берем текущую папку.
  const looksLikeSrc = here.endsWith(`${path.sep}src`);
  const distRoot = looksLikeSrc ? path.resolve(here, "../../../dist") : here;

  const clientDir = path.join(distRoot, "client");
  const ssrDir = path.join(distRoot, "ssr");
  const publicDir = path.join(distRoot, "public");
  const assetsDir = path.join(clientDir, "assets");

  return {
    clientDir,
    ssrDir,
    publicDir,
    assetsDir,
    distRoot,
  };
}
