import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform } from "react-native";
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

  return (
    <View className="min-h-16 flex-row items-center rounded-[20px] border border-border bg-secondary px-[18px]">
      <AntDesign color={colors.icon} name={icon} size={20} />
      <TextInput
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType ?? "default"}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        secureTextEntry={secureTextEntry}
        className="min-h-16 flex-1 px-3 text-[17px] text-text"
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
      className="flex-1 bg-background"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="flex-grow justify-center px-6"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 20, 40),
          paddingBottom: Math.max(insets.bottom + 28, 40),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full self-center" style={{ maxWidth: 440 }}>
          <View className="items-center gap-7">
            <Image
              source={require("@/assets/images/splash-icon-light.png")}
              className="h-24 w-32"
              contentFit="contain"
            />

            <View className="items-center gap-2.5">
              <Text className="text-center text-[32px] font-bold leading-[38px] text-text">
                Create your 10Alytics account
              </Text>
              <Text
                className="text-center text-[15px] leading-[22px]"
                style={{ color: muted }}
              >
                Join your classroom, track progress, and keep your learning in
                one place.
              </Text>
            </View>
          </View>

          <View className="mt-9 gap-3.5">
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
                  className="h-9 w-9 items-center justify-center"
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
              className="mt-2 min-h-16 w-full items-center justify-center rounded-[20px]"
              disabled={loading}
              onPress={handleSignUp}
              style={{
                backgroundColor: primaryFill,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: primaryText }}
              >
                {loading ? "Creating account..." : "Create account"}
              </Text>
            </Pressable>

            <Text className="mt-2 text-center text-lg" style={{ color: muted }}>
              or
            </Text>

            <Pressable
              accessibilityRole="button"
              className="min-h-16 w-full flex-row items-center justify-center gap-3.5 rounded-[20px] border border-border bg-secondary px-5"
              disabled={loading}
              onPress={handleGoogleSignUp}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <Image
                source={require("@/assets/images/onboarding/google.png")}
                className="h-[22px] w-[22px]"
              />
              <Text className="text-[17px] font-bold text-text">
                Continue with Google
              </Text>
            </Pressable>
          </View>

          <View className="mt-7 flex-row flex-wrap items-center justify-center gap-1.5">
            <Text className="text-sm" style={{ color: muted }}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/sign-in")}>
              <Text className="text-sm font-bold text-text">Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
