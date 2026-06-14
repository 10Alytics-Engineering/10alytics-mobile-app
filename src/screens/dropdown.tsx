import { StatusBar } from "expo-status-bar";
import { View, Text, Image, ImageBackground, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import Animated, { type SharedValue, useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState, type ComponentProps } from "react";

const DROPDOWN_LINKS = [
    { icon: "user", label: "Profile" },
    { icon: "settings", label: "Settings" },
    { icon: "bell", label: "Notifications" },
    { icon: "log-out", label: "Logout" },
] as const;

type FeatherIconName = ComponentProps<typeof Feather>["name"];

function DropdownLink({
    icon,
    label,
    index,
    isExpanded,
}: {
    icon: FeatherIconName;
    label: string;
    index: number;
    isExpanded: SharedValue<number>;
}) {
    const linkAnimatedStyle = useAnimatedStyle(() => {
        const delay = index * 0.08;
        const progress = isExpanded.get();
        const adjustedProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
        const opacity = interpolate(adjustedProgress, [0, 0.5, 1], [0, 0, 1]);
        const translateY = interpolate(adjustedProgress, [0, 1], [10, 0]);
        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    return (
        <Animated.View style={linkAnimatedStyle}>
            <Pressable
                className="flex-row items-center py-3 pl-4 pr-3 mb-2 rounded-3xl border border-white/5"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
                <Feather name={icon} size={17} color="white" />
                <Text className="text-white text-base font-medium ml-3">{label}</Text>
                <Feather name="chevron-right" size={14} color="white" className="ml-auto opacity-60" />
            </Pressable>
        </Animated.View>
    );
}

export default function Dropdown() {
    const insets = useSafeAreaInsets();
    const isExpanded = useSharedValue(0);
    const [expanded, setExpanded] = useState(false);

    const toggleDropdown = () => {
        const nextExpanded = !expanded;
        setExpanded(nextExpanded);
        isExpanded.set(withSpring(nextExpanded ? 1 : 0, {
            damping: 90,
            stiffness: 700,
        }));
    };

    const dropdownAnimatedStyle = useAnimatedStyle(() => {
        const progress = isExpanded.get();
        const width = interpolate(progress, [0, 1], [160, 260]);
        const height = interpolate(progress, [0, 1], [48, 290]);
        const borderRadius = interpolate(progress, [0, 1], [30, 30]);

        return {
            width,
            height,
            borderRadius,
        };
    });

    const iconAnimatedStyle = useAnimatedStyle(() => {
        const progress = isExpanded.get();
        const rotate = interpolate(progress, [0, 1], [0, 0]);
        const translateX = interpolate(progress, [0, 1], [0, -10]);
        const translateY = interpolate(progress, [0, 1], [0, 10]);
        return {
            transform: [{ rotate: `${rotate}deg` }, { translateX }, { translateY }],
        };
    });

    const onlineAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(isExpanded.get(), [0, 1], [0, 1]);
        return {
            transform: [{ scale }],
        };
    });

    const profileAnimatedStyle = useAnimatedStyle(() => {
        const progress = isExpanded.get();
        const scale = interpolate(progress, [0, 1], [1, 1.3]);
        const translateX = interpolate(progress, [0, 1], [0, 10]);
        const translateY = interpolate(progress, [0, 1], [0, 10]);
        return {
            transform: [{ scale }, { translateX }, { translateY }],
        };
    });

    const nameAnimatedStyle = useAnimatedStyle(() => {
        const progress = isExpanded.get();
        const scale = interpolate(progress, [0, 1], [1, 1.3]);
        const translateX = interpolate(progress, [0, 1], [0, 20]);
        const translateY = interpolate(progress, [0, 1], [0, 10]);
        return {
            transform: [{ scale }, { translateX }, { translateY }],
        };
    });

    const rotateAnimatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(isExpanded.get(), [0, 1], [0, 180]);
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />
            <ImageBackground source={require("@/assets/img/bg.webp")} className="w-full h-full relative" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <View className="flex-1 p-6 justify-start">
                    <Animated.View style={dropdownAnimatedStyle} className="relative  rounded-3xl overflow-hidden">
                        {/* BlurView background */}
                        <BlurView
                            intensity={40}
                            tint="light"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,

                            }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0)',
                                }}
                            />
                        </BlurView>

                        {/* Header */}
                        <Pressable onPress={toggleDropdown} className="flex-row items-center px-2 py-2">
                            <Animated.View style={[profileAnimatedStyle, { transformOrigin: 'left' }]} className="origin-left  relative w-10 h-10 rounded-full">
                                <Image source={require("@/assets/img/user-1.jpg")} className="w-10 h-10 border border-black/20 rounded-full" />
                                <Animated.View style={onlineAnimatedStyle} className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border border-[#333430]" />
                            </Animated.View>
                            <Animated.View style={nameAnimatedStyle}>
                                <Text className="text-white mx-3 text-sm font-semibold">John Doe</Text>
                            </Animated.View>
                            <Animated.View style={iconAnimatedStyle} className="ml-auto mr-1">
                                <Animated.View style={rotateAnimatedStyle}>
                                    <Feather name="chevron-down" size={16} color="white" />
                                </Animated.View>
                            </Animated.View>
                        </Pressable>

                        {/* Dropdown Links */}
                        <View className="px-4 pt-8" pointerEvents={expanded ? "auto" : "none"}>
                            {DROPDOWN_LINKS.map((link, index) => (
                                <DropdownLink
                                    key={link.label}
                                    icon={link.icon}
                                    label={link.label}
                                    index={index}
                                    isExpanded={isExpanded}
                                />
                            ))}
                        </View>
                    </Animated.View>
                </View>
                <View className="px-4">
                    <Pressable onPress={() => router.push("/")} className="rounded-2xl bg-neutral-950 p-4 items-center justify-center flex">
                        <Text className="text-white text-base font-semibold">Home</Text>
                    </Pressable>
                </View>
            </ImageBackground>
        </View>
    );
}
