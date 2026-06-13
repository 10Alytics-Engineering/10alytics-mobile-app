import React from "react";

import { parseVideoUrl } from "@/utils/video-platform";

import { DirectExpoPlayer } from "./DirectExpoPlayer";
import { VideoUnsupportedFallback } from "./VideoUnsupportedFallback";
import { VimeoWebPlayer } from "./VimeoWebPlayer";
import { YoutubeWebPlayer } from "./YoutubeWebPlayer";
import { isLikelyDirectVideoUrl } from "./utils";

/**
 * Routes to the correct player once the user starts playback.
 * YouTube and Vimeo → WebView embed.
 * Direct file URLs (.mp4 / .m3u8 / etc.) → native expo-video.
 * Anything else → "Open in browser" fallback.
 */
export function VideoPlayerContent({
  parsed,
  height,
  openInBrowser,
  onComplete,
}: {
  parsed: ReturnType<typeof parseVideoUrl> | null;
  height: number;
  openInBrowser: () => void;
  onComplete?: () => void;
}) {
  if (parsed?.provider === "youtube" && parsed.videoId) {
    return (
      <YoutubeWebPlayer
        height={height}
        openUrl={parsed.openUrl}
        videoId={parsed.videoId}
        onComplete={onComplete}
      />
    );
  }

  if (parsed?.provider === "vimeo" && parsed.embedUrl) {
    return (
      <VimeoWebPlayer
        embedUrl={parsed.embedUrl}
        height={height}
        openUrl={parsed.openUrl}
        onComplete={onComplete}
      />
    );
  }

  if (
    parsed?.provider === "unknown" &&
    isLikelyDirectVideoUrl(parsed.openUrl)
  ) {
    return (
      <DirectExpoPlayer
        height={height}
        url={parsed.openUrl}
        onComplete={onComplete}
      />
    );
  }

  return (
    <VideoUnsupportedFallback height={height} onOpenBrowser={openInBrowser} />
  );
}
