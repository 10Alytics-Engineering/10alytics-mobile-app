import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/theme-colors";
import { apiClient } from "@/lib/api-client";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "@/tw";

export function ResetPasswordScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !otp.trim() || !password || !confirm) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await apiClient.resetPassword({
      email: email.trim(),
      otp: otp.trim(),
      password,
      password_confirmation: confirm,
    });
    setLoading(false);

    if (error) {
      const message =
        error.errors && Object.keys(error.errors).length > 0
          ? Object.values(error.errors)[0][0]
          : error.message || "Couldn't reset password";
      Alert.alert("Error", message);
      return;
    }

    Alert.alert("Success", "Your password has been reset. Please sign in.", [
      { text: "OK", onPress: () => router.dismissAll() },
    ]);
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
        <Text className="text-3xl font-bold text-text">Reset password</Text>
        <Text className="mt-2 text-base text-text opacity-60">
          Enter the code we emailed you along with your new password.
        </Text>

        <View className="mt-8 gap-4">
          <View>
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

          <View>
            <Text className="mb-2 text-sm font-semibold text-text opacity-70">
              Reset code
            </Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="number-pad"
              placeholder="6-digit code"
              placeholderTextColor={colors.placeholder}
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              className="rounded-2xl border border-border bg-secondary/40 px-4 py-4 text-base tracking-[8px] text-text"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-text opacity-70">
              New password
            </Text>
            <View className="flex-row items-center rounded-2xl border border-border bg-secondary/40 px-4">
              <TextInput
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                className="flex-1 py-4 text-base text-text"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.placeholder}
                />
              </Pressable>
            </View>
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-text opacity-70">
              Confirm new password
            </Text>
            <TextInput
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              placeholder="Re-enter password"
              placeholderTextColor={colors.placeholder}
              value={confirm}
              onChangeText={setConfirm}
              className="rounded-2xl border border-border bg-secondary/40 px-4 py-4 text-base text-text"
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className={`mt-6 items-center rounded-2xl bg-text py-4 ${loading ? "opacity-70" : "active:opacity-90"}`}
        >
          <Text className="text-base font-bold text-invert">
            {loading ? "Resetting..." : "Reset password"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
