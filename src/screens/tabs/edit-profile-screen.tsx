import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useAuthStore } from "@/utils/auth-store";

const ACCENT = "#DA6728";

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
  const colors = useThemeColors();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "600", color: colors.text, opacity: 0.7 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        keyboardType={keyboardType ?? "default"}
        style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: colors.text }}
      />
    </View>
  );
}

export function EditProfileScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { setUser } = useAuthStore();

  const { data: user, isPending } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const result = await apiClient.getCurrentUser();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? null;
    },
  });

  const [firstName, setFirstName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [phone, setPhone] = useState("");
  const [classTime, setClassTime] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? "");
      setOtherNames(user.other_names ?? "");
      setPhone(user.phone ?? "");
      setClassTime(user.saturday_schedule ?? "");
    }
  }, [user]);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingBottom: 12, paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ marginRight: 8, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: colors.secondary }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={ACCENT} />
        </Pressable>
        <Text style={{ flex: 1, fontWeight: "700", fontSize: 18, color: colors.text }}>
          Edit Profile
        </Text>
      </View>

      {isPending ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24 }}
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

          <View style={{ marginBottom: 16 }}>
            <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "600", color: colors.text, opacity: 0.7 }}>
              Email
            </Text>
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 16 }}>
              <Text style={{ fontSize: 16, color: colors.text, opacity: 0.6 }}>
                {user?.email ?? "—"}
              </Text>
            </View>
            <Text style={{ marginTop: 4, fontSize: 12, color: colors.text, opacity: 0.5 }}>
              Email can&apos;t be changed here.
            </Text>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={{ marginTop: 8, alignItems: "center", borderRadius: 16, backgroundColor: colors.text, paddingVertical: 16, opacity: saving ? 0.7 : 1 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.invert }}>
              {saving ? "Saving..." : "Save changes"}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
