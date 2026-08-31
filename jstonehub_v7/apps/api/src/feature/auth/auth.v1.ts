import { Elysia } from "elysia";

import { deleteAllSessionsRoute } from "./_route/delete-all-sessions.route";
import { deleteProviderRoute } from "./_route/delete-provider.route";
import { deleteSessionRoute } from "./_route/delete-session.route";
import { getCallbackGoogleRoute } from "./_route/get-callback-google.route";
import { getContextRoute } from "./_route/get-context.route";
import { getGoogleRoute } from "./_route/get-google.route";
import { getProvidersRoute } from "./_route/get-providers.route";
import { getSessionsRoute } from "./_route/get-sessions.route";
import { postExchangeRoute } from "./_route/post-exchange.route";
import { postLogoutRoute } from "./_route/post-logout.route";
import { postRefreshRoute } from "./_route/post-refresh.route";

const authV1 = new Elysia({ prefix: "/v1/auth" })
  .use(getContextRoute)
  .use(getSessionsRoute)
  .use(getProvidersRoute)
  .use(getGoogleRoute)
  .use(getCallbackGoogleRoute)
  .use(postExchangeRoute)
  .use(postRefreshRoute)
  .use(postLogoutRoute)
  .use(deleteSessionRoute)
  .use(deleteAllSessionsRoute)
  .use(deleteProviderRoute);

export { authV1 };
