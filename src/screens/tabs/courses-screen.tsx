import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import JournalCard from "@/components/JournalCard";
import { CoursesTabListSkeleton } from "@/components/ui/course-loading-skeletons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCourses } from "@/hooks/use-courses";
import { useUserCourses } from "@/hooks/use-user-courses";
import type { Course, UserCourse } from "@/lib/api-client";
import { CourseCoverForSlug } from "@/utils/course-cover";


type TabKey = "my" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "my", label: "My Courses" },
  { key: "all", label: "Courses" },
];

const listContentStyle = {
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 120,
};

function formatSlugLabel(slug: string): string {
  if (!slug) return "Course";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CoursesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? colors.background : "#F5F0EB";
  const mutedColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";

  const [tab, setTab] = useState<TabKey>("my");

  const userCoursesQuery = useUserCourses();
  const coursesQuery = useCourses();

  const myCourses: UserCourse[] = userCoursesQuery.data?.data ?? [];

  const enrolledCourseIds = useMemo(
    () => new Set(myCourses.map((course) => course.course_id)),
    [myCourses],
  );

  // "Courses" tab = full catalog minus the courses the user is already enrolled in.
  const catalogCourses: Course[] = useMemo(
    () =>
      (coursesQuery.data ?? []).filter(
        (course) => !enrolledCourseIds.has(course.id),
      ),
    [coursesQuery.data, enrolledCourseIds],
  );

  const openCatalogCourse = useCallback((course: Course) => {
    router.push({
      pathname: "/catalog/[id]",
      params: { id: String(course.id) },
    });
  }, []);

  const renderMyCourse = useCallback(
    ({ item: course }: { item: UserCourse }) => (
      <JournalCard
        title={course.title}
        description={formatSlugLabel(course.slug)}
        date="Instructor led learning"
        progress={Math.round(course.progress_percentage)}
        actionLabel={course.progress_percentage > 0 ? "Continue" : "Start"}
        cover={<CourseCoverForSlug slug={course.slug} />}
        onPress={() =>
          router.push({
            pathname: "/course/[id]",
            params: { id: String(course.id) },
          })
        }
      />
    ),
    [],
  );

  const renderCatalogCourse = useCallback(
    ({ item: course }: { item: Course }) => (
      <JournalCard
        title={course.title}
        description={course.tagline ?? "Explore this course and enroll."}
        date={course.level ?? "Course"}
        actionLabel="View details"
        cover={<CourseCoverForSlug slug={course.slug} />}
        onPress={() => openCatalogCourse(course)}
      />
    ),
    [openCatalogCourse],
  );

  const renderError = (message: string, onRetry: () => void) => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingVertical: 80 }}>
      <Text
        style={{ textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.text }}
      >
        Couldn&apos;t load courses
      </Text>
      <Text
        style={{ marginTop: 8, textAlign: "center", fontSize: 14, opacity: 0.7, color: colors.text }}
      >
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        style={{ marginTop: 24, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary }}
      >
        <Text style={{ fontWeight: "600", color: "#fff" }}>Try again</Text>
      </Pressable>
    </View>
  );

  let content: React.ReactNode;

  if (tab === "my") {
    if (userCoursesQuery.isPending) {
      content = (
        <CoursesTabListSkeleton backgroundColor={screenBg} isDark={isDark} />
      );
    } else if (userCoursesQuery.isError) {
      content = renderError(
        userCoursesQuery.error instanceof Error
          ? userCoursesQuery.error.message
          : "Something went wrong",
        () => userCoursesQuery.refetch(),
      );
    } else {
      content = (
        <FlatList
          data={myCourses}
          renderItem={renderMyCourse}
          keyExtractor={(item) => `my-${item.id}`}
          contentContainerStyle={[
            listContentStyle,
            myCourses.length === 0 && { flexGrow: 1 },
          ]}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingVertical: 80 }}>
              <Text
                style={{ textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.text }}
              >
                No courses yet
              </Text>
              <Text
                style={{ marginTop: 4, textAlign: "center", fontSize: 14, opacity: 0.6, color: colors.text }}
              >
                Switch to the Courses tab to find one to enroll in.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={
                userCoursesQuery.isFetching && !userCoursesQuery.isPending
              }
              onRefresh={() => userCoursesQuery.refetch()}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      );
    }
  } else {
    if (coursesQuery.isPending) {
      content = (
        <CoursesTabListSkeleton backgroundColor={screenBg} isDark={isDark} />
      );
    } else if (coursesQuery.isError) {
      content = renderError(
        coursesQuery.error instanceof Error
          ? coursesQuery.error.message
          : "Something went wrong",
        () => coursesQuery.refetch(),
      );
    } else {
      content = (
        <FlatList
          data={catalogCourses}
          renderItem={renderCatalogCourse}
          keyExtractor={(item) => `course-${item.id}`}
          contentContainerStyle={[
            listContentStyle,
            catalogCourses.length === 0 && { flexGrow: 1 },
          ]}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingVertical: 80 }}>
              <Text
                style={{ textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.text }}
              >
                Nothing new to explore
              </Text>
              <Text
                style={{ marginTop: 4, textAlign: "center", fontSize: 14, opacity: 0.6, color: colors.text }}
              >
                You&apos;re already enrolled in every available course.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={coursesQuery.isFetching && !coursesQuery.isPending}
              onRefresh={() => {
                coursesQuery.refetch();
                userCoursesQuery.refetch();
              }}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      );
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: screenBg }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, paddingTop: 12 }}>
        <Text
          style={{ fontSize: 30, fontWeight: "800", color: colors.text }}
        >
          Learning
        </Text>
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            borderRadius: 9999,
            padding: 4,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          {TABS.map((item) => {
            const active = item.key === tab;
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9999,
                  paddingVertical: 10,
                  backgroundColor: active ? colors.primary : "transparent",
                }}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: active ? "#FFFFFF" : mutedColor }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {content}
    </SafeAreaView>
  );
}
