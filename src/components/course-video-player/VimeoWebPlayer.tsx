import React, { useMemo } from "react";

import { buildVimeoEmbedHtml, getVimeoEmbedPageOrigin } from "./html-builders";
import { EmbedWebPlayer } from "./EmbedWebPlayer";

/**
 * Vimeo embed player.
 * Uses `reloadOnCrash` because iOS can terminate the web-content process for
 * memory-heavy Vimeo players; the EmbedWebPlayer will reload automatically.
 */
export function VimeoWebPlayer({
  embedUrl,
  openUrl,
  height,
  onComplete,
}: {
  embedUrl: string;
  openUrl: string;
  height: number;
  onComplete?: () => void;
}) {
  const pageOrigin = useMemo(() => getVimeoEmbedPageOrigin(), []);
  const html = useMemo(
    () => buildVimeoEmbedHtml(embedUrl),
    [embedUrl],
  );

  return (
    <EmbedWebPlayer
      html={html}
      baseUrl={pageOrigin}
      height={height}
      openUrl={openUrl}
      reloadOnCrash
      onComplete={onComplete}
    />
  );
}
