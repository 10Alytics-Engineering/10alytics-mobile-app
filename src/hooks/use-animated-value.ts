import { useState } from "react";
import { Animated } from "react-native";

export function useAnimatedValue(initialValue: number) {
  const [value] = useState(() => new Animated.Value(initialValue));
  return value;
}
