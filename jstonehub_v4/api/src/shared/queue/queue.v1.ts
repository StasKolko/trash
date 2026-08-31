import type { PingJobData } from "@packages/contract/queue";

import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { addJob } from "./producer";

export const queueV1 = new Elysia({ prefix: "/v1/queue" }).post(
  "/ping",
  async ({ set }) => {
    const data: PingJobData = {
      message: "ping from API",
      timestamp: Date.now(),
    };

    const jobId = await addJob({
      queue: "ping",
      name: "ping-test",
      data,
    });

    set.status = HTTP_STATUS.CREATED;
    return { jobId, queue: "ping", status: "queued" };
  },
);
