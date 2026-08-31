# Milestone 05: Audio Processing & Worker Pipeline

---

## Overview

Users upload audio/video files, process them through configurable
operations (silence removal, noise reduction, merging), and download
results. Establishes worker infrastructure for all future heavy tasks.

**Duration:** ~5 hours
**Depends on:** MS-01 (auth), MS-02 (energy deduction, pricing)

---

## Step-by-Step Execution Order

```
Step 1:  Worker application setup (apps/worker)
Step 2:  MinIO integration — presigned upload/download
Step 3:  Job queue infrastructure (BullMQ)
Step 4:  Audio processing operations (FFmpeg)
Step 5:  Video extraction pipeline
Step 6:  Job progress tracking (SSE)
Step 7:  API endpoints — upload, process, status, download
Step 8:  Hub frontend — upload UI, progress, results
Step 9:  Energy integration — cost calculation, deduction, refund
Step 10: Dev seed — sample audio files
Step 11: Tests
```

---

## Step 1: Worker Application Setup

### Structure

```
apps/worker/
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts                    ← entry point, starts all queue processors
│   ├── shared/
│   │   ├── config/
│   │   │   └── env.ts             ← worker env (REDIS_URL, MINIO_*, DB)
│   │   ├── db/
│   │   │   └── instance.ts        ← same DB connection as API
│   │   ├── minio/
│   │   │   └── instance.ts        ← MinIO client
│   │   └── queue/
│   │       ├── connection.ts      ← shared Redis connection for BullMQ
│   │       └── registry.ts        ← queue name constants
│   │
│   └── processor/
│       ├── audio/
│       │   ├── audio.processor.ts       ← processes audio jobs
│       │   ├── audio.operation.ts       ← individual operations
│       │   └── audio.type.ts
│       └── media/
│           ├── media.processor.ts       ← video extraction + reattach
│           └── media.type.ts
```

### Worker Entry Point

```ts
// apps/worker/src/main.ts

import { audioProcessor } from "./processor/audio/audio.processor";
import { mediaProcessor } from "./processor/media/media.processor";
import { connection } from "./shared/queue/connection";

const QUEUES = {
  audio: audioProcessor,
  media: mediaProcessor,
};

for (const [name, processor] of Object.entries(QUEUES)) {
  new Worker(name, processor, {
    connection,
    concurrency: 2,          // max 2 concurrent jobs per queue
    limiter: {
      max: 10,               // max 10 jobs per minute
      duration: 60_000,
    },
  });
}
```

### Queue Name Registry

```ts
// apps/worker/src/shared/queue/registry.ts

const QUEUE = {
  AUDIO: "audio",
  MEDIA: "media",
  AI: "ai",           // future: MS-06
  PLATFORM: "platform", // future: MS-03 platform data fetch
} as const;
```

---

## Step 2: MinIO Integration

### Presigned URL Service

```
Location: apps/api/src/shared/minio/minio.service.ts

Functions:

  generateUploadUrl(params: {
    userId: string
    fileName: string
    contentType: string
    maxSizeBytes: number
  }): { uploadUrl: string, objectKey: string, expiresIn: number }
    
    objectKey format: "uploads/{userId}/{cuid2}/{fileName}"
    expiresIn: 900 seconds (15 minutes)
    
    Uses MinIO presignedPutObject with conditions:
      - Content-Type must match
      - Content-Length must be <= maxSizeBytes

  generateDownloadUrl(params: {
    objectKey: string
    fileName: string          — for Content-Disposition header
  }): { downloadUrl: string, expiresIn: number }
    
    expiresIn: 3600 seconds (1 hour)
    Uses MinIO presignedGetObject

  deleteObject(objectKey: string): void
    — Cleanup after processing or expiry

  getObjectInfo(objectKey: string): { size: number, contentType: string }
    — Used to validate upload completed, get file size for cost calculation
```

### Bucket Setup

```
Bucket: jstonehub (from env MINIO_BUCKET)

Folder structure:
  uploads/          — user uploads (temporary, cleaned after processing)
  results/          — processing results (cleaned after download or 24h)
  speakers/         — speaker recordings (permanent, MS-08)
  content/          — generated content (permanent, organization-owned)
  avatars/          — user avatars (permanent)
```

Lifecycle policy (configured in MinIO):
  - uploads/ → auto-delete after 24 hours
  - results/ → auto-delete after 7 days

---

## Step 3: Job Queue Infrastructure

### Job Creation (API side)

```
Location: apps/api/src/shared/queue/queue.service.ts

The API creates jobs. The Worker processes them.

Functions:

  enqueueJob(params: {
    queue: string          — from QUEUE registry
    name: string           — job type: "silence_removal", "noise_reduction"
    data: Record<string, unknown>
    userId: string
    priority?: number      — 1 (highest) to 10 (lowest)
    opts?: { delay?: number }  — for cheap queue (off-peak)
  }): { jobId: string }
    
    Uses BullMQ Queue.add()
    Returns jobId for status tracking

  getJobStatus(jobId: string, queue: string): {
    status: "waiting" | "active" | "completed" | "failed"
    progress: number       — 0-100
    result?: { objectKey: string }
    error?: string
    timestamps: { created, started, completed }
  }
```

### Job Data Structure

```ts
// Common job data for all audio/media jobs

type AudioJobData = {
  jobId: string
  userId: string
  orgId?: string             // if processing for org
  inputObjectKey: string     // MinIO key of uploaded file
  outputObjectKey: string    // MinIO key for result
  operation: AudioOperation
  parameters: Record<string, unknown>
  energyCost: bigint         // pre-calculated, already deducted
  priceVersion: number
};

type AudioOperation =
  | "silence_removal"
  | "noise_reduction"
  | "spike_removal"
  | "merge"
  | "video_extract_process_reattach";
```

---

## Step 4: Audio Processing Operations

### FFmpeg Operations

```
Location: apps/worker/src/processor/audio/audio.operation.ts

All operations use FFmpeg via Bun shell (Bun.spawn) or fluent-ffmpeg.
FFmpeg must be installed in the worker Docker container.

Operations:

  silenceRemoval(params: {
    inputPath: string
    outputPath: string
    silenceThreshold: number     — dB level (default: -40)
    minSilenceDuration: number   — seconds (default: 0.5)
    gapAfterRemoval: number      — seconds of silence to keep (default: 0.1)
    onProgress: (percent: number) => void
  })
    FFmpeg filter: silenceremove, silencedetect
    Steps:
      1. Detect silence segments (silencedetect filter → parse output)
      2. Build filter graph to remove detected segments
      3. Add configurable gap between remaining segments
      4. Export processed audio

  noiseReduction(params: {
    inputPath: string
    outputPath: string
    noiseReductionLevel: number  — 0.0 to 1.0 (default: 0.5)
    onProgress: (percent: number) => void
  })
    FFmpeg filter: afftdn (adaptive frequency-domain noise filter)
    Single-pass: apply afftdn with noise reduction amount

  spikeRemoval(params: {
    inputPath: string
    outputPath: string
    spikeThreshold: number       — dB above average (default: 6)
    attackTime: number           — ms (default: 5)
    releaseTime: number          — ms (default: 50)
    onProgress: (percent: number) => void
  })
    FFmpeg filter: compand or alimiter
    Compresses peaks above threshold

  mergeAudio(params: {
    inputPaths: string[]
    outputPath: string
    gapBetween: number           — seconds (default: 0.5)
    gapStart: number             — seconds of silence at beginning
    gapEnd: number               — seconds of silence at end
    onProgress: (percent: number) => void
  })
    FFmpeg: generate silence segments, concat all with inputs
    Filter: concat filter with silence pads
```

### Audio Processor (Job Handler)

```
Location: apps/worker/src/processor/audio/audio.processor.ts

async function audioProcessor(job: Job<AudioJobData>) {
  const { inputObjectKey, outputObjectKey, operation, parameters } = job.data;
  
  // 1. Download input from MinIO to temp file
  const inputPath = await downloadToTemp(inputObjectKey);
  const outputPath = generateTempPath();
  
  try {
    // 2. Execute operation
    const operationFn = getOperationFn(operation);
    await operationFn({
      inputPath,
      outputPath,
      ...parameters,
      onProgress: (percent) => job.updateProgress(percent),
    });
    
    // 3. Upload result to MinIO
    await uploadFromPath(outputPath, outputObjectKey);
    
    // 4. Return result
    return { objectKey: outputObjectKey, success: true };
    
  } catch (error) {
    // 5. On failure: trigger energy refund
    await refundEnergy(job.data);
    throw error;
    
  } finally {
    // 6. Cleanup temp files
    await cleanup(inputPath, outputPath);
  }
}
```

---

## Step 5: Video Extraction Pipeline

```
Location: apps/worker/src/processor/media/media.processor.ts

For video files: extract audio → process → reattach

async function mediaProcessor(job: Job<MediaJobData>) {
  const { inputObjectKey, outputObjectKey, audioOperations } = job.data;
  
  const videoPath = await downloadToTemp(inputObjectKey);
  const audioPath = generateTempPath("wav");
  const processedAudioPath = generateTempPath("wav");
  const outputPath = generateTempPath("mp4");
  
  try {
    // Step 1: Extract audio from video (10% progress)
    job.updateProgress(5);
    await extractAudio(videoPath, audioPath);
    job.updateProgress(10);
    
    // Step 2: Process audio through chain (10-80% progress)
    let currentInput = audioPath;
    for (let i = 0; i < audioOperations.length; i++) {
      const op = audioOperations[i];
      const stepOutput = generateTempPath("wav");
      
      const operationFn = getOperationFn(op.operation);
      await operationFn({
        inputPath: currentInput,
        outputPath: stepOutput,
        ...op.parameters,
        onProgress: (p) => {
          const base = 10 + (70 * i / audioOperations.length);
          const range = 70 / audioOperations.length;
          job.updateProgress(Math.floor(base + range * p / 100));
        },
      });
      
      if (currentInput !== audioPath) await cleanup(currentInput);
      currentInput = stepOutput;
    }
    processedAudioPath = currentInput;
    job.updateProgress(80);
    
    // Step 3: Reattach audio to video (80-95% progress)
    await reattachAudio(videoPath, processedAudioPath, outputPath);
    job.updateProgress(95);
    
    // Step 4: Upload result (95-100%)
    await uploadFromPath(outputPath, outputObjectKey);
    job.updateProgress(100);
    
    return { objectKey: outputObjectKey, success: true };
    
  } catch (error) {
    await refundEnergy(job.data);
    throw error;
  } finally {
    await cleanup(videoPath, audioPath, processedAudioPath, outputPath);
  }
}

FFmpeg commands:
  extractAudio: ffmpeg -i video.mp4 -vn -acodec pcm_s16le audio.wav
  reattachAudio: ffmpeg -i video.mp4 -i processed.wav
                   -c:v copy -map 0:v:0 -map 1:a:0 output.mp4
```

---

## Step 6: Job Progress Tracking (SSE)

```
Location: apps/api/src/feature/job/job.v1.ts

GET /api/jobs/:jobId/progress
  Auth: required
  Validation: job belongs to requesting user
  Response: Server-Sent Events stream

  SSE events:
    event: progress
    data: { status, progress, step }

    event: completed
    data: { objectKey, downloadUrl }

    event: failed  
    data: { error, refunded: boolean }

Implementation:
  1. Elysia SSE support (or raw Response with ReadableStream)
  2. Poll BullMQ job status every 500ms
  3. Send SSE event on change
  4. Close stream on completed/failed
  5. Timeout after 30 minutes (max job duration)

Client side:
  const eventSource = new EventSource(`/api/jobs/${jobId}/progress`);
  eventSource.onmessage = (event) => { ... };
```

---

## Step 7: API Endpoints

### Upload Endpoints

```
POST /api/media/upload-url
  Auth: required
  Body: {
    fileName: string,
    contentType: string,     — "audio/wav", "video/mp4", etc.
    fileSizeBytes: number
  }
  Validation:
    - contentType must be in allowed list
    - fileSizeBytes within limits (configurable)
  Response: {
    uploadUrl: string,       — presigned PUT URL to MinIO
    objectKey: string,       — reference for subsequent operations
    expiresIn: number        — seconds
  }
```

### Processing Endpoints

```
POST /api/media/process
  Auth: required
  Body: {
    inputObjectKey: string,
    operations: [{
      operation: AudioOperation,
      parameters: Record<string, unknown>
    }],
    priceVersion: number,
    orgId?: string,           — if processing for org
    projectId?: string,       — for budget tracking
    accountId?: string,       — for budget tracking
    contentTypeId?: string    — for energy tracking
  }
  Logic:
    1. Validate inputObjectKey exists in MinIO
    2. Get file info (size, duration via FFprobe)
    3. Calculate total energy cost:
       For each operation:
         cost = calculateToolCost(toolKey, units, coefficients)
       totalCost = sum of all operation costs
    4. Validate price version for each tool
    5. Deduct energy:
       - If personal: debitEnergy(userId, totalCost)
       - If org: debitFromBudget(accountId/projectId, totalCost)
    6. Create job in queue:
       - Single operation → audio queue
       - Multiple operations → chained in single job
       - Video input → media queue
    7. Return { jobId, totalEnergyCost, estimatedDuration }

POST /api/media/process/estimate
  Auth: required
  Body: same as /process but without executing
  Response: {
    totalEnergyCost: string (bigint),
    costBreakdown: [{ operation, units, energyCost }],
    estimatedDurationSeconds: number
  }
  
  No energy deducted. For preview before committing.
```

### Job Status Endpoints

```
GET /api/jobs
  Auth: required
  Response: [{
    jobId, queue, operation, status, progress,
    createdAt, completedAt, energyCost
  }]
  Shows user's recent jobs (last 50).

GET /api/jobs/:jobId
  Auth: required
  Response: {
    jobId, queue, status, progress,
    result?: { objectKey, downloadUrl },
    error?: string,
    energyCost, refunded,
    timestamps
  }

GET /api/jobs/:jobId/progress
  Auth: required
  Response: SSE stream (described above)

GET /api/jobs/:jobId/download
  Auth: required
  Response: { downloadUrl, expiresIn }
  Generates fresh presigned download URL.
```

---

## Step 8: Hub Frontend

### Media Processing Page

```
Route: /hub/tools/audio
       /hub/tools/video

Layout:

1. UPLOAD ZONE
   - Drag-and-drop or click to select
   - Multiple files supported
   - Shows: file name, size, duration (read via Web Audio API)
   - Upload progress bar (XHR to presigned URL)
   - File type validation (client-side)

2. OPERATION SELECTOR
   - Checkbox list: Silence Removal, Noise Reduction, 
     Spike Removal, Merge
   - Each operation expandable with parameters:
     
     Silence Removal:
       Threshold: slider (-60dB to -20dB, default -40)
       Min duration: slider (0.1s to 2.0s, default 0.5)
       Gap after: slider (0.01s to 0.5s, default 0.1)
     
     Noise Reduction:
       Level: slider (0.0 to 1.0, default 0.5)
     
     Spike Removal:
       Threshold: slider (3dB to 12dB, default 6)
       Attack: slider (1ms to 20ms, default 5)
       Release: slider (10ms to 200ms, default 50)
     
     Merge:
       Gap between files: slider (0s to 5s, default 0.5)
       Gap at start: slider (0s to 5s, default 0)
       Gap at end: slider (0s to 5s, default 0)

3. COST ESTIMATE (live, updates on parameter change)
   - Calls /api/media/process/estimate (debounced 500ms)
   - Shows: total energy, breakdown per operation
   - Shows: personal balance or org budget remaining
   - Warning if insufficient balance

4. PROCESS BUTTON
   - "Process (396K ⚡)" — shows cost in button
   - Disabled if insufficient balance
   - Click → POST /api/media/process
   - Transitions to progress view

5. PROGRESS VIEW
   - Progress bar (SSE-driven)
   - Current step indicator
   - Cancel button (future — queues job cancellation)
   - On completion: download button appears
   - On failure: error message + "Energy refunded" notice

6. RESULTS HISTORY
   - List of recent processing jobs
   - Status, date, cost, download link (if available)
   - Download links expire after 7 days
```

### Org Context

```
When user is in org context (/org/:slug/tools/audio):
  - Budget selector: which project/account to charge
  - Balance shows org/project/account budget
  - Energy deducted from selected budget
  - Energy transaction tagged with org/project/account

When user is in personal context (/tools/audio):
  - Charges personal balance
  - No org selector
```

---

## Step 9: Energy Integration

### Cost Calculation for Audio

```
Tool definitions (seeded in MS-02, configured in admin):

  audio:silence_removal
    unit: "second"
    real_cost_usd: 0.0001
    coefficients: [] (none — simple per-second)

  audio:noise_reduction
    unit: "second"
    real_cost_usd: 0.0002
    coefficients: [] (none)

  audio:spike_removal
    unit: "second"
    real_cost_usd: 0.0001
    coefficients: [] (none)

  audio:merge
    unit: "second"
    real_cost_usd: 0.00005
    coefficients: [] (none — total output duration)

  media:video_extract_reattach
    unit: "second"
    real_cost_usd: 0.0003
    coefficients: [
      { name: "bitrate", formula: "value / 1000 + 0.5", unit: "kbps", default: 1000 }
    ]
```

### Refund on Failure

```
When worker job fails:
  1. Worker catches error
  2. Calls API internal endpoint:
     POST /api/internal/energy/refund
     Headers: { Authorization: Bearer INTERNAL_SECRET }
     Body: { userId, orgId?, amount, jobId, reason }
  3. API credits energy back
  4. Creates energy_transaction with type "refund"
  5. Job status includes refunded: true
```

Internal endpoint secured with INTERNAL_SECRET (shared between
API and Worker, not exposed to clients).

---

## Step 10: Dev Seed

```
POST /api/dev/seed/media
Body: { }

Seeds:
  - Sample audio files uploaded to MinIO:
    __test__sample_10s.wav (10 seconds, clean)
    __test__sample_60s.wav (60 seconds, with silence gaps)
    __test__sample_noisy.wav (30 seconds, with background noise)
    __test__sample_spiky.wav (20 seconds, with audio spikes)
    __test__sample_video.mp4 (15 seconds, with audio track)
  
  - Tool pricing entries for all audio operations
  
  - Sample completed jobs in DB (for history display)

DELETE /api/dev/seed/media
  Removes test files from MinIO and DB records
```

---

## Step 11: Tests

### Unit Tests

```
apps/worker/src/processor/audio/_test/audio.operation.test.ts
  - silenceRemoval: known input → silence segments removed
  - noiseReduction: known input → noise level reduced
  - spikeRemoval: known input → peaks compressed
  - mergeAudio: two files → single output with gaps
  - All operations: onProgress called with increasing values
  - All operations: invalid input → throws meaningful error

apps/api/src/shared/minio/_test/minio.service.test.ts
  - generateUploadUrl: returns valid presigned URL
  - generateDownloadUrl: returns valid presigned URL
  - deleteObject: object removed
  - getObjectInfo: returns size and content type
```

### Integration Tests

```
apps/api/src/feature/media/_test/media.integration.test.ts
  - Upload URL: valid response with objectKey
  - Upload URL: invalid content type → 400
  - Process: energy deducted, job created
  - Process: insufficient balance → 402
  - Process: price version mismatch → 409
  - Process: org context with budget → budget deducted
  - Process: org budget exceeded → 402
  - Estimate: returns correct cost without deducting
  - Job status: returns current progress
  - Job download: returns presigned URL
  - Job list: returns user's jobs only

apps/worker/src/processor/audio/_test/audio.processor.integration.test.ts
  - Full pipeline: upload → process → download
  - Failure: energy refunded via internal endpoint
  - Progress: updates received during processing
  - Video: extract → process → reattach → valid output
  - Concurrent jobs: limited by concurrency setting
```

### E2E Tests (Playwright)

```
apps/hub/e2e/audio-processing.spec.ts
  - Upload audio file: progress bar, success
  - Select operation: parameters visible
  - Cost estimate: updates on parameter change
  - Process: progress bar advances, download appears
  - Insufficient balance: process button disabled
  - Results history: shows completed jobs
```

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Upload expires before processing starts | Job fails to find file → error → refund energy |
| File is 0 bytes | getObjectInfo check after upload → reject before queue |
| FFmpeg crashes | Worker catches error, refund energy, mark job failed |
| Worker restarts mid-job | BullMQ job stays in "active", picked up on restart. Temp files lost → job fails → refund |
| User uploads file but never starts processing | uploads/ lifecycle policy: auto-delete after 24h |
| Presigned download URL expires | User can request new URL via GET /api/jobs/:id/download |
| Massive file (10GB video) | MinIO handles multipart upload. Worker downloads in chunks. Energy cost proportional to duration/bitrate, not file size |
| Two operations in chain: first succeeds, second fails | Full refund (total cost refunded, not partial). Simpler than partial refund tracking |
| User disconnects SSE mid-progress | Job continues. User can reconnect and get current status. SSE is stateless |

---

## API Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | /api/media/upload-url | authenticated | Get presigned upload URL |
| POST | /api/media/process | authenticated | Start processing job |
| POST | /api/media/process/estimate | authenticated | Cost estimate |
| GET | /api/jobs | authenticated | List user's jobs |
| GET | /api/jobs/:id | authenticated | Job detail |
| GET | /api/jobs/:id/progress | authenticated | SSE progress stream |
| GET | /api/jobs/:id/download | authenticated | Get download URL |
| POST | /api/internal/energy/refund | internal secret | Refund energy (worker→API) |
| POST | /api/dev/seed/media | dev only | Seed test media |
| DELETE | /api/dev/seed/media | dev only | Clear test media |