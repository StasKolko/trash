import type { BanUserInput } from "#api/service/user/user.type";

import { createAuditLog } from "#api/service/audit/audit.repository";
import { authRepository } from "#api/service/auth/auth.repository";
import { userRepository } from "#api/service/user/user.repository";

const userService = {
  async banUser(input: BanUserInput) {
    await userRepository.update.setBanned({
      userId: input.targetUserId,
      isBanned: true,
    });

    const revokedCount = await authRepository.session.delete.allByUserId(
      input.targetUserId,
    );

    await createAuditLog({
      actorId: input.actorId,
      action: "user.ban",
      targetType: "user",
      targetId: input.targetUserId,
      metadata: {
        reason: input.reason ?? null,
        revokedSessionsCount: revokedCount,
      },
    });

    return { revokedCount };
  },

  async unbanUser(input: { actorId: string; targetUserId: string }) {
    await userRepository.update.setBanned({
      userId: input.targetUserId,
      isBanned: false,
    });

    await createAuditLog({
      actorId: input.actorId,
      action: "user.unban",
      targetType: "user",
      targetId: input.targetUserId,
      metadata: null,
    });
  },
} as const;

export { userService };
