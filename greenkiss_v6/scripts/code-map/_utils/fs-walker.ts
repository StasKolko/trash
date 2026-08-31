import { promises } from 'node:fs';
import path from 'node:path';
import { WalkResult } from '../_types/index.js';

interface WalkOptions {
  ignoredExtensions: string[];
}

/**
 * Нормализует путь в posix-формат с прямыми слешами.
 */
function normalizeToPosixPath(...segments: string[]): string {
  return path.posix.join(...segments.join('/').split(/[\\/]+/));
}

async function walkDirectory(
  absoluteDirPath: string,
  rootDir: string,
  ignoredExtensionsSet: Set<string>,
  result: WalkResult,
): Promise<void> {
  let dirEntries;
  try {
    dirEntries = await promises.readdir(absoluteDirPath, { withFileTypes: true });
  } catch (error) {
    // Лог ошибки, но не прерываем весь процесс
    console.error(`Failed to read directory: ${absoluteDirPath}`, error);
    return;
  }

  for (const entry of dirEntries) {
    const absoluteEntryPath = path.join(absoluteDirPath, entry.name);
    const relativeFromRoot = path.relative(rootDir, absoluteEntryPath);
    const relativePosix = normalizeToPosixPath(relativeFromRoot);

    if (entry.isDirectory()) {
      result.directories.push(relativePosix);
      await walkDirectory(absoluteEntryPath, rootDir, ignoredExtensionsSet, result);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const extWithoutDot = ext.startsWith('.') ? ext.slice(1) : ext;
      if (extWithoutDot.length > 0 && ignoredExtensionsSet.has(extWithoutDot.toLowerCase())) {
        continue;
      }
      result.files.push(relativePosix);
    }
  }
}

export async function walkFileSystem(rootDir: string, options: WalkOptions): Promise<WalkResult> {
  const ignoredExtensionsSet = new Set<string>(
    options.ignoredExtensions.map((ext) => ext.toLowerCase()),
  );

  const result: WalkResult = {
    directories: [],
    files: [],
  };

  // Добавляем корень как директорию с пустым относительным путем не нужно, храним только вложенные
  await walkDirectory(rootDir, rootDir, ignoredExtensionsSet, result);

  // Убираем возможные дубликаты (на всякий случай)
  result.directories = Array.from(new Set(result.directories)).sort();
  result.files = Array.from(new Set(result.files)).sort();

  return result;
}
