import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiClient } from "@/lib/api-client";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/tw";
import { Image } from "@/tw/image";
import { useAuthStore } from "@/utils/auth-store";

const TERMS_URL = "https://www.10alytics.io/terms";

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center" },
  shell: { width: "100%", alignSelf: "center" },
  brandWrap: { alignItems: "center", gap: 28 },
  brandMark: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  brandBlob: {
    width: 64,
    height: 64,
    transform: [{ rotate: "-24deg" }],
  },
  titleWrap: { alignItems: "center", gap: 10 },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  formWrap: { gap: 14, marginTop: 36 },
  inputRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 18,
  },
  eyeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 20,
    marginTop: 8,
    width: "100%",
  },
  primaryButtonInner: {
    minHeight: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  dividerText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
  secondaryButton: {
    minHeight: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    width: "100%",
    paddingHorizontal: 22,
  },
  secondaryButtonInner: {
    minHeight: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 22,
  },
  secondaryButtonIconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonIcon: {
    width: 22,
    height: 22,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  footerWrap: {
    alignItems: "center",
    gap: 20,
    marginTop: 28,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  termsLink: {
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  footerHint: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export function SignInScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = (colorScheme ?? "light") === "dark";
  const insets = useSafeAreaInsets();
  const { logIn } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const palette = {
    background: isDark ? "#0B0B0C" : "#FAFAF8",
    surface: isDark ? "#171719" : "#ECECEC",
    surfaceBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text: colors.text,
    muted: isDark ? "#A1A1AA" : "#6B7280",
    primaryFill: isDark ? "#FFFFFF" : "#0A0A0A",
    primaryText: isDark ? "#0A0A0A" : "#FFFFFF",
    secondaryFill: isDark ? "#111214" : "#FFFFFF",
    secondaryBorder: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)",
    brand: isDark ? "#FFFFFF" : "#0A0A0A",
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await apiClient.login(email, password);

      if (error) {
        const errorMessage =
          error.errors && Object.keys(error.errors).length > 0
            ? Object.values(error.errors)[0][0]
            : error.message || "Sign in failed. Please try again.";
        Alert.alert("Sign In Failed", errorMessage);
        setLoading(false);
        return;
      }

      if (data && data.user) {
        logIn(data.user);
        router.replace("/(tabs)");
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.googleAuth();

      if (error) {
        Alert.alert("Sign In Failed", error.message);
        setLoading(false);
        return;
      }

      if (data) {
        logIn(data);
        router.replace("/(tabs)");
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: palette.background }]}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 20, 40),
            paddingBottom: Math.max(insets.bottom + 28, 40),
            paddingHorizontal: 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.shell, { maxWidth: 440 }]}>
          <View style={styles.brandWrap}>
            <View style={styles.brandMark}>
              <Image source={require("@/assets/icon.png")} style={{ width: 84, height: 84 }} />
            </View>

            <View style={styles.titleWrap}>
              <Text style={[styles.title, { color: palette.text }]}>
                Log in to continue
              </Text>
              <Text style={[styles.subtitle, { color: palette.muted }]}>
                Use your email and password or continue with Google.
              </Text>
            </View>
          </View>

          <View style={styles.formWrap}>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.surfaceBorder,
                  borderWidth: 1,
                  borderCurve: "continuous",
                },
              ]}
            >
              <AntDesign
                color={palette.muted}
                name="mail"
                size={20}
                style={{ marginRight: 14 }}
              />
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor={palette.muted}
                style={[styles.input, { color: palette.text }]}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.surfaceBorder,
                  borderWidth: 1,
                  borderCurve: "continuous",
                },
              ]}
            >
              <AntDesign
                color={palette.muted}
                name="lock"
                size={20}
                style={{ marginRight: 14 }}
              />
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                placeholder="Enter your password"
                placeholderTextColor={palette.muted}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: palette.text }]}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowPassword((value) => !value)}
                style={({ pressed }) => [
                  styles.eyeButton,
                  pressed && { opacity: 0.75 },
                ]}
              >
                {showPassword ? (
                  <AntDesign color={palette.muted} name="eye-invisible" size={20} />
                ) : (
                  <AntDesign color={palette.muted} name="eye" size={20} />
                )}
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: isDark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.16)" }}
              onPress={handleEmailSignIn}
              pointerEvents={loading ? "none" : "auto"}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !loading && { opacity: 0.88 },
                loading && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.primaryButtonInner,
                  {
                    backgroundColor: palette.primaryFill,
                    borderCurve: "continuous",
                  },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: palette.primaryText }]}>
                  {loading ? "Continuing..." : "Continue"}
                </Text>
              </View>
            </Pressable>

            <Text style={[styles.dividerText, { color: palette.muted }]}>or</Text>

            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: "rgba(66,133,244,0.08)" }}
              onPress={handleGoogleSignIn}
              pointerEvents={loading ? "none" : "auto"}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && !loading && { opacity: 0.9 },
                loading && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.secondaryButtonInner,
                  {
                    backgroundColor: palette.secondaryFill,
                    borderColor: palette.secondaryBorder,
                    borderWidth: 1.5,
                    borderCurve: "continuous",
                  },
                ]}
              >
                <View style={styles.secondaryButtonIconWrap}>
                  <Image
                    source={require("@/assets/images/onboarding/google.png")}
                    style={styles.secondaryButtonIcon}
                  />
                </View>
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>
                  Continue with Google
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.footerWrap}>
            <Text style={[styles.termsText, { color: palette.muted }]}>
              By continuing you agree to our{" "}
              <Text
                onPress={() => Linking.openURL(TERMS_URL)}
                style={[styles.termsLink, { color: palette.text }]}
              >
                Terms of Service
              </Text>
            </Text>

            <View style={styles.footerRow}>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/create-account")}
                style={({ pressed }) => pressed && { opacity: 0.72 }}
              >
                <Text style={[styles.footerLink, { color: palette.text }]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
