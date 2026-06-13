import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { router } from "expo-router";
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

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/utils/auth-store";

function splitFullName(value: string): {
  firstName: string;
  otherNames: string;
} {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    otherNames: parts.slice(1).join(" "),
  };
}

function getValidationMessage({
  fullName,
  email,
  phone,
  password,
}: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): string | null {
  const { firstName, otherNames } = splitFullName(fullName);

  if (!firstName || !otherNames) {
    return "Please enter your first and last name.";
  }

  if (!email.trim()) {
    return "Please enter your email address.";
  }

  if (!phone.trim()) {
    return "Please enter your phone number.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}

function AuthInput({
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoComplete,
  autoCapitalize = "none",
  trailing,
}: {
  icon: React.ComponentProps<typeof AntDesign>["name"];
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  autoComplete?: "email" | "password-new" | "tel";
  autoCapitalize?: "none" | "words";
  trailing?: React.ReactNode;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = (colorScheme ?? "light") === "dark";
  const secondary = isDark ? "#262626" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
  const textColor = isDark ? "#ffffff" : "#000000";

  return (
    <View style={{ minHeight: 64, flexDirection: "row", alignItems: "center", borderRadius: 20, borderWidth: 1, borderColor: border, backgroundColor: secondary, paddingHorizontal: 18 }}>
      <AntDesign color={colors.icon} name={icon} size={20} />
      <TextInput
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType ?? "default"}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        secureTextEntry={secureTextEntry}
        style={{ minHeight: 64, flex: 1, paddingHorizontal: 12, fontSize: 17, color: textColor }}
        value={value}
      />
      {trailing}
    </View>
  );
}

export function CreateAccountScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = (colorScheme ?? "light") === "dark";
  const insets = useSafeAreaInsets();
  const { logIn } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const muted = isDark ? "#A1A1AA" : "#6B7280";
  const primaryFill = isDark ? "#FFFFFF" : "#0A0A0A";
  const primaryText = isDark ? "#0A0A0A" : "#FFFFFF";
  const bg = isDark ? "#0A0A0A" : "#F4F4F5";
  const textColor = isDark ? "#ffffff" : "#000000";
  const secondary = isDark ? "#262626" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";

  const handleSignUp = async () => {
    const validationMessage = getValidationMessage({
      fullName,
      email,
      phone,
      password,
    });

    if (validationMessage) {
      Alert.alert("Create Account", validationMessage);
      return;
    }

    const { firstName, otherNames } = splitFullName(fullName);
    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      const { error: registerError } = await apiClient.register({
        first_name: firstName,
        other_names: otherNames,
        email: normalizedEmail,
        password,
        phone: phone.trim(),
      });

      if (registerError) {
        const errorMessage =
          registerError.errors && Object.keys(registerError.errors).length > 0
            ? Object.values(registerError.errors)[0][0]
            : registerError.message || "Sign up failed. Please try again.";
        Alert.alert("Sign Up Failed", errorMessage);
        return;
      }

      const { data: loginData, error: loginError } = await apiClient.login(
        normalizedEmail,
        password,
      );

      if (loginError || !loginData?.user) {
        Alert.alert(
          "Account Created",
          "Your account was created, but automatic sign in failed. Please sign in with your new credentials.",
          [{ text: "OK", onPress: () => router.replace("/sign-in") }],
        );
        return;
      }

      logIn(loginData.user);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.googleAuth();

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
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
      style={{ flex: 1, backgroundColor: bg }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: Math.max(insets.top + 20, 40),
          paddingBottom: Math.max(insets.bottom + 28, 40),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", alignSelf: "center", maxWidth: 440 }}>
          <View style={{ alignItems: "center", gap: 28 }}>
            <Image
              source={require("@/assets/images/splash-icon-light.png")}
              style={{ height: 96, width: 128 }}
              contentFit="contain"
            />

            <View style={{ alignItems: "center", gap: 10 }}>
              <Text style={{ textAlign: "center", fontSize: 32, fontWeight: "700", lineHeight: 38, color: textColor }}>
                Create your 10Alytics account
              </Text>
              <Text
                style={{ textAlign: "center", fontSize: 15, lineHeight: 22, color: muted }}
              >
                Join your classroom, track progress, and keep your learning in
                one place.
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 36, gap: 14 }}>
            <AuthInput
              autoCapitalize="words"
              icon="user"
              onChangeText={setFullName}
              placeholder="First and last name"
              value={fullName}
            />
            <AuthInput
              autoComplete="email"
              icon="mail"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email address"
              value={email}
            />
            <AuthInput
              autoComplete="tel"
              icon="phone"
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder="Phone number"
              value={phone}
            />
            <AuthInput
              autoComplete="password-new"
              icon="lock"
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              trailing={
                <Pressable
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  accessibilityRole="button"
                  style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center" }}
                  hitSlop={8}
                  onPress={() => setShowPassword((value) => !value)}
                >
                  <AntDesign
                    color={colors.icon}
                    name={showPassword ? "eye-invisible" : "eye"}
                    size={20}
                  />
                </Pressable>
              }
              value={password}
            />

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={handleSignUp}
              style={{
                marginTop: 8,
                minHeight: 64,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                backgroundColor: primaryFill,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: primaryText }}
              >
                {loading ? "Creating account..." : "Create account"}
              </Text>
            </Pressable>

            <Text style={{ marginTop: 8, textAlign: "center", fontSize: 18, color: muted }}>
              or
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={handleGoogleSignUp}
              style={{ minHeight: 64, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, borderRadius: 20, borderWidth: 1, borderColor: border, backgroundColor: secondary, paddingHorizontal: 20, opacity: loading ? 0.7 : 1 }}
            >
              <Image
                source={require("@/assets/images/onboarding/google.png")}
                style={{ height: 22, width: 22 }}
              />
              <Text style={{ fontSize: 17, fontWeight: "700", color: textColor }}>
                Continue with Google
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 28, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Text style={{ fontSize: 14, color: muted }}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/sign-in")}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
