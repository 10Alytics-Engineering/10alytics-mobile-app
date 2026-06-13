import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/ThemeColors";
import { apiClient } from "@/lib/api-client";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/tw";

export function ForgotPasswordScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    const { data, error } = await apiClient.forgotPassword(trimmed);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message || "Something went wrong");
      return;
    }

    Alert.alert(
      "Check your email",
      data?.message ??
        "If an account exists for that email, a reset code has been sent.",
    );
    router.push({ pathname: "/reset-password", params: { email: trimmed } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <View
        className="flex-row items-center px-4 pb-2"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-secondary/80"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pt-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-text">Forgot password?</Text>
        <Text className="mt-2 text-base text-text opacity-60">
          Enter the email linked to your account and we&apos;ll send you a
          one-time code to reset your password.
        </Text>

        <View className="mt-8">
          <Text className="mb-2 text-sm font-semibold text-text opacity-70">
            Email
          </Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            className="rounded-2xl border border-border bg-secondary/40 px-4 py-4 text-base text-text"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className={`mt-6 items-center rounded-2xl bg-text py-4 ${loading ? "opacity-70" : "active:opacity-90"}`}
        >
          <Text className="text-base font-bold text-invert">
            {loading ? "Sending..." : "Send reset code"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/reset-password")}
          className="mt-4 items-center py-2"
        >
          <Text className="text-sm font-semibold text-text opacity-70">
            I already have a code
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
