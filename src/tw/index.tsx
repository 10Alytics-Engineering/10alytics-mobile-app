import { Link as RouterLink } from "expo-router";
import { cssInterop } from "nativewind";
import { PressableScale as PresstoPressableScale } from "pressto";
import React from "react";
import {
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
} from "react-native";
import Animated from "react-native-reanimated";
import {
  pressableConfig,
  triggerHaptic,
  type HapticType,
} from "./pressable-config";

type WithClassName<T> = T & {
  className?: string;
  contentContainerClassName?: string;
  contentClassName?: string;
};

const StyledPresstoPressableScale = cssInterop(PresstoPressableScale, {
  className: "style",
});

// Re-export Link from expo-router (no className support)
export const Link = (props: React.ComponentProps<typeof RouterLink>) => {
  const { className: _cn, ...rest } = props as WithClassName<
    React.ComponentProps<typeof RouterLink>
  >;
  return <RouterLink {...rest} />;
};
Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// Placeholder for any useCSSVariable usages (e.g. web)
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? (_variable: string) => undefined
    : (variable: string) => `var(${variable})`;

// View – pass style, ignore className
export type ViewProps = WithClassName<React.ComponentProps<typeof RNView>>;
export const View = (props: ViewProps) => {
  return <RNView {...props} />;
};
View.displayName = "View";

// Text
export type TextProps = WithClassName<React.ComponentProps<typeof RNText>>;
export const Text = (props: TextProps) => {
  return <RNText {...props} />;
};
Text.displayName = "Text";

// ScrollView – pass style and contentContainerStyle, ignore className
export type ScrollViewProps = WithClassName<
  React.ComponentProps<typeof RNScrollView>
>;
export const ScrollView = (props: ScrollViewProps) => {
  const { contentClassName: _contentCn, ...rest } = props;
  return <RNScrollView {...rest} />;
};
ScrollView.displayName = "ScrollView";

// Pressable
export type PressableProps = WithClassName<
  React.ComponentProps<typeof RNPressable>
>;
export const Pressable = (props: PressableProps) => {
  return <RNPressable {...props} />;
};
Pressable.displayName = "Pressable";

// TextInput
export type TextInputProps = WithClassName<
  React.ComponentProps<typeof RNTextInput>
>;
export const TextInput = (props: TextInputProps) => {
  return <RNTextInput {...props} />;
};
TextInput.displayName = "TextInput";

// AnimatedScrollView with native iOS defaults
export type AnimatedScrollViewProps = WithClassName<
  React.ComponentProps<typeof Animated.ScrollView>
>;
export const AnimatedScrollView = (props: AnimatedScrollViewProps) => {
  const {
    contentClassName: _contentCn,
    contentInsetAdjustmentBehavior,
    ...rest
  } = props;
  const behavior =
    Platform.OS === "ios" && contentInsetAdjustmentBehavior === undefined
      ? "automatic"
      : contentInsetAdjustmentBehavior;
  return (
    <Animated.ScrollView contentInsetAdjustmentBehavior={behavior} {...rest} />
  );
};
AnimatedScrollView.displayName = "AnimatedScrollView";

// TouchableHighlight
export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight>,
) => {
  return <RNTouchableHighlight {...props} />;
};
TouchableHighlight.displayName = "TouchableHighlight";

// PressableScale from pressto with haptics
export type PressableScaleProps = React.ComponentProps<
  typeof PresstoPressableScale
> & {
  className?: string;
  hapticType?: HapticType;
  enableHaptics?: boolean;
};

export const PressableScale = ({
  hapticType = pressableConfig.defaultHapticType,
  enableHaptics = pressableConfig.enableHaptics,
  onPress,
  ...props
}: PressableScaleProps) => {
  const handlePress = (event: any) => {
    if (enableHaptics) {
      triggerHaptic(hapticType);
    }
    onPress?.(event);
  };
  return <StyledPresstoPressableScale {...props} onPress={handlePress} />;
};
PressableScale.displayName = "PressableScale";

// TouchableOpacity
export const TouchableOpacity = (
  props: WithClassName<React.ComponentProps<typeof RNTouchableOpacity>>,
) => {
  return <RNTouchableOpacity {...props} />;
};
TouchableOpacity.displayName = "TouchableOpacity";

// KeyboardAvoidingView
export type KeyboardAvoidingViewProps = WithClassName<
  React.ComponentProps<typeof RNKeyboardAvoidingView>
>;
export const KeyboardAvoidingView = (props: KeyboardAvoidingViewProps) => {
  return <RNKeyboardAvoidingView {...props} />;
};
KeyboardAvoidingView.displayName = "KeyboardAvoidingView";

export {
  pressableConfig,
  triggerHaptic,
  type HapticType,
} from "./pressable-config";
