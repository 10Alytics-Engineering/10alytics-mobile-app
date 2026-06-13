import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Pressable, Text, View } from "react-native";

export function VideoErrorFallback({
  height,
  openUrl,
}: {
  height: number;
  openUrl: string;
}) {
  return (
    <View
      style={{ alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 24, backgroundColor: "#000", height, width: "100%" }}
    >
      <Text style={{ textAlign: "center", fontSize: 16, color: "#E5E5E5" }} selectable>
        This video could not be played in the app.
      </Text>
      <Pressable
        accessibilityRole="button"
        style={{ borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 20, paddingVertical: 12 }}
        onPress={() => WebBrowser.openBrowserAsync(openUrl).catch(() => {})}
      >
        <Text style={{ textAlign: "center", fontWeight: "500", color: "#fff" }}>
          Open in browser
        </Text>
      </Pressable>
    </View>
  );
}
