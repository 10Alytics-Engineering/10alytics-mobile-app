import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";

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
import { useAuthStore } from "@/utils/auth-store";

const INPUT_RADIUS = 12;
const BUTTON_RADIUS = 14;
const SPACING = 24;
const TERMS_URL = "https://www.10alytics.io/terms"; // Replace with your actual terms URL

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: SPACING, paddingTop: 4 },
  scrollContent: { paddingBottom: SPACING * 1.5 },
  welcomeWrap: { marginBottom: 28 },
  welcomeTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.6 },
  welcomeSubtitle: { fontSize: 15, marginTop: 8, lineHeight: 22, opacity: 0.9 },
  fieldWrap: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  eyeButton: { padding: 8 },
  footer: { paddingHorizontal: SPACING, paddingTop: 24, paddingBottom: 40 },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: BUTTON_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  googleIconWrap: {
    gap: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 28,
  },
  dividerLine: { flex: 1, height: 1, opacity: 0.35 },
  dividerText: { marginHorizontal: 14, fontSize: 13, fontWeight: "600" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: BUTTON_RADIUS,
    borderWidth: 2,
    width: "100%",
  },
  secondaryButtonText: { fontSize: 16, fontWeight: "600" },
  termsWrap: { marginTop: 22, paddingHorizontal: 8 },
  termsText: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  termsLink: { fontWeight: "600" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerHint: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "600" },
});

export function SignInScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { logIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.welcomeWrap}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome back!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.text }]}>
            Choose how you&apos;d like to sign in
          </Text>
        </View>

        <View
          style={{ opacity: loading ? 0.6 : 1 }}
          pointerEvents={loading ? "none" : "auto"}
        >
          <Pressable
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && !loading && { opacity: 0.88 },
            ]}
          >
            {loading ? (
              <Text style={styles.primaryButtonText}>Signing in...</Text>
            ) : (
              <>
                <View style={styles.googleIconWrap}>
                  <MaterialCommunityIcons
                    name="google"
                    size={22}
                    color="#fff"
                  />
                  <Text style={styles.primaryButtonText}>
                    Continue with Google
                  </Text>
                </View>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.icon }]}
          />
          <Text style={[styles.dividerText, { color: colors.icon }]}>OR</Text>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.icon }]}
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Email</Text>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: `${colors.primary}10`,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              },
            ]}
          >
            <AntDesign
              name="mail"
              size={20}
              color={colors.icon}
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.icon}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Password
          </Text>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: `${colors.primary}10`,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              },
            ]}
          >
            <AntDesign
              name="lock"
              size={20}
              color={colors.icon}
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={({ pressed }) => [
                styles.eyeButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              {showPassword ? (
                <AntDesign name="eye-invisible" size={20} color={colors.icon} />
              ) : (
                <AntDesign name="eye" size={20} color={colors.icon} />
              )}
            </Pressable>
          </View>
          <View
            style={{
              opacity: loading ? 0.6 : 1,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              marginTop: 20,
            }}
            pointerEvents={loading ? "none" : "auto"}
          >
            <Pressable
              onPress={handleEmailSignIn}
              style={({ pressed }) => [
                styles.secondaryButton,
                { borderColor: colors.primary, width: "100%" },
                pressed && !loading && { opacity: 0.88 },
              ]}
            >
              <Text
                style={[styles.secondaryButtonText, { color: colors.primary }]}
              >
                {loading ? "Signing in..." : "Sign In with Email"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>


        <View style={styles.termsWrap}>
          <Text style={[styles.termsText, { color: colors.icon }]}>
            By continuing you agree to our{" "}
            <Text
              style={[styles.termsLink, { color: colors.primary }]}
              onPress={() => Linking.openURL(TERMS_URL)}
            >
              Terms of Service
            </Text>
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerHint, { color: colors.icon }]}>
            Don&apos;t have an account?{" "}
          </Text>
          <Pressable
            onPress={() => router.push("/create-account")}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
