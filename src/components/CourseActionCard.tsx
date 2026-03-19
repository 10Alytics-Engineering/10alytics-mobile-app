import useThemeColors from "@/contexts/ThemeColors";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode } from "react";
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";

type CourseAction = "continue" | "start" | "enroll";

interface CourseActionCardProps {
    title: string;
    subtitle: string;
    action?: CourseAction;
    progress?: number;
    icon?: ImageSourcePropType;
    /** When set, shown in the avatar slot instead of `icon` (e.g. SVG cover). */
    thumbnail?: ReactNode;
    onPress?: () => void;
}

const actionLabels: Record<CourseAction, string> = {
    continue: "Continue",
    start: "Start course",
    enroll: "Enroll",
};

export default function CourseActionCard({
    title,
    subtitle,
    action = "continue",
    progress,
    icon,
    thumbnail,
    onPress,
}: CourseActionCardProps) {
    const colors = useThemeColors();
    const isDark = colors.isDark;

    const accent = "#DA6728";
    const surface = isDark ? "#121212" : "#F9F6F2";
    const muted = isDark ? "rgba(255,255,255,0.7)" : "rgba(17,17,17,0.6)";
    const accentGlow = isDark ? "rgba(218, 103, 40, 0.35)" : "rgba(218, 103, 40, 0.25)";

    return (
        <View className="rounded-[30px] overflow-hidden" style={{ backgroundColor: surface }}>
            <LinearGradient
                colors={isDark ? ["#1B1410", "#0F0F0F"] : ["#FFF7EE", "#F1E7DC"]}
                style={{ padding: 20 }}
            >
                {/* Top row */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        {(thumbnail || icon) && (
                            <View
                                className="items-center justify-center rounded-2xl"
                                style={{
                                    width: 54,
                                    height: 54,
                                    backgroundColor: isDark ? "#1D1A18" : "#FFFFFF",
                                    borderWidth: 1,
                                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                                }}
                            >
                                {thumbnail ? (
                                    thumbnail
                                ) : (
                                    <Image
                                        source={icon!}
                                        style={{ width: 32, height: 32 }}
                                        resizeMode="contain"
                                    />
                                )}
                            </View>
                        )}
                        <View>
                            <Text style={{ color: colors.text }} className="text-xl font-bold">
                                {title}
                            </Text>
                            <Text style={{ color: muted }} className="text-xs uppercase tracking-wider mt-1">
                                {action === "continue" ? "In progress" : action === "start" ? "Not started" : "New course"}
                            </Text>
                        </View>
                    </View>
                    <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: accentGlow }}
                    >
                        <Text style={{ color: colors.text }} className="text-xs uppercase tracking-wider">
                            Course
                        </Text>
                    </View>
                </View>

                {/* Subtitle */}
                <Text style={{ color: muted }} className="text-sm mt-4">
                    {subtitle}
                </Text>

                {/* Progress */}
                {typeof progress === "number" && (
                    <View className="mt-4">
                        <View
                            className="rounded-full overflow-hidden"
                            style={{
                                height: 10,
                                backgroundColor: isDark ? "#2A2A2A" : "#E6D9CC",
                            }}
                        >
                            <LinearGradient
                                colors={["#DA6728", "#F08A4B"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: `${Math.max(0, Math.min(100, progress))}%`,
                                    height: "100%",
                                }}
                            />
                        </View>
                        <View className="flex-row items-center justify-between mt-2">
                            <Text style={{ color: muted }} className="text-xs">
                                {progress}% complete
                            </Text>
                            <Text style={{ color: muted }} className="text-xs">
                                {actionLabels[action]}
                            </Text>
                        </View>
                    </View>
                )}

                {/* CTA */}
                <Pressable
                    onPress={onPress}
                    className="mt-6 flex-row items-center justify-between rounded-2xl px-5 py-4"
                    style={{ backgroundColor: accent }}
                >
                    <View>
                        <Text className="text-white font-bold text-base">{actionLabels[action]}</Text>
                    </View>
                    <View
                        className="items-center justify-center rounded-full"
                        style={{ width: 34, height: 34, backgroundColor: "rgba(255,255,255,0.15)" }}
                    >
                        <Feather name="arrow-right" size={18} color="white" />
                    </View>
                </Pressable>
            </LinearGradient>
        </View>
    );
}
