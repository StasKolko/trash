const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'apps/api/src/features/secret-voicer';
const OUTPUT_FILE = 'context.md';

// Расширения файлов для включения (можно расширить)
const INCLUDE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml', '.env', '.sql'
];

// Папки для игнорирования
const IGNORE_DIRS = ['node_modules', 'dist', '.git', 'coverage'];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Папка не найдена: ${dirPath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (INCLUDE_EXTENSIONS.includes(ext) || ext === '') {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function getLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const langMap = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.json': 'json',
    '.md': 'markdown',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.sql': 'sql',
    '.env': 'env',
  };
  return langMap[ext] || '';
}

function generateContext() {
  console.log(`📂 Сканирую: ${TARGET_DIR}`);
  
  const files = getAllFiles(TARGET_DIR);
  
  if (files.length === 0) {
    console.log('⚠️ Файлы не найдены');
    return;
  }

  let content = `# Context: ${TARGET_DIR}\n\n`;
  content += `> Сгенерировано: ${new Date().toISOString()}\n\n`;
  content += `---\n\n`;

  files.forEach((filePath) => {
    const relativePath = filePath.replace(/\\/g, '/');
    const language = getLanguage(filePath);
    
    let fileContent;
    try {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      fileContent = `// Ошибка чтения файла: ${err.message}`;
    }

    content += `## \`${relativePath}\`\n\n`;
    content += `\`\`\`${language}\n`;
    content += fileContent;
    if (!fileContent.endsWith('\n')) {
      content += '\n';
    }
    content += `\`\`\`\n\n`;
    content += `---\n\n`;
  });

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  
  console.log(`✅ Готово!`);
  console.log(`📄 Файлов обработано: ${files.length}`);
  console.log(`💾 Сохранено в: ${OUTPUT_FILE}`);
}

generateContext();