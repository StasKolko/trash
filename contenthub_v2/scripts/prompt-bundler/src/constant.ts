const BYTES_PER_KB = 1024;

const MAX_FILE_SIZE_KB_DEFAULT = 50;

const BUILTIN_EXCLUDES = [
  // Directories
  "**/.git/**",
  "**/.husky/**",
  "**/.qodo/**",
  "**/.svn/**",
  "**/.vscode/**",
  "**/.idea/**",
  "**/.turbo/**",
  "**/.cache/**",
  "**/.tanstack/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/out/**",
  "**/coverage/**",
  "**/__snapshots__/**",
  "**/drizzle/**",

  // Files
  "**/routeTree.gen.ts",

  // Images
  "**/*.png",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.gif",
  "**/*.webp",
  "**/*.ico",
  "**/*.svg",
  "**/*.bmp",
  "**/*.tiff",

  // Video
  "**/*.mp4",
  "**/*.mov",
  "**/*.avi",
  "**/*.mkv",
  "**/*.webm",
  "**/*.flv",

  // Audio
  "**/*.mp3",
  "**/*.wav",
  "**/*.aac",
  "**/*.m4a",
  "**/*.ogg",
  "**/*.flac",

  // Archives
  "**/*.zip",
  "**/*.rar",
  "**/*.7z",
  "**/*.tar",
  "**/*.gz",
  "**/*.bz2",

  // Fonts
  "**/*.ttf",
  "**/*.otf",
  "**/*.woff",
  "**/*.woff2",
  "**/*.eot",

  // Documents
  "**/*.pdf",
  "**/*.doc",
  "**/*.docx",
  "**/*.xls",
  "**/*.xlsx",
  "**/*.ppt",
  "**/*.pptx",

  // Database
  "**/*.db",
  "**/*.sqlite",
  "**/*.sqlite3",

  // Build artifacts & locks
  "**/*.lock",
  "**/*.lockb",
  "**/*.map",
  "**/*.log",

  // OS & editor files
  "**/.DS_Store",
  "**/Thumbs.db",
  "**/.gitkeep",
  "**/.npmrc",
  "**/.nvmrc",
] as const;

export { BUILTIN_EXCLUDES, BYTES_PER_KB, MAX_FILE_SIZE_KB_DEFAULT };
