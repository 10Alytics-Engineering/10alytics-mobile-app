import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/ThemeColors";
import { apiClient } from "@/lib/api-client";

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

  const inputStyle = {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  } as const;

  const labelStyle = {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    opacity: 0.7,
  } as const;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <View
        style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8, paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: colors.secondary }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 30, fontWeight: "700", color: colors.text }}>Reset password</Text>
        <Text style={{ marginTop: 8, fontSize: 16, color: colors.text, opacity: 0.6 }}>
          Enter the code we emailed you along with your new password.
        </Text>

        <View style={{ marginTop: 32, gap: 16 }}>
          <View>
            <Text style={labelStyle}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              style={inputStyle}
            />
          </View>

          <View>
            <Text style={labelStyle}>Reset code</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="number-pad"
              placeholder="6-digit code"
              placeholderTextColor={colors.placeholder}
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              style={[inputStyle, { letterSpacing: 8 }]}
            />
          </View>

          <View>
            <Text style={labelStyle}>New password</Text>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, paddingHorizontal: 16 }}>
              <TextInput
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                style={{ flex: 1, paddingVertical: 16, fontSize: 16, color: colors.text }}
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
            <Text style={labelStyle}>Confirm new password</Text>
            <TextInput
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              placeholder="Re-enter password"
              placeholderTextColor={colors.placeholder}
              value={confirm}
              onChangeText={setConfirm}
              style={inputStyle}
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{ marginTop: 24, alignItems: "center", borderRadius: 16, backgroundColor: colors.text, paddingVertical: 16, opacity: loading ? 0.7 : 1 }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.invert }}>
            {loading ? "Resetting..." : "Reset password"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
