import { Link as RouterLink } from 'expo-router';
import { PressableScale as PresstoPressableScale } from 'pressto';
import React from 'react';
// uniwind augments these RN components with a `className` prop globally
// (runtime via its metro transform, types via `uniwind/types`).
import {
  KeyboardAvoidingView as UWKeyboardAvoidingView,
  Platform,
  Pressable as UWPressable,
  ScrollView as UWScrollView,
  Text as UWText,
  TextInput as UWTextInput,
  TouchableHighlight as UWTouchableHighlight,
  TouchableOpacity as UWTouchableOpacity,
  View as UWView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import {
  type HapticType,
  pressableConfig,
  triggerHaptic,
} from './pressable-config';

type WithClassName<T> = T & {
  className?: string;
  contentContainerClassName?: string;
  contentClassName?: string;
};

const StyledPresstoPressableScale = withUniwind(PresstoPressableScale as React.ComponentType<any>);

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
export const useCSSVariable
  = process.env.EXPO_OS !== 'web'
    ? (_variable: string) => undefined
    : (variable: string) => `var(${variable})`;

export type ViewProps = WithClassName<React.ComponentProps<typeof UWView>>;
export const View = (props: ViewProps) => <UWView {...props} />;
View.displayName = 'View';

export type TextProps = WithClassName<React.ComponentProps<typeof UWText>>;
export const Text = (props: TextProps) => <UWText {...props} />;
Text.displayName = 'Text';

export type ScrollViewProps = WithClassName<
  React.ComponentProps<typeof UWScrollView>
>;
export const ScrollView = (props: ScrollViewProps) => {
  const { contentClassName: _contentCn, ...rest } = props;
  return <UWScrollView {...rest} />;
};
ScrollView.displayName = 'ScrollView';

export type PressableProps = WithClassName<
  React.ComponentProps<typeof UWPressable>
>;
export const Pressable = (props: PressableProps) => <UWPressable {...props} />;
Pressable.displayName = 'Pressable';

export type TextInputProps = WithClassName<
  React.ComponentProps<typeof UWTextInput>
>;
export const TextInput = (props: TextInputProps) => <UWTextInput {...props} />;
TextInput.displayName = 'TextInput';

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
  const behavior
    = Platform.OS === 'ios' && contentInsetAdjustmentBehavior === undefined
      ? 'automatic'
      : contentInsetAdjustmentBehavior;
  return (
    <Animated.ScrollView contentInsetAdjustmentBehavior={behavior} {...rest} />
  );
};
AnimatedScrollView.displayName = 'AnimatedScrollView';

export const TouchableHighlight = (
  props: React.ComponentProps<typeof UWTouchableHighlight>,
) => <UWTouchableHighlight {...props} />;
TouchableHighlight.displayName = 'TouchableHighlight';

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
    if (enableHaptics)
      triggerHaptic(hapticType);
    onPress?.(event);
  };
  return <StyledPresstoPressableScale {...props} onPress={handlePress} />;
};
PressableScale.displayName = 'PressableScale';

export const TouchableOpacity = (
  props: WithClassName<React.ComponentProps<typeof UWTouchableOpacity>>,
) => <UWTouchableOpacity {...props} />;
TouchableOpacity.displayName = 'TouchableOpacity';

export type KeyboardAvoidingViewProps = WithClassName<
  React.ComponentProps<typeof UWKeyboardAvoidingView>
>;
export const KeyboardAvoidingView = (props: KeyboardAvoidingViewProps) => (
  <UWKeyboardAvoidingView {...props} />
);
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export {
  type HapticType,
  pressableConfig,
  triggerHaptic,
} from './pressable-config';
