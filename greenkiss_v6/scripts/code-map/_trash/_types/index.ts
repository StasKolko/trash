export type EntryInfo = {
  name: string;
  path: string;
};

export type ConfigStatus = "ok" | "ignore";

export type Config = {
  [name: string]: Config | ConfigStatus;
};

export type CacheFileStatus = "ok" | "error";

export type CacheFile = {
  status: CacheFileStatus;
  hash: string;
  newHash: string;
};

export type Cache = {
  [name: string]: Cache | CacheFile;
};

/** Для подсчёта статистики */
export type Stats = {
  totalFiles: number;
  okFiles: number;
  errorFiles: number;
};

/** Узел дерева для финального "ошибочного" отображения */
export type ErrorTreeNode =
  | "ok"
  | "ignore"
  | "error"
  | { [name: string]: ErrorTreeNode };
