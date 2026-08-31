type SyncBiomeConfig = SyncBiomeConfigInput & {
  content: {
    rootPackage: string;
    configsPackage: string;
    biome: string;
  };
};

type SyncBiomeConfigInput = {
  rootDir: string;
  biomePackageName: string;
  json: JsonFormat;
  configsWorkspace: {
    dir: string;
    srcDir: string;
    dependencyValue: string;
  };
};

type JsonFormat = {
  lineEnding: "lf" | "crlf";
  indentStyle: "space" | "tab";
  indentWidth: number;
};

export type { JsonFormat, SyncBiomeConfig, SyncBiomeConfigInput };
