import * as WebBrowser from "expo-web-browser";
import { X } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { resolveMediaUrl } from "@/utils/resolve-media-url";
import { parseVideoUrl } from "@/utils/video-platform";

import { VideoPlayerContent } from "./VideoPlayerContent";
import { VideoPoster } from "./VideoPoster";
import { getProviderThumbnail, hapticLight } from "./utils";

export interface CourseInlineVideoPlayerProps {
  rawUrl: string;
  onClose?: () => void;
  /** Accepted for backward-compat; height is now derived from screen height. */
  playerWidth?: number;
  aspectRatio?: number;
  title?: string;
  previewUrl?: string | null;
  showCloseButton?: boolean;
  rounded?: boolean;
  /** Fired once when the lesson reaches the completion threshold (>= 80% watched). */
  onComplete?: () => void;
}

/**
 * In-scroll course video player.
 * Supports YouTube and Vimeo (WebView embed) and direct video files (expo-video).
 * Height is fixed at 35 % of the device screen height.
 * Auto-plays 5 s after mount; tapping the poster cancels the timer and plays immediately.
 */
export function CourseInlineVideoPlayer({
  rawUrl,
  onClose,
  title,
  previewUrl,
  showCloseButton = true,
  onComplete,
}: CourseInlineVideoPlayerProps) {
  const { height: screenHeight } = useWindowDimensions();
  const playerHeight = Math.round(screenHeight * 0.35);

  const [startedUrl, setStartedUrl] = useState<string | null>(null);

  // Guard so a lesson only fires onComplete once per URL.
  const completedRef = useRef(false);
  useEffect(() => {
    completedRef.current = false;
  }, [rawUrl]);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  const absoluteUrl = useMemo(() => {
    if (!rawUrl?.trim()) return null;
    const t = rawUrl.trim();
    if (/^https?:\/\//i.test(t)) return t;
    return resolveMediaUrl(t) ?? null;
  }, [rawUrl]);

  const parsed = useMemo(
    () => (absoluteUrl ? parseVideoUrl(absoluteUrl) : null),
    [absoluteUrl],
  );

  const posterUrl = useMemo(() => {
    const resolvedPreview = resolveMediaUrl(previewUrl);
    return resolvedPreview ?? getProviderThumbnail(parsed);
  }, [parsed, previewUrl]);

  const hasStarted = absoluteUrl != null && startedUrl === absoluteUrl;

  // Auto-play after 5 s. Cancelled immediately on manual tap. Resets on lesson change.
  useEffect(() => {
    if (!absoluteUrl) return;
    const timer = setTimeout(() => setStartedUrl(absoluteUrl), 5000);
    return () => clearTimeout(timer);
  }, [absoluteUrl]);

  const handleStart = useCallback(() => {
    hapticLight();
    setStartedUrl(absoluteUrl);
  }, [absoluteUrl]);

  const openInBrowser = useCallback(() => {
    hapticLight();
    const url = parsed?.openUrl ?? absoluteUrl;
    if (url) WebBrowser.openBrowserAsync(url).catch(() => { });
  }, [absoluteUrl, parsed?.openUrl]);

  const handleClose = useCallback(() => {
    hapticLight();
    onClose?.();
  }, [onClose]);

  const closeA11yLabel = title?.trim()
    ? `Close video: ${title.trim()}`
    : "Close video";
  const startA11yLabel = title?.trim()
    ? `Play video: ${title.trim()}`
    : "Play video";

  return (
    <View>
      <View className="bg-black">
        <View
          className="relative w-full items-center justify-center bg-black"
          style={{ minHeight: playerHeight }}
        >
          {!absoluteUrl ? (
            <Text
              className="px-6 py-8 text-center text-neutral-300"
              selectable
            >
              Invalid video link.
            </Text>
          ) : !hasStarted ? (
            <VideoPoster
              a11yLabel={startA11yLabel}
              height={playerHeight}
              posterUrl={posterUrl ?? null}
              title={title?.trim() ?? ""}
              onPlay={handleStart}
            />
          ) : (
            <VideoPlayerContent
              parsed={parsed}
              height={playerHeight}
              openInBrowser={openInBrowser}
              onComplete={handleComplete}
            />
          )}

          {showCloseButton ? (
            <Pressable
              accessibilityLabel={closeA11yLabel}
              accessibilityRole="button"
              className="absolute left-3 top-3 z-50 h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
              hitSlop={10}
              onPress={handleClose}
            >
              <X color="#ffffff" size={20} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
