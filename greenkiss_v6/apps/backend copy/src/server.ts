import { Elysia } from "elysia";
import staticPlugin from "@elysiajs/static";
import { createSsrHandler } from "./routes/ssr-route";
import { getWelcomeMessage } from "./api/message-handler";
import { getHealthzHandler } from "./api/healthz-handler";
import { initProjectPaths } from "./shared/lib/init-project-paths";

const paths = initProjectPaths(import.meta.url);

const app = new Elysia()
  .get("/api/message", getWelcomeMessage)
  .get("/healthz", getHealthzHandler)
  .use(
    staticPlugin({
      assets: paths.assets,
      prefix: "/assets",
    }),
  )
  .use(
    staticPlugin({
      assets: paths.public,
      prefix: "/", // явно укажем корень
    }),
  )
  .get("*", createSsrHandler({ clientDir: paths.client, ssrDir: paths.ssr }));

app.listen(4000);
console.log("🦊 Elysia is running at http://localhost:4000");
