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
    cohortName?: string;
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
    cohortName,
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

    return (
        <View style={{ borderRadius: 30, overflow: "hidden", backgroundColor: surface }}>
            <LinearGradient
                colors={isDark ? ["#1B1410", "#0F0F0F"] : ["#FFF7EE", "#F1E7DC"]}
                style={{ padding: 20 }}
            >
                {/* Top row */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        {(thumbnail || icon) && (
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 16,
                                    width: 54,
                                    height: 54,
                                    backgroundColor: "#DA6728",
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
                            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                                {title}
                            </Text>
                            <Text style={{ color: muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>
                                {action === "continue" ? "In progress" : action === "start" ? "Not started" : "New course"}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>

                    {/* Subtitle */}
                    <Text style={{ color: muted, fontSize: 14, marginTop: 16 }}>
                        {subtitle}
                    </Text>

                    {cohortName && (
                        <Text style={{ color: muted, fontSize: 14, marginTop: 16 }}>
                            {cohortName}
                        </Text>
                    )}
                </View>

                {/* Progress */}
                {typeof progress === "number" && (
                    <View style={{ marginTop: 16 }}>
                        <View
                            style={{
                                borderRadius: 9999,
                                overflow: "hidden",
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
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                            <Text style={{ color: muted, fontSize: 12 }}>
                                {progress}% complete
                            </Text>
                            <Text style={{ color: muted, fontSize: 12 }}>
                                {actionLabels[action]}
                            </Text>
                        </View>
                    </View>
                )}

                {/* CTA */}
                <Pressable
                    onPress={onPress}
                    style={{
                        marginTop: 24,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        backgroundColor: accent,
                    }}
                >
                    <View>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{actionLabels[action]}</Text>
                    </View>
                    <View
                        style={{ alignItems: "center", justifyContent: "center", borderRadius: 9999, width: 34, height: 34, backgroundColor: "rgba(255,255,255,0.15)" }}
                    >
                        <Feather name="arrow-right" size={18} color="white" />
                    </View>
                </Pressable>
            </LinearGradient>
        </View>
    );
}
