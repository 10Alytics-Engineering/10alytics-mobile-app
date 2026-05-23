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
      className="items-center justify-center gap-4 px-6 py-8"
      style={{ minHeight: height, width: "100%" }}
    >
      <Text className="text-center text-base text-neutral-200" selectable>
        Open this link in your browser to watch.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="rounded-xl bg-white/15 px-5 py-3 active:opacity-80"
        onPress={onOpenBrowser}
      >
        <Text className="text-center font-medium text-white">
          Open in browser
        </Text>
      </Pressable>
    </View>
  );
}
