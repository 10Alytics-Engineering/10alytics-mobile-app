import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Switch from "@/components/Switch";
import useThemeColors from "@/contexts/ThemeColors";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notification-preferences";
import type { NotificationPreferences } from "@/lib/api-client";

const ACCENT = "#DA6728";

type ToggleConfig = {
  key: keyof NotificationPreferences;
  icon: string;
  label: string;
  description: string;
};

const TOGGLES: ToggleConfig[] = [
  {
    key: "push_chat",
    icon: "message-circle",
    label: "Chat messages",
    description: "New messages in your conversations",
  },
  {
    key: "push_classroom",
    icon: "book-open",
    label: "Classroom updates",
    description: "Announcements and classroom activity",
  },
  {
    key: "push_assignments",
    icon: "file-text",
    label: "Assignments",
    description: "New assignments, capstones and deadlines",
  },
  {
    key: "email_updates",
    icon: "mail",
    label: "Email updates",
    description: "Product news and account emails",
  },
];

export function NotificationPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { data, isPending, isError, error, refetch } =
    useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const onToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updatePrefs.mutate({ [key]: value });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
        <Text style={{ flex: 1, fontWeight: "700", fontSize: 18, color: colors.text }} numberOfLines={1}>
          Notification Preferences
        </Text>
      </View>

      {isPending ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError || !data ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ textAlign: "center", fontWeight: "700", fontSize: 16, color: colors.text }}>
            Couldn&apos;t load preferences
          </Text>
          <Text style={{ marginTop: 4, textAlign: "center", fontSize: 14, color: colors.text, opacity: 0.6 }}>
            {error instanceof Error ? error.message : "Something went wrong"}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ marginTop: 16, borderRadius: 12, backgroundColor: colors.text, paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={{ fontWeight: "600", color: colors.invert }}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ marginBottom: 8, marginTop: 8, fontSize: 14, color: colors.text, opacity: 0.6 }}>
            Choose what you want to be notified about. Changes save instantly.
          </Text>
          <View style={{ marginTop: 8, overflow: "hidden", borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondary }}>
            {TOGGLES.map((toggle, index) => (
              <View
                key={toggle.key}
                style={index > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : undefined}
              >
                <Switch
                  value={data[toggle.key]}
                  onChange={(value) => onToggle(toggle.key, value)}
                  label={toggle.label}
                  description={toggle.description}
                  icon={toggle.icon}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
