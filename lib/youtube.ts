export function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match?.[1] ?? null;
}

export function getEmbedUrl(videoId: string, startSec = 0): string {
  return `https://www.youtube.com/embed/${videoId}?start=${startSec}&rel=0&mute=1&autoplay=1`;
}

export function getPosterUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
