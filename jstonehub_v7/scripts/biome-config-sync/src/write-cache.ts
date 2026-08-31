import { writeFile } from "node:fs/promises";

async function writeCacheFile(params: { filePath: string; version: string }) {
  const { filePath, version } = params;
  const content = `const BIOME_VERSION = "${version}";\n\nexport { BIOME_VERSION };\n`;
  await writeFile(filePath, content, "utf8");
}

export { writeCacheFile };
