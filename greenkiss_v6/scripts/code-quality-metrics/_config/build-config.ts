import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { NormalizedConfig, RawConfig, AbsolutePath } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toAbsoluteFromRoot(projectRoot: string, rel: string): AbsolutePath {
  return path.resolve(projectRoot, rel);
}

function ensureDirExists(p: string, label: string) {
  if (!fs.existsSync(p)) {
    console.error(`[code-quality-metrics] ${label} не существует: ${p}`);
    process.exit(1);
  }
  if (!fs.statSync(p).isDirectory()) {
    console.error(`[code-quality-metrics] ${label} должен быть директорией: ${p}`);
    process.exit(1);
  }
}

function normalizeExt(ext: string): string {
  return ext.replace(/^\./, '').toLowerCase();
}

export function buildConfig(raw: RawConfig): NormalizedConfig {
  const projectRoot = path.resolve(__dirname, raw.projectRootFromIndex);

  ensureDirExists(projectRoot, 'Корень проекта');

  const ignoreDirs = raw.ignoreDirsFromRoot.map((d) =>
    toAbsoluteFromRoot(projectRoot, d)
  );

  const ignoreFiles = raw.ignoreFilesFromRoot.map((f) =>
    toAbsoluteFromRoot(projectRoot, f)
  );

  const okDirs = raw.okDirsFromRoot.map((d) =>
    toAbsoluteFromRoot(projectRoot, d)
  );

  const okFiles = raw.okFilesFromRoot.map((f) =>
    toAbsoluteFromRoot(projectRoot, f)
  );

  const ignoreExtensions = new Set<string>(
    raw.ignoreExtensions.map(normalizeExt)
  );

  return {
    projectRoot,
    ignoreDirs,
    ignoreFiles,
    ignoreExtensions,
    okDirs,
    okFiles,
  };
}
