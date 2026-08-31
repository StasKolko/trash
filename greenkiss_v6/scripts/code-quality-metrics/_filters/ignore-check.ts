import path from 'path';
import { NormalizedConfig } from '../_config/types';
import { isSubPath, getExtension } from '../_utils/path-utils';

export function isIgnoredDir(absPath: string, config: NormalizedConfig): boolean {
  return config.ignoreDirs.some((dir) => {
    return absPath === dir || isSubPath(dir, absPath);
  });
}

export function isIgnoredFile(absPath: string, config: NormalizedConfig): boolean {
  const byPath = config.ignoreFiles.includes(absPath);
  if (byPath) return true;

  const ext = getExtension(absPath);
  if (!ext) return false;

  return config.ignoreExtensions.has(ext);
}

export function isOkDir(absPath: string, config: NormalizedConfig): boolean {
  return config.okDirs.some((dir) => absPath === dir || isSubPath(dir, absPath));
}

export function isOkFile(absPath: string, config: NormalizedConfig): boolean {
  return config.okFiles.includes(absPath);
}

export function validateOkDirsAgainstIgnore(config: NormalizedConfig) {
  for (const okDir of config.okDirs) {
    for (const ignoreDir of config.ignoreDirs) {
      if (okDir === ignoreDir || isSubPath(ignoreDir, okDir)) {
        console.error(
          '[code-quality-metrics] Конфликт: OK-папка находится внутри ignore-папки.\n' +
          `  OK папка:      ${okDir}\n` +
          `  Ignore папка:  ${ignoreDir}\n`
        );
        process.exit(1);
      }
    }
  }
}

export function validateOkFilesAgainstIgnore(config: NormalizedConfig) {
  for (const okFile of config.okFiles) {
    // игнор по пути
    if (config.ignoreFiles.includes(okFile)) {
      console.error(
        '[code-quality-metrics] Конфликт: OK-файл отмечен как ignore-файл.\n' +
        `  Файл: ${okFile}\n`
      );
      process.exit(1);
    }

    // игнор по родительским папкам
    for (const ignoreDir of config.ignoreDirs) {
      if (isSubPath(ignoreDir, okFile)) {
        console.error(
          '[code-quality-metrics] Конфликт: OK-файл лежит в ignore-папке.\n' +
          `  Файл:        ${okFile}\n` +
          `  Ignore папка: ${ignoreDir}\n`
        );
        process.exit(1);
      }
    }

    // игнор по расширению
    const ext = path.extname(okFile).replace(/^\./, '').toLowerCase();
    if (ext && config.ignoreExtensions.has(ext)) {
      console.error(
        '[code-quality-metrics] Конфликт: OK-файл имеет игнорируемое расширение.\n' +
        `  Файл:       ${okFile}\n` +
        `  Расширение: .${ext}\n`
      );
      process.exit(1);
    }
  }
}
