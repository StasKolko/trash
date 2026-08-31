import { stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import type { Cache, Config, Status } from "../_types";

export async function saveCacheFile({
  cacheFile,
  newCache,
}: {
  cacheFile: string;
  newCache: Cache;
}) {
  const fileContent = `import type { Cache } from "../_types";

export const cache: Cache = ${JSON.stringify(newCache, null, 2)};
`;

  await writeFile(cacheFile, fileContent, "utf8");
}

// ----------------- SORTED CONFIG -----------------

const statCache = new Map<string, boolean>();

export async function saveSortedConfig({
  newConfig,
  configFile,
  rootDir,
}: {
  newConfig: Config;
  configFile: string;
  rootDir: string;
}): Promise<void> {
  statCache.clear();

  const sortedConfig = await sortConfigNodeByFs(newConfig, rootDir);
  const typesImportPath = getTypesImportPath(configFile);

  // Печатаем древовидный конфиг (папки сверху, файлы снизу, цветные статусы)
  await printTreeConfig(sortedConfig, rootDir);

  const objectLiteral = printConfigAsTsObject(sortedConfig, 2);
  const content = `import type { Config } from "${typesImportPath}";

export const config: Config = ${objectLiteral} as const;
`;

  await writeFile(configFile, content, "utf8");
}

async function isDirectoryCached(path: string): Promise<boolean> {
  if (statCache.has(path)) {
    const cached = statCache.get(path);
    return cached === true;
  }

  try {
    const s = await stat(path);
    const isDir = s.isDirectory();
    statCache.set(path, isDir);
    return isDir;
  } catch {
    statCache.set(path, false);
    return false;
  }
}

// type guards

function isStatus(value: unknown): value is Status {
  return value === "ok" || value === "error" || value === "ignore";
}

function isConfigNode(value: unknown): value is Config {
  return typeof value === "object" && value !== null;
}

/**
 * Рекурсивно сортируем узел Config в соответствии с реальной ФС:
 *   - сначала директории (isDirectoryCached === true), по алфавиту
 *   - затем файлы, по алфавиту
 */
async function sortConfigNodeByFs(
  node: Config,
  rootPath: string,
): Promise<Config> {
  const entries = Object.entries(node);

  const dirs: [string, Config | Status][] = [];
  const files: [string, Status][] = [];

  for (const [name, value] of entries) {
    const absPath = join(rootPath, name);
    const isDir = await isDirectoryCached(absPath);

    if (isDir) {
      if (isConfigNode(value)) {
        const sortedChild = await sortConfigNodeByFs(value, absPath);
        dirs.push([name, sortedChild]);
      } else if (isStatus(value)) {
        dirs.push([name, value]);
      }
    } else {
      if (isStatus(value)) {
        files.push([name, value]);
      }
    }
  }

  dirs.sort(([a], [b]) => a.localeCompare(b));
  files.sort(([a], [b]) => a.localeCompare(b));

  const sorted: Config = {};
  for (const [name, value] of dirs) {
    sorted[name] = value;
  }
  for (const [name, value] of files) {
    sorted[name] = value;
  }

  return sorted;
}

function getTypesImportPath(configFile: string): string {
  const dir = dirname(configFile);
  const rel = relative(dir, join(dir, "_types")).replace(/\\/g, "/");
  if (!rel || rel === ".") return "./_types";
  if (!rel.startsWith(".")) return `./${rel}`;
  return rel;
}

// ----------------- ПЕЧАТЬ CONFIG КАК TS-ОБЪЕКТ -----------------

function canUseBareIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function quoteString(value: string): string {
  return JSON.stringify(value);
}

export function printConfigAsTsObject(config: Config, indentSize = 2): string {
  const indentUnit = " ".repeat(indentSize);

  function printNode(node: Config, level: number): string {
    const entries = Object.entries(node);
    const currentIndent = indentUnit.repeat(level);
    const childIndent = indentUnit.repeat(level + 1);

    if (entries.length === 0) {
      return "{}";
    }

    const lines: string[] = ["{"];

    for (const [key, rawValue] of entries) {
      const printedKey = canUseBareIdentifier(key) ? key : quoteString(key);

      if (isConfigNode(rawValue)) {
        const printedValue = printNode(rawValue, level + 1);
        lines.push(`${childIndent}${printedKey}: ${printedValue},`);
      } else if (isStatus(rawValue)) {
        lines.push(`${childIndent}${printedKey}: ${quoteString(rawValue)},`);
      } else {
        lines.push(`${childIndent}${printedKey}: ${JSON.stringify(rawValue)},`);
      }
    }

    lines.push(`${currentIndent}}`);
    return lines.join("\n");
  }

  return printNode(config, 0);
}

// ----------------- ЦВЕТА -----------------

const COLOR_RESET = "\x1b[0m";
const COLOR_RED = "\x1b[31m";
const COLOR_GREEN = "\x1b[32m";
const COLOR_YELLOW = "\x1b[33m";

function colorStatus(status: Status | "mixed"): string {
  if (status === "error") return `${COLOR_RED}${status}${COLOR_RESET}`;
  if (status === "ok") return `${COLOR_GREEN}${status}${COLOR_RESET}`;
  if (status === "ignore") return status;
  return `${COLOR_YELLOW}${status}${COLOR_RESET}`; // mixed
}

// ----------------- ДРЕВОВИДНЫЙ ВЫВОД CONFIG -----------------

type TreeStatus = Status | "mixed";

/**
 * Единый статус поддерева:
 * - "ok" | "error" | "ignore", если все листья совпадают
 * - "mixed", если статусы разные
 * - если всё "ignore" → вернёт "ignore" (и узел будет скрыт при выводе)
 */
function getTreeStatus(node: Config | Status): TreeStatus {
  if (!isConfigNode(node)) {
    return node;
  }

  const values = Object.values(node);
  if (values.length === 0) return "mixed";

  let common: TreeStatus | null = null;

  for (const value of values) {
    let childStatus: TreeStatus;

    if (isConfigNode(value)) {
      childStatus = getTreeStatus(value);
    } else if (isStatus(value)) {
      childStatus = value;
    } else {
      continue;
    }

    if (common === null) {
      common = childStatus;
    } else if (common !== childStatus) {
      return "mixed";
    }
  }

  return common ?? "mixed";
}

/**
 * Узел нужно скрыть, если:
 * - он файл/директория со статусом "ignore"
 * - он директория, внутри которой все элементы "ignore"
 */
function shouldHideNode(node: Config | Status): boolean {
  const s = getTreeStatus(node);
  return s === "ignore";
}

/**
 * Печать дерева:
 * - ВЫВОДИМ только узлы, где есть ok/error/mixed
 * - Всё, что целиком ignore, пропускаем.
 */
async function printTreeConfig(
  config: Config,
  rootPath?: string,
): Promise<void> {
  const basePath = rootPath ?? process.cwd();

  console.log("\nConfig tree (without ignore):\n.");

  const entries = Object.entries(config);

  const dirs: [string, Config | Status][] = [];
  const files: [string, Status][] = [];

  for (const [name, value] of entries) {
    // полностью игнорируем узлы, которые целиком ignore
    if (shouldHideNode(value)) continue;

    const absPath = join(basePath, name);
    const isDir = await isDirectoryCached(absPath);

    if (isDir) {
      if (isConfigNode(value) || isStatus(value)) {
        dirs.push([name, value]);
      }
    } else {
      if (isStatus(value) && value !== "ignore") {
        files.push([name, value]);
      }
    }
  }

  dirs.sort(([a], [b]) => a.localeCompare(b));
  files.sort(([a], [b]) => a.localeCompare(b));

  const all: Array<
    | { kind: "dir"; name: string; value: Config | Status }
    | { kind: "file"; name: string; status: Status }
  > = [];

  for (const [name, value] of dirs) {
    all.push({ kind: "dir", name, value });
  }
  for (const [name, status] of files) {
    all.push({ kind: "file", name, status });
  }

  const lastIndex = all.length - 1;

  for (let index = 0; index < all.length; index++) {
    const entry = all[index];
    const isLast = index === lastIndex;
    const prefix = isLast ? "└─ " : "├─ ";

    if (entry.kind === "file") {
      const colored = colorStatus(entry.status);
      console.log(`${prefix}${entry.name} (${colored})`);
    } else {
      await printDirNode(
        entry.name,
        entry.value,
        [],
        isLast,
        join(basePath, entry.name),
      );
    }
  }

  console.log(); // пустая строка в конце
}

async function printDirNode(
  name: string,
  value: Config | Status,
  parentPrefixes: string[],
  isLastInParent: boolean,
  absPath: string,
): Promise<void> {
  if (shouldHideNode(value)) {
    // Полностью игнорируем такие папки
    return;
  }

  const status = getTreeStatus(value);
  const colored = colorStatus(status);

  const currentPrefix = parentPrefixes.join("");
  const nodePrefix = isLastInParent ? "└─ " : "├─ ";

  console.log(`${currentPrefix}${nodePrefix}${name} (${colored})`);

  if (!isConfigNode(value)) {
    return;
  }

  const entries = Object.entries(value);

  const dirs: [string, Config | Status][] = [];
  const files: [string, Status][] = [];

  for (const [childName, childValue] of entries) {
    if (shouldHideNode(childValue)) continue;

    const childAbs = join(absPath, childName);
    const isDir = await isDirectoryCached(childAbs);

    if (isDir) {
      if (isConfigNode(childValue) || isStatus(childValue)) {
        dirs.push([childName, childValue]);
      }
    } else {
      if (isStatus(childValue) && childValue !== "ignore") {
        files.push([childName, childValue]);
      }
    }
  }

  dirs.sort(([a], [b]) => a.localeCompare(b));
  files.sort(([a], [b]) => a.localeCompare(b));

  const children: Array<
    | { kind: "dir"; name: string; value: Config | Status }
    | { kind: "file"; name: string; status: Status }
  > = [];

  for (const [n, v] of dirs) {
    children.push({ kind: "dir", name: n, value: v });
  }
  for (const [n, s] of files) {
    children.push({ kind: "file", name: n, status: s });
  }

  const lastChildIndex = children.length - 1;

  const childPrefix = isLastInParent ? "   " : "│  ";
  const nextPrefixes = [...parentPrefixes, childPrefix];

  for (let idx = 0; idx < children.length; idx++) {
    const child = children[idx];
    const isLast = idx === lastChildIndex;

    if (child.kind === "file") {
      const coloredChild = colorStatus(child.status);
      const linePrefix = nextPrefixes.join("");
      const nodePrefixChild = isLast ? "└─ " : "├─ ";
      console.log(
        `${linePrefix}${nodePrefixChild}${child.name} (${coloredChild})`,
      );
    } else {
      await printDirNode(
        child.name,
        child.value,
        nextPrefixes,
        isLast,
        join(absPath, child.name),
      );
    }
  }
}
