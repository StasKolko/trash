import type { Cache, CacheFile, Config, Status } from "../_types";

export function mergeCacheIntoConfig(config: Config, cache: Cache): void {
  function isCacheNode(value: Cache | CacheFile): value is Cache {
    // У CacheFile есть поле status, у Cache — нет
    return typeof (value as CacheFile).status !== "string";
  }

  // Возвращает единый статус поддерева или null,
  // если статусы смешанные и коллапсить нельзя.
  function getUniformStatus(node: Cache | CacheFile): Status | null {
    if (!isCacheNode(node)) {
      return node.status;
    }

    const entries = Object.values(node);
    if (entries.length === 0) {
      return null;
    }

    let commonStatus: Status | null = null;

    for (const child of entries) {
      const childStatus = getUniformStatus(child);
      if (childStatus === null) return null;

      if (commonStatus === null) {
        commonStatus = childStatus;
      } else if (commonStatus !== childStatus) {
        return null;
      }
    }

    return commonStatus;
  }

  function fillConfigFromCache(target: Config, cacheNode: Cache): void {
    for (const [name, child] of Object.entries(cacheNode)) {
      if (!isCacheNode(child)) {
        // Лист — файл
        const status = child.status;

        // Если хотим, можем записывать статус файла напрямую:
        target[name] = status;
        continue;
      }

      // Директория
      const uniformStatus = getUniformStatus(child);

      if (uniformStatus !== null) {
        // Можно коллапсить всю папку до статуса
        target[name] = uniformStatus;
        continue;
      }

      // Статусы смешаны — нужна вложенная структура
      const current = target[name];

      if (typeof current === "string" || current === undefined) {
        // Был статус или ничего — создаём поддерево
        const newNode: Config = {};
        target[name] = newNode;
        fillConfigFromCache(newNode, child);
      } else {
        // Уже есть поддерево
        fillConfigFromCache(current, child);
      }
    }
  }

  fillConfigFromCache(config, cache);
}
