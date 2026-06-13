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
      onPress={onPlay}
      style={{ position: "relative", width: "100%", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#000", minHeight: height }}
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
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0A0A0A" }} />
      )}

      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" }} />

      <View style={{ height: 80, width: 80, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.95)" }}>
        <Play color="#111318" fill="#111318" size={34} strokeWidth={2.4} />
      </View>

      <Text
        style={{ marginTop: 16, paddingHorizontal: 32, textAlign: "center", fontSize: 16, fontWeight: "600", color: "#fff" }}
        selectable
      >
        {title || "Play lesson"}
      </Text>
    </Pressable>
  );
}
