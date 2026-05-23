import * as Haptics from "expo-haptics";

import { parseVideoUrl } from "@/utils/video-platform";

export function isLikelyDirectVideoUrl(url: string): boolean {
  const path = url.toLowerCase().split("?")[0] ?? "";
  return /\.(mp4|m3u8|webm|mov)$/i.test(path);
}

export function hapticLight(): void {
  if (process.env.EXPO_OS === "ios") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

export function getProviderThumbnail(
  parsed: ReturnType<typeof parseVideoUrl>,
): string | null {
  if (!parsed?.videoId) return null;
  if (parsed.provider === "youtube") {
    return `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg`;
  }
  if (parsed.provider === "vimeo") {
    return `https://vumbnail.com/${parsed.videoId}.jpg`;
  }
  return null;
}
