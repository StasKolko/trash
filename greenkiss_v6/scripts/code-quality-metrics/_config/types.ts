export type AbsolutePath = string;

export interface RawConfig {
  ignoreDirsFromRoot: string[];
  ignoreFilesFromRoot: string[];
  ignoreExtensions: string[];
  okDirsFromRoot: string[];
  okFilesFromRoot: string[];
  projectRootFromIndex: string;
}

export interface NormalizedConfig {
  projectRoot: AbsolutePath;

  ignoreDirs: AbsolutePath[];
  ignoreFiles: AbsolutePath[];
  ignoreExtensions: Set<string>; // без точки

  okDirs: AbsolutePath[];
  okFiles: AbsolutePath[];
}

export interface FileStat {
  absolutePath: AbsolutePath;
  relativeToRoot: string;
  isOk: boolean;
}

export interface ScanStats {
  totalFiles: number;
  okFiles: number;
  notOkFiles: number;
  notOkList: FileStat[];
}
