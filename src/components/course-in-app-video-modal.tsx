import * as Haptics from "expo-haptics";
import { useVideoPlayer, VideoView } from "expo-video";
import * as WebBrowser from "expo-web-browser";
import { X } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useVimeoPlayer, VimeoView } from "react-native-vimeo-bridge";
import { WebView } from "react-native-webview";

import {
    getYoutubeEmbedPageOrigin,
    resolveMediaUrl,
} from "@/utils/resolve-media-url";
import { parseVideoUrl } from "@/utils/video-platform";

function isLikelyDirectVideoUrl(url: string): boolean {
    const path = url.toLowerCase().split("?")[0] ?? "";
    return /\.(mp4|m3u8|webm|mov)$/i.test(path);
}

/** YouTube embed pages are HTML, not media streams — AVPlayer/expo-video cannot play them. */
function youtubeEmbedHtml(videoId: string, pageOrigin: string): string {
    const id = encodeURIComponent(videoId);
    const qs = new URLSearchParams({
        playsinline: "1",
        rel: "0",
        modestbranding: "1",
        enablejsapi: "1",
        origin: pageOrigin,
    });
    const src = `https://www.youtube.com/embed/${id}?${qs.toString()}`;
    const srcAttr = src.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${srcAttr}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></body></html>`;
}

function YoutubeWebPlayer({
    videoId,
    openUrl,
    height,
}: {
    videoId: string;
    openUrl: string;
    height: number;
}) {
    const [failed, setFailed] = useState(false);
    const pageOrigin = useMemo(() => getYoutubeEmbedPageOrigin(), []);
    const html = useMemo(
        () => youtubeEmbedHtml(videoId, pageOrigin),
        [videoId, pageOrigin],
    );

    if (failed) {
        return (
            <View
                className="items-center justify-center gap-4 px-6 bg-black"
                style={{ height, width: "100%" }}
            >
                <Text className="text-center text-base text-neutral-200" selectable>
                    This video could not be played in the app.
                </Text>
                <Pressable
                    accessibilityRole="button"
                    className="rounded-xl bg-white/15 px-5 py-3 active:opacity-80"
                    onPress={() => {
                        WebBrowser.openBrowserAsync(openUrl).catch(() => { });
                    }}
                >
                    <Text className="text-center font-medium text-white">
                        Open in browser
                    </Text>
                </Pressable>
            </View>
        );
    }

    return (
        <WebView
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onError={() => setFailed(true)}
            onHttpError={() => setFailed(true)}
            originWhitelist={["*"]}
            source={{ html, baseUrl: pageOrigin }}
            style={{ height, width: "100%", backgroundColor: "#000" }}
        />
    );
}

function VimeoBridgePlayer({
    playerUrl,
    width,
    height,
}: {
    playerUrl: string;
    width: number;
    height: number;
}) {
    const player = useVimeoPlayer(playerUrl, {
        autoplay: true,
        controls: true,
    });
    return (
        <VimeoView
            height={process.env.EXPO_OS === "web" ? "auto" : height}
            iframeStyle={{ aspectRatio: 16 / 9 }}
            player={player}
            style={{ alignSelf: "center", maxHeight: height }}
            webViewProps={{
                renderToHardwareTextureAndroid: true,
                injectedJavaScriptBeforeContentLoaded: `
                Object.defineProperty(document, 'referrer', {get : function(){ return "https://www.10alytics.io"; }});
                true;
              `,
            }}
            width={width}
        />
    );
}

function DirectExpoPlayer({ url, height }: { url: string; height: number }) {
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

function hapticLight(): void {
    if (process.env.EXPO_OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    }
}

export interface CourseInlineVideoPlayerProps {
    rawUrl: string;
    onClose: () => void;
    playerWidth: number;
    /** Used for accessibility on the floating close control */
    title?: string;
}

/**
 * In-scroll course video: YouTube (WebView embed), Vimeo (react-native-vimeo-bridge), or direct file (expo-video).
 */
export function CourseInlineVideoPlayer({
    rawUrl,
    onClose,
    playerWidth,
    title,
}: CourseInlineVideoPlayerProps) {
    const playerHeight = Math.round((playerWidth * 9) / 16);

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

    const openInBrowser = useCallback(() => {
        hapticLight();
        const url = parsed?.openUrl ?? absoluteUrl;
        if (url) WebBrowser.openBrowserAsync(url).catch(() => { });
    }, [absoluteUrl, parsed?.openUrl]);

    const handleClose = useCallback(() => {
        hapticLight();
        onClose();
    }, [onClose]);

    const closeA11yLabel = title?.trim()
        ? `Close video: ${title.trim()}`
        : "Close video";

    return (
        <Animated.View entering={FadeInDown.springify()}>
            <View
                className="overflow-hidden rounded-2xl bg-black"
                style={{ borderCurve: "continuous" }}
            >
                <View
                    className="relative w-full items-center justify-center bg-black"
                    style={{ minHeight: playerHeight }}
                >
                    {!absoluteUrl ? (
                        <Text className="px-6 py-8 text-center text-neutral-300" selectable>
                            Invalid video link.
                        </Text>
                    ) : parsed?.provider === "youtube" && parsed.videoId ? (
                        <YoutubeWebPlayer
                            height={playerHeight}
                            openUrl={parsed.openUrl}
                            videoId={parsed.videoId}
                        />
                    ) : parsed?.provider === "vimeo" && parsed.embedUrl ? (
                        <VimeoBridgePlayer
                            height={playerHeight}
                            playerUrl={parsed.embedUrl}
                            width={playerWidth}
                        />
                    ) : parsed?.provider === "unknown" &&
                        isLikelyDirectVideoUrl(parsed.openUrl) ? (
                        <DirectExpoPlayer height={playerHeight} url={parsed.openUrl} />
                    ) : (
                        <View
                            className="items-center justify-center gap-4 px-6 py-8"
                            style={{ minHeight: playerHeight, width: "100%" }}
                        >
                            <Text className="text-center text-base text-neutral-200" selectable>
                                Open this link in your browser to watch.
                            </Text>
                            <Pressable
                                accessibilityRole="button"
                                className="rounded-xl bg-white/15 px-5 py-3 active:opacity-80"
                                onPress={openInBrowser}
                            >
                                <Text className="text-center font-medium text-white">
                                    Open in browser
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    <Pressable
                        accessibilityLabel={closeA11yLabel}
                        accessibilityRole="button"
                        className="absolute left-3 top-3 z-50 h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-80"
                        hitSlop={10}
                        onPress={handleClose}
                    >
                        <X color="#ffffff" size={20} strokeWidth={2.2} />
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
}
