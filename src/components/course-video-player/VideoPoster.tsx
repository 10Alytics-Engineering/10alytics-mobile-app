import { Image } from "expo-image";
import { Play } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

export function VideoPoster({
  height,
  posterUrl,
  title,
  onPlay,
  a11yLabel,
}: {
  height: number;
  posterUrl: string | null;
  title: string;
  onPlay: () => void;
  a11yLabel: string;
}) {
  return (
    <Pressable
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
      className="relative w-full items-center justify-center overflow-hidden bg-black active:opacity-95"
      onPress={onPlay}
      style={{ minHeight: height }}
    >
      {posterUrl ? (
        <Image
          contentFit="cover"
          source={{ uri: posterUrl }}
          style={{
            bottom: 0,
            left: 0,
            opacity: 0.72,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
      ) : (
        <View className="absolute inset-0 bg-neutral-950" />
      )}

      <View className="absolute inset-0 bg-black/35" />

      <View className="h-20 w-20 items-center justify-center rounded-full bg-white/95">
        <Play color="#111318" fill="#111318" size={34} strokeWidth={2.4} />
      </View>

      <Text
        className="mt-4 px-8 text-center text-base font-semibold text-white"
        selectable
      >
        {title || "Play lesson"}
      </Text>
    </Pressable>
  );
}
