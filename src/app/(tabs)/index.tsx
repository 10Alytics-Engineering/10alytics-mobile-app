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
import {
    useCourseLeaderboard,
    useWeeklyStreakStats,
} from "@/hooks/use-gamification";
import { useUserCourses } from "@/hooks/use-user-courses";
import type { ClassroomCalendarEvent, ClassroomPost, UserCourse } from "@/lib/api-client";
import { useAuthStore } from "@/utils/auth-store";
import { CourseCoverForSlug } from "@/utils/course-cover";


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
    const borderSubtle = colors.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
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

    const { data: weeklyStats } = useWeeklyStreakStats();
    const { data: leaderboard } = useCourseLeaderboard();

    const currentStreak = weeklyStats?.current_streak ?? 0;
    const userRank = leaderboard?.user_rank ?? null;
    const leaderboardTotal = leaderboard?.leaderboard.length;

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
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <Header hasAvatar />
            <ScrollView
                style={{ paddingTop: insets.top - 30, paddingHorizontal: 24, marginBottom: 80, backgroundColor: colors.bg, flex: 1 }}
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
                <View style={{ marginBottom: 56, marginTop: 0, paddingHorizontal: 16 }}>
                    <Text style={{ fontSize: 48, fontWeight: "700", color: colors.text }}>
                        Hello, {user?.first_name}!
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 18, opacity: 0.5 }}>
                        Let's continue your learning journey
                    </Text>
                </View>

                <View style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 4 }}>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Your courses</Text>
                    <Link href="/(tabs)/courses" asChild>
                        <Pressable hitSlop={8}>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, opacity: 0.6 }}>See all</Text>
                        </Pressable>
                    </Link>
                </View>
                {isPending && !data ? (
                    <HomeCoursesCarouselSkeleton cardWidth={courseCardWidth} />
                ) : isError ? (
                    <View style={{ marginBottom: 24, borderRadius: 24, borderWidth: 1, borderColor: borderSubtle, padding: 20 }}>
                        <Text style={{ color: colors.text, fontWeight: "600" }}>Couldn&apos;t load courses</Text>
                        <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6, marginTop: 4 }}>
                            {error instanceof Error ? error.message : "Something went wrong"}
                        </Text>
                        <Pressable
                            onPress={() => {
                                refetch();
                            }}
                            style={{ marginTop: 16, alignSelf: "flex-start", borderRadius: 12, backgroundColor: colors.text, paddingHorizontal: 16, paddingVertical: 8 }}
                        >
                            <Text style={{ fontWeight: "600", color: colors.invert }}>Try again</Text>
                        </Pressable>
                    </View>
                ) : courses.length === 0 ? (
                    <View style={{ marginBottom: 24, alignItems: "center", borderRadius: 24, borderWidth: 1, borderColor: borderSubtle, backgroundColor: colors.secondary, paddingHorizontal: 24, paddingVertical: 32 }}>
                        <View
                            style={{ height: 64, width: 64, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: colors.tabPillActive }}
                        >
                            <Feather name="book-open" size={28} color={colors.primary} />
                        </View>
                        <Text style={{ color: colors.text, marginTop: 16, fontSize: 20, fontWeight: "700" }}>
                            Start your learning journey
                        </Text>
                        <Text style={{ color: colors.text, marginTop: 8, textAlign: "center", fontSize: 14, lineHeight: 20, opacity: 0.6 }}>
                            You haven&apos;t enrolled in any courses yet. Browse the
                            catalog and pick one to get started.
                        </Text>
                        <Pressable
                            onPress={() => router.push("/(tabs)/courses")}
                            style={{ marginTop: 20, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.primary }}
                        >
                            <Feather name="compass" size={18} color="#ffffff" />
                            <Text style={{ marginLeft: 8, fontWeight: "600", color: "#fff" }}>
                                Browse courses
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 24 }}
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
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>
                                Streaks & Rank
                            </Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginBottom: 24, height: 280 }}
                            contentContainerStyle={{ gap: 16, paddingRight: 24 }}
                            snapToInterval={cardWidth + 16}
                            decelerationRate="fast"
                        >
                            <View style={{ width: cardWidth }}>
                                <CardFlipFire
                                    days={currentStreak}
                                    title="Current Streak"
                                    price={`${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}
                                />
                            </View>
                            <View style={{ width: cardWidth }}>
                                <CardFlipRank
                                    title="Your Rank"
                                    rank={userRank ?? 0}
                                    subtitle={userRank ? "Leaderboard rank" : "Not ranked yet"}
                                    total={leaderboardTotal}
                                />
                            </View>
                        </ScrollView>
                    </>
                ) : null}
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>Classroom</Text>
                </View>
                <View
                    style={{ borderRadius: 24, padding: 20, marginBottom: 40, backgroundColor: colors.secondary }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flex: 1, paddingRight: 16 }}>
                            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
                                {classroomSession?.title ?? "Classroom stream"}
                            </Text>
                            <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6, marginTop: 4 }}>
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
                        <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6, marginTop: 16 }}>
                            Refreshing classroom stream...
                        </Text>
                    ) : isClassroomSessionError || !classroomSession ? (
                        <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6, marginTop: 16 }}>
                            Your classroom updates will appear here once available.
                        </Text>
                    ) : (
                        <View style={{ marginTop: 16, gap: 12 }}>
                            {classroomStream.slice(0, 3).map((item) => (
                                <View
                                    key={item.id}
                                    style={{ borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.bg }}
                                >
                                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={{ color: colors.text, fontSize: 12, opacity: 0.6, marginTop: 4 }} numberOfLines={1}>
                                        {item.label}
                                    </Text>
                                </View>
                            ))}
                            {classroomStream.length === 0 ? (
                                <View
                                    style={{ borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.bg }}
                                >
                                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
                                        No classroom activity yet
                                    </Text>
                                    <Text style={{ color: colors.text, fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                                        Announcements, resources, live sessions, assignments, and capstones will show up here.
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                    <Pressable
                        onPress={() => router.push("/(tabs)/classroom")}
                        style={{ marginTop: 16, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary }}
                    >
                        <Text style={{ fontWeight: "600", color: "#fff" }}>
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
