/// <reference types="vite/client" />

// biome-ignore lint/style/useConsistentTypeDefinitions: VITE
interface ImportMetaEnv {
  readonly VITE_ADMIN_URL: string;
}
// biome-ignore lint: VITE
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
