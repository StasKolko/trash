import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";
import { storage } from "#api/shared/storage/storage";

const storageV1 = new Elysia({ prefix: "/v1/storage" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/objects", async ({ query }) => {
    const prefix = (query.prefix as string) ?? "";
    const objects = await storage.listObjects(prefix);

    const prefixSet = new Set<string>();
    const result: { key: string; size: number; lastModified: string; isPrefix: boolean }[] = [];

    for (const obj of objects) {
      const relativePath = obj.key.slice(prefix.length);
      const slashIndex = relativePath.indexOf("/");

      if (slashIndex >= 0) {
        const dirPrefix = `${prefix}${relativePath.slice(0, slashIndex + 1)}`;
        if (!prefixSet.has(dirPrefix)) {
          prefixSet.add(dirPrefix);
          result.push({
            key: dirPrefix,
            size: 0,
            lastModified: obj.lastModified.toISOString(),
            isPrefix: true,
          });
        }
      } else {
        result.push({
          key: obj.key,
          size: obj.size,
          lastModified: obj.lastModified.toISOString(),
          isPrefix: false,
        });
      }
    }

    return result;
  })
  .delete("/objects", async ({ body, set }) => {
    const { keys, prefix } = body as { keys?: string[]; prefix?: string };

    if (prefix && typeof prefix === "string") {
      await storage.deletePrefix(prefix);
      set.status = HTTP_STATUS.NO_CONTENT;
      return;
    }

    if (Array.isArray(keys) && keys.length > 0) {
      await storage.deleteObjects(keys);
      set.status = HTTP_STATUS.NO_CONTENT;
      return;
    }

    set.status = HTTP_STATUS.BAD_REQUEST;
    return { error: "Provide either 'keys' array or 'prefix' string" };
  });

export { storageV1 };