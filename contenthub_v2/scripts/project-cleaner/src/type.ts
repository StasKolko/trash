type CleanTargets = {
  dirs: string[];
  files: string[];
  extensions: string[];
};

type CleanerConfig = {
  ignore: CleanTargets;
  remove: CleanTargets;
};

type NormalizedTargets = {
  dirs: Set<string>;
  files: Set<string>;
  extensions: Set<string>;
};

type NormalizedConfig = {
  ignore: NormalizedTargets;
  remove: NormalizedTargets;
};

type DeletedKind = "dir" | "file";

type DeletedEntry = {
  kind: DeletedKind;
  path: string;
};

type CleanError = {
  path: string;
  message: string;
};

type CleanStats = {
  deleted: DeletedEntry[];
  errors: CleanError[];
};

export type {
  CleanError,
  CleanerConfig,
  CleanStats,
  CleanTargets,
  DeletedEntry,
  DeletedKind,
  NormalizedConfig,
  NormalizedTargets,
};
