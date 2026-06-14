import React from "react";
import { View, Text } from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
// Using emoji instead of icon for better compatibility

interface StreakCounterProps {
  days: number;
  size?: "small" | "medium" | "large";
}

export function StreakCounter({ days, size = "medium" }: StreakCounterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.set(withRepeat(
      withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 8 })
      ),
      -1,
      true
    ));
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const sizeConfig = {
    small: { icon: 20, text: 14, container: 16 },
    medium: { icon: 28, text: 18, container: 20 },
    large: { icon: 36, text: 24, container: 24 },
  };

  const config = sizeConfig[size];

  return (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: `${colors.primary}15`,
        paddingHorizontal: config.container,
        paddingVertical: config.container * 0.6,
        borderRadius: 20,
      }}
    >
      <Animated.View style={animatedStyle}>
        <Text style={{ fontSize: config.icon }}>🔥</Text>
      </Animated.View>
      <View style={{ marginLeft: 8 }}>
        <Text
          style={{
            fontSize: config.text,
            fontWeight: "bold",
            color: colors.text,
          }}
        >
          {days} day streak
        </Text>
        <Text
          style={{
            fontSize: config.text * 0.7,
            color: colors.icon,
            marginTop: 2,
          }}
        >
          Keep it up! 🔥
        </Text>
      </View>
    </Animated.View>
  );
}
