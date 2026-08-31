import { extractVideoId } from "./yt-utils";
import { fetchYoutubeVideoMeta } from "./yt-api";

async function main() {
  const args = process.argv.slice(2); // string[]

  if (!args[0]) {
    console.error("Использование: bun run src/index.ts <youtube_url_or_id>");
    process.exit(1);
  }

  const input: string = args[0]; // теперь точно string

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("Ошибка: не найден YOUTUBE_API_KEY в переменных окружения (.env).");
    process.exit(1);
  }

  const videoId = extractVideoId(input);
  if (!videoId) {
    console.error("Не удалось распознать videoId из ссылки или id:", input);
    process.exit(1);
  }

  try {
    const meta = await fetchYoutubeVideoMeta(videoId, apiKey);

    if (!meta) {
      console.error("Видео не найдено или недоступно.");
      process.exit(1);
    }

    console.log("=== YouTube Video Meta ===");
    console.log("ID:", meta.id);
    console.log("Название:", meta.title);
    console.log("Канал:", meta.channelTitle);
    console.log("Опубликовано:", meta.publishedAt);
    console.log("Описание:\n", meta.description);

    if (meta.tags && meta.tags.length) {
      console.log("Теги:", meta.tags.join(", "));
    }

    if (meta.statistics) {
      console.log("Статистика:");
      console.log("  Просмотры:", meta.statistics.viewCount ?? "нет данных");
      console.log("  Лайки:", meta.statistics.likeCount ?? "нет данных");
      console.log("  Комментарии:", meta.statistics.commentCount ?? "нет данных");
    }

    console.log("Превью (thumbnails):");
    for (const [key, t] of Object.entries(meta.thumbnails)) {
      console.log(`  ${key}: ${t.url} (${t.width ?? "?"}x${t.height ?? "?"})`);
    }
  } catch (err) {
    console.error("Ошибка при запросе к YouTube API:", err);
    process.exit(1);
  }
}

main();
