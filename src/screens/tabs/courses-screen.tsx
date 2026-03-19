import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { FadeInRight } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import JournalCard from "@/components/JournalCard";
import { Colors, GlassStyles } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserCourses } from "@/hooks/use-user-courses";
import type { UserCourse } from "@/lib/api-client";
import { Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { getCourseCoverForSlug } from "@/utils/course-cover";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: GlassStyles.spacing.md,
    paddingTop: GlassStyles.spacing.xs,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: GlassStyles.spacing.md,
    marginTop: GlassStyles.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: GlassStyles.spacing.lg,
  },
});

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
  const insets = useSafeAreaInsets();

  const { data, isPending, isError, error, refetch, isFetching } = useUserCourses();
  const courses: UserCourse[] = data?.data ?? [];

  const renderCourseCard = useCallback(
    ({ item: course }: { item: UserCourse }) => (
      <JournalCard
        title={course.title}
        description={formatSlugLabel(course.slug)}
        date="instructor led learning"
        progress={Math.round(course.progress_percentage)}
        actionLabel={course.progress_percentage > 0 ? "Continue" : "Start"}
        image={getCourseCoverForSlug(course.slug)}
        onPress={() =>
          router.push({
            pathname: "/course/[id]",
            params: { id: String(course.course_id) },
          })
        }
      />
    ),
    []
  );

  const ListHeader = () => (
    <Animated.View entering={FadeInRight.delay(100).springify()}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Courses</Text>
      </View>
    </Animated.View>
  );

  if (isPending && !data) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: isDark ? colors.background : "#F5F0EB", paddingTop: insets.top }}
      >
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4 text-base" style={{ color: colors.text }}>
            Loading your courses…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: isDark ? colors.background : "#F5F0EB", paddingTop: insets.top }}
      >
        <View style={styles.centerState}>
          <Text className="text-center text-base font-semibold" style={{ color: colors.text }}>
            Couldn&apos;t load courses
          </Text>
          <Text className="mt-2 text-center text-sm opacity-70" style={{ color: colors.text }}>
            {error instanceof Error ? error.message : "Something went wrong"}
          </Text>
          <Pressable
            onPress={() => {
              refetch();
            }}
            className="mt-6 rounded-xl bg-text px-6 py-3 active:opacity-80"
          >
            <Text className="font-semibold text-invert">Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? colors.background : "#F5F0EB" }}>
      <FlatList
        data={courses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => String(item.id)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.listContent, courses.length === 0 && { flexGrow: 1 }]}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-center text-base" style={{ color: colors.text }}>
              You don&apos;t have any courses yet.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPending}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.primary}
          />
        }
        style={[styles.container, { backgroundColor: isDark ? colors.background : "#F5F0EB" }]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
