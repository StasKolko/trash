import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import viteTsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig(() => ({
  base: "/",
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/favicon.png": "http://localhost:4000",
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../../dist/client"),
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src/entry-client.tsx"),
    },
    target: "esnext",
    emptyOutDir: true,
    minify: true,
    copyPublicDir: false,
    ssrManifest: true
  },
  ssr: {
    // Критично: включаем в SSR-бандл solid и его экосистему,
    // чтобы Bun не искал их в node_modules при импорте dist/ssr/*.js
    noExternal: ["solid-js", "@solidjs/router", "@solidjs/meta"],
  },
  plugins: [
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    solidPlugin({ ssr: true }),
  ],
}));
