import { Cache, IgnoreConfig } from "../_types";
import { isCacheFile } from "../_utils/cache";


type CollapsedResult = "ok" | { [name: string]: CollapsedResult | "ignore" };

export function buildOkAndIgnoredTree(
  cache: Cache,
  ignoreConfig: IgnoreConfig
): CollapsedResult | { [name: string]: CollapsedResult | "ignore" } {
  const collapsed = collapseCache(cache);
  const withIgnore = mergeIgnore(collapsed, ignoreConfig);

  return sortTree(withIgnore ?? {});
}

function mergeIgnore(
  collapsed: CollapsedResult | undefined,
  ignoreConfig: IgnoreConfig | undefined
): CollapsedResult | { [name: string]: CollapsedResult | "ignore" } | undefined {
  if (!collapsed && !ignoreConfig) return undefined;

  if (collapsed === "ok" && ignoreConfig && typeof ignoreConfig === "object") {
    const obj: { [name: string]: CollapsedResult | "ignore" } = {};
    for (const [name, val] of Object.entries(ignoreConfig)) {
      if (val === "ignore") {
        obj[name] = "ignore";
      } else {
        const mergedChild = mergeIgnore("ok", val); // вся папка ok, а в ней есть ignore
        if (mergedChild !== undefined) obj[name] = mergedChild;
      }
    }
    return Object.keys(obj).length ? obj : "ok";
  }

  // Если есть только игнор
  if (!collapsed && ignoreConfig) {
    const obj: { [name: string]: CollapsedResult | "ignore" } = {};
    for (const [name, val] of Object.entries(ignoreConfig)) {
      if (val === "ignore") {
        obj[name] = "ignore";
      } else {
        const child = mergeIgnore(undefined, val);
        if (child !== undefined) obj[name] = child;
      }
    }
    return Object.keys(obj).length ? obj : undefined;
  }

  // Если есть только collapsed
  if (collapsed && !ignoreConfig) return collapsed;

  // Оба: collapsed — либо "ok", либо объект
  if (collapsed === "ok") {
    // Этот кейс уже обработан выше (раскрытие "ok" для игнора)
    return collapsed;
  }

  const result: { [name: string]: CollapsedResult | "ignore" } = {};
  const collapsedObj = collapsed as { [name: string]: CollapsedResult };
  const ignoreObj = ignoreConfig as IgnoreConfig;

  const names = new Set<string>([
    ...Object.keys(collapsedObj),
    ...Object.keys(ignoreObj),
  ]);

  for (const name of names) {
    const cVal = collapsedObj[name];
    const iVal = ignoreObj[name];

    if (iVal === "ignore") {
      // Если путь в ignore — он ignore независимо от collapsed
      result[name] = "ignore";
      continue;
    }

    if (cVal === undefined && iVal && typeof iVal === "object") {
      const merged = mergeIgnore(undefined, iVal);
      if (merged !== undefined) result[name] = merged;
      continue;
    }

    if (cVal !== undefined && iVal === undefined) {
      result[name] = cVal;
      continue;
    }

    if (cVal !== undefined && iVal && typeof iVal === "object") {
      const merged = mergeIgnore(cVal, iVal);
      if (merged !== undefined) result[name] = merged;
    }
  }

  if (!Object.keys(result).length) return undefined;
  return result;
}

/* ===================== 3. Сортировка как в VS Code ===================== */

/**
 * Сортирует дерево:
 * - сначала папки (значение: объект или "ok"), потом файлы (значение: "ignore" или "ok" но без детей)
 *   — но нам нельзя отличить файл "ok" от папки "ok", поэтому:
 *   - считаем папками только те, чьё значение — объект
 *   - всё остальное — "файлы" для целей сортировки
 * - в обеих группах: имена с точкой впереди, затем без точки, по алфавиту
 */
function sortTree(
  node: CollapsedResult | { [name: string]: CollapsedResult | "ignore" }
): CollapsedResult | { [name: string]: CollapsedResult | "ignore" } {
  if (node === "ok") return node;

  const entries = Object.entries(node);
  const dirs: [string, CollapsedResult | "ignore"][] = [];
  const files: [string, CollapsedResult | "ignore"][] = [];

  for (const [name, value] of entries) {
    if (value !== "ignore" && typeof value === "object") {
      dirs.push([name, value]);
    } else {
      files.push([name, value]);
    }
  }

  const sortByName = (a: [string, unknown], b: [string, unknown]) => {
    const [na] = a;
    const [nb] = b;
    const aDot = na.startsWith(".");
    const bDot = nb.startsWith(".");
    if (aDot !== bDot) return aDot ? -1 : 1;
    return na.localeCompare(nb);
  };

  dirs.sort(sortByName);
  files.sort(sortByName);

  const sorted: { [name: string]: CollapsedResult | "ignore" } = {};

  for (const [name, value] of dirs) {
    sorted[name] = sortTree(
      value as CollapsedResult | { [name: string]: CollapsedResult | "ignore" }
    );
  }

  for (const [name, value] of files) {
    // "ignore" и "ok" — уже листовые
    sorted[name] = value as CollapsedResult | "ignore";
  }

  return sorted;
}
