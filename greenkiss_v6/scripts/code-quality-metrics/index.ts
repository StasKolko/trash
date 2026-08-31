import { buildConfig } from './_config/build-config';
import { scanProject } from './_scanner/scan-project';
import { printReport } from './_printer/print-report';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { IGNORE_DIRS, IGNORE_EXTENSIONS, IGNORE_FILES } from './_constants/ignore';
import { OK_ROOT_FILES } from './_constants/root';
import { OK_SHARED_LIB_FILES } from './_constants/shared';

const projectRootFromIndex = resolveRootDir("../../");

async function main() {
  const config = buildConfig({
    ignoreDirsFromRoot: IGNORE_DIRS,
    ignoreFilesFromRoot: IGNORE_FILES,
    ignoreExtensions: IGNORE_EXTENSIONS,
    okDirsFromRoot: [
      'src/app/_styles',
      'src/app/_types',
    ],
    okFilesFromRoot: [
      ...OK_ROOT_FILES,
      ...OK_SHARED_LIB_FILES,
    ],
    projectRootFromIndex,
  });

  const stats = await scanProject(config);
  printReport(stats, config);
}

main().catch((err) => {
  console.error('[code-quality-metrics] Unexpected error:', err);
  process.exit(1);
});

function resolveRootDir(relativePath: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return resolve(__dirname, relativePath);
}