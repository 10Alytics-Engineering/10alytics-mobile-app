import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description?: string;
  points?: number;
  unlocked?: boolean;
  onPress?: () => void;
}

export function AchievementBadge({
  icon,
  title,
  description,
  points,
  unlocked = true,
  onPress,
}: AchievementBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (unlocked) {
      scale.set(withRepeat(
        withSequence(
          withSpring(1.1, { damping: 10 }),
          withSpring(1, { damping: 10 })
        ),
        2,
        false
      ));
    }
  }, [scale, unlocked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const content = (
    <Animated.View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          borderRadius: 16,
          backgroundColor: unlocked
            ? `${colors.primary}15`
            : `${colors.icon}10`,
          opacity: unlocked ? 1 : 0.5,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ fontSize: 48, marginBottom: 8 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: unlocked ? colors.text : colors.icon,
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: 12,
            color: colors.icon,
            textAlign: "center",
            marginTop: 4,
          }}
          numberOfLines={2}
        >
          {description}
        </Text>
      )}
      {points && (
        <View
          style={{
            marginTop: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: unlocked ? colors.primary : colors.icon,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: "#FFFFFF",
            }}
          >
            +{points} pts
          </Text>
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
