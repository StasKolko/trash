// @ts-nocheck
/* eslint-disable */
// biome-ignore-all lint: ignore

import { readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import process from "node:process";

const IGNORE_FOLDERS = [
  ".qodo",
  ".husky",
  // CONFIGS
  "biomejs",
  "typescript",
  "vitest",
];
const IGNORE_FILES = [
  // ROOT
  ".gitattributes",
  //  DOCS
  "0_prompt-improver.md",
  "1_git-commit-flow.md",
];
const IGNORE_EXTENSIONS = [];

const DEFAULT_IGNORE_FOLDERS = [
  ".git",
  ".cache",
  ".idea",
  ".vscode",
  ".turbo",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
];

const DEFAULT_IGNORE_FILES = ["bun.lock"];

const DEFAULT_IGNORE_EXTENSIONS = [
  ".log",
  ".lock",
  ".map",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".dat",
  ".class",
  ".o",
  ".obj",
  ".pyc",
  ".pdf",
  ".db",
  ".sqlite",
  ".sqlite3",
];

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".m4v",
  ".mpg",
  ".mpeg",
];

const IMAGE_EXTENSIONS = [
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".webp",
  ".ico",
  ".tif",
  ".tiff",
  ".psd",
  ".avif",
];

const FONT_EXTENSIONS = [".ttf", ".otf", ".woff", ".woff2", ".eot"];

const ARCHIVE_EXTENSIONS = [
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".bz2",
  ".xz",
  ".tgz",
  ".jar",
  ".war",
];

const EXTENSION_LANGUAGE_MAP = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  cs: "csharp",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  htm: "html",
  hpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  h: "c",
  pl: "perl",
  ps1: "powershell",
  psm1: "powershell",
  bat: "batch",
  cmd: "batch",
  dockerfile: "dockerfile",
  makefile: "makefile",
};

const ignoreFolders = new Set(
  [...DEFAULT_IGNORE_FOLDERS, ...IGNORE_FOLDERS].map((v) => v.toLowerCase()),
);
const ignoreFiles = new Set(
  [...DEFAULT_IGNORE_FILES, ...IGNORE_FILES].map((v) => v.toLowerCase()),
);
const ignoreExtensions = new Set(
  [
    ...DEFAULT_IGNORE_EXTENSIONS,
    ...IGNORE_EXTENSIONS,
    ...VIDEO_EXTENSIONS,
    ...IMAGE_EXTENSIONS,
    ...FONT_EXTENSIONS,
    ...ARCHIVE_EXTENSIONS,
  ].map((v) => v.toLowerCase()),
);

const SCRIPT_PATH = import.meta.path;
const ROOT_DIR = dirname(SCRIPT_PATH);

const errors = {
  "Permission denied": [],
  "Corrupted / unreadable": [],
};
let problemFolders = 0;
let problemFiles = 0;
let brokenFiles = 0;

function classifyError(err) {
  if (err && (err.code === "EACCES" || err.code === "EPERM")) {
    return "Permission denied";
  }
  return "Corrupted / unreadable";
}

function relPath(p) {
  const r = relative(ROOT_DIR, p);
  return r === "" ? "." : r.split(sep).join("/");
}

function getExt(name) {
  const idx = name.lastIndexOf(".");
  if (idx <= 0) return "";
  return name.slice(idx).toLowerCase();
}

function getLangId(name) {
  const idx = name.lastIndexOf(".");
  let ext;
  if (idx <= 0) ext = name.toLowerCase();
  else ext = name.slice(idx + 1).toLowerCase();
  if (EXTENSION_LANGUAGE_MAP[ext]) return EXTENSION_LANGUAGE_MAP[ext];
  return ext;
}

function isFolderIgnored(name) {
  return ignoreFolders.has(name.toLowerCase());
}

function isFileIgnored(name) {
  if (ignoreFiles.has(name.toLowerCase())) return true;
  const ext = getExt(name);
  if (ext && ignoreExtensions.has(ext)) return true;
  return false;
}

function readDirSorted(dirPath) {
  let entries;
  try {
    entries = readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    problemFolders++;
    errors[classifyError(err)].push(relPath(dirPath) + " (folder)");
    return { folders: [], files: [] };
  }

  const folders = [];
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    let isDir = entry.isDirectory();
    let isFile = entry.isFile();

    if (entry.isSymbolicLink()) {
      try {
        const st = statSync(fullPath);
        isDir = st.isDirectory();
        isFile = st.isFile();
      } catch (err) {
        problemFiles++;
        errors[classifyError(err)].push(relPath(fullPath));
        continue;
      }
    }

    if (isDir) {
      if (isFolderIgnored(entry.name)) continue;
      folders.push(entry.name);
    } else if (isFile) {
      if (fullPath === SCRIPT_PATH) continue;
      if (isFileIgnored(entry.name)) continue;
      files.push(entry.name);
    }
  }

  const cmp = (a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase(), undefined, {
      sensitivity: "base",
    });
  folders.sort(cmp);
  files.sort(cmp);

  return { folders, files };
}

const treeLines = [];
const contextParts = [];

function buildTree(dirPath, prefix) {
  const { folders, files } = readDirSorted(dirPath);
  const all = [
    ...folders.map((n) => ({ name: n, dir: true })),
    ...files.map((n) => ({ name: n, dir: false })),
  ];

  all.forEach((item, index) => {
    const isLast = index === all.length - 1;
    const connector = isLast ? "└── " : "├── ";
    treeLines.push(prefix + connector + item.name);

    if (item.dir) {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      buildTree(join(dirPath, item.name), childPrefix);
    }
  });
}

function isBinary(buffer) {
  const len = Math.min(buffer.length, 8000);
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function isWhitespaceOnly(text) {
  return text.trim().length === 0;
}

async function collectContextAsync(dirPath) {
  const { folders, files } = readDirSorted(dirPath);

  for (const fileName of files) {
    const fullPath = join(dirPath, fileName);
    let buffer;
    try {
      const file = Bun.file(fullPath);
      buffer = new Uint8Array(await file.arrayBuffer());
    } catch (err) {
      problemFiles++;
      brokenFiles++;
      errors[classifyError(err)].push(relPath(fullPath));
      continue;
    }

    if (buffer.length === 0) continue;
    if (isBinary(buffer)) continue;

    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    } catch (err) {
      problemFiles++;
      brokenFiles++;
      errors["Corrupted / unreadable"].push(relPath(fullPath));
      continue;
    }

    if (isWhitespaceOnly(text)) continue;

    const rel = relPath(fullPath);
    const lang = getLangId(fileName);
    let fence = "```";
    while (text.includes(fence)) fence += "`";

    contextParts.push(`### ${rel}\n\n${fence}${lang}\n${text}\n${fence}\n`);
  }

  for (const folderName of folders) {
    await collectContextAsync(join(dirPath, folderName));
  }
}

function buildErrorReport() {
  const hasErrors =
    errors["Permission denied"].length > 0
    || errors["Corrupted / unreadable"].length > 0;

  if (!hasErrors) return "";

  const lines = [];
  lines.push("# Error Report");
  lines.push("");

  for (const group of Object.keys(errors)) {
    const list = errors[group];
    if (list.length === 0) continue;
    lines.push(`## ${group}`);
    lines.push("");
    for (const p of list) {
      lines.push(`- ${p}`);
    }
    lines.push("");
  }

  lines.push("## Summary");
  lines.push("");
  lines.push(`- Problem folders: ${problemFolders}`);
  lines.push(`- Problem files: ${problemFiles}`);
  lines.push(`- Broken / defective files: ${brokenFiles}`);
  lines.push("");

  return lines.join("\n");
}

async function copyToClipboard(text) {
  const platform = process.platform;
  let cmd;
  if (platform === "win32") cmd = ["clip"];
  else if (platform === "darwin") cmd = ["pbcopy"];
  else cmd = ["xclip", "-selection", "clipboard"];

  try {
    const proc = Bun.spawn(cmd, {
      stdin: "pipe",
      stdout: "ignore",
      stderr: "ignore",
    });
    proc.stdin.write(text);
    await proc.stdin.end();
    const code = await proc.exited;
    if (code !== 0) {
      throw new Error("Clipboard utility exited with code " + code);
    }
  } catch (err) {
    process.stderr.write(
      "Error: Clipboard utility is not available on this system.\n",
    );
    process.stderr.write(String(err && err.message ? err.message : err) + "\n");
    process.exit(1);
  }
}

function formatNumber(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function main() {
  treeLines.push(basename(ROOT_DIR) || ".");
  buildTree(ROOT_DIR, "");

  await collectContextAsync(ROOT_DIR);

  const out = [];
  out.push("# Project Structure");
  out.push("");
  out.push("```");
  out.push(treeLines.join("\n"));
  out.push("```");
  out.push("");
  out.push("# Files Content");
  out.push("");
  out.push(contextParts.join("\n"));

  const report = buildErrorReport();
  if (report) {
    out.push("");
    out.push(report);
  }

  const finalText = out.join("\n");

  await copyToClipboard(finalText);

  process.stdout.write("Context copied to clipboard.\n");
  process.stdout.write("\n");
  process.stdout.write(
    `  Files included : ${formatNumber(contextParts.length)}\n`,
  );
  process.stdout.write(
    `  Characters     : ${formatNumber(finalText.length)}\n`,
  );
  process.stdout.write("\n");
  process.stdout.write(`  Problem folders : ${formatNumber(problemFolders)}\n`);
  process.stdout.write(`  Problem files   : ${formatNumber(problemFiles)}\n`);
  process.stdout.write(`  Broken files    : ${formatNumber(brokenFiles)}\n`);
  process.stdout.write("\n");
}

main();
