export function parseTimestamp(stamp: string): number {
  const parts = stamp.split(":").map((part) => Number(part));
  if (parts.some((n) => Number.isNaN(n))) {
    throw new Error(`Invalid timestamp: ${stamp}`);
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  throw new Error(`Invalid timestamp: ${stamp}`);
}

export function formatTimestamp(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${minutes} min`;
}

export function youtubeWatchUrl(videoId: string, startSeconds = 0): string {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  return startSeconds > 0 ? `${base}&t=${startSeconds}s` : base;
}

export function youtubeEmbedUrl(
  videoId: string,
  startSeconds: number,
  endSeconds?: number,
): string {
  const params = new URLSearchParams({
    start: String(Math.max(0, Math.floor(startSeconds))),
    rel: "0",
    modestbranding: "1",
  });
  if (endSeconds && endSeconds > startSeconds) {
    params.set("end", String(Math.floor(endSeconds)));
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
