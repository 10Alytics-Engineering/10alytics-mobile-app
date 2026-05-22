import Feather from "@expo/vector-icons/Feather";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import React, { useMemo } from "react";
import {
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CourseActionCard from "@/components/CourseActionCard";
import Header from "@/components/Header";
import { CardFlipFire, CardFlipRank } from "@/components/card-flip";
import { HomeCoursesCarouselSkeleton } from "@/components/ui/course-loading-skeletons";
import useThemeColors from "@/contexts/ThemeColors";
import {
    flattenClassworkPosts,
    formatClassroomDate,
    formatClassroomTime,
    getCalendarEventTime,
    getClassroomPostTime,
    useClassroomClasswork,
    useClassroomLatest,
    useClassroomSession,
} from "@/hooks/use-classroom";
import { useUserCourses } from "@/hooks/use-user-courses";
import type { ClassroomCalendarEvent, ClassroomPost, UserCourse } from "@/lib/api-client";
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
    const queryClient = useQueryClient();

    const { data, isPending, isError, error, refetch, isFetching } = useUserCourses();
    const {
        data: classroomSession,
        isLoading: isClassroomSessionLoading,
        isError: isClassroomSessionError,
    } = useClassroomSession();
    const { data: classroomLatest } = useClassroomLatest(
        classroomSession?.courseEnrollmentId,
    );
    const { data: classroomClasswork } = useClassroomClasswork(
        classroomSession?.courseEnrollmentId,
    );
    const isClassroomFetching = useIsFetching({ queryKey: ["classroom"] }) > 0;
    const courses: UserCourse[] = data?.data ?? [];

    const nextClassroomEvent = useMemo(() => {
        const upcoming = [
            ...(classroomLatest?.upcoming_sessions ?? []),
            ...(classroomLatest?.upcoming_deadlines ?? []),
        ];

        return upcoming
            .filter((item) => getCalendarEventTime(item))
            .sort((a, b) => {
                const aTime = new Date(getCalendarEventTime(a) ?? 0).getTime();
                const bTime = new Date(getCalendarEventTime(b) ?? 0).getTime();
                return aTime - bTime;
            })[0];
    }, [classroomLatest]);

    const classroomStream = useMemo(
        () => buildClassroomStream(flattenClassworkPosts(classroomClasswork)),
        [classroomClasswork],
    );

    return (
        <View className="flex-1 bg-background">
            <Header hasAvatar />
            <ScrollView
                style={{ paddingTop: insets.top - 30 }}
                className="px-6 mb-20 bg-background flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={
                            (isFetching && !isPending) ||
                            (isClassroomFetching && !isClassroomSessionLoading)
                        }
                        onRefresh={() => {
                            queryClient.invalidateQueries({ queryKey: ["classroom"] });
                            refetch();
                        }}
                        tintColor={colors.primary}
                    />
                }
            >
                <View className="mb-14 mt-0 px-4">
                    <Text className="text-5xl font-bold text-text">
                        Hello, {user?.first_name}!
                    </Text>
                    <Text className="text-text text-lg opacity-50">
                        Let's continue your learning journey
                    </Text>
                </View>

                <View className="mb-3 flex-row items-center justify-between pr-1">
                    <Text className="text-text text-lg font-semibold">Your courses</Text>
                    <Link href="/(tabs)/courses" asChild>
                        <Pressable hitSlop={8}>
                            <Text className="text-sm font-semibold text-text opacity-60">See all</Text>
                        </Pressable>
                    </Link>
                </View>
                {isPending && !data ? (
                    <HomeCoursesCarouselSkeleton cardWidth={courseCardWidth} />
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
                    <View className="mb-6 items-center rounded-3xl border border-text/10 bg-secondary px-6 py-8">
                        <View
                            className="h-16 w-16 items-center justify-center rounded-full"
                            style={{ backgroundColor: colors.tabPillActive }}
                        >
                            <Feather name="book-open" size={28} color={colors.primary} />
                        </View>
                        <Text className="text-text mt-4 text-xl font-bold">
                            Start your learning journey
                        </Text>
                        <Text className="text-text mt-2 text-center text-sm leading-5 opacity-60">
                            You haven&apos;t enrolled in any courses yet. Browse the
                            catalog and pick one to get started.
                        </Text>
                        <Pressable
                            onPress={() => router.push("/(tabs)/courses")}
                            className="mt-5 w-full flex-row items-center justify-center rounded-xl px-4 py-3 active:opacity-90"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <Feather name="compass" size={18} color="#ffffff" />
                            <Text className="ml-2 font-semibold text-white">
                                Browse courses
                            </Text>
                        </Pressable>
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
                                        cohortName={course.cohort_name}
                                        progress={progress}
                                        thumbnail={
                                            <CourseCoverForSlug slug={course.slug} size={40} />
                                        }
                                        onPress={() =>
                                            router.push({
                                                pathname: "/course/[id]",
                                                params: { id: String(course.id) },
                                            })
                                        }
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                )}
                {courses.length > 0 ? (
                    <>
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
                    </>
                ) : null}
                <View className="mb-3">
                    <Text className="text-text text-lg font-semibold">Classroom</Text>
                </View>
                <View
                    className="rounded-[24px] p-5 mb-10"
                    style={{ backgroundColor: colors.secondary }}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-text text-base font-semibold">
                                {classroomSession?.title ?? "Classroom stream"}
                            </Text>
                            <Text className="text-text text-sm opacity-60 mt-1">
                                {nextClassroomEvent
                                    ? getClassroomEventLabel(nextClassroomEvent)
                                    : "Live classes and deadlines will appear here"}
                            </Text>
                        </View>
                        <Feather
                            name={nextClassroomEvent?.type === "live_session" ? "video" : "calendar"}
                            size={22}
                            color={colors.icon}
                        />
                    </View>
                    {isClassroomSessionLoading || isClassroomFetching ? (
                        <Text className="text-text text-sm opacity-60 mt-4">
                            Refreshing classroom stream...
                        </Text>
                    ) : isClassroomSessionError || !classroomSession ? (
                        <Text className="text-text text-sm opacity-60 mt-4">
                            Your classroom updates will appear here once available.
                        </Text>
                    ) : (
                        <View className="mt-4 gap-3">
                            {classroomStream.slice(0, 3).map((item) => (
                                <View
                                    key={item.id}
                                    className="rounded-2xl px-4 py-3"
                                    style={{ backgroundColor: colors.bg }}
                                >
                                    <Text className="text-text text-sm font-semibold" numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text className="text-text text-xs opacity-60 mt-1" numberOfLines={1}>
                                        {item.label}
                                    </Text>
                                </View>
                            ))}
                            {classroomStream.length === 0 ? (
                                <View
                                    className="rounded-2xl px-4 py-4"
                                    style={{ backgroundColor: colors.bg }}
                                >
                                    <Text className="text-text text-sm font-semibold">
                                        No classroom activity yet
                                    </Text>
                                    <Text className="text-text text-xs opacity-60 mt-1">
                                        Announcements, resources, live sessions, assignments, and capstones will show up here.
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                    <Pressable
                        onPress={() => router.push("/(tabs)/classroom")}
                        className="mt-4 rounded-xl px-4 py-3 items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <Text className="font-semibold text-white">
                            Open classroom
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

function getClassroomEventLabel(
    event?: ClassroomCalendarEvent,
) {
    if (!event) return "No upcoming class or deadline";

    const eventTime = getCalendarEventTime(event);
    const kind =
        event.type === "live_session" ? "Next live class" : "Upcoming deadline";
    const date = formatClassroomDate(eventTime);
    const time = formatClassroomTime(eventTime);

    return [kind, date, time].filter(Boolean).join(" • ");
}

function buildClassroomStream(posts: ClassroomPost[]) {
    return posts.map((post) => ({
        id: `${post.type}-${post.id}`,
        title: post.title ?? post.body ?? "Classroom update",
        label: `${formatClassroomPostType(post.type)} • ${formatClassroomDate(
            getClassroomPostTime(post),
        )}`,
    }));
}

function formatClassroomPostType(type: string) {
    switch (type) {
        case "announcement":
            return "Announcement";
        case "material":
            return "Resource";
        case "live_session":
            return "Live class";
        case "capstone_project":
            return "Capstone";
        case "assignment":
            return "Assignment";
        default:
            return "Classroom";
    }
}
