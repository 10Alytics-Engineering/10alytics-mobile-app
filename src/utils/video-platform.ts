export type VideoProvider = "youtube" | "vimeo" | "unknown";

export interface ParsedVideo {
  provider: VideoProvider;
  /** Provider-native id when known */
  videoId: string | null;
  /** Best URL to open in a browser / in-app browser */
  openUrl: string;
  /** Embed player URL when applicable */
  embedUrl: string | null;
}

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be" || u.hostname.endsWith(".youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id?.split("?")[0] ?? null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/]+)/);
      if (embed) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([^/]+)/);
      if (shorts) return shorts[1];
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;

    // player.vimeo.com/video/{id}
    if (u.hostname.startsWith("player.")) {
      const vi = parts.indexOf("video");
      if (vi >= 0 && parts[vi + 1] && /^\d+$/.test(parts[vi + 1])) {
        return parts[vi + 1];
      }
    }

    // vimeo.com/video/{id}
    const vi = parts.indexOf("video");
    if (vi >= 0 && parts[vi + 1] && /^\d+$/.test(parts[vi + 1])) {
      return parts[vi + 1];
    }

    // vimeo.com/{id}
    const first = parts[0];
    if (first && /^\d+$/.test(first)) return first;
  } catch {
    /* invalid URL */
  }
  return null;
}

function vimeoPrivacyHashFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const queryHash = u.searchParams.get("h");
    if (queryHash) return queryHash;

    // Unlisted Vimeo videos carry the privacy hash in the path:
    // vimeo.com/{id}/{hash} or player.vimeo.com/video/{id}/{hash}
    const parts = u.pathname.split("/").filter(Boolean);
    const idIndex = parts.findIndex((part) => /^\d+$/.test(part));
    const pathHash = idIndex >= 0 ? parts[idIndex + 1] : undefined;
    if (pathHash && /^[A-Za-z0-9]+$/.test(pathHash)) return pathHash;

    return null;
  } catch {
    return null;
  }
}

function buildVimeoPlayerUrl(videoId: string, originalUrl: string): string {
  const h = vimeoPrivacyHashFromUrl(originalUrl);
  const base = `https://player.vimeo.com/video/${videoId}`;
  if (h) return `${base}?${new URLSearchParams({ h }).toString()}`;
  return base;
}

/**
 * Normalizes YouTube / Vimeo (and generic http) links for opening or embedding.
 * YouTube and Vimeo are detected so callers can branch UI (icons, analytics, WebView vs browser).
 */
export function parseVideoUrl(
  raw: string | null | undefined
): ParsedVideo | null {
  if (!raw || typeof raw !== "string") return null;
  const url = raw.trim();
  if (!url) return null;

  const youtubeId = extractYoutubeId(url);
  if (youtubeId) {
    return {
      provider: "youtube",
      videoId: youtubeId,
      openUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }

  const absoluteForVimeo = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const vimeoId = extractVimeoId(absoluteForVimeo);
  if (vimeoId) {
    const canonical = /^https?:\/\//i.test(url) ? url : `https://vimeo.com/${vimeoId}`;
    return {
      provider: "vimeo",
      videoId: vimeoId,
      openUrl: canonical,
      embedUrl: buildVimeoPlayerUrl(vimeoId, absoluteForVimeo),
    };
  }

  if (/^https?:\/\//i.test(url)) {
    return {
      provider: "unknown",
      videoId: null,
      openUrl: url,
      embedUrl: null,
    };
  }

  return null;
}

/**
 * URL to load in an in-app browser / WebView: embed when available (YouTube/Vimeo),
 * otherwise the canonical watch page or any recognized https URL.
 */
export function getVideoPlaybackUrl(raw: string | null | undefined): string | null {
  const parsed = parseVideoUrl(raw);
  if (parsed) return parsed.embedUrl ?? parsed.openUrl;
  const trimmed = raw?.trim();
  if (trimmed && /^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}
