type SyncOptions = {
  rootPackageJsonPath: string;
  biomeJsonPath: string;
  configPackageDir: string;
  cacheFilePath: string;
};

type ConfigEntry = {
  name: string;
  relativePath: string;
};

export type { ConfigEntry, SyncOptions };
