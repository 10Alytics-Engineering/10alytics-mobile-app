import { GlassCard } from "@/components/ui/GlassCard";
import { Colors, GlassStyles, Gradients } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PressableScale, ScrollView, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: GlassStyles.spacing.md,
    paddingBottom: GlassStyles.spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: GlassStyles.spacing.md,
    paddingBottom: 40,
  },
  heroImage: {
    height: 200,
    borderRadius: GlassStyles.borderRadius.lg,
    overflow: "hidden",
    marginBottom: GlassStyles.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIcon: {
    fontSize: 80,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: GlassStyles.spacing.lg,
  },
  instructorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: GlassStyles.spacing.md,
    marginBottom: GlassStyles.spacing.xl,
  },
  statBox: {
    width: (width - GlassStyles.spacing.md * 3) / 3,
    paddingVertical: GlassStyles.spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: GlassStyles.spacing.md,
  },
  lessonCard: {
    marginBottom: GlassStyles.spacing.sm,
  },
  lessonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: "700",
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  duration: {
    fontSize: 14,
    opacity: 0.6,
    marginRight: 12,
  },
  startButton: {
    height: 56,
    borderRadius: 28,
    marginTop: GlassStyles.spacing.xl,
    overflow: "hidden",
  },
  startButtonGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
});

export function CourseDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const course = {
    title: "React Native Fundamentals",
    instructor: "John Doe",
    lessons: [
      {
        id: 1,
        title: "Introduction to React Native",
        duration: "12:00",
        completed: true,
      },
      {
        id: 2,
        title: "Setting up Environmental",
        duration: "24:00",
        completed: true,
      },
      {
        id: 3,
        title: "Understanding Components",
        duration: "45:00",
        completed: false,
      },
      {
        id: 4,
        title: "Styling and Layouts",
        duration: "32:00",
        completed: false,
      },
      {
        id: 5,
        title: "Navigation with Expo Router",
        duration: "50:00",
        completed: false,
      },
    ],
    lessonsCount: 24,
    hoursCount: 18.5,
    studentsCount: 1250,
    color: "#DA6728",
    thumbnail: "📱",
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F5F0EB" },
      ]}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <PressableScale
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: colors.glass.background },
          ]}
        >
          <SymbolView
            name="chevron.left"
            size={24}
            tintColor={colors.primary}
          />
        </PressableScale>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Course Details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={[`${course.color}40`, `${course.color}15`] as const}
            style={styles.heroImage}
          >
            <Text style={styles.heroIcon}>{course.thumbnail}</Text>
          </LinearGradient>

          <Text style={[styles.courseTitle, { color: colors.text }]}>
            {course.title}
          </Text>
          <View style={styles.instructorRow}>
            <View
              style={[
                styles.instructorAvatar,
                { backgroundColor: `${course.color}20` },
              ]}
            >
              <SymbolView
                name="person.fill"
                size={16}
                tintColor={course.color}
              />
            </View>
            <Text
              style={[styles.instructorName, { color: colors.textSecondary }]}
            >
              by {course.instructor}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <GlassCard variant="light" style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {course.lessonsCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Lessons
              </Text>
            </GlassCard>
            <GlassCard variant="light" style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#4A90E2" }]}>
                {course.hoursCount}h
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Time
              </Text>
            </GlassCard>
            <GlassCard variant="light" style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#27AE60" }]}>
                4.9/5
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rating
              </Text>
            </GlassCard>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Curriculum
          </Text>
          {course.lessons.map((lesson, index) => (
            <GlassCard
              key={lesson.id}
              variant="light"
              style={styles.lessonCard}
            >
              <View style={styles.lessonContent}>
                <View
                  style={[
                    styles.lessonNumber,
                    {
                      backgroundColor: lesson.completed
                        ? `${course.color}20`
                        : colors.glass.backgroundDark,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.lessonNumberText,
                      {
                        color: lesson.completed
                          ? course.color
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.lessonTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {lesson.title}
                </Text>
                <Text
                  style={[styles.duration, { color: colors.textSecondary }]}
                >
                  {lesson.duration}
                </Text>
                <SymbolView
                  name={
                    lesson.completed
                      ? "checkmark.circle.fill"
                      : "play.circle.fill"
                  }
                  size={20}
                  tintColor={
                    lesson.completed ? "#27AE60" : colors.textSecondary
                  }
                  type="hierarchical"
                />
              </View>
            </GlassCard>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <PressableScale style={styles.startButton}>
            <LinearGradient
              colors={Gradients.primary as any}
              style={styles.startButtonGradient}
            >
              <SymbolView name="play.fill" size={20} tintColor="#fff" />
              <Text style={styles.startButtonText}>Resume Course</Text>
            </LinearGradient>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
