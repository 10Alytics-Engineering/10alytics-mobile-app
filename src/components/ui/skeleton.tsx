import React, { useEffect } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export interface SkeletonProps {
    style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing placeholder block for loading layouts. Pass size/radius/background via `style`.
 */
export function Skeleton({ style }: SkeletonProps) {
    const opacity = useSharedValue(0.42);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.85, {
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                }),
                withTiming(0.42, {
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                }),
            ),
            -1,
            false,
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <Animated.View style={[style, animatedStyle]} />;
}
