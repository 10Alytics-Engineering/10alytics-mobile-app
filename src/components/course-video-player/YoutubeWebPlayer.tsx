import React, { useMemo } from "react";

import {
  buildYoutubeEmbedHtml,
  getYoutubeEmbedPageOrigin,
} from "./html-builders";
import { EmbedWebPlayer } from "./EmbedWebPlayer";

export function YoutubeWebPlayer({
  videoId,
  openUrl,
  height,
  onComplete,
}: {
  videoId: string;
  openUrl: string;
  height: number;
  onComplete?: () => void;
}) {
  const pageOrigin = useMemo(() => getYoutubeEmbedPageOrigin(), []);
  const html = useMemo(
    () => buildYoutubeEmbedHtml(videoId, pageOrigin),
    [videoId, pageOrigin],
  );

  return (
    <EmbedWebPlayer
      html={html}
      baseUrl={pageOrigin}
      height={height}
      openUrl={openUrl}
      onComplete={onComplete}
    />
  );
}
