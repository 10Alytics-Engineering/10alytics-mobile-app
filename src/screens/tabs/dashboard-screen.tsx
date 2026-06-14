import { GlassCard } from "@/components/ui/GlassCard";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PressableScale, ScrollView, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import React from "react";
import { StyleSheet } from "react-native";
import { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const streakDays = ["M", "T", "W", "T", "F", "S", "S"];
  const activeStreak = [true, true, true, true, false, false, false];

  const achievements = [
    { id: "1", title: "Quick Learner", icon: "bolt.fill", color: "#FFD700" },
    { id: "2", title: "Week Streak", icon: "flame.fill", color: "#FF4500" },
    { id: "3", title: "Top Student", icon: "star.fill", color: "#4A90E2" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8F9FA" }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={{ width: 50 }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.nameText, { color: colors.text }]}>David 👋</Text>
          </View>
          <PressableScale onPress={handlePress} style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <SymbolView name="person.fill" size={24} tintColor="#fff" />
            </View>
          </PressableScale>
        </View>

        {/* Weekly Streak & Stats */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
          <GlassCard variant="light" style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <View style={styles.streakInfo}>
                <SymbolView name={"flame.fill" as any} size={20} tintColor="#FF4500" />
                <Text style={[styles.streakCount, { color: colors.text }]}>4 Day Streak!</Text>
              </View>
              <Text style={[styles.streakSub, { color: colors.textSecondary }]}>Keep it up!</Text>
            </View>
            <View style={styles.streakDays}>
              {streakDays.map((day, i) => (
                <View key={i} style={styles.dayItem}>
                  <View style={[
                    styles.dayCircle,
                    { backgroundColor: activeStreak[i] ? "#FF4500" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") }
                  ]}>
                    {activeStreak[i] && <SymbolView name={"checkmark" as any} size={10} tintColor="#fff" />}
                  </View>
                  <Text style={[styles.dayText, { color: colors.textSecondary }]}>{day}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsContent}>
          <PressableScale onPress={handlePress}>
            <GlassCard variant="medium" style={styles.actionCard}>
              <SymbolView name={"play.fill" as any} size={24} tintColor={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Continue</Text>
            </GlassCard>
          </PressableScale>
          <PressableScale onPress={handlePress}>
            <GlassCard variant="medium" style={styles.actionCard}>
              <SymbolView name={"calendar" as any} size={24} tintColor="#4A90E2" />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Schedule</Text>
            </GlassCard>
          </PressableScale>
          <PressableScale onPress={handlePress}>
            <GlassCard variant="medium" style={styles.actionCard}>
              <SymbolView name={"video.fill" as any} size={24} tintColor="#27AE60" />
              <Text style={[styles.actionLabel, { color: colors.text }]}>Join Class</Text>
            </GlassCard>
          </PressableScale>
        </ScrollView>

        {/* Course Progress tracker */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
          <PressableScale>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>View All</Text>
          </PressableScale>
        </View>
        <Animated.View entering={FadeInRight.delay(200).springify()} style={styles.progressContainer}>
          <GlassCard variant="light" style={styles.progressCard} showGradientBorder>
            <View style={styles.progressTop}>
              <View style={styles.courseInfo}>
                <Text style={[styles.courseName, { color: colors.text }]}>React Native Mastery</Text>
                <Text style={[styles.courseChapter, { color: colors.textSecondary }]}>Chapter 4: Animations</Text>
              </View>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>68%</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}>
              <Animated.View
                style={[styles.progressBarFill, { width: "68%", backgroundColor: colors.primary }]}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Badge & achievements section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsContent}>
          {achievements.map((item, idx) => (
            <Animated.View key={item.id} entering={FadeInUp.delay(300 + idx * 100).springify()}>
              <GlassCard variant="medium" style={styles.achievementCard}>
                <View style={[styles.badgeIcon, { backgroundColor: `${item.color}20` }]}>
                  <SymbolView name={item.icon as any} size={28} tintColor={item.color} />
                </View>
                <Text style={[styles.badgeTitle, { color: colors.text }]}>{item.title}</Text>
              </GlassCard>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Latest events / announcements card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Announcements</Text>
        </View>
        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.announcementContainer}>
          <GlassCard variant="medium" style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementBadge}>
                <Text style={styles.announcementBadgeText}>NEW</Text>
              </View>
              <Text style={[styles.announcementTime, { color: colors.textSecondary }]}>2h ago</Text>
            </View>
            <Text style={[styles.announcementTitle, { color: colors.text }]}>Workshop: Building with Expo Router 3.0</Text>
            <Text style={[styles.announcementSub, { color: colors.textSecondary }]}>Join us this Friday for a deep dive into advanced navigation patterns.</Text>
          </GlassCard>
        </Animated.View>

        {/* Current or next class highlight */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Class</Text>
        </View>
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.nextClassContainer}>
          <GlassCard variant="light" style={styles.nextClassCard} borderAccent="#27AE60">
            <View style={styles.nextClassInner}>
              <View style={styles.nextClassIcon}>
                <SymbolView name={"video.circle.fill" as any} size={40} tintColor="#27AE60" />
              </View>
              <View style={styles.nextClassInfo}>
                <Text style={[styles.nextClassTitle, { color: colors.text }]}>Mobile App Architecture</Text>
                <Text style={[styles.nextClassTime, { color: colors.textSecondary }]}>Today, 4:00 PM • Live Session</Text>
              </View>
              <PressableScale onPress={handlePress} style={styles.joinSmallButton}>
                <SymbolView name={"chevron.right" as any} size={20} tintColor="#fff" />
              </PressableScale>
            </View>
          </GlassCard>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "800",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  avatar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  streakCard: {
    padding: 20,
    borderRadius: 24,
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: "700",
  },
  streakSub: {
    fontSize: 13,
    fontWeight: "500",
  },
  streakDays: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
    gap: 6,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  actionsContent: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressCard: {
    padding: 20,
    borderRadius: 24,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  courseInfo: {
    gap: 2,
  },
  courseName: {
    fontSize: 17,
    fontWeight: "700",
  },
  courseChapter: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  achievementsContent: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  achievementCard: {
    width: 130,
    padding: 16,
    alignItems: "center",
    borderRadius: 28,
    gap: 12,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  announcementContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  announcementCard: {
    padding: 20,
    borderRadius: 24,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  announcementBadge: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  announcementBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  announcementTime: {
    fontSize: 12,
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  announcementSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  nextClassContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  nextClassCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
  },
  nextClassInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  nextClassIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  nextClassInfo: {
    flex: 1,
    gap: 2,
  },
  nextClassTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  nextClassTime: {
    fontSize: 13,
  },
  joinSmallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
