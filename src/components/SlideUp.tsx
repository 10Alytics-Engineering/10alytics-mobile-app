import React, { useState, useRef, useEffect } from "react";
import { View, Image, Pressable, Text, Animated, Easing, ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeColors from "@/contexts/ThemeColors";
import { shadowPresets } from "@/utils/useShadow";
interface SlideUpProps {
    visible?: boolean;
    onClose?: () => void;
    avatarSource?: ImageSourcePropType | string;
    name?: string;
}

export default function SlideUp({ visible = true, onClose, avatarSource, name }: SlideUpProps) {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const [showComponent, setShowComponent] = useState(visible);
    const slideAnim = useRef(new Animated.Value(1000)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
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
    }, [visible]);

    const handleClose = () => {
        if (onClose) onClose();
    };

    if (!showComponent) return null;

    return (
        <>
            <Animated.View
                style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    padding: 16,
                    zIndex: 50,
                    width: "100%",
                    paddingBottom: insets.bottom,
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                }}
            >
                <View
                    style={[
                        shadowPresets.large,
                        {
                            backgroundColor: colors.text,
                            width: "100%",
                            borderRadius: 24,
                            padding: 24,
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                    ]}>
                    <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: 24 }}>
                        <Image
                            source={typeof avatarSource === "string" ? { uri: avatarSource } : avatarSource}
                            style={{ width: 64, height: 64, borderRadius: 9999, marginBottom: 8 }}
                        />
                        <View style={{ flex: 1, alignItems: "center" }}>
                            <Text style={{ fontSize: 14, color: colors.invert, opacity: 0.5 }}>{name}</Text>
                        </View>

                    </View>
                    <Pressable
                        style={{ width: "100%", marginTop: 16, alignItems: "center", paddingVertical: 16, borderRadius: 12, backgroundColor: colors.invert }}
                        onPress={handleClose}>
                        <Text style={{ color: colors.text, fontWeight: "700" }}>Close me</Text>
                    </Pressable>

                </View>
            </Animated.View>
        </>
    )
}