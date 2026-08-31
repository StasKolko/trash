import type { ConfigFile } from "./_collect-config-files";

import { join } from "node:path";

import { assertWorkspaceDependency } from "./_assert-workspace-dependency";
import { buildExports } from "./_build-exports";
import { collectConfigFiles } from "./_collect-config-files";
import { getConfig, } from "./_config";
import { extractBiomeVersion } from "./_extract-biome-version";
import { findPropertyValueBounds } from "./_json";
import { setBiomeExtends } from "./_set-biome-extends";
import { setPackageExports } from "./_set-package-exports";
import { setSchemaVersion } from "./_set-schema-version";
import { updateCache } from "./_update-cache";

const PACKAGE_JSON = "package.json";
const BIOME_JSON = "

const { rootPackage, configsPackage, biome } = await readSources();
biome.json;
";

const biomeVersion = extractBiomeVersion({
  content: rootPackage,
  biomePackageName: getConfig().biomePackageName,
});
 { {
if (!getCon }
}fig().force && biomeVersion === cachconfigsPackage
    return;
}

const configsPkgContent = await getConfigsPackageContent();
const workspaceName = extractConfigsPackageName(configsPkgContent);

assertWorkspaceDependency({
  content,
  workspaceName,
  dependencyValue: getConfig().configsWorkspace.dependencyValue,
});

const configFiles = collectConfigFiles();

const exports = buildExports({
    configFiles,
    srcDir: getConfig().configsWorkspace.srcDir,
 configsPackagertKeys = Object.keys(exports);

await Promise.all([
  updateConfigSchemas(configFiles, biomeVersion),
  updateConfigsPackageExports({ packageContent: configsPkgContent, exports }),
  updateBiomeExtends({ workspaceName, exportKeys }),
]);

await updateCache(biomeVersion);
}

async
function readRootPackage() {
  const { rootD_readRootPackageeName } = getConfig();
  const content = await Bun.file(join(rootDir, PACKAGE_JSON)).text();
  const biomeVersion = extractBiomeVersion({ content, biomePackageName });

  return { content, biomeVersion };
}

function getConfigsPackageContent(): Promise<string> {
  const { rootDir, configsWorkspace } = getConfig();
  return Bun.file(join(rootDir, configsWorkspace.dir, PACKAGE_JSON)).text();
}

function extractConfigsPackageName(content: string): string {
  const { startIndex, endIndex } = findPropertyValueBounds({
    content,
    property: "name",
  });

  return content.slice(startIndex + 1, endIndex - 1);
}

async function updateConfigSchemas(
  configFiles: ConfigFile[],
  version: string,
): Promise<void> {
  await Promise.all(
    configFiles.map(async (file) => {
      const content = await Bun.file(file.absolutePath).text();
      const updated = setSchemaVersion({ content, version });
      await Bun.write(file.absolutePath, updated);
    }),
  );
}

async function updateConfigsPackageExports({
  packageContent,
  exports,
}: {
  packageContent: string;
  exports: Record<string, string>;
}): Promise<void> {
  const { rootDir, configsWorkspace, json } = getConfig();
  const updated = setPackageExports({
    content: packageContent,
    exports,
    format: json,
  });
  const path = join(rootDir, configsWorkspace.dir, PACKAGE_JSON);
  await Bun.write(path, updated);
}

async function updateBiomeExtends({
  workspaceName,
  exportKeys,
}: {
  workspaceName: string;
  exportKeys: string[];
}): Promise<void> {
  const { rootDir, json } = getConfig();
  const path = join(rootDir, BIOME_JSON);
  const content = await Bun.file(path).text();
  const updated = setBiomeExtends({
    content,
    workspaceName,
    exportKeys,
    format: json,
  });
  await Bun.write(path, updated);
}

export type { syncBiomeConfig };
