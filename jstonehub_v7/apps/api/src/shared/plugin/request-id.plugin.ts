import { is } from "@packages/util/guard";
import { createId } from "@packages/util/id";
import { Elysia } from "elysia";

import { env } from "#api/shared/config/env";
import { HEADER_REQUEST_ID } from "#api/shared/constant/http-header";

type RequestIdStore = {
  requestId: string;
  startedAt: number;
  signal: AbortSignal;
};

// W3C Trace Context traceparent format: version-traceId-spanId-flags
// version: 2 hex, traceId: 32 hex, spanId: 16 hex, flags: 2 hex
// See: https://www.w3.org/TR/trace-context/#traceparent-header
const TRACEPARENT_REGEX =
  /^[0-9a-f]{2}-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$/;

// Conservative charset: alphanumeric, dash, underscore. Length 8..64 aligns with
// ULID/UUID/cuid2 formats. Note: CRLF/control chars are rejected by WHATWG Headers
// constructor at the runtime level (RFC 7230 §3.2), so this regex handles only
// semantically-valid-but-unwanted values (spaces, HTML, oversized strings).
const REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

const _STORE_KEY = "requestId" as const;

const requestIdPlugin = new Elysia({ name: "core.request-id" })
  .state(_STORE_KEY, null as RequestIdStore | null)
  .onRequest(function initRequestId({ request, store }) {
    store[_STORE_KEY] = {
      requestId: _resolveRequestId(request),
      startedAt: performance.now(),
      signal: request.signal,
    };
  })
  .derive({ as: "global" }, function exposeRequestId({ store }) {
    const state = store[_STORE_KEY];

    if (is.null(state)) {
      const fallback: RequestIdStore = {
        requestId: createId(),
        startedAt: performance.now(),
        signal: new AbortController().signal,
      };
      store[_STORE_KEY] = fallback;
      return fallback;
    }

    return state;
  })
  // Set header on both success and error paths.
  // onError → mapResponse chain is not guaranteed across Elysia versions when onError
  // returns a plain value, so we attach in both hooks for defense in depth.
  .onError({ as: "global" }, function setRequestIdOnError({ set, store }) {
    const state = store[_STORE_KEY];
    if (state) {
      set.headers[HEADER_REQUEST_ID] = state.requestId;
    }
  })
  .mapResponse({ as: "global" }, function setRequestIdHeader({ set, store }) {
    const state = store[_STORE_KEY];
    if (state) {
      set.headers[HEADER_REQUEST_ID] = state.requestId;
    }
  });

function _resolveRequestId(request: Request) {
  const fromTraceparent = _extractTraceparentId(request.headers.get("traceparent"));
  if (fromTraceparent) {
    return fromTraceparent;
  }

  if (env.TRUST_INBOUND_REQUEST_ID) {
    const fromHeader = _validateRequestIdHeader(request.headers.get(HEADER_REQUEST_ID));
    if (fromHeader) {
      return fromHeader;
    }
  }

  return createId();
}

function _extractTraceparentId(header: string | null) {
  if (is.null(header)) {
    return null;
  }
  const match = header.match(TRACEPARENT_REGEX);
  if (!match) {
    return null;
  }
  return match[1] ?? null;
}

function _validateRequestIdHeader(header: string | null) {
  if (is.null(header)) {
    return null;
  }
  if (!REQUEST_ID_REGEX.test(header)) {
    return null;
  }
  return header;
}

export type { RequestIdStore };
export { requestIdPlugin };