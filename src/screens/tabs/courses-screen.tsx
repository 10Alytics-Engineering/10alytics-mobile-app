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
    <View className="flex-1 items-center justify-center px-8 py-20">
      <Text
        className="text-center text-base font-semibold"
        style={{ color: colors.text }}
      >
        Couldn&apos;t load courses
      </Text>
      <Text
        className="mt-2 text-center text-sm opacity-70"
        style={{ color: colors.text }}
      >
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-6 rounded-xl px-6 py-3 active:opacity-80"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="font-semibold text-white">Try again</Text>
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
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text
                className="text-center text-base font-semibold"
                style={{ color: colors.text }}
              >
                No courses yet
              </Text>
              <Text
                className="mt-1 text-center text-sm opacity-60"
                style={{ color: colors.text }}
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
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Text
                className="text-center text-base font-semibold"
                style={{ color: colors.text }}
              >
                Nothing new to explore
              </Text>
              <Text
                className="mt-1 text-center text-sm opacity-60"
                style={{ color: colors.text }}
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
      <View className="px-4 pb-2 pt-3">
        <Text
          className="text-3xl font-extrabold"
          style={{ color: colors.text }}
        >
          Learning
        </Text>
        <View
          className="mt-4 flex-row rounded-full p-1"
          style={{
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
                className="flex-1 items-center justify-center rounded-full py-2.5 active:opacity-90"
                style={{
                  backgroundColor: active ? colors.primary : "transparent",
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: active ? "#FFFFFF" : mutedColor }}
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
