import { authSeedRepository } from "#api/service/auth/auth-seed.repository";

const authSeed = {
  createSessionsForUser(params: { userId: string; count: number }) {
    return authSeedRepository.session.createBulkForUser(params);
  },
} as const;

export { authSeed };
