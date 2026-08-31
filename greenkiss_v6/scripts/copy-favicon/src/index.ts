import { dirname, resolve } from "node:path";
import { copyFavicon } from "./copy-favicon";
import { CopyFaviconError } from "./errors";

const { SOURCE, OUTPUT, EXTENSIONS } = process.env;

if (!SOURCE || !OUTPUT || !EXTENSIONS) {
  console.error(
    "❌ Missing required environment variables: SOURCE, OUTPUT, EXTENSIONS",
  );
  process.exit(1);
}

const __filename = Bun.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "../../../");

const sourceDir = resolve(rootDir, SOURCE);
const outputDir = resolve(rootDir, OUTPUT);
const allowedExtensions = EXTENSIONS.split(",").map((ext) =>
  ext.replace(/^\./, "").trim(),
);

try {
  copyFavicon({
    outputDir,
    sourceDir,
    logLevel: "standard",
    allowedExtensions,
    ignoreDirs: ["node_modules", ".turbo", "dist"],
  });
} catch (err) {
  if (err instanceof CopyFaviconError) {
    console.error(`❌ ${err.toString()}`);
    if (err.hint) {
      console.error(`💡 Hint: ${err.hint}`);
    }
    if (err.details) {
      console.error("ℹ️ Details:", err.details);
    }
  } else {
    console.error("❌ Unexpected error:", err);
  }
  process.exitCode = 1;
}
