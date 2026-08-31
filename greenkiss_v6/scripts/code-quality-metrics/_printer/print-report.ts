import { NormalizedConfig, ScanStats } from '../_config/types';

export function printReport(stats: ScanStats, config: NormalizedConfig) {
  const { totalFiles, okFiles, notOkFiles, notOkList } = stats;
  const percent =
    totalFiles === 0 ? 100 : Math.round((okFiles / totalFiles) * 100 * 100) / 100;

  console.log('\n====== Code Quality Metrics ======');
  console.log(`Корень проекта:  ${config.projectRoot}`);
  console.log(`Всего файлов:    ${totalFiles}`);
  console.log(`OK файлов:       ${okFiles}`);
  console.log(`Не OK файлов:    ${notOkFiles}`);
  console.log(`Процент OK:      ${percent}%`);
  console.log('==================================\n');

  if (notOkList.length > 0) {
    console.log('Список не OK файлов (кликабельно в VS Code):\n');
    for (const file of notOkList) {
      // Формат: /abs/path/to/file:1:1 — многие терминалы / VS Code это понимают
      const clickable = `${file.absolutePath}:1:1`;
      console.log(clickable);
    }
    console.log('');
  } else {
    console.log('Все файлы OK 🎉\n');
  }
}
