import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export function VideoLoadingOverlay({ height }: { height: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: "#000000",
      }}
    >
      <ActivityIndicator color="#FFFFFF" size="large" />
      <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "500" }}>
        Loading video…
      </Text>
    </View>
  );
}
