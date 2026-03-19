import Feather from "@expo/vector-icons/Feather";
import { Link, router } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CourseActionCard from "@/components/CourseActionCard";
import Header from "@/components/Header";
import { CardFlipFire, CardFlipRank } from "@/components/card-flip";
import useThemeColors from "@/contexts/ThemeColors";
import { useUserCourses } from "@/hooks/use-user-courses";
import type { UserCourse } from "@/lib/api-client";
import { useAuthStore } from "@/utils/auth-store";
import { CourseCoverForSlug } from "@/utils/course-cover";

import "../../../global.css";

function formatSlugLabel(slug: string): string {
    if (!slug) return "Course";
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export default function Home() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { width } = useWindowDimensions();
    const cardWidth = Math.round(width * 0.82);
    const courseCardWidth = Math.round(width * 0.88);
    const colors = useThemeColors();

    const { data, isPending, isError, error, refetch } = useUserCourses();
    const courses: UserCourse[] = data?.data ?? [];

    const nextLiveClass = useMemo(() => {
        const now = new Date();
        const targetHour = 10;
        const targetMinute = 0;
        const targetDay = 6; // Saturday (0=Sun)

        const next = new Date(now);
        const dayDiff = (targetDay - now.getDay() + 7) % 7;
        next.setDate(now.getDate() + dayDiff);
        next.setHours(targetHour, targetMinute, 0, 0);

        if (next.getTime() <= now.getTime()) {
            next.setDate(next.getDate() + 7);
        }

        const diffMs = next.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const joinEnabled = diffMinutes <= 60 && diffMinutes >= 0;

        return {
            date: next,
            joinEnabled,
        };
    }, []);

    return (
        <View className="flex-1 bg-background">
            <Header hasAvatar />
            <ScrollView
                style={{ paddingTop: insets.top - 30 }}
                className="px-6 mb-20 bg-background flex-1"
            >
                <View className="mb-14 mt-0 px-4">
                    <Text className="text-5xl font-bold text-text">
                        Hello {user?.first_name}!
                    </Text>
                    <Text className="text-text text-lg opacity-50">
                        Let's continue your learning journey
                    </Text>
                </View>
                <View className="mb-3">
                    <Text className="text-text text-lg font-semibold">
                        Streaks & Rank
                    </Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                    style={{ height: 280 }}
                    contentContainerStyle={{ gap: 16, paddingRight: 24 }}
                    snapToInterval={cardWidth + 16}
                    decelerationRate="fast"
                >
                    <View style={{ width: cardWidth }}>
                        <CardFlipFire days={10} title="Current Streak" price="10 days" />
                    </View>
                    <View style={{ width: cardWidth }}>
                        <CardFlipRank
                            title="Your Rank"
                            rank={7}
                            subtitle="Leaderboard rank"
                            total={120}
                        />
                    </View>
                </ScrollView>
                <View className="mb-3 flex-row items-center justify-between pr-1">
                    <Text className="text-text text-lg font-semibold">Your courses</Text>
                    <Link href="/(tabs)/courses" asChild>
                        <Pressable hitSlop={8}>
                            <Text className="text-sm font-semibold text-text opacity-60">See all</Text>
                        </Pressable>
                    </Link>
                </View>
                {isPending && !data ? (
                    <View className="mb-6 py-10 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.icon} />
                        <Text className="text-text text-sm opacity-60 mt-3">Loading courses…</Text>
                    </View>
                ) : isError ? (
                    <View className="mb-6 rounded-3xl border border-text/10 p-5">
                        <Text className="text-text font-semibold">Couldn&apos;t load courses</Text>
                        <Text className="text-text text-sm opacity-60 mt-1">
                            {error instanceof Error ? error.message : "Something went wrong"}
                        </Text>
                        <Pressable
                            onPress={() => {
                                refetch();
                            }}
                            className="mt-4 self-start rounded-xl bg-text px-4 py-2 active:opacity-80"
                        >
                            <Text className="font-semibold text-invert">Try again</Text>
                        </Pressable>
                    </View>
                ) : courses.length === 0 ? (
                    <View className="mb-6 rounded-3xl border border-text/10 p-5">
                        <Text className="text-text opacity-70">
                            You don&apos;t have any courses yet. Open the Courses tab to get started.
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                        contentContainerStyle={{ gap: 16, paddingRight: 24 }}
                        snapToInterval={courseCardWidth + 16}
                        decelerationRate="fast"
                    >
                        {courses.map((course) => {
                            const progress = Math.round(course.progress_percentage);
                            const action = course.progress_percentage > 0 ? "continue" : "start";
                            return (
                                <View key={course.id} style={{ width: courseCardWidth }}>
                                    <CourseActionCard
                                        title={course.title}
                                        subtitle={formatSlugLabel(course.slug)}
                                        action={action}
                                        progress={progress}
                                        thumbnail={
                                            <CourseCoverForSlug slug={course.slug} size={40} />
                                        }
                                        onPress={() =>
                                            router.push({
                                                pathname: "/course/[id]",
                                                params: { id: String(course.course_id) },
                                            })
                                        }
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                )}
                <View className="mb-3">
                    <Text className="text-text text-lg font-semibold">Live Class</Text>
                </View>
                <View
                    className="rounded-[24px] p-5 mb-10"
                    style={{ backgroundColor: colors.secondary }}
                >
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-text text-base font-semibold">
                                Your next live class
                            </Text>
                            <Text className="text-text text-sm opacity-60 mt-1">
                                {nextLiveClass.date.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                                {" • "}
                                {nextLiveClass.date.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </Text>
                        </View>
                        <Feather name="video" size={22} color={colors.icon} />
                    </View>
                    <Pressable
                        disabled={!nextLiveClass.joinEnabled}
                        className="mt-4 rounded-xl px-4 py-3 items-center justify-center"
                        style={{
                            backgroundColor: nextLiveClass.joinEnabled
                                ? "#9CA3AF"
                                : "#E5E7EB",
                            opacity: nextLiveClass.joinEnabled ? 1 : 0.7,
                        }}
                    >
                        <Text
                            style={{
                                color: nextLiveClass.joinEnabled ? "#111827" : "#6B7280",
                            }}
                            className="font-semibold"
                        >
                            Join class
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}
