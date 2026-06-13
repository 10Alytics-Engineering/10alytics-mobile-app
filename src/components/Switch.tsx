import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, TouchableOpacity, StyleProp, ViewStyle, Text } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/contexts/ThemeColors';

interface SwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = '',
  style,
}) => {
  const colors = useThemeColors();
  const [isOn, setIsOn] = useState(value ?? false);
  const slideAnim = useRef(new Animated.Value(value ?? false ? 1 : 0)).current;

  // Handle controlled vs uncontrolled state
  const isControlled = value !== undefined;
  const switchValue = isControlled ? value : isOn;

  // Sync animation with controlled value changes
  useEffect(() => {
    if (isControlled) {
      Animated.spring(slideAnim, {
        toValue: value ? 1 : 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12
      }).start();
    }
  }, [value, isControlled, slideAnim]);

  const toggleSwitch = () => {
    if (disabled) return;

    const newValue = !switchValue;

    // Update internal state if uncontrolled
    if (!isControlled) {
      setIsOn(newValue);
    }

    // Call callback if provided
    onChange?.(newValue);

    // Animate the switch
    Animated.spring(slideAnim, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
      bounciness: 10,
      speed: 12
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleSwitch}
      disabled={disabled}
      style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingLeft: 16, paddingRight: 16 }, style]}
    >
      {icon && (
        <View style={{ width: 48, height: 48, borderRadius: 9999, backgroundColor: colors.bg, marginRight: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon as any} size={18} color={colors.icon} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        {label && (
          <Text style={{ fontWeight: '600', fontSize: 16, color: colors.text }}>{label}</Text>
        )}
        {description && (
          <Text style={{ fontSize: 12, opacity: 0.5, paddingRight: 16, color: colors.text }}>
            {description}
          </Text>
        )}
      </View>


      <View style={{ width: 56, height: 32, borderRadius: 9999 }}>
        <View
          style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: colors.border, borderRadius: 9999, position: 'absolute', backgroundColor: switchValue ? colors.highlight : colors.bg }}
        />
        <Animated.View
          style={{
            width: 24,
            height: 24,
            backgroundColor: '#fff',
            borderRadius: 9999,
            marginVertical: 3,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [-0.2, 1.2],
                outputRange: [1, 28]
              })
            }]
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default Switch; 