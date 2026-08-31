export async function GET() {
  // Minimal 0-byte PNG placeholder to satisfy type-check imports.
  return new Response(new Uint8Array(), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
    },
  });
}
