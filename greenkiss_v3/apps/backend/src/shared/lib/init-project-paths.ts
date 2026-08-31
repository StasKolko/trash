import fs from "node:fs";
import path from "node:path";

export function initProjectPaths(metaUrl: string) {
  const __filename = Bun.fileURLToPath(metaUrl);
  const __dirname = path.dirname(__filename);

  const paths = {
    client: path.join(__dirname, "client"),
    ssr: path.join(__dirname, "ssr"),
    public: path.join(__dirname, "public"),
    assets: path.join(__dirname, "client", "assets"),
  };

  if (
    process.env.NODE_ENV === "development" ||
    Bun.env.NODE_ENV === "development"
  ) {
    validateDirectories(paths);
  }

  return paths;
}

function validateDirectories(paths: Record<string, string>) {
  const requiredDirs = ["client", "ssr", "public", "assets"];

  for (const dirName of requiredDirs) {
    const dirPath = paths[dirName];
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Required directory not found: ${dirPath}`);
    }

    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${dirPath}`);
    }
  }
}
