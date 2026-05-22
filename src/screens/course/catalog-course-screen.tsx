import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/ThemeColors";
import { useCourses } from "@/hooks/use-courses";
import type { Course } from "@/lib/api-client";
import { CourseCoverForSlug } from "@/utils/course-cover";

import "../../../global.css";

function formatPrice(course: Course): string | null {
  const amount = course.usd_amount ?? course.price;
  if (amount == null) return null;
  return `$${Number(amount).toLocaleString("en-US")}`;
}

function InfoRow({
  label,
  value,
  mutedColor,
}: {
  label: string;
  value: string | null;
  mutedColor: string;
}) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between gap-4 py-2">
      <Text className="text-sm" style={{ color: mutedColor }}>
        {label}
      </Text>
      <Text className="flex-1 text-right text-sm font-medium text-text">
        {value}
      </Text>
    </View>
  );
}

export function CatalogCourseScreen({ courseId }: { courseId: string }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch } = useCourses();

  const course = (data ?? []).find((item) => String(item.id) === courseId);
  const price = course ? formatPrice(course) : null;

  const handleEnroll = () => {
    if (!course) return;
    // Enrollment and payment continue on the 10alytics website.
    WebBrowser.openBrowserAsync(
      `https://www.10alytics.io/instructor-led-courses/${course.slug}`,
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.secondary }}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <Text className="ml-3 text-lg font-semibold text-text">
          Course details
        </Text>
      </View>

      {isPending && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError && !course ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base font-semibold text-text">
            Couldn&apos;t load this course
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-5 rounded-xl px-6 py-3 active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-semibold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : !course ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base font-semibold text-text">
            Course not found
          </Text>
          <Text
            className="mt-1 text-center text-sm"
            style={{ color: colors.textMuted }}
          >
            It may no longer be available.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 152 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              className="items-center justify-center rounded-3xl py-8"
              style={{ backgroundColor: "#DA6728" }}
            >
              <CourseCoverForSlug slug={course.slug} size={120} />
            </View>

            <Text className="mt-5 text-2xl font-bold text-text">
              {course.title}
            </Text>
            {course.level ? (
              <Text
                className="mt-1 text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.primary }}
              >
                {course.level}
              </Text>
            ) : null}

            <Text className="mt-5 text-base font-bold text-text">
              About this course
            </Text>
            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: colors.textMuted }}
            >
              {course.tagline ?? "No description available for this course."}
            </Text>

            <View
              className="mt-5 rounded-2xl px-4 py-1"
              style={{ backgroundColor: colors.secondary }}
            >
              <InfoRow
                label="Duration"
                value={course.duration}
                mutedColor={colors.textMuted}
              />
              <InfoRow
                label="Projects"
                value={course.no_of_projects}
                mutedColor={colors.textMuted}
              />
              <InfoRow
                label="Language"
                value={course.language}
                mutedColor={colors.textMuted}
              />
            </View>

            {course.course_benefits && course.course_benefits.length > 0 ? (
              <>
                <Text className="mt-6 text-base font-bold text-text">
                  What you&apos;ll get
                </Text>
                <View className="mt-2 gap-2.5">
                  {course.course_benefits.map((benefit) => (
                    <View
                      key={benefit.id}
                      className="flex-row items-start gap-2.5"
                    >
                      <Feather
                        name="check-circle"
                        size={16}
                        color={colors.primary}
                        style={{ marginTop: 2 }}
                      />
                      <Text className="flex-1 text-sm text-text">
                        {benefit.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>

          <View
            className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t px-5 pt-4"
            style={{
              backgroundColor: colors.bg,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View>
              {price ? (
                <>
                  <Text
                    className="text-xs"
                    style={{ color: colors.textMuted }}
                  >
                    Price
                  </Text>
                  <Text className="text-xl font-bold text-text">{price}</Text>
                </>
              ) : (
                <Text className="text-base font-semibold text-text">
                  Enroll today
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleEnroll}
              className="flex-row items-center rounded-xl px-6 py-3.5 active:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="font-bold text-white">Enroll now</Text>
              <Feather
                name="external-link"
                size={17}
                color="#ffffff"
                style={{ marginLeft: 6 }}
              />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
