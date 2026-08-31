#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Change only this configuration.
const CONFIG = {
  contentFolder: 'contenthub',
  ignoreFolders: [
    'node_modules', '.turbo', 'coverage', 'dist', 'build', 'out',
    '.git', '.next', '.cache', '.parcel-cache', ".qodo",
  ],
  ignoreFiles: [],
  ignoreExtensions: [],
};

// Default extensions are merged with CONFIG.ignoreExtensions.
const DEFAULT_IGNORE = {
  ignoreImages: [
    '.jpg', '.jpeg', '.jfif', '.pjpeg', '.pjp', '.png', '.gif', '.webp',
    '.avif', '.apng', '.bmp', '.ico', '.cur', '.tif', '.tiff', '.heic',
    '.heif', '.raw', '.arw', '.cr2', '.cr3', '.nef', '.orf', '.raf',
    '.dng', '.psd', '.eps', '.ai',
  ],
  ignoreVideos: [
    '.mp4', '.m4v', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv',
    '.f4v', '.mpeg', '.mpg', '.mpe', '.mpv', '.3gp', '.3g2', '.ogv',
    '.ts', '.m2ts', '.mts', '.vob',
  ],
  ignoreAudio: [
    '.mp3', '.wav', '.ogg', '.oga', '.opus', '.flac', '.aac', '.m4a',
    '.wma', '.aiff', '.alac', '.mid', '.midi', '.amr',
  ],
  ignoreFonts: ['.ttf', '.otf', '.woff', '.woff2', '.eot', '.fon'],
  ignoreArchives: [
    '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.xz', '.zst',
    '.iso',
  ],
};

function normalizeExtension(value) {
  const text = String(value).trim().toLowerCase();
  if (!text) return '';
  return text.startsWith('.') ? text : `.${text}`;
}

const root = process.cwd();
const contentRoot = path.resolve(root, CONFIG.contentFolder);
const ignoredFolders = new Set(CONFIG.ignoreFolders.map(String));
const ignoredFiles = new Set(CONFIG.ignoreFiles.map(String));
const ignoredExtensions = new Set(
  [...Object.values(DEFAULT_IGNORE).flat(), ...CONFIG.ignoreExtensions]
    .map(normalizeExtension)
    .filter(Boolean),
);

const stats = {
  files: 0,
  directories: 0,
  characters: 0,
  extensions: new Set(),
  problemFiles: [],
  problemDirectories: [],
};

function relativeToContent(absolutePath) {
  return path.relative(contentRoot, absolutePath).split(path.sep).join('/');
}

function shownPath(absolutePath) {
  return relativeToContent(absolutePath) || CONFIG.contentFolder;
}

function isIgnoredFile(name) {
  return ignoredFiles.has(name)
    || ignoredExtensions.has(normalizeExtension(path.extname(name)));
}

function compareEntries(a, b) {
  const aDirectory = a.isDirectory();
  const bDirectory = b.isDirectory();
  if (aDirectory !== bDirectory) return aDirectory ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function readEntries(directoryPath) {
  let entries;
  try {
    entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  } catch (error) {
    stats.problemDirectories.push({
      path: shownPath(directoryPath),
      reason: error.message,
    });
    return [];
  }

  return entries
    .filter((entry) => {
      if (entry.isDirectory()) return !ignoredFolders.has(entry.name);
      return entry.isFile() && !isIgnoredFile(entry.name);
    })
    .sort(compareEntries);
}

function collectTree(directoryPath, level = 0) {
  const lines = [];
  for (const entry of readEntries(directoryPath)) {
    const prefix = '  '.repeat(level);
    lines.push(`${prefix}- ${entry.isDirectory() ? `${entry.name}/` : entry.name}`);
    if (entry.isDirectory()) {
      lines.push(...collectTree(path.join(directoryPath, entry.name), level + 1));
    }
  }
  return lines;
}

function collectFiles(directoryPath) {
  const files = [];
  for (const entry of readEntries(directoryPath)) {
    const absolutePath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(absolutePath));
    else files.push({ absolutePath, name: entry.name });
  }
  return files;
}

function languageFor(fileName) {
  const extension = path.extname(fileName).slice(1).toLowerCase();
  const aliases = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', jsx: 'jsx', tsx: 'tsx', py: 'python',
    rb: 'ruby', sh: 'bash', yml: 'yaml', yaml: 'yaml',
    md: 'markdown', html: 'html', htm: 'html', css: 'css',
    scss: 'scss', less: 'less', json: 'json', xml: 'xml', sql: 'sql',
  };
  return aliases[extension] || extension || 'text';
}

function readFileSafely(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    stats.problemFiles.push({ path: shownPath(filePath), reason: error.message });
    return null;
  }
}

function buildMarkdown() {
  const tree = collectTree(contentRoot);
  const files = collectFiles(contentRoot);
  const output = [
    `# Контекст: ${CONFIG.contentFolder}`,
    '',
    '## Структура проекта',
    '',
    tree.length > 0 ? tree.join('\n') : '_Пусто_',
    '',
    '## Содержимое файлов',
    '',
  ];

  for (const file of files) {
    const content = readFileSafely(file.absolutePath);
    if (content === null) continue;

    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const body = normalized.length > 0 ? normalized : '<!-- EMPTY -->';
    const relativePath = relativeToContent(file.absolutePath);

    output.push(
      `### ${relativePath}`,
      '',
      `\`\`\`${languageFor(file.name)}`,
      body,
      '\`\`\`',
      '',
    );

    stats.files += 1;
    stats.characters += normalized.length;
    const extension = normalizeExtension(path.extname(file.name));
    if (extension) stats.extensions.add(extension);
  }

  return `${output.join('\n').trimEnd()}\n`;
}

function countDirectories(directoryPath) {
  let count = 0;
  for (const entry of readEntries(directoryPath)) {
    if (entry.isDirectory()) {
      count += 1 + countDirectories(path.join(directoryPath, entry.name));
    }
  }
  return count;
}

function copyToClipboard(text) {
  const commands = process.platform === 'win32'
    ? [['clip', []]]
    : process.platform === 'darwin'
      ? [['pbcopy', []]]
      : [
        ['wl-copy', []],
        ['xclip', ['-selection', 'clipboard']],
        ['xsel', ['--clipboard', '--input']],
      ];

  for (const [command, args] of commands) {
    try {
      const result = spawnSync(command, args, {
        input: text,
        encoding: 'utf8',
        stdio: ['pipe', 'ignore', 'ignore'],
      });
      if (result.status === 0) return command;
    } catch (_) {
      // Try the next clipboard command.
    }
  }
  return null;
}

function formatNumber(number) {
  return new Intl.NumberFormat('ru-RU').format(number);
}

function printReport(clipboardCommand) {
  if (stats.problemDirectories.length > 0) {
    console.error(`Проблемные директории: ${stats.problemDirectories.length}`);
    for (const item of stats.problemDirectories) {
      console.error(`- ${item.path} — ${item.reason}`);
    }
  }

  if (stats.problemFiles.length > 0) {
    console.error(`Проблемные файлы: ${stats.problemFiles.length}`);
    for (const item of stats.problemFiles) {
      console.error(`- ${item.path} — ${item.reason}`);
    }
  }

  console.log(`Добавлено файлов: ${formatNumber(stats.files)}`);
  console.log(`Добавлено директорий: ${formatNumber(stats.directories)}`);
  console.log(`Расширения: ${[...stats.extensions].sort().join(', ') || 'нет'}`);
  console.log(`Символов в контексте: ${formatNumber(stats.characters)}`);
  console.log(
    clipboardCommand
      ? `Скопировано в буфер обмена через ${clipboardCommand}.`
      : 'Буфер обмена недоступен: установите wl-copy, xclip или xsel.',
  );
}

if (!fs.existsSync(contentRoot)) {
  console.error(`Папка не найдена: ${contentRoot}`);
  process.exit(1);
}

let rootStat;
try {
  rootStat = fs.statSync(contentRoot);
} catch (error) {
  console.error(`Не удалось открыть папку: ${error.message}`);
  process.exit(1);
}

if (!rootStat.isDirectory()) {
  console.error(`Путь не является директорией: ${contentRoot}`);
  process.exit(1);
}

const markdown = buildMarkdown();
stats.directories = countDirectories(contentRoot);
const clipboardCommand = copyToClipboard(markdown);
printReport(clipboardCommand);
