import { Elysia, t } from "elysia";

import { cleanupTestUsers, seedUsers } from "./user.seed";

const DEFAULT_SEED_COUNT = 20;
const MAX_SEED_COUNT = 200;

const devSeedV1 = new Elysia({ prefix: "/dev/seed" })
  .post(
    "/users",
    async ({ body }) => {
      const count = Math.min(body.count ?? DEFAULT_SEED_COUNT, MAX_SEED_COUNT);
      const result = await seedUsers(count);
      return result;
    },
    {
      body: t.Object({
        count: t.Optional(t.Number({ minimum: 1, maximum: MAX_SEED_COUNT })),
      }),
    },
  )
  .delete("/users", async () => {
    const result = await cleanupTestUsers();
    return result;
  });

export { devSeedV1 };
