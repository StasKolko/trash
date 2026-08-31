# Context: apps/api/src/features/secret-voicer

> Сгенерировано: 2026-03-02T19:49:02.939Z

---

## `apps/api/src/features/secret-voicer/credential/controller-v1.ts`

```typescript
import { Elysia, InternalServerError, NotFoundError, t } from "elysia";
import { spread } from "#api/shared/api/typebox-helpers";
import { HTTP_STATUS } from "#api/shared/config/http-status";
import {
  createSecretVoicerCredential,
  deleteSecretVoicerCredential,
  getAllSecretVoicerCredentials,
  getSecretVoicerCredentialById,
  updateSecretVoicerCredential,
} from "./repository";
import { secretVoicerCredentialTable } from "./table";
import type {
  NewSecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "./types";

const SecretVoicerCredentialDto = t.Object(
  spread(secretVoicerCredentialTable, "select"),
);
const CreateSecretVoicerCredentialDto = t.Object({
  name: t.String({ minLength: 3, maxLength: 100 }),
  fingerprintId: t.String({ minLength: 1 }),
  csrfToken: t.String({ minLength: 10 }),
  sessionId: t.String({ minLength: 10 }),
  isActive: t.Optional(t.Boolean({ default: true })),
});
const UpdateSecretVoicerCredentialDto = t.Partial(
  CreateSecretVoicerCredentialDto,
);

export const secretVoicerCredentialControllerV1 = new Elysia({
  prefix: "/credentials",
})
  .get("/", async () => getAllSecretVoicerCredentials(), {
    response: t.Array(SecretVoicerCredentialDto),
  })

  .get(
    "/:id",
    async ({ params: { id } }) => {
      const result = await getSecretVoicerCredentialById(id);
      if (!result) {
        throw new NotFoundError("Credential not found");
      }
      return result;
    },
    {
      response: SecretVoicerCredentialDto,
    },
  )

  .post(
    "/",
    async ({ body, set }) => {
      const result = await createSecretVoicerCredential(
        body as NewSecretVoicerCredential,
      );
      if (!result) {
        throw new InternalServerError("Failed to create credential");
      }
      set.status = HTTP_STATUS.CREATED;
      return result;
    },
    {
      body: CreateSecretVoicerCredentialDto,
      response: SecretVoicerCredentialDto,
    },
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const result = await updateSecretVoicerCredential(
        id,
        body as UpdateSecretVoicerCredential,
      );
      if (!result) {
        throw new NotFoundError("Credential not found");
      }
      return result;
    },
    {
      body: UpdateSecretVoicerCredentialDto,
      response: SecretVoicerCredentialDto,
    },
  )

  .delete(
    "/:id",
    async ({ params: { id } }) => {
      const result = await deleteSecretVoicerCredential(id);
      if (!result) {
        throw new NotFoundError("Credential not found");
      }
      return { success: true, id };
    },
    {
      response: t.Object({
        success: t.Boolean(),
        id: t.String(),
      }),
    },
  );
```

---

## `apps/api/src/features/secret-voicer/credential/repository.ts`

```typescript
import { eq } from "drizzle-orm";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "./table";
import type {
  NewSecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "./types";

export const createSecretVoicerCredential = async (
  data: NewSecretVoicerCredential,
) => {
  const [result] = await db
    .insert(secretVoicerCredentialTable)
    .values(data)
    .returning();
  return result;
};

export const getAllSecretVoicerCredentials = async () =>
  db.select().from(secretVoicerCredentialTable);

export const getSecretVoicerCredentialById = async (id: string) =>
  db.query.secretVoicerCredentialTable.findFirst({
    where: eq(secretVoicerCredentialTable.id, id),
  });

export const getSecretVoicerCredentialsByFingerprintId = async (
  fingerprintId: string,
) =>
  db
    .select()
    .from(secretVoicerCredentialTable)
    .where(eq(secretVoicerCredentialTable.fingerprintId, fingerprintId));

export const updateSecretVoicerCredential = async (
  id: string,
  data: UpdateSecretVoicerCredential,
) => {
  const [result] = await db
    .update(secretVoicerCredentialTable)
    .set(data)
    .where(eq(secretVoicerCredentialTable.id, id))
    .returning();
  return result;
};

export const deleteSecretVoicerCredential = async (id: string) => {
  const [result] = await db
    .delete(secretVoicerCredentialTable)
    .where(eq(secretVoicerCredentialTable.id, id))
    .returning();
  return result;
};
```

---

## `apps/api/src/features/secret-voicer/credential/table.ts`

```typescript
import { createId } from "@packages/utils/id";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { browserFingerprintTable } from "#api/features/browser-fingerprint/data/table";

export const secretVoicerCredentialTable = pgTable(
  "secret_voicer_credentials",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    fingerprintId: text("fingerprint_id")
      .references(() => browserFingerprintTable.id)
      .notNull(),
    name: text("name").notNull(),

    csrfToken: text("csrf_token").notNull(),
    sessionId: text("session_id").notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);
```

---

## `apps/api/src/features/secret-voicer/credential/types.ts`

```typescript
import type { secretVoicerCredentialTable } from "./table";

export type SecretVoicerCredential =
  typeof secretVoicerCredentialTable.$inferSelect;
export type NewSecretVoicerCredential =
  typeof secretVoicerCredentialTable.$inferInsert;
export type UpdateSecretVoicerCredential = Partial<
  Omit<NewSecretVoicerCredential, "id" | "createdAt" | "updatedAt">
>;
```

---

## `apps/api/src/features/secret-voicer/http/admin-v1.ts`

```typescript
import { Elysia } from "elysia";
import { secretVoicerCredentialControllerV1 } from "../credential/controller-v1";
import { synthesisControllerV1 } from "../synthesis";
import { secretVoicerVoiceAdminControllerV1 } from "../voice";

export const secretVoicerAdminControllerV1 = new Elysia({
  prefix: "/v1/admin/secret-voicer",
})
  .use(secretVoicerCredentialControllerV1)
  .use(secretVoicerVoiceAdminControllerV1)
  .use(synthesisControllerV1);
```

---

## `apps/api/src/features/secret-voicer/http/public-v1.ts`

```typescript
import { Elysia } from "elysia";
import { secretVoicerVoicePublicControllerV1 } from "../voice";

export const secretVoicerPublicControllerV1 = new Elysia({
  prefix: "/v1/public/secret-voicer",
}).use(secretVoicerVoicePublicControllerV1);
```

---

## `apps/api/src/features/secret-voicer/index.ts`

```typescript
export { secretVoicerCredentialTable } from "./credential/table";
export { secretVoicerAdminControllerV1 } from "./http/admin-v1";
export { secretVoicerPublicControllerV1 } from "./http/public-v1";
export {
  synthesisControllerV1,
  synthesisProjectStatusEnum,
  synthesisProjectTable,
  synthesisTaskStatusEnum,
  synthesisTaskTable,
} from "./synthesis";
export {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
  syncVoicesFromExternalApi,
  voiceEmotionSupportEnum,
  voiceGenderEnum,
  voiceSyncEventTypeEnum,
  voiceSyncState,
} from "./voice";
```

---

## `apps/api/src/features/secret-voicer/services/external-api.ts`

```typescript
import type {
  CreateTaskResponse,
  SynthesizePayload,
  TaskStatusResponse,
  VoiceRequestConfig,
} from "./types";

const BASE_URL = "https://secret-voicer.ru/api";

export class SecretVoicerExternalService {
  private getHeaders(config: VoiceRequestConfig) {
    // Очистка токенов от пробелов и переносов строк при копировании
    const csrf = config.csrfToken.trim();
    const session = config.sessionId.trim();

    return {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,ru;q=0.8",
      "content-type": "application/json",
      // Формируем cookie строго
      cookie: `csrftoken=${csrf}; sessionid=${session}`,
      origin: "https://secret-voicer.ru",
      referer: "https://secret-voicer.ru/app/",
      "sec-ch-ua": config.secChUa,
      "sec-ch-ua-mobile": config.secChUaMobile,
      // Убедимся, что кавычки в платформе корректны (они должны быть в базе, но на всякий случай)
      "sec-ch-ua-platform": config.secChUaPlatform,
      "user-agent": config.userAgent,
      "x-csrftoken": csrf,
    };
  }

  public async createTask(
    config: VoiceRequestConfig,
    payload: SynthesizePayload,
  ): Promise<CreateTaskResponse> {
    const body = {
      model_id: "eleven_multilingual_v2",
      provider: "default",
      rate: payload.rate ?? 1,
      similarity_boost: 0.75,
      stability: 0.5,
      style: 0,
      text: payload.text,
      voice_id: payload.voice_id,
    };

    try {
      const response = await fetch(`${BASE_URL}/synthesize/`, {
        method: "POST",
        headers: this.getHeaders(config),
        body: JSON.stringify(body),
        // ВАЖНО: Не следовать за редиректами. Если сессия мертва, сервер вернет 302, а не 404 html
        redirect: "manual",
      });

      const redirectStatus = 300;
      const maxRedirectStatus = 400;
      // Обработка потери авторизации (Редирект на логин)
      if (
        response.status >= redirectStatus
        && response.status < maxRedirectStatus
      ) {
        throw new Error(
          `Auth Failed (Redirected with status ${response.status}). Check Session ID/CSRF.`,
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        // Если вернулся HTML (например 404 страница сайта), значит мы стучимся не туда или нас отшили
        if (
          errorText.trim().startsWith("<html")
          || errorText.trim().startsWith("<!DOCTYPE")
        ) {
          throw new Error(
            `External API Error (${response.status}): Probably Invalid Credentials or Blocked Request.`,
          );
        }
      }

      return (await response.json()) as CreateTaskResponse;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Network/Fetch Error: ${e.message}`);
      }
      throw e;
    }
  }

  public async checkTaskStatus(
    config: VoiceRequestConfig,
    taskId: string,
  ): Promise<TaskStatusResponse> {
    const response = await fetch(`${BASE_URL}/task/${taskId}/`, {
      method: "GET",
      headers: this.getHeaders(config),
      redirect: "manual", // Также отключаем редиректы здесь
    });

    const maxRedirects = 300;
    const redirectCount = 400;
    if (response.status >= maxRedirects && response.status < redirectCount) {
      throw new Error(
        `Auth Failed (Redirected ${response.status}) during Status Check.`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("<html")) {
        throw new Error(
          `Invalid Status Check Response (HTML). Status: ${response.status}`,
        );
      }
      const maxLength = 100;
      throw new Error(
        `Check Status Error (${response.status}): ${errorText.substring(0, maxLength)}`,
      );
    }

    return (await response.json()) as TaskStatusResponse;
  }

  public async downloadAudio(
    config: VoiceRequestConfig,
    audioPath: string,
  ): Promise<ArrayBuffer> {
    const url = `https://secret-voicer.ru${audioPath}`;
    const response = await fetch(url, {
      headers: this.getHeaders(config),
      redirect: "manual",
    });

    if (!response.ok) {
      throw new Error(`Download Error (${response.status})`);
    }

    return await response.arrayBuffer();
  }
}

export const externalApiService = new SecretVoicerExternalService();
```

---

## `apps/api/src/features/secret-voicer/services/synthesis-processor.ts`

```typescript
// import fs from "node:fs/promises";
// import path from "node:path";
// import process from "node:process";
// import { write } from "bun";
// import { and, asc, eq, lt } from "drizzle-orm";
// import { browserFingerprintsTable } from "#api/features/browser-fingerprint/data/table";
// import { secretVoicerCredentialsTable } from "#api/features/secret-voicer/schemas/credentials-table";
// import {
//   secretVoicerSynthesisProjects,
//   secretVoicerSynthesisTasks,
// } from "#api/features/secret-voicer/schemas/synthesis-projects";
// import { db } from "#api/shared/db";
// import { externalApiService } from "./external-api";
// import type { VoiceRequestConfig } from "./types";

// const STORAGE_ROOT = "storage";
// const MAX_RETRIES = 3;
// const POLLING_INTERVAL = 3000;
// const MAX_WAIT_TIME = 300_000; // 5 минут

// export class SynthesisProcessor {
//   public async processProject(projectId: string, retryFailed = false) {
//     console.log(`🔄 [Processor] Starting project: ${projectId}`);

//     await this.cleanupStaleTasks(projectId);

//     const project = await db.query.secretVoicerSynthesisProjects.findFirst({
//       where: eq(secretVoicerSynthesisProjects.id, projectId),
//     });

//     if (!project?.fingerprintId) {
//       console.error(`❌ [Processor] Project ${projectId} missing fingerprint`);
//       await this.failProject(projectId, "Missing fingerprint configuration");
//       return;
//     }

//     const credential = await db.query.secretVoicerCredentialsTable.findFirst({
//       where: and(
//         eq(secretVoicerCredentialsTable.fingerprintId, project.fingerprintId),
//         eq(secretVoicerCredentialsTable.isActive, true),
//       ),
//     });

//     const fingerprint = await db.query.browserFingerprintsTable.findFirst({
//       where: eq(browserFingerprintsTable.id, project.fingerprintId),
//     });

//     if (!(credential && fingerprint)) {
//       const msg = `Missing active credentials or fingerprint for Project ${projectId}`;
//       console.error(`❌ [Processor] ${msg}`);
//       await this.failProject(projectId, msg);
//       return;
//     }

//     console.log(
//       `✅ [Processor] Using Credential: ${credential.name} | FP: ${fingerprint.name}`,
//     );

//     const config: VoiceRequestConfig = {
//       csrfToken: credential.csrfToken,
//       sessionId: credential.sessionId,
//       userAgent: fingerprint.userAgent,
//       secChUa: fingerprint.secChUa,
//       secChUaMobile: fingerprint.secChUaMobile,
//       secChUaPlatform: fingerprint.secChUaPlatform,
//     };

//     const allTasks = await db
//       .select()
//       .from(secretVoicerSynthesisTasks)
//       .where(eq(secretVoicerSynthesisTasks.projectId, projectId))
//       .orderBy(asc(secretVoicerSynthesisTasks.orderIndex));

//     const tasksToProcess = allTasks.filter((t) => {
//       if (t.status === "PENDING") {
//         return true;
//       }
//       if (retryFailed && t.status === "FAILED") {
//         return true;
//       }
//       if (t.status === "FAILED" && (t.retryCount || 0) < MAX_RETRIES) {
//         return true;
//       }
//       return false;
//     });

//     console.log(
//       `📊 [Processor] Found ${tasksToProcess.length} tasks to process`,
//     );

//     if (tasksToProcess.length === 0) {
//       await this.updateProjectStats(projectId);
//       return;
//     }

//     await Promise.allSettled(
//       tasksToProcess.map((task) =>
//         this.processSingleTask(task, config, project),
//       ),
//     );

//     await this.updateProjectStats(projectId);
//     console.log(`🏁 [Processor] Finished cycle for project: ${projectId}`);
//   }

//   private async processSingleTask(
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//     config: VoiceRequestConfig,
//     project: typeof secretVoicerSynthesisProjects.$inferSelect,
//   ) {
//     try {
//       console.log(`⏳ [Task ${task.orderIndex}] Processing...`);
//       await this.markTaskAsProcessing(task.id);

//       const metadata = task.metadata as { rate?: number } | null;
//       const rate = metadata?.rate ?? 1;

//       const { task_id } = await externalApiService.createTask(config, {
//         text: task.text,
//         voice_id: task.voiceId,
//         rate,
//       });
//       const externalTaskId = String(task_id);
//       console.log(`➡ [Task ${task.orderIndex}] External ID: ${externalTaskId}`);

//       await db
//         .update(secretVoicerSynthesisTasks)
//         .set({ externalTaskId })
//         .where(eq(secretVoicerSynthesisTasks.id, task.id));

//       const audioUrl = await this.pollForCompletion(config, externalTaskId);
//       console.log(`⬇ [Task ${task.orderIndex}] Downloading audio...`);

//       const localFilePath = await this.downloadAndSaveAudio(
//         config,
//         audioUrl,
//         project,
//         task,
//       );

//       await this.markTaskAsCompleted(task.id, audioUrl, localFilePath);
//       console.log(
//         `✅ [Task ${task.orderIndex}] Completed! Saved to: ${localFilePath}`,
//       );
//     } catch (e) {
//       console.error(`❌ [Task ${task.orderIndex}] Failed:`, e);
//       await this.handleTaskFailure(task, e);
//     }
//   }

//   private async pollForCompletion(
//     config: VoiceRequestConfig,
//     externalTaskId: string,
//   ): Promise<string> {
//     const startTime = Date.now();

//     while (Date.now() - startTime <= MAX_WAIT_TIME) {
//       // biome-ignore lint/performance/noAwaitInLoops: рефакторинг позже
//       const status = await externalApiService.checkTaskStatus(
//         config,
//         externalTaskId,
//       );

//       if (status.status_code === "COMPLETED" && status.audio_url) {
//         return status.audio_url;
//       }

//       if (status.status_code === "FAILED" || status.error) {
//         throw new Error(
//           status.error
//             || `External task failed with status: ${status.status_code}`,
//         );
//       }

//       await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
//     }

//     throw new Error("Polling timeout (5 minutes)");
//   }

//   private async downloadAndSaveAudio(
//     config: VoiceRequestConfig,
//     audioUrl: string,
//     project: typeof secretVoicerSynthesisProjects.$inferSelect,
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//   ) {
//     const buffer = await externalApiService.downloadAudio(config, audioUrl);

//     const maxPrefixLengthSafeName = 50;
//     const safeName = project.name
//       .replace(/[^a-z0-9а-яё\s_-]/gi, "")
//       .trim()
//       .replace(/\s+/g, "_")
//       .slice(0, maxPrefixLengthSafeName);

//     const maxPrefixLengthPrefixId = 5;
//     const prefixId = project.id.slice(0, maxPrefixLengthPrefixId);
//     const folderName = `${safeName}-${prefixId}`;

//     const folderPath = path.join(process.cwd(), STORAGE_ROOT, folderName);
//     const fileName = `${task.orderIndex}.mp3`;
//     const fullPath = path.join(folderPath, fileName);

//     await fs.mkdir(folderPath, { recursive: true });
//     await write(fullPath, buffer);

//     return fullPath;
//   }

//   private async cleanupStaleTasks(projectId: string) {
//     const fiveMinutesAgo = new Date(Date.now() - MAX_WAIT_TIME);
//     const staleTasks = await db
//       .select()
//       .from(secretVoicerSynthesisTasks)
//       .where(
//         and(
//           eq(secretVoicerSynthesisTasks.projectId, projectId),
//           eq(secretVoicerSynthesisTasks.status, "PROCESSING"),
//           lt(secretVoicerSynthesisTasks.startedAt, fiveMinutesAgo),
//         ),
//       );

//     if (staleTasks.length > 0) {
//       console.warn(
//         `⚠ [Processor] Found ${staleTasks.length} stale tasks. Marking as failed.`,
//       );
//     }

//     for (const task of staleTasks) {
//       // biome-ignore lint/performance/noAwaitInLoops: рефакторинг позже
//       await this.handleTaskFailure(
//         task,
//         new Error("Timeout (5 minutes stale)"),
//       );
//     }
//   }

//   private async markTaskAsProcessing(taskId: string) {
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "PROCESSING",
//         startedAt: new Date(),
//         error: null,
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, taskId));
//   }

//   private async markTaskAsCompleted(
//     taskId: string,
//     audioUrl: string,
//     localFilePath: string,
//   ) {
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "COMPLETED",
//         statusCode: "COMPLETED",
//         audioUrl,
//         localFilePath,
//         updatedAt: new Date(),
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, taskId));
//   }

//   private async handleTaskFailure(
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//     error: unknown,
//   ) {
//     const msg = error instanceof Error ? error.message : String(error);
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "FAILED",
//         error: msg,
//         retryCount: (task.retryCount || 0) + 1,
//         updatedAt: new Date(),
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, task.id));
//   }

//   private async updateProjectStats(projectId: string) {
//     const tasks = await db
//       .select({ status: secretVoicerSynthesisTasks.status })
//       .from(secretVoicerSynthesisTasks)
//       .where(eq(secretVoicerSynthesisTasks.projectId, projectId));

//     const total = tasks.length;
//     const completed = tasks.filter((t) => t.status === "COMPLETED").length;
//     const failed = tasks.filter((t) => t.status === "FAILED").length;
//     const processing = tasks.filter((t) => t.status === "PROCESSING").length;

//     let newStatus:
//       | "PENDING"
//       | "PROCESSING"
//       | "COMPLETED"
//       | "FAILED"
//       | "PARTIAL";

//     if (processing > 0) {
//       newStatus = "PROCESSING";
//     } else if (failed === total) {
//       newStatus = "FAILED";
//     } else if (completed === total) {
//       newStatus = "COMPLETED";
//     } else if (completed > 0) {
//       newStatus = "PARTIAL";
//     } else if (failed > 0) {
//       newStatus = "FAILED";
//     } else {
//       newStatus = "PENDING";
//     }

//     await db
//       .update(secretVoicerSynthesisProjects)
//       .set({
//         status: newStatus,
//         totalTasks: total,
//         completedTasks: completed,
//         failedTasks: failed,
//         completedAt: newStatus === "COMPLETED" ? new Date() : null,
//       })
//       .where(eq(secretVoicerSynthesisProjects.id, projectId));
//   }

//   private async failProject(projectId: string, error: string) {
//     await db
//       .update(secretVoicerSynthesisProjects)
//       .set({ status: "FAILED", description: error })
//       .where(eq(secretVoicerSynthesisProjects.id, projectId));
//   }
// }

// export const synthesisProcessor = new SynthesisProcessor();
```

---

## `apps/api/src/features/secret-voicer/services/types.ts`

```typescript
export type VoiceRequestConfig = {
  csrfToken: string;
  sessionId: string;
  userAgent: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
};

export type SynthesizePayload = {
  voice_id: string;
  text: string;
  rate?: number; // 0.5 - 2.0, default 1
};

export type TaskStatusResponse = {
  status: string;
  status_code: "LOCAL_PROCESSING" | "COMPLETED" | "FAILED";
  audio_url: string | null;
  error: string | null;
  chunks_completed?: number;
  chunks_total?: number;
};

export type CreateTaskResponse = {
  task_id: number;
  status: string;
  is_reused: boolean;
};
```

---

## `apps/api/src/features/secret-voicer/synthesis/data/repository.ts`

```typescript
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "#api/shared/db";
import { synthesisProjectTable, synthesisTaskTable } from "./table";
import type {
  NewSynthesisProject,
  NewSynthesisTask,
  ProjectStatus,
  SynthesisProject,
  SynthesisTask,
  TaskStatus,
  UpdateSynthesisProject,
  UpdateSynthesisTask,
} from "./types";

// === Projects ===

export async function createSynthesisProject(
  data: NewSynthesisProject,
): Promise<SynthesisProject> {
  const [result] = await db
    .insert(synthesisProjectTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create project");
  }
  return result;
}

export function getAllSynthesisProjects(): Promise<SynthesisProject[]> {
  return db
    .select()
    .from(synthesisProjectTable)
    .orderBy(sql`${synthesisProjectTable.createdAt} DESC`);
}

export function getSynthesisProjectById(
  id: string,
): Promise<SynthesisProject | undefined> {
  return db.query.synthesisProjectTable.findFirst({
    where: eq(synthesisProjectTable.id, id),
  });
}

export async function updateSynthesisProject(
  id: string,
  data: UpdateSynthesisProject,
): Promise<SynthesisProject | undefined> {
  const [result] = await db
    .update(synthesisProjectTable)
    .set(data)
    .where(eq(synthesisProjectTable.id, id))
    .returning();
  return result;
}

export async function deleteSynthesisProject(
  id: string,
): Promise<SynthesisProject | undefined> {
  const [result] = await db
    .delete(synthesisProjectTable)
    .where(eq(synthesisProjectTable.id, id))
    .returning();
  return result;
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<void> {
  const updates: UpdateSynthesisProject = { status };

  if (status === "PROCESSING") {
    updates.startedAt = new Date();
  } else if (
    status === "COMPLETED"
    || status === "FAILED"
    || status === "PARTIAL"
  ) {
    updates.completedAt = new Date();
  }

  await db
    .update(synthesisProjectTable)
    .set(updates)
    .where(eq(synthesisProjectTable.id, id));
}

export async function updateProjectStats(id: string): Promise<void> {
  const tasks = await db
    .select({ status: synthesisTaskTable.status })
    .from(synthesisTaskTable)
    .where(eq(synthesisTaskTable.projectId, id));

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const failed = tasks.filter((t) => t.status === "FAILED").length;

  let status: ProjectStatus;
  if (completed === total) {
    status = "COMPLETED";
  } else if (failed === total) {
    status = "FAILED";
  } else if (completed > 0 || failed > 0) {
    status = tasks.some((t) => t.status === "PROCESSING")
      ? "PROCESSING"
      : "PARTIAL";
  } else if (tasks.some((t) => t.status === "PROCESSING")) {
    status = "PROCESSING";
  } else {
    status = "PENDING";
  }

  await db
    .update(synthesisProjectTable)
    .set({
      totalTasks: total,
      completedTasks: completed,
      failedTasks: failed,
      status,
      completedAt:
        status === "COMPLETED" || status === "FAILED" || status === "PARTIAL"
          ? new Date()
          : null,
    })
    .where(eq(synthesisProjectTable.id, id));
}

// === Tasks ===

export function createSynthesisTasks(
  tasks: NewSynthesisTask[],
): Promise<SynthesisTask[]> {
  if (tasks.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(synthesisTaskTable).values(tasks).returning();
}

export function getSynthesisTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(eq(synthesisTaskTable.projectId, projectId))
    .orderBy(synthesisTaskTable.orderIndex);
}

export function getSynthesisTaskById(
  id: string,
): Promise<SynthesisTask | undefined> {
  return db.query.synthesisTaskTable.findFirst({
    where: eq(synthesisTaskTable.id, id),
  });
}

export async function updateSynthesisTask(
  id: string,
  data: UpdateSynthesisTask,
): Promise<SynthesisTask | undefined> {
  const [result] = await db
    .update(synthesisTaskTable)
    .set(data)
    .where(eq(synthesisTaskTable.id, id))
    .returning();
  return result;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  error?: string,
): Promise<void> {
  const updates: UpdateSynthesisTask = { status, error: error ?? null };

  if (status === "PROCESSING") {
    updates.startedAt = new Date();
  } else if (status === "COMPLETED" || status === "FAILED") {
    updates.completedAt = new Date();
  }

  await db
    .update(synthesisTaskTable)
    .set(updates)
    .where(eq(synthesisTaskTable.id, id));
}

export async function incrementTaskRetryCount(id: string): Promise<number> {
  const [result] = await db
    .update(synthesisTaskTable)
    .set({
      retryCount: sql`${synthesisTaskTable.retryCount} + 1`,
    })
    .where(eq(synthesisTaskTable.id, id))
    .returning({ retryCount: synthesisTaskTable.retryCount });
  return result?.retryCount ?? 0;
}

export function getFailedTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        eq(synthesisTaskTable.status, "FAILED"),
      ),
    );
}

export function getPendingTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        inArray(synthesisTaskTable.status, ["PENDING", "FAILED"]),
      ),
    );
}

export async function resetTasksForRetry(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) {
    return;
  }

  await db
    .update(synthesisTaskTable)
    .set({
      status: "PENDING",
      error: null,
      startedAt: null,
      completedAt: null,
    })
    .where(inArray(synthesisTaskTable.id, taskIds));
}

export async function resetAllProjectTasks(projectId: string): Promise<void> {
  await db
    .update(synthesisTaskTable)
    .set({
      status: "PENDING",
      error: null,
      retryCount: 0,
      externalTaskId: null,
      externalStatus: null,
      audioUrl: null,
      localFilePath: null,
      startedAt: null,
      completedAt: null,
    })
    .where(eq(synthesisTaskTable.projectId, projectId));
}

export async function cancelPendingTasks(projectId: string): Promise<void> {
  await db
    .update(synthesisTaskTable)
    .set({ status: "CANCELLED" })
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        inArray(synthesisTaskTable.status, ["PENDING"]),
      ),
    );
}
```

---

## `apps/api/src/features/secret-voicer/synthesis/data/table.ts`

```typescript
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { createId } from "@packages/utils/id";
import {
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// === Enums (из контракта) ===

export const synthesisProjectStatusEnum = pgEnum(
  "synthesis_project_status",
  secretVoicerContract.synthesisProjectStatus.values() as [string, ...string[]],
);

export const synthesisTaskStatusEnum = pgEnum(
  "synthesis_task_status",
  secretVoicerContract.synthesisTaskStatus.values() as [string, ...string[]],
);

// === Projects Table ===

export const synthesisProjectTable = pgTable("synthesis_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  name: text("name").notNull(),
  status: synthesisProjectStatusEnum("status").default("PENDING").notNull(),

  // Stats
  totalTasks: integer("total_tasks").default(0).notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  failedTasks: integer("failed_tasks").default(0).notNull(),

  // Storage
  storagePath: text("storage_path"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// === Tasks Table ===

export const synthesisTaskTable = pgTable("synthesis_tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  projectId: text("project_id")
    .references(() => synthesisProjectTable.id, { onDelete: "cascade" })
    .notNull(),

  orderIndex: integer("order_index").notNull(),

  // Input
  text: text("text").notNull(),
  voiceId: text("voice_id").notNull(),
  rate: real("rate").default(1).notNull(),

  // Status
  status: synthesisTaskStatusEnum("status").default("PENDING").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  error: text("error"),

  // External API
  externalTaskId: text("external_task_id"),
  externalStatus: text("external_status"),

  // Output
  audioUrl: text("audio_url"),
  localFilePath: text("local_file_path"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

---

## `apps/api/src/features/secret-voicer/synthesis/data/types.ts`

```typescript
import type { synthesisProjectTable, synthesisTaskTable } from "./table";

// === Database Types ===

export type SynthesisProject = typeof synthesisProjectTable.$inferSelect;
export type NewSynthesisProject = typeof synthesisProjectTable.$inferInsert;
export type UpdateSynthesisProject = Partial<
  Omit<NewSynthesisProject, "id" | "createdAt">
>;

export type SynthesisTask = typeof synthesisTaskTable.$inferSelect;
export type NewSynthesisTask = typeof synthesisTaskTable.$inferInsert;
export type UpdateSynthesisTask = Partial<
  Omit<NewSynthesisTask, "id" | "projectId" | "createdAt">
>;

// === API Input Types ===

export type CreateProjectTaskInput = {
  text: string;
  voiceId: string;
  rate?: number;
};

export type CreateProjectInput = {
  name: string;
  tasks: CreateProjectTaskInput[];
};

// === Status Types ===

export type ProjectStatus = SynthesisProject["status"];
export type TaskStatus = SynthesisTask["status"];

// === Response Types ===

export type ProjectWithTasks = SynthesisProject & {
  tasks: SynthesisTask[];
};

export type ProjectStatusResponse = {
  id: string;
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  progress: number; // 0-100
};
```

---

## `apps/api/src/features/secret-voicer/synthesis/http/controller-v1.ts`

```typescript
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import { zipSync } from "fflate";
import { HTTP_STATUS } from "#api/shared/config/http-status";
import { getSecretVoicerVoiceByExternalVoiceId } from "../../voice/data/repository";
import {
  cancelPendingTasks,
  createSynthesisProject,
  createSynthesisTasks,
  deleteSynthesisProject,
  getAllSynthesisProjects,
  getFailedTasksByProjectId,
  getSynthesisProjectById,
  getSynthesisTaskById,
  getSynthesisTasksByProjectId,
  resetAllProjectTasks,
  resetTasksForRetry,
  updateSynthesisProject,
} from "../data/repository";
import type { CreateProjectInput, NewSynthesisTask } from "../data/types";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import { calculateProgress, validateRate } from "../lib/helpers";
import {
  cancelProject,
  isProjectProcessing,
  pauseProject,
  startProjectProcessing,
} from "../services/processor";
import {
  deleteProjectFolder,
  getProjectFiles,
  readProjectFile,
} from "../services/storage";

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const TaskInputDto = t.Object({
  text: t.String({ minLength: 1, maxLength: 5000 }),
  voiceId: t.String({ minLength: 1 }),
  rate: t.Optional(t.Number({ minimum: 0.5, maximum: 2.0 })),
});

const CreateProjectDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  tasks: t.Array(TaskInputDto, { minItems: 1 }),
});

const ProjectDto = t.Object({
  id: t.String(),
  name: t.String(),
  status: t.String(),
  totalTasks: t.Number(),
  completedTasks: t.Number(),
  failedTasks: t.Number(),
  storagePath: Nullable(t.String()),
  createdAt: t.Date(),
  startedAt: Nullable(t.Date()),
  completedAt: Nullable(t.Date()),
  updatedAt: t.Date(),
});

const TaskDto = t.Object({
  id: t.String(),
  projectId: t.String(),
  orderIndex: t.Number(),
  text: t.String(),
  voiceId: t.String(),
  rate: t.Number(),
  status: t.String(),
  retryCount: t.Number(),
  error: Nullable(t.String()),
  externalTaskId: Nullable(t.String()),
  audioUrl: Nullable(t.String()),
  localFilePath: Nullable(t.String()),
  createdAt: t.Date(),
  startedAt: Nullable(t.Date()),
  completedAt: Nullable(t.Date()),
  updatedAt: t.Date(),
});

const ProjectStatusDto = t.Object({
  id: t.String(),
  status: t.String(),
  totalTasks: t.Number(),
  completedTasks: t.Number(),
  failedTasks: t.Number(),
  progress: t.Number(),
  isProcessing: t.Boolean(),
});

function handleBackgroundError(error: unknown): void {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.error("[Synthesis] Background processing failed:", error);
}

export const synthesisControllerV1 = new Elysia({ prefix: "/synthesis" })
  .post(
    "/projects",
    async ({ body, set }) => {
      const input = body as CreateProjectInput;

      const voiceIds = [...new Set(input.tasks.map((t) => t.voiceId))];

      const voiceValidationResults = await Promise.all(
        voiceIds.map(async (voiceId) => ({
          voiceId,
          exists: Boolean(await getSecretVoicerVoiceByExternalVoiceId(voiceId)),
        })),
      );

      const invalidVoices = voiceValidationResults
        .filter((result) => !result.exists)
        .map((result) => result.voiceId);

      if (invalidVoices.length > 0) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return {
          error: "Invalid voice IDs",
          invalidVoices,
        };
      }

      const project = await createSynthesisProject({
        name: input.name,
        status: "PENDING",
        totalTasks: input.tasks.length,
      });

      const tasksToCreate: NewSynthesisTask[] = input.tasks.map(
        (task, index) => ({
          projectId: project.id,
          orderIndex: index + 1,
          text: task.text,
          voiceId: task.voiceId,
          rate: validateRate(task.rate),
          status: "PENDING",
        }),
      );

      const tasks = await createSynthesisTasks(tasksToCreate);

      set.status = HTTP_STATUS.CREATED;
      return { project, tasks };
    },
    {
      body: CreateProjectDto,
    },
  )

  .get(
    "/projects",
    () => {
      return getAllSynthesisProjects();
    },
    {
      response: t.Array(ProjectDto),
    },
  )

  .get("/projects/:id", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const tasks = await getSynthesisTasksByProjectId(id);
    return { ...project, tasks };
  })

  .delete("/projects/:id", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.storagePath) {
      await deleteProjectFolder(project.storagePath);
    }

    await deleteSynthesisProject(id);

    return { success: true, id };
  })

  .get(
    "/projects/:id/status",
    async ({ params: { id } }) => {
      const project = await getSynthesisProjectById(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return {
        id: project.id,
        status: project.status,
        totalTasks: project.totalTasks,
        completedTasks: project.completedTasks,
        failedTasks: project.failedTasks,
        progress: calculateProgress(project.completedTasks, project.totalTasks),
        isProcessing: isProjectProcessing(id),
      };
    },
    {
      response: ProjectStatusDto,
    },
  )

  .post("/projects/:id/start", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    startProjectProcessing(id).catch(handleBackgroundError);

    return { success: true, message: "Processing started" };
  })

  .post("/projects/:id/pause", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await pauseProject(id);
    return { success: true, message: "Project paused" };
  })

  .post("/projects/:id/cancel", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await cancelProject(id);
    await cancelPendingTasks(id);
    return { success: true, message: "Project cancelled" };
  })

  .post("/projects/:id/retryFailed", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const failedTasks = await getFailedTasksByProjectId(id);
    if (failedTasks.length === 0) {
      return { success: true, message: "No failed tasks to retry", count: 0 };
    }

    await resetTasksForRetry(failedTasks.map((t) => t.id));
    await updateSynthesisProject(id, { status: "PENDING" });

    startProjectProcessing(id).catch(handleBackgroundError);

    return {
      success: true,
      message: `Retrying ${failedTasks.length} failed tasks`,
      count: failedTasks.length,
    };
  })

  .post("/projects/:id/restart", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.storagePath) {
      await deleteProjectFolder(project.storagePath);
    }

    await resetAllProjectTasks(id);
    await updateSynthesisProject(id, {
      status: "PENDING",
      storagePath: null,
      completedTasks: 0,
      failedTasks: 0,
      startedAt: null,
      completedAt: null,
    });

    startProjectProcessing(id).catch(handleBackgroundError);

    return { success: true, message: "Project restarted" };
  })

  .get(
    "/projects/:id/tasks",
    async ({ params: { id } }) => {
      const project = await getSynthesisProjectById(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return getSynthesisTasksByProjectId(id);
    },
    {
      response: t.Array(TaskDto),
    },
  )

  .post("/tasks/:taskId/retry", async ({ params: { taskId } }) => {
    const task = await getSynthesisTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    await resetTasksForRetry([taskId]);
    startProjectProcessing(task.projectId).catch(handleBackgroundError);

    return { success: true, message: "Task retry started" };
  })

  .get("/projects/:id/download", async ({ params: { id }, set }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (!project.storagePath) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files to download" };
    }

    const files = await getProjectFiles(project.storagePath);
    if (files.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files to download" };
    }

    const fileEntries = await Promise.all(
      files.map(async (filename) => {
        const fileBuffer = await readProjectFile(
          project.storagePath ?? "",
          filename,
        );
        return [filename, new Uint8Array(fileBuffer)] as const;
      }),
    );

    const zipData: Record<string, Uint8Array> = Object.fromEntries(fileEntries);

    const ZipCompressionLevel = 9;
    const zipped = zipSync(zipData, { level: ZipCompressionLevel });
    const zipBuffer = Buffer.from(zipped);

    const maxPrefixLengthSafeName = 50;
    const safeFilename =
      project.name
        .replace(/[^\w\s\u0400-\u04FF-]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, maxPrefixLengthSafeName) || "project";

    set.headers["content-type"] = "application/zip";
    set.headers["content-disposition"] =
      `attachment; filename*=UTF-8''${encodeURIComponent(safeFilename)}.zip`;

    return zipBuffer;
  })
  .get("/tasks/:taskId/download", async ({ params: { taskId }, set }) => {
    const task = await getSynthesisTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (task.status !== "COMPLETED" || !task.localFilePath) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Task is not completed" };
    }

    const project = await getSynthesisProjectById(task.projectId);
    if (!project?.storagePath) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Project storage not found" };
    }

    const filePath = join(
      SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
      project.storagePath,
      task.localFilePath,
    );

    try {
      const fileBuffer = await readFile(filePath);
      set.headers["content-type"] = "audio/mpeg";
      set.headers["content-disposition"] =
        `attachment; filename="${task.orderIndex}.mp3"`;
      return fileBuffer;
    } catch {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "File not found" };
    }
  })

  // Добавить endpoint для получения аудио URL (для прослушивания)
  .get("/tasks/:taskId/audio-url", async ({ params: { taskId } }) => {
    const task = await getSynthesisTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (task.status !== "COMPLETED" || !task.localFilePath) {
      return { url: null };
    }

    const project = await getSynthesisProjectById(task.projectId);
    if (!project?.storagePath) {
      return { url: null };
    }

    return {
      url: `/api/v1/admin/secret-voicer/synthesis/tasks/${taskId}/download`,
    };
  });
```

---

## `apps/api/src/features/secret-voicer/synthesis/http/sse.ts`

```typescript
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
```

---

## `apps/api/src/features/secret-voicer/synthesis/index.ts`

```typescript
export {
  synthesisProjectStatusEnum,
  synthesisProjectTable,
  synthesisTaskStatusEnum,
  synthesisTaskTable,
} from "./data/table";

export { synthesisControllerV1 } from "./http/controller-v1";

export { startProjectProcessing } from "./services/processor";
```

---

## `apps/api/src/features/secret-voicer/synthesis/lib/constants.ts`

```typescript
export const SYNTHESIS_CONSTANTS = {
  // Timeouts
  TASK_TIMEOUT_MS: 180_000, // 3 minutes per task
  POLLING_INTERVAL_MS: 3000, // 3 seconds

  // Retries
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000, // 5 seconds between retries

  // Rate limiting (for future)
  MAX_REQUESTS_PER_MINUTE: 1000, // Very high, effectively unlimited
  MAX_REQUESTS_PER_DAY: 100_000,
  REQUEST_DELAY_MS: 0, // No delay by default

  // Storage
  PROJECT_NAME_MAX_LENGTH: 40,
  PROJECT_ID_PREFIX_LENGTH: 8,
  STORAGE_BASE_PATH: "storage/secret-voicer/projects",

  // File naming
  FILE_EXTENSION: ".mp3",

  // Validation
  MIN_RATE: 0.5,
  MAX_RATE: 2.0,
  DEFAULT_RATE: 1.0,
  MIN_TEXT_LENGTH: 1,
  MAX_TEXT_LENGTH: 5000,
} as const;
```

---

## `apps/api/src/features/secret-voicer/synthesis/lib/helpers.ts`

```typescript
import path from "node:path";
import { SYNTHESIS_CONSTANTS } from "./constants";

export function generateStorageFolderName(
  projectName: string,
  projectId: string,
): string {
  const safeName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, SYNTHESIS_CONSTANTS.PROJECT_NAME_MAX_LENGTH);

  const idPrefix = projectId.slice(
    0,
    SYNTHESIS_CONSTANTS.PROJECT_ID_PREFIX_LENGTH,
  );

  return `${safeName}_${idPrefix}`;
}

export function getProjectStoragePath(folderName: string): string {
  return path.join(SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH, folderName);
}

export function generateTaskFilename(
  orderIndex: number,
  totalTasks: number,
): string {
  const digits = String(totalTasks).length;
  const paddedIndex = String(orderIndex).padStart(digits, "0");
  return `${paddedIndex}${SYNTHESIS_CONSTANTS.FILE_EXTENSION}`;
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  const maxProgress = 100;
  return Math.round((completed / total) * maxProgress);
}

export function validateRate(rate: number | undefined): number {
  if (rate === undefined) {
    return SYNTHESIS_CONSTANTS.DEFAULT_RATE;
  }
  return Math.max(
    SYNTHESIS_CONSTANTS.MIN_RATE,
    Math.min(SYNTHESIS_CONSTANTS.MAX_RATE, rate),
  );
}
```

---

## `apps/api/src/features/secret-voicer/synthesis/services/processor.ts`

```typescript
import { and, eq } from "drizzle-orm";
import { browserFingerprintTable } from "#api/features/browser-fingerprint";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "../../credential/table";
import { externalApiService } from "../../services/external-api";
import type { VoiceRequestConfig } from "../../services/types";
import {
  getSynthesisProjectById,
  getSynthesisTasksByProjectId,
  incrementTaskRetryCount,
  updateProjectStats,
  updateSynthesisProject,
  updateSynthesisTask,
  updateTaskStatus,
} from "../data/repository";
import type { SynthesisProject, SynthesisTask } from "../data/types";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import { createProjectFolder, saveTaskAudio } from "./storage";

type ProcessingState = {
  isRunning: boolean;
  activeProjects: Set<string>;
};

const state: ProcessingState = {
  isRunning: false,
  activeProjects: new Set(),
};

async function getActiveCredential(): Promise<VoiceRequestConfig | null> {
  const result = await db
    .select({
      csrfToken: secretVoicerCredentialTable.csrfToken,
      sessionId: secretVoicerCredentialTable.sessionId,
      userAgent: browserFingerprintTable.userAgent,
      secChUa: browserFingerprintTable.secChUa,
      secChUaMobile: browserFingerprintTable.secChUaMobile,
      secChUaPlatform: browserFingerprintTable.secChUaPlatform,
    })
    .from(secretVoicerCredentialTable)
    .innerJoin(
      browserFingerprintTable,
      eq(secretVoicerCredentialTable.fingerprintId, browserFingerprintTable.id),
    )
    .where(
      and(
        eq(secretVoicerCredentialTable.isActive, true),
        eq(browserFingerprintTable.isActive, true),
      ),
    )
    .limit(1);

  const cred = result[0];
  if (!cred) {
    return null;
  }

  return {
    csrfToken: cred.csrfToken.trim(),
    sessionId: cred.sessionId.trim(),
    userAgent: cred.userAgent,
    secChUa: cred.secChUa,
    secChUaMobile: cred.secChUaMobile,
    secChUaPlatform: cred.secChUaPlatform,
  };
}

async function pollForCompletion(
  config: VoiceRequestConfig,
  externalTaskId: string,
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < SYNTHESIS_CONSTANTS.TASK_TIMEOUT_MS) {
    // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER polling requires sequential checks
    const status = await externalApiService.checkTaskStatus(
      config,
      externalTaskId,
    );

    if (status.status_code === "COMPLETED" && status.audio_url) {
      return status.audio_url;
    }

    if (status.status_code === "FAILED" || status.error) {
      throw new Error(
        status.error ?? `External task failed: ${status.status_code}`,
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, SYNTHESIS_CONSTANTS.POLLING_INTERVAL_MS),
    );
  }

  throw new Error("Task timeout (3 minutes)");
}

async function processTask(
  task: SynthesisTask,
  project: SynthesisProject,
  config: VoiceRequestConfig,
  totalTasks: number,
): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `⏳ [Synthesis] Processing task ${task.orderIndex}/${totalTasks}`,
  );

  try {
    await updateTaskStatus(task.id, "PROCESSING");

    const { task_id } = await externalApiService.createTask(config, {
      text: task.text,
      voice_id: task.voiceId,
      rate: task.rate,
    });

    const externalTaskId = String(task_id);

    await updateSynthesisTask(task.id, { externalTaskId });

    const audioUrl = await pollForCompletion(config, externalTaskId);

    const audioBuffer = await externalApiService.downloadAudio(
      config,
      audioUrl,
    );

    const filename = await saveTaskAudio(
      project.storagePath ?? "",
      task.orderIndex,
      totalTasks,
      audioBuffer,
    );

    await updateSynthesisTask(task.id, {
      status: "COMPLETED",
      audioUrl,
      localFilePath: filename,
      completedAt: new Date(),
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `✅ [Synthesis] Task ${task.orderIndex} completed: ${filename}`,
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [Synthesis] Task ${task.orderIndex} failed:`, errorMsg);

    const retryCount = await incrementTaskRetryCount(task.id);

    if (retryCount < SYNTHESIS_CONSTANTS.MAX_RETRIES) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔄 [Synthesis] Task ${task.orderIndex} will retry (${retryCount}/${SYNTHESIS_CONSTANTS.MAX_RETRIES})`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, SYNTHESIS_CONSTANTS.RETRY_DELAY_MS),
      );

      await processTask(task, project, config, totalTasks);
    } else {
      await updateTaskStatus(task.id, "FAILED", errorMsg);
    }
  }
}

export async function startProjectProcessing(projectId: string): Promise<void> {
  if (state.activeProjects.has(projectId)) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`⚠️ [Synthesis] Project ${projectId} is already processing`);
    return;
  }

  const project = await getSynthesisProjectById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.status === "CANCELLED" || project.status === "PAUSED") {
    throw new Error(`Project is ${project.status.toLowerCase()}`);
  }

  const config = await getActiveCredential();
  if (!config) {
    throw new Error("No active credentials available");
  }

  state.activeProjects.add(projectId);

  try {
    if (!project.storagePath) {
      const folderName = await createProjectFolder(project.name, project.id);
      await updateSynthesisProject(project.id, { storagePath: folderName });
      project.storagePath = folderName;
    }

    await updateSynthesisProject(project.id, {
      status: "PROCESSING",
      startedAt: new Date(),
    });

    const tasks = await getSynthesisTasksByProjectId(projectId);
    const pendingTasks = tasks.filter(
      (t) => t.status === "PENDING" || t.status === "FAILED",
    );

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `🚀 [Synthesis] Starting project "${project.name}" with ${pendingTasks.length} tasks`,
    );

    await Promise.all(
      pendingTasks.map((task) =>
        processTask(task, project, config, tasks.length),
      ),
    );

    await updateProjectStats(projectId);

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🏁 [Synthesis] Project "${project.name}" processing complete`);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [Synthesis] Project ${projectId} failed:`, error);
    await updateProjectStats(projectId);
  } finally {
    state.activeProjects.delete(projectId);
  }
}

export async function pauseProject(projectId: string): Promise<void> {
  await updateSynthesisProject(projectId, { status: "PAUSED" });
}

export async function cancelProject(projectId: string): Promise<void> {
  await updateSynthesisProject(projectId, { status: "CANCELLED" });
  state.activeProjects.delete(projectId);
}

export function isProjectProcessing(projectId: string): boolean {
  return state.activeProjects.has(projectId);
}
```

---

## `apps/api/src/features/secret-voicer/synthesis/services/storage.ts`

```typescript
import fs from "node:fs/promises";
import path from "node:path";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import {
  generateStorageFolderName,
  generateTaskFilename,
  getProjectStoragePath,
} from "../lib/helpers";

export async function createProjectFolder(
  projectName: string,
  projectId: string,
): Promise<string> {
  const folderName = generateStorageFolderName(projectName, projectId);
  const folderPath = getProjectStoragePath(folderName);

  await fs.mkdir(folderPath, { recursive: true });

  return folderName;
}

export async function saveTaskAudio(
  storagePath: string,
  orderIndex: number,
  totalTasks: number,
  audioBuffer: ArrayBuffer,
): Promise<string> {
  const filename = generateTaskFilename(orderIndex, totalTasks);
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
    filename,
  );

  await fs.writeFile(fullPath, Buffer.from(audioBuffer));

  return filename;
}

export async function deleteProjectFolder(storagePath: string): Promise<void> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    await fs.rm(fullPath, { recursive: true, force: true });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn(`[Storage] Could not delete folder: ${fullPath}`, error);
  }
}

export async function getProjectFiles(storagePath: string): Promise<string[]> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    const files = await fs.readdir(fullPath);
    return files.filter((f) => f.endsWith(SYNTHESIS_CONSTANTS.FILE_EXTENSION));
  } catch {
    return [];
  }
}

export function readProjectFile(
  storagePath: string,
  filename: string,
): Promise<Buffer> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
    filename,
  );
  return fs.readFile(fullPath);
}

export async function projectFolderExists(
  storagePath: string,
): Promise<boolean> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
```

---

## `apps/api/src/features/secret-voicer/synthesis/types.ts`

```typescript
export type {
  CreateProjectInput,
  CreateProjectTaskInput,
  ProjectStatus,
  ProjectStatusResponse,
  ProjectWithTasks,
  SynthesisProject,
  SynthesisTask,
  TaskStatus,
} from "./data/types";
```

---

## `apps/api/src/features/secret-voicer/voice/data/repository.ts`

```typescript
import { eq, inArray, lt, notInArray } from "drizzle-orm";
import { db } from "#api/shared/db";
import {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
} from "./table";
import type {
  NewSecretVoicerVoice,
  NewSecretVoicerVoiceSyncEvent,
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
  UpdateSecretVoicerVoice,
} from "./types";

// === Constants ===

const SYNC_STATE_ID = "main";

// === Voice Repository ===

export function getAllSecretVoicerVoices(): Promise<SecretVoicerVoice[]> {
  return db.select().from(secretVoicerVoiceTable);
}

export function getPublicSecretVoicerVoices(): Promise<SecretVoicerVoice[]> {
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(eq(secretVoicerVoiceTable.isHidden, false));
}

export function getSecretVoicerVoiceById(
  id: string,
): Promise<SecretVoicerVoice | undefined> {
  return db.query.secretVoicerVoiceTable.findFirst({
    where: eq(secretVoicerVoiceTable.id, id),
  });
}

export function getSecretVoicerVoiceByExternalVoiceId(
  externalVoiceId: string,
): Promise<SecretVoicerVoice | undefined> {
  return db.query.secretVoicerVoiceTable.findFirst({
    where: eq(secretVoicerVoiceTable.externalVoiceId, externalVoiceId),
  });
}

export function getSecretVoicerVoicesByExternalVoiceIds(
  externalVoiceIds: string[],
): Promise<SecretVoicerVoice[]> {
  if (externalVoiceIds.length === 0) {
    return Promise.resolve([]);
  }
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(inArray(secretVoicerVoiceTable.externalVoiceId, externalVoiceIds));
}

export function getSecretVoicerVoicesNotInExternalIds(
  externalVoiceIds: string[],
): Promise<SecretVoicerVoice[]> {
  if (externalVoiceIds.length === 0) {
    return db.select().from(secretVoicerVoiceTable);
  }
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(
      notInArray(secretVoicerVoiceTable.externalVoiceId, externalVoiceIds),
    );
}

export async function createSecretVoicerVoice(
  data: NewSecretVoicerVoice,
): Promise<SecretVoicerVoice> {
  const [result] = await db
    .insert(secretVoicerVoiceTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create voice");
  }
  return result;
}

export function createSecretVoicerVoices(
  data: NewSecretVoicerVoice[],
): Promise<SecretVoicerVoice[]> {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(secretVoicerVoiceTable).values(data).returning();
}

export async function updateSecretVoicerVoice(
  id: string,
  data: UpdateSecretVoicerVoice,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .update(secretVoicerVoiceTable)
    .set(data)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

export async function updateSecretVoicerVoiceExternalFields(
  id: string,
  data: Partial<NewSecretVoicerVoice>,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .update(secretVoicerVoiceTable)
    .set(data)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

export async function deleteSecretVoicerVoice(
  id: string,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .delete(secretVoicerVoiceTable)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

// === Sync Event Repository ===

export function getAllSecretVoicerVoiceSyncEvents(): Promise<
  SecretVoicerVoiceSyncEvent[]
> {
  return db.select().from(secretVoicerVoiceSyncEventTable);
}

export async function createSecretVoicerVoiceSyncEvent(
  data: NewSecretVoicerVoiceSyncEvent,
): Promise<SecretVoicerVoiceSyncEvent> {
  const [result] = await db
    .insert(secretVoicerVoiceSyncEventTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create sync event");
  }
  return result;
}

export function createSecretVoicerVoiceSyncEvents(
  data: NewSecretVoicerVoiceSyncEvent[],
): Promise<SecretVoicerVoiceSyncEvent[]> {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(secretVoicerVoiceSyncEventTable).values(data).returning();
}

export async function deleteSecretVoicerVoiceSyncEvent(
  id: string,
): Promise<SecretVoicerVoiceSyncEvent | undefined> {
  const [result] = await db
    .delete(secretVoicerVoiceSyncEventTable)
    .where(eq(secretVoicerVoiceSyncEventTable.id, id))
    .returning();
  return result;
}

export async function deleteAllSecretVoicerVoiceSyncEvents(): Promise<number> {
  const result = await db.delete(secretVoicerVoiceSyncEventTable).returning();
  return result.length;
}

export async function deleteOldSecretVoicerVoiceSyncEvents(
  olderThan: Date,
): Promise<number> {
  const result = await db
    .delete(secretVoicerVoiceSyncEventTable)
    .where(lt(secretVoicerVoiceSyncEventTable.createdAt, olderThan))
    .returning();
  return result.length;
}

// === Sync State Repository ===

export async function getSecretVoicerVoiceSyncState(): Promise<SecretVoicerVoiceSyncState | null> {
  const result = await db.query.secretVoicerVoiceSyncStateTable.findFirst({
    where: eq(secretVoicerVoiceSyncStateTable.id, SYNC_STATE_ID),
  });
  return result ?? null;
}

export async function upsertSecretVoicerVoiceSyncState(
  data: Partial<SecretVoicerVoiceSyncState>,
): Promise<SecretVoicerVoiceSyncState> {
  const existing = await getSecretVoicerVoiceSyncState();

  if (existing) {
    const [result] = await db
      .update(secretVoicerVoiceSyncStateTable)
      .set(data)
      .where(eq(secretVoicerVoiceSyncStateTable.id, SYNC_STATE_ID))
      .returning();
    if (!result) {
      throw new Error("Failed to update sync state");
    }
    return result;
  }

  const [result] = await db
    .insert(secretVoicerVoiceSyncStateTable)
    .values({ id: SYNC_STATE_ID, ...data })
    .returning();
  if (!result) {
    throw new Error("Failed to create sync state");
  }
  return result;
}

export async function setSecretVoicerVoiceSyncBlocked(
  blocked: boolean,
  reason?: string,
): Promise<void> {
  await upsertSecretVoicerVoiceSyncState({
    isBlocked: blocked,
    blockReason: blocked ? reason : null,
    blockedAt: blocked ? new Date() : null,
  });
}
```

---

## `apps/api/src/features/secret-voicer/voice/data/table.ts`

```typescript
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { createId } from "@packages/utils/id";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { VOICE_RATING_DEFAULT } from "../lib/constants";

export const voiceGenderEnum = pgEnum(
  "voice_gender",
  secretVoicerContract.voiceGender.values() as [string, ...string[]],
);

export const voiceEmotionSupportEnum = pgEnum(
  "voice_emotion_support",
  secretVoicerContract.voiceEmotionSupport.values() as [string, ...string[]],
);

export const voiceSyncEventTypeEnum = pgEnum(
  "voice_sync_event_type",
  secretVoicerContract.voiceSyncEventType.values() as [string, ...string[]],
);

export const secretVoicerVoiceTable = pgTable("secret_voicer_voices", {
  // === Internal ===
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  // === External fields (from API, read-only) ===
  externalId: integer("external_id").notNull(),
  externalVoiceId: text("external_voice_id").notNull().unique(),
  externalName: text("external_name").notNull(),
  externalDescription: text("external_description"),
  externalGender: voiceGenderEnum("external_gender").notNull(),
  externalLocale: text("external_locale"),
  externalPreviewUrl: text("external_preview_url"),
  externalPreviewUrlEmotional: text("external_preview_url_emotional"),
  externalAvatarUrl: text("external_avatar_url"),
  externalAccent: text("external_accent"),
  externalAgeGroup: text("external_age_group"),
  externalIsMultilingual: boolean("external_is_multilingual").default(false),
  externalStyleTags: jsonb("external_style_tags").$type<string[]>().default([]),
  externalUseCases: jsonb("external_use_cases").$type<string[]>().default([]),

  // === Custom fields (editable) ===
  emotionSupport: voiceEmotionSupportEnum("emotion_support")
    .default("none")
    .notNull(),
  testedLanguages: jsonb("tested_languages").$type<string[]>().default([]),
  rating: integer("rating").default(VOICE_RATING_DEFAULT).notNull(),
  notes: text("notes"),
  isHidden: boolean("is_hidden").default(false).notNull(),

  // === Timestamps ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// === Sync Events Table (changelog) ===

export const secretVoicerVoiceSyncEventTable = pgTable(
  "secret_voicer_voice_sync_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    eventType: voiceSyncEventTypeEnum("event_type").notNull(),
    isCritical: boolean("is_critical").default(false).notNull(),

    // Voice reference (may be null if voice was deleted)
    voiceId: text("voice_id"),
    externalVoiceId: text("external_voice_id"),
    voiceName: text("voice_name"),

    // Change details
    changedFields: jsonb("changed_fields").$type<string[]>(),
    oldValues: jsonb("old_values").$type<Record<string, unknown>>(),
    newValues: jsonb("new_values").$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

// === Sync State Table (singleton) ===

export const secretVoicerVoiceSyncStateTable = pgTable(
  "secret_voicer_voice_sync_state",
  {
    id: text("id").primaryKey().default("main").notNull(),

    isBlocked: boolean("is_blocked").default(false).notNull(),
    blockReason: text("block_reason"),
    blockedAt: timestamp("blocked_at"),

    lastSyncAt: timestamp("last_sync_at"),
    lastSyncSuccess: boolean("last_sync_success"),
    lastSyncError: text("last_sync_error"),

    // Stats from last sync
    lastSyncStats: jsonb("last_sync_stats").$type<{
      totalVoices: number;
      added: number;
      removed: number;
      updated: number;
      unchanged: number;
    }>(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);
```

---

## `apps/api/src/features/secret-voicer/voice/data/types.ts`

```typescript
import type {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
} from "./table";

// === Voice ===

export type SecretVoicerVoice = typeof secretVoicerVoiceTable.$inferSelect;
export type NewSecretVoicerVoice = typeof secretVoicerVoiceTable.$inferInsert;
export type UpdateSecretVoicerVoice = Partial<
  Pick<
    NewSecretVoicerVoice,
    "emotionSupport" | "testedLanguages" | "rating" | "notes" | "isHidden"
  >
>;

// === Sync Event ===

export type SecretVoicerVoiceSyncEvent =
  typeof secretVoicerVoiceSyncEventTable.$inferSelect;
export type NewSecretVoicerVoiceSyncEvent =
  typeof secretVoicerVoiceSyncEventTable.$inferInsert;

// === Sync State ===

export type SecretVoicerVoiceSyncState =
  typeof secretVoicerVoiceSyncStateTable.$inferSelect;

// === External API Response ===

export type ExternalVoice = {
  id: number;
  voice_id: string;
  name: string;
  gender: "MALE" | "FEMALE";
  locale: string | null;
  is_multilingual: boolean;
  preview_url: string | null;
  preview_url_emotional: string | null;
  usage_count: number;
  avatar_url: string | null;
  description: string | null;
  accent: string | null;
  age_group: string | null;
  voice_style_tags: string[];
  use_cases: string[];
};

export type ExternalVoicesResponse = {
  grouped_voices: {
    category: string;
    voices: ExternalVoice[];
  }[];
};
```

---

## `apps/api/src/features/secret-voicer/voice/http/controller-admin-v1.ts`

```typescript
import { type TSchema, Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import {
  deleteAllSecretVoicerVoiceSyncEvents,
  deleteSecretVoicerVoiceSyncEvent,
  getAllSecretVoicerVoiceSyncEvents,
  getAllSecretVoicerVoices,
  getSecretVoicerVoiceById,
  updateSecretVoicerVoice,
} from "../data/repository";
import { VOICE_RATING_MAX, VOICE_RATING_MIN } from "../lib/constants";
import { syncVoicesFromExternalApi } from "../services/sync-service";
import { voiceSyncState } from "../services/sync-state";

const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()]);

const VoiceDto = t.Object({
  id: t.String(),
  externalId: t.Number(),
  externalVoiceId: t.String(),
  externalName: t.String(),
  externalDescription: Nullable(t.String()),
  externalGender: t.String(),
  externalLocale: Nullable(t.String()),
  externalPreviewUrl: Nullable(t.String()),
  externalPreviewUrlEmotional: Nullable(t.String()),
  externalAvatarUrl: Nullable(t.String()),
  externalAccent: Nullable(t.String()),
  externalAgeGroup: Nullable(t.String()),
  externalIsMultilingual: Nullable(t.Boolean()),
  externalStyleTags: Nullable(t.Array(t.String())),
  externalUseCases: Nullable(t.Array(t.String())),
  emotionSupport: t.String(),
  testedLanguages: Nullable(t.Array(t.String())),
  rating: t.Number(),
  notes: Nullable(t.String()),
  isHidden: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

const UpdateVoiceDto = t.Object({
  emotionSupport: t.Optional(t.String()),
  testedLanguages: t.Optional(t.Array(t.String())),
  rating: t.Optional(
    t.Number({ minimum: VOICE_RATING_MIN, maximum: VOICE_RATING_MAX }),
  ),
  notes: t.Optional(Nullable(t.String())),
  isHidden: t.Optional(t.Boolean()),
});

const SyncEventDto = t.Object({
  id: t.String(),
  eventType: t.String(),
  isCritical: t.Boolean(),
  voiceId: Nullable(t.String()),
  externalVoiceId: Nullable(t.String()),
  voiceName: Nullable(t.String()),
  changedFields: Nullable(t.Array(t.String())),
  oldValues: Nullable(t.Record(t.String(), t.Unknown())),
  newValues: Nullable(t.Record(t.String(), t.Unknown())),
  createdAt: t.Date(),
});

const SyncStateDto = t.Object({
  isBlocked: t.Boolean(),
  blockReason: Nullable(t.String()),
  blockedAt: Nullable(t.Date()),
  lastSyncAt: Nullable(t.Date()),
  lastSyncSuccess: Nullable(t.Boolean()),
  lastSyncError: Nullable(t.String()),
  lastSyncStats: Nullable(
    t.Object({
      totalVoices: t.Number(),
      added: t.Number(),
      removed: t.Number(),
      updated: t.Number(),
      unchanged: t.Number(),
    }),
  ),
});

export const secretVoicerVoiceAdminControllerV1 = new Elysia({
  prefix: "/voices",
})
  .get("/", () => getAllSecretVoicerVoices(), {
    response: t.Array(VoiceDto),
  })

  .get(
    "/:id",
    async ({ params: { id } }) => {
      const voice = await getSecretVoicerVoiceById(id);
      if (!voice) {
        throw new NotFoundError("Voice not found");
      }
      return voice;
    },
    { response: VoiceDto },
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const voice = await updateSecretVoicerVoice(id, body);
      if (!voice) {
        throw new NotFoundError("Voice not found");
      }
      return voice;
    },
    {
      body: UpdateVoiceDto,
      response: VoiceDto,
    },
  )

  .get("/sync-events", () => getAllSecretVoicerVoiceSyncEvents(), {
    response: t.Array(SyncEventDto),
  })

  .delete(
    "/sync-events/:id",
    async ({ params: { id } }) => {
      const event = await deleteSecretVoicerVoiceSyncEvent(id);
      if (!event) {
        throw new NotFoundError("Sync event not found");
      }
      return { success: true, id };
    },
    {
      response: t.Object({ success: t.Boolean(), id: t.String() }),
    },
  )

  .delete(
    "/sync-events",
    async () => {
      const count = await deleteAllSecretVoicerVoiceSyncEvents();
      return { success: true, deletedCount: count };
    },
    {
      response: t.Object({ success: t.Boolean(), deletedCount: t.Number() }),
    },
  )

  .get(
    "/sync-state",
    async () => {
      const state = await voiceSyncState.getState();
      return (
        state ?? {
          isBlocked: false,
          blockReason: null,
          blockedAt: null,
          lastSyncAt: null,
          lastSyncSuccess: null,
          lastSyncError: null,
          lastSyncStats: null,
        }
      );
    },
    {
      response: SyncStateDto,
    },
  )

  .post(
    "/sync-state/unblock",
    async () => {
      await voiceSyncState.unblock();
      return { success: true };
    },
    {
      response: t.Object({ success: t.Boolean() }),
    },
  )

  // === Manual Sync Trigger ===
  .post("/sync", () => syncVoicesFromExternalApi(), {
    response: t.Object({
      success: t.Boolean(),
      stats: t.Object({
        totalVoices: t.Number(),
        added: t.Number(),
        removed: t.Number(),
        updated: t.Number(),
        unchanged: t.Number(),
      }),
      error: t.Optional(t.String()),
      hasCriticalChanges: t.Boolean(),
    }),
  });
```

---

## `apps/api/src/features/secret-voicer/voice/http/controller-public-v1.ts`

```typescript
import { Type as t } from "@sinclair/typebox";
import { Elysia } from "elysia";
import { getPublicSecretVoicerVoices } from "../data/repository";

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const PublicVoiceDto = t.Object({
  id: t.String(),
  externalVoiceId: t.String(),
  name: t.String(),
  gender: t.String(),
  locale: Nullable(t.String()),
  accent: Nullable(t.String()),
  ageGroup: Nullable(t.String()),
  isMultilingual: t.Boolean(),
  styleTags: t.Array(t.String()),
  useCases: t.Array(t.String()),
  previewUrl: Nullable(t.String()),
  // Custom fields
  emotionSupport: t.String(),
  testedLanguages: t.Array(t.String()),
  rating: t.Number(),
});

export const secretVoicerVoicePublicControllerV1 = new Elysia({
  prefix: "/voices",
}).get(
  "/",
  async () => {
    const voices = await getPublicSecretVoicerVoices();

    return voices.map((v) => ({
      id: v.id,
      externalVoiceId: v.externalVoiceId,
      name: v.externalName,
      gender: v.externalGender,
      locale: v.externalLocale,
      accent: v.externalAccent,
      ageGroup: v.externalAgeGroup,
      isMultilingual: v.externalIsMultilingual ?? false,
      styleTags: v.externalStyleTags ?? [],
      useCases: v.externalUseCases ?? [],
      previewUrl: v.externalPreviewUrl,
      emotionSupport: v.emotionSupport,
      testedLanguages: v.testedLanguages ?? [],
      rating: v.rating,
    }));
  },
  {
    response: t.Array(PublicVoiceDto),
  },
);
```

---

## `apps/api/src/features/secret-voicer/voice/index.ts`

```typescript
export {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
  voiceEmotionSupportEnum,
  voiceGenderEnum,
  voiceSyncEventTypeEnum,
} from "./data/table";
export { secretVoicerVoiceAdminControllerV1 } from "./http/controller-admin-v1";
export { secretVoicerVoicePublicControllerV1 } from "./http/controller-public-v1";

export { syncVoicesFromExternalApi } from "./services/sync-service";
export { voiceSyncState } from "./services/sync-state";
```

---

## `apps/api/src/features/secret-voicer/voice/lib/constants.ts`

```typescript
// apps/api/src/features/secret-voicer/voice/lib/constants.ts

export const VOICE_SYNC_INTERVAL_HOURS = 5;
export const VOICE_SYNC_CRON = `0 */${VOICE_SYNC_INTERVAL_HOURS} * * *`;

export const VOICE_SYNC_LOG_RETENTION_DAYS = 7;

export const EXTERNAL_VOICES_API_URL = "https://secret-voicer.ru/api/voices/";

// Fields that should NOT trigger changelog (too noisy)
export const IGNORED_EXTERNAL_FIELDS = ["usage_count"] as const;

// Fields that are critical - if changed/removed, block synthesis
export const CRITICAL_EXTERNAL_FIELDS = ["voice_id"] as const;

export const VOICE_RATING_MIN = 1;
export const VOICE_RATING_MAX = 10;
export const VOICE_RATING_DEFAULT = 5;

// Development mode - use mock data if external API fails or no credentials
export const USE_MOCK_DATA_ON_ERROR = true;
```

---

## `apps/api/src/features/secret-voicer/voice/lib/helpers.ts`

```typescript
import type {
  ExternalVoice,
  NewSecretVoicerVoice,
  SecretVoicerVoice,
} from "../data/types";
import { IGNORED_EXTERNAL_FIELDS } from "./constants";

// === Private Helpers ===

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a === null && b === null) {
    return true;
  }
  if (a === undefined && b === undefined) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  return String(a) === String(b);
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => String(val) === String(sortedB[i]));
}

function fieldToExternalName(field: string): string | null {
  const mapping: Record<string, string> = {
    externalId: "id",
    externalVoiceId: "voice_id",
    externalName: "name",
    externalDescription: "description",
    externalGender: "gender",
    externalLocale: "locale",
    externalPreviewUrl: "preview_url",
    externalPreviewUrlEmotional: "preview_url_emotional",
    externalAvatarUrl: "avatar_url",
    externalAccent: "accent",
    externalAgeGroup: "age_group",
    externalIsMultilingual: "is_multilingual",
    externalStyleTags: "voice_style_tags",
    externalUseCases: "use_cases",
  };
  return mapping[field] ?? null;
}

// === Public Exports ===

/**
 * Maps external API voice to our database format
 */
export function mapExternalVoiceToDb(
  voice: ExternalVoice,
): Omit<NewSecretVoicerVoice, "id"> {
  return {
    externalId: voice.id,
    externalVoiceId: voice.voice_id,
    externalName: voice.name,
    externalDescription: voice.description,
    externalGender: voice.gender,
    externalLocale: voice.locale,
    externalPreviewUrl: voice.preview_url,
    externalPreviewUrlEmotional: voice.preview_url_emotional,
    externalAvatarUrl: voice.avatar_url,
    externalAccent: voice.accent,
    externalAgeGroup: voice.age_group,
    externalIsMultilingual: voice.is_multilingual,
    externalStyleTags: voice.voice_style_tags ?? [],
    externalUseCases: voice.use_cases ?? [],
  };
}

/**
 * Compares external fields and returns changed field names
 */
export function getChangedExternalFields(
  existing: SecretVoicerVoice,
  incoming: ExternalVoice,
): string[] {
  const changes: string[] = [];

  const comparisons: [string, unknown, unknown][] = [
    ["externalId", existing.externalId, incoming.id],
    ["externalName", existing.externalName, incoming.name],
    ["externalDescription", existing.externalDescription, incoming.description],
    ["externalGender", existing.externalGender, incoming.gender],
    ["externalLocale", existing.externalLocale, incoming.locale],
    ["externalPreviewUrl", existing.externalPreviewUrl, incoming.preview_url],
    [
      "externalPreviewUrlEmotional",
      existing.externalPreviewUrlEmotional,
      incoming.preview_url_emotional,
    ],
    ["externalAvatarUrl", existing.externalAvatarUrl, incoming.avatar_url],
    ["externalAccent", existing.externalAccent, incoming.accent],
    ["externalAgeGroup", existing.externalAgeGroup, incoming.age_group],
    [
      "externalIsMultilingual",
      existing.externalIsMultilingual,
      incoming.is_multilingual,
    ],
  ];

  for (const [field, oldVal, newVal] of comparisons) {
    // Skip ignored fields
    const externalFieldName = fieldToExternalName(field);
    if (
      externalFieldName
      && IGNORED_EXTERNAL_FIELDS.includes(
        externalFieldName as (typeof IGNORED_EXTERNAL_FIELDS)[number],
      )
    ) {
      continue;
    }

    if (!isEqual(oldVal, newVal)) {
      changes.push(field);
    }
  }

  // Compare arrays
  if (
    !arraysEqual(
      existing.externalStyleTags ?? [],
      incoming.voice_style_tags ?? [],
    )
  ) {
    changes.push("externalStyleTags");
  }

  if (!arraysEqual(existing.externalUseCases ?? [], incoming.use_cases ?? [])) {
    changes.push("externalUseCases");
  }

  return changes;
}

/**
 * Extract old values for changed fields
 */
export function extractOldValues(
  voice: SecretVoicerVoice,
  fields: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = voice[field as keyof SecretVoicerVoice];
  }
  return result;
}

/**
 * Extract new values for changed fields from external voice
 */
export function extractNewValuesFromExternal(
  voice: ExternalVoice,
  fields: string[],
): Record<string, unknown> {
  const mapped = mapExternalVoiceToDb(voice);
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = mapped[field as keyof typeof mapped];
  }
  return result;
}
```

---

## `apps/api/src/features/secret-voicer/voice/lib/mock-data.ts`

```typescript
// apps/api/src/features/secret-voicer/voice/lib/mock-data.ts

import type { ExternalVoice } from "../data/types";

export const MOCK_VOICES: ExternalVoice[] = [
  {
    id: 1,
    voice_id: "mock-voice-adam",
    name: "Adam (Mock)",
    gender: "MALE",
    locale: "en-US",
    is_multilingual: true,
    preview_url: null,
    preview_url_emotional: null,
    usage_count: 1000,
    avatar_url: null,
    description: "A warm and friendly male voice",
    accent: "American",
    age_group: "young-adult",
    voice_style_tags: ["friendly", "warm", "conversational"],
    use_cases: ["narration", "podcasts", "audiobooks"],
  },
  {
    id: 2,
    voice_id: "mock-voice-bella",
    name: "Bella (Mock)",
    gender: "FEMALE",
    locale: "en-US",
    is_multilingual: true,
    preview_url: null,
    preview_url_emotional: null,
    usage_count: 800,
    avatar_url: null,
    description: "A bright and energetic female voice",
    accent: "American",
    age_group: "young-adult",
    voice_style_tags: ["energetic", "bright", "upbeat"],
    use_cases: ["commercials", "explainers", "social-media"],
  },
  {
    id: 3,
    voice_id: "mock-voice-charlie",
    name: "Charlie (Mock)",
    gender: "MALE",
    locale: "en-GB",
    is_multilingual: false,
    preview_url: null,
    preview_url_emotional: null,
    usage_count: 500,
    avatar_url: null,
    description: "A deep and authoritative British voice",
    accent: "British",
    age_group: "middle-aged",
    voice_style_tags: ["authoritative", "deep", "professional"],
    use_cases: ["documentaries", "corporate", "training"],
  },
];
```

---

## `apps/api/src/features/secret-voicer/voice/services/sync-service.ts`

```typescript
import { and, eq } from "drizzle-orm";
import { browserFingerprintTable } from "#api/features/browser-fingerprint";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "../../credential/table";
import {
  createSecretVoicerVoiceSyncEvents,
  createSecretVoicerVoices,
  deleteOldSecretVoicerVoiceSyncEvents,
  getSecretVoicerVoicesByExternalVoiceIds,
  getSecretVoicerVoicesNotInExternalIds,
  updateSecretVoicerVoiceExternalFields,
  upsertSecretVoicerVoiceSyncState,
} from "../data/repository";
import type {
  ExternalVoice,
  ExternalVoicesResponse,
  NewSecretVoicerVoiceSyncEvent,
} from "../data/types";
import {
  EXTERNAL_VOICES_API_URL,
  USE_MOCK_DATA_ON_ERROR,
  VOICE_SYNC_LOG_RETENTION_DAYS,
} from "../lib/constants";
import {
  extractNewValuesFromExternal,
  extractOldValues,
  getChangedExternalFields,
  mapExternalVoiceToDb,
} from "../lib/helpers";
import { MOCK_VOICES } from "../lib/mock-data";
import { voiceSyncState } from "./sync-state";

const REDIRECT_STATUS_MIN = 300;
const REDIRECT_STATUS_MAX = 400;

type SyncStats = {
  totalVoices: number;
  added: number;
  removed: number;
  updated: number;
  unchanged: number;
};

type SyncResult = {
  success: boolean;
  stats: SyncStats;
  error?: string;
  hasCriticalChanges: boolean;
  usedMockData?: boolean;
};

type VoiceUpdate = {
  id: string;
  data: ReturnType<typeof mapExternalVoiceToDb>;
};

type AuthHeaders = {
  cookie: string;
  "x-csrftoken": string;
  "user-agent": string;
  "sec-ch-ua": string;
  "sec-ch-ua-mobile": string;
  "sec-ch-ua-platform": string;
};

async function getActiveCredentialWithFingerprint(): Promise<AuthHeaders | null> {
  const result = await db
    .select({
      csrfToken: secretVoicerCredentialTable.csrfToken,
      sessionId: secretVoicerCredentialTable.sessionId,
      userAgent: browserFingerprintTable.userAgent,
      secChUa: browserFingerprintTable.secChUa,
      secChUaMobile: browserFingerprintTable.secChUaMobile,
      secChUaPlatform: browserFingerprintTable.secChUaPlatform,
    })
    .from(secretVoicerCredentialTable)
    .innerJoin(
      browserFingerprintTable,
      eq(secretVoicerCredentialTable.fingerprintId, browserFingerprintTable.id),
    )
    .where(
      and(
        eq(secretVoicerCredentialTable.isActive, true),
        eq(browserFingerprintTable.isActive, true),
      ),
    )
    .limit(1);

  const cred = result[0];

  if (!cred) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] No active credentials found");
    return null;
  }

  const csrf = cred.csrfToken.trim();
  const session = cred.sessionId.trim();

  return {
    cookie: `csrftoken=${csrf}; sessionid=${session}`,
    "x-csrftoken": csrf,
    "user-agent": cred.userAgent,
    "sec-ch-ua": cred.secChUa,
    "sec-ch-ua-mobile": cred.secChUaMobile,
    "sec-ch-ua-platform": cred.secChUaPlatform,
  };
}

async function fetchExternalVoices(): Promise<{
  voices: ExternalVoice[];
  isMock: boolean;
}> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`📡 [VoiceSync] Fetching from: ${EXTERNAL_VOICES_API_URL}`);

  const authHeaders = await getActiveCredentialWithFingerprint();

  if (!authHeaders) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] No credentials available");
    if (USE_MOCK_DATA_ON_ERROR) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔧 [VoiceSync] Using mock data (${MOCK_VOICES.length} voices)`,
      );
      return { voices: MOCK_VOICES, isMock: true };
    }
    throw new Error(
      "No active credentials configured. Please add credentials first.",
    );
  }

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      origin: "https://secret-voicer.ru",
      referer: "https://secret-voicer.ru/app/",
      ...authHeaders,
    };

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("🔐 [VoiceSync] Using authenticated request");

    const response = await fetch(EXTERNAL_VOICES_API_URL, {
      method: "GET",
      headers,
      redirect: "manual",
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📡 [VoiceSync] Response status: ${response.status}`);

    if (
      response.status >= REDIRECT_STATUS_MIN
      && response.status < REDIRECT_STATUS_MAX
    ) {
      throw new Error(
        `Auth failed (redirect ${response.status}). Session may be expired. Update credentials.`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
        throw new Error(
          "Auth failed - received login page. Session expired. Update credentials.",
        );
      }
      throw new Error(`External API error: ${response.status}`);
    }

    const data = (await response.json()) as ExternalVoicesResponse;
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `📡 [VoiceSync] Received ${data.grouped_voices?.length ?? 0} groups`,
    );

    const voices = data.grouped_voices.flatMap((group) => group.voices);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📡 [VoiceSync] Total voices extracted: ${voices.length}`);

    return { voices, isMock: false };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] External API failed:", error);

    if (USE_MOCK_DATA_ON_ERROR) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔧 [VoiceSync] Using mock data (${MOCK_VOICES.length} voices)`,
      );
      return { voices: MOCK_VOICES, isMock: true };
    }

    throw error;
  }
}

async function processRemovedVoices(
  externalVoiceIds: string[],
  syncEvents: NewSecretVoicerVoiceSyncEvent[],
  stats: SyncStats,
): Promise<boolean> {
  const removedVoices =
    await getSecretVoicerVoicesNotInExternalIds(externalVoiceIds);

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `🔍 [VoiceSync] Checking for removed voices. Found: ${removedVoices.length}`,
  );

  if (removedVoices.length === 0) {
    return false;
  }

  stats.removed = removedVoices.length;

  for (const voice of removedVoices) {
    syncEvents.push({
      eventType: "VOICE_REMOVED",
      isCritical: true,
      voiceId: voice.id,
      externalVoiceId: voice.externalVoiceId,
      voiceName: voice.externalName,
      oldValues: { externalVoiceId: voice.externalVoiceId },
    });
  }

  const removedNames = removedVoices.map((v) => v.externalName).join(", ");
  await voiceSyncState.block(
    `${removedVoices.length} voice(s) removed from external API: ${removedNames}`,
  );

  return true;
}

async function processExternalVoices(
  externalVoices: ExternalVoice[],
  syncEvents: NewSecretVoicerVoiceSyncEvent[],
  stats: SyncStats,
): Promise<void> {
  const externalVoiceIds = externalVoices.map((v) => v.voice_id);
  const existingVoices =
    await getSecretVoicerVoicesByExternalVoiceIds(externalVoiceIds);

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`🔍 [VoiceSync] Existing voices in DB: ${existingVoices.length}`);

  const existingMap = new Map(
    existingVoices.map((v) => [v.externalVoiceId, v]),
  );

  const voicesToInsert: ReturnType<typeof mapExternalVoiceToDb>[] = [];
  const voicesToUpdate: VoiceUpdate[] = [];

  for (const extVoice of externalVoices) {
    const existing = existingMap.get(extVoice.voice_id);

    if (existing) {
      const changedFields = getChangedExternalFields(existing, extVoice);

      if (changedFields.length > 0) {
        const updateData = mapExternalVoiceToDb(extVoice);
        voicesToUpdate.push({ id: existing.id, data: updateData });
        stats.updated++;

        syncEvents.push({
          eventType: "VOICE_UPDATED",
          isCritical: false,
          voiceId: existing.id,
          externalVoiceId: extVoice.voice_id,
          voiceName: extVoice.name,
          changedFields,
          oldValues: extractOldValues(existing, changedFields),
          newValues: extractNewValuesFromExternal(extVoice, changedFields),
        });
      } else {
        stats.unchanged++;
      }
    } else {
      voicesToInsert.push(mapExternalVoiceToDb(extVoice));
      stats.added++;

      syncEvents.push({
        eventType: "VOICE_ADDED",
        isCritical: false,
        externalVoiceId: extVoice.voice_id,
        voiceName: extVoice.name,
        newValues: { name: extVoice.name, gender: extVoice.gender },
      });
    }
  }

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `📊 [VoiceSync] To insert: ${voicesToInsert.length}, To update: ${voicesToUpdate.length}`,
  );

  if (voicesToInsert.length > 0) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `➕ [VoiceSync] Inserting ${voicesToInsert.length} new voices...`,
    );
    const inserted = await createSecretVoicerVoices(voicesToInsert);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`✅ [VoiceSync] Inserted ${inserted.length} voices`);
  }

  if (voicesToUpdate.length > 0) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🔄 [VoiceSync] Updating ${voicesToUpdate.length} voices...`);
    await Promise.all(
      voicesToUpdate.map(({ id, data }) =>
        updateSecretVoicerVoiceExternalFields(id, data),
      ),
    );
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("✅ [VoiceSync] Updated voices");
  }
}

function cleanupOldEvents(): Promise<number> {
  const retentionDate = new Date();
  retentionDate.setDate(
    retentionDate.getDate() - VOICE_SYNC_LOG_RETENTION_DAYS,
  );
  return deleteOldSecretVoicerVoiceSyncEvents(retentionDate);
}

export async function syncVoicesFromExternalApi(): Promise<SyncResult> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log("🚀 [VoiceSync] Starting sync...");

  const stats: SyncStats = {
    totalVoices: 0,
    added: 0,
    removed: 0,
    updated: 0,
    unchanged: 0,
  };

  let hasCriticalChanges = false;
  let usedMockData = false;

  try {
    const { voices: externalVoices, isMock } = await fetchExternalVoices();
    usedMockData = isMock;
    stats.totalVoices = externalVoices.length;

    if (externalVoices.length === 0) {
      throw new Error("External API returned 0 voices - possible API error");
    }

    const externalVoiceIds = externalVoices.map((v) => v.voice_id);
    const syncEvents: NewSecretVoicerVoiceSyncEvent[] = [];

    if (!usedMockData) {
      hasCriticalChanges = await processRemovedVoices(
        externalVoiceIds,
        syncEvents,
        stats,
      );
    }

    await processExternalVoices(externalVoices, syncEvents, stats);

    if (syncEvents.length > 0) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `📝 [VoiceSync] Creating ${syncEvents.length} sync events...`,
      );
      await createSecretVoicerVoiceSyncEvents(syncEvents);
    }

    const deletedOld = await cleanupOldEvents();
    if (deletedOld > 0) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(`🗑️ [VoiceSync] Cleaned up ${deletedOld} old events`);
    }

    await upsertSecretVoicerVoiceSyncState({
      lastSyncAt: new Date(),
      lastSyncSuccess: true,
      lastSyncError: usedMockData
        ? "Used mock data (external API unavailable)"
        : null,
      lastSyncStats: stats,
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      "✅ [VoiceSync] Completed! Stats:",
      stats,
      usedMockData ? "(mock data)" : "",
    );

    return { success: true, stats, hasCriticalChanges, usedMockData };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("❌ [VoiceSync] Failed:", errorMsg);

    await upsertSecretVoicerVoiceSyncState({
      lastSyncAt: new Date(),
      lastSyncSuccess: false,
      lastSyncError: errorMsg,
    });

    return {
      success: false,
      stats,
      error: errorMsg,
      hasCriticalChanges,
    };
  }
}
```

---

## `apps/api/src/features/secret-voicer/voice/services/sync-state.ts`

```typescript
import {
  getSecretVoicerVoiceSyncState,
  setSecretVoicerVoiceSyncBlocked,
} from "../data/repository";

export const voiceSyncState = {
  async isBlocked(): Promise<boolean> {
    const state = await getSecretVoicerVoiceSyncState();
    return state?.isBlocked ?? false;
  },

  async getBlockReason(): Promise<string | null> {
    const state = await getSecretVoicerVoiceSyncState();
    if (!state?.isBlocked) {
      return null;
    }
    return state.blockReason;
  },

  async block(reason: string): Promise<void> {
    await setSecretVoicerVoiceSyncBlocked(true, reason);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`🚨 [VoiceSync] BLOCKED: ${reason}`);
  },

  async unblock(): Promise<void> {
    await setSecretVoicerVoiceSyncBlocked(false);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("✅ [VoiceSync] Unblocked");
  },

  getState() {
    return getSecretVoicerVoiceSyncState();
  },
};
```

---

## `apps/api/src/features/secret-voicer/voice/types.ts`

```typescript
export type {
  ExternalVoice,
  ExternalVoicesResponse,
  NewSecretVoicerVoice,
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
  UpdateSecretVoicerVoice,
} from "./data/types";
```

---

