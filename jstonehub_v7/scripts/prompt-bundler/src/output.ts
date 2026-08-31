import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

async function cleanOutputDir(outputDir: string) {
  const entries = await readdir(outputDir);

  await Promise.all(
    entries.map((entry) =>
      rm(join(outputDir, entry), { recursive: true, force: true }),
    ),
  );
}

async function writeOutput(params: {
  outputDir: string;
  name: string;
  content: string;
}) {
  const { outputDir, name, content } = params;
  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, `${name}.md`);
  await writeFile(outputPath, content, "utf-8");
  return outputPath;
}

function formatFileBlock(params: { filePath: string; content: string }) {
  const { filePath, content } = params;
  const ext = extname(filePath);

  if (ext === ".md") {
    return `${filePath}\n\n${content}`;
  }

  return `${filePath}\n\n\`\`\`\n${content}\n\`\`\``;
}

export { cleanOutputDir, formatFileBlock, writeOutput };
