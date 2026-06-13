import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

import { VideoErrorFallback } from "./VideoErrorFallback";
import { VideoLoadingOverlay } from "./VideoLoadingOverlay";

export interface EmbedWebPlayerProps {
  html: string;
  baseUrl: string;
  height: number;
  openUrl: string;
  /** Re-attach the WebView if iOS kills the web-content process (needed for Vimeo). */
  reloadOnCrash?: boolean;
  /** Fired once the embedded player reports >= the completion threshold watched. */
  onComplete?: () => void;
}

/**
 * Shared WebView wrapper used by both YouTube and Vimeo players.
 * Handles loading state, error state, and optional crash recovery.
 */
export function EmbedWebPlayer({
  html,
  baseUrl,
  height,
  openUrl,
  reloadOnCrash = false,
  onComplete,
}: EmbedWebPlayerProps) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const webRef = useRef<WebView>(null);

  // Reset state and restart the 12 s fallback timer whenever the HTML changes
  // (i.e. when a new video is selected).
  useEffect(() => {
    setFailed(false);
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 12000);
    return () => clearTimeout(timer);
  }, [html]);

  if (failed) {
    return <VideoErrorFallback height={height} openUrl={openUrl} />;
  }

  return (
    <View style={{ height, width: "100%", position: "relative" }}>
      <WebView
        ref={reloadOnCrash ? webRef : undefined}
        allowsProtectedMedia
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        androidLayerType="hardware"
        bounces={false}
        domStorageEnabled
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        originWhitelist={["*"]}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        source={{ html, baseUrl }}
        style={{ height, width: "100%", backgroundColor: "#000000" }}
        onContentProcessDidTerminate={
          reloadOnCrash
            ? () => {
                setLoading(true);
                webRef.current?.reload();
              }
            : undefined
        }
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onHttpError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onMessage={(event) => {
          const data = event.nativeEvent.data;
          if (data === "iframe-loaded") setLoading(false);
          if (data === "iframe-error") {
            setLoading(false);
            setFailed(true);
          }
          if (data === "video-complete") onComplete?.();
        }}
      />
      {loading ? <VideoLoadingOverlay height={height} /> : null}
    </View>
  );
}
