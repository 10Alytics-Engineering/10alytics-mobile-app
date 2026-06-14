import React from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = "#DA6728",
  backgroundColor = "#E5E5E5",
  showPercentage = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    progressValue.set(withSpring(progress / 100, {
      damping: 15,
      stiffness: 100,
    }));
  }, [progress, progressValue]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progressValue.get());
    return {
      strokeDashoffset: withTiming(strokeDashoffset, { duration: 1000 }),
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {showPercentage && (
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: size * 0.2,
              fontWeight: "bold",
              color: color,
            }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
      )}
    </View>
  );
}
