import { resolve } from "node:path";
import { defineFrontendConfig } from "@configs/vite";

export default defineFrontendConfig({
  port: 3001,
  routesDir: "src/app/routes",
  aliases: {
    "#admin": resolve(import.meta.dirname, "./src"),
    "#api": resolve(import.meta.dirname, "../api/src"),
  },
});
