import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { jokeTtsPipelinesTable } from "./joke-tts.table";

export type JokeTtsPipeline = InferSelectModel<typeof jokeTtsPipelinesTable>;
export type JokeTtsPipelineInsert = InferInsertModel<
  typeof jokeTtsPipelinesTable
>;
