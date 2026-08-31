const BIOME_PACKAGE_NAME = "@biomejs/biome";

const BIOME_SCHEMA_URL_PREFIX = "https://biomejs.dev/schemas/";

const BIOME_SCHEMA_URL_SUFFIX = "/schema.json";

const BIOME_CONFIG_PACKAGE_NAME = "@configs/biomejs";

const CONFIG_FILE_EXTENSIONS = [".json", ".jsonc"] as const;

const SCHEMA_PROPERTY_NAME = "$schema";

const BIOME_VERSION_REGEX = /\d+(?:\.\d+)*/;

export {
  BIOME_CONFIG_PACKAGE_NAME,
  BIOME_PACKAGE_NAME,
  BIOME_SCHEMA_URL_PREFIX,
  BIOME_SCHEMA_URL_SUFFIX,
  BIOME_VERSION_REGEX,
  CONFIG_FILE_EXTENSIONS,
  SCHEMA_PROPERTY_NAME,
};
