import { Link as RouterLink } from "expo-router";
import { PressableScale as PresstoPressableScale } from "pressto";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useCSSVariable, withUniwind } from "uniwind";

import { pressableConfig, triggerHaptic, type HapticType } from "./pressable-config";

export { useCSSVariable };

const UniwindPressableScale = withUniwind(PresstoPressableScale);

export const Link = (props: React.ComponentProps<typeof RouterLink>) => {
  const { className: _className, ...rest } = props as React.ComponentProps<
    typeof RouterLink
  > & { className?: string };
  return <RouterLink {...rest} />;
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;
Link.AppleZoom = RouterLink.AppleZoom;

export {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  KeyboardAvoidingView,
};

export type AnimatedScrollViewProps = React.ComponentProps<
  typeof Animated.ScrollView
> & {
  className?: string;
  contentContainerClassName?: string;
};

export const AnimatedScrollView = (props: AnimatedScrollViewProps) => {
  const {
    className: _className,
    contentContainerClassName: _contentContainerClassName,
    contentInsetAdjustmentBehavior,
    ...rest
  } = props;
  const behavior =
    Platform.OS === "ios" && contentInsetAdjustmentBehavior === undefined
      ? "automatic"
      : contentInsetAdjustmentBehavior;

  return (
    <Animated.ScrollView
      contentInsetAdjustmentBehavior={behavior}
      {...rest}
    />
  );
};

export type PressableScaleProps = React.ComponentProps<
  typeof PresstoPressableScale
> & {
  className?: string;
  hapticType?: HapticType;
  enableHaptics?: boolean;
};

export const PressableScale = ({
  onPress,
  hapticType = "light",
  enableHaptics = true,
  ...props
}: PressableScaleProps) => {
  const handlePress = (event: Parameters<NonNullable<typeof onPress>>[0]) => {
    if (enableHaptics) {
      triggerHaptic(hapticType);
    }
    onPress?.(event);
  };

  return <UniwindPressableScale {...props} onPress={handlePress} />;
};

export { pressableConfig, triggerHaptic, type HapticType };
