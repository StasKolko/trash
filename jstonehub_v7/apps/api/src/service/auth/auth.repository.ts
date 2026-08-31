import { authAccountRepository } from "./_repository/auth-account.repository";
import { authLinkRequestRepository } from "./_repository/auth-link-request.repository";
import { sessionRepository } from "./_repository/session.repository";

const authRepository = {
  session: sessionRepository,
  account: authAccountRepository,
  linkRequest: authLinkRequestRepository,
} as const;

export { authRepository };
