import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
        <Text style={{ fontSize: 30, fontWeight: "700", color: colors.text }}>Forgot password?</Text>
        <Text style={{ marginTop: 8, fontSize: 16, color: colors.text, opacity: 0.6 }}>
          Enter the email linked to your account and we&apos;ll send you a
          one-time code to reset your password.
        </Text>

        <View style={{ marginTop: 32 }}>
          <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "600", color: colors.text, opacity: 0.7 }}>
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
            style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: colors.text }}
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{ marginTop: 24, alignItems: "center", borderRadius: 16, backgroundColor: colors.text, paddingVertical: 16, opacity: loading ? 0.7 : 1 }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.invert }}>
            {loading ? "Sending..." : "Send reset code"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/reset-password")}
          style={{ marginTop: 16, alignItems: "center", paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, opacity: 0.7 }}>
            I already have a code
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
