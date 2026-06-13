import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/utils/auth-store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { PressableScale } from "pressto";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },

  top: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%" },

  lottieWrap: {
    width: 260,
    height: 260,
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: 40,
  },
  lottie: { width: "100%", height: "100%" },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "600", letterSpacing: 0.5 },

  title: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 42,
    textAlign: "center",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  bottom: { width: "100%", gap: 12 },

  primaryBtn: {
    width: "100%",
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
    paddingTop: 4,
  },
  signinHint: { fontSize: 14 },
  signinLink: { fontSize: 14, fontWeight: "700" },
});

export function StartScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme as "light" | "dark"];
  const isDark = theme === "dark";
  const lottieRef = useRef<LottieView>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { isLoggedIn, hasCompletedOnboarding } = useAuthStore();

  const surface = isDark ? "#1C1C1E" : "#F4F4F5";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  React.useEffect(() => {
    const timer = setTimeout(() => setIsNavigationReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    lottieRef.current?.play();
  }, []);

  React.useEffect(() => {
    if (isNavigationReady && hasCompletedOnboarding && isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isNavigationReady, hasCompletedOnboarding, isLoggedIn]);

  const handleGetStarted = () => {
    if (hasCompletedOnboarding && !isLoggedIn) {
      router.replace("/sign-in");
    } else {
      router.replace("/onboarding");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.top}>
          {/* Lottie animation */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <View
              style={[
                styles.lottieWrap,
                { backgroundColor: surface, borderWidth: 1, borderColor: surfaceBorder },
              ]}
            >
              <LottieView
                ref={lottieRef}
                source={require("@/assets/lottie/welcome-1.json")}
                style={styles.lottie}
                loop
                autoPlay
              />
            </View>
          </Animated.View>

          {/* Text */}
          <Animated.View entering={FadeInUp.delay(150).duration(500)} style={{ alignItems: "center" }}>
            <View style={[styles.badge, { backgroundColor: `${colors.primary}18` }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                Data & Strategy
              </Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              Welcome to 10Alytics
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {hasCompletedOnboarding
                ? "Your analytics companion. Get started in seconds."
                : "Complete your onboarding to unlock your learning journey."}
            </Text>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.bottom}>
          <PressableScale
            onPress={handleGetStarted}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </PressableScale>

          <View style={styles.signinRow}>
            <Text style={[styles.signinHint, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <PressableScale onPress={() => router.replace("/sign-in")}>
              <Text style={[styles.signinLink, { color: colors.primary }]}>Sign In</Text>
            </PressableScale>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
