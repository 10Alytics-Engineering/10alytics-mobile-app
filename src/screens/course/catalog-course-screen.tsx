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
  const colors = useThemeColors();
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 8 }}>
      <Text style={{ fontSize: 14, color: mutedColor }}>
        {label}
      </Text>
      <Text style={{ flex: 1, textAlign: "right", fontSize: 14, fontWeight: "500", color: colors.text }}>
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
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: colors.secondary }}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: "600", color: colors.text }}>
          Course details
        </Text>
      </View>

      {isPending && !data ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError && !course ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.text }}>
            Couldn&apos;t load this course
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ marginTop: 20, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary }}
          >
            <Text style={{ fontWeight: "600", color: "#fff" }}>Try again</Text>
          </Pressable>
        </View>
      ) : !course ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.text }}>
            Course not found
          </Text>
          <Text style={{ marginTop: 4, textAlign: "center", fontSize: 14, color: colors.textMuted }}>
            It may no longer be available.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 152 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{ alignItems: "center", justifyContent: "center", borderRadius: 24, paddingVertical: 32, backgroundColor: "#DA6728" }}
            >
              <CourseCoverForSlug slug={course.slug} size={120} />
            </View>

            <Text style={{ marginTop: 20, fontSize: 24, fontWeight: "700", color: colors.text }}>
              {course.title}
            </Text>
            {course.level ? (
              <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.primary }}>
                {course.level}
              </Text>
            ) : null}

            <Text style={{ marginTop: 20, fontSize: 16, fontWeight: "700", color: colors.text }}>
              About this course
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, lineHeight: 24, color: colors.textMuted }}>
              {course.tagline ?? "No description available for this course."}
            </Text>

            <View
              style={{ marginTop: 20, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: colors.secondary }}
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
                <Text style={{ marginTop: 24, fontSize: 16, fontWeight: "700", color: colors.text }}>
                  What you&apos;ll get
                </Text>
                <View style={{ marginTop: 8, gap: 10 }}>
                  {course.course_benefits.map((benefit) => (
                    <View
                      key={benefit.id}
                      style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
                    >
                      <Feather
                        name="check-circle"
                        size={16}
                        color={colors.primary}
                        style={{ marginTop: 2 }}
                      />
                      <Text style={{ flex: 1, fontSize: 14, color: colors.text }}>
                        {benefit.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>

          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopWidth: 1,
              paddingHorizontal: 20,
              paddingTop: 16,
              backgroundColor: colors.bg,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View>
              {price ? (
                <>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>
                    Price
                  </Text>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{price}</Text>
                </>
              ) : (
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                  Enroll today
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleEnroll}
              style={{ flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: colors.primary }}
            >
              <Text style={{ fontWeight: "700", color: "#fff" }}>Enroll now</Text>
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
