import { AppError } from "@packages/util-shared/error";

class ConfigNotFoundError extends AppError {
  public constructor(context: { configPath: string }) {
    super({
      kind: "cleaner_config_not_found",
      message:
        "Cleaner config not found. Copy 'cleaner.config.template.ts' to 'cleaner.config.ts'",
      context,
    });
  }
}

class InvalidFileNameError extends AppError {
  public constructor(context: { value: string; reason: string }) {
    super({
      kind: "cleaner_invalid_file_name",
      message: `Invalid file name in config: "${context.value}" (${context.reason})`,
      context,
    });
  }
}

class InvalidDirNameError extends AppError {
  public constructor(context: { value: string; reason: string }) {
    super({
      kind: "cleaner_invalid_dir_name",
      message: `Invalid directory name in config: "${context.value}" (${context.reason})`,
      context,
    });
  }
}

class InvalidExtensionError extends AppError {
  public constructor(context: { value: string; reason: string }) {
    super({
      kind: "cleaner_invalid_extension",
      message: `Invalid extension in config: "${context.value}" (${context.reason})`,
      context,
    });
  }
}

export {
  ConfigNotFoundError,
  InvalidDirNameError,
  InvalidExtensionError,
  InvalidFileNameError,
};
