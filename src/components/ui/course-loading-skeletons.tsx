import React from "react";
import { ScrollView, View } from "react-native";

import useThemeColors from "@/contexts/ThemeColors";

import { Skeleton } from "./skeleton";

interface HomeCoursesCarouselSkeletonProps {
    cardWidth: number;
}

/** Horizontal row of cards matching the home "Your courses" carousel. */
export function HomeCoursesCarouselSkeleton({ cardWidth }: HomeCoursesCarouselSkeletonProps) {
    const colors = useThemeColors();
    const base = colors.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    const soft = colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
            contentContainerStyle={{ gap: 16, paddingRight: 24 }}
        >
            {[0, 1].map((key) => (
                <View
                    key={key}
                    style={{
                        width: cardWidth,
                        overflow: "hidden",
                        borderRadius: 30,
                        padding: 20,
                        backgroundColor: colors.isDark ? "#1B1410" : "#F1E7DC",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <View style={{ flexDirection: "row", flex: 1, alignItems: "center", gap: 12 }}>
                            <Skeleton style={{ height: 54, width: 54, borderRadius: 16, backgroundColor: base }} />
                            <View style={{ minWidth: 0, flex: 1, gap: 8 }}>
                                <Skeleton style={{ height: 20, width: "100%", maxWidth: 200, borderRadius: 8, backgroundColor: base }} />
                                <Skeleton style={{ height: 12, width: 96, borderRadius: 6, backgroundColor: soft }} />
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 20, gap: 8 }}>
                        <Skeleton style={{ height: 8, width: "100%", borderRadius: 9999, backgroundColor: soft }} />
                        <Skeleton style={{ height: 12, width: 64, borderRadius: 6, backgroundColor: soft }} />
                    </View>
                    <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Skeleton style={{ height: 40, width: 112, borderRadius: 12, backgroundColor: base }} />
                        <Skeleton style={{ height: 16, width: 16, borderRadius: 4, backgroundColor: soft }} />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

interface CoursesTabListSkeletonProps {
    backgroundColor: string;
    isDark: boolean;
}

/** Vertical list placeholder matching `JournalCard` rows on the courses tab. */
export function CoursesTabListSkeleton({ backgroundColor, isDark }: CoursesTabListSkeletonProps) {
    const base = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    const soft = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
    const secondary = isDark ? "#262626" : "#ffffff";

    return (
        <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor }}>
            <View style={{ marginBottom: 16, marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Skeleton style={{ height: 28, width: 160, borderRadius: 8, backgroundColor: base }} />
            </View>
            {[0, 1, 2, 3].map((key) => (
                <View key={key} style={{ marginBottom: 24, overflow: "hidden", borderRadius: 16, backgroundColor: secondary, padding: 20 }}>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                        <Skeleton style={{ height: 96, width: 96, borderRadius: 16, backgroundColor: base }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <Skeleton style={{ height: 12, width: 112, borderRadius: 6, backgroundColor: soft }} />
                            <Skeleton style={{ height: 20, width: "100%", borderRadius: 8, backgroundColor: base }} />
                            <Skeleton style={{ height: 16, width: "100%", borderRadius: 6, backgroundColor: soft }} />
                            <Skeleton style={{ marginTop: 8, height: 16, width: "92%", borderRadius: 6, backgroundColor: soft }} />
                            <Skeleton style={{ marginTop: 12, height: 8, width: "100%", borderRadius: 9999, backgroundColor: soft }} />
                            <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Skeleton style={{ height: 36, width: 96, borderRadius: 12, backgroundColor: base }} />
                                <Skeleton style={{ height: 16, width: 16, borderRadius: 4, backgroundColor: soft }} />
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

export interface LuminaCourseDetailSkeletonProps {
    heroH: number;
    surfaceHighest: string;
    surfaceHigh: string;
}

/** Full-width placeholders for the Lumina course detail screen while `useUserCourseDetail` loads. */
export function LuminaCourseDetailSkeleton({
    heroH,
    surfaceHighest,
    surfaceHigh,
}: LuminaCourseDetailSkeletonProps) {
    return (
        <View style={{ width: "100%", gap: 20, paddingVertical: 16 }}>
            <Skeleton style={{ width: "100%", overflow: "hidden", borderRadius: 16, height: heroH, backgroundColor: surfaceHighest }} />
            <View style={{ gap: 12 }}>
                <Skeleton style={{ height: 24, width: "75%", borderRadius: 8, backgroundColor: surfaceHighest }} />
                <Skeleton style={{ height: 16, width: "100%", borderRadius: 8, backgroundColor: surfaceHigh }} />
                <Skeleton style={{ height: 16, width: "83.33%", borderRadius: 8, backgroundColor: surfaceHigh }} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[0, 1, 2, 3].map((key) => (
                    <Skeleton key={key} style={{ height: 36, width: 96, borderRadius: 9999, backgroundColor: surfaceHigh }} />
                ))}
            </View>
            <View style={{ gap: 12, borderRadius: 16, padding: 16, backgroundColor: surfaceHigh }}>
                <Skeleton style={{ height: 20, width: 160, borderRadius: 8, backgroundColor: surfaceHighest }} />
                <Skeleton style={{ height: 64, width: "100%", borderRadius: 12, backgroundColor: surfaceHighest }} />
                <Skeleton style={{ height: 64, width: "100%", borderRadius: 12, backgroundColor: surfaceHighest }} />
            </View>
            <View style={{ gap: 12 }}>
                <Skeleton style={{ height: 20, width: 128, borderRadius: 8, backgroundColor: surfaceHighest }} />
                {[0, 1].map((key) => (
                    <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, padding: 12, backgroundColor: surfaceHigh }}>
                        <Skeleton style={{ height: 48, width: 48, borderRadius: 8, backgroundColor: surfaceHighest }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <Skeleton style={{ height: 16, width: "100%", borderRadius: 6, backgroundColor: surfaceHighest }} />
                            <Skeleton style={{ height: 12, width: "66.66%", borderRadius: 6, backgroundColor: surfaceHighest }} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
