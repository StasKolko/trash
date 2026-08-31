import { Elysia } from "elysia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HEADER_REQUEST_ID } from "#api/shared/constant/http-header";

import { requestIdPlugin } from "../request-id.plugin";

// Matches the cuid2-like format produced by @packages/util/id createId():
// 24 lowercase alphanumeric characters. Used to verify fallback generation.
const CREATED_ID_REGEX = /^[a-z0-9]{24}$/;

vi.mock("#api/shared/config/env", () => ({
  env: {
    TRUST_INBOUND_REQUEST_ID: true,
  },
  JWT_SECRET_BYTES: new Uint8Array(),
}));

describe("requestIdPlugin", () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    app = buildTestApp();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("requestId generation", () => {
    it("generates a new requestId when no headers provided", async () => {
      const res = await app.handle(new Request("http://localhost/echo"));
      const headerId = res.headers.get(HEADER_REQUEST_ID);

      expect(headerId).toBeTruthy();
      expect(headerId).toMatch(CREATED_ID_REGEX);
    });

    it("response x-request-id equals the one available in handler", async () => {
      const res = await app.handle(new Request("http://localhost/echo"));
      const body = (await res.json()) as { requestId: string };

      expect(res.headers.get(HEADER_REQUEST_ID)).toBe(body.requestId);
    });

    it("generates distinct ids for distinct requests", async () => {
      const [res1, res2] = await Promise.all([
        app.handle(new Request("http://localhost/echo")),
        app.handle(new Request("http://localhost/echo")),
      ]);

      expect(res1.headers.get(HEADER_REQUEST_ID)).not.toBe(
        res2.headers.get(HEADER_REQUEST_ID),
      );
    });
  });

  describe("traceparent propagation (W3C)", () => {
    it("extracts trace id from valid traceparent header", async () => {
      const traceId = "0af7651916cd43dd8448eb211c80319c";
      const traceparent = `00-${traceId}-b7ad6b7169203331-01`;

      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { traceparent },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).toBe(traceId);
    });

    it("ignores malformed traceparent and falls back", async () => {
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { traceparent: "not-a-valid-traceparent" },
        }),
      );

      const headerId = res.headers.get(HEADER_REQUEST_ID);
      expect(headerId).toMatch(CREATED_ID_REGEX);
    });

    it("ignores traceparent with wrong segment lengths", async () => {
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { traceparent: "00-short-b7ad6b7169203331-01" },
        }),
      );

      const headerId = res.headers.get(HEADER_REQUEST_ID);
      expect(headerId).toMatch(CREATED_ID_REGEX);
    });

    it("prefers traceparent over x-request-id when both present", async () => {
      const traceId = "1234567890abcdef1234567890abcdef";

      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: {
            traceparent: `00-${traceId}-b7ad6b7169203331-01`,
            [HEADER_REQUEST_ID]: "custom-id-12345",
          },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).toBe(traceId);
    });
  });

  describe("x-request-id inbound validation", () => {
    it("accepts valid inbound x-request-id", async () => {
      const valid = "abc123_XYZ-456";
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { [HEADER_REQUEST_ID]: valid },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).toBe(valid);
    });

    it("rejects x-request-id shorter than 8 chars", async () => {
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { [HEADER_REQUEST_ID]: "short" },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).not.toBe("short");
      expect(res.headers.get(HEADER_REQUEST_ID)).toMatch(CREATED_ID_REGEX);
    });

    it("rejects x-request-id longer than 64 chars", async () => {
      const tooLong = "a".repeat(65);
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { [HEADER_REQUEST_ID]: tooLong },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).not.toBe(tooLong);
    });

    it("rejects x-request-id with CRLF (response splitting attack)", async () => {
      const malicious = "valid123\r\nSet-Cookie: evil=1";
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { [HEADER_REQUEST_ID]: malicious },
        }),
      );

      const headerId = res.headers.get(HEADER_REQUEST_ID);
      expect(headerId).not.toContain("\r");
      expect(headerId).not.toContain("\n");
      expect(res.headers.get("set-cookie")).toBeNull();
    });

    it("rejects x-request-id with control characters", async () => {
      const malicious = "valid\x00\x1f\x7fid";
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { [HEADER_REQUEST_ID]: malicious },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).not.toBe(malicious);
    });

    it("rejects x-request-id with HTML/script injection", async () => {
      const malicious = "<script>alert(1)</script>";
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { [HEADER_REQUEST_ID]: malicious },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).not.toContain("<");
    });

    it("rejects x-request-id with spaces", async () => {
      const res = await app.handle(
        new Request("http://localhost/echo", {
          headers: { [HEADER_REQUEST_ID]: "has spaces here" },
        }),
      );

      expect(res.headers.get(HEADER_REQUEST_ID)).not.toBe("has spaces here");
    });
  });

  describe("error path — requestId always present", () => {
    it("returns x-request-id on handler error", async () => {
      const res = await app.handle(new Request("http://localhost/error"));

      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(res.headers.get(HEADER_REQUEST_ID)).toMatch(CREATED_ID_REGEX);
    });

    it("returns x-request-id on 404", async () => {
      const res = await app.handle(new Request("http://localhost/nonexistent"));

      expect(res.status).toBe(404);
      expect(res.headers.get(HEADER_REQUEST_ID)).toMatch(CREATED_ID_REGEX);
    });
  });

  describe("context shape", () => {
    it("exposes requestId, startedAt, signal in handler", async () => {
      const res = await app.handle(new Request("http://localhost/context"));
      const body = (await res.json()) as {
        hasRequestId: boolean;
        hasStartedAt: boolean;
        hasSignal: boolean;
      };

      expect(body.hasRequestId).toBe(true);
      expect(body.hasStartedAt).toBe(true);
      expect(body.hasSignal).toBe(true);
    });

    it("startedAt measures elapsed time correctly", async () => {
      const res = await app.handle(new Request("http://localhost/elapsed"));
      const body = (await res.json()) as { elapsedMs: number };

      expect(body.elapsedMs).toBeGreaterThanOrEqual(0);
      expect(body.elapsedMs).toBeLessThan(5000);
    });
  });
});

describe("requestIdPlugin — TRUST_INBOUND_REQUEST_ID=false", () => {
  it("ignores inbound x-request-id in production-like mode", async () => {
    vi.doMock("#api/shared/config/env", () => ({
      env: { TRUST_INBOUND_REQUEST_ID: false },
      JWT_SECRET_BYTES: new Uint8Array(),
    }));

    vi.resetModules();
    const { requestIdPlugin: strictPlugin } = await import(
      "../request-id.plugin"
    );

    const strictApp = new Elysia()
      .use(strictPlugin)
      .get("/echo", ({ requestId }) => ({ requestId }));

    const res = await strictApp.handle(
      new Request("http://localhost/echo", {
        headers: { [HEADER_REQUEST_ID]: "client-provided-id-123" },
      }),
    );

    expect(res.headers.get(HEADER_REQUEST_ID)).not.toBe("client-provided-id-123");

    vi.doUnmock("#api/shared/config/env");
  });
});

function buildTestApp() {
  return new Elysia()
    .use(requestIdPlugin)
    .get("/echo", ({ requestId }) => ({ requestId }))
    .get("/context", ({ requestId, startedAt, signal }) => ({
      hasRequestId: typeof requestId === "string" && requestId.length > 0,
      hasStartedAt: typeof startedAt === "number" && startedAt > 0,
      hasSignal: signal instanceof AbortSignal,
    }))
    .get("/elapsed", async ({ startedAt }) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { elapsedMs: performance.now() - startedAt };
    })
    .get("/error", () => {
      throw new Error("boom");
    });
}