import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useThemeColors from "@/contexts/ThemeColors";
import { apiClient } from "@/lib/api-client";
import { Pressable, ScrollView, Text, TextInput, View } from "@/tw";
import { useAuthStore } from "@/utils/auth-store";

const ACCENT = "#DA6728";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof apiClient.getCurrentUser>>["data"]>;
type ThemeColors = ReturnType<typeof useThemeColors>;

function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderColor,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  placeholderColor: string;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-text opacity-70">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        keyboardType={keyboardType ?? "default"}
        className="rounded-2xl border border-border bg-secondary/40 px-4 py-4 text-base text-text"
      />
    </View>
  );
}

export function EditProfileScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const { data: user, isPending } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const result = await apiClient.getCurrentUser();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
  });

  const formKey = [
    user?.id ?? "anonymous",
    user?.first_name ?? "",
    user?.other_names ?? "",
    user?.phone ?? "",
    user?.saturday_schedule ?? "",
  ].join(":");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View
        className="flex-row items-center border-b border-border/40 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-secondary/80"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text className="flex-1 font-outfit-bold text-lg text-text">
          Edit Profile
        </Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : (
        <EditProfileForm key={formKey} user={user ?? null} colors={colors} />
      )}
    </KeyboardAvoidingView>
  );
}

function EditProfileForm({
  user,
  colors,
}: {
  user: CurrentUser | null;
  colors: ThemeColors;
}) {
  const { setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(() => user?.first_name ?? "");
  const [otherNames, setOtherNames] = useState(() => user?.other_names ?? "");
  const [phone, setPhone] = useState(() => user?.phone ?? "");
  const [classTime, setClassTime] = useState(() => user?.saturday_schedule ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !otherNames.trim() || !phone.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSaving(true);
    const { error } = await apiClient.updateProfile({
      first_name: firstName.trim(),
      other_names: otherNames.trim(),
      phone: phone.trim(),
      saturday_schedule: classTime.trim() || null,
    });
    setSaving(false);

    if (error) {
      const message =
        error.errors && Object.keys(error.errors).length > 0
          ? Object.values(error.errors)[0][0]
          : error.message || "Couldn't update profile";
      Alert.alert("Error", message);
      return;
    }

    // Reflect the change locally without waiting for a refetch.
    if (user) {
      setUser({
        id: String(user.id),
        first_name: firstName.trim(),
        other_names: otherNames.trim(),
        email: user.email,
        avatar: user.avatar ?? undefined,
      });
    }

    Alert.alert("Saved", "Your profile has been updated.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView
      contentContainerClassName="px-5 pt-6"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ProfileField
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
        placeholderColor={colors.placeholder}
      />
      <ProfileField
        label="Other names"
        value={otherNames}
        onChangeText={setOtherNames}
        placeholder="Other names"
        placeholderColor={colors.placeholder}
      />
      <ProfileField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone number"
        keyboardType="phone-pad"
        placeholderColor={colors.placeholder}
      />
      <ProfileField
        label="Class Time"
        value={classTime}
        onChangeText={setClassTime}
        placeholder="e.g. Saturdays 10am – 12pm"
        placeholderColor={colors.placeholder}
      />

      <View className="mb-4">
        <Text className="mb-2 text-sm font-semibold text-text opacity-70">
          Email
        </Text>
        <View className="rounded-2xl border border-border bg-secondary/20 px-4 py-4">
          <Text className="text-base text-text opacity-60">
            {user?.email ?? "—"}
          </Text>
        </View>
        <Text className="mt-1 text-xs text-text opacity-50">
          Email can&apos;t be changed here.
        </Text>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        className={`mt-2 items-center rounded-2xl bg-text py-4 ${saving ? "opacity-70" : "active:opacity-90"}`}
      >
        <Text className="text-base font-bold text-invert">
          {saving ? "Saving..." : "Save changes"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
