// src/yt-api.ts

export interface YoutubeVideoMeta {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  channelTitle: string;
  publishedAt: string;
  thumbnails: Record<
    string,
    {
      url: string;
      width?: number;
      height?: number;
    }
  >;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface YoutubeApiResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      tags?: string[];
      channelTitle: string;
      publishedAt: string;
      thumbnails: Record<
        string,
        {
          url: string;
          width?: number;
          height?: number;
        }
      >;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
  }>;
}

export async function fetchYoutubeVideoMeta(
  videoId: string,
  apiKey: string
): Promise<YoutubeVideoMeta | null> {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "snippet,statistics");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", apiKey);

  const res = await fetch(endpoint.toString());
  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as YoutubeApiResponse;

  if (!data.items || data.items.length === 0) {
    return null;
  }

  const item = data.items[0]!; // non-null assertion

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    tags: item.snippet.tags,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnails: item.snippet.thumbnails,
    statistics: item.statistics,
  };
}
