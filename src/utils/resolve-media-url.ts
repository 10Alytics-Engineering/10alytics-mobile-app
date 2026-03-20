const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

/** Origin of the backend (no trailing slash), derived from EXPO_PUBLIC_API_URL. */
export function getApiOrigin(): string {
  const trimmed = API_BASE_URL.replace(/\/$/, "");
  return trimmed.replace(/\/?api$/, "") || trimmed;
}

/**
 * Origin for YouTube iframe embeds in a WebView: used as `baseUrl` and as the
 * iframe `origin` query param so policy matches your marketing site (where embeds work).
 * Set `EXPO_PUBLIC_YOUTUBE_EMBED_ORIGIN` (e.g. https://www.10alytics.io) if it differs from the API host.
 */
export function getYoutubeEmbedPageOrigin(): string {
  const explicit = process.env.EXPO_PUBLIC_YOUTUBE_EMBED_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const fromApi = getApiOrigin();
  if (fromApi) return fromApi;
  return "https://www.youtube.com";
}

/** Turn `/courses/foo.svg` or relative paths into absolute URLs using the API host. */
export function resolveMediaUrl(
  path: string | null | undefined
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const origin = getApiOrigin();
  if (path.startsWith("/")) return `${origin}${path}`;
  return `${origin}/${path}`;
}
