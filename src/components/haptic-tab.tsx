import useThemeColors from '@/contexts/ThemeColors';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
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
        className="items-center justify-center rounded-full px-3 py-1.5"
        style={{
          backgroundColor: focused ? colors.tabPillActive : 'transparent',
        }}
      >
        {children}
      </View>
    </PlatformPressable>
  );
}
