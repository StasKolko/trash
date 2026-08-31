export function normalizeExtension(ext: string): string {
  return ext.replace(/^\./, "").toLowerCase().trim();
}

export function getFileExtension(filename: string): string {
  for (let i = filename.length - 1; i >= 0; i--) {
    const char = filename[i];

    if (char === ".") {
      if (i === 0) return "";
      return filename.slice(i);
    }
    if (char === "/" || char === "\\") return "";
  }

  return "";
}
