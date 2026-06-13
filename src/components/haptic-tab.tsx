import useThemeColors from '@/contexts/ThemeColors';
import { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { PlatformPressable } from 'expo-router/react-navigation';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';

export function HapticTab({
  children,
  style,
  onPressIn,
  accessibilityState,
  ...rest
}: BottomTabBarButtonProps) {
  const colors = useThemeColors();
  const focused = accessibilityState?.selected === true;

  return (
    <PlatformPressable
      {...rest}
      accessibilityState={accessibilityState}
      style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 9999,
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: focused ? colors.tabPillActive : 'transparent',
        }}
      >
        {children}
      </View>
    </PlatformPressable>
  );
}
