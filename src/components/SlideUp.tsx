import React, { useState, useEffect } from "react";
import { View, Image, Pressable, Text, Animated, Easing, ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadowPresets } from "@/utils/useShadow";
interface SlideUpProps {
    visible?: boolean;
    onClose?: () => void;
    avatarSource?: ImageSourcePropType | string;
    name?: string;
}

export default function SlideUp({ visible = true, onClose, avatarSource, name }: SlideUpProps) {
    const insets = useSafeAreaInsets();
    const [showComponent, setShowComponent] = useState(visible);
    const [slideAnim] = useState(() => new Animated.Value(1000));
    const [opacityAnim] = useState(() => new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            // The component stays mounted long enough to animate out when `visible` becomes false.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowComponent(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(0.5)),
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 1000,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.cubic),
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.ease),
                })
            ]).start(() => {
                setShowComponent(false);
            });
        }
    }, [visible, slideAnim, opacityAnim]);

    const handleClose = () => {
        if (onClose) onClose();
    };

    if (!showComponent) return null;

    return (
        <>
            <Animated.View
                className="absolute right-0 bottom-0 p-4 z-50 w-full"
                style={{
                    paddingBottom: insets.bottom,
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim
                }}
            >
                <View
                    style={shadowPresets.large}
                    className="bg-text w-full rounded-3xl p-6 border border-border">
                    <View className="flex-col items-center justify-start p-6">
                        <Image source={typeof avatarSource === 'string' ? { uri: avatarSource } : avatarSource} className='w-16 h-16 rounded-full mb-2' />
                        <View className="flex-1 items-center">
                            <Text className="text-sm text-invert opacity-50">{name}</Text>
                        </View>

                    </View>
                    <Pressable className="w-full mt-4 items-center py-4 rounded-xl bg-invert" onPress={handleClose}>
                        <Text className="text-text font-bold">Close me</Text>
                    </Pressable>

                </View>
            </Animated.View>
        </>
    )
}
