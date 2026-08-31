const ignoredExtensionSet = new Set<string>();

export function initIgnoredExtensionSet(ignoredExtensions: string[]) {
  for (const ext of ignoredExtensions) {
    ignoredExtensionSet.add(normalizeExtension(ext));
  }
}

export function shouldIgnoreExtension(name: string): boolean {
  const ext = getFileExtension(name);
  return ignoredExtensionSet.has(ext);
}

function getFileExtension(filename: string): string {
  for (let i = filename.length - 1; i >= 0; i--) {
    const char = filename[i];

    if (char === ".") {
      if (i === 0) return "";
      return filename.slice(i + 1);
    }
    if (char === "/" || char === "\\") return "";
  }

  return "";
}

function normalizeExtension(ext: string): string {
  return ext.replace(/^\./, "").toLowerCase().trim();
}
