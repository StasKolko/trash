import { Elysia } from "elysia";

const healthcheckV1 = new Elysia().get("/live", () => ({
  status: "ok",
}));

export { healthcheckV1 };
