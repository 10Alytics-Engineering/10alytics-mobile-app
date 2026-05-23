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
      className="items-center justify-center gap-4 px-6 bg-black"
      style={{ height, width: "100%" }}
    >
      <Text className="text-center text-base text-neutral-200" selectable>
        This video could not be played in the app.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="rounded-xl bg-white/15 px-5 py-3 active:opacity-80"
        onPress={() => WebBrowser.openBrowserAsync(openUrl).catch(() => {})}
      >
        <Text className="text-center font-medium text-white">
          Open in browser
        </Text>
      </Pressable>
    </View>
  );
}
