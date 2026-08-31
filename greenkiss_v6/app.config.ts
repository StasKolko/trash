import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  ssr: true,
  server: { preset: "bun" },
  vite: { 
    plugins: [tailwindcss(), tsconfigPaths()],
    ssr: { external: ["drizzle-orm"] }
   }
});
