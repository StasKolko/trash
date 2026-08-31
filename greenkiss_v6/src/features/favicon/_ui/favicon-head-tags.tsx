import "server-only";
import { getActiveFavicon } from "../server";

export async function FaviconHeadTags() {
  const active = await getActiveFavicon();
  if (!active) {
    return <link href="/favicon.png" rel="icon" type="image/png" />;
  }
  const s = active.sizes as Record<
    string,
    { url: string; width: number; height: number }
  >;
  const f32 = s["favicon-32"]?.url;
  const f96 = s["favicon-96"]?.url;
  const apple = s["apple-touch-icon"]?.url;
  const ac192 = s["android-chrome-192"]?.url;
  const ac512 = s["android-chrome-512"]?.url;
  const manifest = (active.originalUrl || "").replace(
    /original\.png$/,
    "site.webmanifest",
  );

  return (
    <>
      {f32 && <link href={f32} rel="icon" sizes="32x32" type="image/png" />}
      {f96 && <link href={f96} rel="icon" sizes="96x96" type="image/png" />}
      {apple && <link href={apple} rel="apple-touch-icon" sizes="180x180" />}
      {ac192 && (
        <link href={ac192} rel="icon" sizes="192x192" type="image/png" />
      )}
      {ac512 && (
        <link href={ac512} rel="icon" sizes="512x512" type="image/png" />
      )}
      <link href={manifest} rel="manifest" />
      <meta content="#0f172a" name="theme-color" />
      <meta content="Green Kiss" name="apple-mobile-web-app-title" />
      <meta content="Green Kiss" name="application-name" />
    </>
  );
}
