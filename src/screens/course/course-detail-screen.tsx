import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  BookOpen,
  ChevronDown,
  CircleCheckBig,
  Download,
  ExternalLink,
  FileText,
  MessageCircle,
  MoreVertical,
  Play,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseInlineVideoPlayer } from "@/components/course-in-app-video-modal";
import { LuminaCourseDetailSkeleton } from "@/components/ui/course-loading-skeletons";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserCourseDetail } from "@/hooks/use-user-course-detail";
import {
  type UserCourseDetailCourse,
  type UserCourseInstructor,
  type UserCourseLesson,
  type UserCourseModule,
  type UserCourseWeek,
} from "@/lib/api-client";
import { parseUserCourseDetailBundle } from "@/lib/parse-user-course-detail";
import { CourseCoverForSlug } from "@/utils/course-cover";
import {
  extractHtmlListItems,
  extractHtmlParagraphs,
  normalizeHtmlToPlainText,
} from "@/utils/html-content";
import { resolveMediaUrl } from "@/utils/resolve-media-url";

const BRAND_PRIMARY = Colors.light.primary;
const BRAND_LIGHT = Colors.light.primaryLight;
const BRAND_DARK = Colors.light.primaryDark;

const LIGHT = {
  bg: "#F7F3EF",
  panel: "#FFFFFF",
  panelMuted: "#F9F4EF",
  panelStrong: "#F3E8DD",
  panelAccent: "#FFF4EA",
  text: "#111318",
  textMuted: "#6B7280",
  textSoft: "#9298A6",
  border: "#E8DDD3",
  borderStrong: "#D9C5B4",
  accent: BRAND_PRIMARY,
  accentStrong: BRAND_DARK,
  accentSoft: "rgba(218, 103, 40, 0.12)",
  accentBorder: "rgba(218, 103, 40, 0.28)",
  overlay: "rgba(10, 11, 14, 0.48)",
  heroFallback: "#111114",
  cardShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
  blurTint: "light" as const,
} as const;

const DARK = {
  bg: "#0A0A0A",
  panel: "#151515",
  panelMuted: "#1E1B18",
  panelStrong: "#29221C",
  panelAccent: "#211711",
  text: "#F8F8FB",
  textMuted: "#B1B5C3",
  textSoft: "#8F94A3",
  border: "#2D2F37",
  borderStrong: "#3A3D47",
  accent: BRAND_PRIMARY,
  accentStrong: BRAND_LIGHT,
  accentSoft: "rgba(218, 103, 40, 0.18)",
  accentBorder: "rgba(240, 138, 75, 0.34)",
  overlay: "rgba(0, 0, 0, 0.48)",
  heroFallback: "#000000",
  cardShadow: "0 20px 40px rgba(0, 0, 0, 0.32)",
  blurTint: "dark" as const,
} as const;

interface CourseDetailScreenProps {
  courseId: string;
}

interface ActiveVideoState {
  rawUrl: string;
  title: string;
  eyebrow: string;
  description?: string | null;
}

type DetailTab = "lectures" | "downloads" | "more";

function formatSlugLabel(slug: string): string {
  if (!slug) return "Course";
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function findWeekIdForLesson(weeks: UserCourseWeek[], lessonId: number): number | null {
  for (const week of weeks) {
    for (const module of week.course_module ?? []) {
      if (module.course_lessons?.some((lesson) => lesson.id === lessonId)) {
        return week.id;
      }
    }
  }
  return null;
}

function findLessonById(weeks: UserCourseWeek[], lessonId: number): UserCourseLesson | null {
  for (const week of weeks) {
    for (const module of week.course_module ?? []) {
      const lesson = module.course_lessons?.find((item) => item.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return null;
}

function findLessonContext(
  weeks: UserCourseWeek[],
  lessonId: number,
): { week: UserCourseWeek; module: UserCourseModule; lesson: UserCourseLesson } | null {
  for (const week of weeks) {
    for (const module of week.course_module ?? []) {
      const lesson = module.course_lessons?.find((item) => item.id === lessonId);
      if (lesson) {
        return { week, module, lesson };
      }
    }
  }
  return null;
}

function findFirstPlayableLesson(weeks: UserCourseWeek[]): UserCourseLesson | null {
  for (const week of weeks) {
    for (const module of week.course_module ?? []) {
      for (const lesson of module.course_lessons ?? []) {
        if (lesson.video_url?.trim()) return lesson;
      }
    }
  }
  return null;
}

function findWeekIdForFirstPlayableLesson(weeks: UserCourseWeek[]): number | null {
  for (const week of weeks) {
    for (const module of week.course_module ?? []) {
      for (const lesson of module.course_lessons ?? []) {
        if (lesson.video_url?.trim()) return week.id;
      }
    }
  }
  return null;
}

async function openExternalUrl(url: string | null | undefined) {
  if (!url?.trim()) return;
  await WebBrowser.openBrowserAsync(url.trim());
}

function getPrimaryInstructor(course: UserCourseDetailCourse | null | undefined): UserCourseInstructor | null {
  return course?.instructors?.find((instructor) => instructor.name?.trim()) ?? null;
}

function getInstructorLabel(course: UserCourseDetailCourse | null | undefined): string {
  return "10Alytics";
}

function getInstructorRole(course: UserCourseDetailCourse | null | undefined, fallback: string): string {
  return getPrimaryInstructor(course)?.career?.trim() || fallback;
}

function FloatingHeaderButton({
  tint,
  children,
  accessibilityLabel,
  onPress,
}: {
  tint: "light" | "dark";
  children: React.ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <BlurView
      intensity={tint === "dark" ? 48 : 62}
      tint={tint}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: tint === "dark" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.55)",
      }}
    >
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tint === "dark" ? "rgba(8,8,10,0.22)" : "rgba(255,255,255,0.24)",
        }}
      >
        {children}
      </Pressable>
    </BlurView>
  );
}

export function CourseDetailScreen({ courseId }: CourseDetailScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const c = isDark ? DARK : LIGHT;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topVideoAspectRatio = 1.68;
  const topVideoHeight = Math.round(width / topVideoAspectRatio);

  const enrollmentId = useMemo(() => {
    const parsed = Number.parseInt(courseId, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [courseId]);

  const {
    data: apiResponse,
    isPending,
    isError,
    error,
    refetch,
  } = useUserCourseDetail(enrollmentId);

  const bundle = useMemo(() => parseUserCourseDetailBundle(apiResponse), [apiResponse]);
  const course = bundle?.course ?? null;
  const progressPct = bundle ? Math.round(bundle.progress_percentage) : 0;
  const currentLessonId =
    bundle?.current_week_video_id != null && Number.isFinite(bundle.current_week_video_id)
      ? bundle.current_week_video_id
      : null;

  const mainScrollRef = useRef<ScrollView>(null);
  const didBootstrapWeekFromProgress = useRef(false);

  const sortedWeeks = useMemo((): UserCourseWeek[] => {
    if (!course?.course_weeks?.length) return [];
    return [...course.course_weeks]
      .filter((week) => Number(week.isDeleted) !== 1)
      .sort((a, b) => a.week - b.week);
  }, [course]);

  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<ActiveVideoState | null>(null);
  const [selectedTab, setSelectedTab] = useState<DetailTab>("lectures");
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    didBootstrapWeekFromProgress.current = false;
    setSelectedTab("lectures");
    setShowFullDescription(false);
  }, [courseId]);

  useEffect(() => {
    if (sortedWeeks.length === 0) return;
    const weekForLesson =
      currentLessonId != null
        ? findWeekIdForLesson(sortedWeeks, currentLessonId)
        : findWeekIdForFirstPlayableLesson(sortedWeeks);

    setSelectedWeekId((previous) => {
      const previousIsValid = previous != null && sortedWeeks.some((week) => week.id === previous);
      if (previousIsValid) {
        if (
          !didBootstrapWeekFromProgress.current &&
          weekForLesson != null &&
          previous !== weekForLesson
        ) {
          didBootstrapWeekFromProgress.current = true;
          return weekForLesson;
        }
        return previous;
      }

      if (weekForLesson != null) {
        didBootstrapWeekFromProgress.current = true;
        return weekForLesson;
      }

      return sortedWeeks[0].id;
    });
  }, [sortedWeeks, currentLessonId]);

  const selectedWeek = useMemo(
    () => sortedWeeks.find((week) => week.id === selectedWeekId) ?? null,
    [sortedWeeks, selectedWeekId],
  );

  const modules = selectedWeek?.course_module ?? [];

  const resumeLesson = useMemo(() => {
    if (!sortedWeeks.length) return null;
    if (currentLessonId != null) {
      const lesson = findLessonById(sortedWeeks, currentLessonId);
      if (lesson?.video_url?.trim()) return lesson;
    }
    return findFirstPlayableLesson(sortedWeeks);
  }, [sortedWeeks, currentLessonId]);

  const resumeLessonContext = useMemo(
    () => (resumeLesson ? findLessonContext(sortedWeeks, resumeLesson.id) : null),
    [sortedWeeks, resumeLesson],
  );

  useEffect(() => {
    if (!selectedWeek) return;
    if (currentLessonId != null) {
      const moduleWithCurrent = selectedWeek.course_module.find((module) =>
        module.course_lessons?.some((lesson) => lesson.id === currentLessonId),
      );
      if (moduleWithCurrent) {
        setExpandedModuleId(moduleWithCurrent.id);
        return;
      }
    }

    const firstPlayableModule = selectedWeek.course_module.find((module) =>
      module.course_lessons?.some((lesson) => lesson.video_url?.trim()),
    );
    const firstModule = selectedWeek.course_module?.[0];
    setExpandedModuleId(firstPlayableModule?.id ?? firstModule?.id ?? null);
  }, [selectedWeek, currentLessonId]);

  useEffect(() => {
    if (!activeVideo) return;
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [activeVideo]);

  const heroUri = course?.image ? resolveMediaUrl(course.image) : undefined;
  const slug = course?.slug ?? "";
  const categoryLabel = course?.level?.trim() ? course.level : formatSlugLabel(slug);
  const lessonCountAcrossCourse = useMemo(
    () =>
      sortedWeeks.reduce(
        (weekAcc, week) =>
          weekAcc +
          week.course_module.reduce(
            (moduleAcc, module) => moduleAcc + (module.course_lessons?.length ?? 0),
            0,
          ),
        0,
      ),
    [sortedWeeks],
  );
  const moduleCountAcrossCourse = useMemo(
    () => sortedWeeks.reduce((count, week) => count + (week.course_module?.length ?? 0), 0),
    [sortedWeeks],
  );
  const totalLessonsInSelectedWeek = useMemo(
    () => modules.reduce((acc, module) => acc + (module.course_lessons?.length ?? 0), 0),
    [modules],
  );
  const selectedWeekAssessments = selectedWeek?.assessments?.length ?? 0;

  const rawCourseDescription =
    course?.description ||
    course?.tagline ||
    "Build real momentum with a structured course path, guided lessons, and weekly practice.";
  const courseParagraphs = useMemo(() => {
    const parsed = extractHtmlParagraphs(rawCourseDescription);
    if (parsed.length) return parsed;
    const fallback = normalizeHtmlToPlainText(rawCourseDescription);
    return fallback ? [fallback] : [];
  }, [rawCourseDescription]);
  const courseHighlights = useMemo(
    () => extractHtmlListItems(course?.description).slice(0, 6),
    [course?.description],
  );
  const shouldTruncateDescription =
    courseParagraphs.length > 2 || courseParagraphs.join("\n\n").length > 340;
  const visibleCourseParagraphs = showFullDescription
    ? courseParagraphs
    : courseParagraphs.slice(0, 2);

  const pinnedVideo = useMemo(() => {
    if (activeVideo) return activeVideo;

    const resumeUrl = resumeLesson?.video_url?.trim();
    if (resumeLesson && resumeUrl) {
      return {
        rawUrl: resumeUrl,
        title: resumeLesson.title,
        eyebrow:
          resumeLessonContext?.week && resumeLessonContext?.module
            ? `Module ${resumeLessonContext.week.week} • ${resumeLessonContext.module.title}`
            : "Continue learning",
        description: normalizeHtmlToPlainText(resumeLesson.description),
      };
    }

    const trailerUrl = course?.video?.trim();
    if (trailerUrl) {
      return {
        rawUrl: trailerUrl,
        title: course?.title ?? "Course trailer",
        eyebrow: "Course trailer",
        description: normalizeHtmlToPlainText(course?.tagline || course?.description),
      };
    }

    return null;
  }, [activeVideo, course, resumeLesson, resumeLessonContext]);

  const pinnedLessonTitle =
    pinnedVideo && pinnedVideo.title !== (course?.title ?? "") ? pinnedVideo.title : null;

  const primaryResource = useMemo(() => {
    if (course?.link_to_brochure) {
      return { label: "Course guide", subtitle: "Open brochure", url: course.link_to_brochure };
    }
    if (course?.career_starter_kit_link) {
      return {
        label: "Career starter kit",
        subtitle: "Prep materials and career assets",
        url: course.career_starter_kit_link,
      };
    }
    if (course?.whatsapp_community_link) {
      return {
        label: "Community chat",
        subtitle: "Ask questions and connect with learners",
        url: course.whatsapp_community_link,
      };
    }
    return null;
  }, [course]);

  const resourceItems = [
    course?.link_to_brochure
      ? {
        key: "brochure",
        label: "Course brochure",
        subtitle: "Open the full course guide",
        url: course.link_to_brochure,
        icon: FileText,
      }
      : null,
    course?.career_starter_kit_link
      ? {
        key: "starter-kit",
        label: "Career starter kit",
        subtitle: "Templates, preparation, and next-step resources",
        url: course.career_starter_kit_link,
        icon: BookOpen,
      }
      : null,
    course?.whatsapp_community_link
      ? {
        key: "community",
        label: "WhatsApp community",
        subtitle: "Get support from mentors and learners",
        url: course.whatsapp_community_link,
        icon: MessageCircle,
      }
      : null,
  ].filter(Boolean) as {
    key: string;
    label: string;
    subtitle: string;
    url: string;
    icon: typeof FileText;
  }[];

  const leadInstructor = getInstructorLabel(course);
  const leadInstructorRole = getInstructorRole(course, categoryLabel);
  const leadInstructorImage = getPrimaryInstructor(course)?.image_url
    ? resolveMediaUrl(getPrimaryInstructor(course)?.image_url)
    : undefined;

  const courseMetaItems = [
    `${progressPct}% complete`,
    course?.duration?.trim() || null,
    course?.language?.trim() || null,
    `${lessonCountAcrossCourse} lectures`,
  ].filter(Boolean) as string[];

  const helperCardDescription = course?.whatsapp_community_link
    ? "Stuck on a lesson or assignment? Jump into the community and ask for help while you learn."
    : resourceItems.length
      ? "Need supporting material? Your course guide and downloadable resources are one tap away."
      : "Keep your momentum going with the next lecture and the course overview.";

  const helperCardActionLabel = course?.whatsapp_community_link
    ? "Start chat"
    : resourceItems.length
      ? "Open downloads"
      : resumeLesson
        ? "Continue lesson"
        : "Read more";

  function openLesson(
    lesson: UserCourseLesson,
    week?: UserCourseWeek,
    module?: UserCourseModule,
  ) {
    const rawUrl = lesson.video_url?.trim();
    if (!rawUrl) return;
    setActiveVideo({
      rawUrl,
      title: lesson.title,
      eyebrow: week && module ? `Module ${week.week} • ${module.title}` : "Course lesson",
      description: normalizeHtmlToPlainText(lesson.description),
    });
    setSelectedTab("lectures");
  }

  function toggleModule(moduleId: number) {
    setExpandedModuleId((previous) => (previous === moduleId ? null : moduleId));
  }

  function handleHeaderAction() {
    if (activeVideo) {
      setActiveVideo(null);
      return;
    }
    if (primaryResource) {
      openExternalUrl(primaryResource.url).catch(() => { });
      return;
    }
    setSelectedTab("more");
  }

  function handleHelperAction() {
    if (course?.whatsapp_community_link) {
      openExternalUrl(course.whatsapp_community_link).catch(() => { });
      return;
    }
    if (resourceItems.length) {
      setSelectedTab("downloads");
      return;
    }
    if (resumeLesson) {
      openLesson(resumeLesson, resumeLessonContext?.week, resumeLessonContext?.module);
      return;
    }
    setSelectedTab("more");
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
        }}
      >
        <Animated.View entering={FadeIn.delay(220).duration(180)}>
          <View
            pointerEvents="none"
            style={{
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 42,
                height: 5,
                borderRadius: 999,
                backgroundColor: isDark ? "rgba(255,255,255,0.28)" : "rgba(17,19,24,0.18)",
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <FloatingHeaderButton
              accessibilityLabel="Close course"
              onPress={() => router.back()}
              tint={c.blurTint}
            >
              <X color={isDark ? "#FFFFFF" : "#111318"} size={20} strokeWidth={2.3} />
            </FloatingHeaderButton>

            <FloatingHeaderButton
              accessibilityLabel={activeVideo ? "Close active lesson" : "More course actions"}
              onPress={handleHeaderAction}
              tint={c.blurTint}
            >
              {activeVideo ? (
                <X color={isDark ? "#FFFFFF" : "#111318"} size={20} strokeWidth={2.3} />
              ) : (
                <MoreVertical color={isDark ? "#FFFFFF" : "#111318"} size={21} strokeWidth={2.2} />
              )}
            </FloatingHeaderButton>
          </View>
        </Animated.View>
      </View>

      <ScrollView
        ref={mainScrollRef}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 0,
          paddingBottom: insets.bottom + 36,
          paddingHorizontal: 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        {enrollmentId == null ? (
          <View
            style={{
              minHeight: 220,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingTop: insets.top + 112,
              paddingBottom: 32,
            }}
          >
            <Text selectable style={{ color: c.textMuted, fontSize: 15, textAlign: "center" }}>
              This course link is invalid. Open it again from your course list.
            </Text>
          </View>
        ) : isPending ? (
          <LuminaCourseDetailSkeleton
            heroH={topVideoHeight}
            surfaceHighest={c.panelMuted}
            surfaceHigh={c.panel}
          />
        ) : isError || !course ? (
          <View
            style={{
              minHeight: 220,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingTop: insets.top + 112,
              paddingBottom: 32,
              gap: 16,
            }}
          >
            <Text selectable style={{ color: c.textMuted, fontSize: 15, textAlign: "center" }}>
              {error?.message ?? "Could not load this course."}
            </Text>
            <Pressable
              onPress={async () => {
                await refetch();
              }}
              style={{
                borderRadius: 999,
                backgroundColor: c.accent,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: "#000000" }}>
              {pinnedVideo ? (
                <CourseInlineVideoPlayer
                  aspectRatio={topVideoAspectRatio}
                  playerWidth={width}
                  rawUrl={pinnedVideo.rawUrl}
                  rounded={false}
                  showCloseButton={false}
                  title={pinnedVideo.title}
                />
              ) : (
                <View
                  style={{
                    width,
                    height: topVideoHeight,
                    backgroundColor: c.heroFallback,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {heroUri ? (
                    <Image
                      source={{ uri: heroUri }}
                      resizeMode="cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <CourseCoverForSlug slug={slug || "data-analysis"} size={width * 0.56} />
                  )}

                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      backgroundColor: c.overlay,
                    }}
                  />
                </View>
              )}
            </View>

            <View style={{ paddingHorizontal: 18, paddingTop: 16, gap: 18 }}>
              <Animated.View entering={FadeInDown.duration(300)} style={{ gap: 8 }}>
                <Text
                  style={{
                    color: c.textMuted,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  {leadInstructor}
                </Text>

                <Text
                  selectable
                  style={{
                    color: c.text,
                    fontSize: 33,
                    lineHeight: 40,
                    fontWeight: "800",
                    letterSpacing: -0.9,
                  }}
                >
                  {course.title}
                </Text>

                <Text
                  style={{
                    color: c.accentStrong,
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "700",
                  }}
                >
                  {pinnedLessonTitle
                    ? `Now playing: ${pinnedLessonTitle}`
                    : pinnedVideo?.eyebrow ?? leadInstructorRole}
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                  {courseMetaItems.map((item) => (
                    <View
                      key={item}
                      style={{
                        borderRadius: 999,
                        borderCurve: "continuous",
                        backgroundColor: c.panelMuted,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderWidth: 1,
                        borderColor: c.border,
                      }}
                    >
                      <Text
                        style={{
                          color: c.textMuted,
                          fontSize: 12,
                          fontWeight: "800",
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(60).duration(320)}
                style={{
                  borderCurve: "continuous",
                  backgroundColor: c.panelAccent,
                  borderWidth: 1,
                  borderColor: c.accentBorder,
                  padding: 16,
                  gap: 12,
                  boxShadow: c.cardShadow,
                }}
              >
                <View style={{ gap: 8 }}>
                  <Text style={{ color: c.text, fontSize: 18, fontWeight: "800" }}>
                    Ask a question
                  </Text>
                  <Text
                    style={{
                      color: c.textMuted,
                      fontSize: 14,
                      lineHeight: 21,
                    }}
                  >
                    {helperCardDescription}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleHelperAction}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    alignSelf: "flex-start",
                  }}
                >
                  <Sparkles color={c.accent} size={18} strokeWidth={2.2} />
                  <Text style={{ color: c.accentStrong, fontSize: 16, fontWeight: "800" }}>
                    {helperCardActionLabel}
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(120).duration(340)} style={{ gap: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 22,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                    paddingBottom: 0,
                  }}
                >
                  {[
                    { key: "lectures" as const, label: "Lectures" },
                    { key: "downloads" as const, label: "Downloads" },
                    { key: "more" as const, label: "More" },
                  ].map((tab) => {
                    const active = selectedTab === tab.key;
                    return (
                      <Pressable
                        key={tab.key}
                        accessibilityRole="button"
                        onPress={() => setSelectedTab(tab.key)}
                        style={{
                          paddingBottom: 13,
                          paddingHorizontal: 2,
                          position: "relative",
                        }}
                      >
                        <Text
                          style={{
                            color: active ? c.accentStrong : c.textMuted,
                            fontSize: 16,
                            fontWeight: active ? "800" : "700",
                          }}
                        >
                          {tab.label}
                        </Text>
                        <View
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -1,
                            height: 3,
                            borderRadius: 999,
                            backgroundColor: active ? c.accent : "transparent",
                          }}
                        />
                      </Pressable>
                    );
                  })}
                </View>

                {selectedTab === "lectures" ? (
                  <View style={{ gap: 18 }}>
                    {sortedWeeks.length > 1 ? (
                      <ScrollView
                        horizontal
                        nestedScrollEnabled={Platform.OS === "android"}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, paddingRight: 16 }}
                      >
                        {sortedWeeks.map((week) => {
                          const active = selectedWeekId === week.id;
                          return (
                            <Pressable
                              key={week.id}
                              onPress={() => setSelectedWeekId(week.id)}
                              style={{
                                borderCurve: "continuous",
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                backgroundColor: active ? c.accentSoft : c.panelMuted,
                                borderWidth: 1,
                                borderColor: active ? c.accent : c.border,
                              }}
                            >
                              <Text
                                style={{
                                  color: active ? c.accentStrong : c.textMuted,
                                  fontSize: 13,
                                  fontWeight: "800",
                                }}
                              >
                                {`Week ${week.week}`}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    ) : null}

                    {selectedWeek ? (
                      <View style={{ gap: 6 }}>
                        <Text
                          style={{
                            color: c.textMuted,
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        >
                          {`Week ${selectedWeek.week}`}
                        </Text>
                        <Text
                          selectable
                          style={{
                            color: c.text,
                            fontSize: 24,
                            lineHeight: 30,
                            fontWeight: "800",
                          }}
                        >
                          {selectedWeek.title}
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                          {[
                            `${totalLessonsInSelectedWeek} lectures`,
                            `${selectedWeekAssessments} assessments`,
                            `${modules.length} sections`,
                          ].map((item) => (
                            <View
                              key={item}
                              style={{
                                borderCurve: "continuous",
                                backgroundColor: c.panelMuted,
                                paddingHorizontal: 11,
                                paddingVertical: 6,
                                borderWidth: 1,
                                borderColor: c.borderStrong,
                              }}
                            >
                              <Text
                                style={{
                                  color: c.textMuted,
                                  fontSize: 12,
                                  fontWeight: "700",
                                }}
                              >
                                {item}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {modules.length ? (
                      modules.map((module, moduleIndex) => {
                        const lessons = module.course_lessons ?? [];
                        const isExpanded = expandedModuleId === module.id;
                        const sectionStartIndex = modules
                          .slice(0, moduleIndex)
                          .reduce((count, item) => count + (item.course_lessons?.length ?? 0), 0);
                        const moduleHasCurrent = lessons.some((lesson) => lesson.id === currentLessonId);

                        return (
                          <View
                            key={module.id}
                            style={{
                              borderBottomWidth: 1,
                              borderBottomColor: c.border,
                              paddingBottom: 16,
                              gap: 12,
                            }}
                          >
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => toggleModule(module.id)}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 16,
                              }}
                            >
                              <View style={{ flex: 1, gap: 4 }}>
                                <Text
                                  style={{
                                    color: c.textMuted,
                                    fontSize: 14,
                                    fontWeight: "700",
                                  }}
                                >
                                  {`Section ${moduleIndex + 1}`}
                                </Text>
                                <Text
                                  selectable
                                  style={{
                                    color: c.text,
                                    fontSize: 20,
                                    lineHeight: 26,
                                    fontWeight: "800",
                                  }}
                                >
                                  {module.title}
                                </Text>
                              </View>

                              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                {moduleHasCurrent ? (
                                  <View
                                    style={{
                                      paddingHorizontal: 10,
                                      paddingVertical: 6,
                                      backgroundColor: c.accentSoft,
                                      borderWidth: 1,
                                      borderColor: c.accentBorder,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: c.accentStrong,
                                        fontSize: 11,
                                        fontWeight: "800",
                                      }}
                                    >
                                      Current
                                    </Text>
                                  </View>
                                ) : null}
                                <ChevronDown
                                  color={c.textMuted}
                                  size={20}
                                  strokeWidth={2.2}
                                  style={{
                                    transform: [{ rotate: isExpanded ? "0deg" : "-90deg" }],
                                  }}
                                />
                              </View>
                            </Pressable>

                            {isExpanded ? (
                              <View style={{ gap: 0 }}>
                                {lessons.map((lesson, lessonIndex) => {
                                  const rawUrl = lesson.video_url?.trim();
                                  const canPlay = !!rawUrl;
                                  const isCurrent = currentLessonId === lesson.id;
                                  const isWatching =
                                    activeVideo?.rawUrl === rawUrl && activeVideo?.title === lesson.title;

                                  const lessonMeta =
                                    isWatching
                                      ? "Now playing"
                                      : isCurrent
                                        ? "Continue here"
                                        : canPlay
                                          ? "Video lesson"
                                          : "No video available";

                                  return (
                                    <Pressable
                                      key={lesson.id}
                                      accessibilityRole="button"
                                      disabled={!canPlay}
                                      onPress={() => openLesson(lesson, selectedWeek ?? undefined, module)}
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "flex-start",
                                        gap: 12,
                                        paddingVertical: 13,
                                        opacity: canPlay ? 1 : 0.56,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          width: 24,
                                          color: c.textSoft,
                                          fontSize: 18,
                                          lineHeight: 26,
                                          fontWeight: "700",
                                          fontVariant: ["tabular-nums"],
                                        }}
                                      >
                                        {sectionStartIndex + lessonIndex + 1}
                                      </Text>

                                      <View
                                        style={{
                                          width: 22,
                                          height: 22,
                                          borderCurve: "continuous",
                                          marginTop: 2,
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor:
                                            isWatching || isCurrent ? c.accent : c.accentSoft,
                                          borderWidth: isWatching || isCurrent ? 0 : 1,
                                          borderColor: c.accentBorder,
                                        }}
                                      >
                                        {isWatching || isCurrent ? (
                                          <CircleCheckBig color="#FFFFFF" size={14} strokeWidth={2.4} />
                                        ) : canPlay ? (
                                          <Play color={c.accentStrong} size={12} fill={c.accentStrong} />
                                        ) : null}
                                      </View>

                                      <View style={{ flex: 1, gap: 4, paddingRight: 8 }}>
                                        <Text
                                          selectable
                                          style={{
                                            color: c.text,
                                            fontSize: 16,
                                            lineHeight: 23,
                                            fontWeight: "700",
                                          }}
                                        >
                                          {lesson.title}
                                        </Text>
                                        <Text
                                          style={{
                                            color:
                                              isWatching || isCurrent ? c.accentStrong : c.textMuted,
                                            fontSize: 13,
                                            fontWeight: "500",
                                          }}
                                        >
                                          {lessonMeta}
                                        </Text>
                                      </View>

                                      <View
                                        style={{
                                          width: 36,
                                          height: 36,
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: c.panelMuted,
                                          borderColor:
                                            isWatching || isCurrent ? c.accentBorder : c.borderStrong,
                                        }}
                                      >
                                        {canPlay ? (
                                          <PlayCircle
                                            color={isWatching || isCurrent ? c.accentStrong : c.textMuted}
                                            size={18}
                                            strokeWidth={2}
                                          />
                                        ) : (
                                          <FileText color={c.textMuted} size={17} strokeWidth={2} />
                                        )}
                                      </View>
                                    </Pressable>
                                  );
                                })}
                              </View>
                            ) : null}
                          </View>
                        );
                      })
                    ) : (
                      <View
                        style={{
                          borderCurve: "continuous",
                          backgroundColor: c.panel,
                          borderWidth: 1,
                          borderColor: c.border,
                          padding: 16,
                        }}
                      >
                        <Text style={{ color: c.textMuted, fontSize: 15, lineHeight: 22 }}>
                          No lectures are available for this course yet.
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}

                {selectedTab === "downloads" ? (
                  <View style={{ gap: 16 }}>
                    <View
                      style={{
                        borderCurve: "continuous",
                        backgroundColor: c.panel,
                        borderWidth: 1,
                        borderColor: c.border,
                        padding: 16,
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: c.text, fontSize: 20, fontWeight: "800" }}>
                        Downloads and resources
                      </Text>
                      <Text style={{ color: c.textMuted, fontSize: 15, lineHeight: 22 }}>
                        Keep the supporting material for this course close. Videos continue to stream in
                        the player above.
                      </Text>
                    </View>

                    {resourceItems.length ? (
                      resourceItems.map((resource) => {
                        const Icon = resource.icon;
                        return (
                          <Pressable
                            key={resource.key}
                            accessibilityRole="button"
                            onPress={() => {
                              openExternalUrl(resource.url).catch(() => { });
                            }}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 14,
                              borderCurve: "continuous",
                              backgroundColor: c.panel,
                              borderWidth: 1,
                              borderColor: c.border,
                              padding: 15,
                              boxShadow: c.cardShadow,
                            }}
                          >
                            <View
                              style={{
                                width: 46,
                                height: 46,
                                borderCurve: "continuous",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: c.panelAccent,
                                borderWidth: 1,
                                borderColor: c.accentBorder,
                              }}
                            >
                              <Icon color={c.accentStrong} size={20} strokeWidth={2.1} />
                            </View>

                            <View style={{ flex: 1, gap: 4 }}>
                              <Text style={{ color: c.text, fontSize: 16, fontWeight: "800" }}>
                                {resource.label}
                              </Text>
                              <Text style={{ color: c.textMuted, fontSize: 14, lineHeight: 20 }}>
                                {resource.subtitle}
                              </Text>
                            </View>

                            <ExternalLink color={c.textMuted} size={18} strokeWidth={2.1} />
                          </Pressable>
                        );
                      })
                    ) : (
                      <View
                        style={{
                          borderCurve: "continuous",
                          backgroundColor: c.panel,
                          borderWidth: 1,
                          borderColor: c.border,
                          padding: 16,
                          gap: 12,
                        }}
                      >
                        <Download color={c.textMuted} size={24} strokeWidth={2} />
                        <Text style={{ color: c.text, fontSize: 17, fontWeight: "800" }}>
                          No course files yet
                        </Text>
                        <Text style={{ color: c.textMuted, fontSize: 15, lineHeight: 22 }}>
                          When brochures, starter kits, or community links are attached to this course,
                          they’ll show up here.
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}

                {selectedTab === "more" ? (
                  <View style={{ gap: 16 }}>
                    <View
                      style={{
                        borderCurve: "continuous",
                        backgroundColor: c.panel,
                        borderWidth: 1,
                        borderColor: c.border,
                        padding: 16,
                        gap: 12,
                      }}
                    >
                      <Text style={{ color: c.text, fontSize: 20, fontWeight: "800" }}>
                        About this course
                      </Text>
                      <View style={{ gap: 12 }}>
                        {visibleCourseParagraphs.map((paragraph, index) => (
                          <Text
                            key={`paragraph-${index}`}
                            selectable
                            style={{ color: c.textMuted, fontSize: 15, lineHeight: 25 }}
                          >
                            {paragraph}
                          </Text>
                        ))}
                      </View>
                      {shouldTruncateDescription ? (
                        <Pressable onPress={() => setShowFullDescription((value) => !value)}>
                          <Text style={{ color: c.accentStrong, fontSize: 15, fontWeight: "800" }}>
                            {showFullDescription ? "Show less" : "Show more"}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>

                    {courseHighlights.length ? (
                      <View
                        style={{
                          borderCurve: "continuous",
                          backgroundColor: c.panel,
                          borderWidth: 1,
                          borderColor: c.border,
                          padding: 16,
                          gap: 14,
                        }}
                      >
                        <Text style={{ color: c.text, fontSize: 20, fontWeight: "800" }}>
                          What you&apos;ll learn
                        </Text>
                        <View style={{ gap: 12 }}>
                          {courseHighlights.map((item) => (
                            <View
                              key={item}
                              style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
                            >
                              <View
                                style={{
                                  width: 8,
                                  height: 8,
                                  marginTop: 8,
                                  backgroundColor: c.accent,
                                }}
                              />
                              <Text style={{ flex: 1, color: c.textMuted, fontSize: 15, lineHeight: 24 }}>
                                {item}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    <View
                      style={{
                        borderRadius: 24,
                        borderCurve: "continuous",
                        backgroundColor: c.panel,
                        borderWidth: 1,
                        borderColor: c.border,
                        padding: 16,
                        gap: 14,
                      }}
                    >
                      <Text style={{ color: c.text, fontSize: 20, fontWeight: "800" }}>
                        Instructor
                      </Text>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                        <View
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 27,
                            borderCurve: "continuous",
                            overflow: "hidden",
                            backgroundColor: c.panelAccent,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: c.accentBorder,
                          }}
                        >
                          {leadInstructorImage ? (
                            <Image
                              source={{ uri: leadInstructorImage }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={{ color: c.text, fontSize: 20, fontWeight: "800" }}>
                              {leadInstructor.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>

                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={{ color: c.text, fontSize: 17, fontWeight: "800" }}>
                            {leadInstructor}
                          </Text>
                          <Text style={{ color: c.textMuted, fontSize: 14, lineHeight: 20 }}>
                            {leadInstructorRole}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        borderRadius: 24,
                        borderCurve: "continuous",
                        backgroundColor: c.panel,
                        borderWidth: 1,
                        borderColor: c.border,
                        padding: 16,
                        gap: 14,
                      }}
                    >
                      <Text style={{ color: c.text, fontSize: 20, fontWeight: "800" }}>
                        Course details
                      </Text>
                      {[
                        { label: "Level", value: categoryLabel },
                        { label: "Language", value: course.language?.trim() || "English" },
                        { label: "Duration", value: course.duration?.trim() || "Self-paced" },
                        { label: "Weeks", value: `${moduleCountAcrossCourse}` },
                      ].map((item) => (
                        <View
                          key={item.label}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            paddingBottom: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: c.border,
                          }}
                        >
                          <Text style={{ color: c.textMuted, fontSize: 15, fontWeight: "600" }}>
                            {item.label}
                          </Text>
                          <Text style={{ color: c.text, fontSize: 15, fontWeight: "700" }}>
                            {item.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </Animated.View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
