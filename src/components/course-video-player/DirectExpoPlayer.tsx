import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";

export function DirectExpoPlayer({
  url,
  height,
}: {
  url: string;
  height: number;
}) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.play();
  });

  return (
    <VideoView
      contentFit="contain"
      nativeControls
      player={player}
      style={{ width: "100%", height }}
    />
  );
}
