import { Colors, GlassStyles } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const absoluteFillObject = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "light" | "medium" | "dark";
  borderAccent?: string;
  animated?: boolean;
  animationDelay?: number;
  animationDirection?: "up" | "down";
  blur?: "light" | "medium" | "heavy";
  showBorder?: boolean;
  showGradientBorder?: boolean;
}

export function GlassCard({
  children,
  style,
  variant = "medium",
  borderAccent,
  animated = true,
  animationDelay = 100,
  animationDirection = "down",
  blur = "light",
  showBorder = true,
  showGradientBorder = false,
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const getBackgroundColor = () => {
    switch (variant) {
      case "light":
        return colors.glass.backgroundLight;
      case "dark":
        return colors.glass.backgroundDark;
      default:
        return colors.glass.background;
    }
  };

  const blurIntensity = GlassStyles.blur[blur];

  const cardContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: showBorder ? colors.glass.border : "transparent",
          borderLeftColor:
            borderAccent || (showBorder ? colors.glass.border : "transparent"),
          borderLeftWidth: borderAccent ? 4 : 1,
          ...GlassStyles.shadow.medium,
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      {showGradientBorder && (
        <LinearGradient
          colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (!animated) {
    return cardContent;
  }

  const Animation = animationDirection === "up" ? FadeInUp : FadeInDown;

  return (
    <Animated.View entering={Animation.delay(animationDelay).springify()}>
      {cardContent}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: GlassStyles.borderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  gradientBorder: {
    ...absoluteFillObject,
    opacity: 0.3,
  },
  content: {
    padding: GlassStyles.spacing.md,
  },
});
