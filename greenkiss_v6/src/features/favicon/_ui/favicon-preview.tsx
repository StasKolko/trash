"use client";

export function FaviconPreview({
  sizes,
}: {
  sizes: Record<
    string,
    { url: string; width: number; height: number; bytes: number }
  >;
}) {
  const entries = Object.entries(sizes);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {entries.map(([key, s]) => (
        <div className="rounded-md border p-3 bg-card/60" key={key}>
          <div className="text-sm font-medium mb-2">{key}</div>
          {/* biome-ignore lint/performance/noImgElement: preview */}
          <img
            alt={key}
            className="w-16 h-16 object-contain border rounded bg-secondary"
            src={s.url}
          />
          <div className="text-xs text-muted-foreground mt-2">
            {s.width}×{s.height} • {s.bytes} байт
          </div>
        </div>
      ))}
    </div>
  );
}
