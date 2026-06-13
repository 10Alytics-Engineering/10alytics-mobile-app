import React from "react";
import { Pressable, Text, View } from "react-native";

export function VideoUnsupportedFallback({
  height,
  onOpenBrowser,
}: {
  height: number;
  onOpenBrowser: () => void;
}) {
  return (
    <View
      style={{ alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 24, paddingVertical: 32, minHeight: height, width: "100%" }}
    >
      <Text style={{ textAlign: "center", fontSize: 16, color: "#E5E5E5" }} selectable>
        Open this link in your browser to watch.
      </Text>
      <Pressable
        accessibilityRole="button"
        style={{ borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 20, paddingVertical: 12 }}
        onPress={onOpenBrowser}
      >
        <Text style={{ textAlign: "center", fontWeight: "500", color: "#fff" }}>
          Open in browser
        </Text>
      </Pressable>
    </View>
  );
}
