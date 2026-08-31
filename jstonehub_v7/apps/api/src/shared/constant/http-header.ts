// Custom HTTP headers used across the API surface.
// Lower-case per RFC 9110 §5.1 (case-insensitive) and Elysia auto-completion convention.
// See: prompts/elysia/2_essential/2_handler.md — "use `set-cookie` rather than `Set-Cookie`".

const HEADER_REQUEST_ID = "x-request-id";

export { HEADER_REQUEST_ID };