import type {
  Config,
  ConfigStatus,
  Cache,
  CacheFile,
  ErrorTreeNode,
  Stats,
} from "../_types";
import { isCacheFile } from "../_utils/cache";

/**
 * Результат построения нового конфига и дерева ошибок.
 */
export type BuildResult = {
  /** Новый, отсортированный и сколлапсированный конфиг. */
  nextConfig: Config;
  /** Дерево ошибок (и не-помеченных ok), схлопывающее чисто-ошибочные папки в "error". */
  errorTree: ErrorTreeNode;
  /** Статистика по файлам. */
  stats: Stats;
};

/**
 * Главная функция:
 * - из текущего cache+config делает:
 *   - nextConfig (с коллапсом ok и сортировкой);
 *   - errorTree;
 *   - stats.
 */
export function buildCollapsedConfigAndErrorTree(
  cache: Cache,
  config: Config,
): BuildResult {
  const stats: Stats = {
    totalFiles: 0,
    okFiles: 0,
    errorFiles: 0,
  };

  const { nextConfig, errorTree } = walk("", cache, config, stats);

  return {
    nextConfig: nextConfig as Config,
    errorTree: sortErrorTree(errorTree),
    stats,
  };
}

/**
 * Рекурсивный обход дерева cache+config.
 * Возвращает:
 * - новый config для этого узла;
 * - errorTree для этого узла.
 *
 * 7) Коллапс полей в новом конфиге:
 *    - если все файлы внутри папки имеют статус ok и нет ignore,
 *      вместо вложенного объекта ставим значение "ok".
 *
 * Здесь мы:
 * - строим nextConfig (который потом превратится в config.ts);
 * - строим errorTree с коллапсом чисто-ок / чисто-error папок.
 */
function walk(
  name: string,
  cacheNode: Cache | CacheFile,
  configNode: Config | ConfigStatus | undefined,
  stats: Stats,
): { nextConfig: Config | ConfigStatus; errorTree: ErrorTreeNode } {
  // Лист — файл.
  if (isCacheFile(cacheNode)) {
    stats.totalFiles += 1;
    if (cacheNode.status === "ok") stats.okFiles += 1;
    else stats.errorFiles += 1;

    if (typeof configNode === "string") {
      // В конфиге есть явный статус файла ("ok" или "ignore").
      return {
        nextConfig: configNode,
        errorTree: cacheNode.status === "ok" ? "ok" : "error",
      };
    }

    // Если для файла нет явного статуса в конфиге —
    // не добавляем его в nextConfig, но учитываем в errorTree.
    return {
      nextConfig: {},
      errorTree: cacheNode.status === "ok" ? "ok" : "error",
    };
  }

  // Папка.
  const childrenNames = new Set<string>([
    ...Object.keys(cacheNode),
    ...(configNode && typeof configNode === "object"
      ? Object.keys(configNode)
      : []),
  ]);

  const nextConfigObj: Config = {};
  const errorTreeObj: { [name: string]: ErrorTreeNode } = {};

  for (const childName of childrenNames) {
    const cacheChild = (cacheNode as any)[childName];
    const configChild =
      typeof configNode === "object" ? (configNode as any)[childName] : undefined;

    if (!cacheChild) {
      // В кэше нет — видимо, ключ уже не существует на диске.
      // cleanupConfigAndCache должен был это удалить, но на всякий случай пропускаем.
      continue;
    }

    const { nextConfig, errorTree } = walk(
      childName,
      cacheChild,
      configChild,
      stats,
    );

    // Обработка nextConfig:
    if (typeof nextConfig === "string") {
      // nextConfig === ConfigStatus ("ok" | "ignore")
      nextConfigObj[childName] = nextConfig as ConfigStatus;
    } else if (Object.keys(nextConfig).length > 0) {
      // nextConfig === Config (объект)
      nextConfigObj[childName] = nextConfig as Config;
    }

    // Обработка errorTree:
    errorTreeObj[childName] = errorTree;
  }

  // Попытка схлопнуть папку в "ok" или "error".
  const collapsedErrorTree = collapseErrorNode(errorTreeObj);

  // Для nextConfig: если в configNode у этой папки напрямую указано "ok"/"ignore" — сохраняем это.
  // Иначе — оставляем объект со сколлапсированными детьми.
  if (typeof configNode === "string") {
    // Папка помечена "ok" или "ignore" целиком.
    return {
      nextConfig: configNode,
      errorTree: collapsedErrorTree,
    };
  }

  return {
    nextConfig: nextConfigObj,
    errorTree: collapsedErrorTree,
  };
}

/**
 * Схлопывает errorTree:
 * - если все дети "ok" => "ok";
 * - если все дети "error" => "error";
 * - если смешано, оставляем объект.
 */
function collapseErrorNode(node: ErrorTreeNode): ErrorTreeNode {
  if (node === "ok" || node === "error" || node === "ignore") return node;

  const keys = Object.keys(node);
  if (keys.length === 0) return "ok"; // Пустая папка считается ok.

  let allOk = true;
  let allError = true;

  const collapsedChildren: { [name: string]: ErrorTreeNode } = {};

  for (const key of keys) {
    const child = collapseErrorNode(node[key]);
    collapsedChildren[key] = child;

    if (child !== "ok") allOk = false;
    if (child !== "error") allError = false;
  }

  if (allOk) return "ok";
  if (allError) return "error";

  return collapsedChildren;
}

/**
 * Сортировка errorTree по vs-code-стилю:
 * - сначала папки (объекты), потом файлы ("ok"/"error"/"ignore"), в каждой группе:
 *   - сперва имена с точкой (".*"), потом остальные, в алфавитном порядке.
 */
function sortErrorTree(node: ErrorTreeNode): ErrorTreeNode {
  if (node === "ok" || node === "error" || node === "ignore") return node;

  const entries = Object.entries(node);

  const folderNames: string[] = [];
  const fileNames: string[] = [];

  for (const [name, value] of entries) {
    const isFolder = typeof value === "object";
    if (isFolder) folderNames.push(name);
    else fileNames.push(name);
  }

  const sortNames = (names: string[]) => {
    const dot: string[] = [];
    const normal: string[] = [];
    for (const n of names) {
      if (n.startsWith(".")) dot.push(n);
      else normal.push(n);
    }
    dot.sort((a, b) => a.localeCompare(b));
    normal.sort((a, b) => a.localeCompare(b));
    return [...dot, ...normal];
  };

  const sortedFolders = sortNames(folderNames);
  const sortedFiles = sortNames(fileNames);

  const result: { [name: string]: ErrorTreeNode } = {};

  for (const name of sortedFolders) {
    result[name] = sortErrorTree(node[name] as ErrorTreeNode);
  }

  for (const name of sortedFiles) {
    result[name] = sortErrorTree(node[name] as ErrorTreeNode);
  }

  return result;
}

/**
 * Хелперы для превращения nextConfig в строку TS-объекта.
 * (Используем при генерации config.ts в code-map.ts)
 *
 * 7,9) Сортировка ключей:
 * - сначала имена с точкой (".*"), затем остальные; внутри — по алфавиту.
 * В сочетании с тем, что папки представлены объектами, а файлы — строками,
 * это даёт порядок, близкий к VS Code:
 * - "папки" (объекты) идут раньше файлов (строк), потому что у папок есть дети,
 *   и они чаще имеют вложенные ключи.
 */
export function stringifyConfigObject(
  config: Config | ConfigStatus,
  indent = 0,
): string {
  const pad = "  ".repeat(indent);

  if (typeof config === "string") {
    return JSON.stringify(config);
  }

  const keys = Object.keys(config);
  if (keys.length === 0) return "{}";

  const dot: string[] = [];
  const normal: string[] = [];
  for (const key of keys) {
    if (key.startsWith(".")) dot.push(key);
    else normal.push(key);
  }
  dot.sort((a, b) => a.localeCompare(b));
  normal.sort((a, b) => a.localeCompare(b));
  const sortedKeys = [...dot, ...normal];

  const parts: string[] = [];
  for (const key of sortedKeys) {
    const value = (config as Config)[key];
    const valueStr = stringifyConfigObject(
      value as Config | ConfigStatus,
      indent + 1,
    );
    parts.push(`${"  ".repeat(indent + 1)}${JSON.stringify(key)}: ${valueStr}`);
  }

  return `{\n${parts.join(",\n")}\n${pad}}`;
}

/**
 * Цвета для консольного вывода errorTree.
 */
const ANSI = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
};

/**
 * Строковое представление errorTree.
 * 10) Для вывода в консоль:
 * - error — красным;
 * - ok — зелёным;
 * - ignore — без цвета;
 * - сортировка как в vs code (папки, затем файлы; .dot-сначала).
 */
export function stringifyErrorTree(
  node: ErrorTreeNode,
  indent = 0,
): string {
  const pad = "  ".repeat(indent);

  if (node === "ok") {
    return `${pad}${ANSI.green}ok${ANSI.reset}`;
  }
  if (node === "error") {
    return `${pad}${ANSI.red}error${ANSI.reset}`;
  }
  if (node === "ignore") {
    return `${pad}ignore`;
  }

  const entries = Object.entries(node);
  if (entries.length === 0) return `${pad}{}`;

  const folderNames: string[] = [];
  const fileNames: string[] = [];

  for (const [name, value] of entries) {
    const isFolder = typeof value === "object";
    if (isFolder) folderNames.push(name);
    else fileNames.push(name);
  }

  const sortNames = (names: string[]) => {
    const dot: string[] = [];
    const normal: string[] = [];
    for (const n of names) {
      if (n.startsWith(".")) dot.push(n);
      else normal.push(n);
    }
    dot.sort((a, b) => a.localeCompare(b));
    normal.sort((a, b) => a.localeCompare(b));
    return [...dot, ...normal];
  };

  const sortedFolders = sortNames(folderNames);
  const sortedFiles = sortNames(fileNames);

  const lines: string[] = [];

  // Папки.
  for (const name of sortedFolders) {
    const val = node[name] as ErrorTreeNode;
    if (val === "ok" || val === "error" || val === "ignore") {
      lines.push(`${pad}${name}: ${stringifyErrorTree(val, 0).trim()}`);
    } else {
      lines.push(`${pad}${name}/`);
      lines.push(stringifyErrorTree(val, indent + 1));
    }
  }

  // Файлы.
  for (const name of sortedFiles) {
    const val = node[name] as ErrorTreeNode;
    if (val === "ok" || val === "error" || val === "ignore") {
      lines.push(`${pad}${name}: ${stringifyErrorTree(val, 0).trim()}`);
    } else {
      lines.push(`${pad}${name}/`);
      lines.push(stringifyErrorTree(val, indent + 1));
    }
  }

  return lines.join("\n");
}
