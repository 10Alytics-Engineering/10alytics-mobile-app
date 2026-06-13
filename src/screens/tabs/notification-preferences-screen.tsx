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
    <View className="flex-1 bg-background">
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
        <Text className="flex-1 font-outfit-bold text-lg text-text" numberOfLines={1}>
          Notification Preferences
        </Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : isError || !data ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-outfit-bold text-base text-text">
            Couldn&apos;t load preferences
          </Text>
          <Text className="mt-1 text-center text-sm text-text opacity-60">
            {error instanceof Error ? error.message : "Something went wrong"}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-xl bg-text px-4 py-2 active:opacity-80"
          >
            <Text className="font-semibold text-invert">Try again</Text>
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
          <Text className="mb-2 mt-2 text-sm text-text opacity-60">
            Choose what you want to be notified about. Changes save instantly.
          </Text>
          <View className="mt-2 overflow-hidden rounded-2xl border border-border/60 bg-secondary/40">
            {TOGGLES.map((toggle, index) => (
              <View
                key={toggle.key}
                className={index > 0 ? "border-t border-border/40" : ""}
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
