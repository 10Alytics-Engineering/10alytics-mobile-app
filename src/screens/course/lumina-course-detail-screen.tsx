import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
    ArrowLeft,
    BookOpen,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    FileText,
    Landmark,
    Medal,
    MessageCircle,
    MoreVertical,
    Play,
    PlayCircle,
    Shapes,
    Users,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseInlineVideoPlayer } from "@/components/course-in-app-video-modal";
import { LuminaCourseDetailSkeleton } from "@/components/ui/course-loading-skeletons";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserCourseDetail } from "@/hooks/use-user-course-detail";
import { type UserCourseLesson, type UserCourseWeek } from "@/lib/api-client";
import { parseUserCourseDetailBundle } from "@/lib/parse-user-course-detail";
import { CourseCoverForSlug } from "@/utils/course-cover";
import { resolveMediaUrl } from "@/utils/resolve-media-url";

const LIGHT = {
    bg: "#fff8f6",
    surface: "#fff8f6",
    surfaceHigh: "#f9e4db",
    surfaceLow: "#fff1eb",
    surfaceLowest: "#ffffff",
    surfaceContainerHighest: "#f4ded6",
    onSurface: "#241914",
    onSurfaceVariant: "#574239",
    primary: "#9d3e00",
    primaryContainer: "#c05414",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#fffbff",
    primaryFixed: "#ffdbcc",
    primaryFixedDim: "#ffb694",
    onPrimaryFixedVariant: "#7b2f00",
    secondaryFixed: "#ffdbcc",
    onSecondaryContainer: "#79452b",
    secondaryContainer: "#feb695",
    tertiary: "#006388",
    tertiaryMuted: "rgba(0, 99, 136, 0.1)",
    tertiaryFixed: "#c5e7ff",
    onTertiaryFixed: "#001e2d",
    outlineVariant: "#dec0b4",
    outline: "#8b7267",
    headerBar: "rgba(248, 250, 252, 0.85)",
    milestoneFrom: "#c05414",
    milestoneTo: "#9d3e00",
    lessonRowPlayableFill: "rgba(255, 182, 148, 0.22)",
    lessonRowCurrentBorder: "rgba(192, 84, 20, 0.65)",
} as const;

/** Warm dark surfaces + muted terracotta accents (less neon than pure orange on black). */
const DARK = {
    bg: "#121014",
    surface: "#1a171d",
    surfaceHigh: "#25212b",
    surfaceLow: "#1e1b22",
    surfaceLowest: "#16131a",
    surfaceContainerHighest: "#322e3a",
    onSurface: "#f4f1f6",
    onSurfaceVariant: "#a39eac",
    primary: "#d4a27f",
    primaryContainer: "#8b4a2a",
    onPrimary: "#16131a",
    onPrimaryContainer: "#fff6f0",
    primaryFixed: "#2a2420",
    primaryFixedDim: "#3d332c",
    onPrimaryFixedVariant: "#e8c4a8",
    secondaryFixed: "#2a2220",
    onSecondaryContainer: "#edd5c8",
    secondaryContainer: "#a65c38",
    tertiary: "#8eb8c9",
    tertiaryMuted: "rgba(142, 184, 201, 0.14)",
    tertiaryFixed: "#1e323c",
    onTertiaryFixed: "#dceaf0",
    outlineVariant: "#3f3a46",
    outline: "#6b6574",
    headerBar: "rgba(18, 16, 20, 0.9)",
    milestoneFrom: "#9a5c3c",
    milestoneTo: "#6b3d28",
    /** Subtle fill for playable lesson rows (dark). */
    lessonRowPlayableFill: "rgba(212, 162, 127, 0.1)",
    lessonRowCurrentBorder: "rgba(212, 162, 127, 0.55)",
} as const;

function formatSlugLabel(slug: string): string {
    if (!slug) return "Course";
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

function findWeekIdForLesson(weeks: UserCourseWeek[], lessonId: number): number | null {
    for (const w of weeks) {
        for (const m of w.course_module ?? []) {
            if (m.course_lessons?.some((l) => l.id === lessonId)) return w.id;
        }
    }
    return null;
}

function findLessonById(weeks: UserCourseWeek[], lessonId: number): UserCourseLesson | null {
    for (const w of weeks) {
        for (const m of w.course_module ?? []) {
            const l = m.course_lessons?.find((x) => x.id === lessonId);
            if (l) return l;
        }
    }
    return null;
}

/** First lesson in curriculum order that has a playable URL (enrolled flow). */
function findFirstPlayableLesson(weeks: UserCourseWeek[]): UserCourseLesson | null {
    for (const w of weeks) {
        for (const m of w.course_module ?? []) {
            for (const l of m.course_lessons ?? []) {
                if (l.video_url?.trim()) return l;
            }
        }
    }
    return null;
}

function findWeekIdForFirstPlayableLesson(weeks: UserCourseWeek[]): number | null {
    for (const w of weeks) {
        for (const m of w.course_module ?? []) {
            for (const l of m.course_lessons ?? []) {
                if (l.video_url?.trim()) return w.id;
            }
        }
    }
    return null;
}

async function openExternalUrl(url: string | null | undefined) {
    if (!url?.trim()) return;
    await WebBrowser.openBrowserAsync(url.trim());
}

interface LuminaCourseDetailScreenProps {
    courseId: string;
}

export function LuminaCourseDetailScreen({ courseId }: LuminaCourseDetailScreenProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const c = isDark ? DARK : LIGHT;
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const enrollmentId = useMemo(() => {
        const n = Number.parseInt(courseId, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [courseId]);

    const {
        data: apiResponse,
        isPending,
        isError,
        error,
        refetch,
    } = useUserCourseDetail(enrollmentId);

    const bundle = useMemo(
        () => parseUserCourseDetailBundle(apiResponse),
        [apiResponse],
    );
    const course = bundle?.course;
    const progressPct = bundle ? Math.round(bundle.progress_percentage) : 0;
    const currentLessonId =
        bundle?.current_week_video_id != null && Number.isFinite(bundle.current_week_video_id)
            ? bundle.current_week_video_id
            : null;

    const didBootstrapWeekFromProgress = useRef(false);
    const mainScrollRef = useRef<ScrollView>(null);
    useEffect(() => {
        didBootstrapWeekFromProgress.current = false;
    }, [courseId]);

    const sortedWeeks = useMemo((): UserCourseWeek[] => {
        if (!course?.course_weeks?.length) return [];
        return [...course.course_weeks]
            .filter((w) => Number(w.isDeleted) !== 1)
            .sort((a, b) => a.week - b.week);
    }, [course]);

    const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);
    const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
    const [inAppVideoRawUrl, setInAppVideoRawUrl] = useState<string | null>(null);

    useEffect(() => {
        if (sortedWeeks.length === 0) return;
        const weekForLesson =
            currentLessonId != null
                ? findWeekIdForLesson(sortedWeeks, currentLessonId)
                : findWeekIdForFirstPlayableLesson(sortedWeeks);

        setSelectedWeekId((prev) => {
            const prevValid = prev != null && sortedWeeks.some((w) => w.id === prev);
            if (prevValid) {
                if (
                    !didBootstrapWeekFromProgress.current &&
                    weekForLesson != null &&
                    prev !== weekForLesson
                ) {
                    didBootstrapWeekFromProgress.current = true;
                    return weekForLesson;
                }
                return prev;
            }
            if (weekForLesson != null) {
                didBootstrapWeekFromProgress.current = true;
                return weekForLesson;
            }
            return sortedWeeks[0].id;
        });
    }, [sortedWeeks, currentLessonId]);

    const selectedWeek = useMemo(
        () => sortedWeeks.find((w) => w.id === selectedWeekId) ?? null,
        [sortedWeeks, selectedWeekId],
    );

    const modules = selectedWeek?.course_module ?? [];

    const resumeLesson = useMemo(() => {
        if (!sortedWeeks.length) return null;
        if (currentLessonId != null) {
            const l = findLessonById(sortedWeeks, currentLessonId);
            if (l?.video_url?.trim()) return l;
        }
        return findFirstPlayableLesson(sortedWeeks);
    }, [sortedWeeks, currentLessonId]);

    const resumeVideoUrl = resumeLesson?.video_url?.trim() ?? null;
    const resumeFromProgressPointer =
        currentLessonId != null && resumeLesson?.id === currentLessonId;

    const totalLessons = useMemo(
        () =>
            modules.reduce(
                (acc, m) => acc + (m.course_lessons?.length ?? 0),
                0,
            ),
        [modules],
    );

    useEffect(() => {
        if (!selectedWeek) return;
        if (currentLessonId != null) {
            const modWithCurrent = selectedWeek.course_module.find((m) =>
                m.course_lessons?.some((l) => l.id === currentLessonId),
            );
            if (modWithCurrent) {
                setExpandedModuleId(modWithCurrent.id);
                return;
            }
        }
        const firstPlayableMod = selectedWeek.course_module.find((m) =>
            m.course_lessons?.some((l) => l.video_url?.trim()),
        );
        const first = selectedWeek.course_module?.[0];
        setExpandedModuleId(firstPlayableMod?.id ?? first?.id ?? null);
    }, [selectedWeekId, selectedWeek, currentLessonId]);

    useEffect(() => {
        if (inAppVideoRawUrl == null) return;
        mainScrollRef.current?.scrollTo({ y: 0, animated: true });
    }, [inAppVideoRawUrl]);

    const heroH = Math.round((width * 9) / 16);
    const inlinePlayerW = width - 32;
    const heroUri = course?.image ? resolveMediaUrl(course.image) : undefined;
    const slug = course?.slug ?? "";
    const categoryLabel = course?.level?.trim()
        ? course.level
        : formatSlugLabel(slug);

    function toggleModule(id: number) {
        setExpandedModuleId((prev) => (prev === id ? null : id));
    }

    return (
        <View className="flex-1" style={{ backgroundColor: c.bg }}>
            <View
                className="absolute left-0 right-0 top-0 z-50"
                style={{ paddingTop: insets.top }}
            >
                <BlurView
                    intensity={isDark ? 60 : 80}
                    tint={isDark ? "dark" : "light"}
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: isDark
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.04)",
                    }}
                >
                    <View
                        className="min-h-16 flex-row items-center justify-between px-5 py-2"
                        style={{ backgroundColor: c.headerBar }}
                    >
                        <View className="min-w-0 flex-1 flex-row items-center gap-3">
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Go back"
                                onPress={() => router.back()}
                                className="h-10 w-10 shrink-0 items-center justify-center rounded-full active:opacity-70"
                                style={{
                                    backgroundColor: isDark
                                        ? "rgba(255,255,255,0.06)"
                                        : "rgba(0,0,0,0.04)",
                                }}
                            >
                                <ArrowLeft size={22} color={c.primary} strokeWidth={2.2} />
                            </Pressable>
                            <View className="min-w-0 flex-1 pr-2">
                                <Text
                                    className="font-outfit-bold text-lg tracking-tight"
                                    style={{ color: c.onSurface }}
                                    numberOfLines={course && !isPending ? 2 : 1}
                                >
                                    {course && !isPending ? course.title : "Course Details"}
                                </Text>
                                {course && !isPending ? (
                                    <Text
                                        className="mt-0.5 text-xs font-medium"
                                        style={{ color: c.onSurfaceVariant }}
                                        numberOfLines={1}
                                    >
                                        {categoryLabel}
                                        {progressPct > 0 ? ` · ${progressPct}% complete` : ""}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="More options"
                            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                            style={{
                                backgroundColor: isDark
                                    ? "rgba(255,255,255,0.06)"
                                    : "rgba(0,0,0,0.04)",
                            }}
                        >
                            <MoreVertical size={22} color={c.primary} strokeWidth={2.2} />
                        </Pressable>
                    </View>
                </BlurView>
            </View>

            <ScrollView
                ref={mainScrollRef}
                className="flex-1"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: insets.top + 72,
                    paddingBottom: insets.bottom + 32,
                    paddingHorizontal: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                {enrollmentId == null ? (
                    <View className="min-h-48 items-center justify-center px-6 py-16">
                        <Text
                            className="text-center font-medium"
                            style={{ color: c.onSurfaceVariant }}
                        >
                            This course link is invalid. Open it again from your course list.
                        </Text>
                    </View>
                ) : isPending ? (
                    <LuminaCourseDetailSkeleton
                        heroH={heroH}
                        surfaceHighest={c.surfaceContainerHighest}
                        surfaceHigh={c.surfaceHigh}
                    />
                ) : isError || !course ? (
                    <View className="min-h-48 items-center justify-center gap-4 px-6 py-16">
                        <Text
                            className="text-center font-medium"
                            style={{ color: c.onSurfaceVariant }}
                        >
                            {error?.message ?? "Could not load this course."}
                        </Text>
                        <Pressable
                            onPress={async () => {
                                await refetch();
                            }}
                            className="rounded-full px-6 py-3 active:opacity-80"
                            style={{ backgroundColor: c.primaryContainer }}
                        >
                            <Text className="font-bold text-white">Try again</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        {inAppVideoRawUrl ? (
                            <View className="mb-8 mt-2">
                                <CourseInlineVideoPlayer
                                    onClose={() => setInAppVideoRawUrl(null)}
                                    playerWidth={inlinePlayerW}
                                    rawUrl={inAppVideoRawUrl}
                                    title={course.title}
                                />
                            </View>
                        ) : (
                        <View className="mb-8 mt-2 overflow-hidden rounded-2xl" style={{ height: heroH }}>
                            {heroUri ? (
                                <Image
                                    accessibilityIgnoresInvertColors
                                    source={{ uri: heroUri }}
                                    className="absolute inset-0 h-full w-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View
                                    className="absolute inset-0 items-center justify-center"
                                    style={{ backgroundColor: c.surfaceContainerHighest }}
                                >
                                    <View style={{ opacity: 0.55 }}>
                                        <CourseCoverForSlug
                                            slug={slug || "data-analysis"}
                                            size={Math.min(280, width * 0.75)}
                                        />
                                    </View>
                                </View>
                            )}
                            <LinearGradient
                                colors={["transparent", "rgba(157, 62, 0, 0.45)"]}
                                locations={[0.35, 1]}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                }}
                            />
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={
                                    course.video ? "Play course trailer" : "No trailer available"
                                }
                                disabled={!course.video}
                                onPress={() => setInAppVideoRawUrl(course.video ?? null)}
                                className="absolute inset-0 items-center justify-center"
                                style={{ opacity: course.video ? 1 : 0.45 }}
                            >
                                <View
                                    className="h-20 w-20 items-center justify-center rounded-full shadow-lg"
                                    style={{
                                        backgroundColor: c.primary,
                                        shadowColor: "#000",
                                        shadowOpacity: 0.25,
                                        shadowRadius: 16,
                                        elevation: 8,
                                    }}
                                >
                                    <Play size={40} color={c.onPrimary} fill={c.onPrimary} strokeWidth={0} />
                                </View>
                            </Pressable>
                            <View className="absolute bottom-5 left-5 right-5 flex-row items-center justify-between">
                                <View
                                    className="rounded-full px-3 py-1"
                                    style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                                >
                                    <Text className="text-xs font-bold uppercase tracking-wider text-white">
                                        {course.video ? "Trailer" : "Preview"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        )}

                        {/* Title + instructor + progress */}
                        <View className="mb-10 px-1">
                            <View className="flex-col gap-6">
                                <View>
                                    <View className="mb-3 flex-row flex-wrap items-center gap-2">
                                        <View
                                            className="rounded-full px-4 py-1"
                                            style={{ backgroundColor: c.tertiaryFixed }}
                                        >
                                            <Text
                                                className="font-outfit-bold text-xs uppercase tracking-widest"
                                                style={{ color: c.onTertiaryFixed }}
                                            >
                                                {categoryLabel}
                                            </Text>
                                        </View>
                                        {typeof course.enrolled_students_count === "number" ? (
                                            <View className="flex-row items-center gap-1">
                                                <Users size={16} color={c.primary} strokeWidth={2} />
                                                <Text
                                                    className="font-outfit-bold text-sm"
                                                    style={{ color: c.primary }}
                                                >
                                                    {course.enrolled_students_count} enrolled
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <Text
                                        className="mb-2 font-outfit-bold text-3xl leading-tight tracking-tight"
                                        style={{ color: c.onSurface }}
                                    >
                                        {course.title}
                                    </Text>
                                </View>

                                <View
                                    className="w-full rounded-2xl border-b-4 p-6"
                                    style={{
                                        backgroundColor: c.surfaceLow,
                                        borderBottomColor: `${c.primary}33`,
                                    }}
                                >
                                    <View className="mb-2 flex-row items-end justify-between">
                                        <Text
                                            className="text-sm font-bold uppercase"
                                            style={{ color: c.onSurfaceVariant }}
                                        >
                                            Your Progress
                                        </Text>
                                        <Text className="font-outfit-bold text-lg" style={{ color: c.primary }}>
                                            {progressPct}%
                                        </Text>
                                    </View>
                                    <View
                                        className="h-2.5 w-full overflow-hidden rounded-full"
                                        style={{ backgroundColor: c.surfaceHigh }}
                                    >
                                        <View
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.min(100, Math.max(0, progressPct))}%`,
                                                backgroundColor: c.primary,
                                            }}
                                        />
                                    </View>
                                    <View className="mt-4 flex-row items-center gap-1">
                                        <Medal size={16} color={c.onSurfaceVariant} strokeWidth={2} />
                                        <Text className="text-xs font-bold" style={{ color: c.onSurfaceVariant }}>
                                            {selectedWeek
                                                ? `${selectedWeek.assessments?.length ?? 0} questions this week`
                                                : "Pick a week to see practice questions"}
                                        </Text>
                                    </View>
                                    {resumeVideoUrl ? (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={
                                                resumeFromProgressPointer
                                                    ? "Continue watching in app"
                                                    : "Start course video in app"
                                            }
                                            onPress={() => setInAppVideoRawUrl(resumeVideoUrl)}
                                            className="mt-4 flex-row items-center justify-center gap-2 rounded-xl py-3.5 active:opacity-90"
                                            style={{ backgroundColor: c.primaryContainer }}
                                        >
                                            <PlayCircle
                                                size={22}
                                                color={c.onPrimaryContainer}
                                                fill={c.onPrimaryContainer}
                                                strokeWidth={0}
                                            />
                                            <Text
                                                className="font-outfit-bold text-base"
                                                style={{ color: c.onPrimaryContainer }}
                                            >
                                                {resumeFromProgressPointer
                                                    ? "Continue watching"
                                                    : "Start course"}
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            </View>
                        </View>

                        {/* Curriculum + sidebar */}
                        <View className="gap-8">
                            <View className="flex-1 gap-6">
                                <ScrollView
                                    horizontal
                                    nestedScrollEnabled={Platform.OS === "android"}
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-1 pb-2"
                                    contentContainerStyle={{ gap: 24, paddingRight: 16 }}
                                >
                                    {sortedWeeks.map((w) => {
                                        const active = selectedWeekId === w.id;
                                        return (
                                            <Pressable
                                                key={w.id}
                                                onPress={() => setSelectedWeekId(w.id)}
                                                className="relative pb-2"
                                                style={{
                                                    maxWidth: width * 0.42,
                                                }}
                                            >
                                                <View className="flex-row items-center gap-1">
                                                    <Text
                                                        className="font-outfit-bold text-xs uppercase"
                                                        style={{
                                                            color: active ? c.primary : c.outlineVariant,
                                                        }}
                                                    >
                                                        Week {w.week}
                                                    </Text>
                                                </View>
                                                <Text
                                                    className="mt-0.5 font-outfit-bold text-base leading-tight"
                                                    style={{
                                                        color: active ? c.primary : c.onSurfaceVariant,
                                                    }}
                                                    numberOfLines={2}
                                                >
                                                    {w.title}
                                                </Text>
                                                {active ? (
                                                    <View
                                                        className="absolute bottom-0 left-0 h-1.5 w-8 rounded-full"
                                                        style={{ backgroundColor: c.primary }}
                                                    />
                                                ) : null}
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>

                                <View>
                                    <View className="mb-2 flex-row items-center justify-between gap-2">
                                        <Text
                                            className="flex-1 font-outfit-bold text-xl"
                                            style={{ color: c.onSurface }}
                                            numberOfLines={2}
                                        >
                                            {selectedWeek?.title ?? "Curriculum"}
                                        </Text>
                                        <Text
                                            className="text-sm font-medium"
                                            style={{ color: c.onSurfaceVariant }}
                                        >
                                            {modules.length} modules • {totalLessons} lessons
                                        </Text>
                                    </View>

                                    <View className="gap-4">
                                        {modules.map((mod, modIndex) => {
                                            const expanded = expandedModuleId === mod.id;
                                            const IconComp = modIndex === 0 ? Landmark : Shapes;
                                            const lessonCount = mod.course_lessons?.length ?? 0;
                                            return (
                                                <View
                                                    key={mod.id}
                                                    className="overflow-hidden rounded-2xl"
                                                    style={{
                                                        backgroundColor: c.surfaceLowest,
                                                        borderLeftWidth: modIndex === 0 ? 4 : 0,
                                                        borderLeftColor:
                                                            modIndex === 0 ? c.secondaryContainer : "transparent",
                                                    }}
                                                >
                                                    <Pressable
                                                        onPress={() => toggleModule(mod.id)}
                                                        className="flex-row items-center justify-between p-6 active:opacity-90"
                                                    >
                                                        <View className="flex-row items-center gap-4">
                                                            <View
                                                                className="h-12 w-12 items-center justify-center rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        modIndex === 0
                                                                            ? c.secondaryFixed
                                                                            : c.surfaceHigh,
                                                                }}
                                                            >
                                                                <IconComp
                                                                    size={22}
                                                                    color={
                                                                        modIndex === 0
                                                                            ? c.onSecondaryContainer
                                                                            : c.onSurfaceVariant
                                                                    }
                                                                    strokeWidth={2}
                                                                />
                                                            </View>
                                                            <View>
                                                                <Text
                                                                    className="font-bold"
                                                                    style={{ color: c.onSurface }}
                                                                >
                                                                    {mod.title}
                                                                </Text>
                                                                <Text
                                                                    className="text-xs"
                                                                    style={{ color: c.onSurfaceVariant }}
                                                                >
                                                                    {lessonCount}{" "}
                                                                    {lessonCount === 1 ? "lesson" : "lessons"}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <ChevronDown
                                                            size={22}
                                                            color={c.outline}
                                                            style={{
                                                                transform: [
                                                                    { rotate: expanded ? "180deg" : "0deg" },
                                                                ],
                                                            }}
                                                        />
                                                    </Pressable>
                                                    {expanded && mod.course_lessons?.length ? (
                                                        <View className="gap-3 px-6 pb-6">
                                                            {mod.course_lessons.map((lesson) => {
                                                                const canPlay = !!lesson.video_url?.trim();
                                                                const isCurrent =
                                                                    currentLessonId != null &&
                                                                    lesson.id === currentLessonId;
                                                                const showBorder = canPlay || isCurrent;
                                                                return (
                                                                    <Pressable
                                                                        key={lesson.id}
                                                                        disabled={!canPlay}
                                                                        onPress={() =>
                                                                            setInAppVideoRawUrl(lesson.video_url ?? null)
                                                                        }
                                                                        className="flex-row gap-3 rounded-xl p-4 active:opacity-90"
                                                                        style={{
                                                                            alignItems: "flex-start",
                                                                            backgroundColor: canPlay
                                                                                ? c.lessonRowPlayableFill
                                                                                : c.surfaceLow,
                                                                            borderWidth: showBorder ? 2 : 0,
                                                                            borderColor: isCurrent
                                                                                ? c.lessonRowCurrentBorder
                                                                                : canPlay
                                                                                    ? c.primaryContainer
                                                                                    : "transparent",
                                                                            opacity: canPlay ? 1 : 0.65,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-full"
                                                                            style={{
                                                                                backgroundColor: canPlay
                                                                                    ? c.primaryContainer
                                                                                    : `${c.outlineVariant}55`,
                                                                            }}
                                                                        >
                                                                            {canPlay ? (
                                                                                <PlayCircle
                                                                                    size={18}
                                                                                    color={c.onPrimaryContainer}
                                                                                    fill={c.onPrimaryContainer}
                                                                                    strokeWidth={0}
                                                                                />
                                                                            ) : (
                                                                                <FileText
                                                                                    size={16}
                                                                                    color={c.onSurfaceVariant}
                                                                                    strokeWidth={2}
                                                                                />
                                                                            )}
                                                                        </View>
                                                                        <View className="min-w-0 flex-1">
                                                                            <Text
                                                                                className={`text-sm leading-snug ${canPlay ? "font-bold" : "font-medium"}`}
                                                                                style={{
                                                                                    color: canPlay
                                                                                        ? c.onPrimaryFixedVariant
                                                                                        : c.onSurfaceVariant,
                                                                                }}
                                                                            >
                                                                                {lesson.title}
                                                                            </Text>
                                                                            {isCurrent && canPlay ? (
                                                                                <Text
                                                                                    className="mt-1 text-[10px] font-bold uppercase tracking-wide"
                                                                                    style={{
                                                                                        color: c.primary,
                                                                                    }}
                                                                                >
                                                                                    Continue here
                                                                                </Text>
                                                                            ) : null}
                                                                        </View>
                                                                        <View className="mt-0.5 w-9 shrink-0 items-end">
                                                                            {canPlay ? (
                                                                                <ChevronRight
                                                                                    size={20}
                                                                                    color={c.primary}
                                                                                    strokeWidth={2.2}
                                                                                />
                                                                            ) : (
                                                                                <Text
                                                                                    className="text-[10px] font-bold uppercase"
                                                                                    style={{
                                                                                        color: c.onSurfaceVariant,
                                                                                        opacity: 0.5,
                                                                                    }}
                                                                                >
                                                                                    No video
                                                                                </Text>
                                                                            )}
                                                                        </View>
                                                                    </Pressable>
                                                                );
                                                            })}
                                                        </View>
                                                    ) : null}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>

                            <View className="gap-6">
                                <LinearGradient
                                    colors={[c.milestoneFrom, c.milestoneTo]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        borderRadius: 16,
                                        padding: 24,
                                        shadowColor: "#000",
                                        shadowOpacity: 0.2,
                                        shadowRadius: 12,
                                        elevation: 6,
                                    }}
                                >
                                    <Text
                                        className="mb-4 font-outfit-bold text-xl"
                                        style={{ color: c.onPrimaryContainer }}
                                    >
                                        This cohort
                                    </Text>
                                    <Text
                                        className="mb-6 text-sm leading-relaxed"
                                        style={{ color: c.primaryFixed }}
                                    >
                                        {course.duration
                                            ? `${course.duration}.`
                                            : "Work through each week in order."}{" "}
                                        {course.language
                                            ? `Sessions and materials are in ${course.language}.`
                                            : null}
                                    </Text>
                                    <View
                                        className="flex-row items-center gap-4 rounded-xl p-4"
                                        style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                                    >
                                        <View
                                            className="h-12 w-12 items-center justify-center rounded-full"
                                            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                                        >
                                            <Medal size={24} color="#ffffff" fill="#ffffff" strokeWidth={0} />
                                        </View>
                                        <View>
                                            <Text
                                                className="text-[10px] font-bold uppercase tracking-widest"
                                                style={{ color: c.primaryFixed }}
                                            >
                                                Practice
                                            </Text>
                                            <Text className="font-bold text-white">
                                                {selectedWeek?.assessments?.length ?? 0} quiz questions
                                            </Text>
                                        </View>
                                    </View>
                                </LinearGradient>

                                <View className="rounded-2xl p-6" style={{ backgroundColor: c.surfaceHigh }}>
                                    <Text className="mb-4 font-outfit-bold text-lg" style={{ color: c.onSurface }}>
                                        Resources
                                    </Text>
                                    <View className="gap-3">
                                        {course.link_to_brochure ? (
                                            <Pressable
                                                onPress={() => {
                                                    openExternalUrl(course.link_to_brochure);
                                                }}
                                                className="flex-row items-center gap-3 rounded-xl p-3 active:opacity-80"
                                                style={{ backgroundColor: c.surfaceLowest }}
                                            >
                                                <FileText size={22} color={c.primary} strokeWidth={2} />
                                                <Text
                                                    className="flex-1 text-sm font-semibold"
                                                    style={{ color: c.onSurface }}
                                                >
                                                    Course brochure
                                                </Text>
                                                <ExternalLink size={18} color={c.outline} strokeWidth={2} />
                                            </Pressable>
                                        ) : null}
                                        {course.career_starter_kit_link ? (
                                            <Pressable
                                                onPress={() => {
                                                    openExternalUrl(course.career_starter_kit_link);
                                                }}
                                                className="flex-row items-center gap-3 rounded-xl p-3 active:opacity-80"
                                                style={{ backgroundColor: c.surfaceLowest }}
                                            >
                                                <BookOpen size={22} color={c.primary} strokeWidth={2} />
                                                <Text
                                                    className="flex-1 text-sm font-semibold"
                                                    style={{ color: c.onSurface }}
                                                >
                                                    Career starter kit
                                                </Text>
                                                <ExternalLink size={18} color={c.outline} strokeWidth={2} />
                                            </Pressable>
                                        ) : null}
                                        {course.whatsapp_community_link ? (
                                            <Pressable
                                                onPress={() => {
                                                    openExternalUrl(course.whatsapp_community_link);
                                                }}
                                                className="flex-row items-center gap-3 rounded-xl p-3 active:opacity-80"
                                                style={{ backgroundColor: c.surfaceLowest }}
                                            >
                                                <MessageCircle size={22} color={c.primary} strokeWidth={2} />
                                                <Text
                                                    className="flex-1 text-sm font-semibold"
                                                    style={{ color: c.onSurface }}
                                                >
                                                    WhatsApp community
                                                </Text>
                                                <ExternalLink size={18} color={c.outline} strokeWidth={2} />
                                            </Pressable>
                                        ) : null}
                                        {!course.link_to_brochure &&
                                            !course.career_starter_kit_link &&
                                            !course.whatsapp_community_link ? (
                                            <Text className="text-sm" style={{ color: c.onSurfaceVariant }}>
                                                No links provided for this course yet.
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
