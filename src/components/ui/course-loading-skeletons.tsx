import React from "react";
import { ScrollView, View } from "react-native";

import useThemeColors from "@/contexts/theme-colors";

import { Skeleton } from "./skeleton";

interface HomeCoursesCarouselSkeletonProps {
    cardWidth: number;
}

/** Horizontal row of cards matching the home “Your courses” carousel. */
export function HomeCoursesCarouselSkeleton({ cardWidth }: HomeCoursesCarouselSkeletonProps) {
    const colors = useThemeColors();
    const base = colors.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    const soft = colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 16, paddingRight: 24 }}
        >
            {[0, 1].map((key) => (
                <View
                    key={key}
                    className="overflow-hidden rounded-[30px] p-5"
                    style={{
                        width: cardWidth,
                        backgroundColor: colors.isDark ? "#1B1410" : "#F1E7DC",
                    }}
                >
                    <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-row flex-1 items-center gap-3">
                            <Skeleton
                                className="h-[54px] w-[54px] rounded-2xl"
                                style={{ backgroundColor: base }}
                            />
                            <View className="min-w-0 flex-1 gap-2">
                                <Skeleton
                                    className="h-5 w-full max-w-[200px] rounded-lg"
                                    style={{ backgroundColor: base }}
                                />
                                <Skeleton
                                    className="h-3 w-24 rounded-md"
                                    style={{ backgroundColor: soft }}
                                />
                            </View>
                        </View>
                    </View>
                    <View className="mt-5 gap-2">
                        <Skeleton
                            className="h-2 w-full rounded-full"
                            style={{ backgroundColor: soft }}
                        />
                        <Skeleton
                            className="h-3 w-16 rounded-md"
                            style={{ backgroundColor: soft }}
                        />
                    </View>
                    <View className="mt-5 flex-row items-center justify-between">
                        <Skeleton
                            className="h-10 w-28 rounded-xl"
                            style={{ backgroundColor: base }}
                        />
                        <Skeleton className="h-4 w-4 rounded" style={{ backgroundColor: soft }} />
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

    return (
        <View className="flex-1 px-4" style={{ backgroundColor }}>
            <View className="mb-4 mt-2 flex-row items-center justify-between">
                <Skeleton className="h-7 w-40 rounded-lg" style={{ backgroundColor: base }} />
            </View>
            {[0, 1, 2, 3].map((key) => (
                <View key={key} className="mb-global overflow-hidden rounded-2xl bg-secondary p-5">
                    <View className="flex-row gap-4">
                        <Skeleton
                            className="h-[96px] w-[96px] rounded-2xl"
                            style={{ backgroundColor: base }}
                        />
                        <View className="flex-1 gap-2">
                            <Skeleton
                                className="h-3 w-28 rounded-md"
                                style={{ backgroundColor: soft }}
                            />
                            <Skeleton
                                className="h-5 w-full rounded-lg"
                                style={{ backgroundColor: base }}
                            />
                            <Skeleton
                                className="h-4 w-full rounded-md"
                                style={{ backgroundColor: soft }}
                            />
                            <Skeleton
                                className="mt-2 h-4 w-[92%] rounded-md"
                                style={{ backgroundColor: soft }}
                            />
                            <Skeleton
                                className="mt-3 h-2 w-full rounded-full"
                                style={{ backgroundColor: soft }}
                            />
                            <View className="mt-4 flex-row items-center justify-between">
                                <Skeleton
                                    className="h-9 w-24 rounded-xl"
                                    style={{ backgroundColor: base }}
                                />
                                <Skeleton className="h-4 w-4 rounded" style={{ backgroundColor: soft }} />
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
        <View className="w-full gap-5 py-4">
            <Skeleton
                className="w-full overflow-hidden rounded-2xl"
                style={{ height: heroH, backgroundColor: surfaceHighest }}
            />
            <View className="gap-3">
                <Skeleton
                    className="h-6 w-3/4 rounded-lg"
                    style={{ backgroundColor: surfaceHighest }}
                />
                <Skeleton className="h-4 w-full rounded-lg" style={{ backgroundColor: surfaceHigh }} />
                <Skeleton className="h-4 w-5/6 rounded-lg" style={{ backgroundColor: surfaceHigh }} />
            </View>
            <View className="flex-row flex-wrap gap-2">
                {[0, 1, 2, 3].map((key) => (
                    <Skeleton
                        key={key}
                        className="h-9 w-24 rounded-full"
                        style={{ backgroundColor: surfaceHigh }}
                    />
                ))}
            </View>
            <View className="gap-3 rounded-2xl p-4" style={{ backgroundColor: surfaceHigh }}>
                <Skeleton className="h-5 w-40 rounded-lg" style={{ backgroundColor: surfaceHighest }} />
                <Skeleton className="h-16 w-full rounded-xl" style={{ backgroundColor: surfaceHighest }} />
                <Skeleton className="h-16 w-full rounded-xl" style={{ backgroundColor: surfaceHighest }} />
            </View>
            <View className="gap-3">
                <Skeleton className="h-5 w-32 rounded-lg" style={{ backgroundColor: surfaceHighest }} />
                {[0, 1].map((key) => (
                    <View
                        key={key}
                        className="flex-row items-center gap-3 rounded-xl p-3"
                        style={{ backgroundColor: surfaceHigh }}
                    >
                        <Skeleton
                            className="h-12 w-12 rounded-lg"
                            style={{ backgroundColor: surfaceHighest }}
                        />
                        <View className="flex-1 gap-2">
                            <Skeleton
                                className="h-4 w-full rounded-md"
                                style={{ backgroundColor: surfaceHighest }}
                            />
                            <Skeleton
                                className="h-3 w-2/3 rounded-md"
                                style={{ backgroundColor: surfaceHighest }}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
