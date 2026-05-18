import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PressableScale, ScrollView, Text, View } from "@/tw";
import { Animated } from "@/tw/animated";
import { Image } from "@/tw/image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { FadeInDown, FadeInUp } from "react-native-reanimated";

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },

  hero: {
    alignItems: "center",
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    overflow: "hidden",
  },
  logo: { width: 100, height: 100 },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "600", letterSpacing: 0.5 },
  title: {
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  divider: {
    height: 1,
    marginHorizontal: 24,
    marginVertical: 8,
  },

  section: { paddingHorizontal: 24, paddingTop: 32 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 16,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47.5%",
    padding: 16,
    borderRadius: 20,
    gap: 10,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  cardDesc: { fontSize: 13, lineHeight: 18 },

  cta: { paddingHorizontal: 24, paddingTop: 36, gap: 12 },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingTop: 8,
  },
  signinHint: { fontSize: 14 },
  signinLink: { fontSize: 14, fontWeight: "700" },
});

const FEATURES = [
  {
    icon: "book-open-variant" as const,
    title: "Interactive Courses",
    description: "Learn at your own pace",
    color: "#DA6728",
  },
  {
    icon: "play-circle-outline" as const,
    title: "Video Library",
    description: "Thousands of lessons",
    color: "#4A90E2",
  },
  {
    icon: "trophy-outline" as const,
    title: "Achievements",
    description: "Earn badges & rewards",
    color: "#9B59B6",
  },
  {
    icon: "chart-line" as const,
    title: "Track Progress",
    description: "Monitor your journey",
    color: "#27AE60",
  },
];

export function IndexScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme as "light" | "dark"];

  const surface = isDark ? "#161618" : "#F4F4F5";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <View
            style={[
              styles.logoWrap,
              { backgroundColor: `${colors.primary}15`, borderWidth: 1, borderColor: `${colors.primary}25` },
            ]}
          >
            <Image
              source={
                isDark
                  ? require("@/assets/images/splash-icon-dark.png")
                  : require("@/assets/images/splash-icon-light.png")
              }
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.badge, { backgroundColor: `${colors.primary}18` }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              Data & Strategy
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Your data career{"\n"}starts here
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Master data analytics, business intelligence, and more — with expert-led courses built for Africa.
          </Text>
        </Animated.View>

        <View style={[styles.divider, { backgroundColor: surfaceBorder }]} />

        {/* ── Features grid ── */}
        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Everything you need
          </Text>

          <View style={styles.grid}>
            {FEATURES.map((feature, i) => (
              <View
                key={i}
                style={[
                  styles.card,
                  {
                    backgroundColor: surface,
                    borderWidth: 1,
                    borderColor: surfaceBorder,
                  },
                ]}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: `${feature.color}18` }]}>
                  <MaterialCommunityIcons name={feature.icon} size={22} color={feature.color} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── CTA ── */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.cta}>
          <PressableScale
            onPress={() => router.push("/sign-in")}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </PressableScale>

          {/* <View style={styles.signinRow}>
            <Text style={[styles.signinHint, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <PressableScale onPress={() => router.push("/sign-in")}>
              <Text style={[styles.signinLink, { color: colors.primary }]}>Sign In</Text>
            </PressableScale>
          </View> */}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
