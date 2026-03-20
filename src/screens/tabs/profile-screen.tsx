import useThemeColors from "@/contexts/ThemeColors";
import { GlassStyles } from "@/constants/theme";
import { PressableScale, ScrollView, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { useAuthStore } from "@/utils/auth-store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: GlassStyles.spacing.md,
    paddingBottom: 120,
    gap: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.5,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    opacity: 0.08,
    marginLeft: 64,
  },
  signOutButton: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 6,
  },
  signOutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
});

export function ProfileScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { logOut, user } = useAuthStore();
  const isDark = colors.isDark;

  const stats = [q
    { label: "Courses", value: "12", color: "#DA6728" },
    { label: "Hours", value: "156", color: "#4A90E2" },
    { label: "Streak", value: "15", color: "#E74C3C" },
  ];

  const menuItems = [
    { id: 1, title: "My Courses", icon: "book.closed.fill" as const, color: colors.primary, onPress: () => { router.push("/(tabs)/courses") } },
    { id: 2, title: "Achievements", icon: "trophy.fill" as const, color: colors.primary, onPress: () => { } },
    { id: 3, title: "Learning Goals", icon: "target" as const, color: "#4A90E2", onPress: () => { } },
    { id: 4, title: "Notifications", icon: "bell.fill" as const, color: "#FF9F0A", onPress: () => { } },
    { id: 5, title: "Settings", icon: "gearshape.fill" as const, color: colors.primary, onPress: () => router.push("/") },
  ];

  const handleSignOut = async () => {
    await logOut();
    router.replace("/");
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
    >
      <Animated.View entering={FadeInDown.delay(50).springify()}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>Your learning space</Text>
          </View>
          <View style={[styles.avatarWrap, { backgroundColor: colors.secondary }]}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <SymbolView name="person.crop.circle.fill" size={52} tintColor={colors.icon} />
            )}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInRight.delay(120).springify()}>
        <View style={styles.statRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={[styles.card, { backgroundColor: colors.secondary }]}>
          {menuItems.map((item, index) => (
            <View key={item.id}>
              <PressableScale style={styles.row} onPress={item.onPress}>
                <View style={styles.rowLeft}>
                  <LinearGradient colors={[`${item.color}35`, `${item.color}10`]} style={styles.iconBox}>
                    <SymbolView name={item.icon} size={18} tintColor={item.color} />
                  </LinearGradient>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                </View>
                <SymbolView name="chevron.right" size={14} tintColor={colors.icon} />
              </PressableScale>
              {index !== menuItems.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.text }]} />
              )}
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(350).springify()}>
        <PressableScale onPress={handleSignOut} style={styles.signOutButton}>
          {isDark ? (
            <LinearGradient colors={["#E74C3C", "#C0392B"]} style={styles.signOutContent}>
              <View>
                <Text className="text-white font-bold text-base">Sign Out</Text>
                <Text className="text-white/70 text-xs mt-1">Come back soon</Text>
              </View>
              <SymbolView name="rectangle.portrait.and.arrow.right" size={18} tintColor="#fff" />
            </LinearGradient>
          ) : (
            <View
              style={[
                styles.signOutContent,
                {
                  backgroundColor: "#E74C3C",
                },
              ]}
            >
              <View>
                <Text style={{ color: "#fff" }} className="font-bold text-base">
                  Sign Out
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)" }} className="text-xs mt-1">
                  Come back soon
                </Text>
              </View>
              <SymbolView name="rectangle.portrait.and.arrow.right" size={18} tintColor="#fff" />
            </View>
          )}
        </PressableScale>
      </Animated.View>
    </ScrollView>
  );
}
