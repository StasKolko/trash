import fs from 'fs';
import path from 'path';
import { NormalizedConfig, ScanStats } from '../_config/types';
import {
  isIgnoredDir,
  isIgnoredFile,
  isOkDir,
  isOkFile,
  validateOkDirsAgainstIgnore,
  validateOkFilesAgainstIgnore,
} from '../_filters/ignore-check';
import { isDirectory } from '../_utils/path-utils';

async function scanDir(
  dir: string,
  config: NormalizedConfig,
  stats: ScanStats
) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (isIgnoredDir(absPath, config)) {
        continue;
      }
      await scanDir(absPath, config, stats);
    } else if (entry.isFile()) {
      if (isIgnoredFile(absPath, config)) {
        continue;
      }

      const isOk =
        isOkDir(absPath, config) || // лежит в OK папке
        isOkFile(absPath, config);  // конкретный OK файл

      stats.totalFiles += 1;
      if (isOk) {
        stats.okFiles += 1;
      } else {
        stats.notOkFiles += 1;
        stats.notOkList.push({
          absolutePath: absPath,
          relativeToRoot: path.relative(config.projectRoot, absPath),
          isOk: false,
        });
      }
    }
  }
}

export async function scanProject(config: NormalizedConfig): Promise<ScanStats> {
  validateOkDirsAgainstIgnore(config);
  validateOkFilesAgainstIgnore(config);

  const stats: ScanStats = {
    totalFiles: 0,
    okFiles: 0,
    notOkFiles: 0,
    notOkList: [],
  };

  if (!isDirectory(config.projectRoot)) {
    console.error(
      `[code-quality-metrics] projectRoot не является директорией: ${config.projectRoot}`
    );
    process.exit(1);
  }

  await scanDir(config.projectRoot, config, stats);
  return stats;
}
