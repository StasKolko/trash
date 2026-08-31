import type { SyncBiomeConfigInput } from "./_type";

import { AppError } from "@packages/util-shared/error";
import { is } from "@packages/util-shared/guard";

let config: SyncBiomeConfigInput | null = null;

function initConfig(input: SyncBiomeConfigInput) {
  config = input;
}

function getConfig() {
  if (is.null(config)) {
    throw new ConfigNotInitializedError();
  }

  return config;
}

class ConfigNotInitializedError extends AppError {
  public constructor() {
    super({
      kind: "config_not_initialized",
      message: "Config not initialized: call initConfig before getConfig",
    });
  }
}

export { getConfig, initConfig };
