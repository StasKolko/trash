export type Config = {
  [name: string]: Config | Status;
};

export type Cache = {
  [name: string]: Cache | CacheFile;
};

export type CacheFile = {
  status: Status;
  hash: string;
};

export type Status = "ok" | "error" | "ignore";
