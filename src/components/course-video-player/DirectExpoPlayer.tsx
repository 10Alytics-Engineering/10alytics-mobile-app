import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef } from "react";

import { VIDEO_COMPLETION_THRESHOLD } from "./html-builders";

export function DirectExpoPlayer({
  url,
  height,
  onComplete,
}: {
  url: string;
  height: number;
  onComplete?: () => void;
}) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 1;
    p.play();
  });

  const completedRef = useRef(false);

  // Reset the one-shot guard whenever the lesson URL changes.
  useEffect(() => {
    completedRef.current = false;
  }, [url]);

  // Auto-mark complete once >= the threshold of the video has been watched.
  useEffect(() => {
    if (!onComplete) return;
    const sub = player.addListener("timeUpdate", ({ currentTime }) => {
      if (completedRef.current) return;
      const duration = player.duration;
      if (
        duration > 0 &&
        currentTime / duration >= VIDEO_COMPLETION_THRESHOLD
      ) {
        completedRef.current = true;
        onComplete();
      }
    });
    return () => sub.remove();
  }, [player, onComplete]);

  return (
    <VideoView
      contentFit="contain"
      nativeControls
      player={player}
      style={{ width: "100%", height }}
    />
  );
}
