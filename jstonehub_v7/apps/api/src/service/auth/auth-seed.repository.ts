import { sessionSeedRepository } from "./_repository/session-seed.repository";

const authSeedRepository = {
  session: { ...sessionSeedRepository },
} as const;

export { authSeedRepository };
