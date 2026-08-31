import { Elysia } from "elysia";
import { getSynthesisProjectById } from "../data/repository";

const SSE_TIMEOUT = 2000;

export const synthesisSse = new Elysia({ prefix: "/events" }).get(
  "/:projectId",
  async function* ({ params: { projectId } }) {
    while (true) {
      // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER
      const project = await getSynthesisProjectById(projectId);
      if (!project) {
        break;
      }

      yield {
        event: "status",
        data: JSON.stringify({
          id: project.id,
          status: project.status,
          completedTasks: project.completedTasks,
          failedTasks: project.failedTasks,
          totalTasks: project.totalTasks,
        }),
      };

      if (["COMPLETED", "FAILED", "CANCELLED"].includes(project.status)) {
        break;
      }

      await new Promise((r) => setTimeout(r, SSE_TIMEOUT));
    }
  },
);
