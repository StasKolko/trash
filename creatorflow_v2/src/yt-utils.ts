// src/yt-utils.ts
export function extractVideoId(urlOrId: string): string | null {
  // Если уже пришел похожий на id (11 символов, буквы/цифры/подчеркивания/минусы)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  try {
    const url = new URL(urlOrId);

    // youtube.com / m.youtube.com / www.youtube.com
    if (url.hostname.includes("youtube.com")) {
      // https://www.youtube.com/watch?v=VIDEO_ID
      if (url.pathname === "/watch") {
        const v = url.searchParams.get("v"); // string | null
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
          return v;
        }
      }

      // https://www.youtube.com/shorts/VIDEO_ID
      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch && shortsMatch[1]) {
        return shortsMatch[1]; // string
      }

      // /embed/VIDEO_ID, /v/VIDEO_ID, /live/VIDEO_ID и т.п.
      const pathParts = url.pathname.split("/");
      const maybeId = pathParts[pathParts.length - 1];
      if (maybeId && /^[a-zA-Z0-9_-]{11}$/.test(maybeId)) {
        return maybeId;
      }
    }

    // https://youtu.be/VIDEO_ID
    if (url.hostname === "youtu.be") {
      const pathParts = url.pathname.split("/");
      const maybeId = pathParts[pathParts.length - 1];
      if (maybeId && /^[a-zA-Z0-9_-]{11}$/.test(maybeId)) {
        return maybeId;
      }
    }
  } catch {
    // Если это не URL, а просто строка - уже проверили выше как id
  }

  return null;
}
